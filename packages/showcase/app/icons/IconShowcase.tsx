'use client';

import type { IconIntent, IconScale, SchemaIconSizes, SurfaceContext } from '@kiskadee/core';
import iconManifest from '@kiskadee/icons/icons.json';
import { CANONICAL_ICON_NAMES, type CanonicalIconName } from '@kiskadee/icons/interface';
import { interfaceIconFamilyOptions } from '@kiskadee/icons/interface/catalog';
import * as SocialIcons from '@kiskadee/icons/social';
import {
  FamilyResolvedIcon,
  Icon as KIcon,
  useIconFamilyStatus,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { useMemo, useState } from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseIconographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import {
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useButtonStressTestBackgroundTones } from '@/hooks/use-background-tones';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { isDarkSurfaceColor } from '@/utils/canonical-card-surfaces';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import s from './Icons.module.scss';

type SocialIconComponent = ComponentType<
  SVGProps<SVGSVGElement> & {
    construction?: string;
    presentation?: string;
  }
>;

type SocialIconAppearance = {
  colorBehavior: 'adaptive' | 'currentColor' | 'fixed' | 'gradient';
  construction: string;
  label?: string;
  presentation: string;
};

type SocialIconEntry = {
  appearances: SocialIconAppearance[];
  cardKey: string;
  component: SocialIconComponent;
  constructions: string[];
  name: string;
};

type PublishedIconManifest = {
  icons: Array<{
    componentName: string;
    constructions: Record<
      string,
      {
        presentations: Record<
          string,
          {
            colorBehavior: SocialIconAppearance['colorBehavior'];
          }
        >;
      }
    >;
    family: string;
  }>;
};

const SNAPCHAT_SHOWCASE_APPEARANCES = new Map([
  ['contained.brand', 'brand'],
  ['mark.monochrome', 'monochrome']
]);

const ICON_INTENT_OPTIONS: Array<{ value: IconIntent; label: string }> = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'primary', label: 'Primary' }
];

function formatScaleLabel(scale: IconScale): string {
  const [, family, step] = scale.split(':');
  const familyLabel = family === 'sm' ? 'Small' : family === 'md' ? 'Medium' : 'Large';

  return step === '1' ? familyLabel : `${familyLabel} ${step}`;
}

function getSocialIconEntries(
  iconNamespace: Record<string, unknown>,
  manifest: PublishedIconManifest
): SocialIconEntry[] {
  return manifest.icons
    .filter((icon) => icon.family === 'social')
    .flatMap((icon) => {
      const component = iconNamespace[icon.componentName];
      if (typeof component !== 'function') {
        throw new Error(`Published social icon component "${icon.componentName}" is unavailable.`);
      }

      const constructions = Object.entries(icon.constructions);
      const constructionEntries = constructions.map(([construction, definition]) => ({
        appearances: Object.entries(definition.presentations).map(
          ([presentation, presentationDefinition]) => ({
            colorBehavior: presentationDefinition.colorBehavior,
            construction,
            presentation
          })
        ),
        cardKey: `${icon.componentName}.${construction}`,
        component: component as SocialIconComponent,
        constructions: [construction],
        name: icon.componentName
      }));

      if (icon.componentName !== 'SnapchatIcon') return constructionEntries;

      const appearances = constructionEntries
        .flatMap(({ appearances }) => appearances)
        .flatMap((appearance) => {
          const appearanceKey = `${appearance.construction}.${appearance.presentation}`;
          const label = SNAPCHAT_SHOWCASE_APPEARANCES.get(appearanceKey);

          return label ? [{ ...appearance, label }] : [];
        });

      return [
        {
          appearances,
          cardKey: icon.componentName,
          component: component as SocialIconComponent,
          constructions: [...new Set(appearances.map(({ construction }) => construction))],
          name: icon.componentName
        }
      ];
    });
}

