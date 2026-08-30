'use client';

import type { ComponentEmphasis, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import {
  Card,
  Button as KButton,
  SmoothText,
  Text,
  useButtonArtifactConfig,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import React from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseIconographyControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlField,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { ShowcaseFamilyResolvedIcon } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import {
  type ButtonStressTestBackgroundToneKey,
  useButtonStressTestBackgroundTones
} from '@/hooks/use-background-tones';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { useDropdownPresenceControl } from '@/hooks/use-dropdown-presence-control';
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
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Button.module.scss';
import { ButtonAsyncExample } from './components/ButtonAsyncExample';
import { ButtonBadgeExamples } from './components/ButtonBadgeExamples';
import { ButtonGroupExamples } from './components/ButtonGroupExamples';
import { ButtonIconExamples } from './components/ButtonIconExamples';
import { ButtonMenuExamples } from './components/ButtonMenuExamples';
import ButtonStateSection from './components/ButtonStateSection';
import { shouldCheckButtonStateAvailability } from './components/buttonStateAvailability';

const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];
const BACKGROUND_MODE_OPTIONS = [
  { value: 'canonical', label: 'Canonical' },
  { value: 'stress-test', label: 'Stress test' }
] as const;
type BackgroundMode = (typeof BACKGROUND_MODE_OPTIONS)[number]['value'];
const BUTTON_SCALE_OPTIONS: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' },
  { value: 's:lg:2', label: 'Large 2' },
  { value: 's:lg:3', label: 'Large 3' }
];
const COMPARISON_EMPHASES: ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest'];

