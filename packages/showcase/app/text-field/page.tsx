'use client';

import type {
  ComponentEmphasis,
  RadiusMode,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetStrategy,
  TextFieldLabelPlacement
} from '@kiskadee/core';
import { componentEmphasisBuckets, componentScaleToSize } from '@kiskadee/core';
import { Button as KButton } from '@kiskadee/react-components/button';
import { useKiskadee } from '@kiskadee/react-components/resources';
import { Switch } from '@kiskadee/react-components/switch';
import { Text } from '@kiskadee/react-components/text';
import {
  TextFieldFloatingInside,
  TextFieldFloatingNotched,
  TextFieldStandardBorderless,
  TextFieldStandardOutline,
  TextFieldStandardUnderline,
  useTextFieldArtifactConfig
} from '@kiskadee/react-components/text-field';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
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
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import { SwatchRadioGroup } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import { TextFieldAutocompleteExample } from './components/TextFieldAutocompleteExample';
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

const fieldScenarios = [
  {
    id: 'neutral',
    title: 'Neutral · Intent',
    description: 'Ordinary input. Hover, click or use Tab to explore interaction states.',
    label: 'Project name',
    value: '',
    placeholder: 'Odette',
    intent: 'neutral',
    message: 'Choose a name for your project.'
  },
  {
    id: 'error',
    title: 'Error · Intent',
    description: 'An invalid value that needs correction.',
    label: 'Email',
    value: 'ada@',
    placeholder: '',
    intent: 'error',
    message: 'Enter a valid email address.'
  },
  {
    id: 'warning',
    title: 'Warning · Intent',
    description: 'A value that deserves attention before continuing.',
    label: 'Budget',
    value: '12',
    placeholder: '',
    intent: 'warning',
    message: 'This budget is below the recommended amount. Please review it.'
  },
  {
    id: 'disabled',
    title: 'Disabled · State · Neutral intent',
    description:
      'Unavailable for interaction. Terminal states use the neutral appearance for every intent.',
    label: 'Project name',
    value: 'Odette',
    placeholder: '',
    intent: 'neutral',
    message: 'Project editing is currently unavailable.'
  },
  {
    id: 'readonly',
    title: 'Read-only · Condition · Neutral intent',
    description: 'Cannot be edited, but can receive focus for selection and copying.',
    label: 'Project reference',
    value: 'PRJ-0012',
    placeholder: '',
    intent: 'neutral',
    message: 'This reference is generated automatically.'
  }
] as const;

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
  'very-dark-primary',
  'black'
];

const surfaceLabels: Record<TextFieldSurface, string> = {
  default: 'Default',
  gray: 'Gray',
  'light-primary': 'Light primary',
  primary: 'Primary',
  'dark-gray': 'Dark gray',
  'dark-primary': 'Dark primary',
  'very-dark-primary': 'Very dark primary',
  black: 'Black'
};

