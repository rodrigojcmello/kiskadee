import type {
  ClassNameByElementJSON,
  ComponentSize,
  LayoutResponsiveColumns
} from '@kiskadee/core';
import type { HTMLAttributes } from 'react';

/** Explicit spacing is independent of density. False turns off the selected edge or axis. */
export type LayoutSpacingSize = ComponentSize | false;

export type LayoutSpacingEdges = {
  block?: LayoutSpacingSize;
  inline?: LayoutSpacingSize;
  blockStart?: LayoutSpacingSize;
  blockEnd?: LayoutSpacingSize;
  inlineStart?: LayoutSpacingSize;
  inlineEnd?: LayoutSpacingSize;
};

export type LayoutSpacing = LayoutSpacingSize | LayoutSpacingEdges;
export type LayoutGap = LayoutSpacingSize | { row?: LayoutSpacingSize; column?: LayoutSpacingSize };
export type LayoutElementName = 'e1' | 'e2';
export type LayoutClassesMap = Partial<Record<LayoutElementName, ClassNameByElementJSON>>;

export type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  /** Frame insets. Logical edge overrides take precedence over their axis. */
  padding?: LayoutSpacing;
  /** Frame spacing relative to its surrounding layout. */
  margin?: LayoutSpacing;
  /** Space between flex/grid children, independently selected for each axis. */
  gap?: LayoutGap;
  display?: 'block' | 'flex' | 'grid';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Equal-width grid columns. Responsive keys use the active preset's viewport breakpoints. */
  columns?: LayoutResponsiveColumns;
  classNames?: Partial<Record<LayoutElementName, string>>;
};
