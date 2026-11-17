import { describe, expect, it } from 'vitest';
import { sanitizeUploadedImage } from '../server';

describe('@webzy/core server image sanitizer', () => {
  it('rejects SVG XSS payloads disguised as images', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(() => sanitizeUploadedImage(svg)).toThrow(/JPEG, PNG, or WebP/);
  });

  it('strips EXIF APP1 segments from valid JPEG images and reads dimensions', () => {
    // Minimal synthetic JPEG: SOI + APP1 (EXIF GPS fake) + SOF0 (640x480) + SOS + EOI
    const soi = Buffer.from([0xff, 0xd8]);
    const app1 = Buffer.from([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // 10 bytes (len=8)
    const sof0 = Buffer.from([
      0xff, 0xc0, 0x00, 0x0b, 0x08, 0x01, 0xe0, 0x02, 0x80, 0x01, 0x01, 0x11, 0x00,
    ]); // height=480 (0x01e0), width=640 (0x0280)
    const sosAndEoi = Buffer.from([0xff, 0xda, 0x00, 0x02, 0xff, 0xd9]);
    const raw = Buffer.concat([soi, app1, sof0, sosAndEoi]);

    const clean = sanitizeUploadedImage(raw);
    expect(clean.mimeType).toBe('image/jpeg');
    expect(clean.width).toBe(640);
    expect(clean.height).toBe(480);
    expect(clean.exifStripped).toBe(true);
    expect(clean.buffer.includes(Buffer.from('Exif'))).toBe(false);
  });

  it('strips tEXt/eXIf chunks from valid PNG images', () => {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // IHDR: len=13, 320x240
    const ihdrPayload = Buffer.alloc(13);
    ihdrPayload.writeUInt32BE(320, 0);
    ihdrPayload.writeUInt32BE(240, 4);
    const ihdr = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x0d]),
      Buffer.from('IHDR', 'ascii'),
      ihdrPayload,
      Buffer.alloc(4),
    ]);
    const textPayload = Buffer.from('GPS=26.9124,75.7873', 'ascii');
    const textChunkLen = Buffer.alloc(4);
    textChunkLen.writeUInt32BE(textPayload.length, 0);
    const textChunk = Buffer.concat([
      textChunkLen,
      Buffer.from('tEXt', 'ascii'),
      textPayload,
      Buffer.alloc(4),
    ]);
    const iend = Buffer.concat([Buffer.alloc(4), Buffer.from('IEND', 'ascii'), Buffer.alloc(4)]);

    const clean = sanitizeUploadedImage(Buffer.concat([sig, ihdr, textChunk, iend]));
    expect(clean.mimeType).toBe('image/png');
    expect(clean.width).toBe(320);
    expect(clean.height).toBe(240);
    expect(clean.buffer.includes(Buffer.from('GPS='))).toBe(false);
  });
});
