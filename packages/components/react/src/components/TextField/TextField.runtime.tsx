import type {
  RadiusMode,
  TextFieldFloatingMode,
  TextFieldLabelOffsetByRadius,
  TextFieldLabelOffsetStrategy,
  TextFieldStandardMode
} from '@kiskadee/core';
import { HeadlessTextField } from '@kiskadee/react-headless';
import { memo, type RefObject, useEffect, useMemo, useRef } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import {
  DEFAULT_TEXT_FIELD_EMPHASIS,
  DEFAULT_TEXT_FIELD_FOCUS_RING_COLOR_SOURCE,
  DEFAULT_TEXT_FIELD_INTENT,
  DEFAULT_TEXT_FIELD_RADIUS,
  DEFAULT_TEXT_FIELD_SCALE,
  resolveTextFieldClassNames,
  resolveVariantElements,
  TEXT_FIELD_STATE_PROJECTION
} from './TextField.class-names';
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

const loadFloatingRestTypography = () =>
  import('./floatingRestTypography.runtime.ts').then((module) => module.bindFloatingRestTypography);

function resolveLabelOffsetStrategy(
  labelOffset: TextFieldLabelOffsetStrategy | TextFieldLabelOffsetByRadius | undefined,
  radius: RadiusMode
): TextFieldLabelOffsetStrategy {
  if (!labelOffset) return 'schema';
  if (typeof labelOffset === 'string') return labelOffset;
  return labelOffset[radius] ?? 'schema';
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
      const inputRect = inputElement.getBoundingClientRect();
      const controlRect = controlElement.getBoundingClientRect();
      const inputInlineStart = Math.max(0, inputRect.left - controlRect.left);
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
    window.addEventListener('resize', syncInputStart);

    return () => {
      resizeObserver?.disconnect();
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

export function createTextFieldComponent<TProps extends TextFieldProps>(
  options: CreateTextFieldComponentOptions
) {
  function TextFieldRoot(props: TProps) {
    const {
      id,
      label,
      classNames = {},
      inputProps,
      placeholder,
      scale = DEFAULT_TEXT_FIELD_SCALE,
      emphasis = DEFAULT_TEXT_FIELD_EMPHASIS,
      intent,
      validationStatus,
      radius,
      labelOffset,
      focusRingColorSource,
      reserveMessageSpace,
      disabled,
      readOnly,
      ...rootProps
    } = props;
    const { global } = useKiskadee();
    const {
      textFieldClassesMap,
      options: textFieldOptions,
      variants
    } = useTextFieldArtifactConfig();
    const labelRef = useRef<HTMLLabelElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const controlRef = useRef<HTMLDivElement | null>(null);
    const resolvedIntent = intent ?? validationStatus ?? DEFAULT_TEXT_FIELD_INTENT;
    const resolvedRadius = radius ?? global?.radius ?? DEFAULT_TEXT_FIELD_RADIUS;
    const modeOptions =
      options.structural.variant === 'standard'
        ? variants.standard?.modes?.[options.structural.mode as TextFieldStandardMode]?.options
        : variants.floating?.modes?.[options.structural.mode as TextFieldFloatingMode]?.options;
    const variantOptions =
      options.structural.variant === 'standard'
        ? variants.standard?.options
        : variants.floating?.options;
    const resolvedLabelOffsetStrategy = resolveLabelOffsetStrategy(
      labelOffset ?? modeOptions?.labelOffset,
      resolvedRadius
    );
    const resolvedFocusRingColorSource =
      focusRingColorSource ??
      modeOptions?.focusRingColorSource ??
      variantOptions?.focusRingColorSource ??
      textFieldOptions.focusRingColorSource ??
      DEFAULT_TEXT_FIELD_FOCUS_RING_COLOR_SOURCE;
    const elements = resolveTextFieldElements(textFieldClassesMap, options.structural);
    const shouldMirrorFloatingTypography = options.structural.variant === 'floating';

    const resolvedClassNames = useMemo(
      () =>
        resolveTextFieldClassNames({
          structural: options.structural,
          elements,
          classNames,
          scale,
          intent: resolvedIntent,
          emphasis,
          radius: resolvedRadius,
          labelOffsetStrategy: resolvedLabelOffsetStrategy,
          focusRingColorSource: resolvedFocusRingColorSource
        }),
      [
        classNames,
        elements,
        emphasis,
        radius,
        resolvedFocusRingColorSource,
        resolvedLabelOffsetStrategy,
        resolvedIntent,
        resolvedRadius,
        scale
      ]
    );

    useLazyFloatingRestTypography({
      enabled: shouldMirrorFloatingTypography,
      labelRef,
      inputRef,
      loadBinder: loadFloatingRestTypography
    });

    useInputStartLabelOffset({
      enabled: resolvedLabelOffsetStrategy === 'input-start',
      labelRef,
      inputRef,
      controlRef
    });

    const { className: inputClassName, ...restInputProps } = inputProps ?? {};

    const input = (
      <HeadlessTextField.Input
        ref={inputRef}
        {...restInputProps}
        placeholder={placeholder}
        className={inputClassName}
      />
    );

    const indicator = resolvedClassNames.e6 ? (
      <span aria-hidden="true" className={resolvedClassNames.e6} />
    ) : null;

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
        {options.layout === 'standard' ? (
          <>
            <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
            <HeadlessTextField.Control ref={controlRef}>
              {input}
              {indicator}
            </HeadlessTextField.Control>
          </>
        ) : (
          <HeadlessTextField.Control ref={controlRef}>
            <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
            {input}
            {indicator}
          </HeadlessTextField.Control>
        )}
        <HeadlessTextField.Message reserveSpace={reserveMessageSpace} />
      </HeadlessTextField.Root>
    );
  }

  const MemoTextField = memo(TextFieldRoot);
  MemoTextField.displayName = options.displayName;
  return MemoTextField;
}

export type {
  TextFieldFloatingInsideProps,
  TextFieldFloatingNotchedProps,
  TextFieldStandardBorderlessProps,
  TextFieldStandardOutlineProps,
  TextFieldStandardProps,
  TextFieldStandardUnderlineProps
};
