import {
  FLUENT_BLUE_HEX,
  resolveTonalProfile,
  type TonalProfileId
} from '../src/tonal-profiles.ts';
import {
  DEFAULT_SCALE_DISTRIBUTION_ID,
  formatHsl,
  formatOklch,
  generateTonalScale,
  hexToOklch,
  normalizeHexColor,
  resolveScaleDistribution,
  type ScaleDistributionId
} from '../src/tonal-scale.ts';

const inputHex = normalizeHexColor(process.argv[2] ?? FLUENT_BLUE_HEX);
const profile = resolveTonalProfile((process.argv[3] ?? 'fluent-2-blue') as TonalProfileId);
const distribution = resolveScaleDistribution(
  (process.argv[4] ?? DEFAULT_SCALE_DISTRIBUTION_ID) as ScaleDistributionId
);

if (!inputHex) {
  throw new Error(`Invalid hex color: ${process.argv[2]}`);
}

for (const color of generateTonalScale(inputHex, profile.defaultControls, profile, distribution)) {
  console.log(
    `${color.label}: ${color.hex} ${formatHsl(color.hsl)} ${formatOklch(hexToOklch(color.hex))}`
  );
}
