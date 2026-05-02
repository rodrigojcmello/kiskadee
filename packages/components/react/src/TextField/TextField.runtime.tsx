import { HeadlessTextField } from '@kiskadee/react-headless';
import { type FocusEvent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext';
import {
  DEFAULT_TEXT_FIELD_EMPHASIS,
  DEFAULT_TEXT_FIELD_INTENT,
  DEFAULT_TEXT_FIELD_RADIUS,
  DEFAULT_TEXT_FIELD_SCALE,
  resolveTextFieldClassNames,
  resolveVariantElements
} from './TextField.class-names';
import type { TextFieldStructuralDescriptor } from './TextField.structural';
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
import { useLazyFloatingRestTypography } from './useLazyFloatingRestTypography';

type CreateTextFieldComponentOptions = {
  displayName: string;
  structural: TextFieldStructuralDescriptor;
  layout: 'standard' | 'floating';
};

const loadFloatingRestTypography = () =>
  import('./floatingRestTypography.runtime').then((module) => module.bindFloatingRestTypography);

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
      disabled,
      readOnly,
      ...rootProps
    } = props;
    const { classesMap, global } = useKiskadee();
    const [focused, setFocused] = useState(false);
    const labelRef = useRef<HTMLLabelElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const resolvedIntent = intent ?? validationStatus ?? DEFAULT_TEXT_FIELD_INTENT;
    const resolvedRadius = radius ?? global?.radius ?? DEFAULT_TEXT_FIELD_RADIUS;
    const elements = resolveTextFieldElements(classesMap.textField, options.structural);
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
          focused,
          disabled,
          readOnly
        }),
      [
        classNames,
        disabled,
        elements,
        emphasis,
        focused,
        radius,
        readOnly,
        resolvedIntent,
        resolvedRadius,
        scale
      ]
    );

    const handleInputFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        inputProps?.onFocus?.(event);
      },
      [inputProps]
    );

    const handleInputBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        inputProps?.onBlur?.(event);
      },
      [inputProps]
    );

    useLazyFloatingRestTypography({
      enabled: shouldMirrorFloatingTypography,
      labelRef,
      inputRef,
      loadBinder: loadFloatingRestTypography
    });

    const { className: inputClassName, onBlur, onFocus, ...restInputProps } = inputProps ?? {};
    void onBlur;
    void onFocus;

    const input = (
      <HeadlessTextField.Input
        ref={inputRef}
        {...restInputProps}
        placeholder={placeholder}
        className={inputClassName}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
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
      >
        {options.layout === 'standard' ? (
          <>
            <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
            <HeadlessTextField.Control>
              {input}
              {indicator}
            </HeadlessTextField.Control>
          </>
        ) : (
          <HeadlessTextField.Control>
            <HeadlessTextField.Label ref={labelRef}>{label}</HeadlessTextField.Label>
            {input}
            {indicator}
          </HeadlessTextField.Control>
        )}
        <HeadlessTextField.Message />
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
