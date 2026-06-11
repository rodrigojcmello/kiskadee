import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  RadiusMode,
  SwitchActivationMotion,
  SwitchControlTextVisibility
} from '@kiskadee/core';
import type { SwitchComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedComponentArtifact
} from '../../../shared/contexts/componentArtifactCache.ts';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
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

type SwitchArtifactState = {
  cacheKey: string;
  artifact: SwitchComponentArtifactJSON | undefined;
};

function isSwitchComponentArtifact(
  artifact: SwitchComponentArtifactJSON | undefined
): artifact is SwitchComponentArtifactJSON {
  return artifact?.component === 'switch';
}

export function useSwitchArtifactConfig(thumbShrink?: false): SwitchArtifactConfig {
  const { artifactVersion, classesMap, designSystem, global, loadComponentArtifact } =
    useKiskadee();
  const switchArtifactCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName: 'switch'
  });
  const [artifactState, setArtifactState] = useState<SwitchArtifactState | undefined>(undefined);
  const currentSwitchComponentArtifact =
    artifactState?.cacheKey === switchArtifactCacheKey ? artifactState.artifact : undefined;
  const previousLoadedSwitchComponentArtifact =
    artifactState?.cacheKey !== switchArtifactCacheKey ? artifactState?.artifact : undefined;
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

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentArtifact) {
      return () => {
        cancelled = true;
      };
    }

    loadCachedComponentArtifact<SwitchComponentArtifactJSON>({
      cacheKey: switchArtifactCacheKey,
      componentName: 'switch',
      loadComponentArtifact
    }).then((artifact) => {
      if (cancelled) return;
      setArtifactState({
        cacheKey: switchArtifactCacheKey,
        artifact: isSwitchComponentArtifact(artifact) ? artifact : undefined
      });
    });

    return () => {
      cancelled = true;
    };
  }, [loadComponentArtifact, switchArtifactCacheKey]);

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
