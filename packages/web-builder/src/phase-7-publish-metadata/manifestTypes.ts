// Public manifest types describing high-level capabilities per design system.
//
// These types are intentionally side-effect free so they can be safely
// imported from other packages (e.g., @kiskadee/react-components or
// @kiskadee/showcase) through the root "@kiskadee/web-builder/types"
// entrypoint.

import type { ButtonIconTreatment, ComponentName, SurfaceContext } from '@kiskadee/core';

export type ManifestFonts = {
  body: string;
  heading?: string;
  code?: string;
};

export type ManifestIcons = {
  family: string;
  variant?: string;
};

export type ManifestTypography = {
  artifact: string;
};

export type ManifestBrandPacks = {
  packs: string[];
};

export type ManifestComponentState = Record<
  string, // semantic: primary, neutral, redLike, ...
  Record<
    string, // emphasis: highest, high, medium, low, lowest
    Record<string, true> // state: rest, hover, focus, pressed, selected, disabled, ...
  >
>;

export type ManifestComponent = {
  /** The component publishes a serialized descendant surface-context map. */
  contentSurfaceContext?: true;
  /**
   * Button icon-region treatments supported by the component schema.
   *
   * This capability is only published for Button.
   */
  iconTreatments?: ButtonIconTreatment[];

  /**
   * Interaction states supported by the component, grouped by palette and surface context.
   *
   * Palette keys use the existing `<segment>.<theme>` convention. Only positive information is
   * stored: absent contexts or state keys are not supported or not defined in the schema.
   */
  surfaceContexts?: Record<
    string,
    Partial<Record<SurfaceContext, { state?: ManifestComponentState }>>
  >;

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
   * Optional, compact font-role metadata for the schema.
   *
   * Family catalogs and stacks live in `global.kiskadee.json`; the manifest only
   * exposes the selected family ID for each explicitly declared role.
   */
  fonts?: ManifestFonts;
  /**
   * Optional icon-family and local-variant recommendation selected by the schema.
   *
   * Glyph definitions and loaders remain outside build artifacts.
   */
  icons?: ManifestIcons;
  /**
   * Descriptive typography catalog. Definitions and usage stay in the referenced artifact.
   */
  typography?: ManifestTypography;
  /**
   * Optional Brand Pack IDs published outside the preset's baseline artifacts.
   *
   * Detailed resources and supported components remain in each pack manifest.
   */
  brandPacks?: ManifestBrandPacks;
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
