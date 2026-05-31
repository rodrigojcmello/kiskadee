import type {
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetByRadius,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant
} from '@kiskadee/core';
import type { TextFieldComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedComponentArtifact
} from '../../shared/contexts/componentArtifactCache.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import type { TextFieldVariantClassesMap } from './TextField.types.ts';

export type TextFieldVariantsConfig = {
  [TVariant in TextFieldVariant]?: {
    options?: {
      focusRingColorSource?: TextFieldFocusRingColorSource;
    };
    modes?: Partial<
      Record<
        TextFieldModeByVariant[TVariant],
        {
          options?: {
            labelOffset?: TextFieldLabelOffsetByRadius;
            focusRingColorSource?: TextFieldFocusRingColorSource;
          };
        }
      >
    >;
  };
};

export type TextFieldArtifactConfig = {
  textFieldClassesMap: TextFieldVariantClassesMap | undefined;
  options: {
    variant?: TextFieldVariant;
    mode?: TextFieldMode;
    focusRingColorSource?: TextFieldFocusRingColorSource;
  };
  variants: TextFieldVariantsConfig;
};

type TextFieldArtifactState = {
  cacheKey: string;
  artifact: TextFieldComponentArtifactJSON | undefined;
};

function isTextFieldComponentArtifact(
  artifact: TextFieldComponentArtifactJSON | undefined
): artifact is TextFieldComponentArtifactJSON {
  return artifact?.component === 'textField';
}

export function useTextFieldArtifactConfig(): TextFieldArtifactConfig {
  const { artifactVersion, classesMap, designSystem, global, loadComponentArtifact } =
    useKiskadee();
  const textFieldArtifactCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName: 'textField'
  });
  const [artifactState, setArtifactState] = useState<TextFieldArtifactState | undefined>(undefined);
  const textFieldComponentArtifact =
    artifactState?.cacheKey === textFieldArtifactCacheKey ? artifactState.artifact : undefined;
  const legacyTextFieldConfig = global?.components?.textField;
  const textFieldClassesMap = useComponentClassMap(
    'textField',
    classesMap.textField as TextFieldVariantClassesMap | undefined
  );

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentArtifact) {
      setArtifactState(undefined);
      return () => {
        cancelled = true;
      };
    }

    loadCachedComponentArtifact<TextFieldComponentArtifactJSON>({
      cacheKey: textFieldArtifactCacheKey,
      componentName: 'textField',
      loadComponentArtifact
    }).then((artifact) => {
      if (cancelled) return;
      setArtifactState({
        cacheKey: textFieldArtifactCacheKey,
        artifact: isTextFieldComponentArtifact(artifact) ? artifact : undefined
      });
    });

    return () => {
      cancelled = true;
    };
  }, [loadComponentArtifact, textFieldArtifactCacheKey]);

  return {
    textFieldClassesMap,
    options: textFieldComponentArtifact?.options ?? legacyTextFieldConfig?.options ?? {},
    variants: textFieldComponentArtifact?.variants ?? legacyTextFieldConfig?.variants ?? {}
  };
}
