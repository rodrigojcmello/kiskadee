import {
  type ButtonIntent,
  type ClassNameByElementJSON,
  type ColorClasses,
  type ComponentEmphasis,
  stateActivator as cn,
  componentEmphasisBuckets,
  type EffectClassBucketJSON,
  type RadiusMode
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import type { ButtonProps, ButtonStatus } from './Button.types.ts';

const DEFAULT_SCALE = 's:md:1';
const DEFAULT_RADIUS: RadiusMode = 'rounded';
const DEFAULT_INTENT: ButtonIntent = 'neutral';
const DEFAULT_PRESSED_DURATION_MS = 60;

function collectStr(
  el: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = 'medium',
  intent: ButtonIntent | undefined = DEFAULT_INTENT
): string {
  if (!el) return '';
  let out = '';
  if (el.d) out = el.d;

  const c = el.c as Record<ButtonIntent, ColorClasses> | undefined;
  const bySem = c ? c[intent] : undefined;

  if (bySem) {
    const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
    const bySemBuckets = bySem as Record<string, string | undefined>;
    const color = bucket
      ? (bySemBuckets[bucket] ?? '')
      : !emphasis
        ? (bySem.h ?? bySem.m ?? bySem.l ?? bySem.ll ?? '')
        : '';

    if (color) out = out ? `${out} ${color}` : color;
  }

  return out;
}

const normalizeScaleKey = (key: string): string => (key.startsWith('s:') ? key.slice(2) : key);

function resolveEffectBucketClass(
  bucket: EffectClassBucketJSON | undefined,
  scaleKey: string
): string {
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;

  const all = bucket.all ?? '';
  const sized = bucket[scaleKey] ?? '';

  return [all, sized].filter(Boolean).join(' ');
}

type UseButtonClassNamesArgs = {
  e1: ClassNameByElementJSON | undefined;
  e2: ClassNameByElementJSON | undefined;
  e3: ClassNameByElementJSON | undefined;
  classNames: NonNullable<ButtonProps['classNames']>;
  status: ButtonStatus | 'rest';
  controlState: boolean | undefined;
  scale: string | undefined;
  shadow: boolean;
  radius: RadiusMode | undefined;
  radiusEffect: boolean;
  emphasis: ComponentEmphasis | undefined;
  intent: ButtonIntent | undefined;
  globalRadius: RadiusMode | undefined;
};

function useButtonClassNames({
  e1,
  e2,
  e3,
  classNames,
  status,
  controlState,
  scale,
  shadow,
  radius,
  radiusEffect,
  emphasis,
  intent,
  globalRadius
}: UseButtonClassNamesArgs): NonNullable<HeadlessButtonProps['classNames']> {
  return useMemo<NonNullable<HeadlessButtonProps['classNames']>>(() => {
    const el1 = collectStr(e1, emphasis, intent ?? DEFAULT_INTENT);
    const el2 = collectStr(e2, emphasis, intent ?? DEFAULT_INTENT);
    const el3 = collectStr(e3, emphasis, intent ?? DEFAULT_INTENT);

    const scaleKey = normalizeScaleKey(scale ?? DEFAULT_SCALE);
    const sAllE1 = e1?.s?.all ?? '';
    const sScaleE1 = e1?.s?.[scaleKey] ?? '';
    const sAllE2 = e2?.s?.all ?? '';
    const sScaleE2 = e2?.s?.[scaleKey] ?? '';

    const radiusMode = radius ?? globalRadius ?? DEFAULT_RADIUS;
    const rAllE1 =
      radiusMode === 'rounded'
        ? (e1?.rr?.all ?? '')
        : radiusMode === 'pill'
          ? (e1?.rp?.all ?? '')
          : (e1?.rs?.all ?? '');
    const rScaleE1 =
      radiusMode === 'rounded'
        ? (e1?.rr?.[scaleKey] ?? '')
        : radiusMode === 'pill'
          ? (e1?.rp?.[scaleKey] ?? '')
          : (e1?.rs?.[scaleKey] ?? '');

    const effects = e1?.e;
    const shadowEffects = shadow ? (effects?.h ?? '') : '';
    const radiusEffects = radiusEffect
      ? radiusMode === 'rounded'
        ? resolveEffectBucketClass(effects?.rr, scaleKey)
        : radiusMode === 'pill'
          ? resolveEffectBucketClass(effects?.rp, scaleKey)
          : ''
      : '';
    const e1Effects = [shadowEffects, radiusEffects].filter(Boolean).join(' ');
    const selected = controlState ? (e1?.l ?? '') : '';

    const e1Base =
      (el1 ? `${el1}` : '') +
      (sAllE1 ? ` ${sAllE1}` : '') +
      (classNames.e1 ? ` ${classNames.e1}` : '') +
      (sScaleE1 ? ` ${sScaleE1}` : '') +
      (rAllE1 ? ` ${rAllE1}` : '') +
      (rScaleE1 ? ` ${rScaleE1}` : '') +
      (e1Effects ? ` ${e1Effects}` : '') +
      (selected ? ` ${selected}` : '');

    const e2Base =
      (el2 ? `${el2}` : '') +
      (sAllE2 ? ` ${sAllE2}` : '') +
      (classNames.e2 ? ` ${classNames.e2}` : '') +
      (sScaleE2 ? ` ${sScaleE2}` : '');

    const e3Base = (el3 || '') + (classNames.e3 ? (el3 ? ' ' : '') + classNames.e3 : '');

    let activation = '';
    if (status !== 'rest') {
      const forced = cn[status];
      if (forced) activation += ` ${forced}`;
    }
    if (controlState) activation += ` ${cn.selected}`;
    if (activation) activation += ` ${cn.activator}`;
    const shadowFlag = shadow ? ` ${cn.shadow}` : '';

    return {
      e1: `${e1Base} ${cn.interactive}${shadowFlag}${activation} k-btn k-foc k-state`,
      e2: e2Base,
      e3: e3Base
    };
  }, [
    e1,
    e2,
    e3,
    classNames.e1,
    classNames.e2,
    classNames.e3,
    status,
    controlState,
    scale,
    shadow,
    radius,
    radiusEffect,
    emphasis,
    intent,
    globalRadius
  ]);
}

function useButtonCommonProps(props: ButtonProps) {
  const {
    classNames = {},
    status: statusProp = 'rest',
    toggle,
    controlState,
    scale = DEFAULT_SCALE,
    disabled,
    shadow = false,
    // [RIPPLE EFFECT 18] START: Local ripple prop passthrough in common button props.
    rippleEffect,
    // [RIPPLE EFFECT 18] END: Local ripple prop passthrough in common button props.
    radius,
    radiusEffect = false,
    emphasis,
    intent = DEFAULT_INTENT,
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

  const { classesMap, global } = useKiskadee();
  const buttonComponent = classesMap.button as
    | Record<string, ClassNameByElementJSON>
    | Record<string, Record<string, ClassNameByElementJSON>>
    | undefined;
  const buttonElements =
    buttonComponent && Object.hasOwn(buttonComponent, 'e1')
      ? (buttonComponent as Record<string, ClassNameByElementJSON>)
      : undefined;
  const { e1, e2, e3 } = buttonElements ?? {};
  const status: ButtonStatus | 'rest' = statusProp;

  return {
    classNames,
    status,
    toggle,
    controlState,
    scale,
    disabled,
    shadow,
    // [RIPPLE EFFECT 18] START: Local ripple prop passthrough in common button props.
    rippleEffect,
    // [RIPPLE EFFECT 18] END: Local ripple prop passthrough in common button props.
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
    global
  };
}

type ButtonCommonProps = ReturnType<typeof useButtonCommonProps>;

function useButtonClassNamesFromCommon(
  common: ButtonCommonProps,
  options: { statusOverride?: ButtonStatus | 'rest' } = {}
): NonNullable<HeadlessButtonProps['classNames']> {
  return useButtonClassNames({
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
    globalRadius: common.global?.radius
  });
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

function resolveButtonAccessibilityFromCommon(common: ButtonCommonProps): {
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

function useTransientPressedState(pressedDurationMs: number | undefined): {
  isPressed: boolean;
  triggerPressed: () => void;
} {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const duration = pressedDurationMs ?? DEFAULT_PRESSED_DURATION_MS;

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

export {
  DEFAULT_PRESSED_DURATION_MS,
  resolveButtonAccessibilityFromCommon,
  resolveButtonAccessibilityState,
  useButtonClassNamesFromCommon,
  useButtonClassNames,
  useButtonCommonProps,
  useTransientPressedState
};
