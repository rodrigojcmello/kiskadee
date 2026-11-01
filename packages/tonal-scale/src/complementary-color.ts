import { hexToOklch, maxSrgbChroma, normalizeHexColor, oklchToSrgbHex } from './color-math.ts';
import type { KiskadeeTonalProfile } from './kiskadee-tonal-scale.ts';
import { classifyMunsellHex } from './munsell-oklch.ts';

export type ComplementaryColorStrategy = 'material-complement-v1' | 'contrast-complement-v1';

export const COMPLEMENTARY_COLOR_STRATEGIES = [
  'material-complement-v1',
  'contrast-complement-v1'
] as const;

// Calibrated against the two observed Windows accent pairs, not its private algorithm.
export const CONTRAST_COMPLEMENT_V1 = {
  referenceLightness: 76,
  sourceReferenceLightness: 50,
  lightnessRetention: 0.15,
  minimumLightness: 72,
  maximumLightness: 82,
  maximumHueTravel: 16,
  hueStep: 2,
  hueTravelPenalty: 0.003,
  minimumChromaticUtilization: 0.85,
  chromaticReference: 0.1,
  maximumGamutUtilization: 0.99,
  maximumSourceChromaGain: 1.15,
  minimumReliableChroma: 0.005
} as const;

export class ComplementaryColorSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComplementaryColorSourceError';
  }
}

/** Derives an associated seed without assigning its semantic role or catalog identity. */
export function deriveComplementaryColor(
  sourceHex: string,
  strategy: ComplementaryColorStrategy = 'material-complement-v1'
) {
  const normalizedSource = normalizeHexColor(sourceHex);
  if (!normalizedSource) {
    throw new ComplementaryColorSourceError(
      'Complementary origins require a valid opaque sRGB HEX color.'
    );
  }
  const source = hexToOklch(normalizedSource);
  const sourceLimit = maxSrgbChroma(source.l, source.h);
  if (
    source.c < CONTRAST_COMPLEMENT_V1.minimumReliableChroma ||
    sourceLimit < CONTRAST_COMPLEMENT_V1.minimumReliableChroma
  ) {
    throw new ComplementaryColorSourceError(
      'Complementary origins require reliable chromatic information; neutral colors and physical caps are not supported.'
    );
  }
  if (strategy === 'material-complement-v1') {
    const seedHex = oklchToSrgbHex({
      l: 40,
      c: Math.min(source.c, 0.12),
      h: (source.h - 25 + 360) % 360
    }).hex;
    return { seedHex, identity: classifyMunsellHex(seedHex) };
  }
  const parameters = CONTRAST_COMPLEMENT_V1;
  const lightness = Math.max(
    parameters.minimumLightness,
    Math.min(
      parameters.maximumLightness,
      parameters.referenceLightness +
        (source.l - parameters.sourceReferenceLightness) * parameters.lightnessRetention
    )
  );
  const utilization =
    sourceLimit > 0
      ? Math.min(
          parameters.maximumGamutUtilization,
          Math.max(
            source.c / sourceLimit,
            parameters.minimumChromaticUtilization *
              Math.min(1, source.c / parameters.chromaticReference)
          )
        )
      : 0;
  const originalLimit = maxSrgbChroma(lightness, source.h);
  let hue = source.h;
  let score = 0;
  for (
    let offset = -parameters.maximumHueTravel;
    offset <= parameters.maximumHueTravel;
    offset += parameters.hueStep
  ) {
    const candidateHue = (source.h + offset + 360) % 360;
    const candidateLimit = maxSrgbChroma(lightness, candidateHue);
    const candidateScore =
      (originalLimit > 0 ? candidateLimit / originalLimit - 1 : 0) -
      Math.abs(offset) * parameters.hueTravelPenalty;
    if (candidateScore > score + 1e-9) {
      score = candidateScore;
      hue = candidateHue;
    }
  }
  const seedHex = oklchToSrgbHex({
    l: lightness,
    // Local gamut capacity alone can exaggerate Green and amplify RGB noise near caps.
    c: Math.min(
      maxSrgbChroma(lightness, hue) * utilization,
      source.c * parameters.maximumSourceChromaGain
    ),
    h: hue
  }).hex;
  return { seedHex, identity: classifyMunsellHex(seedHex) };
}

export function resolveComplementaryTonalProfile(
  strategy: ComplementaryColorStrategy,
  inherited: KiskadeeTonalProfile,
  explicit?: KiskadeeTonalProfile
): KiskadeeTonalProfile {
  return explicit ?? (strategy === 'contrast-complement-v1' ? 'balanced' : inherited);
}
