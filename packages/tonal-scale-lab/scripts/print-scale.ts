import {
  DEFAULT_CURVE_CONTROLS,
  FLUENT_BLUE_HEX,
  formatHsl,
  generateTonalScale,
  normalizeHexColor
} from '../src/tonal-scale.ts';

const inputHex = normalizeHexColor(process.argv[2] ?? FLUENT_BLUE_HEX);

if (!inputHex) {
  throw new Error(`Invalid hex color: ${process.argv[2]}`);
}

for (const color of generateTonalScale(inputHex, DEFAULT_CURVE_CONTROLS)) {
  console.log(`${color.tone}: ${color.hex} ${formatHsl(color.hsl)}`);
}
