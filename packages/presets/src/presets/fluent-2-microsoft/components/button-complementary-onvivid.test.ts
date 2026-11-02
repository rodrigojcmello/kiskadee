import { parseForegroundReferenceToken } from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';
import { describe, expect, it } from 'vitest';
import { createStrictPresetColorResolver } from '../../../utils/presetColor.ts';
import { referenceColor } from '../fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from '../fluent-2-microsoft.color-evidence.ts';
import { schema } from '../fluent-2-microsoft.schema.ts';

const button = schema.components.button!;
const c = createStrictPresetColorResolver<
  'default' | 'teams',
  typeof fluent2MicrosoftColorEvidence
>({
  colors: schema.colors!,
  exactEvidence: fluent2MicrosoftColorEvidence
});

function foreground(value: unknown, segment: 'default' | 'teams') {
  const token = typeof value === 'string' ? value : (value as { parentState: string }).parentState;
  const coordinate = parseForegroundReferenceToken(token)!;
  const color = schema.global!.foregrounds!.profiles[coordinate.family]![coordinate.profile]!
    .palettes[segment]![coordinate.theme]![coordinate.surfaceContext]![coordinate.emphasis][
    coordinate.state ?? 'rest'
  ] as string;
  return { coordinate, color };
}

describe('Fluent Button complementary primary selection on vivid surfaces', () => {
  it('uses the exact published segment complementary vivid anchor only for Primary Medium active paint', () => {
    for (const segment of ['default', 'teams'] as const) {
      const complementary = c.resolve(segment, 'l', referenceColor('button.primary.v2', 'vivid'));
      expect(complementary).not.toBe(
        c.resolve(segment, 'l', referenceColor('button.primary', 'vivid'))
      );
      for (const theme of ['light', 'dark', 'darker'] as const) {
        const palette = button.elements.e1!.palettes![segment]![theme]!.onVivid!.standard;
        const fill = palette.boxColor!.primary!.medium!;
        expect(fill.pressed).toBe(complementary);
        expect(fill.selected!.rest).toBe(complementary);
        expect(fill.selected!.hover).toBe(complementary);
        expect(fill.rest).not.toBe(complementary);
        expect(fill.hover).not.toBe(complementary);
        expect(fill.pending).not.toBe(complementary);
        expect(fill.disabled).not.toBe(complementary);
        expect(palette.boxColor!.primary!.high!.rest).toBe('#ffffff');
        for (const intent of ['neutral', 'destructive', 'positive'] as const)
          expect(palette.boxColor![intent]!.medium!.selected!.rest).not.toBe(complementary);
      }
    }
  });

  it('keeps label, icon and inherited Disclosure content dark and legible on the light complementary fill', () => {
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const) {
        const fill =
          button.elements.e1!.palettes![segment]![theme]!.onVivid!.standard.boxColor!.primary!
            .medium!;
        for (const element of ['e2', 'e3'] as const) {
          const text =
            button.elements[element]!.palettes![segment]![theme]!.onVivid!.standard.textColor!
              .primary!.medium!;
          for (const state of ['pressed', 'selected'] as const) {
            const { coordinate, color } = foreground(
              state === 'selected' ? text.selected!.rest : text.pressed,
              segment
            );
            expect(coordinate).toMatchObject({
              family: 'neutral',
              profile: 'standard',
              theme: 'light',
              surfaceContext: 'onSubtle',
              state: 'rest'
            });
            expect(contrastRatio(color, fill.pressed as string)).toBeGreaterThanOrEqual(4.5);
          }
        }
        // Disclosure has no independent paint domain and inherits the e2 color recipe.
        expect(button.elements.e5!.palettes).toBeUndefined();
      }
  });

  it('publishes selected child context and matching inside-indicator polarity without changing the ambient context', () => {
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const) {
        const context =
          button.contentSurfaceContext![segment]![theme]!.onVivid!.standard.primary!.medium!;
        expect(context).toEqual({
          rest: 'onVivid',
          selected: 'onSubtle',
          pending: 'onVivid',
          disabled: 'onSubtle'
        });
        const fill = button.elements.e1!.palettes![segment]![theme]!.onVivid!.standard.boxColor!
          .primary!.medium!.selected!.rest as string;
        const inside =
          button.elements.e11!.palettes![segment]![theme]!.onVivid!.standard.boxColor!.primary!
            .medium!.selected!.rest;
        const outside =
          button.elements.e12!.palettes![segment]![theme]!.onVivid!.standard.boxColor!.primary!
            .medium!.selected!.rest;
        expect(contrastRatio(foreground(inside, segment).color, fill)).toBeGreaterThanOrEqual(3);
        expect(foreground(outside, segment).coordinate.surfaceContext).toBe('onVivid');
      }
  });
});
