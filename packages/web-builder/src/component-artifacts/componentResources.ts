import type {
  ComponentSizeSupport,
  DensityScaleMapJSON,
  ElementHeightReference,
  RadiusMode
} from '@kiskadee/core';
import type { ManifestComponent } from '../phase-7-publish-metadata/manifestTypes.ts';
import type {
  COMPONENT_PALETTE_FORMAT_VERSION,
  CompactPaletteConfig
} from './surfacePaletteWire.ts';

export type StylesheetResource = { path: string; sha256: string; order: number };
type ComponentResourceCapabilities = Omit<ManifestComponent, 'artifacts'> & {
  /** Selected Dropdown palette has a visible Rest fill behind panel content. */
  panelFill?: true;
};
export type ComponentInspectionArtifact = {
  elements: Partial<Record<'e1' | 'e8', { scales: { _boxHeight: ElementHeightReference } }>>;
};
export type ComponentResourceArtifact = {
  formatVersion: 3;
  component: string;
  sizeSupport: ComponentSizeSupport;
  layouts?: {
    stacked?: { sizes: string[]; sizesByRadius?: Record<RadiusMode, string[]> };
  };
  /** Complete indicator geometry for existing Button sizes; paint is resolved per placement. */
  indicator?: {
    sizesByRadius: Record<RadiusMode, string[]>;
    stackedSizesByRadius?: Record<RadiusMode, string[]>;
    outsideSizesByRadius?: Record<RadiusMode, string[]>;
    stackedOutsideSizesByRadius?: Record<RadiusMode, string[]>;
  };
  density?: DensityScaleMapJSON;
  capabilities?: ComponentResourceCapabilities;
  inspection?: ComponentInspectionArtifact;
  resources: {
    core?: string;
    palettes?: Record<string, string>;
    styles: StylesheetResource[];
  };
};

export type ComponentPaletteResourceArtifact = {
  formatVersion: typeof COMPONENT_PALETTE_FORMAT_VERSION;
  component: string;
  styles: StylesheetResource[];
  classMap?: string;
  capabilities?: ComponentResourceCapabilities;
  config?: CompactPaletteConfig;
};
