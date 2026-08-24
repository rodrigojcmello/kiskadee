import {
  type ButtonProps as HeadlessButtonProps,
  resolveButtonInteractionState
} from '@kiskadee/react-headless';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBrandPack } from '../../../shared/contexts/BrandPackContext.tsx';
import { useSurfaceContext } from '../../../shared/contexts/SurfaceContext.tsx';
import {
  DEFAULT_BUTTON_ICON_SURFACE_CORNERS,
  DEFAULT_BUTTON_ICON_TREATMENT,
  DEFAULT_BUTTON_INTENT,
  DEFAULT_BUTTON_PRESSED_DURATION_MS,
  DEFAULT_BUTTON_SCALE,
  resolveButtonClassNames
} from '../Button.class-names.ts';
import type { ButtonProps, ButtonStatus } from '../Button.types.ts';
import { useButtonArtifactConfig } from './useButtonArtifactConfig.ts';

declare const process: { env: { NODE_ENV?: string } };

export function useButtonCommonProps(props: ButtonProps) {
  const {
    classNames = {},
    status: statusProp = 'rest',
    toggle,
    controlState,
    pending,
    interactionLocked,
    scale = DEFAULT_BUTTON_SCALE,
    disabled,
    shadow = false,
    activationFeedback,
    radius,
    radiusEffect = false,
    emphasis,
    intent = DEFAULT_BUTTON_INTENT,
    surfaceContext: surfaceContextProp,
    tabIndex,
    label,
    icon,
    pressedDurationMs,
    iconLayout: iconLayoutProp,
    iconPlacement: iconPlacementProp,
    iconTreatment: iconTreatmentProp,
    iconSurfaceCorners: iconSurfaceCornersProp,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...restProps
  } = props;

  const brandPack = useBrandPack();
  const surfaceContext = useSurfaceContext(surfaceContextProp);
  const {
    buttonClassesMap,
    buttonClassesMapPending,
    componentEffects,
    contentSurfaceContext,
    globalEffects,
    options
  } = useButtonArtifactConfig();
  const { e1, e2, e3, e4, e5, e6 } = buttonClassesMap ?? {};
  const status: ButtonStatus | 'rest' = statusProp;
  const iconLayout = iconLayoutProp ?? options.iconLayout;
  const iconPlacement = iconPlacementProp ?? options.iconPlacement;
  const iconTreatment = iconTreatmentProp ?? options.iconTreatment ?? DEFAULT_BUTTON_ICON_TREATMENT;
  const iconSurfaceCorners =
    iconSurfaceCornersProp ?? options.iconSurfaceCorners ?? DEFAULT_BUTTON_ICON_SURFACE_CORNERS;
  const isBrandIntent = intent.startsWith('brand.');
  const supportsBrandIntent =
    !isBrandIntent || Boolean(brandPack?.hasComponent('button') && brandPack.hasIntent(intent));

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || supportsBrandIntent) return;

    console.error(
      `[Kiskadee] Button intent="${intent}" requires a compatible BrandPackBoundary. No brand color classes were applied.`
    );
  }, [intent, supportsBrandIntent]);

  return {
    classNames,
    status,
    toggle,
    controlState,
    pending,
    interactionLocked,
    scale,
    disabled,
    shadow,
    activationFeedback,
    radius,
    radiusEffect,
    emphasis,
    intent,
    surfaceContext,
    tabIndex,
    label,
    icon,
    pressedDurationMs,
    iconLayout,
    iconPlacement,
    iconTreatment,
    iconSurfaceCorners,
    iconLayoutWasExplicit: iconLayoutProp !== undefined,
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
    e4,
    e5,
    e6,
    buttonClassesMapPending,
    componentEffects,
    contentSurfaceContext,
    globalEffects,
    options
  };
}

export type ButtonCommonProps = ReturnType<typeof useButtonCommonProps>;

