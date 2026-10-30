import type { ButtonIndicatorPalettes } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { MATERIAL_BUTTON_EMPHASES, MATERIAL_BUTTON_INTENTS } from './button-color-formula.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';

export function createMaterialButtonIndicatorPalettes({
  c,
  segmentNames,
  placement
}: {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  placement: 'inside' | 'outside';
}): ButtonIndicatorPalettes<'purple'> {
  const context = (
    segment: Material3GoogleSegmentName,
    theme: 'light' | 'dark',
    surface: 'onSubtle' | 'onVivid'
  ) => {
    const white = c(segment, 'l', 'primitive.black.v1', 0);
    const highInside =
      surface === 'onVivid'
        ? c(segment, 'l', 'button.primary', 65)
        : c(segment, 'l', 'primitive.black.v1', theme === 'light' ? 0 : 100);
    const subtleInside =
      surface === 'onVivid'
        ? white
        : c(segment, theme === 'light' ? 'l' : 'd', 'button.primary', theme === 'light' ? 65 : 85);
    const outside =
      surface === 'onVivid'
        ? white
        : theme === 'light'
          ? c.ref(segment, 'l', 'button.primary', 'vivid')
          : c(segment, 'd', 'button.primary', 85);

    return {
      boxColor: Object.fromEntries(
        MATERIAL_BUTTON_INTENTS.map((intent) => [
          intent,
          Object.fromEntries(
            MATERIAL_BUTTON_EMPHASES.map((emphasis) => [
              emphasis,
              {
                selected: {
                  rest: {
                    ref:
                      placement === 'outside'
                        ? outside
                        : emphasis === 'high'
                          ? highInside
                          : subtleInside
                  }
                }
              }
            ])
          )
        ])
      )
    };
  };

  return buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: context(segment, 'light', 'onSubtle'),
      onVivid: context(segment, 'light', 'onVivid')
    },
    dark: {
      onSubtle: context(segment, 'dark', 'onSubtle'),
      onVivid: context(segment, 'dark', 'onVivid')
    }
  }));
}
