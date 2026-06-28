import type {
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetByRadius,
  TextFieldLabelPlacement,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant
} from '@kiskadee/core';
import type { TextFieldComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../shared/contexts/useLoadedComponentArtifact.ts';
import type { TextFieldVariantClassesMap } from './TextField.types.ts';

export type TextFieldVariantsConfig = {
  [TVariant in TextFieldVariant]?: {
    options?: {
      focusRingColorSource?: TextFieldFocusRingColorSource;
      labelPlacement?: TextFieldLabelPlacement;
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

function isTextFieldComponentArtifact(
  artifact: unknown
): artifact is TextFieldComponentArtifactJSON {
  return (artifact as TextFieldComponentArtifactJSON | undefined)?.component === 'textField';
}

export function useTextFieldArtifactConfig(): TextFieldArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const { currentArtifact: textFieldComponentArtifact } = useLoadedComponentArtifact({
    componentName: 'textField',
    isArtifact: isTextFieldComponentArtifact
  });
  const legacyTextFieldConfig = global?.components?.textField;
  const textFieldClassesMap = useComponentClassMap(
    'textField',
    classesMap.textField as TextFieldVariantClassesMap | undefined
  );

  return {
    textFieldClassesMap,
    options: textFieldComponentArtifact?.options ?? legacyTextFieldConfig?.options ?? {},
    variants: textFieldComponentArtifact?.variants ?? legacyTextFieldConfig?.variants ?? {}
  };
}
