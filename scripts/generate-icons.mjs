#!/usr/bin/env node
// Rasterizes public/icon.svg into the PNG sizes the web manifest and iOS
// home screen need. Run with `npm run icons` after changing the SVG.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'public', 'icon.svg'));

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of targets) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(join(root, 'public', file));
  console.log(`public/${file} (${size}×${size})`);
}
