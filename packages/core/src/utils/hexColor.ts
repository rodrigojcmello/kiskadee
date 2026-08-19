import {
  type CssColorReference,
  type HexColor,
  KISKADEE_TONES,
  type KiskadeeCssScale,
  type KiskadeeHexScale,
  type KiskadeeTone,
  type ThemeName
} from '../types/colors/colors.types.ts';

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const CSS_COLOR_REFERENCE_PATTERN = /^(?:var\(--[a-z0-9_-]+\)|color-mix\(.+\))$/i;

export function normalizeHexColor(input: string): HexColor {
  const value = input.trim().toLowerCase();
  const match = HEX_COLOR_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid HEX color: ${input}`);
  }

  const digits = match[1]!;
  if (digits.length === 3 || digits.length === 4) {
    return `#${[...digits].map((digit) => `${digit}${digit}`).join('')}` as HexColor;
  }
  return value as HexColor;
}

export function isKiskadeeTone(value: number): value is KiskadeeTone {
  return (KISKADEE_TONES as readonly number[]).includes(value);
}

export function normalizeCssColorReference(input: string): CssColorReference {
  const value = input.trim();
  if (!CSS_COLOR_REFERENCE_PATTERN.test(value)) {
    throw new Error(`Invalid CSS color reference: ${input}`);
  }
  return value as CssColorReference;
}

function assertCanonicalScalePositions(
  scale: unknown
): asserts scale is Record<KiskadeeTone, unknown> {
  if (!scale || typeof scale !== 'object' || Array.isArray(scale)) {
    throw new Error('A Kiskadee scale must be an object');
  }

  const keys = Object.keys(scale);
  const expected = new Set(KISKADEE_TONES.map(String));
  const missing = KISKADEE_TONES.filter((tone) => !(String(tone) in scale));
  const unknown = keys.filter((key) => !expected.has(key));
  if (missing.length || unknown.length) {
    throw new Error(
      `Invalid Kiskadee scale positions. Missing: ${missing.join(', ') || 'none'}. Unknown: ${unknown.join(', ') || 'none'}.`
    );
  }
}

export function assertKiskadeeHexScale(
  scale: unknown,
  theme?: ThemeName
): asserts scale is KiskadeeHexScale {
  assertCanonicalScalePositions(scale);

  for (const tone of KISKADEE_TONES) {
    normalizeHexColor((scale as Record<number, string>)[tone]!);
  }

  if (theme) {
    const first = normalizeHexColor((scale as Record<number, string>)[0]!).slice(0, 7);
    const last = normalizeHexColor((scale as Record<number, string>)[100]!).slice(0, 7);
    const expectedCaps = theme === 'light' ? ['#ffffff', '#000000'] : ['#000000', '#ffffff'];
    if (first !== expectedCaps[0] || last !== expectedCaps[1]) {
      throw new Error(
        `Invalid ${theme} scale caps. Expected ${expectedCaps[0]} to ${expectedCaps[1]}, got ${first} to ${last}.`
      );
    }
  }
}

export function assertKiskadeeCssScale(scale: unknown): asserts scale is KiskadeeCssScale {
  assertCanonicalScalePositions(scale);
  for (const tone of KISKADEE_TONES) {
    normalizeCssColorReference((scale as Record<number, string>)[tone]!);
  }
}

/** Reverses physical lightness while preserving the public tone labels and density. */
export function invertKiskadeeHexScale(scale: KiskadeeHexScale): KiskadeeHexScale {
  const values = KISKADEE_TONES.map((tone) => scale[tone]).reverse();
  return Object.fromEntries(
    KISKADEE_TONES.map((tone, index) => [tone, values[index]])
  ) as KiskadeeHexScale;
}
