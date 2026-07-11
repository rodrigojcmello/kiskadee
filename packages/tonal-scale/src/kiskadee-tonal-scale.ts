import {
  contrastRatio,
  type HslColor,
  hexToHsl,
  hexToOklch,
  normalizeHexColor,
  type OklchColor,
  oklchToSrgbHex
} from './color-math.ts';
import {
  analyzeEmittedContinuity,
  type EmittedAdjacentDeltaE,
  type EmittedContinuityDiagnostics,
  type EmittedCurveFairingTrace,
  type EmittedSample,
  fairEmittedAnchorNeighborhood
} from './emitted-curve-continuity.ts';

export const KISKADEE_TONES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60,
  65, 70, 75, 80, 85, 90, 95, 99, 100
] as const;

export type KiskadeeTone = (typeof KISKADEE_TONES)[number];
export type KiskadeeTheme = 'light' | 'dark';
export type KiskadeeVariant = 'standard';

export const KISKADEE_LIGHT_NOMINAL_LIGHTNESS = {
  0: 100,
  1: 98.695278,
  2: 97.425096,
  3: 96.058783,
  4: 94.688924,
  5: 93.362199,
  6: 92.093408,
  7: 90.751004,
  8: 89.096993,
  9: 87.688317,
  10: 86.217449,
  12: 84.099966,
  14: 81.422592,
  16: 78.853248,
  18: 76.553514,
  20: 74.041323,
  22: 71.411081,
  24: 68.894359,
  26: 66.355545,
  28: 63.926274,
  30: 61.395946,
  35: 58.386091,
  40: 55.558077,
  45: 52.630117,
  50: 49.174144,
  55: 45.959014,
  60: 42.906258,
  65: 39.516528,
  70: 36.108367,
  75: 32.964855,
  80: 29.4167,
  85: 26.259884,
  90: 22.969853,
  95: 19.9971,
  99: 3.99942,
  100: 0
} as const satisfies Record<KiskadeeTone, number>;

export type KiskadeeColorFlags = {
  isCap: boolean;
  isAnchor: boolean;
  isVivid: boolean;
  contrastAdjusted: boolean;
  gamutMapped: boolean;
  separationRelaxed: boolean;
};

export type KiskadeeScaleColor = {
  tone: KiskadeeTone;
  hex: string;
  hsl: HslColor;
  oklch: OklchColor;
  nominalLightness: number;
  targetLightness: number;
  gamutChromaLoss: number;
  flags: KiskadeeColorFlags;
};

export type KiskadeeScaleError = {
  code: 'INVALID_HEX' | 'UNSUPPORTED_VARIANT';
  message: string;
};

export type KiskadeeAnchorDiagnostics = {
  tone: KiskadeeTone;
  hex: string;
  inputLightness: number;
  nominalLightness: number;
  lightnessDeviation: number;
  vividEligible: boolean;
  nominalNearestTone: KiskadeeTone;
  relocated: boolean;
  relocationReason: 'none' | 'vivid-contrast' | 'emitted-spacing';
};

export type KiskadeeAdjacentDuplicate = {
  tone: KiskadeeTone;
  nextTone: KiskadeeTone;
  hex: string;
};

export type KiskadeeContrastFailure = {
  tone: KiskadeeTone;
  hex: string;
  ratio: number;
  requiredRatio: number;
  foregroundHex: string;
};

export type KiskadeeAdjacentContrastFailure = {
  tone: KiskadeeTone;
  nextTone: KiskadeeTone;
  ratio: number;
  nextRatio: number;
};

export type KiskadeeScaleDiagnostics = {
  valid: boolean;
  error: KiskadeeScaleError | null;
  monotonic: boolean;
  duplicateTones: KiskadeeTone[];
  adjacentDuplicates: KiskadeeAdjacentDuplicate[];
  anchor: KiskadeeAnchorDiagnostics | null;
  minLightnessDelta: number;
  contrastFailures: KiskadeeContrastFailure[];
  darkSurfaceContrastMonotonic: boolean;
  darkSurfaceContrastFailures: KiskadeeAdjacentContrastFailure[];
  gamutMappedCount: number;
  maxGamutChromaLoss: number;
  maxNominalDeviation: number;
  meanNominalDeviation: number;
  separationRelaxed: boolean;
  maxLocalChromaProminence: number;
  chromaPeakTone: KiskadeeTone | null;
  chromaContinuityRelaxed: boolean;
  emittedContinuity: KiskadeeEmittedContinuityDiagnostics;
};

export type KiskadeeAdjacentDeltaE = EmittedAdjacentDeltaE;
export type KiskadeeEmittedContinuityDiagnostics = EmittedContinuityDiagnostics;

export type GenerateKiskadeeScaleInput = {
  seedHex: string;
  theme: KiskadeeTheme;
  variant: KiskadeeVariant;
};

export type KiskadeeScaleResult = {
  colors: KiskadeeScaleColor[];
  anchorTone: KiskadeeTone | null;
  diagnostics: KiskadeeScaleDiagnostics;
};

type AnchorSelection = {
  index: number;
  nominalNearestIndex: number;
  relocationReason: KiskadeeAnchorDiagnostics['relocationReason'];
};

type FairingTrace = EmittedCurveFairingTrace;

