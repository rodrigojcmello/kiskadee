import './ButtonWithRipple.css';
import type {
  RippleInputFeedback,
  RippleMode,
  RippleOrigin,
  RipplePressedVisual,
  RippleProfile
} from '@kiskadee/core';
import {
  resolvePressedRippleProfile,
  resolveRippleDurationMs,
  resolveRippleProfile
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { memo, useMemo } from 'react';
import type { ButtonProps } from './Button.types.ts';
import {
  type RippleEffectBuckets,
  resolveRippleModeAvailability
} from './rippleModeAvailability.ts';
import {
  resolveButtonAccessibilityFromCommon,
  useButtonClassNamesFromCommon,
  useButtonCommonProps,
  useTransientPressedState
} from './useButtonBase';
import { type RippleRuntimeConfig, useRippleStateMachine } from './useRippleStateMachine.ts';

// [RIPPLE EFFECT 23] START: Runtime helper utilities.
const DEFAULT_RIPPLE_START_SIZE_PX = 18;

const resolveRippleRuntimeConfig = (
  profile: RippleProfile,
  fallbackDurationMs: number,
  isOverflowMode: boolean
): RippleRuntimeConfig => {
  const configuredSize =
    profile.size === 'auto'
      ? 'auto'
      : typeof profile.size === 'number' && profile.size > 0
        ? profile.size
        : 'auto';

  return {
    size: configuredSize,
    durationMs: resolveRippleDurationMs(profile.durationToken, fallbackDurationMs),
    releaseRatio: isOverflowMode && profile.animateSize ? 0.8 : 1,
    fadeDelayMs: resolveRippleDurationMs(profile.fade?.delayToken, 50),
    fadeDurationMs: resolveRippleDurationMs(profile.fade?.durationToken, 100),
    startSizePx: DEFAULT_RIPPLE_START_SIZE_PX
  };
};
// [RIPPLE EFFECT 23] END: Runtime helper utilities.

// [RIPPLE EFFECT 24] START: Class-name composition helpers.
const resolveRippleBucketClass = (
  rippleMode: RippleMode | null,
  effects: RippleEffectBuckets | undefined
): string => {
  if (!rippleMode) return '';
  if (rippleMode === 'surface') return effects?.ris ?? '';
  if (rippleMode === 'overflow') return effects?.rio ?? '';
  if (rippleMode === 'overflow-static') return effects?.rix ?? '';
  return '';
};

const resolveRipplePressedBucketClass = (effects: RippleEffectBuckets | undefined): string =>
  effects?.rip ?? '';

const resolveRippleEmphasisClass = (
  emphasis: ButtonProps['emphasis'],
  controlState: boolean | undefined
): string => {
  if (controlState) return 'k-emph-h';
  if (emphasis === 'high') return 'k-emph-h';
  if (emphasis === 'low') return 'k-emph-l';
  if (emphasis === 'lowest') return 'k-emph-ll';
  return 'k-emph-m';
};
// [RIPPLE EFFECT 24] END: Class-name composition helpers.

export type ButtonWithRippleProps = ButtonProps & {
  availableRippleModes?: RippleMode[];
};

function Button(inputProps: ButtonWithRippleProps) {
  const { availableRippleModes, ...props } = inputProps;
  const common = useButtonCommonProps(props);
  const {
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

  const localRippleEffect =
    rippleEffect && typeof rippleEffect === 'object' ? rippleEffect : undefined;

  // Note: We always apply 's:all' and a size-specific scale.
  // If no `scale` prop is passed, we default to the median 's:md:1' so the button never renders without a scale.

  const { isPressed, triggerPressed } = useTransientPressedState(pressedDurationMs);

  // [RIPPLE EFFECT 25] START: Mode and input-feedback resolution.
  const rippleMode = useMemo<RippleMode | null>(() => {
    const availableModes = availableRippleModes ?? resolveRippleModeAvailability(e1);
    if (availableModes.length === 0) return null;
    if (rippleEffect === false) return null;

    const globalMode = global?.effects?.ripple?.mode ?? 'surface';
    const requested = localRippleEffect?.mode ?? globalMode;
    if (availableModes.includes(requested)) return requested;
    return availableModes[0] ?? null;
  }, [
    e1?.e?.ris,
    e1?.e?.rio,
    e1?.e?.rix,
    rippleEffect,
    localRippleEffect?.mode,
    availableRippleModes,
    global?.effects?.ripple?.mode
  ]);

  const forceRippleFeedback = localRippleEffect?.mode !== undefined;
  const mouseInputFeedback: RippleInputFeedback = forceRippleFeedback
    ? 'ripple'
    : (global?.effects?.ripple?.inputFeedback?.mouse ?? 'ripple');
  const keyboardInputFeedback: RippleInputFeedback = forceRippleFeedback
    ? 'ripple'
    : (global?.effects?.ripple?.inputFeedback?.keyboard ?? mouseInputFeedback);
  const pressedVisual: RipplePressedVisual =
    rippleMode && global?.effects?.ripple?.pressedVisual === 'overlay' ? 'overlay' : 'state';
  const globalRippleOrigin: RippleOrigin = global?.effects?.ripple?.origin ?? 'center';
  const rippleConfig = global?.effects?.ripple;

  const modeRippleRuntimeConfig = useMemo<RippleRuntimeConfig | null>(() => {
    if (!rippleMode) return null;
    const profile = resolveRippleProfile(rippleMode, { config: rippleConfig });
    const isOverflowMode = rippleMode === 'overflow' || rippleMode === 'overflow-static';
    return resolveRippleRuntimeConfig(profile, 468, isOverflowMode);
  }, [rippleMode, rippleConfig]);

  const pressedRippleRuntimeConfig = useMemo<RippleRuntimeConfig>(() => {
    const profile = resolvePressedRippleProfile({ config: rippleConfig });
    return resolveRippleRuntimeConfig(profile, 0, false);
  }, [rippleConfig]);

  const shouldForceOverlayPressed =
    status === 'pressed' && Boolean(rippleMode) && pressedVisual === 'overlay';
  // [RIPPLE EFFECT 25] END: Mode and input-feedback resolution.

  // [RIPPLE EFFECT 26] START: Compose ripple-only classes in ripple component.
  const rippleClassTokens = useMemo(() => {
    if (!rippleMode) {
      return { modeBucket: '', pressedBucket: '', emphasisClass: '' };
    }

    return {
      modeBucket: resolveRippleBucketClass(rippleMode, e1?.e),
      pressedBucket: resolveRipplePressedBucketClass(e1?.e),
      emphasisClass: resolveRippleEmphasisClass(emphasis, controlState)
    };
  }, [rippleMode, emphasis, controlState, e1?.e?.ris, e1?.e?.rio, e1?.e?.rix, e1?.e?.rip]);
  // [RIPPLE EFFECT 26] END: Compose ripple-only classes in ripple component.

  const baseClassNames = useButtonClassNamesFromCommon(common, {
    statusOverride: shouldForceOverlayPressed ? 'rest' : status
  });

  const { isDisabled, ariaDisabled, ariaPressed } = resolveButtonAccessibilityFromCommon(common);

  const rippleMachine = useRippleStateMachine({
    rippleMode,
    isDisabled,
    pressedVisual,
    localRippleOrigin: localRippleEffect?.origin,
    globalRippleOrigin,
    mouseInputFeedback,
    keyboardInputFeedback,
    modeRippleRuntimeConfig,
    pressedRippleRuntimeConfig,
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

  // k-pressed is short-lived click feedback for non-toggle buttons; toggles use selected styles.
  const shouldUsePressedFeedback = isPressed && controlState !== true;
  const shouldRenderRippleActive =
    Boolean(rippleMode) && (rippleMachine.isRippleActive || shouldForceOverlayPressed);
  const shouldUsePressedRippleProfile =
    Boolean(rippleMode) && (rippleMachine.isOverlayRippleActive || shouldForceOverlayPressed);
  const rippleProfileBucket = shouldUsePressedRippleProfile
    ? rippleClassTokens.pressedBucket || rippleClassTokens.modeBucket
    : rippleClassTokens.modeBucket;
  const rippleClasses = [rippleProfileBucket, rippleClassTokens.emphasisClass, 'k-ripple']
    .filter(Boolean)
    .join(' ');

  const computed: NonNullable<HeadlessButtonProps['classNames']> = {
    ...baseClassNames,
    e1: `${baseClassNames.e1}${rippleClasses ? ` ${rippleClasses}` : ''}${
      shouldUsePressedFeedback ? ' k-pressed' : ''
    }${shouldRenderRippleActive ? ' k-ripple-active' : ''}${
      rippleMachine.isRippleFading && rippleMode && !shouldForceOverlayPressed
        ? ' k-ripple-fade'
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
      ref={rippleMachine.buttonRef}
      onClick={rippleMachine.handleClick}
      onPointerDown={rippleMachine.handlePointerDown}
      onPointerUp={rippleMachine.handlePointerUp}
      onPointerCancel={rippleMachine.handlePointerCancel}
      onKeyDown={rippleMachine.handleKeyDown}
      onKeyUp={rippleMachine.handleKeyUp}
      onBlur={rippleMachine.handleBlur}
      // Safari (macOS and iOS) requires tabIndex to support focus
      tabIndex={tabIndex ?? 0}
    />
  );
}

const MemoButtonWithRipple = memo(Button);

export { MemoButtonWithRipple as ButtonWithRipple };
export default MemoButtonWithRipple;
