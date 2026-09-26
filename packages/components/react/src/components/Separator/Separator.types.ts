import type { ClassNameByElementJSON, ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
import type { ComponentPropsWithoutRef } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorIntent = 'neutral' | 'primary';

export type SeparatorElementName = 'e1';

export type SeparatorClassesMap = Partial<Record<SeparatorElementName, ClassNameByElementJSON>>;

export type SeparatorProps = Omit<
  ComponentPropsWithoutRef<'hr'>,
  'aria-orientation' | 'children' | 'color' | 'role'
> & {
  children?: never;
  /** Selects a preset-authored emphasis. Defaults to medium. */
  emphasis?: ComponentEmphasis;
  /** Selects a preset-authored color intent. Defaults to neutral. */
  intent?: SeparatorIntent;
  /** Overrides the inherited content surface context. */
  surfaceContext?: SurfaceContext;
  /** Structural direction of the line. Defaults to horizontal. */
  orientation?: SeparatorOrientation;
};
