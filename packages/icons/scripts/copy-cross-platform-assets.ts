import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IconManifest, IconMetadata } from './generate-react.ts';
import { applyOpticalTransformToSvg } from './icon-optical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export interface CopyCrossPlatformAssetsOptions {
  assetsDir?: string;
  distDir?: string;
  manifestPath?: string;
}

interface PublishedIconMetadata extends Omit<IconMetadata, 'opticalTransform'> {
  appliedOpticalTransform?: IconMetadata['opticalTransform'];
}

interface PublishedIconManifest extends Omit<IconManifest, 'icons'> {
  assetState: 'optically-calibrated';
  icons: PublishedIconMetadata[];
}

function createPublishedManifest(manifest: IconManifest): PublishedIconManifest {
  return {
    ...manifest,
    assetState: 'optically-calibrated',
    icons: manifest.icons.map(({ opticalTransform, ...icon }) => ({
      ...icon,
      ...(opticalTransform ? { appliedOpticalTransform: opticalTransform } : {})
    }))
  };
}

/**
 * What
 *     Publishes optically calibrated SVGs and their manifest alongside generated adapters.
 * Why
 *     Every platform must render the same approved visual weight without runtime compensation.
 */
export async function copyCrossPlatformAssets(
  options: CopyCrossPlatformAssetsOptions = {}
): Promise<void> {
  const assetsDir = options.assetsDir ?? path.resolve(packageRoot, 'assets');
  const distDir = options.distDir ?? path.resolve(packageRoot, 'dist');
  const svgDir = path.resolve(distDir, 'svg');
  const manifestPath = options.manifestPath ?? path.resolve(packageRoot, 'metadata/icons.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as IconManifest;

  await mkdir(distDir, { recursive: true });
  await mkdir(svgDir, { recursive: true });

  for (const icon of manifest.icons) {
    for (const presentation of Object.values(icon.presentations)) {
      const sourcePath = path.resolve(assetsDir, presentation.source);
      const relativeSourcePath = path.relative(assetsDir, sourcePath);

      if (relativeSourcePath.startsWith('..') || path.isAbsolute(relativeSourcePath)) {
        throw new Error(`${icon.id} resolves outside the assets directory.`);
      }

      const sourceSvg = await readFile(sourcePath, 'utf8');
      const publishedSvg = icon.opticalTransform
        ? applyOpticalTransformToSvg(sourceSvg, icon.opticalTransform)
        : sourceSvg;
      const outputPath = path.resolve(svgDir, presentation.source);

      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, publishedSvg);
    }
  }

  await writeFile(
    path.resolve(distDir, 'icons.json'),
    `${JSON.stringify(createPublishedManifest(manifest), null, 2)}\n`
  );
}
