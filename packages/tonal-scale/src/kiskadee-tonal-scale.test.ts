import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { BALANCED_V1_GOLDEN_SCALES, BALANCED_V1_MATRIX_HASHES } from './balanced-v1.golden';
import { hexToOklch, oklchToSrgbHex } from './color-math';
import {
  generateKiskadeeScale,
  KISKADEE_LIGHT_NOMINAL_LIGHTNESS,
  KISKADEE_TONES,
  type KiskadeeTheme,
  type KiskadeeTonalProfile,
  resolveCanonicalNominalLightness
} from './kiskadee-tonal-scale';

const THEMES = ['light', 'dark'] as const satisfies readonly KiskadeeTheme[];
const EXPECTED_TONES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60,
  65, 70, 75, 80, 85, 90, 95, 99, 100
] as const;
const VIVID_TONES = EXPECTED_TONES.filter((tone) => tone >= 35 && tone <= 95);
const EXPECTED_LIGHT_NOMINALS = [
  100, 98.695278, 97.425096, 96.058783, 94.688924, 93.362199, 92.093408, 90.751004, 89.096993,
  87.688317, 86.217449, 84.099966, 81.422592, 78.853248, 76.553514, 74.041323, 71.411081, 68.894359,
  66.355545, 63.926274, 61.395946, 58.386091, 55.558077, 52.630117, 49.174144, 45.959014, 42.906258,
  39.516528, 36.108367, 32.964855, 29.4167, 26.259884, 22.969853, 19.9971, 3.99942, 0
] as const;
const APPROVED_BLUE_LIGHT = {
  0: '#ffffff',
  1: '#f8fbff',
  2: '#f1f7ff',
  3: '#e9f3ff',
  4: '#e1efff',
  5: '#daebff',
  6: '#d3e7ff',
  7: '#cbe3ff',
  8: '#c1deff',
  9: '#b9daff',
  10: '#b1d6ff',
  12: '#a4cfff',
  14: '#94c7ff',
  16: '#84bfff',
  18: '#76b7ff',
  20: '#6baffa',
  22: '#60a7f3',
  24: '#559fed',
  26: '#4b97e6',
  28: '#418fdf',
  30: '#3787d8',
  35: '#2b7ecf',
  40: '#1f75c6',
  45: '#0f6cbd',
  50: '#0062b0',
  55: '#0059a0',
  60: '#005092',
  65: '#004782',
  70: '#003e73',
  75: '#003665',
  80: '#002d56',
  85: '#002549',
  90: '#001d3b',
  95: '#001630',
  100: '#000000'
} as const;
const REGRESSION_SEEDS = [
  '#6666ff',
  '#ffcccc',
  '#ffc107',
  '#d4e157',
  '#00bcd4',
  '#ff1744',
  '#755324',
  '#6e26e2',
  '#fff59d',
  '#000033',
  '#fefefe',
  '#010101',
  '#808080',
  '#bdbdbd',
  '#424242'
] as const;
const PROFILE_COMPARISON_EPSILON = 1e-6;

type GeneratedScale = ReturnType<typeof generateKiskadeeScale>;
type FailureBucket = { total: number; samples: string[] };

function createFailureBucket(): FailureBucket {
  return { total: 0, samples: [] };
}

function recordFailure(bucket: FailureBucket, message: string): void {
  bucket.total += 1;
  if (bucket.samples.length < 20) bucket.samples.push(message);
}

function expectNoFailures(label: string, bucket: FailureBucket): void {
  const samples = bucket.samples.length > 0 ? `\n${bucket.samples.join('\n')}` : '';
  expect(bucket.total, `${label}: ${bucket.total} violation(s)${samples}`).toBe(0);
}

function generate(seedHex: string, theme: KiskadeeTheme): GeneratedScale {
  return generateWithProfile(seedHex, theme, 'balanced');
}

function generateWithProfile(
  seedHex: string,
  theme: KiskadeeTheme,
  profile: KiskadeeTonalProfile
): GeneratedScale {
  return generateKiskadeeScale({ seedHex, theme, profile });
}

