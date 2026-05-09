import './Switch.structural.css';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { memo, type RefObject, useEffect, useMemo, useRef } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_RADIUS,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  join,
  resolveSwitchClassNames,
  resolveVariantElements,
  SWITCH_STATE_PROJECTION
} from './Switch.class-names.ts';
import type { SwitchProps, SwitchVariantClassesMap } from './Switch.types.ts';

function parsePixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
    state,
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
  const resolvedRadius = radius ?? global?.radius ?? DEFAULT_SWITCH_RADIUS;
  const elements = resolveVariantElements(
    classesMap.switch as SwitchVariantClassesMap | undefined,
    variant,
    mode
  );
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const hasLabel = label !== undefined && label !== null;
  const hasState = state !== undefined && state !== null;

  useSwitchThumbTranslation({ trackRef, thumbRef });

  const resolvedClassNames = useMemo(
    () =>
      resolveSwitchClassNames({
        elements,
        classNames: {
          ...classNames,
          e1: join(classNames.e1, className)
        },
        scale,
        intent,
        emphasis,
        radius: resolvedRadius,
        labelPosition,
        hasLabel,
        hasState
      }),
    [
      classNames,
      className,
      elements,
      emphasis,
      hasLabel,
      hasState,
      intent,
      labelPosition,
      resolvedRadius,
      scale
    ]
  );

  const { className: inputClassName, ...restInputProps } = inputProps ?? {};

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      disabled={disabled}
      readOnly={readOnly}
      classNames={resolvedClassNames}
      stateProjection={SWITCH_STATE_PROJECTION}
    >
      <HeadlessSwitch.Input {...restInputProps} className={inputClassName} />
      <HeadlessSwitch.Track ref={trackRef}>
        {hasState ? <HeadlessSwitch.State>{state}</HeadlessSwitch.State> : null}
        <HeadlessSwitch.Thumb ref={thumbRef} />
      </HeadlessSwitch.Track>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const Switch = memo(SwitchRoot);
