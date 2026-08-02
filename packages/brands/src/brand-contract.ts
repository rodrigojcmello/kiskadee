import type { HexColor } from '@kiskadee/core';

export const BRAND_IDS = [
  'apple',
  'google',
  'microsoft',
  'chat-gpt',
  'claude',
  'gemini',
  'facebook',
  'you-tube',
  'whats-app',
  'instagram',
  'tik-tok',
  'messenger',
  'telegram',
  'snapchat',
  'x',
  'pinterest',
  'reddit',
  'linked-in',
  'discord',
  'twitch',
  'threads',
  'mastodon',
  'git-hub',
  'vimeo',
  'substack'
] as const;

export type BrandId = (typeof BRAND_IDS)[number];

export const BRAND_SEED_SOURCES = [
  'official-action-background',
  'official-logo-accent',
  'official-gradient-stop',
  'official-black'
] as const;

export type BrandSeedSource = (typeof BRAND_SEED_SOURCES)[number];
export type BrandContentPolarity = 'light' | 'dark';
export type BrandIntent<Id extends BrandId = BrandId> = `brand.${Id}`;

export type BrandDefinition<Id extends BrandId = BrandId> = {
  id: Id;
  iconId: string;
  seedHex: HexColor;
  seedSource: BrandSeedSource;
  contentPolarity: BrandContentPolarity;
  provenanceUrl: string;
};

export const BRAND_PACK_IDS = ['auth', 'social'] as const;
export type BrandPackId = (typeof BRAND_PACK_IDS)[number];

export type BrandPackDefinition<Id extends BrandPackId = BrandPackId> = {
  id: Id;
  brands: readonly BrandId[];
};

export function isBrandId(value: string): value is BrandId {
  return (BRAND_IDS as readonly string[]).includes(value);
}

export function isBrandPackId(value: string): value is BrandPackId {
  return (BRAND_PACK_IDS as readonly string[]).includes(value);
}

export function brandIntent<const Id extends BrandId>(id: Id): BrandIntent<Id> {
  return `brand.${id}`;
}
