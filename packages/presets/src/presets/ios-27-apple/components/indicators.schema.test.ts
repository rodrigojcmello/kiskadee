import { validateBadgeComponentContract, validateProgressComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createPresetColorGetter } from '../../../utils/presetColor.ts';
import { schemaColors } from '../ios-27-apple.colors.ts';
import { schema } from '../ios-27-apple.schema.ts';
import { createIos27AppleBadgeSchema } from './badge.schema.ts';
import { createIos27AppleProgressSchema } from './progress.schema.ts';

const themes = ['light', 'dark', 'darker'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const badgeIntents = ['neutral', 'primary', 'novelty', 'positive', 'warning', 'attention'] as const;
const progressIntents = ['neutral', 'primary', 'positive', 'warning', 'destructive'] as const;

const colors = schemaColors;
const c = createPresetColorGetter<'default'>({ colors });
const badge = schema.components.badge as ReturnType<typeof createIos27AppleBadgeSchema>;
const progress = schema.components.progress as ReturnType<typeof createIos27AppleProgressSchema>;

function hex(value: unknown): string {
  if (typeof value !== 'string' || !/^#[a-f\d]{6}(?:[a-f\d]{2})?$/i.test(value)) {
    throw new Error(`Expected resolved solid color, received ${String(value)}`);
  }
  return value;
}

function luminance(color: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function composite(color: string, background: string): string {
  const alpha = color.length === 9 ? Number.parseInt(color.slice(7), 16) / 255 : 1;
  return `#${[1, 3, 5]
    .map((offset) => {
      const foreground = Number.parseInt(color.slice(offset, offset + 2), 16);
      const backdrop = Number.parseInt(background.slice(offset, offset + 2), 16);
      return Math.round(foreground * alpha + backdrop * (1 - alpha))
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

describe('iOS 27 indicators', () => {
  it('satisfies the existing Core contracts without adding interaction states', () => {
    expect(validateBadgeComponentContract(badge)).toEqual([]);
    expect(validateProgressComponentContract(progress)).toEqual([]);
    for (const theme of themes) {
      for (const context of contexts) {
        for (const intent of badgeIntents) {
          for (const emphasis of ['high', 'medium', 'low'] as const) {
            expect(
              Object.keys(
                badge.elements.e1.palettes.default?.[theme]?.[context]?.boxColor?.[intent]?.[
                  emphasis
                ] ?? {}
              )
            ).toEqual(['rest']);
          }
        }
        expect(
          Object.keys(progress.elements.e2.palettes.default?.[theme]?.[context]?.boxColor ?? {})
        ).toEqual(['neutral']);
        expect(
          Object.keys(progress.elements.e3.palettes.default?.[theme]?.[context]?.boxColor ?? {})
        ).toEqual(progressIntents);
      }
    }
  });

  it('preserves the source attention badge and resolves Light and Dark independently', () => {
    for (const context of contexts) {
      expect(
        badge.elements.e1.palettes.default?.light?.[context]?.boxColor?.attention?.high?.rest
      ).toBe('#ff383c');
      expect(
        badge.elements.e1.palettes.default?.dark?.[context]?.boxColor?.attention?.high?.rest
      ).toBe('#e85752');
      for (const theme of themes) {
        expect(
          badge.elements.e2.palettes.default?.[theme]?.[context]?.textColor?.attention?.high?.rest
        ).toBe('#ffffff');
      }
    }
    expect(badge.elements.e1.palettes.default?.darker).toEqual(
      badge.elements.e1.palettes.default?.dark
    );
  });

  it('keeps adapted badge text legible on neutral and vivid canonical backgrounds', () => {
    for (const theme of themes) {
      for (const context of contexts) {
        const background =
          context === 'onVivid'
            ? c.ref('default', 'l', 'primary', 'vivid', 4)
            : theme === 'light'
              ? c('default', 'l', 'neutral', 3)
              : c('default', 'd', 'neutral', 10);
        for (const intent of badgeIntents) {
          for (const emphasis of ['medium', 'low'] as const) {
            const surface = hex(
              badge.elements.e1.palettes.default?.[theme]?.[context]?.boxColor?.[intent]?.[emphasis]
                ?.rest
            );
            const foreground = hex(
              badge.elements.e2.palettes.default?.[theme]?.[context]?.textColor?.[intent]?.[
                emphasis
              ]?.rest
            );
            expect(
              contrast(foreground, composite(surface, background)),
              `${theme}/${context}/${intent}/${emphasis}`
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it('uses the approved Fills/Primary de-para for the progress track', () => {
    expect(
      progress.elements.e2.palettes.default?.light?.onSubtle.boxColor.neutral.medium.rest
    ).toBe('#7b7b7e33');
    expect(progress.elements.e2.palettes.default?.dark?.onSubtle.boxColor.neutral.medium.rest).toBe(
      '#7a7a7c5c'
    );
    expect(progress.elements.e2.palettes.default?.darker).toEqual(
      progress.elements.e2.palettes.default?.dark
    );
    expect(
      progress.elements.e3.palettes.default?.light?.onSubtle.boxColor.primary.medium.rest
    ).toBe('#0088ff');
    expect(progress.elements.e3.palettes.default?.dark?.onSubtle.boxColor.primary.medium.rest).toBe(
      '#2e92ff'
    );
  });

  it('keeps every progress indicator distinct from its composed track', () => {
    for (const theme of themes) {
      for (const context of contexts) {
        const background =
          context === 'onVivid'
            ? c.ref('default', 'l', 'primary', 'vivid', 4)
            : theme === 'light'
              ? c('default', 'l', 'neutral', 0)
              : c('default', 'd', 'neutral', 5);
        const track = hex(
          progress.elements.e2.palettes.default?.[theme]?.[context]?.boxColor.neutral.medium.rest
        );
        for (const intent of progressIntents) {
          const indicator = hex(
            progress.elements.e3.palettes.default?.[theme]?.[context]?.boxColor[intent].medium.rest
          );
          expect(
            contrast(indicator, composite(track, background)),
            `${theme}/${context}/${intent}`
          ).toBeGreaterThan(1.5);
        }
      }
    }
  });

  it('remaps component roles through their participating tonal families', () => {
    const remapped = createPresetColorGetter<'default'>({
      colors: {
        ...colors,
        componentIntents: {
          ...colors.componentIntents,
          badge: { ...colors.componentIntents.badge, primary: 'greenLike' },
          progress: { ...colors.componentIntents.progress, primary: 'redLike' }
        }
      }
    });
    const remappedBadge = createIos27AppleBadgeSchema({ c: remapped });
    const remappedProgress = createIos27AppleProgressSchema({ c: remapped });
    expect(
      remappedBadge.elements.e1.palettes.default?.light?.onSubtle.boxColor?.primary?.high?.rest
    ).toBe('#34c759');
    expect(
      remappedProgress.elements.e3.palettes.default?.light?.onSubtle.boxColor.primary.medium.rest
    ).toBe('#ff383c');
    expect(
      remappedProgress.elements.e3.palettes.default?.dark?.onSubtle.boxColor.primary.medium.rest
    ).toBe(remapped.ref('default', 'd', 'redLike', 'vivid', 1));
  });
});
