import { splitCardSurfaceSchema } from '../../../utils/splitCardSurfaceSchema.ts';
import primary from '../colors/b.blue.v1.ts';
import neutral from '../colors/n.black.v1.ts';

// Canonical surfaces are authored together with their descendant context.
export function createSandboxCardSchema(_args: {
  segmentNames: readonly 'default'[];
  transparent: string;
}) {
  const levels = ['lowest', 'low', 'medium', 'high', 'highest'] as const;
  const catalog = [
    ...(['lowest', 'low', 'medium'] as const).map((emphasis) => ({
      intent: 'neutral' as const,
      emphasis,
      contentSurfaceContext: 'onSubtle' as const
    })),
    {
      intent: 'primary' as const,
      emphasis: 'highest' as const,
      contentSurfaceContext: 'onVivid' as const
    }
  ];
  const palettes = Object.fromEntries(
    (['light', 'dark'] as const).map((theme) => {
      const n = neutral.scales[theme];
      const p = primary.scales[theme];
      const vivid = primary.functionalReferences[theme].vivid;
      const boxes = (brand: boolean) =>
        Object.fromEntries(
          levels.map((level, i) => [
            level,
            {
              rest: brand && i >= 3 ? p[vivid] : n[([0, 2, 5, 12, 20] as const)[i]!],
              hover: brand && i >= 3 ? p[vivid] : n[([2, 4, 8, 16, 24] as const)[i]!],
              selected: { rest: p[primary.functionalReferences[theme].subtle] }
            }
          ])
        );
      const borders = Object.fromEntries(levels.map((level) => [level, { rest: n[16] }]));
      const surface = {
        boxColor: { neutral: boxes(false), primary: boxes(true) },
        borderColor: { neutral: borders, primary: borders }
      };
      return [theme, { onSubtle: surface, onVivid: surface }];
    })
  );
  const contexts = {
    neutral: Object.fromEntries(levels.map((level) => [level, { rest: 'onSubtle' }])),
    primary: Object.fromEntries(
      levels.map((level, i) => [
        level,
        {
          rest: i >= 3 ? 'onVivid' : 'onSubtle',
          ...(i >= 3 ? { selected: 'onSubtle' } : {})
        }
      ])
    )
  };
  return splitCardSurfaceSchema<never>({
    options: {
      canonicalSurfaces: { default: { light: catalog, dark: catalog } },
      border: {
        defaultMode: 'always',
        adaptive: {
          default: Object.fromEntries(
            ['light', 'dark'].map((theme) => [
              theme,
              Object.fromEntries(
                ['onSubtle', 'onVivid'].map((surface) => [
                  surface,
                  Object.fromEntries(
                    ['neutral', 'primary'].map((intent) => [
                      intent,
                      Object.fromEntries(levels.map((level) => [level, true]))
                    ])
                  )
                ])
              )
            ])
          )
        }
      }
    },
    contentSurfaceContext: {
      default: {
        light: { onSubtle: contexts, onVivid: contexts },
        dark: { onSubtle: contexts, onVivid: contexts }
      }
    },
    elements: {
      e1: {
        name: 'card',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: 16,
          paddingRight: 16,
          paddingBottom: 16,
          paddingLeft: 16,
          borderWidth: 1,
          borderRadius: { rounded: 12, square: 0 }
        },
        palettes: { default: palettes }
      }
    }
  });
}
