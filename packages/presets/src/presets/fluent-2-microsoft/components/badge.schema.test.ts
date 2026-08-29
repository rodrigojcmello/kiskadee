import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const BADGE_INTENTS = [
  'neutral',
  'primary',
  'novelty',
  'positive',
  'warning',
  'attention'
] as const;

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  );
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function compositeHex(foreground: string, background: string): string {
  const alpha = foreground.length === 9 ? Number.parseInt(foreground.slice(7, 9), 16) / 255 : 1;
  const channels = [1, 3, 5].map((offset) => {
    const foregroundChannel = Number.parseInt(foreground.slice(offset, offset + 2), 16);
    const backgroundChannel = Number.parseInt(background.slice(offset, offset + 2), 16);
    return Math.round(foregroundChannel * alpha + backgroundChannel * (1 - alpha));
  });

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

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
      's:sm:2': 's:sm:5',
      's:sm:1': 's:sm:3',
      's:md:1': 's:sm:2',
      's:lg:1': 's:sm:1',
      's:lg:2': 's:md:1'
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
    expect(badge.elements.e1.scales).not.toHaveProperty('borderWidth');
    expect(badge.elements.e1.palettes.default?.light?.onSubtle).not.toHaveProperty('borderColor');
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
    expect(badge.elements.e5.scales).not.toHaveProperty('borderWidth');
    expect(badge.elements.e5.palettes.default?.light?.onSubtle).not.toHaveProperty('borderColor');
  });

  it('publishes the smallest global outer shadow only for opt-in Dots', () => {
    const badge = requireBadge();
    expect(badge.effects?.shadow).toEqual({
      e5: { kind: 'outer', states: { rest: 's:sm:1' } }
    });
    expect(schema.global?.effects?.shadow?.outer?.levels['s:sm:1']).toBeDefined();
    expect(badge.effects?.shadow).not.toHaveProperty('e1');
    expect(badge.effects?.shadow).not.toHaveProperty('e2');
    expect(badge.effects?.shadow).not.toHaveProperty('e3');
    expect(badge.effects?.shadow).not.toHaveProperty('e4');
    expect(badge.effects?.shadow).not.toHaveProperty('e6');
  });

  it('fits text metrics, vertical padding, and borders inside every nominal height', () => {
    const badge = requireBadge();
    const heights = badge.elements.e1.scales.boxHeight as Record<string, number>;
    const paddingTop = badge.elements.e1.scales.paddingTop as Record<string, number>;
    const paddingBottom = badge.elements.e1.scales.paddingBottom as Record<string, number>;
    const borderWidths = (badge.elements.e1.scales.borderWidth ?? {}) as Record<string, number>;
    const typography = badge.elements.e2.typography as Record<string, string>;
    const profiles = schema.global?.typography?.profiles ?? {};

    for (const [scale, height] of Object.entries(heights)) {
      const profile = profiles[typography[scale]];
      expect(profile).toBeDefined();
      expect(
        (profile?.scales.textHeight ?? 0) +
          paddingTop[scale] +
          paddingBottom[scale] +
          (borderWidths[scale] ?? 0) * 2
      ).toBeLessThanOrEqual(height);
    }
  });

  it('uses a shared transparent-black surface for every onSubtle Low intent', () => {
    const badge = requireBadge();

    for (const theme of ['light', 'dark', 'darker'] as const) {
      const textSurface = badge.elements.e1.palettes.default?.[theme]?.onSubtle;
      const dotSurface = badge.elements.e5.palettes.default?.[theme]?.onSubtle;
      const neutralMedium = textSurface?.boxColor?.neutral?.medium?.rest;

      expect(neutralMedium).toBeDefined();
      expect(textSurface).not.toHaveProperty('borderColor');
      expect(dotSurface).not.toHaveProperty('borderColor');

      const expectedLow = '#00000014';

      for (const intent of BADGE_INTENTS) {
        expect(textSurface?.boxColor?.[intent]?.low?.rest).toBe(expectedLow);
        expect(dotSurface?.boxColor?.[intent]?.low?.rest).toBe(expectedLow);
        expect(textSurface?.boxColor?.[intent]?.low?.rest).not.toBe(neutralMedium);
      }
    }
  });

  it('authors a contrast-safe intent hierarchy on the canonical vivid surface', () => {
    const badge = requireBadge();
    const expected = {
      neutral: {
        high: { text: '#c6cbd7', indicator: '#bec2ce' },
        medium: '#e4e9f5',
        low: '#0000001f',
        foreground: { high: '#434650', medium: '#434650', low: '#e0e5f1' }
      },
      primary: {
        high: { text: '#a4cfff', indicator: '#94c7ff' },
        medium: '#daebff',
        low: '#0000001f',
        foreground: { high: '#0d477e', medium: '#0d477e', low: '#d3e7ff' }
      },
      novelty: {
        high: { text: '#faaded', indicator: '#fe99ee' },
        medium: '#f9e0f4',
        low: '#0000001f',
        foreground: { high: '#6b2762', medium: '#6b2762', low: '#f8daf2' }
      },
      positive: {
        high: { text: '#a1dd9c', indicator: '#91d78c' },
        medium: '#dbf0d9',
        low: '#0000001f',
        foreground: { high: '#155513', medium: '#155513', low: '#d4edd2' }
      },
      warning: {
        high: { text: '#ffb89b', indicator: '#ffaa89' },
        medium: '#ffe2d7',
        low: '#0000001f',
        foreground: { high: '#6f3217', medium: '#6f3217', low: '#ffdccf' }
      },
      attention: {
        high: { text: '#ffb5ad', indicator: '#ffa89f' },
        medium: '#ffe1de',
        low: '#0000001f',
        foreground: { high: '#811819', medium: '#811819', low: '#ffdbd7' }
      }
    } as const;

    for (const theme of ['light', 'dark', 'darker'] as const) {
      const textSurface = badge.elements.e1.palettes.default?.[theme]?.onVivid;
      const dotSurface = badge.elements.e5.palettes.default?.[theme]?.onVivid;
      const textContent = badge.elements.e2.palettes.default?.[theme]?.onVivid;
      const markContent = badge.elements.e4.palettes.default?.[theme]?.onVivid;
      const canonicalSurface =
        schema.components.card?.elements.e1.palettes.default?.[theme]?.onSubtle.boxColor?.primary
          ?.highest?.rest;

      expect(canonicalSurface).toBeDefined();

      for (const intent of BADGE_INTENTS) {
        for (const emphasis of ['high', 'medium', 'low'] as const) {
          const surface =
            emphasis === 'high' ? expected[intent].high.text : expected[intent][emphasis];
          const indicatorSurface =
            emphasis === 'high' ? expected[intent].high.indicator : expected[intent][emphasis];
          const foreground = expected[intent].foreground[emphasis];
          const renderedSurface =
            surface.length === 9 ? compositeHex(surface, canonicalSurface!) : surface;
          const renderedIndicatorSurface =
            indicatorSurface.length === 9
              ? compositeHex(indicatorSurface, canonicalSurface!)
              : indicatorSurface;

          expect(textSurface?.boxColor?.[intent]?.[emphasis]?.rest).toBe(surface);
          expect(dotSurface?.boxColor?.[intent]?.[emphasis]?.rest).toBe(indicatorSurface);
          expect(textContent?.textColor?.[intent]?.[emphasis]?.rest).toBe(foreground);
          expect(markContent?.textColor?.[intent]?.[emphasis]?.rest).toBe(foreground);
          if (emphasis !== 'low') {
            expect(contrastRatio(renderedSurface, canonicalSurface!)).toBeGreaterThanOrEqual(3);
            expect(
              contrastRatio(renderedIndicatorSurface, canonicalSurface!)
            ).toBeGreaterThanOrEqual(3);
          }
          expect(contrastRatio(foreground, renderedSurface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(foreground, renderedIndicatorSurface)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('keeps the separation backing and external ring absolute white', () => {
    const badge = requireBadge();
    expect(
      badge.elements.e6?.palettes.default?.dark?.onSubtle.borderColor?.attention?.high?.rest
    ).toBe('#ffffff');
    expect(
      badge.elements.e6?.palettes.default?.dark?.onSubtle.boxColor?.attention?.high?.rest
    ).toBe('#ffffff');
  });

  it('derives onSubtle Low foregrounds from vivid intent colors with compact-text contrast', () => {
    const badge = requireBadge();
    const expected = {
      light: {
        neutral: '#21242d',
        primary: '#0064b4',
        novelty: '#a82d9a',
        positive: '#09760a',
        warning: '#ae450c',
        attention: '#c50f1f'
      },
      dark: {
        neutral: '#d2d6e3',
        primary: '#79b9ff',
        novelty: '#eb94dd',
        positive: '#7ec879',
        warning: '#f49d79',
        attention: '#ff958b'
      },
      darker: {
        neutral: '#d2d6e3',
        primary: '#79b9ff',
        novelty: '#eb94dd',
        positive: '#7ec879',
        warning: '#f49d79',
        attention: '#ff958b'
      }
    } as const;

    for (const theme of ['light', 'dark', 'darker'] as const) {
      const surface = badge.elements.e1.palettes.default?.[theme]?.onSubtle;
      const content = badge.elements.e2.palettes.default?.[theme]?.onSubtle;
      const canonicalSurface =
        schema.components.card?.elements.e1.palettes.default?.[theme]?.onSubtle.boxColor?.neutral
          ?.low?.rest;

      expect(canonicalSurface).toBeDefined();

      for (const intent of BADGE_INTENTS) {
        const background = surface?.boxColor?.[intent]?.low?.rest;
        const foreground = content?.textColor?.[intent]?.low?.rest;

        expect(foreground).toBe(expected[theme][intent]);
        expect(background).toBeDefined();
        expect(
          contrastRatio(foreground!, compositeHex(background!, canonicalSurface!))
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('does not author Lowest while preserving the Core emphasis vocabulary', () => {
    const badge = requireBadge();

    expect(JSON.stringify(badge.elements)).not.toContain('"lowest"');
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
