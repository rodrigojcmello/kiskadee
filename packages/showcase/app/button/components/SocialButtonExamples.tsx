import {
  BRAND_PACK_IDS,
  type BrandId,
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
    presentation?: 'adaptiveOutline' | 'brand' | 'monochrome';
  }
>;

type ShowcaseBrand = {
  icon: BrandIcon;
  label: string;
  hasBrandPresentation: boolean;
};

type BrandActionExample = {
  action: string;
  brandId: BrandId;
};

type BrandActionGroup = {
  id: string;
  title: string;
  examples: readonly BrandActionExample[];
};

const icon = (component: ComponentType<IconProps>): BrandIcon => component as BrandIcon;

const SHOWCASE_BRANDS = {
  apple: {
    icon: icon(SocialIcons.AppleIcon),
    label: 'Apple',
    hasBrandPresentation: true
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
    hasBrandPresentation: true
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
    hasBrandPresentation: true
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
    hasBrandPresentation: true
  },
  mastodon: {
    icon: icon(SocialIcons.MastodonIcon),
    label: 'Mastodon',
    hasBrandPresentation: true
  },
  'git-hub': {
    icon: icon(SocialIcons.GitHubIcon),
    label: 'GitHub',
    hasBrandPresentation: true
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

const BRAND_RESOURCE_GROUPS = BRAND_PACK_IDS.map((id) => ({
  id,
  brandIds: getBrandPackDefinition(id).brands,
  brands: getBrandPackDefinition(id).brands.map((brandId) => ({
    id: brandId,
    ...SHOWCASE_BRANDS[brandId]
  }))
}));

const ACTION_GROUPS = [
  {
    id: 'continue-with',
    title: 'Continue with',
    examples: [
      { brandId: 'apple', action: 'Continue with Apple' },
      { brandId: 'google', action: 'Continue with Google' },
      { brandId: 'microsoft', action: 'Continue with Microsoft' },
      { brandId: 'linked-in', action: 'Continue with LinkedIn' },
      { brandId: 'x', action: 'Continue with X' }
    ]
  },
  {
    id: 'ask',
    title: 'Ask',
    examples: [
      { brandId: 'chat-gpt', action: 'Ask ChatGPT' },
      { brandId: 'claude', action: 'Ask Claude' },
      { brandId: 'gemini', action: 'Ask Gemini' }
    ]
  },
  {
    id: 'follow-on',
    title: 'Follow on',
    examples: [
      { brandId: 'facebook', action: 'Follow on Facebook' },
      { brandId: 'instagram', action: 'Follow on Instagram' },
      { brandId: 'x', action: 'Follow on X' },
      { brandId: 'threads', action: 'Follow on Threads' },
      { brandId: 'mastodon', action: 'Follow on Mastodon' },
      { brandId: 'snapchat', action: 'Follow on Snapchat' },
      { brandId: 'linked-in', action: 'Follow on LinkedIn' }
    ]
  },
  {
    id: 'watch-on',
    title: 'Watch on',
    examples: [
      { brandId: 'you-tube', action: 'Watch on YouTube' },
      { brandId: 'tik-tok', action: 'Watch on TikTok' },
      { brandId: 'twitch', action: 'Watch on Twitch' },
      { brandId: 'vimeo', action: 'Watch on Vimeo' }
    ]
  },
  {
    id: 'chat-on',
    title: 'Chat on',
    examples: [
      { brandId: 'whats-app', action: 'Chat on WhatsApp' },
      { brandId: 'messenger', action: 'Chat on Messenger' },
      { brandId: 'telegram', action: 'Chat on Telegram' },
      { brandId: 'discord', action: 'Chat on Discord' }
    ]
  },
  {
    id: 'others',
    title: 'Others',
    examples: [
      { brandId: 'pinterest', action: 'Save on Pinterest' },
      { brandId: 'reddit', action: 'Discuss on Reddit' },
      { brandId: 'git-hub', action: 'View on GitHub' },
      { brandId: 'substack', action: 'Subscribe on Substack' }
    ]
  }
] as const satisfies readonly BrandActionGroup[];

const ACTION_RESOURCE_GROUPS = ACTION_GROUPS.map((actionGroup) => ({
  ...actionGroup,
  resources: BRAND_RESOURCE_GROUPS.map((resourceGroup) => ({
    id: resourceGroup.id,
    examples: actionGroup.examples.filter(({ brandId }) => resourceGroup.brandIds.includes(brandId))
  })).filter(({ examples }) => examples.length > 0)
}));

const ACTION_COLUMNS = [
  {
    buttonIntent: 'brand',
    emphasis: 'high',
    iconTreatment: 'surface',
    id: 'brand-high-surface',
    title: 'Brand high + icon surface'
  },
  {
    buttonIntent: 'brand',
    emphasis: 'high',
    id: 'brand-high',
    title: 'Brand high emphasis'
  },
  {
    buttonIntent: 'brand',
    emphasis: 'low',
    id: 'brand-low',
    title: 'Brand low emphasis'
  }
] as const satisfies ReadonlyArray<{
  buttonIntent: 'brand' | 'primary';
  emphasis: 'high' | 'low';
  iconTreatment?: 'surface';
  id: string;
  title: string;
}>;

const EMPHASES = [
  'high',
  'medium',
  'low',
  'lowest'
] as const satisfies readonly ComponentEmphasis[];
const SURFACE_CONTEXTS = ['onSubtle', 'onVivid'] as const satisfies readonly SurfaceContext[];
const ICON_TREATMENT_EXAMPLES = [
  {
    id: 'plain',
    iconTreatment: 'plain',
    presentation: 'monochrome',
    title: 'Plain'
  },
  {
    id: 'surface',
    iconTreatment: 'surface',
    presentation: 'brand',
    title: 'Surface'
  }
] as const;

function BrandActionColumn({
  buttonIntent,
  columnId,
  emphasis,
  fontName,
  iconTreatment,
  scale,
  surfaceContext,
  title
}: {
  buttonIntent: 'brand' | 'primary';
  columnId: string;
  emphasis: 'high' | 'low';
  fontName: string;
  iconTreatment?: 'surface';
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
  title: string;
}) {
  return (
    <section className={styles.brandActionColumn} aria-labelledby={`brand-action-${columnId}`}>
      <h5 id={`brand-action-${columnId}`}>{title}</h5>
      <div className={styles.brandActionSections}>
        {ACTION_RESOURCE_GROUPS.map((actionGroup) => (
          <section
            className={styles.brandActionSection}
            aria-labelledby={`brand-action-${columnId}-${actionGroup.id}`}
            key={actionGroup.id}
          >
            <h6 id={`brand-action-${columnId}-${actionGroup.id}`}>{actionGroup.title}</h6>
            <ul className={styles.brandActionList}>
              {actionGroup.resources.map((resourceGroup) => (
                <BrandPackBoundary
                  key={resourceGroup.id}
                  pack={resourceGroup.id}
                  components={['button']}
                  fallback={null}
                >
                  {resourceGroup.examples.map(({ action, brandId }) => {
                    const { icon: BrandIcon, hasBrandPresentation } = SHOWCASE_BRANDS[brandId];
                    const appearance =
                      iconTreatment === 'surface'
                        ? ({ construction: 'mark', presentation: 'brand' } as const)
                        : getRecommendedBrandIconAppearance(
                            brandId,
                            surfaceContext,
                            emphasis,
                            hasBrandPresentation
                          );

                    return (
                      <li key={brandId}>
                        <KButton
                          emphasis={emphasis}
                          iconLayout="edge"
                          iconPlacement="leading"
                          iconTreatment={iconTreatment}
                          intent={buttonIntent === 'brand' ? brandIntent(brandId) : 'primary'}
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
                              {action}
                            </SmoothText>
                          </KButton.Label>
                        </KButton>
                      </li>
                    );
                  })}
                </BrandPackBoundary>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function IconTreatmentComparison({
  fontName,
  scale,
  surfaceContext
}: {
  fontName: string;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const GoogleIcon = SHOWCASE_BRANDS.google.icon;

  return (
    <section aria-labelledby="brand-icon-treatment-title">
      <h4 id="brand-icon-treatment-title">Icon region treatments</h4>
      <p className={styles.iconTreatmentDescription}>
        The same Primary high action compares a foreground-following logo with a brand mark on a
        stable light icon surface.
      </p>
      <div className={styles.iconTreatmentGrid}>
        {ICON_TREATMENT_EXAMPLES.map((example) => (
          <article className={styles.iconTreatmentExample} key={example.id}>
            <h5>{example.title}</h5>
            <KButton
              emphasis="high"
              iconLayout="edge"
              iconPlacement="leading"
              iconTreatment={example.iconTreatment}
              intent="primary"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <KButton.Icon>
                <GoogleIcon
                  construction="mark"
                  presentation={example.presentation}
                  width="100%"
                  height="100%"
                />
              </KButton.Icon>
              <KButton.Label>
                <SmoothText fontName={fontName} align="center">
                  Continue with Google
                </SmoothText>
              </KButton.Label>
            </KButton>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SocialButtonExamples({
  fontName,
  iconRegionAvailable,
  scale,
  onSubtleBackground,
  onVividBackground,
  surfaceContext
}: {
  fontName: string;
  iconRegionAvailable: boolean;
  scale: ElementSizeValue;
  onSubtleBackground?: string;
  onVividBackground?: string;
  surfaceContext: SurfaceContext;
}) {
  return (
    <section className={styles.showcaseSection} aria-labelledby="social-button-examples-title">
      <h3 id="social-button-examples-title">Brand buttons</h3>
      <p className={styles.showcaseSectionDescription}>
        Brand intents reuse the Fluent Button formula without adding brand colors to the preset. The
        same unified set of practical actions compares brand high with a surfaced mark, brand high,
        and brand low, while every state reference shares one collection.
      </p>
      <div className={styles.brandCollection}>
        <section aria-labelledby="brand-action-examples-title">
          <h4 id="brand-action-examples-title">Action examples</h4>
          <div className={styles.brandActionColumns}>
            {ACTION_COLUMNS.filter(
              (column) => !('iconTreatment' in column) || iconRegionAvailable
            ).map((column) => (
              <BrandActionColumn
                buttonIntent={column.buttonIntent}
                columnId={column.id}
                emphasis={column.emphasis}
                fontName={fontName}
                iconTreatment={'iconTreatment' in column ? column.iconTreatment : undefined}
                key={column.id}
                scale={scale}
                surfaceContext={surfaceContext}
                title={column.title}
              />
            ))}
          </div>
        </section>

        {iconRegionAvailable ? (
          <IconTreatmentComparison
            fontName={fontName}
            scale={scale}
            surfaceContext={surfaceContext}
          />
        ) : null}

        <section aria-labelledby="brand-state-references-title">
          <h4 id="brand-state-references-title">State references</h4>
          <div className={styles.brandExampleGrid}>
            {BRAND_RESOURCE_GROUPS.map((resourceGroup) => (
              <BrandPackBoundary
                key={resourceGroup.id}
                pack={resourceGroup.id}
                components={['button']}
                fallback={
                  <p className={styles.brandPackFallback}>
                    Some brand references are unavailable for this Design System.
                  </p>
                }
              >
                {resourceGroup.brands.map(
                  ({ id, icon: BrandIcon, label, hasBrandPresentation }) => (
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
                                surfaceContext === 'onSubtle'
                                  ? onSubtleBackground
                                  : onVividBackground
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
                  )
                )}
              </BrandPackBoundary>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
