import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { primitiveColors } from './color.layers.ts';
import { schemaColors } from './material-3-google.colors.ts';

it('resolves Material component intents and legacy variants through the promoted families', () => {
  const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
  for (const segment of ['default', 'dynamic'] as const) {
    for (const [shortcut, theme] of [
      ['l', 'light'],
      ['d', 'dark']
    ] as const) {
      for (const tone of [0, 18, 40, 50, 100] as const) {
        expect(c(segment, shortcut, 'button.primary', tone)).toBe(
          primitiveColors.blue.v1.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'button.neutral', tone)).toBe(
          primitiveColors.black.v2.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'primary.v2', tone)).toBe(
          primitiveColors.black.v2.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'card.neutral.v2', tone)).toBe(
          primitiveColors.black.v2.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'switch.neutral', tone)).toBe(
          primitiveColors.blue.v1.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'textField.error', tone)).toBe(
          primitiveColors.red.v1.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'greenLike', tone)).toBe(
          primitiveColors.green.v1.scales[theme][tone]
        );
        expect(c(segment, shortcut, 'primitive.black.v1', tone)).toBe(
          primitiveColors.black.v1.scales[theme][tone]
        );
      }
      for (const reference of ['subtle', 'medium', 'vivid'] as const) {
        const tone = primitiveColors.blue.v1.functionalReferences[theme][reference];
        expect(c.ref(segment, shortcut, 'primary', reference)).toBe(
          primitiveColors.blue.v1.scales[theme][tone]
        );
      }
    }
  }
});

it('keeps the approved light Card medium neutral distinct from primary', () => {
  const c = createPresetColorGetter<'default' | 'dynamic'>({ colors: schemaColors });
  for (const segment of ['default', 'dynamic'] as const) {
    const neutral = c.ref(segment, 'l', 'card.neutral', 'subtle');
    const primary = c.ref(segment, 'l', 'card.primary', 'subtle');
    expect(neutral).not.toBe(primary);
    expect(neutral).toBe(
      primitiveColors.black.v2.scales.light[
        primitiveColors.black.v2.functionalReferences.light.subtle
      ]
    );
  }
});
