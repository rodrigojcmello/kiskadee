import {
  contrastRatio,
  deltaEOk,
  estimateMaxSrgbChroma,
  hexToOklch,
  maxSrgbChroma,
  type OklchColor,
  oklchToSrgbHex,
  relativeLuminance
} from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
import { FIXED_FAMILY_SEEDS_V1 } from './fixed-family-seeds.ts';
import {
  generateKiskadeeScale,
  KISKADEE_TONES,
  type KiskadeeScaleColor,
  type KiskadeeScaleResult,
  type KiskadeeTheme,
  type KiskadeeTone
} from './kiskadee-tonal-scale.ts';
import {
  classifyMunsellHex,
  getMunsellOklchSectorCenterPosition,
  getMunsellOklchSectorDefinition,
  MUNSELL_OKLCH_SAFE_CORE,
  type MunsellColorClassification,
  normalizeMunsellHue,
  projectMunsellHue,
  suggestYellowRedVariant
} from './munsell-oklch.ts';
import {
  type LockedTonalSystemSourceV2,
  lockTonalSystemRecipe,
  MUNSELL_SECTORS,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  TONAL_CORE_FAMILY_IDS,
  type TonalFamilyColorKind,
  type TonalFamilyId,
  type TonalFamilyOverrideV2,
  type TonalFamilySector,
  type TonalFamilyVariant,
  type TonalSystemRecipeV2,
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
  functionalRestSourceAnchorBalanceRatio: 0.5
} as const;

const DEFERRED_PRIMARY_DERIVATION_V1_PARAMETERS = {
  quantizationSafeInset: 0.02
} as const;

const REST_TONES = KISKADEE_TONES.filter((tone) => tone > 0 && tone < 100);
const CORE_FAMILY_IDS = new Set<TonalFamilyId>(TONAL_CORE_FAMILY_IDS);

export type TonalSeedPolicy = TonalThemePolicy;
export type TonalSystemStatus = 'pass' | 'review' | 'error';

export type TonalSystemIssue = TonalSystemValidationIssue & {
  severity: 'error' | 'review';
  familyId?: TonalFamilyId;
  theme?: KiskadeeTheme;
};

export type TonalHarmonyFingerprint = {
  formatVersion: TonalSystemRecipeV2['formatVersion'];
  gridContract: TonalSystemRecipeV2['gridContract'];
  harmonyContract: TonalSystemRecipeV2['harmonyContract'];
  tonalProfile: TonalSystemRecipeV2['tonalProfile'];
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
  seedDeltaE: number;
  hueDrift: number;
  candidatesEvaluated: number;
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
  sector: TonalFamilySector | null;
  variant: TonalFamilyVariant;
  colorKind: TonalFamilyColorKind;
  role: 'primary' | 'support';
  seedOrigin: 'primary' | 'reference' | 'derived' | 'override' | 'canonical';
  sourceSeedHex: string;
  identity: MunsellColorClassification | null;
  status: Exclude<TonalSystemStatus, 'error'>;
  themes: {
    light: ResolvedTonalTheme;
    dark: ResolvedTonalTheme;
  };
};

export type ResolvedKiskadeeTonalSystem = {
  valid: true;
  status: Exclude<TonalSystemStatus, 'error'>;
  source: LockedTonalSystemSourceV2;
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
  families: ResolvedTonalFamily[];
  issues: TonalSystemIssue[];
};

export type KiskadeeTonalSystemResult = ResolvedKiskadeeTonalSystem | FailedKiskadeeTonalSystem;

type RankedHarmonyCandidate = {
  requestedLightness: number;
  requestedUtilization: number;
  hex: string;
  oklch: OklchColor;
  maximumSrgbChroma: number;
  metrics: Omit<TonalHarmonyMetrics, 'candidatesEvaluated'>;
};

type HarmonySeedCandidate = Omit<RankedHarmonyCandidate, 'metrics'>;

