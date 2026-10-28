import path from 'node:path';
import sharp from 'sharp';

// The source files are only 300x286px for two poses. Preserve every decoded
// original pixel: upscaling and sharpening cannot restore missing detail, and
// multiple resize passes make these already soft originals appear even softer.
// Crop each frame without resampling and re-encode it losslessly. Retain the
// same exercise/version authorization in the caller. Cache each exact frame.
const cachedFrames = new Map();
const validAtlases = new Set([
  'reference-shoulder-rotation-standing',
  'reference-shoulder-rotation-seated',
  'reference-shoulder-rotation-u-hold',
]);

export function enhancedShoulderFrame(atlas, frame) {
  if (!validAtlases.has(atlas) || (frame !== 0 && frame !== 1)) {
    throw new Error('Ungültiges Schulterrotationsbild.');
  }
  const key = `${atlas}:${frame}`;
  if (!cachedFrames.has(key)) {
    const work = (async () => {
      const filename = path.resolve('server/assets/reference', `${atlas}.webp`);
      const { width, height } = await sharp(filename).metadata();
      if (!width || !height || width % 2 !== 0) {
        throw new Error('Ungültige Abmessungen des Schulterrotationsatlasses.');
      }
      const frameWidth = width / 2;
      return sharp(filename)
        .extract({ left: frame * frameWidth, top: 0, width: frameWidth, height })
        // No enlargement, redraw, sharpening halos, or lossy recompression.
        // Each frame has the exact original resolution and original pose.
        .webp({ lossless: true, effort: 5 })
        .toBuffer();
    })();
    cachedFrames.set(key, work);
    work.catch(() => cachedFrames.delete(key));
  }
  return cachedFrames.get(key);
}
