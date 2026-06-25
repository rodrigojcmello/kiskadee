'use client';

import type {
  ComponentEmphasis,
  RadiusMode,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetStrategy
} from '@kiskadee/core';
import { componentEmphasisBuckets } from '@kiskadee/core';
import {
  TextFieldFloatingInside,
  TextFieldFloatingNotched,
  TextFieldStandardBorderless,
  TextFieldStandardOutline,
  TextFieldStandardUnderline,
  useKiskadee,
  useTextFieldArtifactConfig
} from '@kiskadee/react-components';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ShowcaseControlField,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
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
import s from './TextField.module.scss';

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

type TextFieldSurface = 'default' | 'primary' | Exclude<BackgroundToneKey, 'white'>;

const surfaceToneOrder: TextFieldSurface[] = [
  'default',
  'light-primary',
  'gray',
  'primary',
  'dark-gray',
  'dark-primary',
  'black'
];

const surfaceLabels: Record<TextFieldSurface, string> = {
  default: 'Default',
  gray: 'Gray',
  'light-primary': 'Light primary',
  primary: 'Primary',
  'dark-gray': 'Dark gray',
  'dark-primary': 'Dark primary',
  black: 'Black'
};

const darkSurfaceValues: TextFieldSurface[] = ['primary', 'dark-gray', 'dark-primary', 'black'];

function isDarkSurface(surface: TextFieldSurface) {
  return darkSurfaceValues.includes(surface);
}

function getSurfaceEmphasis(surface: TextFieldSurface): ComponentEmphasis {
  return isDarkSurface(surface) ? 'low' : 'medium';
}

function getSurfaceClassName(baseClassName: string, surface: TextFieldSurface) {
  if (surface === 'default') return baseClassName;

  const surfaceClassNames = [baseClassName, s.surfaceTone];
  if (isDarkSurface(surface)) {
    surfaceClassNames.push(s.darkSurface);
  }

  return surfaceClassNames.join(' ');
}

function ExampleBlock({
  children,
  surface,
  title
}: {
  children: ReactNode;
  surface: TextFieldSurface;
  title: string;
}) {
  return (
    <section className={getSurfaceClassName(s.exampleBlock, surface)}>
      <h3>{title}</h3>
      <div className={s.fieldStack}>{children}</div>
    </section>
  );
}

function hasBucketClass(value: unknown, bucket: string): boolean {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  if (typeof record[bucket] === 'string' && record[bucket].length > 0) {
    return true;
  }

  return Object.values(record).some((item) => hasBucketClass(item, bucket));
}

function supportsTextFieldEmphasis(classesMap: unknown, emphasis: ComponentEmphasis) {
  const bucket = componentEmphasisBuckets[emphasis];
  return Boolean(bucket && hasBucketClass(classesMap, bucket));
}

