import { type ComponentEmphasis, resolveContourReference } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import blue from '../colors/b.blue.v1.ts';
import black from '../colors/n.black.v1.ts';
import purple from '../colors/pb.indigo.v2.ts';
import { schema } from '../fluent-2-microsoft.schema.ts';

const card = schema.components.card!;
const container = schema.components.container!;

describe('Fluent achromatic surfaces', () => {
  it('publishes the calibrated vivid surfaces in both segments and ambient contexts', () => {
    for (const segment of ['default', 'teams'] as const) {
      const primary = segment === 'default' ? blue : purple;
      for (const [theme, main, companion] of [
        ['light', primary.scales.light[55], primary.scales.light[60]],
        ['dark', primary.scales.light[60], primary.scales.light[65]],
        ['darker', primary.scales.dark[18], primary.scales.dark[14]]
      ] as const)
        for (const context of ['onSubtle', 'onVivid'] as const) {
          const surface = container.elements.e1.palettes![segment]![theme]![context]!.standard;
          expect(surface.boxColor.primary!.highest!.rest).toBe(main);
          expect(surface.boxColor.primaryComplementary!.highest!.rest).toBe(companion);
          expect(
            container.contentSurfaceContext![segment]![theme]![context]!.standard.primary!.highest!
              .rest
          ).toBe('onVivid');
          expect(
            container.contentSurfaceContext![segment]![theme]![context]!.standard
              .primaryComplementary!.highest!.rest
          ).toBe('onVivid');
          const feedback =
            card.elements.e1!.palettes![segment]![theme]![context]!.standard.boxColor!.primary!
              .highest!;
          expect(feedback.hover).not.toBe(main);
          expect(feedback.pressed).not.toBe(main);
          expect(feedback.selected?.rest).not.toBe(main);
        }
    }
  });
  it('publishes complementary Rest surfaces and their descendant contexts in both consumed contexts', () => {
    for (const segment of ['default', 'teams'] as const) {
      const primary = segment === 'default' ? blue : purple;
      for (const [theme, neutralLow, neutralMedium, primaryHighest] of [
        ['light', black.scales.light[3], black.scales.light[4], primary.scales.light[60]],
        ['dark', black.scales.dark[5], black.scales.dark[2], primary.scales.light[65]],
        ['darker', black.scales.dark[1], black.scales.dark[0], primary.scales.dark[14]]
      ] as const)
        for (const context of ['onSubtle', 'onVivid'] as const) {
          const colors =
            container.elements.e1.palettes?.[segment]?.[theme]?.[context]?.standard?.boxColor;
          expect(colors?.neutralComplementary).toEqual({
            low: { rest: neutralLow },
            medium: { rest: neutralMedium }
          });
          expect(colors?.primaryComplementary).toEqual({
            ...(theme === 'light' ? { low: { rest: primary.scales.light[3] } } : {}),
            medium: {
              rest:
                theme === 'light'
                  ? primary.scales.light[context === 'onVivid' ? 10 : 4]
                  : primary.scales.dark[theme === 'dark' ? 9 : 4]
            },
            highest: { rest: primaryHighest }
          });
          expect(
            container.contentSurfaceContext?.[segment]?.[theme]?.[context]?.standard
              ?.neutralComplementary
          ).toEqual({
            low: { rest: 'onSubtle' },
            medium: { rest: 'onSubtle' }
          });
          expect(
            container.contentSurfaceContext?.[segment]?.[theme]?.[context]?.standard
              ?.primaryComplementary
          ).toEqual({
            ...(theme === 'light' ? { low: { rest: 'onSubtle' } } : {}),
            medium: { rest: 'onSubtle' },
            highest: { rest: 'onVivid' }
          });
          expect(
            card.elements.e1?.palettes?.[segment]?.[theme]?.[context]?.standard?.boxColor
              ?.neutralComplementary
          ).toBeUndefined();
        }
    }
  });

  it('publishes the vivid companion as a Container canvas in every theme and segment', () => {
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const)
        expect(container.options?.canonicalSurfaces?.[segment]?.[theme]).toContainEqual({
          intent: 'primaryComplementary',
          emphasis: 'highest',
          contentSurfaceContext: 'onVivid'
        });
  });

  it('publishes the Light hierarchy consistently in both identities and surface contexts', () => {
    for (const segment of ['default', 'teams'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        const palette = card.elements.e1?.palettes?.[segment]?.light?.[context]?.standard;
        const surfaces = container.elements.e1.palettes?.[segment]?.light?.[context]?.standard;
        for (const [key, color] of Object.entries({
          lowest: '#ffffff',
          low: '#fbfbfb',
          medium: '#f2f2f2',
          high: '#e9e9e9'
        })) {
          const emphasis = key as ComponentEmphasis;
          expect(surfaces?.boxColor?.neutral?.[emphasis]?.rest).toBe(color);
          expect(
            container.contentSurfaceContext?.[segment]?.light?.[context]?.standard?.neutral?.[
              emphasis
            ]?.rest
          ).toBe('onSubtle');
          const border = palette?.borderColor?.neutral?.[emphasis]?.rest;
          expect(resolveContourReference(border as string, segment, schema.global?.contours)).toBe(
            context === 'onSubtle' ? '#00000018' : '#ffffff26'
          );
        }
        expect(surfaces?.boxColor?.neutral?.highest).toBeUndefined();
      }
      expect(container.options?.canonicalSurfaces?.[segment]?.light).toContainEqual({
        intent: 'neutral',
        emphasis: 'high',
        contentSurfaceContext: 'onSubtle'
      });
    }
  });

  it('uses a translucent segment-primary Rest contour only for Light onSubtle Cards', () => {
    for (const [segment, expected] of [
      ['default', '#0064b424'],
      ['teams', '#5053b224']
    ] as const) {
      for (const emphasis of ['lowest', 'low', 'medium', 'high'] as const) {
        const border = card.elements.e1?.palettes?.[segment]?.light?.onSubtle?.standard?.borderColor
          ?.primary?.[emphasis]?.rest as string;
        expect(border).toBe('contour:primary.standard.light.onSubtle.low');
        expect(resolveContourReference(border, segment, schema.global?.contours)).toBe(expected);
      }
      expect(
        card.elements.e1?.palettes?.[segment]?.light?.onSubtle?.standard?.borderColor?.primary
          ?.lowest?.hover
      ).not.toBeUndefined();
      expect(
        card.elements.e1?.palettes?.[segment]?.light?.onVivid?.standard?.borderColor?.primary
          ?.lowest?.rest
      ).not.toBe('contour:primary.standard.light.onSubtle.low');
      for (const theme of ['dark', 'darker'] as const)
        expect(
          card.elements.e1?.palettes?.[segment]?.[theme]?.onSubtle?.standard?.borderColor?.primary
            ?.lowest?.rest
        ).toBe(
          segment === 'default'
            ? theme === 'dark'
              ? '#0e467b'
              : '#143a61'
            : theme === 'dark'
              ? '#3b3e81'
              : '#31346d'
        );
    }
  });

  it('adds Primary Low and High only to Light using each segment primary scale', () => {
    for (const segment of ['default', 'teams'] as const) {
      const primary = segment === 'default' ? blue : purple;
      expect(
        container.elements.e1.palettes?.[segment]?.light?.onSubtle?.standard?.boxColor?.primary
          ?.medium?.rest
      ).toBe(primary.scales.light[3]);
      expect(
        container.elements.e1.palettes?.[segment]?.light?.onVivid?.standard?.boxColor?.primary
          ?.medium?.rest
      ).toBe(primary.scales.light[9]);
      for (const context of ['onSubtle', 'onVivid'] as const) {
        for (const [emphasis, tone] of [
          ['low', 1],
          ['high', 5]
        ] as const) {
          expect(
            container.elements.e1.palettes?.[segment]?.light?.[context]?.standard?.boxColor
              ?.primary?.[emphasis]?.rest
          ).toBe(primary.scales.light[tone]);
          expect(
            container.contentSurfaceContext?.[segment]?.light?.[context]?.standard?.primary?.[
              emphasis
            ]?.rest
          ).toBe('onSubtle');
          expect(container.options?.canonicalSurfaces?.[segment]?.light).toContainEqual({
            intent: 'primary',
            emphasis,
            contentSurfaceContext: 'onSubtle'
          });
          for (const theme of ['dark', 'darker'] as const) {
            expect(
              container.elements.e1.palettes?.[segment]?.[theme]?.[context]?.standard?.boxColor
                ?.primary?.[emphasis]
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
          const palette = card.elements.e1?.palettes?.[segment]?.[theme]?.[context]?.standard;
          const surfaces = container.elements.e1.palettes?.[segment]?.[theme]?.[context]?.standard;
          const tones = theme === 'dark' ? ([9, 6, 3] as const) : ([3, 2, 1] as const);
          for (const [i, emphasis] of (['lowest', 'low', 'medium'] as const).entries()) {
            expect(surfaces?.boxColor?.neutral?.[emphasis]?.rest).toBe(
              black.scales.dark[tones[i]!]
            );
          }
          expect(surfaces?.boxColor?.neutral?.high).toBeUndefined();
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
        schema.global?.separators?.profiles.subtle.palettes?.[segment]?.light?.onSubtle?.standard
          .boxColor?.neutral;
      for (const [key, color] of Object.entries({
        lowest: '#0000000d',
        low: '#00000018',
        medium: '#0000003b'
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

  it('publishes optional Primary Separator paint for both Light contexts and segments', () => {
    for (const [segment, subtle, vivid] of [
      ['default', '#0064b424', '#12263b'],
      ['teams', '#5053b224', '#1f223c']
    ] as const) {
      for (const [context, expected] of [
        ['onSubtle', segment === 'default' ? '#0064b447' : '#5053b247'],
        ['onVivid', `${vivid}52`]
      ] as const) {
        const token = schema.global?.separators?.profiles.subtle.palettes?.[segment]?.light?.[
          context
        ]?.standard.boxColor?.primary?.medium?.rest as string;
        expect(
          context === 'onVivid'
            ? token
            : resolveContourReference(token, segment, schema.global?.contours)
        ).toBe(expected);
        const low = schema.global?.separators?.profiles.subtle.palettes?.[segment]?.light?.[context]
          ?.standard.boxColor?.primary?.low?.rest as string;
        expect(
          context === 'onVivid'
            ? low
            : resolveContourReference(low, segment, schema.global?.contours)
        ).toBe(context === 'onSubtle' ? subtle : `${vivid}29`);
        const lowest = schema.global?.separators?.profiles.subtle.palettes?.[segment]?.light?.[
          context
        ]?.standard.boxColor?.primary?.lowest?.rest as string;
        expect(
          context === 'onVivid'
            ? lowest
            : resolveContourReference(lowest, segment, schema.global?.contours)
        ).toBe(
          context === 'onSubtle'
            ? segment === 'default'
              ? '#0064b412'
              : '#5053b212'
            : `${vivid}14`
        );
      }
      for (const theme of ['dark', 'darker'] as const)
        expect(
          schema.global?.separators?.profiles.subtle.palettes?.[segment]?.[theme]?.onSubtle
            ?.standard.boxColor?.primary
        ).toBeUndefined();
    }
  });
});
