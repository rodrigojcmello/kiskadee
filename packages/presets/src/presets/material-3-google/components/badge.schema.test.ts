import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleBadgeSchema } from './badge.schema.ts';

const segmentNames = ['default', 'dynamic'] as const;
const c = createPresetColorGetter<(typeof segmentNames)[number]>({ colors: schemaColors });
const badge = createMaterial3GoogleBadgeSchema({ c, segmentNames, transparent: 'transparent' });
const intents = ['neutral', 'primary', 'novelty', 'positive', 'warning', 'attention'] as const;
const emphases = ['high', 'medium', 'low', 'lowest'] as const;

function luminance(hex: string) {
  return [1, 3, 5]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(ink: string, background: string) {
  const inkLuminance = luminance(ink);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(inkLuminance, backgroundLuminance) + 0.05) /
    (Math.min(inkLuminance, backgroundLuminance) + 0.05)
  );
}

it('publishes the Material Badge matrix for every segment, theme and surface context', () => {
  for (const segment of segmentNames)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const)
        for (const intent of intents)
          for (const emphasis of emphases) {
            const box =
              badge.elements.e1.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[intent]?.[
                emphasis
              ];
            const text =
              badge.elements.e2.palettes?.[segment]?.[theme]?.[surface]?.textColor?.[intent]?.[
                emphasis
              ];

            expect(
              box?.rest,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} box`
            ).toBeTruthy();
            expect(
              text?.rest,
              `${segment}/${theme}/${surface}/${intent}/${emphasis} text`
            ).toBeTruthy();
          }
});

it('keeps intent families independent and uses a readable dark chromatic foreground', () => {
  const light = badge.elements.e1.palettes?.default?.light?.onSubtle;
  const dark = badge.elements.e2.palettes?.default?.dark?.onSubtle;

  expect(light?.boxColor?.neutral?.medium?.rest).not.toBe(light?.boxColor?.primary?.medium?.rest);
  expect(dark?.textColor?.primary?.medium?.rest).toBe(
    c.ref('default', 'd', 'badge.primary', 'vivid', 6)
  );
  expect(dark?.textColor?.neutral?.medium?.rest).toBe(
    c.ref('default', 'd', 'badge.neutral', 'vivid')
  );
});

it('uses inverse foregrounds for low badges on vivid surfaces', () => {
  const palette = badge.elements.e2.palettes?.default?.dark?.onVivid?.textColor;

  expect(palette?.primary?.low?.rest).toBe('#ffffff');
  expect(palette?.primary?.lowest?.rest).toBe('#ffffff');
  expect(palette?.primary?.medium?.rest).toBe(c.ref('default', 'l', 'badge.primary', 'vivid'));
});

it('keeps full bleed marks readable across vivid and dark subtle contexts', () => {
  const lightVivid = badge.elements.e3.palettes?.default?.light?.onVivid?.textColor;
  const darkSubtle = badge.elements.e3.palettes?.default?.dark?.onSubtle?.textColor;

  expect(lightVivid?.primary).toEqual({
    high: { rest: c.ref('default', 'l', 'badge.primary', 'subtle', 1) }
  });
  expect(darkSubtle?.primary).toEqual({
    high: { rest: c.ref('default', 'd', 'badge.primary', 'vivid', 6) }
  });
});

it('keeps dark chromatic Badge content at or above the compact text contrast floor', () => {
  const palette = badge.elements.e1.palettes?.default?.dark?.onSubtle?.boxColor;
  const text = badge.elements.e2.palettes?.default?.dark?.onSubtle?.textColor;

  for (const intent of intents.filter((value) => value !== 'neutral')) {
    const ratio = contrast(
      text?.[intent]?.medium?.rest as string,
      palette?.[intent]?.medium?.rest as string
    );
    expect(ratio, intent).toBeGreaterThanOrEqual(3);
  }
});

it('keeps the full bleed mark intentionally Rest-only', () => {
  const mark = badge.elements.e3.palettes?.default?.light?.onSubtle?.textColor?.primary;
  expect(mark).toEqual({ high: { rest: c.ref('default', 'l', 'badge.primary', 'vivid') } });
});
