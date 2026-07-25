import {
  contrastRatio,
  deltaEOk,
  estimateMaxSrgbChroma,
  hexToHsl,
  hexToOklch,
  maxSrgbChroma,
  type OklchColor,
  oklchToSrgbHex,
  relativeLuminance
} from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
import { FIXED_FAMILY_SEEDS_V2 } from './fixed-family-seeds.ts';
import {
  generateKiskadeeScale,
  KISKADEE_TONES,
  type KiskadeeScaleColor,
  type KiskadeeScaleResult,
  type KiskadeeTheme,
  type KiskadeeTone,
  revalidateKiskadeeScaleResult
} from './kiskadee-tonal-scale.ts';
import {
  classifyMunsellHex,
  classifyMunsellHue,
  getMunsellOklchSectorCenterPosition,
  getMunsellOklchSectorDefinition,
  MUNSELL_OKLCH_PRIMARY_CHROMA,
  MUNSELL_OKLCH_SAFE_CORE,
  type MunsellColorClassification,
  normalizeMunsellHue,
  projectMunsellHue,
  suggestYellowRedAppearance
} from './munsell-oklch.ts';
import {
  createTonalFamilyId,
  type LockedTonalFamilyFunctionalReferencesV5,
  type LockedTonalFunctionalReferenceV5,
  type LockedTonalSystemSourceV5,
  lockTonalSystemRecipe,
  MUNSELL_SECTORS,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  resolveTonalFamilyStem,
  TONAL_BASE_FAMILY_ID_BY_SECTOR,
  TONAL_BASE_FAMILY_IDS,
  TONAL_CORE_FAMILY_IDS,
  type TonalChromaticAppearance,
  type TonalFamilyAppearance,
  type TonalFamilyColorKind,
  type TonalFamilyFunctionalReferenceRulesV5,
  type TonalFamilyId,
  type TonalFamilyOverrideV5,
  type TonalFamilySector,
  type TonalFamilySectorNotation,
  type TonalFamilyVariant,
  type TonalSubtleReferenceRule,
  type TonalSystemRecipeV5,
  type TonalSystemValidationIssue,
  type TonalThemePolicy,
  validateLockedTonalSystemSource,
  validateTonalSystemRecipe
} from './tonal-system-contract.ts';

export const HARMONY_V1_PARAMETERS = {
  lightnessTolerance: 2,
  contrastLogTolerance: 0.05,
  chromaUtilizationTolerance: 0.08,
  passScore: 1,
  hardScoreCeiling: 6,
  reliableHueMinimumChroma: 0.005,
  maximumHueDrift: 12,
  seedDistanceReviewDeltaE: 0.18,
  gamutLossReviewThreshold: 0.08,
  achromaticChromaReviewThreshold: 0.04,
  achromaticChromaHardCeiling: 0.08
} as const;

export const MUNSELL_HARMONY_V1_PARAMETERS = {
  brownChromaRatio: 0.6,
  functionalRestVividSourceMinimum: 0.5,
  functionalRestSourceRetention: 0.7,
  functionalRestBalanceRatio: 0.6,
  functionalRestSourceAnchorBalanceRatio: 0.5,
  functionalRestSourceAnchorBalanceTolerance: 0.005,
  functionalRestSupportChromaFloor: 0.025,
  adjacentFamilyMinimumHueSeparation: 12,
  adjacentFamilyHueSeparationMargin: 1.5,
  adjacentFamilyMinimumRestDeltaE: 0.05
} as const;

export const SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS = {
  contract: 'kiskadee-primary-relative-light-v1',
  startLightness: 80,
  fullLightness: 90,
  chromaToleranceRatio: 0.15,
  minimumChromaTolerance: 0.005,
  protectionRadius: 4,
  restoreScanSteps: 64,
  restoreBisectionSteps: 16,
  restoreRefinementPasses: 2,
  quantizationTolerance: 0.002
} as const;

export const ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS = {
  contract: 'kiskadee-isolated-harmony-peak-v1',
  analysisStartLightness: 40,
  analysisEndLightness: 65,
  restNeighborToleranceRatio: 0.25,
  restMedianToleranceRatio: 0.5,
  minimumRestTolerance: 0.012,
  minimumRestIsolationExcess: 0.015,
  minimumPeakChroma: 0.2,
  peakDetectionAbsoluteGap: 0.022,
  peakDetectionRelativeGap: 0.09,
  peakTargetAbsoluteGap: 0.01,
  peakTargetRelativeGap: 0.04,
  minimumPeakReduction: 0.01,
  peakTargetTolerance: 0.001
} as const;

export const DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS = {
  contract: 'kiskadee-primary-relative-dark-v1',
  startTone: 40,
  endTone: 70,
  chromaToleranceRatio: 0.15,
  minimumChromaTolerance: 0.005,
  quantizationTolerance: 0.002,
  harmonySearchRadius: 0.36
} as const;

export const TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS = {
  contract: 'kiskadee-tinted-achromatic-chroma-v1',
  capTaperLightness: 5,
  capTaperGamma: 0.7,
  restoreScanSteps: 64,
  restoreBisectionSteps: 16,
  restoreRefinementPasses: 2
} as const;

const DEFERRED_PRIMARY_DERIVATION_V1_PARAMETERS = {
  quantizationSafeInset: 0.02
} as const;

const REST_TONES = KISKADEE_TONES.filter((tone) => tone > 0 && tone < 100);
const DEFAULT_SUBTLE_REFERENCE_TONE = 4 satisfies KiskadeeTone;
const CORE_FAMILY_IDS = new Set<TonalFamilyId>(TONAL_CORE_FAMILY_IDS);
const BASE_FAMILY_IDS = new Set<TonalFamilyId>(TONAL_BASE_FAMILY_IDS);

export type TonalSeedPolicy = TonalThemePolicy;
export type TonalSystemStatus = 'pass' | 'review' | 'error';

export type TonalSystemIssue = TonalSystemValidationIssue & {
  severity: 'error' | 'review';
  familyId?: TonalFamilyId;
  theme?: KiskadeeTheme;
};

export type TonalHarmonyFingerprint = {
  formatVersion: TonalSystemRecipeV5['formatVersion'];
  gridContract: TonalSystemRecipeV5['gridContract'];
  harmonyContract: TonalSystemRecipeV5['harmonyContract'];
  tonalProfile: TonalSystemRecipeV5['tonalProfile'];
  familyId: TonalFamilyId;
  theme: KiskadeeTheme;
  tone: KiskadeeTone;
  hex: string;
  oklch: OklchColor;
  relativeLuminance: number;
  contrastAgainstWhite: number;
  contrastAgainstBlack: number;
  maximumSrgbChroma: number;
  chromaUtilization: number;
  hueGlobalMaximumSrgbChroma: number;
  hueGlobalChromaUtilization: number;
  policy: 'source-exact' | 'adaptive';
};

export type TonalHarmonyMetrics = {
  chromaModel: 'local-gamut' | 'hue-global';
  score: number;
  lightnessError: number;
  contrastLogError: number;
  chromaUtilizationError: number;
  hueGlobalBalanceError: number;
  lightnessDelta: number;
  relativeLuminanceDelta: number;
  contrastAgainstWhiteDelta: number;
  contrastAgainstBlackDelta: number;
  chromaUtilizationDelta: number;
  restHueGlobalChromaUtilization: number;
  hueGlobalChromaUtilizationDelta: number;
  vividPeakGlobalChromaUtilization?: number;
  vividPeakGlobalChromaUtilizationDelta?: number;
  vividPeakError?: number;
  isolatedPeakChroma?: number;
  isolatedPeakChromaCap?: number;
  isolatedPeakError?: number;
  seedDeltaE: number;
  hueDrift: number;
  candidatesEvaluated: number;
};

export type TonalSurfaceTrackAlignmentDiagnostics = {
  contract: typeof SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.contract;
  referenceFamilyId: TonalFamilyId;
  adjustedTones: KiskadeeTone[];
  adjustedToneCount: number;
  protectedTones: KiskadeeTone[];
  maxChromaReduction: number;
  maxRemainingExcess: number;
  appliedStrength: number;
  restorationCount: number;
};

export type TonalIsolatedHarmonyPeakAlignmentDiagnostics = {
  contract: typeof ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS.contract;
  detectionPeerFamilyId: TonalFamilyId;
  detectionPeerChroma: number;
  runnerUpFamilyId: TonalFamilyId;
  baselineRestChroma: number;
  adjacentRestChromaAverage: number;
  medianRestChroma: number;
  restDetectionCap: number;
  baselinePeakChroma: number;
  runnerUpPeakChroma: number;
  targetPeakChroma: number;
  targetLimitedBy: 'runner-up-envelope' | 'minimum-reduction';
  finalPeakChroma: number;
  baselinePeakTone: KiskadeeTone;
  baselinePeakLightness: number;
  finalPeakTone: KiskadeeTone;
  finalPeakLightness: number;
  adjusted: boolean;
  remainingExcess: number;
};

export type TonalDarkSupportChromaModerationDiagnostics = {
  contract: typeof DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.contract;
  referenceFamilyId: TonalFamilyId;
  evaluatedTones: KiskadeeTone[];
  adjustedTones: KiskadeeTone[];
  adjustedToneCount: number;
  limitingTone: KiskadeeTone | null;
  baselineMaxExcess: number;
  finalMaxExcess: number;
  maxChromaReduction: number;
  maxChromaIncrease: number;
  sourceSeedChanged: boolean;
};

export type TonalTintedAchromaticChromaDiagnostics = {
  contract: typeof TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.contract;
  seedHue: number;
  seedChroma: number;
  adjustedTones: KiskadeeTone[];
  adjustedToneCount: number;
  restoredTones: KiskadeeTone[];
  restorationCount: number;
  gamutMappedTones: KiskadeeTone[];
  maxChromaIncrease: number;
  maxChromaReduction: number;
  maxHueDrift: number;
  appliedStrength: number;
};

export type ResolvedTonalTheme = {
  theme: KiskadeeTheme;
  policy: TonalSeedPolicy;
  sourceSeedHex: string;
  effectiveSeedHex: string;
  sourceSeedPreserved: boolean;
  restTone: KiskadeeTone;
  restColor: KiskadeeScaleColor;
  scale: KiskadeeScaleResult;
  harmony: TonalHarmonyMetrics | null;
  surfaceTrackAlignment: TonalSurfaceTrackAlignmentDiagnostics | null;
  isolatedHarmonyPeakAlignment: TonalIsolatedHarmonyPeakAlignmentDiagnostics | null;
  darkSupportChromaModeration: TonalDarkSupportChromaModerationDiagnostics | null;
  tintedAchromaticChroma: TonalTintedAchromaticChromaDiagnostics | null;
  status: Exclude<TonalSystemStatus, 'error'>;
};

export type FunctionalRestThemeDiagnostics = {
  theme: KiskadeeTheme;
  sourceAnchorTone: KiskadeeTone;
  functionalRestTone: KiskadeeTone;
  sourceGlobalChromaUtilization: number;
  restGlobalChromaUtilization: number;
  sourceRetention: number;
  minimumFamilyRatio: number;
  maximumFamilyRatio: number;
  vividnessGuardApplied: boolean;
  balanced: boolean;
};

export type ResolvedTonalFamily = {
  id: TonalFamilyId;
  appearance: TonalFamilyAppearance;
  sector: TonalFamilySector | null;
  munsellSector: TonalFamilySectorNotation | 'N';
  variant: TonalFamilyVariant;
  colorKind: TonalFamilyColorKind;
  role: 'primary' | 'support';
  seedOrigin: 'primary' | 'reference' | 'derived' | 'override' | 'canonical';
  sourceSeedHex: string;
  identity: MunsellColorClassification | null;
  functionalReferenceRules: {
    light: TonalFamilyFunctionalReferenceRulesV5['light'];
    dark: TonalFamilyFunctionalReferenceRulesV5['dark'];
  };
  status: Exclude<TonalSystemStatus, 'error'>;
  themes: {
    light: ResolvedTonalTheme;
    dark: ResolvedTonalTheme;
  };
};

export type TonalFunctionalReferenceSource = LockedTonalFunctionalReferenceV5['source'];

export type TonalFunctionalReference = {
  tone: KiskadeeTone;
  hex: string;
  color: KiskadeeScaleColor;
  source: TonalFunctionalReferenceSource;
  surfaceContrast: number;
  surfaceDeltaE: number;
  referenceHex?: string;
  deltaE?: number;
};

export type ResolvedTonalFamilyFunctionalReferences = {
  id: TonalFamilyId;
  light: {
    vivid: TonalFunctionalReference;
    subtle: TonalFunctionalReference;
  };
  dark: {
    vivid: TonalFunctionalReference;
    subtle: TonalFunctionalReference;
  };
};

function createFunctionalReference(
  color: KiskadeeScaleColor,
  theme: KiskadeeTheme,
  source: TonalFunctionalReferenceSource,
  details: Pick<TonalFunctionalReference, 'referenceHex' | 'deltaE'> = {}
): TonalFunctionalReference {
  const surfaceHex = resolveThemeSurfaceHex(theme);
  return {
    tone: color.tone,
    hex: color.hex,
    color,
    source,
    surfaceContrast: contrastRatio(color.hex, surfaceHex),
    surfaceDeltaE: deltaEOk(color.oklch, hexToOklch(surfaceHex)),
    ...details
  };
}

function resolveAchromaticDarkContrastMirror(
  family: ResolvedTonalFamily,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const lightReference = resolveFamilyVividReference(family, 'light', issues);
  const targetContrast = contrastRatio(lightReference.hex, '#ffffff');
  const candidates = family.themes.dark.scale.colors
    .filter((color) => color.tone > 0 && color.tone < 100)
    .map((color) => ({
      color,
      contrast: contrastRatio(color.hex, '#000000')
    }));

  const best = candidates.reduce<(typeof candidates)[number] | null>((current, candidate) => {
    if (!current) return candidate;

    const currentError = Math.abs(current.contrast - targetContrast);
    const candidateError = Math.abs(candidate.contrast - targetContrast);
    if (candidateError !== currentError) return candidateError < currentError ? candidate : current;
    if (candidate.contrast !== current.contrast) {
      return candidate.contrast < current.contrast ? candidate : current;
    }
    return candidate.color.tone < current.color.tone ? candidate : current;
  }, null);

  if (!best) {
    throw new Error(`${family.id} dark is missing an internal contrast-mirror tone.`);
  }

  return createFunctionalReference(best.color, 'dark', 'contrast-mirror');
}

function resolveFamilyVividReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const resolution = family.themes[theme];
  const configuredRule = family.functionalReferenceRules[theme].vivid;

  if (configuredRule.mode === 'auto' && family.colorKind === 'achromatic' && theme === 'dark') {
    return resolveAchromaticDarkContrastMirror(family, issues);
  }

  const rule =
    configuredRule.mode === 'auto'
      ? family.role === 'primary' || resolution.policy !== 'harmonized'
        ? ({ mode: 'generated-anchor' } as const)
        : ({ mode: 'harmony-rest' } as const)
      : configuredRule;

  if (rule.mode === 'harmony-rest') {
    return createFunctionalReference(resolution.restColor, theme, 'harmony-rest');
  }

  if (rule.mode === 'locked') {
    const color = resolveTone(resolution.scale, rule.tone);
    if (!color) {
      throw new Error(`${family.id} ${theme} is missing locked vivid tone ${rule.tone}.`);
    }
    return createFunctionalReference(color, theme, 'locked');
  }

  const anchorTone = resolution.scale.anchorTone;
  const anchorColor = anchorTone === null ? undefined : resolveTone(resolution.scale, anchorTone);
  if (anchorTone === null || !anchorColor) {
    throw new Error(`${family.id} ${theme} is missing its generated anchor.`);
  }

  if (anchorColor.flags.isCap) {
    const fallbackTone = anchorTone === 0 ? 1 : 99;
    const fallback = resolveTone(resolution.scale, fallbackTone);
    if (!fallback) {
      throw new Error(`${family.id} ${theme} is missing its internal vivid cap fallback.`);
    }
    const isCanonicalPureBlackFallback = family.id === 'n.black.v1';
    if (
      !isCanonicalPureBlackFallback &&
      !issues.some(
        (issue) =>
          issue.code === 'VIVID_REFERENCE_CAP_FALLBACK' &&
          issue.familyId === family.id &&
          issue.theme === theme
      )
    ) {
      markFamilyThemeForReview(family, theme);
      issues.push({
        severity: 'review',
        code: 'VIVID_REFERENCE_CAP_FALLBACK',
        path: `/functionalReferences/${family.id}/${theme}/vivid`,
        message: `${family.id} ${theme} anchors at absolute cap ${anchorTone}; internal tone ${fallbackTone} is used as the closest functional vivid reference without recoloring the scale.`,
        familyId: family.id,
        theme
      });
    }
    return createFunctionalReference(fallback, theme, 'generated-anchor');
  }

  return createFunctionalReference(anchorColor, theme, 'generated-anchor');
}

function resolveFamilyFunctionalReferenceRules(
  recipe: Pick<MaterializedTonalSystemRecipe, 'functionalReferences'>,
  familyId: TonalFamilyId
): Pick<TonalFamilyFunctionalReferenceRulesV5, 'light' | 'dark'> {
  const configured = recipe.functionalReferences.find((entry) => entry.id === familyId);
  return configured
    ? {
        light: {
          vivid: { ...configured.light.vivid },
          subtle: { ...configured.light.subtle }
        },
        dark: {
          vivid: { ...configured.dark.vivid },
          subtle: { ...configured.dark.subtle }
        }
      }
    : {
        light: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      };
}

export function offsetKiskadeeTone(tone: KiskadeeTone, offset: number): KiskadeeTone | null {
  if (!Number.isInteger(offset)) return null;
  const sourceIndex = KISKADEE_TONES.indexOf(tone);
  if (sourceIndex < 0) return null;

  const target = KISKADEE_TONES[sourceIndex + offset];
  return target !== undefined && target > 0 && target < 100 ? target : null;
}

function resolveThemeSurfaceHex(theme: KiskadeeTheme): '#ffffff' | '#000000' {
  return theme === 'light' ? '#ffffff' : '#000000';
}

function resolveFunctionalReferenceColor(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  tone: KiskadeeTone
): KiskadeeScaleColor {
  const color = resolveTone(family.themes[theme].scale, tone);
  if (!color || tone === 0 || tone === 100) {
    throw new Error(`${family.id} ${theme} is missing functional reference tone ${tone}.`);
  }
  return color;
}

function resolveSurfaceSideCandidates(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  vivid: TonalFunctionalReference
): { candidates: KiskadeeScaleColor[]; surfaceEdgeFallback: boolean } {
  const vividIndex = KISKADEE_TONES.indexOf(vivid.tone);
  const candidates = family.themes[theme].scale.colors.filter((color) => {
    const index = KISKADEE_TONES.indexOf(color.tone);
    return color.tone > 0 && color.tone < 100 && index < vividIndex;
  });
  if (candidates.length > 0) return { candidates, surfaceEdgeFallback: false };

  return {
    candidates: [resolveFunctionalReferenceColor(family, theme, 1)],
    surfaceEdgeFallback: true
  };
}

function reportSurfaceEdgeFallback(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  issues: TonalSystemIssue[]
): void {
  markFamilyThemeForReview(family, theme);
  issues.push({
    severity: 'review',
    code: 'SUBTLE_REFERENCE_SURFACE_EDGE_FALLBACK',
    path: `/functionalReferences/${family.id}/${theme}/subtle`,
    message: `${family.id} ${theme} has its vivid reference at tone 1, so no distinct non-cap subtle tone exists; tone 1 is reused without recoloring the scale.`,
    familyId: family.id,
    theme
  });
}

function markFamilyThemeForReview(family: ResolvedTonalFamily, theme: KiskadeeTheme): void {
  family.themes[theme].status = 'review';
  family.status = 'review';
}

function compareToneGridDistance(
  left: KiskadeeScaleColor,
  right: KiskadeeScaleColor,
  targetTone: KiskadeeTone
): number {
  const targetIndex = KISKADEE_TONES.indexOf(targetTone);
  const leftDistance = Math.abs(KISKADEE_TONES.indexOf(left.tone) - targetIndex);
  const rightDistance = Math.abs(KISKADEE_TONES.indexOf(right.tone) - targetIndex);
  return leftDistance - rightDistance || left.tone - right.tone;
}

function resolveCanonicalPrimarySubtleReference(
  family: ResolvedTonalFamily,
  vivid: TonalFunctionalReference,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const { candidates, surfaceEdgeFallback } = resolveSurfaceSideCandidates(family, 'light', vivid);
  if (surfaceEdgeFallback) reportSurfaceEdgeFallback(family, 'light', issues);
  const color =
    candidates.find((candidate) => candidate.tone === DEFAULT_SUBTLE_REFERENCE_TONE) ??
    candidates[candidates.length - 1];
  if (!color) throw new Error(`${family.id} light has no canonical subtle reference candidate.`);
  return createFunctionalReference(color, 'light', 'surface-relative');
}

function resolveReferenceMatchedSubtleReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  vivid: TonalFunctionalReference,
  referenceHex: string,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const { candidates, surfaceEdgeFallback } = resolveSurfaceSideCandidates(family, theme, vivid);
  if (surfaceEdgeFallback) reportSurfaceEdgeFallback(family, theme, issues);
  const referenceOklch = hexToOklch(referenceHex);
  const referenceContrast = contrastRatio(referenceHex, resolveThemeSurfaceHex(theme));
  const color = [...candidates].sort((left, right) => {
    const deltaDifference =
      deltaEOk(left.oklch, referenceOklch) - deltaEOk(right.oklch, referenceOklch);
    if (deltaDifference !== 0) return deltaDifference;
    const leftContrastError = Math.abs(
      Math.log(contrastRatio(left.hex, resolveThemeSurfaceHex(theme)) / referenceContrast)
    );
    const rightContrastError = Math.abs(
      Math.log(contrastRatio(right.hex, resolveThemeSurfaceHex(theme)) / referenceContrast)
    );
    return (
      leftContrastError - rightContrastError ||
      compareToneGridDistance(left, right, DEFAULT_SUBTLE_REFERENCE_TONE)
    );
  })[0];
  if (!color) throw new Error(`${family.id} ${theme} has no reference-match candidate.`);

  return createFunctionalReference(color, theme, 'reference-match', {
    referenceHex,
    deltaE: deltaEOk(color.oklch, referenceOklch)
  });
}

function resolveCrossThemeSurfaceRelativeReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  vivid: TonalFunctionalReference,
  oppositeThemeReference: TonalFunctionalReference,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const { candidates, surfaceEdgeFallback } = resolveSurfaceSideCandidates(family, theme, vivid);
  if (surfaceEdgeFallback) reportSurfaceEdgeFallback(family, theme, issues);
  const surfaceHex = resolveThemeSurfaceHex(theme);
  const color = [...candidates].sort((left, right) => {
    const leftError = Math.abs(
      Math.log(contrastRatio(left.hex, surfaceHex) / oppositeThemeReference.surfaceContrast)
    );
    const rightError = Math.abs(
      Math.log(contrastRatio(right.hex, surfaceHex) / oppositeThemeReference.surfaceContrast)
    );
    return (
      leftError - rightError || compareToneGridDistance(left, right, oppositeThemeReference.tone)
    );
  })[0];
  if (!color) throw new Error(`${family.id} ${theme} has no surface-mirror candidate.`);

  return createFunctionalReference(color, theme, 'surface-relative');
}

function resolveSupportSurfaceRelativeReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  vivid: TonalFunctionalReference,
  primarySubtle: TonalFunctionalReference,
  issues: TonalSystemIssue[]
): TonalFunctionalReference {
  const { candidates, surfaceEdgeFallback } = resolveSurfaceSideCandidates(family, theme, vivid);
  if (surfaceEdgeFallback) reportSurfaceEdgeFallback(family, theme, issues);
  const surfaceHex = resolveThemeSurfaceHex(theme);
  const surfaceOklch = hexToOklch(surfaceHex);
  const color = [...candidates].sort((left, right) => {
    const leftDeltaError = Math.abs(
      deltaEOk(left.oklch, surfaceOklch) - primarySubtle.surfaceDeltaE
    );
    const rightDeltaError = Math.abs(
      deltaEOk(right.oklch, surfaceOklch) - primarySubtle.surfaceDeltaE
    );
    if (leftDeltaError !== rightDeltaError) return leftDeltaError - rightDeltaError;
    const leftContrastError = Math.abs(
      Math.log(contrastRatio(left.hex, surfaceHex) / primarySubtle.surfaceContrast)
    );
    const rightContrastError = Math.abs(
      Math.log(contrastRatio(right.hex, surfaceHex) / primarySubtle.surfaceContrast)
    );
    return (
      leftContrastError - rightContrastError ||
      compareToneGridDistance(left, right, primarySubtle.tone)
    );
  })[0];
  if (!color) throw new Error(`${family.id} ${theme} has no surface-relative candidate.`);

  return createFunctionalReference(color, theme, 'surface-relative');
}

function resolveExplicitSubtleReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  vivid: TonalFunctionalReference,
  rule: TonalSubtleReferenceRule,
  issues: TonalSystemIssue[]
): TonalFunctionalReference | null {
  if (rule.mode === 'auto') return null;
  if (rule.mode === 'reference-match') {
    return resolveReferenceMatchedSubtleReference(family, theme, vivid, rule.referenceHex, issues);
  }

  const reference = createFunctionalReference(
    resolveFunctionalReferenceColor(family, theme, rule.tone),
    theme,
    'locked'
  );
  if (KISKADEE_TONES.indexOf(reference.tone) >= KISKADEE_TONES.indexOf(vivid.tone)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_FUNCTIONAL_REFERENCE_ORDER',
      path: `/functionalReferences/${family.id}/${theme}/subtle/tone`,
      message: `${family.id} ${theme} locks subtle tone ${reference.tone} at or beyond vivid tone ${vivid.tone}.`,
      familyId: family.id,
      theme
    });
  }
  return reference;
}

function hydrateLockedFunctionalReference(
  family: ResolvedTonalFamily,
  theme: KiskadeeTheme,
  reference: LockedTonalFunctionalReferenceV5
): TonalFunctionalReference {
  const color = resolveFunctionalReferenceColor(family, theme, reference.tone);
  if (reference.source !== 'reference-match') {
    return createFunctionalReference(color, theme, reference.source);
  }
  return createFunctionalReference(color, theme, reference.source, {
    referenceHex: reference.referenceHex,
    deltaE: deltaEOk(color.oklch, hexToOklch(reference.referenceHex))
  });
}

function resolveLockedFunctionalReferences(
  families: ResolvedTonalFamily[],
  lockedReferences: LockedTonalFamilyFunctionalReferencesV5[],
  issues: TonalSystemIssue[]
): ResolvedTonalFamilyFunctionalReferences[] {
  return lockedReferences
    .map((references) => {
      const family = families.find((candidate) => candidate.id === references.id);
      if (!family) throw new Error(`Locked references target missing family ${references.id}.`);
      const resolved = {
        id: family.id,
        light: {
          vivid: hydrateLockedFunctionalReference(family, 'light', references.light.vivid),
          subtle: hydrateLockedFunctionalReference(family, 'light', references.light.subtle)
        },
        dark: {
          vivid: hydrateLockedFunctionalReference(family, 'dark', references.dark.vivid),
          subtle: hydrateLockedFunctionalReference(family, 'dark', references.dark.subtle)
        }
      };
      for (const theme of ['light', 'dark'] as const) {
        if (
          resolved[theme].vivid.tone === 1 &&
          resolved[theme].subtle.tone === 1 &&
          references[theme].subtle.source !== 'locked'
        ) {
          reportSurfaceEdgeFallback(family, theme, issues);
        }
      }
      return resolved;
    })
    .sort((left, right) => compareStrings(left.id, right.id));
}

function resolveGeneratedFunctionalReferences(
  families: ResolvedTonalFamily[],
  primaryFamily: ResolvedTonalFamily,
  issues: TonalSystemIssue[]
): ResolvedTonalFamilyFunctionalReferences[] {
  const vividByFamily = new Map(
    families.map((family) => [
      family.id,
      {
        light: resolveFamilyVividReference(family, 'light', issues),
        dark: resolveFamilyVividReference(family, 'dark', issues)
      }
    ])
  );
  const primaryVivid = vividByFamily.get(primaryFamily.id);
  if (!primaryVivid) throw new Error('Primary vivid references are missing.');

  const primaryLightRule = primaryFamily.functionalReferenceRules.light.subtle;
  const primaryDarkRule = primaryFamily.functionalReferenceRules.dark.subtle;
  let primaryLight = resolveExplicitSubtleReference(
    primaryFamily,
    'light',
    primaryVivid.light,
    primaryLightRule,
    issues
  );
  let primaryDark = resolveExplicitSubtleReference(
    primaryFamily,
    'dark',
    primaryVivid.dark,
    primaryDarkRule,
    issues
  );

  if (!primaryLight && !primaryDark) {
    primaryLight = resolveCanonicalPrimarySubtleReference(
      primaryFamily,
      primaryVivid.light,
      issues
    );
    primaryDark = resolveCrossThemeSurfaceRelativeReference(
      primaryFamily,
      'dark',
      primaryVivid.dark,
      primaryLight,
      issues
    );
  } else if (!primaryLight && primaryDark) {
    primaryLight = resolveCrossThemeSurfaceRelativeReference(
      primaryFamily,
      'light',
      primaryVivid.light,
      primaryDark,
      issues
    );
  } else if (primaryLight && !primaryDark) {
    primaryDark = resolveCrossThemeSurfaceRelativeReference(
      primaryFamily,
      'dark',
      primaryVivid.dark,
      primaryLight,
      issues
    );
  }
  if (!primaryLight || !primaryDark) throw new Error('Primary subtle references are missing.');

  return families
    .map((family) => {
      const vivid = vividByFamily.get(family.id);
      if (!vivid) throw new Error(`${family.id} vivid references are missing.`);
      if (family.id === primaryFamily.id) {
        return {
          id: family.id,
          light: { vivid: vivid.light, subtle: primaryLight },
          dark: { vivid: vivid.dark, subtle: primaryDark }
        };
      }

      const light =
        resolveExplicitSubtleReference(
          family,
          'light',
          vivid.light,
          family.functionalReferenceRules.light.subtle,
          issues
        ) ??
        resolveSupportSurfaceRelativeReference(family, 'light', vivid.light, primaryLight, issues);
      const dark =
        resolveExplicitSubtleReference(
          family,
          'dark',
          vivid.dark,
          family.functionalReferenceRules.dark.subtle,
          issues
        ) ??
        resolveSupportSurfaceRelativeReference(family, 'dark', vivid.dark, primaryDark, issues);
      return {
        id: family.id,
        light: { vivid: vivid.light, subtle: light },
        dark: { vivid: vivid.dark, subtle: dark }
      };
    })
    .sort((left, right) => compareStrings(left.id, right.id));
}

function lockFunctionalReferences(
  references: ResolvedTonalFamilyFunctionalReferences[]
): LockedTonalFamilyFunctionalReferencesV5[] {
  const lock = (reference: TonalFunctionalReference): LockedTonalFunctionalReferenceV5 =>
    reference.source === 'reference-match'
      ? {
          tone: reference.tone,
          source: reference.source,
          referenceHex: reference.referenceHex ?? reference.hex
        }
      : { tone: reference.tone, source: reference.source };

  return references.map((family) => ({
    id: family.id,
    light: { vivid: lock(family.light.vivid), subtle: lock(family.light.subtle) },
    dark: { vivid: lock(family.dark.vivid), subtle: lock(family.dark.subtle) }
  }));
}

export type ResolvedKiskadeeTonalSystem = {
  valid: true;
  status: Exclude<TonalSystemStatus, 'error'>;
  source: LockedTonalSystemSourceV5;
  rest: {
    light: KiskadeeTone;
    dark: KiskadeeTone;
    source: 'auto-proposal' | 'locked';
  };
  functionalRestDiagnostics: {
    light: FunctionalRestThemeDiagnostics;
    dark: FunctionalRestThemeDiagnostics;
  };
  primaryReference: {
    familyId: TonalFamilyId;
    light: TonalHarmonyFingerprint;
    dark: TonalHarmonyFingerprint;
  };
  functionalReferences: ResolvedTonalFamilyFunctionalReferences[];
  families: ResolvedTonalFamily[];
  issues: TonalSystemIssue[];
};

export type FailedKiskadeeTonalSystem = {
  valid: false;
  status: 'error';
  source: null;
  rest: {
    light: KiskadeeTone;
    dark: KiskadeeTone;
    source: 'auto-proposal' | 'locked';
  } | null;
  functionalRestDiagnostics: null;
  primaryReference: null;
  functionalReferences: [];
  families: ResolvedTonalFamily[];
  issues: TonalSystemIssue[];
};

export type KiskadeeTonalSystemResult = ResolvedKiskadeeTonalSystem | FailedKiskadeeTonalSystem;

export function resolveTonalFunctionalReference(
  system: ResolvedKiskadeeTonalSystem,
  familyId: TonalFamilyId,
  theme: KiskadeeTheme,
  kind: 'vivid' | 'subtle'
): TonalFunctionalReference {
  const family = system.functionalReferences.find((candidate) => candidate.id === familyId);
  if (!family) throw new Error(`Functional references are missing for ${familyId}.`);
  return family[theme][kind];
}

type RankedHarmonyCandidate = {
  requestedLightness: number;
  requestedUtilization: number;
  hex: string;
  oklch: OklchColor;
  maximumSrgbChroma: number;
  metrics: Omit<TonalHarmonyMetrics, 'candidatesEvaluated'>;
  darkSupportChromaModeration?: DarkSupportChromaModerationEvaluation;
};

type HarmonySeedCandidate = Omit<RankedHarmonyCandidate, 'metrics'>;

type CandidateResolution = {
  candidate: RankedHarmonyCandidate;
  scale: KiskadeeScaleResult;
  candidatesEvaluated: number;
};

type DarkSupportChromaModerationReference = {
  primaryFamilyId: TonalFamilyId;
  primaryScale: KiskadeeScaleResult;
  baselineScale: KiskadeeScaleResult;
};

type DarkSupportChromaModerationEvaluation = {
  evaluatedTones: KiskadeeTone[];
  limitingTone: KiskadeeTone | null;
  supportChroma: number;
  primaryChroma: number;
  chromaCap: number;
  maxExcess: number;
  maxChromaIncrease: number;
};

type MaterializedFamilySource = {
  id: TonalFamilyId;
  seedHex: string;
  seedOrigin: ResolvedTonalFamily['seedOrigin'];
  policies: { light: TonalThemePolicy; dark: TonalThemePolicy };
  identity: MunsellColorClassification | null;
};

type GlobalChromaSignature = {
  utilization: number;
  signedPeakOffset: number;
};

type HueChromaPeak = {
  lightness: number;
  chroma: number;
};

type FamilyHarmonyTarget = {
  rest: TonalHarmonyFingerprint;
  vividPeakGlobalUtilization: number;
  minimumRestBalanceRatio: number;
};

type SupportFamilyResolutionContext = {
  source: MaterializedFamilySource;
  familyKind: TonalFamilyColorKind;
  enforceSafeCore: boolean;
  lightHarmonyTarget: FamilyHarmonyTarget;
  darkHarmonyTarget: FamilyHarmonyTarget;
  lightHarmonyHueOverride?: number;
  darkHarmonyHueOverride?: number;
};

type IsolatedHarmonyPeakTarget = {
  familyId: TonalFamilyId;
  theme: KiskadeeTheme;
  detectionPeerFamilyId: TonalFamilyId;
  detectionPeerChroma: number;
  baselineRestChroma: number;
  adjacentRestChromaAverage: number;
  medianRestChroma: number;
  restDetectionCap: number;
  baselinePeakChroma: number;
  runnerUpFamilyId: TonalFamilyId;
  runnerUpPeakChroma: number;
  targetPeakChroma: number;
  targetLimitedBy: 'runner-up-envelope' | 'minimum-reduction';
  detectionExcess: number;
  baselinePeakTone: KiskadeeTone;
  baselinePeakLightness: number;
};

type FunctionalRestProposal = {
  tone: KiskadeeTone;
  harmonizedAnchorPreview?: {
    issues: TonalSystemIssue[];
    resolutions: ReadonlyMap<TonalFamilyId, ResolvedTonalTheme>;
  };
};

type FunctionalRestCandidateEvaluation = FunctionalRestThemeDiagnostics & {
  gridDistance: number;
  deficit: number;
};

type MaterializedTonalSystemRecipe = Pick<
  TonalSystemRecipeV5,
  | 'formatVersion'
  | 'gridContract'
  | 'harmonyContract'
  | 'tonalProfile'
  | 'tonalAnchors'
  | 'functionalReferences'
> & {
  authoringRecipe: TonalSystemRecipeV5;
  lockedFunctionalReferences: LockedTonalFamilyFunctionalReferencesV5[] | null;
  primaryReference: TonalFamilyId;
  useHueGlobalHarmony: boolean;
  families: MaterializedFamilySource[];
};

type AuthoringRecipeResolution =
  | {
      valid: true;
      recipe: TonalSystemRecipeV5;
      lockedPrimaryId: TonalFamilyId | null;
      lockedFunctionalReferences: LockedTonalFamilyFunctionalReferencesV5[] | null;
      issues: [];
    }
  | { valid: false; recipe: null; lockedPrimaryId: null; issues: TonalSystemIssue[] };

type MaterializedRecipeResolution =
  | {
      valid: true;
      recipe: MaterializedTonalSystemRecipe;
      issues: TonalSystemIssue[];
    }
  | { valid: false; recipe: null; issues: TonalSystemIssue[] };

function resolveAuthoringRecipe(input: unknown): AuthoringRecipeResolution {
  const draft = validateTonalSystemRecipe(input);
  if (draft.valid) {
    return {
      valid: true,
      recipe: draft.value,
      lockedPrimaryId: null,
      lockedFunctionalReferences: null,
      issues: []
    };
  }

  const locked = validateLockedTonalSystemSource(input);
  if (locked.valid) {
    const parsed = parseTonalFamilyId(locked.value.primary.id);
    if (!parsed || parsed.sector === null) {
      return {
        valid: false,
        recipe: null,
        lockedPrimaryId: null,
        issues: [
          {
            severity: 'error',
            code: 'ACHROMATIC_PRIMARY_UNSUPPORTED',
            path: '/primary/id',
            message: 'The locked primary must identify a chromatic Munsell sector.'
          }
        ]
      };
    }

    return {
      valid: true,
      recipe: {
        formatVersion: locked.value.formatVersion,
        gridContract: locked.value.gridContract,
        harmonyContract: locked.value.harmonyContract,
        tonalProfile: locked.value.tonalProfile,
        primary: {
          seedHex: locked.value.primary.seedHex,
          appearance: parsed.appearance as TonalChromaticAppearance,
          variant: parsed.variant,
          policies: { ...locked.value.primary.policies }
        },
        tonalAnchors: locked.value.tonalAnchors,
        functionalReferences: [],
        overrides: locked.value.overrides
      },
      lockedPrimaryId: locked.value.primary.id,
      lockedFunctionalReferences: locked.value.functionalReferences,
      issues: []
    };
  }

  const lockedLike =
    typeof input === 'object' &&
    input !== null &&
    'primary' in input &&
    typeof input.primary === 'object' &&
    input.primary !== null &&
    'id' in input.primary;
  const validationIssues = lockedLike ? locked.issues : draft.issues;
  return {
    valid: false,
    recipe: null,
    lockedPrimaryId: null,
    issues: validationIssues.map((issue) => ({ ...issue, severity: 'error' as const }))
  };
}

function materializeTonalSystemRecipe(
  authoringRecipe: TonalSystemRecipeV5,
  lockedPrimaryId: TonalFamilyId | null,
  lockedFunctionalReferences: LockedTonalFamilyFunctionalReferencesV5[] | null
): MaterializedRecipeResolution {
  const issues: TonalSystemIssue[] = [];
  const primaryIdentity = classifyMunsellHex(authoringRecipe.primary.seedHex);

  const suggestedAppearance: TonalChromaticAppearance | undefined =
    primaryIdentity.sector === 'yellow-red'
      ? suggestYellowRedAppearance(primaryIdentity.oklch).appearance
      : (parseTonalFamilyId(TONAL_BASE_FAMILY_ID_BY_SECTOR[primaryIdentity.sector])?.appearance as
          | TonalChromaticAppearance
          | undefined);
  if (!suggestedAppearance) {
    throw new Error(`Missing canonical appearance for ${primaryIdentity.sector}.`);
  }
  const resolvedAppearance =
    authoringRecipe.primary.appearance === 'auto'
      ? suggestedAppearance
      : authoringRecipe.primary.appearance;
  const primaryStem = resolveTonalFamilyStem(primaryIdentity.sector, resolvedAppearance);
  const resolvedVariant = authoringRecipe.primary.variant;
  const primaryId = primaryStem
    ? createTonalFamilyId(primaryStem, resolvedVariant)
    : TONAL_BASE_FAMILY_ID_BY_SECTOR[primaryIdentity.sector];

  if (!primaryStem) {
    issues.push({
      severity: 'error',
      code: 'PRIMARY_APPEARANCE_SECTOR_MISMATCH',
      path: '/primary/appearance',
      message: `${resolvedAppearance} is not a supported appearance in the ${primaryIdentity.sector} sector.`
    });
  }

  for (const diagnostic of primaryIdentity.diagnostics) {
    issues.push({
      severity: diagnostic.severity,
      code: diagnostic.code,
      path: '/primary/seedHex',
      message: diagnostic.message,
      familyId: primaryId
    });
  }

  if (lockedPrimaryId) {
    const parsedLocked = parseTonalFamilyId(lockedPrimaryId);
    if (
      !parsedLocked ||
      parsedLocked.sector !== primaryIdentity.sector ||
      parsedLocked.appearance !== resolvedAppearance ||
      parsedLocked.variant !== resolvedVariant
    ) {
      issues.push({
        severity: 'error',
        code: 'LOCKED_PRIMARY_CLASSIFICATION_MISMATCH',
        path: '/primary/id',
        message: `Locked primary ${lockedPrimaryId} does not match the ${primaryIdentity.sector} ${resolvedAppearance} ${resolvedVariant} classification.`,
        familyId: lockedPrimaryId
      });
    }
  }

  if (
    primaryIdentity.sector === 'yellow-red' &&
    resolvedAppearance === 'brown' &&
    suggestYellowRedAppearance(primaryIdentity.oklch).appearance !== 'brown'
  ) {
    issues.push({
      severity: 'error',
      code: 'BROWN_APPEARANCE_MISMATCH',
      path: '/primary/appearance',
      message: `${primaryId} is a Brown appearance, but the primary is closer to Orange.`,
      familyId: primaryId
    });
  }

  const overrideById = new Map(
    authoringRecipe.overrides.map((override) => [override.id, override])
  );
  if (overrideById.has(primaryId)) {
    issues.push({
      severity: 'error',
      code: 'PRIMARY_OVERRIDE_CONFLICT',
      path: '/overrides',
      message: `Primary ${primaryId} cannot also be configured as an override.`,
      familyId: primaryId
    });
  }

  if (issues.some((issue) => issue.severity === 'error')) {
    return { valid: false, recipe: null, issues: sortIssues(issues) };
  }

  const primarySignature = resolveGlobalChromaSignature(primaryIdentity.oklch);
  const useHueGlobalHarmony =
    primarySignature.utilization >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum;

  const families = new Map<TonalFamilyId, MaterializedFamilySource>();
  families.set(primaryId, {
    id: primaryId,
    seedHex: authoringRecipe.primary.seedHex,
    seedOrigin: 'primary',
    policies: { ...authoringRecipe.primary.policies },
    identity: primaryIdentity
  });

  for (const id of TONAL_CORE_FAMILY_IDS) {
    if (id === primaryId) continue;
    const override = overrideById.get(id);
    if (override) {
      const resolved = materializeOverride(override, issues);
      if (resolved) families.set(id, resolved);
      continue;
    }

    const referenceSeedHex = FIXED_FAMILY_SEEDS_V2[id];
    if (id === 'n.black.v1') {
      families.set(id, {
        id,
        seedHex: referenceSeedHex,
        seedOrigin: 'canonical',
        policies: { light: 'source-exact', dark: 'source-exact' },
        identity: null
      });
      continue;
    }

    const parsed = parseTonalFamilyId(id);
    if (!parsed?.sector) continue;
    const referenceIdentity = classifyMunsellHex(referenceSeedHex);
    if (referenceIdentity.sector !== parsed.sector) {
      issues.push({
        severity: 'error',
        code: 'REFERENCE_SEED_SECTOR_MISMATCH',
        path: `/references/${id}`,
        message: `${id} fixed reference classifies as ${referenceIdentity.sector} instead of ${parsed.sector}.`,
        familyId: id
      });
      continue;
    }

    families.set(id, {
      id,
      seedHex: referenceSeedHex,
      seedOrigin: 'reference',
      policies: { light: 'harmonized', dark: 'harmonized' },
      identity: referenceIdentity
    });
  }

  for (const override of authoringRecipe.overrides) {
    if (
      CORE_FAMILY_IDS.has(override.id) ||
      families.has(override.id) ||
      override.id === primaryId
    ) {
      continue;
    }
    const resolved = materializeOverride(override, issues);
    if (resolved) families.set(override.id, resolved);
  }

  for (const [index, references] of authoringRecipe.functionalReferences.entries()) {
    if (!families.has(references.id)) {
      issues.push({
        severity: 'error',
        code: 'FUNCTIONAL_REFERENCE_FAMILY_NOT_FOUND',
        path: `/functionalReferences/${index}/id`,
        message: `Functional references target ${references.id}, but that family is not part of this tonal system.`,
        familyId: references.id
      });
      continue;
    }
    if (
      references.id !== primaryId &&
      (references.light.subtle.mode === 'reference-match' ||
        references.dark.subtle.mode === 'reference-match')
    ) {
      issues.push({
        severity: 'error',
        code: 'SUPPORT_REFERENCE_MATCH_UNSUPPORTED',
        path: `/functionalReferences/${index}`,
        message: 'Only the Primary may use a HEX target to calibrate its subtle reference.',
        familyId: references.id
      });
    }
  }

  if (issues.some((issue) => issue.severity === 'error')) {
    return { valid: false, recipe: null, issues: sortIssues(issues) };
  }

  return {
    valid: true,
    recipe: {
      formatVersion: authoringRecipe.formatVersion,
      gridContract: authoringRecipe.gridContract,
      harmonyContract: authoringRecipe.harmonyContract,
      tonalProfile: authoringRecipe.tonalProfile,
      tonalAnchors: authoringRecipe.tonalAnchors,
      functionalReferences: authoringRecipe.functionalReferences,
      authoringRecipe,
      lockedFunctionalReferences,
      primaryReference: primaryId,
      useHueGlobalHarmony,
      families: [...families.values()].sort((left, right) => compareStrings(left.id, right.id))
    },
    issues: sortIssues(issues)
  };
}

