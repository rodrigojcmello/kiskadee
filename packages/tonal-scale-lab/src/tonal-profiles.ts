import {
  createDefaultCurveControls,
  DEFAULT_SCALE_DISTRIBUTION,
  hexToHsl,
  hslToHex,
  KISKADEE_BASE_TONE,
  type TonalProfile,
  type TonalScaleColor
} from './tonal-scale.ts';

export const FLUENT_BLUE_HEX = '#0f6cbd';

const FLUENT_LIGHT_REFERENCE_TONE = 5;
const FLUENT_DARK_REFERENCE_TONE = 95;

const FLUENT_BLUE_LIGHTEST_HEX = '#ebf3fc';
const FLUENT_BLUE_DARKEST_HEX = '#061724';

export const FLUENT_2_BLUE_SOURCE_SCALE = [
  { tone: 10, hex: FLUENT_BLUE_DARKEST_HEX },
  { tone: 20, hex: '#082338' },
  { tone: 30, hex: '#0a2e4a' },
  { tone: 40, hex: '#0c3b5e' },
  { tone: 50, hex: '#0e4775' },
  { tone: 60, hex: '#0f548c' },
  { tone: 70, hex: '#115ea3' },
  { tone: 80, hex: FLUENT_BLUE_HEX },
  { tone: 90, hex: '#2886de' },
  { tone: 100, hex: '#479ef5' },
  { tone: 110, hex: '#62abf5' },
  { tone: 120, hex: '#77b7f7' },
  { tone: 130, hex: '#96c6fa' },
  { tone: 140, hex: '#b4d6fa' },
  { tone: 150, hex: '#cfe4fa' },
  { tone: 160, hex: FLUENT_BLUE_LIGHTEST_HEX }
] as const;

const FLUENT_2_BLUE_REFERENCE_SCALE = createReferenceAnchorScale([
  { position: 0, hex: '#ffffff' },
  ...FLUENT_2_BLUE_SOURCE_SCALE.map((entry) => ({
    label: `${entry.tone}`,
    position: resolveKiskadeeReferencePosition(entry.hex),
    hex: entry.hex
  })),
  { position: 100, hex: '#000000' }
]);

const LINEAR_LIGHTNESS_REFERENCE_SCALE = createLinearReferenceScale(FLUENT_BLUE_HEX);

const ADAPTIVE_VIVID_WHITE_TEXT_CONTRAST = {
  bridgeStartTone: 15,
  startTone: 35,
  foregroundHex: '#ffffff',
  minRatio: 4.5,
  luminousMinRatio: 3
} as const;

const SOFT_DARK_SATURATION_CURVE = {
  type: 'soft-dark',
  darkMinRatio: 0.64,
  darkGamma: 0.8
} as const;

const MID_PEAK_SATURATION_CURVE = {
  type: 'mid-peak',
  lightMinRatio: 0.42,
  lightGamma: 1.15,
  darkMinRatio: 0.64,
  darkGamma: 0.8
} as const;

const FLUENT_2_BLUE_PROFILE = {
  id: 'fluent-2-blue',
  label: 'Fluent 2 Blue',
  mode: 'reference-curve',
  inputStrategy: 'fixed-anchor',
  baseTone: KISKADEE_BASE_TONE,
  referenceScale: FLUENT_2_BLUE_REFERENCE_SCALE,
  defaultControls: createDefaultCurveControls({ referenceScale: FLUENT_2_BLUE_REFERENCE_SCALE })
} satisfies TonalProfile;

const LINEAR_LIGHTNESS_PROFILE = {
  id: 'linear-lightness',
  label: 'Linear Lightness',
  mode: 'linear-lightness',
  inputStrategy: 'seed',
  baseTone: KISKADEE_BASE_TONE,
  referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE,
  defaultControls: createDefaultCurveControls({ referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE })
} satisfies TonalProfile;

const LINEAR_WCAG_VIVID_PROFILE = {
  id: 'linear-wcag-vivid',
  label: 'Auto Linear + Adaptive Vivid',
  commercialName: 'Striking',
  mode: 'linear-lightness',
  inputStrategy: 'auto-anchor',
  baseTone: KISKADEE_BASE_TONE,
  referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE,
  defaultControls: createDefaultCurveControls({ referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE }),
  vividContrast: ADAPTIVE_VIVID_WHITE_TEXT_CONTRAST
} satisfies TonalProfile;

