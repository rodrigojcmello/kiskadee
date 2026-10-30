import {
  type ButtonIconLayout,
  type ButtonIconPlacement,
  type ButtonIconSurfaceCorners,
  type ButtonIconTreatment,
  type ButtonIndicatorPlacement,
  type ButtonIntent,
  type ClassNameByElementJSON,
  type ComponentEmphasis,
  stateActivator as cn,
  type EffectClassBucketJSON,
  type RadiusMode,
  resolveButtonStackedRadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import {
  joinClassNames,
  mergeClassNamePatches,
  normalizeScaleKey,
  resolveEffectBucketClassName,
  resolveIntentClassName,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import { resolveStructuralUtilityProjectionClassName } from '../../shared/class-resolution/structuralUtilityProjection.ts';
import { resolveButtonPaintElement } from './Button.selection.ts';
import type {
  ButtonClassesMap,
  ButtonElementName,
  ButtonGroupProps,
  ButtonProps,
  ButtonSelectionRestClassesMap,
  ButtonStatus
} from './Button.types.ts';

export const DEFAULT_BUTTON_SCALE = 's:md:1';
export const DEFAULT_BUTTON_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_BUTTON_INTENT: ButtonIntent = 'neutral';
export const DEFAULT_BUTTON_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_BUTTON_SURFACE_CONTEXT: SurfaceContext = 'onSubtle';
export const DEFAULT_BUTTON_ICON_LAYOUT: ButtonIconLayout = 'inline';
export const DEFAULT_BUTTON_ICON_PLACEMENT: ButtonIconPlacement = 'leading';
export const DEFAULT_BUTTON_ICON_TREATMENT: ButtonIconTreatment = 'plain';
export const DEFAULT_BUTTON_ICON_SURFACE_CORNERS: ButtonIconSurfaceCorners = 'edge';
export const DEFAULT_BUTTON_INDICATOR_PLACEMENT: ButtonIndicatorPlacement = 'inside';
export const DEFAULT_BUTTON_PRESSED_DURATION_MS = 60;

export type ButtonClassNamePatch = Partial<Record<ButtonElementName, string>>;
export type ButtonResolvedClassNames = NonNullable<HeadlessButtonProps['classNames']> & {
  e4?: string;
  e6?: string;
  e7?: string;
};

export const join = joinClassNames;
export const normalizeButtonScaleKey = normalizeScaleKey;

/** Resolves only a complete authored indicator at the effective geometry and palette coordinate. */
export function resolveButtonIndicatorClassName({
  element,
  sizesByRadius,
  scale,
  radius,
  placement,
  intent,
  emphasis,
  surfaceContext
}: {
  element: ClassNameByElementJSON | undefined;
  sizesByRadius: Readonly<Partial<Record<RadiusMode, readonly string[]>>> | undefined;
  scale: string;
  radius: RadiusMode;
  placement: ButtonIndicatorPlacement;
  intent: ButtonIntent;
  emphasis: ComponentEmphasis;
  surfaceContext: SurfaceContext;
}): string | undefined {
  const scaleKey = normalizeButtonScaleKey(scale);
  if (!sizesByRadius?.[radius]?.includes(scaleKey)) return undefined;
  if (!element?.s?.all && !element?.s?.[scaleKey]) return undefined;
  const radiusClassName = resolveRadiusClassName(element, scaleKey, radius);
  const paintClassName = resolveIntentClassName(element, intent, emphasis, {
    surfaceContext
  });
  if (!radiusClassName || !paintClassName) return undefined;
  return join(
    element.d,
    element.s?.all,
    element.s?.[scaleKey],
    radiusClassName,
    paintClassName,
    'k-btn-e11',
    placement === 'outside' ? 'k-btn-e11a' : undefined
  );
}

/** Checks all stacked roles and the requested radius at the effective size. */
export function supportsButtonStackedLayout(
  elements: Pick<ButtonClassesMap, 'e8' | 'e9' | 'e10'>,
  scale: string = DEFAULT_BUTTON_SCALE,
  radius: RadiusMode = DEFAULT_BUTTON_RADIUS
): boolean {
  const scaleKey = normalizeButtonScaleKey(scale);
  return (
    radius !== 'pill' &&
    Boolean(resolveRadiusClassName(elements.e8, scaleKey, radius)) &&
    [elements.e8, elements.e9, elements.e10].every((element) =>
      Boolean(element?.s?.all || element?.s?.[scaleKey])
    )
  );
}

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

export function resolveButtonDividerClassName({
  e6,
  scale,
  emphasis,
  intent,
  surfaceContext
}: {
  e6: ClassNameByElementJSON | undefined;
  scale: string;
  emphasis: ComponentEmphasis | undefined;
  intent: ButtonIntent | undefined;
  surfaceContext: SurfaceContext | undefined;
}): string {
  if (!e6) return '';

  const scaleKey = normalizeButtonScaleKey(scale);
  const resolvedSurfaceContext = surfaceContext ?? DEFAULT_BUTTON_SURFACE_CONTEXT;
  const paintClassName =
    resolveIntentClassName(
      e6,
      intent ?? DEFAULT_BUTTON_INTENT,
      emphasis ?? DEFAULT_BUTTON_EMPHASIS,
      { surfaceContext: resolvedSurfaceContext }
    ) ||
    resolveIntentClassName(e6, DEFAULT_BUTTON_INTENT, DEFAULT_BUTTON_EMPHASIS, {
      surfaceContext: resolvedSurfaceContext
    });
  if (!paintClassName) return '';

  return join(e6.d, paintClassName, e6.s?.all, e6.s?.[scaleKey], 'k-btn-e6') ?? '';
}

export function resolveButtonBadgeRelationClassName({
  e7,
  scale
}: {
  e7: ClassNameByElementJSON | undefined;
  scale: string;
}): string {
  if (!e7) return '';

  const scaleKey = normalizeButtonScaleKey(scale);
  return join(e7.d, e7.s?.all, e7.s?.[scaleKey], 'k-btn-e7') ?? '';
}

export function resolveButtonClassNames({
  e1,
  e2,
  e3,
  e4,
  e5,
  e6,
  e7,
  e8,
  e9,
  e10,
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
  iconSurfaceCorners,
  iconTreatment,
  globalRadius,
  selectionRest
}: {
  e1: ClassNameByElementJSON | undefined;
  e2: ClassNameByElementJSON | undefined;
  e3: ClassNameByElementJSON | undefined;
  e4?: ClassNameByElementJSON;
  e5?: ClassNameByElementJSON;
  e6?: ClassNameByElementJSON;
  e7?: ClassNameByElementJSON;
  e8?: ClassNameByElementJSON;
  e9?: ClassNameByElementJSON;
  e10?: ClassNameByElementJSON;
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
  iconSurfaceCorners?: ButtonIconSurfaceCorners;
  iconTreatment?: ButtonIconTreatment;
  globalRadius: RadiusMode | undefined;
  selectionRest?: ButtonSelectionRestClassesMap;
}): ButtonResolvedClassNames {
  const usesProjection = selectionRest !== undefined;
  const paintE1 = resolveButtonPaintElement(e1, selectionRest?.e1, usesProjection);
  e2 = resolveButtonPaintElement(e2, selectionRest?.e2, usesProjection);
  e3 = resolveButtonPaintElement(e3, selectionRest?.e3, usesProjection);
  e4 = resolveButtonPaintElement(e4, selectionRest?.e4, usesProjection);
  e5 = resolveButtonPaintElement(e5, selectionRest?.e5, usesProjection);
  const resolvedIntent = intent ?? DEFAULT_BUTTON_INTENT;
  const resolvedEmphasis = emphasis ?? DEFAULT_BUTTON_EMPHASIS;
  const resolvedSurfaceContext = surfaceContext ?? DEFAULT_BUTTON_SURFACE_CONTEXT;
  const resolvedIconTreatment = iconTreatment ?? DEFAULT_BUTTON_ICON_TREATMENT;
  const resolvedIconSurfaceCorners = iconSurfaceCorners ?? DEFAULT_BUTTON_ICON_SURFACE_CORNERS;
  const hasSurfacedIconTreatment = resolvedIconTreatment !== 'plain';
  const scaleKey = normalizeButtonScaleKey(scale ?? DEFAULT_BUTTON_SCALE);
  const requestedRadiusMode = radius ?? globalRadius ?? DEFAULT_BUTTON_RADIUS;
  const stackedRadiusMode = resolveButtonStackedRadiusMode(requestedRadiusMode);
  const isStacked =
    iconLayout === 'stacked' &&
    !hasSurfacedIconTreatment &&
    supportsButtonStackedLayout({ e8, e9, e10 }, scaleKey, stackedRadiusMode);
  const radiusMode = isStacked ? stackedRadiusMode : requestedRadiusMode;
  const resolvedIconLayout = hasSurfacedIconTreatment
    ? 'edge'
    : iconLayout === 'stacked' && !isStacked
      ? DEFAULT_BUTTON_ICON_LAYOUT
      : (iconLayout ?? DEFAULT_BUTTON_ICON_LAYOUT);
  const resolvedIconPlacement = iconPlacement ?? DEFAULT_BUTTON_ICON_PLACEMENT;
  const rootGeometry = isStacked ? e8 : e1;
  const labelGeometry = isStacked ? e9 : e2;
  const iconGeometry = isStacked ? e10 : e3;
  const e3HasSchemaScale = Boolean(e3?.s?.all || e3?.s?.[scaleKey]);
  const iconLineHeight =
    e3HasSchemaScale && !hasSurfacedIconTreatment && !isStacked
      ? resolveStructuralUtilityProjectionClassName(e2, 'lh', scaleKey)
      : '';
  const e4HasSchemaScale = Boolean(e4?.s?.all || e4?.s?.[scaleKey]);
  const isTerminalInteractionStatus = status === 'pending' || status === 'disabled';

  const e1Effects = paintE1?.e;
  const shadowEffect = shadow ? resolveButtonStatefulEffectClassName(e1Effects?.h) : '';
  const radiusEffectClass = radiusEffect
    ? radiusMode === 'rounded'
      ? resolveButtonEffectBucketClassName(e1Effects?.rr, scaleKey)
      : radiusMode === 'pill'
        ? resolveButtonEffectBucketClassName(e1Effects?.rp, scaleKey)
        : ''
    : '';

  const e1RadiusClassName = resolveRadiusClassName(rootGeometry, scaleKey, radiusMode);

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
        collectElementClasses(paintE1, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        rootGeometry?.s?.all,
        classNames.e1,
        rootGeometry?.s?.[scaleKey],
        e1RadiusClassName,
        shadowEffect,
        radiusEffectClass,
        controlState ? resolveButtonEffectBucketClassName(paintE1?.l, scaleKey) : undefined,
        cn.interactive,
        isTerminalInteractionStatus ? undefined : cn.nativeInteraction,
        shadowEffect ? cn.shadow : undefined,
        activation,
        'k-btn',
        isStacked ? 'k-btn-e8' : resolvedIconLayout === 'inline' ? 'k-btn-e1d' : 'k-btn-e1e',
        isStacked ? undefined : resolvedIconPlacement === 'leading' ? 'k-btn-e1f' : 'k-btn-e1g',
        hasSurfacedIconTreatment ? 'k-btn-e1h' : undefined,
        hasSurfacedIconTreatment && resolvedIconSurfaceCorners === 'edge' ? 'k-btn-e1i' : undefined,
        'k-foc',
        'k-trn'
      ) ?? '',
    e2:
      join(
        isStacked
          ? join(
              labelGeometry?.d,
              resolveIntentClassName(e2, resolvedIntent, resolvedEmphasis, {
                surfaceContext: resolvedSurfaceContext
              })
            )
          : collectElementClasses(e2, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        labelGeometry?.s?.all,
        classNames.e2,
        labelGeometry?.s?.[scaleKey],
        'k-btn-e2',
        isStacked ? 'k-btn-e9' : undefined
      ) ?? '',
    e3:
      join(
        isStacked
          ? resolveIntentClassName(e3?.c ? e3 : e2, resolvedIntent, resolvedEmphasis, {
              surfaceContext: resolvedSurfaceContext
            })
          : hasSurfacedIconTreatment
            ? e3?.d
            : e3?.c
              ? collectElementClasses(e3, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext)
              : collectElementClasses(e2, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        isStacked || e3HasSchemaScale ? iconGeometry?.s?.all : undefined,
        classNames.e3,
        isStacked || e3HasSchemaScale ? iconGeometry?.s?.[scaleKey] : undefined,
        iconLineHeight,
        iconLineHeight ? 'k-btn-e3a' : undefined,
        'k-btn-e3',
        isStacked ? 'k-btn-e10' : undefined
      ) ?? '',
    e4: hasSurfacedIconTreatment
      ? (join(
          collectElementClasses(e4, 'medium', 'neutral', resolvedSurfaceContext),
          e4HasSchemaScale ? e4?.s?.all : undefined,
          e4HasSchemaScale ? e4?.s?.[scaleKey] : undefined,
          'k-btn-e4'
        ) ?? '')
      : undefined,
    e5:
      join(
        e5?.c
          ? collectElementClasses(e5, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext)
          : collectElementClasses(e2, resolvedEmphasis, resolvedIntent, resolvedSurfaceContext),
        e5?.s?.all,
        classNames.e5,
        e5?.s?.[scaleKey],
        'k-btn-e5'
      ) ?? '',
    e6:
      resolveButtonDividerClassName({
        e6,
        scale: scaleKey,
        emphasis: resolvedEmphasis,
        intent: resolvedIntent,
        surfaceContext: resolvedSurfaceContext
      }) || undefined,
    e7: resolveButtonBadgeRelationClassName({ e7, scale: scaleKey }) || undefined
  };
}

export function resolveButtonGroupClassName({
  e1,
  className,
  scale,
  shadow,
  radius,
  globalRadius
}: {
  e1: ClassNameByElementJSON | undefined;
  className: ButtonGroupProps['className'];
  scale: string;
  shadow: boolean;
  radius: RadiusMode;
  globalRadius: RadiusMode | undefined;
}): { className: string; hasShadow: boolean } {
  const scaleKey = normalizeButtonScaleKey(scale);
  const radiusMode = radius ?? globalRadius ?? DEFAULT_BUTTON_RADIUS;
  const shadowEffect = shadow ? resolveButtonStatefulEffectClassName(e1?.e?.h) : '';

  return {
    className:
      join(
        className,
        shadowEffect ? resolveRadiusClassName(e1, scaleKey, radiusMode) : undefined,
        shadowEffect,
        shadowEffect ? cn.shadow : undefined,
        'k-btn-x3'
      ) ?? 'k-btn-x3',
    hasShadow: Boolean(shadowEffect)
  };
}

/** Resolves a complete published Rest perimeter without borrowing another palette coordinate. */
export function resolveButtonGroupFrameClassName({
  element,
  scale,
  radius,
  globalRadius,
  intent = DEFAULT_BUTTON_INTENT,
  emphasis = DEFAULT_BUTTON_EMPHASIS,
  surfaceContext = DEFAULT_BUTTON_SURFACE_CONTEXT
}: {
  element: ClassNameByElementJSON | undefined;
  scale: string;
  radius: RadiusMode | undefined;
  globalRadius?: RadiusMode;
  intent?: ButtonIntent;
  emphasis?: ComponentEmphasis;
  surfaceContext?: SurfaceContext;
}): string | undefined {
  if (!element?.d || (!element.s?.all && !element.s?.[normalizeButtonScaleKey(scale)])) {
    return undefined;
  }
  const scaleKey = normalizeButtonScaleKey(scale);
  const radiusClassName = resolveRadiusClassName(
    element,
    scaleKey,
    radius ?? globalRadius ?? DEFAULT_BUTTON_RADIUS
  );
  const paintClassName = resolveIntentClassName(element, intent, emphasis, { surfaceContext });
  if (!radiusClassName || !paintClassName) return undefined;
  return join(element.d, element.s?.all, element.s?.[scaleKey], radiusClassName, paintClassName);
}

export function mergeButtonClassNames(
  baseClassNames: ButtonResolvedClassNames,
  ...classNamePatches: Array<ButtonClassNamePatch | null | undefined>
): ButtonResolvedClassNames {
  return {
    ...mergeClassNamePatches(['e1', 'e2', 'e3', 'e5'], baseClassNames, ...classNamePatches),
    e4: baseClassNames.e4,
    e6: baseClassNames.e6,
    e7: baseClassNames.e7
  };
}
