'use client';

import { RightPanelClose, RightPanelOpen } from '@carbon/icons-react';
import { carbonIconFamily } from '@kiskadee/icons/interface/carbon';
import {
  FamilyResolvedIcon,
  type FamilyResolvedIconProps,
  IconFamilyProvider
} from '@kiskadee/react-components';
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
export function ShowcaseFamilyResolvedIcon(props: FamilyResolvedIconProps) {
  return (
    <ShowcaseIconFamilyBoundary>
      <FamilyResolvedIcon {...props} />
    </ShowcaseIconFamilyBoundary>
  );
}

/** Carbon affordance kept beside the fixed Showcase icon-family boundary. */
export function ShowcaseSidebarToggleGlyph({ expanded }: { expanded: boolean }) {
  const Glyph = expanded ? RightPanelClose : RightPanelOpen;

  return <Glyph aria-hidden="true" size="1em" />;
}
