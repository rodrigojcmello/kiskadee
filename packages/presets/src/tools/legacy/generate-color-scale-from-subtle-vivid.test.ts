import { describe, expect, it } from 'vitest';
import { generateColorScaleFromSubtleVivid } from './generate-color-scale-from-subtle-vivid.ts';

type HSLA = [number, number, number, number];

function expectHsla(value: unknown): asserts value is HSLA {
  expect(Array.isArray(value)).toBe(true);
}

function hexToHSLA(hex: string): HSLA {
  let cleanHex = hex.trim().replace(/^#/, '').toLowerCase();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) {
    cleanHex = '000000';
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

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

  const hueInDegrees = Number((hue * 360).toFixed(2));
  const saturationPercent = Number((saturation * 100).toFixed(2));
  const lightnessPercent = Number((lightness * 100).toFixed(2));

  return [hueInDegrees, saturationPercent, lightnessPercent, 1];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function nearestIntegerTone0To30(darkness: number): number {
  const snapped = Math.round(darkness);
  return clamp(snapped, 0, 30);
}

function nearestTone35To100Step5(darkness: number): number {
  const clamped = clamp(darkness, 35, 100);
  const snapped = Math.round(clamped / 5) * 5;
  return clamp(snapped, 35, 100);
}

function canonicalLightnessAtTone(tone: number): number {
  if (tone <= 30) return 100 - tone;
  const ratio = (tone - 30) / (100 - 30);
  return Math.round(70 + (0 - 70) * ratio);
}

describe('generateColorScaleFromSubtleVivid', () => {
  it('throws when subtle is not lighter than vivid', () => {
    expect(() => generateColorScaleFromSubtleVivid('#000000', '#FFFFFF')).toThrow(
      'subtle color must be lighter than vivid color'
    );
  });

  it('enforces absolute extremes (subtle[0] white, vivid[100] black)', () => {
    const { subtle, vivid } = generateColorScaleFromSubtleVivid('#FFFFFF', '#000000');
    expect(subtle[0]).toEqual([0, 0, 100, 1]);
    expect(vivid[100]).toEqual([0, 0, 0, 1]);
  });

  it('snaps endpoints to the supported tone buckets and uses canonical lightness', () => {
    const subtleHex = '#E6F0FF';
    const vividHex = '#0F6CBD';

    const subtleInput = hexToHSLA(subtleHex);
    const vividInput = hexToHSLA(vividHex);

    const subtleTone = nearestIntegerTone0To30(100 - subtleInput[2]);
    const vividTone = nearestTone35To100Step5(100 - vividInput[2]);

    const { subtle, vivid } = generateColorScaleFromSubtleVivid(subtleHex, vividHex);

    const subtleAtTone = subtle[subtleTone as keyof typeof subtle];
    const vividAtTone = vivid[vividTone as keyof typeof vivid];

    expectHsla(subtleAtTone);
    expectHsla(vividAtTone);

    // Lightness must follow the canonical mapping (not the original input L).
    expect(subtleAtTone[2]).toBe(canonicalLightnessAtTone(subtleTone));
    expect(vividAtTone[2]).toBe(canonicalLightnessAtTone(vividTone));
  });
});
