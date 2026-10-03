import type { LayoutComponent, LayoutSpacingScale } from '@kiskadee/core';

/** Shared Kiskadee spacing calibration, independent from upstream visual components. */
const LAYOUT_SPACING = {
  's:sm:5': 2,
  's:sm:4': 4,
  's:sm:3': 6,
  's:sm:2': 8,
  's:sm:1': 12,
  's:md:1': 16,
  's:lg:1': 24,
  's:lg:2': 32,
  's:lg:3': 40,
  's:lg:4': 48,
  's:lg:5': 64
} as const satisfies LayoutSpacingScale;

export function createLayoutSchema(): LayoutComponent {
  const spacing = (): LayoutSpacingScale => ({ ...LAYOUT_SPACING });
  return {
    elements: {
      e1: {
        name: 'frame',
        scales: {
          paddingTop: spacing(),
          paddingRight: spacing(),
          paddingBottom: spacing(),
          paddingLeft: spacing(),
          marginTop: spacing(),
          marginRight: spacing(),
          marginBottom: spacing(),
          marginLeft: spacing()
        }
      },
      e2: {
        name: 'flow',
        scales: { paddingTop: spacing(), paddingLeft: spacing() }
      }
    }
  };
}