/**
 * Deferred primary-derived family strategy. Fixed references are the active
 * runtime model while harmony is calibrated in isolation.
 */
function _resolveSafeDerivedSeed(params: {
  utilization: number;
  lightness?: number;
  signedPeakOffset?: number;
  sector: TonalFamilySector;
  projectedPosition: number;
}): {
  seedHex: string;
  identity: MunsellColorClassification;
  quantizationInsetApplied: boolean;
} | null {
  const {
    utilization,
    lightness: fixedLightness,
    signedPeakOffset,
    sector,
    projectedPosition
  } = params;
  const definition = getMunsellOklchSectorDefinition(sector);
  const guardedStart =
    MUNSELL_OKLCH_SAFE_CORE.start + DEFERRED_PRIMARY_DERIVATION_V1_PARAMETERS.quantizationSafeInset;
  const guardedEnd =
    MUNSELL_OKLCH_SAFE_CORE.end - DEFERRED_PRIMARY_DERIVATION_V1_PARAMETERS.quantizationSafeInset;
  const guardedPosition = clamp(projectedPosition, guardedStart, guardedEnd);
  const centerPosition = getMunsellOklchSectorCenterPosition(sector);
  const utilizationRatio = Math.min(1, Math.max(0.04, utilization));
  const attempts = 40;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const position = guardedPosition + (centerPosition - guardedPosition) * (attempt / attempts);
    const hue = normalizeMunsellHue(definition.startHue + definition.spanDegrees * position);
    const peak = fixedLightness === undefined ? resolveHueChromaPeak(hue) : null;
    const desiredLightness =
      fixedLightness ??
      resolveLightnessFromPeakOffset(peak?.lightness ?? 50, signedPeakOffset ?? 0);
    const desiredChroma = (peak?.chroma ?? maxSrgbChroma(desiredLightness, hue)) * utilizationRatio;
    const lightness = peak
      ? resolveNearestGlobalChromaLightness({ desiredLightness, desiredChroma, hue, peak })
      : desiredLightness;
    const seedHex = oklchToSrgbHex({
      l: lightness,
      c: desiredChroma,
      h: hue
    }).hex;
    const identity = classifyMunsellHex(seedHex);

    if (identity.sector === sector && identity.isInSafeCore) {
      return {
        seedHex,
        identity,
        quantizationInsetApplied: Math.abs(position - projectedPosition) > 0.000_001
      };
    }
  }

  return null;
}

const HUE_CHROMA_PEAK_CACHE = new Map<string, HueChromaPeak>();

function resolveGlobalChromaSignature(color: OklchColor): GlobalChromaSignature {
  const peak = resolveHueChromaPeak(color.h);
  const signedPeakOffset =
    color.l >= peak.lightness
      ? (color.l - peak.lightness) / Math.max(100 - peak.lightness, 0.000_001)
      : (color.l - peak.lightness) / Math.max(peak.lightness, 0.000_001);

  return {
    utilization: peak.chroma <= 0 ? 0 : clamp(color.c / peak.chroma, 0, 1),
    signedPeakOffset: clamp(signedPeakOffset, -1, 1)
  };
}

/** Deferred with the primary-derived family strategy above. */
function _requiresPrimaryDerivedGlobalSignature(primary: MunsellColorClassification): boolean {
  const sourceSignature = resolveGlobalChromaSignature(primary.oklch);
  if (
    sourceSignature.utilization < MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum
  ) {
    return false;
  }

  let minimumProjectedCapacityRatio = Number.POSITIVE_INFINITY;
  for (const sector of MUNSELL_SECTORS) {
    const projection = projectMunsellHue(primary.oklch.h, sector);
    const definition = getMunsellOklchSectorDefinition(sector);
    const hue = normalizeMunsellHue(
      definition.startHue + definition.spanDegrees * projection.projectedPosition
    );
    const peak = resolveHueChromaPeak(hue);
    const capacity = peak.chroma <= 0 ? 0 : maxSrgbChroma(primary.oklch.l, hue) / peak.chroma;
    minimumProjectedCapacityRatio = Math.min(
      minimumProjectedCapacityRatio,
      sourceSignature.utilization <= 0 ? 1 : capacity / sourceSignature.utilization
    );
  }

  return (
    minimumProjectedCapacityRatio <
    MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio
  );
}

function resolveHueChromaPeak(hue: number): HueChromaPeak {
  const normalizedHue = normalizeMunsellHue(hue);
  const cacheKey = normalizedHue.toFixed(6);
  const cached = HUE_CHROMA_PEAK_CACHE.get(cacheKey);
  if (cached) return cached;

  let best: HueChromaPeak = {
    lightness: 0.5,
    chroma: estimateMaxSrgbChroma(0.5, normalizedHue)
  };
  for (let lightness = 4.5; lightness <= 96.5; lightness += 4) {
    const chroma = estimateMaxSrgbChroma(lightness, normalizedHue);
    if (
      chroma > best.chroma + 1e-12 ||
      (Math.abs(chroma - best.chroma) <= 1e-12 && lightness < best.lightness)
    ) {
      best = { lightness, chroma };
    }
  }
  const upperChroma = estimateMaxSrgbChroma(99.5, normalizedHue);
  if (upperChroma > best.chroma + 1e-12) best = { lightness: 99.5, chroma: upperChroma };

  const coarseRefinementStart = Math.max(0.5, best.lightness - 4);
  const coarseRefinementEnd = Math.min(99.5, best.lightness + 4);
  for (let lightness = coarseRefinementStart; lightness <= coarseRefinementEnd; lightness += 0.2) {
    const chroma = estimateMaxSrgbChroma(lightness, normalizedHue);
    if (
      chroma > best.chroma + 1e-12 ||
      (Math.abs(chroma - best.chroma) <= 1e-12 && lightness < best.lightness)
    ) {
      best = { lightness, chroma };
    }
  }

  const fineRefinementStart = Math.max(0.5, best.lightness - 0.2);
  const fineRefinementEnd = Math.min(99.5, best.lightness + 0.2);
  for (let lightness = fineRefinementStart; lightness <= fineRefinementEnd; lightness += 0.01) {
    const chroma = estimateMaxSrgbChroma(lightness, normalizedHue);
    if (
      chroma > best.chroma + 1e-12 ||
      (Math.abs(chroma - best.chroma) <= 1e-12 && lightness < best.lightness)
    ) {
      best = { lightness, chroma };
    }
  }

  const resolved = {
    lightness: Number(best.lightness.toFixed(6)),
    chroma: best.chroma
  };
  HUE_CHROMA_PEAK_CACHE.set(cacheKey, resolved);
  return resolved;
}

function resolveLightnessFromPeakOffset(peakLightness: number, signedPeakOffset: number): number {
  return signedPeakOffset >= 0
    ? peakLightness + signedPeakOffset * (100 - peakLightness)
    : peakLightness + signedPeakOffset * peakLightness;
}

function resolveNearestGlobalChromaLightness(params: {
  desiredLightness: number;
  desiredChroma: number;
  hue: number;
  peak: HueChromaPeak;
}): number {
  const { desiredLightness, desiredChroma, hue, peak } = params;
  const clampedDesired = clamp(desiredLightness, 0.5, 99.5);
  if (maxSrgbChroma(clampedDesired, hue) >= desiredChroma - 1e-9) return clampedDesired;

  if (clampedDesired < peak.lightness) {
    let insufficient = clampedDesired;
    let sufficient = peak.lightness;
    for (let iteration = 0; iteration < 28; iteration += 1) {
      const middle = (insufficient + sufficient) / 2;
      if (maxSrgbChroma(middle, hue) >= desiredChroma) sufficient = middle;
      else insufficient = middle;
    }
    return sufficient;
  }

  let sufficient = peak.lightness;
  let insufficient = clampedDesired;
  for (let iteration = 0; iteration < 28; iteration += 1) {
    const middle = (sufficient + insufficient) / 2;
    if (maxSrgbChroma(middle, hue) >= desiredChroma) sufficient = middle;
    else insufficient = middle;
  }
  return sufficient;
}

function resolveFunctionalRestProposal(params: {
  theme: KiskadeeTheme;
  primaryScale: KiskadeeScaleResult;
  primarySource: MaterializedFamilySource;
  recipe: MaterializedTonalSystemRecipe;
  lockedTone?: KiskadeeTone;
}): FunctionalRestProposal {
  const { theme, primaryScale, primarySource, recipe, lockedTone } = params;
  const sourceAnchorTone = primaryScale.anchorTone;
  if (sourceAnchorTone === null) {
    throw new Error(`Cannot resolve ${theme} functional rest without a primary source anchor.`);
  }

  const baselineByFamily = new Map<TonalFamilyId, KiskadeeScaleResult>();
  for (const familyId of TONAL_BASE_FAMILY_IDS) {
    const source = recipe.families.find((family) => family.id === familyId);
    if (!source) continue;
    const scale =
      familyId === primarySource.id
        ? primaryScale
        : generateKiskadeeScale({
            seedHex: source.seedHex,
            theme,
            profile: recipe.tonalProfile
          });
    if (scale.diagnostics.valid) baselineByFamily.set(familyId, scale);
  }

  const primarySourceUtilization = normalizePrimaryGlobalUtilization(
    primarySource.id,
    resolveGlobalChromaSignature(hexToOklch(primarySource.seedHex)).utilization
  );
  const sourceIndex = KISKADEE_TONES.indexOf(sourceAnchorTone);
  const tones = lockedTone === undefined ? REST_TONES : [lockedTone];
  const evaluations = tones
    .map((tone) =>
      evaluateFunctionalRestCandidate({
        theme,
        tone,
        sourceAnchorTone,
        sourceIndex,
        primaryScale,
        primaryId: primarySource.id,
        primarySourceUtilization,
        baselines: baselineByFamily
      })
    )
    .filter((candidate): candidate is FunctionalRestCandidateEvaluation => candidate !== null);

  const vividnessGuardApplied =
    primarySourceUtilization >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum;
  const sourceAnchorEvaluation = evaluations.find(
    (candidate) => candidate.functionalRestTone === sourceAnchorTone
  );
  const sourceAnchorBalanceRatio =
    MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio -
    MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceTolerance;
  const sourceAnchorNeedsBalance =
    sourceAnchorEvaluation !== undefined &&
    (sourceAnchorEvaluation.minimumFamilyRatio < sourceAnchorBalanceRatio ||
      sourceAnchorEvaluation.maximumFamilyRatio > 1 / sourceAnchorBalanceRatio);
  const supportsPaleHueGlobalPreview =
    !vividnessGuardApplied &&
    sourceAnchorNeedsBalance &&
    hexToOklch(primarySource.seedHex).c >= MUNSELL_OKLCH_PRIMARY_CHROMA.lowConfidenceCeiling &&
    (lockedTone === undefined || lockedTone === sourceAnchorTone);
  const shouldTrySourceAnchorPreview =
    (lockedTone === undefined && vividnessGuardApplied) || supportsPaleHueGlobalPreview;

  if (shouldTrySourceAnchorPreview) {
    const harmonizedAnchorPreview = resolveHarmonizedSourceAnchorPreview({
      theme,
      primaryScale,
      primarySource,
      recipe,
      primarySourceUtilization,
      chromaModelOverride: supportsPaleHueGlobalPreview ? 'hue-global' : undefined,
      requireIdentifiableSupports: supportsPaleHueGlobalPreview
    });
    if (harmonizedAnchorPreview) {
      return { tone: sourceAnchorTone, harmonizedAnchorPreview };
    }
  }

  if (lockedTone === undefined && !vividnessGuardApplied) {
    return { tone: sourceAnchorTone };
  }

  const balanced = evaluations
    .filter((candidate) => candidate.balanced)
    .sort(compareFunctionalRestCandidates)[0];
  const best = balanced ?? evaluations.sort(compareRelaxedFunctionalRestCandidates)[0];
  if (!best) {
    return { tone: sourceAnchorTone };
  }

  return { tone: best.functionalRestTone };
}

function resolveHarmonizedSourceAnchorPreview(params: {
  theme: KiskadeeTheme;
  primaryScale: KiskadeeScaleResult;
  primarySource: MaterializedFamilySource;
  recipe: MaterializedTonalSystemRecipe;
  primarySourceUtilization: number;
  chromaModelOverride?: TonalHarmonyMetrics['chromaModel'];
  requireIdentifiableSupports?: boolean;
}): NonNullable<FunctionalRestProposal['harmonizedAnchorPreview']> | null {
  const {
    theme,
    primaryScale,
    primarySource,
    recipe,
    primarySourceUtilization,
    chromaModelOverride,
    requireIdentifiableSupports = false
  } = params;
  const sourceAnchorTone = primaryScale.anchorTone;
  if (sourceAnchorTone === null) return null;

  const primaryColor = resolveTone(primaryScale, sourceAnchorTone);
  if (!primaryColor) return null;

  const reference = fingerprintFromColor({
    familyId: primarySource.id,
    theme,
    tone: sourceAnchorTone,
    color: primaryColor,
    policy:
      theme === 'dark' && primarySource.policies.dark === 'adaptive' ? 'adaptive' : 'source-exact',
    recipe
  });
  const previewIssues: TonalSystemIssue[] = [];
  const resolutions = new Map<TonalFamilyId, ResolvedTonalTheme>();
  const emittedByFamily = new Map<TonalFamilyId, KiskadeeScaleResult>();

  for (const familyId of TONAL_BASE_FAMILY_IDS) {
    if (familyId === primarySource.id) {
      emittedByFamily.set(familyId, primaryScale);
      continue;
    }

    const source = recipe.families.find((family) => family.id === familyId);
    if (!source) return null;
    const resolution = resolveConfiguredFamilyTheme({
      familyId,
      sourceSeedHex: source.seedHex,
      familyKind: 'chromatic',
      policy: source.policies[theme],
      theme,
      restTone: sourceAnchorTone,
      harmonyTarget: resolveFamilyHarmonyTarget(
        reference,
        primarySource.id,
        familyId,
        primarySourceUtilization,
        MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio
      ),
      harmonyHueOverride: resolveAdjacentFamilyHarmonyHue({
        primaryId: primarySource.id,
        primaryHue: primaryColor.oklch.h,
        familyId,
        sourceSeedHex: source.seedHex,
        policy: source.policies[theme]
      }),
      enforceSafeCore: source.seedOrigin === 'derived',
      chromaModelOverride,
      recipe,
      issues: previewIssues
    });
    if (!resolution) return null;

    validateResolvedFamilyIdentity(
      familyId,
      resolution,
      source.seedOrigin === 'derived',
      previewIssues
    );
    if (previewIssues.some((issue) => issue.severity === 'error')) return null;

    resolutions.set(familyId, resolution);
    emittedByFamily.set(familyId, resolution.scale);
  }

  const evaluation = evaluateFunctionalRestCandidate({
    theme,
    tone: sourceAnchorTone,
    sourceAnchorTone,
    sourceIndex: KISKADEE_TONES.indexOf(sourceAnchorTone),
    primaryScale,
    primaryId: primarySource.id,
    primarySourceUtilization,
    baselines: emittedByFamily
  });
  if (!evaluation) return null;

  const ratio = MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio;
  const balanceTolerance = requireIdentifiableSupports
    ? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceTolerance
    : 0;
  const effectiveBalanceRatio = ratio - balanceTolerance;
  const sourceRetentionAccepted =
    !evaluation.vividnessGuardApplied ||
    evaluation.sourceRetention >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceRetention;
  const balanceAccepted =
    evaluation.minimumFamilyRatio >= effectiveBalanceRatio &&
    evaluation.maximumFamilyRatio <= 1 / effectiveBalanceRatio;
  const supportsAreIdentifiable =
    !requireIdentifiableSupports ||
    [...emittedByFamily.entries()].every(([familyId, scale]) => {
      if (familyId === primarySource.id) return true;
      const color = resolveTone(scale, sourceAnchorTone);
      return (
        color !== undefined &&
        color.oklch.c >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSupportChromaFloor
      );
    });
  const accepted = sourceRetentionAccepted && balanceAccepted && supportsAreIdentifiable;

  return accepted ? { issues: previewIssues, resolutions } : null;
}

function evaluateFunctionalRestCandidate(params: {
  theme: KiskadeeTheme;
  tone: KiskadeeTone;
  sourceAnchorTone: KiskadeeTone;
  sourceIndex: number;
  primaryScale: KiskadeeScaleResult;
  primaryId: TonalFamilyId;
  primarySourceUtilization: number;
  baselines: ReadonlyMap<TonalFamilyId, KiskadeeScaleResult>;
}): FunctionalRestCandidateEvaluation | null {
  const {
    theme,
    tone,
    sourceAnchorTone,
    sourceIndex,
    primaryScale,
    primaryId,
    primarySourceUtilization,
    baselines
  } = params;
  const primaryColor = resolveTone(primaryScale, tone);
  if (!primaryColor) return null;

  const primaryRestUtilization = normalizePrimaryGlobalUtilization(
    primaryId,
    resolveScaleToneGlobalUtilization(primaryScale, primaryColor)
  );
  const familyRatios: number[] = [];
  for (const scale of baselines.values()) {
    const color = resolveTone(scale, tone);
    if (!color) return null;
    const utilization = resolveScaleToneGlobalUtilization(scale, color);
    familyRatios.push(
      primaryRestUtilization <= 0.000_001 ? 1 : utilization / primaryRestUtilization
    );
  }

  if (familyRatios.length !== MUNSELL_SECTORS.length) return null;
  const minimumFamilyRatio = Math.min(...familyRatios);
  const maximumFamilyRatio = Math.max(...familyRatios);
  const sourceRetention =
    primarySourceUtilization <= 0.000_001 ? 1 : primaryRestUtilization / primarySourceUtilization;
  const minimumRatio = MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio;
  const maximumRatio = 1 / minimumRatio;
  const minimumRetention = MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceRetention;
  const retentionDeficit = Math.max(0, minimumRetention - sourceRetention) / minimumRetention;
  const lowerBalanceDeficit = Math.max(0, minimumRatio - minimumFamilyRatio) / minimumRatio;
  const upperBalanceDeficit = Math.max(0, maximumFamilyRatio - maximumRatio) / maximumRatio;
  const vividnessGuardApplied =
    primarySourceUtilization >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum;
  const balanced =
    !vividnessGuardApplied ||
    (retentionDeficit <= 1e-12 && lowerBalanceDeficit <= 1e-12 && upperBalanceDeficit <= 1e-12);

  return {
    theme,
    sourceAnchorTone,
    functionalRestTone: tone,
    sourceGlobalChromaUtilization: primarySourceUtilization,
    restGlobalChromaUtilization: primaryRestUtilization,
    sourceRetention,
    minimumFamilyRatio,
    maximumFamilyRatio,
    vividnessGuardApplied,
    balanced,
    gridDistance: Math.abs(KISKADEE_TONES.indexOf(tone) - sourceIndex),
    deficit: vividnessGuardApplied
      ? Math.max(retentionDeficit, lowerBalanceDeficit, upperBalanceDeficit)
      : 0
  };
}

function resolveScaleToneGlobalUtilization(
  scale: KiskadeeScaleResult,
  color: KiskadeeScaleColor
): number {
  const anchor = scale.anchorTone === null ? null : resolveTone(scale, scale.anchorTone);
  const globalMaximum = resolveHueChromaPeak(anchor?.oklch.h ?? color.oklch.h).chroma;
  return globalMaximum <= 0 ? 0 : clamp(color.oklch.c / globalMaximum, 0, 1);
}

function resolveScalePeakGlobalUtilization(scale: KiskadeeScaleResult): number {
  const anchor = scale.anchorTone === null ? null : resolveTone(scale, scale.anchorTone);
  if (!anchor) return 0;

  const globalMaximum = resolveHueChromaPeak(anchor.oklch.h).chroma;
  if (globalMaximum <= 0) return 0;
  return scale.colors.reduce(
    (maximum, color) => Math.max(maximum, clamp(color.oklch.c / globalMaximum, 0, 1)),
    0
  );
}

function compareFunctionalRestCandidates(
  left: FunctionalRestCandidateEvaluation,
  right: FunctionalRestCandidateEvaluation
): number {
  const distance = left.gridDistance - right.gridDistance;
  if (distance !== 0) return distance;
  return left.functionalRestTone - right.functionalRestTone;
}

function compareRelaxedFunctionalRestCandidates(
  left: FunctionalRestCandidateEvaluation,
  right: FunctionalRestCandidateEvaluation
): number {
  const deficit = left.deficit - right.deficit;
  if (Math.abs(deficit) > 1e-12) return deficit;
  return compareFunctionalRestCandidates(left, right);
}

function normalizePrimaryGlobalUtilization(familyId: TonalFamilyId, utilization: number): number {
  return isBrownFamilyId(familyId)
    ? Math.min(1, utilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio)
    : utilization;
}

function isBrownFamilyId(familyId: TonalFamilyId): boolean {
  return parseTonalFamilyId(familyId)?.appearance === 'brown';
}

function resolveEmittedFunctionalRestDiagnostics(params: {
  theme: KiskadeeTheme;
  primarySource: MaterializedFamilySource;
  primaryFamily: ResolvedTonalFamily;
  families: ResolvedTonalFamily[];
}): FunctionalRestThemeDiagnostics {
  const { theme, primarySource, primaryFamily, families } = params;
  const primary = primaryFamily.themes[theme];
  const sourceAnchorTone = primary.scale.anchorTone;
  if (sourceAnchorTone === null) {
    throw new Error(`Cannot diagnose ${theme} functional rest without a primary source anchor.`);
  }

  const sourceGlobalChromaUtilization = normalizePrimaryGlobalUtilization(
    primarySource.id,
    resolveGlobalChromaSignature(hexToOklch(primarySource.seedHex)).utilization
  );
  const restGlobalChromaUtilization = normalizePrimaryGlobalUtilization(
    primarySource.id,
    resolveScaleToneGlobalUtilization(primary.scale, primary.restColor)
  );
  const familyRatios = families
    .filter((family) => family.colorKind === 'chromatic' && BASE_FAMILY_IDS.has(family.id))
    .map((family) => {
      const resolution = family.themes[theme];
      const utilization = resolveScaleToneGlobalUtilization(resolution.scale, resolution.restColor);
      return restGlobalChromaUtilization <= 0.000_001
        ? 1
        : utilization / restGlobalChromaUtilization;
    });
  const minimumFamilyRatio = familyRatios.length === 0 ? 0 : Math.min(...familyRatios);
  const maximumFamilyRatio = familyRatios.length === 0 ? 0 : Math.max(...familyRatios);
  const sourceRetention =
    sourceGlobalChromaUtilization <= 0.000_001
      ? 1
      : restGlobalChromaUtilization / sourceGlobalChromaUtilization;
  const vividnessGuardApplied =
    sourceGlobalChromaUtilization >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum;
  const exactSourceAnchor = primary.restTone === sourceAnchorTone;
  const balanceRatio = exactSourceAnchor
    ? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio
    : MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio;
  const balanced =
    !vividnessGuardApplied ||
    (sourceRetention >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceRetention - 1e-12 &&
      minimumFamilyRatio >= balanceRatio - 1e-12 &&
      maximumFamilyRatio <= 1 / balanceRatio + 1e-12);

  return {
    theme,
    sourceAnchorTone,
    functionalRestTone: primary.restTone,
    sourceGlobalChromaUtilization,
    restGlobalChromaUtilization,
    sourceRetention,
    minimumFamilyRatio,
    maximumFamilyRatio,
    vividnessGuardApplied,
    balanced
  };
}

