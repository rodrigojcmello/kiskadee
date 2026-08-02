'use client';

import {
  ICON_SIZE_BY_SCALE,
  type IconIntent,
  type IconScale,
  type SurfaceContext
} from '@kiskadee/core';
import iconManifest from '@kiskadee/icons/icons.json';
import * as SocialIcons from '@kiskadee/icons/social';
import { Icon as KIcon, useKiskadee, useShowcase } from '@kiskadee/react-components';
import {
  BanIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  FrownIcon,
  GripVerticalIcon,
  HeartIcon,
  HouseIcon,
  type LucideIcon,
  MailIcon,
  MenuIcon,
  MinusIcon,
  MoonIcon,
  MoonStarIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
  SmileIcon,
  SunIcon,
  ThumbsUpIcon,
  Trash2Icon,
  UserIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  XIcon
} from 'lucide-react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseControlField,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import {
  type ButtonStressTestBackgroundToneKey,
  useButtonStressTestBackgroundTones
} from '@/hooks/use-background-tones';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { SwatchRadioGroup } from '@/k-components';
import {
  getAvailableButtonStressTestBackgrounds,
  getPreferredButtonStressTestBackground,
  resolveBackgroundSurfaceContext
} from '@/utils/button-stress-test-backgrounds';
import { type CanonicalCardSurfaceKey, isDarkSurfaceColor } from '@/utils/canonical-card-surfaces';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
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

type InterfaceIconEntry = {
  component: LucideIcon;
  name: string;
};

type BackgroundMode = 'canonical' | 'stress-test';
const SNAPCHAT_SHOWCASE_APPEARANCES = new Map([
  ['contained.brand', 'brand'],
  ['mark.monochrome', 'monochrome']
]);

const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];

const BACKGROUND_MODE_OPTIONS: Array<{ value: BackgroundMode; label: string }> = [
  { value: 'canonical', label: 'Canonical' },
  { value: 'stress-test', label: 'Stress test' }
];

const ICON_INTENT_OPTIONS: Array<{ value: IconIntent; label: string }> = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'primary', label: 'Primary' }
];

function formatScaleLabel(scale: IconScale): string {
  const [, family, step] = scale.split(':');
  const familyLabel = family === 'sm' ? 'Small' : family === 'md' ? 'Medium' : 'Large';

  return step === '1' ? familyLabel : `${familyLabel} ${step}`;
}

const ICON_SCALE_OPTIONS = (Object.keys(ICON_SIZE_BY_SCALE) as IconScale[]).map((value) => ({
  value,
  label: formatScaleLabel(value)
}));

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

const INTERFACE_ICON_ENTRIES: InterfaceIconEntry[] = [
  { name: 'BanIcon', component: BanIcon },
  { name: 'BellIcon', component: BellIcon },
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'ChevronDownIcon', component: ChevronDownIcon },
  { name: 'ChevronLeftIcon', component: ChevronLeftIcon },
  { name: 'FrownIcon', component: FrownIcon },
  { name: 'GripVerticalIcon', component: GripVerticalIcon },
  { name: 'HeartIcon', component: HeartIcon },
  { name: 'HouseIcon', component: HouseIcon },
  { name: 'MailIcon', component: MailIcon },
  { name: 'MenuIcon', component: MenuIcon },
  { name: 'MinusIcon', component: MinusIcon },
  { name: 'MoonIcon', component: MoonIcon },
  { name: 'MoonStarIcon', component: MoonStarIcon },
  { name: 'PauseIcon', component: PauseIcon },
  { name: 'PencilIcon', component: PencilIcon },
  { name: 'PlayIcon', component: PlayIcon },
  { name: 'PlusIcon', component: PlusIcon },
  { name: 'SearchIcon', component: SearchIcon },
  { name: 'SettingsIcon', component: SettingsIcon },
  { name: 'Share2Icon', component: Share2Icon },
  { name: 'SmileIcon', component: SmileIcon },
  { name: 'SunIcon', component: SunIcon },
  { name: 'ThumbsUpIcon', component: ThumbsUpIcon },
  { name: 'Trash2Icon', component: Trash2Icon },
  { name: 'UserIcon', component: UserIcon },
  { name: 'Volume1Icon', component: Volume1Icon },
  { name: 'Volume2Icon', component: Volume2Icon },
  { name: 'VolumeXIcon', component: VolumeXIcon },
  { name: 'XIcon', component: XIcon }
];
const SOCIAL_ICON_ENTRIES = getSocialIconEntries(
  SocialIcons,
  iconManifest as unknown as PublishedIconManifest
);

