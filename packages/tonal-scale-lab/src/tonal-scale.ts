export const SCALE_TONES = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160
] as const;

export type ScaleTone = (typeof SCALE_TONES)[number];

export type HslColor = {
  h: number;
  s: number;
  l: number;
};

export type TonalScaleColor = {
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

export const FLUENT_BLUE_HEX = '#0f6cbd';
export const BASE_TONE: ScaleTone = 80;

export const FLUENT_BLUE_REFERENCE_HEX_BY_TONE: Record<ScaleTone, string> = {
  10: '#061724',
  20: '#082338',
  30: '#0a2e4a',
  40: '#0c3b5e',
  50: '#0e4775',
  60: '#0f548c',
  70: '#115ea3',
  80: '#0f6cbd',
  90: '#2886de',
  100: '#479ef5',
  110: '#62abf5',
  120: '#77b7f7',
  130: '#96c6fa',
  140: '#b4d6fa',
  150: '#cfe4fa',
  160: '#ebf3fc'
};

export const FLUENT_BLUE_REFERENCE_SCALE: TonalScaleColor[] = SCALE_TONES.map((tone) => ({
  tone,
  hex: FLUENT_BLUE_REFERENCE_HEX_BY_TONE[tone],
  hsl: hexToHsl(FLUENT_BLUE_REFERENCE_HEX_BY_TONE[tone])
}));

const REFERENCE_HSL_BY_TONE = Object.fromEntries(
  FLUENT_BLUE_REFERENCE_SCALE.map((entry) => [entry.tone, entry.hsl])
) as Record<ScaleTone, HslColor>;

const REFERENCE_BASE_HSL = REFERENCE_HSL_BY_TONE[BASE_TONE];
const REFERENCE_DARK_HSL = REFERENCE_HSL_BY_TONE[10];
const REFERENCE_LIGHT_HSL = REFERENCE_HSL_BY_TONE[160];

export const DEFAULT_CURVE_CONTROLS: CurveControls = {
  darkFloorLightness: roundChannel(REFERENCE_DARK_HSL.l),
  lightCeilingLightness: roundChannel(REFERENCE_LIGHT_HSL.l),
  darkLightnessGamma: 1,
  lightLightnessGamma: 1,
  saturationScale: 1,
  darkSaturationBias: 1,
  lightSaturationBias: 1,
  hueDriftStrength: 1
};

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

export function generateTonalScale(baseHex: string, controls: CurveControls): TonalScaleColor[] {
  const baseHsl = hexToHsl(baseHex);

  return SCALE_TONES.map((tone) => {
    const referenceHsl = REFERENCE_HSL_BY_TONE[tone];
    const sideProgress = resolveSideProgress(tone, referenceHsl);
    const isDarkSide = tone <= BASE_TONE;
    const lightness = resolveLightness({ tone, baseHsl, referenceHsl, controls });
    const saturationBias = isDarkSide ? controls.darkSaturationBias : controls.lightSaturationBias;
    const saturation =
      baseHsl.s *
      (referenceHsl.s / REFERENCE_BASE_HSL.s) *
      controls.saturationScale *
      interpolate(1, saturationBias, sideProgress);
    const hue = normalizeHue(
      baseHsl.h + shortestHueDelta(REFERENCE_BASE_HSL.h, referenceHsl.h) * controls.hueDriftStrength
    );
    const hsl = {
      h: hue,
      s: clamp(saturation, 0, 100),
      l: clamp(lightness, 0, 100)
    };

    return {
      tone,
      hex: hslToHex(hsl),
      hsl
    };
  });
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

function resolveLightness(params: {
  tone: ScaleTone;
  baseHsl: HslColor;
  referenceHsl: HslColor;
  controls: CurveControls;
}): number {
  const { tone, baseHsl, referenceHsl, controls } = params;

  if (tone === BASE_TONE) {
    return baseHsl.l;
  }

  if (tone < BASE_TONE) {
    const referenceProgress = normalizedProgress(
      referenceHsl.l,
      REFERENCE_DARK_HSL.l,
      REFERENCE_BASE_HSL.l
    );
    const shapedProgress = referenceProgress ** controls.darkLightnessGamma;
    return interpolate(controls.darkFloorLightness, baseHsl.l, shapedProgress);
  }

  const referenceProgress = normalizedProgress(
    referenceHsl.l,
    REFERENCE_BASE_HSL.l,
    REFERENCE_LIGHT_HSL.l
  );
  const shapedProgress = referenceProgress ** controls.lightLightnessGamma;
  return interpolate(baseHsl.l, controls.lightCeilingLightness, shapedProgress);
}

function resolveSideProgress(tone: ScaleTone, referenceHsl: HslColor): number {
  if (tone === BASE_TONE) {
    return 0;
  }

  if (tone < BASE_TONE) {
    return 1 - normalizedProgress(referenceHsl.l, REFERENCE_DARK_HSL.l, REFERENCE_BASE_HSL.l);
  }

  return normalizedProgress(referenceHsl.l, REFERENCE_BASE_HSL.l, REFERENCE_LIGHT_HSL.l);
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
