'use client';

import type { ComponentEmphasis, ElementSizeValue, RadiusMode, SwitchIntent } from '@kiskadee/core';
import {
  Switch,
  useKiskadee,
  useShowcase,
  useSwitchArtifactConfig
} from '@kiskadee/react-components';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type BackgroundToneKey,
  type ResolvedBackgroundTone,
  useBackgroundTones,
  usePrimarySurfaceTone
} from '@/hooks/use-background-tones';
import { Select, SwatchRadioGroup } from '@/k-components';
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

const effectToggleOptions = [
  { value: 'on', label: 'Ligado' },
  { value: 'off', label: 'Desligado' }
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

const switchActivationFeedbackActiveClassNames = {
  e3: 'k-swt-e3c-a'
};

const THUMB_SHRINK_CHANGE_DELAY_MS = 400;

function StateTile({
  children,
  surface,
  title
}: {
  children: ReactNode;
  surface: SwitchSurface;
  title: string;
}) {
  const className = getSurfaceClassName(s.stateTile, surface);

  return (
    <div className={className}>
      <div className={s.stateTitle}>{title}</div>
      <div className={s.stateControl}>{children}</div>
    </div>
  );
}

export default function SwitchPage() {
  const { designSystem } = useKiskadee();
  const { effects: switchEffects, options: switchOptions } = useSwitchArtifactConfig();
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
  const thumbShrinkChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchMeta = manifest?.components?.switch;
  const isSwitchAvailable = Boolean(switchMeta);
  const defaultRadius = switchOptions.radius;
  const hasThumbShrinkEffect = Boolean(switchEffects.thumbShrinkEffect);
  const motionOverride = motionEnabled ? undefined : false;
  const isThumbShrinkEnabled = hasThumbShrinkEffect && thumbShrinkEnabled;
  const thumbShrinkOverride = isThumbShrinkEnabled ? undefined : false;
  const supportedScales = switchMeta?.scale;
  const supportedIntents = switchMeta?.state;
  const supportedStates = supportedIntents?.[intent];
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

        return [{
          value,
          label: surfaceLabels[value],
          swatch: {
            color: swatchColor
          }
        }];
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

  return (
    <section className={`${s.page} k-root`} style={pageStyle}>
      <header className={s.header}>
        <div>
          <h2>Switch V2</h2>
          <p className={s.summary}>
            Static proof of concept for the generated `standard/base` switch contract.
          </p>
        </div>
        <div className={s.controls}>
          <Select
            label="Scale"
            width={160}
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
          <Select
            label="Radius"
            width={160}
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
          <Select
            label="Intent"
            width={160}
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
          <Select
            label="Emphasis"
            width={160}
            options={emphasisSelectOptions}
            value={emphasis}
            onValueChange={handleEmphasisChange}
            disabled={!isSwitchAvailable || emphasisSelectOptions.length <= 1}
          />
          <SwatchRadioGroup
            groupLabel="Surface"
            value={surface}
            onValueChange={handleSurfaceChange}
            items={surfaceItems}
            aria-label="Switch example surface"
            className={s.surfaceControl}
          />
          <Select
            label="Motion"
            width={140}
            options={effectToggleOptions}
            value={motionEnabled ? 'on' : 'off'}
            onValueChange={(value) => {
              const nextMotionEnabled = value === 'on';
              if (nextMotionEnabled === motionEnabled) return;
              playWowTransition();
              setMotionEnabled(nextMotionEnabled);
            }}
            disabled={!isSwitchAvailable}
          />
          <Select
            label="Thumb shrink"
            width={140}
            options={effectToggleOptions}
            value={isThumbShrinkEnabled ? 'on' : 'off'}
            onValueChange={(value) => {
              const nextThumbShrinkEnabled = value === 'on';
              if (!hasThumbShrinkEffect || nextThumbShrinkEnabled === isThumbShrinkEnabled) return;
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
            disabled={!isSwitchAvailable || !hasThumbShrinkEffect}
          />
        </div>
      </header>

      {!isSwitchAvailable ? (
        <div className={s.emptyState}>
          Switch is not available for the selected design system: {designSystem}.
        </div>
      ) : (
        <>
          <section className={s.section}>
            <h3>Interactive</h3>
            <div className={interactivePanelClassName}>
              <Switch
                id="switch-notifications"
                label="Notifications"
                controlText={switchControlText}
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

          <section className={s.section}>
            <h3>States</h3>
            <div className={s.stateGrid}>
              <StateTile title="Rest" surface={surface}>
                <Switch
                  id="switch-state-rest"
                  label="Rest"
                  controlText={switchControlText}
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
              <StateTile title="Selected" surface={surface}>
                <Switch
                  id="switch-state-selected"
                  label="Selected"
                  controlText={switchControlText}
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
              <StateTile title="Hover" surface={surface}>
                <Switch
                  id="switch-state-hover"
                  label="Hover"
                  controlText={switchControlText}
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
              <StateTile title="Hover Selected" surface={surface}>
                <Switch
                  id="switch-state-hover-selected"
                  label="Hover selected"
                  controlText={switchControlText}
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
              <StateTile title="Pressed" surface={surface}>
                <Switch
                  id="switch-state-pressed"
                  label="Pressed"
                  controlText={switchControlText}
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
              <StateTile title="Pressed Selected" surface={surface}>
                <Switch
                  id="switch-state-pressed-selected"
                  label="Pressed selected"
                  controlText={switchControlText}
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
              <StateTile title="Activation Feedback" surface={surface}>
                <Switch
                  id="switch-state-activation-feedback"
                  label="Activation feedback"
                  controlText={switchControlText}
                  controlState={false}
                  status="pressed"
                  classNames={switchActivationFeedbackActiveClassNames}
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbShrink={thumbShrinkOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Activation Feedback Selected" surface={surface}>
                <Switch
                  id="switch-state-activation-feedback-selected"
                  label="Activation feedback selected"
                  controlText={switchControlText}
                  controlState
                  status="pressed"
                  classNames={switchActivationFeedbackActiveClassNames}
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbShrink={thumbShrinkOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Focus" surface={surface}>
                <Switch
                  id="switch-state-focus"
                  label="Focus"
                  controlText={switchControlText}
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
              <StateTile title="Focus Selected" surface={surface}>
                <Switch
                  id="switch-state-focus-selected"
                  label="Focus selected"
                  controlText={switchControlText}
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
              <StateTile title="Disabled" surface={surface}>
                <Switch
                  id="switch-disabled"
                  label="Disabled"
                  controlText={switchControlText}
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
              <StateTile title="Disabled Selected" surface={surface}>
                <Switch
                  id="switch-disabled-selected"
                  label="Disabled selected"
                  controlText={switchControlText}
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
