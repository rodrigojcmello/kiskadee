import type {
  ActivationFeedbackEffectSchema,
  RadiusMode,
  SwitchActivationMotion,
  SwitchControlTextVisibility
} from '@kiskadee/core';
import type {
  ComponentClassMapArtifactJSON,
  SwitchComponentArtifactJSON
} from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedArtifact,
  loadCachedComponentArtifact
} from '../contexts/componentArtifactCache.ts';
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

type SwitchArtifactState = {
  cacheKey: string;
  artifact: SwitchComponentArtifactJSON | undefined;
};

type SwitchClassMapState = {
  cacheKey: string;
  classMap: SwitchVariantClassesMap | undefined;
};

function isSwitchComponentArtifact(
  artifact: SwitchComponentArtifactJSON | undefined
): artifact is SwitchComponentArtifactJSON {
  return artifact?.component === 'switch';
}

function isSwitchClassMapArtifact(
  artifact: ComponentClassMapArtifactJSON<SwitchVariantClassesMap> | undefined
): artifact is ComponentClassMapArtifactJSON<SwitchVariantClassesMap> {
  return artifact?.component === 'switch' && artifact.classMap !== undefined;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isClassElementMap = (value: unknown): value is Record<string, Record<string, unknown>> => {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  const elementKeys = ['d', 'e', 's', 'w', 'c', 'l', 'rr', 'rp', 'rs'];
  return elementKeys.some((key) => key in first);
};

function mergeClassElementMaps(
  coreMap: Record<string, Record<string, unknown>> | undefined,
  paletteMap: Record<string, Record<string, unknown>> | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const elementKeys = new Set([...Object.keys(coreMap ?? {}), ...Object.keys(paletteMap ?? {})]);

  for (const elementName of elementKeys) {
    const coreElement = coreMap?.[elementName] ?? {};
    const paletteElement = paletteMap?.[elementName] ?? {};
    const mergedElement: Record<string, unknown> = { ...coreElement };

    if (paletteElement.c) {
      const coreColors = (coreElement.c as Record<string, unknown> | undefined) ?? {};
      const paletteColors = (paletteElement.c as Record<string, unknown> | undefined) ?? {};
      mergedElement.c = { ...coreColors, ...paletteColors };
    }

    for (const key of ['d', 'e', 's', 'w', 'l', 'rr', 'rp', 'rs']) {
      if (mergedElement[key] === undefined && paletteElement[key] !== undefined) {
        mergedElement[key] = paletteElement[key];
      }
    }

    out[elementName] = mergedElement;
  }

  return out;
}

function mergeClassMapNode(coreNode: unknown, paletteNode: unknown): Record<string, unknown> {
  const coreIsElementMap = isClassElementMap(coreNode);
  const paletteIsElementMap = isClassElementMap(paletteNode);

  if (coreIsElementMap || paletteIsElementMap) {
    return mergeClassElementMaps(
      coreIsElementMap ? coreNode : undefined,
      paletteIsElementMap ? paletteNode : undefined
    );
  }

  const coreRecord = isRecord(coreNode) ? coreNode : {};
  const paletteRecord = isRecord(paletteNode) ? paletteNode : {};
  const keys = new Set([...Object.keys(coreRecord), ...Object.keys(paletteRecord)]);
  const out: Record<string, unknown> = {};

  for (const key of keys) {
    out[key] = mergeClassMapNode(coreRecord[key], paletteRecord[key]);
  }

  return out;
}

function mergeSwitchClassMaps(
  coreClassMap: SwitchVariantClassesMap | undefined,
  paletteClassMap: SwitchVariantClassesMap | undefined
): SwitchVariantClassesMap | undefined {
  if (!coreClassMap && !paletteClassMap) return undefined;
  return mergeClassMapNode(coreClassMap, paletteClassMap) as SwitchVariantClassesMap;
}

export function useSwitchArtifactConfig(): SwitchArtifactConfig {
  const {
    artifactVersion,
    classesMap,
    designSystem,
    global,
    loadComponentArtifact,
    loadComponentClassMap,
    segment,
    theme
  } = useKiskadee();
  const switchArtifactCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName: 'switch'
  });
  const [artifactState, setArtifactState] = useState<SwitchArtifactState | undefined>(undefined);
  const switchComponentArtifact =
    artifactState?.cacheKey === switchArtifactCacheKey ? artifactState.artifact : undefined;
  const switchGlobalConfig = switchComponentArtifact ?? global?.components?.switch;
  const switchClassMapCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    artifactKind: 'classMap:merged',
    segment,
    theme,
    componentName: 'switch'
  });
  const [classMapState, setClassMapState] = useState<SwitchClassMapState | undefined>(undefined);
  const aggregateSwitchClassesMap = classesMap.switch as SwitchVariantClassesMap | undefined;
  const componentSwitchClassesMap =
    classMapState?.cacheKey === switchClassMapCacheKey ? classMapState.classMap : undefined;
  const switchClassesMap = componentSwitchClassesMap ?? aggregateSwitchClassesMap;

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

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentClassMap) {
      setClassMapState(undefined);
      return () => {
        cancelled = true;
      };
    }

    const coreCacheKey = getComponentArtifactCacheKey({
      designSystem,
      artifactVersion,
      artifactKind: 'classMap:core',
      componentName: 'switch'
    });
    const paletteCacheKey = getComponentArtifactCacheKey({
      designSystem,
      artifactVersion,
      artifactKind: 'classMap:palette',
      segment,
      theme,
      componentName: 'switch'
    });

    Promise.all([
      loadCachedArtifact<ComponentClassMapArtifactJSON<SwitchVariantClassesMap>>({
        cacheKey: coreCacheKey,
        load: () => loadComponentClassMap('switch', { kind: 'core' })
      }),
      loadCachedArtifact<ComponentClassMapArtifactJSON<SwitchVariantClassesMap>>({
        cacheKey: paletteCacheKey,
        load: () =>
          loadComponentClassMap('switch', {
            kind: 'palette',
            segment,
            theme
          })
      })
    ]).then(([coreArtifact, paletteArtifact]) => {
      if (cancelled) return;
      const coreClassMap = isSwitchClassMapArtifact(coreArtifact)
        ? coreArtifact.classMap
        : undefined;
      const paletteClassMap = isSwitchClassMapArtifact(paletteArtifact)
        ? paletteArtifact.classMap
        : undefined;
      setClassMapState({
        cacheKey: switchClassMapCacheKey,
        classMap: mergeSwitchClassMaps(coreClassMap, paletteClassMap)
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    artifactVersion,
    designSystem,
    loadComponentClassMap,
    segment,
    switchClassMapCacheKey,
    theme
  ]);

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
