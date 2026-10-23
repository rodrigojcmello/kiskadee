import type { ElementSizeValue } from './breakpoints.ts';

/** Expected border-box height for inspection only; never an authored CSS height. */
export type ElementHeightReference = number | Partial<Record<ElementSizeValue, number>>;
