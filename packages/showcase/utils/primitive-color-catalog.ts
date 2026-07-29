import {
  KISKADEE_TONES,
  type KiskadeeTone,
  type ThemeMode,
  type TonalFunctionalReferenceName
} from '@kiskadee/core';
import type { ColorScaleJson } from '@/registry/colors.registry';

export const primitiveScaleThemes = ['light', 'dark'] as const;

export type PrimitiveScaleTheme = (typeof primitiveScaleThemes)[number];

export type PrimitiveColorArtifact = {
  functionalReferences?: Partial<
    Record<ThemeMode, Partial<Record<TonalFunctionalReferenceName, KiskadeeTone>>>
  >;
  kind: 'static' | 'dynamic';
  scales?: Partial<Record<ThemeMode, string>>;
};

export type ColorsArtifact = {
  primitiveColors?: Record<string, Record<string, PrimitiveColorArtifact>>;
  globalSemantics?: Partial<
    Record<ThemeMode, Record<string, string | { v1: string; v2?: string }>>
  >;
};

export type PrimitiveScaleDescriptor = {
  fileName?: string;
  functionalReferences?: Partial<Record<TonalFunctionalReferenceName, KiskadeeTone>>;
  theme: PrimitiveScaleTheme;
};

export type PrimitiveColorDescriptor = {
  family: string;
  id: string;
  kind: PrimitiveColorArtifact['kind'];
  scales: PrimitiveScaleDescriptor[];
  variant: string;
};

export type PrimitiveToneEntry = {
  tone: KiskadeeTone;
  value: string;
};

export type LoadedPrimitiveScale = PrimitiveScaleDescriptor & {
  error: string | null;
  tones: PrimitiveToneEntry[] | null;
};

export type LoadedPrimitiveColor = Omit<PrimitiveColorDescriptor, 'scales'> & {
  scales: LoadedPrimitiveScale[];
};

/**
 * What
 *     Builds the ordered primitive catalog published by colors.json.
 * Why
 *     The Showcase must preserve preset authorship order while rendering both physical themes.
 */
export function collectPrimitiveColorDescriptors(
  colors: ColorsArtifact
): PrimitiveColorDescriptor[] {
  const descriptors: PrimitiveColorDescriptor[] = [];

  for (const [family, variants] of Object.entries(colors.primitiveColors ?? {})) {
    for (const [variant, asset] of Object.entries(variants ?? {})) {
      descriptors.push({
        family,
        id: `${family}.${variant}`,
        kind: asset.kind,
        scales: primitiveScaleThemes.map((theme) => ({
          fileName: asset.scales?.[theme],
          functionalReferences: asset.functionalReferences?.[theme],
          theme
        })),
        variant
      });
    }
  }

  return descriptors;
}

/**
 * What
 *     Projects a published scale onto the canonical 36-position Kiskadee grid.
 * Why
 *     Extra or missing JSON keys must not silently alter the visual inspection contract.
 */
export function collectPrimitiveToneEntries(scale: ColorScaleJson): PrimitiveToneEntry[] {
  return KISKADEE_TONES.map((tone) => {
    const value = scale[String(tone)];

    if (typeof value !== 'string') {
      throw new Error(`Primitive scale is missing canonical tone ${tone}.`);
    }

    return { tone, value };
  });
}

/**
 * What
 *     Reassembles independently loaded scale results into their declared primitive families.
 * Why
 *     One missing or malformed scale must remain visible without hiding successful siblings.
 */
export function materializePrimitiveColorCatalog(
  descriptors: PrimitiveColorDescriptor[],
  settledScales: PromiseSettledResult<PrimitiveToneEntry[]>[]
): LoadedPrimitiveColor[] {
  let settledIndex = 0;

  return descriptors.map<LoadedPrimitiveColor>((descriptor) => ({
    ...descriptor,
    scales: descriptor.scales.map((scaleDescriptor) => {
      const result = settledScales[settledIndex];
      settledIndex += 1;

      if (!result || result.status === 'rejected') {
        const reason = result?.status === 'rejected' ? result.reason : undefined;

        return {
          ...scaleDescriptor,
          error: reason instanceof Error ? reason.message : String(reason ?? 'Unknown error'),
          tones: null
        };
      }

      return {
        ...scaleDescriptor,
        error: null,
        tones: result.value
      };
    })
  }));
}