const VIVID_START_TONE = 35;
const VIVID_END_TONE = 95;
const VIVID_CONTRAST = 3;
const DARK_EARLY_CONTRAST_GAMMA = 1.1;
const DARK_EARLY_BLEND_END_TONE = 35;
const DARK_EARLY_BLEND_START_TONE = 10;
const PREFERRED_LIGHTNESS_DELTA = 0.3;
const NUMERIC_EPSILON = 1e-7;
const GAMUT_LOSS_EPSILON = 1e-6;
const CHROMA_PROMINENCE_TOLERANCE = 0.01;
const ANCHOR_STEP_IMBALANCE_TOLERANCE = 3.25;
const ANCHOR_CHROMA_EXCESS_TOLERANCE = 0.015;
const CONTINUITY_REVIEW_MAX_DELTA_E = 0.04;
const CONTINUITY_REVIEW_CHROMA_TURN = 0.2;

export function generateKiskadeeScale({
  seedHex,
  theme,
  variant
}: GenerateKiskadeeScaleInput): KiskadeeScaleResult {
  if (variant !== 'standard') {
    return invalidResult({
      code: 'UNSUPPORTED_VARIANT',
      message: `Unsupported Kiskadee tonal scale variant: ${String(variant)}`
    });
  }

  const normalizedSeed = normalizeHexColor(seedHex);
  if (!normalizedSeed) {
    return invalidResult({
      code: 'INVALID_HEX',
      message: `Invalid sRGB hex color: ${seedHex}`
    });
  }

  const seedOklch = hexToOklch(normalizedSeed);
  const foregroundHex = theme === 'light' ? '#ffffff' : '#000000';
  const chromaAtLightness = createChromaCurve(seedOklch);
  const vividThreshold = findVividContrastThreshold({
    foregroundHex,
    hue: seedOklch.h,
    chromaAtLightness,
    theme
  });
  const nominalOriented = resolveNominalOrientedTargets({
    theme,
    vividThreshold,
    seedHue: seedOklch.h,
    chromaAtLightness
  });
  const nominalLightnesses = nominalOriented.map((value) => unorientLightness(value, theme));
  const anchorSelection = resolveAnchorIndex({
    normalizedSeed,
    seedOklch,
    nominalLightnesses,
    foregroundHex,
    vividThreshold,
    chromaAtLightness,
    theme
  });
  const anchorIndex = anchorSelection.index;
  const anchorTone = KISKADEE_TONES[anchorIndex];
  const anchorOriented = orientLightness(seedOklch.l, theme);
  const noContrastBounds = KISKADEE_TONES.map(() => Number.NEGATIVE_INFINITY);
  const vividBounds = KISKADEE_TONES.map((tone) =>
    isVividTone(tone) ? vividThreshold : Number.NEGATIVE_INFINITY
  );
  const baseline = solveOrientedTargets(
    nominalOriented,
    anchorIndex,
    anchorOriented,
    noContrastBounds
  );
  const solved = solveOrientedTargets(nominalOriented, anchorIndex, anchorOriented, vividBounds);
  const stabilized = stabilizeRenderedTargets({
    orientedTargets: solved.values,
    anchorIndex,
    normalizedSeed,
    seedHue: seedOklch.h,
    chromaAtLightness,
    vividThreshold,
    theme
  });
  const faired = fairEmittedAnchorNeighborhood({
    tones: KISKADEE_TONES,
    orientedTargets: stabilized,
    anchorIndex,
    vividThreshold,
    foregroundHex,
    anchorRelocated: anchorSelection.relocationReason !== 'none',
    contrastAdjusted: KISKADEE_TONES.map(
      (_tone, index) => Math.abs(solved.values[index] - baseline.values[index]) > NUMERIC_EPSILON
    ),
    render: (index, oriented) =>
      renderEmittedSample(index, oriented, {
        anchorIndex,
        normalizedSeed,
        seedHue: seedOklch.h,
        chromaAtLightness,
        theme
      }),
    stabilize: (orientedTargets) =>
      stabilizeRenderedTargets({
        orientedTargets,
        anchorIndex,
        normalizedSeed,
        seedHue: seedOklch.h,
        chromaAtLightness,
        vividThreshold,
        theme
      }),
    orientLightness: (lightness) => orientLightness(lightness, theme),
    isVividTone: (tone) => isVividTone(tone as KiskadeeTone)
  });
  const targetLightnesses = faired.values.map((value) => unorientLightness(value, theme));

  const renderedColors = KISKADEE_TONES.map((tone, index): KiskadeeScaleColor => {
    const targetLightness = targetLightnesses[index];
    const isAnchor = index === anchorIndex;
    const isCap = tone === 0 || tone === 100;
    let hex: string;
    let gamutChromaLoss = 0;

    if (isAnchor) {
      hex = normalizedSeed;
    } else if (isCap) {
      hex = resolveCapHex(tone, theme);
    } else {
      const rendered = oklchToSrgbHex({
        l: targetLightness,
        c: chromaAtLightness(targetLightness),
        h: seedOklch.h
      });
      hex = rendered.hex;
      gamutChromaLoss = rendered.chromaLoss;
    }

    return {
      tone,
      hex,
      hsl: hexToHsl(hex),
      oklch: hexToOklch(hex),
      nominalLightness: nominalLightnesses[index],
      targetLightness,
      gamutChromaLoss,
      flags: {
        isCap,
        isAnchor,
        isVivid: isVividTone(tone),
        contrastAdjusted: Math.abs(solved.values[index] - baseline.values[index]) > NUMERIC_EPSILON,
        gamutMapped: gamutChromaLoss > GAMUT_LOSS_EPSILON,
        separationRelaxed: false
      }
    };
  });
  const actualOriented = renderedColors.map((color) => orientLightness(color.oklch.l, theme));
  const actualDeltas = actualOriented.slice(1).map((value, index) => value - actualOriented[index]);
  const colors = renderedColors.map(
    (color, index): KiskadeeScaleColor => ({
      ...color,
      flags: {
        ...color.flags,
        separationRelaxed:
          (index === anchorIndex && anchorSelection.relocationReason !== 'none') ||
          (actualDeltas[index - 1] ?? Number.POSITIVE_INFINITY) <
            PREFERRED_LIGHTNESS_DELTA - NUMERIC_EPSILON ||
          (actualDeltas[index] ?? Number.POSITIVE_INFINITY) <
            PREFERRED_LIGHTNESS_DELTA - NUMERIC_EPSILON
      }
    })
  );

  const diagnostics = createDiagnostics({
    colors,
    anchorIndex,
    normalizedSeed,
    foregroundHex,
    theme,
    anchorSelection,
    fairing: faired.trace,
    separationRelaxed:
      anchorSelection.relocationReason !== 'none' ||
      solved.separationRelaxed ||
      actualDeltas.some((delta) => delta < PREFERRED_LIGHTNESS_DELTA - NUMERIC_EPSILON)
  });

  return { colors, anchorTone, diagnostics };
}

