import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireBadge() {
  const badge = schema.components.badge;
  if (!badge) throw new Error('Fluent Badge schema is missing');
  return badge;
}

describe('Fluent 2 Badge', () => {
  it('publishes the six passive metadata intents through global semantics', () => {
    expect(schema.colors?.globalSemantics?.light?.purpleLike).toEqual({
      v1: 'primitive.purple.v1'
    });
    expect(schema.colors?.componentIntents?.badge).toEqual({
      neutral: 'neutral',
      primary: 'primary',
      novelty: 'purpleLike',
      positive: 'greenLike',
      warning: 'yellowLike',
      attention: 'redLike'
    });
  });

  it('publishes distinct text, Mark, Dot, and separation-ring owners', () => {
    const badge = requireBadge();
    expect(
      Object.fromEntries(Object.entries(badge.elements).map(([key, value]) => [key, value?.name]))
    ).toEqual({
      e1: 'badge-surface',
      e2: 'badge-content',
      e3: 'badge-full-bleed-mark',
      e4: 'badge-contained-mark-icon',
      e5: 'badge-dot-surface',
      e6: 'badge-separation-ring'
    });
    expect(badge.elements.e6?.scales.borderWidth).toEqual({
      's:sm:3': 1,
      's:sm:2': 1,
      's:sm:1': 1,
      's:md:1': 2,
      's:lg:1': 2,
      's:lg:2': 2
    });
    expect(badge.elements.e6?.scales.borderRadius).toEqual({
      square: 0,
      rounded: 4,
      pill: 999
    });
  });

  it('maps six full-bleed and contained icon viewports to global profiles', () => {
    const badge = requireBadge();
    expect(schema.global?.iconSizes?.['s:sm:5']).toBe(6);
    expect(badge.elements.e3.iconSize).toEqual({
      's:sm:3': 's:sm:5',
      's:sm:2': 's:sm:3',
      's:sm:1': 's:sm:1',
      's:md:1': 's:md:1',
      's:lg:1': 's:lg:1',
      's:lg:2': 's:lg:3'
    });
    expect(badge.elements.e4.iconSize).toEqual({
      's:sm:3': 's:sm:5',
      's:sm:2': 's:sm:4',
      's:sm:1': 's:sm:2',
      's:md:1': 's:sm:1',
      's:lg:1': 's:md:1',
      's:lg:2': 's:lg:1'
    });
  });

  it('maps all text scales to legibility-adapted Caption Strong profiles and nominal heights', () => {
    const badge = requireBadge();
    expect(badge.elements.e1.scales.boxHeight).toEqual({
      's:sm:3': 8,
      's:sm:2': 12,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 32
    });
    expect(badge.elements.e1.scales).not.toHaveProperty('boxWidth');
    expect(badge.elements.e1.scales.paddingTop).toEqual({
      's:sm:3': 0,
      's:sm:2': 0,
      's:sm:1': 0,
      's:md:1': 1,
      's:lg:1': 2,
      's:lg:2': 4
    });
    expect(badge.elements.e1.scales.paddingLeft).toEqual({
      's:sm:3': 2,
      's:sm:2': 3,
      's:sm:1': 4,
      's:md:1': 5,
      's:lg:1': 7,
      's:lg:2': 10
    });
    expect(badge.elements.e1.scales.paddingRight).toEqual(badge.elements.e1.scales.paddingLeft);
    expect(badge.elements.e2.typography).toEqual({
      's:sm:3': 'caption-tiny-strong',
      's:sm:2': 'caption-extra-small-strong',
      's:sm:1': 'caption-small-strong',
      's:md:1': 'caption-medium-strong',
      's:lg:1': 'caption-medium-strong',
      's:lg:2': 'caption-medium-strong'
    });
    expect(badge.elements.e5.scales.boxHeight).toEqual({
      's:sm:3': 6,
      's:sm:2': 10,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 32
    });
    expect(badge.elements.e5.scales.boxWidth).toEqual(badge.elements.e5.scales.boxHeight);
  });

  it('publishes the smallest global outer shadow as an opt-in Rest recipe', () => {
    const badge = requireBadge();
    expect(badge.effects?.shadow).toEqual({
      e1: { kind: 'outer', states: { rest: 's:sm:1' } },
      e3: { kind: 'outer', states: { rest: 's:sm:1' } },
      e5: { kind: 'outer', states: { rest: 's:sm:1' } }
    });
    expect(schema.global?.effects?.shadow?.outer?.levels['s:sm:1']).toBeDefined();
    expect(badge.effects?.shadow).not.toHaveProperty('e2');
    expect(badge.effects?.shadow).not.toHaveProperty('e4');
    expect(badge.effects?.shadow).not.toHaveProperty('e6');
  });

  it('fits text metrics, vertical padding, and borders inside every nominal height', () => {
    const badge = requireBadge();
    const heights = badge.elements.e1.scales.boxHeight as Record<string, number>;
    const paddingTop = badge.elements.e1.scales.paddingTop as Record<string, number>;
    const paddingBottom = badge.elements.e1.scales.paddingBottom as Record<string, number>;
    const borderWidths = badge.elements.e1.scales.borderWidth as Record<string, number>;
    const typography = badge.elements.e2.typography as Record<string, string>;
    const profiles = schema.global?.typography?.profiles ?? {};

    for (const [scale, height] of Object.entries(heights)) {
      const profile = profiles[typography[scale]];
      expect(profile).toBeDefined();
      expect(
        (profile?.scales.textHeight ?? 0) +
          paddingTop[scale] +
          paddingBottom[scale] +
          borderWidths[scale] * 2
      ).toBeLessThanOrEqual(height);
    }
  });

  it('uses absolute white for low surfaces and the optional separation ring', () => {
    const badge = requireBadge();
    expect(badge.elements.e1.palettes.default?.light?.onSubtle.boxColor?.attention?.low?.rest).toBe(
      '#ffffff'
    );
    expect(
      badge.elements.e1.palettes.default?.light?.onSubtle.boxColor?.attention?.lowest?.rest
    ).toBe('#ffffff00');
    expect(
      badge.elements.e6?.palettes.default?.dark?.onSubtle.borderColor?.attention?.high?.rest
    ).toBe('#ffffff');
  });

  it('keeps tinted and ghost content legible on dark surfaces', () => {
    const badge = requireBadge();
    expect(
      badge.elements.e2.palettes.default?.dark?.onSubtle.textColor?.novelty?.medium?.rest
    ).toBe('#eb94dd');
    expect(
      badge.elements.e2.palettes.default?.dark?.onSubtle.textColor?.novelty?.lowest?.rest
    ).toBe('#eb94dd');
    expect(badge.elements.e2.palettes.default?.dark?.onSubtle.textColor?.novelty?.low?.rest).toBe(
      '#942e88'
    );
  });

  it('resolves each high emphasis from its functional vivid reference', () => {
    const badge = requireBadge();
    const light = badge.elements.e1.palettes.default?.light?.onSubtle.boxColor;
    const dark = badge.elements.e1.palettes.default?.dark?.onSubtle.boxColor;

    expect(light?.neutral?.high?.rest).toBe('#21242d');
    expect(light?.primary?.high?.rest).toBe('#0064b4');
    expect(light?.novelty?.high?.rest).toBe('#c239b3');
    expect(light?.positive?.high?.rest).toBe('#107c10');
    expect(light?.attention?.high?.rest).toBe('#c50f1f');
    expect(light?.warning?.high?.rest).toBe('#f7630c');
    expect(dark?.warning?.high?.rest).toBe('#e68962');
    expect(badge.elements.e2.palettes.default?.light?.onSubtle.textColor?.warning?.high?.rest).toBe(
      '#000000'
    );
  });
});