function materializeOverride(
  override: TonalFamilyOverrideV5,
  issues: TonalSystemIssue[]
): MaterializedFamilySource | null {
  const parsed = parseTonalFamilyId(override.id);
  if (!parsed) return null;

  if (parsed.sector === null) {
    return {
      ...override,
      policies: { ...override.policies },
      seedOrigin: 'override',
      identity: null
    };
  }

  const identity = classifyMunsellHex(override.seedHex);
  if (identity.sector !== parsed.sector) {
    issues.push({
      severity: 'error',
      code: 'OVERRIDE_SECTOR_MISMATCH',
      path: `/overrides/${override.id}/seedHex`,
      message: `${override.id} expects ${parsed.sector}, but its seed classifies as ${identity.sector}.`,
      familyId: override.id
    });
    return null;
  }
  if (
    isBrownFamilyId(override.id) &&
    suggestYellowRedAppearance(identity.oklch).appearance !== 'brown'
  ) {
    issues.push({
      severity: 'error',
      code: 'BROWN_APPEARANCE_MISMATCH',
      path: `/overrides/${override.id}/seedHex`,
      message: `${override.id} is reserved for Brown and cannot use an Orange-like seed.`,
      familyId: override.id
    });
    return null;
  }
  if (!identity.isInSafeCore) {
    issues.push({
      severity: 'review',
      code: 'MUNSELL_OVERRIDE_NEAR_BOUNDARY',
      path: `/overrides/${override.id}/seedHex`,
      message: `${override.id} is valid but lies in the outer 15% of its Munsell sector.`,
      familyId: override.id
    });
  }

  return {
    ...override,
    policies: { ...override.policies },
    seedOrigin: 'override',
    identity
  };
}

export function generateKiskadeeTonalSystem(input: unknown): KiskadeeTonalSystemResult {
  const authoring = resolveAuthoringRecipe(input);
  if (!authoring.valid) return failedResult(authoring.issues);

  const materialization = materializeTonalSystemRecipe(
    authoring.recipe,
    authoring.lockedPrimaryId,
    authoring.lockedFunctionalReferences
  );
  if (!materialization.valid) return failedResult(materialization.issues);

  const recipe = materialization.recipe;
  const issues: TonalSystemIssue[] = [...materialization.issues];
  const primarySource = recipe.families.find((family) => family.id === recipe.primaryReference);

  if (!primarySource) {
    return failedResult([
      {
        severity: 'error',
        code: 'PRIMARY_NOT_FOUND',
        path: '/primary',
        message: 'Primary reference is missing from the normalized family collection.'
      }
    ]);
  }
  const primaryDarkPolicy = primarySource.policies.dark;

  const primarySourceOklch = hexToOklch(primarySource.seedHex);
  if (primarySourceOklch.c < HARMONY_V1_PARAMETERS.reliableHueMinimumChroma) {
    return failedResult([
      {
        severity: 'error',
        code: 'PRIMARY_HUE_UNRELIABLE',
        path: familyPath(recipe, recipe.primaryReference, 'seedHex'),
        message: `The ${recipe.primaryReference} seed is too achromatic to establish a chromatic harmony reference.`,
        familyId: recipe.primaryReference
      }
    ]);
  }

  const primaryExactLight = generateKiskadeeScale({
    seedHex: primarySource.seedHex,
    theme: 'light',
    profile: recipe.tonalProfile
  });
  const primaryExactDark = generateKiskadeeScale({
    seedHex: primarySource.seedHex,
    theme: 'dark',
    profile: recipe.tonalProfile
  });

  if (!primaryExactLight.diagnostics.valid || !primaryExactDark.diagnostics.valid) {
    const primaryIssues: TonalSystemIssue[] = [];
    if (!primaryExactLight.diagnostics.valid) {
      primaryIssues.push(scaleFailureIssue(recipe.primaryReference, 'light', primaryExactLight));
    }
    if (!primaryExactDark.diagnostics.valid) {
      primaryIssues.push(scaleFailureIssue(recipe.primaryReference, 'dark', primaryExactDark));
    }
    return failedResult(primaryIssues);
  }

  const sourceLightAnchor = primaryExactLight.anchorTone;
  const sourceDarkAnchor = primaryExactDark.anchorTone;
  if (sourceLightAnchor === null || sourceDarkAnchor === null) {
    return failedResult([
      {
        severity: 'error',
        code: 'PRIMARY_ANCHOR_MISSING',
        path: '/primary',
        message: 'The primary scale did not resolve both theme anchors.'
      }
    ]);
  }

  const lightRestProposal = resolveFunctionalRestProposal({
    theme: 'light',
    primaryScale: primaryExactLight,
    primarySource,
    recipe,
    lockedTone:
      recipe.tonalAnchors.rest.mode === 'locked' ? recipe.tonalAnchors.rest.light : undefined
  });
  const darkRestProposal = resolveFunctionalRestProposal({
    theme: 'dark',
    primaryScale: primaryExactDark,
    primarySource,
    recipe,
    lockedTone:
      recipe.tonalAnchors.rest.mode === 'locked' ? recipe.tonalAnchors.rest.dark : undefined
  });
  const rest = {
    light: lightRestProposal.tone,
    dark: darkRestProposal.tone,
    source:
      recipe.tonalAnchors.rest.mode === 'auto' ? ('auto-proposal' as const) : ('locked' as const)
  };
  issues.push(
    ...(lightRestProposal.harmonizedAnchorPreview?.issues ?? []),
    ...(darkRestProposal.harmonizedAnchorPreview?.issues ?? [])
  );

  const primaryLight = resolveSourceExactTheme({
    familyId: recipe.primaryReference,
    sourceSeedHex: primarySource.seedHex,
    theme: 'light',
    restTone: rest.light,
    scale: primaryExactLight,
    requireRestAnchor: false
  });
  let primaryDark: ResolvedTonalTheme | null;
  if (primaryDarkPolicy === 'source-exact') {
    primaryDark = resolveSourceExactTheme({
      familyId: recipe.primaryReference,
      sourceSeedHex: primarySource.seedHex,
      theme: 'dark',
      restTone: rest.dark,
      scale: primaryExactDark,
      requireRestAnchor: false
    });
  } else {
    primaryDark = resolveAdaptiveTheme({
      familyId: recipe.primaryReference,
      sourceSeedHex: primarySource.seedHex,
      restTone: rest.dark,
      baseline: primaryExactDark,
      theme: 'dark',
      familyKind: 'chromatic',
      enforceSafeCore: false,
      recipe,
      issues
    });
  }

  if (!primaryLight || !primaryDark) return failedResult(issues, rest);

  reportSourceExactScaleReview(issues, recipe.primaryReference, primaryLight);
  reportSourceExactScaleReview(issues, recipe.primaryReference, primaryDark);

  const lightFingerprint = createFingerprint(
    recipe.primaryReference,
    primaryLight,
    'source-exact',
    recipe
  );
  const darkFingerprint = createFingerprint(
    recipe.primaryReference,
    primaryDark,
    primaryDark.policy === 'adaptive' ? 'adaptive' : 'source-exact',
    recipe
  );
  const parsedPrimaryId = parseTonalFamilyId(recipe.primaryReference);
  if (!parsedPrimaryId) return failedResult(issues, rest);

  const primaryFamily: ResolvedTonalFamily = {
    id: recipe.primaryReference,
    appearance: parsedPrimaryId.appearance,
    sector: parsedPrimaryId.sector,
    munsellSector: parsedPrimaryId.munsellSector,
    variant: parsedPrimaryId.variant,
    colorKind: 'chromatic',
    role: 'primary',
    seedOrigin: 'primary',
    sourceSeedHex: primarySource.seedHex,
    identity: primarySource.identity,
    functionalReferenceRules: resolveFamilyFunctionalReferenceRules(
      recipe,
      recipe.primaryReference
    ),
    status: combineStatuses(primaryLight.status, primaryDark.status),
    themes: {
      light: primaryLight,
      dark: primaryDark
    }
  };
  const families: ResolvedTonalFamily[] = [primaryFamily];
  const supportContextByFamily = new Map<TonalFamilyId, SupportFamilyResolutionContext>();
  const lightPrimaryVividPeakGlobalUtilization = normalizePrimaryGlobalUtilization(
    recipe.primaryReference,
    resolveGlobalChromaSignature(hexToOklch(primaryLight.effectiveSeedHex)).utilization
  );
  const darkPrimaryVividPeakGlobalUtilization = normalizePrimaryGlobalUtilization(
    recipe.primaryReference,
    resolveGlobalChromaSignature(hexToOklch(primaryDark.effectiveSeedHex)).utilization
  );

  for (const familySource of recipe.families) {
    if (familySource.id === recipe.primaryReference) continue;
    const parsedId = parseTonalFamilyId(familySource.id);
    if (!parsedId) continue;

    const familyKind = resolveTonalFamilyColorKind(familySource.id);
    const sourceOklch = hexToOklch(familySource.seedHex);
    if (
      familyKind === 'chromatic' &&
      (familySource.policies.light !== 'source-exact' ||
        familySource.policies.dark !== 'source-exact') &&
      sourceOklch.c < HARMONY_V1_PARAMETERS.reliableHueMinimumChroma
    ) {
      issues.push({
        severity: 'error',
        code: 'HUE_UNRELIABLE',
        path: familyPath(recipe, familySource.id, 'seedHex'),
        message: `The ${familySource.id} seed is too achromatic to establish a reliable hue.`,
        familyId: familySource.id
      });
      continue;
    }
    if (
      familyKind === 'achromatic' &&
      sourceOklch.c > HARMONY_V1_PARAMETERS.achromaticChromaHardCeiling
    ) {
      issues.push({
        severity: 'error',
        code: 'ACHROMATIC_CHROMA_TOO_HIGH',
        path: familyPath(recipe, familySource.id, 'seedHex'),
        message: `${familySource.id} has too much chroma for an achromatic family.`,
        familyId: familySource.id
      });
      continue;
    }
    if (
      familyKind === 'achromatic' &&
      sourceOklch.c > HARMONY_V1_PARAMETERS.achromaticChromaReviewThreshold
    ) {
      issues.push({
        severity: 'review',
        code: 'ACHROMATIC_TINT_REVIEW',
        path: familyPath(recipe, familySource.id, 'seedHex'),
        message: `${familySource.id} preserves a strong achromatic tint with OKL chroma ${sourceOklch.c.toFixed(3)}.`,
        familyId: familySource.id
      });
    }

    const lightHarmonyTarget = resolveFamilyHarmonyTarget(
      lightFingerprint,
      recipe.primaryReference,
      familySource.id,
      lightPrimaryVividPeakGlobalUtilization,
      primaryLight.scale.anchorTone === rest.light
        ? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio
        : MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio
    );
    const darkHarmonyTarget = resolveFamilyHarmonyTarget(
      darkFingerprint,
      recipe.primaryReference,
      familySource.id,
      darkPrimaryVividPeakGlobalUtilization,
      primaryDark.scale.anchorTone === rest.dark
        ? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceAnchorBalanceRatio
        : MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio
    );
    const lightHarmonyHueOverride = resolveAdjacentFamilyHarmonyHue({
      primaryId: recipe.primaryReference,
      primaryHue: hexToOklch(primaryLight.effectiveSeedHex).h,
      familyId: familySource.id,
      sourceSeedHex: familySource.seedHex,
      policy: familySource.policies.light
    });
    const darkHarmonyHueOverride = resolveAdjacentFamilyHarmonyHue({
      primaryId: recipe.primaryReference,
      primaryHue: hexToOklch(primaryDark.effectiveSeedHex).h,
      familyId: familySource.id,
      sourceSeedHex: familySource.seedHex,
      policy: familySource.policies.dark
    });
    supportContextByFamily.set(familySource.id, {
      source: familySource,
      familyKind,
      enforceSafeCore: familySource.seedOrigin === 'derived',
      lightHarmonyTarget,
      darkHarmonyTarget,
      lightHarmonyHueOverride,
      darkHarmonyHueOverride
    });

    const resolvedLight =
      lightRestProposal.harmonizedAnchorPreview?.resolutions.get(familySource.id) ??
      resolveConfiguredFamilyTheme({
        familyId: familySource.id,
        sourceSeedHex: familySource.seedHex,
        familyKind,
        policy: familySource.policies.light,
        theme: 'light',
        restTone: rest.light,
        harmonyTarget: lightHarmonyTarget,
        harmonyHueOverride: lightHarmonyHueOverride,
        enforceSafeCore: familySource.seedOrigin === 'derived',
        recipe,
        issues
      });
    const resolvedDark =
      darkRestProposal.harmonizedAnchorPreview?.resolutions.get(familySource.id) ??
      resolveConfiguredFamilyTheme({
        familyId: familySource.id,
        sourceSeedHex: familySource.seedHex,
        familyKind,
        policy: familySource.policies.dark,
        theme: 'dark',
        restTone: rest.dark,
        harmonyTarget: darkHarmonyTarget,
        harmonyHueOverride: darkHarmonyHueOverride,
        enforceSafeCore: familySource.seedOrigin === 'derived',
        recipe,
        issues
      });

    if (!resolvedLight || !resolvedDark) continue;

    const preserveAuthoredAchromaticTint = familyKind === 'achromatic' && parsedId.variant !== 'v1';
    const lightWithAchromaticTint = preserveAuthoredAchromaticTint
      ? preserveTintedAchromaticChroma({
          familyId: familySource.id,
          resolution: resolvedLight,
          issues
        })
      : resolvedLight;
    const darkWithAchromaticTint = preserveAuthoredAchromaticTint
      ? preserveTintedAchromaticChroma({
          familyId: familySource.id,
          resolution: resolvedDark,
          issues
        })
      : resolvedDark;
    const light =
      familyKind === 'chromatic'
        ? alignSupportThemeToPrimarySurfaceTrack({
            primaryFamilyId: recipe.primaryReference,
            supportFamilyId: familySource.id,
            primary: primaryLight,
            support: lightWithAchromaticTint,
            issues
          })
        : lightWithAchromaticTint;
    const darkWithSurface =
      familyKind === 'chromatic'
        ? alignSupportThemeToPrimarySurfaceTrack({
            primaryFamilyId: recipe.primaryReference,
            supportFamilyId: familySource.id,
            primary: primaryDark,
            support: darkWithAchromaticTint,
            issues
          })
        : darkWithAchromaticTint;
    const dark =
      familyKind === 'chromatic' && resolvedDark.policy !== 'source-exact'
        ? moderateDarkSupportTheme({
            baseline: darkWithSurface,
            primaryFamilyId: recipe.primaryReference,
            primary: primaryDark,
            familyId: familySource.id,
            context: supportContextByFamily.get(familySource.id)!,
            recipe,
            issues
          })
        : darkWithSurface;

    validateResolvedFamilyIdentity(
      familySource.id,
      light,
      familySource.seedOrigin === 'derived',
      issues
    );
    validateResolvedFamilyIdentity(
      familySource.id,
      dark,
      familySource.seedOrigin === 'derived',
      issues
    );
    if (issues.some((issue) => issue.severity === 'error' && issue.familyId === familySource.id)) {
      continue;
    }

    families.push({
      id: familySource.id,
      appearance: parsedId.appearance,
      sector: parsedId.sector,
      munsellSector: parsedId.munsellSector,
      variant: parsedId.variant,
      colorKind: familyKind,
      role: 'support',
      seedOrigin: familySource.seedOrigin,
      sourceSeedHex: familySource.seedHex,
      identity: familySource.identity,
      functionalReferenceRules: resolveFamilyFunctionalReferenceRules(recipe, familySource.id),
      status: combineStatuses(light.status, dark.status),
      themes: { light, dark }
    });
  }

  if (
    issues.some((issue) => issue.severity === 'error') ||
    families.length !== recipe.families.length
  ) {
    return failedResult(issues, rest, families);
  }

  alignIsolatedHarmonyPeaks({
    families,
    primaryFamily,
    supportContextByFamily,
    recipe,
    issues
  });

  validateAdjacentFamilyRestSeparation(primaryFamily, families, recipe, issues);

  if (issues.some((issue) => issue.severity === 'error')) {
    return failedResult(issues, rest, families);
  }

  const functionalReferences = recipe.lockedFunctionalReferences
    ? resolveLockedFunctionalReferences(families, recipe.lockedFunctionalReferences, issues)
    : resolveGeneratedFunctionalReferences(families, primaryFamily, issues);

  if (issues.some((issue) => issue.severity === 'error')) {
    return failedResult(issues, rest, families);
  }

  const functionalRestDiagnostics = {
    light: resolveEmittedFunctionalRestDiagnostics({
      theme: 'light',
      primarySource,
      primaryFamily,
      families
    }),
    dark: resolveEmittedFunctionalRestDiagnostics({
      theme: 'dark',
      primarySource,
      primaryFamily,
      families
    })
  };
  reportFunctionalRestReview(issues, functionalRestDiagnostics.light, rest.source);
  reportFunctionalRestReview(issues, functionalRestDiagnostics.dark, rest.source);

  const source = lockTonalSystemRecipe(
    recipe.authoringRecipe,
    recipe.primaryReference,
    rest,
    lockFunctionalReferences(functionalReferences)
  );
  const status =
    issues.some((issue) => issue.severity === 'review') ||
    families.some((family) => family.status === 'review')
      ? 'review'
      : 'pass';

  return {
    valid: true,
    status,
    source,
    rest,
    functionalRestDiagnostics,
    primaryReference: {
      familyId: recipe.primaryReference,
      light: lightFingerprint,
      dark: darkFingerprint
    },
    functionalReferences,
    families: families.sort((left, right) => compareStrings(left.id, right.id)),
    issues: sortIssues(issues)
  };
}

function moderateDarkSupportTheme(params: {
  baseline: ResolvedTonalTheme;
  primaryFamilyId: TonalFamilyId;
  primary: ResolvedTonalTheme;
  familyId: TonalFamilyId;
  context: SupportFamilyResolutionContext;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
  maximumIsolatedPeakChroma?: number;
  previousDiagnostics?: TonalDarkSupportChromaModerationDiagnostics | null;
  comparisonScale?: KiskadeeScaleResult;
}): ResolvedTonalTheme {
  const {
    baseline,
    primaryFamilyId,
    primary,
    familyId,
    context,
    recipe,
    issues,
    maximumIsolatedPeakChroma,
    previousDiagnostics,
    comparisonScale
  } = params;
  const reference: DarkSupportChromaModerationReference = {
    primaryFamilyId,
    primaryScale: primary.scale,
    baselineScale: comparisonScale ?? baseline.scale
  };
  const baselineEvaluation = evaluateDarkSupportChromaModeration(baseline.scale, reference);
  const priorDiagnostics =
    previousDiagnostics && baseline.darkSupportChromaModeration
      ? mergeDarkSupportChromaModerationDiagnostics(
          previousDiagnostics,
          baseline.darkSupportChromaModeration
        )
      : (baseline.darkSupportChromaModeration ?? previousDiagnostics ?? null);

  if (isDarkSupportChromaModerationAccepted(baselineEvaluation)) {
    const diagnostics = createDarkSupportChromaModerationDiagnostics({
      reference,
      baseline,
      final: baseline,
      baselineEvaluation,
      finalEvaluation: baselineEvaluation
    });
    return {
      ...baseline,
      darkSupportChromaModeration: priorDiagnostics
        ? mergeDarkSupportChromaModerationDiagnostics(priorDiagnostics, diagnostics)
        : diagnostics
    };
  }

  const correctionIssues: TonalSystemIssue[] = [];
  const corrected = resolveConfiguredFamilyTheme({
    familyId,
    sourceSeedHex: context.source.seedHex,
    familyKind: context.familyKind,
    policy: baseline.policy,
    theme: 'dark',
    restTone: baseline.restTone,
    harmonyTarget: context.darkHarmonyTarget,
    harmonyHueOverride: context.darkHarmonyHueOverride,
    enforceSafeCore: context.enforceSafeCore,
    maximumIsolatedPeakChroma,
    darkSupportChromaReference: reference,
    recipe,
    issues: correctionIssues
  });
  const correctedWithSurface = corrected
    ? alignSupportThemeToPrimarySurfaceTrack({
        primaryFamilyId,
        supportFamilyId: familyId,
        primary,
        support: corrected,
        issues: correctionIssues
      })
    : null;

  if (correctedWithSurface) {
    validateResolvedFamilyIdentity(
      familyId,
      correctedWithSurface,
      context.enforceSafeCore,
      correctionIssues
    );
  }

  if (!correctedWithSurface || correctionIssues.some((issue) => issue.severity === 'error')) {
    issues.push({
      severity: 'review',
      code: 'DARK_SUPPORT_CHROMA_MODERATION_RELAXED',
      path: `/families/${familyId}/dark`,
      message: `${familyId} dark retains ${baselineEvaluation.maxExcess.toFixed(4)} chroma above the Primary-relative functional-track cap or ${baselineEvaluation.maxChromaIncrease.toFixed(4)} above its baseline track because no moderated seed preserved every canonical invariant.`,
      familyId,
      theme: 'dark'
    });
    return {
      ...baseline,
      darkSupportChromaModeration: mergeDarkSupportChromaModerationDiagnostics(
        priorDiagnostics,
        createDarkSupportChromaModerationDiagnostics({
          reference,
          baseline,
          final: baseline,
          baselineEvaluation,
          finalEvaluation: baselineEvaluation
        })
      ),
      status: 'review'
    };
  }

  const finalEvaluation = evaluateDarkSupportChromaModeration(
    correctedWithSurface.scale,
    reference
  );
  const relaxed = !isDarkSupportChromaModerationAccepted(finalEvaluation);
  if (relaxed) {
    correctionIssues.push({
      severity: 'review',
      code: 'DARK_SUPPORT_CHROMA_MODERATION_RELAXED',
      path: `/families/${familyId}/dark`,
      message: `${familyId} dark retains ${finalEvaluation.maxExcess.toFixed(4)} chroma above the Primary-relative functional-track cap or ${finalEvaluation.maxChromaIncrease.toFixed(4)} above its baseline track after preserving canonical scale invariants.`,
      familyId,
      theme: 'dark'
    });
  }
  replaceFamilyThemeIssues(issues, familyId, 'dark', correctionIssues);

  return {
    ...correctedWithSurface,
    darkSupportChromaModeration: mergeDarkSupportChromaModerationDiagnostics(
      priorDiagnostics,
      createDarkSupportChromaModerationDiagnostics({
        reference,
        baseline,
        final: correctedWithSurface,
        baselineEvaluation,
        finalEvaluation
      })
    ),
    status: correctedWithSurface.status === 'review' || relaxed ? 'review' : 'pass'
  };
}

function mergeDarkSupportChromaModerationDiagnostics(
  previous: TonalDarkSupportChromaModerationDiagnostics | null,
  next: TonalDarkSupportChromaModerationDiagnostics
): TonalDarkSupportChromaModerationDiagnostics {
  if (!previous) return next;
  const adjustedTones = [...new Set([...previous.adjustedTones, ...next.adjustedTones])].sort(
    (left, right) => left - right
  );
  return {
    ...next,
    adjustedTones,
    adjustedToneCount: adjustedTones.length,
    baselineMaxExcess: previous.baselineMaxExcess,
    maxChromaReduction: Math.max(previous.maxChromaReduction, next.maxChromaReduction),
    maxChromaIncrease: Math.max(previous.maxChromaIncrease, next.maxChromaIncrease),
    sourceSeedChanged: previous.sourceSeedChanged || next.sourceSeedChanged
  };
}

