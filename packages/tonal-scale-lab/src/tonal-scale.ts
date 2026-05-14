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
  luminousMinRatio?: number;
};

export type MinimumLightnessStepRule = {
  chromaticMinStep: number;
  luminousInitialRange?: {
    maxWhiteContrast: number;
    endTone: ScaleTone;
    minStep: number;
  };
};

export type TonalProfile = {
  id: string;
  label: string;
  commercialName?: string;
  mode: TonalProfileMode;
  inputStrategy: InputColorStrategy;
  baseTone: ScaleTone;
  referenceScale: TonalScaleColor[];
  defaultControls: CurveControls;
  saturationCurve?: SaturationCurve;
  vividContrast?: VividContrastRule;
  minimumLightnessStep?: MinimumLightnessStepRule;
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

export function generateTonalScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleColor[] {
  const generationAnchorTone = profile.baseTone;

  const scale =
    profile.mode === 'linear-lightness'
      ? generateLinearLightnessScale(baseHex, controls, profile, distribution, generationAnchorTone)
      : generateReferenceCurveScale(baseHex, controls, profile, distribution);

  return applyMinimumLightnessSteps(
    applyVividContrastRule(scale, profile, distribution, baseHex),
    distribution,
    profile.minimumLightnessStep,
    baseHex
  );
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
  const referenceLightHsl =
    chromaticProfileReferenceScale[0]?.hsl ?? profileReferenceHslByTone[0];
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

function applyVividContrastRule(
  scale: TonalScaleColor[],
  profile: Pick<TonalProfile, 'baseTone' | 'inputStrategy' | 'vividContrast'>,
  distribution: ScaleDistribution,
  inputHex: string
): TonalScaleColor[] {
  const vividContrast = resolveVividContrastRule(profile.vividContrast, distribution, inputHex);

  if (!vividContrast) {
    return scale;
  }

  const { foregroundHex, minRatio, startTone } = vividContrast;
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const vividStart = scale.find((color) => color.tone === startTone);
  const vividEnd = scale.find((color) => color.tone === chromaticDarkEndTone);

  if (!vividStart || !vividEnd) {
    return scale;
  }

  const vividStartLightness = Math.min(
    vividStart.hsl.l,
    resolveMaxLightnessForContrast(vividStart.hsl, foregroundHex, minRatio)
  );
  const vividEndLightness = Math.min(
    vividEnd.hsl.l,
    resolveMaxLightnessForContrast(vividEnd.hsl, foregroundHex, minRatio)
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
    if (color.tone < startTone || color.tone > chromaticDarkEndTone) {
      return color;
    }

    const targetLightness = shouldPreserveAnchor
      ? resolveAnchoredVividLightness({
          tone: color.tone,
          startTone,
          endTone: chromaticDarkEndTone,
          startLightness: vividStartLightness,
          anchorTone: preservedAnchor.tone,
          anchorLightness: preservedAnchor.hsl.l,
          endLightness: vividEndLightness
        })
        : interpolate(
            vividStartLightness,
            vividEndLightness,
            normalizedProgress(color.tone, startTone, chromaticDarkEndTone)
          );
    const maxAccessibleLightness = resolveMaxLightnessForContrast(
      color.hsl,
      foregroundHex,
      minRatio
    );
    const hsl = {
      ...color.hsl,
      l: Math.min(targetLightness, maxAccessibleLightness)
    };

    return {
      id: color.id,
      label: color.label,
      tone: color.tone,
      hex: hslToHex(hsl),
      hsl
    };
  });

  return applyPreVividBridge(adjustedScale, vividContrast, preservedAnchor?.tone);
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
      vividStartIndex
    });
  }

  return scale.map((color, index) => {
    if (index <= bridgeStartIndex || index >= vividStartIndex) {
      return color;
    }

    const progress = normalizedProgress(index, bridgeStartIndex, vividStartIndex);
    const hsl = {
      h: interpolateHue(bridgeStart.hsl, vividStart.hsl, progress),
      s: interpolate(bridgeStart.hsl.s, vividStart.hsl.s, progress),
      l: interpolate(bridgeStart.hsl.l, vividStart.hsl.l, progress)
    };

    return {
      id: color.id,
      label: color.label,
      tone: color.tone,
      hex: hslToHex(hsl),
      hsl
    };
  });
}

