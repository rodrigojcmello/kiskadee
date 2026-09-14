import {
  type ProgressIntent,
  type ProgressTrackColorMap,
  primitive,
  type Schema,
  type SolidColor
} from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';
type ProgressComponent = NonNullable<Schema<'purple'>['components']['progress']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';
type ProgressRole = `progress.${ProgressIntent}`;

type CreateMaterial3GoogleProgressSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
};

const INTENTS = [
  'neutral',
  'primary',
  'positive',
  'warning',
  'destructive'
] as const satisfies readonly ProgressIntent[];

function rest(color: SolidColor) {
  return { rest: color };
}

function createIndicatorMap(
  c: PresetColorGetter<Material3GoogleSegmentName>,
  segment: Material3GoogleSegmentName,
  theme: ThemeName,
  context: 'onSubtle' | 'onVivid'
) {
  const themeShortcut: ThemeShortcut = theme === 'light' ? 'l' : 'd';
  const onVivid = context === 'onVivid';
  const indicator = (intent: ProgressIntent) => {
    const role = `progress.${intent}` as ProgressRole;
    return onVivid
      ? c.ref(segment, 'l', role, 'subtle', 1)
      : c.ref(
          segment,
          themeShortcut,
          role,
          'vivid',
          theme === 'dark' && intent !== 'neutral' ? 6 : 0
        );
  };

  return Object.fromEntries(
    INTENTS.map((intent) => [intent, { medium: rest(indicator(intent)) }])
  ) as Record<ProgressIntent, { medium: { rest: SolidColor } }>;
}

function createTrackMap(
  c: PresetColorGetter<Material3GoogleSegmentName>,
  segment: Material3GoogleSegmentName,
  theme: ThemeName,
  context: 'onSubtle' | 'onVivid'
): ProgressTrackColorMap {
  if (context === 'onVivid') {
    return {
      neutral: {
        medium: rest(c(segment, 'l', primitive('black', 'v1'), 0, 18))
      }
    };
  }

  const themeShortcut: ThemeShortcut = theme === 'light' ? 'l' : 'd';
  return {
    neutral: {
      medium: rest(c.ref(segment, themeShortcut, 'progress.neutral', 'subtle', 1))
    }
  };
}

export function createMaterial3GoogleProgressSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleProgressSchemaArgs): ProgressComponent {
  const trackPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: { boxColor: createTrackMap(c, segment, 'light', 'onSubtle') },
      onVivid: { boxColor: createTrackMap(c, segment, 'light', 'onVivid') }
    },
    dark: {
      onSubtle: { boxColor: createTrackMap(c, segment, 'dark', 'onSubtle') },
      onVivid: { boxColor: createTrackMap(c, segment, 'dark', 'onVivid') }
    }
  }));

  const indicatorPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: { boxColor: createIndicatorMap(c, segment, 'light', 'onSubtle') },
      onVivid: { boxColor: createIndicatorMap(c, segment, 'light', 'onVivid') }
    },
    dark: {
      onSubtle: { boxColor: createIndicatorMap(c, segment, 'dark', 'onSubtle') },
      onVivid: { boxColor: createIndicatorMap(c, segment, 'dark', 'onVivid') }
    }
  }));

  return {
    options: { density: { compact: 's:md:1', spacious: 's:lg:1' } },
    elements: {
      e1: { name: 'progress-root' },
      e2: {
        name: 'progress-track',
        scales: {
          boxHeight: { 's:md:1': 2, 's:lg:1': 4 },
          borderRadius: { pill: 999 }
        },
        palettes: trackPalettes
      },
      e3: {
        name: 'progress-indicator',
        scales: {
          borderRadius: { pill: 999 }
        },
        palettes: indicatorPalettes
      }
    }
  };
}
