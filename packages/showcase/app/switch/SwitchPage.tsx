'use client';

import type { ComponentEmphasis, ElementSizeValue, RadiusMode, SwitchIntent } from '@kiskadee/core';
import {
  Switch,
  type SwitchIcons,
  useKiskadee,
  useShowcase,
  useSwitchArtifactConfig
} from '@kiskadee/react-components';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  type BackgroundToneKey,
  type ResolvedBackgroundTone,
  useBackgroundTones,
  usePrimarySurfaceTone
} from '@/hooks/use-background-tones';
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
  { value: 'low', label: 'Low' },
  { value: 'lowest', label: 'Lowest' }
];

type SwitchSurface = 'default' | 'primary' | Exclude<BackgroundToneKey, 'white'>;

const surfaceToneOrder: SwitchSurface[] = [
  'default',
  'gray',
  'light-primary',
  'primary',
  'dark-gray',
  'dark-primary',
  'black'
];

const surfaceLabels: Record<SwitchSurface, string> = {
  default: 'Default',
  gray: 'Gray',
  'light-primary': 'Light primary',
  primary: 'Primary',
  'dark-gray': 'Dark gray',
  'dark-primary': 'Dark primary',
  black: 'Black'
};

const darkSurfaceValues: SwitchSurface[] = ['primary', 'dark-gray', 'dark-primary', 'black'];

function isDarkSurface(surface: SwitchSurface) {
  return darkSurfaceValues.includes(surface);
}

function getSurfaceEmphasis(surface: SwitchSurface): ComponentEmphasis {
  return isDarkSurface(surface) ? 'low' : 'medium';
}

function getSurfaceForEmphasis(emphasis: ComponentEmphasis): SwitchSurface {
  return emphasis === 'low' ? 'primary' : 'default';
}

