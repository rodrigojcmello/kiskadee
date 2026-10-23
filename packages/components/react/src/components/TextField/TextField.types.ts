import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ComponentSize,
  RadiusMode,
  TextFieldContentEmphasis,
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

export type TextFieldElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10';

export type TextFieldContentState = {
  disabled: boolean;
  readOnly: boolean;
};

export type TextFieldContent = ReactNode | ((state: TextFieldContentState) => ReactNode);

export type TextFieldConnectedActionState = TextFieldContentState & { className: string };
export type TextFieldConnectedAction = (state: TextFieldConnectedActionState) => ReactNode;

export type TextFieldClearAction = {
  /** Caller-provided artwork; no icon family or canonical name is assumed. */
  icon: ReactNode;
  label: string;
  /** Polite, visually hidden confirmation after an accepted clear. */
  clearedAnnouncement: string;
  /** Existing Button size. Defaults to Small without changing its geometry. */
  size?: ComponentSize;
};

export type TextFieldVisibilityToggle = {
  showLabel: string;
  hideLabel: string;
  /** Existing Button size. Defaults to Small. */
  size?: ComponentSize;
} & (
  | { presentation: 'text'; showText: string; hideText: string }
  | { presentation: 'icon'; showIcon: ReactNode; hideIcon: ReactNode }
);

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
  /** Content at the field's logical start, independent of the input text direction. */
  startContent?: TextFieldContent;
  /** Content at the field's logical end, independent of the input text direction. */
  endContent?: TextFieldContent;
  /** Own-surface treatment of the logical start region. */
  startContentEmphasis?: TextFieldContentEmphasis;
  /** Own-surface treatment of the logical end region. */
  endContentEmphasis?: TextFieldContentEmphasis;
  /** Existing Button connected to the field's logical end; forward the supplied relation class. */
  connectedEndAction?: TextFieldConnectedAction;
  /** Clears a nonempty editable value; absent for empty, disabled, or read-only fields. */
  clearAction?: TextFieldClearAction;
  /** Opt-in reveal control for inputProps.type="password". */
  visibilityToggle?: TextFieldVisibilityToggle;
  size?: ComponentSize;
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
