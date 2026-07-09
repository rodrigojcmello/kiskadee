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
  type SliderActivationFeedback,
  type SliderActiveTrackOriginOption,
  type SliderEdgeMarkLabelAlignmentOption,
  type SliderEdgeMarkLabelPlacementOption,
  type SliderEdgeMarksOption,
  type SliderMarkLabelPlacementOption,
  type SliderMarkPlacementOption,
  type SliderMarks,
  type SliderOriginMarkOption,
  type SliderSnapMotionOption,
  type SliderThumbBehaviorOption,
  type SliderThumbCrossingOption,
  type SliderThumbEdgeBehaviorOption,
  type SliderValueAnimationOption,
  type SliderValueSummaryPlacementOption,
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
type SliderActivationFeedbackControl = 'default' | 'off' | 'active';
type SliderValueAnimationControl = 'default' | SliderValueAnimationOption;
type SliderValueSummaryPlacementControl = 'default' | SliderValueSummaryPlacementOption;
type SliderSnapMotionControl = 'default' | SliderSnapMotionOption;
type SliderThumbBehaviorControl = 'default' | SliderThumbBehaviorOption;
type SliderThumbCrossingControl = 'default' | SliderThumbCrossingOption;
type SliderMarkStepControl = 'default' | '1' | '5' | '10' | '25' | '50';
type SliderActiveTrackOriginControl = 'min' | 'center' | '25' | '50' | '75';

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
  { value: 'both', label: 'Both' },
  { value: 'auto', label: 'Auto' }
];

const valueAnimationOptions: Array<{ value: SliderValueAnimationControl; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'none', label: 'None' },
  { value: 'rolling', label: 'Rolling' }
];

const valueSummaryPlacementOptions: Array<{
  value: SliderValueSummaryPlacementControl;
  label: string;
}> = [
  { value: 'default', label: 'Default' },
  { value: 'headerEnd', label: 'Header end' },
  { value: 'controlEnd', label: 'Control end' }
];

const snapMotionOptions: Array<{ value: SliderSnapMotionControl; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'none', label: 'None' },
  { value: 'smooth', label: 'Smooth' }
];

const thumbBehaviorOptions: Array<{ value: SliderThumbBehaviorControl; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'snap', label: 'Snap' },
  { value: 'hold', label: 'Hold' },
  { value: 'stops', label: 'Stops' }
];

const thumbCrossingOptions: Array<{ value: SliderThumbCrossingControl; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'prevent', label: 'Prevent' },
  { value: 'swap', label: 'Swap' }
];

const marksModeOptions: Array<{ value: SliderMarksMode; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'step', label: 'Step' },
  { value: 'labeled', label: 'Labeled' }
];

const markStepOptions: Array<{ value: SliderMarkStepControl; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: '1', label: '1' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' }
];

const edgeMarksOptions: Array<{ value: SliderEdgeMarksOption; label: string }> = [
  { value: 'include', label: 'Include edges' },
  { value: 'exclude', label: 'Exclude edges' }
];

const markPlacementOptions: Array<{ value: SliderMarkPlacementOption; label: string }> = [
  { value: 'track', label: 'Track' },
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' }
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
  { value: 'markLabels', label: 'Mark labels' },
  { value: 'endpoints', label: 'Side' },
  { value: 'adaptive', label: 'Adaptive' }
];

const edgeMarkLabelAlignmentOptions: Array<{
  value: SliderEdgeMarkLabelAlignmentOption;
  label: string;
}> = [
  { value: 'inside', label: 'Inside' },
  { value: 'center', label: 'Center' },
  { value: 'adaptive', label: 'Adaptive' }
];

const thumbEdgeBehaviorOptions: Array<{ value: SliderThumbEdgeBehaviorOption; label: string }> = [
  { value: 'overflow', label: 'Overflow' },
  { value: 'contain', label: 'Contain' }
];

const activeTrackOriginOptions: Array<{ value: SliderActiveTrackOriginControl; label: string }> = [
  { value: 'min', label: 'Min' },
  { value: 'center', label: 'Center' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '75', label: '75' }
];

const originMarkOptions: Array<{ value: SliderOriginMarkOption; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'auto', label: 'Auto' }
];

