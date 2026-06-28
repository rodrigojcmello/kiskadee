import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  RadiusMode,
  SwitchActivationMotion,
  SwitchControlTextVisibility
} from '@kiskadee/core';
import type { SwitchComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../../shared/contexts/useLoadedComponentArtifact.ts';
import {
  type SwitchThumbShrinkEffectModule,
  useSwitchThumbShrinkEffect
} from '../effects/thumb-shrink/index.ts';
import {
  DEFAULT_SWITCH_ACTIVATION_MOTION,
  DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY,
  DEFAULT_SWITCH_RADIUS
} from '.././Switch.class-names.ts';
import type { SwitchVariantClassesMap } from '.././Switch.types.ts';

export type SwitchArtifactConfig = {
  switchClassesMap: SwitchVariantClassesMap | undefined;
  options: {
    radius: RadiusMode;
    activationMotion: SwitchActivationMotion;
    controlTextVisibility: SwitchControlTextVisibility;
  };
  effects: {
    thumbShrinkEffect: SwitchThumbShrinkEffectModule | null;
  };
  componentEffects: {
    activationFeedback?: ActivationFeedbackSetting;
  };
  globalEffects: {
    activationFeedback?: ActivationFeedbackEffectSchema;
  };
};

function isSwitchComponentArtifact(artifact: unknown): artifact is SwitchComponentArtifactJSON {
  return (artifact as SwitchComponentArtifactJSON | undefined)?.component === 'switch';
}

export function useSwitchArtifactConfig(thumbShrink?: false): SwitchArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const {
    currentArtifact: currentSwitchComponentArtifact,
    previousArtifact: previousLoadedSwitchComponentArtifact
  } = useLoadedComponentArtifact({
    componentName: 'switch',
    isArtifact: isSwitchComponentArtifact,
    preservePrevious: true,
    resetWhenLoaderMissing: false
  });
  // Preserve component metadata while a provider swaps manifests/design systems.
  const switchGlobalConfig =
    currentSwitchComponentArtifact ??
    previousLoadedSwitchComponentArtifact ??
    global?.components?.switch;
  const aggregateSwitchClassesMap = classesMap.switch as SwitchVariantClassesMap | undefined;
  const switchClassesMap = useComponentClassMap('switch', aggregateSwitchClassesMap);
  const shouldLoadThumbShrinkEffect =
    thumbShrink !== false && switchGlobalConfig?.effects?.thumbShrink === true;
  const thumbShrinkEffect = useSwitchThumbShrinkEffect(shouldLoadThumbShrinkEffect);

  return {
    switchClassesMap,
    options: {
      radius: switchGlobalConfig?.options?.radius ?? global?.radius ?? DEFAULT_SWITCH_RADIUS,
      activationMotion:
        switchGlobalConfig?.options?.activationMotion ?? DEFAULT_SWITCH_ACTIVATION_MOTION,
      controlTextVisibility:
        switchGlobalConfig?.options?.controlTextVisibility ?? DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY
    },
    effects: {
      thumbShrinkEffect
    },
    componentEffects: {
      activationFeedback:
        currentSwitchComponentArtifact?.effects?.activationFeedback ??
        previousLoadedSwitchComponentArtifact?.effects?.activationFeedback ??
        global?.components?.switch?.effects?.activationFeedback
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    }
  };
}
