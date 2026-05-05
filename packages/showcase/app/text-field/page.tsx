'use client';

import type {
  RadiusMode,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetStrategy
} from '@kiskadee/core';
import {
  TextFieldFloatingInside,
  TextFieldFloatingNotched,
  TextFieldStandardBorderless,
  TextFieldStandardOutline,
  TextFieldStandardUnderline,
  useKiskadee
} from '@kiskadee/react-components';
import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/k-components';

const sectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 360px))',
  gap: 24,
  alignItems: 'start'
} as const;

const groupStyle = {
  display: 'grid',
  gap: 18
} as const;

const controlsStyle = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: 24
} as const;

const radiusOptions: Array<{ value: RadiusMode; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' }
];

type LabelOffsetSelection = 'auto' | TextFieldLabelOffsetStrategy;

const labelOffsetOptions: Array<{ value: LabelOffsetSelection; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'schema', label: 'Schema' },
  { value: 'radius', label: 'Radius' },
  { value: 'input-start', label: 'Input start' },
  { value: 'none', label: 'None' }
];

export default function TextFieldPage() {
  const { designSystem, global } = useKiskadee();
  const [standardOutlineName, setStandardOutlineName] = useState('');
  const [standardUnderlineName, setStandardUnderlineName] = useState('');
  const [standardBorderlessName, setStandardBorderlessName] = useState('');
  const [floatingNotchedProject, setFloatingNotchedProject] = useState('');
  const [floatingInsideProject, setFloatingInsideProject] = useState('');
  const [borderRadius, setBorderRadius] = useState<RadiusMode>('rounded');
  const [labelOffsetSelection, setLabelOffsetSelection] = useState<LabelOffsetSelection>('auto');
  const [focusRingColorSourceOverride, setFocusRingColorSourceOverride] = useState<
    TextFieldFocusRingColorSource | undefined
  >(undefined);
  const labelOffset = labelOffsetSelection === 'auto' ? undefined : labelOffsetSelection;
  const schemaFocusRingColorSource =
    global?.components?.textField?.options?.focusRingColorSource ?? 'global';
  const focusRingColorSourceSelection =
    focusRingColorSourceOverride ?? schemaFocusRingColorSource;
  const focusRingColorSourceOptions = useMemo(
    () =>
      (
        [
          { value: 'global', label: 'Global' },
          { value: 'component', label: 'Component' }
        ] as const
      ).map((option) => ({
        ...option,
        label:
          option.value === schemaFocusRingColorSource
            ? `${option.label} (default)`
            : option.label
      })),
    [schemaFocusRingColorSource]
  );

  useEffect(() => {
    setFocusRingColorSourceOverride(undefined);
  }, [designSystem]);

  return (
    <section className="k-root">
      <h2>TextField</h2>
      <p style={{ marginTop: 0, maxWidth: 760 }}>
        TextField now exposes two variants with named modes. Standard covers outline, underline, and
        borderless shells. Floating covers notched and inside label behavior.
      </p>

      <div style={controlsStyle}>
        <Select
          label="Border Radius"
          width={200}
          options={radiusOptions}
          value={borderRadius}
          onValueChange={(value) => setBorderRadius(value as RadiusMode)}
        />
        <Select
          label="Label Offset"
          width={220}
          options={labelOffsetOptions}
          value={labelOffsetSelection}
          onValueChange={(value) => setLabelOffsetSelection(value as LabelOffsetSelection)}
        />
        <Select
          label="Focus Ring Color"
          width={240}
          options={focusRingColorSourceOptions}
          value={focusRingColorSourceSelection}
          onValueChange={(value) => {
            const next = value as TextFieldFocusRingColorSource;
            setFocusRingColorSourceOverride(
              next === schemaFocusRingColorSource ? undefined : next
            );
          }}
        />
      </div>

      <div style={sectionStyle}>
        <div style={groupStyle}>
          <h3>Standard / Outline</h3>
          <TextFieldStandardOutline
            id="standard-outline-name"
            label="Full name"
            value={standardOutlineName}
            onValueChange={setStandardOutlineName}
            placeholder="Ada Lovelace"
            message="Classic outlined field."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardOutline
            id="standard-outline-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardOutline
            id="standard-outline-disabled"
            label="Disabled"
            defaultValue="Locked value"
            message="Disabled fields keep their message available."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            disabled
          />
        </div>

        <div style={groupStyle}>
          <h3>Standard / Underline</h3>
          <TextFieldStandardUnderline
            id="standard-underline-name"
            label="Project name"
            value={standardUnderlineName}
            onValueChange={setStandardUnderlineName}
            placeholder="Odette"
            message="Minimal shell with an underline."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardUnderline
            id="standard-underline-tax-id"
            label="Tax ID"
            defaultValue="123"
            validationStatus="warning"
            message="This value looks short for the selected country."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardUnderline
            id="standard-underline-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            readOnly
          />
        </div>

        <div style={groupStyle}>
          <h3>Standard / Borderless</h3>
          <TextFieldStandardBorderless
            id="standard-borderless-name"
            label="Search"
            value={standardBorderlessName}
            onValueChange={setStandardBorderlessName}
            placeholder="Find a record"
            message="Filled shell without a visible border."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardBorderless
            id="standard-borderless-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardBorderless
            id="standard-borderless-budget"
            label="Budget"
            defaultValue="12"
            validationStatus="warning"
            message="Budget may be lower than the project minimum."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
        </div>

        <div style={groupStyle}>
          <h3>Floating / Notched</h3>
          <TextFieldFloatingNotched
            id="floating-notched-project"
            label="Project name"
            value={floatingNotchedProject}
            onValueChange={setFloatingNotchedProject}
            message="Label cuts through the outline when active."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldFloatingNotched
            id="floating-notched-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldFloatingNotched
            id="floating-notched-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            readOnly
          />
        </div>

        <div style={groupStyle}>
          <h3>Floating / Inside</h3>
          <TextFieldFloatingInside
            id="floating-inside-project"
            label="Project name"
            value={floatingInsideProject}
            onValueChange={setFloatingInsideProject}
            message="Label stays inside the shell when active."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldFloatingInside
            id="floating-inside-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldFloatingInside
            id="floating-inside-budget"
            label="Budget"
            defaultValue="12"
            validationStatus="warning"
            message="Budget may be lower than the project minimum."
            radius={borderRadius}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
        </div>
      </div>
    </section>
  );
}
