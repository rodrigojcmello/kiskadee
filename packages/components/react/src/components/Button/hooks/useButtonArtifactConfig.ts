import type {
  ActivationFeedbackSetting,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ContentSurfaceContextMap
} from '@kiskadee/core';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMapResolution } from '../../../shared/contexts/useComponentClassMap.ts';
import { useComponentMetadata } from '../../../shared/contexts/useComponentMetadata.ts';
import type { ButtonClassesMap } from '../Button.types.ts';

type ButtonGlobalConfig = ReturnType<typeof useKiskadee>['global'];
type ButtonGlobalEffects = NonNullable<NonNullable<ButtonGlobalConfig>['effects']>;

export type ButtonArtifactConfig = {
  buttonClassesMap: ButtonClassesMap | undefined;
  buttonClassesMapPending: boolean;
  componentEffects: {
    activationFeedback: ActivationFeedbackSetting | undefined;
  };
  contentSurfaceContext: ContentSurfaceContextMap | undefined;
  globalEffects: {
    activationFeedback: ButtonGlobalEffects['activationFeedback'] | undefined;
  };
  options: {
    radius: NonNullable<ButtonGlobalConfig>['radius'] | undefined;
    iconLayout: ButtonIconLayout | undefined;
    iconPlacement: ButtonIconPlacement | undefined;
    iconSurfaceCorners: ButtonIconSurfaceCorners | undefined;
    iconTreatment: ButtonIconTreatment | undefined;
    groupDivider: boolean | undefined;
    disclosureDivider: boolean | undefined;
  };
};

export function useButtonArtifactConfig(): ButtonArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const buttonMetadata = useComponentMetadata('button');
  const buttonClassMapResolution = useComponentClassMapResolution(
    'button',
    classesMap.button as ButtonClassesMap | undefined
  );

  return {
    buttonClassesMap: buttonClassMapResolution.classMap,
    buttonClassesMapPending: buttonClassMapResolution.pending,
    contentSurfaceContext: buttonMetadata?.contentSurfaceContext,
    componentEffects: {
      activationFeedback: buttonMetadata?.effects?.activationFeedback
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    },
    options: {
      radius: global?.radius,
      iconLayout: buttonMetadata?.options?.iconLayout,
      iconPlacement: buttonMetadata?.options?.iconPlacement,
      iconSurfaceCorners: buttonMetadata?.options?.iconSurfaceCorners,
      iconTreatment: buttonMetadata?.options?.iconTreatment,
      groupDivider: buttonMetadata?.options?.groupDivider,
      disclosureDivider: buttonMetadata?.options?.disclosureDivider
    }
  };
}
