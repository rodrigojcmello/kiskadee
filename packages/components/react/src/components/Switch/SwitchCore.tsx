import './Switch.structural.css';
import { breakpoints } from '@kiskadee/core';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import {
  memo,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore
} from 'react';
import {
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  join,
  resolveSwitchClassNames,
  resolveVariantElements
} from './Switch.class-names.ts';
import {
  applySwitchGeometry,
  calculateSwitchGeometry,
  clearSwitchGeometry
} from './Switch.geometry.ts';
import type { SwitchProps } from './Switch.types.ts';
import { useSwitchArtifactConfig } from './useSwitchArtifactConfig.ts';

const SWITCH_CONTROL_SIDE_CLASS_NAME = 'k-swt-x2-a';
const SWITCH_CONTROL_TEXT_OFF_CLASS_NAME = 'k-swt-x3-a';
const SWITCH_CONTROL_TEXT_ON_CLASS_NAME = 'k-swt-x4-a';
const SWITCH_CONTROL_VISUAL_CLASS_NAME = 'k-swt-x6-a';
const SWITCH_CONTROL_TEXT_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;

function subscribeToLargeControlTextViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange);
  };
}

function getLargeControlTextViewportSnapshot(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY).matches
  );
}

function getLargeControlTextViewportServerSnapshot(): boolean {
  return false;
}

function useLargeControlTextViewport(): boolean {
  return useSyncExternalStore(
    subscribeToLargeControlTextViewport,
    getLargeControlTextViewportSnapshot,
    getLargeControlTextViewportServerSnapshot
  );
}

function useSwitchThumbTranslation(options: {
  trackRef: RefObject<HTMLSpanElement | null>;
  thumbRef: RefObject<HTMLSpanElement | null>;
  geometryKey: string;
}) {
  const syncThumbTranslation = useCallback(() => {
    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    applySwitchGeometry(trackElement, calculateSwitchGeometry(trackElement, thumbElement));
  }, [options.trackRef, options.thumbRef]);

  useEffect(() => {
    syncThumbTranslation();
  }, [options.geometryKey, syncThumbTranslation]);

  useEffect(() => {
    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncThumbTranslation) : null;
    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(thumbElement);
    window.addEventListener('resize', syncThumbTranslation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncThumbTranslation);
      clearSwitchGeometry(trackElement);
    };
  }, [options.trackRef, options.thumbRef, syncThumbTranslation]);
}

function SwitchRoot(props: SwitchProps) {
  const {
    id,
    label,
    controlText,
    className,
    classNames = {},
    inputProps,
    scale = DEFAULT_SWITCH_SCALE,
    emphasis = DEFAULT_SWITCH_EMPHASIS,
    intent = DEFAULT_SWITCH_INTENT,
    radius,
    thumbSize: _thumbSize,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE,
    labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
    disabled,
    readOnly,
    ...rootProps
  } = props;
  const { switchClassesMap, options } = useSwitchArtifactConfig();
  const resolvedRadius = radius ?? options.radius;
  const resolvedActivationMotion = options.activationMotion;
  const resolvedControlTextVisibility = options.controlTextVisibility;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const isLargeControlTextViewport = useLargeControlTextViewport();
  const hasLabel = label !== undefined && label !== null;
  const hasControlText = controlText !== undefined && controlText !== null;
  const shouldRenderControlText =
    hasControlText &&
    (resolvedControlTextVisibility === 'always' ||
      (resolvedControlTextVisibility === 'largeOnly' && isLargeControlTextViewport));

  const resolvedClassNames = useMemo(
    () =>
      resolveSwitchClassNames({
        elements,
        classNames: {
          ...classNames,
          e1: join(classNames.e1, className)
        },
        structuralBranch: 'a',
        scale,
        intent,
        emphasis,
        radius: resolvedRadius,
        activationMotion: resolvedActivationMotion,
        labelPosition,
        hasLabel,
        hasControlText: shouldRenderControlText
      }),
    [
      classNames,
      className,
      elements,
      emphasis,
      hasLabel,
      shouldRenderControlText,
      intent,
      labelPosition,
      resolvedActivationMotion,
      resolvedControlTextVisibility,
      resolvedRadius,
      scale
    ]
  );

  useSwitchThumbTranslation({
    trackRef,
    thumbRef,
    geometryKey: `${resolvedClassNames.e2}|${resolvedClassNames.e3}`
  });

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={inputProps}
      disabled={disabled}
      readOnly={readOnly}
      classNames={resolvedClassNames}
    >
      <span className={SWITCH_CONTROL_SIDE_CLASS_NAME}>
        {shouldRenderControlText && controlText ? (
          <HeadlessSwitch.State>
            <span className={SWITCH_CONTROL_TEXT_OFF_CLASS_NAME}>{controlText.off}</span>
            <span className={SWITCH_CONTROL_TEXT_ON_CLASS_NAME}>{controlText.on}</span>
          </HeadlessSwitch.State>
        ) : null}
        <span className={SWITCH_CONTROL_VISUAL_CLASS_NAME}>
          <HeadlessSwitch.Track ref={trackRef} />
          <HeadlessSwitch.Thumb ref={thumbRef} />
        </span>
      </span>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const SwitchCore = memo(SwitchRoot);
