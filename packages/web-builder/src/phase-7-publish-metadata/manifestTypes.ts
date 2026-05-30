// Public manifest types describing high-level capabilities per design system.
//
// These types are intentionally side-effect free so they can be safely
// imported from other packages (e.g., @kiskadee/react-components or
// @kiskadee/showcase) through the root "@kiskadee/web-builder/types"
// entrypoint.

import type { ComponentName } from '@kiskadee/core';

export type ManifestFontStack = readonly [primary: string, fallback: string];

export type ManifestFonts = {
  body: ManifestFontStack;
  heading: ManifestFontStack;
};

export type ManifestComponentState = Record<
  string, // semantic: primary, neutral, redLike, ...
  Record<
    string, // emphasis: high, medium, low, lowest
    Record<string, true> // state: rest, hover, focus, pressed, selected, disabled, ...
  >
>;

export type ManifestComponent = {
  /**
   * Interaction states supported by the component, grouped by
   * semantic (primary/neutral/...) and emphasis (high/medium/low/lowest).
   *
   * Only positive information is stored: if a state key is present
   * (e.g. "selected": true), the state exists for that
   * semantic/emphasis. The absence of a key means the state is not
   * supported or not defined in the schema.
   */
  state?: ManifestComponentState;

  /**
   * Scales (sizes) used by any component element (e1, e2, ...).
   *
   * Keys are scale identifiers like "s:md:1" and values are always true. If a scale is absent
   * from this map, the component never uses it in the schema.
   */
  scale?: Record<string, true>;

  /**
   * Generated artifact paths for component-scoped metadata.
   *
   * Paths are relative to the design-system build directory.
   */
  artifacts?: {
    metadata?: string;
    classMaps?: {
      core?: string;
      palettes?: Record<string, string>;
    };
  };
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
   * Optional, global font metadata for the schema.
   *
   * When present, `body` is required and `heading` is always published (it
   * mirrors `body` when the schema doesn't define it).
   */
  font?: ManifestFonts;
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
