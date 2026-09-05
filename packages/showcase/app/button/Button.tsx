'use client';

import type { ComponentEmphasis, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import {
  Card,
  Button as KButton,
  SmoothText,
  SurfaceContextProvider,
  Switch,
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
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { ShowcaseFamilyResolvedIcon } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import { useDropdownPresenceControl } from '@/hooks/use-dropdown-presence-control';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { isDarkSurfaceColor } from '@/utils/canonical-card-surfaces';
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
          <Text as="p" profile={textProfiles.body}>
            The same Primary Rest buttons rendered simultaneously on subtle and vivid surfaces.
          </Text>
        ) : null}
      </div>
      <div className={s.contextComparisonGrid}>
        <article className={s.contextCard}>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            On subtle
          </Text>
          <ShowcaseExampleCard className={`${s.contextSurface} k-root`} context="onSubtle">
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
          </ShowcaseExampleCard>
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
                <Text
                  as="p"
                  emphasis="lowest"
                  profile={textProfiles.caption}
                  className={s.contextUnavailable}
                >
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
  const textProfiles = useShowcaseTextProfiles();

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(true);
  const [showButtonGroups, setShowButtonGroups] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(true);
  const [buttonScale, setButtonScale] = React.useState<ElementSizeValue>('s:md:1');
  const background = useShowcaseBackground();
  const activeSurfaceContext = background.surfaceContext;
  const isDarkSurface = background.color ? isDarkSurfaceColor(background.color) : false;

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
  const switchMeta = manifest?.components?.switch;
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
  const [inlineControlsCardIntent, inlineControlsCardEmphasis] = (
    background.cardSurface?.key ?? ''
  ).split('.');
  const inlineControlsSwitchEmphasis = 'medium';
  const inlineControlsSurfaceContext =
    background.cardSurface?.contentSurfaceContext ?? activeSurfaceContext;
  const inlineControlsCardState = getManifestComponentState(
    cardMeta,
    segment,
    theme,
    activeCardSurfaceContext
  );
  const inlineControlsCardAvailable = Boolean(
    inlineControlsCardState?.[inlineControlsCardIntent]?.[inlineControlsCardEmphasis]?.rest
  );
  const switchState = getManifestComponentState(
    switchMeta,
    segment,
    theme,
    inlineControlsSurfaceContext
  );
  const inlineControlsAvailable = Boolean(
    inlineControlsCardAvailable && switchState?.neutral?.[inlineControlsSwitchEmphasis]?.rest
  );
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
    <>
      <ShowcaseRouteControls
        id="button"
        eyebrow="Button"
        title="Controls"
        showGlobalControls={false}
      >
        {buttonControls}
      </ShowcaseRouteControls>
      <SurfaceContextProvider value={activeSurfaceContext}>
        <section className={routeClassName || undefined}>
          <header className={s.pageHeader}>
            <Text as="h2" profile={textProfiles.pageTitle}>
              Button
            </Text>
            {showDescriptions ? (
              <Text as="p" profile={textProfiles.body} className={s.pageDescription}>
                Buttons let people trigger an immediate action or make a choice. Intent communicates
                the action&apos;s meaning, while emphasis establishes its priority on the current
                surface.
              </Text>
            ) : null}
          </header>
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
                {inlineControlsAvailable ? (
                  <ShowcaseExampleCard
                    aria-label="Intent presentation controls"
                    className={s.intentsInlineControlsSurface}
                    role="group"
                  >
                    <div className={s.intentsInlineControls}>
                      <Switch
                        id="button-rest-only"
                        label="Rest only"
                        emphasis={inlineControlsSwitchEmphasis}
                        controlState={isSimplified}
                        onControlStateChange={setIsSimplified}
                      />
                      <Switch
                        id="button-focus-ring"
                        label="Focus ring"
                        emphasis={inlineControlsSwitchEmphasis}
                        controlState={showFocusRing}
                        onControlStateChange={setShowFocusRing}
                      />
                    </div>
                  </ShowcaseExampleCard>
                ) : (
                  <Text as="p" emphasis="low" profile={textProfiles.caption} role="status">
                    Switch controls are not available on this surface.
                  </Text>
                )}
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
                  showDescriptions
                    ? 'Actions with harmful or irreversible consequences.'
                    : undefined
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
                  showDescriptions
                    ? 'Actions that confirm a safe or beneficial outcome.'
                    : undefined
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
              <KButton
                scale={activeButtonScale}
                shadow={true}
                surfaceContext={activeSurfaceContext}
              >
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
              <ButtonBadgeExamples
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
              />
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
      </SurfaceContextProvider>
    </>
  );
}

export default Button;
