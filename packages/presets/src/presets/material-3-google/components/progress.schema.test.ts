import { expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../material-3-google.colors.ts';
import { createMaterial3GoogleProgressSchema } from './progress.schema.ts';

const segmentNames = ['default', 'dynamic', 'purple'] as const;
const c = createPresetColorGetter<(typeof segmentNames)[number]>({ colors: schemaColors });
const progress = createMaterial3GoogleProgressSchema({ c, segmentNames });
const intents = ['neutral', 'primary', 'positive', 'warning', 'destructive'] as const;

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

it('publishes the linear Progress track and indicator matrix', () => {
  for (const segment of segmentNames)
    for (const theme of ['light', 'dark'] as const)
      for (const surface of ['onSubtle', 'onVivid'] as const) {
        const track =
          progress.elements.e2.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.neutral?.medium
            ?.rest;
        expect(track, `${segment}/${theme}/${surface} track`).toBeTruthy();

        for (const intent of intents) {
          const indicator =
            progress.elements.e3.palettes?.[segment]?.[theme]?.[surface]?.boxColor?.[intent]?.medium
              ?.rest;
          expect(indicator, `${segment}/${theme}/${surface}/${intent} indicator`).toBeTruthy();
        }
      }
});

it('keeps tracks neutral and indicators in their own intent family', () => {
  const light = progress.elements.e3.palettes?.default?.light?.onSubtle?.boxColor;
  expect(light?.primary?.medium?.rest).not.toBe(light?.positive?.medium?.rest);
  expect(light?.warning?.medium?.rest).not.toBe(light?.destructive?.medium?.rest);
  expect(
    progress.elements.e2.palettes?.default?.light?.onVivid?.boxColor?.neutral?.medium?.rest
  ).toBe(c('default', 'l', 'primitive.black.v1', 0, 18));
});

it('raises dark chromatic indicators on subtle surfaces while preserving neutral vivid', () => {
  const dark = progress.elements.e3.palettes?.default?.dark?.onSubtle?.boxColor;

  expect(dark?.primary?.medium?.rest).toBe(c.ref('default', 'd', 'progress.primary', 'vivid', 6));
  expect(dark?.neutral?.medium?.rest).toBe(c.ref('default', 'd', 'progress.neutral', 'vivid'));
});

it('keeps dark indicators at or above the progress contrast floor against the track', () => {
  const track = progress.elements.e2.palettes?.default?.dark?.onSubtle?.boxColor?.neutral?.medium
    ?.rest as string;
  const indicator = progress.elements.e3.palettes?.default?.dark?.onSubtle?.boxColor;

  for (const intent of intents) {
    const ratio = contrast(indicator?.[intent]?.medium?.rest as string, track);
    expect(ratio, intent).toBeGreaterThanOrEqual(3);
  }
});
