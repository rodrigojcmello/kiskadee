'use client';

import type { RadiusMode } from '@kiskadee/core';
import {
  TextFieldFloatingInside,
  TextFieldFloatingNotched,
  TextFieldStandard
} from '@kiskadee/react-components';
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
  const [standardName, setStandardName] = useState('');
  const [floatingNotchedProject, setFloatingNotchedProject] = useState('');
  const [floatingInsideProject, setFloatingInsideProject] = useState('');
  const [borderRadius, setBorderRadius] = useState<RadiusMode>('rounded');

  return (
    <section className="k-root">
      <h2>TextField</h2>
      <p style={{ marginTop: 0, maxWidth: 760 }}>
        Standard fields keep the label outside the input shell. Floating fields let the label
        start inside the shell and promote it when the field is focused or filled.
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
          <h3>Standard</h3>
          <TextFieldStandard
            id="standard-name"
            label="Full name"
            value={standardName}
            onValueChange={setStandardName}
            placeholder="Ada Lovelace"
            message="This is a traditional form label."
            radius={borderRadius}
          />
          <TextFieldStandard
            id="standard-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
          />
          <TextFieldStandard
            id="standard-tax-id"
            label="Tax ID"
            defaultValue="123"
            validationStatus="warning"
            message="This value looks short for the selected country."
            radius={borderRadius}
          />
          <TextFieldStandard
            id="standard-disabled"
            label="Disabled"
            defaultValue="Locked value"
            message="Disabled fields keep their message available."
            radius={borderRadius}
            disabled
          />
        </div>

        <div style={groupStyle}>
          <h3>Floating Notched</h3>
          <TextFieldFloatingNotched
            id="floating-notched-project"
            label="Project name"
            value={floatingNotchedProject}
            onValueChange={setFloatingNotchedProject}
            message="Focus or type to see the floating label."
            radius={borderRadius}
          />
          <TextFieldFloatingNotched
            id="floating-notched-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
          />
          <TextFieldFloatingNotched
            id="floating-notched-budget"
            label="Budget"
            defaultValue="12"
            validationStatus="warning"
            message="Budget may be lower than the project minimum."
            radius={borderRadius}
          />
          <TextFieldFloatingNotched
            id="floating-notched-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            readOnly
          />
        </div>

        <div style={groupStyle}>
          <h3>Floating Inside</h3>
          <TextFieldFloatingInside
            id="floating-inside-project"
            label="Project name"
            value={floatingInsideProject}
            onValueChange={setFloatingInsideProject}
            message="The label stays inside the outline when it floats."
            radius={borderRadius}
          />
          <TextFieldFloatingInside
            id="floating-inside-email"
            label="Email"
            defaultValue="ada@"
            validationStatus="error"
            message="Enter a valid email address."
            radius={borderRadius}
          />
          <TextFieldFloatingInside
            id="floating-inside-budget"
            label="Budget"
            defaultValue="12"
            validationStatus="warning"
            message="Budget may be lower than the project minimum."
            radius={borderRadius}
          />
          <TextFieldFloatingInside
            id="floating-inside-readonly"
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
