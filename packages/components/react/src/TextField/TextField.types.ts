import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  TextFieldFloatingMode,
  TextFieldIntent,
  TextFieldMode,
  TextFieldStandardMode,
  TextFieldValidationStatus
} from '@kiskadee/core';
import type {
  TextFieldInputProps as HeadlessTextFieldInputProps,
  TextFieldRootProps as HeadlessTextFieldRootProps
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TextFieldClassNames = Partial<Record<TextFieldElementName, string>>;

export type TextFieldClassesMap = Partial<Record<TextFieldElementName, ClassNameByElementJSON>>;

export type TextFieldModeClassesMap = Partial<Record<TextFieldMode, TextFieldClassesMap>>;

export type TextFieldVariantClassesMap = Partial<
  Record<'standard' | 'floating', TextFieldModeClassesMap>
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
  /** Offset the label by the active border radius when it is larger than the schema margin. */
  labelRadiusOffset?: boolean;
};

export type TextFieldStandardProps = TextFieldProps;
export type TextFieldStandardOutlineProps = TextFieldProps;
export type TextFieldStandardUnderlineProps = TextFieldProps;
export type TextFieldStandardBorderlessProps = TextFieldProps;

export type TextFieldFloatingNotchedProps = TextFieldProps;

export type TextFieldFloatingInsideProps = TextFieldProps;

export type TextFieldModeByVariant = {
  standard: TextFieldStandardMode;
  floating: TextFieldFloatingMode;
};
