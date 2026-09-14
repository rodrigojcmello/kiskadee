import type { ComponentSizeSupport, DensityScaleMapJSON } from '@kiskadee/core';
import type { ManifestComponent } from '../phase-7-publish-metadata/manifestTypes.ts';

export type StylesheetResource = { path: string; sha256: string; order: number };
export type ComponentResourceArtifact = {
  component: string;
  sizeSupport: ComponentSizeSupport;
  density?: DensityScaleMapJSON;
  capabilities?: Omit<ManifestComponent, 'artifacts'>;
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
