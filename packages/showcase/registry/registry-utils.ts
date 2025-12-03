import type { ThemeMode } from '@kiskadee/core/dist';
import { coreMaps, paletteIndex } from './design-systems.registry';

export type DesignSystemKey = keyof typeof coreMaps;

export function getDefaultSegmentAndThemeForDesignSystem(key: DesignSystemKey): {
  segment: string;
  theme: ThemeMode;
} {
  const info = paletteIndex[key as keyof typeof paletteIndex];
  if (!info) {
    throw new Error(`No paletteIndex entry found for design system: ${key}`);
  }

  const segments = Array.from(info.segments) as string[];
  if (segments.length === 0) {
    throw new Error(`Design system ${key} has no segments configured in paletteIndex.`);
  }

  const segment = segments[0];

  const map = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
  const themes = map[segment] ?? ([] as readonly ThemeMode[]);
  if (!themes.length) {
    throw new Error(
      `Design system ${key} has no themes configured for segment "${segment}" in paletteIndex.`
    );
  }

  const theme = themes[0] as ThemeMode;
  return { segment, theme };
}
