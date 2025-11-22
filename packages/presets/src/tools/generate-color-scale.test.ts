import * as fs from 'node:fs';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateColorScale, generateColorScaleWithLog } from './generate-color-scale';

describe('generateColorScale', () => {
  it('creates a canonical scale when prioritizeLightnessScale is true', () => {
    const { soft, solid } = generateColorScale('#0F6CBD', true);

    // Soft track extremes
    expect(soft[0]).toEqual([0, 0, 100, 1]);

    // Solid track canonical mapping: index ≈ darkness%
    expect(solid[40]).toEqual([208, 85, 60, 1]);
    expect(solid[50]).toEqual([208, 85, 50, 1]);
    expect(solid[60]).toEqual([208, 85, 40, 1]);
    expect(solid[70]).toEqual([208, 85, 30, 1]);
    expect(solid[80]).toEqual([208, 85, 20, 1]);
    expect(solid[90]).toEqual([208, 85, 10, 1]);

    // Solid darkest extreme is absolute black
    expect(solid[100]).toEqual([0, 0, 0, 1]);
  });

  it('keeps the input color lightness at tone 50 when prioritizeLightnessScale is false', () => {
    const { soft, solid } = generateColorScale('#0F6CBD', false);

    // Still enforce absolute extremes
    expect(soft[0]).toEqual([0, 0, 100, 1]);
    expect(solid[100]).toEqual([0, 0, 0, 1]);

    // Anchor (tone 50) must preserve the original lightness (L=40 for #0F6CBD)
    expect(solid[50]?.[2]).toBe(40);
  });

  it('rounds arbitrary lightness to the nearest dark tone bucket', () => {
    // This color was chosen so that its HSLA lightness is approximately 33%,
    // meaning its darkness (~67%) sits between the canonical dark tones 60 and 70.
    // In the Kiskadee model, darkness 67 should snap to tone 70 (70% darkness).
    const { solid } = generateColorScale('#135FA3', true);

    // Tone 70 must be darker than tone 60 and lighter than tone 80, reflecting
    // that 67% darkness has been rounded to the 70 bucket.
    const l60 = solid[60]?.[2] ?? 0;
    const l70 = solid[70]?.[2] ?? 0;
    const l80 = solid[80]?.[2] ?? 0;

    expect(l60).toBeGreaterThan(l70);
    expect(l70).toBeGreaterThan(l80);
  });
});

describe('generateColorScaleWithLog', () => {
  let logSpy: MockInstance;
  let writeSpy: MockInstance;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
  });

  afterEach(() => {
    writeSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('applies tone overrides without changing absolute extremes 0 and 100', () => {
    const overrides = {
      0: '#FF0000', // should be ignored (absolute white is enforced)
      70: '#115EA3', // should override solid[70]
      100: '#00FF00' // should be ignored (absolute black is enforced)
    } as const;

    const tracks = generateColorScaleWithLog('#0F6CBD', true, overrides);

    // Soft[0] and solid[100] must remain absolute white/black
    expect(tracks.soft[0]).toEqual([0, 0, 100, 1]);
    expect(tracks.solid[100]).toEqual([0, 0, 0, 1]);

    // Solid[70] must reflect the overridden Fluent tone (#115EA3 → [208, 81, 35, 1])
    expect(tracks.solid[70]).toEqual([208, 81, 35, 1]);

    // The file writer should have been called once with content mentioning the override
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const [, fileContent] = writeSpy.mock.calls[0] as [string, string];
    expect(fileContent).toContain('OVERRIDDEN: generated');
    expect(fileContent).toContain('#115EA3');
  });
});
