import type { HSLA, HueName } from '@kiskadee/core';

function normalizeHue(hue: number): number {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function resolveHueNameFromHsla(hsla: HSLA): HueName {
  const [hue, saturation, lightness] = hsla;
  const h = normalizeHue(hue);

  if (lightness <= 8 || (saturation <= 5 && lightness <= 18)) {
    return 'black';
  }

  if (lightness <= 40 && saturation <= 60 && h >= 15 && h < 45) {
    return 'brown';
  }

  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 150) return 'green';
  if (h < 190) return 'teal';
  if (h < 210) return 'cyan';
  if (h < 250) return 'blue';
  if (h < 290) return 'purple';
  return 'pink';
}
