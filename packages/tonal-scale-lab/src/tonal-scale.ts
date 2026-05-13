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

export type InputColorStrategy = 'seed' | 'fixed-anchor' | 'auto-anchor';

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
};

export type TonalAnchor = {
  position: number;
  hex: string;
};

export const KISKADEE_BASE_TONE: ScaleTone = 55;

export function generateTonalScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): TonalScaleColor[] {
  const inputAnchorTone = resolveInputAnchorTone(baseHex, profile, distribution);

  if (profile.mode === 'linear-lightness') {
    return applyVividContrastRule(
      generateLinearLightnessScale(baseHex, controls, profile, distribution, inputAnchorTone),
      profile,
      distribution,
      inputAnchorTone
    );
  }

  return applyVividContrastRule(
    generateReferenceCurveScale(baseHex, controls, profile, distribution),
    profile,
    distribution,
    inputAnchorTone
  );
}

export function resolveInputAnchorTone(
  baseHex: string,
  profile: Pick<TonalProfile, 'baseTone' | 'inputStrategy' | 'vividContrast'>,
  distribution: ScaleDistribution = DEFAULT_SCALE_DISTRIBUTION
): ScaleTone {
  if (profile.inputStrategy !== 'auto-anchor') {
    return profile.baseTone;
  }

  return resolveNearestScaleTone(resolveAutoInputAnchorTone(baseHex, profile), distribution);
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
  const hasDarkEnd = distribution.slots.some((slot) => slot.position === 100);

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
  const referenceHslByTone = createHslByTone(profile.referenceScale);

  return {
    darkFloorLightness: roundChannel(referenceHslByTone[100].l),
    lightCeilingLightness: roundChannel(referenceHslByTone[0].l),
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
    resolveInputAnchorTone(baseHex, profile, distribution)
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

function generateReferenceCurveScale(
  baseHex: string,
  controls: CurveControls,
  profile: TonalProfile,
  distribution: ScaleDistribution
): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);
  const referenceScale = createReferenceScaleFromScale(profile.referenceScale, distribution);
  const referenceHslByTone = createHslByTone(referenceScale);
  const profileReferenceHslByTone = createHslByTone(profile.referenceScale);
  const referenceBaseHsl = profileReferenceHslByTone[profile.baseTone];
  const referenceLightHsl = profileReferenceHslByTone[0];
  const referenceDarkHsl = profileReferenceHslByTone[100];

  return distribution.slots.map((slot) => {
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
  inputAnchorTone: ScaleTone
): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);
  const anchorLightness = profile.inputStrategy === 'seed' ? 100 - profile.baseTone : baseHsl.l;

  return distribution.slots.map((slot) => {
    const hsl = {
      h: baseHsl.h,
      s: clamp(
        baseHsl.s *
          controls.saturationScale *
          resolveLinearSaturationMultiplier(slot.position, profile, inputAnchorTone),
        0,
        100
      ),
      l: resolveLinearLightness(slot.position, inputAnchorTone, anchorLightness, controls)
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
  profile: Pick<TonalProfile, 'vividContrast'>,
  distribution: ScaleDistribution,
  inputAnchorTone: ScaleTone
): TonalScaleColor[] {
  const inputAnchor = scale.find((color) => color.tone === inputAnchorTone);
  const vividContrast = resolveVividContrastRule(
    profile.vividContrast,
    distribution,
    inputAnchor?.hex
  );

  if (!vividContrast) {
    return scale;
  }

  const { foregroundHex, minRatio, startTone } = vividContrast;
  const vividStart = scale.find((color) => color.tone === startTone);
  const vividEnd = scale.find((color) => color.tone === 100);

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

  const shouldPreserveAnchor =
    inputAnchor &&
    inputAnchor.tone >= startTone &&
    contrastRatio(inputAnchor.hex, foregroundHex) >= minRatio;

  const adjustedScale = scale.map((color) => {
    if (color.tone < startTone) {
      return color;
    }

    const targetLightness = shouldPreserveAnchor
      ? resolveAnchoredVividLightness({
          tone: color.tone,
          startTone,
          endTone: 100,
          startLightness: vividStartLightness,
          anchorTone: inputAnchor.tone,
          anchorLightness: inputAnchor.hsl.l,
          endLightness: vividEndLightness
        })
      : interpolate(
          vividStartLightness,
          vividEndLightness,
          normalizedProgress(color.tone, startTone, 100)
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

  return applyPreVividBridge(adjustedScale, vividContrast, inputAnchorTone);
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
  inputAnchorTone: ScaleTone
): TonalScaleColor[] {
  const { bridgeStartTone, startTone } = rule;

  if (bridgeStartTone === undefined) {
    return scale;
  }

  const bridgeStartIndex = scale.findIndex((color) => color.tone === bridgeStartTone);
  const vividStartIndex = scale.findIndex((color) => color.tone === startTone);
  const bridgeStart = scale[bridgeStartIndex];
  const vividStart = scale[vividStartIndex];
  const inputAnchorIndex = scale.findIndex((color) => color.tone === inputAnchorTone);
  const inputAnchor = scale[inputAnchorIndex];

  if (!bridgeStart || !vividStart || bridgeStartIndex >= vividStartIndex) {
    return scale;
  }

  if (inputAnchor && inputAnchorIndex > bridgeStartIndex && inputAnchorIndex < vividStartIndex) {
    return interpolateBridgeAroundAnchor({
      scale,
      bridgeStartIndex,
      inputAnchorIndex,
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
  controls: CurveControls
): number {
  if (tone === anchorTone) {
    return anchorLightness;
  }

  if (tone < anchorTone) {
    const progress = normalizedProgress(anchorTone - tone, 0, anchorTone);
    return interpolate(
      anchorLightness,
      controls.lightCeilingLightness,
      progress ** controls.lightLightnessGamma
    );
  }

  const progress = normalizedProgress(tone - anchorTone, 0, 100 - anchorTone);
  return interpolate(
    anchorLightness,
    controls.darkFloorLightness,
    progress ** controls.darkLightnessGamma
  );
}

function resolveLinearSaturationMultiplier(
  tone: ScaleTone,
  profile: TonalProfile,
  inputAnchorTone: ScaleTone
): number {
  const curve = profile.saturationCurve;

  if (!curve) {
    return 1;
  }

  if (curve.type === 'soft-dark') {
    if (tone <= inputAnchorTone) {
      return 1;
    }

    const darkProgress = normalizedProgress(tone, inputAnchorTone, 100);
    return interpolate(1, curve.darkMinRatio, darkProgress ** curve.darkGamma);
  }

  if (tone < inputAnchorTone) {
    const lightProgress = normalizedProgress(inputAnchorTone - tone, 0, inputAnchorTone);
    return interpolate(1, curve.lightMinRatio, lightProgress ** curve.lightGamma);
  }

  const darkProgress = normalizedProgress(tone, inputAnchorTone, 100);
  return interpolate(1, curve.darkMinRatio, darkProgress ** curve.darkGamma);
}

function resolveAutoInputAnchorTone(
  baseHex: string,
  profile: Pick<TonalProfile, 'vividContrast'>
): ScaleTone {
  const minContrast = profile.vividContrast?.minRatio ?? 4.5;
  const vividStartTone = profile.vividContrast?.startTone ?? 35;
  const whiteContrast = contrastRatio(baseHex, '#ffffff');

  if (whiteContrast < minContrast) {
    return clamp((1 - relativeLuminance(baseHex)) * 100, 1, vividStartTone - 5);
  }

  const contrastProgress = normalizedProgress(
    Math.log(whiteContrast),
    Math.log(minContrast),
    Math.log(21)
  );
  return interpolate(vividStartTone, 100, contrastProgress ** 0.55);
}

function resolveAdaptiveVividMinRatio(inputHex: string, rule: VividContrastRule): number {
  if (rule.luminousMinRatio === undefined) {
    return rule.minRatio;
  }

  const inputContrast = contrastRatio(inputHex, rule.foregroundHex);
  return roundChannel(clamp(inputContrast, rule.luminousMinRatio, rule.minRatio));
}

function resolveNearestScaleTone(
  targetTone: ScaleTone,
  distribution: ScaleDistribution
): ScaleTone {
  const candidates = distribution.slots.filter(
    (slot) => slot.position !== 0 && slot.position !== 100
  );
  const nearest = candidates.reduce(
    (current, slot) =>
      Math.abs(slot.position - targetTone) < Math.abs(current.position - targetTone)
        ? slot
        : current,
    candidates[0] ?? distribution.slots[0]
  );

  return nearest.position;
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
