import './Switch.structural.css';
import './SwitchWithThumbSize.structural.css';
import './SwitchActivationFeedback.css';
import { breakpoints } from '@kiskadee/core';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import {
  memo,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import { useActivationFeedback } from '../effects/activation-feedback/useActivationFeedback.ts';
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
  hasSwitchActivationFeedbackEffect,
  hasSwitchThumbSizeEffect,
  join,
  resolveSwitchActivationFeedbackEffectClassName,
  resolveSwitchClassNames,
  resolveSwitchThumbSizeClassNames,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchProps, SwitchVariantClassesMap } from './Switch.types.ts';

export type SwitchWithEffectsProps = SwitchProps;

const SWITCH_CONTROL_SIDE_CLASS_NAME = 'k-swt-x2-a';
const SWITCH_CONTROL_TEXT_OFF_CLASS_NAME = 'k-swt-x3-a';
const SWITCH_CONTROL_TEXT_ON_CLASS_NAME = 'k-swt-x4-a';
const SWITCH_CONTROL_VISUAL_CLASS_NAME = 'k-swt-x6-a';
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
      const paddingBlockStart = parsePixelValue(trackStyles.paddingBlockStart);
      const paddingBlockEnd = parsePixelValue(trackStyles.paddingBlockEnd);
      const borderInlineStart = parsePixelValue(
        trackStyles.getPropertyValue('border-inline-start-width')
      );
      const borderBlockStart = parsePixelValue(
        trackStyles.getPropertyValue('border-block-start-width')
      );
      const trackContentWidth = trackElement.clientWidth - paddingInlineStart - paddingInlineEnd;
      const trackContentHeight = trackElement.clientHeight - paddingBlockStart - paddingBlockEnd;
      const thumbWidth = thumbElement.offsetWidth;
      const thumbHeight = thumbElement.offsetHeight;
      const translation = Math.max(0, trackContentWidth - thumbWidth);
      const inlineStart = borderInlineStart + paddingInlineStart;
      const blockStart =
        borderBlockStart + paddingBlockStart + Math.max(0, (trackContentHeight - thumbHeight) / 2);
      const scopeElement = trackElement.parentElement ?? trackElement;

      trackElement.style.setProperty('--k-swt-tx', `${translation}px`);
      trackElement.style.setProperty('--k-swt-ti', `${inlineStart}px`);
      trackElement.style.setProperty('--k-swt-ty', `${blockStart}px`);
      scopeElement.style.setProperty('--k-swt-tx', `${translation}px`);
      scopeElement.style.setProperty('--k-swt-ti', `${inlineStart}px`);
      scopeElement.style.setProperty('--k-swt-ty', `${blockStart}px`);
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
      trackElement.style.removeProperty('--k-swt-ti');
      trackElement.style.removeProperty('--k-swt-ty');
      trackElement.parentElement?.style.removeProperty('--k-swt-tx');
      trackElement.parentElement?.style.removeProperty('--k-swt-ti');
      trackElement.parentElement?.style.removeProperty('--k-swt-ty');
    };
  }, [options.trackRef, options.thumbRef]);
}

function SwitchWithEffectsRoot(props: SwitchWithEffectsProps) {
  const {
    id,
    label,
    controlText,
    className,
    classNames = {},
    inputProps,
    onPointerDown,
    onPointerCancel,
    onBlur,
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
  const controlVisualRef = useRef<HTMLSpanElement | null>(null);
  const isLargeControlTextViewport = useLargeControlTextViewport();
  const hasThumbSize = hasSwitchThumbSizeEffect(elements.e3, scale);
  const hasActivationFeedback = hasSwitchActivationFeedbackEffect(elements.e3);
  const hasLabel = label !== undefined && label !== null;
  const hasControlText = controlText !== undefined && controlText !== null;
  const shouldRenderControlText =
    hasControlText &&
    (resolvedControlTextVisibility === 'always' ||
      (resolvedControlTextVisibility === 'largeOnly' && isLargeControlTextViewport));

  useSwitchThumbTranslation({ trackRef, thumbRef });

  const shouldStartPointerFeedback = useCallback((event: PointerEvent<HTMLLabelElement>) => {
    const controlVisualElement = controlVisualRef.current;
    const target = event.target;

    return controlVisualElement !== null && target instanceof Node
      ? controlVisualElement.contains(target)
      : false;
  }, []);

  const {
    handleBlur,
    handleInputBlur,
    handleInputKeyDown,
    handlePointerCancel,
    handlePointerDown,
    isActive: isActivationFeedbackActive
  } = useActivationFeedback<HTMLLabelElement, HTMLInputElement>({
    config: global?.effects?.activationFeedback,
    disabled,
    readOnly,
    onPointerDown,
    onPointerCancel,
    onBlur,
    onInputKeyDown: inputProps?.onKeyDown,
    onInputBlur: inputProps?.onBlur,
    shouldStartPointerFeedback
  });

  const resolvedClassNames = useMemo(() => {
    const resolveBase = hasThumbSize ? resolveSwitchThumbSizeClassNames : resolveSwitchClassNames;
    return resolveBase({
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
    });
  }, [
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
    scale,
    hasThumbSize
  ]);
  const activationFeedbackClassName = hasActivationFeedback
    ? join(
        resolveSwitchActivationFeedbackEffectClassName(elements.e3),
        'k-af',
        isActivationFeedbackActive ? 'k-af-active' : ''
      )
    : '';
  const hasThumbVisual = 'x5' in resolvedClassNames;
  const { x5: resolvedThumbVisualClassName, ...headlessClassNames } = resolvedClassNames as
    | ReturnType<typeof resolveSwitchThumbSizeClassNames>
    | (ReturnType<typeof resolveSwitchClassNames> & { x5?: undefined });
  const thumbVisualClassName = resolvedThumbVisualClassName;
  const directThumbClassNames = {
    ...headlessClassNames,
    e3: join(headlessClassNames.e3, activationFeedbackClassName) ?? ''
  };
  const activationFeedbackInputProps = hasActivationFeedback
    ? {
        ...inputProps,
        onKeyDown: handleInputKeyDown,
        onBlur: handleInputBlur
      }
    : inputProps;

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={activationFeedbackInputProps}
      disabled={disabled}
      readOnly={readOnly}
      onPointerDown={hasActivationFeedback ? handlePointerDown : onPointerDown}
      onPointerCancel={hasActivationFeedback ? handlePointerCancel : onPointerCancel}
      onBlur={hasActivationFeedback ? handleBlur : onBlur}
      classNames={directThumbClassNames}
    >
      <span className={SWITCH_CONTROL_SIDE_CLASS_NAME}>
        {shouldRenderControlText && controlText ? (
          <HeadlessSwitch.State>
            <span className={SWITCH_CONTROL_TEXT_OFF_CLASS_NAME}>{controlText.off}</span>
            <span className={SWITCH_CONTROL_TEXT_ON_CLASS_NAME}>{controlText.on}</span>
          </HeadlessSwitch.State>
        ) : null}
        <span ref={controlVisualRef} className={SWITCH_CONTROL_VISUAL_CLASS_NAME}>
          <HeadlessSwitch.Track ref={trackRef} />
          <HeadlessSwitch.Thumb ref={thumbRef}>
            {hasThumbVisual ? <span className={thumbVisualClassName} /> : null}
          </HeadlessSwitch.Thumb>
        </span>
      </span>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export default memo(SwitchWithEffectsRoot);
