import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode,
  type TextFieldFocusRingColorSource,
  type TextFieldIntent,
  type TextFieldLabelOffsetStrategy,
  type TextFieldMode,
  type TextFieldVariant
} from '@kiskadee/core';
import type { TextFieldStateProjectionOptions } from '@kiskadee/react-headless';
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

export const TEXT_FIELD_STATE_PROJECTION = {
  target: 'e1',
  activatorClassName: cn.activator,
  interactiveClassName: cn.interactive,
  projections: {
    focused: {
      className: cn.focus
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
export function join(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

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
  if (!element?.c) return '';

  const byIntent = element.c as Record<TextFieldIntent, ColorClasses>;
  const chosen = byIntent[intent] ?? byIntent.neutral ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  if (!bucket) return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';

  const buckets = chosen as Record<string, string | undefined>;
  return buckets[bucket] ?? chosen.m ?? chosen.h ?? chosen.l ?? chosen.ll ?? '';
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

export function resolveTextFieldClassNames(options: {
  structural: TextFieldStructuralDescriptor;
  elements: TextFieldClassesMap;
  classNames: TextFieldClassNames;
  scale: string;
  intent: TextFieldIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  labelOffsetStrategy: TextFieldLabelOffsetStrategy;
  focusRingColorSource: TextFieldFocusRingColorSource;
}): Required<TextFieldClassNames> {
  const elements = options.elements;
  const letter = options.structural.letter;

  return {
    e1:
      join(
        'k-txf',
        `k-txf-${letter}`,
        `k-txf-e1-${letter}`,
        options.labelOffsetStrategy === 'radius'
          ? resolveRadiusClassName(elements.e3, options.scale, options.radius)
          : '',
        elem(elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      join(
        `k-txf-e2-${letter}`,
        options.labelOffsetStrategy === 'radius'
          ? 'k-txf-e2a'
          : options.labelOffsetStrategy === 'input-start'
            ? 'k-txf-e2b'
            : options.labelOffsetStrategy === 'none'
              ? 'k-txf-e2c'
              : '',
        elem(elements.e2, options),
        'k-trn',
        options.classNames.e2
      ) ?? '',
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
      : ''
  };
}