export function resolveCanonicalNominalLightness(tone: number): number {
  const clampedTone = Math.min(100, Math.max(0, tone));
  const exact = KISKADEE_LIGHT_NOMINAL_LIGHTNESS[clampedTone as KiskadeeTone];

  if (exact !== undefined) return exact;

  let lowerTone: KiskadeeTone = KISKADEE_TONES[0];
  let upperTone: KiskadeeTone = KISKADEE_TONES[KISKADEE_TONES.length - 1];

  for (const candidate of KISKADEE_TONES) {
    if (candidate < clampedTone) lowerTone = candidate;
    if (candidate > clampedTone) {
      upperTone = candidate;
      break;
    }
  }

  const lower = KISKADEE_LIGHT_NOMINAL_LIGHTNESS[lowerTone];
  const upper = KISKADEE_LIGHT_NOMINAL_LIGHTNESS[upperTone];
  const ratio = (clampedTone - lowerTone) / (upperTone - lowerTone);
  return lower + (upper - lower) * ratio;
}

function resolveNominalOrientedTargets(params: {
  theme: KiskadeeTheme;
  vividThreshold: number;
  seedHue: number;
  chromaAtLightness: (lightness: number) => number;
}): number[] {
  const { theme, vividThreshold, seedHue, chromaAtLightness } = params;

  if (theme === 'light') {
    return KISKADEE_TONES.map((tone) =>
      orientLightness(KISKADEE_LIGHT_NOMINAL_LIGHTNESS[tone], theme)
    );
  }

  const pivotTone = 35;
  const pivotBase = resolveCanonicalNominalLightness(100 - pivotTone);
  const pivotTarget = Math.max(pivotBase, vividThreshold);

  return KISKADEE_TONES.map((tone) => {
    const base = resolveCanonicalNominalLightness(100 - tone);
    const legacyTarget =
      base <= pivotBase
        ? pivotBase <= 0
          ? 0
          : (base / pivotBase) * pivotTarget
        : pivotTarget + ((base - pivotBase) / (100 - pivotBase)) * (100 - pivotTarget);

    if (tone === 0 || tone >= pivotTone) return legacyTarget;

    const contrastProgress = (tone / pivotTone) ** DARK_EARLY_CONTRAST_GAMMA;
    const targetContrast = 1 + (VIVID_CONTRAST - 1) * contrastProgress;
    const contrastTarget = findDarkContrastLightness({
      targetContrast,
      maximumLightness: pivotTarget,
      seedHue,
      chromaAtLightness
    });
    const blendProgress = Math.min(
      1,
      Math.max(
        0,
        (tone - DARK_EARLY_BLEND_START_TONE) /
          (DARK_EARLY_BLEND_END_TONE - DARK_EARLY_BLEND_START_TONE)
      )
    );
    const legacyWeight = blendProgress ** 2 * (3 - 2 * blendProgress);

    return contrastTarget + (legacyTarget - contrastTarget) * legacyWeight;
  });
}

function findDarkContrastLightness(params: {
  targetContrast: number;
  maximumLightness: number;
  seedHue: number;
  chromaAtLightness: (lightness: number) => number;
}): number {
  const { targetContrast, maximumLightness, seedHue, chromaAtLightness } = params;
  let low = 0;
  let high = maximumLightness;

  for (let iteration = 0; iteration < 32; iteration += 1) {
    const lightness = (low + high) / 2;
    const color = oklchToSrgbHex({
      l: lightness,
      c: chromaAtLightness(lightness),
      h: seedHue
    });

    if (contrastRatio(color.hex, '#000000') >= targetContrast) {
      high = lightness;
    } else {
      low = lightness;
    }
  }

  return high;
}

