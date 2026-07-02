'use client';

import type {
  CardIntent,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SliderIntent,
  SliderValueDisplay
} from '@kiskadee/core';
import {
  Card,
  Slider,
  type SliderEdgeMarkLabelPlacementOption,
  type SliderEdgeMarksOption,
  type SliderMarkLabelPlacementOption,
  type SliderMarks,
  useCardArtifactConfig,
  useKiskadee,
  useShowcase,
  useSliderArtifactConfig
} from '@kiskadee/react-components';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
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
import { useDesignSystemSchema } from '@/hooks/use-design-system-schema';
import { SwatchRadioGroup } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import s from './Slider.module.scss';

type SliderValueMode = 'single' | 'range';
type SliderMarksMode = 'none' | 'step' | 'labeled';

const scaleOptions: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:3', label: 'Small 3' },
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium (Default)' },
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
  { value: 'highest', label: 'Highest' },
  { value: 'low', label: 'Low' },
  { value: 'lowest', label: 'Lowest' }
];

type SliderSurface =
  | 'white'
  | 'gray'
  | 'dark-gray'
  | 'black'
  | 'light-primary'
  | 'primary'
  | 'dark-primary';

type SliderSurfaceProfile = {
  label: string;
  cardIntent: CardIntent;
  cardEmphasis: ComponentEmphasis;
  sliderEmphasis: ComponentEmphasis;
};

type ResolvedSliderSurface = SliderSurfaceProfile & {
  value: SliderSurface;
  swatchColor: string;
};

const surfaceToneOrder: SliderSurface[] = [
  'white',
  'light-primary',
  'gray',
  'primary',
  'dark-gray',
  'dark-primary',
  'black'
];

const surfaceProfiles: Record<SliderSurface, SliderSurfaceProfile> = {
  white: {
    label: 'White',
    cardIntent: 'neutral',
    cardEmphasis: 'low',
    sliderEmphasis: 'medium'
  },
  gray: {
    label: 'Gray',
    cardIntent: 'neutral',
    cardEmphasis: 'medium',
    sliderEmphasis: 'medium'
  },
  'dark-gray': {
    label: 'Dark gray',
    cardIntent: 'neutral',
    cardEmphasis: 'high',
    sliderEmphasis: 'low'
  },
  black: {
    label: 'Black',
    cardIntent: 'neutral',
    cardEmphasis: 'highest',
    sliderEmphasis: 'low'
  },
  'light-primary': {
    label: 'Light primary',
    cardIntent: 'primary',
    cardEmphasis: 'medium',
    sliderEmphasis: 'medium'
  },
  primary: {
    label: 'Primary',
    cardIntent: 'primary',
    cardEmphasis: 'high',
    sliderEmphasis: 'low'
  },
  'dark-primary': {
    label: 'Dark primary',
    cardIntent: 'primary',
    cardEmphasis: 'highest',
    sliderEmphasis: 'low'
  }
};

const valueModeOptions: Array<{ value: SliderValueMode; label: string }> = [
  { value: 'single', label: 'Single value' },
  { value: 'range', label: 'Range' }
];

const valueDisplayOptions: Array<{ value: SliderValueDisplay; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'tooltip', label: 'Tooltip' },
  { value: 'summary', label: 'Summary' },
  { value: 'both', label: 'Both' }
];

const marksModeOptions: Array<{ value: SliderMarksMode; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'step', label: 'Step' },
  { value: 'labeled', label: 'Labeled' }
];

const edgeMarksOptions: Array<{ value: SliderEdgeMarksOption; label: string }> = [
  { value: 'include', label: 'Include edges' },
  { value: 'exclude', label: 'Exclude edges' }
];

const markLabelPlacementOptions: Array<{ value: SliderMarkLabelPlacementOption; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' }
];

const edgeMarkLabelPlacementOptions: Array<{
  value: SliderEdgeMarkLabelPlacementOption;
  label: string;
}> = [
  { value: 'auto', label: 'Auto' },
  { value: 'endpoints', label: 'Side' },
  { value: 'markLabels', label: 'Track labels' }
];

const intentLabels: Record<string, string> = {
  neutral: 'Neutral',
  primary: 'Primary'
};

