import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import asset0 from './b.blue.v1.ts';
import asset1 from './bg.teal.v1.ts';
import asset2 from './bg.teal.v2.ts';
import asset3 from './bg.teal.v3.ts';
import asset4 from './g.green.v1.ts';
import asset5 from './n.black.v2.ts';
import asset6 from './p.purple.v1.ts';
import asset7 from './pb.indigo.v1.ts';
import asset8 from './r.red.v1.ts';
import asset9 from './r.red.v2.ts';
import asset10 from './y.yellow.v1.ts';
import asset11 from './yr.brown.v1.ts';
import asset12 from './yr.orange.v1.ts';

const GENERATED_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../docs/design-systems/ios-27-apple/colors/generated'
);

const PROMOTED_ASSETS = {
  'b.blue.v1': asset0,
  'bg.teal.v1': asset1,
  'bg.teal.v2': asset2,
  'bg.teal.v3': asset3,
  'g.green.v1': asset4,
  'n.black.v2': asset5,
  'p.purple.v1': asset6,
  'pb.indigo.v1': asset7,
  'r.red.v1': asset8,
  'r.red.v2': asset9,
  'y.yellow.v1': asset10,
  'yr.brown.v1': asset11,
  'yr.orange.v1': asset12
} as const;

const CANDIDATE_ONLY_ASSET_IDS = ['gy.lime.v1', 'n.black.v1', 'rp.magenta.v1'] as const;

type ApprovedAsset = {
  functionalReferences: Record<
    'light' | 'dark',
    Record<'subtle' | 'medium' | 'vivid', { hex: string; tone: number }>
  >;
  scales: Record<'light' | 'dark', Record<string, string>>;
};

type ApprovedManifest = {
  assets: Array<{
    familyId: string;
    path: string;
    sha256: string;
    preset: { path: string; sha256: string };
  }>;
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
        medium: asset.functionalReferences.light.medium.tone,
        vivid: asset.functionalReferences.light.vivid.tone
      },
      dark: {
        subtle: asset.functionalReferences.dark.subtle.tone,
        medium: asset.functionalReferences.dark.medium.tone,
        vivid: asset.functionalReferences.dark.vivid.tone
      }
    },
    scales: asset.scales
  };
}

describe('iOS 27 promoted tonal assets', () => {
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
      expect(sha256(resolve(GENERATED_ROOT, asset.preset.path)), asset.familyId).toBe(
        asset.preset.sha256
      );
      if (asset.familyId in PROMOTED_ASSETS) {
        expect(readFileSync(new URL(`./${asset.familyId}.ts`, import.meta.url), 'utf8')).toBe(
          readFileSync(resolve(GENERATED_ROOT, asset.preset.path), 'utf8')
        );
      }
    }
  });

  it('keeps every promoted TypeScript asset equal to its approved JSON projection', () => {
    for (const [familyId, promoted] of Object.entries(PROMOTED_ASSETS)) {
      const approved = readJson<ApprovedAsset>(resolve(GENERATED_ROOT, `colors/${familyId}.json`));

      expect(promoted, familyId).toEqual(projectApprovedAsset(approved));

      for (const theme of ['light', 'dark'] as const) {
        for (const reference of ['subtle', 'medium', 'vivid'] as const) {
          const { hex, tone } = approved.functionalReferences[theme][reference];
          expect(approved.scales[theme][String(tone)], `${familyId}.${theme}.${reference}`).toBe(
            hex
          );
        }
      }
    }
  });
});
