'use client';

import type {
  CardIntent,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SurfaceContext,
  SwitchIntent
} from '@kiskadee/core';
import {
  Card,
  FamilyResolvedIcon,
  SurfaceContextProvider,
  Switch,
  type SwitchIcons,
  Text,
  useKiskadee,
  useShowcase,
  useSwitchArtifactConfig
} from '@kiskadee/react-components';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseIconographyControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import type { CanonicalCardSurfaceKey } from '@/utils/canonical-card-surfaces';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { playWowTransition } from '@/utils/playWowTransition';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Switch.module.scss';

const scaleOptions: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:3', label: 'Small 3' },
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' }
];

const radiusOptions: Array<{ value: RadiusMode; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' }
];

const emphasisOptions: Array<{ value: ComponentEmphasis; label: string }> = [
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' },
  { value: 'low', label: 'Low' },
  { value: 'lowest', label: 'Lowest' }
];

type ResolvedSwitchSurface = {
  value: CanonicalCardSurfaceKey;
  label: string;
  cardIntent: CardIntent;
  cardEmphasis: ComponentEmphasis;
  swatchColor: string;
  contentSurfaceContext: SurfaceContext;
};

const intentLabels: Record<string, string> = {
  neutral: 'Neutral',
  accent: 'Accent',
  primary: 'Primary',
  polarity: 'Polarity'
};

const switchControlText = {
  on: 'On',
  off: 'Off'
};

type SwitchIconMode = 'none' | 'on-off' | 'play-pause';

const iconModeOptions: Array<{ value: SwitchIconMode; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'on-off', label: 'On / off' },
  { value: 'play-pause', label: 'Play / pause' }
];

const THUMB_SHRINK_CHANGE_DELAY_MS = 400;
function resolveCardCoordinates(key: CanonicalCardSurfaceKey): {
  cardIntent: CardIntent;
  cardEmphasis: ComponentEmphasis;
} {
  const [cardIntent, cardEmphasis] = key.split('.') as [CardIntent, ComponentEmphasis];
  return { cardIntent, cardEmphasis };
}

const switchIconSets = {
  none: undefined,
  'on-off': {
    rest: <FamilyResolvedIcon name="close" />,
    selected: <FamilyResolvedIcon name="check" />
  },
  'play-pause': {
    rest: <FamilyResolvedIcon name="play" />,
    selected: <FamilyResolvedIcon name="pause" />
  }
} satisfies Record<SwitchIconMode, SwitchIcons | undefined>;

function StateTile({
  children,
  surfaceContext,
  surface
}: {
  children: ReactNode;
  surfaceContext: SurfaceContext;
  surface?: ResolvedSwitchSurface;
}) {
  const content = <div className={s.stateControl}>{children}</div>;

  if (!surface) {
    return <div className={s.stateTile}>{content}</div>;
  }

  return (
    <Card
      className={s.stateTile}
      data-showcase-example-card={surface.value}
      intent={surface.cardIntent}
      emphasis={surface.cardEmphasis}
      surfaceContext={surfaceContext}
    >
      {content}
    </Card>
  );
}

