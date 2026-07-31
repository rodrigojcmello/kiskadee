import {
  type BrandId,
  type BrandPackId,
  brandIntent,
  getBrandPackDefinition
} from '@kiskadee/brands';
import type { ComponentEmphasis, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { type IconProps, SocialIcons } from '@kiskadee/icons';
import { BrandPackBoundary, Button as KButton, SmoothText } from '@kiskadee/react-components';
import type { ComponentType } from 'react';
import { getRecommendedBrandIconAppearance } from '../../../utils/brand-icon-presentation';
import styles from '../Button.module.scss';

type BrandIcon = ComponentType<
  IconProps & {
    construction?: 'contained' | 'mark';
    presentation?: 'brand' | 'monochrome';
  }
>;

type ShowcaseBrand = {
  icon: BrandIcon;
  label: string;
  hasBrandPresentation: boolean;
};

const icon = (component: ComponentType<IconProps>): BrandIcon => component as BrandIcon;

const SHOWCASE_BRANDS = {
  apple: {
    icon: icon(SocialIcons.AppleIcon),
    label: 'Apple',
    hasBrandPresentation: false
  },
  google: {
    icon: icon(SocialIcons.GoogleIcon),
    label: 'Google',
    hasBrandPresentation: true
  },
  microsoft: {
    icon: icon(SocialIcons.MicrosoftIcon),
    label: 'Microsoft',
    hasBrandPresentation: true
  },
  'chat-gpt': {
    icon: icon(SocialIcons.ChatGPTIcon),
    label: 'ChatGPT',
    hasBrandPresentation: false
  },
  claude: {
    icon: icon(SocialIcons.ClaudeIcon),
    label: 'Claude',
    hasBrandPresentation: true
  },
  gemini: {
    icon: icon(SocialIcons.GeminiIcon),
    label: 'Gemini',
    hasBrandPresentation: true
  },
  facebook: {
    icon: icon(SocialIcons.FacebookIcon),
    label: 'Facebook',
    hasBrandPresentation: true
  },
  'you-tube': {
    icon: icon(SocialIcons.YouTubeIcon),
    label: 'YouTube',
    hasBrandPresentation: true
  },
  'whats-app': {
    icon: icon(SocialIcons.WhatsAppIcon),
    label: 'WhatsApp',
    hasBrandPresentation: true
  },
  instagram: {
    icon: icon(SocialIcons.InstagramIcon),
    label: 'Instagram',
    hasBrandPresentation: true
  },
  'tik-tok': {
    icon: icon(SocialIcons.TikTokIcon),
    label: 'TikTok',
    hasBrandPresentation: true
  },
  messenger: {
    icon: icon(SocialIcons.MessengerIcon),
    label: 'Messenger',
    hasBrandPresentation: true
  },
  telegram: {
    icon: icon(SocialIcons.TelegramIcon),
    label: 'Telegram',
    hasBrandPresentation: true
  },
  snapchat: {
    icon: icon(SocialIcons.SnapchatIcon),
    label: 'Snapchat',
    hasBrandPresentation: true
  },
  x: {
    icon: icon(SocialIcons.XIcon),
    label: 'X',
    hasBrandPresentation: false
  },
  pinterest: {
    icon: icon(SocialIcons.PinterestIcon),
    label: 'Pinterest',
    hasBrandPresentation: true
  },
  reddit: {
    icon: icon(SocialIcons.RedditIcon),
    label: 'Reddit',
    hasBrandPresentation: true
  },
  'linked-in': {
    icon: icon(SocialIcons.LinkedInIcon),
    label: 'LinkedIn',
    hasBrandPresentation: true
  },
  discord: {
    icon: icon(SocialIcons.DiscordIcon),
    label: 'Discord',
    hasBrandPresentation: true
  },
  twitch: {
    icon: icon(SocialIcons.TwitchIcon),
    label: 'Twitch',
    hasBrandPresentation: true
  },
  threads: {
    icon: icon(SocialIcons.ThreadsIcon),
    label: 'Threads',
    hasBrandPresentation: false
  },
  mastodon: {
    icon: icon(SocialIcons.MastodonIcon),
    label: 'Mastodon',
    hasBrandPresentation: true
  },
  'git-hub': {
    icon: icon(SocialIcons.GitHubIcon),
    label: 'GitHub',
    hasBrandPresentation: false
  },
  vimeo: {
    icon: icon(SocialIcons.VimeoIcon),
    label: 'Vimeo',
    hasBrandPresentation: true
  },
  substack: {
    icon: icon(SocialIcons.SubstackIcon),
    label: 'Substack',
    hasBrandPresentation: true
  }
} satisfies Record<BrandId, ShowcaseBrand>;

const BRAND_GROUP_TITLES = {
  auth: 'Authentication',
  social: 'Social and platforms'
} satisfies Record<BrandPackId, string>;

const BRAND_GROUPS = (['auth', 'social'] as const satisfies readonly BrandPackId[]).map((id) => ({
  id,
  title: BRAND_GROUP_TITLES[id],
  brands: getBrandPackDefinition(id).brands.map((brandId) => ({
    id: brandId,
    ...SHOWCASE_BRANDS[brandId]
  }))
}));

const EMPHASES = [
  'high',
  'medium',
  'low',
  'lowest'
] as const satisfies readonly ComponentEmphasis[];
const SURFACE_CONTEXTS = ['onSubtle', 'onVivid'] as const satisfies readonly SurfaceContext[];

export function SocialButtonExamples({
  fontName,
  scale,
  onSubtleBackground,
  onVividBackground
}: {
  fontName: string;
  scale: ElementSizeValue;
  onSubtleBackground?: string;
  onVividBackground?: string;
}) {
  return (
    <section className={styles.showcaseSection} aria-labelledby="social-button-examples-title">
      <h3 id="social-button-examples-title">Brand color packs</h3>
      <p className={styles.showcaseSectionDescription}>
        Optional Auth and Social packs reuse the Fluent Button formula without adding brand colors
        to the preset. Each pack is loaded only inside its explicit boundary.
      </p>
      {BRAND_GROUPS.map((group) => (
        <BrandPackBoundary
          key={group.id}
          pack={group.id}
          components={['button']}
          fallback={
            <p className={styles.brandPackFallback}>
              {group.title} brand pack is unavailable for this Design System.
            </p>
          }
        >
          <section className={styles.brandPackGroup} aria-labelledby={`brand-pack-${group.id}`}>
            <h4 id={`brand-pack-${group.id}`}>{group.title}</h4>
            <div className={styles.brandExampleGrid}>
              {group.brands.map(({ id, icon: BrandIcon, label, hasBrandPresentation }) => {
                return (
                  <article className={styles.brandExample} key={id}>
                    <h5>{label}</h5>
                    <div className={styles.brandContextGrid}>
                      {SURFACE_CONTEXTS.map((surfaceContext) => (
                        <div
                          className={`${styles.brandContextSurface} ${
                            surfaceContext === 'onVivid' ? styles.brandContextSurfaceVivid : ''
                          } k-root`}
                          key={surfaceContext}
                          style={{
                            backgroundColor:
                              surfaceContext === 'onSubtle' ? onSubtleBackground : onVividBackground
                          }}
                        >
                          <span>{surfaceContext === 'onSubtle' ? 'On subtle' : 'On vivid'}</span>
                          <div className={styles.brandEmphasisGrid}>
                            {EMPHASES.map((emphasis) => {
                              const appearance = getRecommendedBrandIconAppearance(
                                id,
                                surfaceContext,
                                emphasis,
                                hasBrandPresentation
                              );

                              return (
                                <KButton
                                  emphasis={emphasis}
                                  iconLayout="edge"
                                  iconPlacement="leading"
                                  intent={brandIntent(id)}
                                  key={emphasis}
                                  scale={scale}
                                  surfaceContext={surfaceContext}
                                >
                                  <KButton.Icon>
                                    <BrandIcon
                                      construction={appearance.construction}
                                      presentation={appearance.presentation}
                                      width="100%"
                                      height="100%"
                                    />
                                  </KButton.Icon>
                                  <KButton.Label>
                                    <SmoothText fontName={fontName} align="center">
                                      {emphasis}
                                    </SmoothText>
                                  </KButton.Label>
                                </KButton>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </BrandPackBoundary>
      ))}
    </section>
  );
}
