import {
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  stateActivator as cn,
  componentEmphasisBuckets,
  type RadiusMode,
  type SwitchMode,
  type SwitchVariant
} from '@kiskadee/core';
import type { UseStateProjectionOptions } from '../state-projection/useStateProjection.ts';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchElementName,
  SwitchLabelPosition,
  SwitchVariantClassesMap
} from './Switch.types.ts';

export const DEFAULT_SWITCH_SCALE = 's:md:1';
export const DEFAULT_SWITCH_EMPHASIS: ComponentEmphasis = 'medium';
export const DEFAULT_SWITCH_INTENT = 'neutral';
export const DEFAULT_SWITCH_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_SWITCH_VARIANT: SwitchVariant = 'standard';
export const DEFAULT_SWITCH_MODE: SwitchMode = 'base';
export const DEFAULT_SWITCH_LABEL_POSITION: SwitchLabelPosition = 'end';

export type SwitchProjectedStateName = 'checked' | 'focusVisible' | 'disabled' | 'readOnly';

export const SWITCH_STATE_PROJECTION = {
  target: 'e1',
  activatorClassName: cn.activator,
  interactiveClassName: cn.interactive,
  projections: {
    checked: {
      className: cn.selected
    },
    focusVisible: {
      className: cn.focus
    },
    disabled: {
      className: cn.disabled
    },
    readOnly: {
      className: cn.readOnly
    }
  }
} satisfies Omit<
  UseStateProjectionOptions<SwitchElementName, SwitchProjectedStateName>,
  'classNames' | 'states'
>;

export function join(...parts: Array<string | undefined | false | null>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

export const normalizeScaleKey = (key: string): string =>
  key.startsWith('s:') ? key.slice(2) : key;

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
  intent: string,
  emphasis: ComponentEmphasis | undefined
): string {
  if (!element?.c) return '';

  const byIntent = element.c as Record<string, ColorClasses>;
  const chosen = byIntent[intent] ?? byIntent.neutral ?? Object.values(byIntent)[0];
  if (!chosen) return '';

  const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
  if (!bucket) return chosen.h ?? chosen.m ?? chosen.l ?? chosen.ll ?? '';

  const buckets = chosen as Record<string, string | undefined>;
  return buckets[bucket] ?? chosen.m ?? chosen.h ?? chosen.l ?? chosen.ll ?? '';
}

export function elem(
  element: ClassNameByElementJSON | undefined,
  options: {
    scale: string;
    intent: string;
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

export function resolveSwitchClassNames(options: {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  scale: string;
  intent: string;
  emphasis: ComponentEmphasis | undefined;
  radius: RadiusMode;
  labelPosition: SwitchLabelPosition;
  hasLabel: boolean;
  hasState: boolean;
}): Required<SwitchClassNames> {
  const elements = options.elements;

  return {
    e1:
      join(
        'k-swt',
        'k-swt-a',
        'k-swt-e1-a',
        options.labelPosition === 'start' ? 'k-swt-e1a-a' : '',
        elem(elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      join(
        'k-swt-e2-a',
        elem(elements.e2, options),
        resolveRadiusClassName(elements.e2, options.scale, options.radius),
        'k-trn',
        options.classNames.e2
      ) ?? '',
    e3:
      join(
        'k-swt-e3-a',
        elem(elements.e3, options),
        resolveRadiusClassName(elements.e3, options.scale, options.radius),
        'k-trn',
        options.classNames.e3
      ) ?? '',
    e4: options.hasLabel
      ? (join('k-swt-e4-a', elem(elements.e4, options), 'k-trn', options.classNames.e4) ?? '')
      : (options.classNames.e4 ?? ''),
    e5: options.hasState
      ? (join('k-swt-e5-a', elem(elements.e5, options), 'k-trn', options.classNames.e5) ?? '')
      : (options.classNames.e5 ?? '')
  };
}
