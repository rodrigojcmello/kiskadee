import type { KiskadeeHexScale, StaticPrimitiveTonalColorAsset } from '@kiskadee/core';
import { KISKADEE_TONES } from '../kiskadee-tonal-scale.ts';
import type { PrimitiveTonalColorAssetV5 } from './tonal-artifacts.ts';

/** Project only the static primitive contract consumed by Core. */
export function projectPresetAsset(
  asset: PrimitiveTonalColorAssetV5
): StaticPrimitiveTonalColorAsset {
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
    scales: { light: projectScale(asset.scales.light), dark: projectScale(asset.scales.dark) }
  };
}

export function serializePresetAsset(asset: PrimitiveTonalColorAssetV5): string {
  return [
    "import type { KiskadeeHexScale, StaticPrimitiveTonalColorAsset } from '@kiskadee/core';",
    '',
    `// Generated from colors/${asset.id}.json by ${asset.generator.package}@${asset.generator.version}.`,
    `export default ${JSON.stringify(projectPresetAsset(asset), null, 2)} as const satisfies StaticPrimitiveTonalColorAsset;`,
    ''
  ].join('\n');
}

function projectScale(scale: PrimitiveTonalColorAssetV5['scales']['light']): KiskadeeHexScale {
  const entries = KISKADEE_TONES.map((tone) => {
    const hex = scale[tone];
    if (!/^#[0-9a-f]{6}$/.test(hex ?? '')) throw new Error(`Invalid preset color at tone ${tone}.`);
    return [tone, hex] as const;
  });
  return Object.fromEntries(entries) as KiskadeeHexScale;
}
