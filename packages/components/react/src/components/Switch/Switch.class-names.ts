import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  componentEmphasisBuckets,
  type EffectClassBucketJSON,
  type RadiusMode,
  type SwitchActivationMotion,
  type SwitchControlTextVisibility,
  type SwitchIntent,
  type SwitchMode,
  type SwitchVariant
} from '@kiskadee/core';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchLabelPosition,
  SwitchVariantClassesMap
} from './Switch.types.ts';

export const DEFAULT_SWITCH_SCALE = 's:md:1';
export const DEFAULT_SWITCH_ACTIVATION_MOTION: SwitchActivationMotion = 'standard';
export const DEFAULT_SWITCH_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_SWITCH_INTENT: SwitchIntent = 'neutral';
export const DEFAULT_SWITCH_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_SWITCH_VARIANT: SwitchVariant = 'standard';
export const DEFAULT_SWITCH_MODE: SwitchMode = 'base';
export const DEFAULT_SWITCH_LABEL_POSITION: SwitchLabelPosition = 'start';
export const DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY: SwitchControlTextVisibility = 'none';
type SwitchStructuralBranch = 'a' | 'b';

export function join(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

export function resolveVariantElements(
  map: SwitchVariantClassesMap | undefined,
  variant: SwitchVariant,
  mode: SwitchMode
): SwitchClassesMap {
  if (!map) return {};
  return map[variant]?.[mode] ?? {};
}

export function resolveIntentClasses(
  element: ClassNameByElementJSON | undefined,
  intent: SwitchIntent,
  emphasis: ComponentEmphasis | undefined
): string {
  if (!element?.c) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen = byIntent[intent] ?? byIntent.neutral ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  if (!bucket) return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';

  const buckets = chosen as Record<string, string | undefined>;
  return buckets[bucket] ?? chosen.m ?? chosen.h ?? chosen.l ?? chosen.ll ?? '';
}

export function elem(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: SwitchIntent;
    emphasis: ComponentEmphasis | undefined;
  }
): string {
  if (!element) return '';

  const scaleKey = normalizeScaleKey(options.scale);
  return (
    join(
      element.d,
      resolveIntentClasses(element, options.intent, options.emphasis),
      element.s?.all,
      element.s?.[scaleKey]
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
  return join(all, byScale) ?? '';
}

function resolveEffectBucketClassName(
  bucket: EffectClassBucketJSON | undefined,
  scale: string
): string {
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;

  const scaleKey = normalizeScaleKey(scale);
  return join(bucket.all, bucket[scaleKey]) ?? '';
}

export function hasSwitchActivationFeedbackEffect(
  element: ClassNameByElementJSON | undefined
): boolean {
  return resolveSwitchActivationFeedbackEffectClassName(element).length > 0;
}

export function resolveSwitchActivationFeedbackEffectClassName(
  element: ClassNameByElementJSON | undefined
): string {
  const bucket = element?.e?.af;
  return typeof bucket === 'string' ? bucket : '';
}

export function resolveSwitchThumbSizeEffectClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  return resolveEffectBucketClassName(element?.e?.ts, scale);
}

function resolveScaleClassName(element: ClassNameByElementJSON | undefined, scale: string): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  return join(element.s?.all, element.s?.[scaleKey]) ?? '';
}

function resolveVisualClassName(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: SwitchIntent;
    emphasis: ComponentEmphasis | undefined;
  }
): string {
  if (!element) return '';
  return join(element.d, resolveIntentClasses(element, options.intent, options.emphasis)) ?? '';
}

function resolveThumbRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode,
  branch: SwitchStructuralBranch
): string {
  return (
    join(
      radiusMode === 'rounded' ? '' : resolveRadiusClassName(element, scale, radiusMode),
      radiusMode === 'rounded' ? `k-swt-e3a-${branch}` : ''
    ) ?? ''
  );
}

function resolveThumbVisualRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode,
  branch: SwitchStructuralBranch
): string {
  return (
    join(
      radiusMode === 'rounded' ? '' : resolveRadiusClassName(element, scale, radiusMode),
      radiusMode === 'rounded' ? `k-swt-x5a-${branch}` : ''
    ) ?? ''
  );
}

function resolveThumbCarrierClassName(options: {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  structuralBranch: SwitchStructuralBranch;
  scale: string;
  radius: RadiusMode;
}): string {
  const elements = options.elements;
  const branch = options.structuralBranch;

  return (
    join(
      `k-swt-e3-${branch}`,
      resolveScaleClassName(elements.e3, options.scale),
      resolveThumbRadiusClassName(elements.e3, options.scale, options.radius, branch),
      'k-trn',
      options.classNames.e3
    ) ?? ''
  );
}

export function resolveSwitchClassNames(options: {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  structuralBranch: SwitchStructuralBranch;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  activationMotion: SwitchActivationMotion;
  labelPosition: SwitchLabelPosition;
  hasLabel: boolean;
  hasControlText: boolean;
}): Required<SwitchClassNames> {
  const elements = options.elements;
  const branch = options.structuralBranch;

  return {
    e1:
      join(
        'k-swt',
        `k-swt-${branch}`,
        `k-swt-e1-${branch}`,
        options.activationMotion === 'slow' ? `k-swt-e1b-${branch}` : '',
        elem(elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      join(
        `k-swt-e2-${branch}`,
        elem(elements.e2, options),
        resolveRadiusClassName(elements.e2, options.scale, options.radius),
        'k-trn',
        options.classNames.e2
      ) ?? '',
    e3: resolveThumbCarrierClassName(options),
    e4: options.hasLabel
      ? (join(
          `k-swt-e4-${branch}`,
          options.labelPosition === 'start' ? `k-swt-e4a-${branch}` : '',
          elem(elements.e4, options),
          'k-trn',
          options.classNames.e4
        ) ?? '')
      : (options.classNames.e4 ?? ''),
    e5: options.hasControlText
      ? (join(`k-swt-e5-${branch}`, elem(elements.e5, options), 'k-trn', options.classNames.e5) ??
        '')
      : (options.classNames.e5 ?? '')
  };
}

export function resolveSwitchThumbVisualClassName(options: {
  elements: SwitchClassesMap;
  structuralBranch: SwitchStructuralBranch;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
}): string {
  const elements = options.elements;
  const branch = options.structuralBranch;

  return (
    join(
      `k-swt-x5-${branch}`,
      resolveVisualClassName(elements.e3, options),
      resolveThumbVisualRadiusClassName(elements.e3, options.scale, options.radius, branch),
      'k-trn'
    ) ?? ''
  );
}

export function resolveSwitchThumbSizeClassNames(options: {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  structuralBranch: SwitchStructuralBranch;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  activationMotion: SwitchActivationMotion;
  labelPosition: SwitchLabelPosition;
  hasLabel: boolean;
  hasControlText: boolean;
}): Required<SwitchClassNames> & { x5: string } {
  const base = resolveSwitchClassNames(options);
  const elements = options.elements;

  return {
    ...base,
    x5:
      join(
        resolveSwitchThumbVisualClassName(options),
        resolveSwitchThumbSizeEffectClassName(elements.e3, options.scale)
      ) ?? ''
  };
}
