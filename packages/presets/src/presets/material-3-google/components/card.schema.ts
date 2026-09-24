import { withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { splitCardSurfaceSchema } from '../../../utils/splitCardSurfaceSchema.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';

type CreateMaterial3GoogleCardSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

export function createMaterial3GoogleCardSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleCardSchemaArgs) {
  const surfaces = [
    { intent: 'neutral', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
    { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
    { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
    { intent: 'support', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
    { intent: 'support', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
    { intent: 'support', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
    { intent: 'primary', emphasis: 'lowest', contentSurfaceContext: 'onSubtle' },
    { intent: 'primary', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
    { intent: 'primary', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
    { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onVivid' }
  ] as const;
  const context = Object.fromEntries(
    ['neutral', 'primary', 'support'].map((intent) => [
      intent,
      Object.fromEntries(
        surfaces
          .filter((entry) => entry.intent === intent)
          .map((entry) => [
            entry.emphasis,
            {
              rest: entry.contentSurfaceContext,
              selected: entry.contentSurfaceContext,
              disabled: 'onSubtle'
            }
          ])
      )
    ])
  );
  const borderOptions = (surface: 'onSubtle' | 'onVivid') => ({
    support: { lowest: surface === 'onSubtle', low: false, medium: false },
    neutral: {
      lowest: surface === 'onSubtle',
      low: false,
      medium: false
    },
    primary: {
      lowest: surface === 'onSubtle',
      low: false,
      medium: false,
      highest: surface === 'onVivid'
    }
  });
  const palette = (
    segment: Material3GoogleSegmentName,
    theme: 'l' | 'd',
    surface: 'onSubtle' | 'onVivid'
  ) => {
    const transparent = c(segment, 'l', 'primitive.black.v1', 0, 0);
    const onSurface = c(segment, theme, 'primitive.black.v1', 100);
    const disabled = c.ref(segment, theme, 'card.neutral', 'subtle', -1);
    const resolve = (intent: 'neutral' | 'primary' | 'support', emphasis: string) => {
      const role = `card.${intent}` as const;
      const strong = emphasis === 'highest';
      const color = (offset: 0 | 1 | 2 | 3 | 4) => {
        if (strong) return c.ref(segment, 'l', role, 'vivid', -Math.min(offset, 2));
        if (theme === 'l' && emphasis === 'lowest') {
          // A common achromatic surface; interactions retain subtle grayscale deltas.
          return c(segment, 'l', 'primitive.black.v1', offset);
        }
        return c.ref(
          segment,
          theme,
          role,
          'subtle',
          (emphasis === 'lowest' ? -3 : emphasis === 'low' ? -2 : 0) +
            (surface === 'onVivid' && emphasis === 'medium' ? 3 : 0) +
            offset
        );
      };
      const rest = color(0);
      const boundary = strong
        ? c(segment, 'l', 'primitive.black.v1', 0, 30)
        : withAlpha(onSurface, 20);
      return {
        box: {
          rest,
          hover: color(1),
          pressed: color(3),
          focus: color(2),
          ...(rest !== disabled ? { disabled } : {}),
          selected: { rest: color(strong ? 1 : 2), hover: color(3), pressed: color(4) }
        },
        border: {
          rest: boundary,
          disabled: transparent,
          selected: { rest: strong ? withAlpha(boundary, 50) : withAlpha(onSurface, 45) }
        }
      };
    };
    const neutral = {
      lowest: resolve('neutral', 'lowest'),
      low: resolve('neutral', 'low'),
      medium: resolve('neutral', 'medium')
    };
    const support = {
      lowest: resolve('support', 'lowest'),
      low: resolve('support', 'low'),
      medium: resolve('support', 'medium')
    };
    const primary = {
      lowest: resolve('primary', 'lowest'),
      low: resolve('primary', 'low'),
      medium: resolve('primary', 'medium'),
      highest: resolve('primary', 'highest')
    };
    const values = (
      recipes: typeof primary | typeof neutral | typeof support,
      key: 'box' | 'border'
    ) =>
      Object.fromEntries(
        Object.entries(recipes).map(([emphasis, recipe]) => [emphasis, recipe[key]])
      );
    return {
      boxColor: {
        support: values(support, 'box'),
        neutral: values(neutral, 'box'),
        primary: values(primary, 'box')
      },
      borderColor: {
        support: values(support, 'border'),
        neutral: values(neutral, 'border'),
        primary: values(primary, 'border')
      }
    };
  };
  return splitCardSurfaceSchema<Material3GoogleSegmentName>({
    contentSurfaceContext: buildBySegment(segmentNames, () => ({
      light: { onSubtle: context, onVivid: context },
      dark: { onSubtle: context, onVivid: context }
    })),
    options: {
      canonicalSurfaces: Object.fromEntries(
        segmentNames.map((segment) => [segment, { light: surfaces, dark: surfaces }])
      ),
      border: buildBySegment(segmentNames, () => ({
        light: { onSubtle: borderOptions('onSubtle'), onVivid: borderOptions('onVivid') },
        dark: { onSubtle: borderOptions('onSubtle'), onVivid: borderOptions('onVivid') }
      }))
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            // Reset hover elevation while pressed, retaining the resting elevation.
            pressed: 's:sm:1',
            disabled: false
          },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3']
        }
      }
    },
    elements: {
      e1: {
        name: 'card',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:md:1': 16
          },
          paddingBottom: {
            's:md:1': 16
          },
          paddingLeft: {
            's:md:1': 16
          },
          paddingRight: {
            's:md:1': 16
          },
          borderWidth: {
            's:md:1': 1
          },
          borderRadius: {
            rounded: {
              's:md:1': 12
            },
            square: {
              's:md:1': 0
            }
          }
        },
        palettes: buildBySegment(segmentNames, (segment) => ({
          light: {
            onSubtle: palette(segment, 'l', 'onSubtle'),
            onVivid: palette(segment, 'l', 'onVivid')
          },
          dark: {
            onSubtle: palette(segment, 'd', 'onSubtle'),
            onVivid: palette(segment, 'd', 'onVivid')
          }
        }))
      }
    }
  });
}
