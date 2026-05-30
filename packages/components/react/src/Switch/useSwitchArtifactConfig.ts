import type {
  ActivationFeedbackEffectSchema,
  RadiusMode,
  SwitchActivationMotion,
  SwitchControlTextVisibility
} from '@kiskadee/core';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_SWITCH_ACTIVATION_MOTION,
  DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY,
  DEFAULT_SWITCH_RADIUS
} from './Switch.class-names.ts';
import type { SwitchVariantClassesMap } from './Switch.types.ts';

export type SwitchArtifactConfig = {
  switchClassesMap: SwitchVariantClassesMap | undefined;
  options: {
    radius: RadiusMode;
    activationMotion: SwitchActivationMotion;
    controlTextVisibility: SwitchControlTextVisibility;
  };
  effects: {
    thumbSize: boolean;
  };
  globalEffects: {
    activationFeedback?: ActivationFeedbackEffectSchema;
  };
};

export function useSwitchArtifactConfig(): SwitchArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const switchGlobalConfig = global?.components?.switch;

  return {
    switchClassesMap: classesMap.switch as SwitchVariantClassesMap | undefined,
    options: {
      radius: switchGlobalConfig?.options?.radius ?? global?.radius ?? DEFAULT_SWITCH_RADIUS,
      activationMotion:
        switchGlobalConfig?.options?.activationMotion ?? DEFAULT_SWITCH_ACTIVATION_MOTION,
      controlTextVisibility:
        switchGlobalConfig?.options?.controlTextVisibility ?? DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY
    },
    effects: {
      thumbSize: switchGlobalConfig?.effects?.thumbSize === true
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    }
  };
}