function IconGallery({
  entries,
  intent,
  scale,
  surfaceContext
}: {
  entries: InterfaceIconEntry[];
  intent: IconIntent;
  scale: IconScale;
  surfaceContext: SurfaceContext;
}) {
  return (
    <div className={s.galleryGrid}>
      {entries.map(({ component: Glyph, name }) => (
        <article key={name} className={s.galleryItem}>
          <div className={s.iconPreview}>
            <KIcon intent={intent} label={name} scale={scale} surfaceContext={surfaceContext}>
              <Glyph aria-hidden="true" focusable="false" />
            </KIcon>
          </div>
          <code className={s.iconName}>{name}</code>
        </article>
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
        <article
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
        </article>
      ))}
    </div>
  );
}

export default function IconShowcase() {
  const { designSystem, segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const canonicalBackgrounds = useCanonicalCardSurfaces();
  const lightCanonicalBackgrounds = useCanonicalCardSurfaces('light');
  const stressTestBackgrounds = useButtonStressTestBackgroundTones();

  const [scale, setScale] = useState<IconScale>('s:lg:3');
  const [intent, setIntent] = useState<IconIntent>('neutral');
  const [surfaceContext, setSurfaceContext] = useState<SurfaceContext>('onSubtle');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('canonical');
  const [canonicalSurface, setCanonicalSurface] = useState<CanonicalCardSurfaceKey>('neutral.low');
  const [stressTestSurface, setStressTestSurface] =
    useState<ButtonStressTestBackgroundToneKey>('white');

  const iconMeta = manifest?.components?.icon;
  const isIconAvailable = Boolean(iconMeta);
  const onVividSupported = supportsManifestSurfaceContext(iconMeta, segment, theme, 'onVivid');
  const iconState = getManifestComponentState(iconMeta, segment, theme, surfaceContext);

  const availableScaleOptions = useMemo(
    () =>
      ICON_SCALE_OPTIONS.filter(
        (option) => !iconMeta?.scale || Boolean(iconMeta.scale[option.value])
      ),
    [iconMeta?.scale]
  );
  const activeScale =
    availableScaleOptions.find((option) => option.value === scale)?.value ??
    availableScaleOptions.find((option) => option.value === 's:lg:3')?.value ??
    availableScaleOptions[0]?.value ??
    's:lg:3';

  const availableIntentOptions = useMemo(
    () =>
      ICON_INTENT_OPTIONS.filter((option) => !iconState || Object.hasOwn(iconState, option.value)),
    [iconState]
  );
  const activeIntent =
    availableIntentOptions.find((option) => option.value === intent)?.value ??
    availableIntentOptions[0]?.value ??
    'neutral';

  const availableStressTestTones = useMemo(
    () => getAvailableButtonStressTestBackgrounds(stressTestBackgrounds.tones, theme),
    [stressTestBackgrounds.tones, theme]
  );
  const stressTestBackgroundItems = useMemo(
    () =>
      availableStressTestTones.map((tone) => ({
        value: tone.key,
        label: tone.aria,
        swatch: {
          color: tone.displayColor
        }
      })),
    [availableStressTestTones]
  );

  const activeCanonicalSurfaceKey = useMemo(
    () =>
      canonicalBackgrounds.tones.some((tone) => tone.key === canonicalSurface)
        ? canonicalSurface
        : canonicalBackgrounds.defaultToneKey,
    [canonicalBackgrounds.defaultToneKey, canonicalBackgrounds.tones, canonicalSurface]
  );
  const activeStressTestSurfaceKey = useMemo(
    () =>
      availableStressTestTones.some((tone) => tone.key === stressTestSurface)
        ? stressTestSurface
        : (availableStressTestTones[0]?.key ?? stressTestBackgrounds.defaultToneKey),
    [availableStressTestTones, stressTestBackgrounds.defaultToneKey, stressTestSurface]
  );
  const backgroundItems =
    backgroundMode === 'canonical' ? canonicalBackgrounds.items : stressTestBackgroundItems;
  const activeBackgroundKey =
    backgroundMode === 'canonical' ? activeCanonicalSurfaceKey : activeStressTestSurfaceKey;
  const selectedSurface = useMemo(
    () =>
      backgroundMode === 'canonical'
        ? canonicalBackgrounds.tones.find((tone) => tone.key === activeCanonicalSurfaceKey)
        : availableStressTestTones.find((tone) => tone.key === activeStressTestSurfaceKey),
    [
      activeCanonicalSurfaceKey,
      activeStressTestSurfaceKey,
      availableStressTestTones,
      backgroundMode,
      canonicalBackgrounds.tones
    ]
  );
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

  const selectBackgroundForSurfaceContext = useCallback(
    (nextSurfaceContext: SurfaceContext, nextBackgroundMode: BackgroundMode) => {
      if (nextBackgroundMode === 'canonical') {
        const nextCanonicalSurface = canonicalBackgrounds.tones.find(
          (tone) => tone.contentSurfaceContext === nextSurfaceContext
        );
        if (nextCanonicalSurface) setCanonicalSurface(nextCanonicalSurface.key);
        return;
      }

      const nextStressTestSurface = getPreferredButtonStressTestBackground(
        stressTestBackgrounds.tones,
        theme,
        nextSurfaceContext
      );
      if (nextStressTestSurface) setStressTestSurface(nextStressTestSurface.key);
    },
    [canonicalBackgrounds.tones, stressTestBackgrounds.tones, theme]
  );

  useEffect(() => {
    if (onVividSupported || surfaceContext !== 'onVivid') return;

    setSurfaceContext('onSubtle');
    setBackgroundMode('canonical');
    selectBackgroundForSurfaceContext('onSubtle', 'canonical');
  }, [onVividSupported, selectBackgroundForSurfaceContext, surfaceContext]);

  useEffect(() => {
    const root = document.documentElement;
    const previousRouteBackground = root.style.getPropertyValue('--showcase-route-background');

    if (selectedSurface?.resolvedColor) {
      root.style.setProperty('--showcase-route-background', selectedSurface.resolvedColor);
    } else {
      root.style.removeProperty('--showcase-route-background');
    }

    return () => {
      if (previousRouteBackground) {
        root.style.setProperty('--showcase-route-background', previousRouteBackground);
        return;
      }

      root.style.removeProperty('--showcase-route-background');
    };
  }, [selectedSurface?.resolvedColor]);

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Environment">
        <ShowcaseGlobalSemanticControls />
        <ShowcaseSegmentedControl
          label="Surface context"
          options={SURFACE_CONTEXT_OPTIONS.map((option) => ({
            ...option,
            disabled: option.value === 'onVivid' && !onVividSupported
          }))}
          value={surfaceContext}
          onValueChange={(value) => {
            const nextSurfaceContext = value as SurfaceContext;
            setSurfaceContext(nextSurfaceContext);
            setBackgroundMode('canonical');
            selectBackgroundForSurfaceContext(nextSurfaceContext, 'canonical');
          }}
        />
        <ShowcaseControlField className={s.backgroundControl} fullWidth>
          <ShowcaseSegmentedControl
            label="Background"
            options={BACKGROUND_MODE_OPTIONS}
            value={backgroundMode}
            onValueChange={(value) => {
              const nextBackgroundMode = value as BackgroundMode;
              setBackgroundMode(nextBackgroundMode);
              selectBackgroundForSurfaceContext(surfaceContext, nextBackgroundMode);
            }}
          />
          {backgroundItems.length > 0 ? (
            <SwatchRadioGroup
              className={`${s.backgroundToneGrid} ${
                backgroundMode === 'canonical'
                  ? s.canonicalBackgroundToneGrid
                  : `${s.stressTestBackgroundToneGrid} ${
                      theme === 'light' ? s.stressTestLightToneGrid : s.stressTestDarkToneGrid
                    }`
              }`}
              groupLabel={
                backgroundMode === 'canonical'
                  ? 'Canonical Card surfaces'
                  : 'Adversarial stress-test surfaces'
              }
              value={activeBackgroundKey}
              onValueChange={(value) => {
                if (backgroundMode === 'canonical') {
                  const nextCanonicalSurfaceKey = value as CanonicalCardSurfaceKey;
                  const nextCanonicalSurface = canonicalBackgrounds.tones.find(
                    (tone) => tone.key === nextCanonicalSurfaceKey
                  );

                  setCanonicalSurface(nextCanonicalSurfaceKey);
                  if (nextCanonicalSurface) {
                    setSurfaceContext(
                      nextCanonicalSurface.contentSurfaceContext === 'onVivid' && !onVividSupported
                        ? 'onSubtle'
                        : nextCanonicalSurface.contentSurfaceContext
                    );
                  }
                  return;
                }

                const nextStressTestSurfaceKey = value as ButtonStressTestBackgroundToneKey;
                const nextStressTestSurface = stressTestBackgrounds.tones.find(
                  (tone) => tone.key === nextStressTestSurfaceKey
                );

                setStressTestSurface(nextStressTestSurfaceKey);
                if (nextStressTestSurface) {
                  const nextSurfaceContext = resolveBackgroundSurfaceContext(
                    nextStressTestSurface.row
                  );
                  setSurfaceContext(
                    nextSurfaceContext === 'onVivid' && !onVividSupported
                      ? 'onSubtle'
                      : nextSurfaceContext
                  );
                }
              }}
              items={backgroundItems}
              aria-label="Icon example background"
            />
          ) : (
            <p className={s.backgroundEmptyState} role="status">
              This preset does not publish canonical Card surfaces for the active palette.
            </p>
          )}
          <p className={s.backgroundModeDescription}>
            {backgroundMode === 'canonical'
              ? 'Approved Card surfaces from the active preset, segment, and theme.'
              : 'Adversarial color combinations for diagnosis; not a preset support guarantee.'}
          </p>
        </ShowcaseControlField>
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
          Preset-aware icon sizing and color applied to direct Lucide examples and the Kiskadee
          brand icon family.
        </p>
      </header>

      <ShowcaseRouteControls
        id="icon"
        eyebrow="Icon"
        title="Controls"
        isAvailable={isIconAvailable}
        showGlobalControls={false}
      >
        {controls}
      </ShowcaseRouteControls>

      {!isIconAvailable ? (
        <div className={s.emptyState}>
          Icon is not available for the selected design system: {designSystem}.
        </div>
      ) : (
        <div className={s.sections}>
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
                        <HeartIcon />
                      </KIcon>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className={s.section} aria-labelledby="interface-icons-title">
            <div className={s.sectionHeader}>
              <div>
                <h2 id="interface-icons-title" className={s.sectionTitle}>
                  Interface icons
                </h2>
                <p className={s.sectionDescription}>
                  {INTERFACE_ICON_ENTRIES.length} common Lucide glyphs used locally to exercise the
                  selected scale and intent.
                </p>
              </div>
            </div>
            <IconGallery
              entries={INTERFACE_ICON_ENTRIES}
              intent={activeIntent}
              scale={activeScale}
              surfaceContext={surfaceContext}
            />
          </section>

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
        </div>
      )}
    </main>
  );
}