function interpolateBridgeAroundAnchor(params: {
  scale: TonalScaleColor[];
  bridgeStartIndex: number;
  inputAnchorIndex: number;
  vividStartIndex: number;
}): TonalScaleColor[] {
  const { scale, bridgeStartIndex, inputAnchorIndex, vividStartIndex } = params;
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
    const hsl = {
      h: interpolateHue(segmentStart.hsl, segmentEnd.hsl, progress),
      s: interpolate(segmentStart.hsl.s, segmentEnd.hsl.s, progress),
      l: interpolate(segmentStart.hsl.l, segmentEnd.hsl.l, progress)
    };

    return {
      id: color.id,
      label: color.label,
      tone: color.tone,
      hex: hslToHex(hsl),
      hsl
    };
  });
}

function resolveAnchoredVividLightness(params: {
  tone: ScaleTone;
  startTone: ScaleTone;
  endTone: ScaleTone;
  startLightness: number;
  anchorTone: ScaleTone;
  anchorLightness: number;
  endLightness: number;
}): number {
  const { tone, startTone, endTone, startLightness, anchorTone, anchorLightness, endLightness } =
    params;

  if (tone <= anchorTone) {
    return interpolate(
      startLightness,
      anchorLightness,
      normalizedProgress(tone, startTone, anchorTone)
    );
  }

  return interpolate(anchorLightness, endLightness, normalizedProgress(tone, anchorTone, endTone));
}

function applyMinimumLightnessSteps(
  scale: TonalScaleColor[],
  distribution: ScaleDistribution,
  rule: MinimumLightnessStepRule | undefined,
  inputHex: string
): TonalScaleColor[] {
  if (!rule) {
    return scale;
  }

  const inputWhiteContrast = contrastRatio(inputHex, '#ffffff');
  const chromaticLightEndTone = resolveChromaticLightEndTone(distribution);
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(distribution);
  const adjustedById = new Map<string, TonalScaleColor>();
  let previous: TonalScaleColor | undefined;

  for (const color of [...scale].sort((left, right) => left.tone - right.tone)) {
    const isChromaticStepTarget =
      !isAbsoluteScaleCapTone(color.tone) &&
      color.tone >= chromaticLightEndTone &&
      color.tone <= chromaticDarkEndTone;
    const minStep =
      previous && isChromaticStepTarget
        ? resolveMinimumLightnessStep(color.tone, rule, inputWhiteContrast)
        : undefined;
    const targetLightness =
      previous && minStep !== undefined
        ? Math.min(color.hsl.l, previous.hsl.l - minStep)
        : color.hsl.l;
    const nextLightness = roundChannel(clamp(targetLightness, 0, 100));

    const adjusted =
      nextLightness === color.hsl.l
        ? color
        : {
            ...color,
            hex: hslToHex({ ...color.hsl, l: nextLightness }),
            hsl: {
              ...color.hsl,
              l: nextLightness
            }
          };

    adjustedById.set(color.id, adjusted);
    previous = adjusted;
  }

  return scale.map((color) => adjustedById.get(color.id) ?? color);
}

function resolveMinimumLightnessStep(
  currentTone: ScaleTone,
  rule: MinimumLightnessStepRule,
  inputWhiteContrast: number
): number | undefined {
  if (
    rule.luminousInitialRange &&
    inputWhiteContrast <= rule.luminousInitialRange.maxWhiteContrast &&
    currentTone <= rule.luminousInitialRange.endTone
  ) {
    return rule.luminousInitialRange.minStep;
  }

  return rule.chromaticMinStep;
}

function resolveMaxLightnessForContrast(
  hsl: HslColor,
  foregroundHex: string,
  minRatio: number
): number {
  if (contrastRatio(hslToHex({ ...hsl, l: hsl.l }), foregroundHex) >= minRatio) {
    return hsl.l;
  }

  let low = 0;
  let high = hsl.l;

  for (let index = 0; index < 24; index += 1) {
    const candidateLightness = (low + high) / 2;
    const candidateHex = hslToHex({ ...hsl, l: candidateLightness });

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

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
