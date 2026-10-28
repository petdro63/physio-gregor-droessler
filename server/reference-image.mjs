import path from 'node:path';
import sharp from 'sharp';

// The source files are narrow, two-frame WebP atlases. Decode each pose only once,
// upscale it for high-density screens and cache the result; never expose a new
// public/static media path that bypasses exercise permissions.
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
        .resize({ width: frameWidth * 4, kernel: 'lanczos3' })
        // Moderate edge sharpening only. No generative replacement of faces,
        // clothing or joint geometry; the original illustrated pixels remain the source.
        .sharpen({ sigma: 1 })
        // Avoid introducing new WebP compression artefacts after enhancement.
        .webp({ lossless: true, effort: 5 })
        .toBuffer();
    })();
    cachedFrames.set(key, work);
    work.catch(() => cachedFrames.delete(key));
  }
  return cachedFrames.get(key);
}
