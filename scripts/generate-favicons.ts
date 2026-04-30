import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = path.join(process.cwd(), 'public', 'favicon-source.png');
const publicDir = path.join(process.cwd(), 'public');

async function generate() {
  if (!fs.existsSync(source)) {
    console.error('❌ No se encontró favicon-source.png en /public');
    return;
  }

  console.log('--- GENERANDO FAVICONS ---');

  // 1. ICO (Usually a 32x32 fallback or multi-res, but sharp doesn't do ICO natively easily)
  // We'll generate a 32x32 PNG as favicon.ico for now as modern browsers support it
  await sharp(source)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ favicon.ico (32x32)');

  // 2. Standard PNGs
  const sizes = [16, 32, 64, 192, 512];
  for (const size of sizes) {
    await sharp(source)
      .resize(size, size)
      .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    console.log(`✅ favicon-${size}x${size}.png`);
  }

  // 3. Apple Touch Icon (180x180)
  await sharp(source)
    .resize(180, 180)
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png');

  // 4. Android Chrome icons
  await sharp(source)
    .resize(192, 192)
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  await sharp(source)
    .resize(512, 512)
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
  console.log('✅ android-chrome icons');

  console.log('--- FAVICONS GENERADOS CON ÉXITO ---');
}

generate().catch(console.error);
