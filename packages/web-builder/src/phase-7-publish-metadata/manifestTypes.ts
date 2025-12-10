// Public manifest types describing high-level capabilities per design system.
//
// These types are intentionally side-effect free so they can be safely
// imported from other packages (e.g., @kiskadee/react-components or
// @kiskadee/showcase) through the root "@kiskadee/web-builder/types"
// entrypoint.

import type { ComponentName } from '@kiskadee/core';

export type ManifestComponentState = Record<
  string, // semantic: primary, neutral, redLike, ...
  Record<
    string, // tone: soft, solid, u, ...
    Record<string, true> // state: rest, hover, focus, pressed, selected, disabled, ...
  >
>;

export type ManifestComponent = {
  /**
   * Interaction states supported by the Button component, grouped by
   * semantic (primary/neutral/...) and tone (soft/solid/u).
   *
   * Only positive information is stored: if a state key is present
   * (e.g. "selected": true), the state exists for that
   * semantic/tone. The absence of a key means the state is not
   * supported or not defined in the schema.
   */
  state?: ManifestComponentState;

  /**
   * Scales (sizes) used by any Button element (e1, e2, ...).
   *
   * Keys are scale identifiers like "s:md:1" and values are always
   * true. If a scale is absent from this map, the Button never uses
   * it in the schema.
   */
  scale?: Record<string, true>;
};

export type Manifest = {
  key: string;
  displayName: string;
  author: string | null;
  schemaName: string | null;
  version: string | null;
  segments: string[];
  themes: Record<string, string[]>;
  /**
   * Optional component-level metadata derived from the schema.
   *
   * This object is intentionally sparse and focuses on capabilities
   * (e.g. which interaction states or scales exist) rather than all
   * styling details. Absence of a key means the information is not
   * defined or not applicable for that component.
   */
  components?: {
    [componentName in ComponentName]?: ManifestComponent;
  };
};
