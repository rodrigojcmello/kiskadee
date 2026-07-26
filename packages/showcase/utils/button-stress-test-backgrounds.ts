import type { SurfaceContext, ThemeMode } from '@kiskadee/core';

export type ButtonStressTestBackgroundRow = 'light' | 'vivid' | 'dark';

export type ButtonStressTestBackgroundAvailability = {
  availableThemes: readonly ThemeMode[];
  row: ButtonStressTestBackgroundRow;
  surfaceContexts: readonly SurfaceContext[];
};

export function isButtonStressTestBackgroundAvailable(
  tone: ButtonStressTestBackgroundAvailability,
  theme: ThemeMode,
  surfaceContext: SurfaceContext
): boolean {
  return tone.availableThemes.includes(theme) && tone.surfaceContexts.includes(surfaceContext);
}

export function getAvailableButtonStressTestBackgrounds<
  TTone extends ButtonStressTestBackgroundAvailability
>(tones: readonly TTone[], theme: ThemeMode, surfaceContext: SurfaceContext): TTone[] {
  return tones.filter((tone) => isButtonStressTestBackgroundAvailable(tone, theme, surfaceContext));
}