function createDarkSupportChromaModerationDiagnostics(params: {
  reference: DarkSupportChromaModerationReference;
  baseline: ResolvedTonalTheme;
  final: ResolvedTonalTheme;
  baselineEvaluation: DarkSupportChromaModerationEvaluation;
  finalEvaluation: DarkSupportChromaModerationEvaluation;
}): TonalDarkSupportChromaModerationDiagnostics {
  const { reference, baseline, final, baselineEvaluation, finalEvaluation } = params;
  const adjustedTones = final.scale.colors
    .filter((color, index) => color.hex !== baseline.scale.colors[index]?.hex)
    .map((color) => color.tone);
  const reductions = final.scale.colors.map((color, index) =>
    Math.max(0, (baseline.scale.colors[index]?.oklch.c ?? color.oklch.c) - color.oklch.c)
  );

  return {
    contract: DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.contract,
    referenceFamilyId: reference.primaryFamilyId,
    evaluatedTones: finalEvaluation.evaluatedTones,
    adjustedTones,
    adjustedToneCount: adjustedTones.length,
    limitingTone: finalEvaluation.limitingTone,
    baselineMaxExcess: baselineEvaluation.maxExcess,
    finalMaxExcess: finalEvaluation.maxExcess,
    maxChromaReduction: Math.max(0, ...reductions),
    maxChromaIncrease: finalEvaluation.maxChromaIncrease,
    sourceSeedChanged: final.effectiveSeedHex !== baseline.effectiveSeedHex
  };
}