type CandidateResolution = {
  candidate: RankedHarmonyCandidate;
  scale: KiskadeeScaleResult;
  candidatesEvaluated: number;
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
  TonalSystemRecipeV2,
  'formatVersion' | 'gridContract' | 'harmonyContract' | 'tonalProfile' | 'tonalAnchors'
> & {
  authoringRecipe: TonalSystemRecipeV2;
  primaryReference: TonalFamilyId;
  useHueGlobalHarmony: boolean;
  families: MaterializedFamilySource[];
};

type AuthoringRecipeResolution =
  | {
      valid: true;
      recipe: TonalSystemRecipeV2;
      lockedPrimaryId: TonalFamilyId | null;
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
    return { valid: true, recipe: draft.value, lockedPrimaryId: null, issues: [] };
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
          variant: parsed.variant,
          policies: { ...locked.value.primary.policies }
        },
        tonalAnchors: locked.value.tonalAnchors,
        overrides: locked.value.overrides
      },
      lockedPrimaryId: locked.value.primary.id,
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
  authoringRecipe: TonalSystemRecipeV2,
  lockedPrimaryId: TonalFamilyId | null
): MaterializedRecipeResolution {
  const issues: TonalSystemIssue[] = [];
  const primaryIdentity = classifyMunsellHex(authoringRecipe.primary.seedHex);

  const requestedVariant = authoringRecipe.primary.variant;
  const automaticVariant =
    primaryIdentity.sector === 'yellow-red'
      ? suggestYellowRedVariant(primaryIdentity.oklch).variant
      : 'v1';
  const resolvedVariant = requestedVariant === 'auto' ? automaticVariant : requestedVariant;
  const primaryId = `${primaryIdentity.sector}.${resolvedVariant}` as TonalFamilyId;

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
      parsedLocked.variant !== resolvedVariant
    ) {
      issues.push({
        severity: 'error',
        code: 'LOCKED_PRIMARY_CLASSIFICATION_MISMATCH',
        path: '/primary/id',
        message: `Locked primary ${lockedPrimaryId} does not match the ${primaryIdentity.sector}.${resolvedVariant} classification.`,
        familyId: lockedPrimaryId
      });
    }
  }

  if (
    primaryIdentity.sector === 'yellow-red' &&
    resolvedVariant === 'v2' &&
    suggestYellowRedVariant(primaryIdentity.oklch).variant !== 'v2'
  ) {
    issues.push({
      severity: 'error',
      code: 'BROWN_APPEARANCE_MISMATCH',
      path: '/primary/variant',
      message:
        'yellow-red.v2 is reserved for a Brown appearance, but the primary is closer to Orange.',
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

    const referenceSeedHex = FIXED_FAMILY_SEEDS_V1[id];
    if (id === 'black.v1') {
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
      authoringRecipe,
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
  for (const sector of MUNSELL_SECTORS) {
    const familyId = `${sector}.v1` as TonalFamilyId;
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

  if (lockedTone === undefined) {
    const vividnessGuardApplied =
      primarySourceUtilization >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestVividSourceMinimum;
    if (!vividnessGuardApplied) {
      return { tone: sourceAnchorTone };
    }

    const harmonizedAnchorPreview = resolveHarmonizedSourceAnchorPreview({
      theme,
      primaryScale,
      primarySource,
      recipe,
      primarySourceUtilization
    });
    if (harmonizedAnchorPreview) {
      return { tone: sourceAnchorTone, harmonizedAnchorPreview };
    }
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
}): NonNullable<FunctionalRestProposal['harmonizedAnchorPreview']> | null {
  const { theme, primaryScale, primarySource, recipe, primarySourceUtilization } = params;
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

  for (const sector of MUNSELL_SECTORS) {
    const familyId = `${sector}.v1` as TonalFamilyId;
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
      enforceSafeCore: source.seedOrigin === 'derived',
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
  const accepted =
    !evaluation.vividnessGuardApplied ||
    (evaluation.sourceRetention >= MUNSELL_HARMONY_V1_PARAMETERS.functionalRestSourceRetention &&
      evaluation.minimumFamilyRatio >= ratio &&
      evaluation.maximumFamilyRatio <= 1 / ratio);

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
  return familyId === 'yellow-red.v2'
    ? Math.min(1, utilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio)
    : utilization;
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
    .filter((family) => family.colorKind === 'chromatic' && family.variant === 'v1')
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
  override: TonalFamilyOverrideV2,
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
  if (override.id === 'yellow-red.v2' && suggestYellowRedVariant(identity.oklch).variant !== 'v2') {
    issues.push({
      severity: 'error',
      code: 'BROWN_APPEARANCE_MISMATCH',
      path: `/overrides/${override.id}/seedHex`,
      message: 'yellow-red.v2 is reserved for Brown and cannot use an Orange-like seed.',
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

  const materialization = materializeTonalSystemRecipe(authoring.recipe, authoring.lockedPrimaryId);
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
    sector: parsedPrimaryId.sector,
    variant: parsedPrimaryId.variant,
    colorKind: 'chromatic',
    role: 'primary',
    seedOrigin: 'primary',
    sourceSeedHex: primarySource.seedHex,
    identity: primarySource.identity,
    status: combineStatuses(primaryLight.status, primaryDark.status),
    themes: {
      light: primaryLight,
      dark: primaryDark
    }
  };
  const families: ResolvedTonalFamily[] = [primaryFamily];
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

    const light =
      lightRestProposal.harmonizedAnchorPreview?.resolutions.get(familySource.id) ??
      resolveConfiguredFamilyTheme({
        familyId: familySource.id,
        sourceSeedHex: familySource.seedHex,
        familyKind,
        policy: familySource.policies.light,
        theme: 'light',
        restTone: rest.light,
        harmonyTarget: lightHarmonyTarget,
        enforceSafeCore: familySource.seedOrigin === 'derived',
        recipe,
        issues
      });
    const dark =
      darkRestProposal.harmonizedAnchorPreview?.resolutions.get(familySource.id) ??
      resolveConfiguredFamilyTheme({
        familyId: familySource.id,
        sourceSeedHex: familySource.seedHex,
        familyKind,
        policy: familySource.policies.dark,
        theme: 'dark',
        restTone: rest.dark,
        harmonyTarget: darkHarmonyTarget,
        enforceSafeCore: familySource.seedOrigin === 'derived',
        recipe,
        issues
      });

    if (!light || !dark) continue;

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
      sector: parsedId.sector,
      variant: parsedId.variant,
      colorKind: familyKind,
      role: 'support',
      seedOrigin: familySource.seedOrigin,
      sourceSeedHex: familySource.seedHex,
      identity: familySource.identity,
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

  const source = lockTonalSystemRecipe(recipe.authoringRecipe, recipe.primaryReference, rest);
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
    families: families.sort((left, right) => compareStrings(left.id, right.id)),
    issues: sortIssues(issues)
  };
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
  const baseUtilization =
    primaryId === 'yellow-red.v2'
      ? Math.min(1, reference.chromaUtilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio)
      : reference.chromaUtilization;
  const targetUtilization =
    familyId === 'yellow-red.v2'
      ? baseUtilization * MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
      : baseUtilization;
  const baseGlobalUtilization =
    primaryId === 'yellow-red.v2'
      ? Math.min(
          1,
          reference.hueGlobalChromaUtilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
        )
      : reference.hueGlobalChromaUtilization;
  const targetGlobalUtilization =
    familyId === 'yellow-red.v2'
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
    vividPeakGlobalUtilization:
      familyId === 'yellow-red.v2'
        ? normalizedPrimaryVividPeakGlobalUtilization *
          MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
        : normalizedPrimaryVividPeakGlobalUtilization,
    minimumRestBalanceRatio
  };
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

  if (
    isAcceptedRestAnchorCandidate(projectedScale, projected.hex, restTone) &&
    projectedRest?.hex === projected.hex &&
    isMunsellCandidateIdentityValid(projected.hex, familyId, enforceSafeCore)
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
      recipe.useHueGlobalHarmony ? 'hue-global' : 'local-gamut'
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
  enforceSafeCore: boolean;
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
    enforceSafeCore,
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
      enforceSafeCore,
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
  enforceSafeCore: boolean;
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
  policy: 'adaptive' | 'harmonized';
  enforceSafeCore: boolean;
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
    policy,
    enforceSafeCore,
    recipe,
    issues
  } = params;
  const sourceOklch = hexToOklch(sourceSeedHex);
  const candidateParams = {
    sourceOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    familyId,
    enforceSafeCore,
    profile: recipe.tonalProfile,
    chromaModel: recipe.useHueGlobalHarmony ? 'hue-global' : 'local-gamut'
  } as const;
  const resolution =
    policy === 'harmonized' && vividPeakGlobalUtilization !== undefined
      ? findFreeAnchorHarmonyCandidate({
          ...candidateParams,
          vividPeakGlobalUtilization,
          minimumRestBalanceRatio:
            minimumRestBalanceRatio ?? MUNSELL_HARMONY_V1_PARAMETERS.functionalRestBalanceRatio
        })
      : findRestAnchoredHarmonyCandidate(candidateParams);

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
  const status = resolveHarmonyStatus(metrics, resolution.scale);
  reportHarmonyReview(issues, familyId, theme, metrics, resolution.scale, status);

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
    status
  };
}

function findFreeAnchorHarmonyCandidate(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
  vividPeakGlobalUtilization: number;
  minimumRestBalanceRatio: number;
  familyId: TonalFamilyId;
  enforceSafeCore: boolean;
  profile: TonalSystemRecipeV2['tonalProfile'];
  chromaModel: TonalHarmonyMetrics['chromaModel'];
}): CandidateResolution | null {
  const {
    sourceOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    vividPeakGlobalUtilization,
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
      chromaModel
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
    const restMetrics = createHarmonyMetrics(
      restColor.hex,
      sourceOklch,
      reference,
      0,
      chromaModel,
      seedCandidate.hex,
      minimumRestBalanceRatio
    );
    const metrics: Omit<TonalHarmonyMetrics, 'candidatesEvaluated'> = {
      ...restMetrics,
      score: Math.max(restMetrics.score, vividPeakError),
      vividPeakGlobalChromaUtilization: vividPeakUtilization,
      vividPeakGlobalChromaUtilizationDelta: vividPeakDelta,
      vividPeakError
    };
    const candidate: RankedHarmonyCandidate = { ...seedCandidate, metrics };
    const resolution = { candidate, scale, candidatesEvaluated: evaluated };
    if (scale.diagnostics.chromaContinuityRelaxed) reviewFallbacks.push(resolution);
    else feasible.push(resolution);
  };

  const sourceVividPeakUtilization = resolveGlobalChromaSignature(sourceOklch).utilization;
  const coarseUtilizations = resolveFreeAnchorSearchUtilizations(
    vividPeakGlobalUtilization,
    sourceVividPeakUtilization,
    0.04
  );
  for (const candidate of createFreeAnchorSeedCandidates({
    sourceOklch,
    sourceSeedHex,
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
    sourceOklch,
    sourceSeedHex,
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
    (metrics.vividPeakError ?? 0) <= 1;
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
  familyId: TonalFamilyId;
  targetUtilization: number;
  utilizations: number[];
}): HarmonySeedCandidate[] {
  const { sourceOklch, sourceSeedHex, familyId, targetUtilization, utilizations } = params;
  const peak = resolveHueChromaPeak(sourceOklch.h);
  const preferredLightness = familyId === 'yellow-red.v2' ? sourceOklch.l : peak.lightness;
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

  if (!byHex.has(sourceSeedHex)) {
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
  profile: TonalSystemRecipeV2['tonalProfile'];
  chromaModel: TonalHarmonyMetrics['chromaModel'];
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
    chromaModel
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
      const resolution = { candidate, scale, candidatesEvaluated: evaluated };
      if (scale.diagnostics.chromaContinuityRelaxed) {
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
    if (compareRankedCandidates(candidate, best.candidate) >= 0) break;
    if (!isMunsellCandidateIdentityValid(candidate.hex, familyId, enforceSafeCore)) continue;
    evaluated += 1;
    const scale = generateKiskadeeScale({ seedHex: candidate.hex, theme, profile });
    if (!isAcceptedRestAnchorCandidate(scale, candidate.hex, restTone)) continue;

    const resolution = { candidate, scale, candidatesEvaluated: evaluated };
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
  return familyId !== 'yellow-red.v2' || suggestYellowRedVariant(hexToOklch(hex)).variant === 'v2';
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
    (leftMetrics.vividPeakError ?? 0) ** 2;
  const rightSquared =
    rightMetrics.lightnessError ** 2 +
    rightMetrics.contrastLogError ** 2 +
    rightMetrics.chromaUtilizationError ** 2 +
    rightMetrics.hueGlobalBalanceError ** 2 +
    (rightMetrics.vividPeakError ?? 0) ** 2;
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
