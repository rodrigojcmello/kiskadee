import type {
  BrandDefinition,
  BrandId,
  BrandPackDefinition,
  BrandPackId
} from './brand-contract.ts';

export const BRAND_DEFINITIONS = [
  {
    id: 'apple',
    iconId: 'apple',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl:
      'https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple'
  },
  {
    id: 'google',
    iconId: 'google',
    seedHex: '#0b57d0',
    seedSource: 'official-action-background',
    contentPolarity: 'light',
    provenanceUrl: 'https://developers.google.com/identity/gsi/web/reference/html-reference'
  },
  {
    id: 'microsoft',
    iconId: 'microsoft',
    seedHex: '#0064b4',
    seedSource: 'official-action-background',
    contentPolarity: 'light',
    provenanceUrl: 'https://fluent2.microsoft.design/color-tokens/'
  },
  {
    id: 'chat-gpt',
    iconId: 'chat-gpt',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl: 'https://openai.com/brand/'
  },
  {
    id: 'claude',
    iconId: 'claude',
    seedHex: '#d97757',
    seedSource: 'official-logo-accent',
    contentPolarity: 'dark',
    provenanceUrl: 'https://www.anthropic.com/press-kit'
  },
  {
    id: 'gemini',
    iconId: 'gemini',
    seedHex: '#078efb',
    seedSource: 'official-gradient-stop',
    contentPolarity: 'light',
    provenanceUrl: 'https://about.google/company-info/brand-resource-center/'
  },
  {
    id: 'facebook',
    iconId: 'facebook',
    seedHex: '#0866ff',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://www.meta.com/brand/resources/facebook/logo/'
  },
  {
    id: 'you-tube',
    iconId: 'you-tube',
    seedHex: '#ff0033',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://brand.youtube/youtube-icon/#monochromatic-logos'
  },
  {
    id: 'whats-app',
    iconId: 'whats-app',
    seedHex: '#25d366',
    seedSource: 'official-logo-accent',
    contentPolarity: 'dark',
    provenanceUrl: 'https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/'
  },
  {
    id: 'instagram',
    iconId: 'instagram',
    seedHex: '#d300c5',
    seedSource: 'official-gradient-stop',
    contentPolarity: 'light',
    provenanceUrl: 'https://www.meta.com/brand/resources/instagram/instagram-brand/'
  },
  {
    id: 'tik-tok',
    iconId: 'tik-tok',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl: 'https://developers.tiktok.com/doc/getting-started-design-guidelines'
  },
  {
    id: 'messenger',
    iconId: 'messenger',
    seedHex: '#006aff',
    seedSource: 'official-gradient-stop',
    contentPolarity: 'light',
    provenanceUrl: 'https://www.meta.com/brand/resources/facebook/messenger-icon/'
  },
  {
    id: 'telegram',
    iconId: 'telegram',
    seedHex: '#229ed9',
    seedSource: 'official-gradient-stop',
    contentPolarity: 'light',
    provenanceUrl: 'https://telegram.org/press'
  },
  {
    id: 'snapchat',
    iconId: 'snapchat',
    seedHex: '#fffc00',
    seedSource: 'official-logo-accent',
    contentPolarity: 'dark',
    provenanceUrl: 'https://www.snap.com/brand-guidelines?lang=en-US'
  },
  {
    id: 'x',
    iconId: 'x',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl: 'https://about.x.com/en/who-we-are/brand-toolkit'
  },
  {
    id: 'pinterest',
    iconId: 'pinterest',
    seedHex: '#e60023',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://business.pinterest.com/en-us/brand-guidelines/'
  },
  {
    id: 'reddit',
    iconId: 'reddit',
    seedHex: '#ff4500',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://redditbrand.lingoapp.com/s/Logo-d9x3n2?v=44'
  },
  {
    id: 'linked-in',
    iconId: 'linked-in',
    seedHex: '#0a66c2',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://brand.linkedin.com/downloads'
  },
  {
    id: 'discord',
    iconId: 'discord',
    seedHex: '#5865f2',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://discord.com/branding'
  },
  {
    id: 'twitch',
    iconId: 'twitch',
    seedHex: '#9146ff',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://brand.twitch.com/'
  },
  {
    id: 'threads',
    iconId: 'threads',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl: 'https://www.meta.com/brand/resources/instagram/threads/'
  },
  {
    id: 'mastodon',
    iconId: 'mastodon',
    seedHex: '#6364ff',
    seedSource: 'official-logo-accent',
    contentPolarity: 'light',
    provenanceUrl: 'https://joinmastodon.org/branding'
  },
  {
    id: 'git-hub',
    iconId: 'git-hub',
    seedHex: '#000000',
    seedSource: 'official-monochrome',
    contentPolarity: 'light',
    provenanceUrl: 'https://brand.github.com/foundations/logo'
  },
  {
    id: 'vimeo',
    iconId: 'vimeo',
    seedHex: '#1ab7ea',
    seedSource: 'official-logo-accent',
    contentPolarity: 'dark',
    provenanceUrl: 'https://vimeo.com/press/media-kit'
  },
  {
    id: 'substack',
    iconId: 'substack',
    seedHex: '#ff6719',
    seedSource: 'official-logo-accent',
    contentPolarity: 'dark',
    provenanceUrl: 'https://substack.com/brand'
  }
] as const satisfies readonly BrandDefinition[];

export const BRAND_DEFINITION_BY_ID = Object.freeze(
  Object.fromEntries(BRAND_DEFINITIONS.map((definition) => [definition.id, definition]))
) as unknown as Readonly<Record<BrandId, BrandDefinition>>;

export const BRAND_PACK_DEFINITIONS = [
  {
    id: 'auth',
    brands: ['apple', 'google', 'microsoft']
  },
  {
    id: 'social',
    brands: [
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
    ]
  }
] as const satisfies readonly BrandPackDefinition[];

export const BRAND_PACK_DEFINITION_BY_ID = Object.freeze(
  Object.fromEntries(BRAND_PACK_DEFINITIONS.map((definition) => [definition.id, definition]))
) as unknown as Readonly<Record<BrandPackId, BrandPackDefinition>>;

export function getBrandDefinition(id: BrandId): BrandDefinition {
  return BRAND_DEFINITION_BY_ID[id];
}

export function getBrandPackDefinition(id: BrandPackId): BrandPackDefinition {
  return BRAND_PACK_DEFINITION_BY_ID[id];
}
