'use client';

import { carbonIconFamily } from '@kiskadee/icons/interface/carbon';
import { IconFamilyProvider, IconGlyph, type IconGlyphProps } from '@kiskadee/react-components';
import type { ReactNode } from 'react';

const SHOWCASE_ICON_FAMILY = carbonIconFamily;

export const SHOWCASE_ICON_FAMILY_ID = SHOWCASE_ICON_FAMILY.id;
export const SHOWCASE_ICON_VARIANT_ID = SHOWCASE_ICON_FAMILY.defaultVariant;

/**
 * Keeps Showcase-owned interface glyphs independent from the family selected
 * for component examples.
 */
export function ShowcaseIconFamilyBoundary({ children }: { children: ReactNode }) {
  return (
    <IconFamilyProvider
      families={[SHOWCASE_ICON_FAMILY]}
      family={SHOWCASE_ICON_FAMILY_ID}
      variant={SHOWCASE_ICON_VARIANT_ID}
    >
      {children}
    </IconFamilyProvider>
  );
}

/**
 * Fixed-family glyph for isolated Showcase affordances rendered inside a
 * dynamic component-example tree.
 */
export function ShowcaseIconGlyph(props: IconGlyphProps) {
  return (
    <ShowcaseIconFamilyBoundary>
      <IconGlyph {...props} />
    </ShowcaseIconFamilyBoundary>
  );
}
