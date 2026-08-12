import type { BreakpointValue, ElementAllSizeValue, ElementSizeValue } from './breakpoints.ts';
import type { PixelValue } from './types/scales/scales.types.ts';

export type SchemaIconSizes = {
  's:md:1': PixelValue;
} & Partial<Record<Exclude<ElementSizeValue, 's:md:1'>, PixelValue>>;

export type IconSizeByBreakpoint = {
  'bp:all': ElementSizeValue;
} & Partial<Record<Exclude<BreakpointValue, 'bp:all'>, ElementSizeValue>>;

export type ElementIconSizeValue = ElementSizeValue | IconSizeByBreakpoint;

type ElementIconSizeForAllSizes = {
  's:all': ElementIconSizeValue;
} & Partial<Record<ElementSizeValue, never>>;

type ElementIconSizeBySize = {
  's:all'?: never;
} & Partial<Record<ElementSizeValue, ElementIconSizeValue>>;

export type ElementIconSize = ElementIconSizeForAllSizes | ElementIconSizeBySize;

export type IconSizeToken = ElementSizeValue | ElementAllSizeValue;
