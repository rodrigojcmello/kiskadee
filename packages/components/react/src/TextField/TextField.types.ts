import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  TextFieldIntent,
  TextFieldValidationStatus
} from '@kiskadee/core';
import type {
  TextFieldInputProps as HeadlessTextFieldInputProps,
  TextFieldRootProps as HeadlessTextFieldRootProps
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type TextFieldClassNames = Partial<Record<TextFieldElementName, string>>;

export type TextFieldClassesMap = Partial<Record<TextFieldElementName, ClassNameByElementJSON>>;

export type TextFieldVariantClassesMap = Partial<
  Record<'stacked' | 'floating', TextFieldClassesMap>
>;

export type TextFieldProps = Omit<
  HeadlessTextFieldRootProps,
  'children' | 'classNames' | 'inputId' | 'validationStatus'
> & {
  id?: string;
  label: ReactNode;
  classNames?: TextFieldClassNames;
  inputProps?: Omit<HeadlessTextFieldInputProps, 'className'> & {
    className?: string;
  };
  placeholder?: string;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  intent?: TextFieldIntent;
  validationStatus?: TextFieldValidationStatus;
  /** Border radius mode. Uses schema radius scales for square, rounded, and pill. */
  radius?: RadiusMode;
};

export type TextFieldStackedProps = TextFieldProps;

export type TextFieldFloatingProps = TextFieldProps;
