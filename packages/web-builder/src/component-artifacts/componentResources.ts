import type {
  ComponentSizeSupport,
  DensityScaleMapJSON,
  ElementHeightReference,
  RadiusMode
} from '@kiskadee/core';
import type { ManifestComponent } from '../phase-7-publish-metadata/manifestTypes.ts';

export type StylesheetResource = { path: string; sha256: string; order: number };
export type ComponentInspectionArtifact = {
  elements: Partial<Record<'e1' | 'e8', { scales: { _boxHeight: ElementHeightReference } }>>;
};
export type ComponentResourceArtifact = {
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
  capabilities?: Omit<ManifestComponent, 'artifacts'>;
  inspection?: ComponentInspectionArtifact;
  resources: {
    core?: string;
    palettes?: Record<string, string>;
    styles: StylesheetResource[];
  };
};

export type ComponentPaletteResourceArtifact = {
  component: string;
  styles: StylesheetResource[];
  classMap?: string;
  capabilities?: Omit<ManifestComponent, 'artifacts'>;
  config?: { options?: Record<string, unknown>; contentSurfaceContext?: unknown };
};
