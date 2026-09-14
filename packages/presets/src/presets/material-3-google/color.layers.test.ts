import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { primitiveColors } from './color.layers.ts';
import { schemaColors } from './material-3-google.colors.ts';

it('resolves Material component intents and legacy variants through the promoted families', () => {
  const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
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
  const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
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

it('maps purple primary and all neutral aliases without changing shared semantic colors', () => {
  const c = createPresetColorGetter<'default' | 'dynamic' | 'purple'>({ colors: schemaColors });
  for (const theme of ['l', 'd'] as const) {
    for (const role of ['neutral', 'neutral.v2', 'primary.v2', 'button.neutral', 'card.neutral.v2'] as const)
      expect(c('purple', theme, role, 50)).toBe(c('purple', theme, 'primitive.black.v3', 50));
    expect(c('purple', theme, 'primary', 50)).toBe(c('purple', theme, 'primitive.purple.v2', 50));
    for (const role of ['redLike', 'greenLike', 'yellowLike', 'purpleLike'] as const)
      expect(c('purple', theme, role, 50)).toBe(c('default', theme, role, 50));
    expect(c('purple', theme, 'primitive.blue.v1', 50)).toBe(c('default', theme, 'primary', 50));
  }
});
