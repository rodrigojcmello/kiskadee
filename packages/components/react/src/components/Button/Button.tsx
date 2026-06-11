import './Button.structural.scss';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { memo, useMemo } from 'react';
import type { ButtonClassesMap, ButtonProps } from './Button.types.ts';
import { mergeButtonClassNames } from './Button.class-names.ts';
import {
  resolveButtonFeedbackClassNamePatch,
  resolveButtonFeedbackEffectAvailability,
  useButtonActivationFeedbackController,
  useButtonFeedbackEffect
} from './effects/activation-feedback/index.ts';
import {
  useButtonClassNamesFromCommon,
  useButtonCommonProps
} from './hooks/useButtonBase.ts';

export type {
  ButtonActivationFeedbackEffect,
  ButtonProps,
  ButtonStatus
} from './Button.types.ts';

function ButtonRoot(props: ButtonProps) {
  const common = useButtonCommonProps(props);
  const feedbackEffectAvailability = useMemo(
    () =>
      resolveButtonFeedbackEffectAvailability({
        activationFeedback: common.activationFeedback,
        element: common.e1
      }),
    [common.activationFeedback, common.e1]
  );
  const feedbackEffect = useButtonFeedbackEffect(feedbackEffectAvailability);
  const activationFeedbackController = useButtonActivationFeedbackController(
    common,
    {
      feedbackEnabled: Boolean(feedbackEffect.loadedFeedbackKind)
    }
  );
  const elements = useMemo<ButtonClassesMap>(
    () => ({
      e1: common.e1,
      e2: common.e2,
      e3: common.e3
    }),
    [common.e1, common.e2, common.e3]
  );
  const feedbackClassNamePatch = useMemo(
    () =>
      resolveButtonFeedbackClassNamePatch({
        activationFeedbackEffect: feedbackEffect.activationFeedbackEffect,
        activationFeedbackConfig: activationFeedbackController.activationFeedbackConfig,
        activationFeedbackProfile: activationFeedbackController.activationFeedbackProfile,
        controlState: common.controlState,
        elements,
        emphasis: common.emphasis,
        feedbackKind: activationFeedbackController.feedbackKind,
        isActive: activationFeedbackController.isFeedbackActive,
        isFading: activationFeedbackController.isFeedbackFading,
        shouldForceOverlayPressed: activationFeedbackController.shouldForceOverlayPressed,
        shouldUsePressedProfile: activationFeedbackController.shouldUsePressedProfile
      }),
    [
      activationFeedbackController.activationFeedbackConfig,
      activationFeedbackController.activationFeedbackProfile,
      activationFeedbackController.feedbackKind,
      activationFeedbackController.isFeedbackActive,
      activationFeedbackController.isFeedbackFading,
      activationFeedbackController.shouldForceOverlayPressed,
      activationFeedbackController.shouldUsePressedProfile,
      common.controlState,
      common.emphasis,
      elements,
      feedbackEffect.activationFeedbackEffect
    ]
  );
  const baseClassNames = useButtonClassNamesFromCommon(common, {
    statusOverride: activationFeedbackController.shouldForceOverlayPressed ? 'rest' : common.status
  });
  const computedClassNames = useMemo(
    () =>
      mergeButtonClassNames(
        baseClassNames,
        feedbackClassNamePatch,
        activationFeedbackController.shouldUsePressedFeedback ? { e1: 'k-pressed' } : undefined
      ),
    [
      feedbackClassNamePatch,
      activationFeedbackController.shouldUsePressedFeedback,
      baseClassNames
    ]
  );

  return (
    <HeadlessButton
      {...common.restProps}
      label={common.label}
      disabled={activationFeedbackController.isDisabled}
      aria-disabled={activationFeedbackController.ariaDisabled}
      aria-pressed={activationFeedbackController.ariaPressed}
      classNames={computedClassNames}
      ref={activationFeedbackController.hostRef}
      onClick={activationFeedbackController.handlers.onClick}
      onPointerDown={activationFeedbackController.handlers.onPointerDown}
      onPointerUp={activationFeedbackController.handlers.onPointerUp}
      onPointerCancel={activationFeedbackController.handlers.onPointerCancel}
      onKeyDown={activationFeedbackController.handlers.onKeyDown}
      onKeyUp={activationFeedbackController.handlers.onKeyUp}
      onBlur={activationFeedbackController.handlers.onBlur}
      tabIndex={common.tabIndex ?? 0}
    />
  );
}

const MemoButton = memo(ButtonRoot);
const CompoundButton = Object.assign(MemoButton, {
  Label: HeadlessButton.Label,
  Icon: HeadlessButton.Icon
});

export { CompoundButton as Button };
