import type { StandaloneKiskadeeTonalFamilyArtifact } from '@kiskadee/tonal-scale/standalone';

import type {
  BrandContentPolarity,
  BrandDefinition,
  BrandId,
  BrandIntent,
  BrandPackId,
  BrandSeedSource
} from './brand-contract.ts';

export const BRAND_CATALOG_FORMAT_VERSION = 1 as const;
export const BRAND_CATALOG_CONTRACT = 'kiskadee-brand-catalog-v1' as const;
export const BRAND_PACK_FORMAT_VERSION = 1 as const;
export const BRAND_PACK_CONTRACT = 'kiskadee-brand-pack-v1' as const;

export type BrandArtifactGenerator = {
  package: '@kiskadee/brands';
  version: string;
};

export type PublishedBrandDefinition = {
  id: BrandId;
  intent: BrandIntent;
  iconId: string;
  seedHex: string;
  seedSource: BrandSeedSource;
  contentPolarity: BrandContentPolarity;
  provenanceUrl: string;
  tonalAsset: `scales/${BrandId}.json`;
  tonalIntegritySha256: string;
};

export type BrandCatalogPackEntry = {
  id: BrandPackId;
  asset: `packs/${BrandPackId}.json`;
  brands: readonly BrandId[];
};

export type BrandCatalogArtifact = {
  kind: typeof BRAND_CATALOG_CONTRACT;
  formatVersion: typeof BRAND_CATALOG_FORMAT_VERSION;
  generator: BrandArtifactGenerator;
  brands: readonly PublishedBrandDefinition[];
  packs: readonly BrandCatalogPackEntry[];
};

export type BrandPackEntry = Pick<
  PublishedBrandDefinition,
  'id' | 'intent' | 'iconId' | 'contentPolarity' | 'tonalAsset' | 'tonalIntegritySha256'
>;

export type BrandPackArtifact = {
  kind: typeof BRAND_PACK_CONTRACT;
  formatVersion: typeof BRAND_PACK_FORMAT_VERSION;
  generator: BrandArtifactGenerator;
  id: BrandPackId;
  brands: readonly BrandPackEntry[];
};

export type GeneratedBrandArtifacts = {
  catalog: BrandCatalogArtifact;
  packs: Readonly<Record<BrandPackId, BrandPackArtifact>>;
  scales: Readonly<Record<BrandId, StandaloneKiskadeeTonalFamilyArtifact>>;
};

export function publishBrandDefinition(
  definition: BrandDefinition,
  tonalArtifact: StandaloneKiskadeeTonalFamilyArtifact
): PublishedBrandDefinition {
  return {
    id: definition.id,
    intent: `brand.${definition.id}`,
    iconId: definition.iconId,
    seedHex: definition.seedHex,
    seedSource: definition.seedSource,
    contentPolarity: definition.contentPolarity,
    provenanceUrl: definition.provenanceUrl,
    tonalAsset: `scales/${definition.id}.json`,
    tonalIntegritySha256: tonalArtifact.integrity.payloadSha256
  };
}
