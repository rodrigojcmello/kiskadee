import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  TextFieldFocusRingColorSource,
  TextFieldIntent,
  TextFieldLabelOffsetByRadius,
  TextFieldLabelOffsetStrategy,
  TextFieldLabelPlacement,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldValidationStatus
} from '@kiskadee/core';
import type {
  TextFieldInputProps as HeadlessTextFieldInputProps,
  TextFieldRootProps as HeadlessTextFieldRootProps
} from '@kiskadee/react-headless';
import type { ReactNode, Ref } from 'react';

export type TextFieldElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';

export type TextFieldClassNames = Partial<Record<TextFieldElementName, string>>;

export type TextFieldClassesMap = Partial<Record<TextFieldElementName, ClassNameByElementJSON>>;

export type TextFieldModeClassesMap = Partial<Record<TextFieldMode, TextFieldClassesMap>>;

export type TextFieldVariantClassesMap = Partial<
  Record<'standard' | 'floating', TextFieldModeClassesMap>
>;

export type TextFieldProps = Omit<
  HeadlessTextFieldRootProps,
  'children' | 'classNames' | 'inputId' | 'stateProjection' | 'validationStatus'
> & {
  id?: string;
  label: ReactNode;
  classNames?: TextFieldClassNames;
  inputProps?: Omit<HeadlessTextFieldInputProps, 'className'> & {
    className?: string;
  };
  /** External ref for anchoring semantic overlays such as Autocomplete. */
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  intent?: TextFieldIntent;
  validationStatus?: TextFieldValidationStatus;
  /** Border radius mode. Uses schema radius scales for square, rounded, and pill. */
  radius?: RadiusMode;
  /** Label inline-start offset strategy, or a strategy map keyed by the active radius mode. */
  labelOffset?: TextFieldLabelOffsetStrategy | TextFieldLabelOffsetByRadius;
  /** Focus outline color policy. `global` uses --k-focus-color; `component` uses e3 borderColor. */
  focusRingColorSource?: TextFieldFocusRingColorSource;
  /** Reserve one message line to avoid vertical drift when validation text appears. */
  reserveMessageSpace?: boolean;
};

export type TextFieldStandardProps = TextFieldProps & {
  /** Label placement for Standard TextField layouts. */
  labelPlacement?: TextFieldLabelPlacement;
};
export type TextFieldStandardOutlineProps = TextFieldStandardProps;
export type TextFieldStandardUnderlineProps = TextFieldStandardProps;
export type TextFieldStandardBorderlessProps = TextFieldStandardProps;

export type TextFieldFloatingNotchedProps = TextFieldProps;

export type TextFieldFloatingInsideProps = TextFieldProps;

export type { TextFieldModeByVariant };