function resolveAnchorIndex(params: {
  normalizedSeed: string;
  seedOklch: OklchColor;
  nominalLightnesses: number[];
  foregroundHex: string;
  vividThreshold: number;
  chromaAtLightness: (lightness: number) => number;
  theme: KiskadeeTheme;
}): AnchorSelection {
  const {
    normalizedSeed,
    seedOklch,
    nominalLightnesses,
    foregroundHex,
    vividThreshold,
    chromaAtLightness,
    theme
  } = params;

  if (normalizedSeed === '#ffffff') {
    const index = theme === 'light' ? 0 : KISKADEE_TONES.length - 1;
    return { index, nominalNearestIndex: index, relocationReason: 'none' };
  }

  if (normalizedSeed === '#000000') {
    const index = theme === 'light' ? KISKADEE_TONES.length - 1 : 0;
    return { index, nominalNearestIndex: index, relocationReason: 'none' };
  }

  const seedPassesVividContrast = contrastRatio(normalizedSeed, foregroundHex) >= VIVID_CONTRAST;
  const vividStartIndex = KISKADEE_TONES.indexOf(VIVID_START_TONE);
  const structuralPredecessorCapacity = countRenderedPredecessors({
    normalizedSeed,
    seedOklch,
    foregroundHex,
    lowerBound: 0,
    chromaAtLightness,
    theme,
    requireVividContrast: false,
    maximumNeeded: KISKADEE_TONES.length - 2
  });
  const structuralSuccessorCapacity = countRenderedSuccessors({
    normalizedSeed,
    seedOklch,
    chromaAtLightness,
    theme,
    maximumNeeded: KISKADEE_TONES.length - 2
  });
  const vividPredecessorCapacity = seedPassesVividContrast
    ? countRenderedPredecessors({
        normalizedSeed,
        seedOklch,
        foregroundHex,
        lowerBound: vividThreshold,
        chromaAtLightness,
        theme,
        requireVividContrast: true,
        maximumNeeded:
          KISKADEE_TONES.indexOf(VIVID_END_TONE) - KISKADEE_TONES.indexOf(VIVID_START_TONE)
      })
    : 0;
  const chromaticCandidates = KISKADEE_TONES.map((tone, index) => ({ tone, index })).filter(
    ({ tone }) => tone !== 0 && tone !== 100
  );
  const nominalNearestIndex = chromaticCandidates.reduce((nearestIndex, candidate) => {
    const nearestDistance = Math.abs(nominalLightnesses[nearestIndex] - seedOklch.l);
    const candidateDistance = Math.abs(nominalLightnesses[candidate.index] - seedOklch.l);
    return candidateDistance < nearestDistance ? candidate.index : nearestIndex;
  }, chromaticCandidates[0]?.index ?? 1);
  const candidateIndices = chromaticCandidates.filter(({ tone, index }) => {
    if (index - 1 > structuralPredecessorCapacity) return false;
    if (KISKADEE_TONES.length - index - 2 > structuralSuccessorCapacity) return false;
    if (!isVividTone(tone)) return true;
    if (!seedPassesVividContrast) return false;

    return index - vividStartIndex <= vividPredecessorCapacity;
  });
  const index = candidateIndices.reduce((nearestIndex, candidate) => {
    const nearestDistance = Math.abs(nominalLightnesses[nearestIndex] - seedOklch.l);
    const candidateDistance = Math.abs(nominalLightnesses[candidate.index] - seedOklch.l);
    return candidateDistance < nearestDistance ? candidate.index : nearestIndex;
  }, candidateIndices[0]?.index ?? 1);
  const nearestTone = KISKADEE_TONES[nominalNearestIndex];
  const relocationReason: AnchorSelection['relocationReason'] =
    index === nominalNearestIndex
      ? 'none'
      : isVividTone(nearestTone) && !seedPassesVividContrast
        ? 'vivid-contrast'
        : 'emitted-spacing';

  return { index, nominalNearestIndex, relocationReason };
}

function countRenderedSuccessors(params: {
  normalizedSeed: string;
  seedOklch: OklchColor;
  chromaAtLightness: (lightness: number) => number;
  theme: KiskadeeTheme;
  maximumNeeded: number;
}): number {
  const { normalizedSeed, seedOklch, chromaAtLightness, theme, maximumNeeded } = params;
  let cursor = orientLightness(seedOklch.l, theme);
  let previousHex = normalizedSeed;
  let previousActual = cursor;
  let count = 0;
  const capHex = resolveCapHex(100, theme);

  while (cursor < 100 && count < maximumNeeded) {
    cursor = Math.min(100, cursor + 0.005);
    const lightness = unorientLightness(cursor, theme);
    const candidate = oklchToSrgbHex({
      l: lightness,
      c: chromaAtLightness(lightness),
      h: seedOklch.h
    }).hex;
    const actual = orientLightness(hexToOklch(candidate).l, theme);

    if (
      candidate !== previousHex &&
      candidate !== capHex &&
      actual > previousActual &&
      actual < 100
    ) {
      count += 1;
      previousHex = candidate;
      previousActual = actual;
    }

    if (cursor === 100) break;
  }

  return count;
}

