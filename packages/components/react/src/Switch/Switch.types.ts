import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SwitchMode,
  SwitchVariant
} from '@kiskadee/core';
import type {
  SwitchInputProps as HeadlessSwitchInputProps,
  SwitchRootProps as HeadlessSwitchRootProps
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

export type SwitchElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type SwitchClassNames = Partial<Record<SwitchElementName, string>>;

export type SwitchClassesMap = Partial<Record<SwitchElementName, ClassNameByElementJSON>>;

export type SwitchModeClassesMap = Partial<Record<SwitchMode, SwitchClassesMap>>;

export type SwitchVariantClassesMap = Partial<Record<SwitchVariant, SwitchModeClassesMap>>;

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchProps = Omit<
  HeadlessSwitchRootProps,
  'children' | 'classNames' | 'inputId' | 'inputProps' | 'stateProjection'
> & {
  id?: string;
  label?: ReactNode;
  state?: ReactNode;
  className?: string;
  classNames?: SwitchClassNames;
  inputProps?: Omit<HeadlessSwitchInputProps, 'className'> & {
    className?: string;
  };
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  intent?: string;
  radius?: RadiusMode;
  variant?: SwitchVariant;
  mode?: SwitchMode;
  labelPosition?: SwitchLabelPosition;
};
