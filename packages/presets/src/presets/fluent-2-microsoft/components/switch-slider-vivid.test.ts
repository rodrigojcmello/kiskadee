import { expect, it } from 'vitest';
import { createStrictPresetColorResolver } from '../../../utils/presetColor.ts';
import { referenceColor } from '../fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from '../fluent-2-microsoft.color-evidence.ts';
import { schemaColors } from '../fluent-2-microsoft.colors.ts';
import { schema } from '../fluent-2-microsoft.schema.ts';

const c = createStrictPresetColorResolver({
  colors: schemaColors,
  exactEvidence: fluent2MicrosoftColorEvidence
});

function resolved(value: unknown): unknown {
  return value && typeof value === 'object' && 'ref' in value ? value.ref : value;
}

it('makes Switch Neutral the default Windows-inspired vivid treatment while keeping subtle intents equal', () => {
  const elements = schema.components.switch!.variants!.standard!.modes!.base!.elements;
  for (const segment of ['default', 'teams'] as const) {
    for (const theme of ['light', 'dark', 'darker'] as const) {
      const track = elements.e2!.palettes![segment]![theme]!;
      const thumb = elements.e3!.palettes![segment]![theme]!;
      expect(Object.keys(track.onVivid!.boxColor!)).toEqual(['neutral', 'primary', 'polarity']);
      expect(track.onSubtle.boxColor!.neutral).toEqual(track.onSubtle.boxColor!.primary);
      expect(thumb.onSubtle.boxColor!.neutral).toEqual(thumb.onSubtle.boxColor!.primary);
      expect(track.onVivid!.boxColor!.neutral!.medium!.selected!.rest).not.toEqual(
        track.onVivid!.boxColor!.primary!.medium!.selected!.rest
      );
    }
  }
});

it('publishes both Slider intents on vivid using the Switch selected-color relationship', () => {
  const switchTrack = schema.components.switch!.variants!.standard!.modes!.base!.elements.e2!;
  const sliderElements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  for (const segment of ['default', 'teams'] as const) {
    const selected = switchTrack.palettes![segment]!.light!.onVivid!.boxColor!;
    const active = sliderElements.e9!.palettes![segment]!.light!.onVivid!.boxColor!;
    const thumbInner = sliderElements.e11!.palettes![segment]!.light!.onVivid!.boxColor!;
    const thumbOuter = sliderElements.e10!.palettes![segment]!.light!.onVivid!;
    const thumbIcon = sliderElements.e19!.palettes![segment]!.light!.onVivid!.textColor!;
    const tooltip = sliderElements.e14!.palettes![segment]!.light!;
    const subtleForeground =
      sliderElements.e2!.palettes![segment]!.light!.onSubtle.textColor!.neutral!.medium!.rest;
    expect(active.neutral!.medium!.rest).toBe(resolved(selected.neutral!.medium!.selected?.rest));
    expect(active.primary!.medium!.rest).toBe(resolved(selected.primary!.medium!.selected?.rest));
    expect(thumbInner.neutral!.medium!.rest).toBe(active.neutral!.medium!.rest);
    expect(thumbInner.primary!.medium!.rest).toBe(
      schema.components.container!.elements.e1!.palettes![segment]!.light!.onVivid!.boxColor!
        .primary!.highest!.rest
    );
    expect(thumbOuter.boxColor!.neutral!.medium!.rest).toBe(subtleForeground);
    expect(thumbOuter.borderColor!.neutral!.medium!.rest).toBe(subtleForeground);
    expect(thumbIcon.neutral!.medium!.rest).toBe('#000000');
    expect(thumbIcon.primary!.medium!.rest).toBe('#ffffff');
    expect(tooltip.onSubtle.boxColor!.neutral!.medium!.rest).toBe(subtleForeground);
    expect(tooltip.onSubtle.boxColor!.primary!.medium!.rest).toBe(subtleForeground);
    expect(tooltip.onVivid!.boxColor!.neutral!.medium!.rest).toBe(active.primary!.medium!.rest);
    expect(tooltip.onVivid!.boxColor!.primary!.medium!.rest).toBe(active.primary!.medium!.rest);
    expect(tooltip.onVivid!.textColor!.neutral!.medium!.rest).toBe(subtleForeground);
    expect(tooltip.onVivid!.textColor!.primary!.medium!.rest).toBe(subtleForeground);
    for (const [slot, element] of Object.entries(sliderElements)) {
      if (!element || !('palettes' in element) || !element.palettes?.[segment]?.light?.onSubtle)
        continue;
      const subtle = element.palettes[segment]!.light!.onSubtle;
      for (const [channelName, channel] of Object.entries(subtle)) {
        if (
          channel &&
          typeof channel === 'object' &&
          'neutral' in channel &&
          'primary' in channel &&
          !(slot === 'e10' && (channelName === 'boxColor' || channelName === 'borderColor')) &&
          !(slot === 'e11' && channelName === 'boxColor') &&
          !(slot === 'e19' && channelName === 'textColor')
        ) {
          expect(channel.neutral).toEqual(channel.primary);
        }
      }
      expect(element.palettes[segment]!.light!.onVivid).toBeDefined();
    }
  }
});