export function useButtonClassNamesFromCommon(
  common: ButtonCommonProps,
  options: {
    statusOverride?: ButtonStatus | 'rest';
    iconLayoutOverride?: ButtonProps['iconLayout'];
    iconTreatmentOverride?: ButtonProps['iconTreatment'];
  } = {}
) {
  return useMemo(
    () =>
      resolveButtonClassNames({
        e1: common.e1,
        e2: common.e2,
        e3: common.e3,
        e4: common.e4,
        e5: common.e5,
        e6: common.e6,
        classNames: common.classNames,
        status: options.statusOverride ?? common.status,
        controlState: common.controlState,
        scale: common.scale,
        shadow: common.shadow,
        radius: common.radius,
        radiusEffect: common.radiusEffect,
        emphasis: common.emphasis,
        intent: common.intent,
        surfaceContext: common.surfaceContext,
        iconLayout: options.iconLayoutOverride ?? common.iconLayout,
        iconPlacement: common.iconPlacement,
        iconSurfaceCorners: common.iconSurfaceCorners,
        iconTreatment: options.iconTreatmentOverride ?? common.iconTreatment,
        globalRadius: common.options.radius
      }),
    [
      common.e1,
      common.e2,
      common.e3,
      common.e4,
      common.e5,
      common.e6,
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
      common.surfaceContext,
      common.iconLayout,
      options.iconLayoutOverride,
      common.iconPlacement,
      common.iconSurfaceCorners,
      common.iconTreatment,
      options.iconTreatmentOverride,
      common.options.radius
    ]
  );
}

type ResolveButtonAccessibilityStateArgs = {
  disabled: boolean | undefined;
  status: ButtonStatus | 'rest';
  pending: boolean | undefined;
  interactionLocked: boolean | undefined;
  ariaBusyProp: HeadlessButtonProps['aria-busy'];
  ariaDisabledProp: HeadlessButtonProps['aria-disabled'];
  ariaPressedProp: HeadlessButtonProps['aria-pressed'];
  toggle: boolean | undefined;
  controlState: boolean | undefined;
};

function resolveButtonAccessibilityState({
  disabled,
  status,
  pending,
  interactionLocked,
  ariaBusyProp,
  ariaDisabledProp,
  ariaPressedProp,
  toggle,
  controlState
}: ResolveButtonAccessibilityStateArgs): {
  activationBlocked: boolean;
  nativeDisabled: boolean;
  pending: boolean;
  visualStatus: ButtonStatus | 'rest';
  ariaBusy: HeadlessButtonProps['aria-busy'];
  ariaDisabled: HeadlessButtonProps['aria-disabled'];
  ariaPressed: HeadlessButtonProps['aria-pressed'];
} {
  const statusDisabled = status === 'disabled';
  const usesAriaDisabled = ariaDisabledProp === true || ariaDisabledProp === 'true';
  const shouldUseNativeDisabled = disabled === true || (statusDisabled && !usesAriaDisabled);
  const interactionState = resolveButtonInteractionState({
    disabled: shouldUseNativeDisabled,
    interactionLocked,
    pending: statusDisabled ? false : pending,
    ariaBusy: ariaBusyProp,
    ariaDisabled: ariaDisabledProp
  });

  const ariaPressed =
    ariaPressedProp ?? (toggle ? (controlState === true ? true : undefined) : undefined);
  const visualStatus: ButtonStatus | 'rest' = interactionState.nativeDisabled
    ? 'disabled'
    : interactionState.pending
      ? 'pending'
      : status;

  return {
    activationBlocked: interactionState.activationBlocked,
    nativeDisabled: interactionState.nativeDisabled,
    pending: interactionState.pending,
    visualStatus,
    ariaBusy: interactionState.ariaBusy,
    ariaDisabled: interactionState.ariaDisabled,
    ariaPressed
  };
}

export function resolveButtonAccessibilityFromCommon(common: ButtonCommonProps): {
  activationBlocked: boolean;
  nativeDisabled: boolean;
  pending: boolean;
  visualStatus: ButtonStatus | 'rest';
  ariaBusy: HeadlessButtonProps['aria-busy'];
  ariaDisabled: HeadlessButtonProps['aria-disabled'];
  ariaPressed: HeadlessButtonProps['aria-pressed'];
} {
  return resolveButtonAccessibilityState({
    disabled: common.disabled,
    status: common.status,
    pending: common.pending,
    interactionLocked: common.interactionLocked,
    ariaBusyProp: common.restProps['aria-busy'],
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
