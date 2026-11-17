import crypto from 'node:crypto';
import { WebzyError } from './logger';

/**
 * Pure-TypeScript Server Image Validator & Metadata Stripper (Section 19):
 * - Verifies magic bytes (JPEG, PNG, WebP only — rejects SVG, HTML, EXE, APK, PDF).
 * - Checks pixel dimensions <= 4096x4096 (anti decompression-bomb).
 * - Strips EXIF/GPS/XMP/IPTC/comment metadata chunks from JPEG, PNG, and WebP buffers
 *   with zero native binary dependencies.
 */

export type AllowedImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

export interface SanitizedImageResult {
  mimeType: AllowedImageMime;
  extension: 'jpg' | 'png' | 'webp';
  buffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
  checksumSha256: string;
  exifStripped: true;
}

const MAX_DIMENSION = 4096;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB compressed ceiling

function hasMarkupPrefix(buf: Buffer): boolean {
  const head = buf.subarray(0, 512).toString('utf8').trimStart().toLowerCase();
  return (
    head.startsWith('<svg') ||
    head.startsWith('<?xml') ||
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.startsWith('<script')
  );
}

export function detectImageMime(buf: Buffer): AllowedImageMime | null {
  if (buf.length < 12 || hasMarkupPrefix(buf)) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF .... WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

function stripJpegAndReadDimensions(buf: Buffer): { buffer: Buffer; width: number; height: number } {
  const chunks: Buffer[] = [buf.subarray(0, 2)]; // SOI FF D8
  let offset = 2;
  let width = 0;
  let height = 0;

  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      throw new WebzyError('Invalid or corrupted JPEG image.', {
        code: 'IMAGE_CORRUPT_JPEG',
        statusCode: 400,
      });
    }
    while (offset < buf.length && buf[offset] === 0xff) {
      offset++;
    }
    if (offset >= buf.length) break;

    const marker = buf[offset];
    offset++;

    // Start of Scan (FF DA) -> copy remainder as entropy image stream until EOI
    if (marker === 0xda) {
      chunks.push(Buffer.from([0xff, 0xda]));
      chunks.push(buf.subarray(offset));
      break;
    }

    // Standalone markers (TEM, RST0-RST7, EOI)
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      chunks.push(Buffer.from([0xff, marker]));
      if (marker === 0xd9) break;
      continue;
    }

    if (offset + 2 > buf.length) break;
    const segmentLen = buf.readUInt16BE(offset);
    if (segmentLen < 2 || offset + segmentLen > buf.length) {
      throw new WebzyError('Invalid JPEG segment length.', {
        code: 'IMAGE_CORRUPT_JPEG',
        statusCode: 400,
      });
    }

    // Read SOF0..SOF3 dimensions
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb)
    ) {
      if (segmentLen >= 7) {
        height = buf.readUInt16BE(offset + 3);
        width = buf.readUInt16BE(offset + 5);
      }
    }

    // Strip APP1..APP15 (EXIF/GPS/XMP/IPTC/ICC except keep APP0 JFIF only if harmless) and COM (0xFE)
    const isMetadataMarker =
      (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;

    if (!isMetadataMarker) {
      chunks.push(Buffer.from([0xff, marker]));
      chunks.push(buf.subarray(offset, offset + segmentLen));
    }

    offset += segmentLen;
  }

  return {
    buffer: Buffer.concat(chunks),
    width,
    height,
  };
}

function stripPngAndReadDimensions(buf: Buffer): { buffer: Buffer; width: number; height: number } {
  const sig = buf.subarray(0, 8);
  const chunks: Buffer[] = [sig];
  let offset = 8;
  let width = 0;
  let height = 0;

  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const totalChunkLen = 12 + len;
    if (offset + totalChunkLen > buf.length) {
      throw new WebzyError('Invalid or truncated PNG image.', {
        code: 'IMAGE_CORRUPT_PNG',
        statusCode: 400,
      });
    }

    if (type === 'IHDR' && len >= 8) {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
    }

    // Strip EXIF & text metadata chunks
    const isMetadataChunk =
      type === 'eXIf' || type === 'tEXt' || type === 'zTXt' || type === 'iTXt';

    if (!isMetadataChunk) {
      chunks.push(buf.subarray(offset, offset + totalChunkLen));
    }

    offset += totalChunkLen;
    if (type === 'IEND') break;
  }

  return { buffer: Buffer.concat(chunks), width, height };
}