it('uses the complementary vivid anchor and shared state deltas only for the Neutral vivid accent', () => {
  const switchElements = schema.components.switch!.variants!.standard!.modes!.base!.elements;
  const sliderElements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  for (const segment of ['default', 'teams'] as const) {
    const expectedRest = segment === 'default' ? '#40befe' : '#b5a2f4';
    const rest = c.resolve(segment, 'l', referenceColor('primary.v2', 'vivid'));
    expect(rest).toBe(expectedRest);
    expect(rest).not.toBe(c.resolve(segment, 'l', referenceColor('primary', 'vivid')));
    for (const [state, offset] of [
      ['rest', 0],
      ['hover', 1],
      ['pressed', 2]
    ] as const) {
      const expected = c.resolve(segment, 'l', referenceColor('primary.v2', 'vivid', offset));
      for (const theme of ['light', 'dark', 'darker'] as const) {
        const track = switchElements.e2!.palettes![segment]![theme]!.onVivid!.boxColor!;
        expect(resolved(track.neutral!.medium!.selected![state])).toBe(expected);
        expect(resolved(track.primary!.medium!.selected![state])).toBe('#ffffff');
      }
      for (const slot of ['e9', 'e11'] as const) {
        const channel = sliderElements[slot]!.palettes![segment]!.light!.onVivid!.boxColor!;
        expect(resolved(channel.neutral!.medium![state])).toBe(expected);
      }
    }
    for (const theme of ['light', 'dark', 'darker'] as const) {
      const track = switchElements.e2!.palettes![segment]![theme]!.onVivid!.boxColor!;
      const thumb = switchElements.e3!.palettes![segment]![theme]!.onVivid!.boxColor!;
      expect(track.neutral!.medium!.rest).toBe('#ffffff00');
      expect(resolved(track.neutral!.medium!.disabled)).toBe('#ffffff1f');
      expect(resolved(thumb.neutral!.medium!.selected!.rest)).toBe('#000000');
      expect(resolved(thumb.primary!.medium!.selected!.rest)).toBe(
        c.resolve(segment, 'l', referenceColor('primary', 'vivid', 2))
      );
    }
  }
});

it('keeps subtle recipes on the original family and preserves the Slider theme coverage', () => {
  const switchElements = schema.components.switch!.variants!.standard!.modes!.base!.elements;
  const sliderElements = schema.components.slider!.variants!.standard!.modes!.base!.elements;
  for (const segment of ['default', 'teams'] as const) {
    for (const theme of ['light', 'dark', 'darker'] as const) {
      const selected =
        switchElements.e2!.palettes![segment]![theme]!.onSubtle.boxColor!.neutral!.medium!.selected!
          .rest;
      expect(resolved(selected)).toBe(
        c.resolve(
          segment,
          theme === 'light' ? 'l' : 'd',
          referenceColor('primary', 'vivid', theme === 'light' ? 2 : 6)
        )
      );
    }
    for (const slot of ['e9', 'e11'] as const) {
      const element = sliderElements[slot]!;
      const channel = element.palettes![segment]!.light!.onSubtle.boxColor!;
      expect(channel.neutral!.medium!.rest).toBe(
        c.resolve(segment, 'l', referenceColor('slider.primary', 'vivid'))
      );
      expect(element.palettes![segment]!.dark).toBeUndefined();
      expect(element.palettes![segment]!.darker).toBeUndefined();
    }
  }
});
