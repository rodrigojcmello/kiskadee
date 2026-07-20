import { normalizeHexColor, type SolidColor, withAlpha } from '@kiskadee/core';

type Rgb = readonly [red: number, green: number, blue: number];
type Oklab = readonly [lightness: number, a: number, b: number];

const MAX_ALPHA_BYTE = 255;

function parseOpaqueHex(color: SolidColor): Rgb {
  const normalized = normalizeHexColor(color);
  if (normalized.length !== 7) {
    throw new Error(`Low border normalization requires an opaque HEX color, got: ${color}`);
  }

  return [
    Number.parseInt(normalized.slice(1, 3), 16) / 255,
    Number.parseInt(normalized.slice(3, 5), 16) / 255,
    Number.parseInt(normalized.slice(5, 7), 16) / 255
  ];
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab([red, green, blue]: Rgb): Oklab {
  const r = srgbToLinear(red);
  const g = srgbToLinear(green);
  const b = srgbToLinear(blue);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return [
    0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot
  ];
}

function composite(source: Rgb, surface: Rgb, alpha: number): Rgb {
  return [
    source[0] * alpha + surface[0] * (1 - alpha),
    source[1] * alpha + surface[1] * (1 - alpha),
    source[2] * alpha + surface[2] * (1 - alpha)
  ];
}

function deltaEOk(left: Oklab, right: Oklab): number {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

/**
 * Keeps a translucent Low outline at a stable perceptual distance from the
 * canonical theme surface without changing the resolved tonal reference.
 */
export function createBalancedLowBorder({
  color,
  surface,
  targetDeltaE
}: {
  color: SolidColor;
  surface: SolidColor;
  targetDeltaE: number;
}): SolidColor {
  if (!Number.isFinite(targetDeltaE) || targetDeltaE < 0) {
    throw new Error(`Invalid Low border Delta E target: ${targetDeltaE}`);
  }

  const sourceRgb = parseOpaqueHex(color);
  const surfaceRgb = parseOpaqueHex(surface);
  const surfaceOklab = rgbToOklab(surfaceRgb);
  let bestAlphaByte = 0;
  let smallestError = Number.POSITIVE_INFINITY;

  for (let alphaByte = 0; alphaByte <= MAX_ALPHA_BYTE; alphaByte += 1) {
    const alpha = alphaByte / MAX_ALPHA_BYTE;
    const delta = deltaEOk(surfaceOklab, rgbToOklab(composite(sourceRgb, surfaceRgb, alpha)));
    const error = Math.abs(delta - targetDeltaE);

    if (error < smallestError) {
      smallestError = error;
      bestAlphaByte = alphaByte;
    }
  }

  return withAlpha(color, (bestAlphaByte / MAX_ALPHA_BYTE) * 100);
}
