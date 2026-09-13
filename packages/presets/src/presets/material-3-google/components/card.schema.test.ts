import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleCardSchema } from './card.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
const card = createMaterial3GoogleCardSchema({
  c,
  segmentNames: ['default', 'dynamic'],
  transparent: 'transparent'
});

it('publishes canonical surfaces, palettes and descendant contexts consistently', () => {
  for (const segment of ['default', 'dynamic'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const entries = card.options?.canonicalSurfaces?.[segment]?.[theme];
        expect(entries).toHaveLength(7);
        for (const entry of entries!) {
          const box =
            card.elements.e1?.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[entry.intent]?.[
              entry.emphasis
            ];
          expect(box?.rest).toMatch(/^#/);
          expect(box?.hover).not.toEqual(box?.rest);
          const context =
            card.contentSurfaceContext?.[segment]?.[theme]?.[surface]?.[entry.intent]?.[
              entry.emphasis
            ];
          expect(context?.rest).toBe(entry.contentSurfaceContext);
          expect(context?.disabled).toBe('onSubtle');
        }
      }
});

it('resolves each medium surface from its own family and keeps border optional', () => {
  const palette = card.elements.e1?.palettes?.default?.light?.onSubtle;
  expect(palette?.boxColor?.primary?.medium?.rest).toBe(
    c.ref('default', 'l', 'card.primary', 'subtle')
  );
  expect(palette?.boxColor?.neutral?.medium?.rest).toBe(
    c.ref('default', 'l', 'card.neutral', 'subtle')
  );
  expect(card.options?.border?.default?.light?.onSubtle?.neutral?.lowest).toBe(true);
  expect(card.options?.border?.default?.light?.onSubtle?.neutral?.medium).toBe(false);
  expect(card.options?.border?.default?.light?.onVivid?.primary?.highest).toBe(true);
});

it('keeps strong surfaces dark enough for light content in every interaction', () => {
  const contrast = (hex: string) => {
    const channels = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 1.05 / (0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] + 0.05);
  };
  for (const theme of ['light', 'dark'] as const)
    for (const intent of ['neutral', 'primary'] as const) {
      const states =
        card.elements.e1?.palettes?.default?.[theme]?.onSubtle?.boxColor?.[intent]?.highest;
      for (const state of ['rest', 'hover', 'focus', 'pressed'] as const)
        expect(contrast(states?.[state] as string), `${intent}/${state}`).toBeGreaterThanOrEqual(
          4.5
        );
      for (const value of Object.values(states?.selected ?? {}))
        expect(contrast(value as string)).toBeGreaterThanOrEqual(4.5);
    }
});
