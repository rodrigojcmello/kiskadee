import type {
  ComponentEmphasis,
  RadiusMode,
  SwitchActivationMotion,
  SwitchIntent
} from '@kiskadee/core';
import { resolveSwitchThumbShrinkClassNames } from '../.././Switch.class-names.ts';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchLabelPosition
} from '../.././Switch.types.ts';

export type SwitchThumbShrinkEffectOptions = {
  baseClassNames: Required<SwitchClassNames>;
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis;
  radius: RadiusMode;
  activationMotion: SwitchActivationMotion;
  labelPosition: SwitchLabelPosition;
  hasLabel: boolean;
};

export type SwitchThumbShrinkEffectResult = {
  classNames: Required<SwitchClassNames>;
};

export function resolveSwitchThumbShrinkEffect(
  options: SwitchThumbShrinkEffectOptions
): SwitchThumbShrinkEffectResult {
  const classNames = resolveSwitchThumbShrinkClassNames({
    elements: options.elements,
    classNames: options.classNames,
    structuralBranch: 'a',
    scale: options.scale,
    intent: options.intent,
    emphasis: options.emphasis,
    radius: options.radius,
    activationMotion: options.activationMotion,
    labelPosition: options.labelPosition,
    hasLabel: options.hasLabel,
    hasControlText: false
  });

  return {
    classNames: {
      ...options.baseClassNames,
      e3: classNames.e3
    }
  };
}