function stripWebpAndReadDimensions(buf: Buffer): { buffer: Buffer; width: number; height: number } {
  const outChunks: Buffer[] = [];
  let offset = 12; // Skip RIFF + fileSize + WEBP
  let width = 0;
  let height = 0;

  while (offset + 8 <= buf.length) {
    const fourCC = buf.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buf.readUInt32LE(offset + 4);
    const paddedSize = chunkSize + (chunkSize % 2);
    if (offset + 8 + chunkSize > buf.length) {
      throw new WebzyError('Invalid or truncated WebP image.', {
        code: 'IMAGE_CORRUPT_WEBP',
        statusCode: 400,
      });
    }

    const payload = buf.subarray(offset + 8, offset + 8 + chunkSize);

    if (fourCC === 'VP8X' && chunkSize >= 10) {
      width = 1 + (payload[4] | (payload[5] << 8) | (payload[6] << 16));
      height = 1 + (payload[7] | (payload[8] << 8) | (payload[9] << 16));
      // Clear EXIF (bit 3 = 0x08) and XMP (bit 2 = 0x04) flags in VP8X
      const cleanChunk = Buffer.from(buf.subarray(offset, offset + 8 + paddedSize));
      cleanChunk[8] = cleanChunk[8] & ~0x0c;
      outChunks.push(cleanChunk);
    } else if (fourCC === 'VP8 ' && chunkSize >= 10) {
      if (width === 0) {
        width = payload.readUInt16LE(6) & 0x3fff;
        height = payload.readUInt16LE(8) & 0x3fff;
      }
      outChunks.push(buf.subarray(offset, offset + 8 + paddedSize));
    } else if (fourCC === 'VP8L' && chunkSize >= 5) {
      if (width === 0) {
        const b1 = payload[1];
        const b2 = payload[2];
        const b3 = payload[3];
        const b4 = payload[4];
        width = 1 + (((b2 & 0x3f) << 8) | b1);
        height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
      }
      outChunks.push(buf.subarray(offset, offset + 8 + paddedSize));
    } else if (fourCC !== 'EXIF' && fourCC !== 'XMP ') {
      outChunks.push(buf.subarray(offset, offset + 8 + paddedSize));
    }

    offset += 8 + paddedSize;
  }

  const body = Buffer.concat(outChunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(4 + body.length, 4);
  header.write('WEBP', 8, 'ascii');

  return { buffer: Buffer.concat([header, body]), width, height };
}

export function sanitizeUploadedImage(
  rawBuffer: Buffer,
  options: { maxBytes?: number } = {},
): SanitizedImageResult {
  const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES;
  if (rawBuffer.length === 0) {
    throw new WebzyError('Uploaded image file is empty.', {
      code: 'IMAGE_EMPTY',
      statusCode: 400,
    });
  }
  if (rawBuffer.length > maxBytes) {
    throw new WebzyError('Compressed photo must be 2 MB or smaller.', {
      code: 'IMAGE_TOO_LARGE',
      statusCode: 413,
      retryable: true,
    });
  }

  const mimeType = detectImageMime(rawBuffer);
  if (!mimeType) {
    throw new WebzyError('Only valid JPEG, PNG, or WebP photos are allowed.', {
      code: 'IMAGE_UNSUPPORTED_TYPE',
      statusCode: 415,
      retryable: false,
    });
  }

  const processed =
    mimeType === 'image/jpeg'
      ? stripJpegAndReadDimensions(rawBuffer)
      : mimeType === 'image/png'
        ? stripPngAndReadDimensions(rawBuffer)
        : stripWebpAndReadDimensions(rawBuffer);

  if (
    processed.width <= 0 ||
    processed.height <= 0 ||
    processed.width > MAX_DIMENSION ||
    processed.height > MAX_DIMENSION
  ) {
    throw new WebzyError('Photo dimensions must be between 1px and 4096px.', {
      code: 'IMAGE_INVALID_DIMENSIONS',
      statusCode: 400,
    });
  }

  const checksumSha256 = crypto.createHash('sha256').update(processed.buffer).digest('hex');

  return {
    mimeType,
    extension: mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp',
    buffer: processed.buffer,
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.buffer.length,
    checksumSha256,
    exifStripped: true,
  };
}
