import type { KiskadeeTone, Schema, TonalFunctionalReferenceName } from '@kiskadee/core';

export type PresetBrandContentPolarity = 'light' | 'dark';

export type PresetBrandReferenceSource =
  | 'generated-anchor'
  | 'cap-fallback'
  | 'surface-relative'
  | 'contrast-mirror';

export type PresetBrandTonalFamilyInput = {
  id: string;
  contentPolarity: PresetBrandContentPolarity;
  scales: Record<'light' | 'dark', Record<KiskadeeTone, string>>;
  functionalReferences: Record<
    'light' | 'dark',
    Record<
      TonalFunctionalReferenceName,
      {
        tone: KiskadeeTone;
        hex: string;
        source: PresetBrandReferenceSource;
      }
    >
  >;
};

export type PresetBrandPackBuildExtension = {
  projectionContract: string;
  packs: readonly string[];
  palettes: readonly string[];
  project: (brands: readonly PresetBrandTonalFamilyInput[]) => Schema['components'];
};

export type PresetBuildExtensions = {
  brandPacks?: PresetBrandPackBuildExtension;
};
