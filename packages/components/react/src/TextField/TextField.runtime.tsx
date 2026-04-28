import { HeadlessTextField } from '@kiskadee/react-headless';
import { type FocusEvent, memo, useCallback, useMemo, useState } from 'react';
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
  TextFieldFloatingProps,
  TextFieldProps,
  TextFieldStackedProps,
  TextFieldVariantClassesMap
} from './TextField.types';

type CreateTextFieldComponentOptions = {
  displayName: string;
  structural: TextFieldStructuralDescriptor;
  layout: 'stacked' | 'floating';
};

function resolveTextFieldElements(
  map: unknown,
  variant: TextFieldStructuralDescriptor['variant']
): TextFieldClassesMap {
  return resolveVariantElements(map as TextFieldVariantClassesMap | undefined, variant);
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
    const resolvedIntent = intent ?? validationStatus ?? DEFAULT_TEXT_FIELD_INTENT;
    const resolvedRadius = radius ?? global?.radius ?? DEFAULT_TEXT_FIELD_RADIUS;
    const elements = resolveTextFieldElements(classesMap.textField, options.structural.variant);

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

    const { className: inputClassName, onBlur, onFocus, ...restInputProps } = inputProps ?? {};
    void onBlur;
    void onFocus;

    const input = (
      <HeadlessTextField.Input
        {...restInputProps}
        placeholder={placeholder}
        className={inputClassName}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    );

    return (
      <HeadlessTextField.Root
        {...rootProps}
        inputId={id}
        disabled={disabled}
        readOnly={readOnly}
        validationStatus={validationStatus}
        classNames={resolvedClassNames}
      >
        {options.layout === 'stacked' ? (
          <>
            <HeadlessTextField.Label>{label}</HeadlessTextField.Label>
            <HeadlessTextField.Control>{input}</HeadlessTextField.Control>
          </>
        ) : (
          <HeadlessTextField.Control>
            <HeadlessTextField.Label>{label}</HeadlessTextField.Label>
            {input}
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

export type { TextFieldFloatingProps, TextFieldStackedProps };
