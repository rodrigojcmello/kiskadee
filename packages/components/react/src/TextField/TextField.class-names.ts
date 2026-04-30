import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode,
  type TextFieldIntent,
  type TextFieldMode,
  type TextFieldVariant
} from '@kiskadee/core';
import type { TextFieldStructuralDescriptor } from './TextField.structural';
import { getTextFieldSlot } from './TextField.structural';
import type {
  TextFieldClassesMap,
  TextFieldClassNames,
  TextFieldVariantClassesMap
} from './TextField.types';

export const DEFAULT_TEXT_FIELD_SCALE = 's:md:1';
export const DEFAULT_TEXT_FIELD_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_TEXT_FIELD_INTENT: TextFieldIntent = 'neutral';
export const DEFAULT_TEXT_FIELD_RADIUS: RadiusMode = 'rounded';

export function joinClassNames(
  ...parts: Array<string | undefined | false | null>
): string | undefined {
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

export function resolveElementClassName(
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
    joinClassNames(
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
  return joinClassNames(all, byScale) ?? '';
}

export function resolveStateActivatorClassName(options: {
  focused: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}): string {
  const state = options.disabled
    ? cn.disabled
    : options.readOnly
      ? cn.readOnly
      : options.focused
        ? cn.focus
        : '';

  return state ? `${state} ${cn.activator}` : '';
}

export function resolveTextFieldClassNames(options: {
  structural: TextFieldStructuralDescriptor;
  elements: TextFieldClassesMap;
  classNames: TextFieldClassNames;
  scale: string;
  intent: TextFieldIntent;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  focused: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}): Required<TextFieldClassNames> {
  const stateClass = resolveStateActivatorClassName(options);

  return {
    e1:
      joinClassNames(
        'k-txf',
        `k-txf-${options.structural.letter}`,
        getTextFieldSlot(options.structural, 'e1'),
        resolveElementClassName(options.elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      joinClassNames(
        getTextFieldSlot(options.structural, 'e2'),
        resolveElementClassName(options.elements.e2, options),
        stateClass,
        'k-state',
        options.classNames.e2
      ) ?? '',
    e3:
      joinClassNames(
        getTextFieldSlot(options.structural, 'e3'),
        resolveElementClassName(options.elements.e3, options),
        resolveRadiusClassName(options.elements.e3, options.scale, options.radius),
        stateClass,
        'k-state',
        options.classNames.e3
      ) ?? '',
    e4:
      joinClassNames(
        getTextFieldSlot(options.structural, 'e4'),
        resolveElementClassName(options.elements.e4, options),
        stateClass,
        'k-state',
        options.classNames.e4
      ) ?? '',
    e5:
      joinClassNames(
        getTextFieldSlot(options.structural, 'e5'),
        resolveElementClassName(options.elements.e5, options),
        options.disabled ? `${cn.disabled} ${cn.activator}` : '',
        'k-state',
        options.classNames.e5
      ) ?? ''
  };
}
