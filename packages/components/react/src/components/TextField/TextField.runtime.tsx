import type {
  RadiusMode,
  TextFieldFloatingMode,
  TextFieldLabelOffsetByRadius,
  TextFieldLabelOffsetStrategy,
  TextFieldLabelPlacement,
  TextFieldStandardMode
} from '@kiskadee/core';
import { HeadlessTextField } from '@kiskadee/react-headless';
import { memo, type Ref, type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import { useComponentScale } from '../../shared/contexts/DensityContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import {
  resolveContentSurfaceContext,
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { hasTextFieldContent, TextFieldManagedActions } from './TextField.actions.tsx';
import {
  DEFAULT_TEXT_FIELD_EMPHASIS,
  DEFAULT_TEXT_FIELD_FOCUS_RING_COLOR_SOURCE,
  DEFAULT_TEXT_FIELD_INTENT,
  DEFAULT_TEXT_FIELD_LABEL_PLACEMENT,
  DEFAULT_TEXT_FIELD_RADIUS,
  resolveTextFieldClassNames,
  resolveTextFieldContentClassNames,
  resolveVariantElements,
  TEXT_FIELD_STATE_PROJECTION
} from './TextField.class-names';
import { TextFieldContentContext } from './TextField.content.tsx';
import {
  getTextFieldInlineStartOffset,
  observeTextFieldContentLayout,
  observeTextFieldDirection
} from './TextField.direction.runtime.ts';
import type { TextFieldStructuralDescriptor } from './TextField.structural.ts';
import type {
  TextFieldClassesMap,
  TextFieldFloatingInsideProps,
  TextFieldFloatingNotchedProps,
  TextFieldProps,
  TextFieldStandardBorderlessProps,
  TextFieldStandardOutlineProps,
  TextFieldStandardProps,
  TextFieldStandardUnderlineProps,
  TextFieldVariantClassesMap
} from './TextField.types';
import { useLazyFloatingRestTypography } from './useLazyFloatingRestTypography.ts';
import { useTextFieldArtifactConfig } from './useTextFieldArtifactConfig.ts';

type CreateTextFieldComponentOptions = {
  displayName: string;
  structural: TextFieldStructuralDescriptor;
  layout: 'standard' | 'floating';
};

type TextFieldRuntimeProps = TextFieldProps & {
  labelPlacement?: TextFieldLabelPlacement;
};

const loadFloatingRestTypography = () =>
  import('./floatingRestTypography.runtime.ts').then((module) => module.bindFloatingRestTypography);

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function resolveLabelOffsetStrategy(
  labelOffset: TextFieldLabelOffsetStrategy | TextFieldLabelOffsetByRadius | undefined,
  radius: RadiusMode
): TextFieldLabelOffsetStrategy {
  if (!labelOffset) return 'schema';
  if (typeof labelOffset === 'string') return labelOffset;
  return labelOffset[radius] ?? 'schema';
}

function resolveTextFieldLabelPlacement(options: {
  layout: 'standard' | 'floating';
  prop: TextFieldLabelPlacement | undefined;
  schema: TextFieldLabelPlacement | undefined;
}): TextFieldLabelPlacement {
  if (options.layout !== 'standard') return DEFAULT_TEXT_FIELD_LABEL_PLACEMENT;
  return options.prop ?? options.schema ?? DEFAULT_TEXT_FIELD_LABEL_PLACEMENT;
}

function useInputStartLabelOffset(options: {
  enabled: boolean;
  labelRef: RefObject<HTMLLabelElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  controlRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const labelElement = options.labelRef.current;
    const inputElement = options.inputRef.current;
    const controlElement = options.controlRef.current;

    if (!options.enabled || !labelElement || !inputElement || !controlElement) {
      labelElement?.style.removeProperty('--k-txf-iis');
      labelElement?.style.removeProperty('--k-txf-lps');
      return;
    }

    const syncInputStart = () => {
      const labelStyles = getComputedStyle(labelElement);
      const inputInlineStart = getTextFieldInlineStartOffset(controlElement, inputElement);
      const labelPaddingStart = Number.parseFloat(labelStyles.paddingInlineStart);

      labelElement.style.setProperty('--k-txf-iis', `${inputInlineStart}px`);
      labelElement.style.setProperty(
        '--k-txf-lps',
        `${Number.isFinite(labelPaddingStart) ? labelPaddingStart : 0}px`
      );
    };

    syncInputStart();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncInputStart) : null;
    resizeObserver?.observe(labelElement);
    resizeObserver?.observe(inputElement);
    resizeObserver?.observe(controlElement);
    const stopObservingDirection = observeTextFieldDirection(controlElement, syncInputStart);
    const stopObservingContent = observeTextFieldContentLayout(controlElement, syncInputStart);
    window.addEventListener('resize', syncInputStart);

    return () => {
      resizeObserver?.disconnect();
      stopObservingDirection();
      stopObservingContent();
      window.removeEventListener('resize', syncInputStart);
      labelElement.style.removeProperty('--k-txf-iis');
      labelElement.style.removeProperty('--k-txf-lps');
    };
  }, [options.controlRef, options.enabled, options.inputRef, options.labelRef]);
}

