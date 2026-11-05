import {
  type ColorSchema,
  parseForegroundReferenceToken,
  resolveColorVariantPalette,
  resolveContentSurfaceContextVariant,
  validateButtonComponentContract
} from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';
import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const button = schema.components.button!;
const segments = ['default', 'teams'] as const;
const themes = ['light', 'dark', 'darker'] as const;
const intents = ['primary', 'neutral', 'destructive', 'positive'] as const;
const emphases = ['high', 'medium', 'low', 'lowest'] as const;
const states = ['rest', 'hover', 'pressed', 'selected', 'selectedHover'] as const;

function resolve(value: unknown, segment: (typeof segments)[number]): string {
  const token =
    typeof value === 'object' && value
      ? ((value as { ref?: unknown; parentState?: unknown }).ref ??
        (value as { parentState?: unknown }).parentState)
      : value;
  if (typeof token !== 'string') throw new Error(`Missing color: ${JSON.stringify(value)}`);
  if (token.startsWith('#')) return token;
  const coordinate = parseForegroundReferenceToken(token)!;
  return schema.global!.foregrounds!.profiles[coordinate.family]![coordinate.profile]!.palettes[
    segment
  ]![coordinate.theme]![coordinate.surfaceContext]!.standard[coordinate.emphasis][
    coordinate.state ?? 'rest'
  ] as string;
}

