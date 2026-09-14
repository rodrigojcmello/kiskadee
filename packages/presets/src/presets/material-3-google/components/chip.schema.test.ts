import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleChipSchema } from './chip.schema.ts';

const segmentNames = ['default', 'dynamic', 'purple'] as const;
const c = createPresetColorGetter<(typeof segmentNames)[number]>({ colors: schemaColors });
const transparent = c('default', 'l', 'primitive.black.v1', 100, 0);
const chip = createMaterial3GoogleChipSchema({ c, segmentNames, transparent });
const intents = ['neutral', 'primary'] as const;
const emphases = ['high', 'medium', 'low', 'lowest'] as const;
const states = ['rest', 'hover', 'focus', 'pressed'] as const;

type Rgb = readonly [number, number, number];

function rgb(hex: string): Rgb {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

function alpha(hex: string) {
  const value = hex.slice(1);
  return value.length === 8 ? Number.parseInt(value.slice(6), 16) / 255 : 1;
}

function luminance(channels: Rgb) {
  return channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function composite(color: string, background: Rgb): Rgb {
  const source = rgb(color);
  const opacity = alpha(color);
  return [
    source[0] * opacity + background[0] * (1 - opacity),
    source[1] * opacity + background[1] * (1 - opacity),
    source[2] * opacity + background[2] * (1 - opacity)
  ];
}

function contrast(ink: string, box: string, canonicalSurface: string) {
  const canonical = rgb(canonicalSurface);
  const background = composite(box, canonical);
  const foreground = composite(ink, background);
  const inkLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(inkLuminance, backgroundLuminance) + 0.05) /
    (Math.min(inkLuminance, backgroundLuminance) + 0.05)
  );
}

function canonicalSurface(
  segment: (typeof segmentNames)[number],
  theme: 'light' | 'dark',
  surface: 'onSubtle' | 'onVivid'
) {
  return surface === 'onVivid'
    ? c.ref(segment, 'l', 'card.primary', 'vivid')
    : c.ref(segment, theme === 'light' ? 'l' : 'd', 'card.neutral', 'subtle');
}

it('publishes Chip surfaces, content and states across the complete Material matrix', () => {
  for (const segment of segmentNames)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of intents)
          for (const emphasis of emphases) {
            const box =
              chip.elements.e2.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[intent]?.[
                emphasis
              ];
            const text =
              chip.elements.e3.palettes?.[segment]?.[theme]?.[surface]?.textColor?.[intent]?.[
                emphasis
              ];

            expect(
              box?.rest,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} rest`
            ).toBeTruthy();
            expect(
              box?.hover,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} hover`
            ).not.toBe(box?.rest);
            expect(
              box?.focus,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} focus`
            ).not.toBe(box?.rest);
            expect(
              box?.pressed,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} pressed`
            ).not.toBe(box?.rest);
            expect(box?.selected?.rest).toBeTruthy();
            expect(box?.disabled).toBeTruthy();
            expect(text?.rest).toBeTruthy();
            expect(text?.disabled).toHaveProperty('ref');
          }
});

it('keeps Material outlined emphasis sparse while retaining selected and disabled deltas', () => {
  const palette = chip.elements.e2.palettes?.default?.light?.onSubtle;
  const low = palette?.boxColor?.primary?.low;
  const lowestBorder = palette?.borderColor?.primary?.lowest;

  expect(low?.rest).toBe(transparent);
  expect(low?.hover).not.toBe(low?.rest);
  expect(low?.selected?.rest).not.toBe(low?.rest);
  expect(lowestBorder?.rest).not.toBe('transparent');
  expect(lowestBorder?.selected?.rest).toBe(transparent);
  expect(palette?.borderColor?.primary?.high).toEqual({ rest: transparent });
});

it('keeps dark chromatic content readable and uses inverse text for vivid low chips', () => {
  const dark = chip.elements.e3.palettes?.default?.dark?.onSubtle?.textColor?.primary;
  const vivid = chip.elements.e3.palettes?.default?.dark?.onVivid?.textColor?.primary;

  expect(dark?.medium?.rest).toBe(c.ref('default', 'd', 'chip.primary', 'vivid', 6));
  expect(vivid?.low?.rest).toBe('#ffffff');
  expect(vivid?.lowest?.rest).toBe('#ffffff');
});

it('keeps dark Material Chip content at or above the compact text contrast floor', () => {
  const surface = chip.elements.e2.palettes?.default?.dark?.onSubtle?.boxColor;
  const text = chip.elements.e3.palettes?.default?.dark?.onSubtle?.textColor;

  for (const intent of intents) {
    const ratio = contrast(
      text?.[intent]?.medium?.rest as string,
      surface?.[intent]?.medium?.rest as string,
      canonicalSurface('default', 'dark', 'onSubtle')
    );
    expect(ratio, intent).toBeGreaterThanOrEqual(3);
  }
});

it('publishes effective parent surface contexts for Chip composition', () => {
  for (const segment of segmentNames)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of intents) {
          const context = chip.contentSurfaceContext?.[segment]?.[theme]?.[surface]?.[intent];
          const high =
            surface === 'onVivid' || (theme === 'dark' && intent === 'neutral')
              ? 'onSubtle'
              : 'onVivid';
          expect(context?.high).toEqual({ rest: high, selected: high, disabled: surface });
          expect(context?.medium).toEqual({ rest: 'onSubtle', selected: high, disabled: surface });
          expect(context?.low).toEqual({ rest: 'inherit', selected: high, disabled: surface });
          expect(context?.lowest).toEqual({
            rest: 'inherit',
            selected: high,
            disabled: surface
          });
        }
});

it('keeps labels readable over composed selected interaction states', () => {
  const failures: string[] = [];

  for (const segment of segmentNames)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of intents)
          for (const emphasis of emphases) {
            const box =
              chip.elements.e2.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[intent]?.[
                emphasis
              ];
            const text =
              chip.elements.e3.palettes?.[segment]?.[theme]?.[surface]?.textColor?.[intent]?.[
                emphasis
              ];
            const base = canonicalSurface(segment, theme, surface);
            const restText = text?.rest as string;
            const selectedRest = text?.selected?.rest;
            const selectedText = (
              typeof selectedRest === 'object' && selectedRest !== null && 'ref' in selectedRest
                ? selectedRest.ref
                : text?.rest
            ) as string;

            for (const state of states) {
              const value = box?.[state] as string;
              const ratio = contrast(restText, value, base);
              if (ratio < 3) {
                failures.push(`${segment}/${theme}/${surface}/${intent}/${emphasis}/${state}`);
              }
            }

            for (const state of states) {
              const value = box?.selected?.[state] as string;
              const ratio = contrast(selectedText, value, base);
              if (ratio < 3) {
                failures.push(
                  `${segment}/${theme}/${surface}/${intent}/${emphasis}/selected.${state}`
                );
              }
            }
          }

  expect(failures).toEqual([]);
});
