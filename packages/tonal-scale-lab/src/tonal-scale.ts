export type ScaleTone = number;

export type ScaleSlot = {
  id: string;
  label: string;
  position: ScaleTone;
};

const KISKADEE_LEGACY_SCALE_TONES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70,
  75, 80, 85, 90, 95, 100
] as const satisfies readonly ScaleTone[];

const KISKADEE_OFFICIAL_SCALE_TONES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60,
  65, 70, 75, 80, 85, 90, 95, 100
] as const satisfies readonly ScaleTone[];

const FLUENT_2_OFFICIAL_SCALE_SLOTS = [
  { label: '10', position: 95 },
  { label: '20', position: 89.5679 },
  { label: '30', position: 84.6296 },
  { label: '40', position: 79.1975 },
  { label: '50', position: 73.0247 },
  { label: '60', position: 67.0988 },
  { label: '70', position: 60.9259 },
  { label: '80', position: 55 },
  { label: '90', position: 44.7527 },
  { label: '100', position: 35.212 },
  { label: '110', position: 30.4417 },
  { label: '120', position: 26.3781 },
  { label: '130', position: 20.371 },
  { label: '140', position: 15.0707 },
  { label: '150', position: 10.3004 },
  { label: '160', position: 5 }
].map(({ label, position }) => ({
  id: `fluent-${label}`,
  label,
  position
})) satisfies ScaleSlot[];

export type ScaleDistribution = {
  id: string;
  label: string;
  description: string;
  slots: readonly ScaleSlot[];
  generatedCount: number;
  vividBridgeStartTone?: ScaleTone;
};

export const SCALE_DISTRIBUTIONS = [
  {
    id: 'kiskadee-official',
    label: 'Kiskadee Official (33)',
    description: 'Fine light range through K10, then medium tones every two steps before vivid.',
    slots: createNumericSlots(KISKADEE_OFFICIAL_SCALE_TONES),
    generatedCount: 33,
    vividBridgeStartTone: 10
  },
  {
    id: 'fluent-2-official',
    label: 'Fluent 2 Official (16)',
    description: 'Official Fluent 2 brand scale slots, projected onto the normalized curve.',
    slots: FLUENT_2_OFFICIAL_SCALE_SLOTS,
    generatedCount: 16
  },
  {
    id: 'kiskadee-legacy',
    label: 'Kiskadee Legacy (31)',
    description: 'Previous Kiskadee lab distribution with fine light range through K15.',
    slots: createNumericSlots(KISKADEE_LEGACY_SCALE_TONES),
    generatedCount: 31,
    vividBridgeStartTone: 15
  }
] as const satisfies readonly ScaleDistribution[];

export type ScaleDistributionId = (typeof SCALE_DISTRIBUTIONS)[number]['id'];

export const DEFAULT_SCALE_DISTRIBUTION = SCALE_DISTRIBUTIONS[0];
export const DEFAULT_SCALE_DISTRIBUTION_ID: ScaleDistributionId = DEFAULT_SCALE_DISTRIBUTION.id;
export const SCALE_TONES = DEFAULT_SCALE_DISTRIBUTION.slots.map((slot) => slot.position);

export function resolveScaleDistribution(id: string): ScaleDistribution {
  return (
    SCALE_DISTRIBUTIONS.find((distribution) => distribution.id === id) ?? DEFAULT_SCALE_DISTRIBUTION
  );
}

function createNumericSlots(tones: readonly ScaleTone[]): ScaleSlot[] {
  return tones.map((tone) => ({
    id: `tone-${tone}`,
    label: `${tone}`,
    position: tone
  }));
}

function resolveChromaticEndpointSlots(distribution: ScaleDistribution): {
  light: ScaleSlot;
  dark: ScaleSlot;
} {
  const chromaticSlots = [...distribution.slots]
    .filter((slot) => !isAbsoluteScaleCapTone(slot.position))
    .sort((left, right) => left.position - right.position);
  const fallbackSlot = [...distribution.slots].sort(
    (left, right) => left.position - right.position
  )[0];

  return {
    light: chromaticSlots[0] ?? fallbackSlot,
    dark: chromaticSlots[chromaticSlots.length - 1] ?? fallbackSlot
  };
}

export type HslColor = {
  h: number;
  s: number;
  l: number;
};

export type OklchColor = {
  l: number;
  c: number;
  h: number;
};

export type TonalScaleColor = {
  id: string;
  label: string;
  tone: ScaleTone;
  hex: string;
  hsl: HslColor;
};

export type ChromaCurveProjectionRole =
  | 'dark-graph-end'
  | 'dark-arc-base'
  | 'vivid-boundary'
  | 'apex'
  | 'preserved-input-anchor'
  | 'light-arc-base'
  | 'light-zone-exit'
  | 'light-zone-shoulder'
  | 'light-graph-end';

export type ChromaCurveProjectionPoint = {
  role: ChromaCurveProjectionRole;
  lightness: number;
  chroma: number;
};

export type ChromaCurveProjectionSample = {
  lightness: number;
  chroma: number;
};

export type ChromaCurveProjection = {
  points: readonly ChromaCurveProjectionPoint[];
  samples: readonly ChromaCurveProjectionSample[];
};

export type TonalScaleDiagnostics = {
  plannedChromaCurve?: ChromaCurveProjection;
};

export type TonalScaleGenerationResult = {
  scale: TonalScaleColor[];
  diagnostics: TonalScaleDiagnostics;
};

export type CurveControls = {
  darkFloorLightness: number;
  lightCeilingLightness: number;
  darkLightnessGamma: number;
  lightLightnessGamma: number;
  saturationScale: number;
  darkSaturationBias: number;
  lightSaturationBias: number;
  hueDriftStrength: number;
};

export type TonalProfileMode = 'reference-curve' | 'linear-lightness';
export type ColorInterpolationSpace = 'hsl' | 'oklch';

export type InputColorStrategy = 'seed' | 'fixed-anchor' | 'auto-fit';

export type SaturationCurve =
  | {
      type: 'soft-dark';
      darkMinRatio: number;
      darkGamma: number;
    }
  | {
      type: 'mid-peak';
      lightMinRatio: number;
      lightGamma: number;
      darkMinRatio: number;
      darkGamma: number;
    };

export type VividContrastRule = {
  bridgeStartTone?: ScaleTone;
  startTone: ScaleTone;
  foregroundHex: string;
  minRatio: number;
  lightnessProgressGamma?: number;
  luminousMinRatio?: number;
};

export type MinimumLightnessStepRule = {
  chromaticMinStep: number;
};

export type LuminousChromaRampRule = {
  maxWhiteContrast: number;
  endTone: ScaleTone;
  startChromaRatio: number;
  endChromaRatio: number;
  progressGamma: number;
};

export type VividBoundaryBufferRule = {
  rewindSlots: number;
};

export type PreservedAnchorContinuityRule = {
  sampleSize: number;
  maxSlopeRatio: number;
  tolerance: number;
  maxRewindSlots: number;
  nearVividBoundary?: {
    maxDistance: number;
    maxSlopeRatio: number;
    tolerance: number;
  };
  adjacentVividBoundary?: {
    maxSlopeRatio: number;
    tolerance: number;
  };
};

export type InputPreservationRule = {
  lightZoneEndTone: ScaleTone;
  anchorFit?: 'nearest-color' | 'input-lightness';
  generationBase?: 'profile-base-tone' | 'preserved-input-anchor';
  vividBoundaryBuffer?: VividBoundaryBufferRule;
  anchorContinuity?: PreservedAnchorContinuityRule;
};

export type ProtectedAnchorAdjacentSeamRule = {
  maxNeighborRatio: number;
  tolerance: number;
};

export type NodeContinuityRule = {
  nodeTones: readonly ScaleTone[];
  maxNeighborRatio: number;
  tolerance: number;
  maxIterations: number;
  protectedAnchorAdjacentSeam?: ProtectedAnchorAdjacentSeamRule;
};

export type ChromaPeakRule = {
  prominenceThreshold: number;
  allowedDropMin: number;
  allowedDropRatio: number;
  maxRadius: number;
  vividStartShoulder?: {
    allowedDropMin: number;
    allowedDropRatio: number;
    maxRadius: number;
    preVividMaxLightnessDrop: number;
  };
  lightZoneTangent?: {
    maxAnchorTone: ScaleTone;
    sampleSize: number;
    minIncomingDelta: number;
    liftRatio: number;
    progressGamma: number;
  };
  nearVividBoundary?: {
    maxDistance: number;
    prominenceThreshold: number;
    allowedDropMin: number;
    allowedDropRatio: number;
    maxRadius: number;
    allowVividSide: boolean;
  };
  dominantPlateau?: {
    equalityTolerance: number;
    prominenceThreshold: number;
    allowedDropMin: number;
    allowedDropRatio: number;
    maxRadius: number;
    maxPlateauSlots: number;
  };
};

export type ChromaCurveShapePoint =
  | {
      kind: 'chromatic-light-end';
    }
  | {
      kind: 'chromatic-dark-end';
    }
  | {
      kind: 'dynamic-apex';
    }
  | {
      kind: 'tone';
      tone: ScaleTone;
    };

export type ChromaCurveShapeSegment = {
  from: ChromaCurveShapePoint;
  to: ChromaCurveShapePoint;
  easing: 'ease-in' | 'ease-out' | 'smoothstep';
  strength?: number;
  maxChromaAdjustment?: number;
  maxLightnessDrop?: number;
  midpointLift?: number;
  midpointLiftCenter?: number;
  midpointLiftRadius?: number;
};

export type ChromaCurveBellRule = {
  darkBaseProgress: number;
  lightBaseProgress: number;
  darkBaseChromaRatio: number;
  lightBaseChromaRatio: number;
  lightZoneShoulder?: {
    endTone: ScaleTone;
    shoulderProgress: number;
    projectionBowRatio?: number;
  };
  minimumArcLift?: {
    lightSideMinBowRatio: number;
    darkSideMinBowRatio: number;
    lightSideMaxBaseChromaRatio: number;
    darkSideMaxBaseChromaRatio: number;
  };
  strength: number;
  maxChromaAdjustment: number;
  maxLightnessDrop: number;
  lightSideMaxLightnessDrop?: number;
  darkSideMaxLightnessDrop?: number;
};

export type ChromaCurveShapeRule = {
  applyBeforeInputPreservation?: boolean;
  strength: number;
  maxChromaAdjustment: number;
  minSegmentSlots: number;
  fairing?: {
    iterations: number;
    strength: number;
    maxChromaAdjustment: number;
  };
  bellCurve?: ChromaCurveBellRule;
  segments?: readonly ChromaCurveShapeSegment[];
};

export type ChromaCurveLightnessRhythmRange = {
  startTone: ScaleTone;
  endTone: ScaleTone;
  strength: number;
  maxLightnessShift: number;
};

export type ChromaCurveLightnessRhythmProtectedAnchorExpansion = {
  startTone: ScaleTone;
  endTone: ScaleTone;
  minAdjacentDelta: number;
  strength: number;
  maxLightnessShift: number;
  progressGamma?: number;
};

export type ChromaCurveLightnessRhythmProtectedAnchorExit = {
  startTone: ScaleTone;
  endTone: ScaleTone;
  maxFirstDeltaRatio: number;
  tolerance: number;
  strength: number;
  maxLightnessLift: number;
  progressGamma: number;
};

export type ChromaCurveLightZoneChromaValleyFloorRule = {
  startTone: ScaleTone;
  endTone: ScaleTone;
  minChromaDip: number;
  strength: number;
  maxChromaLift: number;
};

export type ChromaCurveLightnessRhythmTransitionRule = {
  sampleSize: number;
  targetMix: number;
  tolerance: number;
  strength: number;
  maxLightnessShift: number;
  redistributionSlots: number;
  redistributionStrength: number;
};

export type ChromaCurveLightnessSpacingRange = {
  startTone: ScaleTone;
  endTone: ScaleTone;
  minDelta: number;
  maxLightnessDrop: number;
};

export type ChromaCurveContinuityRule = {
  maxTurnDegrees: number;
  maxIterations: number;
  visualChromaMax: number;
  minSegmentLength: number;
  smoothingStrength: number;
  finalLightnessMonotonicity?: {
    minDelta: number;
    maxLightnessDrop: number;
  };
  finalLightnessRhythm?: {
    ranges: readonly ChromaCurveLightnessRhythmRange[];
    protectedAnchorExpansions?: readonly ChromaCurveLightnessRhythmProtectedAnchorExpansion[];
    protectedAnchorExits?: readonly ChromaCurveLightnessRhythmProtectedAnchorExit[];
    transitionDeltas?: ChromaCurveLightnessRhythmTransitionRule;
  };
  finalLightnessSpacing?: {
    maxIterations: number;
    ranges: readonly ChromaCurveLightnessSpacingRange[];
  };
  curveShape?: ChromaCurveShapeRule;
  lightZoneChromaValleyFloor?: ChromaCurveLightZoneChromaValleyFloorRule;
  protectedApexShoulder: {
    radius: number;
    dropMin: number;
    dropRatio: number;
    dropGamma: number;
    lightSideMaxLightnessDrop: number;
    projectionIncomingTangentRatio?: number;
  };
  forwardApexShoulder: {
    sampleSize: number;
    minIncomingDelta: number;
    maxExitDeltaRatio: number;
    liftRatio: number;
    peakProgress: number;
    progressGamma: number;
    maxLightnessDrop: number;
    maxHueDrift: number;
    minHueDriftChromaGain: number;
  };
};

export type TonalProfile = {
  id: string;
  label: string;
  commercialName?: string;
  mode: TonalProfileMode;
  colorSpace?: ColorInterpolationSpace;
  inputStrategy: InputColorStrategy;
  baseTone: ScaleTone;
  referenceScale: TonalScaleColor[];
  defaultControls: CurveControls;
  saturationCurve?: SaturationCurve;
  vividContrast?: VividContrastRule;
  minimumLightnessStep?: MinimumLightnessStepRule;
  luminousChromaRamp?: LuminousChromaRampRule;
  inputPreservation?: InputPreservationRule;
  nodeContinuity?: NodeContinuityRule;
  chromaPeak?: ChromaPeakRule;
  chromaCurveContinuity?: ChromaCurveContinuityRule;
};

export type TonalAnchor = {
  position: number;
  hex: string;
};

export const ABSOLUTE_LIGHT_CAP_TONE: ScaleTone = 0;
export const ABSOLUTE_DARK_CAP_TONE: ScaleTone = 100;
export const KISKADEE_BASE_TONE: ScaleTone = 55;

export function isAbsoluteScaleCapTone(tone: ScaleTone): boolean {
  return tone === ABSOLUTE_LIGHT_CAP_TONE || tone === ABSOLUTE_DARK_CAP_TONE;
}

export function resolveChromaticLightEndTone(distribution: ScaleDistribution): ScaleTone {
  return resolveChromaticEndpointSlots(distribution).light.position;
}

export function resolveChromaticDarkEndTone(distribution: ScaleDistribution): ScaleTone {
  return resolveChromaticEndpointSlots(distribution).dark.position;
}

function resolveProfileColorSpace(
  profile: Pick<TonalProfile, 'colorSpace'>
): ColorInterpolationSpace {
  return profile.colorSpace ?? 'hsl';
}

export function generateTonalScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleColor[] {
  return generateTonalScaleWithDiagnostics(baseHex, controls, profile, distribution).scale;
}

export function generateTonalScaleWithDiagnostics(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleGenerationResult {
  const colorSpace = resolveProfileColorSpace(profile);
  const diagnostics: TonalScaleDiagnostics = {};
  const generationAnchorTone = resolveGenerationAnchorTone(
    baseHex,
    profile,
    distribution,
    colorSpace
  );

  const scale =
    profile.mode === 'linear-lightness'
      ? colorSpace === 'oklch'
        ? generateLinearOklchScale(baseHex, controls, profile, distribution, generationAnchorTone)
        : generateLinearLightnessScale(
            baseHex,
            controls,
            profile,
            distribution,
            generationAnchorTone
          )
      : generateReferenceCurveScale(baseHex, controls, profile, distribution);

  const vividScale = applyVividContrastRule(scale, profile, distribution, baseHex);
  const steppedScale = applyMinimumLightnessSteps(
    vividScale,
    distribution,
    profile.minimumLightnessStep,
    colorSpace
  );

  const luminousScale = applyLuminousChromaRamp(
    steppedScale,
    distribution,
    profile.luminousChromaRamp,
    colorSpace,
    baseHex
  );

  return {
    scale: applyInputPreservation(
      luminousScale,
      profile,
      distribution,
      colorSpace,
      baseHex,
      diagnostics
    ),
    diagnostics
  };
}

function resolveGenerationAnchorTone(
  baseHex: string,
  profile: TonalProfile,
  distribution: ScaleDistribution,
  colorSpace: ColorInterpolationSpace
): ScaleTone {
  if (
    profile.inputStrategy !== 'auto-fit' ||
    profile.inputPreservation?.generationBase !== 'preserved-input-anchor'
  ) {
    return profile.baseTone;
  }

  const vividContrast = resolveVividContrastRule(profile.vividContrast, distribution, baseHex);
  const anchor = resolveInputLightnessAnchor({
    distribution,
    colorSpace,
    inputPreservation: profile.inputPreservation,
    vividContrast,
    inputHex: baseHex
  });

  return anchor?.tone ?? profile.baseTone;
}

function resolveGenerationAnchorLightness(
  baseHex: string,
  profile: Pick<TonalProfile, 'inputPreservation' | 'inputStrategy' | 'baseTone'>,
  colorSpace: ColorInterpolationSpace
): number {
  return profile.inputStrategy === 'fixed-anchor' ||
    profile.inputPreservation?.generationBase === 'preserved-input-anchor'
    ? resolveHexLightness(baseHex, colorSpace)
    : 100 - profile.baseTone;
}

export function resolveInputFitTone(
  baseHex: string,
  profile: Pick<TonalProfile, 'baseTone' | 'inputStrategy'>,
  scale: TonalScaleColor[]
): ScaleTone {
  if (profile.inputStrategy === 'fixed-anchor') {
    return profile.baseTone;
  }

  const candidates = scale.filter((color) => color.tone > 0 && color.tone < 100);
  const nearest = (candidates.length > 0 ? candidates : scale).reduce(
    (current, color) =>
      rgbDistance(color.hex, baseHex) < rgbDistance(current.hex, baseHex) ? color : current,
    candidates[0] ?? scale[0]
  );

  return nearest.tone;
}

export function resolveAppliedVividContrastRule(
  baseHex: string,
  profile: Pick<TonalProfile, 'vividContrast'>,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): VividContrastRule | undefined {
  const vividContrast = resolveVividContrastRule(profile.vividContrast, distribution, baseHex);

  if (!vividContrast) {
    return undefined;
  }

  const hasVividStart = distribution.slots.some(
    (slot) => slot.position === vividContrast.startTone
  );
  const hasDarkEnd = distribution.slots.some(
    (slot) => slot.position === resolveChromaticDarkEndTone(distribution)
  );

  return hasVividStart && hasDarkEnd ? vividContrast : undefined;
}

export function createReferenceScaleFromAnchors(
  anchors: TonalAnchor[],
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleColor[] {
  const resolvedAnchors = anchors
    .map((anchor) => ({
      ...anchor,
      hsl: hexToHsl(anchor.hex)
    }))
    .sort((left, right) => left.position - right.position);

  return distribution.slots.map((slot) => {
    const hsl = resolveReferenceHslAtTone(slot.position, resolvedAnchors);

    return {
      id: slot.id,
      label: slot.label,
      tone: slot.position,
      hex: hslToHex(hsl),
      hsl
    };
  });
}

export function createDefaultCurveControls(
  profile: Pick<TonalProfile, 'referenceScale'>
): CurveControls {
  const chromaticReferenceScale = profile.referenceScale
    .filter((color) => !isAbsoluteScaleCapTone(color.tone))
    .sort((left, right) => left.tone - right.tone);
  const lightEndpoint = chromaticReferenceScale[0] ?? profile.referenceScale[0];
  const darkEndpoint =
    chromaticReferenceScale[chromaticReferenceScale.length - 1] ??
    profile.referenceScale[profile.referenceScale.length - 1];

  return {
    darkFloorLightness: roundChannel(darkEndpoint.hsl.l),
    lightCeilingLightness: roundChannel(lightEndpoint.hsl.l),
    darkLightnessGamma: 1,
    lightLightnessGamma: 1,
    saturationScale: 1,
    darkSaturationBias: 1,
    lightSaturationBias: 1,
    hueDriftStrength: 1
  };
}

export function createHexByTone(scale: TonalScaleColor[]): Record<ScaleTone, string> {
  return Object.fromEntries(scale.map((entry) => [entry.tone, entry.hex])) as Record<
    ScaleTone,
    string
  >;
}

export function resolveProfileReferenceScale(
  baseHex: string,
  profile: TonalProfile,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleColor[] {
  if (profile.mode === 'linear-lightness') {
    return generateTonalScale(baseHex, profile.defaultControls, profile, distribution);
  }

  return applyVividContrastRule(
    createReferenceScaleFromScale(profile.referenceScale, distribution),
    profile,
    distribution,
    baseHex
  );
}

function createReferenceScaleFromScale(
  referenceScale: TonalScaleColor[],
  distribution: ScaleDistribution
): TonalScaleColor[] {
  return createReferenceScaleFromAnchors(
    referenceScale.map((entry) => ({ position: entry.tone, hex: entry.hex })),
    distribution
  );
}

export function normalizeHexColor(raw: string): string | null {
  const value = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toLowerCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return `#${value.toLowerCase()}`;
  }

  return null;
}

export function hexToHsl(hex: string): HslColor {
  const normalized = normalizeHexColor(hex) ?? '#000000';
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  }

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      hue = ((b - r) / delta + 2) / 6;
    } else {
      hue = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: hue * 360,
    s: saturation * 100,
    l: lightness * 100
  };
}