const SOFT_DARK_WCAG_VIVID_PROFILE = {
  id: 'soft-dark-wcag-vivid',
  label: 'Auto Soft Dark + Adaptive Vivid',
  commercialName: 'Balanced',
  mode: 'linear-lightness',
  inputStrategy: 'auto-anchor',
  baseTone: KISKADEE_BASE_TONE,
  referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE,
  defaultControls: createDefaultCurveControls({ referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE }),
  saturationCurve: SOFT_DARK_SATURATION_CURVE,
  vividContrast: ADAPTIVE_VIVID_WHITE_TEXT_CONTRAST
} satisfies TonalProfile;

const MID_PEAK_WCAG_VIVID_PROFILE = {
  id: 'mid-peak-wcag-vivid',
  label: 'Auto Mid Peak + Adaptive Vivid',
  commercialName: 'Sophisticated',
  mode: 'linear-lightness',
  inputStrategy: 'auto-anchor',
  baseTone: KISKADEE_BASE_TONE,
  referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE,
  defaultControls: createDefaultCurveControls({ referenceScale: LINEAR_LIGHTNESS_REFERENCE_SCALE }),
  saturationCurve: MID_PEAK_SATURATION_CURVE,
  vividContrast: ADAPTIVE_VIVID_WHITE_TEXT_CONTRAST
} satisfies TonalProfile;

export const TONAL_PROFILES = [
  FLUENT_2_BLUE_PROFILE,
  LINEAR_LIGHTNESS_PROFILE,
  LINEAR_WCAG_VIVID_PROFILE,
  SOFT_DARK_WCAG_VIVID_PROFILE,
  MID_PEAK_WCAG_VIVID_PROFILE
] as const;

export type TonalProfileId = (typeof TONAL_PROFILES)[number]['id'];

export const DEFAULT_TONAL_PROFILE_ID: TonalProfileId = SOFT_DARK_WCAG_VIVID_PROFILE.id;

export function resolveTonalProfile(id: string): TonalProfile {
  return TONAL_PROFILES.find((profile) => profile.id === id) ?? SOFT_DARK_WCAG_VIVID_PROFILE;
}

function resolveKiskadeeReferencePosition(hex: string): number {
  const hsl = hexToHsl(hex);
  const baseHsl = hexToHsl(FLUENT_BLUE_HEX);

  if (hex === FLUENT_BLUE_HEX) {
    return KISKADEE_BASE_TONE;
  }

  if (hsl.l > baseHsl.l) {
    const lightestHsl = hexToHsl(FLUENT_BLUE_LIGHTEST_HEX);
    const progress = normalizedProgress(hsl.l, lightestHsl.l, baseHsl.l);
    return interpolate(FLUENT_LIGHT_REFERENCE_TONE, KISKADEE_BASE_TONE, progress);
  }

  const darkestHsl = hexToHsl(FLUENT_BLUE_DARKEST_HEX);
  const progress = normalizedProgress(hsl.l, baseHsl.l, darkestHsl.l);
  return interpolate(KISKADEE_BASE_TONE, FLUENT_DARK_REFERENCE_TONE, progress);
}

function createLinearReferenceScale(baseHex: string): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);

  return DEFAULT_SCALE_DISTRIBUTION.slots.map((slot) => {
    const hsl = {
      h: baseHsl.h,
      s: baseHsl.s,
      l: 100 - slot.position
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

function createReferenceAnchorScale(
  anchors: Array<{ position: number; hex: string; label?: string }>
): TonalScaleColor[] {
  return anchors
    .map((anchor) => ({
      id: `anchor-${anchor.label ?? anchor.position}`,
      label: anchor.label ?? `${anchor.position}`,
      tone: anchor.position,
      hex: anchor.hex,
      hsl: hexToHsl(anchor.hex)
    }))
    .sort((left, right) => left.tone - right.tone);
}

function normalizedProgress(value: number, start: number, end: number): number {
  if (start === end) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * clamp(progress, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
