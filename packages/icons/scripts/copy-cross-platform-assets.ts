import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type IconConstructionMetadata,
  type IconManifest,
  type IconMetadata,
  validateIconManifest
} from './generate-react.ts';
import { applyOpticalTransformToSvg } from './icon-optical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export interface CopyCrossPlatformAssetsOptions {
  assetsDir?: string;
  distDir?: string;
  manifestPath?: string;
}

interface PublishedIconConstruction extends Omit<IconConstructionMetadata, 'opticalTransform'> {
  appliedOpticalTransform: IconConstructionMetadata['opticalTransform'];
}

interface PublishedIconMetadata extends Omit<IconMetadata, 'constructions'> {
  constructions: Record<string, PublishedIconConstruction>;
}

interface PublishedIconManifest extends Omit<IconManifest, 'icons'> {
  assetState: 'optically-calibrated';
  icons: PublishedIconMetadata[];
}

function createPublishedManifest(manifest: IconManifest): PublishedIconManifest {
  return {
    ...manifest,
    assetState: 'optically-calibrated',
    icons: manifest.icons.map((icon) => ({
      ...icon,
      constructions: Object.fromEntries(
        Object.entries(icon.constructions).map(
          ([constructionName, { opticalTransform, ...construction }]) => [
            constructionName,
            {
              ...construction,
              appliedOpticalTransform: opticalTransform
            }
          ]
        )
      )
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
  validateIconManifest(manifest);

  await mkdir(distDir, { recursive: true });
  await mkdir(svgDir, { recursive: true });

  for (const icon of manifest.icons) {
    for (const construction of Object.values(icon.constructions)) {
      for (const presentation of Object.values(construction.presentations)) {
        const sourcePath = path.resolve(assetsDir, presentation.source);
        const relativeSourcePath = path.relative(assetsDir, sourcePath);

        if (relativeSourcePath.startsWith('..') || path.isAbsolute(relativeSourcePath)) {
          throw new Error(`${icon.id} resolves outside the assets directory.`);
        }

        const sourceSvg = await readFile(sourcePath, 'utf8');
        const publishedSvg = applyOpticalTransformToSvg(sourceSvg, construction.opticalTransform);
        const outputPath = path.resolve(svgDir, presentation.source);

        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, publishedSvg);
      }
    }
  }

  await writeFile(
    path.resolve(distDir, 'icons.json'),
    `${JSON.stringify(createPublishedManifest(manifest), null, 2)}\n`
  );
}
