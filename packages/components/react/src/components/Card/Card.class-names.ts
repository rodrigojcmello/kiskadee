import {
  type CardIntent,
  type CardRadiusMode,
  type ClassNameByElementJSON,
  type ComponentEmphasis,
  stateActivator as cn,
  componentEmphasisBuckets,
  type EffectClassBucketJSON,
  type ElementSizeValue,
  type RadiusMode,
  type SurfaceContext,
  surfaceContextBuckets
} from '@kiskadee/core';
import type { CardClassNames as HeadlessCardClassNames } from '@kiskadee/react-headless';
import {
  joinClassNames,
  normalizeScaleKey,
  resolveEffectBucketClassName,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type {
  CardActionVisualProps,
  CardProps,
  CardStatus,
  CardVisualProps
} from './Card.types.ts';

export const DEFAULT_CARD_SCALE = 's:md:1';
export const DEFAULT_CARD_RADIUS: CardRadiusMode = 'rounded';
export const DEFAULT_CARD_INTENT: CardIntent = 'neutral';
export const DEFAULT_CARD_EMPHASIS: ComponentEmphasis = 'medium';

export type ResolvedCardClassNames = {
  classNames: NonNullable<HeadlessCardClassNames>;
};

const CARD_HIDE_BORDER_WITH_SHADOW_CLASS = 'k-crd-b';

export const join = joinClassNames;
export const normalizeCardScaleKey = normalizeScaleKey;

function resolveCardShadowClassName(
  bucket: EffectClassBucketJSON | undefined,
  shadow: CardVisualProps['shadow'] | CardActionVisualProps['shadow']
): string {
  if (!bucket || !shadow) return '';
  if (shadow === true) return resolveEffectBucketClassName(bucket);

  return resolveEffectBucketClassName(bucket, {
    scale: shadow as ElementSizeValue,
    includeAll: false
  });
}

function collectElementClasses(
  element: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = DEFAULT_CARD_EMPHASIS,
  intent: CardIntent | undefined = DEFAULT_CARD_INTENT,
  surfaceContext: SurfaceContext = 'onSubtle'
): string {
  return resolveSchemaElementClassName(element, {
    intent,
    emphasis,
    surfaceContext
  });
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
  shadow,
  preserveBorderWithShadow,
  border,
  emphasis,
  intent,
  surfaceContext,
  globalRadius,
  action
}: {
  e1: ClassNameByElementJSON | undefined;
  className: string | undefined;
  classNames: NonNullable<CardProps['classNames']>;
  status: CardStatus | 'rest';
  radius: CardVisualProps['radius'];
  shadow: CardVisualProps['shadow'] | CardActionVisualProps['shadow'];
  preserveBorderWithShadow?: CardActionVisualProps['preserveBorderWithShadow'];
  border?: boolean;
  emphasis: CardVisualProps['emphasis'];
  intent: CardVisualProps['intent'];
  surfaceContext: SurfaceContext;
  globalRadius: RadiusMode | undefined;
  action: boolean;
}): ResolvedCardClassNames {
  const resolvedIntent = intent ?? DEFAULT_CARD_INTENT;
  const resolvedEmphasis = emphasis ?? DEFAULT_CARD_EMPHASIS;
  const scaleKey = normalizeCardScaleKey(DEFAULT_CARD_SCALE);
  const radiusMode = resolveCardRadiusMode(radius, globalRadius);

  const e1RadiusClassName = resolveRadiusClassName(e1, DEFAULT_CARD_SCALE, radiusMode);
  const shadowEffect = resolveCardShadowClassName(e1?.e?.h, shadow);
  const borderRecipe =
    e1?.b?.[surfaceContextBuckets[surfaceContext]]?.[resolvedIntent]?.[
      componentEmphasisBuckets[resolvedEmphasis]
    ];
  const borderEnabled = action ? borderRecipe?.default : (border ?? borderRecipe?.default);
  const borderClass = borderRecipe
    ? borderEnabled
      ? borderRecipe.on
      : borderRecipe.off
    : undefined;
  const hideBorderWithShadow = action
    ? shadowEffect.length > 0 && preserveBorderWithShadow === false
    : border === false;

  const projectedStatus =
    status !== 'rest'
      ? join(cn[status], status === 'focus' ? cn.focusVisible : undefined)
      : undefined;
  const activation = projectedStatus ? join(projectedStatus, cn.activator) : undefined;

  return {
    classNames: {
      e1:
        join(
          collectElementClasses(e1, resolvedEmphasis, resolvedIntent, surfaceContext),
          borderClass,
          e1?.s?.all,
          e1?.s?.[scaleKey],
          e1RadiusClassName,
          shadowEffect,
          classNames.e1,
          className,
          activation,
          shadowEffect ? cn.shadow : undefined,
          'k-crd',
          action ? 'k-crd-a' : undefined,
          hideBorderWithShadow ? CARD_HIDE_BORDER_WITH_SHADOW_CLASS : undefined,
          action ? 'k-foc' : undefined,
          'k-trn'
        ) ?? ''
    }
  };
}