export default function SwitchPage() {
  const { designSystem, segment, theme } = useKiskadee();
  const {
    effects: switchEffects,
    options: switchOptions,
    switchClassesMap
  } = useSwitchArtifactConfig();
  const { manifest } = useShowcase();
  const background = useShowcaseBackground();
  const textProfiles = useShowcaseTextProfiles();
  const [controlState, setControlState] = useState(true);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [intent, setIntent] = useState<SwitchIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [thumbShrinkEnabled, setThumbShrinkEnabled] = useState(true);
  const [iconMode, setIconMode] = useState<SwitchIconMode>('none');
  const thumbShrinkChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchMeta = manifest?.components?.switch;
  const isSwitchAvailable = Boolean(switchMeta);
  const defaultRadius = switchOptions.radius;
  const hasThumbShrinkEffect = Boolean(switchEffects.thumbShrinkEffect);
  const motionOverride = motionEnabled ? undefined : false;
  const hasIconSupport = Boolean(switchClassesMap?.standard?.base?.e6);
  const hasActiveIconMode = hasIconSupport && iconMode !== 'none';
  const isThumbShrinkEnabled = hasThumbShrinkEffect && thumbShrinkEnabled;
  const thumbShrinkOverride = isThumbShrinkEnabled ? undefined : false;
  const supportedScales = switchMeta?.scale;
  const supportedIntents = getManifestComponentState(switchMeta, segment, theme);
  const supportedStates = supportedIntents?.[intent];
  const switchIcons = hasActiveIconMode ? switchIconSets[iconMode] : undefined;

  const scaleSelectOptions = useMemo(
    () => scaleOptions.filter((option) => Boolean(supportedScales?.[option.value])),
    [supportedScales]
  );
  const radiusSelectOptions = useMemo(
    () =>
      radiusOptions.map((option) => ({
        ...option,
        label: option.value === defaultRadius ? `${option.label} (default)` : option.label,
        disabled: supportedScales ? !supportedScales[option.value] : false
      })),
    [defaultRadius, supportedScales]
  );
  const intentSelectOptions = useMemo(
    () =>
      Object.keys(supportedIntents ?? {}).map((value) => ({
        value: value as SwitchIntent,
        label: intentLabels[value] ?? value
      })),
    [supportedIntents]
  );
  const emphasisSelectOptions = useMemo(
    () => emphasisOptions.filter((option) => Boolean(supportedStates?.[option.value])),
    [supportedStates]
  );
  const activeSurfaceContext = background.surfaceContext;
  const activeCardSurfaceContext = supportsManifestSurfaceContext(
    manifest?.components?.card,
    segment,
    theme,
    activeSurfaceContext
  )
    ? activeSurfaceContext
    : 'onSubtle';
  const specimenCardSurface: ResolvedSwitchSurface | undefined =
    background.mode === 'canonical' && background.cardSurface
      ? {
          value: background.cardSurface.key,
          label: background.cardSurface.label,
          ...resolveCardCoordinates(background.cardSurface.key),
          swatchColor: background.cardSurface.resolvedColor,
          contentSurfaceContext: background.cardSurface.contentSurfaceContext
        }
      : undefined;
  const isBackgroundAvailable = Boolean(background.color);
  useEffect(() => {
    setRadius(defaultRadius);
  }, [defaultRadius]);

  useEffect(() => {
    if (!scaleSelectOptions.length || scaleSelectOptions.some((option) => option.value === scale)) {
      return;
    }

    setScale(
      scaleSelectOptions.find((option) => option.value === 's:md:1')?.value ??
        scaleSelectOptions[0].value
    );
  }, [scale, scaleSelectOptions]);

  useEffect(() => {
    if (
      !intentSelectOptions.length ||
      intentSelectOptions.some((option) => option.value === intent)
    ) {
      return;
    }

    setIntent(
      intentSelectOptions.find((option) => option.value === 'neutral')?.value ??
        intentSelectOptions[0].value
    );
  }, [intent, intentSelectOptions]);

  useEffect(() => {
    if (
      !emphasisSelectOptions.length ||
      emphasisSelectOptions.some((option) => option.value === emphasis)
    ) {
      return;
    }

    setEmphasis(
      emphasisSelectOptions.find((option) => option.value === 'medium')?.value ??
        emphasisSelectOptions[0].value
    );
  }, [emphasis, emphasisSelectOptions]);

  useEffect(() => {
    if (!hasIconSupport && iconMode !== 'none') {
      if (thumbShrinkChangeTimeoutRef.current) {
        clearTimeout(thumbShrinkChangeTimeoutRef.current);
        thumbShrinkChangeTimeoutRef.current = null;
      }
      setIconMode('none');
      setThumbShrinkEnabled(true);
    }
  }, [hasIconSupport, iconMode]);

  useEffect(() => {
    return () => {
      if (thumbShrinkChangeTimeoutRef.current) {
        clearTimeout(thumbShrinkChangeTimeoutRef.current);
      }
    };
  }, []);

  const handleEmphasisChange = (value: string) => {
    const nextEmphasis = value as ComponentEmphasis;
    if (nextEmphasis === emphasis || !supportedStates?.[nextEmphasis]) return;
    playWowTransition();
    setEmphasis(nextEmphasis);
  };

  const switchControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Ambiente">
        <ShowcaseGlobalSemanticControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Shape">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Scale"
            options={scaleSelectOptions}
            value={scale}
            onValueChange={(value) => {
              const nextScale = value as ElementSizeValue;
              if (nextScale === scale) return;
              playWowTransition();
              setScale(nextScale);
            }}
            disabled={!isSwitchAvailable || scaleSelectOptions.length <= 1}
          />
          <ShowcaseSelectControl
            label="Radius"
            options={radiusSelectOptions}
            value={radius}
            onValueChange={(value) => {
              const nextRadius = value as RadiusMode;
              if (nextRadius === radius) return;
              playWowTransition();
              setRadius(nextRadius);
            }}
            disabled={!isSwitchAvailable}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Semantic">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Intent"
            options={intentSelectOptions}
            value={intent}
            onValueChange={(value) => {
              const nextIntent = value as SwitchIntent;
              if (nextIntent === intent) return;
              playWowTransition();
              setIntent(nextIntent);
            }}
            disabled={!isSwitchAvailable || intentSelectOptions.length <= 1}
          />
          <ShowcaseSelectControl
            label="Emphasis"
            options={emphasisSelectOptions}
            value={emphasis}
            onValueChange={handleEmphasisChange}
            disabled={!isSwitchAvailable || emphasisSelectOptions.length <= 1}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconografia">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Interaction">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Interaction locked"
            checked={interactionLocked}
            onCheckedChange={setInteractionLocked}
            disabled={!isSwitchAvailable}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Motion">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Motion"
            checked={motionEnabled}
            onCheckedChange={(nextMotionEnabled) => {
              if (nextMotionEnabled === motionEnabled) return;
              playWowTransition();
              setMotionEnabled(nextMotionEnabled);
            }}
            disabled={!isSwitchAvailable}
          />
          <ShowcaseBooleanControl
            label="Thumb shrink"
            checked={isThumbShrinkEnabled}
            onCheckedChange={(nextThumbShrinkEnabled) => {
              if (!hasThumbShrinkEffect || nextThumbShrinkEnabled === isThumbShrinkEnabled) return;
              if (thumbShrinkChangeTimeoutRef.current) {
                clearTimeout(thumbShrinkChangeTimeoutRef.current);
              }
              const shouldClearIcons = nextThumbShrinkEnabled && hasActiveIconMode;

              if (!controlState) {
                playWowTransition();
                if (shouldClearIcons) {
                  setIconMode('none');
                }
                setThumbShrinkEnabled(nextThumbShrinkEnabled);
                thumbShrinkChangeTimeoutRef.current = null;
                return;
              }

              setControlState(false);
              thumbShrinkChangeTimeoutRef.current = setTimeout(() => {
                playWowTransition();
                if (shouldClearIcons) {
                  setIconMode('none');
                }
                setThumbShrinkEnabled(nextThumbShrinkEnabled);
                thumbShrinkChangeTimeoutRef.current = null;
              }, THUMB_SHRINK_CHANGE_DELAY_MS);
            }}
            disabled={!isSwitchAvailable || !hasThumbShrinkEffect}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      {hasIconSupport ? (
        <ShowcaseControlGroup title="Content">
          <ShowcaseControlGrid>
            <ShowcaseSelectControl
              label="Icons"
              options={iconModeOptions}
              value={iconMode}
              onValueChange={(value) => {
                const nextIconMode = value as SwitchIconMode;
                if (nextIconMode === iconMode) return;
                if (thumbShrinkChangeTimeoutRef.current) {
                  clearTimeout(thumbShrinkChangeTimeoutRef.current);
                  thumbShrinkChangeTimeoutRef.current = null;
                }
                playWowTransition();
                setIconMode(nextIconMode);
                setThumbShrinkEnabled(nextIconMode === 'none');
              }}
              disabled={!isSwitchAvailable}
            />
          </ShowcaseControlGrid>
        </ShowcaseControlGroup>
      ) : null}
    </ShowcaseControlPanel>
  );

  const interactiveSwitch = (
    <Switch
      id="switch-notifications"
      label="Notifications"
      controlText={switchControlText}
      icons={switchIcons}
      controlState={controlState}
      onControlStateChange={setControlState}
      scale={scale}
      radius={radius}
      motion={motionOverride}
      thumbShrink={thumbShrinkOverride}
      intent={intent}
      emphasis={emphasis}
      interactionLocked={interactionLocked}
    />
  );

  return (
    <section className={`${s.page} k-root`}>
      <ShowcaseRouteControls
        id="switch"
        eyebrow="Controls"
        title="Switch"
        isAvailable={isSwitchAvailable}
        showGlobalControls={false}
      >
        {switchControls}
      </ShowcaseRouteControls>

      <SurfaceContextProvider value={activeSurfaceContext}>
        <header className={s.header}>
          <Text as="h2" profile={textProfiles.pageTitle}>
            Switch
          </Text>
          <Text as="p" profile={textProfiles.body} className={s.summary}>
            Switches let people turn a setting on or off immediately.
          </Text>
        </header>

        {!isSwitchAvailable || !isBackgroundAvailable ? (
          <div className={s.emptyState}>
            <Text as="p" profile={textProfiles.body}>
              Switch surfaces are not available for the selected design system: {designSystem}.
            </Text>
          </div>
        ) : (
          <>
            <section className={`${s.section} ${s.previewSection}`}>
              <Text as="h3" profile={textProfiles.sectionTitle}>
                Interactive
              </Text>
              <div className={s.interactiveFrame}>
                {specimenCardSurface ? (
                  <Card
                    className={s.interactivePanel}
                    data-showcase-example-card={specimenCardSurface.value}
                    intent={specimenCardSurface.cardIntent}
                    emphasis={specimenCardSurface.cardEmphasis}
                    surfaceContext={activeCardSurfaceContext}
                  >
                    <div className={s.interactiveSwitchVisual}>{interactiveSwitch}</div>
                  </Card>
                ) : (
                  <div className={s.interactivePanel}>
                    <div className={s.interactiveSwitchVisual}>{interactiveSwitch}</div>
                  </div>
                )}
              </div>
            </section>

            <section className={`${s.section} ${s.statesSection}`}>
              <Text as="h3" profile={textProfiles.sectionTitle}>
                States
              </Text>
              <div className={s.stateGrid}>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-rest"
                    label="Unselected (rest)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-selected"
                    label="Selected (rest)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-hover"
                    label="Unselected (hover)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    status="hover"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-hover-selected"
                    label="Selected (hover)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    status="hover"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-pressed"
                    label="Unselected (pressed)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    status="pressed"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-pressed-selected"
                    label="Selected (pressed)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    status="pressed"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-activation-feedback"
                    label="Unselected (activation feedback)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    status="pressed"
                    activationFeedback="active"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-activation-feedback-selected"
                    label="Selected (activation feedback)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    status="pressed"
                    activationFeedback="active"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-focus"
                    label="Unselected (focus)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    status="focus"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-state-focus-selected"
                    label="Selected (focus)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    status="focus"
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    readOnly
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-disabled"
                    label="Unselected (disabled)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState={false}
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    disabled
                  />
                </StateTile>
                <StateTile surfaceContext={activeCardSurfaceContext} surface={specimenCardSurface}>
                  <Switch
                    id="switch-disabled-selected"
                    label="Selected (disabled)"
                    controlText={switchControlText}
                    icons={switchIcons}
                    controlState
                    scale={scale}
                    radius={radius}
                    motion={motionOverride}
                    thumbShrink={thumbShrinkOverride}
                    intent={intent}
                    emphasis={emphasis}
                    disabled
                  />
                </StateTile>
              </div>
            </section>
          </>
        )}
      </SurfaceContextProvider>
    </section>
  );
}
