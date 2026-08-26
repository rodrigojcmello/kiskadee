import type {
  BadgeEmphasis,
  BadgeIntent,
  BadgeMarkPresentation,
  BadgeScale,
  BadgeSeparation,
  ClassNameByElementJSON,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type { HTMLAttributes, ReactElement } from 'react';

export type BadgeElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type BadgeClassesMap = Partial<Record<BadgeElementName, ClassNameByElementJSON>>;
export type BadgeClassNames = Partial<Record<BadgeElementName, string>>;

export type BadgeVisualProps = {
  classNames?: BadgeClassNames;
  emphasis?: BadgeEmphasis;
  intent?: BadgeIntent;
  radius?: Extract<RadiusMode, 'square' | 'rounded' | 'pill'>;
  scale?: BadgeScale;
  separation?: BadgeSeparation;
  /** Applies the preset-authored static Badge shadow. Defaults to false. */
  shadow?: boolean;
  surfaceContext?: SurfaceContext;
};

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  BadgeVisualProps & {
    children: string | number;
  };

type BadgeIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  classNames?: BadgeClassNames;
  intent?: BadgeIntent;
  scale?: BadgeScale;
  separation?: BadgeSeparation;
  /** Applies the preset-authored static Badge shadow. Defaults to false. */
  shadow?: boolean;
  surfaceContext?: SurfaceContext;
};

export type BadgeDotProps = BadgeIndicatorProps;

type BadgeMarkBaseProps = BadgeIndicatorProps & {
  children: ReactElement;
};

export type BadgeContainedMarkProps = BadgeMarkBaseProps & {
  emphasis?: BadgeEmphasis;
  presentation?: Extract<BadgeMarkPresentation, 'contained'>;
};

export type BadgeFullBleedMarkProps = BadgeMarkBaseProps & {
  emphasis?: never;
  presentation: Extract<BadgeMarkPresentation, 'full-bleed'>;
};

export type BadgeMarkProps = BadgeContainedMarkProps | BadgeFullBleedMarkProps;
