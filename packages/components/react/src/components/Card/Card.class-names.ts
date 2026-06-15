import {
  type CardIntent,
  type CardRadiusMode,
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  componentEmphasisBuckets,
  type RadiusMode,
  stateActivator as cn
} from '@kiskadee/core';
import type { CardClassNames as HeadlessCardClassNames } from '@kiskadee/react-headless';
import type { CardProps, CardStatus } from './Card.types.ts';

export const DEFAULT_CARD_SCALE = 's:md:1';
export const DEFAULT_CARD_RADIUS: CardRadiusMode = 'rounded';
export const DEFAULT_CARD_INTENT: CardIntent = 'neutral';
export const DEFAULT_CARD_EMPHASIS: ComponentEmphasis = 'medium';

export function join(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeCardScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

function collectElementClasses(
  element: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = DEFAULT_CARD_EMPHASIS,
  intent: CardIntent | undefined = DEFAULT_CARD_INTENT
): string {
  if (!element) return '';

  const base = element.d ?? '';
  const colorByIntent = element.c as Record<CardIntent, ColorClasses> | undefined;
  const colorBuckets = colorByIntent?.[intent];

  if (!colorBuckets) return base;

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  const colorBucketMap = colorBuckets as Record<string, string | undefined>;
  const color = bucket
    ? (colorBucketMap[bucket] ?? '')
    : !emphasis
      ? (colorBuckets.h ?? colorBuckets.m ?? colorBuckets.l ?? colorBuckets.ll ?? '')
      : '';

  return join(base, color) ?? '';
}

function resolveCardRadiusMode(
  radius: CardRadiusMode | undefined,
  globalRadius: RadiusMode | undefined
): CardRadiusMode {
  if (radius) return radius;
  return globalRadius === 'square' ? 'square' : DEFAULT_CARD_RADIUS;
}

export function resolveCardClassNames({
  e1,
  className,
  classNames,
  status,
  radius,
  emphasis,
  intent,
  globalRadius,
  action
}: {
  e1: ClassNameByElementJSON | undefined;
  className: string | undefined;
  classNames: NonNullable<CardProps['classNames']>;
  status: CardStatus | 'rest';
  radius: CardRadiusMode | undefined;
  emphasis: ComponentEmphasis | undefined;
  intent: CardIntent | undefined;
  globalRadius: RadiusMode | undefined;
  action: boolean;
}): NonNullable<HeadlessCardClassNames> {
  const resolvedIntent = intent ?? DEFAULT_CARD_INTENT;
  const resolvedEmphasis = emphasis ?? DEFAULT_CARD_EMPHASIS;
  const scaleKey = normalizeCardScaleKey(DEFAULT_CARD_SCALE);
  const radiusMode = resolveCardRadiusMode(radius, globalRadius);

  const e1RadiusAll = radiusMode === 'square' ? (e1?.rs?.all ?? '') : (e1?.rr?.all ?? '');
  const e1RadiusScale =
    radiusMode === 'square' ? (e1?.rs?.[scaleKey] ?? '') : (e1?.rr?.[scaleKey] ?? '');

  const projectedStatus =
    status !== 'rest'
      ? join(cn[status], status === 'focus' ? cn.focusVisible : undefined)
      : undefined;
  const activation = projectedStatus ? join(projectedStatus, cn.activator) : undefined;

  return {
    e1:
      join(
        collectElementClasses(e1, resolvedEmphasis, resolvedIntent),
        e1?.s?.all,
        e1?.s?.[scaleKey],
        e1RadiusAll,
        e1RadiusScale,
        classNames.e1,
        className,
        activation,
        'k-crd',
        action ? 'k-crd-a' : undefined,
        action ? 'k-foc' : undefined,
        'k-trn'
      ) ?? ''
  };
}
