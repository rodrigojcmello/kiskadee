import {
  KISKADEE_TONES,
  type KiskadeeTone,
  type PrimitiveColorAsset,
  type PrimitiveFunctionalReferences,
  type ThemeName,
  type TonalFunctionalReferenceName
} from '../types/colors/colors.types.ts';
import { isKiskadeeTone } from './hexColor.ts';

const FUNCTIONAL_REFERENCE_NAMES = [
  'subtle',
  'vivid'
] as const satisfies readonly TonalFunctionalReferenceName[];
const THEME_NAMES = ['light', 'dark'] as const satisfies readonly ThemeName[];

/**
 * Moves through the public Kiskadee grid by ordinal positions.
 *
 * `30 + 1` resolves to `35`, not `31`. Invalid inputs and grid overflow fail
 * explicitly so schema authors never receive a silently clamped color.
 */
export function shiftKiskadeeTone(tone: KiskadeeTone, offset: number): KiskadeeTone {
  if (!isKiskadeeTone(tone)) {
    throw new Error(`Unknown Kiskadee tone: ${tone}`);
  }
  if (!Number.isInteger(offset)) {
    throw new Error(`A Kiskadee tone offset must be an integer, got: ${offset}`);
  }

  const sourceIndex = KISKADEE_TONES.indexOf(tone);
  const targetIndex = sourceIndex + offset;
  const target = KISKADEE_TONES[targetIndex];
  if (target === undefined) {
    throw new Error(`Kiskadee tone offset leaves the public grid: tone=${tone} offset=${offset}`);
  }
  return target;
}

/** Validates an optional functional-reference contract against its emitted scales. */
export function assertPrimitiveFunctionalReferences(asset: {
  scales: Partial<Record<ThemeName, unknown>>;
  functionalReferences?: unknown;
}): void {
  const references = asset.functionalReferences;
  if (references === undefined) return;
  if (!isRecord(references)) {
    throw new Error('Primitive functional references must be an object');
  }

  const unknownThemes = Object.keys(references).filter(
    (theme) => !(THEME_NAMES as readonly string[]).includes(theme)
  );
  if (unknownThemes.length > 0) {
    throw new Error(`Unknown primitive functional-reference themes: ${unknownThemes.join(', ')}`);
  }

  for (const theme of THEME_NAMES) {
    const scale = asset.scales[theme];
    const themeReferences = references[theme];

    if (scale === undefined) {
      if (themeReferences !== undefined) {
        throw new Error(
          `Primitive functional references declare ${theme} without a corresponding scale`
        );
      }
      continue;
    }

    if (!isRecord(themeReferences)) {
      throw new Error(`Primitive ${theme} scale is missing functional references`);
    }

    const unknownReferenceNames = Object.keys(themeReferences).filter(
      (name) => !(FUNCTIONAL_REFERENCE_NAMES as readonly string[]).includes(name)
    );
    if (unknownReferenceNames.length > 0) {
      throw new Error(
        `Unknown primitive ${theme} functional references: ${unknownReferenceNames.join(', ')}`
      );
    }

    for (const name of FUNCTIONAL_REFERENCE_NAMES) {
      const tone = themeReferences[name];
      if (typeof tone !== 'number' || !isKiskadeeTone(tone)) {
        throw new Error(`Invalid primitive ${theme}.${name} functional tone: ${String(tone)}`);
      }
      if (!isRecord(scale) || !(String(tone) in scale)) {
        throw new Error(
          `Primitive ${theme}.${name} functional tone ${tone} is missing from its scale`
        );
      }
    }

    const subtleIndex = KISKADEE_TONES.indexOf(themeReferences.subtle as KiskadeeTone);
    const vividIndex = KISKADEE_TONES.indexOf(themeReferences.vivid as KiskadeeTone);
    if (
      subtleIndex >= vividIndex &&
      !(themeReferences.subtle === 1 && themeReferences.vivid === 1)
    ) {
      throw new Error(
        `Primitive ${theme} functional references must place subtle before vivid on the public grid`
      );
    }
  }
}

export function resolvePrimitiveFunctionalTone(
  asset: PrimitiveColorAsset,
  theme: ThemeName,
  reference: TonalFunctionalReferenceName,
  offset = 0
): KiskadeeTone {
  assertPrimitiveFunctionalReferences(asset);
  const references = asset.functionalReferences as PrimitiveFunctionalReferences | undefined;
  const tone = references?.[theme]?.[reference];
  if (tone === undefined) {
    throw new Error(`Primitive asset is missing the ${theme}.${reference} functional reference`);
  }
  return shiftKiskadeeTone(tone, offset);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
