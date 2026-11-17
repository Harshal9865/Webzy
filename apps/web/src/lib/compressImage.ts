'use client';

/**
 * Low-RAM Android-safe client image pre-compressor:
 * Runs one photo at a time, scales longest edge <= 1280px, exports WebP (or JPEG fallback),
 * and closes ImageBitmap immediately to prevent OOM crashes on 2-3 GB RAM phones.
 */
export async function compressImageForMobileUpload(file: File): Promise<File> {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Photo must be smaller than 15 MB before compression.');
  }

  const supportedQuickCheck =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp' ||
    file.type === '';

  if (!supportedQuickCheck && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    throw new Error('Please choose a JPEG, PNG, or WebP photo.');
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to initialize canvas compressor.');
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.82);
    });

    const finalBlob =
      blob && blob.type === 'image/webp'
        ? blob
        : await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.84);
          });

    if (!finalBlob) {
      throw new Error('Compression failed for this photo.');
    }

    const ext = finalBlob.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([finalBlob], `photo.${ext}`, { type: finalBlob.type });
  } finally {
    if (bitmap) {
      bitmap.close();
    }
  }
}
