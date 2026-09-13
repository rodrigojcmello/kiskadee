import { expect, it } from 'vitest';
import { schema as fluent } from '../fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema } from './material-3-google.schema.ts';

it('publishes the Fluent component coverage without dropping existing Material components', () => {
  for (const component of [...Object.keys(fluent.components), 'tabs', 'textField']) {
    expect(schema.components, component).toHaveProperty(component);
  }
});

it('supplies shared foregrounds, contours, separators and focus in every published context', () => {
  for (const segment of ['default', 'dynamic'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      expect(schema.themeTokens?.palettes?.[segment]?.[theme]?.focusColor).toMatch(
        /^#[\da-f]{6}$/i
      );
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const foregrounds = schema.global?.foregrounds?.profiles;
        for (const family of [
          'neutral',
          'blue',
          'red',
          'green',
          'purple',
          'pink',
          'yellow'
        ] as const) {
          for (const profile of ['standard', 'deep'] as const) {
            const palette =
              foregrounds?.[family]?.[profile]?.palettes?.[segment]?.[theme]?.[surface];
            expect(
              palette?.medium?.rest,
              `${segment}.${theme}.${surface}.${family}.${profile}`
            ).toBeTruthy();
          }
        }
        const contour =
          schema.global?.contours?.profiles?.neutral?.standard?.palettes?.[segment]?.[theme]?.[
            surface
          ];
        expect(contour?.medium?.rest).toBeTruthy();
        expect(contour?.low?.rest).toBeTruthy();
        const separator =
          schema.global?.separators?.profiles?.subtle?.palettes?.[segment]?.[theme]?.[surface];
        expect(separator?.boxColor?.neutral?.medium?.rest).toBeTruthy();
      }
    }
  }
});

it('keeps standard foregrounds readable on canonical subtle surfaces', () => {
  function luminance(hex: string) {
    return [1, 3, 5]
      .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  }
  for (const family of ['neutral', 'blue', 'red', 'green', 'purple', 'pink', 'yellow'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      const color =
        schema.global?.foregrounds?.profiles?.[family]?.standard?.palettes?.default?.[theme]
          ?.onSubtle?.medium?.rest;
      expect(typeof color).toBe('string');
      const value = luminance(color as string);
      const background = theme === 'light' ? 1 : 0;
      const ratio = (Math.max(value, background) + 0.05) / (Math.min(value, background) + 0.05);
      expect(ratio, `${family}.${theme} ${String(color)}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
