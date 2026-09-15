import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleCardSchema } from './card.schema.ts';

const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
const card = createMaterial3GoogleCardSchema({
  c,
  segmentNames: ['default', 'dynamic', 'purple'],
  transparent: 'transparent'
});

it('publishes canonical surfaces, palettes and descendant contexts consistently', () => {
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const entries = card.options?.canonicalSurfaces?.[segment]?.[theme];
        expect(entries).toHaveLength(10);
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

it('uses common pure white Lowest surfaces in Light, preserves Dark and removes only Neutral Highest', () => {
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const surface of ['onSubtle', 'onVivid'] as const)
      for (const intent of ['neutral', 'primary', 'support'] as const) {
        const light = card.elements.e1?.palettes?.[segment]?.light?.[surface]?.boxColor?.[intent];
        const dark = card.elements.e1?.palettes?.[segment]?.dark?.[surface]?.boxColor?.[intent];
        expect(light?.lowest?.rest).toBe('#ffffff');
        expect(light?.lowest?.hover).toBe(c(segment, 'l', 'primitive.black.v1', 1));
        expect(dark?.lowest?.rest).toBe(c.ref(segment, 'd', `card.${intent}`, 'subtle', -3));
        if (intent === 'neutral') {
          expect(light?.highest).toBeUndefined();
          expect(dark?.highest).toBeUndefined();
        }
      }
});

it('requires Primary Highest as the canonical onVivid surface in every segment and theme', () => {
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const) {
      expect(card.options?.canonicalSurfaces?.[segment]?.[theme]).toContainEqual({
        intent: 'primary',
        emphasis: 'highest',
        contentSurfaceContext: 'onVivid'
      });
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const states =
          card.elements.e1?.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.primary?.highest;
        expect(states?.rest).toBe(c.ref(segment, 'l', 'card.primary', 'vivid'));
        expect(states?.hover).toBe(c.ref(segment, 'l', 'card.primary', 'vivid', -1));
        for (const state of ['focus', 'pressed'] as const)
          expect(states?.[state]).toBe(c.ref(segment, 'l', 'card.primary', 'vivid', -2));
        expect(states?.selected).toEqual({
          rest: c.ref(segment, 'l', 'card.primary', 'vivid', -1),
          hover: c.ref(segment, 'l', 'card.primary', 'vivid', -2),
          pressed: c.ref(segment, 'l', 'card.primary', 'vivid', -2)
        });
        expect(
          card.contentSurfaceContext?.[segment]?.[theme]?.[surface]?.primary?.highest?.rest
        ).toBe('onVivid');
      }
    }
});

it('separates optional support from achromatic neutral in every context', () => {
  for (const segment of ['default', 'purple', 'dynamic'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const palettes = card.elements.e1?.palettes?.[segment]?.[theme]?.[surface];
        const neutral = palettes?.boxColor?.neutral?.medium?.rest as string;
        expect(neutral.slice(1, 3)).toBe(neutral.slice(3, 5));
        expect(neutral.slice(3, 5)).toBe(neutral.slice(5, 7));
        expect(palettes?.boxColor?.support?.medium?.rest).toBe(
          c.ref(
            segment,
            theme === 'light' ? 'l' : 'd',
            'card.support',
            'subtle',
            surface === 'onVivid' ? 3 : 0
          )
        );
        expect(palettes?.boxColor?.support?.medium?.rest).not.toBe(neutral);
      }
});

it('publishes pale chromatic Low surfaces without replacing Medium', () => {
  for (const segment of ['default', 'dynamic', 'purple'] as const)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of ['primary', 'support'] as const) {
          const states =
            card.elements.e1?.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[intent];
          const track = theme === 'light' ? 'l' : 'd';
          expect(states?.low?.rest).toBe(c.ref(segment, track, `card.${intent}`, 'subtle', -2));
          expect(states?.low?.rest).not.toBe(states?.medium?.rest);
          expect(states?.low?.hover).toBe(c.ref(segment, track, `card.${intent}`, 'subtle', -1));
          expect(card.options?.border?.[segment]?.[theme]?.[surface]?.[intent]?.low).toBe(false);
        }
});
