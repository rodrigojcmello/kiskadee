import type { BreakpointValue } from './breakpoints.ts';

/** Shared variable identities for Web Layout column artifacts and their consumers. */
export const layoutColumnCssVariables = {
  'bp:all': '--k-lyt-gc-all',
  'bp:sm:1': '--k-lyt-gc-sm1',
  'bp:sm:2': '--k-lyt-gc-sm2',
  'bp:sm:3': '--k-lyt-gc-sm3',
  'bp:md:1': '--k-lyt-gc-md1',
  'bp:md:2': '--k-lyt-gc-md2',
  'bp:md:3': '--k-lyt-gc-md3',
  'bp:lg:1': '--k-lyt-gc-lg1',
  'bp:lg:2': '--k-lyt-gc-lg2',
  'bp:lg:3': '--k-lyt-gc-lg3',
  'bp:lg:4': '--k-lyt-gc-lg4'
} as const satisfies Record<BreakpointValue, `--${string}`>;