const SOCIAL_ICON_ENTRIES = getSocialIconEntries(
  SocialIcons,
  iconManifest as unknown as PublishedIconManifest
);

function IconGallery({
  entries,
  intent,
  rawIconSize,
  isStyled,
  scale,
  surfaceContext
}: {
  entries: readonly CanonicalIconName[];
  intent: IconIntent;
  rawIconSize: number;
  isStyled: boolean;
  scale: IconScale;
  surfaceContext: SurfaceContext;
}) {
  return (
    <div className={s.galleryGrid}>
      {entries.map((name) => (
        <ShowcaseExampleCard role="article" key={name} className={s.galleryItem}>
          <div className={s.iconPreview}>
            {isStyled ? (
              <KIcon intent={intent} label={name} scale={scale} surfaceContext={surfaceContext}>
                <FamilyResolvedIcon name={name} />
              </KIcon>
            ) : (
              <span
                className={s.rawIcon}
                role="img"
                aria-label={name}
                style={{
                  blockSize: rawIconSize,
                  inlineSize: rawIconSize
                }}
              >
                <FamilyResolvedIcon name={name} />
              </span>
            )}
          </div>
          <code className={s.iconName}>{name}</code>
        </ShowcaseExampleCard>
      ))}
    </div>
  );
}

function SocialIconGallery({
  brandBackgroundColor,
  brandForegroundColor,
  entries,
  intent,
  monochromeBackgroundColor,
  scale,
  surfaceContext
}: {
  brandBackgroundColor?: string;
  brandForegroundColor?: string;
  entries: SocialIconEntry[];
  intent: IconIntent;
  monochromeBackgroundColor?: string;
  scale: IconScale;
  surfaceContext: SurfaceContext;
}) {
  return (
    <div className={s.galleryGrid}>
      {entries.map(({ appearances, cardKey, component: Glyph, constructions, name }) => (
        <ShowcaseExampleCard
          role="article"
          key={cardKey}
          className={`${s.galleryItem} ${s.socialGalleryItem}`}
          data-social-constructions={constructions.join(' ')}
          data-social-icon={name}
        >
          <div className={s.socialIconPair}>
            {appearances.map(({ colorBehavior, construction, label, presentation }) => {
              const usesContextualColor =
                colorBehavior === 'adaptive' || colorBehavior === 'currentColor';
              const appearanceLabel =
                label ??
                (constructions.length > 1 ? `${construction}.${presentation}` : presentation);

              return (
                <div
                  className={s.socialIconPreview}
                  key={`${construction}.${presentation}`}
                  style={{
                    backgroundColor: usesContextualColor
                      ? monochromeBackgroundColor
                      : brandBackgroundColor
                  }}
                >
                  <KIcon
                    intent={usesContextualColor ? intent : 'neutral'}
                    label={`${name}, ${construction}.${presentation}`}
                    scale={scale}
                    style={usesContextualColor ? undefined : { color: brandForegroundColor }}
                    surfaceContext={usesContextualColor ? surfaceContext : 'onSubtle'}
                  >
                    <Glyph construction={construction} presentation={presentation} />
                  </KIcon>
                  <span className={s.socialAppearanceName}>{appearanceLabel}</span>
                </div>
              );
            })}
          </div>
          <code className={`${s.iconName} ${s.socialIconName}`}>{name}</code>
        </ShowcaseExampleCard>
      ))}
    </div>
  );
}

