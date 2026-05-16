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

export type InputPreservationRule = {
  lightZoneEndTone: ScaleTone;
};

export type NodeContinuityRule = {
  nodeTones: readonly ScaleTone[];
  maxNeighborRatio: number;
  tolerance: number;
  maxIterations: number;
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
  const generationAnchorTone = profile.baseTone;
  const colorSpace = resolveProfileColorSpace(profile);

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

  return applyInputPreservation(luminousScale, profile, distribution, colorSpace, baseHex);
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
  const anchorLightness =
    profile.inputStrategy === 'fixed-anchor' ? baseHsl.l : 100 - profile.baseTone;
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
  const anchorLightness =
    profile.inputStrategy === 'fixed-anchor' ? baseOklch.l : 100 - profile.baseTone;
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
    'inputPreservation' | 'inputStrategy' | 'nodeContinuity' | 'vividContrast'
  >,
  distribution: ScaleDistribution,
  colorSpace: ColorInterpolationSpace,
  inputHex: string
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
  const preservedAnchor = resolvePreservedInputAnchor({
    scale,
    distribution,
    colorSpace,
    inputPreservation,
    vividContrast,
    inputHex: normalizedInputHex
  });

  if (!preservedAnchor) {
    return scale;
  }

  const anchoredScale = interpolateScaleThroughPreservedInput({
    scale,
    distribution,
    colorSpace,
    inputPreservation,
    inputAnchor: preservedAnchor,
    inputHex: normalizedInputHex,
    vividStartTone: vividContrast?.startTone
  });

  const vividSafeScale = applyPreservedInputVividContrast(
    anchoredScale,
    distribution,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );

  return applyNodeContinuityGuard(
    vividSafeScale,
    distribution,
    profile.nodeContinuity,
    vividContrast,
    colorSpace,
    preservedAnchor.tone
  );
}

function resolvePreservedInputAnchor(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  vividContrast: VividContrastRule | undefined;
  inputHex: string;
}): TonalScaleColor | undefined {
  const { scale, distribution, colorSpace, inputPreservation, vividContrast, inputHex } = params;
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

  return availableCandidates.reduce<TonalScaleColor | undefined>(
    (current, color) =>
      !current || rgbDistance(color.hex, inputHex) < rgbDistance(current.hex, inputHex)
        ? color
        : current,
    undefined
  );
}

function interpolateScaleThroughPreservedInput(params: {
  scale: TonalScaleColor[];
  distribution: ScaleDistribution;
  colorSpace: ColorInterpolationSpace;
  inputPreservation: InputPreservationRule;
  inputAnchor: TonalScaleColor;
  inputHex: string;
  vividStartTone?: ScaleTone;
}): TonalScaleColor[] {
  const {
    scale,
    distribution,
    colorSpace,
    inputPreservation,
    inputAnchor,
    inputHex,
    vividStartTone
  } = params;
  const anchorByIndex = new Map<number, TonalScaleColor>();
  const structuralAnchorTones = [
    resolveChromaticLightEndTone(distribution),
    inputPreservation.lightZoneEndTone,
    vividStartTone,
    resolveChromaticDarkEndTone(distribution)
  ];

  for (const tone of structuralAnchorTones) {
    if (tone === undefined) {
      continue;
    }

    const anchorIndex = resolveClosestScaleColorIndex(scale, tone);
    const anchorColor = scale[anchorIndex];

    if (anchorColor && !isAbsoluteScaleCapTone(anchorColor.tone)) {
      anchorByIndex.set(anchorIndex, anchorColor);
    }
  }

  const inputAnchorIndex = scale.findIndex((color) => color.id === inputAnchor.id);

  if (inputAnchorIndex === -1) {
    return scale;
  }

  anchorByIndex.set(inputAnchorIndex, createScaleColorFromHex(inputAnchor, inputHex));

  const anchors = [...anchorByIndex.entries()]
    .map(([index, color]) => ({ index, color }))
    .sort((left, right) => left.index - right.index);

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

      const issue = resolveNodeContinuityIssue(currentScale, nodeIndex, rule, colorSpace);

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
  colorSpace: ColorInterpolationSpace
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
      rule
    }),
    createNodeContinuityIssue({
      nodeIndex,
      side: 'exit',
      delta: exitDelta,
      previousDelta: exitBeforeDelta,
      nextDelta: exitAfterDelta,
      rule
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
}): NodeContinuityIssue | undefined {
  const { nodeIndex, side, delta, previousDelta, nextDelta, rule } = params;

  if (delta === undefined || previousDelta === undefined || nextDelta === undefined) {
    return undefined;
  }

  const absoluteDelta = Math.abs(delta);
  const limit =
    Math.max(Math.abs(previousDelta), Math.abs(nextDelta)) * rule.maxNeighborRatio + rule.tolerance;
  const overshoot = absoluteDelta - limit;

  return overshoot > 0.01 ? { nodeIndex, side, limit, overshoot } : undefined;
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
