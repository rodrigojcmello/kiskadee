import type {
  ChipEmphasis,
  ChipIntent,
  ChipScale,
  ClassNameByElementJSON,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type {
  HeadlessChipContentProps,
  HeadlessChipRemoveProps,
  HeadlessChipSelectProps
} from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode } from 'react';

export type ChipElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';
export type ChipClassesMap = Record<ChipElementName, ClassNameByElementJSON>;
export type ChipClassNames = Partial<Record<ChipElementName, string>>;

export type ChipVisualProps = {
  classNames?: ChipClassNames;
  emphasis?: ChipEmphasis;
  intent?: ChipIntent;
  radius?: Extract<RadiusMode, 'rounded' | 'pill'>;
  scale?: ChipScale;
  surfaceContext?: SurfaceContext;
};

export type ChipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  ChipVisualProps & {
    children: ReactNode;
    disabled?: boolean;
  };

export type ChipContentProps = HeadlessChipContentProps;
export type ChipSelectProps = Omit<HeadlessChipSelectProps, 'children'> & {
  children: ReactNode;
};
export type ChipRemoveProps = Omit<HeadlessChipRemoveProps, 'children'> & {
  children?: ReactNode;
};
export type ChipSlotProps = HTMLAttributes<HTMLSpanElement>;
