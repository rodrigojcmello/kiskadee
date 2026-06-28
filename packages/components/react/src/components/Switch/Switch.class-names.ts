import {
  type ActivationFeedbackProfileMode,
  type ClassNameByElementJSON,
  type ComponentEmphasis,
  stateActivator as cn,
  type EffectClassBucketJSON,
  type RadiusMode,
  type SwitchActivationMotion,
  type SwitchControlTextVisibility,
  type SwitchIntent,
  type SwitchMode,
  type SwitchVariant
} from '@kiskadee/core';
import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackBucketClass,
  resolveActivationFeedbackProfileAvailability
} from '../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  joinClassNames,
  normalizeScaleKey,
  resolveIntentClassName,
  resolveSchemaElementClassName,
  resolveEffectBucketClassName as resolveSharedEffectBucketClassName,
  resolveRadiusClassName as resolveSharedRadiusClassName,
  resolveScaleClassName as resolveSharedScaleClassName
} from '../../shared/class-resolution/classNames.ts';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchLabelPosition,
  SwitchVariantClassesMap
} from './Switch.types.ts';
import { SWITCH_THUMB_VISUAL_CLASS_NAME } from './SwitchGeometry.utils.ts';

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

export type SwitchThumbShrinkClassNames = Required<SwitchClassNames> & {
  x5: string;
};

export const join = joinClassNames;
export { normalizeScaleKey };

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
  return resolveIntentClassName(element, intent, emphasis, {
    fallbackIntent: 'neutral',
    useFirstIntentFallback: true,
    emphasisFallbackOrder: ['m', 'h', 'hh', 'l', 'll']
  });
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

export function resolveRadiusClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string,
  radiusMode: RadiusMode
): string {
  return resolveSharedRadiusClassName(element, scale, radiusMode);
}

function resolveEffectBucketClassName(
  bucket: EffectClassBucketJSON | undefined,
  scale: string
): string {
  return resolveSharedEffectBucketClassName(bucket, { scale });
}

export function hasSwitchActivationFeedbackEffect(
  element: ClassNameByElementJSON | undefined,
  profile?: ActivationFeedbackProfileMode
): boolean {
  return resolveSwitchActivationFeedbackEffectClassName(element, profile).length > 0;
}

export function resolveSwitchActivationFeedbackEffectClassName(
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

export function resolveSwitchThumbShrinkEffectClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  return resolveEffectBucketClassName(element?.e?.ts, scale);
}

export function resolveSwitchShadowEffectClassName(
  element: ClassNameByElementJSON | undefined,
  scale: string
): string {
  const shadowClass = resolveEffectBucketClassName(element?.e?.h, scale);
  return join(shadowClass, shadowClass ? cn.shadow : '') ?? '';
}

function resolveScaleClassName(element: ClassNameByElementJSON | undefined, scale: string): string {
  return resolveSharedScaleClassName(element, scale);
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

function resolveThumbCarrierClassName(options: {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
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
      `k-swt-e3-${branch}`,
      resolveScaleClassName(elements.e3, options.scale),
      resolveVisualClassName(elements.e3, options),
      resolveSwitchShadowEffectClassName(elements.e3, options.scale),
      resolveThumbRadiusClassName(elements.e3, options.scale, options.radius, branch),
      'k-trn',
      options.classNames.e3
    ) ?? ''
  );
}

function resolveThumbShrinkHostClassName(options: {
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
      resolveSwitchShadowEffectClassName(elements.e3, options.scale),
      resolveThumbRadiusClassName(elements.e3, options.scale, options.radius, branch),
      `k-swt-e3b-${branch}`,
      'k-trn',
      options.classNames.e3
    ) ?? ''
  );
}

function resolveThumbShrinkVisualClassName(options: {
  elements: SwitchClassesMap;
  structuralBranch: SwitchStructuralBranch;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis | undefined;
}): string {
  const elements = options.elements;

  return (
    join(
      SWITCH_THUMB_VISUAL_CLASS_NAME,
      resolveScaleClassName(elements.e3, options.scale),
      resolveVisualClassName(elements.e3, options),
      resolveSwitchThumbShrinkEffectClassName(elements.e3, options.scale),
      'k-trn'
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
        resolveSwitchShadowEffectClassName(elements.e2, options.scale),
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
      : (options.classNames.e5 ?? ''),
    e6: join(`k-swt-e6-${branch}`, elem(elements.e6, options), 'k-trn', options.classNames.e6) ?? ''
  };
}

export function resolveSwitchThumbShrinkClassNames(options: {
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
}): SwitchThumbShrinkClassNames {
  const base = resolveSwitchClassNames(options);

  return {
    ...base,
    e3: resolveThumbShrinkHostClassName(options),
    x5: resolveThumbShrinkVisualClassName(options)
  };
}