export default function IconShowcase() {
  const { designSystem, global, segment, theme } = useKiskadee();
  const { iconFamilyId, iconVariantId, manifest } = useShowcase();
  const { fallbackFor } = useIconFamilyStatus();
  const background = useShowcaseBackground();
  const surfaceContext = background.surfaceContext;
  const selectedSurface = background.color ? { resolvedColor: background.color } : undefined;
  const lightCanonicalBackgrounds = useCanonicalCardSurfaces('light');
  const stressTestBackgrounds = useButtonStressTestBackgroundTones();

  const [scale, setScale] = useState<IconScale>('s:lg:3');
  const [intent, setIntent] = useState<IconIntent>('neutral');
  const selectedFamily = interfaceIconFamilyOptions.find((entry) => entry.id === iconFamilyId);
  const selectedFamilyLabel = selectedFamily?.label ?? iconFamilyId;
  const selectedVariantLabel =
    selectedFamily?.variants.find((variant) => variant.id === iconVariantId)?.label ??
    iconVariantId;
  const renderedFamilyName =
    fallbackFor === 'sf-symbols'
      ? `${selectedFamilyLabel} (fallback for SF Symbols)`
      : selectedFamilyLabel;
  const renderedFamilyLabel =
    selectedFamily && selectedFamily.variants.length > 1
      ? `${renderedFamilyName}, ${selectedVariantLabel}`
      : renderedFamilyName;

  const iconMeta = manifest?.components?.icon;
  const iconSizes = global?.iconSizes as SchemaIconSizes | undefined;
  const isIconAvailable = Boolean(iconMeta);
  const iconState = getManifestComponentState(iconMeta, segment, theme, surfaceContext);

  const availableScaleOptions = useMemo(() => {
    const scaleKeys = Object.keys(iconSizes ?? iconMeta?.scale ?? {}) as IconScale[];
    return scaleKeys
      .filter((value) => !iconMeta?.scale || Boolean(iconMeta.scale[value]))
      .map((value) => ({ value, label: formatScaleLabel(value) }));
  }, [iconMeta?.scale, iconSizes]);
  const activeScale =
    availableScaleOptions.find((option) => option.value === scale)?.value ??
    availableScaleOptions.find((option) => option.value === 's:lg:3')?.value ??
    availableScaleOptions[0]?.value ??
    's:lg:3';
  const activeRawIconSize = iconSizes?.[activeScale] ?? iconSizes?.['s:md:1'] ?? 20;

  const availableIntentOptions = useMemo(
    () =>
      ICON_INTENT_OPTIONS.filter((option) => !iconState || Object.hasOwn(iconState, option.value)),
    [iconState]
  );
  const activeIntent =
    availableIntentOptions.find((option) => option.value === intent)?.value ??
    availableIntentOptions[0]?.value ??
    'neutral';

  const firstLightCanonicalSubtle = lightCanonicalBackgrounds.tones.find(
    (tone) => tone.contentSurfaceContext === 'onSubtle'
  );
  const secondLightCanonicalSubtle = lightCanonicalBackgrounds.tones
    .slice(1)
    .find((tone) => tone.contentSurfaceContext === 'onSubtle');
  const brandBackgroundColor =
    (surfaceContext === 'onVivid'
      ? firstLightCanonicalSubtle?.resolvedColor
      : (secondLightCanonicalSubtle?.resolvedColor ?? firstLightCanonicalSubtle?.resolvedColor)) ??
    stressTestBackgrounds.tones.find((tone) => tone.key === 'white')?.resolvedColor;
  const brandForegroundColor =
    stressTestBackgrounds.tones.find((tone) => tone.key === 'black')?.resolvedColor ??
    stressTestBackgrounds.tones.find((tone) => tone.key === 'vivid-black')?.resolvedColor;

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Environment">
        <ShowcaseGlobalSemanticControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Icon">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Scale"
            options={availableScaleOptions}
            value={activeScale}
            onValueChange={(value) => setScale(value as IconScale)}
          />
          <ShowcaseSelectControl
            label="Intent"
            options={availableIntentOptions}
            value={activeIntent}
            onValueChange={(value) => setIntent(value as IconIntent)}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconografia">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  const routeClassName = [
    s.page,
    selectedSurface && isDarkSurfaceColor(selectedSurface.resolvedColor)
      ? s.darkSurface
      : undefined,
    'k-root'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={routeClassName}>
      <header className={s.header}>
        <h1 className={s.title}>Icon</h1>
        <p className={s.summary}>
          Preset-aware icon sizing and color applied to {renderedFamilyLabel} and the independent
          Kiskadee brand icon family.
        </p>
      </header>

      <ShowcaseRouteControls id="icon" eyebrow="Icon" title="Controls" showGlobalControls={false}>
        {controls}
      </ShowcaseRouteControls>

      <div className={s.sections}>
        {isIconAvailable ? (
          <section className={s.section} aria-labelledby="icon-capability-matrix-title">
            <div className={s.sectionHeader}>
              <div>
                <h2 id="icon-capability-matrix-title" className={s.sectionTitle}>
                  Size and intent
                </h2>
                <p className={s.sectionDescription}>
                  Every size and semantic intent published by the active Icon artifact.
                </p>
              </div>
            </div>
            <div
              className={s.matrix}
              style={
                {
                  '--icon-scale-count': availableScaleOptions.length
                } as CSSProperties
              }
            >
              <div className={s.matrixCorner} aria-hidden="true" />
              {availableScaleOptions.map((scaleOption) => (
                <div key={scaleOption.value} className={s.matrixColumnLabel}>
                  {scaleOption.label}
                </div>
              ))}
              {availableIntentOptions.map((intentOption) => (
                <div className={s.matrixRow} key={intentOption.value}>
                  <div className={s.matrixRowLabel}>{intentOption.label}</div>
                  {availableScaleOptions.map((scaleOption) => (
                    <div className={s.matrixCell} key={scaleOption.value}>
                      <KIcon
                        intent={intentOption.value}
                        label={`${intentOption.label}, ${scaleOption.label}`}
                        scale={scaleOption.value}
                        surfaceContext={surfaceContext}
                      >
                        <FamilyResolvedIcon name="heart" />
                      </KIcon>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className={s.section} aria-labelledby="icon-capability-matrix-title">
            <div className={s.sectionHeader}>
              <div>
                <h2 id="icon-capability-matrix-title" className={s.sectionTitle}>
                  Size and intent
                </h2>
                <p className={s.sectionDescription}>
                  This design system does not publish a styled Icon artifact.
                </p>
              </div>
            </div>
            <div className={s.emptyState}>
              Icon styling is not available for the selected design system: {designSystem}.
            </div>
          </section>
        )}

        <section className={s.section} aria-labelledby="interface-icons-title">
          <div className={s.sectionHeader}>
            <div>
              <h2 id="interface-icons-title" className={s.sectionTitle}>
                Interface icons
              </h2>
              <p className={s.sectionDescription}>
                {CANONICAL_ICON_NAMES.length} canonical concepts rendered by {renderedFamilyLabel}
                {isIconAvailable
                  ? ' with the selected scale and intent.'
                  : ' with presentation-only geometry.'}
              </p>
            </div>
          </div>
          <IconGallery
            entries={CANONICAL_ICON_NAMES}
            intent={activeIntent}
            isStyled={isIconAvailable}
            rawIconSize={activeRawIconSize}
            scale={activeScale}
            surfaceContext={surfaceContext}
          />
        </section>

        {isIconAvailable ? (
          <section className={s.section} aria-labelledby="social-icons-title">
            <div className={s.sectionHeader}>
              <div>
                <h2 id="social-icons-title" className={s.sectionTitle}>
                  Social
                </h2>
                <p className={s.sectionDescription}>
                  Every construction and presentation is discovered from the published icon
                  manifest. Brand artwork uses a fixed subtle surface; currentColor artwork follows
                  the selected background and surface context.
                </p>
              </div>
            </div>
            <SocialIconGallery
              brandBackgroundColor={brandBackgroundColor}
              brandForegroundColor={brandForegroundColor}
              entries={SOCIAL_ICON_ENTRIES}
              intent={activeIntent}
              monochromeBackgroundColor={selectedSurface?.resolvedColor}
              scale={activeScale}
              surfaceContext={surfaceContext}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
