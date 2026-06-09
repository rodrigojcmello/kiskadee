import type {
  ActivationFeedbackInputFeedback,
  ActivationFeedbackOrigin,
  ActivationFeedbackPressedVisual,
  ActivationFeedbackProfileMode,
  RippleMode,
  RippleOrigin
} from '@kiskadee/core';
import {
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { memo, useMemo } from 'react';
import type { ButtonProps } from './Button.types.ts';
import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackBucketClass,
  resolveActivationFeedbackPressedBucketClass,
  resolveActivationFeedbackProfileAvailability
} from '../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  resolveButtonAccessibilityFromCommon,
  useButtonClassNamesFromCommon,
  useButtonCommonProps,
  useTransientPressedState
} from './useButtonBase';
import {
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';

// Button-specific own-surface mapping: selected/high emphasis use the vivid feedback tone.
const resolveActivationFeedbackSurfaceToneClass = (
  emphasis: ButtonProps['emphasis'],
  controlState: boolean | undefined
): string => {
  if (controlState) return 'k-btn-e1d';
  if (emphasis === 'high') return 'k-btn-e1d';
  return '';
};

const toActivationFeedbackProfile = (
  mode: RippleMode | undefined
): ActivationFeedbackProfileMode | undefined => mode;

const toActivationFeedbackOrigin = (
  origin: RippleOrigin | undefined
): ActivationFeedbackOrigin | undefined => origin;

export type ButtonWithActivationFeedbackProps = ButtonProps & {
  availableActivationFeedbackProfiles?: ActivationFeedbackProfileMode[];
};

function Button(inputProps: ButtonWithActivationFeedbackProps) {
  const { availableActivationFeedbackProfiles, ...props } = inputProps;
  const common = useButtonCommonProps(props);
  const {
    activationFeedback,
    controlState,
    rippleEffect,
    emphasis,
    status,
    tabIndex,
    label,
    pressedDurationMs,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur,
    restProps,
    e1,
    global
  } = common;

  const localActivationFeedback =
    activationFeedback && typeof activationFeedback === 'object' ? activationFeedback : undefined;
  const legacyRippleEffect =
    rippleEffect && typeof rippleEffect === 'object' ? rippleEffect : undefined;
  const activationFeedbackConfig = global?.effects?.activationFeedback;

  const { isPressed, triggerPressed } = useTransientPressedState(pressedDurationMs);

  const activationFeedbackProfile = useMemo<ActivationFeedbackProfileMode | null>(() => {
    const availableProfiles =
      availableActivationFeedbackProfiles ?? resolveActivationFeedbackProfileAvailability(e1);
    if (availableProfiles.length === 0) return null;
    if (activationFeedback === false || rippleEffect === false) return null;

    const requested =
      localActivationFeedback?.profile ??
      toActivationFeedbackProfile(legacyRippleEffect?.mode) ??
      activationFeedbackConfig?.profile ??
      'surface';
    if (availableProfiles.includes(requested)) return requested;
    return availableProfiles[0] ?? null;
  }, [
    e1?.e?.afs,
    e1?.e?.afo,
    e1?.e?.afx,
    activationFeedback,
    rippleEffect,
    localActivationFeedback?.profile,
    legacyRippleEffect?.mode,
    availableActivationFeedbackProfiles,
    activationFeedbackConfig?.profile
  ]);

  const forceFeedback =
    localActivationFeedback?.profile !== undefined || legacyRippleEffect?.mode !== undefined;
  const mouseInputFeedback: ActivationFeedbackInputFeedback = forceFeedback
    ? 'feedback'
    : (activationFeedbackConfig?.inputFeedback?.mouse ?? 'feedback');
  const keyboardInputFeedback: ActivationFeedbackInputFeedback = forceFeedback
    ? 'feedback'
    : (activationFeedbackConfig?.inputFeedback?.keyboard ?? mouseInputFeedback);
  const pressedVisual: ActivationFeedbackPressedVisual =
    activationFeedbackProfile && activationFeedbackConfig?.pressedVisual === 'overlay'
      ? 'overlay'
      : 'state';
  const globalActivationFeedbackOrigin: ActivationFeedbackOrigin =
    activationFeedbackConfig?.origin ?? 'center';
  const localActivationFeedbackOrigin =
    localActivationFeedback?.origin ?? toActivationFeedbackOrigin(legacyRippleEffect?.origin);

  const modeActivationFeedbackRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig | null>(
    () => {
      if (!activationFeedbackProfile) return null;
      const profileConfig = resolveActivationFeedbackProfile(activationFeedbackProfile, {
        config: activationFeedbackConfig
      });
      const isOverflowProfile =
        activationFeedbackProfile === 'overflow' || activationFeedbackProfile === 'overflow-static';
      return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
        fallbackDurationMs: 468,
        isOverflowProfile
      });
    },
    [activationFeedbackProfile, activationFeedbackConfig]
  );

  const pressedActivationFeedbackRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(
    () => {
      const profileConfig = resolvePressedActivationFeedbackProfile({
        config: activationFeedbackConfig
      });
      return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
        fallbackDurationMs: 0,
        isOverflowProfile: false
      });
    },
    [activationFeedbackConfig]
  );

  const shouldForceOverlayPressed =
    status === 'pressed' && Boolean(activationFeedbackProfile) && pressedVisual === 'overlay';

  const activationFeedbackClassTokens = useMemo(() => {
    if (!activationFeedbackProfile) {
      return { base: '', profileBucket: '', pressedBucket: '', surfaceToneClass: '' };
    }

    return {
      base: e1?.e?.af ?? '',
      profileBucket: resolveActivationFeedbackBucketClass(activationFeedbackProfile, e1?.e),
      pressedBucket: resolveActivationFeedbackPressedBucketClass(e1?.e),
      surfaceToneClass: resolveActivationFeedbackSurfaceToneClass(emphasis, controlState)
    };
  }, [
    activationFeedbackProfile,
    emphasis,
    controlState,
    e1?.e?.af,
    e1?.e?.afs,
    e1?.e?.afo,
    e1?.e?.afx,
    e1?.e?.afp
  ]);

  const baseClassNames = useButtonClassNamesFromCommon(common, {
    statusOverride: shouldForceOverlayPressed ? 'rest' : status
  });

  const { isDisabled, ariaDisabled, ariaPressed } = resolveButtonAccessibilityFromCommon(common);

  const activationFeedbackMachine = useActivationFeedbackRadialStateMachine<HTMLButtonElement>({
    effectProfile: activationFeedbackProfile,
    isDisabled,
    pressedVisual,
    localActivationFeedbackOrigin,
    globalActivationFeedbackOrigin,
    mouseInputFeedback,
    keyboardInputFeedback,
    modeActivationFeedbackRadialRuntimeConfig: modeActivationFeedbackRuntimeConfig,
    pressedActivationFeedbackRadialRuntimeConfig: pressedActivationFeedbackRuntimeConfig,
    shouldForceOverlayPressed,
    allowPressedFeedback: controlState !== true,
    triggerPressed,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur
  });

  const shouldUsePressedFeedback = isPressed && controlState !== true;
  const shouldRenderActivationFeedbackActive =
    Boolean(activationFeedbackProfile) &&
    (activationFeedbackMachine.isActive || shouldForceOverlayPressed);
  const shouldUsePressedProfile =
    Boolean(activationFeedbackProfile) &&
    (activationFeedbackMachine.isOverlayActive || shouldForceOverlayPressed);
  const activationFeedbackProfileBucket = shouldUsePressedProfile
    ? activationFeedbackClassTokens.pressedBucket || activationFeedbackClassTokens.profileBucket
    : activationFeedbackClassTokens.profileBucket;
  const activationFeedbackClasses = [
    activationFeedbackClassTokens.base,
    activationFeedbackProfileBucket,
    activationFeedbackClassTokens.surfaceToneClass,
    activationFeedbackProfile ? 'k-btn-e1a' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const computed: NonNullable<HeadlessButtonProps['classNames']> = {
    ...baseClassNames,
    e1: `${baseClassNames.e1}${activationFeedbackClasses ? ` ${activationFeedbackClasses}` : ''}${
      shouldUsePressedFeedback ? ' k-pressed' : ''
    }${shouldRenderActivationFeedbackActive ? ' k-btn-e1b' : ''}${
      activationFeedbackMachine.isFading && activationFeedbackProfile && !shouldForceOverlayPressed
        ? ' k-btn-e1c'
        : ''
    }`
  };

  return (
    <HeadlessButton
      {...restProps}
      label={label}
      disabled={isDisabled}
      aria-disabled={ariaDisabled}
      aria-pressed={ariaPressed}
      classNames={computed}
      ref={activationFeedbackMachine.hostRef}
      onClick={activationFeedbackMachine.handleClick}
      onPointerDown={activationFeedbackMachine.handlePointerDown}
      onPointerUp={activationFeedbackMachine.handlePointerUp}
      onPointerCancel={activationFeedbackMachine.handlePointerCancel}
      onKeyDown={activationFeedbackMachine.handleKeyDown}
      onKeyUp={activationFeedbackMachine.handleKeyUp}
      onBlur={activationFeedbackMachine.handleBlur}
      tabIndex={tabIndex ?? 0}
    />
  );
}

const MemoButtonWithActivationFeedback = memo(Button);

export { MemoButtonWithActivationFeedback as ButtonWithActivationFeedback };
export default MemoButtonWithActivationFeedback;
