import type {
  ActivationFeedbackEffectSchema,
  RadiusMode,
  SwitchActivationMotion,
  SwitchControlTextVisibility
} from '@kiskadee/core';
import type { SwitchComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedComponentArtifact
} from '../../shared/contexts/componentArtifactCache.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
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

type SwitchArtifactState = {
  cacheKey: string;
  artifact: SwitchComponentArtifactJSON | undefined;
};

function isSwitchComponentArtifact(
  artifact: SwitchComponentArtifactJSON | undefined
): artifact is SwitchComponentArtifactJSON {
  return artifact?.component === 'switch';
}

export function useSwitchArtifactConfig(): SwitchArtifactConfig {
  const { artifactVersion, classesMap, designSystem, global, loadComponentArtifact } =
    useKiskadee();
  const switchArtifactCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName: 'switch'
  });
  const [artifactState, setArtifactState] = useState<SwitchArtifactState | undefined>(undefined);
  const switchComponentArtifact =
    artifactState?.cacheKey === switchArtifactCacheKey ? artifactState.artifact : undefined;
  const switchGlobalConfig = switchComponentArtifact ?? global?.components?.switch;
  const aggregateSwitchClassesMap = classesMap.switch as SwitchVariantClassesMap | undefined;
  const switchClassesMap = useComponentClassMap('switch', aggregateSwitchClassesMap);

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentArtifact) {
      setArtifactState(undefined);
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
      thumbSize: switchGlobalConfig?.effects?.thumbSize === true
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    }
  };
}
