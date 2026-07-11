import { describe, expect, it } from 'vitest';

import { hexToOklch, oklchToSrgbHex } from './color-math';
import {
  generateKiskadeeScale,
  KISKADEE_LIGHT_NOMINAL_LIGHTNESS,
  KISKADEE_TONES
} from './kiskadee-tonal-scale';

const EXPECTED_TONES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60,
  65, 70, 75, 80, 85, 90, 95, 100
] as const;

const THEMES = ['light', 'dark'] as const;
const VIVID_TONES = EXPECTED_TONES.filter((tone) => tone >= 35 && tone <= 95);
const EXPECTED_LIGHT_NOMINALS = [
  100, 98.695278, 97.425096, 96.058783, 94.688924, 93.362199, 92.093408, 90.751004, 89.096993,
  87.688317, 86.217449, 84.099966, 81.422592, 78.853248, 76.553514, 74.041323, 71.411081, 68.894359,
  66.355545, 63.926274, 61.395946, 58.386091, 55.558077, 52.630117, 49.174144, 45.959014, 42.906258,
  39.516528, 36.108367, 32.964855, 29.4167, 26.259884, 22.969853, 19.9971, 0
] as const;

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

type GeneratedScale = ReturnType<typeof generateKiskadeeScale>;
type Theme = (typeof THEMES)[number];

type FailureBucket = {
  total: number;
  samples: string[];
};

function createFailureBucket(): FailureBucket {
  return { total: 0, samples: [] };
}

function recordFailure(bucket: FailureBucket, message: string): void {
  bucket.total += 1;

  if (bucket.samples.length < 20) {
    bucket.samples.push(message);
  }
}

function expectNoFailures(label: string, bucket: FailureBucket): void {
  const samples = bucket.samples.length > 0 ? `\n${bucket.samples.join('\n')}` : '';
  expect(bucket.total, `${label}: ${bucket.total} violation(s)${samples}`).toBe(0);
}

function findColor(result: GeneratedScale, tone: number) {
  return result.colors.find((color) => color.tone === tone);
}

