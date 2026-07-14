import { KISKADEE_TONES } from '@kiskadee/tonal-scale/generator';
import { describe, expect, it } from 'vitest';
import { generatePrimaryScale } from './generator.ts';

describe('generatePrimaryScale', () => {
  it('publishes every canonical Light and Dark variable as full lowercase HEX', () => {
    const variables = generatePrimaryScale('#1DA1F2');

    expect(Object.keys(variables)).toHaveLength(KISKADEE_TONES.length * 2);
    for (const theme of ['light', 'dark'] as const) {
      for (const tone of KISKADEE_TONES) {
        expect(variables[`--k-p-${theme}-${tone}`]).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('preserves the exact Twitter Blue anchor in both theme scales', () => {
    const variables = generatePrimaryScale('#1DA1F2');

    expect(variables['--k-p-light-24']).toBe('#1da1f2');
    expect(variables['--k-p-dark-70']).toBe('#1da1f2');
  });
});