const activationFeedbackOptions: Array<{
  value: SliderActivationFeedbackControl;
  label: string;
}> = [
  { value: 'default', label: 'Default' },
  { value: 'off', label: 'Off' },
  { value: 'active', label: 'Active' }
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

const ratingMarks = [
  { value: 0, label: '0', icon: <SadIcon /> },
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
  { value: 7 },
  { value: 8 },
  { value: 9 },
  { value: 10, label: '10', icon: <SmileIcon /> }
] as const;

function renderVolumeIcon(value: number) {
  if (value <= 0) return <VolumeOffIcon />;
  if (value < 50) return <VolumeLowIcon />;
  return <VolumeHighIcon />;
}

function renderThumbVolumeIcon(value: number) {
  if (value <= 0) return <VolumeOffIcon />;
  if (value < 16) return <VolumeMinimumIcon />;
  if (value < 67) return <VolumeLowIcon />;
  return <VolumeHighIcon />;
}

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

function resolveActivationFeedbackProp(
  activationFeedback: SliderActivationFeedbackControl
): SliderActivationFeedback | undefined {
  if (activationFeedback === 'off') return false;
  if (activationFeedback === 'active') return 'active';
  return undefined;
}

function resolveValueAnimationProp(
  valueAnimation: SliderValueAnimationControl
): SliderValueAnimationOption | undefined {
  return valueAnimation === 'default' ? undefined : valueAnimation;
}

function resolveValueSummaryPlacementProp(
  valueSummaryPlacement: SliderValueSummaryPlacementControl
): SliderValueSummaryPlacementOption | undefined {
  return valueSummaryPlacement === 'default' ? undefined : valueSummaryPlacement;
}

function resolveSnapMotionProp(
  snapMotion: SliderSnapMotionControl
): SliderSnapMotionOption | undefined {
  return snapMotion === 'default' ? undefined : snapMotion;
}

function resolveThumbBehaviorProp(
  thumbBehavior: SliderThumbBehaviorControl
): SliderThumbBehaviorOption | undefined {
  return thumbBehavior === 'default' ? undefined : thumbBehavior;
}

function resolveThumbCrossingProp(
  thumbCrossing: SliderThumbCrossingControl
): SliderThumbCrossingOption | undefined {
  return thumbCrossing === 'default' ? undefined : thumbCrossing;
}

function resolveMarkStepProp(markStep: SliderMarkStepControl): number | undefined {
  return markStep === 'default' ? undefined : Number(markStep);
}

function toMarkStepControl(markStep: number | undefined): SliderMarkStepControl {
  if (markStep === 1 || markStep === 5 || markStep === 10 || markStep === 25 || markStep === 50) {
    return String(markStep) as SliderMarkStepControl;
  }
  return 'default';
}

function toActiveTrackOriginControl(
  activeTrackOrigin: SliderActiveTrackOriginOption
): SliderActiveTrackOriginControl {
  if (activeTrackOrigin === 'center' || activeTrackOrigin === 'min') return activeTrackOrigin;
  if (activeTrackOrigin === 25 || activeTrackOrigin === 50 || activeTrackOrigin === 75) {
    return String(activeTrackOrigin) as SliderActiveTrackOriginControl;
  }
  return 'min';
}

function resolveActiveTrackOriginProp(
  activeTrackOrigin: SliderActiveTrackOriginControl
): SliderActiveTrackOriginOption {
  if (activeTrackOrigin === 'min' || activeTrackOrigin === 'center') return activeTrackOrigin;
  return Number(activeTrackOrigin);
}

function formatSquareMeters(value: number): string {
  return `${value} m²`;
}

function formatPercent(value: number): string {
  return `${value}%`;
}

function formatSignedPercent(value: number): string {
  if (value > 0) return `+${value}%`;
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

function VolumeHighIcon() {
  return (
    <svg viewBox="0 0 7 7" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.887.896v.572a1.945 1.945 0 0 1 1.389 1.864c0 .88-.586 1.621-1.389 1.86v.575a2.5 2.5 0 0 0 1.944-2.435A2.5 2.5 0 0 0 3.887.896m.695 2.436c0-.492-.278-.914-.695-1.12v2.23c.417-.197.695-.622.695-1.11M.833 2.499v1.666h1.111l1.388 1.388V1.11L1.944 2.499z"
      />
    </svg>
  );
}

function VolumeLowIcon() {
  return (
    <svg viewBox="0 0 7 7" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M1.388 2.499v1.666h1.111l1.388 1.388V1.11L2.499 2.499zm3.749.833c0-.492-.278-.914-.694-1.12v2.23c.416-.197.694-.622.694-1.11"
      />
    </svg>
  );
}

function VolumeMinimumIcon() {
  return (
    <svg viewBox="0 0 6.664 6.664" focusable="false" aria-hidden="true">
      <path fill="currentColor" d="M1.944 2.498v1.666h1.11l1.389 1.389V1.11L3.054 2.498z" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg viewBox="0 0 7 7" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M.833 2.499h1.111L3.332 1.11v4.443L1.944 4.165H.833zm3.774.833-.72-.72.392-.391.719.719.719-.719.392.391-.72.72.72.719-.392.391-.719-.719-.719.719-.392-.391z"
      />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 6.664 6.664" focusable="false" aria-hidden="true">
      <path
        fill="currentColor"
        d="M1.944 1.388h.555v.555h-.555zm1.11 0h.556v.555h-.555zm1.111 0h.555v.555h-.555zM1.944 2.499h.555v.555h-.555zm1.11 0h.556v.555h-.555zm1.111 0h.555v.555h-.555zM1.944 3.61h.555v.555h-.555zm1.11 0h.556v.555h-.555zm1.111 0h.555v.555h-.555zM1.944 4.72h.555v.556h-.555zm1.11 0h.556v.556h-.555zm1.111 0h.555v.556h-.555z"
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
  surface,
  title
}: {
  cardShadow: ElementSizeValue | undefined;
  children: ReactNode;
  className?: string;
  surface: ResolvedSliderSurface;
  title?: string;
}) {
  return (
    <Card
      className={className ? `${s.demoCard} ${className}` : s.demoCard}
      intent={surface.cardIntent}
      emphasis={surface.cardEmphasis}
      shadow={cardShadow}
      preserveBorderWithShadow={false}
    >
      {title ? <h4 className={s.cardTitle}>{title}</h4> : null}
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
  const [intent, setIntent] = useState<SliderIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const [surface, setSurface] = useState<SliderSurface>('white');
  const [valueMode, setValueMode] = useState<SliderValueMode>('single');
  const [valueDisplay, setValueDisplay] = useState<SliderValueDisplay>('tooltip');
  const [valueAnimation, setValueAnimation] = useState<SliderValueAnimationControl>('rolling');
  const [valueSummaryPlacement, setValueSummaryPlacement] =
    useState<SliderValueSummaryPlacementControl>('default');
  const [snapMotion, setSnapMotion] = useState<SliderSnapMotionControl>('smooth');
  const [thumbBehavior, setThumbBehavior] = useState<SliderThumbBehaviorControl>('snap');
  const [thumbCrossing, setThumbCrossing] = useState<SliderThumbCrossingControl>('swap');
  const [marksMode, setMarksMode] = useState<SliderMarksMode>('none');
  const [markStep, setMarkStep] = useState<SliderMarkStepControl>('default');
  const [edgeMarks, setEdgeMarks] = useState<SliderEdgeMarksOption>('include');
  const [markPlacement, setMarkPlacement] = useState<SliderMarkPlacementOption>('track');
  const [markLabelPlacement, setMarkLabelPlacement] =
    useState<SliderMarkLabelPlacementOption>('auto');
  const [edgeMarkLabelPlacement, setEdgeMarkLabelPlacement] =
    useState<SliderEdgeMarkLabelPlacementOption>('markLabels');
  const [edgeMarkLabelAlignment, setEdgeMarkLabelAlignment] =
    useState<SliderEdgeMarkLabelAlignmentOption>('inside');
  const [thumbEdgeBehavior, setThumbEdgeBehavior] =
    useState<SliderThumbEdgeBehaviorOption>('overflow');
  const [activeTrackOrigin, setActiveTrackOrigin] = useState<SliderActiveTrackOriginControl>('min');
  const [originMark, setOriginMark] = useState<SliderOriginMarkOption>('none');
  const [activationFeedback, setActivationFeedback] =
    useState<SliderActivationFeedbackControl>('default');
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [interactiveValue, setInteractiveValue] = useState(55);
  const [interactiveRange, setInteractiveRange] = useState<[number, number]>([20, 75]);
  const [volume, setVolume] = useState(25);
  const [volumePreview, setVolumePreview] = useState<number | null>(null);
  const [thumbIconVolume, setThumbIconVolume] = useState(75);
  const [brightness, setBrightness] = useState(78);
  const [area, setArea] = useState<[number, number]>([60, 160]);
  const [tasks, setTasks] = useState<[number, number]>([0, 43]);
  const [rating, setRating] = useState(4);
  const [centerBiased, setCenterBiased] = useState(40);
  const sliderMeta = manifest?.components?.slider;
  const cardMeta = manifest?.components?.card;
  const isSliderAvailable = Boolean(sliderMeta);
  const isCardAvailable = Boolean(cardMeta);
  const defaultRadius = sliderOptions.radius;
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
        label: option.value === defaultRadius ? `${option.label} (default)` : option.label,
        disabled: supportedScales ? !supportedScales[option.value] : false
      })),
    [defaultRadius, supportedScales]
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
  const activationFeedbackProp = resolveActivationFeedbackProp(activationFeedback);
  const valueAnimationProp = resolveValueAnimationProp(valueAnimation);
  const valueSummaryPlacementProp = resolveValueSummaryPlacementProp(valueSummaryPlacement);
  const interactiveValueSummaryWidth = valueMode === 'range' ? 96 : 44;
  const snapMotionProp = resolveSnapMotionProp(snapMotion);
  const thumbBehaviorProp = resolveThumbBehaviorProp(thumbBehavior);
  const thumbCrossingProp = resolveThumbCrossingProp(thumbCrossing);
  const markStepProp = resolveMarkStepProp(markStep);
  const activeTrackOriginProp = resolveActiveTrackOriginProp(activeTrackOrigin);
  const visibleVolume = volumePreview ?? volume;

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
      intentSelectOptions.find((option) => option.value === 'neutral')?.value ??
        intentSelectOptions.find((option) => option.value === 'primary')?.value ??
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
    setThumbBehavior(sliderOptions.thumbBehavior);
  }, [sliderOptions.thumbBehavior]);

  useEffect(() => {
    setMarkStep(toMarkStepControl(sliderOptions.markStep));
  }, [sliderOptions.markStep]);

  useEffect(() => {
    setMarkPlacement(sliderOptions.markPlacement);
  }, [sliderOptions.markPlacement]);

  useEffect(() => {
    setMarkLabelPlacement(sliderOptions.markLabelPlacement);
  }, [sliderOptions.markLabelPlacement]);

  useEffect(() => {
    setEdgeMarkLabelPlacement(sliderOptions.edgeMarkLabelPlacement);
  }, [sliderOptions.edgeMarkLabelPlacement]);

  useEffect(() => {
    setEdgeMarkLabelAlignment(sliderOptions.edgeMarkLabelAlignment);
  }, [sliderOptions.edgeMarkLabelAlignment]);

  useEffect(() => {
    setThumbEdgeBehavior(sliderOptions.thumbEdgeBehavior);
  }, [sliderOptions.thumbEdgeBehavior]);

  useEffect(() => {
    setActiveTrackOrigin(toActiveTrackOriginControl(sliderOptions.activeTrackOrigin));
  }, [sliderOptions.activeTrackOrigin]);

  useEffect(() => {
    setOriginMark(sliderOptions.originMark);
  }, [sliderOptions.originMark]);

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
            label="Value summary placement"
            options={valueSummaryPlacementOptions}
            value={valueSummaryPlacement}
            onValueChange={(value) => {
              const nextValueSummaryPlacement = value as SliderValueSummaryPlacementControl;
              if (nextValueSummaryPlacement === valueSummaryPlacement) return;
              playWowTransition();
              setValueSummaryPlacement(nextValueSummaryPlacement);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Value animation"
            options={valueAnimationOptions}
            value={valueAnimation}
            onValueChange={(value) => {
              const nextValueAnimation = value as SliderValueAnimationControl;
              if (nextValueAnimation === valueAnimation) return;
              playWowTransition();
              setValueAnimation(nextValueAnimation);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Snap motion"
            options={snapMotionOptions}
            value={snapMotion}
            onValueChange={(value) => {
              const nextSnapMotion = value as SliderSnapMotionControl;
              if (nextSnapMotion === snapMotion) return;
              playWowTransition();
              setSnapMotion(nextSnapMotion);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Thumb behavior"
            options={thumbBehaviorOptions}
            value={thumbBehavior}
            onValueChange={(value) => {
              const nextThumbBehavior = value as SliderThumbBehaviorControl;
              if (nextThumbBehavior === thumbBehavior) return;
              playWowTransition();
              setThumbBehavior(nextThumbBehavior);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Thumb crossing"
            options={thumbCrossingOptions}
            value={thumbCrossing}
            onValueChange={(value) => {
              const nextThumbCrossing = value as SliderThumbCrossingControl;
              if (nextThumbCrossing === thumbCrossing) return;
              playWowTransition();
              setThumbCrossing(nextThumbCrossing);
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
            label="Mark step"
            options={markStepOptions}
            value={markStep}
            onValueChange={(value) => {
              const nextMarkStep = value as SliderMarkStepControl;
              if (nextMarkStep === markStep) return;
              playWowTransition();
              setMarkStep(nextMarkStep);
            }}
            disabled={!isSliderAvailable || marksMode !== 'step'}
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
            label="Mark placement"
            options={markPlacementOptions}
            value={markPlacement}
            onValueChange={(value) => {
              const nextMarkPlacement = value as SliderMarkPlacementOption;
              if (nextMarkPlacement === markPlacement) return;
              playWowTransition();
              setMarkPlacement(nextMarkPlacement);
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
          <ShowcaseSelectControl
            label="Edge label alignment"
            options={edgeMarkLabelAlignmentOptions}
            value={edgeMarkLabelAlignment}
            onValueChange={(value) => {
              const nextEdgeMarkLabelAlignment = value as SliderEdgeMarkLabelAlignmentOption;
              if (nextEdgeMarkLabelAlignment === edgeMarkLabelAlignment) return;
              playWowTransition();
              setEdgeMarkLabelAlignment(nextEdgeMarkLabelAlignment);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Thumb edge"
            options={thumbEdgeBehaviorOptions}
            value={thumbEdgeBehavior}
            onValueChange={(value) => {
              const nextThumbEdgeBehavior = value as SliderThumbEdgeBehaviorOption;
              if (nextThumbEdgeBehavior === thumbEdgeBehavior) return;
              playWowTransition();
              setThumbEdgeBehavior(nextThumbEdgeBehavior);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Active origin"
            options={activeTrackOriginOptions}
            value={activeTrackOrigin}
            onValueChange={(value) => {
              const nextActiveTrackOrigin = value as SliderActiveTrackOriginControl;
              if (nextActiveTrackOrigin === activeTrackOrigin) return;
              playWowTransition();
              setActiveTrackOrigin(nextActiveTrackOrigin);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Origin mark"
            options={originMarkOptions}
            value={originMark}
            onValueChange={(value) => {
              const nextOriginMark = value as SliderOriginMarkOption;
              if (nextOriginMark === originMark) return;
              playWowTransition();
              setOriginMark(nextOriginMark);
            }}
            disabled={!isSliderAvailable}
          />
          <ShowcaseSelectControl
            label="Activation feedback"
            options={activationFeedbackOptions}
            value={activationFeedback}
            onValueChange={(value) => {
              const nextActivationFeedback = value as SliderActivationFeedbackControl;
              if (nextActivationFeedback === activationFeedback) return;
              playWowTransition();
              setActivationFeedback(nextActivationFeedback);
            }}
            disabled={!isSliderAvailable}
          />
        </ShowcaseControlGrid>
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
                marks={interactiveMarks}
                markStep={markStepProp}
                edgeMarks={edgeMarks}
                markPlacement={markPlacement}
                markLabelPlacement={markLabelPlacement}
                edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                thumbEdgeBehavior={thumbEdgeBehavior}
                activeTrackOrigin={activeTrackOriginProp}
                originMark={originMark}
                valueDisplay={valueDisplay}
                valueSummaryPlacement={valueSummaryPlacementProp}
                valueSummaryWidth={interactiveValueSummaryWidth}
                valueAnimation={valueAnimationProp}
                snapMotion={snapMotionProp}
                thumbBehavior={thumbBehaviorProp}
                thumbCrossing={thumbCrossingProp}
                activationFeedback={activationFeedbackProp}
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
              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example A"
              >
                <Slider label="Basic" defaultValue={50} />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example B"
              >
                <Slider
                  label="Volume"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setVolume(nextValue);
                    setVolumePreview(null);
                  }}
                  onInteractionValueChange={(details) => {
                    if (typeof details.value === 'number') setVolumePreview(details.value);
                  }}
                  onPointerCancel={() => setVolumePreview(null)}
                  onPointerUp={() => setVolumePreview(null)}
                  marks={[
                    {
                      value: 0,
                      icon: renderVolumeIcon(visibleVolume)
                    },
                    { value: 100, icon: <VolumeHighIcon /> }
                  ]}
                  markStep={markStepProp}
                  edgeMarks="exclude"
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example C"
              >
                <Slider
                  label="Thumb icon"
                  min={0}
                  max={100}
                  step={1}
                  value={thumbIconVolume}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setThumbIconVolume(nextValue);
                  }}
                  thumbIcon={({ value }) => renderThumbVolumeIcon(value)}
                  markStep={markStepProp}
                  edgeMarks="exclude"
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  valueDisplay="none"
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example D: Area"
              >
                <Slider
                  label="Area"
                  required
                  valueMode="range"
                  min={25}
                  max={250}
                  step={5}
                  value={area}
                  onValueChange={(nextValue) => {
                    if (Array.isArray(nextValue)) setArea([nextValue[0], nextValue[1]]);
                  }}
                  marks={[
                    { value: 25, label: formatSquareMeters(25) },
                    { value: 250, label: formatSquareMeters(250) }
                  ]}
                  thumbIcon={<DragHandleIcon />}
                  markStep={markStepProp}
                  edgeMarks="exclude"
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  formatValue={(value) => formatSquareMeters(value)}
                  valueDisplay="tooltip"
                  valueAnimation={valueAnimationProp}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  thumbCrossing={thumbCrossingProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example E: Brightness"
              >
                <Slider
                  label="Brightness"
                  min={0}
                  max={100}
                  step={1}
                  value={brightness}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setBrightness(nextValue);
                  }}
                  marks={[
                    { value: 0, icon: <MoonIcon /> },
                    { value: 100, icon: <SunIcon /> }
                  ]}
                  markStep={markStepProp}
                  edgeMarks="exclude"
                  markPlacement={markPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  formatValue={(value) => (value > 85 ? 'Very Bright' : `${value}%`)}
                  valueDisplay="tooltip"
                  valueAnimation={valueAnimationProp}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  thumbCrossing={thumbCrossingProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example F: Tasks completed"
              >
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
                  marks={[
                    { value: 0, label: '0%', icon: '-' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%', icon: '+' }
                  ]}
                  markStep={markStepProp}
                  edgeMarks={edgeMarks}
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  formatValue={(value) => `${value}%`}
                  valueDisplay="summary"
                  valueAnimation={valueAnimationProp}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  thumbCrossing={thumbCrossingProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example G: Center origin"
              >
                <Slider
                  label="Center biased"
                  min={-100}
                  max={100}
                  step={10}
                  value={centerBiased}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setCenterBiased(nextValue);
                  }}
                  marks="step"
                  markStep={markStepProp}
                  edgeMarks={edgeMarks}
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement="endpoints"
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin="center"
                  originMark="auto"
                  formatValue={formatSignedPercent}
                  valueDisplay="tooltip"
                  valueAnimation={valueAnimationProp}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  activationFeedback={activationFeedbackProp}
                  scale={scale}
                  radius={radius}
                  intent={intent}
                  emphasis={emphasis}
                />
              </SliderExampleCard>

              <SliderExampleCard
                cardShadow={cardShadow}
                surface={selectedSurface}
                title="Example H: Rating"
              >
                <Slider
                  label="Rating"
                  min={0}
                  max={10}
                  step={1}
                  value={rating}
                  onValueChange={(nextValue) => {
                    if (typeof nextValue === 'number') setRating(nextValue);
                  }}
                  marks={ratingMarks}
                  markStep={markStepProp}
                  edgeMarks={edgeMarks}
                  markPlacement={markPlacement}
                  markLabelPlacement={markLabelPlacement}
                  edgeMarkLabelPlacement={edgeMarkLabelPlacement}
                  edgeMarkLabelAlignment={edgeMarkLabelAlignment}
                  thumbEdgeBehavior={thumbEdgeBehavior}
                  activeTrackOrigin={activeTrackOriginProp}
                  originMark={originMark}
                  helperText="How happy are you with the level of service?"
                  valueDisplay="tooltip"
                  valueAnimation={valueAnimationProp}
                  snapMotion={snapMotionProp}
                  thumbBehavior={thumbBehaviorProp}
                  thumbCrossing={thumbCrossingProp}
                  activationFeedback={activationFeedbackProp}
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
