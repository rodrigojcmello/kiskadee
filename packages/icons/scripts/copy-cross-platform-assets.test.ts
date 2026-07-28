import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { copyCrossPlatformAssets } from './copy-cross-platform-assets.ts';
import type { IconManifest } from './generate-react.ts';
import { applyOpticalTransformToSvg, readSvgViewBox } from './icon-optical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(packageRoot, 'assets');
const manifestPath = path.resolve(packageRoot, 'metadata/icons.json');
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  );
});

function readReactViewBoxes(component: string): string[] {
  return [...component.matchAll(/\bviewBox="([^"]+)"/g)].map((match) => match[1]);
}

describe('copyCrossPlatformAssets', () => {
  it('publishes one already-calibrated geometry for SVG and React consumers', async () => {
    const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'kiskadee-icons-'));
    temporaryDirectories.push(temporaryRoot);

    const distDir = path.resolve(temporaryRoot, 'dist');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as IconManifest;
    const substack = manifest.icons.find((icon) => icon.id === 'substack');

    expect(substack?.opticalTransform).toBeDefined();
    expect(substack?.presentations.brand).toBeDefined();
    expect(substack?.presentations.monochrome).toBeDefined();

    const brandSourcePath = path.resolve(assetsDir, substack!.presentations.brand!.source);
    const monochromeSourcePath = path.resolve(
      assetsDir,
      substack!.presentations.monochrome!.source
    );
    const [brandSourceBefore, monochromeSourceBefore] = await Promise.all([
      readFile(brandSourcePath, 'utf8'),
      readFile(monochromeSourcePath, 'utf8')
    ]);

    await copyCrossPlatformAssets({ assetsDir, distDir, manifestPath });

    const [brandSourceAfter, monochromeSourceAfter, publishedBrand, publishedMonochrome] =
      await Promise.all([
        readFile(brandSourcePath, 'utf8'),
        readFile(monochromeSourcePath, 'utf8'),
        readFile(path.resolve(distDir, 'svg', substack!.presentations.brand!.source), 'utf8'),
        readFile(path.resolve(distDir, 'svg', substack!.presentations.monochrome!.source), 'utf8')
      ]);

    expect(brandSourceAfter).toBe(brandSourceBefore);
    expect(monochromeSourceAfter).toBe(monochromeSourceBefore);

    const expectedBrand = applyOpticalTransformToSvg(
      brandSourceBefore,
      substack!.opticalTransform!
    );
    const expectedMonochrome = applyOpticalTransformToSvg(
      monochromeSourceBefore,
      substack!.opticalTransform!
    );

    expect(publishedBrand).toBe(expectedBrand);
    expect(publishedMonochrome).toBe(expectedMonochrome);
    expect(readSvgViewBox(publishedBrand)).toEqual(readSvgViewBox(publishedMonochrome));
    expect(readSvgViewBox(publishedBrand)).not.toEqual(readSvgViewBox(brandSourceBefore));

    const reactComponent = await readFile(
      path.resolve(packageRoot, 'src/families/social/SubstackIcon.tsx'),
      'utf8'
    );
    const publishedViewBox = Object.values(readSvgViewBox(publishedBrand)).join(' ');

    expect(readReactViewBoxes(reactComponent)).toEqual([publishedViewBox, publishedViewBox]);
  });

  it('publishes an informational manifest that cannot reapply optical transforms', async () => {
    const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'kiskadee-icons-'));
    temporaryDirectories.push(temporaryRoot);

    const distDir = path.resolve(temporaryRoot, 'dist');
    const sourceManifestText = await readFile(manifestPath, 'utf8');
    const sourceManifest = JSON.parse(sourceManifestText) as IconManifest;

    await copyCrossPlatformAssets({ assetsDir, distDir, manifestPath });

    const publishedManifestText = await readFile(path.resolve(distDir, 'icons.json'), 'utf8');
    const publishedManifest = JSON.parse(publishedManifestText) as {
      assetState: string;
      icons: Array<Record<string, unknown> & { id: string }>;
    };
    const sourceSubstack = sourceManifest.icons.find((icon) => icon.id === 'substack');
    const publishedSubstack = publishedManifest.icons.find((icon) => icon.id === 'substack');

    expect(publishedManifest.assetState).toBe('optically-calibrated');
    expect(publishedManifestText).not.toContain('"opticalTransform"');
    expect(publishedSubstack).not.toHaveProperty('opticalTransform');
    expect(publishedSubstack?.appliedOpticalTransform).toEqual(sourceSubstack?.opticalTransform);
    expect(JSON.parse(await readFile(manifestPath, 'utf8'))).toEqual(sourceManifest);
  });
});