function countRenderedPredecessors(params: {
  normalizedSeed: string;
  seedOklch: OklchColor;
  foregroundHex: string;
  lowerBound: number;
  chromaAtLightness: (lightness: number) => number;
  theme: KiskadeeTheme;
  requireVividContrast: boolean;
  maximumNeeded: number;
}): number {
  const {
    normalizedSeed,
    seedOklch,
    foregroundHex,
    lowerBound,
    chromaAtLightness,
    theme,
    requireVividContrast,
    maximumNeeded
  } = params;
  let cursor = orientLightness(seedOklch.l, theme);
  let previousHex = normalizedSeed;
  let previousActual = cursor;
  let count = 0;
  const floorHex = resolveCapHex(0, theme);

  while (cursor > lowerBound && count < maximumNeeded) {
    cursor = Math.max(lowerBound, cursor - 0.005);
    const lightness = unorientLightness(cursor, theme);
    const candidate = oklchToSrgbHex({
      l: lightness,
      c: chromaAtLightness(lightness),
      h: seedOklch.h
    }).hex;
    const actual = orientLightness(hexToOklch(candidate).l, theme);

    if (
      candidate !== previousHex &&
      candidate !== floorHex &&
      actual > 0 &&
      actual < previousActual &&
      (!requireVividContrast || contrastRatio(candidate, foregroundHex) >= VIVID_CONTRAST)
    ) {
      count += 1;
      previousHex = candidate;
      previousActual = actual;
    }

    if (cursor === lowerBound) break;
  }

  return count;
}

/**
 * Target OKL lightness can be strictly ordered while two rendered 8-bit sRGB
 * colors still quantize to the same hex (especially close to black). Walk each
 * fixed segment and move generated colors only as far as needed to make their
 * emitted colors strictly ordered and unique. Caps and the input anchor never
 * move.
 */
function stabilizeRenderedTargets(params: {
  orientedTargets: number[];
  anchorIndex: number;
  normalizedSeed: string;
  seedHue: number;
  chromaAtLightness: (lightness: number) => number;
  vividThreshold: number;
  theme: KiskadeeTheme;
}): number[] {
  const {
    orientedTargets,
    anchorIndex,
    normalizedSeed,
    seedHue,
    chromaAtLightness,
    vividThreshold,
    theme
  } = params;
  const stabilized = [...orientedTargets];
  const darkGuardIndex = KISKADEE_TONES.indexOf(VIVID_START_TONE);
  const fixedIndices = [
    ...new Set([
      0,
      anchorIndex,
      KISKADEE_TONES.length - 1,
      ...(theme === 'dark' ? [darkGuardIndex] : [])
    ])
  ].sort((left, right) => left - right);
  const renderAt = (
    index: number,
    oriented: number
  ): { hex: string; actual: number; blackContrast: number } => {
    const tone = KISKADEE_TONES[index];
    const hex =
      index === anchorIndex
        ? normalizedSeed
        : tone === 0 || tone === 100
          ? resolveCapHex(tone, theme)
          : oklchToSrgbHex({
              l: unorientLightness(oriented, theme),
              c: chromaAtLightness(unorientLightness(oriented, theme)),
              h: seedHue
            }).hex;
    return {
      hex,
      actual: orientLightness(hexToOklch(hex).l, theme),
      blackContrast: theme === 'dark' ? contrastRatio(hex, '#000000') : 0
    };
  };
  const requiresDarkContrastProgression = (leftIndex: number, rightIndex: number): boolean =>
    theme === 'dark' && leftIndex < rightIndex && KISKADEE_TONES[rightIndex] <= VIVID_START_TONE;
  const isValidSuccessor = (
    value: ReturnType<typeof renderAt>,
    previousValue: ReturnType<typeof renderAt>,
    previousIndex: number,
    index: number
  ): boolean =>
    value.actual > previousValue.actual &&
    value.hex !== previousValue.hex &&
    (!requiresDarkContrastProgression(previousIndex, index) ||
      value.blackContrast > previousValue.blackContrast + NUMERIC_EPSILON);

  for (let segment = 0; segment < fixedIndices.length - 1; segment += 1) {
    const startIndex = fixedIndices[segment];
    const endIndex = fixedIndices[segment + 1];
    const startRendered = renderAt(startIndex, stabilized[startIndex]);
    let previous = startRendered;

    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const maximum = stabilized[endIndex] - NUMERIC_EPSILON * (endIndex - index);
      let candidate = Math.max(stabilized[index], stabilized[index - 1] + NUMERIC_EPSILON);
      let rendered = renderAt(index, candidate);

      if (!isValidSuccessor(rendered, previous, index - 1, index)) {
        let low = candidate;
        let high = candidate;

        while (high < maximum) {
          high = Math.min(maximum, high + 0.25);
          rendered = renderAt(index, high);
          if (isValidSuccessor(rendered, previous, index - 1, index)) break;
        }

        if (isValidSuccessor(rendered, previous, index - 1, index)) {
          for (let iteration = 0; iteration < 18; iteration += 1) {
            const midpoint = (low + high) / 2;
            const midpointRendered = renderAt(index, midpoint);
            if (isValidSuccessor(midpointRendered, previous, index - 1, index)) {
              high = midpoint;
              rendered = midpointRendered;
            } else {
              low = midpoint;
            }
          }
          candidate = high;
        }
      }

      rendered = renderAt(index, candidate);
      stabilized[index] = candidate;
      previous = rendered;
    }

    let next = renderAt(endIndex, stabilized[endIndex]);
    for (let index = endIndex - 1; index > startIndex; index -= 1) {
      const tone = KISKADEE_TONES[index];
      const structuralFloor = stabilized[startIndex] + NUMERIC_EPSILON * (index - startIndex);
      const minimum = Math.max(
        structuralFloor,
        isVividTone(tone) ? vividThreshold : Number.NEGATIVE_INFINITY
      );
      let candidate = Math.min(stabilized[index], stabilized[index + 1] - NUMERIC_EPSILON);
      let rendered = renderAt(index, candidate);
      const isValidPredecessor = (value: ReturnType<typeof renderAt>): boolean =>
        value.actual > startRendered.actual &&
        value.actual < next.actual &&
        value.hex !== startRendered.hex &&
        value.hex !== next.hex &&
        (!requiresDarkContrastProgression(startIndex, index) ||
          value.blackContrast > startRendered.blackContrast + NUMERIC_EPSILON) &&
        (!requiresDarkContrastProgression(index, index + 1) ||
          value.blackContrast + NUMERIC_EPSILON < next.blackContrast);

      if (!isValidPredecessor(rendered)) {
        let invalidUpper = candidate;
        let validLower: number | null = null;
        let step = 0.002;

        while (candidate > minimum) {
          candidate = Math.max(minimum, candidate - step);
          rendered = renderAt(index, candidate);

          if (isValidPredecessor(rendered)) {
            validLower = candidate;
            break;
          }

          invalidUpper = candidate;
          step *= 2;
        }

        if (validLower !== null) {
          let bestCandidate = validLower;
          for (let iteration = 0; iteration < 20; iteration += 1) {
            const midpoint: number = (bestCandidate + invalidUpper) / 2;
            const midpointRendered = renderAt(index, midpoint);

            if (isValidPredecessor(midpointRendered)) {
              bestCandidate = midpoint;
              rendered = midpointRendered;
            } else {
              invalidUpper = midpoint;
            }
          }

          candidate = bestCandidate;
          rendered = renderAt(index, candidate);
        }
      }

      stabilized[index] = candidate;
      next = rendered;
    }
  }

  return stabilized;
}

