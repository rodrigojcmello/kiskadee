import { readFileSync } from 'node:fs';
import { KISKADEE_TONES, type KiskadeeTone } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';
import {
  createFluent2MicrosoftBrandButtonProjection,
  type FluentBrandTonalFamilyInput
} from './button-brand-projector.ts';

function createScale(hex: string): Record<KiskadeeTone, string> {
  return Object.fromEntries(KISKADEE_TONES.map((tone) => [tone, hex])) as Record<
    KiskadeeTone,
    string
  >;
}

function omitPending(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(omitPending);
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== 'pending')
      .map(([key, child]) => [key, omitPending(child)])
  );
}

function readHighForeground(
  projection: ReturnType<typeof createFluent2MicrosoftBrandButtonProjection>,
  theme: 'light' | 'dark' | 'darker',
  intent: string
): unknown {
  const palettes = projection.elements.e2.palettes as {
    default: Record<
      string,
      {
        onSubtle: {
          standard: {
            textColor: Record<string, { high: { rest: unknown } }>;
          };
        };
      }
    >;
  };

  return palettes.default[theme]?.onSubtle?.standard.textColor[intent]?.high.rest;
}

function createBrand({
  id,
  darkVividSource
}: {
  id: string;
  darkVividSource: 'generated-anchor' | 'contrast-mirror';
}): FluentBrandTonalFamilyInput {
  return {
    id,
    contentPolarity: 'light',
    scales: {
      light: createScale('#222222'),
      dark: createScale('#dddddd')
    },
    functionalReferences: {
      light: {
        subtle: { tone: 4, hex: '#eeeeee', source: 'surface-relative' },
        vivid: { tone: 85, hex: '#222222', source: 'cap-fallback' }
      },
      dark: {
        subtle: { tone: 4, hex: '#191919', source: 'contrast-mirror' },
        vivid: { tone: 90, hex: '#dddddd', source: darkVividSource }
      }
    }
  };
}

describe('createFluent2MicrosoftBrandButtonProjection', () => {
  it('mirrors foreground polarity only for a contrast-mirrored vivid reference', () => {
    const projection = createFluent2MicrosoftBrandButtonProjection([
      createBrand({ id: 'black-cap', darkVividSource: 'contrast-mirror' }),
      createBrand({ id: 'regular', darkVividSource: 'generated-anchor' })
    ]);

    expect(readHighForeground(projection, 'light', 'brand.black-cap')).toBe('#ffffff');
    expect(readHighForeground(projection, 'dark', 'brand.black-cap')).toBe('#000000');
    expect(readHighForeground(projection, 'darker', 'brand.black-cap')).toBe('#000000');
    expect(readHighForeground(projection, 'dark', 'brand.regular')).toBe('#ffffff');
  });

  it('shares content colors while leaving pending icon feedback undimmed', () => {
    const projection = createFluent2MicrosoftBrandButtonProjection([
      createBrand({ id: 'light-content', darkVividSource: 'generated-anchor' })
    ]);

    expect(projection.elements.e3.palettes).toEqual(omitPending(projection.elements.e2.palettes));
  });
});

