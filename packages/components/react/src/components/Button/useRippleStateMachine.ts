import type {
  RippleInputFeedback,
  RippleMode,
  RippleOrigin,
  RipplePressedVisual
} from '@kiskadee/core';
import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent
} from 'react';
import {
  type ActivationFeedbackInputFeedback,
  type ActivationFeedbackOrigin,
  type ActivationFeedbackPressedVisual,
  type ActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';

// [RIPPLE EFFECT 22] START: Backward-compatible Button ripple wrapper over shared activation-feedback runtime.
export type RippleRuntimeConfig = ActivationFeedbackRadialRuntimeConfig;

type RippleExternalHandlers = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
};

type UseRippleStateMachineArgs = RippleExternalHandlers & {
  rippleMode: RippleMode | null;
  isDisabled: boolean | undefined;
  pressedVisual: RipplePressedVisual;
  localRippleOrigin: RippleOrigin | undefined;
  globalRippleOrigin: RippleOrigin;
  mouseInputFeedback: RippleInputFeedback;
  keyboardInputFeedback: RippleInputFeedback;
  modeRippleRuntimeConfig: RippleRuntimeConfig | null;
  pressedRippleRuntimeConfig: RippleRuntimeConfig;
  shouldForceOverlayPressed: boolean;
  allowPressedFeedback: boolean;
  triggerPressed: () => void;
};

const RIPPLE_CSS_VARS = {
  endSize: '--k-ripple-end-size',
  startSize: '--k-ripple-start-size',
  x: '--k-ripple-x',
  y: '--k-ripple-y'
} as const;

function toActivationFeedbackInputFeedback(
  feedback: RippleInputFeedback
): ActivationFeedbackInputFeedback {
  return feedback === 'ripple' ? 'feedback' : 'pressed';
}

function toActivationFeedbackPressedVisual(
  pressedVisual: RipplePressedVisual
): ActivationFeedbackPressedVisual {
  return pressedVisual === 'overlay' ? 'overlay' : 'state';
}

export function useRippleStateMachine({
  rippleMode,
  pressedVisual,
  localRippleOrigin,
  globalRippleOrigin,
  mouseInputFeedback,
  keyboardInputFeedback,
  modeRippleRuntimeConfig,
  pressedRippleRuntimeConfig,
  ...rest
}: UseRippleStateMachineArgs) {
  return useActivationFeedbackRadialStateMachine<HTMLButtonElement>({
    ...rest,
    effectProfile: rippleMode,
    pressedVisual: toActivationFeedbackPressedVisual(pressedVisual),
    localActivationFeedbackOrigin: localRippleOrigin as ActivationFeedbackOrigin | undefined,
    globalActivationFeedbackOrigin: globalRippleOrigin as ActivationFeedbackOrigin,
    mouseInputFeedback: toActivationFeedbackInputFeedback(mouseInputFeedback),
    keyboardInputFeedback: toActivationFeedbackInputFeedback(keyboardInputFeedback),
    modeActivationFeedbackRadialRuntimeConfig: modeRippleRuntimeConfig,
    pressedActivationFeedbackRadialRuntimeConfig: pressedRippleRuntimeConfig,
    cssVars: RIPPLE_CSS_VARS
  });
}
// [RIPPLE EFFECT 22] END: Backward-compatible Button ripple wrapper over shared activation-feedback runtime.