function renderEmittedSample(
  index: number,
  oriented: number,
  params: {
    anchorIndex: number;
    normalizedSeed: string;
    seedHue: number;
    chromaAtLightness: (lightness: number) => number;
    theme: KiskadeeTheme;
  }
): EmittedSample {
  const { anchorIndex, normalizedSeed, seedHue, chromaAtLightness, theme } = params;
  const tone = KISKADEE_TONES[index];
  let hex: string;
  let gamutChromaLoss = 0;

  if (index === anchorIndex) {
    hex = normalizedSeed;
  } else if (tone === 0 || tone === 100) {
    hex = resolveCapHex(tone, theme);
  } else {
    const lightness = unorientLightness(oriented, theme);
    const rendered = oklchToSrgbHex({
      l: lightness,
      c: chromaAtLightness(lightness),
      h: seedHue
    });
    hex = rendered.hex;
    gamutChromaLoss = rendered.chromaLoss;
  }

  return { tone, hex, oklch: hexToOklch(hex), gamutChromaLoss };
}

function createChromaCurve(seed: OklchColor): (lightness: number) => number {
  if (seed.c < NUMERIC_EPSILON) return () => 0;

  const anchorShape = Math.max(chromaShape(seed.l), 0.01);

  return (lightness: number) => {
    if (lightness <= 0 || lightness >= 100) return 0;
    const ratio = chromaShape(lightness) / anchorShape;
    return Math.min(0.4, seed.c * ratio ** 0.65);
  };
}

function chromaShape(lightness: number): number {
  const normalized = Math.min(1, Math.max(0, lightness / 100));
  return Math.sin(Math.PI * normalized) ** 0.72;
}

function findVividContrastThreshold(params: {
  foregroundHex: string;
  hue: number;
  chromaAtLightness: (lightness: number) => number;
  theme: KiskadeeTheme;
}): number {
  const { foregroundHex, hue, chromaAtLightness, theme } = params;
  let low = 0;
  let high = 100;

  for (let iteration = 0; iteration < 32; iteration += 1) {
    const oriented = (low + high) / 2;
    const lightness = unorientLightness(oriented, theme);
    const color = oklchToSrgbHex({ l: lightness, c: chromaAtLightness(lightness), h: hue });

    if (contrastRatio(color.hex, foregroundHex) >= VIVID_CONTRAST) {
      high = oriented;
    } else {
      low = oriented;
    }
  }

  return Math.min(100, high + 0.001);
}

