import type {
  ActivationFeedbackSetting,
  ButtonIconLayout,
  ButtonIconPlacement
} from '@kiskadee/core';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import type { ButtonClassesMap } from '../Button.types.ts';

type ButtonGlobalConfig = ReturnType<typeof useKiskadee>['global'];
type ButtonGlobalEffects = NonNullable<NonNullable<ButtonGlobalConfig>['effects']>;

export type ButtonArtifactConfig = {
  buttonClassesMap: ButtonClassesMap | undefined;
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
  };
};

export function useButtonArtifactConfig(): ButtonArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const buttonClassesMap = useComponentClassMap(
    'button',
    classesMap.button as ButtonClassesMap | undefined
  );

  return {
    buttonClassesMap,
    componentEffects: {
      activationFeedback: global?.components?.button?.effects?.activationFeedback
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    },
    options: {
      radius: global?.radius,
      iconLayout: global?.components?.button?.options?.iconLayout,
      iconPlacement: global?.components?.button?.options?.iconPlacement
    }
  };
}