const preferredCardShadowLevels: ElementSizeValue[] = [
  's:md:1',
  's:sm:1',
  's:lg:1',
  's:lg:2',
  's:lg:3'
];

const labeledPercentMarks = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' }
] as const;

function normalizeShadowLevelKey(key: ElementSizeValue): string {
  return key.slice(2);
}

function getSurfaceForEmphasis(emphasis: ComponentEmphasis): SliderSurface {
  return emphasis === 'low' ? 'primary' : 'white';
}

function getAmbientSurfaceEmphasis(surface: ResolvedSliderSurface): ComponentEmphasis {
  if (surface.cardIntent === 'neutral' && surface.cardEmphasis === 'low') {
    return 'medium';
  }

  return 'low';
}

function resolveSchemaColor(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return undefined;
  const ref = (value as { ref?: unknown }).ref;
  return typeof ref === 'string' ? ref : undefined;
}

function normalizeSurfaceColor(color: string): string {
  return color.trim().toLowerCase();
}

function resolveCardSurfaceColor({
  schema,
  segment,
  theme,
  intent,
  emphasis
}: {
  schema: ReturnType<typeof useDesignSystemSchema>;
  segment: string;
  theme: string;
  intent: CardIntent;
  emphasis: ComponentEmphasis;
}): string | undefined {
  return resolveSchemaColor(
    schema?.components?.card?.elements?.e1?.palettes?.[segment]?.[theme]?.boxColor?.[intent]?.[
      emphasis
    ]?.rest
  );
}

