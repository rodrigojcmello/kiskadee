'use client';

import type {
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import { componentScaleToSize } from '@kiskadee/core';
import { Button as KButton, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { Card } from '@kiskadee/react-components/card';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { Layout } from '@kiskadee/react-components/layout';
import {
  SurfaceContextProvider,
  useComponentMetadata,
  useKiskadee
} from '@kiskadee/react-components/resources';
import { Separator } from '@kiskadee/react-components/separator';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Switch } from '@kiskadee/react-components/switch';
import { Text } from '@kiskadee/react-components/text';
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
import { useDropdownPresenceControl } from '@/hooks/use-dropdown-presence-control';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import { useTypographyArtifact } from '@/hooks/use-typography-artifact';
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
import { ButtonIconFormatExamples } from './components/ButtonIconFormatExamples';
import { ButtonIndicatorExamples } from './components/ButtonIndicatorExamples';
import { ButtonMenuExamples } from './components/ButtonMenuExamples';
import { ButtonSizeScaleExample } from './components/ButtonSizeScaleExample';
import { ButtonStackedExamples } from './components/ButtonStackedExamples';
import { ButtonStackedOptionsExample } from './components/ButtonStackedOptionsExample';
import ButtonStateSection from './components/ButtonStateSection';
import { ButtonUnavailableExample } from './components/ButtonUnavailableExample';
import { resolveButtonReferenceProfile } from './components/buttonReferenceProfile';
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
  radius,
  scale,
  surfaceContext,
  textAlign
}: {
  fontName: string;
  onVividSupported: boolean;
  radius: RadiusMode;
  scale?: ElementSizeValue;
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
          <ShowcaseExampleCard
            className={`${s.contextSurface} k-root`}
            context="onSubtle"
            role="group"
            aria-labelledby="button-context-on-subtle-title"
          >
            <div className={s['state-content']}>
              <header className={s['state-header']}>
                <Text
                  as="h4"
                  id="button-context-on-subtle-title"
                  profile={textProfiles.subsectionTitle}
                  className={s['state-title']}
                >
                  On subtle
                </Text>
                {showDescriptions ? (
                  <Text
                    as="p"
                    profile={textProfiles.caption}
                    emphasis="medium"
                    className={s['state-description']}
                  >
                    Primary actions on a subtle surface.
                  </Text>
                ) : null}
              </header>
              <div className={s.contextSurfaceGrid}>
                {COMPARISON_EMPHASES.map((emphasis) => (
                  <KButton
                    key={emphasis}
                    intent="primary"
                    emphasis={emphasis}
                    radius={radius}
                    size={componentScaleToSize(scale)}
                  >
                    <KButton.Label>
                      <SmoothText fontName={fontName} align={textAlign}>
                        {emphasis}
                      </SmoothText>
                    </KButton.Label>
                  </KButton>
                ))}
              </div>
            </div>
          </ShowcaseExampleCard>
        </article>
        <article className={s.contextCard}>
          <Card
            className={`${s.contextSurface} k-root`}
            intent="primary"
            emphasis="highest"
            surfaceContext={surfaceContext}
            role="group"
            aria-labelledby="button-context-on-vivid-title"
          >
            <Layout padding="md">
              <div className={s['state-content']}>
                <header className={s['state-header']}>
                  <Text
                    as="h4"
                    id="button-context-on-vivid-title"
                    profile={textProfiles.subsectionTitle}
                    className={s['state-title']}
                  >
                    On vivid
                  </Text>
                  {showDescriptions ? (
                    <Text
                      as="p"
                      profile={textProfiles.caption}
                      emphasis="medium"
                      className={s['state-description']}
                    >
                      Primary actions on a vivid surface.
                    </Text>
                  ) : null}
                </header>
                <div className={s.contextSurfaceGrid}>
                  {onVividSupported ? (
                    COMPARISON_EMPHASES.map((emphasis) => (
                      <KButton
                        key={emphasis}
                        intent="primary"
                        emphasis={emphasis}
                        radius={radius}
                        size={componentScaleToSize(scale)}
                      >
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
              </div>
            </Layout>
          </Card>
        </article>
      </div>
    </section>
  );
}

export function Button() {
  const { designSystem, global, segment, theme } = useKiskadee();
  const dropdownMetadata = useComponentMetadata('dropdown');
  const buttonMetadata = useComponentMetadata('button');
  const buttonHeightReference = buttonMetadata?.inspection?.elements?.e1?.scales?._boxHeight;
  const stackedButtonHeightReference = buttonMetadata?.inspection?.elements?.e8?.scales?._boxHeight;
  const { fontName, manifest } = useShowcaseMetadata([
    'badge',
    'bottomSheet',
    'button',
    'card',
    'dropdown',
    'progress',
    'separator',
    'switch'
  ]);
  const { setShowDescriptions, showDescriptions } = useShowcaseDisplayPreferences();
  const { buttonClassesMap, stackedSizesByRadius } = useButtonArtifactConfig();
  const textProfiles = useShowcaseTextProfiles();
  const { artifact: typography } = useTypographyArtifact(
    designSystem,
    manifest?.typography?.artifact
  );
  const referenceProfile = resolveButtonReferenceProfile(typography, textProfiles.caption);

  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectedVivid, setIsSelectedVivid] = React.useState(false);
  const [isSimplified, setIsSimplified] = React.useState(true);
  const [showButtonGroups, setShowButtonGroups] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(false);
  const [showIndicator, setShowIndicator] = React.useState(false);
  const [radiusOverride, setRadiusOverride] = React.useState<RadiusMode>();
  const buttonRadius = radiusOverride ?? global?.radius ?? 'rounded';
  const stackedSizes = stackedSizesByRadius?.[buttonRadius];
  const [buttonScale, setButtonScale] = React.useState<ElementSizeValue | undefined>();
  const background = useShowcaseBackground();
  const activeSurfaceContext = background.surfaceContext;
  const isDarkSurface = background.color ? isDarkSurfaceColor(background.color) : false;

  const isCarbon = designSystem === 'carbon-11-ibm';
  const alignment = isCarbon ? 'left' : 'center';
  const routeClassName = isDarkSurface ? s.darkSurface : undefined;

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
      presenceArtifact: dropdownMetadata?.effects?.presence
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
    buttonScale === undefined
      ? undefined
      : (availableButtonScaleOptions.find((option) => option.value === buttonScale)?.value ??
        availableButtonScaleOptions.find((option) => option.value === 's:md:1')?.value ??
        availableButtonScaleOptions[0]?.value ??
        's:md:1');
  const buttonState = getManifestComponentState(buttonMeta, segment, theme, activeSurfaceContext);
  const sizeSeparatorAvailable = Boolean(
    getManifestComponentState(manifest?.components?.separator, segment, theme, activeSurfaceContext)
      ?.neutral?.low?.rest
  );

  const buttonControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Environment">
        <ShowcaseGlobalSemanticControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Typography">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconography">
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
      <ShowcaseControlGroup title="Display">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Button size"
            options={[
              { value: 'preset', label: 'Follow density (default)' },
              ...availableButtonScaleOptions
            ]}
            value={activeButtonScale ?? 'preset'}
            onValueChange={(value) =>
              setButtonScale(value === 'preset' ? undefined : (value as ElementSizeValue))
            }
          />
          <ShowcaseSelectControl
            label="Button radius"
            options={[
              { value: 'default', label: 'Preset default' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'pill', label: 'Pill' },
              { value: 'square', label: 'Square' }
            ]}
            value={radiusOverride ?? 'default'}
            onValueChange={(value) =>
              setRadiusOverride(value === 'default' ? undefined : (value as RadiusMode))
            }
          />
          <ShowcaseBooleanControl
            label="Button group"
            checked={showButtonGroups}
            onCheckedChange={setShowButtonGroups}
          />
          <ShowcaseBooleanControl
            label="Descriptions"
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
      <ButtonUnavailableExample
        description={`${semantic} Button, ${emphasis} emphasis, ${state} state is not published in the active design system.`}
      />
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
      <div className={s.sizeScaleUnavailable}>
        <ButtonUnavailableExample
          description={`Button size ${BUTTON_SCALE_OPTIONS.find((option) => option.value === scale)?.label ?? scale} is not published in the active design system.`}
        />
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
            radius={buttonRadius}
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
                        classNames={{ e4: s.intentControlLabel }}
                        label="Rest only"
                        emphasis={inlineControlsSwitchEmphasis}
                        controlState={isSimplified}
                        onControlStateChange={(value) => {
                          setIsSimplified(value);
                          if (value) {
                            setShowFocusRing(false);
                            setShowIndicator(false);
                          }
                        }}
                      />
                      <Separator orientation="vertical" emphasis="low" />
                      <Switch
                        id="button-focus-ring"
                        classNames={{ e4: s.intentControlLabel }}
                        disabled={isSimplified}
                        label="Focus ring"
                        emphasis={inlineControlsSwitchEmphasis}
                        controlState={showFocusRing}
                        onControlStateChange={setShowFocusRing}
                      />
                      <Separator orientation="vertical" emphasis="low" />
                      <Switch
                        id="button-indicator"
                        classNames={{ e4: s.intentControlLabel }}
                        disabled={isSimplified}
                        label="Indicator"
                        emphasis={inlineControlsSwitchEmphasis}
                        controlState={showIndicator}
                        onControlStateChange={setShowIndicator}
                      />
                    </div>
                  </ShowcaseExampleCard>
                ) : (
                  <Text as="p" emphasis="medium" profile={textProfiles.caption} role="status">
                    Switch controls are not available on this surface.
                  </Text>
                )}
              </div>
              {showDescriptions ? (
                <Text as="p" profile={textProfiles.body} className={s.intentsDescription}>
                  Intent gives an action its semantic role. Primary advances the main task, Neutral
                  supports support actions, Destructive signals risk, and Positive communicates a
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
                showFocusRing={showFocusRing}
                showIndicator={showIndicator}
                grouped={showButtonGroups}
                radius={buttonRadius}
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
                showFocusRing={showFocusRing}
                showIndicator={showIndicator}
                grouped={showButtonGroups}
                radius={buttonRadius}
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
                showFocusRing={showFocusRing}
                showIndicator={showIndicator}
                grouped={showButtonGroups}
                radius={buttonRadius}
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
                showFocusRing={showFocusRing}
                showIndicator={showIndicator}
                grouped={showButtonGroups}
                radius={buttonRadius}
                scale={activeButtonScale}
                surfaceContext={activeCardSurfaceContext}
              />
              {buttonState?.support ? (
                <ButtonStateSection
                  key="support"
                  intent="support"
                  title="Support"
                  description={
                    showDescriptions
                      ? 'A chromatic supporting action, distinct from neutral actions.'
                      : undefined
                  }
                  fontName={fontName}
                  align={alignment}
                  stateCapabilities={buttonState}
                  simplified={isSimplified}
                  showFocusRing={showFocusRing}
                  showIndicator={showIndicator}
                  grouped={showButtonGroups}
                  radius={buttonRadius}
                  scale={activeButtonScale}
                  surfaceContext={activeCardSurfaceContext}
                />
              ) : null}
            </div>
          </section>
          <div className={s.buttonExamples}>
            <section
              className={`${s['interaction-state']} ${s.sizesSection}`}
              aria-labelledby="button-sizes-title"
            >
              <Text as="h3" id="button-sizes-title" profile={textProfiles.sectionTitle}>
                Sizes
              </Text>
              <div className={s.sizeScaleCompositions}>
                {[
                  { value: 'text', label: 'Text only' },
                  { value: 'text-icon', label: 'Text and icon' },
                  { value: 'icon', label: 'Icon only' }
                ].map((composition, index) => (
                  <React.Fragment key={composition.value}>
                    {index > 0 && sizeSeparatorAvailable ? (
                      <Separator intent="neutral" emphasis="low" />
                    ) : null}
                    <section className={s.sizeScaleComposition}>
                      <Text as="h4" profile={textProfiles.subsectionTitle} emphasis="medium">
                        {composition.label}
                      </Text>
                      <div
                        className={`${s['example-states']} ${s.sizeScaleExamples} k-root`}
                        data-button-scale-composition={composition.value}
                      >
                        {BUTTON_SCALE_OPTIONS.map(({ value, label }) => (
                          <React.Fragment key={value}>
                            {renderScale(
                              value,
                              <ButtonSizeScaleExample
                                scale={value}
                                heightReference={buttonHeightReference}
                                referenceProfile={referenceProfile}
                                compact={composition.value === 'icon'}
                              >
                                {({ buttonRef, descriptionId }) => (
                                  <KButton
                                    ref={buttonRef}
                                    aria-describedby={descriptionId}
                                    radius={buttonRadius}
                                    size={componentScaleToSize(value)}
                                    intent="primary"
                                    emphasis="high"
                                    surfaceContext={activeSurfaceContext}
                                    aria-label={composition.value === 'icon' ? label : undefined}
                                  >
                                    {composition.value !== 'text' ? (
                                      <KButton.Icon>
                                        <FamilyResolvedIcon name="plus" />
                                      </KButton.Icon>
                                    ) : null}
                                    {composition.value !== 'icon' ? (
                                      <KButton.Label>
                                        <SmoothText fontName={fontName} align={alignment}>
                                          {label}
                                        </SmoothText>
                                      </KButton.Label>
                                    ) : null}
                                  </KButton>
                                )}
                              </ButtonSizeScaleExample>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </section>
                  </React.Fragment>
                ))}
                {sizeSeparatorAvailable ? <Separator intent="neutral" emphasis="low" /> : null}
                <ButtonStackedExamples
                  classesMap={buttonClassesMap}
                  fontName={fontName}
                  heightReference={stackedButtonHeightReference}
                  radius={buttonRadius}
                  referenceProfile={referenceProfile}
                  stackedSizes={stackedSizes}
                  surfaceContext={activeSurfaceContext}
                />
              </div>
            </section>
            {/* [ACTIVATION FEEDBACK] START: Showcase examples for profile/origin overrides. */}
            <div className={s['interaction-state']}>
              <Text as="h3" profile={textProfiles.sectionTitle}>
                Activation Feedback Profiles
              </Text>
              <div className={`${s['example-states']} k-root`}>
                <KButton
                  intent="primary"
                  emphasis="high"
                  radius={buttonRadius}
                  size={componentScaleToSize(activeButtonScale)}
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
                  radius={buttonRadius}
                  size={componentScaleToSize(activeButtonScale)}
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
                  radius={buttonRadius}
                  size={componentScaleToSize(activeButtonScale)}
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
                  radius={buttonRadius}
                  size={componentScaleToSize(activeButtonScale)}
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

            <section className={s.shadowSection} aria-labelledby="button-shadow-title">
              <Text as="h3" id="button-shadow-title" profile={textProfiles.sectionTitle}>
                Shadow
              </Text>
              {buttonClassesMap?.e1?.e?.h ? (
                <>
                  {showDescriptions ? (
                    <Text as="p" profile={textProfiles.body}>
                      Optional shadow follows the preset's state recipe. Compare the same button
                      without shadow, during interaction and while unavailable.
                    </Text>
                  ) : null}
                  <div className={s.shadowExamples}>
                    {[
                      { label: 'Off', props: { shadow: false } },
                      { label: 'Rest', props: { shadow: true } },
                      { label: 'Hover', props: { shadow: true, status: 'hover' as const } },
                      {
                        label: 'Focus',
                        props: {
                          shadow: true,
                          status: showFocusRing ? ('focus' as const) : undefined
                        }
                      },
                      { label: 'Pressed', props: { shadow: true, status: 'pressed' as const } },
                      {
                        label: 'Selected',
                        props: { shadow: true, toggle: true, controlState: true }
                      },
                      { label: 'Pending', props: { shadow: true, pending: true } },
                      { label: 'Disabled', props: { shadow: true, disabled: true } },
                      {
                        label: 'Selected + disabled',
                        props: { shadow: true, toggle: true, controlState: true, disabled: true }
                      }
                    ].map(({ label, props }) => (
                      <KButton
                        key={label}
                        {...props}
                        radius={buttonRadius}
                        size={componentScaleToSize(activeButtonScale)}
                        surfaceContext={activeSurfaceContext}
                      >
                        <KButton.Label>
                          <SmoothText fontName={fontName} align={alignment}>
                            {label}
                          </SmoothText>
                        </KButton.Label>
                      </KButton>
                    ))}
                  </div>
                </>
              ) : (
                <Text as="p" profile={textProfiles.body} emphasis="medium">
                  The active preset does not publish a Button shadow.
                </Text>
              )}
            </section>

            <ButtonIconFormatExamples
              radius={buttonRadius}
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
            />
            <ButtonIconExamples
              fontName={fontName}
              radius={buttonRadius}
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
            />
            <ButtonStackedOptionsExample
              classesMap={buttonClassesMap}
              fontName={fontName}
              radius={buttonRadius}
              scale={activeButtonScale}
              stackedSizes={stackedSizes}
              surfaceContext={activeSurfaceContext}
            />
            {manifest?.components?.badge ? (
              <ButtonBadgeExamples
                radius={buttonRadius}
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
              />
            ) : null}
            <ButtonGroupExamples
              radius={buttonRadius}
              scale={activeButtonScale}
              shadowAvailable={Boolean(buttonClassesMap?.e1?.e?.h)}
              surfaceContext={activeSurfaceContext}
            />
            <ButtonMenuExamples
              available={Boolean(adaptiveButtonMenuAvailable && buttonMeta)}
              presence={presenceOverride}
              radius={buttonRadius}
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
            radius={buttonRadius}
            scale={activeButtonScale}
            surfaceContext={activeSurfaceContext}
          />
          <section className={s.selectionExamples} aria-label="Selection examples">
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
                    radius={buttonRadius}
                    size={componentScaleToSize(activeButtonScale)}
                    surfaceContext={activeSurfaceContext}
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
                    radius={buttonRadius}
                    size={componentScaleToSize(activeButtonScale)}
                    surfaceContext={activeSurfaceContext}
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

            <ButtonIndicatorExamples
              radius={buttonRadius}
              scale={activeButtonScale}
              surfaceContext={activeSurfaceContext}
            />
          </section>
        </section>
      </SurfaceContextProvider>
    </>
  );
}

export default Button;