function composite(paint: string, surface: string): string {
  const alpha = paint.length === 9 ? Number.parseInt(paint.slice(7, 9), 16) / 255 : 1;
  return `#${[1, 3, 5]
    .map((offset) =>
      Math.round(
        Number.parseInt(paint.slice(offset, offset + 2), 16) * alpha +
          Number.parseInt(surface.slice(offset, offset + 2), 16) * (1 - alpha)
      )
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

function stateValue(value: unknown, state: (typeof states)[number]): unknown {
  const map = value as Record<string, unknown>;
  const selected = map.selected as Record<string, unknown> | undefined;
  if (state === 'selectedHover') return selected?.hover ?? selected?.rest ?? map.hover ?? map.rest;
  if (state === 'selected') return selected?.rest ?? map.rest;
  return map[state] ?? map.rest;
}

describe('Fluent Button shared color variants', () => {
  it('inherits unchanged whole state maps instead of freezing Standard copies', () => {
    for (const segment of segments)
      for (const theme of themes) {
        for (const element of ['e1', 'e2', 'e3'] as const) {
          const variants = button.elements[element]!.palettes![segment]![theme]!.onVivid!;
          for (const [property, intents] of Object.entries(variants.alternative!))
            for (const [intent, emphases] of Object.entries(intents!))
              for (const [emphasis, states] of Object.entries(emphases!))
                expect(
                  states,
                  `${segment}/${theme}/${element}/${property}/${intent}/${emphasis}`
                ).not.toEqual((variants.standard as any)[property]?.[intent]?.[emphasis]);
        }
        const context = button.contentSurfaceContext![segment]![theme]!.onVivid!;
        for (const [intent, emphases] of Object.entries(context.alternative!))
          for (const [emphasis, states] of Object.entries(emphases!))
            expect(states).not.toEqual((context.standard as any)[intent]?.[emphasis]);
      }
    const variants = structuredClone(button.elements.e1!.palettes!.default!.light!.onVivid!);
    variants.standard.borderColor!.primary!.high = { rest: '#abcdef' };
    expect(resolveColorVariantPalette(variants, 'alternative').borderColor!.primary!.high).toEqual({
      rest: '#abcdef'
    });
  });
  it('authors only chromatic onVivid alternatives on the original anatomy', () => {
    expect(validateButtonComponentContract(button)).toEqual([]);
    expect(button.options).not.toHaveProperty('colorTreatment');
    expect(button.options).not.toHaveProperty('indicatorColorTreatment');
    expect(button).not.toHaveProperty('alternativeContentSurfaceContext');
    for (let element = 13; element <= 22; element++)
      expect(button.elements).not.toHaveProperty(`e${element}`);
    for (const segment of segments)
      for (const theme of themes) {
        for (const element of ['e1', 'e2', 'e3'] as const) {
          const palette = button.elements[element]!.palettes![segment]![theme]!;
          expect(palette.onSubtle.alternative).toBeUndefined();
          expect(palette.onVivid!.alternative).toBeDefined();
          for (const property of Object.values(palette.onVivid!.alternative!))
            expect(property).not.toHaveProperty('neutral');
          const effective = resolveColorVariantPalette<ColorSchema>(
            palette.onVivid!,
            'alternative'
          );
          for (const [property, paint] of Object.entries(palette.onVivid!.standard)) {
            expect((effective as Record<string, { neutral?: unknown }>)[property]?.neutral).toEqual(
              (paint as { neutral?: unknown }).neutral
            );
          }
        }
        for (const element of ['e6', 'e11', 'e12'] as const) {
          expect(
            button.elements[element]!.palettes![segment]![theme]!.onVivid!.alternative
          ).toBeUndefined();
        }
        const context = button.contentSurfaceContext![segment]![theme]!;
        expect(context.onSubtle!.alternative).toBeUndefined();
        expect(context.onVivid!.alternative).not.toHaveProperty('neutral');
        for (const intent of ['primary', 'positive', 'destructive'] as const) {
          const effectiveContext = resolveContentSurfaceContextVariant(
            context.onVivid!,
            'alternative'
          );
          expect(effectiveContext[intent]!.medium).toEqual(
            context.onVivid!.standard[intent]!.medium
          );
          for (const element of ['e1', 'e2', 'e3'] as const) {
            const variants = button.elements[element]!.palettes![segment]![theme]!.onVivid!;
            const effective = resolveColorVariantPalette(variants, 'alternative');
            for (const [property, value] of Object.entries(variants.standard))
              expect((effective as any)[property]?.[intent]?.medium).toEqual(
                (value as any)?.[intent]?.medium
              );
          }
          const label = resolveColorVariantPalette(
            button.elements.e2!.palettes![segment]![theme]!.onVivid!,
            'alternative'
          ).textColor![intent]!;
          expect(resolve(label.high!.rest, segment)).toBe('#ffffff');
          expect(label.lowest!.rest).toBe(
            button.elements.e1!.palettes![segment]![theme]!.onVivid!.alternative!.boxColor![intent]!
              .high!.rest
          );
          const paint =
            button.elements.e1!.palettes![segment]![theme]!.onVivid!.alternative!.boxColor![
              intent
            ]!;
          for (const emphasis of ['high', 'low', 'lowest'] as const) {
            expect(paint[emphasis]).not.toHaveProperty('focus');
            expect(paint[emphasis]!.selected!.hover).toBe(paint[emphasis]!.selected!.rest);
          }
        }
      }
  });

  it('preserves the authored alternative body contrast with inherited Neutral', () => {
    for (const segment of segments)
      for (const theme of themes) {
        const ambient = schema.components.container!.elements.e1.palettes![segment]![theme]!
          .onSubtle!.standard.boxColor!.primary!.highest!.rest as string;
        for (const intent of intents)
          for (const emphasis of emphases) {
            // High/Lowest are experimental; Medium is verified above against Standard.
            if (intent !== 'neutral' && emphasis !== 'low') continue;
            const surfaces = resolveColorVariantPalette(
              button.elements.e1!.palettes![segment]![theme]!.onVivid!,
              'alternative'
            ).boxColor![intent]![emphasis]!;
            for (const element of ['e2', 'e3'] as const) {
              const content = resolveColorVariantPalette(
                button.elements[element]!.palettes![segment]![theme]!.onVivid!,
                'alternative'
              ).textColor![intent]![emphasis]!;
              for (const state of states) {
                const surface = composite(resolve(stateValue(surfaces, state), segment), ambient);
                const color = composite(resolve(stateValue(content, state), segment), surface);
                expect
                  .soft(
                    contrastRatio(color, surface),
                    `${segment}/${theme}/${intent}/${emphasis}/${element}/${state}`
                  )
                  .toBeGreaterThanOrEqual(4.5);
              }
            }
          }
      }
  });
});