function getSurfaceClassName(baseClassName: string, surface: SwitchSurface) {
  if (surface === 'default') return baseClassName;

  const surfaceClassNames = [baseClassName, s.surfaceTone];
  if (isDarkSurface(surface)) {
    surfaceClassNames.push(s.darkSurface);
  }

  return surfaceClassNames.join(' ');
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

function StateTile({ children, surface }: { children: ReactNode; surface: SwitchSurface }) {
  const className = getSurfaceClassName(s.stateTile, surface);

  return (
    <div className={className}>
      <div className={s.stateControl}>{children}</div>
    </div>
  );
}

export default function SwitchPage() {
  const { designSystem } = useKiskadee();
  const {
    effects: switchEffects,
    options: switchOptions,
    switchClassesMap
  } = useSwitchArtifactConfig();
  const { manifest } = useShowcase();
  const backgroundTones = useBackgroundTones();
  const primarySurface = usePrimarySurfaceTone();
  const [controlState, setControlState] = useState(true);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [intent, setIntent] = useState<SwitchIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [surface, setSurface] = useState<SwitchSurface>('default');
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
  const isThumbShrinkLockedByIcons = hasActiveIconMode;
  const isThumbShrinkEnabled =
    hasThumbShrinkEffect && thumbShrinkEnabled && !isThumbShrinkLockedByIcons;
  const thumbShrinkOverride = isThumbShrinkEnabled ? undefined : false;
  const supportedScales = switchMeta?.scale;
  const supportedIntents = switchMeta?.state;
  const supportedStates = supportedIntents?.[intent];
  const switchIcons = hasActiveIconMode ? switchIconSets[iconMode] : undefined;
  const backgroundToneByKey = useMemo(
    () =>
      new Map<BackgroundToneKey, ResolvedBackgroundTone>(
        backgroundTones.tones.map((tone) => [tone.key, tone])
      ),
    [backgroundTones.tones]
  );
  const selectedSurfaceColor =
    surface === 'default'
      ? undefined
      : surface === 'primary'
        ? primarySurface.color
        : backgroundToneByKey.get(surface)?.resolvedColor;
  const pageBackgroundColor =
    surface === 'gray' || surface === 'light-primary'
      ? '#ffffff'
      : (backgroundToneByKey.get('gray')?.resolvedColor ?? '#f5f5f5');
  const pageStyle = {
    '--switch-surface-primary': primarySurface.color,
    '--switch-card-surface': selectedSurfaceColor ?? '#ffffff'
  } as CSSProperties;

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
  const surfaceItems = useMemo(
    () =>
      surfaceToneOrder.flatMap((value) => {
        if (!isSwitchAvailable || !supportedStates?.[getSurfaceEmphasis(value)]) {
          return [];
        }

        let swatchColor = '#ffffff';

        if (value === 'primary') {
          swatchColor = primarySurface.color;
        } else if (value !== 'default') {
          const backgroundTone = backgroundToneByKey.get(value as BackgroundToneKey);
          swatchColor = backgroundTone?.displayColor ?? swatchColor;
        }

        return [
          {
            value,
            label: surfaceLabels[value],
            swatch: {
              color: swatchColor
            }
          }
        ];
      }),
    [backgroundToneByKey, isSwitchAvailable, primarySurface.color, supportedStates]
  );

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
    if (!isSwitchAvailable) {
      return;
    }

    const currentSurfaceEmphasis = getSurfaceEmphasis(surface);
    if (supportedStates?.[currentSurfaceEmphasis]) {
      return;
    }

    const nextSurface =
      surfaceToneOrder.find((value) => Boolean(supportedStates?.[getSurfaceEmphasis(value)])) ??
      'default';
    setSurface(nextSurface);

    const nextEmphasis = getSurfaceEmphasis(nextSurface);
    if (supportedStates?.[nextEmphasis] && emphasis !== nextEmphasis) {
      setEmphasis(nextEmphasis);
    }
  }, [emphasis, isSwitchAvailable, supportedStates, surface]);

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

    root.style.setProperty('--showcase-route-background', pageBackgroundColor);

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

    const nextEmphasis = getSurfaceEmphasis(nextSurface);
    if (!supportedStates?.[nextEmphasis]) return;

    playWowTransition();
    setSurface(nextSurface);
    if (emphasis !== nextEmphasis) {
      setEmphasis(nextEmphasis);
    }
  };

  const handleEmphasisChange = (value: string) => {
    const nextEmphasis = value as ComponentEmphasis;
    if (nextEmphasis === emphasis) return;

    const nextSurface = getSurfaceForEmphasis(nextEmphasis);
    if (!supportedStates?.[nextEmphasis]) return;

    playWowTransition();
    setEmphasis(nextEmphasis);
    if (surface !== nextSurface && supportedStates?.[getSurfaceEmphasis(nextSurface)]) {
      setSurface(nextSurface);
    }
  };

  const interactivePanelClassName = getSurfaceClassName(s.interactivePanel, surface);
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
              if (
                !hasThumbShrinkEffect ||
                isThumbShrinkLockedByIcons ||
                nextThumbShrinkEnabled === isThumbShrinkEnabled
              )
                return;
              if (thumbShrinkChangeTimeoutRef.current) {
                clearTimeout(thumbShrinkChangeTimeoutRef.current);
              }

              if (!controlState) {
                playWowTransition();
                setThumbShrinkEnabled(nextThumbShrinkEnabled);
                thumbShrinkChangeTimeoutRef.current = null;
                return;
              }

              setControlState(false);
              thumbShrinkChangeTimeoutRef.current = setTimeout(() => {
                playWowTransition();
                setThumbShrinkEnabled(nextThumbShrinkEnabled);
                thumbShrinkChangeTimeoutRef.current = null;
              }, THUMB_SHRINK_CHANGE_DELAY_MS);
            }}
            disabled={!isSwitchAvailable || !hasThumbShrinkEffect || isThumbShrinkLockedByIcons}
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

      {!isSwitchAvailable ? (
        <div className={s.emptyState}>
          Switch is not available for the selected design system: {designSystem}.
        </div>
      ) : (
        <>
          <ShowcaseRouteControls
            id="switch"
            eyebrow="Controls"
            title="Switch"
            isAvailable={isSwitchAvailable}
          >
            {switchControls}
          </ShowcaseRouteControls>

          <section className={`${s.section} ${s.previewSection}`}>
            <h3>Interactive</h3>
            <div className={interactivePanelClassName}>
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
              />
            </div>
          </section>

          <section className={`${s.section} ${s.statesSection}`}>
            <h3>States</h3>
            <div className={s.stateGrid}>
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
              <StateTile surface={surface}>
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
