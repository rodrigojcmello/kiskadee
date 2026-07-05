import type {
  ActivationFeedbackProfileMode,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderEdgeMarkLabelAlignment,
  SliderIntent,
  SliderMode,
  SliderValueAnimation,
  SliderVariant
} from '@kiskadee/core';
import {
  joinClassNames,
  resolveSchemaElementClassName,
  resolveRadiusClassName as resolveSharedRadiusClassName
} from '../../shared/class-resolution/classNames.ts';
import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackBucketClass,
  resolveActivationFeedbackProfileAvailability
} from '../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import type {
  SliderClassesMap,
  SliderClassNames,
  SliderResolvedMarkLabelPlacement,
  SliderVariantClassesMap
} from './Slider.types.ts';

export const DEFAULT_SLIDER_SCALE: ElementSizeValue = 's:md:1';
export const DEFAULT_SLIDER_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_SLIDER_INTENT: SliderIntent = 'neutral';
export const DEFAULT_SLIDER_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_SLIDER_VARIANT: SliderVariant = 'standard';
export const DEFAULT_SLIDER_MODE: SliderMode = 'base';
export const DEFAULT_SLIDER_VALUE_DISPLAY = 'none';
export const DEFAULT_SLIDER_VALUE_ANIMATION: SliderValueAnimation = 'none';
export const DEFAULT_SLIDER_MARKS = 'none';
export const DEFAULT_SLIDER_EDGE_MARKS = 'include';
export const DEFAULT_SLIDER_MARK_LABEL_PLACEMENT = 'auto';
export const DEFAULT_SLIDER_EDGE_MARK_LABEL_PLACEMENT = 'auto';
export const DEFAULT_SLIDER_EDGE_MARK_LABEL_ALIGNMENT: SliderEdgeMarkLabelAlignment = 'auto';

type SliderStructuralBranch = 'a';

export const join = joinClassNames;

export function resolveVariantElements(
  map: SliderVariantClassesMap | undefined,
  variant: SliderVariant,
  mode: SliderMode
): SliderClassesMap {
  if (!map) return {};
  return map[variant]?.[mode] ?? {};
}

export function resolveSliderActivationFeedbackEffectClassName(
  element: ClassNameByElementJSON | undefined,
  profile?: ActivationFeedbackProfileMode
): string {
  const effects = element?.e as ActivationFeedbackEffectBuckets | undefined;
  const resolvedProfile =
    profile ?? resolveActivationFeedbackProfileAvailability({ e: effects })[0] ?? null;

  return [effects?.af, resolveActivationFeedbackBucketClass(resolvedProfile, effects)]
    .filter(Boolean)
    .join(' ');
}

function elem(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: ElementSizeValue;
    intent: SliderIntent;
    emphasis: ComponentEmphasis | undefined;
  }
): string {
  if (!element) return '';

  return resolveSchemaElementClassName(element, {
    scale: options.scale,
    intent: options.intent,
    emphasis: options.emphasis,
    intentOptions: {
      fallbackIntent: 'neutral',
      useFirstIntentFallback: true,
      emphasisFallbackOrder: ['m', 'h', 'hh', 'l', 'll']
    }
  });
}

function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: ElementSizeValue,
  radiusMode: RadiusMode
): string {
  return resolveSharedRadiusClassName(element, scale, radiusMode);
}

export function resolveSliderClassNames(options: {
  elements: SliderClassesMap;
  classNames: SliderClassNames;
  structuralBranch: SliderStructuralBranch;
  scale: ElementSizeValue;
  intent: SliderIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  hasLabel: boolean;
  hasValueSummary: boolean;
  hasHelperText: boolean;
  markLabelPlacement: SliderResolvedMarkLabelPlacement;
}): Required<SliderClassNames> {
  const elements = options.elements;
  const branch = options.structuralBranch;

  return {
    e1:
      join(
        'k-sld',
        `k-sld-${branch}`,
        `k-sld-e1-${branch}`,
        elem(elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2: options.hasLabel
      ? (join(`k-sld-e2-${branch}`, elem(elements.e2, options), 'k-trn', options.classNames.e2) ??
        '')
      : (options.classNames.e2 ?? ''),
    e3: options.hasValueSummary
      ? (join(`k-sld-e3-${branch}`, elem(elements.e3, options), 'k-trn', options.classNames.e3) ??
        '')
      : (options.classNames.e3 ?? ''),
    e4: join(`k-sld-e4-${branch}`, elem(elements.e4, options), options.classNames.e4) ?? '',
    e5: join(`k-sld-e5-${branch}`, elem(elements.e5, options), options.classNames.e5) ?? '',
    e6:
      join(`k-sld-e6-${branch}`, elem(elements.e6, options), 'k-trn', options.classNames.e6) ?? '',
    e7:
      join(`k-sld-e7-${branch}`, elem(elements.e7, options), 'k-trn', options.classNames.e7) ?? '',
    e8:
      join(
        `k-sld-e8-${branch}`,
        elem(elements.e8, options),
        resolveRadiusClassName(elements.e8, options.scale, options.radius),
        'k-trn',
        options.classNames.e8
      ) ?? '',
    e9:
      join(
        `k-sld-e9-${branch}`,
        elem(elements.e9, options),
        resolveRadiusClassName(elements.e9, options.scale, options.radius),
        'k-trn',
        options.classNames.e9
      ) ?? '',
    e10:
      join(
        `k-sld-e10-${branch}`,
        elem(elements.e10, options),
        resolveRadiusClassName(elements.e10, options.scale, options.radius),
        'k-trn',
        options.classNames.e10
      ) ?? '',
    e11:
      join(
        `k-sld-e11-${branch}`,
        elem(elements.e11, options),
        resolveRadiusClassName(elements.e11, options.scale, options.radius),
        'k-trn',
        options.classNames.e11
      ) ?? '',
    e12:
      join(
        `k-sld-e12-${branch}`,
        elem(elements.e12, options),
        resolveRadiusClassName(elements.e12, options.scale, options.radius),
        'k-trn',
        options.classNames.e12
      ) ?? '',
    e13:
      join(
        `k-sld-e13-${branch}`,
        elem(elements.e13, options),
        resolveRadiusClassName(elements.e13, options.scale, options.radius),
        'k-trn',
        options.classNames.e13
      ) ?? '',
    e14:
      join(
        `k-sld-e14-${branch}`,
        options.markLabelPlacement === 'above' ? `k-sld-e14a-${branch}` : `k-sld-e14b-${branch}`,
        elem(elements.e14, options),
        'k-trn',
        options.classNames.e14
      ) ?? '',
    e15: options.hasHelperText
      ? (join(
          `k-sld-e15-${branch}`,
          elem(elements.e15, options),
          'k-trn',
          options.classNames.e15
        ) ?? '')
      : (options.classNames.e15 ?? '')
  };
}
