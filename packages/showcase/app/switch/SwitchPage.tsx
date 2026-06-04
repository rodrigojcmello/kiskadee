'use client';

import type { ComponentEmphasis, ElementSizeValue, RadiusMode, SwitchIntent } from '@kiskadee/core';
import {
  Switch,
  useKiskadee,
  useShowcase,
  useSwitchArtifactConfig
} from '@kiskadee/react-components';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/k-components';
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
  e3: 'k-swt-af-active'
};

function StateTile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={s.stateTile}>
      <div className={s.stateTitle}>{title}</div>
      <div className={s.stateControl}>{children}</div>
    </div>
  );
}

export default function SwitchPage() {
  const { designSystem } = useKiskadee();
  const { effects: switchEffects, options: switchOptions } = useSwitchArtifactConfig();
  const { manifest } = useShowcase();
  const [controlState, setControlState] = useState(true);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [intent, setIntent] = useState<SwitchIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [thumbSizeEnabled, setThumbSizeEnabled] = useState(true);
  const switchMeta = manifest?.components?.switch;
  const isSwitchAvailable = Boolean(switchMeta);
  const defaultRadius = switchOptions.radius;
  const hasThumbSizeEffect = Boolean(switchEffects.thumbSizeEffect);
  const motionOverride = motionEnabled ? undefined : false;
  const isThumbSizeEnabled = hasThumbSizeEffect && thumbSizeEnabled;
  const thumbSizeOverride = isThumbSizeEnabled ? undefined : false;
  const supportedScales = switchMeta?.scale;
  const supportedIntents = switchMeta?.state;
  const supportedStates = supportedIntents?.[intent];

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

  return (
    <section className={`${s.page} k-root`}>
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
            onValueChange={(value) => {
              const nextEmphasis = value as ComponentEmphasis;
              if (nextEmphasis === emphasis) return;
              playWowTransition();
              setEmphasis(nextEmphasis);
            }}
            disabled={!isSwitchAvailable || emphasisSelectOptions.length <= 1}
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
            label="Thumb size"
            width={140}
            options={effectToggleOptions}
            value={isThumbSizeEnabled ? 'on' : 'off'}
            onValueChange={(value) => {
              const nextThumbSizeEnabled = value === 'on';
              if (!hasThumbSizeEffect || nextThumbSizeEnabled === isThumbSizeEnabled) return;
              playWowTransition();
              setThumbSizeEnabled(nextThumbSizeEnabled);
            }}
            disabled={!isSwitchAvailable || !hasThumbSizeEffect}
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
            <div className={s.interactivePanel}>
              <Switch
                id="switch-notifications"
                label="Notifications"
                controlText={switchControlText}
                controlState={controlState}
                onControlStateChange={setControlState}
                scale={scale}
                radius={radius}
                motion={motionOverride}
                thumbSize={thumbSizeOverride}
                intent={intent}
                emphasis={emphasis}
              />
            </div>
          </section>

          <section className={s.section}>
            <h3>States</h3>
            <div className={s.stateGrid}>
              <StateTile title="Rest">
                <Switch
                  id="switch-state-rest"
                  label="Rest"
                  controlText={switchControlText}
                  controlState={false}
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Selected">
                <Switch
                  id="switch-state-selected"
                  label="Selected"
                  controlText={switchControlText}
                  controlState
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Hover">
                <Switch
                  id="switch-state-hover"
                  label="Hover"
                  controlText={switchControlText}
                  controlState={false}
                  status="hover"
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Pressed">
                <Switch
                  id="switch-state-pressed"
                  label="Pressed"
                  controlText={switchControlText}
                  controlState={false}
                  status="pressed"
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Activation Feedback">
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
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Focus">
                <Switch
                  id="switch-state-focus"
                  label="Focus"
                  controlText={switchControlText}
                  controlState={false}
                  status="focus"
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Disabled">
                <Switch
                  id="switch-disabled"
                  label="Disabled"
                  controlText={switchControlText}
                  controlState={false}
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  disabled
                />
              </StateTile>
              <StateTile title="No Visible Label">
                <Switch
                  id="switch-label-hidden"
                  inputProps={{ 'aria-label': 'No visible label switch' }}
                  controlText={switchControlText}
                  controlState
                  scale={scale}
                  radius={radius}
                  motion={motionOverride}
                  thumbSize={thumbSizeOverride}
                  intent={intent}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