function solveOrientedTargets(
  desired: number[],
  anchorIndex: number,
  anchorValue: number,
  lowerBounds: number[]
): { values: number[]; separationRelaxed: boolean } {
  const values = [...desired];
  const fixedPoints = [
    { index: 0, value: 0 },
    { index: anchorIndex, value: anchorValue },
    { index: values.length - 1, value: 100 }
  ]
    .sort((left, right) => left.index - right.index)
    .filter((point, index, points) => index === 0 || point.index !== points[index - 1].index);
  let separationRelaxed = false;

  for (let fixedIndex = 0; fixedIndex < fixedPoints.length - 1; fixedIndex += 1) {
    const start = fixedPoints[fixedIndex];
    const end = fixedPoints[fixedIndex + 1];
    const gap = resolveFeasibleGap(start, end, lowerBounds);
    separationRelaxed ||= gap < PREFERRED_LIGHTNESS_DELTA - NUMERIC_EPSILON;
    values[start.index] = start.value;
    values[end.index] = end.value;

    let previous = start.value;
    for (let index = start.index + 1; index < end.index; index += 1) {
      const minimum = Math.max(previous + gap, lowerBounds[index]);
      const maximum = end.value - gap * (end.index - index);
      values[index] = Math.min(maximum, Math.max(minimum, desired[index]));
      previous = values[index];
    }
  }

  return { values, separationRelaxed };
}

function resolveFeasibleGap(
  start: { index: number; value: number },
  end: { index: number; value: number },
  lowerBounds: number[]
): number {
  if (end.index - start.index <= 0) return PREFERRED_LIGHTNESS_DELTA;

  const isFeasible = (gap: number): boolean => {
    let current = start.value;
    for (let index = start.index + 1; index < end.index; index += 1) {
      current = Math.max(current + gap, lowerBounds[index]);
    }
    return current + gap <= end.value + NUMERIC_EPSILON;
  };

  if (isFeasible(PREFERRED_LIGHTNESS_DELTA)) return PREFERRED_LIGHTNESS_DELTA;

  let low = 0;
  let high = PREFERRED_LIGHTNESS_DELTA;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const candidate = (low + high) / 2;
    if (isFeasible(candidate)) low = candidate;
    else high = candidate;
  }

  return low;
}

function createDiagnostics(params: {
  colors: KiskadeeScaleColor[];
  anchorIndex: number;
  normalizedSeed: string;
  foregroundHex: string;
  theme: KiskadeeTheme;
  anchorSelection: AnchorSelection;
  fairing: FairingTrace;
  separationRelaxed: boolean;
}): KiskadeeScaleDiagnostics {
  const {
    colors,
    anchorIndex,
    normalizedSeed,
    foregroundHex,
    theme,
    anchorSelection,
    fairing,
    separationRelaxed
  } = params;
  const orientedActual = colors.map((color) => orientLightness(color.oklch.l, theme));
  const deltas = orientedActual.slice(1).map((value, index) => value - orientedActual[index]);
  const monotonic = deltas.every((delta) => delta > 0);
  const minLightnessDelta = deltas.length === 0 ? 0 : Math.min(...deltas);
  const byHex = new Map<string, KiskadeeTone[]>();
  for (const color of colors) {
    byHex.set(color.hex, [...(byHex.get(color.hex) ?? []), color.tone]);
  }
  const duplicateTones = [...byHex.values()].filter((tones) => tones.length > 1).flat();
  const adjacentDuplicates = colors.flatMap((color, index): KiskadeeAdjacentDuplicate[] => {
    const next = colors[index + 1];
    return next && next.hex === color.hex
      ? [{ tone: color.tone, nextTone: next.tone, hex: color.hex }]
      : [];
  });
  const contrastFailures = colors.flatMap((color): KiskadeeContrastFailure[] => {
    if (!color.flags.isVivid) return [];
    const ratio = contrastRatio(color.hex, foregroundHex);
    return ratio + NUMERIC_EPSILON < VIVID_CONTRAST
      ? [
          {
            tone: color.tone,
            hex: color.hex,
            ratio,
            requiredRatio: VIVID_CONTRAST,
            foregroundHex
          }
        ]
      : [];
  });
  const darkSurfaceColors =
    theme === 'dark' ? colors.filter((color) => color.tone <= VIVID_START_TONE) : [];
  const darkSurfaceContrastFailures = darkSurfaceColors.flatMap(
    (color, index): KiskadeeAdjacentContrastFailure[] => {
      const next = darkSurfaceColors[index + 1];
      if (!next) return [];

      const ratio = contrastRatio(color.hex, '#000000');
      const nextRatio = contrastRatio(next.hex, '#000000');
      return nextRatio > ratio + NUMERIC_EPSILON
        ? []
        : [{ tone: color.tone, nextTone: next.tone, ratio, nextRatio }];
    }
  );
  const darkSurfaceContrastMonotonic = darkSurfaceContrastFailures.length === 0;
  const gamutLosses = colors.map((color) => color.gamutChromaLoss);
  const nominalDeviations = colors.map((color) => Math.abs(color.oklch.l - color.nominalLightness));
  const chromaProminences = colors.map((color, index) => {
    const previous = colors[index - 1];
    const next = colors[index + 1];
    return previous && next && !previous.flags.isCap && !color.flags.isCap && !next.flags.isCap
      ? Math.max(0, color.oklch.c - Math.max(previous.oklch.c, next.oklch.c))
      : 0;
  });
  const maxLocalChromaProminence = Math.max(...chromaProminences);
  const chromaPeakIndex = chromaProminences.findIndex(
    (prominence) => prominence === maxLocalChromaProminence && prominence > 0
  );
  const anchorColor = colors[anchorIndex];
  const anchorContrast = contrastRatio(normalizedSeed, foregroundHex);
  const emittedAnalysis = analyzeEmittedContinuity(
    colors.map((color) => ({
      tone: color.tone,
      hex: color.hex,
      oklch: color.oklch,
      gamutChromaLoss: color.gamutChromaLoss
    })),
    anchorIndex,
    (lightness) => orientLightness(lightness, theme)
  );
  const anchorContinuity = emittedAnalysis.anchor;
  const maximumAnchorDeltaE = Math.max(
    anchorContinuity.incomingDeltaE ?? 0,
    anchorContinuity.outgoingDeltaE ?? 0
  );
  const continuityReviewRequired =
    fairing.status === 'rejected' ||
    (anchorContinuity.stepImbalance !== null &&
      anchorContinuity.stepImbalance > ANCHOR_STEP_IMBALANCE_TOLERANCE &&
      maximumAnchorDeltaE >= CONTINUITY_REVIEW_MAX_DELTA_E) ||
    (anchorContinuity.chromaExcess !== null &&
      anchorContinuity.chromaExcess > ANCHOR_CHROMA_EXCESS_TOLERANCE &&
      anchorContinuity.normalizedChromaTurn !== null &&
      anchorContinuity.normalizedChromaTurn > CONTINUITY_REVIEW_CHROMA_TURN);
  const emittedContinuity: KiskadeeEmittedContinuityDiagnostics = {
    ...emittedAnalysis,
    reviewRequired: continuityReviewRequired,
    fairing
  };

  return {
    valid:
      monotonic &&
      duplicateTones.length === 0 &&
      contrastFailures.length === 0 &&
      darkSurfaceContrastMonotonic,
    error: null,
    monotonic,
    duplicateTones,
    adjacentDuplicates,
    anchor: {
      tone: anchorColor.tone,
      hex: normalizedSeed,
      inputLightness: anchorColor.oklch.l,
      nominalLightness: anchorColor.nominalLightness,
      lightnessDeviation: Math.abs(anchorColor.oklch.l - anchorColor.nominalLightness),
      vividEligible: anchorContrast >= VIVID_CONTRAST,
      nominalNearestTone: KISKADEE_TONES[anchorSelection.nominalNearestIndex],
      relocated: anchorSelection.relocationReason !== 'none',
      relocationReason: anchorSelection.relocationReason
    },
    minLightnessDelta,
    contrastFailures,
    darkSurfaceContrastMonotonic,
    darkSurfaceContrastFailures,
    gamutMappedCount: gamutLosses.filter((loss) => loss > GAMUT_LOSS_EPSILON).length,
    maxGamutChromaLoss: Math.max(...gamutLosses),
    maxNominalDeviation: Math.max(...nominalDeviations),
    meanNominalDeviation:
      nominalDeviations.reduce((sum, deviation) => sum + deviation, 0) / nominalDeviations.length,
    separationRelaxed,
    maxLocalChromaProminence,
    chromaPeakTone: chromaPeakIndex >= 0 ? colors[chromaPeakIndex].tone : null,
    chromaContinuityRelaxed:
      maxLocalChromaProminence > CHROMA_PROMINENCE_TOLERANCE || continuityReviewRequired,
    emittedContinuity
  };
}

