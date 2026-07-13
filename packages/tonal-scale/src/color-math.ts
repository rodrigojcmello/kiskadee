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

export type FittedOklchColor = {
  hex: string;
  fitted: OklchColor;
  chromaLoss: number;
};

const GAMUT_EPSILON = 1e-7;

export function normalizeHexColor(raw: string): string | null {
  const value = raw.trim().replace(/^#/, '');

  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value
      .split('')
      .map((character) => `${character}${character}`)
      .join('')
      .toLowerCase()}`;
  }

  return /^[0-9a-fA-F]{6}$/.test(value) ? `#${value.toLowerCase()}` : null;
}

export function hexToHsl(hex: string): HslColor {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255) as [number, number, number];
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

  return {
    l: oklabL * 100,
    c: chroma,
    h: chroma < 0.000001 ? 0 : normalizeHue((Math.atan2(oklabB, oklabA) * 180) / Math.PI)
  };
}

/**
 * Converts an OKLCH color to a six-digit sRGB hex. Out-of-gamut colors are
 * fitted by reducing chroma only; hue and lightness remain unchanged.
 */
export function oklchToSrgbHex(oklch: OklchColor): FittedOklchColor {
  const requested = {
    l: clamp(oklch.l, 0, 100),
    c: Math.max(0, oklch.c),
    h: normalizeHue(oklch.h)
  };
  const fitted = fitOklchToSrgb(requested);
  const [r, g, b] = oklchToSrgbChannels(fitted);

  return {
    hex: `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`,
    fitted,
    chromaLoss: Math.max(0, requested.c - fitted.c)
  };
}

/**
 * Returns the radial sRGB gamut limit for one OKL lightness and hue. This uses
 * the same chroma-only fitting path as emitted scale colors.
 */
export function maxSrgbChroma(lightness: number, hue: number): number {
  const resolvedLightness = clamp(lightness, 0, 100);
  if (resolvedLightness <= 0 || resolvedLightness >= 100) return 0;

  return fitOklchToSrgb({
    l: resolvedLightness,
    c: 1,
    h: normalizeHue(hue)
  }).c;
}

/**
 * Estimates the radial sRGB gamut limit for search/ranking operations that do
 * not emit colors. Canonical color generation continues to use the full
 * precision path above.
 */
export function estimateMaxSrgbChroma(lightness: number, hue: number): number {
  const resolvedLightness = clamp(lightness, 0, 100);
  if (resolvedLightness <= 0 || resolvedLightness >= 100) return 0;

  return fitOklchToSrgb(
    {
      l: resolvedLightness,
      c: 1,
      h: normalizeHue(hue)
    },
    18
  ).c;
}

export function contrastRatio(leftHex: string, rightHex: string): number {
  const left = relativeLuminance(leftHex);
  const right = relativeLuminance(rightHex);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);

  return (lighter + 0.05) / (darker + 0.05);
}

export function deltaEOk(left: OklchColor, right: OklchColor): number {
  const leftHue = (left.h * Math.PI) / 180;
  const rightHue = (right.h * Math.PI) / 180;
  const leftA = left.c * Math.cos(leftHue);
  const leftB = left.c * Math.sin(leftHue);
  const rightA = right.c * Math.cos(rightHue);
  const rightB = right.c * Math.sin(rightHue);

  return Math.hypot((left.l - right.l) / 100, leftA - rightA, leftB - rightB);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => srgbToLinear(channel / 255)) as [
    number,
    number,
    number
  ];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex);

  if (!normalized) {
    throw new Error(`Invalid sRGB hex color: ${hex}`);
  }

  return [1, 3, 5].map((index) => parseInt(normalized.slice(index, index + 2), 16)) as [
    number,
    number,
    number
  ];
}

function hexToLinearRgb(hex: string): [number, number, number] {
  return hexToRgb(hex).map((channel) => srgbToLinear(channel / 255)) as [number, number, number];
}

function fitOklchToSrgb(oklch: OklchColor, iterations = 32): OklchColor {
  if (isSrgbInGamut(oklchToSrgbChannels(oklch))) {
    return oklch;
  }

  let low = 0;
  let high = oklch.c;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const chroma = (low + high) / 2;
    const candidate = { ...oklch, c: chroma };

    if (isSrgbInGamut(oklchToSrgbChannels(candidate))) {
      low = chroma;
    } else {
      high = chroma;
    }
  }

  return { ...oklch, c: low };
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

function isSrgbInGamut(channels: [number, number, number]): boolean {
  return channels.every((channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON);
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

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
