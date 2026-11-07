'use client';

import type { ElementSizeValue, RadiusMode } from '@kiskadee/core';
import { componentScaleToSize, resolveButtonStackedRadiusMode } from '@kiskadee/core';
import { Button as KButton, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
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
import { ButtonPaginationExamples } from './components/ButtonPaginationExamples';
import { ButtonRichTextEditorExample } from './components/ButtonRichTextEditorExample';
import { ButtonSelectionExamples } from './components/ButtonSelectionExamples';
import { ButtonSizeScaleExample } from './components/ButtonSizeScaleExample';
import { ButtonStackedExamples } from './components/ButtonStackedExamples';
import ButtonStateSection from './components/ButtonStateSection';
import { SurfaceContextComparison } from './components/ButtonSurfaceContextComparison';
import { ButtonUnavailableExample } from './components/ButtonUnavailableExample';
import { ButtonVideoconferencingExamples } from './components/ButtonVideoconferencingExamples';
import { resolveButtonReferenceProfile } from './components/buttonReferenceProfile';

const BUTTON_SCALE_OPTIONS: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' },
  { value: 's:lg:2', label: 'Large 2' },
  { value: 's:lg:3', label: 'Large 3' }
];

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
    'select',
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

  const [isSimplified, setIsSimplified] = React.useState(true);
  const [showButtonGroups, setShowButtonGroups] = React.useState(false);
  const [showFocusRing, setShowFocusRing] = React.useState(false);
  const [radiusOverride, setRadiusOverride] = React.useState<RadiusMode>();
  const buttonRadius = radiusOverride ?? global?.radius ?? 'rounded';
  const stackedRadius = resolveButtonStackedRadiusMode(buttonRadius);
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
  const [compositionCardIntent, compositionCardEmphasis] = (
    background.cardSurface?.key ?? ''
  ).split('.');
  const compositionCardState = getManifestComponentState(
    cardMeta,
    segment,
    theme,
    activeCardSurfaceContext
  );
  const selectionControlsAvailable = Boolean(
    compositionCardState?.[compositionCardIntent]?.[compositionCardEmphasis]?.rest &&
      dropdownAvailable
  );
  const inlineControlsSwitchEmphasis = 'medium';
  const switchState = getManifestComponentState(switchMeta, segment, theme, activeSurfaceContext);
  const inlineControlsAvailable = Boolean(
    switchState?.neutral?.[inlineControlsSwitchEmphasis]?.rest
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

  const intentPresentationControls = inlineControlsAvailable ? (
    <fieldset aria-label="Intent presentation controls" className={s.intentsInlineControls}>
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
          }
        }}
      />
      {sizeSeparatorAvailable ? <Separator orientation="vertical" emphasis="low" /> : null}
      <Switch
        id="button-focus-ring"
        classNames={{ e4: s.intentControlLabel }}
        disabled={isSimplified}
        label="Focus ring"
        emphasis={inlineControlsSwitchEmphasis}
        controlState={showFocusRing}
        onControlStateChange={setShowFocusRing}
      />
    </fieldset>
  ) : (
    <Text as="p" emphasis="medium" profile={textProfiles.caption} role="status">
      Switch controls are not available on this surface.
    </Text>
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
                {!showDescriptions ? intentPresentationControls : null}
              </div>
              {showDescriptions ? (
                <div className={s.intentsDescriptionRow}>
                  <Text as="p" profile={textProfiles.body} className={s.intentsDescription}>
                    Intent gives an action its semantic role. Primary advances the main task,
                    Neutral supports support actions, Destructive signals risk, and Positive
                    communicates a beneficial outcome.
                  </Text>
                  {intentPresentationControls}
                </div>
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
                  radius={stackedRadius}
                  referenceProfile={referenceProfile}
                  stackedSizes={stackedSizesByRadius?.[stackedRadius]}
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
            <section className={s.compositionsSection} aria-labelledby="button-compositions-title">
              <header>
                <Text as="h3" id="button-compositions-title" profile={textProfiles.sectionTitle}>
                  Compositions
                </Text>
                {showDescriptions ? (
                  <Text as="p" profile={textProfiles.body}>
                    Action groups, editing controls, meeting toolbars and pagination composed with
                    Buttons.
                  </Text>
                ) : null}
              </header>
              <ButtonIconExamples
                fontName={fontName}
                radius={buttonRadius}
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
              />
              <ButtonRichTextEditorExample
                radius={buttonRadius}
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
              />
              <ButtonVideoconferencingExamples
                classesMap={buttonClassesMap}
                fontName={fontName}
                radius={stackedRadius}
                scale={activeButtonScale}
                selectionControlAvailable={selectionControlsAvailable}
                stackedSizes={stackedSizesByRadius?.[stackedRadius]}
                surfaceContext={activeSurfaceContext}
              />
              <ButtonPaginationExamples
                radius={buttonRadius}
                scale={activeButtonScale}
                surfaceContext={activeSurfaceContext}
              />
            </section>
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
            <ButtonSelectionExamples
              fontName={fontName}
              radius={buttonRadius}
              surfaceContext={activeSurfaceContext}
            />

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
