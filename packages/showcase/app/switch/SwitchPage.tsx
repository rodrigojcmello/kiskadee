'use client';

import type {
  CardIntent,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SwitchIntent
} from '@kiskadee/core';
import {
  Card,
  CardAction,
  Switch,
  type SwitchIcons,
  useCardArtifactConfig,
  useKiskadee,
  useShowcase,
  useSwitchArtifactConfig
} from '@kiskadee/react-components';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlField,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useDesignSystemSchema } from '@/hooks/use-design-system-schema';
import { SwatchRadioGroup } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
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

type SwitchSurface =
  | 'white'
  | 'gray'
  | 'dark-gray'
  | 'black'
  | 'light-primary'
  | 'primary'
  | 'dark-primary';

type SwitchSurfaceProfile = {
  label: string;
  cardIntent: CardIntent;
  cardEmphasis: ComponentEmphasis;
  switchEmphasis: ComponentEmphasis;
};

type ResolvedSwitchSurface = SwitchSurfaceProfile & {
  value: SwitchSurface;
  swatchColor: string;
};

const surfaceToneOrder: SwitchSurface[] = [
  'white',
  'light-primary',
  'gray',
  'primary',
  'dark-gray',
  'dark-primary',
  'black'
];

const surfaceProfiles: Record<SwitchSurface, SwitchSurfaceProfile> = {
  white: {
    label: 'White',
    cardIntent: 'neutral',
    cardEmphasis: 'low',
    switchEmphasis: 'medium'
  },
  gray: {
    label: 'Gray',
    cardIntent: 'neutral',
    cardEmphasis: 'medium',
    switchEmphasis: 'medium'
  },
  'dark-gray': {
    label: 'Dark gray',
    cardIntent: 'neutral',
    cardEmphasis: 'high',
    switchEmphasis: 'low'
  },
  black: {
    label: 'Black',
    cardIntent: 'neutral',
    cardEmphasis: 'highest',
    switchEmphasis: 'low'
  },
  'light-primary': {
    label: 'Light primary',
    cardIntent: 'primary',
    cardEmphasis: 'medium',
    switchEmphasis: 'medium'
  },
  primary: {
    label: 'Primary',
    cardIntent: 'primary',
    cardEmphasis: 'high',
    switchEmphasis: 'low'
  },
  'dark-primary': {
    label: 'Dark primary',
    cardIntent: 'primary',
    cardEmphasis: 'highest',
    switchEmphasis: 'low'
  }
};

function getSurfaceForEmphasis(emphasis: ComponentEmphasis): SwitchSurface {
  return emphasis === 'low' ? 'primary' : 'white';
}

function resolveSchemaColor(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return undefined;
  const ref = (value as { ref?: unknown }).ref;
  return typeof ref === 'string' ? ref : undefined;
}

function normalizeSurfaceColor(color: string): string {
  return color.trim().toLowerCase();
}

function resolveCardSurfaceColor({
  schema,
  segment,
  theme,
  intent,
  emphasis
}: {
  schema: ReturnType<typeof useDesignSystemSchema>;
  segment: string;
  theme: string;
  intent: CardIntent;
  emphasis: ComponentEmphasis;
}): string | undefined {
  return resolveSchemaColor(
    schema?.components?.card?.elements?.e1?.palettes?.[segment]?.[theme]?.boxColor?.[intent]?.[
      emphasis
    ]?.rest
  );
}

const intentLabels: Record<string, string> = {
  neutral: 'Neutral',
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
const preferredCardShadowLevels: ElementSizeValue[] = [
  's:md:1',
  's:sm:1',
  's:lg:1',
  's:lg:2',
  's:lg:3'
];

function normalizeShadowLevelKey(key: ElementSizeValue): string {
  return key.slice(2);
}

function getAmbientSurfaceEmphasis(surface: ResolvedSwitchSurface): ComponentEmphasis {
  if (surface.cardIntent === 'neutral' && surface.cardEmphasis === 'low') {
    return 'medium';
  }

  return 'low';
}

function SwitchOffIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path
        fill="currentColor"
        d="M4.35 3.05 8 6.7l3.65-3.65 1.3 1.3L9.3 8l3.65 3.65-1.3 1.3L8 9.3l-3.65 3.65-1.3-1.3L6.7 8 3.05 4.35z"
      />
    </svg>
  );
}

function SwitchOnIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path fill="currentColor" d="M6.4 11.85 2.75 8.2l1.25-1.25 2.4 2.4 5.6-5.6L13.25 5z" />
    </svg>
  );
}

function SwitchPlayIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path fill="currentColor" d="M5 3.25 12.25 8 5 12.75z" />
    </svg>
  );
}

function SwitchPauseIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path fill="currentColor" d="M4.5 3.25h2.25v9.5H4.5zm4.75 0h2.25v9.5H9.25z" />
    </svg>
  );
}

const switchIconSets = {
  none: undefined,
  'on-off': {
    rest: <SwitchOffIcon />,
    selected: <SwitchOnIcon />
  },
  'play-pause': {
    rest: <SwitchPlayIcon />,
    selected: <SwitchPauseIcon />
  }
} satisfies Record<SwitchIconMode, SwitchIcons | undefined>;

function StateTile({
  children,
  cardShadow,
  surface
}: {
  children: ReactNode;
  cardShadow: ElementSizeValue | undefined;
  surface: ResolvedSwitchSurface;
}) {
  return (
    <Card
      className={s.stateTile}
      intent={surface.cardIntent}
      emphasis={surface.cardEmphasis}
      shadow={cardShadow}
      preserveBorderWithShadow={false}
    >
      <div className={s.stateControl}>{children}</div>
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
  const { cardClassesMap } = useCardArtifactConfig();
  const { manifest } = useShowcase();
  const designSystemSchema = useDesignSystemSchema(designSystem);
  const [controlState, setControlState] = useState(true);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [intent, setIntent] = useState<SwitchIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [surface, setSurface] = useState<SwitchSurface>('white');
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [thumbShrinkEnabled, setThumbShrinkEnabled] = useState(true);
  const [iconMode, setIconMode] = useState<SwitchIconMode>('none');
  const thumbShrinkChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchMeta = manifest?.components?.switch;
  const cardMeta = manifest?.components?.card;
  const isSwitchAvailable = Boolean(switchMeta);
  const isCardAvailable = Boolean(cardMeta);
  const defaultRadius = switchOptions.radius;
  const hasThumbShrinkEffect = Boolean(switchEffects.thumbShrinkEffect);
  const motionOverride = motionEnabled ? undefined : false;
  const hasIconSupport = Boolean(switchClassesMap?.standard?.base?.e6);
  const hasActiveIconMode = hasIconSupport && iconMode !== 'none';
  const isThumbShrinkEnabled = hasThumbShrinkEffect && thumbShrinkEnabled;
  const thumbShrinkOverride = isThumbShrinkEnabled ? undefined : false;
  const supportedScales = switchMeta?.scale;
  const supportedIntents = switchMeta?.state;
  const supportedStates = supportedIntents?.[intent];
  const supportedCardStates = cardMeta?.state;
  const switchIcons = hasActiveIconMode ? switchIconSets[iconMode] : undefined;
  const cardShadow = useMemo(() => {
    const shadowBucket = cardClassesMap?.e1?.e?.h;
    if (!shadowBucket || typeof shadowBucket === 'string') return undefined;

    return preferredCardShadowLevels.find((level) =>
      Boolean(shadowBucket[normalizeShadowLevelKey(level)])
    );
  }, [cardClassesMap]);

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
  const surfaceOptions = useMemo<ResolvedSwitchSurface[]>(() => {
    const seenSurfaceColors = new Set<string>();

    return surfaceToneOrder.flatMap((value) => {
      if (!isSwitchAvailable || !isCardAvailable) return [];

      const profile = surfaceProfiles[value];
      const hasSwitchEmphasis = Boolean(supportedStates?.[profile.switchEmphasis]);
      const hasCardSurface = Boolean(
        supportedCardStates?.[profile.cardIntent]?.[profile.cardEmphasis]?.rest
      );
      if (!hasSwitchEmphasis || !hasCardSurface) return [];

      const swatchColor = resolveCardSurfaceColor({
        schema: designSystemSchema,
        segment,
        theme,
        intent: profile.cardIntent,
        emphasis: profile.cardEmphasis
      });
      if (!swatchColor) return [];
      const normalizedSwatchColor = normalizeSurfaceColor(swatchColor);
      if (seenSurfaceColors.has(normalizedSwatchColor)) return [];
      seenSurfaceColors.add(normalizedSwatchColor);

      return [
        {
          value,
          ...profile,
          swatchColor
        }
      ];
    });
  }, [
    designSystemSchema,
    isCardAvailable,
    isSwitchAvailable,
    segment,
    supportedCardStates,
    supportedStates,
    theme
  ]);
  const selectedSurface = useMemo(
    () => surfaceOptions.find((option) => option.value === surface),
    [surface, surfaceOptions]
  );
  const surfaceItems = useMemo(
    () =>
      surfaceOptions.map((option) => ({
        value: option.value,
        label: option.label,
        swatch: {
          color: option.swatchColor
        }
      })),
    [surfaceOptions]
  );
  const pageBackgroundColor = useMemo(() => {
    if (!selectedSurface) return undefined;

    return resolveCardSurfaceColor({
      schema: designSystemSchema,
      segment,
      theme,
      intent: 'neutral',
      emphasis: getAmbientSurfaceEmphasis(selectedSurface)
    });
  }, [designSystemSchema, segment, selectedSurface, theme]);
  const pageStyle = {
    '--switch-surface-primary': selectedSurface?.swatchColor ?? '#0064B4'
  } as CSSProperties;

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
    if (!surfaceOptions.length) {
      return;
    }

    if (selectedSurface) {
      if (emphasis !== selectedSurface.switchEmphasis) {
        setEmphasis(selectedSurface.switchEmphasis);
      }
      return;
    }

    const nextSurface =
      surfaceOptions.find((option) => option.value === 'white') ?? surfaceOptions[0];
    setSurface(nextSurface.value);
    if (emphasis !== nextSurface.switchEmphasis) {
      setEmphasis(nextSurface.switchEmphasis);
    }
  }, [emphasis, selectedSurface, surfaceOptions]);

  useEffect(() => {
    return () => {
      if (thumbShrinkChangeTimeoutRef.current) {
        clearTimeout(thumbShrinkChangeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previousRouteBackground = root.style.getPropertyValue('--showcase-route-background');

    if (pageBackgroundColor) {
      root.style.setProperty('--showcase-route-background', pageBackgroundColor);
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
  }, [pageBackgroundColor]);

  const handleSurfaceChange = (value: string) => {
    const nextSurface = value as SwitchSurface;
    if (nextSurface === surface) return;

    const nextSurfaceOption = surfaceOptions.find((option) => option.value === nextSurface);
    if (!nextSurfaceOption) return;

    playWowTransition();
    setSurface(nextSurface);
    if (emphasis !== nextSurfaceOption.switchEmphasis) {
      setEmphasis(nextSurfaceOption.switchEmphasis);
    }
  };

  const handleEmphasisChange = (value: string) => {
    const nextEmphasis = value as ComponentEmphasis;
    if (nextEmphasis === emphasis) return;

    if (!supportedStates?.[nextEmphasis]) return;

    const preferredSurface = getSurfaceForEmphasis(nextEmphasis);
    const nextSurface =
      surfaceOptions.find((option) => option.value === preferredSurface) ??
      surfaceOptions.find((option) => option.switchEmphasis === nextEmphasis);
    if (!nextSurface) return;

    playWowTransition();
    setEmphasis(nextEmphasis);
    if (surface !== nextSurface.value) {
      setSurface(nextSurface.value);
    }
  };

  const switchControls = (
    <ShowcaseControlPanel>
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
        <ShowcaseGlobalSemanticControls />
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
          <ShowcaseControlField fullWidth>
            <SwatchRadioGroup
              groupLabel="Surface"
              value={surface}
              onValueChange={handleSurfaceChange}
              items={surfaceItems}
              aria-label="Switch example surface"
              className={s.surfaceControl}
            />
          </ShowcaseControlField>
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
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

  return (
    <section className={`${s.page} k-root`} style={pageStyle}>
      <header className={s.header}>
        <h2>Switch V2</h2>
        <p className={s.summary}>
          Static proof of concept for the generated `standard/base` switch contract.
        </p>
      </header>

      {!isSwitchAvailable || !isCardAvailable || !selectedSurface ? (
        <div className={s.emptyState}>
          Switch/Card surfaces are not available for the selected design system: {designSystem}.
        </div>
      ) : (
        <>
          <ShowcaseRouteControls
            id="switch"
            eyebrow="Controls"
            title="Switch"
            isAvailable={isSwitchAvailable}
            showGlobalControls={false}
          >
            {switchControls}
          </ShowcaseRouteControls>

          <section className={`${s.section} ${s.previewSection}`}>
            <h3>Interactive</h3>
            <div className={s.interactiveFrame}>
              <CardAction
                className={s.interactivePanel}
                intent={selectedSurface.cardIntent}
                emphasis={selectedSurface.cardEmphasis}
                shadow={Boolean(cardShadow)}
                preserveBorderWithShadow={false}
                interactionLocked={interactionLocked}
                onClick={() => setControlState((current) => !current)}
                aria-label={`Notifications ${controlState ? switchControlText.on : switchControlText.off}`}
              />
              <div className={s.interactiveSwitchVisual} aria-hidden="true">
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
                  inputProps={{ tabIndex: -1 }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </section>

          <section className={`${s.section} ${s.statesSection}`}>
            <h3>States</h3>
            <div className={s.stateGrid}>
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
              <StateTile cardShadow={cardShadow} surface={selectedSurface}>
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
    </section>
  );
}