const darkSurfaceValues: TextFieldSurface[] = [
  'primary',
  'dark-gray',
  'dark-primary',
  'very-dark-primary',
  'black'
];

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
  const textProfiles = useShowcaseTextProfiles();
  const Surface = surface === 'default' ? ShowcaseExampleCard : 'section';
  return (
    <Surface className={getSurfaceClassName(s.exampleBlock, surface)}>
      <Text as="h4" profile={textProfiles.groupTitle}>
        {title}
      </Text>
      <div className={s.fieldStack}>{children}</div>
    </Surface>
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
  const textProfiles = useShowcaseTextProfiles();
  const { manifest } = useShowcaseMetadata(['button', 'textField']);
  const [showSizeButtons, setShowSizeButtons] = useState(true);
  const [sizeModeSelection, setSizeModeSelection] = useState<{
    preset: string;
    mode: TextFieldVariantMode;
  }>();
  const defaultSizeMode =
    `${textFieldArtifactOptions.variant ?? 'standard'}-${textFieldArtifactOptions.mode ?? 'outline'}` as TextFieldVariantMode;
  const sizeMode =
    sizeModeSelection?.preset === designSystem ? sizeModeSelection.mode : defaultSizeMode;
  const SizeField = {
    'standard-outline': TextFieldStandardOutline,
    'standard-underline': TextFieldStandardUnderline,
    'standard-borderless': TextFieldStandardBorderless,
    'floating-notched': TextFieldFloatingNotched,
    'floating-inside': TextFieldFloatingInside
  }[sizeMode];
  const fluentFloating = designSystem === 'fluent-2-microsoft' && sizeMode.startsWith('floating-');
  const comparisonSizes = (
    [
      { scale: 's:sm:1', label: 'Small', buttonScale: 's:sm:1', buttonLabel: 'Small' },
      {
        scale: 's:md:1',
        label: 'Medium',
        buttonScale: fluentFloating ? 's:lg:1' : 's:md:1',
        buttonLabel: fluentFloating ? 'Large' : 'Medium'
      },
      {
        scale: 's:lg:1',
        label: 'Large',
        buttonScale: fluentFloating ? 's:lg:2' : 's:lg:1',
        buttonLabel: fluentFloating ? 'Large 2' : 'Large'
      }
    ] as const
  ).filter(
    ({ scale }) =>
      !(fluentFloating && scale === 's:sm:1') && manifest?.components?.textField?.scale?.[scale]
  );
  const [standardInline, setStandardInline] = useState(false);
  const standardLabelPlacement: TextFieldLabelPlacement = standardInline ? 'inline' : 'top';
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
  const InteractiveSurface = surface === 'default' ? ShowcaseExampleCard : 'div';
  const interactivePanelClassName = getSurfaceClassName(s.interactivePanel, surface);
  const getStaticStandardLabelOffset = (placement: TextFieldLabelPlacement) =>
    placement === 'inline' ? undefined : labelOffset;
  const renderModeExamples = (mode: TextFieldVariantMode) => {
    const Component =
      mode === 'standard-outline'
        ? TextFieldStandardOutline
        : mode === 'standard-underline'
          ? TextFieldStandardUnderline
          : mode === 'standard-borderless'
            ? TextFieldStandardBorderless
            : mode === 'floating-notched'
              ? TextFieldFloatingNotched
              : TextFieldFloatingInside;
    const standard = mode.startsWith('standard-');
    return fieldScenarios.map((scenario) => (
      <div key={scenario.id} className={s.scenario}>
        <Text as="h5" profile={textProfiles.body}>
          {scenario.title}
        </Text>
        <Text as="p" profile={textProfiles.body}>
          {scenario.description}
        </Text>
        <Component
          id={`${mode}-${scenario.id}`}
          label={scenario.label}
          defaultValue={scenario.value}
          placeholder={scenario.placeholder}
          intent={scenario.intent}
          validationStatus={scenario.intent === 'neutral' ? undefined : scenario.intent}
          disabled={scenario.id === 'disabled'}
          readOnly={scenario.id === 'readonly'}
          message={scenario.message}
          radius={borderRadius}
          emphasis={textFieldEmphasis}
          {...(standard ? { labelPlacement: standardLabelPlacement } : {})}
          labelOffset={
            standard ? getStaticStandardLabelOffset(standardLabelPlacement) : labelOffset
          }
          focusRingColorSource={focusRingColorSourceOverride}
        />
      </div>
    ));
  };
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
        <InteractiveSurface className={interactivePanelClassName}>
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
        </InteractiveSurface>
      </section>

      <TextFieldAutocompleteExample />

      <section className={s.section} aria-labelledby="text-field-sizes-title">
        <div className={s.sectionHeadingRow}>
          <Text as="h3" id="text-field-sizes-title" profile={textProfiles.sectionTitle}>
            Sizes
          </Text>
          <ShowcaseExampleCard border shadow={false}>
            <div className={s.sizeControls}>
              <Switch
                id="text-field-size-buttons"
                label="Show buttons"
                emphasis="medium"
                controlState={showSizeButtons}
                onControlStateChange={setShowSizeButtons}
              />
              <ShowcaseSelectControl
                label={
                  <Text as="span" profile={textProfiles.caption}>
                    Sizes mode
                  </Text>
                }
                variant="sequential"
                loop
                options={variantModeOptions}
                value={sizeMode}
                onValueChange={(mode) =>
                  setSizeModeSelection({ preset: designSystem, mode: mode as TextFieldVariantMode })
                }
              />
            </div>
          </ShowcaseExampleCard>
        </div>
        <div className={s.exampleGrid}>
          {comparisonSizes.map(({ scale, label, buttonScale, buttonLabel }) => (
            <ExampleBlock key={`${sizeMode}-${scale}`} title={label} surface={surface}>
              <div className={s.sizeComparisonRow}>
                <SizeField
                  id={`size-${scale}`}
                  label="Field"
                  placeholder="Enter text"
                  size={componentScaleToSize(scale)}
                  radius={borderRadius}
                />
                {showSizeButtons && manifest?.components?.button?.scale?.[buttonScale] ? (
                  <KButton
                    size={componentScaleToSize(buttonScale)}
                    radius={borderRadius}
                    intent="neutral"
                    emphasis="low"
                  >
                    <KButton.Label>Action</KButton.Label>
                  </KButton>
                ) : null}
              </div>
              {showSizeButtons && fluentFloating ? (
                <Text as="p" profile={textProfiles.body}>
                  Floating {label} · Button {buttonLabel}
                </Text>
              ) : null}
            </ExampleBlock>
          ))}
        </div>
      </section>

      <section className={s.section} aria-labelledby="text-field-standard-title">
        <div className={s.sectionHeadingRow}>
          <Text as="h3" id="text-field-standard-title" profile={textProfiles.sectionTitle}>
            Standard
          </Text>
          <ShowcaseExampleCard border shadow={false}>
            <Switch
              id="text-field-standard-inline"
              label="Inline"
              emphasis="medium"
              controlState={standardInline}
              onControlStateChange={setStandardInline}
            />
          </ShowcaseExampleCard>
        </div>
        <div className={s.exampleGrid}>
          <ExampleBlock title="Outline" surface={surface}>
            {renderModeExamples('standard-outline')}
          </ExampleBlock>
          <ExampleBlock title="Underline" surface={surface}>
            {renderModeExamples('standard-underline')}
          </ExampleBlock>
          <ExampleBlock title="Borderless" surface={surface}>
            {renderModeExamples('standard-borderless')}
          </ExampleBlock>
        </div>
      </section>

      <section className={s.section} aria-labelledby="text-field-floating-title">
        <Text as="h3" id="text-field-floating-title" profile={textProfiles.sectionTitle}>
          Floating
        </Text>
        <div className={s.exampleGrid}>
          <ExampleBlock title="Notched" surface={surface}>
            {renderModeExamples('floating-notched')}
          </ExampleBlock>

          <ExampleBlock title="Inside" surface={surface}>
            {renderModeExamples('floating-inside')}
          </ExampleBlock>
        </div>
      </section>
    </section>
  );
}
