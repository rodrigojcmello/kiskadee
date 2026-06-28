'use client';

import type {
  ComponentEmphasis,
  RadiusMode,
  TextFieldFocusRingColorSource,
  TextFieldLabelPlacement,
  TextFieldLabelOffsetStrategy
} from '@kiskadee/core';
import { componentEmphasisBuckets } from '@kiskadee/core';
import {
  Button as KButton,
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
import { Controller, useForm, useWatch } from 'react-hook-form';
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

const labelPlacementOptions: Array<{ value: TextFieldLabelPlacement; label: string }> = [
  { value: 'top', label: 'Top' },
  { value: 'inline', label: 'Inline' }
];

type TextFieldVariantMode =
  | 'standard-outline'
  | 'standard-underline'
  | 'standard-borderless'
  | 'floating-notched'
  | 'floating-inside';

const variantModeOptions: Array<{ value: TextFieldVariantMode; label: string }> = [
  { value: 'standard-outline', label: 'Standard / Outline' },
  { value: 'standard-underline', label: 'Standard / Underline' },
  { value: 'standard-borderless', label: 'Standard / Borderless' },
  { value: 'floating-notched', label: 'Floating / Notched' },
  { value: 'floating-inside', label: 'Floating / Inside' }
];

type InteractiveEmailFormValues = {
  email: string;
  emailConfirmation: string;
};

const emailValidationMessage = 'Enter a valid email address.';
const emailConfirmationValidationMessage = 'Email addresses must match.';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isValidEmail(value: string) {
  return emailPattern.test(value);
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
  const [interactiveVariantMode, setInteractiveVariantMode] =
    useState<TextFieldVariantMode>('standard-outline');
  const [interactiveSubmitState, setInteractiveSubmitState] = useState<'idle' | 'success'>('idle');
  const [borderRadius, setBorderRadius] = useState<RadiusMode>('rounded');
  const [labelOffsetSelection, setLabelOffsetSelection] = useState<LabelOffsetSelection>('auto');
  const [interactiveLabelPlacement, setInteractiveLabelPlacement] =
    useState<TextFieldLabelPlacement>('top');
  const [surface, setSurface] = useState<TextFieldSurface>('default');
  const [focusRingColorSourceOverride, setFocusRingColorSourceOverride] = useState<
    TextFieldFocusRingColorSource | undefined
  >(undefined);
  const labelOffset = labelOffsetSelection === 'auto' ? undefined : labelOffsetSelection;
  const interactiveStandardLabelOffset =
    interactiveLabelPlacement === 'inline' ? undefined : labelOffset;
  const textFieldEmphasis = getSurfaceEmphasis(surface);
  const schemaFocusRingColorSource = textFieldArtifactOptions.focusRingColorSource ?? 'global';
  const focusRingColorSourceSelection = focusRingColorSourceOverride ?? schemaFocusRingColorSource;
  const {
    control: interactiveFormControl,
    formState: { isSubmitted: isInteractiveFormSubmitted, touchedFields: interactiveTouchedFields },
    getValues: getInteractiveFormValues,
    handleSubmit: handleInteractiveFormSubmit,
    trigger: triggerInteractiveFormValidation
  } = useForm<InteractiveEmailFormValues>({
    defaultValues: {
      email: '',
      emailConfirmation: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });
  const watchedInteractiveEmail = useWatch({
    control: interactiveFormControl,
    name: 'email'
  });
  const watchedInteractiveEmailConfirmation = useWatch({
    control: interactiveFormControl,
    name: 'emailConfirmation'
  });
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
    setInteractiveSubmitState('idle');
  }, [watchedInteractiveEmail, watchedInteractiveEmailConfirmation]);

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
  const shouldValidateInteractiveConfirmation =
    isInteractiveFormSubmitted ||
    Boolean(interactiveTouchedFields.emailConfirmation) ||
    Boolean(getInteractiveFormValues('emailConfirmation'));

  const renderInteractiveTextField = ({
    autoComplete = 'email',
    id,
    label,
    message,
    onBlur,
    onValueChange,
    placeholder,
    validationStatus,
    value
  }: {
    autoComplete?: string;
    id: string;
    label: string;
    message?: ReactNode;
    onBlur: () => void;
    onValueChange: (value: string) => void;
    placeholder: string;
    validationStatus?: 'error';
    value: string;
  }) => {
    const interactiveTextFieldProps = {
      id,
      label,
      value,
      onValueChange,
      placeholder,
      message,
      validationStatus,
      radius: borderRadius,
      emphasis: textFieldEmphasis,
      focusRingColorSource: focusRingColorSourceOverride,
      reserveMessageSpace: true,
      inputProps: {
        autoComplete,
        onBlur,
        type: 'email'
      }
    };

	    return interactiveVariantMode === 'standard-outline' ? (
	      <TextFieldStandardOutline
	        {...interactiveTextFieldProps}
	        labelPlacement={interactiveLabelPlacement}
	        labelOffset={interactiveStandardLabelOffset}
	      />
	    ) : interactiveVariantMode === 'standard-underline' ? (
	      <TextFieldStandardUnderline
	        {...interactiveTextFieldProps}
	        labelPlacement={interactiveLabelPlacement}
	        labelOffset={interactiveStandardLabelOffset}
	      />
	    ) : interactiveVariantMode === 'standard-borderless' ? (
	      <TextFieldStandardBorderless
	        {...interactiveTextFieldProps}
	        labelPlacement={interactiveLabelPlacement}
	        labelOffset={interactiveStandardLabelOffset}
	      />
    ) : interactiveVariantMode === 'floating-notched' ? (
      <TextFieldFloatingNotched {...interactiveTextFieldProps} labelOffset={labelOffset} />
    ) : (
      <TextFieldFloatingInside {...interactiveTextFieldProps} labelOffset={labelOffset} />
    );
  };
  const handleInteractiveSubmit = handleInteractiveFormSubmit(
    () => {
      setInteractiveSubmitState('success');
    },
    () => {
      setInteractiveSubmitState('idle');
    }
	  );
	  const interactivePanelClassName = getSurfaceClassName(s.interactivePanel, surface);
	  const getStaticStandardLabelOffset = (placement: TextFieldLabelPlacement) =>
	    placement === 'inline' ? undefined : labelOffset;
	  const renderStandardOutlineFields = (placement: TextFieldLabelPlacement, idSuffix: string) => (
	    <>
	      <TextFieldStandardOutline
	        id={`standard-outline-name-${idSuffix}`}
	        label="Full name"
	        value={standardOutlineName}
	        onValueChange={setStandardOutlineName}
	        placeholder="Ada Lovelace"
	        message="Classic outlined field."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardOutline
	        id={`standard-outline-email-${idSuffix}`}
	        label="Email"
	        defaultValue="ada@"
	        validationStatus="error"
	        message="Enter a valid email address."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardOutline
	        id={`standard-outline-disabled-${idSuffix}`}
	        label="Disabled"
	        defaultValue="Locked value"
	        message="Disabled fields keep their message available."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	        disabled
	      />
	    </>
	  );
	  const renderStandardUnderlineFields = (placement: TextFieldLabelPlacement, idSuffix: string) => (
	    <>
	      <TextFieldStandardUnderline
	        id={`standard-underline-name-${idSuffix}`}
	        label="Project name"
	        value={standardUnderlineName}
	        onValueChange={setStandardUnderlineName}
	        placeholder="Odette"
	        message="Minimal shell with an underline."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardUnderline
	        id={`standard-underline-tax-id-${idSuffix}`}
	        label="Tax ID"
	        defaultValue="123"
	        validationStatus="warning"
	        message="This value looks short for the selected country."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardUnderline
	        id={`standard-underline-readonly-${idSuffix}`}
	        label="Read only"
	        defaultValue="Generated automatically"
	        message="Read-only fields can still be focused and copied."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	        readOnly
	      />
	    </>
	  );
	  const renderStandardBorderlessFields = (
	    placement: TextFieldLabelPlacement,
	    idSuffix: string
	  ) => (
	    <>
	      <TextFieldStandardBorderless
	        id={`standard-borderless-name-${idSuffix}`}
	        label="Search"
	        value={standardBorderlessName}
	        onValueChange={setStandardBorderlessName}
	        placeholder="Find a record"
	        message="Filled shell without a visible border."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardBorderless
	        id={`standard-borderless-email-${idSuffix}`}
	        label="Email"
	        defaultValue="ada@"
	        validationStatus="error"
	        message="Enter a valid email address."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	      <TextFieldStandardBorderless
	        id={`standard-borderless-budget-${idSuffix}`}
	        label="Budget"
	        defaultValue="12"
	        validationStatus="warning"
	        message="Budget may be lower than the project minimum."
	        radius={borderRadius}
	        emphasis={textFieldEmphasis}
	        labelPlacement={placement}
	        labelOffset={getStaticStandardLabelOffset(placement)}
	        focusRingColorSource={focusRingColorSourceOverride}
	      />
	    </>
	  );
	  const textFieldControls = (
	    <ShowcaseControlPanel>
	      <ShowcaseControlGroup title="Interactive">
	        <ShowcaseControlGrid>
          <ShowcaseControlField fullWidth>
            <ShowcaseSelectControl
              label="Variant / Mode"
              options={variantModeOptions}
              value={interactiveVariantMode}
              onValueChange={(value) => {
                const nextVariantMode = value as TextFieldVariantMode;
                if (nextVariantMode === interactiveVariantMode) return;
                playWowTransition();
                setInteractiveVariantMode(nextVariantMode);
	              }}
	            />
	          </ShowcaseControlField>
	          <ShowcaseControlField fullWidth>
	            <ShowcaseSelectControl
	              label="Label Placement"
	              options={labelPlacementOptions}
	              value={interactiveLabelPlacement}
	              onValueChange={(value) => {
	                const nextLabelPlacement = value as TextFieldLabelPlacement;
	                if (nextLabelPlacement === interactiveLabelPlacement) return;
	                playWowTransition();
	                setInteractiveLabelPlacement(nextLabelPlacement);
	              }}
	            />
	          </ShowcaseControlField>
	        </ShowcaseControlGrid>
	      </ShowcaseControlGroup>
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

      <section className={`${s.section} ${s.previewSection}`}>
        <h3>Interactive</h3>
        <div className={interactivePanelClassName}>
          <form className={s.interactiveForm} noValidate onSubmit={handleInteractiveSubmit}>
            <Controller
              control={interactiveFormControl}
              name="email"
              rules={{
                validate: (value) => isValidEmail(value) || emailValidationMessage
              }}
              render={({ field, fieldState }) =>
                renderInteractiveTextField({
                  id: 'text-field-interactive-email',
                  label: 'Email',
                  value: field.value,
                  onValueChange: field.onChange,
                  onBlur: () => {
                    field.onBlur();
                    void triggerInteractiveFormValidation('email');
                    if (!shouldValidateInteractiveConfirmation) return;
                    void triggerInteractiveFormValidation('emailConfirmation');
                  },
                  placeholder: 'ada@example.com',
                  validationStatus: fieldState.error ? 'error' : undefined,
                  message: fieldState.error?.message
                })
              }
            />
            <Controller
              control={interactiveFormControl}
              name="emailConfirmation"
              rules={{
                validate: (value) => {
                  if (!isValidEmail(value)) return emailValidationMessage;

                  return (
                    value === getInteractiveFormValues('email') ||
                    emailConfirmationValidationMessage
                  );
                }
              }}
              render={({ field, fieldState }) =>
                renderInteractiveTextField({
                  autoComplete: 'off',
                  id: 'text-field-interactive-email-confirmation',
                  label: 'Confirm email',
                  value: field.value,
                  onValueChange: field.onChange,
                  onBlur: () => {
                    field.onBlur();
                    void triggerInteractiveFormValidation('emailConfirmation');
                  },
                  placeholder: 'Type email again',
                  validationStatus: fieldState.error ? 'error' : undefined,
                  message: fieldState.error?.message
                })
              }
            />
            <div className={s.interactiveActions}>
              <KButton type="submit" intent="primary" emphasis="high" radius={borderRadius}>
                <KButton.Label>Continue</KButton.Label>
              </KButton>
            </div>
            {interactiveSubmitState === 'success' ? (
              <p className={s.interactiveSuccess} role="status">
                Email confirmed.
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <div className={s.exampleGrid}>
        <div className={s.standardExamplePair}>
          <ExampleBlock title="Standard / Outline" surface={surface}>
            {renderStandardOutlineFields('top', 'top')}
          </ExampleBlock>
          <ExampleBlock title="Standard / Outline Inline" surface={surface}>
            {renderStandardOutlineFields('inline', 'inline')}
          </ExampleBlock>
        </div>

        <div className={s.standardExamplePair}>
          <ExampleBlock title="Standard / Underline" surface={surface}>
            {renderStandardUnderlineFields('top', 'top')}
          </ExampleBlock>
          <ExampleBlock title="Standard / Underline Inline" surface={surface}>
            {renderStandardUnderlineFields('inline', 'inline')}
          </ExampleBlock>
        </div>

        <div className={s.standardExamplePair}>
          <ExampleBlock title="Standard / Borderless" surface={surface}>
            {renderStandardBorderlessFields('top', 'top')}
          </ExampleBlock>
          <ExampleBlock title="Standard / Borderless Inline" surface={surface}>
            {renderStandardBorderlessFields('inline', 'inline')}
          </ExampleBlock>
        </div>

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
