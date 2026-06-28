import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  componentEmphasisBuckets,
  type EffectClassBucketJSON,
  type RadiusMode
} from '@kiskadee/core';

export type ClassNamePart = string | undefined | false | null;

export function joinClassNames(...parts: ClassNamePart[]): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

type ColorBucketKey = keyof Pick<ColorClasses, 'hh' | 'h' | 'm' | 'l' | 'll'>;

type ResolveIntentClassNameOptions = {
  fallbackIntent?: string;
  useFirstIntentFallback?: boolean;
  emphasisFallbackOrder?: readonly ColorBucketKey[];
  defaultFallbackOrder?: readonly ColorBucketKey[];
};

const DEFAULT_COLOR_BUCKET_ORDER = ['hh', 'h', 'm', 'l', 'll'] as const;

function resolveColorBucketClassName(
  colors: ColorClasses,
  order: readonly ColorBucketKey[]
): string {
  for (const bucket of order) {
    const className = colors[bucket];
    if (className) return className;
  }
  return '';
}

export function resolveIntentClassName(
  element: ClassNameByElementJSON | undefined,
  intent: string | undefined,
  emphasis: ComponentEmphasis | undefined,
  options: ResolveIntentClassNameOptions = {}
): string {
  if (!element?.c || !intent) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen =
    byIntent[intent] ??
    (options.fallbackIntent ? byIntent[options.fallbackIntent] : undefined) ??
    (options.useFirstIntentFallback ? Object.values(byIntent)[0] : undefined);
  if (!chosen) return '';

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  if (!bucket) {
    return resolveColorBucketClassName(
      chosen,
      options.defaultFallbackOrder ?? DEFAULT_COLOR_BUCKET_ORDER
    );
  }

  const buckets = chosen as Record<string, string | undefined>;
  return (
    buckets[bucket] ?? resolveColorBucketClassName(chosen, options.emphasisFallbackOrder ?? [])
  );
}

export function resolveScaleClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  return joinClassNames(element.s?.all, element.s?.[scaleKey]) ?? '';
}

export function resolveSchemaElementClassName(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale?: string;
    intent: string | undefined;
    emphasis: ComponentEmphasis | undefined;
    intentOptions?: ResolveIntentClassNameOptions;
  }
): string {
  if (!element) return '';

  return (
    joinClassNames(
      element.d,
      resolveIntentClassName(element, options.intent, options.emphasis, options.intentOptions),
      options.scale ? resolveScaleClassName(element, options.scale) : ''
    ) ?? ''
  );
}

export function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode
): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  const all =
    radiusMode === 'rounded'
      ? (element.rr?.all ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.all ?? '')
        : radiusMode === 'square'
          ? (element.rs?.all ?? '')
          : '';
  const byScale =
    radiusMode === 'rounded'
      ? (element.rr?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (element.rp?.[scaleKey] ?? '')
        : radiusMode === 'square'
          ? (element.rs?.[scaleKey] ?? '')
          : '';
  return joinClassNames(all, byScale) ?? '';
}

export function resolveEffectBucketClassName(
  bucket: EffectClassBucketJSON | undefined,
  options: {
    scale?: string;
    includeAll?: boolean;
  } = {}
): string {
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;

  if (!options.scale) {
    return bucket.all ?? '';
  }

  const scaleKey = normalizeScaleKey(options.scale);
  return joinClassNames(options.includeAll === false ? '' : bucket.all, bucket[scaleKey]) ?? '';
}

export function mergeClassNamePatches<TSlot extends string>(
  slots: readonly TSlot[],
  baseClassNames: Partial<Record<TSlot, string>>,
  ...classNamePatches: Array<Partial<Record<TSlot, string>> | null | undefined>
): Record<TSlot, string> {
  const merged = {} as Record<TSlot, string>;

  for (const slot of slots) {
    merged[slot] =
      joinClassNames(
        baseClassNames[slot],
        ...classNamePatches.map((classNamePatch) => classNamePatch?.[slot])
      ) ?? '';
  }

  return merged;
}
