import {
  type ColorSchema,
  parseForegroundReferenceToken,
  resolveColorVariantPalette,
  resolveContentSurfaceContextVariant,
  resolveForegroundVariant,
  validateButtonComponentContract,
  withAlpha
} from '@kiskadee/core';
import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
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
  return resolveForegroundVariant(
    schema.global!.foregrounds!.profiles[coordinate.family]![coordinate.profile]!.palettes[
      segment
    ]![coordinate.theme]![coordinate.surfaceContext]!,
    coordinate.colorVariant
  )[coordinate.emphasis][coordinate.state ?? 'rest'] as string;
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
  it('composes alternative Low Light surfaces over the current vivid Card', () => {
    for (const segment of segments) {
      const base = schema.components.container!.elements.e1.palettes![segment]!.light!.onSubtle!
        .standard.boxColor!.primary!.highest!.rest as string;
      const variants = button.elements.e1!.palettes![segment]!.light!.onVivid!;
      const paint = resolveColorVariantPalette(variants, 'alternative').boxColor!;
      for (const intent of intents) {
        const fill = paint[intent]!.low!;
        expect(fill.rest).toBe(base);
        if (intent === 'neutral') {
          expect(fill).toEqual(variants.standard.boxColor!.neutral!.low);
          continue;
        }
        const accent = paint[intent]!.high!.rest as string;
        expect(fill.hover).toBe(composite(withAlpha(accent, 8), base));
        expect(fill.pressed).toBe(composite(withAlpha(accent, 12), base));
        expect(fill.selected!.rest).toBe(fill.pressed);
        expect(fill.selected!.hover).toBe(fill.pressed);
      }
    }
  });
  it('uses shared foreground references for every onVivid text state in both variants', () => {
    expect(() => validateSchemaForegroundsContract(schema)).not.toThrow();
    const verify = (value: unknown): void => {
      if (value === undefined) return;
      if (typeof value === 'string') expect(value).toMatch(/^fg:/);
      else if (value && typeof value === 'object') Object.values(value).forEach(verify);
      else throw new Error(`Unexpected text paint: ${String(value)}`);
    };
    for (const element of Object.values(button.elements)) {
      if (!element || !('palettes' in element)) continue;
      for (const segment of segments)
        for (const theme of themes)
          for (const variant of ['standard', 'alternative'] as const)
            verify(
              (element.palettes?.[segment]?.[theme]?.onVivid?.[variant] as ColorSchema | undefined)
                ?.textColor
            );
    }
  });
  it('keeps Lowest chromatic in normal interactions and Neutral inverse in every theme', () => {
    const families = { primary: 'blue', destructive: 'red', positive: 'green' } as const;
    for (const segment of segments)
      for (const theme of themes) {
        for (const variant of ['standard', 'alternative'] as const) {
          const paint = resolveColorVariantPalette(
            button.elements.e2!.palettes![segment]![theme]!.onVivid!,
            variant
          );
          for (const [intent, family] of Object.entries(families)) {
            const expected = resolveForegroundVariant(
              schema.global!.foregrounds!.profiles[family]!.standard.palettes[segment]![theme]!
                .onVivid!,
              variant
            ).high.rest;
            for (const state of states)
              expect(resolve(stateValue(paint.textColor![intent]!.lowest, state), segment)).toBe(
                expected
              );
          }
          expect(resolve(paint.textColor!.neutral!.lowest!.rest, segment)).toBe('#ffffff');
        }
      }
  });
  it('shares Lowest paint across enabled Low and Medium text and icons in both variants', () => {
    for (const segment of segments)
      for (const theme of themes)
        for (const variant of ['standard', 'alternative'] as const)
          for (const element of ['e2', 'e3'] as const) {
            const paint = resolveColorVariantPalette(
              button.elements[element]!.palettes![segment]![theme]!.onVivid!,
              variant
            ).textColor!;
            for (const intent of intents) {
              const expected = resolve(paint[intent]!.lowest!.rest, segment);
              for (const emphasis of ['medium', 'low'] as const)
                for (const state of states) {
                  if (
                    intent === 'primary' &&
                    emphasis === 'medium' &&
                    (state === 'pressed' || state === 'selected' || state === 'selectedHover')
                  )
                    continue;
                  expect(
                    resolve(stateValue(paint[intent]![emphasis], state), segment),
                    `${segment}/${theme}/${variant}/${element}/${intent}/${emphasis}/${state}`
                  ).toBe(expected);
                }
            }
          }
  });
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
  it('authors onVivid alternatives on the original anatomy and preserves unaffected Neutral levels', () => {
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
          const effective = resolveColorVariantPalette<ColorSchema>(
            palette.onVivid!,
            'alternative'
          );
          for (const [property, paint] of Object.entries(palette.onVivid!.standard)) {
            const baseNeutral = (paint as { neutral?: Record<string, unknown> }).neutral;
            const effectiveNeutral = (
              effective as Record<string, { neutral?: Record<string, unknown> }>
            )[property]?.neutral;
            for (const emphasis of ['medium', 'low', 'lowest'] as const)
              expect(effectiveNeutral?.[emphasis]).toEqual(baseNeutral?.[emphasis]);
            if (
              (element !== 'e1' || property !== 'boxColor') &&
              (element === 'e1' || property !== 'textColor')
            )
              expect(effectiveNeutral?.high).toEqual(baseNeutral?.high);
          }
        }
        for (const element of ['e6', 'e11', 'e12'] as const) {
          expect(
            button.elements[element]!.palettes![segment]![theme]!.onVivid!.alternative
          ).toBeUndefined();
        }
        const context = button.contentSurfaceContext![segment]![theme]!;
        expect(context.onSubtle!.alternative).toBeUndefined();
        expect(context.onVivid!.alternative!.neutral!.high).toEqual({
          rest: 'onVivid',
          pending: 'onSubtle',
          disabled: 'onSubtle'
        });
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
            const effective = resolveColorVariantPalette<ColorSchema>(variants, 'alternative');
            for (const [property, value] of Object.entries(variants.standard))
              if (element === 'e1' || property !== 'textColor')
                expect((effective as any)[property]?.[intent]?.medium).toEqual(
                  (value as any)?.[intent]?.medium
                );
          }
          const label = resolveColorVariantPalette(
            button.elements.e2!.palettes![segment]![theme]!.onVivid!,
            'alternative'
          ).textColor![intent]!;
          expect(label.high!.rest).toBe('fg:neutral.standard.light.onSubtle.high');
          expect(resolve(label.high!.rest, segment)).toBe('#252525');
          const family = { primary: 'blue', positive: 'green', destructive: 'red' }[intent];
          expect(label.lowest!.rest).toBe(
            `fg:${family}.standard.${theme}.onVivid.alternative.high`
          );
          expect(resolve(label.lowest!.rest, segment)).toBe(
            button.elements.e1!.palettes![segment]![theme]!.onVivid!.alternative!.boxColor![intent]!
              .high!.rest
          );
          const bottom =
            button.elements.e1!.palettes![segment]![theme]!.onVivid!.alternative!
              .borderBottomColor![intent]!.low!;
          for (const state of states)
            expect(stateValue(bottom, state)).toBe(
              withAlpha(resolve(label.lowest!.rest, segment), theme === 'light' ? 70 : 90)
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

  it('reuses the dark Neutral High body with light text and preserves terminal recipes', () => {
    for (const segment of segments)
      for (const theme of themes) {
        const palettes = button.elements.e1!.palettes![segment]![theme]!.onVivid!;
        const body = resolveColorVariantPalette(palettes, 'alternative').boxColor!.neutral!.high!;
        const standardBody = palettes.standard.boxColor!.neutral!.high!;
        const source =
          button.elements.e1!.palettes![segment]!.light!.onSubtle.standard.boxColor!.neutral!.high!;
        expect(body.rest).toBe(source.rest);
        expect(body.hover).toBe(source.hover);
        expect(body.pressed).toBe(source.pressed);
        expect(body.selected?.rest).toBe(source.selected?.rest);
        expect(body.selected?.hover).toBe(source.selected?.rest);
        expect(body.pending).toBe(standardBody.pending);
        expect(body.disabled).toBe(standardBody.disabled);
        for (const element of ['e2', 'e3'] as const) {
          const variants = button.elements[element]!.palettes![segment]![theme]!.onVivid!;
          const content = resolveColorVariantPalette(variants, 'alternative').textColor!.neutral!
            .high!;
          expect(content.rest).toBe('fg:neutral.standard.light.onVivid.high');
          expect(content.disabled).toEqual(variants.standard.textColor!.neutral!.high!.disabled);
          expect(content.pending).toEqual(variants.standard.textColor!.neutral!.high!.pending);
          for (const state of states) {
            const color = resolve(stateValue(content, state), segment);
            const background = resolve(stateValue(body, state), segment);
            expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
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
            // Lowest remains experimental; Medium is verified above against Standard.
            if (intent !== 'neutral' && (emphasis === 'medium' || emphasis === 'lowest')) continue;
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
