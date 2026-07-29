import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sourceDirectory = resolve(dirname(require.resolve('lucide-static/package.json')), 'icons');
const assetCatalogDirectory = resolve(
  scriptDirectory,
  '../Sources/KiskadeeIOS/Resources/Icons.xcassets'
);
const checkOnly = process.argv.includes('--check');
const iconNames = ['check', 'minus'];

function validateLucideSource(source, sourcePath) {
  const requiredAttributes = [
    'viewBox="0 0 24 24"',
    'fill="none"',
    'stroke="currentColor"',
    'stroke-width="2"',
    'stroke-linecap="round"',
    'stroke-linejoin="round"'
  ];

  for (const attribute of requiredAttributes) {
    if (!source.includes(attribute)) {
      throw new Error(`${sourcePath} is not canonical Lucide geometry: missing ${attribute}`);
    }
  }

  const paths = [...source.matchAll(/<path\s+d="([^"]+)"\s*\/>/g)];
  if (paths.length !== 1) {
    throw new Error(`${sourcePath} must contain exactly one Lucide path`);
  }
}

async function synchronizeIcon(name) {
  const sourcePath = resolve(sourceDirectory, `${name}.svg`);
  const destinationPath = resolve(
    assetCatalogDirectory,
    `lucide-${name}.imageset/lucide-${name}.svg`
  );
  const source = await readFile(sourcePath, 'utf8').catch((error) => {
    throw new Error(`Missing canonical Lucide source ${sourcePath}`, { cause: error });
  });

  validateLucideSource(source, sourcePath);

  if (checkOnly) {
    const destination = await readFile(destinationPath, 'utf8').catch((error) => {
      throw new Error(`Missing generated iOS resource ${destinationPath}`, { cause: error });
    });

    if (destination !== source) {
      throw new Error(
        `${destinationPath} is stale; run node packages/components/ios/scripts/sync-lucide-switch-icons.mjs`
      );
    }
    return;
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, source);
}

await Promise.all(iconNames.map(synchronizeIcon));
console.log(
  checkOnly
    ? 'iOS Lucide Switch resources are synchronized.'
    : 'Synchronized iOS Lucide Switch resources.'
);
