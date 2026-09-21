import { type ComponentEmphasis, resolveContourReference } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import blue from '../colors/b.blue.v1.ts';
import black from '../colors/n.black.v1.ts';
import purple from '../colors/pb.indigo.v2.ts';
import { schema } from '../fluent-2-microsoft.schema.ts';

const card = schema.components.card!;

describe('Fluent achromatic surfaces', () => {
  it('publishes the Light hierarchy consistently in both identities and surface contexts', () => {
    for (const segment of ['default', 'teams'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const palette = card.elements.e1?.palettes?.[segment]?.light?.[context];
        for (const [key, color] of Object.entries({
          lowest: '#ffffff',
          low: '#fbfbfb',
          medium: '#f2f2f2',
          high: '#e9e9e9'
        })) {
          const emphasis = key as ComponentEmphasis;
          expect(palette?.boxColor?.neutral?.[emphasis]?.rest).toBe(color);
          expect(
            card.contentSurfaceContext?.[segment]?.light?.[context]?.neutral?.[emphasis]?.rest
          ).toBe('onSubtle');
          const border = palette?.borderColor?.neutral?.[emphasis]?.rest;
          expect(resolveContourReference(border as string, segment, schema.global?.contours)).toBe(
            context === 'onSubtle' ? '#00000018' : '#ffffff26'
          );
        }
        expect(palette?.boxColor?.neutral?.highest).toBeUndefined();
      }
      expect(card.options?.canonicalSurfaces?.[segment]?.light).toContainEqual({
        intent: 'neutral',
        emphasis: 'high',
        contentSurfaceContext: 'onSubtle'
      });
    }
  });

  it('adds Primary Low and High only to Light using each segment primary scale', () => {
    for (const segment of ['default', 'teams'] as const) {
      const primary = segment === 'default' ? blue : purple;
      expect(
        card.elements.e1?.palettes?.[segment]?.light?.onSubtle?.boxColor?.primary?.medium?.rest
      ).toBe(primary.scales.light[3]);
      expect(
        card.elements.e1?.palettes?.[segment]?.light?.onVivid?.boxColor?.primary?.medium?.rest
      ).toBe(primary.scales.light[9]);
      for (const context of ['onSubtle', 'onVivid'] as const) {
        for (const [emphasis, tone] of [
          ['low', 1],
          ['high', 5]
        ] as const) {
          expect(
            card.elements.e1?.palettes?.[segment]?.light?.[context]?.boxColor?.primary?.[emphasis]
              ?.rest
          ).toBe(primary.scales.light[tone]);
          expect(
            card.contentSurfaceContext?.[segment]?.light?.[context]?.primary?.[emphasis]?.rest
          ).toBe('onSubtle');
          expect(card.options?.canonicalSurfaces?.[segment]?.light).toContainEqual({
            intent: 'primary',
            emphasis,
            contentSurfaceContext: 'onSubtle'
          });
          for (const theme of ['dark', 'darker'] as const) {
            expect(
              card.elements.e1?.palettes?.[segment]?.[theme]?.[context]?.boxColor?.primary?.[
                emphasis
              ]
            ).toBeUndefined();
          }
        }
      }
    }
  });

  it('keeps dark surface positions and border opacity instead of applying the Light hierarchy', () => {
    for (const segment of ['default', 'teams'] as const)
      for (const context of ['onSubtle', 'onVivid'] as const)
        for (const theme of ['dark', 'darker'] as const) {
          const palette = card.elements.e1?.palettes?.[segment]?.[theme]?.[context];
          const tones = theme === 'dark' ? ([9, 6, 3] as const) : ([3, 2, 1] as const);
          for (const [i, emphasis] of (['lowest', 'low', 'medium'] as const).entries()) {
            expect(palette?.boxColor?.neutral?.[emphasis]?.rest).toBe(black.scales.dark[tones[i]!]);
          }
          expect(palette?.boxColor?.neutral?.high).toBeUndefined();
          const border = palette?.borderColor?.neutral?.lowest?.rest as string;
          expect(
            theme === 'dark'
              ? resolveContourReference(border, segment, schema.global?.contours)
              : border
          ).toBe(theme === 'dark' ? '#ffffff26' : '#ffffff1a');
        }
  });

  it('publishes three distinct Light Separator levels using the shared contour catalog', () => {
    for (const segment of ['default', 'teams'] as const) {
      const levels =
        schema.global?.separators?.profiles.subtle.palettes?.[segment]?.light?.onSubtle?.boxColor
          ?.neutral;
      for (const [key, color] of Object.entries({
        lowest: '#0000000d',
        low: '#00000018',
        medium: '#0000002e'
      })) {
        const emphasis = key as ComponentEmphasis;
        expect(
          resolveContourReference(
            levels?.[emphasis]?.rest as string,
            segment,
            schema.global?.contours
          )
        ).toBe(color);
      }
    }
  });
});
