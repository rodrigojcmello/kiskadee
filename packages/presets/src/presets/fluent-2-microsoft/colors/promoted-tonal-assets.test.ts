import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import blueV1 from './b.blue.v1.ts';
import greenV1 from './g.green.v1.ts';
import blackV1 from './n.black.v1.ts';
import blackV2 from './n.black.v2.ts';
import purpleV1 from './p.purple.v1.ts';
import redV1 from './r.red.v1.ts';
import yellowV1 from './y.yellow.v1.ts';
import orangeV1 from './yr.orange.v1.ts';

const GENERATED_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../docs/design-systems/fluent-2-microsoft/colors/generated'
);

const PROMOTED_ASSETS = {
  'b.blue.v1': blueV1,
  'g.green.v1': greenV1,
  'n.black.v1': blackV1,
  'n.black.v2': blackV2,
  'p.purple.v1': purpleV1,
  'r.red.v1': redV1,
  'y.yellow.v1': yellowV1,
  'yr.orange.v1': orangeV1
} as const;

const CANDIDATE_ONLY_ASSET_IDS = [
  'bg.teal.v1',
  'gy.lime.v1',
  'pb.indigo.v1',
  'rp.magenta.v1',
  'yr.brown.v1'
] as const;

type ApprovedAsset = {
  functionalReferences: Record<
    'light' | 'dark',
    Record<'subtle' | 'vivid', { hex: string; tone: number }>
  >;
  scales: Record<'light' | 'dark', Record<string, string>>;
};

type ApprovedManifest = {
  assets: Array<{ familyId: string; path: string; sha256: string }>;
  source: { path: string; sha256: string };
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function projectApprovedAsset(asset: ApprovedAsset) {
  return {
    kind: 'static',
    functionalReferences: {
      light: {
        subtle: asset.functionalReferences.light.subtle.tone,
        vivid: asset.functionalReferences.light.vivid.tone
      },
      dark: {
        subtle: asset.functionalReferences.dark.subtle.tone,
        vivid: asset.functionalReferences.dark.vivid.tone
      }
    },
    scales: asset.scales
  };
}

describe('Fluent promoted tonal assets', () => {
  const manifestPath = resolve(GENERATED_ROOT, 'tonal-system.json');
  const manifest = readJson<ApprovedManifest>(manifestPath);

  it('keeps the manifest limited to promoted and explicitly candidate-only assets', () => {
    expect(manifest.assets.map(({ familyId }) => familyId).sort()).toEqual(
      [...Object.keys(PROMOTED_ASSETS), ...CANDIDATE_ONLY_ASSET_IDS].sort()
    );
  });

  it('keeps every approved source and asset byte-identical to the signed manifest', () => {
    expect(sha256(resolve(GENERATED_ROOT, manifest.source.path))).toBe(manifest.source.sha256);
    for (const asset of manifest.assets) {
      expect(sha256(resolve(GENERATED_ROOT, asset.path)), asset.familyId).toBe(asset.sha256);
    }
  });

  it('keeps every promoted TypeScript asset equal to its approved JSON projection', () => {
    for (const [familyId, promoted] of Object.entries(PROMOTED_ASSETS)) {
      const approved = readJson<ApprovedAsset>(resolve(GENERATED_ROOT, `colors/${familyId}.json`));

      expect(promoted, familyId).toEqual(projectApprovedAsset(approved));

      for (const theme of ['light', 'dark'] as const) {
        for (const reference of ['subtle', 'vivid'] as const) {
          const { hex, tone } = approved.functionalReferences[theme][reference];
          expect(approved.scales[theme][String(tone)], `${familyId}.${theme}.${reference}`).toBe(
            hex
          );
        }
      }
    }
  });
});
