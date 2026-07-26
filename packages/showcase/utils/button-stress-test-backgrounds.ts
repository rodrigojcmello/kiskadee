import type { SurfaceContext, ThemeMode } from '@kiskadee/core';

export type ButtonStressTestBackgroundRow = 'light' | 'vivid' | 'dark';

export type ButtonStressTestBackgroundAvailability = {
  availableThemes: readonly ThemeMode[];
  row: ButtonStressTestBackgroundRow;
  surfaceContexts: readonly SurfaceContext[];
};

export function isButtonStressTestBackgroundAvailable(
  tone: ButtonStressTestBackgroundAvailability,
  theme: ThemeMode
): boolean {
  return tone.availableThemes.includes(theme);
}

export function getAvailableButtonStressTestBackgrounds<
  TTone extends ButtonStressTestBackgroundAvailability
>(tones: readonly TTone[], theme: ThemeMode): TTone[] {
  return tones.filter((tone) => isButtonStressTestBackgroundAvailable(tone, theme));
}

export function getPreferredButtonStressTestBackground<
  TTone extends ButtonStressTestBackgroundAvailability
>(tones: readonly TTone[], theme: ThemeMode, surfaceContext: SurfaceContext): TTone | undefined {
  return getAvailableButtonStressTestBackgrounds(tones, theme).find((tone) =>
    tone.surfaceContexts.includes(surfaceContext)
  );
}

export function resolveBackgroundSurfaceContext(
  row: ButtonStressTestBackgroundRow
): SurfaceContext {
  return row === 'light' ? 'onSubtle' : 'onVivid';
}