export function hslToHex(hsl: HslColor): string {
  const h = normalizeHue(hsl.h) / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  if (s === 0) {
    const channel = toHexChannel(l);
    return `#${channel}${channel}${channel}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hueToRgb(p, q, h + 1 / 3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1 / 3);

  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

export function formatHsl(hsl: HslColor): string {
  return `hsl(${roundChannel(hsl.h)}, ${roundChannel(hsl.s)}%, ${roundChannel(hsl.l)}%)`;
}

export function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToLinearRgb(hex);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const oklabL = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const oklabA = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const oklabB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const chroma = Math.sqrt(oklabA ** 2 + oklabB ** 2);
  const hue = chroma < 0.000001 ? 0 : normalizeHue((Math.atan2(oklabB, oklabA) * 180) / Math.PI);

  return {
    l: oklabL * 100,
    c: chroma,
    h: hue
  };
}

export function oklchToHex(oklch: OklchColor): string {
  const fittedOklch = fitOklchToSrgb(oklch);
  const [r, g, b] = oklchToSrgbChannels(fittedOklch);

  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

export function formatOklch(oklch: OklchColor): string {
  return `oklch(${roundChannel(oklch.l)}%, ${oklch.c.toFixed(4)}, ${roundChannel(oklch.h)})`;
}

export function rgbDistance(leftHex: string, rightHex: string): number {
  const left = hexToRgb(leftHex);
  const right = hexToRgb(rightHex);
  return Math.sqrt(left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0));
}

export function contrastRatio(leftHex: string, rightHex: string): number {
  const left = relativeLuminance(leftHex);
  const right = relativeLuminance(rightHex);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);

  return (lighter + 0.05) / (darker + 0.05);
}

function createAbsoluteCapColor(slot: ScaleSlot): TonalScaleColor | undefined {
  if (slot.position === ABSOLUTE_LIGHT_CAP_TONE) {
    return {
      id: slot.id,
      label: slot.label,
      tone: slot.position,
      hex: '#ffffff',
      hsl: { h: 0, s: 0, l: 100 }
    };
  }

  if (slot.position === ABSOLUTE_DARK_CAP_TONE) {
    return {
      id: slot.id,
      label: slot.label,
      tone: slot.position,
      hex: '#000000',
      hsl: { h: 0, s: 0, l: 0 }
    };
  }

  return undefined;
}

function createScaleColorFromHex(
  slot: ScaleSlot | Pick<TonalScaleColor, 'id' | 'label' | 'tone'>,
  hex: string
): TonalScaleColor {
  return {
    id: slot.id,
    label: slot.label,
    tone: 'position' in slot ? slot.position : slot.tone,
    hex,
    hsl: hexToHsl(hex)
  };
}

function generateReferenceCurveScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution
): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);
  const referenceScale = createReferenceScaleFromScale(profile.referenceScale, distribution);
  const referenceHslByTone = createHslByTone(referenceScale);
  const chromaticProfileReferenceScale = profile.referenceScale
    .filter((color) => !isAbsoluteScaleCapTone(color.tone))
    .sort((left, right) => left.tone - right.tone);
  const profileReferenceHslByTone = createHslByTone(profile.referenceScale);
  const referenceBaseHsl = profileReferenceHslByTone[profile.baseTone];
  const referenceLightHsl = chromaticProfileReferenceScale[0]?.hsl ?? profileReferenceHslByTone[0];
  const referenceDarkHsl =
    chromaticProfileReferenceScale[chromaticProfileReferenceScale.length - 1]?.hsl ??
    profileReferenceHslByTone[100];

  return distribution.slots.map((slot) => {
    const absoluteCap = createAbsoluteCapColor(slot);

    if (absoluteCap) {
      return absoluteCap;
    }

    const referenceHsl = referenceHslByTone[slot.position];
    const sideProgress = resolveReferenceSideProgress({
      tone: slot.position,
      profile,
      referenceHsl,
      referenceBaseHsl,
      referenceLightHsl,
      referenceDarkHsl
    });
    const isDarkSide = slot.position >= profile.baseTone;
    const lightness = resolveReferenceLightness({
      tone: slot.position,
      profile,
      baseHsl,
      referenceHsl,
      referenceBaseHsl,
      referenceLightHsl,
      referenceDarkHsl,
      controls
    });
    const saturationBias = isDarkSide ? controls.darkSaturationBias : controls.lightSaturationBias;
    const referenceSaturationRatio =
      referenceBaseHsl.s === 0 ? 1 : referenceHsl.s / referenceBaseHsl.s;
    const saturation =
      baseHsl.s *
      referenceSaturationRatio *
      controls.saturationScale *
      interpolate(1, saturationBias, sideProgress);
    const hue = normalizeHue(
      baseHsl.h + shortestHueDelta(referenceBaseHsl.h, referenceHsl.h) * controls.hueDriftStrength
    );
    const hsl = {
      h: hue,
      s: clamp(saturation, 0, 100),
      l: clamp(lightness, 0, 100)
    };

    return {
      id: slot.id,
      label: slot.label,
      tone: slot.position,
      hex: hslToHex(hsl),
      hsl
    };
  });
}

function generateLinearLightnessScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution,
  generationAnchorTone: ScaleTone
): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);
  const anchorLightness = resolveGenerationAnchorLightness(baseHex, profile, 'hsl');
  const { light, dark } = resolveChromaticEndpointSlots(distribution);

  return distribution.slots.map((slot) => {
    const absoluteCap = createAbsoluteCapColor(slot);

    if (absoluteCap) {
      return absoluteCap;
    }

    const hsl = {
      h: baseHsl.h,
      s: clamp(
        baseHsl.s *
          controls.saturationScale *
          resolveLinearSaturationMultiplier(
            slot.position,
            profile,
            generationAnchorTone,
            light.position,
            dark.position
          ),
        0,
        100
      ),
      l: resolveLinearLightness(
        slot.position,
        generationAnchorTone,
        anchorLightness,
        controls,
        light.position,
        dark.position
      )
    };

    return {
      id: slot.id,
      label: slot.label,
      tone: slot.position,
      hex: hslToHex(hsl),
      hsl
    };
  });
}

function generateLinearOklchScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution,
  generationAnchorTone: ScaleTone
): TonalScaleColor[] {
  const baseOklch = hexToOklch(baseHex);
  const anchorLightness = resolveGenerationAnchorLightness(baseHex, profile, 'oklch');
  const { light, dark } = resolveChromaticEndpointSlots(distribution);

  return distribution.slots.map((slot) => {
    const absoluteCap = createAbsoluteCapColor(slot);

    if (absoluteCap) {
      return absoluteCap;
    }

    const oklch = {
      h: baseOklch.h,
      c: clamp(
        baseOklch.c *
          controls.saturationScale *
          resolveLinearSaturationMultiplier(
            slot.position,
            profile,
            generationAnchorTone,
            light.position,
            dark.position
          ),
        0,
        0.5
      ),
      l: resolveLinearLightness(
        slot.position,
        generationAnchorTone,
        anchorLightness,
        controls,
        light.position,
        dark.position
      )
    };

    return createScaleColorFromHex(slot, oklchToHex(oklch));
  });
}

function applyVividContrastRule(
  scale: TonalScaleColor[],
  profile: Pick<TonalProfile, 'baseTone' | 'colorSpace' | 'inputStrategy' | 'vividContrast'>,
  distribution: ScaleDistribution,
  inputHex: string
): TonalScaleColor[] {
  const vividContrast = resolveVividContrastRule(profile.vividContrast, distribution, inputHex);

  if (!vividContrast) {
    return scale;
  }

  const { foregroundHex, minRatio, startTone } = vividContrast;
  const colorSpace = resolveProfileColorSpace(profile);
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const vividStart = scale.find((color) => color.tone === startTone);
  const vividEnd = scale.find((color) => color.tone === chromaticDarkEndTone);
  const vividColors = scale.filter(
    (color) => color.tone >= startTone && color.tone <= chromaticDarkEndTone
  );

  if (!vividStart || !vividEnd || vividColors.length < 2) {
    return scale;
  }

  const vividIndexById = new Map(vividColors.map((color, index) => [color.id, index]));
  const vividEndIndex = vividColors.length - 1;
  const vividLightnessProgressGamma = vividContrast.lightnessProgressGamma ?? 1;
  const vividStartLightness = Math.min(
    resolveScaleColorLightness(vividStart, colorSpace),
    resolveMaxLightnessForContrast(vividStart, colorSpace, foregroundHex, minRatio)
  );
  const vividEndLightness = Math.min(
    resolveScaleColorLightness(vividEnd, colorSpace),
    resolveMaxLightnessForContrast(vividEnd, colorSpace, foregroundHex, minRatio)
  );
  const preservedAnchor =
    profile.inputStrategy === 'fixed-anchor'
      ? scale.find((color) => color.tone === profile.baseTone)
      : undefined;

  const shouldPreserveAnchor =
    preservedAnchor &&
    preservedAnchor.tone >= startTone &&
    preservedAnchor.tone <= chromaticDarkEndTone &&
    contrastRatio(preservedAnchor.hex, foregroundHex) >= minRatio;

  const adjustedScale = scale.map((color) => {
    const vividIndex = vividIndexById.get(color.id);

    if (vividIndex === undefined) {
      return color;
    }

    const targetLightness = shouldPreserveAnchor
      ? resolveAnchoredVividLightness({
          index: vividIndex,
          startIndex: 0,
          endIndex: vividEndIndex,
          startLightness: vividStartLightness,
          anchorIndex: vividIndexById.get(preservedAnchor.id) ?? 0,
          anchorLightness: resolveScaleColorLightness(preservedAnchor, colorSpace),
          endLightness: vividEndLightness,
          progressGamma: vividLightnessProgressGamma
        })
      : interpolate(
          vividStartLightness,
          vividEndLightness,
          resolveEmittedSlotProgress(vividIndex, 0, vividEndIndex, vividLightnessProgressGamma)
        );
    const maxAccessibleLightness = resolveMaxLightnessForContrast(
      color,
      colorSpace,
      foregroundHex,
      minRatio
    );

    return createScaleColorWithLightness(
      color,
      colorSpace,
      Math.min(targetLightness, maxAccessibleLightness)
    );
  });

  return applyPreVividBridge(adjustedScale, vividContrast, colorSpace, preservedAnchor?.tone);
}

function resolveVividContrastRule(
  rule: VividContrastRule | undefined,
  distribution: ScaleDistribution,
  inputHex?: string
): VividContrastRule | undefined {
  if (!rule) {
    return undefined;
  }

  return {
    ...rule,
    bridgeStartTone: distribution.vividBridgeStartTone ?? rule.bridgeStartTone,
    minRatio: inputHex ? resolveAdaptiveVividMinRatio(inputHex, rule) : rule.minRatio
  };
}

function applyPreVividBridge(
  scale: TonalScaleColor[],
  rule: VividContrastRule,
  colorSpace: ColorInterpolationSpace,
  preservedAnchorTone?: ScaleTone
): TonalScaleColor[] {
  const { bridgeStartTone, startTone } = rule;

  if (bridgeStartTone === undefined) {
    return scale;
  }

  const bridgeStartIndex = scale.findIndex((color) => color.tone === bridgeStartTone);
  const vividStartIndex = scale.findIndex((color) => color.tone === startTone);
  const bridgeStart = scale[bridgeStartIndex];
  const vividStart = scale[vividStartIndex];
  const preservedAnchorIndex =
    preservedAnchorTone === undefined
      ? -1
      : scale.findIndex((color) => color.tone === preservedAnchorTone);
  const preservedAnchor = scale[preservedAnchorIndex];

  if (!bridgeStart || !vividStart || bridgeStartIndex >= vividStartIndex) {
    return scale;
  }

  if (
    preservedAnchor &&
    preservedAnchorIndex > bridgeStartIndex &&
    preservedAnchorIndex < vividStartIndex
  ) {
    return interpolateBridgeAroundAnchor({
      scale,
      bridgeStartIndex,
      inputAnchorIndex: preservedAnchorIndex,
      vividStartIndex,
      colorSpace
    });
  }

  return scale.map((color, index) => {
    if (index <= bridgeStartIndex || index >= vividStartIndex) {
      return color;
    }

    const progress = normalizedProgress(index, bridgeStartIndex, vividStartIndex);
    return createInterpolatedScaleColor(color, bridgeStart, vividStart, progress, colorSpace);
  });
}

function interpolateBridgeAroundAnchor(params: {
  scale: TonalScaleColor[];
  bridgeStartIndex: number;
  inputAnchorIndex: number;
  vividStartIndex: number;
  colorSpace: ColorInterpolationSpace;
}): TonalScaleColor[] {
  const { scale, bridgeStartIndex, inputAnchorIndex, vividStartIndex, colorSpace } = params;
  const bridgeStart = scale[bridgeStartIndex];
  const inputAnchor = scale[inputAnchorIndex];
  const vividStart = scale[vividStartIndex];

  return scale.map((color, index) => {
    if (index <= bridgeStartIndex || index === inputAnchorIndex || index >= vividStartIndex) {
      return color;
    }

    const segmentStart = index < inputAnchorIndex ? bridgeStart : inputAnchor;
    const segmentEnd = index < inputAnchorIndex ? inputAnchor : vividStart;
    const segmentStartIndex = index < inputAnchorIndex ? bridgeStartIndex : inputAnchorIndex;
    const segmentEndIndex = index < inputAnchorIndex ? inputAnchorIndex : vividStartIndex;
    const progress = normalizedProgress(index, segmentStartIndex, segmentEndIndex);
    return createInterpolatedScaleColor(color, segmentStart, segmentEnd, progress, colorSpace);
  });
}

function resolveAnchoredVividLightness(params: {
  index: number;
  startIndex: number;
  endIndex: number;
  startLightness: number;
  anchorIndex: number;
  anchorLightness: number;
  endLightness: number;
  progressGamma: number;
}): number {
  const {
    index,
    startIndex,
    endIndex,
    startLightness,
    anchorIndex,
    anchorLightness,
    endLightness,
    progressGamma
  } = params;

  if (index <= anchorIndex) {
    return interpolate(
      startLightness,
      anchorLightness,
      resolveEmittedSlotProgress(index, startIndex, anchorIndex, progressGamma)
    );
  }

  return interpolate(
    anchorLightness,
    endLightness,
    resolveEmittedSlotProgress(index, anchorIndex, endIndex, progressGamma)
  );
}

function resolveEmittedSlotProgress(
  index: number,
  startIndex: number,
  endIndex: number,
  gamma: number
): number {
  return normalizedProgress(index, startIndex, endIndex) ** gamma;
}

function applyMinimumLightnessSteps(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  rule: MinimumLightnessStepRule | undefined,
  colorSpace: ColorInterpolationSpace
): TonalScaleColor[] {
  if (!rule) {
    return scale;
  }

  const chromaticLightEndTone = resolveChromaticLightEndTone(distribution);
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const adjustedById = new Map<string, TonalScaleColor>();
  let previous: TonalScaleColor | undefined;

  for (const color of [...scale].sort((left, right) => left.tone - right.tone)) {
    const isChromaticStepTarget =
      !isAbsoluteScaleCapTone(color.tone) &&
      color.tone >= chromaticLightEndTone &&
      color.tone <= chromaticDarkEndTone;
    const minStep = previous && isChromaticStepTarget ? rule.chromaticMinStep : undefined;
    const targetLightness =
      previous && minStep !== undefined
        ? Math.min(
            resolveScaleColorLightness(color, colorSpace),
            resolveScaleColorLightness(previous, colorSpace) - minStep
          )
        : resolveScaleColorLightness(color, colorSpace);
    const nextLightness = roundChannel(clamp(targetLightness, 0, 100));

    const adjusted =
      nextLightness === resolveScaleColorLightness(color, colorSpace)
        ? color
        : createScaleColorWithLightness(color, colorSpace, nextLightness);

    adjustedById.set(color.id, adjusted);
    previous = adjusted;
  }

  return scale.map((color) => adjustedById.get(color.id) ?? color);
}

function applyLuminousChromaRamp(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  rule: LuminousChromaRampRule | undefined,
  colorSpace: ColorInterpolationSpace,
  inputHex: string
): TonalScaleColor[] {
  if (
    !rule ||
    colorSpace !== 'oklch' ||
    contrastRatio(inputHex, '#ffffff') > rule.maxWhiteContrast
  ) {
    return scale;
  }

  const inputOklch = hexToOklch(inputHex);

  if (inputOklch.c === 0) {
    return scale;
  }

  const chromaticLightEndTone = resolveChromaticLightEndTone(distribution);
  const rampEndTone = Math.min(rule.endTone, resolveChromaticDarkEndTone(distribution));

  return scale.map((color) => {
    if (
      isAbsoluteScaleCapTone(color.tone) ||
      color.tone < chromaticLightEndTone ||
      color.tone > rampEndTone
    ) {
      return color;
    }

    const progress = normalizedProgress(color.tone, chromaticLightEndTone, rampEndTone);
    const chromaRatio = interpolate(
      rule.startChromaRatio,
      rule.endChromaRatio,
      progress ** rule.progressGamma
    );
    const maxChroma = inputOklch.c * chromaRatio;
    const oklch = hexToOklch(color.hex);

    if (oklch.c <= maxChroma) {
      return color;
    }

    return createScaleColorFromHex(color, oklchToHex({ ...oklch, c: maxChroma }));
  });
}

function applyInputPreservation(
  scale: TonalScaleColor[],
  profile: Pick<
    TonalProfile,
    | 'chromaCurveContinuity'
    | 'chromaPeak'
    | 'inputPreservation'
    | 'inputStrategy'
    | 'nodeContinuity'
    | 'vividContrast'
  >,
  distribution: ScaleDistribution,
  colorSpace: ColorInterpolationSpace,
  inputHex: string,
  diagnostics?: TonalScaleDiagnostics
): TonalScaleColor[] {
  const inputPreservation = profile.inputPreservation;
  const normalizedInputHex = normalizeHexColor(inputHex);

  if (!inputPreservation || profile.inputStrategy !== 'auto-fit' || !normalizedInputHex) {
    return scale;
  }

  const vividContrast = resolveVividContrastRule(
    profile.vividContrast,
    distribution,
    normalizedInputHex
  );
  const plannedScale = applyPreInputChromaCurveShapeModel(
    scale,
    profile.chromaCurveContinuity,
    colorSpace
  );

  const initialPreservedInputAnchor = resolvePreservedInputAnchor({
    scale: plannedScale,
    distribution,
    colorSpace,
    inputPreservation,
    vividContrast,
    inputHex: normalizedInputHex
  });

  if (!initialPreservedInputAnchor) {
    return scale;
  }

  const preservedInputAnchor = resolveAnchorContinuityGuardedAnchor({
    scale: plannedScale,
    distribution,
    colorSpace,
    inputPreservation,
    vividContrast,
    inputHex: normalizedInputHex,
    initialAnchor: initialPreservedInputAnchor
  });
  const preservedAnchor = preservedInputAnchor.color;
  const anchoredScale = interpolateScaleThroughPreservedInput({
    scale: plannedScale,
    distribution,
    colorSpace,
    inputPreservation,
    inputAnchor: preservedAnchor,
    inputHex: normalizedInputHex,
    vividContrast,
    useLightestVividStart: preservedInputAnchor.bufferedFromVividBoundary,
    preservePlannedStructuralCurve:
      profile.chromaCurveContinuity?.curveShape?.applyBeforeInputPreservation === true
  });

  const vividSafeScale = applyPreservedInputVividContrast(
    anchoredScale,
    distribution,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );

  const continuityScale = applyNodeContinuityGuard(
    vividSafeScale,
    distribution,
    profile.nodeContinuity,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );

  const chromaSafeScale = applyChromaPeakGuard(
    continuityScale,
    profile.chromaPeak,
    colorSpace,
    preservedAnchor.tone,
    vividContrast?.startTone
  );
  const curveSafeScale = applyChromaCurveContinuityGuard(
    chromaSafeScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone,
    vividContrast?.startTone
  );
  const finalContinuityScale = applyNodeContinuityGuard(
    curveSafeScale,
    distribution,
    profile.nodeContinuity,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );

  const vividFinalScale = applyPreservedInputVividContrast(
    finalContinuityScale,
    distribution,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );
  const rhythmScale = applyFinalLightnessRhythmRedistribution(
    vividFinalScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );
  const contrastRhythmScale = applyPreservedInputVividContrast(
    rhythmScale,
    distribution,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );
  const monotonicScale = applyFinalLightnessMonotonicityGuard(
    contrastRhythmScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );
  const spacingScale = applyFinalLightnessSpacingGuard(
    monotonicScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );
  const expandedScale = applyProtectedAnchorLightnessRhythmExpansion(
    spacingScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );
  const exitRhythmScale = applyProtectedAnchorExitLightnessRhythm(
    expandedScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );
  const finalScale = applyLightZoneChromaValleyFloor(
    exitRhythmScale,
    profile.chromaCurveContinuity,
    colorSpace,
    preservedAnchor.tone
  );

  if (diagnostics) {
    diagnostics.plannedChromaCurve = resolveChromaCurveProjection(
      finalScale,
      profile.chromaCurveContinuity,
      preservedAnchor.tone,
      vividContrast?.startTone
    );
  }

  return finalScale;
}

type PreservedInputAnchor = {
  color: TonalScaleColor;
  bufferedFromVividBoundary: boolean;
};

type InputLightnessAnchor = {
  tone: ScaleTone;
  bufferedFromVividBoundary: boolean;
};

function resolvePreservedInputAnchor(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputHex: string;
}): PreservedInputAnchor | undefined {
  const { scale, distribution, colorSpace, inputPreservation, vividContrast, inputHex } = params;
  const inputLightnessAnchor =
    inputPreservation.anchorFit === 'input-lightness'
      ? resolveInputLightnessAnchor({
          distribution,
          colorSpace,
          inputPreservation,
          vividContrast,
          inputHex
        })
      : undefined;

  if (inputLightnessAnchor) {
    const anchorColor = scale.find((color) => color.tone === inputLightnessAnchor.tone);

    if (anchorColor && !isAbsoluteScaleCapTone(anchorColor.tone)) {
      return {
        color: anchorColor,
        bufferedFromVividBoundary: inputLightnessAnchor.bufferedFromVividBoundary
      };
    }
  }

  const chromaticLightEndTone = resolveChromaticLightEndTone(distribution);
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const lightZoneEnd =
    scale[resolveClosestScaleColorIndex(scale, inputPreservation.lightZoneEndTone)];
  const inputIsLightZoneColor =
    lightZoneEnd !== undefined &&
    resolveHexLightness(inputHex, colorSpace) >=
      resolveScaleColorLightness(lightZoneEnd, colorSpace);
  const inputBreaksVivid =
    vividContrast !== undefined &&
    contrastRatio(inputHex, vividContrast.foregroundHex) < vividContrast.minRatio;
  const candidates = scale.filter(
    (color) =>
      color.tone >= chromaticLightEndTone &&
      color.tone <= chromaticDarkEndTone &&
      !isAbsoluteScaleCapTone(color.tone) &&
      (!inputIsLightZoneColor || color.tone <= lightZoneEnd.tone) &&
      (!inputBreaksVivid || color.tone < vividContrast.startTone)
  );
  const fallbackCandidates = scale.filter((color) => !isAbsoluteScaleCapTone(color.tone));
  const availableCandidates = candidates.length > 0 ? candidates : fallbackCandidates;

  const nearestAnchor = availableCandidates.reduce<TonalScaleColor | undefined>(
    (current, color) =>
      !current || rgbDistance(color.hex, inputHex) < rgbDistance(current.hex, inputHex)
        ? color
        : current,
    undefined
  );

  return nearestAnchor
    ? resolveVividBoundaryBufferedAnchor({
        scale,
        inputPreservation,
        vividContrast,
        inputBreaksVivid,
        chromaticLightEndTone,
        nearestAnchor
      })
    : undefined;
}

function resolveInputLightnessAnchor(params: {
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputHex: string;
}): InputLightnessAnchor | undefined {
  const { distribution, colorSpace, inputPreservation, vividContrast, inputHex } = params;
  const chromaticLightEndTone = resolveChromaticLightEndTone(distribution);
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const inputTone = clamp(
    100 - resolveHexLightness(inputHex, colorSpace),
    chromaticLightEndTone,
    chromaticDarkEndTone
  );
  const inputBreaksVivid =
    vividContrast !== undefined &&
    contrastRatio(inputHex, vividContrast.foregroundHex) < vividContrast.minRatio;
  const inputIsLightZoneColor = inputTone <= inputPreservation.lightZoneEndTone;
  const chromaticSlots = [...distribution.slots]
    .filter(
      (slot) =>
        slot.position >= chromaticLightEndTone &&
        slot.position <= chromaticDarkEndTone &&
        !isAbsoluteScaleCapTone(slot.position)
    )
    .sort((left, right) => left.position - right.position);
  const candidates = chromaticSlots.filter(
    (slot) =>
      (!inputIsLightZoneColor || slot.position <= inputPreservation.lightZoneEndTone) &&
      (!inputBreaksVivid || !vividContrast || slot.position < vividContrast.startTone)
  );
  const availableCandidates = candidates.length > 0 ? candidates : chromaticSlots;
  const nearestSlot = availableCandidates.reduce<ScaleSlot | undefined>(
    (current, slot) =>
      !current || Math.abs(slot.position - inputTone) < Math.abs(current.position - inputTone)
        ? slot
        : current,
    undefined
  );

  if (!nearestSlot) {
    return undefined;
  }

  return resolveInputLightnessBoundaryBuffer({
    slots: chromaticSlots,
    inputPreservation,
    vividContrast,
    inputBreaksVivid,
    nearestSlot
  });
}

function resolveInputLightnessBoundaryBuffer(params: {
  slots: ScaleSlot[];
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputBreaksVivid: boolean;
  nearestSlot: ScaleSlot;
}): InputLightnessAnchor {
  const { slots, inputPreservation, vividContrast, inputBreaksVivid, nearestSlot } = params;
  const buffer = inputPreservation.vividBoundaryBuffer;

  if (!buffer || !vividContrast || !inputBreaksVivid) {
    return { tone: nearestSlot.position, bufferedFromVividBoundary: false };
  }

  const nearestSlotIndex = slots.findIndex((slot) => slot.id === nearestSlot.id);
  const lastPreVividIndex = slots.reduce(
    (lastIndex, slot, index) => (slot.position < vividContrast.startTone ? index : lastIndex),
    -1
  );

  if (nearestSlotIndex !== lastPreVividIndex) {
    return { tone: nearestSlot.position, bufferedFromVividBoundary: false };
  }

  const bufferedSlot = slots[Math.max(0, nearestSlotIndex - buffer.rewindSlots)];

  return bufferedSlot
    ? { tone: bufferedSlot.position, bufferedFromVividBoundary: true }
    : { tone: nearestSlot.position, bufferedFromVividBoundary: false };
}

function resolveVividBoundaryBufferedAnchor(params: {
  scale: TonalScaleColor[];
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputBreaksVivid: boolean;
  chromaticLightEndTone: ScaleTone;
  nearestAnchor: TonalScaleColor;
}): PreservedInputAnchor {
  const {
    scale,
    inputPreservation,
    vividContrast,
    inputBreaksVivid,
    chromaticLightEndTone,
    nearestAnchor
  } = params;
  const buffer = inputPreservation.vividBoundaryBuffer;

  if (!buffer || !vividContrast || !inputBreaksVivid) {
    return { color: nearestAnchor, bufferedFromVividBoundary: false };
  }

  const nearestAnchorIndex = scale.findIndex((color) => color.id === nearestAnchor.id);
  const lastPreVividIndex = scale.reduce(
    (lastIndex, color, index) =>
      !isAbsoluteScaleCapTone(color.tone) &&
      color.tone >= chromaticLightEndTone &&
      color.tone < vividContrast.startTone
        ? index
        : lastIndex,
    -1
  );

  if (nearestAnchorIndex !== lastPreVividIndex) {
    return { color: nearestAnchor, bufferedFromVividBoundary: false };
  }

  const bufferedAnchor = scale[Math.max(0, nearestAnchorIndex - buffer.rewindSlots)];

  return bufferedAnchor && !isAbsoluteScaleCapTone(bufferedAnchor.tone)
    ? { color: bufferedAnchor, bufferedFromVividBoundary: true }
    : { color: nearestAnchor, bufferedFromVividBoundary: false };
}

function resolveAnchorContinuityGuardedAnchor(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputHex: string;
  initialAnchor: PreservedInputAnchor;
}): PreservedInputAnchor {
  const { inputPreservation, vividContrast, colorSpace } = params;
  const rule = inputPreservation.anchorContinuity;

  if (!rule || !vividContrast || colorSpace !== 'oklch') {
    return params.initialAnchor;
  }

  const inputBreaksVivid =
    contrastRatio(params.inputHex, vividContrast.foregroundHex) < vividContrast.minRatio;
  let currentAnchor = params.initialAnchor;

  for (let iteration = 0; iteration < rule.maxRewindSlots; iteration += 1) {
    if (!canGuardPreservedAnchorExit(currentAnchor.color, inputPreservation, vividContrast)) {
      return currentAnchor;
    }

    const candidateScale = createVividSafePreservedInputScale({
      scale: params.scale,
      distribution: params.distribution,
      colorSpace,
      inputPreservation,
      inputAnchor: currentAnchor,
      inputHex: params.inputHex,
      vividContrast
    });
    const issue = resolvePreservedAnchorExitContinuityIssue(
      candidateScale,
      currentAnchor.color.tone,
      rule,
      vividContrast.startTone,
      colorSpace,
      inputBreaksVivid
    );

    if (!issue) {
      return currentAnchor;
    }

    const previousAnchor = resolvePreviousPreservedAnchorCandidate({
      scale: params.scale,
      currentAnchor: currentAnchor.color,
      inputPreservation,
      vividContrast
    });

    if (!previousAnchor) {
      return currentAnchor;
    }

    currentAnchor = {
      color: previousAnchor,
      bufferedFromVividBoundary: currentAnchor.bufferedFromVividBoundary
    };
  }

  return currentAnchor;
}

function createVividSafePreservedInputScale(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  inputAnchor: PreservedInputAnchor;
  inputHex: string;
  vividContrast: VividContrastRule | undefined;
}): TonalScaleColor[] {
  const anchoredScale = interpolateScaleThroughPreservedInput({
    scale: params.scale,
    distribution: params.distribution,
    colorSpace: params.colorSpace,
    inputPreservation: params.inputPreservation,
    inputAnchor: params.inputAnchor.color,
    inputHex: params.inputHex,
    vividContrast: params.vividContrast,
    useLightestVividStart: params.inputAnchor.bufferedFromVividBoundary
  });

  return applyPreservedInputVividContrast(
    anchoredScale,
    params.distribution,
    params.vividContrast,
    params.colorSpace,
    params.inputAnchor.color.tone
  );
}

function canGuardPreservedAnchorExit(
  anchor: TonalScaleColor,
  inputPreservation: InputPreservationRule,
  vividContrast: VividContrastRule
): boolean {
  return anchor.tone > inputPreservation.lightZoneEndTone && anchor.tone < vividContrast.startTone;
}

function resolvePreviousPreservedAnchorCandidate(params: {
  scale: TonalScaleColor[];
  currentAnchor: TonalScaleColor;
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule;
}): TonalScaleColor | undefined {
  const { scale, currentAnchor, inputPreservation, vividContrast } = params;
  const currentAnchorIndex = scale.findIndex((color) => color.id === currentAnchor.id);

  if (currentAnchorIndex <= 0) {
    return undefined;
  }

  for (let index = currentAnchorIndex - 1; index >= 0; index -= 1) {
    const candidate = scale[index];

    if (
      candidate &&
      !isAbsoluteScaleCapTone(candidate.tone) &&
      candidate.tone > inputPreservation.lightZoneEndTone &&
      candidate.tone < vividContrast.startTone
    ) {
      return candidate;
    }
  }

  return undefined;
}

function resolvePreservedAnchorExitContinuityIssue(
  scale: TonalScaleColor[],
  anchorTone: ScaleTone,
  rule: PreservedAnchorContinuityRule,
  vividStartTone: ScaleTone,
  colorSpace: ColorInterpolationSpace,
  inputBreaksVivid: boolean
): boolean {
  const anchorIndex = scale.findIndex((color) => color.tone === anchorTone);

  if (anchorIndex === -1) {
    return false;
  }

  const beforeAverage = averageDefinedNumbers(
    Array.from({ length: rule.sampleSize }, (_, offset) =>
      resolveStepLightnessDelta(scale, anchorIndex - offset, colorSpace)
    )
  );
  const afterAverage = averageDefinedNumbers(
    Array.from({ length: rule.sampleSize }, (_, offset) =>
      resolveStepLightnessDelta(scale, anchorIndex + offset + 1, colorSpace)
    )
  );

  if (beforeAverage === undefined || afterAverage === undefined) {
    return false;
  }

  const threshold = resolvePreservedAnchorContinuityThreshold(
    scale,
    anchorIndex,
    vividStartTone,
    rule,
    inputBreaksVivid
  );

  return (
    Math.abs(afterAverage) > Math.abs(beforeAverage) * threshold.maxSlopeRatio + threshold.tolerance
  );
}

function resolvePreservedAnchorContinuityThreshold(
  scale: TonalScaleColor[],
  anchorIndex: number,
  vividStartTone: ScaleTone,
  rule: PreservedAnchorContinuityRule,
  inputBreaksVivid: boolean
): { maxSlopeRatio: number; tolerance: number } {
  const next = scale[anchorIndex + 1];

  if (next?.tone === vividStartTone && rule.adjacentVividBoundary) {
    return rule.adjacentVividBoundary;
  }

  const vividStartIndex = scale.findIndex((color) => color.tone === vividStartTone);
  const emittedDistanceToVividStart = vividStartIndex - anchorIndex;

  return inputBreaksVivid &&
    rule.nearVividBoundary &&
    emittedDistanceToVividStart > 0 &&
    emittedDistanceToVividStart <= rule.nearVividBoundary.maxDistance
    ? rule.nearVividBoundary
    : rule;
}

function interpolateScaleThroughPreservedInput(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  inputAnchor: TonalScaleColor;
  inputHex: string;
  vividContrast?: VividContrastRule;
  useLightestVividStart: boolean;
  preservePlannedStructuralCurve?: boolean;
}): TonalScaleColor[] {
  const {
    scale,
    distribution,
    colorSpace,
    inputPreservation,
    inputAnchor,
    inputHex,
    vividContrast,
    useLightestVividStart,
    preservePlannedStructuralCurve
  } = params;
  const anchorByIndex = new Map<number, TonalScaleColor>();
  const structuralAnchorTones = [
    resolveChromaticLightEndTone(distribution),
    inputPreservation.lightZoneEndTone,
    vividContrast?.startTone,
    resolveChromaticDarkEndTone(distribution)
  ];

  for (const tone of structuralAnchorTones) {
    if (tone === undefined) {
      continue;
    }

    const anchorIndex = resolveClosestScaleColorIndex(scale, tone);
    const anchorColor = scale[anchorIndex];

    if (anchorColor && !isAbsoluteScaleCapTone(anchorColor.tone)) {
      anchorByIndex.set(
        anchorIndex,
        useLightestVividStart && vividContrast && anchorColor.tone === vividContrast.startTone
          ? createLightestVividStartColor(anchorColor, vividContrast, colorSpace)
          : anchorColor
      );
    }
  }

  const inputAnchorIndex = scale.findIndex((color) => color.id === inputAnchor.id);

  if (inputAnchorIndex === -1) {
    return scale;
  }

  const inputAnchorIsStructural = anchorByIndex.has(inputAnchorIndex);
  anchorByIndex.set(inputAnchorIndex, createScaleColorFromHex(inputAnchor, inputHex));

  const anchors = [...anchorByIndex.entries()]
    .map(([index, color]) => ({ index, color }))
    .sort((left, right) => left.index - right.index);

  if (preservePlannedStructuralCurve) {
    return interpolateOnlyPreservedInputSegment({
      scale,
      anchorByIndex,
      anchors,
      inputAnchorIndex,
      inputAnchorIsStructural,
      colorSpace
    });
  }

  return scale.map((color, index) => {
    if (isAbsoluteScaleCapTone(color.tone)) {
      return color;
    }

    const anchor = anchorByIndex.get(index);

    if (anchor) {
      return anchor;
    }

    const previousAnchor = [...anchors].reverse().find((candidate) => candidate.index < index);
    const nextAnchor = anchors.find((candidate) => candidate.index > index);

    if (!previousAnchor || !nextAnchor) {
      return color;
    }

    return createInterpolatedScaleColor(
      color,
      previousAnchor.color,
      nextAnchor.color,
      normalizedProgress(index, previousAnchor.index, nextAnchor.index),
      colorSpace
    );
  });
}

function interpolateOnlyPreservedInputSegment(params: {
  scale: TonalScaleColor[];
  anchorByIndex: Map<number, TonalScaleColor>;
  anchors: { index: number; color: TonalScaleColor }[];
  inputAnchorIndex: number;
  inputAnchorIsStructural: boolean;
  colorSpace: ColorInterpolationSpace;
}): TonalScaleColor[] {
  const { scale, anchorByIndex, anchors, inputAnchorIndex, inputAnchorIsStructural, colorSpace } =
    params;
  const inputAnchor = anchors.find((candidate) => candidate.index === inputAnchorIndex);
  const previousAnchor = [...anchors]
    .reverse()
    .find((candidate) => candidate.index < inputAnchorIndex);
  const nextAnchor = anchors.find((candidate) => candidate.index > inputAnchorIndex);

  return scale.map((color, index) => {
    if (isAbsoluteScaleCapTone(color.tone)) {
      return color;
    }

    const anchor = anchorByIndex.get(index);

    if (anchor) {
      return anchor;
    }

    if (
      inputAnchorIsStructural ||
      !inputAnchor ||
      !previousAnchor ||
      !nextAnchor ||
      index <= previousAnchor.index ||
      index >= nextAnchor.index
    ) {
      return color;
    }

    const segmentStart = index < inputAnchorIndex ? previousAnchor : inputAnchor;
    const segmentEnd = index < inputAnchorIndex ? inputAnchor : nextAnchor;

    if (!segmentStart || !segmentEnd) {
      return color;
    }

    return createInterpolatedScaleColor(
      color,
      segmentStart.color,
      segmentEnd.color,
      normalizedProgress(index, segmentStart.index, segmentEnd.index),
      colorSpace
    );
  });
}

function createLightestVividStartColor(
  color: TonalScaleColor,
  vividContrast: VividContrastRule,
  colorSpace: ColorInterpolationSpace
): TonalScaleColor {
  return createScaleColorWithLightness(
    color,
    colorSpace,
    resolveMaxLightnessForContrast(
      color,
      colorSpace,
      vividContrast.foregroundHex,
      vividContrast.minRatio
    )
  );
}

function applyPreservedInputVividContrast(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  vividContrast: VividContrastRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  if (!vividContrast) {
    return scale;
  }

  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);

  return scale.map((color) => {
    if (
      color.tone < vividContrast.startTone ||
      color.tone > chromaticDarkEndTone ||
      isAbsoluteScaleCapTone(color.tone)
    ) {
      return color;
    }

    if (
      color.tone === preservedInputTone &&
      contrastRatio(color.hex, vividContrast.foregroundHex) >= vividContrast.minRatio
    ) {
      return color;
    }

    const currentLightness = resolveScaleColorLightness(color, colorSpace);
    const maxLightness = resolveMaxLightnessForContrast(
      color,
      colorSpace,
      vividContrast.foregroundHex,
      vividContrast.minRatio
    );

    return currentLightness <= maxLightness
      ? color
      : createScaleColorWithLightness(color, colorSpace, maxLightness);
  });
}

type NodeContinuityIssue = {
  nodeIndex: number;
  side: 'entry' | 'exit';
  limit: number;
  overshoot: number;
};

function applyNodeContinuityGuard(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  rule: NodeContinuityRule | undefined,
  vividContrast: VividContrastRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  if (!rule) {
    return scale;
  }

  let currentScale = scale;

  for (let iteration = 0; iteration < rule.maxIterations; iteration += 1) {
    let changed = false;

    for (const nodeTone of rule.nodeTones) {
      const nodeIndex = currentScale.findIndex((color) => color.tone === nodeTone);

      if (nodeIndex === -1) {
        continue;
      }

      const issue = resolveNodeContinuityIssue(
        currentScale,
        nodeIndex,
        rule,
        colorSpace,
        preservedInputTone
      );

      if (!issue) {
        continue;
      }

      const adjustedScale = smoothNodeContinuityIssue({
        scale: currentScale,
        distribution,
        rule,
        issue,
        vividContrast,
        colorSpace,
        preservedInputTone
      });

      if (adjustedScale !== currentScale) {
        currentScale = applyPreservedInputVividContrast(
          adjustedScale,
          distribution,
          vividContrast,
          colorSpace,
          preservedInputTone
        );
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  return applyPreservedInputVividContrast(
    currentScale,
    distribution,
    vividContrast,
    colorSpace,
    preservedInputTone
  );
}

function resolveNodeContinuityIssue(
  scale: TonalScaleColor[],
  nodeIndex: number,
  rule: NodeContinuityRule,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): NodeContinuityIssue | undefined {
  const entryDelta = resolveStepLightnessDelta(scale, nodeIndex, colorSpace);
  const entryBeforeDelta = resolveStepLightnessDelta(scale, nodeIndex - 1, colorSpace);
  const entryAfterDelta = resolveStepLightnessDelta(scale, nodeIndex + 1, colorSpace);
  const exitDelta = resolveStepLightnessDelta(scale, nodeIndex + 1, colorSpace);
  const exitBeforeDelta = resolveStepLightnessDelta(scale, nodeIndex, colorSpace);
  const exitAfterDelta = resolveStepLightnessDelta(scale, nodeIndex + 2, colorSpace);
  const issues = [
    createNodeContinuityIssue({
      nodeIndex,
      side: 'entry',
      delta: entryDelta,
      previousDelta: entryBeforeDelta,
      nextDelta: entryAfterDelta,
      rule,
      scale,
      preservedInputTone
    }),
    createNodeContinuityIssue({
      nodeIndex,
      side: 'exit',
      delta: exitDelta,
      previousDelta: exitBeforeDelta,
      nextDelta: exitAfterDelta,
      rule,
      scale,
      preservedInputTone
    })
  ].filter((issue): issue is NodeContinuityIssue => issue !== undefined);

  return issues.sort((left, right) => right.overshoot - left.overshoot)[0];
}

function createNodeContinuityIssue(params: {
  nodeIndex: number;
  side: NodeContinuityIssue['side'];
  delta: number | undefined;
  previousDelta: number | undefined;
  nextDelta: number | undefined;
  rule: NodeContinuityRule;
  scale: TonalScaleColor[];
  preservedInputTone: ScaleTone;
}): NodeContinuityIssue | undefined {
  const { nodeIndex, side, delta, previousDelta, nextDelta } = params;

  if (delta === undefined || previousDelta === undefined || nextDelta === undefined) {
    return undefined;
  }

  const absoluteDelta = Math.abs(delta);
  const limit = resolveNodeContinuityLimit({
    nodeIndex,
    side,
    previousDelta,
    nextDelta,
    rule: params.rule,
    scale: params.scale,
    preservedInputTone: params.preservedInputTone
  });
  const overshoot = absoluteDelta - limit;

  return overshoot > 0.01 ? { nodeIndex, side, limit, overshoot } : undefined;
}

function resolveNodeContinuityLimit(params: {
  nodeIndex: number;
  side: NodeContinuityIssue['side'];
  previousDelta: number;
  nextDelta: number;
  rule: NodeContinuityRule;
  scale: TonalScaleColor[];
  preservedInputTone: ScaleTone;
}): number {
  const { nodeIndex, side, previousDelta, nextDelta, rule, scale, preservedInputTone } = params;
  const protectedAnchorLimit = resolveProtectedAnchorAdjacentSeamLimit({
    nodeIndex,
    side,
    previousDelta,
    rule,
    scale,
    preservedInputTone
  });

  if (protectedAnchorLimit !== undefined) {
    return protectedAnchorLimit;
  }

  return (
    Math.max(Math.abs(previousDelta), Math.abs(nextDelta)) * rule.maxNeighborRatio + rule.tolerance
  );
}

function resolveProtectedAnchorAdjacentSeamLimit(params: {
  nodeIndex: number;
  side: NodeContinuityIssue['side'];
  previousDelta: number;
  rule: NodeContinuityRule;
  scale: TonalScaleColor[];
  preservedInputTone: ScaleTone;
}): number | undefined {
  const { nodeIndex, side, previousDelta, rule, scale, preservedInputTone } = params;
  const seamRule = rule.protectedAnchorAdjacentSeam;

  if (!seamRule) {
    return undefined;
  }

  const node = scale[nodeIndex];
  const previous = scale[nodeIndex - 1];
  const seamTouchesProtectedAnchor =
    (side === 'entry' && previous?.tone === preservedInputTone) ||
    (side === 'exit' && node?.tone === preservedInputTone);

  return seamTouchesProtectedAnchor
    ? Math.abs(previousDelta) * seamRule.maxNeighborRatio + seamRule.tolerance
    : undefined;
}

function smoothNodeContinuityIssue(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  rule: NodeContinuityRule;
  issue: NodeContinuityIssue;
  vividContrast: VividContrastRule | undefined;
  colorSpace: ColorInterpolationSpace;
  preservedInputTone: ScaleTone;
}): TonalScaleColor[] {
  return params.issue.side === 'entry'
    ? smoothNodeEntryContinuity(params)
    : smoothNodeExitContinuity(params);
}

function smoothNodeEntryContinuity(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  rule: NodeContinuityRule;
  issue: NodeContinuityIssue;
  vividContrast: VividContrastRule | undefined;
  colorSpace: ColorInterpolationSpace;
  preservedInputTone: ScaleTone;
}): TonalScaleColor[] {
  const { scale, distribution, rule, issue, vividContrast, colorSpace, preservedInputTone } =
    params;
  const node = scale[issue.nodeIndex];
  const previous = scale[issue.nodeIndex - 1];

  if (!node || !previous) {
    return scale;
  }

  if (canAdjustContinuityColor(node, preservedInputTone)) {
    const targetLightness = resolveContinuityLightnessTarget(
      node,
      resolveScaleColorLightness(previous, colorSpace) - issue.limit,
      distribution,
      vividContrast,
      colorSpace
    );
    const adjustedNode = createContinuityAdjustedColor(node, colorSpace, targetLightness);
    const nextBoundaryIndex = resolveNextContinuityBoundaryIndex(
      scale,
      issue.nodeIndex,
      distribution,
      rule
    );

    if (adjustedNode !== node && nextBoundaryIndex > issue.nodeIndex) {
      return interpolateContinuitySegment({
        scale,
        startIndex: issue.nodeIndex,
        startColor: adjustedNode,
        endIndex: nextBoundaryIndex,
        endColor: scale[nextBoundaryIndex],
        colorSpace,
        preservedInputTone
      });
    }
  }

  if (!canAdjustContinuityColor(previous, preservedInputTone)) {
    return scale;
  }

  const targetPrevious = createContinuityAdjustedColor(
    previous,
    colorSpace,
    resolveScaleColorLightness(node, colorSpace) + issue.limit
  );
  const previousBoundaryIndex = resolvePreviousContinuityBoundaryIndex(
    scale,
    issue.nodeIndex,
    distribution,
    rule
  );

  return targetPrevious !== previous && previousBoundaryIndex < issue.nodeIndex - 1
    ? interpolateContinuitySegment({
        scale,
        startIndex: previousBoundaryIndex,
        startColor: scale[previousBoundaryIndex],
        endIndex: issue.nodeIndex - 1,
        endColor: targetPrevious,
        colorSpace,
        preservedInputTone
      })
    : scale;
}

function smoothNodeExitContinuity(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  rule: NodeContinuityRule;
  issue: NodeContinuityIssue;
  vividContrast: VividContrastRule | undefined;
  colorSpace: ColorInterpolationSpace;
  preservedInputTone: ScaleTone;
}): TonalScaleColor[] {
  const { scale, distribution, rule, issue, vividContrast, colorSpace, preservedInputTone } =
    params;
  const node = scale[issue.nodeIndex];
  const next = scale[issue.nodeIndex + 1];

  if (!node || !next) {
    return scale;
  }

  if (canAdjustContinuityColor(next, preservedInputTone)) {
    const targetNextLightness = resolveContinuityLightnessTarget(
      next,
      resolveScaleColorLightness(node, colorSpace) - issue.limit,
      distribution,
      vividContrast,
      colorSpace
    );
    const adjustedNext = createContinuityAdjustedColor(next, colorSpace, targetNextLightness);
    const nextBoundaryIndex = resolveNextContinuityBoundaryIndex(
      scale,
      issue.nodeIndex,
      distribution,
      rule
    );

    if (adjustedNext !== next && nextBoundaryIndex > issue.nodeIndex + 1) {
      return interpolateContinuitySegment({
        scale,
        startIndex: issue.nodeIndex,
        startColor: node,
        endIndex: nextBoundaryIndex,
        endColor: scale[nextBoundaryIndex],
        extraAnchors: [{ index: issue.nodeIndex + 1, color: adjustedNext }],
        colorSpace,
        preservedInputTone
      });
    }
  }

  if (!canAdjustContinuityColor(node, preservedInputTone)) {
    return scale;
  }

  const targetNodeLightness = resolveContinuityLightnessTarget(
    node,
    resolveScaleColorLightness(next, colorSpace) + issue.limit,
    distribution,
    vividContrast,
    colorSpace
  );
  const adjustedNode = createContinuityAdjustedColor(node, colorSpace, targetNodeLightness);
  const previousBoundaryIndex = resolvePreviousContinuityBoundaryIndex(
    scale,
    issue.nodeIndex,
    distribution,
    rule
  );

  return adjustedNode !== node && previousBoundaryIndex < issue.nodeIndex
    ? interpolateContinuitySegment({
        scale,
        startIndex: previousBoundaryIndex,
        startColor: scale[previousBoundaryIndex],
        endIndex: issue.nodeIndex,
        endColor: adjustedNode,
        colorSpace,
        preservedInputTone
      })
    : scale;
}

function resolveContinuityLightnessTarget(
  color: TonalScaleColor,
  targetLightness: number,
  distribution: ScaleDistribution,
  vividContrast: VividContrastRule | undefined,
  colorSpace: ColorInterpolationSpace
): number {
  if (
    vividContrast &&
    color.tone >= vividContrast.startTone &&
    color.tone <= resolveChromaticDarkEndTone(distribution)
  ) {
    return Math.min(
      targetLightness,
      resolveMaxLightnessForContrast(
        color,
        colorSpace,
        vividContrast.foregroundHex,
        vividContrast.minRatio
      )
    );
  }

  return targetLightness;
}

function createContinuityAdjustedColor(
  color: TonalScaleColor,
  colorSpace: ColorInterpolationSpace,
  targetLightness: number
): TonalScaleColor {
  const currentLightness = resolveScaleColorLightness(color, colorSpace);

  if (Math.abs(currentLightness - targetLightness) < 0.01) {
    return color;
  }

  return createScaleColorWithLightness(color, colorSpace, clamp(targetLightness, 0, 100));
}

function interpolateContinuitySegment(params: {
  scale: TonalScaleColor[];
  startIndex: number;
  startColor: TonalScaleColor;
  endIndex: number;
  endColor: TonalScaleColor;
  extraAnchors?: Array<{ index: number; color: TonalScaleColor }>;
  colorSpace: ColorInterpolationSpace;
  preservedInputTone: ScaleTone;
}): TonalScaleColor[] {
  const {
    scale,
    startIndex,
    startColor,
    endIndex,
    endColor,
    extraAnchors = [],
    colorSpace,
    preservedInputTone
  } = params;
  const anchorByIndex = new Map<number, TonalScaleColor>([
    [startIndex, startColor],
    [endIndex, endColor]
  ]);
  const preservedInputIndex = scale.findIndex((color) => color.tone === preservedInputTone);

  if (preservedInputIndex > startIndex && preservedInputIndex < endIndex) {
    anchorByIndex.set(preservedInputIndex, scale[preservedInputIndex]);
  }

  for (const { index, color } of extraAnchors) {
    anchorByIndex.set(index, color);
  }

  const anchors = [...anchorByIndex.entries()]
    .map(([index, color]) => ({ index, color }))
    .sort((left, right) => left.index - right.index);

  return scale.map((color, index) => {
    if (index < startIndex || index > endIndex || isAbsoluteScaleCapTone(color.tone)) {
      return color;
    }

    const anchor = anchorByIndex.get(index);

    if (anchor) {
      return anchor;
    }

    const previousAnchor = [...anchors].reverse().find((candidate) => candidate.index < index);
    const nextAnchor = anchors.find((candidate) => candidate.index > index);

    if (!previousAnchor || !nextAnchor) {
      return color;
    }

    return createInterpolatedScaleColor(
      color,
      previousAnchor.color,
      nextAnchor.color,
      normalizedProgress(index, previousAnchor.index, nextAnchor.index),
      colorSpace
    );
  });
}

function resolvePreviousContinuityBoundaryIndex(
  scale: TonalScaleColor[],
  nodeIndex: number,
  distribution: ScaleDistribution,
  rule: NodeContinuityRule
): number {
  return (
    resolveContinuityBoundaryIndexes(scale, distribution, rule)
      .filter((index) => index < nodeIndex)
      .at(-1) ?? 0
  );
}

function resolveNextContinuityBoundaryIndex(
  scale: TonalScaleColor[],
  nodeIndex: number,
  distribution: ScaleDistribution,
  rule: NodeContinuityRule
): number {
  return (
    resolveContinuityBoundaryIndexes(scale, distribution, rule).find(
      (index) => index > nodeIndex
    ) ?? scale.length - 1
  );
}

function resolveContinuityBoundaryIndexes(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  rule: NodeContinuityRule
): number[] {
  return [
    resolveChromaticLightEndTone(distribution),
    ...rule.nodeTones,
    resolveChromaticDarkEndTone(distribution)
  ]
    .map((tone) => scale.findIndex((color) => color.tone === tone))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right);
}

function canAdjustContinuityColor(color: TonalScaleColor, preservedInputTone: ScaleTone): boolean {
  return color.tone !== preservedInputTone && !isAbsoluteScaleCapTone(color.tone);
}

type ChromaCurveContinuityIssue = {
  index: number;
  turnDegrees: number;
  overshoot: number;
};

function applyChromaCurveContinuityGuard(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  if (!rule || colorSpace !== 'oklch') {
    return scale;
  }

  let currentScale = scale;

  for (let iteration = 0; iteration < rule.maxIterations; iteration += 1) {
    const issue = resolveChromaCurveContinuityIssue(currentScale, rule);

    if (!issue) {
      break;
    }

    const issueColor = currentScale[issue.index];
    const nextScale =
      issueColor.tone === preservedInputTone
        ? smoothProtectedChromaCurveIssue(
            currentScale,
            rule,
            issue.index,
            preservedInputTone,
            vividStartTone
          )
        : smoothAdjustableChromaCurveIssue(currentScale, rule, issue.index, preservedInputTone);

    if (nextScale === currentScale) {
      break;
    }

    currentScale = nextScale;
  }

  const protectedAnchorIndex = currentScale.findIndex((color) => color.tone === preservedInputTone);
  const shoulderScale =
    protectedAnchorIndex >= 0
      ? applyForwardApexShoulder(
          currentScale,
          rule,
          protectedAnchorIndex,
          preservedInputTone,
          vividStartTone
        )
      : currentScale;

  return applyChromaCurveShapeModel(shoulderScale, rule, preservedInputTone);
}

function applyPreInputChromaCurveShapeModel(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace
): TonalScaleColor[] {
  if (!rule?.curveShape?.applyBeforeInputPreservation || colorSpace !== 'oklch') {
    return scale;
  }

  return applyChromaCurveShapeModel(scale, rule);
}

function resolveChromaCurveContinuityIssue(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule
): ChromaCurveContinuityIssue | undefined {
  const issues = scale
    .map((color, index) => {
      if (isAbsoluteScaleCapTone(color.tone)) {
        return undefined;
      }

      const previous = scale[index - 1];
      const next = scale[index + 1];

      if (
        !previous ||
        !next ||
        isAbsoluteScaleCapTone(previous.tone) ||
        isAbsoluteScaleCapTone(next.tone)
      ) {
        return undefined;
      }

      const previousPoint = resolveVisualCurvePoint(previous, rule);
      const currentPoint = resolveVisualCurvePoint(color, rule);
      const nextPoint = resolveVisualCurvePoint(next, rule);
      const incoming = {
        x: currentPoint.x - previousPoint.x,
        y: currentPoint.y - previousPoint.y
      };
      const outgoing = {
        x: nextPoint.x - currentPoint.x,
        y: nextPoint.y - currentPoint.y
      };

      if (
        resolveVectorLength(incoming) < rule.minSegmentLength ||
        resolveVectorLength(outgoing) < rule.minSegmentLength
      ) {
        return undefined;
      }

      const turnDegrees = resolveTurnDegrees(incoming, outgoing);
      const overshoot = turnDegrees - rule.maxTurnDegrees;

      return overshoot > 0 ? { index, turnDegrees, overshoot } : undefined;
    })
    .filter((issue): issue is ChromaCurveContinuityIssue => issue !== undefined);

  return issues.sort((left, right) => right.overshoot - left.overshoot)[0];
}

function smoothAdjustableChromaCurveIssue(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  issueIndex: number,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const previous = scale[issueIndex - 1];
  const color = scale[issueIndex];
  const next = scale[issueIndex + 1];

  if (!previous || !color || !next || color.tone === preservedInputTone) {
    return scale;
  }

  const previousChroma = hexToOklch(previous.hex).c;
  const currentChroma = hexToOklch(color.hex).c;
  const nextChroma = hexToOklch(next.hex).c;
  const targetChroma = interpolate(
    currentChroma,
    (previousChroma + nextChroma) / 2,
    rule.smoothingStrength
  );
  const adjustedColor = createScaleColorWithChroma(color, targetChroma);

  return adjustedColor === color
    ? scale
    : scale.map((entry, index) => (index === issueIndex ? adjustedColor : entry));
}

function smoothProtectedChromaCurveIssue(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  protectedAnchorIndex: number,
  preservedInputTone: ScaleTone,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  const forwardShoulderScale = applyForwardApexShoulder(
    scale,
    rule,
    protectedAnchorIndex,
    preservedInputTone,
    vividStartTone
  );

  return forwardShoulderScale !== scale
    ? forwardShoulderScale
    : applyProtectedApexShoulder(scale, rule, protectedAnchorIndex, preservedInputTone);
}

function applyForwardApexShoulder(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  protectedAnchorIndex: number,
  preservedInputTone: ScaleTone,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  const anchor = scale[protectedAnchorIndex];
  const vividStartIndex =
    vividStartTone === undefined ? -1 : scale.findIndex((color) => color.tone === vividStartTone);

  if (
    !anchor ||
    vividStartTone === undefined ||
    vividStartIndex <= protectedAnchorIndex ||
    anchor.tone >= vividStartTone
  ) {
    return scale;
  }

  const incomingDelta = resolveIncomingChromaMomentum(
    scale,
    protectedAnchorIndex,
    rule.forwardApexShoulder.sampleSize
  );
  const next = scale[protectedAnchorIndex + 1];
  const outgoingDelta = next ? hexToOklch(next.hex).c - hexToOklch(anchor.hex).c : undefined;

  if (
    incomingDelta === undefined ||
    outgoingDelta === undefined ||
    incomingDelta < rule.forwardApexShoulder.minIncomingDelta ||
    outgoingDelta > incomingDelta * rule.forwardApexShoulder.maxExitDeltaRatio
  ) {
    return scale;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const anchorHue = hexToOklch(anchor.hex).h;
  const hueDriftSign = resolveForwardApexHueDriftSign(
    scale,
    rule,
    protectedAnchorIndex,
    vividStartIndex,
    incomingDelta
  );
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let index = protectedAnchorIndex + 1; index < vividStartIndex; index += 1) {
    const color = scale[index];

    if (!color || color.tone === preservedInputTone || isAbsoluteScaleCapTone(color.tone)) {
      continue;
    }

    const progress = normalizedProgress(index, protectedAnchorIndex, vividStartIndex);
    const shoulderProgress = resolveForwardApexShoulderProgress(
      progress,
      rule.forwardApexShoulder.peakProgress,
      rule.forwardApexShoulder.progressGamma
    );
    const targetChroma =
      anchorChroma + incomingDelta * rule.forwardApexShoulder.liftRatio * shoulderProgress;
    const hueDrift =
      hueDriftSign *
      rule.forwardApexShoulder.maxHueDrift *
      (1 - progress) ** rule.forwardApexShoulder.progressGamma;
    const currentChroma = hexToOklch(color.hex).c;

    if (currentChroma >= targetChroma) {
      continue;
    }

    adjustedByIndex.set(
      index,
      createScaleColorWithForwardChromaShoulder(
        color,
        targetChroma,
        rule.forwardApexShoulder.maxLightnessDrop,
        hueDrift,
        anchorHue,
        rule.forwardApexShoulder.maxHueDrift,
        rule.forwardApexShoulder.minHueDriftChromaGain
      )
    );
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function applyProtectedApexShoulder(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  protectedAnchorIndex: number,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const anchor = scale[protectedAnchorIndex];

  if (!anchor) {
    return scale;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const baseDrop = Math.max(
    rule.protectedApexShoulder.dropMin,
    anchorChroma * rule.protectedApexShoulder.dropRatio
  );
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let distance = 1; distance <= rule.protectedApexShoulder.radius; distance += 1) {
    const targetChroma = Math.max(
      0,
      anchorChroma - baseDrop * distance ** rule.protectedApexShoulder.dropGamma
    );

    for (const index of [protectedAnchorIndex - distance, protectedAnchorIndex + distance]) {
      const color = scale[index];

      if (!color || color.tone === preservedInputTone || isAbsoluteScaleCapTone(color.tone)) {
        continue;
      }

      const currentChroma = hexToOklch(color.hex).c;

      if (currentChroma >= targetChroma) {
        continue;
      }

      adjustedByIndex.set(
        index,
        createScaleColorWithChromaShoulder(
          color,
          targetChroma,
          index < protectedAnchorIndex ? rule.protectedApexShoulder.lightSideMaxLightnessDrop : 0
        )
      );
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

type ChromaCurveResolvedShapeSegment = {
  startIndex: number;
  endIndex: number;
};

type ChromaCurveBellPoint = ChromaCurveProjectionPoint & {
  sourceIndex?: number;
};

type ChromaCurveBellSpline = {
  points: ChromaCurveBellPoint[];
  tangents: number[];
  apexLightness: number;
};

function applyChromaCurveShapeModel(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  preservedInputTone?: ScaleTone
): TonalScaleColor[] {
  const curveShape = rule.curveShape;

  if (!curveShape) {
    return scale;
  }

  const chromaticIndexes = scale
    .map((color, index) => (isAbsoluteScaleCapTone(color.tone) ? undefined : index))
    .filter((index): index is number => index !== undefined);
  const apexIndex = resolveChromaCurveApexIndex(scale, chromaticIndexes);

  if (apexIndex === undefined) {
    return scale;
  }

  const firstIndex = chromaticIndexes[0];
  const lastIndex = chromaticIndexes[chromaticIndexes.length - 1];

  if (firstIndex === undefined || lastIndex === undefined) {
    return scale;
  }

  if (curveShape.bellCurve) {
    return applyChromaCurveBellModel(
      scale,
      rule,
      curveShape.bellCurve,
      firstIndex,
      apexIndex,
      lastIndex,
      preservedInputTone
    );
  }

  const segments = curveShape.segments ?? [];

  if (segments.length === 0 || curveShape.strength <= 0 || curveShape.maxChromaAdjustment <= 0) {
    return scale;
  }

  const adjustedByIndex = new Map<number, TonalScaleColor>();
  const protectedIndexes = new Set<number>([firstIndex, apexIndex, lastIndex]);

  for (const segment of segments) {
    const resolvedSegment = resolveChromaCurveShapeSegment(
      scale,
      segment,
      apexIndex,
      firstIndex,
      lastIndex
    );

    if (!resolvedSegment) {
      continue;
    }

    applyChromaCurveShapeSegment(
      scale,
      rule,
      segment,
      resolvedSegment,
      preservedInputTone,
      adjustedByIndex
    );

    protectedIndexes.add(resolvedSegment.startIndex);
    protectedIndexes.add(resolvedSegment.endIndex);
  }

  const shapedScale =
    adjustedByIndex.size === 0
      ? scale
      : scale.map((color, index) => adjustedByIndex.get(index) ?? color);

  return applyChromaCurveFairing(shapedScale, rule, protectedIndexes, preservedInputTone);
}

function resolveChromaCurveProjection(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  preservedInputTone?: ScaleTone,
  vividBoundaryTone?: ScaleTone
): ChromaCurveProjection | undefined {
  const bellRule = rule?.curveShape?.bellCurve;

  if (!bellRule) {
    return undefined;
  }

  const chromaticIndexes = scale
    .map((color, index) => (isAbsoluteScaleCapTone(color.tone) ? undefined : index))
    .filter((index): index is number => index !== undefined);
  const apexIndex = resolveChromaCurveApexIndex(scale, chromaticIndexes);
  const firstIndex = chromaticIndexes[0];
  const lastIndex = chromaticIndexes[chromaticIndexes.length - 1];

  if (apexIndex === undefined || firstIndex === undefined || lastIndex === undefined) {
    return undefined;
  }

  const spline = resolveChromaCurveBellSpline(scale, bellRule, firstIndex, apexIndex, lastIndex, {
    includeLightZoneShoulder: true,
    preservedInputTone,
    vividBoundaryTone
  });
  const projectionSpline = spline
    ? resolveDiagnosticChromaCurveProjectionSpline(spline, rule, bellRule)
    : undefined;

  return projectionSpline ? createChromaCurveProjection(projectionSpline) : undefined;
}

function createChromaCurveProjection(spline: ChromaCurveBellSpline): ChromaCurveProjection {
  const firstPoint = spline.points[0];
  const lastPoint = spline.points[spline.points.length - 1];
  const sampleCount: number = 96;
  const samples = Array.from({ length: sampleCount }, (_, index) => {
    const progress = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const lightness = interpolate(firstPoint.lightness, lastPoint.lightness, progress);

    return {
      lightness,
      chroma: resolveChromaCurveBellSplineChroma(spline, lightness)
    };
  });

  return {
    points: spline.points.map(({ role, lightness, chroma }) => ({ role, lightness, chroma })),
    samples
  };
}

function resolveDiagnosticChromaCurveProjectionSpline(
  spline: ChromaCurveBellSpline,
  rule: ChromaCurveContinuityRule,
  bellRule: ChromaCurveBellRule
): ChromaCurveBellSpline {
  const points = liftLightZoneProjectionArc(
    removeOverlappingLightArcBaseFromProjection(spline.points),
    bellRule
  );
  const resolvedTangents = resolveMonotoneCubicTangents(points);
  const tangents = resolveRoundedProtectedApexProjectionTangents(points, resolvedTangents, rule);

  if (points === spline.points && tangents === resolvedTangents) {
    return spline;
  }

  return {
    ...spline,
    points,
    tangents
  };
}

function removeOverlappingLightArcBaseFromProjection(
  points: ChromaCurveBellPoint[]
): ChromaCurveBellPoint[] {
  const lightArcBase = points.find((point) => point.role === 'light-arc-base');
  const lightZoneExit = points.find((point) => point.role === 'light-zone-exit');
  const lightZoneShoulder = points.find((point) => point.role === 'light-zone-shoulder');

  if (!lightArcBase || !lightZoneExit || !lightZoneShoulder) {
    return points;
  }

  const localLightnessMin = Math.min(lightZoneExit.lightness, lightZoneShoulder.lightness);
  const localLightnessMax = Math.max(lightZoneExit.lightness, lightZoneShoulder.lightness);
  const overlapsLocalLightZone =
    lightArcBase.lightness > localLightnessMin && lightArcBase.lightness < localLightnessMax;

  if (!overlapsLocalLightZone) {
    return points;
  }

  return points.filter((point) => point !== lightArcBase);
}

function resolveRoundedProtectedApexProjectionTangents(
  points: ChromaCurveBellPoint[],
  tangents: number[],
  rule: ChromaCurveContinuityRule
): number[] {
  const incomingTangentRatio = rule.protectedApexShoulder.projectionIncomingTangentRatio ?? 0;
  const anchorPointIndex = points.findIndex((point) => point.role === 'preserved-input-anchor');
  const previousPoint = points[anchorPointIndex - 1];
  const anchorPoint = points[anchorPointIndex];
  const nextPoint = points[anchorPointIndex + 1];

  if (
    incomingTangentRatio <= 0 ||
    !previousPoint ||
    !anchorPoint ||
    !nextPoint ||
    anchorPoint.chroma <= previousPoint.chroma + 0.0001 ||
    anchorPoint.chroma <= nextPoint.chroma + 0.0001
  ) {
    return tangents;
  }

  const incomingDistance = Math.max(0.0001, anchorPoint.lightness - previousPoint.lightness);
  const incomingDelta = (anchorPoint.chroma - previousPoint.chroma) / incomingDistance;

  if (incomingDelta <= 0) {
    return tangents;
  }

  const maxMonotoneTangent = incomingDelta * 3;
  const targetTangent = Math.min(maxMonotoneTangent, incomingDelta * incomingTangentRatio);
  const previousTangent = tangents[anchorPointIndex - 1] ?? 0;

  if (previousTangent >= targetTangent) {
    return tangents;
  }

  const nextTangents = [...tangents];
  nextTangents[anchorPointIndex - 1] = targetTangent;
  nextTangents[anchorPointIndex] = 0;

  return nextTangents;
}

function liftLightZoneProjectionArc(
  points: ChromaCurveBellPoint[],
  bellRule: ChromaCurveBellRule
): ChromaCurveBellPoint[] {
  const preservedAnchor = points.find((point) => point.role === 'preserved-input-anchor');
  const lightZoneExit = points.find((point) => point.role === 'light-zone-exit');
  const lightZoneShoulder = points.find((point) => point.role === 'light-zone-shoulder');
  const bowRatio = Math.max(
    bellRule.minimumArcLift?.lightSideMinBowRatio ?? 0,
    bellRule.lightZoneShoulder?.projectionBowRatio ?? 0
  );

  if (!preservedAnchor || !lightZoneExit || !lightZoneShoulder || bowRatio <= 0) {
    return points;
  }

  const lightnessMin = Math.min(preservedAnchor.lightness, lightZoneExit.lightness);
  const lightnessMax = Math.max(preservedAnchor.lightness, lightZoneExit.lightness);

  if (
    lightZoneShoulder.lightness <= lightnessMin ||
    lightZoneShoulder.lightness >= lightnessMax
  ) {
    return points;
  }

  const progress = normalizedProgress(
    lightZoneShoulder.lightness,
    preservedAnchor.lightness,
    lightZoneExit.lightness
  );
  const straightChroma = interpolate(preservedAnchor.chroma, lightZoneExit.chroma, progress);
  const chromaSpan = Math.abs(lightZoneExit.chroma - preservedAnchor.chroma);
  const bowInfluence = 4 * progress * (1 - progress);
  const liftedChroma = Math.min(
    Math.max(preservedAnchor.chroma, lightZoneExit.chroma),
    straightChroma + chromaSpan * bowRatio * bowInfluence
  );

  if (liftedChroma <= lightZoneShoulder.chroma + 0.0001) {
    return points;
  }

  return points.map((point) =>
    point === lightZoneShoulder
      ? {
          ...point,
          chroma: liftedChroma
        }
      : point
  );
}

function applyChromaCurveBellModel(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  bellRule: ChromaCurveBellRule,
  firstIndex: number,
  apexIndex: number,
  lastIndex: number,
  preservedInputTone?: ScaleTone
): TonalScaleColor[] {
  if (
    bellRule.strength <= 0 ||
    bellRule.maxChromaAdjustment <= 0 ||
    firstIndex >= lastIndex ||
    apexIndex <= firstIndex ||
    apexIndex >= lastIndex
  ) {
    return scale;
  }

  const spline = resolveChromaCurveBellSpline(scale, bellRule, firstIndex, apexIndex, lastIndex, {
    preservedInputTone
  });

  if (!spline) {
    return scale;
  }

  const protectedIndexes = new Set<number>([firstIndex, apexIndex, lastIndex]);
  for (const point of spline.points) {
    if (point.sourceIndex !== undefined) {
      protectedIndexes.add(point.sourceIndex);
    }
  }
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let index = firstIndex + 1; index < lastIndex; index += 1) {
    const color = scale[index];

    if (
      !color ||
      protectedIndexes.has(index) ||
      (preservedInputTone !== undefined && color.tone === preservedInputTone) ||
      isAbsoluteScaleCapTone(color.tone)
    ) {
      continue;
    }

    const currentOklch = hexToOklch(color.hex);
    const targetChroma = resolveChromaCurveBellSplineChroma(spline, currentOklch.l);
    const adjustment = clamp(
      (targetChroma - currentOklch.c) * bellRule.strength,
      -bellRule.maxChromaAdjustment,
      bellRule.maxChromaAdjustment
    );

    if (Math.abs(adjustment) < 0.0001) {
      continue;
    }

    const adjustedColor = createScaleColorWithChromaShoulder(
      color,
      currentOklch.c + adjustment,
      resolveBellCurveMaxLightnessDrop(bellRule, spline, currentOklch.l)
    );

    if (adjustedColor !== color) {
      adjustedByIndex.set(index, adjustedColor);
    }
  }

  const shapedScale =
    adjustedByIndex.size === 0
      ? scale
      : scale.map((color, index) => adjustedByIndex.get(index) ?? color);

  return applyChromaCurveFairing(shapedScale, rule, protectedIndexes, preservedInputTone);
}

function resolveChromaCurveBellSpline(
  scale: TonalScaleColor[],
  bellRule: ChromaCurveBellRule,
  firstIndex: number,
  apexIndex: number,
  lastIndex: number,
  options: {
    includeLightZoneShoulder?: boolean;
    preservedInputTone?: ScaleTone;
    vividBoundaryTone?: ScaleTone;
  } = {}
): ChromaCurveBellSpline | undefined {
  const lightEnd = scale[firstIndex];
  const apex = scale[apexIndex];
  const darkEnd = scale[lastIndex];

  if (!lightEnd || !apex || !darkEnd) {
    return undefined;
  }

  const lightEndOklch = hexToOklch(lightEnd.hex);
  const apexOklch = hexToOklch(apex.hex);
  const darkEndOklch = hexToOklch(darkEnd.hex);

  if (darkEndOklch.l >= apexOklch.l || apexOklch.l >= lightEndOklch.l || apexOklch.c <= 0.0001) {
    return undefined;
  }

  const points = normalizeChromaCurveBellPoints([
    {
      role: 'dark-graph-end',
      lightness: darkEndOklch.l,
      chroma: darkEndOklch.c,
      sourceIndex: lastIndex
    },
    {
      role: 'dark-arc-base',
      lightness: interpolate(darkEndOklch.l, apexOklch.l, clamp(bellRule.darkBaseProgress, 0, 1)),
      chroma: resolveLiftedBellBaseChroma({
        endpointChroma: darkEndOklch.c,
        apexChroma: apexOklch.c,
        progressFromEndpointToApex: clamp(bellRule.darkBaseProgress, 0, 1),
        baseChromaRatio: bellRule.darkBaseChromaRatio,
        minBowRatio: bellRule.minimumArcLift?.darkSideMinBowRatio ?? 0,
        maxBaseChromaRatio: bellRule.minimumArcLift?.darkSideMaxBaseChromaRatio ?? 1
      })
    },
    ...resolveVividBoundaryBellPoint(scale, options.vividBoundaryTone, options.preservedInputTone),
    {
      role: 'apex',
      lightness: apexOklch.l,
      chroma: apexOklch.c,
      sourceIndex: apexIndex
    },
    ...resolvePreservedInputAnchorBellPoint(scale, options.preservedInputTone),
    {
      role: 'light-arc-base',
      lightness: interpolate(apexOklch.l, lightEndOklch.l, clamp(bellRule.lightBaseProgress, 0, 1)),
      chroma: resolveLiftedBellBaseChroma({
        endpointChroma: lightEndOklch.c,
        apexChroma: apexOklch.c,
        progressFromEndpointToApex: 1 - clamp(bellRule.lightBaseProgress, 0, 1),
        baseChromaRatio: bellRule.lightBaseChromaRatio,
        minBowRatio: bellRule.minimumArcLift?.lightSideMinBowRatio ?? 0,
        maxBaseChromaRatio: bellRule.minimumArcLift?.lightSideMaxBaseChromaRatio ?? 1
      })
    },
    ...(options.includeLightZoneShoulder
      ? resolveLightZoneShoulderBellPoints(scale, bellRule, firstIndex)
      : []),
    {
      role: 'light-graph-end',
      lightness: lightEndOklch.l,
      chroma: lightEndOklch.c,
      sourceIndex: firstIndex
    }
  ]);

  if (points.length < 3) {
    return undefined;
  }

  return {
    points,
    tangents: resolveMonotoneCubicTangents(points),
    apexLightness: apexOklch.l
  };
}

function resolveVividBoundaryBellPoint(
  scale: TonalScaleColor[],
  vividBoundaryTone: ScaleTone | undefined,
  preservedInputTone: ScaleTone | undefined
): ChromaCurveBellPoint[] {
  if (vividBoundaryTone === undefined || vividBoundaryTone === preservedInputTone) {
    return [];
  }

  const boundaryIndex = scale.findIndex((color) => color.tone === vividBoundaryTone);
  const boundary = scale[boundaryIndex];

  if (!boundary || isAbsoluteScaleCapTone(boundary.tone)) {
    return [];
  }

  const boundaryOklch = hexToOklch(boundary.hex);

  return [
    {
      role: 'vivid-boundary',
      lightness: boundaryOklch.l,
      chroma: boundaryOklch.c,
      sourceIndex: boundaryIndex
    }
  ];
}

function resolvePreservedInputAnchorBellPoint(
  scale: TonalScaleColor[],
  preservedInputTone: ScaleTone | undefined
): ChromaCurveBellPoint[] {
  if (preservedInputTone === undefined) {
    return [];
  }

  const anchorIndex = scale.findIndex((color) => color.tone === preservedInputTone);
  const anchor = scale[anchorIndex];

  if (!anchor || isAbsoluteScaleCapTone(anchor.tone)) {
    return [];
  }

  const anchorOklch = hexToOklch(anchor.hex);

  return [
    {
      role: 'preserved-input-anchor',
      lightness: anchorOklch.l,
      chroma: anchorOklch.c,
      sourceIndex: anchorIndex
    }
  ];
}

function resolveLightZoneShoulderBellPoints(
  scale: TonalScaleColor[],
  bellRule: ChromaCurveBellRule,
  firstIndex: number
): ChromaCurveBellPoint[] {
  const shoulderRule = bellRule.lightZoneShoulder;

  if (!shoulderRule) {
    return [];
  }

  const endIndex = resolveClosestScaleColorIndex(scale, shoulderRule.endTone);

  if (endIndex <= firstIndex + 1) {
    return [];
  }

  const shoulderIndex = Math.round(
    interpolate(firstIndex, endIndex, clamp(shoulderRule.shoulderProgress, 0, 1))
  );
  const clampedShoulderIndex = Math.round(clamp(shoulderIndex, firstIndex + 1, endIndex - 1));
  const shoulder = scale[clampedShoulderIndex];
  const end = scale[endIndex];

  if (
    !shoulder ||
    !end ||
    isAbsoluteScaleCapTone(shoulder.tone) ||
    isAbsoluteScaleCapTone(end.tone)
  ) {
    return [];
  }

  const shoulderOklch = hexToOklch(shoulder.hex);
  const endOklch = hexToOklch(end.hex);

  return [
    {
      role: 'light-zone-shoulder',
      lightness: shoulderOklch.l,
      chroma: shoulderOklch.c,
      sourceIndex: clampedShoulderIndex
    },
    {
      role: 'light-zone-exit',
      lightness: endOklch.l,
      chroma: endOklch.c,
      sourceIndex: endIndex
    }
  ];
}

function resolveBellCurveMaxLightnessDrop(
  bellRule: ChromaCurveBellRule,
  spline: ChromaCurveBellSpline,
  lightness: number
): number {
  return lightness > spline.apexLightness
    ? (bellRule.lightSideMaxLightnessDrop ?? bellRule.maxLightnessDrop)
    : (bellRule.darkSideMaxLightnessDrop ?? bellRule.maxLightnessDrop);
}

function resolveLiftedBellBaseChroma(params: {
  endpointChroma: number;
  apexChroma: number;
  progressFromEndpointToApex: number;
  baseChromaRatio: number;
  minBowRatio: number;
  maxBaseChromaRatio: number;
}): number {
  const {
    endpointChroma,
    apexChroma,
    progressFromEndpointToApex,
    baseChromaRatio,
    minBowRatio,
    maxBaseChromaRatio
  } = params;
  const progress = clamp(progressFromEndpointToApex, 0, 1);
  const chromaSpan = Math.max(0, apexChroma - endpointChroma);
  const baseChroma = interpolate(endpointChroma, apexChroma, clamp(baseChromaRatio, 0, 1));
  const straightChroma = interpolate(endpointChroma, apexChroma, progress);
  const bowInfluence = 4 * progress * (1 - progress);
  const liftedChroma = straightChroma + chromaSpan * Math.max(0, minBowRatio) * bowInfluence;
  const maxBaseChroma = interpolate(endpointChroma, apexChroma, clamp(maxBaseChromaRatio, 0, 1));

  return clamp(Math.max(baseChroma, liftedChroma), 0, maxBaseChroma);
}

function normalizeChromaCurveBellPoints(
  points: readonly ChromaCurveBellPoint[]
): ChromaCurveBellPoint[] {
  const sortedPoints = [...points].sort((left, right) => left.lightness - right.lightness);
  const normalizedPoints: ChromaCurveBellPoint[] = [];

  for (const point of sortedPoints) {
    const previous = normalizedPoints[normalizedPoints.length - 1];

    if (previous && Math.abs(previous.lightness - point.lightness) < 0.0001) {
      const selectedPoint =
        previous.role === 'preserved-input-anchor'
          ? previous
          : point.role === 'preserved-input-anchor'
            ? point
            : previous.chroma >= point.chroma
              ? previous
              : point;
      normalizedPoints[normalizedPoints.length - 1] = {
        role: selectedPoint.role,
        lightness: previous.lightness,
        chroma:
          selectedPoint.role === 'preserved-input-anchor'
            ? selectedPoint.chroma
            : Math.max(previous.chroma, point.chroma),
        sourceIndex: selectedPoint.sourceIndex
      };
      continue;
    }

    normalizedPoints.push(point);
  }

  return normalizedPoints;
}

function resolveMonotoneCubicTangents(points: readonly ChromaCurveBellPoint[]): number[] {
  const segmentCount = points.length - 1;
  const deltas: number[] = [];
  const distances: number[] = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const left = points[index];
    const right = points[index + 1];
    const distance = Math.max(0.0001, right.lightness - left.lightness);

    distances.push(distance);
    deltas.push((right.chroma - left.chroma) / distance);
  }

  const tangents = new Array<number>(points.length).fill(0);

  for (let index = 1; index < segmentCount; index += 1) {
    const previousDelta = deltas[index - 1];
    const nextDelta = deltas[index];

    if (previousDelta * nextDelta <= 0) {
      tangents[index] = 0;
      continue;
    }

    const previousDistance = distances[index - 1];
    const nextDistance = distances[index];
    const leftWeight = 2 * nextDistance + previousDistance;
    const rightWeight = nextDistance + 2 * previousDistance;

    tangents[index] =
      (leftWeight + rightWeight) / (leftWeight / previousDelta + rightWeight / nextDelta);
  }

  for (let index = 0; index < segmentCount; index += 1) {
    const delta = deltas[index];

    if (Math.abs(delta) < 0.0001) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }

    const alpha = tangents[index] / delta;
    const beta = tangents[index + 1] / delta;
    const sum = alpha ** 2 + beta ** 2;

    if (sum > 9) {
      const tau = 3 / Math.sqrt(sum);
      tangents[index] = tau * alpha * delta;
      tangents[index + 1] = tau * beta * delta;
    }
  }

  return tangents;
}

function resolveChromaCurveBellSplineChroma(
  spline: ChromaCurveBellSpline,
  lightness: number
): number {
  const { points, tangents } = spline;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (lightness <= firstPoint.lightness) {
    return firstPoint.chroma;
  }

  if (lightness >= lastPoint.lightness) {
    return lastPoint.chroma;
  }

  const segmentIndex = points.findIndex(
    (point, index) =>
      index < points.length - 1 &&
      lightness >= point.lightness &&
      lightness <= points[index + 1].lightness
  );
  const resolvedSegmentIndex = segmentIndex >= 0 ? segmentIndex : points.length - 2;
  const left = points[resolvedSegmentIndex];
  const right = points[resolvedSegmentIndex + 1];
  const distance = Math.max(0.0001, right.lightness - left.lightness);
  const progress = clamp((lightness - left.lightness) / distance, 0, 1);
  const progress2 = progress ** 2;
  const progress3 = progress ** 3;
  const leftWeight = 2 * progress3 - 3 * progress2 + 1;
  const leftTangentWeight = progress3 - 2 * progress2 + progress;
  const rightWeight = -2 * progress3 + 3 * progress2;
  const rightTangentWeight = progress3 - progress2;

  return (
    leftWeight * left.chroma +
    leftTangentWeight * distance * tangents[resolvedSegmentIndex] +
    rightWeight * right.chroma +
    rightTangentWeight * distance * tangents[resolvedSegmentIndex + 1]
  );
}

function applyChromaCurveFairing(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  protectedIndexes: ReadonlySet<number>,
  preservedInputTone?: ScaleTone
): TonalScaleColor[] {
  const fairing = rule.curveShape?.fairing;

  if (!fairing || fairing.iterations <= 0 || fairing.strength <= 0) {
    return scale;
  }

  let currentScale = scale;

  for (let iteration = 0; iteration < fairing.iterations; iteration += 1) {
    const adjustedByIndex = new Map<number, TonalScaleColor>();

    for (let index = 1; index < currentScale.length - 1; index += 1) {
      const previous = currentScale[index - 1];
      const color = currentScale[index];
      const next = currentScale[index + 1];

      if (
        !previous ||
        !color ||
        !next ||
        protectedIndexes.has(index) ||
        (preservedInputTone !== undefined && color.tone === preservedInputTone) ||
        isAbsoluteScaleCapTone(previous.tone) ||
        isAbsoluteScaleCapTone(color.tone) ||
        isAbsoluteScaleCapTone(next.tone)
      ) {
        continue;
      }

      const currentChroma = hexToOklch(color.hex).c;
      const targetChroma = (hexToOklch(previous.hex).c + hexToOklch(next.hex).c) / 2;
      const adjustment = clamp(
        (targetChroma - currentChroma) * fairing.strength,
        -fairing.maxChromaAdjustment,
        fairing.maxChromaAdjustment
      );

      if (Math.abs(adjustment) < 0.0001) {
        continue;
      }

      const adjustedColor = createScaleColorWithChroma(color, currentChroma + adjustment);

      if (adjustedColor !== color) {
        adjustedByIndex.set(index, adjustedColor);
      }
    }

    if (adjustedByIndex.size === 0) {
      break;
    }

    currentScale = currentScale.map((color, index) => adjustedByIndex.get(index) ?? color);
  }

  return currentScale;
}

function applyFinalLightnessMonotonicityGuard(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const monotonicity = rule?.finalLightnessMonotonicity;

  if (!monotonicity || colorSpace !== 'oklch') {
    return scale;
  }

  let changed = false;
  const nextScale = [...scale];

  for (let index = 1; index < nextScale.length; index += 1) {
    const previous = nextScale[index - 1];
    const color = nextScale[index];

    if (
      !previous ||
      !color ||
      color.tone === preservedInputTone ||
      isAbsoluteScaleCapTone(previous.tone) ||
      isAbsoluteScaleCapTone(color.tone)
    ) {
      continue;
    }

    const next = nextScale[index + 1];
    const previousLightness = hexToOklch(previous.hex).l;
    const currentLightness = hexToOklch(color.hex).l;
    const maxLightness = previousLightness - monotonicity.minDelta;

    if (currentLightness <= maxLightness) {
      continue;
    }

    const nextLightness =
      next && !isAbsoluteScaleCapTone(next.tone) && next.tone !== preservedInputTone
        ? hexToOklch(next.hex).l
        : undefined;
    const targetLightness =
      nextLightness !== undefined && nextLightness < maxLightness - monotonicity.minDelta
        ? Math.min(maxLightness, (previousLightness + nextLightness) / 2)
        : maxLightness;

    nextScale[index] = createScaleColorWithLightness(
      color,
      colorSpace,
      Math.max(targetLightness, currentLightness - monotonicity.maxLightnessDrop)
    );
    changed = true;
  }

  return changed ? nextScale : scale;
}

function applyFinalLightnessRhythmRedistribution(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const rhythm = rule?.finalLightnessRhythm;

  if (!rhythm || colorSpace !== 'oklch') {
    return scale;
  }

  let currentScale = scale;

  for (const range of rhythm.ranges) {
    currentScale = applyFinalLightnessRhythmRange(
      currentScale,
      range,
      colorSpace,
      preservedInputTone
    );
  }

  return applyFinalLightnessRhythmTransitions(
    currentScale,
    rhythm.ranges,
    rhythm.transitionDeltas,
    colorSpace,
    preservedInputTone
  );
}

function applyFinalLightnessRhythmRange(
  scale: TonalScaleColor[],
  range: ChromaCurveLightnessRhythmRange,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const rangeIndexes = scale
    .map((color, index) =>
      color.tone >= range.startTone &&
      color.tone <= range.endTone &&
      !isAbsoluteScaleCapTone(color.tone)
        ? index
        : undefined
    )
    .filter((index): index is number => index !== undefined);

  if (rangeIndexes.length < 3) {
    return scale;
  }

  const protectedIndexes = new Set<number>([
    rangeIndexes[0],
    rangeIndexes[rangeIndexes.length - 1]
  ]);
  const preservedIndex = scale.findIndex((color) => color.tone === preservedInputTone);

  if (rangeIndexes.includes(preservedIndex)) {
    protectedIndexes.add(preservedIndex);
  }

  let nextScale = scale;

  for (const [startIndex, endIndex] of resolveProtectedLightnessRhythmSegments(
    rangeIndexes,
    protectedIndexes
  )) {
    nextScale = redistributeLightnessRhythmSegment(
      nextScale,
      rangeIndexes,
      startIndex,
      endIndex,
      range,
      colorSpace,
      protectedIndexes
    );
  }

  return nextScale;
}

function resolveProtectedLightnessRhythmSegments(
  rangeIndexes: number[],
  protectedIndexes: Set<number>
): Array<[number, number]> {
  const protectedRangeIndexes = rangeIndexes.filter((index) => protectedIndexes.has(index));
  const segments: Array<[number, number]> = [];

  for (let index = 0; index < protectedRangeIndexes.length - 1; index += 1) {
    const startIndex = protectedRangeIndexes[index];
    const endIndex = protectedRangeIndexes[index + 1];

    if (rangeIndexes.indexOf(endIndex) - rangeIndexes.indexOf(startIndex) >= 2) {
      segments.push([startIndex, endIndex]);
    }
  }

  return segments;
}

function redistributeLightnessRhythmSegment(
  scale: TonalScaleColor[],
  rangeIndexes: number[],
  startIndex: number,
  endIndex: number,
  range: ChromaCurveLightnessRhythmRange,
  colorSpace: ColorInterpolationSpace,
  protectedIndexes: Set<number>
): TonalScaleColor[] {
  const startColor = scale[startIndex];
  const endColor = scale[endIndex];

  if (!startColor || !endColor) {
    return scale;
  }

  const startLightness = hexToOklch(startColor.hex).l;
  const endLightness = hexToOklch(endColor.hex).l;

  if (startLightness <= endLightness) {
    return scale;
  }

  const startRangeIndex = rangeIndexes.indexOf(startIndex);
  const endRangeIndex = rangeIndexes.indexOf(endIndex);
  const intervalCount = endRangeIndex - startRangeIndex;
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let rangeIndex = startRangeIndex + 1; rangeIndex < endRangeIndex; rangeIndex += 1) {
    const scaleIndex = rangeIndexes[rangeIndex];
    const color = scale[scaleIndex];

    if (!color || protectedIndexes.has(scaleIndex)) {
      continue;
    }

    const progress = (rangeIndex - startRangeIndex) / intervalCount;
    const targetLightness = interpolate(startLightness, endLightness, progress);
    const currentLightness = hexToOklch(color.hex).l;
    const adjustedLightness =
      currentLightness + (targetLightness - currentLightness) * range.strength;
    const boundedLightness = clamp(
      adjustedLightness,
      currentLightness - range.maxLightnessShift,
      currentLightness + range.maxLightnessShift
    );
    const adjusted = createScaleColorWithLightness(color, colorSpace, boundedLightness);

    if (adjusted.hex !== color.hex) {
      adjustedByIndex.set(scaleIndex, adjusted);
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function applyFinalLightnessRhythmTransitions(
  scale: TonalScaleColor[],
  ranges: readonly ChromaCurveLightnessRhythmRange[],
  transitionRule: ChromaCurveLightnessRhythmTransitionRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  if (!transitionRule || ranges.length < 2) {
    return scale;
  }

  const sortedRanges = [...ranges].sort((left, right) => left.startTone - right.startTone);
  let currentScale = scale;

  for (let index = 0; index < sortedRanges.length - 1; index += 1) {
    currentScale = applyFinalLightnessRhythmTransition(
      currentScale,
      sortedRanges[index],
      sortedRanges[index + 1],
      transitionRule,
      colorSpace,
      preservedInputTone
    );
  }

  return currentScale;
}

function applyFinalLightnessRhythmTransition(
  scale: TonalScaleColor[],
  leftRange: ChromaCurveLightnessRhythmRange,
  rightRange: ChromaCurveLightnessRhythmRange,
  transitionRule: ChromaCurveLightnessRhythmTransitionRule,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const leftBoundaryIndex = scale.findIndex((color) => color.tone === leftRange.endTone);
  const rightBoundaryIndex = scale.findIndex((color) => color.tone === rightRange.startTone);

  if (
    leftBoundaryIndex === -1 ||
    rightBoundaryIndex === -1 ||
    rightBoundaryIndex <= leftBoundaryIndex
  ) {
    return scale;
  }

  const leftRhythm = resolveAverageLightnessRhythmDelta(
    scale,
    leftBoundaryIndex,
    -1,
    transitionRule.sampleSize
  );
  const rightRhythm = resolveAverageLightnessRhythmDelta(
    scale,
    rightBoundaryIndex,
    1,
    transitionRule.sampleSize
  );

  if (leftRhythm === undefined || rightRhythm === undefined) {
    return scale;
  }

  const leftBoundary = scale[leftBoundaryIndex];
  const rightBoundary = scale[rightBoundaryIndex];

  if (!leftBoundary || !rightBoundary) {
    return scale;
  }

  const targetDelta = interpolate(leftRhythm, rightRhythm, clamp(transitionRule.targetMix, 0, 1));
  const leftLightness = hexToOklch(leftBoundary.hex).l;
  const rightLightness = hexToOklch(rightBoundary.hex).l;
  const currentDelta = leftLightness - rightLightness;
  const missingDelta = targetDelta - currentDelta;

  if (missingDelta <= transitionRule.tolerance) {
    return scale;
  }

  const requestedShift = Math.min(
    missingDelta * transitionRule.strength,
    transitionRule.maxLightnessShift
  );
  const rightCanMove = canAdjustFinalLightnessRhythmBoundary(rightBoundary, preservedInputTone);
  const leftCanMove = canAdjustFinalLightnessRhythmBoundary(leftBoundary, preservedInputTone);

  if (!rightCanMove && !leftCanMove) {
    return scale;
  }

  const nextScale = [...scale];

  if (rightCanMove) {
    nextScale[rightBoundaryIndex] = createScaleColorWithLightness(
      rightBoundary,
      colorSpace,
      rightLightness - requestedShift
    );
    return redistributeLightnessRhythmWindow(
      nextScale,
      rightBoundaryIndex,
      Math.min(rightBoundaryIndex + transitionRule.redistributionSlots, scale.length - 1),
      transitionRule,
      colorSpace,
      preservedInputTone
    );
  }

  nextScale[leftBoundaryIndex] = createScaleColorWithLightness(
    leftBoundary,
    colorSpace,
    leftLightness + requestedShift
  );
  return redistributeLightnessRhythmWindow(
    nextScale,
    Math.max(leftBoundaryIndex - transitionRule.redistributionSlots, 0),
    leftBoundaryIndex,
    transitionRule,
    colorSpace,
    preservedInputTone
  );
}

function resolveAverageLightnessRhythmDelta(
  scale: TonalScaleColor[],
  boundaryIndex: number,
  direction: -1 | 1,
  sampleSize: number
): number | undefined {
  const deltas: number[] = [];

  for (let offset = 0; offset < sampleSize; offset += 1) {
    const leftIndex = direction === -1 ? boundaryIndex - offset - 1 : boundaryIndex + offset;
    const rightIndex = direction === -1 ? boundaryIndex - offset : boundaryIndex + offset + 1;
    const left = scale[leftIndex];
    const right = scale[rightIndex];

    if (
      !left ||
      !right ||
      isAbsoluteScaleCapTone(left.tone) ||
      isAbsoluteScaleCapTone(right.tone)
    ) {
      continue;
    }

    const delta = hexToOklch(left.hex).l - hexToOklch(right.hex).l;

    if (delta > 0) {
      deltas.push(delta);
    }
  }

  return averageDefinedNumbers(deltas);
}

function canAdjustFinalLightnessRhythmBoundary(
  color: TonalScaleColor,
  preservedInputTone: ScaleTone
): boolean {
  return color.tone !== preservedInputTone && !isAbsoluteScaleCapTone(color.tone);
}

function redistributeLightnessRhythmWindow(
  scale: TonalScaleColor[],
  startIndex: number,
  endIndex: number,
  transitionRule: ChromaCurveLightnessRhythmTransitionRule,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const windowIndexes = scale
    .map((color, index) =>
      index >= startIndex && index <= endIndex && !isAbsoluteScaleCapTone(color.tone)
        ? index
        : undefined
    )
    .filter((index): index is number => index !== undefined);

  if (windowIndexes.length < 3) {
    return scale;
  }

  const protectedIndexes = new Set<number>([
    windowIndexes[0],
    windowIndexes[windowIndexes.length - 1]
  ]);
  const preservedInputIndex = scale.findIndex((color) => color.tone === preservedInputTone);

  if (windowIndexes.includes(preservedInputIndex)) {
    protectedIndexes.add(preservedInputIndex);
  }

  let nextScale = scale;
  const redistributionRange: ChromaCurveLightnessRhythmRange = {
    startTone: scale[windowIndexes[0]].tone,
    endTone: scale[windowIndexes[windowIndexes.length - 1]].tone,
    strength: transitionRule.redistributionStrength,
    maxLightnessShift: transitionRule.maxLightnessShift
  };

  for (const [segmentStartIndex, segmentEndIndex] of resolveProtectedLightnessRhythmSegments(
    windowIndexes,
    protectedIndexes
  )) {
    nextScale = redistributeLightnessRhythmSegment(
      nextScale,
      windowIndexes,
      segmentStartIndex,
      segmentEndIndex,
      redistributionRange,
      colorSpace,
      protectedIndexes
    );
  }

  return nextScale;
}

function applyProtectedAnchorLightnessRhythmExpansion(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const expansions = rule?.finalLightnessRhythm?.protectedAnchorExpansions;

  if (!expansions || colorSpace !== 'oklch') {
    return scale;
  }

  let currentScale = scale;

  for (const expansion of expansions) {
    currentScale = applyProtectedAnchorLightnessRhythmExpansionRange(
      currentScale,
      expansion,
      colorSpace,
      preservedInputTone
    );
  }

  return currentScale;
}

function applyProtectedAnchorLightnessRhythmExpansionRange(
  scale: TonalScaleColor[],
  expansion: ChromaCurveLightnessRhythmProtectedAnchorExpansion,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  if (preservedInputTone <= expansion.startTone || preservedInputTone > expansion.endTone) {
    return scale;
  }

  const anchorIndex = scale.findIndex((color) => color.tone === preservedInputTone);
  const startIndex = scale.findIndex((color) => color.tone === expansion.startTone);

  if (startIndex === -1 || anchorIndex === -1 || anchorIndex <= startIndex) {
    return scale;
  }

  const rangeIndexes = scale
    .map((color, index) =>
      index >= startIndex && index <= anchorIndex && !isAbsoluteScaleCapTone(color.tone)
        ? index
        : undefined
    )
    .filter((index): index is number => index !== undefined);
  const rangeAnchorIndex = rangeIndexes.indexOf(anchorIndex);
  const previousIndex = rangeIndexes[rangeAnchorIndex - 1];

  if (rangeIndexes.length < 3 || previousIndex === undefined) {
    return scale;
  }

  const previous = scale[previousIndex];
  const anchor = scale[anchorIndex];
  const start = scale[startIndex];

  if (!previous || !anchor || !start) {
    return scale;
  }

  const previousLightness = hexToOklch(previous.hex).l;
  const anchorLightness = hexToOklch(anchor.hex).l;
  const adjacentDelta = previousLightness - anchorLightness;

  if (adjacentDelta >= expansion.minAdjacentDelta) {
    return scale;
  }

  const startLightness = hexToOklch(start.hex).l;

  if (startLightness <= anchorLightness) {
    return scale;
  }

  const intervalCount = rangeAnchorIndex;
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let rangeIndex = 1; rangeIndex < rangeAnchorIndex; rangeIndex += 1) {
    const scaleIndex = rangeIndexes[rangeIndex];
    const color = scale[scaleIndex];

    if (!color || color.tone === preservedInputTone) {
      continue;
    }

    const progress = rangeIndex / intervalCount;
    const targetProgress = progress ** (expansion.progressGamma ?? 1);
    const targetLightness = interpolate(startLightness, anchorLightness, targetProgress);
    const currentLightness = hexToOklch(color.hex).l;
    const adjustedLightness =
      currentLightness + (targetLightness - currentLightness) * expansion.strength;
    const boundedLightness = clamp(
      adjustedLightness,
      currentLightness - expansion.maxLightnessShift,
      currentLightness + expansion.maxLightnessShift
    );
    const adjusted = createScaleColorWithLightness(color, colorSpace, boundedLightness);

    if (adjusted.hex !== color.hex) {
      adjustedByIndex.set(scaleIndex, adjusted);
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function applyProtectedAnchorExitLightnessRhythm(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const exits = rule?.finalLightnessRhythm?.protectedAnchorExits;

  if (!exits || colorSpace !== 'oklch') {
    return scale;
  }

  let currentScale = scale;

  for (const exit of exits) {
    currentScale = applyProtectedAnchorExitLightnessRhythmRange(
      currentScale,
      exit,
      colorSpace,
      preservedInputTone
    );
  }

  return currentScale;
}

function applyProtectedAnchorExitLightnessRhythmRange(
  scale: TonalScaleColor[],
  exit: ChromaCurveLightnessRhythmProtectedAnchorExit,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  if (exit.strength <= 0 || exit.maxLightnessLift <= 0 || exit.progressGamma <= 1) {
    return scale;
  }

  if (preservedInputTone < exit.startTone || preservedInputTone >= exit.endTone) {
    return scale;
  }

  const anchorIndex = scale.findIndex((color) => color.tone === preservedInputTone);
  const endIndex = scale.findIndex((color) => color.tone === exit.endTone);

  if (anchorIndex <= 0 || endIndex === -1 || endIndex <= anchorIndex + 1) {
    return scale;
  }

  const previousIndex = resolveNearestChromaticScaleIndex(scale, anchorIndex, -1);
  const nextIndex = resolveNearestChromaticScaleIndex(scale, anchorIndex, 1);

  if (previousIndex === undefined || nextIndex === undefined || nextIndex >= endIndex) {
    return scale;
  }

  const previous = scale[previousIndex];
  const anchor = scale[anchorIndex];
  const next = scale[nextIndex];
  const end = scale[endIndex];

  if (!previous || !anchor || !next || !end) {
    return scale;
  }

  const previousLightness = hexToOklch(previous.hex).l;
  const anchorLightness = hexToOklch(anchor.hex).l;
  const nextLightness = hexToOklch(next.hex).l;
  const endLightness = hexToOklch(end.hex).l;
  const incomingDelta = previousLightness - anchorLightness;
  const firstExitDelta = anchorLightness - nextLightness;

  if (
    incomingDelta <= 0 ||
    firstExitDelta <= 0 ||
    endLightness >= anchorLightness ||
    firstExitDelta <= incomingDelta * exit.maxFirstDeltaRatio + exit.tolerance
  ) {
    return scale;
  }

  const rangeIndexes = scale
    .map((color, index) =>
      index >= anchorIndex && index <= endIndex && !isAbsoluteScaleCapTone(color.tone)
        ? index
        : undefined
    )
    .filter((index): index is number => index !== undefined);
  const anchorRangeIndex = rangeIndexes.indexOf(anchorIndex);
  const endRangeIndex = rangeIndexes.indexOf(endIndex);

  if (anchorRangeIndex === -1 || endRangeIndex <= anchorRangeIndex + 1) {
    return scale;
  }

  const intervalCount = endRangeIndex - anchorRangeIndex;
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let rangeIndex = anchorRangeIndex + 1; rangeIndex < endRangeIndex; rangeIndex += 1) {
    const scaleIndex = rangeIndexes[rangeIndex];
    const color = scale[scaleIndex];

    if (!color || color.tone === preservedInputTone) {
      continue;
    }

    const progress = (rangeIndex - anchorRangeIndex) / intervalCount;
    const targetProgress = progress ** exit.progressGamma;
    const targetLightness = interpolate(anchorLightness, endLightness, targetProgress);
    const currentLightness = hexToOklch(color.hex).l;

    if (targetLightness <= currentLightness) {
      continue;
    }

    const adjustedLightness =
      currentLightness + (targetLightness - currentLightness) * exit.strength;
    const boundedLightness = clamp(
      adjustedLightness,
      currentLightness,
      currentLightness + exit.maxLightnessLift
    );
    const adjusted = createScaleColorWithLightness(color, colorSpace, boundedLightness);

    if (adjusted.hex !== color.hex) {
      adjustedByIndex.set(scaleIndex, adjusted);
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function resolveNearestChromaticScaleIndex(
  scale: TonalScaleColor[],
  startIndex: number,
  direction: -1 | 1
): number | undefined {
  for (let index = startIndex + direction; index >= 0 && index < scale.length; index += direction) {
    const color = scale[index];

    if (color && !isAbsoluteScaleCapTone(color.tone)) {
      return index;
    }
  }

  return undefined;
}

function applyLightZoneChromaValleyFloor(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const valleyFloor = rule?.lightZoneChromaValleyFloor;

  if (!valleyFloor || colorSpace !== 'oklch') {
    return scale;
  }

  if (
    preservedInputTone < valleyFloor.startTone ||
    preservedInputTone >= valleyFloor.endTone ||
    valleyFloor.strength <= 0 ||
    valleyFloor.maxChromaLift <= 0
  ) {
    return scale;
  }

  const anchorIndex = scale.findIndex((color) => color.tone === preservedInputTone);
  const endIndex = resolveClosestScaleColorIndex(scale, valleyFloor.endTone);

  if (anchorIndex === -1 || endIndex <= anchorIndex + 1) {
    return scale;
  }

  const anchor = scale[anchorIndex];
  const end = scale[endIndex];

  if (!anchor || !end || isAbsoluteScaleCapTone(anchor.tone) || isAbsoluteScaleCapTone(end.tone)) {
    return scale;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const endChroma = hexToOklch(end.hex).c;
  const rangeIndexes = scale
    .map((color, index) =>
      index >= anchorIndex && index <= endIndex && !isAbsoluteScaleCapTone(color.tone)
        ? index
        : undefined
    )
    .filter((index): index is number => index !== undefined);
  const anchorRangeIndex = rangeIndexes.indexOf(anchorIndex);
  const endRangeIndex = rangeIndexes.indexOf(endIndex);

  if (anchorRangeIndex === -1 || endRangeIndex <= anchorRangeIndex + 1) {
    return scale;
  }

  const intervalCount = endRangeIndex - anchorRangeIndex;
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let rangeIndex = anchorRangeIndex + 1; rangeIndex < endRangeIndex; rangeIndex += 1) {
    const scaleIndex = rangeIndexes[rangeIndex];
    const color = scale[scaleIndex];

    if (!color || color.tone === preservedInputTone) {
      continue;
    }

    const progress = (rangeIndex - anchorRangeIndex) / intervalCount;
    const floorChroma = interpolate(anchorChroma, endChroma, progress);
    const currentChroma = hexToOklch(color.hex).c;
    const missingChroma = floorChroma - currentChroma;

    if (missingChroma <= valleyFloor.minChromaDip) {
      continue;
    }

    const adjustedChroma =
      currentChroma + Math.min(missingChroma * valleyFloor.strength, valleyFloor.maxChromaLift);
    const adjusted = createScaleColorWithChroma(color, adjustedChroma);

    if (adjusted.hex !== color.hex) {
      adjustedByIndex.set(scaleIndex, adjusted);
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function applyFinalLightnessSpacingGuard(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone
): TonalScaleColor[] {
  const spacing = rule?.finalLightnessSpacing;

  if (!spacing || colorSpace !== 'oklch') {
    return scale;
  }

  let changed = false;
  const nextScale = [...scale];
  const originalLightnessByIndex = scale.map((color) => hexToOklch(color.hex).l);

  for (let iteration = 0; iteration < spacing.maxIterations; iteration += 1) {
    let iterationChanged = false;

    for (let index = 1; index < nextScale.length; index += 1) {
      const previous = nextScale[index - 1];
      const color = nextScale[index];

      if (!previous || !color || color.tone === preservedInputTone) {
        continue;
      }

      const range = resolveFinalLightnessSpacingRange(previous, color, spacing);

      if (!range) {
        continue;
      }

      const previousLightness = hexToOklch(previous.hex).l;
      const currentLightness = hexToOklch(color.hex).l;
      const targetLightness = previousLightness - range.minDelta;

      if (currentLightness <= targetLightness) {
        continue;
      }

      const minimumLightness = originalLightnessByIndex[index] - range.maxLightnessDrop;
      const adjusted = createScaleColorWithLightness(
        color,
        colorSpace,
        Math.max(targetLightness, minimumLightness)
      );

      if (adjusted.hex === color.hex) {
        continue;
      }

      nextScale[index] = adjusted;
      changed = true;
      iterationChanged = true;
    }

    if (!iterationChanged) {
      break;
    }
  }

  return changed ? nextScale : scale;
}

function resolveFinalLightnessSpacingRange(
  previous: TonalScaleColor,
  color: TonalScaleColor,
  spacing: NonNullable<ChromaCurveContinuityRule['finalLightnessSpacing']>
): ChromaCurveLightnessSpacingRange | undefined {
  if (isAbsoluteScaleCapTone(previous.tone) || isAbsoluteScaleCapTone(color.tone)) {
    return undefined;
  }

  return spacing.ranges.find(
    (range) => previous.tone >= range.startTone && color.tone <= range.endTone
  );
}

function resolveChromaCurveShapeSegment(
  scale: TonalScaleColor[],
  segment: ChromaCurveShapeSegment,
  apexIndex: number,
  firstChromaticIndex: number,
  lastChromaticIndex: number
): ChromaCurveResolvedShapeSegment | undefined {
  const startIndex = resolveChromaCurveShapePointIndex(
    scale,
    segment.from,
    apexIndex,
    firstChromaticIndex,
    lastChromaticIndex
  );
  const endIndex = resolveChromaCurveShapePointIndex(
    scale,
    segment.to,
    apexIndex,
    firstChromaticIndex,
    lastChromaticIndex
  );

  return startIndex !== undefined && endIndex !== undefined && endIndex > startIndex
    ? { startIndex, endIndex }
    : undefined;
}

function resolveChromaCurveShapePointIndex(
  scale: TonalScaleColor[],
  point: ChromaCurveShapePoint,
  apexIndex: number,
  firstChromaticIndex: number,
  lastChromaticIndex: number
): number | undefined {
  switch (point.kind) {
    case 'chromatic-light-end':
      return firstChromaticIndex;
    case 'chromatic-dark-end':
      return lastChromaticIndex;
    case 'dynamic-apex':
      return apexIndex;
    case 'tone': {
      const index = scale.findIndex((color) => color.tone === point.tone);

      return index >= 0 ? index : undefined;
    }
  }
}

function resolveChromaCurveApexIndex(
  scale: TonalScaleColor[],
  chromaticIndexes: readonly number[]
): number | undefined {
  return chromaticIndexes.reduce<number | undefined>((bestIndex, index) => {
    if (bestIndex === undefined) {
      return index;
    }

    return hexToOklch(scale[index].hex).c > hexToOklch(scale[bestIndex].hex).c ? index : bestIndex;
  }, undefined);
}

function applyChromaCurveShapeSegment(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  segmentRule: ChromaCurveShapeSegment,
  segment: ChromaCurveResolvedShapeSegment,
  preservedInputTone: ScaleTone | undefined,
  adjustedByIndex: Map<number, TonalScaleColor>
): void {
  const curveShape = rule.curveShape;
  const { startIndex, endIndex } = segment;

  if (
    !curveShape ||
    endIndex <= startIndex ||
    endIndex - startIndex + 1 < curveShape.minSegmentSlots
  ) {
    return;
  }

  const startColor = scale[startIndex];
  const endColor = scale[endIndex];

  if (!startColor || !endColor) {
    return;
  }

  const startOklch = hexToOklch(startColor.hex);
  const endOklch = hexToOklch(endColor.hex);

  for (let index = startIndex + 1; index < endIndex; index += 1) {
    const color = scale[index];

    if (
      !color ||
      (preservedInputTone !== undefined && color.tone === preservedInputTone) ||
      isAbsoluteScaleCapTone(color.tone)
    ) {
      continue;
    }

    const currentOklch = hexToOklch(color.hex);
    const lightnessProgress = normalizedProgress(currentOklch.l, startOklch.l, endOklch.l);
    const targetProgress = resolveChromaCurveShapeProgress(
      lightnessProgress,
      segmentRule.easing,
      segmentRule.midpointLift,
      segmentRule.midpointLiftCenter,
      segmentRule.midpointLiftRadius
    );
    const targetChroma = interpolate(startOklch.c, endOklch.c, targetProgress);
    const segmentStrength = segmentRule.strength ?? curveShape.strength;
    const maxChromaAdjustment = segmentRule.maxChromaAdjustment ?? curveShape.maxChromaAdjustment;
    const adjustment = clamp(
      (targetChroma - currentOklch.c) * segmentStrength,
      -maxChromaAdjustment,
      maxChromaAdjustment
    );

    if (Math.abs(adjustment) < 0.0001) {
      continue;
    }

    const adjustedColor = createScaleColorWithChromaShoulder(
      color,
      currentOklch.c + adjustment,
      segmentRule.maxLightnessDrop ?? 0
    );

    if (adjustedColor !== color) {
      adjustedByIndex.set(index, adjustedColor);
    }
  }
}

function resolveChromaCurveShapeProgress(
  progress: number,
  easing: ChromaCurveShapeSegment['easing'],
  midpointLift = 0,
  midpointLiftCenter = 0.5,
  midpointLiftRadius = 0.5
): number {
  const clampedProgress = clamp(progress, 0, 1);
  const liftDistance = Math.abs(clampedProgress - clamp(midpointLiftCenter, 0, 1));
  const liftRadius = Math.max(0.01, midpointLiftRadius);
  const liftInfluence =
    liftDistance >= liftRadius ? 0 : (1 - (liftDistance / liftRadius) ** 2) ** 2;
  const liftedProgress =
    midpointLift === 0
      ? clampedProgress
      : clamp(clampedProgress + midpointLift * liftInfluence, 0, 1);

  switch (easing) {
    case 'ease-in':
      return liftedProgress ** 2;
    case 'ease-out':
      return 1 - (1 - liftedProgress) ** 2;
    case 'smoothstep':
      return smoothstep(liftedProgress);
  }
}

function resolveVisualCurvePoint(
  color: TonalScaleColor,
  rule: ChromaCurveContinuityRule
): { x: number; y: number } {
  const oklch = hexToOklch(color.hex);

  return {
    x: oklch.l / 100,
    y: oklch.c / rule.visualChromaMax
  };
}

function resolveVectorLength(vector: { x: number; y: number }): number {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

function resolveTurnDegrees(
  incoming: { x: number; y: number },
  outgoing: { x: number; y: number }
): number {
  const incomingAngle = Math.atan2(incoming.y, incoming.x);
  const outgoingAngle = Math.atan2(outgoing.y, outgoing.x);
  const rawTurn = Math.abs(outgoingAngle - incomingAngle);
  const normalizedTurn = rawTurn > Math.PI ? Math.PI * 2 - rawTurn : rawTurn;

  return (normalizedTurn * 180) / Math.PI;
}

function resolveIncomingChromaMomentum(
  scale: TonalScaleColor[],
  anchorIndex: number,
  sampleSize: number
): number | undefined {
  const positiveDeltas = Array.from({ length: sampleSize }, (_, offset) => {
    const left = scale[anchorIndex - offset - 1];
    const right = scale[anchorIndex - offset];

    if (
      !left ||
      !right ||
      isAbsoluteScaleCapTone(left.tone) ||
      isAbsoluteScaleCapTone(right.tone)
    ) {
      return undefined;
    }

    const delta = hexToOklch(right.hex).c - hexToOklch(left.hex).c;

    return delta > 0 ? delta : undefined;
  }).filter((delta): delta is number => delta !== undefined);

  return positiveDeltas.length === 0 ? undefined : Math.max(...positiveDeltas);
}

function resolveForwardApexHueDriftSign(
  scale: TonalScaleColor[],
  rule: ChromaCurveContinuityRule,
  protectedAnchorIndex: number,
  vividStartIndex: number,
  incomingDelta: number
): -1 | 0 | 1 {
  const first = scale[protectedAnchorIndex + 1];

  if (!first || rule.forwardApexShoulder.maxHueDrift <= 0) {
    return 0;
  }

  const anchorChroma = hexToOklch(scale[protectedAnchorIndex].hex).c;
  const progress = normalizedProgress(
    protectedAnchorIndex + 1,
    protectedAnchorIndex,
    vividStartIndex
  );
  const shoulderProgress = resolveForwardApexShoulderProgress(
    progress,
    rule.forwardApexShoulder.peakProgress,
    rule.forwardApexShoulder.progressGamma
  );
  const targetChroma =
    anchorChroma + incomingDelta * rule.forwardApexShoulder.liftRatio * shoulderProgress;
  const positiveChroma = resolveForwardHueDriftCandidateChroma(
    first,
    targetChroma,
    rule.forwardApexShoulder.maxLightnessDrop,
    rule.forwardApexShoulder.maxHueDrift,
    hexToOklch(scale[protectedAnchorIndex].hex).h,
    rule.forwardApexShoulder.maxHueDrift,
    rule.forwardApexShoulder.minHueDriftChromaGain
  );
  const negativeChroma = resolveForwardHueDriftCandidateChroma(
    first,
    targetChroma,
    rule.forwardApexShoulder.maxLightnessDrop,
    -rule.forwardApexShoulder.maxHueDrift,
    hexToOklch(scale[protectedAnchorIndex].hex).h,
    rule.forwardApexShoulder.maxHueDrift,
    rule.forwardApexShoulder.minHueDriftChromaGain
  );

  if (Math.abs(positiveChroma - negativeChroma) < 0.0001) {
    return 0;
  }

  return positiveChroma > negativeChroma ? 1 : -1;
}

function resolveForwardApexShoulderProgress(
  progress: number,
  peakProgress: number,
  progressGamma: number
): number {
  const safePeakProgress = clamp(peakProgress, 0.05, 0.95);

  return progress <= safePeakProgress
    ? progress / safePeakProgress
    : ((1 - progress) / (1 - safePeakProgress)) ** progressGamma;
}

function resolveForwardHueDriftCandidateChroma(
  color: TonalScaleColor,
  targetChroma: number,
  maxLightnessDrop: number,
  hueDrift: number,
  referenceHue: number,
  maxActualHueDrift: number,
  minHueDriftChromaGain = 0
): number {
  return hexToOklch(
    createScaleColorWithForwardChromaShoulder(
      color,
      targetChroma,
      maxLightnessDrop,
      hueDrift,
      referenceHue,
      maxActualHueDrift,
      minHueDriftChromaGain
    ).hex
  ).c;
}

function applyChromaPeakGuard(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule | undefined,
  colorSpace: ColorInterpolationSpace,
  preservedInputTone: ScaleTone,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  if (!rule || colorSpace !== 'oklch') {
    return scale;
  }

  const anchorIndex = scale.findIndex((color) => color.tone === preservedInputTone);

  if (anchorIndex === -1 || isAbsoluteScaleCapTone(scale[anchorIndex].tone)) {
    return scale;
  }

  let currentScale = scale;

  if (resolveChromaPeakIssue(currentScale, rule, anchorIndex, vividStartTone)) {
    const maxRadius = resolveChromaPeakMaxRadius(scale, rule, anchorIndex, vividStartTone);
    const shouldCompleteNearVividBoundaryRadius =
      resolveNearVividBoundaryChromaRule(scale, rule, anchorIndex, vividStartTone) !== undefined;

    for (let radius = 1; radius <= maxRadius; radius += 1) {
      currentScale = applyChromaPeakRadius(
        currentScale,
        rule,
        anchorIndex,
        radius,
        vividStartTone,
        shouldCompleteNearVividBoundaryRadius
      );

      if (
        !shouldCompleteNearVividBoundaryRadius &&
        !resolveChromaPeakIssue(currentScale, rule, anchorIndex, vividStartTone)
      ) {
        break;
      }
    }
  }

  currentScale = applyDominantChromaPlateauGuard(currentScale, rule, anchorIndex);
  currentScale = applyVividStartChromaShoulderGuard(
    currentScale,
    rule,
    anchorIndex,
    vividStartTone
  );

  return applyLightZoneChromaTangentGuard(currentScale, rule, anchorIndex, vividStartTone);
}

function applyChromaPeakRadius(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  radius: number,
  vividStartTone?: ScaleTone,
  force = false
): TonalScaleColor[] {
  const issue = resolveChromaPeakIssue(scale, rule, anchorIndex, vividStartTone);

  if (!issue && !force) {
    return scale;
  }

  const anchorChroma = hexToOklch(scale[anchorIndex].hex).c;
  const allowedDrop = resolveAllowedChromaPeakDrop(
    scale,
    rule,
    anchorIndex,
    anchorChroma,
    vividStartTone
  );
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let distance = 1; distance <= radius; distance += 1) {
    const targetChroma = Math.max(0, anchorChroma - allowedDrop * distance);
    const leftIndex = anchorIndex - distance;
    const rightIndex = anchorIndex + distance;

    for (const index of [leftIndex, rightIndex]) {
      const color = scale[index];

      if (!color || isAbsoluteScaleCapTone(color.tone)) {
        continue;
      }

      if (
        shouldSkipNearVividBoundaryChromaShoulderExpansion(
          scale,
          rule,
          anchorIndex,
          index,
          distance,
          vividStartTone
        )
      ) {
        continue;
      }

      if (shouldSkipChromaPeakAdjustment(scale, rule, anchorIndex, index, vividStartTone)) {
        continue;
      }

      const currentChroma = hexToOklch(color.hex).c;

      if (currentChroma >= targetChroma) {
        continue;
      }

      adjustedByIndex.set(index, createScaleColorWithChroma(color, targetChroma));
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function shouldSkipNearVividBoundaryChromaShoulderExpansion(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  targetIndex: number,
  distance: number,
  vividStartTone?: ScaleTone
): boolean {
  const nearVividBoundary = resolveNearVividBoundaryChromaRule(
    scale,
    rule,
    anchorIndex,
    vividStartTone
  );

  return nearVividBoundary !== undefined && distance > 1 && targetIndex < anchorIndex;
}

function shouldSkipChromaPeakAdjustment(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  targetIndex: number,
  vividStartTone?: ScaleTone
): boolean {
  const anchor = scale[anchorIndex];
  const target = scale[targetIndex];

  if (!anchor || !target || vividStartTone === undefined) {
    return false;
  }

  if (anchor.tone >= vividStartTone || target.tone < vividStartTone) {
    return false;
  }

  const nearVividBoundary = resolveNearVividBoundaryChromaRule(
    scale,
    rule,
    anchorIndex,
    vividStartTone
  );

  return !nearVividBoundary?.allowVividSide;
}

function resolveChromaPeakIssue(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): boolean {
  const previous = scale[anchorIndex - 1];
  const anchor = scale[anchorIndex];
  const next = scale[anchorIndex + 1];

  if (!previous || !anchor || !next) {
    return false;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const previousChroma = hexToOklch(previous.hex).c;
  const nextChroma = hexToOklch(next.hex).c;
  const leftDrop = anchorChroma - previousChroma;
  const rightDrop = anchorChroma - nextChroma;
  const peakDrop = Math.min(leftDrop, rightDrop);
  const prominenceThreshold = resolveChromaPeakProminenceThreshold(
    scale,
    rule,
    anchorIndex,
    vividStartTone
  );

  return leftDrop > 0 && rightDrop > 0 && peakDrop > prominenceThreshold;
}

function resolveChromaPeakProminenceThreshold(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): number {
  return (
    resolveNearVividBoundaryChromaRule(scale, rule, anchorIndex, vividStartTone)
      ?.prominenceThreshold ?? rule.prominenceThreshold
  );
}

function resolveChromaPeakMaxRadius(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): number {
  return (
    resolveNearVividBoundaryChromaRule(scale, rule, anchorIndex, vividStartTone)?.maxRadius ??
    rule.maxRadius
  );
}

function resolveAllowedChromaPeakDrop(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  anchorChroma: number,
  vividStartTone?: ScaleTone
): number {
  const nearVividBoundary = resolveNearVividBoundaryChromaRule(
    scale,
    rule,
    anchorIndex,
    vividStartTone
  );
  const allowedDropMin = nearVividBoundary?.allowedDropMin ?? rule.allowedDropMin;
  const allowedDropRatio = nearVividBoundary?.allowedDropRatio ?? rule.allowedDropRatio;

  return Math.max(allowedDropMin, anchorChroma * allowedDropRatio);
}

function resolveNearVividBoundaryChromaRule(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): NonNullable<ChromaPeakRule['nearVividBoundary']> | undefined {
  const nearVividBoundary = rule.nearVividBoundary;

  if (!nearVividBoundary || vividStartTone === undefined) {
    return undefined;
  }

  const anchor = scale[anchorIndex];
  const vividStartIndex = scale.findIndex((color) => color.tone === vividStartTone);

  return anchor &&
    anchor.tone < vividStartTone &&
    vividStartIndex > anchorIndex &&
    vividStartIndex - anchorIndex <= nearVividBoundary.maxDistance
    ? nearVividBoundary
    : undefined;
}

type DominantChromaPlateauIssue = {
  startIndex: number;
  endIndex: number;
  chroma: number;
};

function applyDominantChromaPlateauGuard(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number
): TonalScaleColor[] {
  const plateauRule = rule.dominantPlateau;

  if (!plateauRule) {
    return scale;
  }

  let currentScale = scale;

  for (let radius = 1; radius <= plateauRule.maxRadius; radius += 1) {
    const issue = resolveDominantChromaPlateauIssue(currentScale, rule, anchorIndex);

    if (!issue) {
      break;
    }

    currentScale = applyDominantChromaPlateauRadius(currentScale, rule, issue, anchorIndex, radius);
  }

  return currentScale;
}

function applyVividStartChromaShoulderGuard(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  const shoulderRule = rule.vividStartShoulder;
  const anchor = scale[anchorIndex];

  if (!shoulderRule || !anchor || anchor.tone !== vividStartTone) {
    return scale;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const allowedDrop = Math.max(
    shoulderRule.allowedDropMin,
    anchorChroma * shoulderRule.allowedDropRatio
  );
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let distance = 1; distance <= shoulderRule.maxRadius; distance += 1) {
    const targetChroma = Math.max(0, anchorChroma - allowedDrop * distance);
    const leftIndex = anchorIndex - distance;
    const rightIndex = anchorIndex + distance;

    for (const index of [leftIndex, rightIndex]) {
      const color = scale[index];

      if (!color || isAbsoluteScaleCapTone(color.tone)) {
        continue;
      }

      const currentChroma = hexToOklch(color.hex).c;

      if (currentChroma >= targetChroma) {
        continue;
      }

      adjustedByIndex.set(
        index,
        createScaleColorWithChromaShoulder(
          color,
          targetChroma,
          index < anchorIndex ? shoulderRule.preVividMaxLightnessDrop : 0
        )
      );
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function applyLightZoneChromaTangentGuard(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number,
  vividStartTone?: ScaleTone
): TonalScaleColor[] {
  const tangentRule = rule.lightZoneTangent;
  const anchor = scale[anchorIndex];
  const vividStartIndex =
    vividStartTone === undefined ? -1 : scale.findIndex((color) => color.tone === vividStartTone);

  if (
    !tangentRule ||
    !anchor ||
    anchor.tone > tangentRule.maxAnchorTone ||
    vividStartIndex <= anchorIndex
  ) {
    return scale;
  }

  const incomingDelta = resolveIncomingChromaDelta(scale, anchorIndex, tangentRule.sampleSize);

  if (incomingDelta === undefined || incomingDelta < tangentRule.minIncomingDelta) {
    return scale;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let index = anchorIndex + 1; index < vividStartIndex; index += 1) {
    const color = scale[index];

    if (!color || isAbsoluteScaleCapTone(color.tone)) {
      continue;
    }

    const progress = normalizedProgress(index, anchorIndex, vividStartIndex);
    const targetChroma =
      anchorChroma +
      incomingDelta * tangentRule.liftRatio * (1 - progress) ** tangentRule.progressGamma;
    const currentChroma = hexToOklch(color.hex).c;

    if (currentChroma >= targetChroma) {
      continue;
    }

    adjustedByIndex.set(index, createScaleColorWithChroma(color, targetChroma));
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function resolveIncomingChromaDelta(
  scale: TonalScaleColor[],
  anchorIndex: number,
  sampleSize: number
): number | undefined {
  const deltas = Array.from({ length: sampleSize }, (_, offset) => {
    const left = scale[anchorIndex - offset - 1];
    const right = scale[anchorIndex - offset];

    if (
      !left ||
      !right ||
      isAbsoluteScaleCapTone(left.tone) ||
      isAbsoluteScaleCapTone(right.tone)
    ) {
      return undefined;
    }

    const delta = hexToOklch(right.hex).c - hexToOklch(left.hex).c;

    return delta > 0 ? delta : undefined;
  });

  return averageDefinedNumbers(deltas);
}

function applyDominantChromaPlateauRadius(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  issue: DominantChromaPlateauIssue,
  anchorIndex: number,
  radius: number
): TonalScaleColor[] {
  const plateauRule = rule.dominantPlateau;

  if (!plateauRule) {
    return scale;
  }

  const allowedDrop = resolveAllowedDominantPlateauDrop(plateauRule, issue.chroma);
  const adjustedByIndex = new Map<number, TonalScaleColor>();

  for (let distance = 1; distance <= radius; distance += 1) {
    const targetChroma = Math.max(0, issue.chroma - allowedDrop * distance);
    const leftIndex = issue.startIndex - distance;
    const rightIndex = issue.endIndex + distance;

    for (const index of [leftIndex, rightIndex]) {
      const color = scale[index];

      if (!color || isAbsoluteScaleCapTone(color.tone)) {
        continue;
      }

      if (distance > 1 && index < anchorIndex) {
        continue;
      }

      const currentChroma = hexToOklch(color.hex).c;

      if (currentChroma >= targetChroma) {
        continue;
      }

      adjustedByIndex.set(index, createScaleColorWithChroma(color, targetChroma));
    }
  }

  return adjustedByIndex.size === 0
    ? scale
    : scale.map((color, index) => adjustedByIndex.get(index) ?? color);
}

function resolveDominantChromaPlateauIssue(
  scale: TonalScaleColor[],
  rule: ChromaPeakRule,
  anchorIndex: number
): DominantChromaPlateauIssue | undefined {
  const plateauRule = rule.dominantPlateau;
  const anchor = scale[anchorIndex];

  if (!plateauRule || !anchor) {
    return undefined;
  }

  const anchorChroma = hexToOklch(anchor.hex).c;
  const plateauFloor = anchorChroma - plateauRule.equalityTolerance;
  let startIndex = anchorIndex;
  let endIndex = anchorIndex;

  while (startIndex > 0 && resolveScaleColorChroma(scale[startIndex - 1]) >= plateauFloor) {
    startIndex -= 1;
  }

  while (
    endIndex < scale.length - 1 &&
    resolveScaleColorChroma(scale[endIndex + 1]) >= plateauFloor
  ) {
    endIndex += 1;
  }

  if (endIndex - startIndex + 1 > plateauRule.maxPlateauSlots) {
    return undefined;
  }

  const leftShoulder = scale[startIndex - 1];
  const rightShoulder = scale[endIndex + 1];

  if (!leftShoulder || !rightShoulder) {
    return undefined;
  }

  const plateauChroma = Math.max(
    ...scale.slice(startIndex, endIndex + 1).map((color) => hexToOklch(color.hex).c)
  );
  const leftDrop = plateauChroma - hexToOklch(leftShoulder.hex).c;
  const rightDrop = plateauChroma - hexToOklch(rightShoulder.hex).c;
  const plateauDrop = Math.min(leftDrop, rightDrop);

  return leftDrop > 0 && rightDrop > 0 && plateauDrop > plateauRule.prominenceThreshold
    ? { startIndex, endIndex, chroma: plateauChroma }
    : undefined;
}

function resolveAllowedDominantPlateauDrop(
  plateauRule: NonNullable<ChromaPeakRule['dominantPlateau']>,
  plateauChroma: number
): number {
  return Math.max(plateauRule.allowedDropMin, plateauChroma * plateauRule.allowedDropRatio);
}

function resolveScaleColorChroma(color: TonalScaleColor | undefined): number {
  return color && !isAbsoluteScaleCapTone(color.tone) ? hexToOklch(color.hex).c : -Infinity;
}

function createScaleColorWithChroma(color: TonalScaleColor, targetChroma: number): TonalScaleColor {
  const oklch = hexToOklch(color.hex);

  if (Math.abs(oklch.c - targetChroma) < 0.0001) {
    return color;
  }

  return createScaleColorFromHex(color, oklchToHex({ ...oklch, c: clamp(targetChroma, 0, 0.5) }));
}

function createScaleColorWithChromaShoulder(
  color: TonalScaleColor,
  targetChroma: number,
  maxLightnessDrop: number
): TonalScaleColor {
  const directColor = createScaleColorWithChroma(color, targetChroma);

  if (maxLightnessDrop <= 0) {
    return directColor;
  }

  const initialOklch = hexToOklch(color.hex);
  let bestColor = directColor;
  let bestChroma = hexToOklch(directColor.hex).c;

  for (let step = 1; step <= 8; step += 1) {
    const lightness = initialOklch.l - (maxLightnessDrop * step) / 8;
    const candidate = createScaleColorFromHex(
      color,
      oklchToHex({ ...initialOklch, l: lightness, c: clamp(targetChroma, 0, 0.5) })
    );
    const candidateChroma = hexToOklch(candidate.hex).c;

    if (candidateChroma > bestChroma + 0.0001) {
      bestColor = candidate;
      bestChroma = candidateChroma;
    }
  }

  return bestColor;
}

function createScaleColorWithForwardChromaShoulder(
  color: TonalScaleColor,
  targetChroma: number,
  maxLightnessDrop: number,
  hueDrift: number,
  referenceHue: number,
  maxActualHueDrift: number,
  minHueDriftChromaGain: number
): TonalScaleColor {
  const directColor = createScaleColorWithChromaShoulder(color, targetChroma, maxLightnessDrop);
  const directChroma = hexToOklch(directColor.hex).c;

  if (directChroma >= targetChroma - 0.0001 || Math.abs(hueDrift) <= 0.0001) {
    return directColor;
  }

  const initialOklch = hexToOklch(color.hex);
  let bestColor = directColor;
  let bestChroma = directChroma;

  for (let lightnessStep = 0; lightnessStep <= 4; lightnessStep += 1) {
    const lightness = initialOklch.l - (maxLightnessDrop * lightnessStep) / 4;

    const candidate = createScaleColorFromHex(
      color,
      oklchToHex({
        ...initialOklch,
        l: lightness,
        c: clamp(targetChroma, 0, 0.5),
        h: normalizeHue(initialOklch.h + hueDrift)
      })
    );
    const candidateOklch = hexToOklch(candidate.hex);
    const candidateChroma = candidateOklch.c;

    if (resolveHueDistance(referenceHue, candidateOklch.h) > maxActualHueDrift + 0.5) {
      continue;
    }

    if (candidateChroma > bestChroma + 0.0001) {
      bestColor = candidate;
      bestChroma = candidateChroma;
    }
  }

  return bestChroma >= directChroma + minHueDriftChromaGain ? bestColor : directColor;
}

function resolveHueDistance(left: number, right: number): number {
  return Math.abs(shortestHueDelta(left, right));
}

function resolveStepLightnessDelta(
  scale: TonalScaleColor[],
  index: number,
  colorSpace: ColorInterpolationSpace
): number | undefined {
  const previous = scale[index - 1];
  const current = scale[index];

  if (!previous || !current) {
    return undefined;
  }

  return (
    resolveScaleColorLightness(previous, colorSpace) -
    resolveScaleColorLightness(current, colorSpace)
  );
}

function averageDefinedNumbers(values: Array<number | undefined>): number | undefined {
  const definedValues = values.filter((value): value is number => value !== undefined);

  if (definedValues.length === 0) {
    return undefined;
  }

  return definedValues.reduce((total, value) => total + value, 0) / definedValues.length;
}

function resolveClosestScaleColorIndex(scale: TonalScaleColor[], tone: ScaleTone): number {
  return scale.reduce((closestIndex, color, index) => {
    const closest = scale[closestIndex];

    if (!closest || Math.abs(color.tone - tone) < Math.abs(closest.tone - tone)) {
      return index;
    }

    return closestIndex;
  }, 0);
}

function resolveScaleColorLightness(
  color: TonalScaleColor,
  colorSpace: ColorInterpolationSpace
): number {
  return colorSpace === 'oklch' ? hexToOklch(color.hex).l : color.hsl.l;
}

function resolveHexLightness(hex: string, colorSpace: ColorInterpolationSpace): number {
  return colorSpace === 'oklch' ? hexToOklch(hex).l : hexToHsl(hex).l;
}

function createScaleColorWithLightness(
  color: TonalScaleColor,
  colorSpace: ColorInterpolationSpace,
  lightness: number
): TonalScaleColor {
  const hex =
    colorSpace === 'oklch'
      ? oklchToHex({ ...hexToOklch(color.hex), l: lightness })
      : hslToHex({ ...color.hsl, l: lightness });

  return {
    ...color,
    hex,
    hsl: colorSpace === 'hsl' ? { ...color.hsl, l: lightness } : hexToHsl(hex)
  };
}

function createInterpolatedScaleColor(
  target: TonalScaleColor,
  start: TonalScaleColor,
  end: TonalScaleColor,
  progress: number,
  colorSpace: ColorInterpolationSpace
): TonalScaleColor {
  if (colorSpace === 'oklch') {
    return createScaleColorFromHex(
      target,
      oklchToHex(interpolateOklch(hexToOklch(start.hex), hexToOklch(end.hex), progress))
    );
  }

  const hsl = {
    h: interpolateHue(start.hsl, end.hsl, progress),
    s: interpolate(start.hsl.s, end.hsl.s, progress),
    l: interpolate(start.hsl.l, end.hsl.l, progress)
  };

  return {
    ...target,
    hex: hslToHex(hsl),
    hsl
  };
}

function resolveMaxLightnessForContrast(
  color: TonalScaleColor,
  colorSpace: ColorInterpolationSpace,
  foregroundHex: string,
  minRatio: number
): number {
  let low = 0;
  let high = 100;

  for (let index = 0; index < 24; index += 1) {
    const candidateLightness = (low + high) / 2;
    const candidateHex =
      colorSpace === 'oklch'
        ? oklchToHex({ ...hexToOklch(color.hex), l: candidateLightness })
        : hslToHex({ ...color.hsl, l: candidateLightness });

    if (contrastRatio(candidateHex, foregroundHex) >= minRatio) {
      low = candidateLightness;
    } else {
      high = candidateLightness;
    }
  }

  return low;
}

function resolveReferenceLightness(params: {
  tone: ScaleTone;
  profile: TonalProfile;
  baseHsl: HslColor;
  referenceHsl: HslColor;
  referenceBaseHsl: HslColor;
  referenceLightHsl: HslColor;
  referenceDarkHsl: HslColor;
  controls: CurveControls;
}): number {
  const {
    tone,
    profile,
    baseHsl,
    referenceHsl,
    referenceBaseHsl,
    referenceLightHsl,
    referenceDarkHsl,
    controls
  } = params;

  if (tone === profile.baseTone) {
    return baseHsl.l;
  }

  if (tone < profile.baseTone) {
    const referenceProgress = normalizedProgress(
      referenceHsl.l,
      referenceBaseHsl.l,
      referenceLightHsl.l
    );
    const shapedProgress = referenceProgress ** controls.lightLightnessGamma;
    return interpolate(baseHsl.l, controls.lightCeilingLightness, shapedProgress);
  }

  const referenceProgress = normalizedProgress(
    referenceHsl.l,
    referenceBaseHsl.l,
    referenceDarkHsl.l
  );
  const shapedProgress = referenceProgress ** controls.darkLightnessGamma;
  return interpolate(baseHsl.l, controls.darkFloorLightness, shapedProgress);
}

function resolveReferenceSideProgress(params: {
  tone: ScaleTone;
  profile: TonalProfile;
  referenceHsl: HslColor;
  referenceBaseHsl: HslColor;
  referenceLightHsl: HslColor;
  referenceDarkHsl: HslColor;
}): number {
  const { tone, profile, referenceHsl, referenceBaseHsl, referenceLightHsl, referenceDarkHsl } =
    params;

  if (tone === profile.baseTone) {
    return 0;
  }

  if (tone < profile.baseTone) {
    return normalizedProgress(referenceHsl.l, referenceBaseHsl.l, referenceLightHsl.l);
  }

  return normalizedProgress(referenceHsl.l, referenceBaseHsl.l, referenceDarkHsl.l);
}

function resolveLinearLightness(
  tone: ScaleTone,
  anchorTone: ScaleTone,
  anchorLightness: number,
  controls: CurveControls,
  lightEndTone: ScaleTone,
  darkEndTone: ScaleTone
): number {
  if (tone === anchorTone) {
    return anchorLightness;
  }

  if (tone < anchorTone) {
    const progress = normalizedProgress(anchorTone - tone, 0, anchorTone - lightEndTone);
    return interpolate(
      anchorLightness,
      controls.lightCeilingLightness,
      progress ** controls.lightLightnessGamma
    );
  }

  const progress = normalizedProgress(tone - anchorTone, 0, darkEndTone - anchorTone);
  return interpolate(
    anchorLightness,
    controls.darkFloorLightness,
    progress ** controls.darkLightnessGamma
  );
}

function resolveLinearSaturationMultiplier(
  tone: ScaleTone,
  profile: TonalProfile,
  generationAnchorTone: ScaleTone,
  lightEndTone: ScaleTone,
  darkEndTone: ScaleTone
): number {
  const curve = profile.saturationCurve;

  if (!curve) {
    return 1;
  }

  if (curve.type === 'soft-dark') {
    if (tone <= generationAnchorTone) {
      return 1;
    }

    const darkProgress = normalizedProgress(tone, generationAnchorTone, darkEndTone);
    return interpolate(1, curve.darkMinRatio, darkProgress ** curve.darkGamma);
  }

  if (tone < generationAnchorTone) {
    const lightProgress = normalizedProgress(
      generationAnchorTone - tone,
      0,
      generationAnchorTone - lightEndTone
    );
    return interpolate(1, curve.lightMinRatio, lightProgress ** curve.lightGamma);
  }

  const darkProgress = normalizedProgress(tone, generationAnchorTone, darkEndTone);
  return interpolate(1, curve.darkMinRatio, darkProgress ** curve.darkGamma);
}

function resolveAdaptiveVividMinRatio(inputHex: string, rule: VividContrastRule): number {
  if (rule.luminousMinRatio === undefined) {
    return rule.minRatio;
  }

  const inputContrast = contrastRatio(inputHex, rule.foregroundHex);
  return roundChannel(clamp(inputContrast, rule.luminousMinRatio, rule.minRatio));
}

function createHslByTone(scale: TonalScaleColor[]): Record<ScaleTone, HslColor> {
  return Object.fromEntries(scale.map((entry) => [entry.tone, entry.hsl])) as Record<
    ScaleTone,
    HslColor
  >;
}

function resolveReferenceHslAtTone(
  tone: ScaleTone,
  anchors: Array<TonalAnchor & { hsl: HslColor }>
): HslColor {
  const exactAnchor = anchors.find((anchor) => Math.abs(anchor.position - tone) < 0.0001);

  if (exactAnchor) {
    return exactAnchor.hsl;
  }

  const nextAnchor = anchors.find((anchor) => anchor.position > tone);
  const previousAnchor = [...anchors].reverse().find((anchor) => anchor.position < tone);

  if (!previousAnchor) {
    return anchors[0].hsl;
  }

  if (!nextAnchor) {
    return anchors[anchors.length - 1].hsl;
  }

  const progress = normalizedProgress(tone, previousAnchor.position, nextAnchor.position);

  return {
    h: interpolateHue(previousAnchor.hsl, nextAnchor.hsl, progress),
    s: interpolate(previousAnchor.hsl.s, nextAnchor.hsl.s, progress),
    l: interpolate(previousAnchor.hsl.l, nextAnchor.hsl.l, progress)
  };
}

function interpolateHue(start: HslColor, end: HslColor, progress: number): number {
  const startHue = start.s === 0 ? end.h : start.h;
  const endHue = end.s === 0 ? start.h : end.h;
  return normalizeHue(startHue + shortestHueDelta(startHue, endHue) * clamp(progress, 0, 1));
}

function interpolateOklch(start: OklchColor, end: OklchColor, progress: number): OklchColor {
  const startHue = start.c < 0.000001 ? end.h : start.h;
  const endHue = end.c < 0.000001 ? start.h : end.h;

  return {
    l: interpolate(start.l, end.l, progress),
    c: interpolate(start.c, end.c, progress),
    h: normalizeHue(startHue + shortestHueDelta(startHue, endHue) * clamp(progress, 0, 1))
  };
}

function normalizedProgress(value: number, start: number, end: number): number {
  if (start === end) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
}

function smoothstep(progress: number): number {
  const clampedProgress = clamp(progress, 0, 1);

  return clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
}

function shortestHueDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function hueToRgb(p: number, q: number, hue: number): number {
  let t = hue;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex) ?? '#000000';
  return [1, 3, 5].map((index) => parseInt(normalized.slice(index, index + 2), 16)) as [
    number,
    number,
    number
  ];
}

function hexToLinearRgb(hex: string): [number, number, number] {
  return hexToRgb(hex).map((channel) => srgbToLinear(channel / 255)) as [number, number, number];
}

function fitOklchToSrgb(oklch: OklchColor): OklchColor {
  const normalizedOklch = {
    l: clamp(oklch.l, 0, 100),
    c: Math.max(0, oklch.c),
    h: normalizeHue(oklch.h)
  };

  if (isSrgbInGamut(oklchToSrgbChannels(normalizedOklch))) {
    return normalizedOklch;
  }

  let low = 0;
  let high = normalizedOklch.c;

  for (let index = 0; index < 24; index += 1) {
    const candidateChroma = (low + high) / 2;
    const candidate = { ...normalizedOklch, c: candidateChroma };

    if (isSrgbInGamut(oklchToSrgbChannels(candidate))) {
      low = candidateChroma;
    } else {
      high = candidateChroma;
    }
  }

  return {
    ...normalizedOklch,
    c: low
  };
}

function oklchToSrgbChannels(oklch: OklchColor): [number, number, number] {
  const hueRadians = (normalizeHue(oklch.h) * Math.PI) / 180;
  const oklabL = clamp(oklch.l, 0, 100) / 100;
  const oklabA = Math.max(0, oklch.c) * Math.cos(hueRadians);
  const oklabB = Math.max(0, oklch.c) * Math.sin(hueRadians);
  const lRoot = oklabL + 0.3963377774 * oklabA + 0.2158037573 * oklabB;
  const mRoot = oklabL - 0.1055613458 * oklabA - 0.0638541728 * oklabB;
  const sRoot = oklabL - 0.0894841775 * oklabA - 1.291485548 * oklabB;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ];
}

function isSrgbInGamut(rgb: [number, number, number]): boolean {
  return rgb.every((channel) => channel >= 0 && channel <= 1);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    return srgbToLinear(channel / 255);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

function toHexChannel(value: number): string {
  return Math.round(clamp(value, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * clamp(progress, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundChannel(value: number): number {
  return Number(value.toFixed(2));
}
