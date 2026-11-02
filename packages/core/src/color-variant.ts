import {
  type ButtonIntent,
  ButtonIntentKeys,
  type ColorSchema,
  type ColorVariant,
  type ColorVariantPalette,
  interactionStateKeys
} from './types/colors/colors.types.ts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Inherits missing branches, replacing an authored state-map leaf as one complete recipe. */
export function resolveColorVariantLeaves<T>(standard: T, alternative: T | undefined): T {
  if (alternative === undefined) return structuredClone(standard);
  if (!isRecord(standard) || !isRecord(alternative)) return structuredClone(alternative);
  if (
    Object.keys(standard).some((key) => interactionStateKeys.includes(key as never)) ||
    Object.keys(alternative).some((key) => interactionStateKeys.includes(key as never))
  ) {
    return structuredClone(alternative);
  }
  const result: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(standard), ...Object.keys(alternative)])) {
    result[key] = resolveColorVariantLeaves(standard[key], alternative[key]);
  }
  return result as T;
}

/** Resolves one variant without mutating authored palettes or merging states between recipes. */
export function resolveColorVariantPalette<T extends ColorSchema>(
  variants: ColorVariantPalette<T, ColorSchema>,
  variant: ColorVariant
): T {
  return resolveColorVariantLeaves<ColorSchema>(
    variants.standard,
    variant === 'alternative' ? variants.alternative : undefined
  ) as T;
}

/** External namespaces are parsed first, so brand names ending in -alt remain external names. */
export function parseButtonIntentValue(
  value: unknown
): { intent: ButtonIntent; colorVariant: ColorVariant } | undefined {
  if (typeof value !== 'string') return undefined;
  if (value.startsWith('brand.')) {
    return /^brand\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/i.test(value)
      ? { intent: value as ButtonIntent, colorVariant: 'standard' }
      : undefined;
  }
  const alternative = value.endsWith('-alt');
  const intent = alternative ? value.slice(0, -4) : value;
  if (!Object.hasOwn(ButtonIntentKeys, intent)) return undefined;
  return { intent: intent as ButtonIntent, colorVariant: alternative ? 'alternative' : 'standard' };
}
