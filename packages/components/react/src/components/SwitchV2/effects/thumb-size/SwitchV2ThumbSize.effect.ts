import './SwitchV2ThumbSize.structural.css';
import type { ComponentEmphasis, RadiusMode, SwitchIntent } from '@kiskadee/core';
import {
  join,
  normalizeScaleKey,
  resolveIntentClasses,
  resolveRadiusClassName,
  resolveSwitchThumbSizeEffectClassName
} from '../../../Switch/Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../../../Switch/Switch.types.ts';

export type SwitchV2ThumbSizeEffectOptions = {
  baseClassNames: Required<SwitchClassNames>;
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis;
  radius: RadiusMode;
};

export type SwitchV2ThumbSizeEffectResult = {
  classNames: Required<SwitchClassNames>;
  thumbVisualClassName: string;
};

function resolveScaleClassName(element: SwitchClassesMap['e3'], scale: string): string {
  if (!element) return '';
  const scaleKey = normalizeScaleKey(scale);
  return join(element.s?.all, element.s?.[scaleKey]) ?? '';
}

function resolveVisualClassName(
  element: SwitchClassesMap['e3'],
  options: {
    intent: SwitchIntent;
    emphasis: ComponentEmphasis;
  }
): string {
  if (!element) return '';
  return join(element.d, resolveIntentClasses(element, options.intent, options.emphasis)) ?? '';
}

export function resolveSwitchV2ThumbSizeEffect(
  options: SwitchV2ThumbSizeEffectOptions
): SwitchV2ThumbSizeEffectResult {
  return {
    classNames: {
      ...options.baseClassNames,
      e1: join(options.baseClassNames.e1, 'k-swt') ?? '',
      e3:
        join(
          'k-sw2-e3-a',
          resolveScaleClassName(options.elements.e3, options.scale),
          resolveRadiusClassName(options.elements.e3, options.scale, options.radius),
          options.classNames.e3
        ) ?? ''
    },
    thumbVisualClassName:
      join(
        'k-sw2-x5-a',
        resolveVisualClassName(options.elements.e3, options),
        resolveRadiusClassName(options.elements.e3, options.scale, options.radius),
        resolveSwitchThumbSizeEffectClassName(options.elements.e3, options.scale),
        'k-trn'
      ) ?? ''
  };
}