function resolveTextFieldElements(
  map: unknown,
  structural: TextFieldStructuralDescriptor
): TextFieldClassesMap {
  return resolveVariantElements(
    map as TextFieldVariantClassesMap | undefined,
    structural.variant,
    structural.mode
  );
}

export function createTextFieldComponent<TProps extends TextFieldRuntimeProps>(
  options: CreateTextFieldComponentOptions
) {
  function TextFieldRoot(props: TProps) {
    const {
      id,
      label,
      classNames = {},
      inputProps,
      inputRef: forwardedInputRef,
      placeholder,
      startContent,
      endContent,
      startContentEmphasis = 'lowest',
      endContentEmphasis = 'lowest',
      connectedEndAction,
      clearAction,
      visibilityToggle,
      size,
      emphasis = DEFAULT_TEXT_FIELD_EMPHASIS,
      intent,
      validationStatus,
      radius,
      labelOffset,
      labelPlacement,
      focusRingColorSource,
      reserveMessageSpace,
      disabled,
      readOnly,
      ...rootProps
    } = props;
    const scale = useComponentScale('textField', size, options.structural);
    const { global, segment, theme } = useKiskadee();
    const contentState = { disabled: disabled === true, readOnly: readOnly === true };
    const start = typeof startContent === 'function' ? startContent(contentState) : startContent;
    const end = typeof endContent === 'function' ? endContent(contentState) : endContent;
    const hasStart = hasTextFieldContent(start);
    const connectedAction = connectedEndAction?.({
      ...contentState,
      className: `k-txf-x2-${options.structural.letter}`
    });
    const hasConnectedAction =
      connectedAction !== undefined &&
      connectedAction !== null &&
      connectedAction !== false &&
      connectedAction !== '';
    const {
      textFieldClassesMap,
      options: textFieldOptions,
      variants
    } = useTextFieldArtifactConfig();
    const labelRef = useRef<HTMLLabelElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const controlRef = useRef<HTMLDivElement | null>(null);
    const resolvedIntent =
      disabled || readOnly
        ? DEFAULT_TEXT_FIELD_INTENT
        : (intent ?? validationStatus ?? DEFAULT_TEXT_FIELD_INTENT);
    const resolvedRadius = radius ?? global?.radius ?? DEFAULT_TEXT_FIELD_RADIUS;
    const modeConfig =
      options.structural.variant === 'standard'
        ? variants.standard?.modes?.[options.structural.mode as TextFieldStandardMode]
        : variants.floating?.modes?.[options.structural.mode as TextFieldFloatingMode];
    const modeOptions = modeConfig?.options;
    const variantOptions =
      options.structural.variant === 'standard'
        ? variants.standard?.options
        : variants.floating?.options;
    const resolvedLabelPlacement = resolveTextFieldLabelPlacement({
      layout: options.layout,
      prop: labelPlacement,
      schema: variants.standard?.options?.labelPlacement
    });
    const resolvedLabelOffsetStrategy = resolveLabelOffsetStrategy(
      resolvedLabelPlacement === 'inline'
        ? 'none'
        : (labelOffset ??
            (hasStart && options.layout === 'floating' ? 'input-start' : modeOptions?.labelOffset)),
      resolvedRadius
    );
    const resolvedFocusRingColorSource =
      focusRingColorSource ??
      modeOptions?.focusRingColorSource ??
      variantOptions?.focusRingColorSource ??
      textFieldOptions.focusRingColorSource ??
      DEFAULT_TEXT_FIELD_FOCUS_RING_COLOR_SOURCE;
    const surfaceContext = useSurfaceContext();
    const contentSurfaceContext = resolveContentSurfaceContext({
      map: modeConfig?.contentSurfaceContext,
      segment,
      theme,
      consumedSurfaceContext: surfaceContext,
      intent: resolvedIntent,
      emphasis,
      disabled
    });
    const elements = resolveTextFieldElements(textFieldClassesMap, options.structural);
    const shouldMirrorFloatingTypography = options.structural.variant === 'floating';

    const resolvedClassNames = useMemo(
      () =>
        resolveTextFieldClassNames({
          surfaceContext,
          structural: options.structural,
          elements,
          classNames,
          scale,
          intent: resolvedIntent,
          emphasis,
          radius: resolvedRadius,
          labelOffsetStrategy: resolvedLabelOffsetStrategy,
          labelPlacement: resolvedLabelPlacement,
          focusRingColorSource: resolvedFocusRingColorSource
        }),
      [
        classNames,
        elements,
        emphasis,
        radius,
        resolvedLabelPlacement,
        resolvedFocusRingColorSource,
        resolvedLabelOffsetStrategy,
        resolvedIntent,
        resolvedRadius,
        scale,
        surfaceContext
      ]
    );

    const regions = useMemo(() => {
      const resolve = (regionEmphasis: typeof startContentEmphasis) => {
        const regionSurfaceContext = resolveContentSurfaceContext({
          map: modeConfig?.contentRegionSurfaceContext,
          segment,
          theme,
          consumedSurfaceContext: contentSurfaceContext,
          intent: resolvedIntent,
          emphasis: regionEmphasis,
          disabled
        });
        return {
          surfaceContext: regionSurfaceContext,
          classes: resolveTextFieldContentClassNames({
            surfaceContext: regionSurfaceContext,
            structural: options.structural,
            elements,
            classNames,
            scale,
            intent: resolvedIntent,
            radius: resolvedRadius,
            emphasis: regionEmphasis
          })
        };
      };
      return { start: resolve(startContentEmphasis), end: resolve(endContentEmphasis) };
    }, [
      classNames,
      contentSurfaceContext,
      disabled,
      elements,
      endContentEmphasis,
      modeConfig?.contentRegionSurfaceContext,
      resolvedIntent,
      resolvedRadius,
      scale,
      segment,
      startContentEmphasis,
      theme
    ]);

    useLazyFloatingRestTypography({
      enabled: shouldMirrorFloatingTypography,
      labelRef,
      inputRef,
      loadBinder: loadFloatingRestTypography
    });

    useInputStartLabelOffset({
      enabled: resolvedLabelPlacement !== 'inline' && resolvedLabelOffsetStrategy === 'input-start',
      labelRef,
      inputRef,
      controlRef
    });

    const { className: inputClassName, ...restInputProps } = inputProps ?? {};
    const mergedInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignRef(forwardedInputRef, node);
      },
      [forwardedInputRef]
    );

    const indicator = resolvedClassNames.e6 ? (
      <span aria-hidden="true" className={resolvedClassNames.e6} />
    ) : null;

    const renderRegion = (position: 'start' | 'end', content: typeof start) => {
      const region = regions[position];
      const regionEmphasis = position === 'start' ? startContentEmphasis : endContentEmphasis;
      return (
        <span
          className={`${region.classes.regionClassName} ${position === 'start' ? 'k-txf-e8a' : 'k-txf-e8b'}${regionEmphasis === 'medium' ? ' k-txf-e8c' : ''}`}
          data-text-field-content={position}
        >
          <SurfaceContextProvider value={region.surfaceContext}>
            <TextFieldContentContext.Provider value={region.classes}>
              {content}
            </TextFieldContentContext.Provider>
          </SurfaceContextProvider>
        </span>
      );
    };

    const renderControlLine = ({
      end: managedEnd,
      inputType
    }: {
      end: typeof end;
      inputType?: typeof restInputProps.type;
    }) => {
      const hasEnd = hasTextFieldContent(managedEnd);
      const hasContent = hasStart || hasEnd;
      const input = (
        <HeadlessTextField.Input
          ref={mergedInputRef}
          {...restInputProps}
          type={inputType}
          placeholder={placeholder}
          className={inputClassName}
        />
      );
      const controlContent = (
        <>
          {hasStart ? renderRegion('start', start) : null}
          <span className={`k-txf-x3-${options.structural.letter}`} data-text-field-editing-lane>
            {input}
          </span>
          {hasEnd ? renderRegion('end', managedEnd) : null}
          {indicator}
        </>
      );

      const controlClassName = [
        hasContent ? 'k-txf-e3b' : '',
        hasConnectedAction ? 'k-txf-e3c' : ''
      ]
        .filter(Boolean)
        .join(' ');

      const controlLine = (
        <div className={`k-txf-x1-${options.structural.letter}`}>
          <HeadlessTextField.Control ref={controlRef} className={controlClassName}>
            {options.layout === 'floating' ? (
              <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
            ) : null}
            {controlContent}
          </HeadlessTextField.Control>
          {hasConnectedAction ? connectedAction : null}
        </div>
      );

      return options.layout === 'standard' ? (
        <>
          <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
          {controlLine}
        </>
      ) : (
        controlLine
      );
    };

    return (
      <HeadlessTextField.Root
        {...rootProps}
        inputId={id}
        disabled={disabled}
        readOnly={readOnly}
        validationStatus={validationStatus}
        classNames={resolvedClassNames}
        stateProjection={TEXT_FIELD_STATE_PROJECTION}
      >
        <TextFieldManagedActions
          clearAction={clearAction}
          visibilityToggle={visibilityToggle}
          inputType={restInputProps.type}
          startContent={start}
          endContent={end}
          radius={resolvedRadius}
          branch={options.structural.letter}
          controlRef={controlRef}
          inputRef={inputRef}
        >
          {renderControlLine}
        </TextFieldManagedActions>
        <HeadlessTextField.Message reserveSpace={reserveMessageSpace} />
      </HeadlessTextField.Root>
    );
  }

  const MemoTextField = memo(TextFieldRoot);
  MemoTextField.displayName = options.displayName;
  return withComponentResources('textField', MemoTextField);
}

export type {
  TextFieldFloatingInsideProps,
  TextFieldFloatingNotchedProps,
  TextFieldStandardBorderlessProps,
  TextFieldStandardOutlineProps,
  TextFieldStandardProps,
  TextFieldStandardUnderlineProps
};
