'use client';

import type { RadiusMode } from '@kiskadee/core';
import { TextFieldFloating, TextFieldStacked } from '@kiskadee/react-components';
import { useState } from 'react';
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

export default function TextFieldPage() {
  const [stackedName, setStackedName] = useState('');
  const [floatingProject, setFloatingProject] = useState('');
  const [borderRadius, setBorderRadius] = useState<RadiusMode>('rounded');

  return (
    <section className="k-root">
      <h2>TextField</h2>
      <p style={{ marginTop: 0, maxWidth: 760 }}>
        Traditional stacked fields keep the label outside the input shell. Floating fields let the
        label start inside the shell and promote it when the field is focused or filled.
      </p>

      <div style={controlsStyle}>
        <Select
          label="Border Radius"
          width={200}
          options={radiusOptions}
          value={borderRadius}
          onValueChange={(value) => setBorderRadius(value as RadiusMode)}
        />
      </div>

      <div style={sectionStyle}>
        <div style={groupStyle}>
          <h3>Stacked</h3>
          <TextFieldStacked
            id="stacked-name"
            label="Full name"
            value={stackedName}
            onValueChange={setStackedName}
            placeholder="Ada Lovelace"
            message="This is a traditional form label."
            radius={borderRadius}
          />
          <TextFieldStacked
            id="stacked-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
          />
          <TextFieldStacked
            id="stacked-tax-id"
            label="Tax ID"
            defaultValue="123"
            validationStatus="warning"
            message="This value looks short for the selected country."
            radius={borderRadius}
          />
          <TextFieldStacked
            id="stacked-disabled"
            label="Disabled"
            defaultValue="Locked value"
            message="Disabled fields keep their message available."
            radius={borderRadius}
            disabled
          />
        </div>

        <div style={groupStyle}>
          <h3>Floating</h3>
          <TextFieldFloating
            id="floating-project"
            label="Project name"
            value={floatingProject}
            onValueChange={setFloatingProject}
            message="Focus or type to see the floating label."
            radius={borderRadius}
          />
          <TextFieldFloating
            id="floating-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
          />
          <TextFieldFloating
            id="floating-budget"
            label="Budget"
            defaultValue="12"
            validationStatus="warning"
            message="Budget may be lower than the project minimum."
            radius={borderRadius}
          />
          <TextFieldFloating
            id="floating-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            readOnly
          />
        </div>
      </div>
    </section>
  );
}
