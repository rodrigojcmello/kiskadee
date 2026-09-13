import type { SolidColor } from '@kiskadee/core';
import { buildBySegment } from '../../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../../utils/presetColor.ts';

export type Material3GoogleSegmentName = 'default' | 'dynamic';
export type ThemeShortcut = 'l' | 'd';
export type TabSurfaceContext = 'onSubtle' | 'onVivid';
export type TabSegmentNames = readonly Material3GoogleSegmentName[];

export const defaultTabSegmentNames = ['default', 'dynamic'] as const;

export type TabPaletteArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames?: TabSegmentNames;
  transparent?: string;
  white?: string;
};

export function resolveTabSegmentNames(segmentNames?: TabSegmentNames): TabSegmentNames {
  return segmentNames ?? defaultTabSegmentNames;
}

export function tabTransparent(
  c: PresetColorGetter<Material3GoogleSegmentName>,
  segment: Material3GoogleSegmentName,
  theme: ThemeShortcut
): SolidColor {
  return c(segment, theme, 'primitive.black.v1', 0, 0);
}

export function tabWhite(
  c: PresetColorGetter<Material3GoogleSegmentName>,
  segment: Material3GoogleSegmentName,
  theme: ThemeShortcut
): SolidColor {
  return c(segment, theme, 'primitive.black.v1', theme === 'l' ? 0 : 100);
}

export function buildTabPalettes<T>(
  segmentNames: TabSegmentNames | undefined,
  create: (
    segment: Material3GoogleSegmentName,
    theme: ThemeShortcut,
    surface: TabSurfaceContext
  ) => T
) {
  return buildBySegment(resolveTabSegmentNames(segmentNames), (segment) => ({
    light: {
      onSubtle: create(segment, 'l', 'onSubtle'),
      onVivid: create(segment, 'l', 'onVivid')
    },
    dark: {
      onSubtle: create(segment, 'd', 'onSubtle'),
      onVivid: create(segment, 'd', 'onVivid')
    }
  }));
}
