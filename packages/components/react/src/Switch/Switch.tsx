import './Switch.structural.css';
import { breakpoints } from '@kiskadee/core';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { memo, type RefObject, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_SWITCH_ACTIVATION_MOTION,
  DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY,
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_RADIUS,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  join,
  resolveSwitchClassNames,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchProps, SwitchVariantClassesMap } from './Switch.types.ts';

const SWITCH_CONTROL_SIDE_CLASS_NAME = 'k-swt-x2-a';
const SWITCH_CONTROL_TEXT_OFF_CLASS_NAME = 'k-swt-x3-a';
const SWITCH_CONTROL_TEXT_ON_CLASS_NAME = 'k-swt-x4-a';
const SWITCH_CONTROL_TEXT_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;

function parsePixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
}) {
  useEffect(() => {
    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const syncThumbTranslation = () => {
      const trackStyles = getComputedStyle(trackElement);
      const paddingInlineStart = parsePixelValue(trackStyles.paddingInlineStart);
      const paddingInlineEnd = parsePixelValue(trackStyles.paddingInlineEnd);
      const trackContentWidth = trackElement.clientWidth - paddingInlineStart - paddingInlineEnd;
      const thumbWidth = thumbElement.offsetWidth;
      const translation = Math.max(0, trackContentWidth - thumbWidth);

      trackElement.style.setProperty('--k-swt-tx', `${translation}px`);
    };

    syncThumbTranslation();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncThumbTranslation) : null;
    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(thumbElement);
    window.addEventListener('resize', syncThumbTranslation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncThumbTranslation);
      trackElement.style.removeProperty('--k-swt-tx');
    };
  }, [options.trackRef, options.thumbRef]);
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
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE,
    labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
    disabled,
    readOnly,
    ...rootProps
  } = props;
  const { classesMap, global } = useKiskadee();
  const resolvedRadius =
    radius ??
    global?.components?.switch?.options?.radius ??
    global?.radius ??
    DEFAULT_SWITCH_RADIUS;
  const resolvedActivationMotion =
    global?.components?.switch?.options?.activationMotion ?? DEFAULT_SWITCH_ACTIVATION_MOTION;
  const resolvedControlTextVisibility =
    global?.components?.switch?.options?.controlTextVisibility ??
    DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY;
  const elements = resolveVariantElements(
    classesMap.switch as SwitchVariantClassesMap | undefined,
    variant,
    mode
  );
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const isLargeControlTextViewport = useLargeControlTextViewport();
  const hasLabel = label !== undefined && label !== null;
  const hasControlText = controlText !== undefined && controlText !== null;
  const shouldRenderControlText =
    hasControlText &&
    (resolvedControlTextVisibility === 'always' ||
      (resolvedControlTextVisibility === 'largeOnly' && isLargeControlTextViewport));

  useSwitchThumbTranslation({ trackRef, thumbRef });

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
        <HeadlessSwitch.Track ref={trackRef}>
          <HeadlessSwitch.Thumb ref={thumbRef} />
        </HeadlessSwitch.Track>
      </span>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const Switch = memo(SwitchRoot);