function parseHex(hex: string): [number, number, number] | null {
  if (!/^#[0-9a-f]{6}$/u.test(hex)) {
    return null;
  }

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

  if (!rgb) {
    return Number.NaN;
  }

  const [red, green, blue] = rgb.map(srgbToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(leftHex: string, rightHex: string): number {
  const left = relativeLuminance(leftHex);
  const right = relativeLuminance(rightHex);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

function oklabLightness(hex: string): number {
  const rgb = parseHex(hex);

  if (!rgb) {
    return Number.NaN;
  }

  const [red, green, blue] = rgb.map(srgbToLinear);
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;

  return 0.2104542553 * Math.cbrt(l) + 0.793617785 * Math.cbrt(m) - 0.0040720468 * Math.cbrt(s);
}

function isStrictlyMonotonic(result: GeneratedScale, theme: Theme): boolean {
  for (let index = 1; index < result.colors.length; index += 1) {
    const previous = oklabLightness(result.colors[index - 1].hex);
    const current = oklabLightness(result.colors[index].hex);

    if (theme === 'light' ? previous <= current : previous >= current) {
      return false;
    }
  }

  return true;
}

function expectedCapHex(theme: Theme, tone: 0 | 100): string {
  if (theme === 'light') {
    return tone === 0 ? '#ffffff' : '#000000';
  }

  return tone === 0 ? '#000000' : '#ffffff';
}

function expectedCapTone(theme: Theme, seedHex: '#000000' | '#ffffff'): 0 | 100 {
  if (theme === 'light') {
    return seedHex === '#ffffff' ? 0 : 100;
  }

  return seedHex === '#000000' ? 0 : 100;
}

describe('generateKiskadeeScale', () => {
  it.each(THEMES)('emits the complete ordered grid with absolute caps in %s', (theme) => {
    const result = generateKiskadeeScale({ seedHex: '#0f6cbd', theme, variant: 'standard' });

    expect(KISKADEE_TONES).toEqual(EXPECTED_TONES);
    expect(result.diagnostics.valid).toBe(true);
    expect(result.colors.map((color) => color.tone)).toEqual(EXPECTED_TONES);
    expect(findColor(result, 0)?.hex).toBe(expectedCapHex(theme, 0));
    expect(findColor(result, 100)?.hex).toBe(expectedCapHex(theme, 100));
    expect(findColor(result, 0)?.flags.isCap).toBe(true);
    expect(findColor(result, 100)?.flags.isCap).toBe(true);
    expect(result.colors.filter((color) => color.flags.isCap).map((color) => color.tone)).toEqual([
      0, 100
    ]);
  });

  it('derives every dark nominal lightness by inverting the light target', () => {
    const light = generateKiskadeeScale({
      seedHex: '#0f6cbd',
      theme: 'light',
      variant: 'standard'
    });
    const dark = generateKiskadeeScale({
      seedHex: '#0f6cbd',
      theme: 'dark',
      variant: 'standard'
    });

    for (const tone of EXPECTED_TONES) {
      const lightColor = findColor(light, tone);
      const darkColor = findColor(dark, tone);

      expect(lightColor, `missing light K${tone}`).toBeDefined();
      expect(darkColor, `missing dark K${tone}`).toBeDefined();
      expect(darkColor?.nominalLightness).toBeCloseTo(
        100 - (lightColor?.nominalLightness ?? 0),
        12
      );
    }
  });

  it('keeps the Kiskadee v1 light nominal targets frozen', () => {
    expect(EXPECTED_TONES.map((tone) => KISKADEE_LIGHT_NOMINAL_LIGHTNESS[tone])).toEqual(
      EXPECTED_LIGHT_NOMINALS
    );
  });

  it('preserves the normalized seed exactly and can anchor it at different theme slots', () => {
    const light = generateKiskadeeScale({
      seedHex: '#FFCCCC',
      theme: 'light',
      variant: 'standard'
    });
    const dark = generateKiskadeeScale({
      seedHex: '#FFCCCC',
      theme: 'dark',
      variant: 'standard'
    });

    expect(light.anchorTone).not.toBeNull();
    expect(dark.anchorTone).not.toBeNull();
    expect(light.anchorTone).not.toBe(dark.anchorTone);
    expect(findColor(light, light.anchorTone ?? -1)?.hex).toBe('#ffcccc');
    expect(findColor(dark, dark.anchorTone ?? -1)?.hex).toBe('#ffcccc');
    expect(findColor(light, light.anchorTone ?? -1)?.flags.isAnchor).toBe(true);
    expect(findColor(dark, dark.anchorTone ?? -1)?.flags.isAnchor).toBe(true);
    expect(light.diagnostics.anchor?.hex).toBe('#ffcccc');
    expect(dark.diagnostics.anchor?.hex).toBe('#ffcccc');
  });

  it.each([
    ['#fff', '#ffffff'],
    ['fff', '#ffffff'],
    ['0F6CBD', '#0f6cbd'],
    ['ABCDEF', '#abcdef']
  ])('normalizes supported input %s to %s', (seedHex, normalizedHex) => {
    const result = generateKiskadeeScale({ seedHex, theme: 'light', variant: 'standard' });

    expect(result.diagnostics.valid).toBe(true);
    expect(result.anchorTone).not.toBeNull();
    expect(findColor(result, result.anchorTone ?? -1)?.hex).toBe(normalizedHex);
  });

  it.each(THEMES)('maps absolute input colors directly to the matching %s cap', (theme) => {
    for (const seedHex of ['#000000', '#ffffff'] as const) {
      const result = generateKiskadeeScale({ seedHex, theme, variant: 'standard' });
      const expectedTone = expectedCapTone(theme, seedHex);

      expect(result.diagnostics.valid).toBe(true);
      expect(result.anchorTone).toBe(expectedTone);
      expect(findColor(result, expectedTone)?.hex).toBe(seedHex);
      expect(findColor(result, expectedTone)?.flags.isAnchor).toBe(true);
    }
  });

  it('selects the nearest quantized-feasible anchor and reports any relocation', () => {
    const feasible = generateKiskadeeScale({
      seedHex: '#3333ff',
      theme: 'dark',
      variant: 'standard'
    });
    const relocated = generateKiskadeeScale({
      seedHex: '#6600ff',
      theme: 'dark',
      variant: 'standard'
    });

    expect(feasible.anchorTone).toBe(50);
    expect(feasible.diagnostics.anchor).toMatchObject({
      nominalNearestTone: 50,
      relocated: false,
      relocationReason: 'none'
    });
    expect(relocated.anchorTone).toBe(35);
    expect(relocated.diagnostics.anchor).toMatchObject({
      nominalNearestTone: 50,
      relocated: true,
      relocationReason: 'emitted-spacing'
    });
    expect(relocated.diagnostics.separationRelaxed).toBe(true);
    expect(findColor(relocated, 35)?.hex).toBe('#6600ff');
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

  it('reports an emitted chroma cusp without altering the exact saturated anchor', () => {
    const result = generateKiskadeeScale({
      seedHex: '#0c02fc',
      theme: 'dark',
      variant: 'standard'
    });

    expect(result.diagnostics.valid).toBe(true);
    expect(findColor(result, result.anchorTone ?? -1)?.hex).toBe('#0c02fc');
    expect(result.diagnostics.chromaContinuityRelaxed).toBe(true);
    expect(result.diagnostics.maxLocalChromaProminence).toBeGreaterThan(0.01);
    expect(result.diagnostics.chromaPeakTone).toBe(result.anchorTone);
  });

  it.each(THEMES)('is strictly monotonic, unique, in gamut, and vivid-safe in %s', (theme) => {
    for (const seedHex of REGRESSION_SEEDS) {
      const result = generateKiskadeeScale({ seedHex, theme, variant: 'standard' });
      const foregroundHex = theme === 'light' ? '#ffffff' : '#000000';

      expect(result.diagnostics.valid, `${seedHex} ${theme}`).toBe(true);
      expect(result.diagnostics.monotonic, `${seedHex} ${theme}`).toBe(true);
      expect(isStrictlyMonotonic(result, theme), `${seedHex} ${theme}`).toBe(true);
      expect(result.diagnostics.adjacentDuplicates, `${seedHex} ${theme}`).toEqual([]);

      for (let index = 1; index < result.colors.length; index += 1) {
        expect(
          result.colors[index].hex,
          `${seedHex} ${theme} K${result.colors[index].tone}`
        ).not.toBe(result.colors[index - 1].hex);
      }

      for (const color of result.colors) {
        expect(
          parseHex(color.hex),
          `${seedHex} ${theme} K${color.tone}: ${color.hex}`
        ).not.toBeNull();
        expect(Number.isFinite(color.oklch.l), `${seedHex} ${theme} K${color.tone} OKL L`).toBe(
          true
        );
        expect(Number.isFinite(color.oklch.c), `${seedHex} ${theme} K${color.tone} OKL C`).toBe(
          true
        );
        expect(Number.isFinite(color.oklch.h), `${seedHex} ${theme} K${color.tone} OKL H`).toBe(
          true
        );
        expect(
          color.gamutChromaLoss,
          `${seedHex} ${theme} K${color.tone} gamut loss`
        ).toBeGreaterThanOrEqual(0);
      }

      for (const tone of VIVID_TONES) {
        const color = findColor(result, tone);
        expect(color, `${seedHex} ${theme} missing K${tone}`).toBeDefined();
        expect(
          contrastRatio(color?.hex ?? '#000000', foregroundHex),
          `${seedHex} ${theme} K${tone}`
        ).toBeGreaterThanOrEqual(3);
      }

      expect(result.diagnostics.contrastFailures, `${seedHex} ${theme}`).toEqual([]);
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
  ])('rejects invalid input %j without generating a fallback scale', (seedHex) => {
    const result = generateKiskadeeScale({ seedHex, theme: 'light', variant: 'standard' });

    expect(result.colors).toEqual([]);
    expect(result.anchorTone).toBeNull();
    expect(result.diagnostics.valid).toBe(false);
    expect(result.diagnostics.error?.code).toBe('INVALID_HEX');
  });

  it('preserves all invariants across an 11 x 11 x 11 RGB matrix in both themes', () => {
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

    for (const red of channelValues) {
      for (const green of channelValues) {
        for (const blue of channelValues) {
          const seedHex = `#${red.toString(16).padStart(2, '0')}${green
            .toString(16)
            .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

          for (const theme of THEMES) {
            const context = `${seedHex} ${theme}`;
            const result = generateKiskadeeScale({ seedHex, theme, variant: 'standard' });

            if (!result.diagnostics.valid) {
              recordFailure(failures.generation, `${context}: ${result.diagnostics.error?.code}`);
              continue;
            }

            if (
              result.colors.length !== EXPECTED_TONES.length ||
              result.colors.some((color, index) => color.tone !== EXPECTED_TONES[index])
            ) {
              recordFailure(failures.structure, `${context}: incomplete or unordered grid`);
              continue;
            }

            if (
              findColor(result, 0)?.hex !== expectedCapHex(theme, 0) ||
              findColor(result, 100)?.hex !== expectedCapHex(theme, 100)
            ) {
              recordFailure(failures.structure, `${context}: invalid absolute caps`);
            }

            const anchor =
              result.anchorTone === null ? undefined : findColor(result, result.anchorTone);
            if (!anchor || anchor.hex !== seedHex || !anchor.flags.isAnchor) {
              recordFailure(
                failures.anchor,
                `${context}: K${result.anchorTone ?? 'null'} emitted ${anchor?.hex ?? 'nothing'}`
              );
            }

            if (!result.diagnostics.monotonic || !isStrictlyMonotonic(result, theme)) {
              recordFailure(failures.monotonicity, context);
            }

            for (let index = 1; index < result.colors.length; index += 1) {
              const previous = result.colors[index - 1];
              const current = result.colors[index];

              if (previous.hex === current.hex) {
                recordFailure(
                  failures.duplicates,
                  `${context}: K${previous.tone}/K${current.tone} ${current.hex}`
                );
              }
            }

            for (const color of result.colors) {
              const validHex = parseHex(color.hex) !== null;
              const finiteCoordinates =
                Number.isFinite(color.oklch.l) &&
                Number.isFinite(color.oklch.c) &&
                Number.isFinite(color.oklch.h);

              if (
                !validHex ||
                !finiteCoordinates ||
                !Number.isFinite(color.gamutChromaLoss) ||
                color.gamutChromaLoss < 0
              ) {
                recordFailure(
                  failures.gamut,
                  `${context}: K${color.tone} ${color.hex} loss=${color.gamutChromaLoss}`
                );
              }
            }

            const foregroundHex = theme === 'light' ? '#ffffff' : '#000000';
            for (const tone of VIVID_TONES) {
              const color = findColor(result, tone);
              const ratio = color ? contrastRatio(color.hex, foregroundHex) : 0;

              if (ratio < 3) {
                recordFailure(
                  failures.contrast,
                  `${context}: K${tone} ${color?.hex ?? 'missing'} ratio=${ratio.toFixed(4)}`
                );
              }
            }
          }
        }
      }
    }

    expectNoFailures('generation', failures.generation);
    expectNoFailures('structure', failures.structure);
    expectNoFailures('exact anchor', failures.anchor);
    expectNoFailures('monotonicity', failures.monotonicity);
    expectNoFailures('adjacent duplicates', failures.duplicates);
    expectNoFailures('sRGB gamut', failures.gamut);
    expectNoFailures('vivid contrast', failures.contrast);
  }, 60_000);
});
