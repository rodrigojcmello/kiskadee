import type {
  BadgeEmphasis,
  BadgeIntent,
  BadgeScale,
  ClassNameByElementJSON,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';
export type BadgeClassesMap = Record<BadgeElementName, ClassNameByElementJSON>;
export type BadgeClassNames = Partial<Record<BadgeElementName, string>>;

export type BadgeVisualProps = {
  classNames?: BadgeClassNames;
  emphasis?: BadgeEmphasis;
  intent?: BadgeIntent;
  radius?: Extract<RadiusMode, 'rounded' | 'pill'>;
  scale?: BadgeScale;
  surfaceContext?: SurfaceContext;
};

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  BadgeVisualProps & {
    children?: ReactNode;
  };

export type BadgeSlotProps = HTMLAttributes<HTMLSpanElement>;

export type BadgeDotProps = Omit<BadgeProps, 'children' | 'radius' | 'scale'> & {
  scale?: BadgeScale;
};
