import { parseForegroundReferenceToken } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const button = schema.components.button!;
const segments = ['default', 'teams'] as const;
const themes = ['light', 'dark', 'darker'] as const;
const intents = ['primary', 'neutral', 'destructive', 'positive'] as const;

function resolveForeground(value: unknown, segment: (typeof segments)[number]) {
  const token = typeof value === 'string' ? value : (value as { parentState: string }).parentState;
  const coordinate = parseForegroundReferenceToken(token)!;
  return schema.global!.foregrounds!.profiles[coordinate.family]![coordinate.profile]!.palettes[
    segment
  ]![coordinate.theme]![coordinate.surfaceContext]!.standard[coordinate.emphasis][
    coordinate.state ?? 'rest'
  ] as string;
}

function composite(foreground: string, background: string) {
  const alpha = foreground.length === 9 ? Number.parseInt(foreground.slice(7, 9), 16) / 255 : 1;
  return `#${foreground
    .slice(1, 7)
    .match(/../g)!
    .map((channel, index) =>
      Math.round(
        Number.parseInt(channel, 16) * alpha +
          Number.parseInt(background.slice(1 + index * 2, 3 + index * 2), 16) * (1 - alpha)
      )
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

function contrast(first: string, second: string) {
  const luminance = (hex: string) => {
    const [r = 0, g = 0, b = 0] = hex
      .slice(1, 7)
      .match(/../g)!
      .map((channel) => {
        const value = Number.parseInt(channel, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('Fluent Button Low contextual surface', () => {
  it('preserves Card Neutral Low on subtle surfaces in every intent, including Disabled resets', () => {
    for (const segment of segments)
      for (const theme of themes) {
        const expected =
          schema.components.container!.elements.e1.palettes![segment]![theme]!.onSubtle!.standard
            .boxColor!.neutral!.low!.rest;
        for (const intent of intents) {
          const fill =
            button.elements.e1!.palettes![segment]![theme]!.onSubtle!.standard.boxColor![intent]!
              .low!;
          expect(fill.rest).toBe(expected);
          expect(fill.disabled).toBe(expected);
          expect(fill.hover).toMatch(/^#[a-f0-9]{6}$/);
          expect(fill.pressed).toMatch(/^#[a-f0-9]{6}$/);
          expect(fill.selected!.rest).toBe(fill.pressed);
          expect(
            button.contentSurfaceContext![segment]![theme]!.onSubtle!.standard[intent]!.low!.rest
          ).toBe('onSubtle');
        }
      }
  });

  it('preserves the legible Low content on its own subtle surface', () => {
    for (const segment of segments)
      for (const theme of themes)
        for (const intent of intents) {
          const text =
            button.elements.e2!.palettes![segment]![theme]!.onSubtle!.standard.textColor![intent]!
              .low!;
          const fill =
            button.elements.e1!.palettes![segment]![theme]!.onSubtle!.standard.boxColor![intent]!
              .low!;
          for (const state of ['rest', 'hover', 'pressed', 'selected'] as const) {
            const foreground = resolveForeground(
              state === 'selected'
                ? (text.selected?.rest ?? text.rest)
                : (text[state] ?? text.rest),
              segment
            );
            const background = (state === 'selected' ? fill.selected!.rest : fill[state]) as string;
            expect
              .soft(contrast(foreground, background), `${segment}/${theme}/${intent}/${state}`)
              .toBeGreaterThanOrEqual(4.5);
          }
        }
  });

  it('uses an opaque canonical Card base for Low Light interactions and terminal resets', () => {
    for (const segment of segments) {
      const base = schema.components.container!.elements.e1.palettes![segment]!.light!.onSubtle!
        .standard.boxColor!.primary!.highest!.rest as string;
      expect(base).toBe(segment === 'default' ? '#0064b4' : '#5053b2');
      for (const intent of intents) {
        const fill =
          button.elements.e1!.palettes![segment]!.light!.onVivid!.standard.boxColor![intent]!.low!;
        expect(fill.rest).toBe(base);
        expect(fill.hover).toBe(composite('#ffffff14', base));
        expect(fill.pressed).toBe(composite('#ffffff1f', base));
        expect(fill.disabled).toBe(composite('#ffffff0a', base));
        for (const state of ['rest', 'hover', 'pressed', 'disabled'] as const)
          expect(fill[state]).toMatch(/^#[a-f0-9]{6}$/);
        expect(fill.selected!.rest).toBe(fill.pressed);
        expect(fill.selected!.hover).toBe(fill.selected!.rest);
        expect(contrast('#ffffff', fill.pressed as string)).toBeLessThan(
          contrast('#ffffff', fill.hover as string)
        );
      }
    }
  });

  it('darkens the actual vivid host for non-primary Medium Light Pressed and persistent selection', () => {
    for (const segment of segments) {
      const base = schema.components.container!.elements.e1.palettes![segment]!.light!.onSubtle!
        .standard.boxColor!.primary!.highest!.rest as string;
      for (const intent of intents) {
        if (intent === 'primary') continue;
        const fill =
          button.elements.e1!.palettes![segment]!.light!.onVivid!.standard.boxColor![intent]!
            .medium!;
        const text =
          button.elements.e2!.palettes![segment]!.light!.onVivid!.standard.textColor![intent]!
            .medium!;
        expect(fill.rest).toBe('#ffffff24');
        expect(fill.hover).toBe('#ffffff1a');
        expect(fill.pressed).toBe('#0000001a');
        expect(fill.selected!.rest).toBe(fill.pressed);
        expect(fill.selected!.hover).toBe(fill.pressed);
        const border =
          button.elements.e1!.palettes![segment]!.light!.onVivid!.standard.borderColor![intent]!
            .medium!;
        expect(border.rest).toBe('#ffffff1a');
        expect(border.pressed).toBe('#ffffff00');
        expect(border.selected!.rest).toBe('#ffffff00');
        expect(border.disabled).toBe('#ffffff12');
        expect(button.elements.e1!.scales!.borderWidth).toMatchObject({ 's:md:1': 1 });
        for (const state of ['pressed', 'selected'] as const) {
          const foreground = resolveForeground(
            state === 'selected' ? (text.selected?.rest ?? text.rest) : (text.pressed ?? text.rest),
            segment
          );
          for (const host of [base, '#183c2f']) {
            const surface = composite(fill.pressed as string, host);
            expect(surface).not.toBe(host);
            expect(surface).not.toBe(base);
            expect
              .soft(
                contrast(composite(foreground, surface), surface),
                `${segment}/${intent}/${state}/${host}`
              )
              .toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it('keeps Lowest Light transparent at Rest and uses stronger translucent persistent selection', () => {
    for (const segment of segments) {
      const canonicalHost = schema.components.container!.elements.e1.palettes![segment]!.light!
        .onSubtle!.standard.boxColor!.primary!.highest!.rest as string;
      for (const intent of intents) {
        const palette = button.elements.e1!.palettes![segment]!.light!.onVivid!.standard;
        const fill = palette.boxColor![intent]!.lowest!;
        const text =
          button.elements.e2!.palettes![segment]!.light!.onVivid!.standard.textColor![intent]!
            .lowest!;
        expect(fill.rest).toBe('#ffffff00');
        expect(fill.hover).toBe('#ffffff14');
        expect(fill.pressed).toBe('#ffffff1f');
        expect(fill.selected!.rest).toBe(fill.pressed);
        expect(fill.selected!.hover).toBe(fill.selected!.rest);
        expect(palette.borderColor![intent]!.lowest!.rest).toBe('#ffffff00');
        expect(resolveForeground(text.rest, segment)).toBe('#ffffff');
        // Lowest retains host-relative paint even outside the canonical Card.
        for (const host of [canonicalHost, '#183c2f']) {
          expect(composite(fill.rest as string, host)).toBe(host);
          for (const state of ['rest', 'hover', 'pressed', 'selected'] as const) {
            const background = composite(
              (state === 'selected' ? fill.selected!.rest : fill[state]) as string,
              host
            );
            const foreground = resolveForeground(
              state === 'selected'
                ? (text.selected?.rest ?? text.rest)
                : (text[state] ?? text.rest),
              segment
            );
            expect
              .soft(
                contrast(composite(foreground, background), background),
                `${segment}/${intent}/${state}/${host}`
              )
              .toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it('keeps Low content and both indicators legible over the contextual vivid surface', () => {
    for (const segment of segments)
      for (const theme of themes) {
        const host = schema.components.container!.elements.e1.palettes![segment]![theme]!.onSubtle!
          .standard.boxColor!.primary!.highest!.rest as string;
        for (const intent of intents) {
          const fill =
            button.elements.e1!.palettes![segment]![theme]!.onVivid!.standard.boxColor![intent]!
              .low!;
          const text =
            button.elements.e2!.palettes![segment]![theme]!.onVivid!.standard.textColor![intent]!
              .low!;
          if (theme !== 'light') {
            expect(fill.rest).toBe('#ffffff00');
            expect(fill.hover).toBe('#0000001a');
            expect(fill.pressed).toBe('#0000004d');
          }
          expect(fill.selected!.rest).toBe(fill.pressed);
          expect(
            button.contentSurfaceContext![segment]![theme]!.onVivid!.standard[intent]!.low!.rest
          ).toBe(theme === 'light' ? 'onVivid' : 'inherit');
          for (const state of ['rest', 'hover', 'pressed', 'selected'] as const) {
            const background = composite(
              (state === 'selected' ? fill.selected!.rest : fill[state]) as string,
              host
            );
            const foreground = resolveForeground(
              state === 'selected'
                ? (text.selected?.rest ?? text.rest)
                : (text[state] ?? text.rest),
              segment
            );
            expect
              .soft(
                contrast(composite(foreground, background), background),
                `${segment}/${theme}/${intent}/${state}`
              )
              .toBeGreaterThanOrEqual(4.5);
            for (const id of ['e11', 'e12'] as const) {
              const indicator =
                button.elements[id]!.palettes![segment]![theme]!.onVivid!.standard.boxColor![
                  intent
                ]!.low!.selected!.rest;
              const indicatorHost = id === 'e11' ? background : host;
              expect
                .soft(
                  contrast(
                    composite(resolveForeground(indicator, segment), indicatorHost),
                    indicatorHost
                  ),
                  `${segment}/${theme}/${intent}/${state}/${id}`
                )
                .toBeGreaterThanOrEqual(3);
            }
          }
        }
      }
  });
});
