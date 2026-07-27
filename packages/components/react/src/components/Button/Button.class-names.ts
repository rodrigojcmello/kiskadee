import {
  type ButtonIconLayout,
  type ButtonIconPlacement,
  type ButtonIntent,
  type ClassNameByElementJSON,
  type ComponentEmphasis,
  stateActivator as cn,
  type EffectClassBucketJSON,
  type RadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import {
  joinClassNames,
  mergeClassNamePatches,
  normalizeScaleKey,
  resolveEffectBucketClassName,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { ButtonElementName, ButtonProps, ButtonStatus } from './Button.types.ts';

export const DEFAULT_BUTTON_SCALE = 's:md:1';
export const DEFAULT_BUTTON_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_BUTTON_INTENT: ButtonIntent = 'neutral';
export const DEFAULT_BUTTON_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_BUTTON_SURFACE_CONTEXT: SurfaceContext = 'onSubtle';
export const DEFAULT_BUTTON_ICON_LAYOUT: ButtonIconLayout = 'inline';
export const DEFAULT_BUTTON_ICON_PLACEMENT: ButtonIconPlacement = 'leading';
export const DEFAULT_BUTTON_PRESSED_DURATION_MS = 60;

export type ButtonClassNamePatch = Partial<Record<ButtonElementName, string>>;

export const join = joinClassNames;
export const normalizeButtonScaleKey = normalizeScaleKey;

function collectElementClasses(
  element: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = DEFAULT_BUTTON_EMPHASIS,
  intent: ButtonIntent | undefined = DEFAULT_BUTTON_INTENT,
  surfaceContext: SurfaceContext = DEFAULT_BUTTON_SURFACE_CONTEXT
): string {
  return resolveSchemaElementClassName(element, {
    intent,
    emphasis,
    surfaceContext
  });
}

export function resolveButtonEffectBucketClassName(
  bucket: EffectClassBucketJSON | undefined,
  scaleKey: string
): string {
  return resolveEffectBucketClassName(bucket, { scale: scaleKey });
}

function resolveButtonStatefulEffectClassName(bucket: EffectClassBucketJSON | undefined): string {
  return resolveEffectBucketClassName(bucket);
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
  surfaceContext,
  iconLayout,
  iconPlacement,
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
  surfaceContext: SurfaceContext | undefined;
  iconLayout?: ButtonIconLayout;
  iconPlacement?: ButtonIconPlacement;
  globalRadius: RadiusMode | undefined;
}): NonNullable<HeadlessButtonProps['classNames']> {
  const resolvedIntent = intent ?? DEFAULT_BUTTON_INTENT;
  const resolvedEmphasis = emphasis ?? DEFAULT_BUTTON_EMPHASIS;
  const resolvedSurfaceContext = surfaceContext ?? DEFAULT_BUTTON_SURFACE_CONTEXT;
  const resolvedIconLayout = iconLayout ?? DEFAULT_BUTTON_ICON_LAYOUT;
  const resolvedIconPlacement = iconPlacement ?? DEFAULT_BUTTON_ICON_PLACEMENT;
  const scaleKey = normalizeButtonScaleKey(scale ?? DEFAULT_BUTTON_SCALE);
  const radiusMode = radius ?? globalRadius ?? DEFAULT_BUTTON_RADIUS;
  const e3HasSchemaScale = Boolean(e3?.s?.all || e3?.s?.[scaleKey]);

  const e1Effects = e1?.e;
  const shadowEffect = shadow ? resolveButtonStatefulEffectClassName(e1Effects?.h) : '';
  const radiusEffectClass = radiusEffect
    ? radiusMode === 'rounded'
      ? resolveButtonEffectBucketClassName(e1Effects?.rr, scaleKey)
      : radiusMode === 'pill'
        ? resolveButtonEffectBucketClassName(e1Effects?.rp, scaleKey)
        : ''
    : '';

  const e1RadiusClassName = resolveRadiusClassName(e1, scaleKey, radiusMode);

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
        collectElementClasses(e1, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        e1?.s?.all,
        classNames.e1,
        e1?.s?.[scaleKey],
        e1RadiusClassName,
        shadowEffect,
        radiusEffectClass,
        controlState ? resolveButtonEffectBucketClassName(e1?.l, scaleKey) : undefined,
        cn.interactive,
        cn.nativeInteraction,
        shadowEffect ? cn.shadow : undefined,
        activation,
        'k-btn',
        resolvedIconLayout === 'inline' ? 'k-btn-e1d' : 'k-btn-e1e',
        resolvedIconPlacement === 'leading' ? 'k-btn-e1f' : 'k-btn-e1g',
        'k-foc',
        'k-trn'
      ) ?? '',
    e2:
      join(
        collectElementClasses(e2, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        e2?.s?.all,
        classNames.e2,
        e2?.s?.[scaleKey],
        'k-btn-e2'
      ) ?? '',
    e3:
      join(
        collectElementClasses(e3, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        e3HasSchemaScale ? e3?.s?.all : e2?.s?.all,
        classNames.e3,
        e3HasSchemaScale ? e3?.s?.[scaleKey] : e2?.s?.[scaleKey],
        'k-btn-e3',
        e3HasSchemaScale ? undefined : 'k-btn-e3a'
      ) ?? ''
  };
}

export function mergeButtonClassNames(
  baseClassNames: NonNullable<HeadlessButtonProps['classNames']>,
  ...classNamePatches: Array<ButtonClassNamePatch | null | undefined>
): NonNullable<HeadlessButtonProps['classNames']> {
  return mergeClassNamePatches(['e1', 'e2', 'e3'], baseClassNames, ...classNamePatches);
}
