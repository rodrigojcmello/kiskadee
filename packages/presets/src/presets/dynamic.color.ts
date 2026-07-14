import { KISKADEE_TONES, type KiskadeeCssScale, type KiskadeeTone } from '@kiskadee/core';

function dynamicScale(theme: 'light' | 'dark'): KiskadeeCssScale {
  return Object.fromEntries(
    KISKADEE_TONES.map((tone: KiskadeeTone) => [tone, `var(--k-p-${theme}-${tone})`])
  ) as unknown as KiskadeeCssScale;
}

export const dynamicLight = dynamicScale('light');
export const dynamicDark = dynamicScale('dark');
