import { contour, type Schema, type SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type CardComponent = NonNullable<Schema<Segment>['components']['card']>;
type ThemeName = 'light' | 'dark' | 'darker';
type CreateIos27AppleCardSchemaArgs = {
  c: PresetColorGetter<Segment>;
  segmentNames: readonly Segment[];
  transparent: SolidColor;
};

const themes = ['light', 'dark', 'darker'] as const;
const contexts = ['onSubtle', 'onVivid'] as const;
const canonical = [
  { intent: 'neutral', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
  { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
  { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
  { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
  { intent: 'primary', emphasis: 'high', contentSurfaceContext: 'onVivid' },
  { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
] as const;

export function createIos27AppleCardSchema({
  c,
  segmentNames,
  transparent
}: CreateIos27AppleCardSchemaArgs): CardComponent {
  const palette = (segment: Segment, theme: ThemeName, context: (typeof contexts)[number]) => {
    const track = theme === 'light' ? 'l' : 'd';
    // Light grouped backgrounds; Dark Elevated; Darker Base. These are source stops, not emphasis arithmetic.
    const surface =
      theme === 'light'
        ? ([0, 3, 0] as const)
        : theme === 'dark'
          ? ([10, 5, 16] as const)
          : ([5, 0, 10] as const);
    const strong = c.ref(segment, 'l', 'card.primary', 'vivid', 4);
    const strongest = c.ref(segment, 'l', 'card.primary', 'vivid', 8);
    const selected = { rest: strong };
    const border = contour(`neutral.standard.${theme}.${context}.low`);
    return {
      boxColor: {
        neutral: {
          lowest: { rest: c(segment, track, 'card.neutral', surface[0]), selected },
          low: { rest: c(segment, track, 'card.neutral', surface[1]), selected },
          medium: { rest: c(segment, track, 'card.neutral', surface[2]), selected }
        },
        primary: {
          medium: { rest: c.ref(segment, track, 'card.primary', 'subtle'), selected },
          high: { rest: strong },
          highest: { rest: strongest }
        }
      },
      borderColor: {
        neutral: {
          lowest: { rest: border },
          low: { rest: border },
          medium: { rest: border }
        },
        primary: {
          medium: { rest: border },
          high: { rest: context === 'onVivid' ? border : transparent },
          highest: { rest: context === 'onVivid' ? border : transparent }
        }
      }
    };
  };
  const content = {
    neutral: {
      lowest: { rest: 'onSubtle', selected: 'onVivid' },
      low: { rest: 'onSubtle', selected: 'onVivid' },
      medium: { rest: 'onSubtle', selected: 'onVivid' }
    },
    primary: {
      medium: { rest: 'onSubtle', selected: 'onVivid' },
      high: { rest: 'onVivid' },
      highest: { rest: 'onVivid' }
    }
  } as const;
  return {
    contentSurfaceContext: Object.fromEntries(
      segmentNames.map((segment) => [
        segment,
        Object.fromEntries(themes.map((theme) => [theme, { onSubtle: content, onVivid: content }]))
      ])
    ),
    options: {
      canonicalSurfaces: Object.fromEntries(
        segmentNames.map((segment) => [
          segment,
          Object.fromEntries(
            themes.map((theme) => [
              theme,
              theme === 'darker'
                ? canonical.filter(
                    (surface) => !(surface.intent === 'neutral' && surface.emphasis === 'medium')
                  )
                : canonical
            ])
          )
        ])
      ),
      border: Object.fromEntries(
        segmentNames.map((segment) => [
          segment,
          Object.fromEntries(
            themes.map((theme) => [
              theme,
              Object.fromEntries(
                contexts.map((context) => [
                  context,
                  {
                    neutral: { lowest: true, low: false, medium: false },
                    primary: {
                      medium: false,
                      high: context === 'onVivid',
                      highest: context === 'onVivid'
                    }
                  }
                ])
              )
            ])
          )
        ])
      )
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:sm:1', hover: 's:md:1', pressed: false, disabled: false },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3']
        }
      }
    },
    elements: {
      e1: {
        name: 'card',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: { 's:md:1': 16 },
          paddingBottom: { 's:md:1': 16 },
          paddingLeft: { 's:md:1': 16 },
          paddingRight: { 's:md:1': 16 },
          borderWidth: 1,
          borderRadius: { rounded: { 's:md:1': 28 }, square: { 's:md:1': 0 } }
        },
        palettes: Object.fromEntries(
          segmentNames.map((segment) => [
            segment,
            Object.fromEntries(
              themes.map((theme) => [
                theme,
                {
                  onSubtle: palette(segment, theme, 'onSubtle'),
                  onVivid: palette(segment, theme, 'onVivid')
                }
              ])
            )
          ])
        )
      }
    }
  };
}
