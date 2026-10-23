import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { GoogleIcon } from '@kiskadee/icons/social/GoogleIcon';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Reuse the image processor shipped by the Showcase's Next.js dependency.
const requireFromNext = createRequire(import.meta.resolve('next/package.json'));
const sharp = requireFromNext('sharp');
const directory = new URL('../public/fixtures/button/icon-formats/', import.meta.url);
await mkdir(directory, { recursive: true });
const svg = Buffer.from(
  renderToStaticMarkup(createElement(GoogleIcon, { width: 128, height: 128 }))
);
await Promise.all([
  sharp(svg)
    .png()
    .toFile(fileURLToPath(new URL('google.png', directory))),
  sharp(svg)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 95 })
    .toFile(fileURLToPath(new URL('google.jpeg', directory))),
  sharp(svg)
    .webp({ lossless: true })
    .toFile(fileURLToPath(new URL('google.webp', directory)))
]);
