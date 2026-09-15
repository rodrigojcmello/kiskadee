import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleButtonSchema } from './button.schema.ts';
import {
  createMaterialButtonIntent,
  MATERIAL_BUTTON_EMPHASES,
  MATERIAL_BUTTON_INTENTS
} from './button-color-formula.ts';

const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
function rgb(hex: string) {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}
function composite(hex: string, surface: string) {
  const alpha = hex.length === 9 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return rgb(hex).map((channel, i) => channel * alpha + rgb(surface)[i] * (1 - alpha));
}
function luminance(channels: number[]) {
  return channels
    .map((x) => x / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(ink: string, background: string, surface: string) {
  const a = luminance(rgb(ink));
  const b = luminance(composite(background, surface));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

it('publishes all intents, emphases, themes and surfaces in both segments', () => {
  const button = createMaterial3GoogleButtonSchema({
    c,
    segmentNames: ['default', 'dynamic', 'purple'],
    transparent: 'transparent'
  });
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of MATERIAL_BUTTON_INTENTS)
          for (const emphasis of MATERIAL_BUTTON_EMPHASES) {
            const root = button.elements.e1?.palettes?.[segment]?.[theme]?.[surface];
            const label = button.elements.e2?.palettes?.[segment]?.[theme]?.[surface];
            expect(root?.boxColor?.[intent]?.[emphasis]?.rest).toBeTruthy();
            expect(root?.borderColor?.[intent]?.[emphasis]?.rest).toBeTruthy();
            expect(label?.textColor?.[intent]?.[emphasis]?.disabled).toHaveProperty('ref');
          }
});

it('keeps medium and interactive low surfaces in their own intent family', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const intent of MATERIAL_BUTTON_INTENTS) {
      const formula = createMaterialButtonIntent({
        c,
        segment: 'default',
        theme,
        surface: 'onSubtle',
        intent
      });
      expect(formula.boxColor.medium.rest).toBe(
        theme === 'light'
          ? c('default', 'l', `button.${intent}`, 7)
          : c.ref('default', 'd', `button.${intent}`, 'subtle')
      );
      expect(formula.boxColor.low.hover).not.toBe(formula.boxColor.low.rest);
    }
  }
});

it('keeps enabled label contrast through isolated and selected interaction states', () => {
  const failures: string[] = [];
  for (const segment of ['default', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of MATERIAL_BUTTON_INTENTS) {
          const formula = createMaterialButtonIntent({
            c,
            segment,
            theme,
            surface,
            intent
          });
          const parent =
            surface === 'onVivid'
              ? c.ref(segment, 'l', 'button.primary', 'vivid')
              : c(segment, theme === 'light' ? 'l' : 'd', 'primitive.black.v1', 0);
          for (const emphasis of MATERIAL_BUTTON_EMPHASES)
            for (const selected of [false, true])
              for (const state of ['rest', 'hover', 'focus', 'pressed'] as const) {
                const box = selected
                  ? formula.boxColor[emphasis].selected!
                  : formula.boxColor[emphasis];
                const text = selected
                  ? (formula.textColor[emphasis].selected?.rest.ref ??
                    formula.textColor[emphasis].rest)
                  : formula.textColor[emphasis].rest;
                const ratio = contrast(text, box[state] ?? box.rest, parent);
                if (ratio < 4.5)
                  failures.push(
                    `${segment}/${theme}/${surface}/${intent}/${emphasis}/${selected}/${state}: ${ratio.toFixed(2)}`
                  );
              }
        }
  expect(failures).toEqual([]);
});

it('follows the foreground direction for Material state layers', () => {
  for (const intent of MATERIAL_BUTTON_INTENTS) {
    const formula = createMaterialButtonIntent({
      c,
      segment: 'default',
      theme: 'light',
      surface: 'onSubtle',
      intent
    });
    expect(luminance(rgb(formula.boxColor.high.hover!))).toBeGreaterThan(
      luminance(rgb(formula.boxColor.high.rest))
    );
    expect(luminance(rgb(formula.boxColor.medium.hover!))).toBeLessThan(
      luminance(rgb(formula.boxColor.medium.rest))
    );
    expect(formula.boxColor.high.focus).not.toBe(formula.boxColor.high.rest);
  }
});

it('publishes parent-state content and keeps pending spinners at full strength', () => {
  const button = createMaterial3GoogleButtonSchema({
    c,
    segmentNames: ['default', 'dynamic', 'purple'],
    transparent: 'transparent'
  });
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of MATERIAL_BUTTON_INTENTS)
          for (const emphasis of MATERIAL_BUTTON_EMPHASES) {
            const label =
              button.elements.e2?.palettes?.[segment]?.[theme]?.[surface]?.textColor?.[intent]?.[
                emphasis
              ];
            const icon =
              button.elements.e3?.palettes?.[segment]?.[theme]?.[surface]?.textColor?.[intent]?.[
                emphasis
              ];
            expect(label?.pending).toHaveProperty('ref');
            expect(icon?.pending).toBeUndefined();
            expect(icon?.rest).toEqual(label?.rest);
            expect(icon?.disabled).toEqual(label?.disabled);
            const context =
              button.contentSurfaceContext?.[segment]?.[theme]?.[surface]?.[intent]?.[emphasis];
            expect(context?.selected).toBe(
              surface === 'onVivid' || theme === 'dark' ? 'onSubtle' : 'onVivid'
            );
            expect(context?.disabled).toBe('inherit');
          }
});

it('keeps the neutral button achromatic independently of segment tint', () => {
  for (const segment of ['default', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const) {
      const formula = createMaterialButtonIntent({
        c,
        segment,
        theme,
        surface: 'onSubtle',
        intent: 'neutral'
      });
      for (const emphasis of MATERIAL_BUTTON_EMPHASES) {
        const channels = rgb(formula.boxColor[emphasis].rest);
        expect(channels[0]).toBe(channels[1]);
        expect(channels[1]).toBe(channels[2]);
      }
    }
});
