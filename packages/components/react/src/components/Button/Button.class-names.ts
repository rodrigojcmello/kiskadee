import {
  type ButtonIntent,
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  componentEmphasisBuckets,
  type EffectClassBucketJSON,
  type RadiusMode,
  stateActivator as cn
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import type { ButtonElementName, ButtonProps, ButtonStatus } from './Button.types.ts';

export const DEFAULT_BUTTON_SCALE = 's:md:1';
export const DEFAULT_BUTTON_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_BUTTON_INTENT: ButtonIntent = 'neutral';
export const DEFAULT_BUTTON_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_BUTTON_PRESSED_DURATION_MS = 60;

export type ButtonClassNamePatch = Partial<Record<ButtonElementName, string>>;

export function join(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeButtonScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

function collectElementClasses(
  element: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = DEFAULT_BUTTON_EMPHASIS,
  intent: ButtonIntent | undefined = DEFAULT_BUTTON_INTENT
): string {
  if (!element) return '';

  const base = element.d ?? '';
  const colorByIntent = element.c as Record<ButtonIntent, ColorClasses> | undefined;
  const colorBuckets = colorByIntent?.[intent];

  if (!colorBuckets) return base;

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  const colorBucketMap = colorBuckets as Record<string, string | undefined>;
  const color = bucket
    ? (colorBucketMap[bucket] ?? '')
    : !emphasis
      ? (colorBuckets.hh ??
        colorBuckets.h ??
        colorBuckets.m ??
        colorBuckets.l ??
        colorBuckets.ll ??
        '')
      : '';

  return join(base, color) ?? '';
}

export function resolveButtonEffectBucketClassName(
  bucket: EffectClassBucketJSON | undefined,
  scaleKey: string
): string {
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;

  return join(bucket.all, bucket[scaleKey]) ?? '';
}

function resolveButtonStatefulEffectClassName(bucket: EffectClassBucketJSON | undefined): string {
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;

  return bucket.all ?? '';
}

export function resolveButtonClassNames({
  e1,
  e2,
  e3,
  classNames,
  status,
  controlState,
  scale,
  shadow,
  radius,
  radiusEffect,
  emphasis,
  intent,
  globalRadius
}: {
  e1: ClassNameByElementJSON | undefined;
  e2: ClassNameByElementJSON | undefined;
  e3: ClassNameByElementJSON | undefined;
  classNames: NonNullable<ButtonProps['classNames']>;
  status: ButtonStatus | 'rest';
  controlState: boolean | undefined;
  scale: string | undefined;
  shadow: boolean;
  radius: RadiusMode | undefined;
  radiusEffect: boolean;
  emphasis: ComponentEmphasis | undefined;
  intent: ButtonIntent | undefined;
  globalRadius: RadiusMode | undefined;
}): NonNullable<HeadlessButtonProps['classNames']> {
  const resolvedIntent = intent ?? DEFAULT_BUTTON_INTENT;
  const resolvedEmphasis = emphasis ?? DEFAULT_BUTTON_EMPHASIS;
  const scaleKey = normalizeButtonScaleKey(scale ?? DEFAULT_BUTTON_SCALE);
  const radiusMode = radius ?? globalRadius ?? DEFAULT_BUTTON_RADIUS;

  const e1Effects = e1?.e;
  const shadowEffect = shadow ? resolveButtonStatefulEffectClassName(e1Effects?.h) : '';
  const radiusEffectClass = radiusEffect
    ? radiusMode === 'rounded'
      ? resolveButtonEffectBucketClassName(e1Effects?.rr, scaleKey)
      : radiusMode === 'pill'
        ? resolveButtonEffectBucketClassName(e1Effects?.rp, scaleKey)
        : ''
    : '';

  const e1RadiusAll =
    radiusMode === 'rounded'
      ? (e1?.rr?.all ?? '')
      : radiusMode === 'pill'
        ? (e1?.rp?.all ?? '')
        : (e1?.rs?.all ?? '');
  const e1RadiusScale =
    radiusMode === 'rounded'
      ? (e1?.rr?.[scaleKey] ?? '')
      : radiusMode === 'pill'
        ? (e1?.rp?.[scaleKey] ?? '')
        : (e1?.rs?.[scaleKey] ?? '');

  const projectedStatus =
    status !== 'rest'
      ? join(cn[status], status === 'focus' ? cn.focusVisible : undefined)
      : undefined;
  const projectedControlState = controlState ? cn.selected : undefined;
  const activation = join(projectedStatus, projectedControlState)
    ? join(projectedStatus, projectedControlState, cn.activator)
    : undefined;

  return {
    e1:
      join(
        collectElementClasses(e1, resolvedEmphasis, resolvedIntent),
        e1?.s?.all,
        classNames.e1,
        e1?.s?.[scaleKey],
        e1RadiusAll,
        e1RadiusScale,
        shadowEffect,
        radiusEffectClass,
        controlState ? resolveButtonEffectBucketClassName(e1?.l, scaleKey) : undefined,
        cn.interactive,
        cn.nativeInteraction,
        shadowEffect ? cn.shadow : undefined,
        activation,
        'k-btn',
        'k-foc',
        'k-trn'
      ) ?? '',
    e2:
      join(
        collectElementClasses(e2, resolvedEmphasis, resolvedIntent),
        e2?.s?.all,
        classNames.e2,
        e2?.s?.[scaleKey]
      ) ?? '',
    e3: join(collectElementClasses(e3, resolvedEmphasis, resolvedIntent), classNames.e3) ?? ''
  };
}

export function mergeButtonClassNames(
  baseClassNames: NonNullable<HeadlessButtonProps['classNames']>,
  ...classNamePatches: Array<ButtonClassNamePatch | null | undefined>
): NonNullable<HeadlessButtonProps['classNames']> {
  const patch = (elementName: ButtonElementName) =>
    classNamePatches.map((classNamePatch) => classNamePatch?.[elementName]);

  return {
    e1: join(baseClassNames.e1, ...patch('e1')) ?? '',
    e2: join(baseClassNames.e2, ...patch('e2')) ?? '',
    e3: join(baseClassNames.e3, ...patch('e3')) ?? ''
  };
}
