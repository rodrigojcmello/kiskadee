import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sourceDirectory = resolve(dirname(require.resolve('lucide-static/package.json')), 'icons');
const resourceDirectory = resolve(scriptDirectory, '../kiskadee-android/src/main/res/drawable');
const checkOnly = process.argv.includes('--check');
const iconNames = ['check', 'minus'];

function readLucideGeometry(source, sourcePath) {
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

  const license = source.match(/<!--\s*(@license .*? - ISC)\s*-->/)?.[1];
  if (!license) {
    throw new Error(`${sourcePath} is missing its Lucide license provenance`);
  }

  return {
    license,
    pathData: paths[0][1]
  };
}

function escapeXmlAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderVectorDrawable({ license, pathData }) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- ${license}; generated directly from lucide-static. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:pathData="${escapeXmlAttribute(pathData)}"
        android:fillColor="@android:color/transparent"
        android:strokeColor="#FF000000"
        android:strokeWidth="2"
        android:strokeLineCap="round"
        android:strokeLineJoin="round" />
</vector>
`;
}

async function synchronizeIcon(name) {
  const sourcePath = resolve(sourceDirectory, `${name}.svg`);
  const destinationPath = resolve(resourceDirectory, `kiskadee_lucide_${name}.xml`);
  const source = await readFile(sourcePath, 'utf8').catch((error) => {
    throw new Error(`Missing canonical Lucide source ${sourcePath}`, { cause: error });
  });
  const expected = renderVectorDrawable(readLucideGeometry(source, sourcePath));

  if (checkOnly) {
    const destination = await readFile(destinationPath, 'utf8').catch((error) => {
      throw new Error(`Missing generated Android resource ${destinationPath}`, { cause: error });
    });

    if (destination !== expected) {
      throw new Error(
        `${destinationPath} is stale; run node packages/components/android/scripts/sync-lucide-switch-icons.mjs`
      );
    }
    return;
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, expected);
}

await Promise.all(iconNames.map(synchronizeIcon));
console.log(
  checkOnly
    ? 'Android Lucide Switch resources are synchronized.'
    : 'Synchronized Android Lucide Switch resources.'
);
