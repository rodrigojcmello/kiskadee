import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SwitchIntent,
  SwitchMode,
  SwitchVariant
} from '@kiskadee/core';
import type {
  SwitchInputProps as HeadlessSwitchInputProps,
  SwitchRootProps as HeadlessSwitchRootProps,
  SwitchStatus as HeadlessSwitchStatus
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type SwitchClassNames = Partial<Record<SwitchElementName, string>>;

export type SwitchClassesMap = Partial<Record<SwitchElementName, ClassNameByElementJSON>>;

export type SwitchModeClassesMap = Partial<Record<SwitchMode, SwitchClassesMap>>;

export type SwitchVariantClassesMap = Partial<Record<SwitchVariant, SwitchModeClassesMap>>;

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchStatus = HeadlessSwitchStatus;

export type SwitchControlText = {
  on: ReactNode;
  off: ReactNode;
};

export type SwitchIcons = {
  rest?: ReactNode;
  selected?: ReactNode;
};

export type SwitchActivationFeedback =
  | false
  /**
   * Forces the Switch activation-feedback layer on for static previews.
   *
   * Interactive activation feedback is pointer/click driven. Keyboard actions,
   * including Space toggling the native switch state, must not start this visual
   * effect.
   */
  | 'active';

export type SwitchProps = Omit<
  HeadlessSwitchRootProps,
  'children' | 'classNames' | 'inputId' | 'inputProps'
> & {
  id?: string;
  label?: ReactNode;
  controlText?: SwitchControlText;
  icons?: SwitchIcons;
  className?: string;
  classNames?: SwitchClassNames;
  inputProps?: Omit<HeadlessSwitchInputProps, 'className'> & {
    className?: string;
  };
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  intent?: SwitchIntent;
  radius?: RadiusMode;
  thumbShrink?: false;
  activationFeedback?: SwitchActivationFeedback;
  motion?: false;
  variant?: SwitchVariant;
  mode?: SwitchMode;
  labelPosition?: SwitchLabelPosition;
};