function resolveInteractiveMarks(marksMode: SliderMarksMode): SliderMarks {
  if (marksMode === 'step') return 'step';
  if (marksMode === 'labeled') return labeledPercentMarks;
  return 'none';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value}%`;
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 15.7A8.9 8.9 0 0 1 8.3 4a7.1 7.1 0 1 0 11.7 11.7M12.5 3l.8 1.7L15 5.5l-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8zm5 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4V1h1v3zm0 19v-3h1v3zM4 13H1v-1h3zm19 0h-3v-1h3zM6.2 6.9 4.1 4.8l.7-.7 2.1 2.1zm13.4 13.4-2.1-2.1.7-.7 2.1 2.1zM17.5 6.2l2.1-2.1.7.7-2.1 2.1zM4.8 20.3l-.7-.7 2.1-2.1.7.7zM12.5 7a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11"
      />
    </svg>
  );
}

function SadIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2.1 5.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4m5.8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4M8 16c.9-1.2 2.2-1.8 4-1.8s3.1.6 4 1.8l-1.4 1.1c-.6-.7-1.4-1.1-2.6-1.1s-2 .4-2.6 1.1z"
      />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2.1 5.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4m5.8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4M8 14.5h1.8c.5.9 1.2 1.4 2.2 1.4s1.7-.5 2.2-1.4H16c-.6 2-2 3.2-4 3.2s-3.4-1.2-4-3.2"
      />
    </svg>
  );
}

function SliderExampleCard({
  cardShadow,
  children,
  className,
  surface
}: {
  cardShadow: ElementSizeValue | undefined;
  children: ReactNode;
  className?: string;
  surface: ResolvedSliderSurface;
}) {
  return (
    <Card
      className={className ? `${s.demoCard} ${className}` : s.demoCard}
      intent={surface.cardIntent}
      emphasis={surface.cardEmphasis}
      shadow={cardShadow}
      preserveBorderWithShadow={false}
    >
      <div className={s.cardContent}>{children}</div>
    </Card>
  );
}

export default function SliderPage() {
  const { designSystem, segment, theme } = useKiskadee();
  const { cardClassesMap } = useCardArtifactConfig();
  const { options: sliderOptions } = useSliderArtifactConfig();
  const { manifest } = useShowcase();
  const designSystemSchema = useDesignSystemSchema(designSystem);
  const [scale, setScale] = useState<ElementSizeValue>('s:md:1');
  const [radius, setRadius] = useState<RadiusMode>('rounded');
  const [intent, setIntent] = useState<SliderIntent>('primary');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [surface, setSurface] = useState<SliderSurface>('white');
  const [valueMode, setValueMode] = useState<SliderValueMode>('single');
  const [valueDisplay, setValueDisplay] = useState<SliderValueDisplay>('tooltip');
  const [marksMode, setMarksMode] = useState<SliderMarksMode>('none');
  const [edgeMarks, setEdgeMarks] = useState<SliderEdgeMarksOption>('include');
  const [markLabelPlacement, setMarkLabelPlacement] =
    useState<SliderMarkLabelPlacementOption>('auto');
  const [edgeMarkLabelPlacement, setEdgeMarkLabelPlacement] =
    useState<SliderEdgeMarkLabelPlacementOption>('auto');
  const [showEndpoints, setShowEndpoints] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [interactiveValue, setInteractiveValue] = useState(55);
  const [interactiveRange, setInteractiveRange] = useState<[number, number]>([20, 75]);
  const [brightness, setBrightness] = useState(78);
  const [price, setPrice] = useState<[number, number]>([2500, 5000]);
  const [tasks, setTasks] = useState<[number, number]>([0, 43]);
  const [rating, setRating] = useState(4);
  const sliderMeta = manifest?.components?.slider;
  const cardMeta = manifest?.components?.card;
  const isSliderAvailable = Boolean(sliderMeta);
  const isCardAvailable = Boolean(cardMeta);
  const supportedScales = sliderMeta?.scale;
  const supportedIntents = sliderMeta?.state;
  const supportedStates = supportedIntents?.[intent];
  const supportedCardStates = cardMeta?.state;
  const cardShadow = useMemo(() => {
    const shadowBucket = cardClassesMap?.e1?.e?.h;
    if (!shadowBucket || typeof shadowBucket === 'string') return undefined;

    return preferredCardShadowLevels.find((level) =>
      Boolean(shadowBucket[normalizeShadowLevelKey(level)])
    );
  }, [cardClassesMap]);
  const scaleSelectOptions = useMemo(
    () => scaleOptions.filter((option) => Boolean(supportedScales?.[option.value])),
    [supportedScales]
  );
  const radiusSelectOptions = useMemo(
    () =>
      radiusOptions.map((option) => ({
        ...option,
        disabled: supportedScales ? !supportedScales[option.value] : false
      })),
    [supportedScales]
  );
  const intentSelectOptions = useMemo(
    () =>
      Object.keys(supportedIntents ?? {}).map((value) => ({
        value: value as SliderIntent,
        label: intentLabels[value] ?? value
      })),
    [supportedIntents]
  );
  const emphasisSelectOptions = useMemo(
    () => emphasisOptions.filter((option) => Boolean(supportedStates?.[option.value])),
    [supportedStates]
  );
  const surfaceOptions = useMemo<ResolvedSliderSurface[]>(() => {
    const seenSurfaceColors = new Set<string>();

    return surfaceToneOrder.flatMap((value) => {
      if (!isSliderAvailable || !isCardAvailable) return [];

      const profile = surfaceProfiles[value];
      const hasSliderEmphasis = Boolean(supportedStates?.[profile.sliderEmphasis]);
      const hasCardSurface = Boolean(
        supportedCardStates?.[profile.cardIntent]?.[profile.cardEmphasis]?.rest
      );
      if (!hasSliderEmphasis || !hasCardSurface) return [];

      const swatchColor = resolveCardSurfaceColor({
        schema: designSystemSchema,
        segment,
        theme,
        intent: profile.cardIntent,
        emphasis: profile.cardEmphasis
      });
      if (!swatchColor) return [];
      const normalizedSwatchColor = normalizeSurfaceColor(swatchColor);
      if (seenSurfaceColors.has(normalizedSwatchColor)) return [];
      seenSurfaceColors.add(normalizedSwatchColor);

      return [
        {
          value,
          ...profile,
          swatchColor
        }
      ];
    });
  }, [
    designSystemSchema,
    isCardAvailable,
    isSliderAvailable,
    segment,
    supportedCardStates,
    supportedStates,
    theme
  ]);
  const selectedSurface = useMemo(
    () => surfaceOptions.find((option) => option.value === surface),
    [surface, surfaceOptions]
  );
  const surfaceItems = useMemo(
    () =>
      surfaceOptions.map((option) => ({
        value: option.value,
        label: option.label,
        swatch: {
          color: option.swatchColor
        }
      })),
    [surfaceOptions]
  );
  const pageBackgroundColor = useMemo(() => {
    if (!selectedSurface) return undefined;

    return resolveCardSurfaceColor({
      schema: designSystemSchema,
      segment,
      theme,
      intent: 'neutral',
      emphasis: getAmbientSurfaceEmphasis(selectedSurface)
    });
  }, [designSystemSchema, segment, selectedSurface, theme]);
  const pageStyle = {
    '--slider-surface-primary': selectedSurface?.swatchColor ?? '#0064B4'
  } as CSSProperties;
  const interactiveMarks = resolveInteractiveMarks(marksMode);
  const interactiveEndpoints = showEndpoints
    ? {
        start: { label: '0' },
        end: { label: '100' }
      }
    : undefined;

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
    if (!supportedScales || supportedScales[radius]) return;
    setRadius(supportedScales.rounded ? 'rounded' : supportedScales.pill ? 'pill' : 'square');
  }, [radius, supportedScales]);

  useEffect(() => {
    if (
      !intentSelectOptions.length ||
      intentSelectOptions.some((option) => option.value === intent)
    ) {
      return;
    }

    setIntent(
      intentSelectOptions.find((option) => option.value === 'primary')?.value ??
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
    if (sliderOptions.valueDisplay === 'none') return;
    setValueDisplay(sliderOptions.valueDisplay);
  }, [sliderOptions.valueDisplay]);

  useEffect(() => {
    setEdgeMarks(sliderOptions.edgeMarks);
  }, [sliderOptions.edgeMarks]);

  useEffect(() => {
    setMarkLabelPlacement(sliderOptions.markLabelPlacement);
  }, [sliderOptions.markLabelPlacement]);

  useEffect(() => {
    setEdgeMarkLabelPlacement(sliderOptions.edgeMarkLabelPlacement);
  }, [sliderOptions.edgeMarkLabelPlacement]);

  useEffect(() => {
    if (!surfaceOptions.length) {
      return;
    }

    if (selectedSurface) {
      if (emphasis !== selectedSurface.sliderEmphasis) {
        setEmphasis(selectedSurface.sliderEmphasis);
      }
      return;
    }

    const nextSurface =
      surfaceOptions.find((option) => option.value === 'white') ?? surfaceOptions[0];
    setSurface(nextSurface.value);
    if (emphasis !== nextSurface.sliderEmphasis) {
      setEmphasis(nextSurface.sliderEmphasis);
    }
  }, [emphasis, selectedSurface, surfaceOptions]);

  useEffect(() => {
    const root = document.documentElement;
    const previousRouteBackground = root.style.getPropertyValue('--showcase-route-background');

    if (pageBackgroundColor) {
      root.style.setProperty('--showcase-route-background', pageBackgroundColor);
    } else {
      root.style.removeProperty('--showcase-route-background');
    }

    return () => {
      if (previousRouteBackground) {
        root.style.setProperty('--showcase-route-background', previousRouteBackground);
        return;
      }

      root.style.removeProperty('--showcase-route-background');
    };
  }, [pageBackgroundColor]);

  const handleSurfaceChange = (value: string) => {
    const nextSurface = value as SliderSurface;
    if (nextSurface === surface) return;

    const nextSurfaceOption = surfaceOptions.find((option) => option.value === nextSurface);
    if (!nextSurfaceOption) return;

    playWowTransition();
    setSurface(nextSurface);
    if (emphasis !== nextSurfaceOption.sliderEmphasis) {
      setEmphasis(nextSurfaceOption.sliderEmphasis);
    }
  };

  const handleEmphasisChange = (value: string) => {
    const nextEmphasis = value as ComponentEmphasis;
    if (nextEmphasis === emphasis) return;

    if (!supportedStates?.[nextEmphasis]) return;

    const preferredSurface = getSurfaceForEmphasis(nextEmphasis);
    const nextSurface =
      surfaceOptions.find((option) => option.value === preferredSurface) ??
      surfaceOptions.find((option) => option.sliderEmphasis === nextEmphasis);
    if (!nextSurface) return;

    playWowTransition();
    setEmphasis(nextEmphasis);
    if (surface !== nextSurface.value) {
      setSurface(nextSurface.value);
    }
  };

  const sliderControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Shape">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Size"
            options={scaleSelectOptions}
            value={scale}
            onValueChange={(value) => {
              const nextScale = value as ElementSizeValue;
              if (nextScale === scale) return;
              playWowTransition();
              setScale(nextScale);
            }}
            disabled={!isSliderAvailable || scaleSelectOptions.length <= 1}
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
            disabled={!isSliderAvailable}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Semantic">
        <ShowcaseGlobalSemanticControls />
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Intent"
            options={intentSelectOptions}
            value={intent}
            onValueChange={(value) => {
              const nextIntent = value as SliderIntent;
              if (nextIntent === intent) return;
              playWowTransition();
              setIntent(nextIntent);
            }}
            disabled={!isSliderAvailable || intentSelectOptions.length <= 1}
          />
          <ShowcaseSelectControl
            label="Emphasis"
            options={emphasisSelectOptions}
            value={emphasis}
            onValueChange={handleEmphasisChange}
            disabled={!isSliderAvailable || emphasisSelectOptions.length <= 1}
          />
          <ShowcaseControlField fullWidth>
            <SwatchRadioGroup
              groupLabel="Surface"
              value={surface}
              onValueChange={handleSurfaceChange}
              items={surfaceItems}
              aria-label="Slider example surface"
              className={s.surfaceControl}
            />
          </ShowcaseControlField>
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Value">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Mode"
            options={valueModeOptions}
            value={valueMode}
            onValueChange={(value) => {
              const nextValueMode = value as SliderValueMode;
              if (nextValueMode === valueMode) return;
              playWowTransition();
              setValueMode(nextValueMode);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Value display"
            options={valueDisplayOptions}
            value={valueDisplay}
            onValueChange={(value) => {
              const nextValueDisplay = value as SliderValueDisplay;
              if (nextValueDisplay === valueDisplay) return;
              playWowTransition();
              setValueDisplay(nextValueDisplay);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Marks"
            options={marksModeOptions}
            value={marksMode}
            onValueChange={(value) => {
              const nextMarksMode = value as SliderMarksMode;
              if (nextMarksMode === marksMode) return;
              playWowTransition();
              setMarksMode(nextMarksMode);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Edge marks"
            options={edgeMarksOptions}
            value={edgeMarks}
            onValueChange={(value) => {
              const nextEdgeMarks = value as SliderEdgeMarksOption;
              if (nextEdgeMarks === edgeMarks) return;
              playWowTransition();
              setEdgeMarks(nextEdgeMarks);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Mark labels"
            options={markLabelPlacementOptions}
            value={markLabelPlacement}
            onValueChange={(value) => {
              const nextMarkLabelPlacement = value as SliderMarkLabelPlacementOption;
              if (nextMarkLabelPlacement === markLabelPlacement) return;
              playWowTransition();
              setMarkLabelPlacement(nextMarkLabelPlacement);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Edge mark labels"
            options={edgeMarkLabelPlacementOptions}
            value={edgeMarkLabelPlacement}
            onValueChange={(value) => {
              const nextEdgeMarkLabelPlacement = value as SliderEdgeMarkLabelPlacementOption;
              if (nextEdgeMarkLabelPlacement === edgeMarkLabelPlacement) return;
              playWowTransition();
              setEdgeMarkLabelPlacement(nextEdgeMarkLabelPlacement);
            }}
            disabled={!isSliderAvailable}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Content">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Endpoints"
            checked={showEndpoints}
            onCheckedChange={(checked) => {
              if (checked === showEndpoints) return;
              playWowTransition();
              setShowEndpoints(checked);
            }}
            disabled={!isSliderAvailable}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="State">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Disabled"
            checked={disabled}
            onCheckedChange={(checked) => {
              setDisabled(checked);
              if (checked) setReadOnly(false);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseBooleanControl
            label="Read only"
            checked={readOnly}
            onCheckedChange={(checked) => {
              setReadOnly(checked);
              if (checked) setDisabled(false);
            }}
            disabled={!isSliderAvailable}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <main className={`${s.page} k-root`} style={pageStyle}>
      <header className={s.header}>
        <h2>Slider</h2>
        <p className={s.summary}>
          Horizontal single-value and range examples for the initial Slider contract.
        </p>
      </header>

      {!isSliderAvailable || !isCardAvailable || !selectedSurface ? (
        <div className={s.emptyState}>
          Slider/Card surfaces are not available for the selected design system: {designSystem}.
        </div>
      ) : (
        <>
          <ShowcaseRouteControls
            id="slider"
            eyebrow="Controls"
            title="Slider"
            isAvailable={isSliderAvailable && isCardAvailable}
            showGlobalControls={false}
          >
            {sliderControls}
          </ShowcaseRouteControls>

          <section className={`${s.section} ${s.previewSection}`}>
            <h3>Interactive</h3>
            <SliderExampleCard
              cardShadow={cardShadow}
              surface={selectedSurface}
              className={s.interactiveCard}
            >
              <Slider
                label={valueMode === 'range' ? 'Selected range' : 'Selected value'}
                valueMode={valueMode}
                min={0}
                max={100}
                step={5}
                value={valueMode === 'range' ? interactiveRange : interactiveValue}
                onValueChange={(nextValue) => {
                  if (Array.isArray(nextValue)) {
                    setInteractiveRange([nextValue[0], nextValue[1]]);
                    return;
                  }
                  setInteractiveValue(nextValue);
                }}
                endpoints={interactiveEndpoints}
                marks={interactiveMarks}
                edgeMarks={edgeMarks}
                markLabelPlacement={markLabelPlacement}
                edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                valueDisplay={valueDisplay}
                formatValue={formatPercent}
                scale={scale}
                radius={radius}
                intent={intent}
                emphasis={emphasis}
                disabled={disabled}
                readOnly={readOnly}
              />
            </SliderExampleCard>
          </section>

          <section className={s.section}>
            <h3>Examples</h3>
            <div className={s.demoGrid}>
              <SliderExampleCard cardShadow={cardShadow} surface={selectedSurface}>
                <Slider
                  label="Price Range"
                  required
                  valueMode="range"
                  min={1000}
                  max={10000}
                  step={500}
                  value={price}
                  onValueChange={(nextValue) => {
                    if (Array.isArray(nextValue)) setPrice([nextValue[0], nextValue[1]]);
                  }}
                  marks={[
                    { value: 1000, label: formatCurrency(1000) },
                    { value: 10000, label: formatCurrency(10000) }
                  ]}
                  edgeMarks="exclude"
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  formatValue={(value) => formatCurrency(value)}
                  valueDisplay="tooltip"
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard cardShadow={cardShadow} surface={selectedSurface}>
                <Slider
                  label="Brightness"
                  min={0}
                  max={100}
                  step={1}
                  value={brightness}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setBrightness(nextValue);
                  }}
                  endpoints={{
                    start: { icon: <MoonIcon /> },
                    end: { icon: <SunIcon /> }
                  }}
                  formatValue={(value) => (value > 85 ? 'Very Bright' : `${value}%`)}
                  valueDisplay="tooltip"
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard cardShadow={cardShadow} surface={selectedSurface}>
                <Slider
                  label="Tasks completed"
                  valueMode="range"
                  min={0}
                  max={100}
                  step={1}
                  value={tasks}
                  onValueChange={(nextValue) => {
                    if (Array.isArray(nextValue)) setTasks([nextValue[0], nextValue[1]]);
                  }}
                  endpoints={{
                    start: { label: '-' },
                    end: { label: '+' }
                  }}
                  marks={labeledPercentMarks}
                  edgeMarks={edgeMarks}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  formatValue={(value) => `${value}%`}
                  valueDisplay="summary"
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard cardShadow={cardShadow} surface={selectedSurface}>
                <Slider
                  label="Rating"
                  min={0}
                  max={10}
                  step={1}
                  value={rating}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setRating(nextValue);
                  }}
                  endpoints={{
                    start: { icon: <SadIcon />, label: '0' },
                    end: { label: '10', icon: <SmileIcon /> }
                  }}
                  marks="step"
                  edgeMarks={edgeMarks}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  helperText="How happy are you with the level of service?"
                  valueDisplay="tooltip"
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