function findColor(result: GeneratedScale, tone: number) {
  return result.colors.find((color) => color.tone === tone);
}

function parseHex(hex: string): [number, number, number] | null {
  if (!/^#[0-9a-f]{6}$/u.test(hex)) return null;
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
}

function srgbToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return Number.NaN;
  const [red, green, blue] = rgb.map(srgbToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(leftHex: string, rightHex: string): number {
  const left = relativeLuminance(leftHex);
  const right = relativeLuminance(rightHex);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

function oklabLightness(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return Number.NaN;
  const [red, green, blue] = rgb.map(srgbToLinear);
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  return 0.2104542553 * Math.cbrt(l) + 0.793617785 * Math.cbrt(m) - 0.0040720468 * Math.cbrt(s);
}

function isStrictlyMonotonic(result: GeneratedScale, theme: KiskadeeTheme): boolean {
  for (let index = 1; index < result.colors.length; index += 1) {
    const previous = oklabLightness(result.colors[index - 1].hex);
    const current = oklabLightness(result.colors[index].hex);
    if (theme === 'light' ? previous <= current : previous >= current) return false;
  }
  return true;
}

function expectedCapHex(theme: KiskadeeTheme, tone: 0 | 100): string {
  if (theme === 'light') return tone === 0 ? '#ffffff' : '#000000';
  return tone === 0 ? '#000000' : '#ffffff';
}

describe('generateKiskadeeScale', () => {
  it('keeps the approved Balanced v1 scales byte-for-byte stable', () => {
    for (const [seedHex, themes] of Object.entries(BALANCED_V1_GOLDEN_SCALES)) {
      for (const theme of THEMES) {
        const result = generate(seedHex, theme);
        const expected = themes[theme];

        expect(result.anchorTone, `${seedHex} ${theme} anchor`).toBe(expected.anchorTone);
        expect(
          result.colors.map((color) => color.hex),
          `${seedHex} ${theme} emitted colors`
        ).toEqual(expected.hexes);
      }
    }
  });

  it.each(THEMES)('emits the 36-slot %s grid with theme-relative caps', (theme) => {
    const result = generate('#0f6cbd', theme);

    expect(KISKADEE_TONES).toEqual(EXPECTED_TONES);
    expect(result.diagnostics.valid).toBe(true);
    expect(result.colors.map((color) => color.tone)).toEqual(EXPECTED_TONES);
    expect(findColor(result, 0)?.hex).toBe(expectedCapHex(theme, 0));
    expect(findColor(result, 100)?.hex).toBe(expectedCapHex(theme, 100));
    expect(result.colors.filter((color) => color.flags.isCap).map((color) => color.tone)).toEqual([
      0, 100
    ]);
  });

  it('does not expose L96 through L98 and preserves every approved light slot', () => {
    const result = generate('#0f6cbd', 'light');

    for (const [tone, hex] of Object.entries(APPROVED_BLUE_LIGHT)) {
      expect(findColor(result, Number(tone))?.hex, `L${tone}`).toBe(hex);
    }

    expect(findColor(result, 96)).toBeUndefined();
    expect(findColor(result, 97)).toBeUndefined();
    expect(findColor(result, 98)).toBeUndefined();
    expect([95, 99, 100].map((tone) => findColor(result, tone)?.hex)).toEqual([
      '#001630',
      '#000001',
      '#000000'
    ]);
  });

  it('keeps the approved light knots and evaluates hidden K coordinates continuously', () => {
    expect(EXPECTED_TONES.map((tone) => KISKADEE_LIGHT_NOMINAL_LIGHTNESS[tone])).toEqual(
      EXPECTED_LIGHT_NOMINALS
    );
    expect(resolveCanonicalNominalLightness(96)).toBeCloseTo(15.99768, 5);
    expect(resolveCanonicalNominalLightness(97)).toBeCloseTo(11.99826, 5);
    expect(resolveCanonicalNominalLightness(98)).toBeCloseTo(7.99884, 5);
  });

  it('materializes a distinct dark D0 through D10 region without adding light tail slots', () => {
    const dark = generate('#0f6cbd', 'dark');
    const early = Array.from({ length: 11 }, (_, tone) => findColor(dark, tone));

    expect(early.every(Boolean)).toBe(true);
    expect(new Set(early.map((color) => color?.hex)).size).toBe(11);
    expect(early[0]?.hex).toBe('#000000');
    expect(early[1]?.hex).not.toBe('#000000');
    expect(findColor(dark, 95)?.oklch.l).toBeGreaterThan(90);
    expect(findColor(dark, 99)?.oklch.l).toBeGreaterThan(98);
    expect(findColor(dark, 100)?.hex).toBe('#ffffff');
  });

  it('preserves the normalized seed exactly once at independent L and D anchors', () => {
    const light = generate('#FA8072', 'light');
    const dark = generate('#FA8072', 'dark');

    expect(light.anchorTone).toBe(20);
    expect(dark.anchorTone).toBe(75);

    for (const result of [light, dark]) {
      expect(result.colors.filter((color) => color.flags.isAnchor)).toHaveLength(1);
      expect(findColor(result, result.anchorTone ?? -1)?.hex).toBe('#fa8072');
      expect(result.diagnostics.anchor?.hex).toBe('#fa8072');
    }
  });

  it.each([
    ['#fff', '#ffffff'],
    ['fff', '#ffffff'],
    ['0F6CBD', '#0f6cbd'],
    ['ABCDEF', '#abcdef']
  ])('normalizes supported input %s to %s in both themes', (seedHex, normalizedHex) => {
    for (const theme of THEMES) {
      const result = generate(seedHex, theme);
      expect(result.diagnostics.valid).toBe(true);
      expect(findColor(result, result.anchorTone ?? -1)?.hex).toBe(normalizedHex);
    }
  });

  it('maps black and white directly to the correct L/D caps', () => {
    for (const theme of THEMES) {
      for (const seedHex of ['#000000', '#ffffff'] as const) {
        const result = generate(seedHex, theme);
        const expectedTone =
          theme === 'light' ? (seedHex === '#ffffff' ? 0 : 100) : seedHex === '#000000' ? 0 : 100;

        expect(result.anchorTone).toBe(expectedTone);
        expect(findColor(result, expectedTone)?.hex).toBe(seedHex);
      }
    }
  });

  it('keeps near-black seeds exact in the last light and first dark chromatic slots', () => {
    const light = generate('#010101', 'light');
    const dark = generate('#010101', 'dark');

    expect(light.anchorTone).toBe(99);
    expect(findColor(light, 99)?.hex).toBe('#010101');
    expect(dark.anchorTone).toBe(1);
    expect(findColor(dark, 1)?.hex).toBe('#010101');
  });

  it('preserves target lightness and hue while fitting out-of-gamut OKLCH chroma', () => {
    const requested = { l: 62, c: 0.5, h: 142 };
    const fitted = oklchToSrgbHex(requested);
    const emitted = hexToOklch(fitted.hex);

    expect(fitted.chromaLoss).toBeGreaterThan(0);
    expect(fitted.fitted.l).toBe(requested.l);
    expect(fitted.fitted.h).toBe(requested.h);
    expect(fitted.fitted.c).toBeLessThan(requested.c);
    expect(emitted.l).toBeCloseTo(requested.l, 0);
  });

  it('reports a light emitted chroma cusp without altering the exact saturated anchor', () => {
    const result = generate('#0c02fc', 'light');

    expect(result.diagnostics.valid).toBe(true);
    expect(findColor(result, result.anchorTone ?? -1)?.hex).toBe('#0c02fc');
    expect(result.diagnostics.chromaContinuityRelaxed).toBe(true);
    expect(result.diagnostics.maxLocalChromaProminence).toBeGreaterThan(0.01);
    expect(result.diagnostics.chromaPeakTone).toBe(result.anchorTone);
  });

  it('keeps Balanced geometry and the non-dark side immutable in Muted Darks', () => {
    for (const seedHex of ['#0f6cbd', '#8e44ad', '#ffb300'] as const) {
      const seedLightness = hexToOklch(seedHex).l;

      for (const theme of THEMES) {
        const balanced = generateWithProfile(seedHex, theme, 'balanced');
        const muted = generateWithProfile(seedHex, theme, 'muted-darks');
        const context = `${seedHex} ${theme}`;

        expect(balanced.diagnostics.profile, `${context} Balanced profile`).toBe('balanced');
        expect(balanced.diagnostics.profileChromaAdjustedCount, context).toBe(0);
        expect(balanced.diagnostics.maxProfileChromaReduction, context).toBe(0);
        expect(muted.diagnostics.profile, `${context} Muted profile`).toBe('muted-darks');
        expect(muted.diagnostics.valid, context).toBe(true);
        expect(muted.anchorTone, `${context} anchor tone`).toBe(balanced.anchorTone);
        expect(
          muted.colors.map((color) => color.tone),
          `${context} grid`
        ).toEqual(balanced.colors.map((color) => color.tone));

        for (let index = 0; index < balanced.colors.length; index += 1) {
          const balancedColor = balanced.colors[index];
          const mutedColor = muted.colors[index];
          const toneContext = `${context} ${theme === 'light' ? 'L' : 'D'}${balancedColor.tone}`;

          expect(mutedColor.nominalLightness, `${toneContext} nominal lightness`).toBe(
            balancedColor.nominalLightness
          );
          expect(mutedColor.targetLightness, `${toneContext} target lightness`).toBe(
            balancedColor.targetLightness
          );

          if (
            balancedColor.flags.isCap ||
            balancedColor.flags.isAnchor ||
            balancedColor.targetLightness >= seedLightness - PROFILE_COMPARISON_EPSILON
          ) {
            expect(mutedColor.hex, `${toneContext} protected color`).toBe(balancedColor.hex);
          } else {
            expect(mutedColor.oklch.c, `${toneContext} chroma`).toBeLessThanOrEqual(
              balancedColor.oklch.c + PROFILE_COMPARISON_EPSILON
            );
          }
        }

        expect(findColor(muted, 0)?.hex, `${context} first cap`).toBe(expectedCapHex(theme, 0));
        expect(findColor(muted, 100)?.hex, `${context} last cap`).toBe(expectedCapHex(theme, 100));
        expect(findColor(muted, muted.anchorTone ?? -1)?.hex, `${context} exact anchor`).toBe(
          seedHex
        );
        expect(muted.diagnostics.anchorChromaProtected, context).toBe(true);
        expect(muted.diagnostics.profileChromaAdjustedCount, context).toBeGreaterThan(0);
        expect(muted.diagnostics.maxProfileChromaReduction, context).toBeGreaterThan(0);
      }
    }
  });

  it('does not introduce chroma changes for a neutral seed', () => {
    for (const theme of THEMES) {
      const balanced = generateWithProfile('#808080', theme, 'balanced');
      const muted = generateWithProfile('#808080', theme, 'muted-darks');

      expect(muted.diagnostics.valid, theme).toBe(true);
      expect(muted.diagnostics.profile, theme).toBe('muted-darks');
      expect(muted.anchorTone, theme).toBe(balanced.anchorTone);
      expect(muted.colors, theme).toEqual(balanced.colors);
      expect(muted.diagnostics.profileChromaAdjustedCount, theme).toBe(0);
      expect(muted.diagnostics.maxProfileChromaReduction, theme).toBe(0);
    }
  });

  it('rejects unsupported tonal profiles without generating a fallback scale', () => {
    const result = generateKiskadeeScale({
      seedHex: '#0f6cbd',
      theme: 'light',
      profile: 'unknown-profile' as KiskadeeTonalProfile
    });

    expect(result.colors).toEqual([]);
    expect(result.anchorTone).toBeNull();
    expect(result.diagnostics.valid).toBe(false);
    expect(result.diagnostics.profile).toBeNull();
    expect(result.diagnostics.error?.code).toBe('UNSUPPORTED_PROFILE');
  });

  it('starts each 3:1 guard at position 35 against the theme foreground', () => {
    for (const theme of THEMES) {
      const result = generate('#0f6cbd', theme);
      const foreground = theme === 'light' ? '#ffffff' : '#000000';
      const at35 = findColor(result, 35);

      expect(contrastRatio(at35?.hex ?? foreground, foreground)).toBeGreaterThanOrEqual(3);
      for (const tone of VIVID_TONES) {
        expect(
          contrastRatio(findColor(result, tone)?.hex ?? foreground, foreground),
          `${theme} ${tone}`
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('is monotonic, unique, in gamut, and contrast-safe for regression seeds', () => {
    for (const seedHex of REGRESSION_SEEDS) {
      for (const theme of THEMES) {
        const result = generate(seedHex, theme);
        const context = `${seedHex} ${theme}`;
        const foreground = theme === 'light' ? '#ffffff' : '#000000';

        expect(result.diagnostics.valid, context).toBe(true);
        expect(result.diagnostics.monotonic, context).toBe(true);
        expect(isStrictlyMonotonic(result, theme), context).toBe(true);
        expect(result.diagnostics.adjacentDuplicates, context).toEqual([]);
        expect(new Set(result.colors.map((color) => color.hex)).size, context).toBe(
          result.colors.length
        );

        for (const color of result.colors) {
          expect(parseHex(color.hex), `${context} ${color.tone}`).not.toBeNull();
          expect(Number.isFinite(color.oklch.l), `${context} ${color.tone} OKL L`).toBe(true);
          expect(Number.isFinite(color.oklch.c), `${context} ${color.tone} OKL C`).toBe(true);
          expect(Number.isFinite(color.oklch.h), `${context} ${color.tone} OKL H`).toBe(true);
          expect(color.gamutChromaLoss, `${context} ${color.tone} gamut`).toBeGreaterThanOrEqual(0);
        }

        for (const tone of VIVID_TONES) {
          expect(
            contrastRatio(findColor(result, tone)?.hex ?? foreground, foreground),
            `${context} ${tone}`
          ).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it.each([
    '',
    '#ggg',
    '#gggggg',
    'xyz',
    '#0f6cbdff',
    '#12345',
    '#1234567'
  ])('rejects invalid input %j without generating fallback scales', (seedHex) => {
    for (const theme of THEMES) {
      const result = generate(seedHex, theme);
      expect(result.colors).toEqual([]);
      expect(result.anchorTone).toBeNull();
      expect(result.diagnostics.valid).toBe(false);
      expect(result.diagnostics.error?.code).toBe('INVALID_HEX');
    }
  });

  it('preserves Balanced and Muted Darks invariants across an 11 x 11 x 11 RGB matrix', () => {
    const channelValues = [0, 26, 51, 77, 102, 128, 153, 179, 204, 230, 255] as const;
    const failures = {
      generation: createFailureBucket(),
      structure: createFailureBucket(),
      anchor: createFailureBucket(),
      monotonicity: createFailureBucket(),
      duplicates: createFailureBucket(),
      gamut: createFailureBucket(),
      contrast: createFailureBucket()
    };
    const mutedFailures = {
      generation: createFailureBucket(),
      structure: createFailureBucket(),
      geometry: createFailureBucket(),
      anchor: createFailureBucket(),
      nonDarkIdentity: createFailureBucket(),
      chroma: createFailureBucket(),
      monotonicity: createFailureBucket(),
      duplicates: createFailureBucket(),
      gamut: createFailureBucket(),
      contrast: createFailureBucket(),
      darkSurfaceContrast: createFailureBucket()
    };
    const balancedHashes = {
      light: createHash('sha256'),
      dark: createHash('sha256')
    };

    for (const red of channelValues) {
      for (const green of channelValues) {
        for (const blue of channelValues) {
          const seedHex = `#${red.toString(16).padStart(2, '0')}${green
            .toString(16)
            .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

          for (const theme of THEMES) {
            const result = generate(seedHex, theme);
            const prefix = theme === 'light' ? 'L' : 'D';
            const context = `${seedHex} ${theme}`;
            const foreground = theme === 'light' ? '#ffffff' : '#000000';
            balancedHashes[theme].update(
              `${seedHex}|${result.anchorTone}|${result.colors
                .map((color) => `${color.tone}:${color.hex}`)
                .join(',')}\n`
            );

            if (!result.diagnostics.valid) {
              recordFailure(failures.generation, context);
              continue;
            }
            if (
              result.colors.length !== EXPECTED_TONES.length ||
              result.colors.some((color, index) => color.tone !== EXPECTED_TONES[index]) ||
              findColor(result, 0)?.hex !== expectedCapHex(theme, 0) ||
              findColor(result, 100)?.hex !== expectedCapHex(theme, 100)
            ) {
              recordFailure(failures.structure, context);
              continue;
            }

            const anchor =
              result.anchorTone === null ? undefined : findColor(result, result.anchorTone);
            if (!anchor || anchor.hex !== seedHex || !anchor.flags.isAnchor) {
              recordFailure(
                failures.anchor,
                `${context}: ${prefix}${result.anchorTone ?? 'null'} ${anchor?.hex ?? 'missing'}`
              );
            }
            if (!result.diagnostics.monotonic || !isStrictlyMonotonic(result, theme)) {
              recordFailure(failures.monotonicity, context);
            }
            if (new Set(result.colors.map((color) => color.hex)).size !== result.colors.length) {
              recordFailure(failures.duplicates, context);
            }

            for (const color of result.colors) {
              if (
                parseHex(color.hex) === null ||
                !Number.isFinite(color.oklch.l) ||
                !Number.isFinite(color.oklch.c) ||
                !Number.isFinite(color.oklch.h) ||
                !Number.isFinite(color.gamutChromaLoss) ||
                color.gamutChromaLoss < 0
              ) {
                recordFailure(failures.gamut, `${context}: ${prefix}${color.tone}`);
              }
            }

            for (const tone of VIVID_TONES) {
              const color = findColor(result, tone);
              const ratio = color ? contrastRatio(color.hex, foreground) : 0;
              if (ratio < 3) {
                recordFailure(
                  failures.contrast,
                  `${context}: ${prefix}${tone} ${color?.hex ?? 'missing'} ${ratio.toFixed(4)}`
                );
              }
            }

            const muted = generateWithProfile(seedHex, theme, 'muted-darks');
            const seedLightness = hexToOklch(seedHex).l;

            if (!muted.diagnostics.valid || muted.diagnostics.profile !== 'muted-darks') {
              recordFailure(
                mutedFailures.generation,
                `${context}: valid=${muted.diagnostics.valid} profile=${String(
                  muted.diagnostics.profile
                )}`
              );
              continue;
            }
            if (
              muted.colors.length !== EXPECTED_TONES.length ||
              muted.colors.some((color, index) => color.tone !== EXPECTED_TONES[index]) ||
              findColor(muted, 0)?.hex !== expectedCapHex(theme, 0) ||
              findColor(muted, 100)?.hex !== expectedCapHex(theme, 100)
            ) {
              recordFailure(mutedFailures.structure, context);
              continue;
            }
            if (
              muted.anchorTone !== result.anchorTone ||
              muted.colors.some(
                (color, index) =>
                  color.nominalLightness !== result.colors[index].nominalLightness ||
                  color.targetLightness !== result.colors[index].targetLightness
              )
            ) {
              recordFailure(mutedFailures.geometry, context);
            }

            const mutedAnchor =
              muted.anchorTone === null ? undefined : findColor(muted, muted.anchorTone);
            if (!mutedAnchor || mutedAnchor.hex !== seedHex || !mutedAnchor.flags.isAnchor) {
              recordFailure(
                mutedFailures.anchor,
                `${context}: ${prefix}${muted.anchorTone ?? 'null'} ${
                  mutedAnchor?.hex ?? 'missing'
                }`
              );
            }
            if (!muted.diagnostics.monotonic || !isStrictlyMonotonic(muted, theme)) {
              recordFailure(mutedFailures.monotonicity, context);
            }
            if (new Set(muted.colors.map((color) => color.hex)).size !== muted.colors.length) {
              recordFailure(mutedFailures.duplicates, context);
            }

            for (let index = 0; index < muted.colors.length; index += 1) {
              const balancedColor = result.colors[index];
              const mutedColor = muted.colors[index];
              const toneContext = `${context}: ${prefix}${mutedColor.tone}`;

              if (
                parseHex(mutedColor.hex) === null ||
                !Number.isFinite(mutedColor.oklch.l) ||
                !Number.isFinite(mutedColor.oklch.c) ||
                !Number.isFinite(mutedColor.oklch.h) ||
                !Number.isFinite(mutedColor.gamutChromaLoss) ||
                mutedColor.gamutChromaLoss < 0
              ) {
                recordFailure(mutedFailures.gamut, toneContext);
              }

              const physicallyNonDark =
                balancedColor.targetLightness >= seedLightness - PROFILE_COMPARISON_EPSILON;
              if (
                (balancedColor.flags.isCap || balancedColor.flags.isAnchor || physicallyNonDark) &&
                mutedColor.hex !== balancedColor.hex
              ) {
                recordFailure(
                  mutedFailures.nonDarkIdentity,
                  `${toneContext} ${balancedColor.hex} -> ${mutedColor.hex}`
                );
              }

              const physicallyDark =
                !balancedColor.flags.isCap &&
                !balancedColor.flags.isAnchor &&
                balancedColor.targetLightness < seedLightness - PROFILE_COMPARISON_EPSILON;
              if (
                physicallyDark &&
                mutedColor.oklch.c > balancedColor.oklch.c + PROFILE_COMPARISON_EPSILON
              ) {
                recordFailure(
                  mutedFailures.chroma,
                  `${toneContext} ${balancedColor.oklch.c.toFixed(6)} -> ${mutedColor.oklch.c.toFixed(
                    6
                  )}`
                );
              }
            }

            for (const tone of VIVID_TONES) {
              const color = findColor(muted, tone);
              const ratio = color ? contrastRatio(color.hex, foreground) : 0;
              if (ratio < 3) {
                recordFailure(
                  mutedFailures.contrast,
                  `${context}: ${prefix}${tone} ${color?.hex ?? 'missing'} ${ratio.toFixed(4)}`
                );
              }
            }

            if (
              theme === 'dark' &&
              (!muted.diagnostics.darkSurfaceContrastMonotonic ||
                muted.diagnostics.darkSurfaceContrastFailures.length > 0)
            ) {
              recordFailure(mutedFailures.darkSurfaceContrast, context);
            }
          }
        }
      }
    }

    expectNoFailures('generation', failures.generation);
    expectNoFailures('structure', failures.structure);
    expectNoFailures('exact anchor', failures.anchor);
    expectNoFailures('monotonicity', failures.monotonicity);
    expectNoFailures('duplicates', failures.duplicates);
    expectNoFailures('sRGB gamut', failures.gamut);
    expectNoFailures('contrast', failures.contrast);
    expectNoFailures('Muted generation', mutedFailures.generation);
    expectNoFailures('Muted structure', mutedFailures.structure);
    expectNoFailures('Muted Balanced geometry', mutedFailures.geometry);
    expectNoFailures('Muted exact anchor', mutedFailures.anchor);
    expectNoFailures('Muted protected non-dark colors', mutedFailures.nonDarkIdentity);
    expectNoFailures('Muted monotonicity', mutedFailures.monotonicity);
    expectNoFailures('Muted duplicates', mutedFailures.duplicates);
    expectNoFailures('Muted sRGB gamut', mutedFailures.gamut);
    expectNoFailures('Muted vivid contrast', mutedFailures.contrast);
    expectNoFailures('Muted dark-surface contrast', mutedFailures.darkSurfaceContrast);
    expect(balancedHashes.light.digest('hex')).toBe(BALANCED_V1_MATRIX_HASHES.light);
    expect(balancedHashes.dark.digest('hex')).toBe(BALANCED_V1_MATRIX_HASHES.dark);
    expectNoFailures('Muted chroma ceiling', mutedFailures.chroma);
  }, 60_000);
});