export default function TextFieldPage() {
  const { designSystem } = useKiskadee();
  const { options: textFieldArtifactOptions, textFieldClassesMap } = useTextFieldArtifactConfig();
  const backgroundTones = useBackgroundTones();
  const primarySurface = usePrimarySurfaceTone();
  const [standardOutlineName, setStandardOutlineName] = useState('');
  const [standardUnderlineName, setStandardUnderlineName] = useState('');
  const [standardBorderlessName, setStandardBorderlessName] = useState('');
  const [floatingNotchedProject, setFloatingNotchedProject] = useState('');
  const [floatingInsideProject, setFloatingInsideProject] = useState('');
  const [borderRadius, setBorderRadius] = useState<RadiusMode>('rounded');
  const [labelOffsetSelection, setLabelOffsetSelection] = useState<LabelOffsetSelection>('auto');
  const [surface, setSurface] = useState<TextFieldSurface>('default');
  const [focusRingColorSourceOverride, setFocusRingColorSourceOverride] = useState<
    TextFieldFocusRingColorSource | undefined
  >(undefined);
  const labelOffset = labelOffsetSelection === 'auto' ? undefined : labelOffsetSelection;
  const textFieldEmphasis = getSurfaceEmphasis(surface);
  const schemaFocusRingColorSource = textFieldArtifactOptions.focusRingColorSource ?? 'global';
  const focusRingColorSourceSelection = focusRingColorSourceOverride ?? schemaFocusRingColorSource;
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
          option.value === schemaFocusRingColorSource ? `${option.label} (default)` : option.label
      })),
    [schemaFocusRingColorSource]
  );
  const backgroundToneByKey = useMemo(
    () =>
      new Map<BackgroundToneKey, ResolvedBackgroundTone>(
        backgroundTones.tones.map((tone) => [tone.key, tone])
      ),
    [backgroundTones.tones]
  );
  const supportsDarkSurfaces = useMemo(
    () => supportsTextFieldEmphasis(textFieldClassesMap, 'low'),
    [textFieldClassesMap]
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
    '--text-field-surface-primary': primarySurface.color,
    '--text-field-card-surface': selectedSurfaceColor ?? '#ffffff'
  } as CSSProperties;
  const surfaceItems = useMemo(
    () =>
      surfaceToneOrder.flatMap((value) => {
        if (isDarkSurface(value) && !supportsDarkSurfaces) {
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
    [backgroundToneByKey, primarySurface.color, supportsDarkSurfaces]
  );

  useEffect(() => {
    setFocusRingColorSourceOverride(undefined);
  }, [designSystem]);

  useEffect(() => {
    if (!isDarkSurface(surface) || supportsDarkSurfaces) return;
    setSurface('default');
  }, [supportsDarkSurfaces, surface]);

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
    const nextSurface = value as TextFieldSurface;
    if (nextSurface === surface) return;

    playWowTransition();
    setSurface(nextSurface);
  };

  const textFieldControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Appearance">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Border Radius"
            options={radiusOptions}
            value={borderRadius}
            onValueChange={(value) => {
              const nextRadius = value as RadiusMode;
              if (nextRadius === borderRadius) return;
              playWowTransition();
              setBorderRadius(nextRadius);
            }}
          />
          <ShowcaseSelectControl
            label="Label Offset"
            options={labelOffsetOptions}
            value={labelOffsetSelection}
            onValueChange={(value) => {
              const nextLabelOffset = value as LabelOffsetSelection;
              if (nextLabelOffset === labelOffsetSelection) return;
              playWowTransition();
              setLabelOffsetSelection(nextLabelOffset);
            }}
          />
          <ShowcaseSelectControl
            label="Focus Ring Color"
            options={focusRingColorSourceOptions}
            value={focusRingColorSourceSelection}
            onValueChange={(value) => {
              const next = value as TextFieldFocusRingColorSource;
              if (next === focusRingColorSourceSelection) return;
              playWowTransition();
              setFocusRingColorSourceOverride(
                next === schemaFocusRingColorSource ? undefined : next
              );
            }}
          />
          <ShowcaseControlField fullWidth>
            <SwatchRadioGroup
              groupLabel="Surface"
              value={surface}
              onValueChange={handleSurfaceChange}
              items={surfaceItems}
              aria-label="TextField example surface"
              className={s.surfaceControl}
            />
          </ShowcaseControlField>
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <section className={`${s.page} k-root`} style={pageStyle}>
      <header className={s.header}>
        <h2>TextField</h2>
        <p className={s.summary}>
          TextField now exposes two variants with named modes. Standard covers outline, underline,
          and borderless shells. Floating covers notched and inside label behavior.
        </p>
      </header>

      <ShowcaseRouteControls id="text-field" eyebrow="TextField" title="Controls">
        {textFieldControls}
      </ShowcaseRouteControls>

      <div className={s.exampleGrid}>
        <ExampleBlock title="Standard / Outline" surface={surface}>
          <TextFieldStandardOutline
            id="standard-outline-name"
            label="Full name"
            value={standardOutlineName}
            onValueChange={setStandardOutlineName}
            placeholder="Ada Lovelace"
            message="Classic outlined field."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardOutline
            id="standard-outline-disabled"
            label="Disabled"
            defaultValue="Locked value"
            message="Disabled fields keep their message available."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            disabled
          />
        </ExampleBlock>

        <ExampleBlock title="Standard / Underline" surface={surface}>
          <TextFieldStandardUnderline
            id="standard-underline-name"
            label="Project name"
            value={standardUnderlineName}
            onValueChange={setStandardUnderlineName}
            placeholder="Odette"
            message="Minimal shell with an underline."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldStandardUnderline
            id="standard-underline-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            readOnly
          />
        </ExampleBlock>

        <ExampleBlock title="Standard / Borderless" surface={surface}>
          <TextFieldStandardBorderless
            id="standard-borderless-name"
            label="Search"
            value={standardBorderlessName}
            onValueChange={setStandardBorderlessName}
            placeholder="Find a record"
            message="Filled shell without a visible border."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
        </ExampleBlock>

        <ExampleBlock title="Floating / Notched" surface={surface}>
          <TextFieldFloatingNotched
            id="floating-notched-project"
            label="Project name"
            value={floatingNotchedProject}
            onValueChange={setFloatingNotchedProject}
            message="Label cuts through the outline when active."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
          <TextFieldFloatingNotched
            id="floating-notched-readonly"
            label="Read only"
            defaultValue="Generated automatically"
            message="Read-only fields can still be focused and copied."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
            readOnly
          />
        </ExampleBlock>

        <ExampleBlock title="Floating / Inside" surface={surface}>
          <TextFieldFloatingInside
            id="floating-inside-project"
            label="Project name"
            value={floatingInsideProject}
            onValueChange={setFloatingInsideProject}
            message="Label stays inside the shell when active."
            radius={borderRadius}
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
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
            emphasis={textFieldEmphasis}
            labelOffset={labelOffset}
            focusRingColorSource={focusRingColorSourceOverride}
          />
        </ExampleBlock>
      </div>
    </section>
  );
}
