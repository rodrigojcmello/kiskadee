import type { ClassNameByElementJSON } from '@kiskadee/core';
import type { ComponentPropsWithoutRef } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorElementName = 'e1';

export type SeparatorClassesMap = Partial<Record<SeparatorElementName, ClassNameByElementJSON>>;

export type SeparatorProps = Omit<
  ComponentPropsWithoutRef<'hr'>,
  'aria-orientation' | 'children' | 'color' | 'role'
> & {
  children?: never;
  /** Structural direction of the neutral line. Defaults to horizontal. */
  orientation?: SeparatorOrientation;
};