it('keeps portable Brand Low solid on subtle surfaces and the canonical Light vivid surface', () => {
  const projection = createFluent2MicrosoftBrandButtonProjection([
    createBrand({ id: 'solid-control', darkVividSource: 'generated-anchor' })
  ]);
  const read = (
    id: 'e1' | 'e2',
    theme: 'light' | 'dark' | 'darker',
    context: 'onSubtle' | 'onVivid',
    property: string
  ) => {
    const palettes = projection.elements[id].palettes as Record<
      string,
      Record<
        string,
        Record<string, { standard: Record<string, Record<string, Record<string, unknown>>> }>
      >
    >;
    return palettes.default![theme]![context]!.standard[property]!['brand.solid-control']!
      .low! as Record<string, unknown>;
  };
  for (const theme of ['light', 'dark', 'darker'] as const) {
    const expected =
      schema.components.container!.elements.e1.palettes!.default![theme]!.onSubtle!.standard
        .boxColor!.neutral!.low!.rest;
    for (const context of ['onSubtle'] as const) {
      expect(read('e1', theme, context, 'boxColor').rest).toBe(expected);
      expect(read('e1', theme, context, 'boxColor').disabled).toBe(expected);
      expect(read('e2', theme, context, 'textColor')).toEqual(
        read('e2', theme, 'onSubtle', 'textColor')
      );
      if (theme !== 'light') {
        const content = read('e2', theme, context, 'textColor');
        expect(content.pressed).toEqual({ ref: '#ffffff' });
        expect(content.selected).toEqual({ rest: content.pressed });
      }
    }
    const vivid = read('e1', theme, 'onVivid', 'boxColor');
    if (theme === 'light') {
      const canonical =
        schema.components.container!.elements.e1.palettes!.default!.light!.onSubtle!.standard
          .boxColor!.primary!.highest!.rest;
      expect(vivid.rest).toBe(canonical);
      expect(vivid.hover).toMatch(/^#[a-f0-9]{6}$/);
      expect(vivid.pressed).toMatch(/^#[a-f0-9]{6}$/);
      expect(vivid.selected).toEqual({ rest: vivid.pressed, hover: vivid.pressed });
    } else {
      expect(vivid.rest).toBe('#ffffff00');
    }
    expect(read('e2', theme, 'onVivid', 'textColor')).not.toEqual(
      read('e2', theme, 'onSubtle', 'textColor')
    );
  }
});

it('keeps real chromatic and capped Brand Low content readable while pressed or selected in dark themes', () => {
  const brands = ['google', 'microsoft', 'apple'].map((id) => {
    const asset = JSON.parse(
      readFileSync(
        new URL(`../../../../../brands/generated/scales/${id}.json`, import.meta.url),
        'utf8'
      )
    ) as Pick<FluentBrandTonalFamilyInput, 'scales' | 'functionalReferences'>;
    return { id, contentPolarity: 'light' as const, ...asset };
  });
  const projection = createFluent2MicrosoftBrandButtonProjection(brands);
  type Paint = {
    rest: string;
    pressed?: string | { ref: string };
    selected?: { rest: string | { ref: string } };
  };
  const palettes = projection.elements as unknown as Record<
    'e1' | 'e2' | 'e3',
    {
      palettes: {
        default: Record<
          'dark' | 'darker',
          Record<
            'onSubtle' | 'onVivid',
            { standard: Record<string, Record<string, { low: Paint }>> }
          >
        >;
      };
    }
  >;
  const contrast = (first: string, second: string) => {
    const luminance = (hex: string) =>
      hex
        .slice(1, 7)
        .match(/../g)!
        .map((channel) => Number.parseInt(channel, 16) / 255)
        .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index]!, 0);
    const a = luminance(first);
    const b = luminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const color = (value: string | { ref: string }) =>
    typeof value === 'string' ? value : value.ref;

  const composite = (foreground: string, background: string) => {
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
  };
  for (const brand of brands)
    for (const theme of ['dark', 'darker'] as const)
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const fill =
          palettes.e1.palettes.default[theme][context]!.standard.boxColor![`brand.${brand.id}`]!
            .low;
        const ambient = schema.components.container!.elements.e1.palettes!.default![theme]!
          .onSubtle!.standard.boxColor!.primary!.highest!.rest as string;
        for (const id of ['e2', 'e3'] as const) {
          const content =
            palettes[id].palettes.default[theme][context]!.standard.textColor![`brand.${brand.id}`]!
              .low;
          if (context === 'onSubtle') {
            expect(color(content.pressed!)).not.toBe(content.rest);
            expect(content.selected!.rest).toEqual(content.pressed);
            if (brand.id === 'apple') expect(color(content.pressed!)).toBe('#ffffff');
          }
          for (const state of ['pressed', 'selected'] as const) {
            const paint =
              state === 'selected'
                ? (content.selected?.rest ?? content.rest)
                : (content.pressed ?? content.rest);
            const surface = composite(
              color(state === 'selected' ? fill.selected!.rest : fill.pressed!),
              ambient
            );
            expect(contrast(composite(color(paint), surface), surface)).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
});
