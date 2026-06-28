import {
  type ClassNameByElementJSON,
  type ComponentEmphasis,
  stateActivator as cn,
  type RadiusMode,
  type TextFieldFocusRingColorSource,
  type TextFieldIntent,
  type TextFieldLabelOffsetStrategy,
  type TextFieldLabelPlacement,
  type TextFieldMode,
  type TextFieldVariant
} from '@kiskadee/core';
import type { TextFieldStateProjectionOptions } from '@kiskadee/react-headless';
import {
  joinClassNames,
  normalizeScaleKey,
  resolveIntentClassName,
  resolveSchemaElementClassName,
  resolveRadiusClassName as resolveSharedRadiusClassName
} from '../../shared/class-resolution/classNames.ts';
import type { TextFieldStructuralDescriptor } from './TextField.structural.ts';
import type {
  TextFieldClassesMap,
  TextFieldClassNames,
  TextFieldVariantClassesMap
} from './TextField.types';

export const DEFAULT_TEXT_FIELD_SCALE = 's:md:1';
export const DEFAULT_TEXT_FIELD_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_TEXT_FIELD_INTENT: TextFieldIntent = 'neutral';
export const DEFAULT_TEXT_FIELD_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_TEXT_FIELD_FOCUS_RING_COLOR_SOURCE: TextFieldFocusRingColorSource = 'global';
export const DEFAULT_TEXT_FIELD_LABEL_PLACEMENT: TextFieldLabelPlacement = 'top';

export const TEXT_FIELD_STATE_PROJECTION = {
  target: 'e1',
  activatorClassName: cn.activator,
  interactiveClassName: `${cn.interactive} ${cn.nativeInteraction}`,
  projections: {
    focused: {
      className: cn.focus
    },
    focusVisible: {
      className: cn.focusVisible
    },
    filled: {
      className: cn.filled
    },
    disabled: {
      className: cn.disabled
    },
    readOnly: {
      className: cn.readOnly
    }
  }
} satisfies TextFieldStateProjectionOptions;

/**
 * Joins optional class fragments into one trimmed className string.
 */
export const join = joinClassNames;
export { normalizeScaleKey };

export function resolveVariantElements(
  map: TextFieldVariantClassesMap | undefined,
  variant: TextFieldVariant,
  mode: TextFieldMode
): TextFieldClassesMap {
  if (!map) return {};
  return map[variant]?.[mode] ?? {};
}

export function resolveIntentClasses(
  element: ClassNameByElementJSON | undefined,
  intent: TextFieldIntent,
  emphasis: ComponentEmphasis | undefined
): string {
  return resolveIntentClassName(element, intent, emphasis, {
    fallbackIntent: 'neutral',
    useFirstIntentFallback: true,
    emphasisFallbackOrder: ['m', 'h', 'hh', 'l', 'll']
  });
}

/**
 * Resolves the schema-driven classes for one TextField element.
 */
export function elem(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: TextFieldIntent;
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

export function resolveTextFieldClassNames(options: {
  structural: TextFieldStructuralDescriptor;
  elements: TextFieldClassesMap;
  classNames: TextFieldClassNames;
  scale: string;
  intent: TextFieldIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  labelOffsetStrategy: TextFieldLabelOffsetStrategy;
  labelPlacement: TextFieldLabelPlacement;
  focusRingColorSource: TextFieldFocusRingColorSource;
}): Required<TextFieldClassNames> {
  const elements = options.elements;
  const letter = options.structural.letter;
  const usesInlineLabel = options.labelPlacement === 'inline';
  const effectiveLabelOffsetStrategy = usesInlineLabel ? 'none' : options.labelOffsetStrategy;
  const topLabelClassName = join(
    `k-txf-e2-${letter}`,
    effectiveLabelOffsetStrategy === 'radius'
      ? 'k-txf-e2a'
      : effectiveLabelOffsetStrategy === 'input-start'
        ? 'k-txf-e2b'
        : effectiveLabelOffsetStrategy === 'none'
          ? 'k-txf-e2c'
          : '',
    elem(elements.e2, options),
    'k-trn',
    options.classNames.e2
  );
  const inlineLabelClassName = join(
    `k-txf-e7-${letter}`,
    elem(elements.e7 ?? elements.e2, options),
    'k-trn',
    options.classNames.e2,
    options.classNames.e7
  );

  return {
    e1:
      join(
        'k-txf',
        `k-txf-${letter}`,
        `k-txf-e1-${letter}`,
        usesInlineLabel ? `k-txf-e1a-${letter}` : '',
        effectiveLabelOffsetStrategy === 'radius'
          ? resolveRadiusClassName(elements.e3, options.scale, options.radius)
          : '',
        elem(elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2: (usesInlineLabel ? inlineLabelClassName : topLabelClassName) ?? '',
    e3:
      join(
        `k-txf-e3-${letter}`,
        elem(elements.e3, options),
        resolveRadiusClassName(elements.e3, options.scale, options.radius),
        options.focusRingColorSource === 'component' ? 'k-txf-e3a' : '',
        'k-trn',
        options.classNames.e3
      ) ?? '',
    e4:
      join(`k-txf-e4-${letter}`, elem(elements.e4, options), 'k-trn', options.classNames.e4) ?? '',
    e5:
      join(`k-txf-e5-${letter}`, elem(elements.e5, options), 'k-trn', options.classNames.e5) ?? '',
    e6: elements.e6
      ? (join(
          `k-txf-e6-${letter}`,
          elem(elements.e6, options),
          options.structural.variant === 'standard' &&
            options.structural.mode === 'underline' &&
            options.focusRingColorSource === 'component'
            ? 'k-txf-e6a'
            : '',
          'k-trn',
          options.classNames.e6
        ) ?? '')
      : '',
    e7: usesInlineLabel ? (inlineLabelClassName ?? '') : ''
  };
}