function alignIsolatedHarmonyPeaks(params: {
  families: ResolvedTonalFamily[];
  primaryFamily: ResolvedTonalFamily;
  supportContextByFamily: ReadonlyMap<TonalFamilyId, SupportFamilyResolutionContext>;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): void {
  const { families, primaryFamily, supportContextByFamily, recipe, issues } = params;
  const targets = resolveIsolatedHarmonyPeakTargets(families);

  for (const target of targets) {
    const family = families.find((candidate) => candidate.id === target.familyId);
    const context = supportContextByFamily.get(target.familyId);
    if (!family || !context) continue;

    const baseline = family.themes[target.theme];
    if (baseline.policy !== 'harmonized') {
      family.themes[target.theme] = {
        ...baseline,
        isolatedHarmonyPeakAlignment: createIsolatedHarmonyPeakDiagnostics({
          target,
          finalPeak: {
            chroma: target.baselinePeakChroma,
            tone: target.baselinePeakTone,
            lightness: target.baselinePeakLightness
          }
        }),
        status: 'review'
      };
      family.status = combineStatuses(family.themes.light.status, family.themes.dark.status);
      issues.push({
        severity: 'review',
        code: 'ISOLATED_HARMONY_PEAK_PROTECTED',
        path: `/families/${family.id}/${target.theme}`,
        message: `${family.id} ${target.theme} preserves a ${baseline.policy} peak at chroma ${target.baselinePeakChroma.toFixed(4)}, above the isolated-family target ${target.targetPeakChroma.toFixed(4)}.`,
        familyId: family.id,
        theme: target.theme
      });
      continue;
    }

    const correctionIssues: TonalSystemIssue[] = [];
    const harmonyTarget =
      target.theme === 'light' ? context.lightHarmonyTarget : context.darkHarmonyTarget;
    const harmonyHueOverride =
      target.theme === 'light' ? context.lightHarmonyHueOverride : context.darkHarmonyHueOverride;
    const corrected = resolveConfiguredFamilyTheme({
      familyId: family.id,
      sourceSeedHex: context.source.seedHex,
      familyKind: context.familyKind,
      policy: baseline.policy,
      theme: target.theme,
      restTone: baseline.restTone,
      harmonyTarget,
      harmonyHueOverride,
      enforceSafeCore: context.enforceSafeCore,
      maximumIsolatedPeakChroma: target.targetPeakChroma,
      recipe,
      issues: correctionIssues
    });
    const correctedWithSurface = corrected
      ? alignSupportThemeToPrimarySurfaceTrack({
          primaryFamilyId: primaryFamily.id,
          supportFamilyId: family.id,
          primary: primaryFamily.themes[target.theme],
          support: corrected,
          issues: correctionIssues
        })
      : null;
    const correctedFinal =
      correctedWithSurface && target.theme === 'dark' && context.familyKind === 'chromatic'
        ? moderateDarkSupportTheme({
            baseline: correctedWithSurface,
            primaryFamilyId: primaryFamily.id,
            primary: primaryFamily.themes.dark,
            familyId: family.id,
            context,
            recipe,
            issues: correctionIssues,
            maximumIsolatedPeakChroma: target.targetPeakChroma,
            previousDiagnostics: baseline.darkSupportChromaModeration,
            comparisonScale: baseline.scale
          })
        : correctedWithSurface;

    if (correctedFinal) {
      validateResolvedFamilyIdentity(
        family.id,
        correctedFinal,
        context.enforceSafeCore,
        correctionIssues
      );
    }

    if (!correctedFinal || correctionIssues.some((issue) => issue.severity === 'error')) {
      family.themes[target.theme] = {
        ...baseline,
        isolatedHarmonyPeakAlignment: createIsolatedHarmonyPeakDiagnostics({
          target,
          finalPeak: {
            chroma: target.baselinePeakChroma,
            tone: target.baselinePeakTone,
            lightness: target.baselinePeakLightness
          }
        }),
        status: 'review'
      };
      family.status = combineStatuses(family.themes.light.status, family.themes.dark.status);
      issues.push({
        severity: 'review',
        code: 'ISOLATED_HARMONY_PEAK_ALIGNMENT_RELAXED',
        path: `/families/${family.id}/${target.theme}`,
        message: `${family.id} ${target.theme} keeps its isolated chroma peak because no lower candidate preserved all canonical invariants.`,
        familyId: family.id,
        theme: target.theme
      });
      continue;
    }

    const finalPeak = resolvePhysicalMidtrackPeak(correctedFinal.scale);
    const finalPeakChroma = finalPeak?.chroma ?? target.baselinePeakChroma;
    const remainingExcess = Math.max(0, finalPeakChroma - target.targetPeakChroma);
    if (remainingExcess > ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS.peakTargetTolerance) {
      correctionIssues.push({
        severity: 'review',
        code: 'ISOLATED_HARMONY_PEAK_ALIGNMENT_RELAXED',
        path: `/families/${family.id}/${target.theme}`,
        message: `${family.id} ${target.theme} retains ${remainingExcess.toFixed(4)} chroma above the isolated-family target to preserve canonical scale invariants.`,
        familyId: family.id,
        theme: target.theme
      });
    }

    replaceFamilyThemeIssues(issues, family.id, target.theme, correctionIssues);
    family.themes[target.theme] = {
      ...correctedFinal,
      isolatedHarmonyPeakAlignment: createIsolatedHarmonyPeakDiagnostics({
        target,
        finalPeak: finalPeak ?? {
          chroma: target.baselinePeakChroma,
          tone: target.baselinePeakTone,
          lightness: target.baselinePeakLightness
        }
      }),
      status:
        correctedFinal.status === 'review' ||
        remainingExcess > ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS.peakTargetTolerance
          ? 'review'
          : 'pass'
    };
    family.status = combineStatuses(family.themes.light.status, family.themes.dark.status);
  }
}

function resolveIsolatedHarmonyPeakTargets(
  families: ResolvedTonalFamily[]
): IsolatedHarmonyPeakTarget[] {
  const targets: IsolatedHarmonyPeakTarget[] = [];
  const parameters = ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS;

  for (const theme of ['light', 'dark'] as const) {
    const themeTargets: IsolatedHarmonyPeakTarget[] = [];
    const chromaticFamilies = families.filter(
      (family) => family.colorKind === 'chromatic' && family.sector !== null
    );
    const medianRestChroma = resolveMedian(
      chromaticFamilies.map((family) => family.themes[theme].restColor.oklch.c)
    );
    const maximumRestChromaBySector = new Map<TonalFamilySector, number>();
    for (const family of chromaticFamilies) {
      if (!family.sector) continue;
      maximumRestChromaBySector.set(
        family.sector,
        Math.max(
          maximumRestChromaBySector.get(family.sector) ?? 0,
          family.themes[theme].restColor.oklch.c
        )
      );
    }
    const peaks = chromaticFamilies
      .map((family) => ({ family, peak: resolvePhysicalMidtrackPeak(family.themes[theme].scale) }))
      .filter(
        (
          candidate
        ): candidate is {
          family: ResolvedTonalFamily;
          peak: { chroma: number; tone: KiskadeeTone; lightness: number };
        } => candidate.peak !== null
      );

    for (const { family, peak } of peaks) {
      if (family.role === 'primary' || !family.sector) continue;
      const sectorIndex = MUNSELL_SECTORS.indexOf(family.sector);
      const previousSector =
        MUNSELL_SECTORS[(sectorIndex - 1 + MUNSELL_SECTORS.length) % MUNSELL_SECTORS.length];
      const nextSector = MUNSELL_SECTORS[(sectorIndex + 1) % MUNSELL_SECTORS.length];
      const previousChroma = maximumRestChromaBySector.get(previousSector);
      const nextChroma = maximumRestChromaBySector.get(nextSector);
      if (previousChroma === undefined || nextChroma === undefined) continue;

      const adjacentRestChromaAverage = (previousChroma + nextChroma) / 2;
      const neighborCap =
        adjacentRestChromaAverage +
        Math.max(
          parameters.minimumRestTolerance,
          adjacentRestChromaAverage * parameters.restNeighborToleranceRatio
        );
      const medianCap =
        medianRestChroma +
        Math.max(
          parameters.minimumRestTolerance,
          medianRestChroma * parameters.restMedianToleranceRatio
        );
      const restDetectionCap = Math.max(neighborCap, medianCap);
      const baselineRestChroma = family.themes[theme].restColor.oklch.c;
      if (baselineRestChroma - restDetectionCap < parameters.minimumRestIsolationExcess) {
        continue;
      }
      if (peak.chroma < parameters.minimumPeakChroma) continue;

      const detectionPeer = peaks
        .filter((candidate) => candidate.family.id !== family.id)
        .map((candidate) => ({
          family: candidate.family,
          chroma: resolveChromaAtPhysicalLightness(
            candidate.family.themes[theme].scale,
            peak.lightness
          )
        }))
        .sort(
          (left, right) =>
            right.chroma - left.chroma || compareStrings(left.family.id, right.family.id)
        )[0];
      if (!detectionPeer) continue;
      const peakDetectionGap = Math.max(
        parameters.peakDetectionAbsoluteGap,
        detectionPeer.chroma * parameters.peakDetectionRelativeGap
      );
      if (peak.chroma - detectionPeer.chroma < peakDetectionGap) continue;

      const runnerUp = peaks
        .filter((candidate) => candidate.family.id !== family.id)
        .sort(
          (left, right) =>
            right.peak.chroma - left.peak.chroma || compareStrings(left.family.id, right.family.id)
        )[0];
      if (!runnerUp) continue;
      const runnerUpTarget =
        runnerUp.peak.chroma +
        Math.max(
          parameters.peakTargetAbsoluteGap,
          runnerUp.peak.chroma * parameters.peakTargetRelativeGap
        );
      const targetPeakChroma = Math.min(
        runnerUpTarget,
        peak.chroma - parameters.minimumPeakReduction
      );
      themeTargets.push({
        familyId: family.id,
        theme,
        detectionPeerFamilyId: detectionPeer.family.id,
        detectionPeerChroma: detectionPeer.chroma,
        baselineRestChroma,
        adjacentRestChromaAverage,
        medianRestChroma,
        restDetectionCap,
        baselinePeakChroma: peak.chroma,
        runnerUpFamilyId: runnerUp.family.id,
        runnerUpPeakChroma: runnerUp.peak.chroma,
        targetPeakChroma,
        targetLimitedBy:
          runnerUpTarget <= peak.chroma - parameters.minimumPeakReduction
            ? 'runner-up-envelope'
            : 'minimum-reduction',
        detectionExcess: peak.chroma - detectionPeer.chroma - peakDetectionGap,
        baselinePeakTone: peak.tone,
        baselinePeakLightness: peak.lightness
      });
    }

    const winner = themeTargets.sort(
      (left, right) =>
        right.detectionExcess - left.detectionExcess ||
        compareStrings(left.familyId, right.familyId)
    )[0];
    if (winner) targets.push(winner);
  }

  return targets.sort(
    (left, right) =>
      compareStrings(left.theme, right.theme) || compareStrings(left.familyId, right.familyId)
  );
}

function resolvePhysicalMidtrackPeak(
  scale: KiskadeeScaleResult
): { chroma: number; tone: KiskadeeTone; lightness: number } | null {
  const { analysisStartLightness, analysisEndLightness } =
    ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS;
  const colors = scale.colors.filter(
    (color) =>
      !color.flags.isCap &&
      color.oklch.l >= analysisStartLightness &&
      color.oklch.l <= analysisEndLightness
  );
  if (colors.length === 0) return null;
  const peak = [...colors].sort(
    (left, right) => right.oklch.c - left.oklch.c || left.tone - right.tone
  )[0];
  return { chroma: peak.oklch.c, tone: peak.tone, lightness: peak.oklch.l };
}

function resolveChromaAtPhysicalLightness(scale: KiskadeeScaleResult, lightness: number): number {
  const colors = [...scale.colors].sort(
    (left, right) => left.oklch.l - right.oklch.l || left.tone - right.tone
  );
  const first = colors[0];
  const last = colors[colors.length - 1];
  if (!first || !last) return 0;
  if (lightness <= first.oklch.l) return first.oklch.c;
  if (lightness >= last.oklch.l) return last.oklch.c;

  for (let index = 1; index < colors.length; index += 1) {
    const lower = colors[index - 1];
    const upper = colors[index];
    if (!lower || !upper || lightness > upper.oklch.l) continue;
    const span = upper.oklch.l - lower.oklch.l;
    if (Math.abs(span) < 1e-12) return Math.max(lower.oklch.c, upper.oklch.c);
    const ratio = clamp((lightness - lower.oklch.l) / span, 0, 1);
    return lower.oklch.c + (upper.oklch.c - lower.oklch.c) * ratio;
  }

  return last.oklch.c;
}

function evaluateDarkSupportChromaModeration(
  supportScale: KiskadeeScaleResult,
  reference: DarkSupportChromaModerationReference
): DarkSupportChromaModerationEvaluation {
  const { startTone, endTone, chromaToleranceRatio, minimumChromaTolerance } =
    DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS;
  const colors = supportScale.colors.filter(
    (color) => !color.flags.isCap && color.tone >= startTone && color.tone <= endTone
  );
  const evaluations = colors.map((color) => {
    const primaryChroma = resolveChromaAtPhysicalLightness(reference.primaryScale, color.oklch.l);
    const chromaCap =
      primaryChroma + Math.max(minimumChromaTolerance, primaryChroma * chromaToleranceRatio);
    const baselineChroma = resolveChromaAtPhysicalLightness(reference.baselineScale, color.oklch.l);
    return {
      tone: color.tone,
      supportChroma: color.oklch.c,
      primaryChroma,
      chromaCap,
      excess: Math.max(0, color.oklch.c - chromaCap),
      chromaIncrease: Math.max(0, color.oklch.c - baselineChroma)
    };
  });
  const limiting = [...evaluations].sort((left, right) => {
    const leftViolation = Math.max(left.excess, left.chromaIncrease);
    const rightViolation = Math.max(right.excess, right.chromaIncrease);
    return rightViolation - leftViolation || left.tone - right.tone;
  })[0];

  return {
    evaluatedTones: evaluations.map((evaluation) => evaluation.tone),
    limitingTone: limiting?.tone ?? null,
    supportChroma: limiting?.supportChroma ?? 0,
    primaryChroma: limiting?.primaryChroma ?? 0,
    chromaCap: limiting?.chromaCap ?? 0,
    maxExcess: limiting?.excess ?? 0,
    maxChromaIncrease: Math.max(0, ...evaluations.map((evaluation) => evaluation.chromaIncrease))
  };
}

function isDarkSupportChromaModerationAccepted(
  evaluation: DarkSupportChromaModerationEvaluation | undefined
): boolean {
  return (
    evaluation === undefined ||
    (evaluation.maxExcess <= DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance &&
      evaluation.maxChromaIncrease <=
        DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance)
  );
}

function resolveMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function createIsolatedHarmonyPeakDiagnostics(params: {
  target: IsolatedHarmonyPeakTarget;
  finalPeak: { chroma: number; tone: KiskadeeTone; lightness: number };
}): TonalIsolatedHarmonyPeakAlignmentDiagnostics {
  const { target, finalPeak } = params;
  return {
    contract: ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS.contract,
    detectionPeerFamilyId: target.detectionPeerFamilyId,
    detectionPeerChroma: target.detectionPeerChroma,
    runnerUpFamilyId: target.runnerUpFamilyId,
    baselineRestChroma: target.baselineRestChroma,
    adjacentRestChromaAverage: target.adjacentRestChromaAverage,
    medianRestChroma: target.medianRestChroma,
    restDetectionCap: target.restDetectionCap,
    baselinePeakChroma: target.baselinePeakChroma,
    runnerUpPeakChroma: target.runnerUpPeakChroma,
    targetPeakChroma: target.targetPeakChroma,
    targetLimitedBy: target.targetLimitedBy,
    finalPeakChroma: finalPeak.chroma,
    baselinePeakTone: target.baselinePeakTone,
    baselinePeakLightness: target.baselinePeakLightness,
    finalPeakTone: finalPeak.tone,
    finalPeakLightness: finalPeak.lightness,
    adjusted: finalPeak.chroma < target.baselinePeakChroma - 1e-12,
    remainingExcess: Math.max(0, finalPeak.chroma - target.targetPeakChroma)
  };
}

function replaceFamilyThemeIssues(
  issues: TonalSystemIssue[],
  familyId: TonalFamilyId,
  theme: KiskadeeTheme,
  replacements: TonalSystemIssue[]
): void {
  for (let index = issues.length - 1; index >= 0; index -= 1) {
    const issue = issues[index];
    if (issue.familyId === familyId && issue.theme === theme) issues.splice(index, 1);
  }
  issues.push(...replacements);
}

type SurfaceTrackChromaTarget = {
  index: number;
  tone: KiskadeeTone;
  referenceLightness: number;
  originalChroma: number;
  targetChroma: number;
};

type SurfaceTrackScaleTransformation = {
  scale: KiskadeeScaleResult;
  appliedStrength: number;
  restoredTones: KiskadeeTone[];
};

/**
 * What
 *     Reduces excess support-family chroma near physical white using the Primary at the same
 *     theme position as the one-sided reference.
 * Why
 *     sRGB compresses blue and red much earlier than green near white, so equal low-level curves
 *     can otherwise make one semantic family dominate shared light-surface positions.
 */
function alignSupportThemeToPrimarySurfaceTrack(params: {
  primaryFamilyId: TonalFamilyId;
  supportFamilyId: TonalFamilyId;
  primary: ResolvedTonalTheme;
  support: ResolvedTonalTheme;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme {
  const { primaryFamilyId, supportFamilyId, primary, support, issues } = params;
  const supportAnchorTone = support.scale.anchorTone;
  if (supportAnchorTone === null) return support;

  const protectedTones = [
    ...new Set<KiskadeeTone>([0, 100, supportAnchorTone, support.restTone])
  ].sort((left, right) => left - right);
  const protectedWindowIndices = [...new Set([supportAnchorTone, support.restTone])].map((tone) =>
    KISKADEE_TONES.indexOf(tone)
  );
  const protectedExcessTones: KiskadeeTone[] = [];
  const protectedExcesses: number[] = [];
  const targets: SurfaceTrackChromaTarget[] = [];

  for (let index = 0; index < support.scale.colors.length; index += 1) {
    const supportColor = support.scale.colors[index];
    const primaryColor = primary.scale.colors[index];
    if (!supportColor || !primaryColor || supportColor.flags.isCap) continue;

    const physicalLightWeight = resolveSurfaceTrackPhysicalLightWeight(primaryColor.oklch.l);
    if (physicalLightWeight <= 0) continue;

    const fullCap = resolveSurfaceTrackChromaCap(primaryColor.oklch.c);
    const fullExcess = Math.max(0, supportColor.oklch.c - fullCap);
    if (fullExcess <= 0) continue;

    if (supportColor.tone === supportAnchorTone || supportColor.tone === support.restTone) {
      const protectedExcess = fullExcess * physicalLightWeight;
      protectedExcesses.push(protectedExcess);
      if (protectedExcess > SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.quantizationTolerance) {
        protectedExcessTones.push(supportColor.tone);
      }
      continue;
    }

    const protectionWeight = protectedWindowIndices.reduce((weight, protectedIndex) => {
      const distance = Math.abs(index - protectedIndex);
      const candidate = resolveSmoothstepUnit(
        distance / SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.protectionRadius
      );
      return Math.min(weight, candidate);
    }, 1);
    const alignmentWeight = physicalLightWeight * protectionWeight;
    const targetChroma = supportColor.oklch.c - fullExcess * alignmentWeight;
    if (supportColor.oklch.c - targetChroma <= 1e-7) continue;

    targets.push({
      index,
      tone: supportColor.tone,
      referenceLightness: primaryColor.oklch.l,
      originalChroma: supportColor.oklch.c,
      targetChroma
    });
  }

  const transformed = transformSurfaceTrackScale({
    baseline: support.scale,
    theme: support.theme,
    targets
  });
  const targetByTone = new Map(targets.map((target) => [target.tone, target]));
  const adjustedTones = transformed.scale.colors
    .filter((color, index) => color.hex !== support.scale.colors[index]?.hex)
    .map((color) => color.tone);
  const reductions = transformed.scale.colors.map((color, index) =>
    Math.max(0, (support.scale.colors[index]?.oklch.c ?? color.oklch.c) - color.oklch.c)
  );
  const remainingExcesses = transformed.scale.colors.map((color) => {
    const target = targetByTone.get(color.tone);
    return target ? Math.max(0, color.oklch.c - target.targetChroma) : 0;
  });
  const maxRemainingExcess = Math.max(0, ...protectedExcesses, ...remainingExcesses);
  const relaxed = transformed.restoredTones.length > 0;

  if (protectedExcessTones.length > 0) {
    issues.push({
      severity: 'review',
      code: 'SURFACE_TRACK_ALIGNMENT_PROTECTED',
      path: `/families/${supportFamilyId}/${support.theme}`,
      message: `${supportFamilyId} ${support.theme} preserves exact protected tones ${protectedExcessTones.join(', ')} above the Primary-relative light-surface chroma cap.`,
      familyId: supportFamilyId,
      theme: support.theme
    });
  }
  if (relaxed) {
    issues.push({
      severity: 'review',
      code: 'SURFACE_TRACK_ALIGNMENT_RELAXED',
      path: `/families/${supportFamilyId}/${support.theme}`,
      message: `${supportFamilyId} ${support.theme} restored tones ${transformed.restoredTones.join(', ')} toward their baseline chroma to preserve canonical scale invariants.`,
      familyId: supportFamilyId,
      theme: support.theme
    });
  }

  const restColor = resolveTone(transformed.scale, support.restTone);
  if (!restColor) {
    throw new Error(`${supportFamilyId} ${support.theme} lost its protected harmony rest.`);
  }

  return {
    ...support,
    restColor,
    scale: transformed.scale,
    surfaceTrackAlignment: {
      contract: SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.contract,
      referenceFamilyId: primaryFamilyId,
      adjustedTones,
      adjustedToneCount: adjustedTones.length,
      protectedTones,
      maxChromaReduction: Math.max(0, ...reductions),
      maxRemainingExcess,
      appliedStrength: transformed.appliedStrength,
      restorationCount: transformed.restoredTones.length
    },
    status:
      support.status === 'review' || protectedExcessTones.length > 0 || relaxed ? 'review' : 'pass'
  };
}

function transformSurfaceTrackScale(params: {
  baseline: KiskadeeScaleResult;
  theme: KiskadeeTheme;
  targets: SurfaceTrackChromaTarget[];
}): SurfaceTrackScaleTransformation {
  const { baseline, theme, targets } = params;
  if (targets.length === 0) {
    return { scale: baseline, appliedStrength: 1, restoredTones: [] };
  }

  const targetByIndex = new Map(targets.map((target) => [target.index, target]));
  const render = (strengthByIndex: ReadonlyMap<number, number>): KiskadeeScaleResult => {
    if ([...strengthByIndex.values()].every((strength) => strength <= 0)) return baseline;

    const colors = baseline.colors.map((color, index): KiskadeeScaleColor => {
      const target = targetByIndex.get(index);
      if (!target) return color;
      const strength = strengthByIndex.get(index) ?? 0;
      if (strength <= 0) return color;

      const requestedChroma =
        target.originalChroma - (target.originalChroma - target.targetChroma) * strength;
      const rendered = oklchToSrgbHex({
        l: color.targetLightness,
        c: requestedChroma,
        h: color.oklch.h
      });
      if (rendered.hex === color.hex) return color;

      return {
        ...color,
        hex: rendered.hex,
        hsl: hexToHsl(rendered.hex),
        oklch: hexToOklch(rendered.hex),
        gamutChromaLoss: rendered.chromaLoss,
        flags: {
          ...color.flags,
          gamutMapped: rendered.chromaLoss > 1e-6
        }
      };
    });

    return revalidateKiskadeeScaleResult({ baseline, colors, theme });
  };
  const fullStrengths = new Map(targets.map((target) => [target.index, 1]));
  const full = render(fullStrengths);
  if (isSystemScaleTransformationAccepted(baseline, full)) {
    return { scale: full, appliedStrength: 1, restoredTones: [] };
  }

  const orderedTargets = [...targets].sort(
    (left, right) => left.referenceLightness - right.referenceLightness || left.index - right.index
  );
  const strengthByIndex = new Map(targets.map((target) => [target.index, 0]));
  let validScale = baseline;

  const maximizeTarget = (target: SurfaceTrackChromaTarget): boolean => {
    const initialStrength = strengthByIndex.get(target.index) ?? 0;
    strengthByIndex.set(target.index, 1);
    const fullCandidate = render(strengthByIndex);
    if (isSystemScaleTransformationAccepted(baseline, fullCandidate)) {
      validScale = fullCandidate;
      return initialStrength < 1 - 1e-7;
    }

    let invalidStrength = 1;
    let validStrength = initialStrength;
    let targetValidScale = validScale;
    const { restoreScanSteps, restoreBisectionSteps } =
      SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS;

    for (let step = restoreScanSteps - 1; step >= 1; step -= 1) {
      const strength = initialStrength + ((1 - initialStrength) * step) / restoreScanSteps;
      strengthByIndex.set(target.index, strength);
      const candidate = render(strengthByIndex);
      if (isSystemScaleTransformationAccepted(baseline, candidate)) {
        validStrength = strength;
        targetValidScale = candidate;
        break;
      }
      invalidStrength = strength;
    }

    for (let iteration = 0; iteration < restoreBisectionSteps; iteration += 1) {
      const strength = (validStrength + invalidStrength) / 2;
      strengthByIndex.set(target.index, strength);
      const candidate = render(strengthByIndex);
      if (isSystemScaleTransformationAccepted(baseline, candidate)) {
        validStrength = strength;
        targetValidScale = candidate;
      } else {
        invalidStrength = strength;
      }
    }

    strengthByIndex.set(target.index, validStrength);
    validScale = targetValidScale;
    return validStrength > initialStrength + 1e-7;
  };

  for (const target of orderedTargets) maximizeTarget(target);
  for (
    let pass = 0;
    pass < SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.restoreRefinementPasses;
    pass += 1
  ) {
    let improved = false;
    for (const target of orderedTargets) {
      if ((strengthByIndex.get(target.index) ?? 0) >= 1 - 1e-7) continue;
      improved = maximizeTarget(target) || improved;
    }
    if (!improved) break;
  }

  const restoredTones = orderedTargets
    .filter((target) => validScale.colors[target.index]?.hex !== full.colors[target.index]?.hex)
    .map((target) => target.tone);
  const appliedStrength = Math.min(...strengthByIndex.values());
  return { scale: validScale, appliedStrength, restoredTones };
}

function isSystemScaleTransformationAccepted(
  baseline: KiskadeeScaleResult,
  candidate: KiskadeeScaleResult
): boolean {
  if (!candidate.diagnostics.valid) return false;
  if (
    !baseline.diagnostics.chromaContinuityRelaxed &&
    candidate.diagnostics.chromaContinuityRelaxed
  ) {
    return false;
  }
  if (
    baseline.diagnostics.chromaContinuityRelaxed &&
    candidate.diagnostics.maxLocalChromaProminence >
      baseline.diagnostics.maxLocalChromaProminence + 1e-7
  ) {
    return false;
  }
  return (
    baseline.diagnostics.emittedContinuity.reviewRequired ||
    !candidate.diagnostics.emittedContinuity.reviewRequired
  );
}

function resolveSurfaceTrackPhysicalLightWeight(lightness: number): number {
  const { startLightness, fullLightness } = SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS;
  if (lightness <= startLightness) return 0;
  if (lightness >= fullLightness) return 1;
  return resolveSmoothstepUnit((lightness - startLightness) / (fullLightness - startLightness));
}

function resolveSurfaceTrackChromaCap(primaryChroma: number): number {
  const { chromaToleranceRatio, minimumChromaTolerance } =
    SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS;
  return primaryChroma + Math.max(minimumChromaTolerance, primaryChroma * chromaToleranceRatio);
}

function resolveSmoothstepUnit(value: number): number {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

type TintedAchromaticChromaTarget = {
  index: number;
  tone: KiskadeeTone;
  referenceLightness: number;
  originalChroma: number;
  originalHue: number;
  targetChroma: number;
  targetHue: number;
};

type TintedAchromaticScaleTransformation = {
  scale: KiskadeeScaleResult;
  appliedStrength: number;
  restoredTones: KiskadeeTone[];
};

/**
 * What
 *     Preserves the authored tint of additional achromatic variants across their non-cap
 *     physical-lightness track while keeping the canonical low-level geometry unchanged.
 * Why
 *     Official tinted-neutral ramps keep a stable low chroma near both light and dark surfaces,
 *     whereas the chromatic low-level envelope intentionally converges toward zero at the caps.
 */
function preserveTintedAchromaticChroma(params: {
  familyId: TonalFamilyId;
  resolution: ResolvedTonalTheme;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme {
  const { familyId, resolution, issues } = params;
  const seed = hexToOklch(resolution.effectiveSeedHex);
  const anchorTone = resolution.scale.anchorTone;
  if (anchorTone === null) return resolution;

  const targets = resolution.scale.colors.flatMap(
    (color, index): TintedAchromaticChromaTarget[] => {
      if (color.flags.isCap || color.tone === anchorTone) return [];

      const targetChroma = seed.c * resolveTintedAchromaticCapEnvelope(color.targetLightness);
      return [
        {
          index,
          tone: color.tone,
          referenceLightness: color.targetLightness,
          originalChroma: color.oklch.c,
          originalHue: color.oklch.h,
          targetChroma,
          targetHue: seed.h
        }
      ];
    }
  );
  const transformed = transformTintedAchromaticScale({
    baseline: resolution.scale,
    theme: resolution.theme,
    targets
  });
  const restColor = resolveTone(transformed.scale, resolution.restTone);
  if (!restColor) {
    throw new Error(`${familyId} ${resolution.theme} lost its tinted-achromatic rest color.`);
  }

  const adjustedTones = transformed.scale.colors
    .filter((color, index) => color.hex !== resolution.scale.colors[index]?.hex)
    .map((color) => color.tone);
  const gamutMappedTones = transformed.scale.colors
    .filter(
      (color, index) => color.hex !== resolution.scale.colors[index]?.hex && color.flags.gamutMapped
    )
    .map((color) => color.tone);
  const chromaDeltas = transformed.scale.colors.map(
    (color, index) => color.oklch.c - (resolution.scale.colors[index]?.oklch.c ?? color.oklch.c)
  );
  const maxHueDrift = Math.max(
    0,
    ...transformed.scale.colors
      .filter((color) => !color.flags.isCap && color.oklch.c > 1e-6)
      .map((color) => circularHueDistance(color.oklch.h, seed.h))
  );
  const relaxed = transformed.restoredTones.length > 0;

  if (relaxed) {
    issues.push({
      severity: 'review',
      code: 'TINTED_ACHROMATIC_CHROMA_RELAXED',
      path: `/families/${familyId}/${resolution.theme}`,
      message: `${familyId} ${resolution.theme} restored tones ${transformed.restoredTones.join(', ')} toward their low-level colors to preserve canonical scale invariants.`,
      familyId,
      theme: resolution.theme
    });
  }

  return {
    ...resolution,
    restColor,
    scale: transformed.scale,
    tintedAchromaticChroma: {
      contract: TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.contract,
      seedHue: seed.h,
      seedChroma: seed.c,
      adjustedTones,
      adjustedToneCount: adjustedTones.length,
      restoredTones: transformed.restoredTones,
      restorationCount: transformed.restoredTones.length,
      gamutMappedTones,
      maxChromaIncrease: Math.max(0, ...chromaDeltas),
      maxChromaReduction: Math.max(0, ...chromaDeltas.map((delta) => -delta)),
      maxHueDrift,
      appliedStrength: transformed.appliedStrength
    },
    status: resolution.status === 'review' || relaxed ? 'review' : 'pass'
  };
}

function transformTintedAchromaticScale(params: {
  baseline: KiskadeeScaleResult;
  theme: KiskadeeTheme;
  targets: TintedAchromaticChromaTarget[];
}): TintedAchromaticScaleTransformation {
  const { baseline, theme, targets } = params;
  if (targets.length === 0) {
    return { scale: baseline, appliedStrength: 1, restoredTones: [] };
  }

  const targetByIndex = new Map(targets.map((target) => [target.index, target]));
  const render = (strengthByIndex: ReadonlyMap<number, number>): KiskadeeScaleResult => {
    if ([...strengthByIndex.values()].every((strength) => strength <= 0)) return baseline;

    const colors = baseline.colors.map((color, index): KiskadeeScaleColor => {
      const target = targetByIndex.get(index);
      if (!target) return color;
      const strength = strengthByIndex.get(index) ?? 0;
      if (strength <= 0) return color;

      const requestedChroma =
        target.originalChroma + (target.targetChroma - target.originalChroma) * strength;
      const requestedHue = normalizeMunsellHue(
        target.originalHue + signedCircularHueDelta(target.originalHue, target.targetHue) * strength
      );
      const rendered = oklchToSrgbHex({
        l: color.targetLightness,
        c: requestedChroma,
        h: requestedHue
      });
      if (rendered.hex === color.hex) return color;

      return {
        ...color,
        hex: rendered.hex,
        hsl: hexToHsl(rendered.hex),
        oklch: hexToOklch(rendered.hex),
        gamutChromaLoss: rendered.chromaLoss,
        flags: {
          ...color.flags,
          gamutMapped: rendered.chromaLoss > 1e-6
        }
      };
    });

    return revalidateKiskadeeScaleResult({ baseline, colors, theme });
  };
  const fullStrengths = new Map(targets.map((target) => [target.index, 1]));
  const full = render(fullStrengths);
  if (isSystemScaleTransformationAccepted(baseline, full)) {
    return { scale: full, appliedStrength: 1, restoredTones: [] };
  }

  const orderedTargets = [...targets].sort(
    (left, right) => left.referenceLightness - right.referenceLightness || left.index - right.index
  );
  const strengthByIndex = new Map(targets.map((target) => [target.index, 0]));
  let validScale = baseline;

  const maximizeTarget = (target: TintedAchromaticChromaTarget): boolean => {
    const initialStrength = strengthByIndex.get(target.index) ?? 0;
    strengthByIndex.set(target.index, 1);
    const fullCandidate = render(strengthByIndex);
    if (isSystemScaleTransformationAccepted(baseline, fullCandidate)) {
      validScale = fullCandidate;
      return initialStrength < 1 - 1e-7;
    }

    let invalidStrength = 1;
    let validStrength = initialStrength;
    let targetValidScale = validScale;
    const { restoreScanSteps, restoreBisectionSteps } = TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS;

    for (let step = restoreScanSteps - 1; step >= 1; step -= 1) {
      const strength = initialStrength + ((1 - initialStrength) * step) / restoreScanSteps;
      strengthByIndex.set(target.index, strength);
      const candidate = render(strengthByIndex);
      if (isSystemScaleTransformationAccepted(baseline, candidate)) {
        validStrength = strength;
        targetValidScale = candidate;
        break;
      }
      invalidStrength = strength;
    }

    for (let iteration = 0; iteration < restoreBisectionSteps; iteration += 1) {
      const strength = (validStrength + invalidStrength) / 2;
      strengthByIndex.set(target.index, strength);
      const candidate = render(strengthByIndex);
      if (isSystemScaleTransformationAccepted(baseline, candidate)) {
        validStrength = strength;
        targetValidScale = candidate;
      } else {
        invalidStrength = strength;
      }
    }

    strengthByIndex.set(target.index, validStrength);
    validScale = targetValidScale;
    return validStrength > initialStrength + 1e-7;
  };

  for (const target of orderedTargets) maximizeTarget(target);
  for (
    let pass = 0;
    pass < TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.restoreRefinementPasses;
    pass += 1
  ) {
    let improved = false;
    for (const target of orderedTargets) {
      if ((strengthByIndex.get(target.index) ?? 0) >= 1 - 1e-7) continue;
      improved = maximizeTarget(target) || improved;
    }
    if (!improved) break;
  }

  const restoredTones = orderedTargets
    .filter((target) => validScale.colors[target.index]?.hex !== full.colors[target.index]?.hex)
    .map((target) => target.tone);
  return {
    scale: validScale,
    appliedStrength: Math.min(...strengthByIndex.values()),
    restoredTones
  };
}

function resolveTintedAchromaticCapEnvelope(lightness: number): number {
  const distanceToCap = Math.min(lightness, 100 - lightness);
  const progress = clamp(
    distanceToCap / TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.capTaperLightness,
    0,
    1
  );
  return progress ** TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.capTaperGamma;
}

function validateResolvedFamilyIdentity(
  familyId: TonalFamilyId,
  resolution: ResolvedTonalTheme,
  requireSafeCore: boolean,
  issues: TonalSystemIssue[]
): void {
  const parsed = parseTonalFamilyId(familyId);
  if (!parsed?.sector) return;

  const identity = classifyMunsellHex(resolution.effectiveSeedHex);
  if (identity.sector !== parsed.sector) {
    issues.push({
      severity: 'error',
      code: 'EMITTED_SECTOR_MISMATCH',
      path: `/families/${familyId}/${resolution.theme}`,
      message: `${familyId} emitted ${identity.sector} instead of ${parsed.sector} in ${resolution.theme}.`,
      familyId,
      theme: resolution.theme
    });
    return;
  }
  if (requireSafeCore && !identity.isInSafeCore) {
    issues.push({
      severity: 'error',
      code: 'EMITTED_SAFE_CORE_MISMATCH',
      path: `/families/${familyId}/${resolution.theme}`,
      message: `${familyId} left the safe ${parsed.sector} generation region in ${resolution.theme}.`,
      familyId,
      theme: resolution.theme
    });
    return;
  }

  if (
    requireSafeCore &&
    resolution.restColor.oklch.c >= HARMONY_V1_PARAMETERS.reliableHueMinimumChroma
  ) {
    const restIdentity = classifyMunsellHex(resolution.restColor.hex);
    if (restIdentity.sector !== parsed.sector) {
      issues.push({
        severity: 'error',
        code: 'REST_SECTOR_MISMATCH',
        path: `/families/${familyId}/${resolution.theme}/rest`,
        message: `${familyId} functional rest emitted ${restIdentity.sector} instead of ${parsed.sector} in ${resolution.theme}.`,
        familyId,
        theme: resolution.theme
      });
    }
  }
}

function resolveFamilyHarmonyReference(
  reference: TonalHarmonyFingerprint,
  primaryId: TonalFamilyId,
  familyId: TonalFamilyId
): TonalHarmonyFingerprint {
  const baseUtilization = isBrownFamilyId(primaryId)
    ? Math.min(1, reference.chromaUtilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio)
    : reference.chromaUtilization;
  const targetUtilization = isBrownFamilyId(familyId)
    ? baseUtilization * MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
    : baseUtilization;
  const baseGlobalUtilization = isBrownFamilyId(primaryId)
    ? Math.min(
        1,
        reference.hueGlobalChromaUtilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
      )
    : reference.hueGlobalChromaUtilization;
  const targetGlobalUtilization = isBrownFamilyId(familyId)
    ? baseGlobalUtilization * MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
    : baseGlobalUtilization;

  return targetUtilization === reference.chromaUtilization &&
    targetGlobalUtilization === reference.hueGlobalChromaUtilization
    ? reference
    : {
        ...reference,
        chromaUtilization: targetUtilization,
        hueGlobalChromaUtilization: targetGlobalUtilization
      };
}

function resolveFamilyHarmonyTarget(
  reference: TonalHarmonyFingerprint,
  primaryId: TonalFamilyId,
  familyId: TonalFamilyId,
  normalizedPrimaryVividPeakGlobalUtilization: number,
  minimumRestBalanceRatio: number
): FamilyHarmonyTarget {
  return {
    rest: resolveFamilyHarmonyReference(reference, primaryId, familyId),
    vividPeakGlobalUtilization: isBrownFamilyId(familyId)
      ? normalizedPrimaryVividPeakGlobalUtilization * MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
      : normalizedPrimaryVividPeakGlobalUtilization,
    minimumRestBalanceRatio
  };
}

function resolveAdjacentFamilyHarmonyHue(params: {
  primaryId: TonalFamilyId;
  primaryHue: number;
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  policy: TonalThemePolicy;
}): number | undefined {
  const { primaryId, primaryHue, familyId, sourceSeedHex, policy } = params;
  if (policy !== 'harmonized') return undefined;

  const primary = parseTonalFamilyId(primaryId);
  const family = parseTonalFamilyId(familyId);
  if (
    !primary?.sector ||
    !family?.sector ||
    !areMunsellSectorsAdjacent(primary.sector, family.sector)
  ) {
    return undefined;
  }

  const sourceHue = hexToOklch(sourceSeedHex).h;
  const signedSeparation = signedCircularHueDelta(primaryHue, sourceHue);
  const minimum = MUNSELL_HARMONY_V1_PARAMETERS.adjacentFamilyMinimumHueSeparation;
  const protectedSeparation =
    minimum + MUNSELL_HARMONY_V1_PARAMETERS.adjacentFamilyHueSeparationMargin;
  if (Math.abs(signedSeparation) >= protectedSeparation) return undefined;

  const centerHue = getMunsellOklchSectorDefinition(family.sector).centerHue;
  const centerDirection = Math.sign(signedCircularHueDelta(primaryHue, centerHue));
  const direction = Math.sign(signedSeparation) || centerDirection || 1;
  const desiredHue = normalizeMunsellHue(primaryHue + direction * protectedSeparation);

  return classifyMunsellHue(desiredHue).sector === family.sector ? desiredHue : centerHue;
}

function areMunsellSectorsAdjacent(first: TonalFamilySector, second: TonalFamilySector): boolean {
  const firstIndex = MUNSELL_SECTORS.indexOf(first);
  const secondIndex = MUNSELL_SECTORS.indexOf(second);
  const distance = Math.abs(firstIndex - secondIndex);
  return distance === 1 || distance === MUNSELL_SECTORS.length - 1;
}

function signedCircularHueDelta(from: number, to: number): number {
  return ((normalizeMunsellHue(to - from) + 180) % 360) - 180;
}

function validateAdjacentFamilyRestSeparation(
  primary: ResolvedTonalFamily,
  families: ResolvedTonalFamily[],
  recipe: MaterializedTonalSystemRecipe,
  issues: TonalSystemIssue[]
): void {
  if (!primary.sector) return;

  for (const family of families) {
    if (
      family.role === 'primary' ||
      !BASE_FAMILY_IDS.has(family.id) ||
      !family.sector ||
      !areMunsellSectorsAdjacent(primary.sector, family.sector)
    ) {
      continue;
    }

    for (const theme of ['light', 'dark'] as const) {
      const primaryRest = primary.themes[theme].restColor;
      const familyRest = family.themes[theme].restColor;
      const hueSeparation = Math.abs(
        signedCircularHueDelta(primaryRest.oklch.h, familyRest.oklch.h)
      );
      const perceptualSeparation = deltaEOk(primaryRest.oklch, familyRest.oklch);
      if (
        hueSeparation >= MUNSELL_HARMONY_V1_PARAMETERS.adjacentFamilyMinimumHueSeparation ||
        perceptualSeparation >= MUNSELL_HARMONY_V1_PARAMETERS.adjacentFamilyMinimumRestDeltaE
      ) {
        continue;
      }

      const harmonized = family.themes[theme].policy === 'harmonized';
      issues.push({
        severity: harmonized ? 'error' : 'review',
        code: harmonized ? 'ADJACENT_FAMILY_COLLISION' : 'ADJACENT_FAMILY_SIMILARITY_REVIEW',
        path: familyPath(recipe, family.id, 'seedHex'),
        message: `${family.id} ${theme} rest remains too close to primary ${primary.id}: ${hueSeparation.toFixed(2)}deg hue separation and DeltaE ${perceptualSeparation.toFixed(4)}.`,
        familyId: family.id,
        theme
      });
    }
  }
}

function resolveSourceExactTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  scale: KiskadeeScaleResult;
  requireRestAnchor: boolean;
}): ResolvedTonalTheme | null {
  const { sourceSeedHex, theme, restTone, scale, requireRestAnchor } = params;
  const anchorColor = scale.anchorTone === null ? undefined : resolveTone(scale, scale.anchorTone);
  const restColor = resolveTone(scale, restTone);
  if (
    !scale.diagnostics.valid ||
    !anchorColor ||
    anchorColor.hex !== sourceSeedHex ||
    !restColor ||
    (requireRestAnchor && (scale.anchorTone !== restTone || restColor.hex !== sourceSeedHex))
  ) {
    return null;
  }

  return {
    theme,
    policy: 'source-exact',
    sourceSeedHex,
    effectiveSeedHex: sourceSeedHex,
    sourceSeedPreserved: true,
    restTone,
    restColor,
    scale,
    harmony: null,
    surfaceTrackAlignment: null,
    isolatedHarmonyPeakAlignment: null,
    darkSupportChromaModeration: null,
    tintedAchromaticChroma: null,
    status: scaleNeedsReview(scale) ? 'review' : 'pass'
  };
}

function resolveAdaptiveTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  restTone: KiskadeeTone;
  baseline: KiskadeeScaleResult;
  theme: KiskadeeTheme;
  familyKind: TonalFamilyColorKind;
  enforceSafeCore: boolean;
  chromaModelOverride?: TonalHarmonyMetrics['chromaModel'];
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme | null {
  const {
    familyId,
    sourceSeedHex,
    restTone,
    baseline,
    theme,
    familyKind,
    enforceSafeCore,
    chromaModelOverride,
    darkSupportChromaReference,
    recipe,
    issues
  } = params;
  const prefix = theme === 'light' ? 'L' : 'D';
  const projected = resolveTone(baseline, restTone);
  if (!projected) {
    issues.push({
      severity: 'error',
      code: 'ADAPTIVE_REST_MISSING',
      path: `/tonalAnchors/rest/${theme}`,
      message: `${theme} rest ${prefix}${restTone} is missing from the source projection.`,
      familyId,
      theme
    });
    return null;
  }

  const projectedScale = generateKiskadeeScale({
    seedHex: projected.hex,
    theme,
    profile: recipe.tonalProfile
  });
  const projectedRest = resolveTone(projectedScale, restTone);
  const projectedDarkModeration = darkSupportChromaReference
    ? evaluateDarkSupportChromaModeration(projectedScale, darkSupportChromaReference)
    : undefined;

  if (
    isAcceptedRestAnchorCandidate(projectedScale, projected.hex, restTone) &&
    projectedRest?.hex === projected.hex &&
    isMunsellCandidateIdentityValid(projected.hex, familyId, enforceSafeCore) &&
    isDarkSupportChromaModerationAccepted(projectedDarkModeration)
  ) {
    const sourceOklch = hexToOklch(sourceSeedHex);
    const projectedFingerprint = fingerprintFromColor({
      familyId,
      theme,
      tone: restTone,
      color: projected,
      policy: 'adaptive',
      recipe
    });
    const metrics = createHarmonyMetrics(
      projected.hex,
      sourceOklch,
      projectedFingerprint,
      1,
      chromaModelOverride ?? (recipe.useHueGlobalHarmony ? 'hue-global' : 'local-gamut')
    );
    const status = resolveHarmonyStatus(metrics, projectedScale);
    reportHarmonyReview(issues, familyId, theme, metrics, projectedScale, status);

    return {
      theme,
      policy: 'adaptive',
      sourceSeedHex,
      effectiveSeedHex: projected.hex,
      sourceSeedPreserved: projected.hex === sourceSeedHex,
      restTone,
      restColor: projectedRest,
      scale: projectedScale,
      harmony: metrics,
      surfaceTrackAlignment: null,
      isolatedHarmonyPeakAlignment: null,
      darkSupportChromaModeration: null,
      tintedAchromaticChroma: null,
      status
    };
  }

  if (familyKind === 'achromatic') {
    issues.push({
      severity: 'error',
      code: 'NEUTRAL_ADAPTIVE_UNREACHABLE',
      path: familyPath(recipe, familyId, `policies/${theme}`),
      message: `${familyId} cannot place its achromatic projection at ${prefix}${restTone} without violating the tonal invariants.`,
      familyId,
      theme
    });
    return null;
  }

  const fallbackReference = fingerprintFromColor({
    familyId,
    theme,
    tone: restTone,
    color: projected,
    policy: 'adaptive',
    recipe
  });
  return resolveCandidateTheme({
    familyId,
    sourceSeedHex,
    theme,
    restTone,
    reference: fallbackReference,
    policy: 'adaptive',
    enforceSafeCore,
    chromaModelOverride,
    darkSupportChromaReference,
    recipe,
    issues
  });
}

function resolveConfiguredFamilyTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  familyKind: TonalFamilyColorKind;
  policy: TonalThemePolicy;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  harmonyTarget: FamilyHarmonyTarget;
  harmonyHueOverride?: number;
  enforceSafeCore: boolean;
  chromaModelOverride?: TonalHarmonyMetrics['chromaModel'];
  maximumIsolatedPeakChroma?: number;
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme | null {
  const {
    familyId,
    sourceSeedHex,
    familyKind,
    policy,
    theme,
    restTone,
    harmonyTarget,
    harmonyHueOverride,
    enforceSafeCore,
    chromaModelOverride,
    maximumIsolatedPeakChroma,
    darkSupportChromaReference,
    recipe,
    issues
  } = params;

  if (policy === 'harmonized') {
    return resolveHarmonizedTheme({
      familyId,
      sourceSeedHex,
      theme,
      restTone,
      harmonyTarget,
      harmonyHueOverride,
      enforceSafeCore,
      chromaModelOverride,
      maximumIsolatedPeakChroma,
      darkSupportChromaReference,
      recipe,
      issues
    });
  }

  const baseline = generateKiskadeeScale({
    seedHex: sourceSeedHex,
    theme,
    profile: recipe.tonalProfile
  });
  if (!baseline.diagnostics.valid) {
    issues.push(scaleFailureIssue(familyId, theme, baseline));
    return null;
  }

  if (policy === 'source-exact') {
    const resolution = resolveSourceExactTheme({
      familyId,
      sourceSeedHex,
      theme,
      restTone,
      scale: baseline,
      requireRestAnchor: false
    });
    if (!resolution) {
      issues.push({
        severity: 'error',
        code: 'SOURCE_EXACT_UNREACHABLE',
        path: familyPath(recipe, familyId, `policies/${theme}`),
        message: `${familyId} could not preserve its source seed in the ${theme} scale.`,
        familyId,
        theme
      });
      return null;
    }
    reportSourceExactScaleReview(issues, familyId, resolution);
    return resolution;
  }

  return resolveAdaptiveTheme({
    familyId,
    sourceSeedHex,
    restTone,
    baseline,
    theme,
    familyKind,
    enforceSafeCore,
    chromaModelOverride,
    darkSupportChromaReference,
    recipe,
    issues
  });
}

function resolveHarmonizedTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  harmonyTarget: FamilyHarmonyTarget;
  harmonyHueOverride?: number;
  enforceSafeCore: boolean;
  chromaModelOverride?: TonalHarmonyMetrics['chromaModel'];
  maximumIsolatedPeakChroma?: number;
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme | null {
  return resolveCandidateTheme({
    ...params,
    reference: params.harmonyTarget.rest,
    vividPeakGlobalUtilization: params.harmonyTarget.vividPeakGlobalUtilization,
    minimumRestBalanceRatio: params.harmonyTarget.minimumRestBalanceRatio,
    policy: 'harmonized'
  });
}

function resolveCandidateTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
  vividPeakGlobalUtilization?: number;
  minimumRestBalanceRatio?: number;
  harmonyHueOverride?: number;
  policy: 'adaptive' | 'harmonized';
  enforceSafeCore: boolean;
  chromaModelOverride?: TonalHarmonyMetrics['chromaModel'];
  maximumIsolatedPeakChroma?: number;
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme | null {
  const {
    familyId,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    vividPeakGlobalUtilization,
    minimumRestBalanceRatio,
    harmonyHueOverride,
    policy,
    enforceSafeCore,
    chromaModelOverride,
    maximumIsolatedPeakChroma,
    darkSupportChromaReference,
    recipe,
    issues
  } = params;
  const sourceOklch = hexToOklch(sourceSeedHex);
  const searchOklch =
    policy === 'harmonized' && harmonyHueOverride !== undefined
      ? { ...sourceOklch, h: normalizeMunsellHue(harmonyHueOverride) }
      : sourceOklch;
  const candidateParams = {
    sourceOklch,
    searchOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    familyId,
    enforceSafeCore,
    profile: recipe.tonalProfile,
    chromaModel: chromaModelOverride ?? (recipe.useHueGlobalHarmony ? 'hue-global' : 'local-gamut')
  } as const;
  const resolution =
    policy === 'harmonized' && vividPeakGlobalUtilization !== undefined
      ? findFreeAnchorHarmonyCandidate({
          ...candidateParams,
          includeSourceSeed: harmonyHueOverride === undefined,
          vividPeakGlobalUtilization,
          maximumIsolatedPeakChroma,
          darkSupportChromaReference,
          minimumRestBalanceRatio:
            minimumRestBalanceRatio ?? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio
        })
      : findRestAnchoredHarmonyCandidate({ ...candidateParams, darkSupportChromaReference });

  if (!resolution) {
    issues.push({
      severity: 'error',
      code: 'HARMONY_TARGET_UNREACHABLE',
      path: familyPath(recipe, familyId, 'seedHex'),
      message: `${familyId} could not produce a valid ${theme} scale with functional rest at ${theme === 'light' ? 'L' : 'D'}${restTone}.`,
      familyId,
      theme
    });
    return null;
  }

  const metrics: TonalHarmonyMetrics = {
    ...resolution.candidate.metrics,
    candidatesEvaluated: resolution.candidatesEvaluated
  };
  if (
    metrics.score > HARMONY_V1_PARAMETERS.hardScoreCeiling ||
    metrics.hueDrift > HARMONY_V1_PARAMETERS.maximumHueDrift
  ) {
    issues.push({
      severity: 'error',
      code: 'HARMONY_HARD_CEILING',
      path: familyPath(recipe, familyId, 'seedHex'),
      message: `${familyId} exceeds the v1 harmony or hue-identity hard ceiling in ${theme}: score ${metrics.score.toFixed(3)}, hue drift ${metrics.hueDrift.toFixed(2)}deg at chroma ${resolution.candidate.oklch.c.toFixed(4)}.`,
      familyId,
      theme
    });
    return null;
  }

  const restColor = resolveTone(resolution.scale, restTone);
  if (!restColor) return null;
  const status =
    harmonyHueOverride === undefined ? resolveHarmonyStatus(metrics, resolution.scale) : 'review';
  reportHarmonyReview(issues, familyId, theme, metrics, resolution.scale, status);
  if (harmonyHueOverride !== undefined) {
    issues.push({
      severity: 'review',
      code: 'ADJACENT_FAMILY_HUE_SEPARATION_RESTORED',
      path: familyPath(recipe, familyId, 'seedHex'),
      message: `${familyId} ${theme} harmony moved its working hue from ${sourceOklch.h.toFixed(2)}deg to ${harmonyHueOverride.toFixed(2)}deg to preserve adjacent-family identity.`,
      familyId,
      theme
    });
  }

  return {
    theme,
    policy,
    sourceSeedHex,
    effectiveSeedHex: resolution.candidate.hex,
    sourceSeedPreserved: resolution.candidate.hex === sourceSeedHex,
    restTone,
    restColor,
    scale: resolution.scale,
    harmony: metrics,
    surfaceTrackAlignment: null,
    isolatedHarmonyPeakAlignment: null,
    darkSupportChromaModeration: null,
    tintedAchromaticChroma: null,
    status
  };
}

function findFreeAnchorHarmonyCandidate(params: {
  sourceOklch: OklchColor;
  searchOklch: OklchColor;
  sourceSeedHex: string;
  includeSourceSeed: boolean;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
  vividPeakGlobalUtilization: number;
  maximumIsolatedPeakChroma?: number;
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
  minimumRestBalanceRatio: number;
  familyId: TonalFamilyId;
  enforceSafeCore: boolean;
  profile: TonalSystemRecipeV5['tonalProfile'];
  chromaModel: TonalHarmonyMetrics['chromaModel'];
}): CandidateResolution | null {
  const {
    sourceOklch,
    searchOklch,
    sourceSeedHex,
    includeSourceSeed,
    theme,
    restTone,
    reference,
    vividPeakGlobalUtilization,
    maximumIsolatedPeakChroma,
    darkSupportChromaReference,
    minimumRestBalanceRatio,
    familyId,
    enforceSafeCore,
    profile,
    chromaModel
  } = params;

  if (chromaModel !== 'hue-global') {
    return findRestAnchoredHarmonyCandidate({
      sourceOklch,
      sourceSeedHex,
      theme,
      restTone,
      reference,
      familyId,
      enforceSafeCore,
      profile,
      chromaModel,
      darkSupportChromaReference
    });
  }

  let evaluated = 0;
  const evaluatedHexes = new Set<string>();
  const feasible: CandidateResolution[] = [];
  const reviewFallbacks: CandidateResolution[] = [];
  const evaluate = (seedCandidate: HarmonySeedCandidate): void => {
    if (evaluatedHexes.has(seedCandidate.hex)) return;
    evaluatedHexes.add(seedCandidate.hex);
    if (!isFreeAnchorSeedIdentityValid(seedCandidate.hex, familyId, enforceSafeCore)) return;

    evaluated += 1;
    const scale = generateKiskadeeScale({ seedHex: seedCandidate.hex, theme, profile });
    if (!isAcceptedFreeAnchorCandidate(scale, seedCandidate.hex, restTone)) return;
    const restColor = resolveTone(scale, restTone);
    if (!restColor || !isMunsellRestIdentityValid(restColor, familyId)) return;

    const vividPeakUtilization = resolveScalePeakGlobalUtilization(scale);
    const vividPeakDelta = vividPeakUtilization - vividPeakGlobalUtilization;
    const vividPeakError =
      Math.abs(vividPeakDelta) / HARMONY_V1_PARAMETERS.chromaUtilizationTolerance;
    const isolatedPeakChroma = resolvePhysicalMidtrackPeak(scale)?.chroma ?? 0;
    const isolatedPeakExcess =
      maximumIsolatedPeakChroma === undefined
        ? 0
        : Math.max(0, isolatedPeakChroma - maximumIsolatedPeakChroma);
    const isolatedPeakError =
      isolatedPeakExcess / ISOLATED_HARMONY_PEAK_ALIGNMENT_V1_PARAMETERS.peakTargetTolerance;
    const restMetrics = createHarmonyMetrics(
      restColor.hex,
      sourceOklch,
      reference,
      0,
      chromaModel,
      seedCandidate.hex,
      minimumRestBalanceRatio
    );
    const darkSupportChromaModeration = darkSupportChromaReference
      ? evaluateDarkSupportChromaModeration(scale, darkSupportChromaReference)
      : undefined;
    const metrics: Omit<TonalHarmonyMetrics, 'candidatesEvaluated'> = {
      ...restMetrics,
      score: Math.max(restMetrics.score, vividPeakError, isolatedPeakError),
      vividPeakGlobalChromaUtilization: vividPeakUtilization,
      vividPeakGlobalChromaUtilizationDelta: vividPeakDelta,
      vividPeakError,
      ...(maximumIsolatedPeakChroma === undefined
        ? {}
        : {
            isolatedPeakChroma,
            isolatedPeakChromaCap: maximumIsolatedPeakChroma,
            isolatedPeakError
          })
    };
    const candidate: RankedHarmonyCandidate = {
      ...seedCandidate,
      metrics,
      darkSupportChromaModeration
    };
    const resolution = { candidate, scale, candidatesEvaluated: evaluated };
    if (scale.diagnostics.chromaContinuityRelaxed) reviewFallbacks.push(resolution);
    else feasible.push(resolution);
  };

  const sourceVividPeakUtilization = resolveGlobalChromaSignature(searchOklch).utilization;
  const coarseUtilizations = resolveFreeAnchorSearchUtilizations(
    vividPeakGlobalUtilization,
    sourceVividPeakUtilization,
    0.04,
    darkSupportChromaReference === undefined
      ? 0.16
      : DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.harmonySearchRadius
  );
  for (const candidate of createFreeAnchorSeedCandidates({
    sourceOklch: searchOklch,
    sourceSeedHex,
    includeSourceSeed,
    familyId,
    targetUtilization: vividPeakGlobalUtilization,
    utilizations: coarseUtilizations
  })) {
    evaluate(candidate);
  }

  let candidates = resolveFreeAnchorCandidatePool(feasible, reviewFallbacks);
  if (candidates.length === 0) return null;
  let best = [...candidates].sort(compareCandidateResolutions)[0];
  const refinedUtilizations = resolveFreeAnchorSearchUtilizations(
    best.candidate.requestedUtilization,
    sourceVividPeakUtilization,
    0.005,
    0.03
  );
  for (const candidate of createFreeAnchorSeedCandidates({
    sourceOklch: searchOklch,
    sourceSeedHex,
    includeSourceSeed,
    familyId,
    targetUtilization: vividPeakGlobalUtilization,
    utilizations: refinedUtilizations
  })) {
    evaluate(candidate);
  }

  candidates = resolveFreeAnchorCandidatePool(feasible, reviewFallbacks);
  best = [...candidates].sort(compareCandidateResolutions)[0];
  return { ...best, candidatesEvaluated: evaluated };
}

function resolveFreeAnchorCandidatePool(
  clean: CandidateResolution[],
  continuityReviews: CandidateResolution[]
): CandidateResolution[] {
  if (clean.length === 0) return continuityReviews;
  if (continuityReviews.length === 0) return clean;

  const bestClean = [...clean].sort(compareCandidateResolutions)[0];
  const metrics = bestClean.candidate.metrics;
  const cleanPreservesBothHarmonyAxes =
    metrics.hueGlobalBalanceError <= 1e-12 &&
    metrics.chromaUtilizationError <= 1 &&
    (metrics.vividPeakError ?? 0) <= 1 &&
    (metrics.isolatedPeakError ?? 0) <= 1;
  return cleanPreservesBothHarmonyAxes ? clean : [...clean, ...continuityReviews];
}

function resolveFreeAnchorSearchUtilizations(
  center: number,
  source: number,
  step: number,
  radius = 0.16
): number[] {
  const values = new Set<number>([clamp(center, 0.04, 1), clamp(source, 0.04, 1)]);
  const steps = Math.round(radius / step);
  for (let index = -steps; index <= steps; index += 1) {
    values.add(clamp(center + index * step, 0.04, 1));
  }
  return [...values].sort((left, right) => left - right);
}

function createFreeAnchorSeedCandidates(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  includeSourceSeed: boolean;
  familyId: TonalFamilyId;
  targetUtilization: number;
  utilizations: number[];
}): HarmonySeedCandidate[] {
  const {
    sourceOklch,
    sourceSeedHex,
    includeSourceSeed,
    familyId,
    targetUtilization,
    utilizations
  } = params;
  const peak = resolveHueChromaPeak(sourceOklch.h);
  const preferredLightness = isBrownFamilyId(familyId) ? sourceOklch.l : peak.lightness;
  const byHex = new Map<string, HarmonySeedCandidate>();

  for (const requestedUtilization of utilizations) {
    const utilization = clamp(requestedUtilization, 0.04, 1);
    const desiredChroma = peak.chroma * utilization;
    const lightness = resolveNearestGlobalChromaLightness({
      desiredLightness: preferredLightness,
      desiredChroma,
      hue: sourceOklch.h,
      peak
    });
    const rendered = oklchToSrgbHex({ l: lightness, c: desiredChroma, h: sourceOklch.h });
    const emitted = hexToOklch(rendered.hex);
    const maximumChroma = maxSrgbChroma(emitted.l, emitted.h);
    byHex.set(rendered.hex, {
      requestedLightness: lightness,
      requestedUtilization: utilization,
      hex: rendered.hex,
      oklch: emitted,
      maximumSrgbChroma: maximumChroma
    });
  }

  if (includeSourceSeed && !byHex.has(sourceSeedHex)) {
    const sourceMaximum = maxSrgbChroma(sourceOklch.l, sourceOklch.h);
    byHex.set(sourceSeedHex, {
      requestedLightness: sourceOklch.l,
      requestedUtilization: peak.chroma <= 0 ? 0 : clamp(sourceOklch.c / peak.chroma, 0, 1),
      hex: sourceSeedHex,
      oklch: sourceOklch,
      maximumSrgbChroma: sourceMaximum
    });
  }

  return [...byHex.values()].sort((left, right) => {
    const targetDifference =
      Math.abs(left.requestedUtilization - targetUtilization) -
      Math.abs(right.requestedUtilization - targetUtilization);
    if (Math.abs(targetDifference) > 1e-12) return targetDifference;
    const sourceLightnessDifference =
      Math.abs(left.requestedLightness - sourceOklch.l) -
      Math.abs(right.requestedLightness - sourceOklch.l);
    if (Math.abs(sourceLightnessDifference) > 1e-12) return sourceLightnessDifference;
    return compareStrings(left.hex, right.hex);
  });
}

function findRestAnchoredHarmonyCandidate(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
  familyId: TonalFamilyId;
  enforceSafeCore: boolean;
  profile: TonalSystemRecipeV5['tonalProfile'];
  chromaModel: TonalHarmonyMetrics['chromaModel'];
  darkSupportChromaReference?: DarkSupportChromaModerationReference;
}): CandidateResolution | null {
  const {
    sourceOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    familyId,
    enforceSafeCore,
    profile,
    chromaModel,
    darkSupportChromaReference
  } = params;
  const coarse = rankHarmonyCandidates({
    sourceOklch,
    sourceSeedHex,
    reference,
    chromaModel,
    lightnessMinimum: reference.oklch.l - 10,
    lightnessMaximum: reference.oklch.l + 10,
    lightnessStep: 0.5,
    utilizationMinimum: reference.chromaUtilization - 0.28,
    utilizationMaximum: reference.chromaUtilization + 0.12,
    utilizationStep: 0.04
  });
  let evaluated = 0;
  const feasible: CandidateResolution[] = [];
  const reviewFallbacks: CandidateResolution[] = [];

  for (const candidate of coarse) {
    if (!isMunsellCandidateIdentityValid(candidate.hex, familyId, enforceSafeCore)) continue;
    evaluated += 1;
    const scale = generateKiskadeeScale({ seedHex: candidate.hex, theme, profile });
    if (isAcceptedRestAnchorCandidate(scale, candidate.hex, restTone)) {
      const darkSupportChromaModeration = darkSupportChromaReference
        ? evaluateDarkSupportChromaModeration(scale, darkSupportChromaReference)
        : undefined;
      const evaluatedCandidate = { ...candidate, darkSupportChromaModeration };
      const resolution = { candidate: evaluatedCandidate, scale, candidatesEvaluated: evaluated };
      if (
        scale.diagnostics.chromaContinuityRelaxed ||
        !isDarkSupportChromaModerationAccepted(darkSupportChromaModeration)
      ) {
        reviewFallbacks.push(resolution);
        continue;
      }

      feasible.push(resolution);
      if (feasible.length >= 4) break;
    }
  }

  const candidates = feasible.length > 0 ? feasible : reviewFallbacks;
  if (candidates.length === 0) return null;
  let best = candidates.sort(compareCandidateResolutions)[0];
  const refined = rankHarmonyCandidates({
    sourceOklch,
    sourceSeedHex,
    reference,
    chromaModel,
    lightnessMinimum: best.candidate.requestedLightness - 0.6,
    lightnessMaximum: best.candidate.requestedLightness + 0.6,
    lightnessStep: 0.1,
    utilizationMinimum: best.candidate.requestedUtilization - 0.05,
    utilizationMaximum: best.candidate.requestedUtilization + 0.05,
    utilizationStep: 0.01
  });

  for (const candidate of refined.slice(0, 32)) {
    if (
      darkSupportChromaReference === undefined &&
      compareRankedCandidates(candidate, best.candidate) >= 0
    ) {
      break;
    }
    if (!isMunsellCandidateIdentityValid(candidate.hex, familyId, enforceSafeCore)) continue;
    evaluated += 1;
    const scale = generateKiskadeeScale({ seedHex: candidate.hex, theme, profile });
    if (!isAcceptedRestAnchorCandidate(scale, candidate.hex, restTone)) continue;

    const darkSupportChromaModeration = darkSupportChromaReference
      ? evaluateDarkSupportChromaModeration(scale, darkSupportChromaReference)
      : undefined;
    const resolution = {
      candidate: { ...candidate, darkSupportChromaModeration },
      scale,
      candidatesEvaluated: evaluated
    };
    if (compareCandidateResolutions(resolution, best) < 0) best = resolution;
  }

  return { ...best, candidatesEvaluated: evaluated };
}

function rankHarmonyCandidates(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  reference: TonalHarmonyFingerprint;
  chromaModel: TonalHarmonyMetrics['chromaModel'];
  lightnessMinimum: number;
  lightnessMaximum: number;
  lightnessStep: number;
  utilizationMinimum: number;
  utilizationMaximum: number;
  utilizationStep: number;
}): RankedHarmonyCandidate[] {
  const {
    sourceOklch,
    sourceSeedHex,
    reference,
    chromaModel,
    lightnessMinimum,
    lightnessMaximum,
    lightnessStep,
    utilizationMinimum,
    utilizationMaximum,
    utilizationStep
  } = params;
  const byHex = new Map<string, RankedHarmonyCandidate>();
  const lightnessSteps = Math.round((lightnessMaximum - lightnessMinimum) / lightnessStep);
  const utilizationSteps = Math.round((utilizationMaximum - utilizationMinimum) / utilizationStep);

  for (let lightnessIndex = 0; lightnessIndex <= lightnessSteps; lightnessIndex += 1) {
    const lightness = clamp(lightnessMinimum + lightnessIndex * lightnessStep, 0.5, 99.5);
    const maximumChroma = maxSrgbChroma(lightness, sourceOklch.h);

    for (let utilizationIndex = 0; utilizationIndex <= utilizationSteps; utilizationIndex += 1) {
      const utilization = clamp(utilizationMinimum + utilizationIndex * utilizationStep, 0.04, 1);
      const rendered = oklchToSrgbHex({
        l: lightness,
        c: maximumChroma * utilization,
        h: sourceOklch.h
      });
      const emitted = hexToOklch(rendered.hex);
      const emittedMaximumChroma = maxSrgbChroma(emitted.l, emitted.h);
      const metrics = createHarmonyMetrics(rendered.hex, sourceOklch, reference, 0, chromaModel);
      const candidate: RankedHarmonyCandidate = {
        requestedLightness: lightness,
        requestedUtilization: utilization,
        hex: rendered.hex,
        oklch: emitted,
        maximumSrgbChroma: emittedMaximumChroma,
        metrics
      };
      const previous = byHex.get(candidate.hex);
      if (!previous || compareRankedCandidates(candidate, previous) < 0) {
        byHex.set(candidate.hex, candidate);
      }
    }
  }

  // Include the source as a deterministic tiebreak candidate when it already
  // satisfies the target and requested rest position.
  if (!byHex.has(sourceSeedHex)) {
    const sourceMaximum = maxSrgbChroma(sourceOklch.l, sourceOklch.h);
    byHex.set(sourceSeedHex, {
      requestedLightness: sourceOklch.l,
      requestedUtilization: sourceMaximum <= 0 ? 0 : sourceOklch.c / sourceMaximum,
      hex: sourceSeedHex,
      oklch: sourceOklch,
      maximumSrgbChroma: sourceMaximum,
      metrics: createHarmonyMetrics(sourceSeedHex, sourceOklch, reference, 0, chromaModel)
    });
  }

  return [...byHex.values()].sort(compareRankedCandidates);
}

function createHarmonyMetrics(
  hex: string,
  sourceOklch: OklchColor,
  reference: TonalHarmonyFingerprint,
  candidatesEvaluated: number,
  chromaModel: TonalHarmonyMetrics['chromaModel'],
  effectiveSeedHex = hex,
  minimumGlobalRatio: number = MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio
): TonalHarmonyMetrics {
  const emitted = hexToOklch(hex);
  const effectiveSeed = hexToOklch(effectiveSeedHex);
  const luminance = relativeLuminance(hex);
  const maximumChroma = maxSrgbChroma(emitted.l, emitted.h);
  const utilization = maximumChroma <= 0 ? 0 : clamp(emitted.c / maximumChroma, 0, 1);
  const globalMaximumChroma = resolveHueChromaPeak(sourceOklch.h).chroma;
  const globalUtilization =
    globalMaximumChroma <= 0 ? 0 : clamp(emitted.c / globalMaximumChroma, 0, 1);
  const lightnessDelta = emitted.l - reference.oklch.l;
  const relativeLuminanceDelta = luminance - reference.relativeLuminance;
  const contrastAgainstWhiteDelta = contrastRatio(hex, '#ffffff') - reference.contrastAgainstWhite;
  const contrastAgainstBlackDelta = contrastRatio(hex, '#000000') - reference.contrastAgainstBlack;
  const chromaUtilizationDelta = utilization - reference.chromaUtilization;
  const hueGlobalChromaUtilizationDelta = globalUtilization - reference.hueGlobalChromaUtilization;
  const lightnessError = Math.abs(lightnessDelta) / HARMONY_V1_PARAMETERS.lightnessTolerance;
  const contrastLogError =
    Math.abs(Math.log((luminance + 0.05) / (reference.relativeLuminance + 0.05))) /
    HARMONY_V1_PARAMETERS.contrastLogTolerance;
  const chromaUtilizationError =
    Math.abs(chromaUtilizationDelta) / HARMONY_V1_PARAMETERS.chromaUtilizationTolerance;
  const hueGlobalRatio =
    reference.hueGlobalChromaUtilization <= 0.000_001
      ? 1
      : globalUtilization / reference.hueGlobalChromaUtilization;
  const maximumGlobalRatio = 1 / minimumGlobalRatio;
  const hueGlobalBalanceError =
    chromaModel === 'local-gamut'
      ? 0
      : hueGlobalRatio < minimumGlobalRatio
        ? (minimumGlobalRatio - hueGlobalRatio) / minimumGlobalRatio
        : hueGlobalRatio > maximumGlobalRatio
          ? (hueGlobalRatio - maximumGlobalRatio) / maximumGlobalRatio
          : 0;

  return {
    chromaModel,
    score: Math.max(
      lightnessError,
      contrastLogError,
      chromaUtilizationError,
      hueGlobalBalanceError
    ),
    lightnessError,
    contrastLogError,
    chromaUtilizationError,
    hueGlobalBalanceError,
    lightnessDelta,
    relativeLuminanceDelta,
    contrastAgainstWhiteDelta,
    contrastAgainstBlackDelta,
    chromaUtilizationDelta,
    restHueGlobalChromaUtilization: globalUtilization,
    hueGlobalChromaUtilizationDelta,
    seedDeltaE: deltaEOk(sourceOklch, effectiveSeed),
    hueDrift: circularHueDistance(sourceOklch.h, effectiveSeed.h),
    candidatesEvaluated
  };
}

function createFingerprint(
  familyId: TonalFamilyId,
  resolution: ResolvedTonalTheme,
  policy: 'source-exact' | 'adaptive',
  recipe: MaterializedTonalSystemRecipe
): TonalHarmonyFingerprint {
  return fingerprintFromColor({
    familyId,
    theme: resolution.theme,
    tone: resolution.restTone,
    color: resolution.restColor,
    policy,
    recipe
  });
}

function fingerprintFromColor(params: {
  familyId: TonalFamilyId;
  theme: KiskadeeTheme;
  tone: KiskadeeTone;
  color: KiskadeeScaleColor;
  policy: 'source-exact' | 'adaptive';
  recipe: MaterializedTonalSystemRecipe;
}): TonalHarmonyFingerprint {
  const { familyId, theme, tone, color, policy, recipe } = params;
  const maximumChroma = maxSrgbChroma(color.oklch.l, color.oklch.h);
  const globalMaximumChroma = resolveHueChromaPeak(color.oklch.h).chroma;

  return {
    formatVersion: recipe.formatVersion,
    gridContract: recipe.gridContract,
    harmonyContract: recipe.harmonyContract,
    tonalProfile: recipe.tonalProfile,
    familyId,
    theme,
    tone,
    hex: color.hex,
    oklch: color.oklch,
    relativeLuminance: relativeLuminance(color.hex),
    contrastAgainstWhite: contrastRatio(color.hex, '#ffffff'),
    contrastAgainstBlack: contrastRatio(color.hex, '#000000'),
    maximumSrgbChroma: maximumChroma,
    chromaUtilization: maximumChroma <= 0 ? 0 : clamp(color.oklch.c / maximumChroma, 0, 1),
    hueGlobalMaximumSrgbChroma: globalMaximumChroma,
    hueGlobalChromaUtilization:
      globalMaximumChroma <= 0 ? 0 : clamp(color.oklch.c / globalMaximumChroma, 0, 1),
    policy
  };
}

function isAcceptedRestAnchorCandidate(
  scale: KiskadeeScaleResult,
  effectiveSeedHex: string,
  restTone: KiskadeeTone
): boolean {
  return (
    scale.diagnostics.valid &&
    scale.anchorTone === restTone &&
    resolveTone(scale, restTone)?.hex === effectiveSeedHex
  );
}

function isAcceptedFreeAnchorCandidate(
  scale: KiskadeeScaleResult,
  effectiveSeedHex: string,
  restTone: KiskadeeTone
): boolean {
  if (!scale.diagnostics.valid || scale.anchorTone === null || !resolveTone(scale, restTone)) {
    return false;
  }
  return resolveTone(scale, scale.anchorTone)?.hex === effectiveSeedHex;
}

function isFreeAnchorSeedIdentityValid(
  hex: string,
  familyId: TonalFamilyId,
  requireSafeCore: boolean
): boolean {
  if (!isMunsellCandidateIdentityValid(hex, familyId, requireSafeCore)) return false;
  return (
    !isBrownFamilyId(familyId) || suggestYellowRedAppearance(hexToOklch(hex)).appearance === 'brown'
  );
}

function isMunsellRestIdentityValid(color: KiskadeeScaleColor, familyId: TonalFamilyId): boolean {
  const parsed = parseTonalFamilyId(familyId);
  if (!parsed?.sector || color.oklch.c < HARMONY_V1_PARAMETERS.reliableHueMinimumChroma)
    return true;
  return classifyMunsellHex(color.hex).sector === parsed.sector;
}

function isMunsellCandidateIdentityValid(
  hex: string,
  familyId: TonalFamilyId,
  requireSafeCore: boolean
): boolean {
  const parsed = parseTonalFamilyId(familyId);
  if (!parsed?.sector) return true;

  const identity = classifyMunsellHex(hex);
  return identity.sector === parsed.sector && (!requireSafeCore || identity.isInSafeCore);
}

function compareCandidateResolutions(
  left: CandidateResolution,
  right: CandidateResolution
): number {
  return compareRankedCandidates(left.candidate, right.candidate);
}

function compareRankedCandidates(
  left: RankedHarmonyCandidate,
  right: RankedHarmonyCandidate
): number {
  const leftMetrics = left.metrics;
  const rightMetrics = right.metrics;

  // Hard-feasible candidates must win before soft harmony preferences are
  // compared. The hard ceiling is still reported when no feasible candidate
  // exists; it is never used only after discarding a valid fallback.
  const leftHardFeasible =
    leftMetrics.score <= HARMONY_V1_PARAMETERS.hardScoreCeiling &&
    leftMetrics.hueDrift <= HARMONY_V1_PARAMETERS.maximumHueDrift;
  const rightHardFeasible =
    rightMetrics.score <= HARMONY_V1_PARAMETERS.hardScoreCeiling &&
    rightMetrics.hueDrift <= HARMONY_V1_PARAMETERS.maximumHueDrift;
  if (leftHardFeasible !== rightHardFeasible) return leftHardFeasible ? -1 : 1;

  const leftDarkModeration = left.darkSupportChromaModeration;
  const rightDarkModeration = right.darkSupportChromaModeration;
  const leftDarkAccepted = isDarkSupportChromaModerationAccepted(leftDarkModeration);
  const rightDarkAccepted = isDarkSupportChromaModerationAccepted(rightDarkModeration);
  if (leftDarkAccepted !== rightDarkAccepted) return leftDarkAccepted ? -1 : 1;
  if (!leftDarkAccepted && !rightDarkAccepted) {
    const leftMaximumViolation = Math.max(
      leftDarkModeration?.maxExcess ?? 0,
      leftDarkModeration?.maxChromaIncrease ?? 0
    );
    const rightMaximumViolation = Math.max(
      rightDarkModeration?.maxExcess ?? 0,
      rightDarkModeration?.maxChromaIncrease ?? 0
    );
    const violationDifference = leftMaximumViolation - rightMaximumViolation;
    if (Math.abs(violationDifference) > 1e-12) return violationDifference;
  }

  const isolatedPeakDifference =
    (leftMetrics.isolatedPeakError ?? 0) - (rightMetrics.isolatedPeakError ?? 0);
  if (Math.abs(isolatedPeakDifference) > 1e-12) return isolatedPeakDifference;

  // A vivid system must first return to the permitted rest balance range.
  // Within that range, rest lightness/chroma feasibility protects semantic
  // equivalence before the independent vivid-peak target is compared.
  const balanceDifference = leftMetrics.hueGlobalBalanceError - rightMetrics.hueGlobalBalanceError;
  if (Math.abs(balanceDifference) > 1e-12) return balanceDifference;

  const leftRestChromaFeasible = leftMetrics.chromaUtilizationError <= 1;
  const rightRestChromaFeasible = rightMetrics.chromaUtilizationError <= 1;
  if (leftRestChromaFeasible !== rightRestChromaFeasible) {
    return leftRestChromaFeasible ? -1 : 1;
  }

  for (const metric of ['lightnessError', 'chromaUtilizationError'] as const) {
    const leftValue = leftMetrics[metric];
    const rightValue = rightMetrics[metric];
    const leftExcess = Math.max(0, leftValue - 1);
    const rightExcess = Math.max(0, rightValue - 1);
    const excessDifference = leftExcess - rightExcess;
    if (Math.abs(excessDifference) > 1e-12) return excessDifference;
  }

  const vividPeakDifference =
    (leftMetrics.vividPeakError ?? 0) - (rightMetrics.vividPeakError ?? 0);
  if (Math.abs(vividPeakDifference) > 1e-12) return vividPeakDifference;

  const contrastExcessDifference =
    Math.max(0, leftMetrics.contrastLogError - 1) - Math.max(0, rightMetrics.contrastLogError - 1);
  if (Math.abs(contrastExcessDifference) > 1e-12) return contrastExcessDifference;

  const scoreDifference = leftMetrics.score - rightMetrics.score;
  if (Math.abs(scoreDifference) > 1e-12) return scoreDifference;

  const leftSquared =
    leftMetrics.lightnessError ** 2 +
    leftMetrics.contrastLogError ** 2 +
    leftMetrics.chromaUtilizationError ** 2 +
    leftMetrics.hueGlobalBalanceError ** 2 +
    (leftMetrics.vividPeakError ?? 0) ** 2 +
    (leftMetrics.isolatedPeakError ?? 0) ** 2;
  const rightSquared =
    rightMetrics.lightnessError ** 2 +
    rightMetrics.contrastLogError ** 2 +
    rightMetrics.chromaUtilizationError ** 2 +
    rightMetrics.hueGlobalBalanceError ** 2 +
    (rightMetrics.vividPeakError ?? 0) ** 2 +
    (rightMetrics.isolatedPeakError ?? 0) ** 2;
  if (Math.abs(leftSquared - rightSquared) > 1e-12) return leftSquared - rightSquared;
  if (Math.abs(leftMetrics.seedDeltaE - rightMetrics.seedDeltaE) > 1e-12) {
    return leftMetrics.seedDeltaE - rightMetrics.seedDeltaE;
  }
  if (Math.abs(leftMetrics.hueDrift - rightMetrics.hueDrift) > 1e-12) {
    return leftMetrics.hueDrift - rightMetrics.hueDrift;
  }
  return compareStrings(left.hex, right.hex);
}

function resolveHarmonyStatus(
  metrics: TonalHarmonyMetrics,
  scale: KiskadeeScaleResult
): Exclude<TonalSystemStatus, 'error'> {
  return metrics.score > HARMONY_V1_PARAMETERS.passScore ||
    metrics.seedDeltaE > HARMONY_V1_PARAMETERS.seedDistanceReviewDeltaE ||
    scaleNeedsReview(scale)
    ? 'review'
    : 'pass';
}

function reportHarmonyReview(
  issues: TonalSystemIssue[],
  familyId: TonalFamilyId,
  theme: KiskadeeTheme,
  metrics: TonalHarmonyMetrics,
  scale: KiskadeeScaleResult,
  status: Exclude<TonalSystemStatus, 'error'>
): void {
  if (status !== 'review') return;
  const scaleReasons = resolveScaleReviewReasons(scale);
  const reasons = [
    metrics.score > HARMONY_V1_PARAMETERS.passScore
      ? `harmony score ${metrics.score.toFixed(3)}`
      : null,
    metrics.seedDeltaE > HARMONY_V1_PARAMETERS.seedDistanceReviewDeltaE
      ? `source distance ${metrics.seedDeltaE.toFixed(3)} Delta E OK`
      : null,
    (metrics.vividPeakError ?? 0) > HARMONY_V1_PARAMETERS.passScore
      ? `vivid peak retention ${((metrics.vividPeakGlobalChromaUtilization ?? 0) * 100).toFixed(
          1
        )}%`
      : null,
    (metrics.isolatedPeakError ?? 0) > HARMONY_V1_PARAMETERS.passScore
      ? `isolated peak chroma ${(metrics.isolatedPeakChroma ?? 0).toFixed(4)} above cap ${(metrics.isolatedPeakChromaCap ?? 0).toFixed(4)}`
      : null,
    ...scaleReasons
  ].filter((reason): reason is string => reason !== null);

  issues.push({
    severity: 'review',
    code: 'HARMONY_REVIEW',
    path: `/families/${familyId}/${theme}`,
    message: `${familyId} ${theme} requires review: ${reasons.join(', ')}.`,
    familyId,
    theme
  });
}

function reportSourceExactScaleReview(
  issues: TonalSystemIssue[],
  familyId: TonalFamilyId,
  resolution: ResolvedTonalTheme
): void {
  if (resolution.policy !== 'source-exact' || resolution.status !== 'review') return;
  const reasons = resolveScaleReviewReasons(resolution.scale);
  issues.push({
    severity: 'review',
    code: 'SOURCE_EXACT_SCALE_REVIEW',
    path: `/families/${familyId}/${resolution.theme}`,
    message: `${familyId} ${resolution.theme} requires review: ${reasons.join(', ')}.`,
    familyId,
    theme: resolution.theme
  });
}

function resolveScaleReviewReasons(scale: KiskadeeScaleResult): string[] {
  return [
    scale.diagnostics.separationRelaxed ? 'relaxed emitted spacing' : null,
    scale.diagnostics.emittedContinuity.reviewRequired ? 'emitted curve continuity' : null,
    scale.diagnostics.maxLocalChromaProminence > 0.01
      ? `local chroma prominence ${scale.diagnostics.maxLocalChromaProminence.toFixed(4)}`
      : null,
    scale.diagnostics.maxGamutChromaLoss > HARMONY_V1_PARAMETERS.gamutLossReviewThreshold
      ? `gamut chroma loss ${scale.diagnostics.maxGamutChromaLoss.toFixed(3)}`
      : null,
    scale.diagnostics.profileChromaFullyRestoredCount > 0
      ? `${scale.diagnostics.profileChromaFullyRestoredCount} fully restored profile slots`
      : null
  ].filter((reason): reason is string => reason !== null);
}

function scaleNeedsReview(scale: KiskadeeScaleResult): boolean {
  return (
    scale.diagnostics.separationRelaxed ||
    scale.diagnostics.chromaContinuityRelaxed ||
    scale.diagnostics.maxGamutChromaLoss > HARMONY_V1_PARAMETERS.gamutLossReviewThreshold ||
    scale.diagnostics.profileChromaFullyRestoredCount > 0
  );
}

function resolveTone(
  scale: KiskadeeScaleResult,
  tone: KiskadeeTone
): KiskadeeScaleColor | undefined {
  return scale.colors.find((color) => color.tone === tone);
}

function reportFunctionalRestReview(
  issues: TonalSystemIssue[],
  diagnostics: FunctionalRestThemeDiagnostics,
  source: 'auto-proposal' | 'locked'
): void {
  if (diagnostics.balanced) return;
  const prefix = diagnostics.theme === 'light' ? 'L' : 'D';
  issues.push({
    severity: 'review',
    code: 'FUNCTIONAL_REST_BALANCE_RELAXED',
    path: `/tonalAnchors/rest/${diagnostics.theme}`,
    message: `${source === 'locked' ? 'Locked' : 'Automatic'} ${diagnostics.theme} functional rest ${prefix}${diagnostics.functionalRestTone} retains ${(diagnostics.sourceRetention * 100).toFixed(1)}% of the primary global chroma signature with family ratios ${diagnostics.minimumFamilyRatio.toFixed(3)} through ${diagnostics.maximumFamilyRatio.toFixed(3)}.`,
    theme: diagnostics.theme
  });
}

function scaleFailureIssue(
  familyId: TonalFamilyId,
  theme: KiskadeeTheme,
  scale: KiskadeeScaleResult
): TonalSystemIssue {
  return {
    severity: 'error',
    code: 'PRIMARY_SCALE_INVALID',
    path: `/families/${familyId}/seedHex`,
    message:
      scale.diagnostics.error?.message ?? `Primary ${theme} scale failed its canonical invariants.`,
    familyId,
    theme
  };
}

function familyPath(
  recipe: MaterializedTonalSystemRecipe,
  familyId: TonalFamilyId,
  property: string
): string {
  if (familyId === recipe.primaryReference) return `/primary/${property}`;
  const overrideIndex = recipe.authoringRecipe.overrides.findIndex(
    (override) => override.id === familyId
  );
  if (overrideIndex >= 0) return `/overrides/${overrideIndex}/${property}`;

  const source = recipe.families.find((family) => family.id === familyId);
  switch (source?.seedOrigin) {
    case 'reference':
      return `/references/${familyId}/${property}`;
    case 'canonical':
      return `/canonical/${familyId}/${property}`;
    case 'derived':
      return `/derived/${familyId}/${property}`;
    default:
      return `/families/${familyId}/${property}`;
  }
}

function failedResult(
  issues: TonalSystemIssue[],
  rest: FailedKiskadeeTonalSystem['rest'] = null,
  families: ResolvedTonalFamily[] = []
): FailedKiskadeeTonalSystem {
  return {
    valid: false,
    status: 'error',
    source: null,
    rest,
    functionalRestDiagnostics: null,
    primaryReference: null,
    functionalReferences: [],
    families: families.sort((left, right) => compareStrings(left.id, right.id)),
    issues: sortIssues(issues)
  };
}

function sortIssues(issues: TonalSystemIssue[]): TonalSystemIssue[] {
  return [...issues].sort((left, right) =>
    left.path === right.path
      ? compareStrings(left.code, right.code)
      : compareStrings(left.path, right.path)
  );
}

function combineStatuses(
  left: Exclude<TonalSystemStatus, 'error'>,
  right: Exclude<TonalSystemStatus, 'error'>
): Exclude<TonalSystemStatus, 'error'> {
  return left === 'review' || right === 'review' ? 'review' : 'pass';
}

function circularHueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
