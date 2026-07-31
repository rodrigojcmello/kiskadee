import type { BrandContentPolarity, BrandId, BrandPackId } from '@kiskadee/brands';

export const BRAND_PACK_BUILD_CONTRACT = 'kiskadee.brand-pack-build.v1' as const;
export const BRAND_PACK_BUILD_FORMAT_VERSION = 1 as const;

export type BrandPackPaletteArtifact = {
  css: string;
  cssSha256: string;
  classMaps: Record<string, string>;
  classMapSha256: Record<string, string>;
};

export type BrandPackBuildManifest = {
  kind: typeof BRAND_PACK_BUILD_CONTRACT;
  formatVersion: typeof BRAND_PACK_BUILD_FORMAT_VERSION;
  designSystem: string;
  pack: BrandPackId;
  namespace: string;
  brands: Array<{
    id: BrandId;
    intent: `brand.${BrandId}`;
    iconId: string;
    contentPolarity: BrandContentPolarity;
    tonalIntegritySha256: string;
  }>;
  components: string[];
  palettes: Record<string, BrandPackPaletteArtifact>;
};
