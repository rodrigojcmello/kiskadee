import { getBrandPackDefinition, isBrandId } from '@kiskadee/brands';
import {
  type BrandPackLoader,
  type BrandPackLoadRequest,
  createBrandPackResourceKey,
  type LoadedBrandPackResources
} from '@kiskadee/react-components';
import {
  BRAND_PACK_BUILD_CONTRACT,
  BRAND_PACK_BUILD_FORMAT_VERSION,
  type BrandPackBuildManifest,
  type ComponentClassMapArtifactJSON
} from '@kiskadee/web-builder/types';
import { loadJsonFromBuild, loadTextFromBuild } from './build-artifacts.client';

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isSafeArtifactPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.split('/').includes('..')
  );
}

function assertBrandPackManifest(
  value: unknown,
  request: BrandPackLoadRequest
): asserts value is BrandPackBuildManifest {
  if (!isRecord(value)) throw new Error('Brand-pack manifest must be an object.');
  if (
    value.kind !== BRAND_PACK_BUILD_CONTRACT ||
    value.formatVersion !== BRAND_PACK_BUILD_FORMAT_VERSION
  ) {
    throw new Error(`Brand pack "${request.pack}" uses an unsupported build contract.`);
  }
  if (value.designSystem !== request.designSystem || value.pack !== request.pack) {
    throw new Error(`Brand-pack manifest mismatch for "${request.designSystem}/${request.pack}".`);
  }
  if (
    !Array.isArray(value.components) ||
    value.components.length !== 1 ||
    value.components[0] !== 'button'
  ) {
    throw new Error(`Brand pack "${request.pack}" publishes an invalid component set.`);
  }
  if (!Array.isArray(value.brands)) {
    throw new Error(`Brand pack "${request.pack}" has no valid brand catalog.`);
  }

  const expectedIds = getBrandPackDefinition(request.pack).brands;
  const actualIds: string[] = [];
  const seenIntents = new Set<string>();
  for (const entry of value.brands) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !isBrandId(entry.id)) {
      throw new Error(`Brand pack "${request.pack}" contains an unknown brand.`);
    }
    if (entry.intent !== `brand.${entry.id}` || seenIntents.has(entry.intent)) {
      throw new Error(`Brand pack "${request.pack}" contains an invalid or duplicate intent.`);
    }
    if (
      typeof entry.iconId !== 'string' ||
      (entry.contentPolarity !== 'light' && entry.contentPolarity !== 'dark') ||
      typeof entry.tonalIntegritySha256 !== 'string' ||
      !SHA256_PATTERN.test(entry.tonalIntegritySha256)
    ) {
      throw new Error(`Brand pack "${request.pack}" contains invalid brand metadata.`);
    }
    actualIds.push(entry.id);
    seenIntents.add(entry.intent);
  }
  if (
    actualIds.length !== expectedIds.length ||
    actualIds.some((id, index) => id !== expectedIds[index])
  ) {
    throw new Error(`Brand pack "${request.pack}" does not match its canonical membership.`);
  }
  if (!isRecord(value.palettes)) {
    throw new Error(`Brand pack "${request.pack}" has no palette catalog.`);
  }
}

function assertPaletteArtifact(
  value: unknown,
  pack: string,
  paletteName: string
): asserts value is BrandPackBuildManifest['palettes'][string] {
  if (
    !isRecord(value) ||
    !isSafeArtifactPath(value.css) ||
    typeof value.cssSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.cssSha256) ||
    !isRecord(value.classMaps) ||
    !isRecord(value.classMapSha256)
  ) {
    throw new Error(`Brand pack "${pack}" has an invalid "${paletteName}" palette artifact.`);
  }
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const loadBrandPack: BrandPackLoader = async (
  request: BrandPackLoadRequest
): Promise<LoadedBrandPackResources | undefined> => {
  const packBasePath = `${request.designSystem}/brand-packs/${request.pack}`;
  const manifest = await loadJsonFromBuild<BrandPackBuildManifest | undefined>(
    `${packBasePath}/manifest.json`,
    {
      required: false,
      fallback: undefined
    }
  );

  if (!manifest) return undefined;
  assertBrandPackManifest(manifest, request);

  const paletteName = `${request.segment}.${request.theme}`;
  const palette = manifest.palettes[paletteName];
  if (!palette) return undefined;
  assertPaletteArtifact(palette, request.pack, paletteName);

  const unsupportedComponent = request.components.find(
    (componentName) => !manifest.components.includes(componentName)
  );
  if (unsupportedComponent) return undefined;

  const classMapEntries = await Promise.all(
    request.components.map(async (componentName) => {
      const artifactPath = palette.classMaps[componentName];
      if (!artifactPath) {
        throw new Error(
          `Brand pack "${request.pack}" does not publish "${componentName}" for "${paletteName}".`
        );
      }
      const expectedSha256 = palette.classMapSha256[componentName];
      if (
        !isSafeArtifactPath(artifactPath) ||
        typeof expectedSha256 !== 'string' ||
        !SHA256_PATTERN.test(expectedSha256)
      ) {
        throw new Error(
          `Brand pack "${request.pack}" publishes invalid "${componentName}" artifact metadata.`
        );
      }
      const artifactJson = await loadTextFromBuild(`${packBasePath}/${artifactPath}`, {
        required: true
      });
      if ((await sha256Hex(artifactJson)) !== expectedSha256) {
        throw new Error(
          `Brand pack "${request.pack}" failed "${componentName}" class-map integrity.`
        );
      }
      const artifact = JSON.parse(artifactJson) as ComponentClassMapArtifactJSON<unknown>;
      if (
        !isRecord(artifact) ||
        artifact.component !== componentName ||
        !isRecord(artifact.classMap)
      ) {
        throw new Error(
          `Brand pack "${request.pack}" publishes an invalid "${componentName}" class map.`
        );
      }
      return [componentName, artifact] as const;
    })
  );

  return {
    ...request,
    cacheKey: createBrandPackResourceKey(request),
    stylesheetHref: `/build/${packBasePath}/${palette.css}`,
    stylesheetSha256: palette.cssSha256,
    classMaps: Object.fromEntries(classMapEntries),
    intents: manifest.brands.map((brand) => brand.intent)
  };
};
