'use client';

import type { ComponentEmphasis, ElementSizeValue, RadiusMode } from '@kiskadee/core';
import { Switch, useKiskadee, useShowcase } from '@kiskadee/react-components';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import s from './Switch.module.scss';

const switchScaleOptions: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:3', label: 'Small 3' },
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' }
];

const radiusOptions: Array<{ value: RadiusMode; label: string }> = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'square', label: 'Square' }
];

const emphasisOptions: Array<{ value: ComponentEmphasis; label: string }> = [
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
  { value: 'lowest', label: 'Lowest' }
];

function StateTile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={s.stateTile}>
      <div className={s.stateTitle}>{title}</div>
      <div className={s.stateControl}>{children}</div>
    </div>
  );
}

export default function SwitchPage() {
  const { designSystem, global } = useKiskadee();
  const { manifest } = useShowcase();
  const [checked, setChecked] = useState(true);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const switchMeta = manifest?.components?.switch;
  const isSwitchAvailable = Boolean(switchMeta);
  const defaultRadius = global?.components?.switch?.options?.radius ?? global?.radius ?? 'rounded';
  const supportedSwitchScales = switchMeta?.scale;
  const supportedSwitchStates = switchMeta?.state?.neutral;
  const scaleSelectOptions = useMemo(
    () => switchScaleOptions.filter((option) => Boolean(supportedSwitchScales?.[option.value])),
    [supportedSwitchScales]
  );
  const emphasisSelectOptions = useMemo(
    () => emphasisOptions.filter((option) => Boolean(supportedSwitchStates?.[option.value])),
    [supportedSwitchStates]
  );
  const radiusSelectOptions = useMemo(
    () =>
      radiusOptions.map((option) => ({
        ...option,
        label: option.value === defaultRadius ? `${option.label} (default)` : option.label,
        disabled: supportedSwitchScales ? !supportedSwitchScales[option.value] : false
      })),
    [defaultRadius, supportedSwitchScales]
  );

  useEffect(() => {
    setRadius(defaultRadius);
  }, [defaultRadius]);

  useEffect(() => {
    if (
      !emphasisSelectOptions.length ||
      emphasisSelectOptions.some((option) => option.value === emphasis)
    ) {
      return;
    }

    const preferredEmphasis = emphasisSelectOptions.find((option) => option.value === 'medium');
    setEmphasis(preferredEmphasis?.value ?? emphasisSelectOptions[0].value);
  }, [emphasis, emphasisSelectOptions]);

  useEffect(() => {
    if (!scaleSelectOptions.length || scaleSelectOptions.some((option) => option.value === scale)) {
      return;
    }

    const preferredScale = scaleSelectOptions.find((option) => option.value === 's:md:1');
    setScale(preferredScale?.value ?? scaleSelectOptions[0].value);
  }, [scale, scaleSelectOptions]);

  return (
    <section className={`${s.page} k-root`}>
      <header className={s.header}>
        <div>
          <h2>Switch</h2>
          <p className={s.summary}>
            Binary control scenarios for the generated `standard/base` switch contract.
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
                checked={checked}
                onCheckedChange={setChecked}
                scale={scale}
                radius={radius}
                emphasis={emphasis}
              />
              <span className={s.valueLabel}>{checked ? 'On' : 'Off'}</span>
            </div>
          </section>

          <section className={s.section}>
            <h3>States</h3>
            <div className={s.stateGrid}>
              <StateTile title="Unchecked">
                <Switch
                  id="switch-state-unchecked"
                  label="Rest"
                  checked={false}
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Checked">
                <Switch
                  id="switch-state-checked"
                  label="Selected"
                  checked
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Hover">
                <Switch
                  id="switch-state-hover"
                  label="Hover"
                  checked={false}
                  className="-h -a"
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Focus">
                <Switch
                  id="switch-state-focus"
                  label="Focus"
                  checked={false}
                  className="-f -a"
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Checked Hover">
                <Switch
                  id="switch-state-checked-hover"
                  label="Selected hover"
                  checked
                  className="-h"
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Checked Focus">
                <Switch
                  id="switch-state-checked-focus"
                  label="Selected focus"
                  checked
                  className="-f"
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
            </div>
          </section>

          <section className={s.section}>
            <h3>Disabled</h3>
            <div className={s.stateGrid}>
              <StateTile title="Disabled">
                <Switch
                  id="switch-disabled-off"
                  label="Unavailable"
                  checked={false}
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  disabled
                />
              </StateTile>
              <StateTile title="Checked Disabled">
                <Switch
                  id="switch-disabled-on"
                  label="Locked on"
                  checked
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  disabled
                />
              </StateTile>
            </div>
          </section>

          <section className={s.section}>
            <h3>Labels</h3>
            <div className={s.stateGrid}>
              <StateTile title="Label Start">
                <Switch
                  id="switch-label-start"
                  label="Airplane mode"
                  labelPosition="start"
                  checked
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="Custom Label">
                <Switch
                  id="switch-label-custom"
                  label={
                    <span className={s.customLabel}>
                      <strong>Sync</strong>
                      <span>Background updates</span>
                    </span>
                  }
                  checked
                  scale={scale}
                  radius={radius}
                  emphasis={emphasis}
                  readOnly
                />
              </StateTile>
              <StateTile title="No Visible Label">
                <Switch
                  id="switch-label-hidden"
                  inputProps={{ 'aria-label': 'No visible label switch' }}
                  checked
                  scale={scale}
                  radius={radius}
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
