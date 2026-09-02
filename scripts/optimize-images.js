// Redimensionne en place les images de public/images/{articles,authors} qui
// dépassent une taille raisonnable pour un usage web (photos smartphone
// uploadées telles quelles, parfois > 7000px de large : cf. PageSpeed
// Insights, ~900 Kio d'images surdimensionnées sur la seule accueil).
// Le nom et l'extension sont préservés pour ne pas casser les références
// featuredImage/photo dans le frontmatter des contenus.
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const MAX_DIM = 1600; // large assez pour une image héro d'article en 2x
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 78;

const DIRS = ['src/assets/articles', 'public/images/authors'];

async function optimize(path) {
  const before = statSync(path).size;
  const inputBuffer = readFileSync(path);
  const image = sharp(inputBuffer);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return;

  const needsResize = meta.width > MAX_DIM || meta.height > MAX_DIM;
  if (!needsResize) return;

  let pipeline = image.resize({
    width: MAX_DIM,
    height: MAX_DIM,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (meta.format === 'webp') {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else if (meta.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (meta.format === 'png') {
    pipeline = pipeline.png({ quality: JPEG_QUALITY });
  } else {
    return; // format non géré (svg, etc.) : on laisse tel quel
  }

  const buffer = await pipeline.toBuffer();
  await writeFile(path, buffer);
  const after = buffer.length;
  console.log(
    `${path}: ${meta.width}x${meta.height} (${(before / 1024).toFixed(0)}KB) -> ` +
    `max ${MAX_DIM}px (${(after / 1024).toFixed(0)}KB)`
  );
}

for (const dir of DIRS) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    continue;
  }
  for (const f of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    await optimize(join(dir, f));
  }
}
