import type {
  ActivationFeedbackSetting,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconTreatment
} from '@kiskadee/core';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMapResolution } from '../../../shared/contexts/useComponentClassMap.ts';
import type { ButtonClassesMap } from '../Button.types.ts';

type ButtonGlobalConfig = ReturnType<typeof useKiskadee>['global'];
type ButtonGlobalEffects = NonNullable<NonNullable<ButtonGlobalConfig>['effects']>;

export type ButtonArtifactConfig = {
  buttonClassesMap: ButtonClassesMap | undefined;
  buttonClassesMapPending: boolean;
  componentEffects: {
    activationFeedback: ActivationFeedbackSetting | undefined;
  };
  globalEffects: {
    activationFeedback: ButtonGlobalEffects['activationFeedback'] | undefined;
  };
  options: {
    radius: NonNullable<ButtonGlobalConfig>['radius'] | undefined;
    iconLayout: ButtonIconLayout | undefined;
    iconPlacement: ButtonIconPlacement | undefined;
    iconTreatment: ButtonIconTreatment | undefined;
  };
};

export function useButtonArtifactConfig(): ButtonArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const buttonClassMapResolution = useComponentClassMapResolution(
    'button',
    classesMap.button as ButtonClassesMap | undefined
  );

  return {
    buttonClassesMap: buttonClassMapResolution.classMap,
    buttonClassesMapPending: buttonClassMapResolution.pending,
    componentEffects: {
      activationFeedback: global?.components?.button?.effects?.activationFeedback
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    },
    options: {
      radius: global?.radius,
      iconLayout: global?.components?.button?.options?.iconLayout,
      iconPlacement: global?.components?.button?.options?.iconPlacement,
      iconTreatment: global?.components?.button?.options?.iconTreatment
    }
  };
}