function invalidResult(error: KiskadeeScaleError): KiskadeeScaleResult {
  return {
    colors: [],
    anchorTone: null,
    diagnostics: {
      valid: false,
      error,
      monotonic: false,
      duplicateTones: [],
      adjacentDuplicates: [],
      anchor: null,
      minLightnessDelta: 0,
      contrastFailures: [],
      darkSurfaceContrastMonotonic: false,
      darkSurfaceContrastFailures: [],
      gamutMappedCount: 0,
      maxGamutChromaLoss: 0,
      maxNominalDeviation: 0,
      meanNominalDeviation: 0,
      separationRelaxed: false,
      maxLocalChromaProminence: 0,
      chromaPeakTone: null,
      chromaContinuityRelaxed: false,
      emittedContinuity: {
        adjacentDeltaE: [],
        maxAdjacentDeltaE: 0,
        anchor: {
          incomingDeltaE: null,
          outgoingDeltaE: null,
          stepImbalance: null,
          incomingChromaSlope: null,
          outgoingChromaSlope: null,
          chromaSlopeChange: null,
          chromaExcess: null,
          normalizedChromaTurn: null,
          localRhythmDeltaE: null
        },
        reviewRequired: false,
        fairing: {
          status: 'not-needed',
          adjustedTones: [],
          maxLightnessAdjustment: 0,
          beforeStepImbalance: null,
          beforeChromaSlopeChange: null,
          beforeChromaExcess: null
        }
      }
    }
  };
}

function resolveCapHex(tone: KiskadeeTone, theme: KiskadeeTheme): string {
  if (tone === 0) return theme === 'light' ? '#ffffff' : '#000000';
  return theme === 'light' ? '#000000' : '#ffffff';
}

function isVividTone(tone: KiskadeeTone): boolean {
  return tone >= VIVID_START_TONE && tone <= VIVID_END_TONE;
}

function orientLightness(lightness: number, theme: KiskadeeTheme): number {
  return theme === 'light' ? 100 - lightness : lightness;
}

function unorientLightness(oriented: number, theme: KiskadeeTheme): number {
  return theme === 'light' ? 100 - oriented : oriented;
}