function SurfaceContextComparison({
  fontName,
  onVividSupported,
  scale,
  surfaceContext,
  textAlign
}: {
  fontName: string;
  onVividSupported: boolean;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
  textAlign: 'left' | 'center';
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();

  return (
    <section
      className={`${s.contextComparison} ${
        showDescriptions ? '' : s.contextComparisonWithoutDescription
      }`.trim()}
      aria-labelledby="surface-context-comparison-title"
    >
      <div className={s.contextComparisonHeader}>
        <Text as="h3" id="surface-context-comparison-title" profile={textProfiles.sectionTitle}>
          Surface contexts
        </Text>
        {showDescriptions ? (
          <Text as="p" profile={textProfiles.body} className={s.contextComparisonDescription}>
            The same Primary Rest buttons rendered simultaneously on subtle and vivid surfaces.
          </Text>
        ) : null}
      </div>
      <div className={s.contextComparisonGrid}>
        <article className={s.contextCard}>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            On subtle
          </Text>
          <Card
            className={`${s.contextSurface} k-root`}
            intent="neutral"
            emphasis="low"
            surfaceContext={surfaceContext}
          >
            <div className={s.contextSurfaceGrid}>
              {COMPARISON_EMPHASES.map((emphasis) => (
                <KButton key={emphasis} intent="primary" emphasis={emphasis} scale={scale}>
                  <KButton.Label>
                    <SmoothText fontName={fontName} align={textAlign}>
                      {emphasis}
                    </SmoothText>
                  </KButton.Label>
                </KButton>
              ))}
            </div>
          </Card>
        </article>
        <article className={s.contextCard}>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            On vivid
          </Text>
          <Card
            className={`${s.contextSurface} k-root`}
            intent="primary"
            emphasis="highest"
            surfaceContext={surfaceContext}
          >
            <div className={s.contextSurfaceGrid}>
              {onVividSupported ? (
                COMPARISON_EMPHASES.map((emphasis) => (
                  <KButton key={emphasis} intent="primary" emphasis={emphasis} scale={scale}>
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={textAlign}>
                        {emphasis}
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                ))
              ) : (
                <Text as="p" profile={textProfiles.caption} className={s.contextUnavailable}>
                  On vivid is not available in this palette.
                </Text>
              )}
            </div>
          </Card>
        </article>
      </div>
    </section>
  );
}

export function Button() {
  const { designSystem, global, segment, theme } = useKiskadee();
  const { fontName, manifest } = useShowcase();
  const { setShowDescriptions, showDescriptions } = useShowcaseDisplayPreferences();
  const { buttonClassesMap } = useButtonArtifactConfig();
  const canonicalBackgrounds = useCanonicalCardSurfaces();
  const textProfiles = useShowcaseTextProfiles();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(true);
  const [showButtonGroups, setShowButtonGroups] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(true);
  const [buttonScale, setButtonScale] = React.useState<ElementSizeValue>('s:md:1');
  const [surfaceContext, setSurfaceContext] = React.useState<SurfaceContext>('onSubtle');
  const [backgroundMode, setBackgroundMode] = React.useState<BackgroundMode>('canonical');
  const [canonicalSurface, setCanonicalSurface] = React.useState<CanonicalCardSurfaceKey | null>(
    null
  );
  const [stressTestSurface, setStressTestSurface] =
    React.useState<ButtonStressTestBackgroundToneKey>('white');
  const stressTestBackgrounds = useButtonStressTestBackgroundTones();
  const availableStressTestTones = React.useMemo(
    () => getAvailableButtonStressTestBackgrounds(stressTestBackgrounds.tones, theme),
    [stressTestBackgrounds.tones, theme]
  );
  const stressTestBackgroundItems = React.useMemo(
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

  const activeCanonicalSurfaceKey = React.useMemo(
    () =>
      canonicalSurface && canonicalBackgrounds.tones.some((tone) => tone.key === canonicalSurface)
        ? canonicalSurface
        : canonicalBackgrounds.defaultToneKey,
    [canonicalBackgrounds.defaultToneKey, canonicalBackgrounds.tones, canonicalSurface]
  );
  const activeStressTestSurfaceKey = React.useMemo(
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
  const selectedSurface = React.useMemo(
    () =>
      backgroundMode === 'canonical'
        ? canonicalBackgrounds.tones.find((tone) => tone.key === activeCanonicalSurfaceKey)
        : availableStressTestTones.find((tone) => tone.key === activeStressTestSurfaceKey),
    [
      activeCanonicalSurfaceKey,
      activeStressTestSurfaceKey,
      backgroundMode,
      canonicalBackgrounds.tones,
      availableStressTestTones
    ]
  );

  const selectBackgroundForSurfaceContext = React.useCallback(
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

  React.useEffect(() => {
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

  const activeSurfaceContext = surfaceContext;
  const isDarkSurface = selectedSurface ? isDarkSurfaceColor(selectedSurface.resolvedColor) : false;

  const isCarbon = designSystem === 'carbon-1-ibm';
  const alignment = isCarbon ? 'left' : 'center';
  const routeClassName = [
    isDarkSurface ? s.darkSurface : undefined,
    showFocusRing ? undefined : s.focusRingHidden
  ]
    .filter(Boolean)
    .join(' ');

  const buttonMeta = manifest?.components?.button;
  const cardMeta = manifest?.components?.card;
  const dropdownAvailable = Boolean(manifest?.components?.dropdown);
  const adaptiveButtonMenuAvailable = Boolean(
    manifest?.components?.dropdown && manifest?.components?.bottomSheet
  );
  const { presenceOptions, presenceOverride, presenceSelection, setPresenceSelection } =
    useDropdownPresenceControl({
      designSystem,
      presenceArtifact: global?.components?.dropdown?.effects?.presence
    });
  const onVividSupported = supportsManifestSurfaceContext(buttonMeta, segment, theme, 'onVivid');
  const activeCardSurfaceContext = supportsManifestSurfaceContext(
    cardMeta,
    segment,
    theme,
    activeSurfaceContext
  )
    ? activeSurfaceContext
    : 'onSubtle';
  const availableButtonScaleOptions = BUTTON_SCALE_OPTIONS.filter(
    (option) => !buttonMeta?.scale || Boolean(buttonMeta.scale[option.value])
  );
  const activeButtonScale =
    availableButtonScaleOptions.find((option) => option.value === buttonScale)?.value ??
    availableButtonScaleOptions.find((option) => option.value === 's:md:1')?.value ??
    availableButtonScaleOptions[0]?.value ??
    's:md:1';
  const buttonState = getManifestComponentState(buttonMeta, segment, theme, activeSurfaceContext);

  const buttonControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Ambiente">
        <ShowcaseGlobalSemanticControls />
        <ShowcaseSegmentedControl
          label="Surface context"
          options={SURFACE_CONTEXT_OPTIONS}
          value={activeSurfaceContext}
          onValueChange={(value) => {
            const nextSurfaceContext = value as SurfaceContext;
            setSurfaceContext(nextSurfaceContext);
            setBackgroundMode('canonical');
            selectBackgroundForSurfaceContext(nextSurfaceContext, 'canonical');
          }}
          disabled={!onVividSupported}
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
                    setSurfaceContext(nextCanonicalSurface.contentSurfaceContext);
                  }
                  return;
                }

                const nextStressTestSurfaceKey = value as ButtonStressTestBackgroundToneKey;
                const nextStressTestSurface = stressTestBackgrounds.tones.find(
                  (tone) => tone.key === nextStressTestSurfaceKey
                );

                setStressTestSurface(nextStressTestSurfaceKey);
                if (nextStressTestSurface) {
                  setSurfaceContext(resolveBackgroundSurfaceContext(nextStressTestSurface.row));
                }
              }}
              items={backgroundItems}
              aria-label="Button example background"
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
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconografia">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
      {dropdownAvailable ? (
        <ShowcaseControlGroup title="Motion">
          <ShowcaseControlStack>
            <ShowcaseSelectControl
              label="Presence"
              options={presenceOptions}
              value={presenceSelection}
              onValueChange={setPresenceSelection}
            />
          </ShowcaseControlStack>
        </ShowcaseControlGroup>
      ) : null}
      <ShowcaseControlGroup title="Visualização">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Button size"
            options={availableButtonScaleOptions}
            value={activeButtonScale}
            onValueChange={(value) => setButtonScale(value as ElementSizeValue)}
          />
          <ShowcaseBooleanControl
            label="Button group"
            checked={showButtonGroups}
            onCheckedChange={setShowButtonGroups}
          />
          <ShowcaseBooleanControl
            label="Descrições"
            checked={showDescriptions}
            onCheckedChange={setShowDescriptions}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  // Only optional interaction capabilities use the manifest to show an unavailable indicator.
  // Rest, Focus, and Disabled always render: an omitted visual state can inherit Rest, and these
  // states remain part of the expected Button contract.
  const renderState = (
    semantic: string,
    emphasis: string,
    state: string,
    children: React.ReactNode
  ) => {
    if (!shouldCheckButtonStateAvailability(state)) {
      return children;
    }

    const isSupported = (() => {
      if (!buttonState) return true;
      const group = buttonState[semantic]?.[emphasis];
      if (!group) return false;
      return Boolean(group[state]);
    })();

    if (isSupported) {
      return children;
    }

    return (
      <div className={s.missingState}>
        <ShowcaseFamilyResolvedIcon name="ban" style={{ width: 24, height: 24 }} />
      </div>
    );
  };

  const renderScale = (scale: string, children: React.ReactNode) => {
    const isSupported = (() => {
      if (!buttonMeta?.scale) return true;
      return Boolean(buttonMeta.scale[scale]);
    })();

    if (isSupported) {
      return children;
    }

    return (
      <div className={s.missingState}>
        <ShowcaseFamilyResolvedIcon name="ban" style={{ width: 24, height: 24 }} />
      </div>
    );
  };

  return (
    <section className={routeClassName || undefined}>
      <header className={s.pageHeader}>
        <Text as="h2" profile={textProfiles.pageTitle}>
          Button
        </Text>
        {showDescriptions ? (
          <Text as="p" profile={textProfiles.body} className={s.pageDescription}>
            Buttons let people trigger an immediate action or make a choice. Intent communicates the
            action&apos;s meaning, while emphasis establishes its priority on the current surface.
          </Text>
        ) : null}
      </header>
      <ShowcaseRouteControls
        id="button"
        eyebrow="Button"
        title="Controls"
        showGlobalControls={false}
      >
        {buttonControls}
      </ShowcaseRouteControls>
      <SurfaceContextComparison
        onVividSupported={onVividSupported}
        fontName={fontName}
        scale={activeButtonScale}
        surfaceContext={activeCardSurfaceContext}
        textAlign={alignment}
      />
      <section className={s.intentsSection} aria-labelledby="button-intents-title">
        <div className={s.intentsHeader}>
          <div className={s.intentsHeadingRow}>
            <Text as="h3" id="button-intents-title" profile={textProfiles.sectionTitle}>
              Intents
            </Text>
            <div className={s.intentsInlineControls}>
              <ShowcaseBooleanControl
                className={s.intentsInlineControl}
                label="Rest only"
                checked={isSimplified}
                onCheckedChange={setIsSimplified}
              />
              <ShowcaseBooleanControl
                className={s.intentsInlineControl}
                label="Focus ring"
                checked={showFocusRing}
                onCheckedChange={setShowFocusRing}
              />
            </div>
          </div>
          {showDescriptions ? (
            <Text as="p" profile={textProfiles.body} className={s.intentsDescription}>
              Intent gives an action its semantic role. Primary advances the main task, Neutral
              supports secondary actions, Destructive signals risk, and Positive communicates a
              beneficial outcome.
            </Text>
          ) : null}
        </div>
        <div
          className={`${s.intentsGrid} ${
            isSimplified ? s.intentsGridSimplified : s.intentsGridDetailed
          }`}
        >
          <ButtonStateSection
            intent="primary"
            title="Primary"
            description={
              showDescriptions ? 'The main action that advances the current task.' : undefined
            }
            fontName={fontName}
            align={alignment}
            stateCapabilities={buttonState}
            simplified={isSimplified}
            grouped={showButtonGroups}
            scale={activeButtonScale}
            surfaceContext={activeCardSurfaceContext}
          />

          <ButtonStateSection
            intent="neutral"
            title="Neutral"
            description={
              showDescriptions ? 'Supporting actions that do not dominate the flow.' : undefined
            }
            fontName={fontName}
            align={alignment}
            stateCapabilities={buttonState}
            simplified={isSimplified}
            grouped={showButtonGroups}
            scale={activeButtonScale}
            surfaceContext={activeCardSurfaceContext}
          />

          <ButtonStateSection
            intent="destructive"
            title="Destructive"
            description={
              showDescriptions ? 'Actions with harmful or irreversible consequences.' : undefined
            }
            fontName={fontName}
            align={alignment}
            stateCapabilities={buttonState}
            simplified={isSimplified}
            grouped={showButtonGroups}
            scale={activeButtonScale}
            surfaceContext={activeCardSurfaceContext}
          />

          <ButtonStateSection
            intent="positive"
            title="Positive"
            description={
              showDescriptions ? 'Actions that confirm a safe or beneficial outcome.' : undefined
            }
            fontName={fontName}
            align={alignment}
            stateCapabilities={buttonState}
            simplified={isSimplified}
            grouped={showButtonGroups}
            scale={activeButtonScale}
            surfaceContext={activeCardSurfaceContext}
          />
        </div>
      </section>
      <div className={s.buttonExamples}>
        {/* [ACTIVATION FEEDBACK] START: Showcase examples for profile/origin overrides. */}
        <div className={s['interaction-state']}>
          <Text as="h3" profile={textProfiles.sectionTitle}>
            Activation Feedback Profiles
          </Text>
          <div className={`${s['example-states']} k-root`}>
            <KButton
              intent="primary"
              emphasis="high"
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'ripple' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'ripple', origin: 'center' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple Center
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'ripple-overflow' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Ripple Overflow
                </SmoothText>
              </KButton.Label>
            </KButton>
            <KButton
              intent="primary"
              emphasis="high"
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
              activationFeedback={{ profile: 'halo' }}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={alignment}>
                  AF Halo
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
        </div>
        {/* [ACTIVATION FEEDBACK] END: Showcase examples for profile/origin overrides. */}

        <div className={s['interaction-state']}>
          <Text as="h3" profile={textProfiles.sectionTitle}>
            Selected (Primary / Medium)
          </Text>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'medium',
              isSelected ? 'selected' : 'rest',
              <KButton
                emphasis="medium"
                intent="primary"
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
                radius="rounded"
                radiusEffect={true}
                controlState={isSelected}
                onClick={() => setIsSelected((prev) => !prev)}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    {isSelected ? 'Followed' : 'Follow'}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        <div className={s['interaction-state']}>
          <Text as="h3" profile={textProfiles.sectionTitle}>
            Selected (Primary / High)
          </Text>
          <div className={`${s['example-states']} k-root`}>
            {renderState(
              'primary',
              'high',
              isSelectedVivid ? 'selected' : 'rest',
              <KButton
                emphasis="high"
                intent="primary"
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
                radius="rounded"
                radiusEffect={true}
                controlState={isSelectedVivid}
                onClick={() => setIsSelectedVivid((prev) => !prev)}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    {isSelectedVivid ? 'Followed' : 'Follow'}
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>

        <div>
          <Text as="h3" profile={textProfiles.sectionTitle}>
            Shadow
          </Text>
          <KButton scale={activeButtonScale} shadow={true} surfaceContext={activeSurfaceContext}>
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Rest
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'hover'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Hover
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'focus'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Focus
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'pressed'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Pressed
              </SmoothText>
            </KButton.Label>
          </KButton>
          <KButton
            scale={activeButtonScale}
            shadow={true}
            surfaceContext={activeSurfaceContext}
            status={'disabled'}
          >
            <KButton.Label>
              <SmoothText fontName={fontName} align={alignment}>
                Disabled
              </SmoothText>
            </KButton.Label>
          </KButton>
        </div>

        <div className={s['interaction-state']}>
          <Text as="h3" profile={textProfiles.sectionTitle}>
            Size / Scale
          </Text>
          <div className={`${s['example-states']} k-root`}>
            {renderScale(
              's:sm:2',
              <KButton
                scale="s:sm:2"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Small 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:sm:1',
              <KButton
                scale="s:sm:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Small
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:md:1',
              <KButton
                scale="s:md:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Medium
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:1',
              <KButton
                scale="s:lg:1"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:2',
              <KButton
                scale="s:lg:2"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large 2
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
            {renderScale(
              's:lg:3',
              <KButton
                scale="s:lg:3"
                intent="primary"
                emphasis="high"
                surfaceContext={activeSurfaceContext}
              >
                <KButton.Label>
                  <SmoothText fontName={fontName} align={alignment}>
                    Large 3
                  </SmoothText>
                </KButton.Label>
              </KButton>
            )}
          </div>
        </div>
        <ButtonIconExamples
          fontName={fontName}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />
        {manifest?.components?.badge ? (
          <ButtonBadgeExamples scale={activeButtonScale} surfaceContext={activeSurfaceContext} />
        ) : null}
        <ButtonGroupExamples
          scale={activeButtonScale}
          shadowAvailable={Boolean(buttonClassesMap?.e1?.e?.h)}
          surfaceContext={activeSurfaceContext}
        />
        <ButtonMenuExamples
          available={Boolean(adaptiveButtonMenuAvailable && buttonMeta)}
          presence={presenceOverride}
          scale={activeButtonScale}
          surfaceContext={activeSurfaceContext}
        />
      </div>
      <ButtonAsyncExample
        buttonState={buttonState}
        fontName={fontName}
        progressAvailable={Boolean(manifest?.components?.progress)}
        progressSurfaceContext={
          supportsManifestSurfaceContext(
            manifest?.components?.progress,
            segment,
            theme,
            activeSurfaceContext
          )
            ? activeSurfaceContext
            : 'onSubtle'
        }
        scale={activeButtonScale}
        surfaceContext={activeSurfaceContext}
      />
    </section>
  );
}

export default Button;
