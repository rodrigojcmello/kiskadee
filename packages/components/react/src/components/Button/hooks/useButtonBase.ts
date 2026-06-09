import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ButtonProps, ButtonStatus } from '../Button.types.ts';
import {
  DEFAULT_BUTTON_INTENT,
  DEFAULT_BUTTON_PRESSED_DURATION_MS,
  DEFAULT_BUTTON_SCALE,
  resolveButtonClassNames
} from '../Button.class-names.ts';
import { useButtonArtifactConfig } from './useButtonArtifactConfig.ts';

export function useButtonCommonProps(props: ButtonProps) {
  const {
    classNames = {},
    status: statusProp = 'rest',
    toggle,
    controlState,
    scale = DEFAULT_BUTTON_SCALE,
    disabled,
    shadow = false,
    activationFeedback,
    rippleEffect,
    radius,
    radiusEffect = false,
    emphasis,
    intent = DEFAULT_BUTTON_INTENT,
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
    ...restProps
  } = props;

  const { buttonClassesMap, globalEffects, options } = useButtonArtifactConfig();
  const { e1, e2, e3 } = buttonClassesMap ?? {};
  const status: ButtonStatus | 'rest' = statusProp;

  return {
    classNames,
    status,
    toggle,
    controlState,
    scale,
    disabled,
    shadow,
    activationFeedback,
    rippleEffect,
    radius,
    radiusEffect,
    emphasis,
    intent,
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
    e2,
    e3,
    globalEffects,
    options
  };
}

export type ButtonCommonProps = ReturnType<typeof useButtonCommonProps>;

export function useButtonClassNamesFromCommon(
  common: ButtonCommonProps,
  options: { statusOverride?: ButtonStatus | 'rest' } = {}
): NonNullable<HeadlessButtonProps['classNames']> {
  return useMemo(
    () =>
      resolveButtonClassNames({
        e1: common.e1,
        e2: common.e2,
        e3: common.e3,
        classNames: common.classNames,
        status: options.statusOverride ?? common.status,
        controlState: common.controlState,
        scale: common.scale,
        shadow: common.shadow,
        radius: common.radius,
        radiusEffect: common.radiusEffect,
        emphasis: common.emphasis,
        intent: common.intent,
        globalRadius: common.options.radius
      }),
    [
      common.e1,
      common.e2,
      common.e3,
      common.classNames,
      options.statusOverride,
      common.status,
      common.controlState,
      common.scale,
      common.shadow,
      common.radius,
      common.radiusEffect,
      common.emphasis,
      common.intent,
      common.options.radius
    ]
  );
}

type ResolveButtonAccessibilityStateArgs = {
  disabled: boolean | undefined;
  status: ButtonStatus | 'rest';
  ariaDisabledProp: HeadlessButtonProps['aria-disabled'];
  ariaPressedProp: HeadlessButtonProps['aria-pressed'];
  toggle: boolean | undefined;
  controlState: boolean | undefined;
};

function resolveButtonAccessibilityState({
  disabled,
  status,
  ariaDisabledProp,
  ariaPressedProp,
  toggle,
  controlState
}: ResolveButtonAccessibilityStateArgs): {
  isDisabled: boolean | undefined;
  ariaDisabled: HeadlessButtonProps['aria-disabled'];
  ariaPressed: HeadlessButtonProps['aria-pressed'];
} {
  let isDisabled: boolean | undefined;
  if (disabled !== undefined) {
    isDisabled = disabled;
  } else if (status === 'disabled') {
    isDisabled = ariaDisabledProp === true ? undefined : true;
  } else {
    isDisabled = undefined;
  }

  const ariaPressed =
    ariaPressedProp ?? (toggle ? (controlState === true ? true : undefined) : undefined);

  return { isDisabled, ariaDisabled: ariaDisabledProp, ariaPressed };
}

export function resolveButtonAccessibilityFromCommon(common: ButtonCommonProps): {
  isDisabled: boolean | undefined;
  ariaDisabled: HeadlessButtonProps['aria-disabled'];
  ariaPressed: HeadlessButtonProps['aria-pressed'];
} {
  return resolveButtonAccessibilityState({
    disabled: common.disabled,
    status: common.status,
    ariaDisabledProp: common.restProps['aria-disabled'],
    ariaPressedProp: common.restProps['aria-pressed'],
    toggle: common.toggle,
    controlState: common.controlState
  });
}

export function useTransientPressedState(pressedDurationMs: number | undefined): {
  isPressed: boolean;
  triggerPressed: () => void;
} {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const duration = pressedDurationMs ?? DEFAULT_BUTTON_PRESSED_DURATION_MS;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const triggerPressed = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsPressed(false);
      timeoutRef.current = null;
    }, duration);
  };

  return { isPressed, triggerPressed };
}
