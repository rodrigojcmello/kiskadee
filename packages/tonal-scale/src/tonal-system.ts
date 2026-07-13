import {
  contrastRatio,
  deltaEOk,
  hexToOklch,
  maxSrgbChroma,
  type OklchColor,
  oklchToSrgbHex,
  relativeLuminance
} from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
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
  canonicalBlackSeed: '#20252b',
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
  policy: 'source-exact' | 'adaptive';
};

export type TonalHarmonyMetrics = {
  score: number;
  lightnessError: number;
  contrastLogError: number;
  chromaUtilizationError: number;
  lightnessDelta: number;
  relativeLuminanceDelta: number;
  contrastAgainstWhiteDelta: number;
  contrastAgainstBlackDelta: number;
  chromaUtilizationDelta: number;
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

export type ResolvedTonalFamily = {
  id: TonalFamilyId;
  sector: TonalFamilySector | null;
  variant: TonalFamilyVariant;
  colorKind: TonalFamilyColorKind;
  role: 'primary' | 'support';
  seedOrigin: 'primary' | 'derived' | 'override' | 'canonical';
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

type MaterializedTonalSystemRecipe = Pick<
  TonalSystemRecipeV2,
  'formatVersion' | 'gridContract' | 'harmonyContract' | 'tonalProfile' | 'tonalAnchors'
> & {
  authoringRecipe: TonalSystemRecipeV2;
  primaryReference: TonalFamilyId;
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

  const primaryMaximumChroma = maxSrgbChroma(primaryIdentity.oklch.l, primaryIdentity.oklch.h);
  const primaryUtilization =
    primaryMaximumChroma <= 0 ? 0 : primaryIdentity.oklch.c / primaryMaximumChroma;
  const baseUtilization =
    primaryId === 'yellow-red.v2'
      ? Math.min(1, primaryUtilization / MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio)
      : primaryUtilization;

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

    if (id === 'black.v1') {
      families.set(id, {
        id,
        seedHex: MUNSELL_HARMONY_V1_PARAMETERS.canonicalBlackSeed,
        seedOrigin: 'canonical',
        policies: { light: 'source-exact', dark: 'source-exact' },
        identity: null
      });
      continue;
    }

    const parsed = parseTonalFamilyId(id);
    if (!parsed?.sector) continue;
    const projection = projectMunsellHue(primaryIdentity.oklch.h, parsed.sector);
    const utilization =
      id === 'yellow-red.v2'
        ? baseUtilization * MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio
        : baseUtilization;
    const derivedSeed = resolveSafeDerivedSeed({
      lightness: primaryIdentity.oklch.l,
      utilization,
      sector: parsed.sector,
      projectedPosition: projection.projectedPosition
    });

    if (!derivedSeed) {
      issues.push({
        severity: 'error',
        code: 'DERIVED_SAFE_CORE_UNREACHABLE',
        path: `/derived/${id}`,
        message: `${id} could not emit an sRGB seed inside the safe ${parsed.sector} generation region.`,
        familyId: id
      });
      continue;
    }
    if (projection.clampedToSafeCore || derivedSeed.quantizationInsetApplied) {
      issues.push({
        severity: 'review',
        code: 'MUNSELL_HUE_CLAMPED',
        path: `/derived/${id}`,
        message: `${id} was clamped inside the safe ${parsed.sector} region with an sRGB quantization guard.`,
        familyId: id
      });
    }

    families.set(id, {
      id,
      seedHex: derivedSeed.seedHex,
      seedOrigin: 'derived',
      policies: { light: 'harmonized', dark: 'harmonized' },
      identity: derivedSeed.identity
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
      families: [...families.values()].sort((left, right) => compareStrings(left.id, right.id))
    },
    issues: sortIssues(issues)
  };
}

function resolveSafeDerivedSeed(params: {
  lightness: number;
  utilization: number;
  sector: TonalFamilySector;
  projectedPosition: number;
}): {
  seedHex: string;
  identity: MunsellColorClassification;
  quantizationInsetApplied: boolean;
} | null {
  const { lightness, utilization, sector, projectedPosition } = params;
  const definition = getMunsellOklchSectorDefinition(sector);
  const guardedStart =
    MUNSELL_OKLCH_SAFE_CORE.start + MUNSELL_HARMONY_V1_PARAMETERS.quantizationSafeInset;
  const guardedEnd =
    MUNSELL_OKLCH_SAFE_CORE.end - MUNSELL_HARMONY_V1_PARAMETERS.quantizationSafeInset;
  const guardedPosition = clamp(projectedPosition, guardedStart, guardedEnd);
  const utilizationRatio = Math.min(1, Math.max(0.04, utilization));
  const attempts = 40;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const position = guardedPosition + (0.5 - guardedPosition) * (attempt / attempts);
    const hue = normalizeMunsellHue(definition.startHue + definition.spanDegrees * position);
    const maximumChroma = maxSrgbChroma(lightness, hue);
    const seedHex = oklchToSrgbHex({
      l: lightness,
      c: maximumChroma * utilizationRatio,
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

  const proposedLight = primaryExactLight.anchorTone;
  const proposedDark = primaryExactDark.anchorTone;
  if (proposedLight === null || proposedDark === null) {
    return failedResult([
      {
        severity: 'error',
        code: 'PRIMARY_ANCHOR_MISSING',
        path: '/primary',
        message: 'The primary scale did not resolve both theme anchors.'
      }
    ]);
  }

  let rest =
    recipe.tonalAnchors.rest.mode === 'auto'
      ? {
          light: proposedLight,
          dark: primaryDarkPolicy === 'adaptive' ? nearestRestTone(proposedDark) : proposedDark,
          source: 'auto-proposal' as const
        }
      : {
          light: recipe.tonalAnchors.rest.light,
          dark: recipe.tonalAnchors.rest.dark,
          source: 'locked' as const
        };

  if (primaryExactLight.anchorTone !== rest.light) {
    issues.push(
      exactRestMismatchIssue(
        recipe.primaryReference,
        'light',
        rest.light,
        primaryExactLight.anchorTone
      )
    );
  }
  if (primaryDarkPolicy === 'source-exact' && primaryExactDark.anchorTone !== rest.dark) {
    issues.push(
      exactRestMismatchIssue(
        recipe.primaryReference,
        'dark',
        rest.dark,
        primaryExactDark.anchorTone
      )
    );
  }
  if (issues.some((issue) => issue.severity === 'error')) {
    return failedResult(issues, rest);
  }

  const primaryContinuityIssues = (
    [
      ['light', primaryExactLight],
      ...(primaryDarkPolicy === 'source-exact' ? ([['dark', primaryExactDark]] as const) : [])
    ] as const
  ).flatMap(([theme, scale]): TonalSystemIssue[] =>
    scale.diagnostics.chromaContinuityRelaxed
      ? [
          {
            severity: 'error',
            code: 'PRIMARY_SCALE_CONTINUITY',
            path: familyPath(recipe, recipe.primaryReference, 'seedHex'),
            message: `The exact primary ${theme} scale does not satisfy the emitted-curve continuity invariant.`,
            familyId: recipe.primaryReference,
            theme
          }
        ]
      : []
  );
  if (primaryContinuityIssues.length > 0) {
    return failedResult(primaryContinuityIssues, rest);
  }

  const primaryLight = resolveSourceExactTheme({
    familyId: recipe.primaryReference,
    sourceSeedHex: primarySource.seedHex,
    theme: 'light',
    restTone: rest.light,
    scale: primaryExactLight,
    requireRestAnchor: true
  });
  let primaryDark: ResolvedTonalTheme | null;
  if (primaryDarkPolicy === 'source-exact') {
    primaryDark = resolveSourceExactTheme({
      familyId: recipe.primaryReference,
      sourceSeedHex: primarySource.seedHex,
      theme: 'dark',
      restTone: rest.dark,
      scale: primaryExactDark,
      requireRestAnchor: true
    });
  } else if (recipe.tonalAnchors.rest.mode === 'auto') {
    const autoResolution = resolveAutoAdaptivePrimaryDark({
      familyId: recipe.primaryReference,
      sourceSeedHex: primarySource.seedHex,
      preferredRestTone: rest.dark,
      baseline: primaryExactDark,
      recipe,
      issues
    });
    primaryDark = autoResolution?.resolution ?? null;
    if (autoResolution && autoResolution.restTone !== rest.dark) {
      rest = { ...rest, dark: autoResolution.restTone };
    }
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

    const lightFamilyReference = resolveFamilyHarmonyReference(
      lightFingerprint,
      recipe.primaryReference,
      familySource.id
    );
    const darkFamilyReference = resolveFamilyHarmonyReference(
      darkFingerprint,
      recipe.primaryReference,
      familySource.id
    );

    const light = resolveConfiguredFamilyTheme({
      familyId: familySource.id,
      sourceSeedHex: familySource.seedHex,
      familyKind,
      policy: familySource.policies.light,
      theme: 'light',
      restTone: rest.light,
      reference: lightFamilyReference,
      enforceSafeCore: familySource.seedOrigin === 'derived',
      recipe,
      issues
    });
    const dark = resolveConfiguredFamilyTheme({
      familyId: familySource.id,
      sourceSeedHex: familySource.seedHex,
      familyKind,
      policy: familySource.policies.dark,
      theme: 'dark',
      restTone: rest.dark,
      reference: darkFamilyReference,
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

  return targetUtilization === reference.chromaUtilization
    ? reference
    : { ...reference, chromaUtilization: targetUtilization };
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

function resolveAutoAdaptivePrimaryDark(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  preferredRestTone: KiskadeeTone;
  baseline: KiskadeeScaleResult;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): { restTone: KiskadeeTone; resolution: ResolvedTonalTheme } | null {
  const { familyId, sourceSeedHex, preferredRestTone, baseline, recipe, issues } = params;
  const orderedTones = [...REST_TONES].sort((left, right) => {
    const distance = Math.abs(left - preferredRestTone) - Math.abs(right - preferredRestTone);
    return distance === 0 ? left - right : distance;
  });

  for (const restTone of orderedTones) {
    const attemptIssues: TonalSystemIssue[] = [];
    const resolution = resolveAdaptiveTheme({
      familyId,
      sourceSeedHex,
      restTone,
      baseline,
      theme: 'dark',
      familyKind: 'chromatic',
      enforceSafeCore: false,
      recipe,
      issues: attemptIssues
    });
    if (!resolution) continue;

    issues.push(...attemptIssues);
    return { restTone, resolution };
  }

  issues.push({
    severity: 'error',
    code: 'ADAPTIVE_AUTO_REST_UNREACHABLE',
    path: '/tonalAnchors/rest',
    message: `No public Dark rest position can adapt ${familyId} without violating the tonal invariants.`,
    familyId,
    theme: 'dark'
  });
  return null;
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
    isAcceptedCandidate(projectedScale, projected.hex, restTone) &&
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
    const metrics = createHarmonyMetrics(projected.hex, sourceOklch, projectedFingerprint, 1);
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
  reference: TonalHarmonyFingerprint;
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
    reference,
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
      reference,
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
  reference: TonalHarmonyFingerprint;
  enforceSafeCore: boolean;
  recipe: MaterializedTonalSystemRecipe;
  issues: TonalSystemIssue[];
}): ResolvedTonalTheme | null {
  return resolveCandidateTheme({ ...params, policy: 'harmonized' });
}

function resolveCandidateTheme(params: {
  familyId: TonalFamilyId;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
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
    policy,
    enforceSafeCore,
    recipe,
    issues
  } = params;
  const sourceOklch = hexToOklch(sourceSeedHex);
  const resolution = findHarmonyCandidate({
    sourceOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    familyId,
    enforceSafeCore,
    profile: recipe.tonalProfile
  });

  if (!resolution) {
    issues.push({
      severity: 'error',
      code: 'HARMONY_TARGET_UNREACHABLE',
      path: familyPath(recipe, familyId, 'seedHex'),
      message: `${familyId} could not produce a valid ${theme} scale anchored at ${theme === 'light' ? 'L' : 'D'}${restTone}.`,
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
      message: `${familyId} exceeds the v1 harmony or hue-identity hard ceiling in ${theme}.`,
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

function findHarmonyCandidate(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  theme: KiskadeeTheme;
  restTone: KiskadeeTone;
  reference: TonalHarmonyFingerprint;
  familyId: TonalFamilyId;
  enforceSafeCore: boolean;
  profile: TonalSystemRecipeV2['tonalProfile'];
}): CandidateResolution | null {
  const {
    sourceOklch,
    sourceSeedHex,
    theme,
    restTone,
    reference,
    familyId,
    enforceSafeCore,
    profile
  } = params;
  const coarse = rankHarmonyCandidates({
    sourceOklch,
    sourceSeedHex,
    reference,
    lightnessMinimum: reference.oklch.l - 10,
    lightnessMaximum: reference.oklch.l + 10,
    lightnessStep: 0.5,
    utilizationMinimum: reference.chromaUtilization - 0.28,
    utilizationMaximum: reference.chromaUtilization + 0.12,
    utilizationStep: 0.04
  });
  let evaluated = 0;
  const feasible: CandidateResolution[] = [];

  for (const candidate of coarse.slice(0, 96)) {
    if (!isMunsellCandidateIdentityValid(candidate.hex, familyId, enforceSafeCore)) continue;
    evaluated += 1;
    const scale = generateKiskadeeScale({ seedHex: candidate.hex, theme, profile });
    if (isAcceptedCandidate(scale, candidate.hex, restTone)) {
      feasible.push({ candidate, scale, candidatesEvaluated: evaluated });
      if (feasible.length >= 4) break;
    }
  }

  if (feasible.length === 0) return null;
  let best = feasible.sort(compareCandidateResolutions)[0];
  const refined = rankHarmonyCandidates({
    sourceOklch,
    sourceSeedHex,
    reference,
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
    if (!isAcceptedCandidate(scale, candidate.hex, restTone)) continue;

    const resolution = { candidate, scale, candidatesEvaluated: evaluated };
    if (compareCandidateResolutions(resolution, best) < 0) best = resolution;
  }

  return { ...best, candidatesEvaluated: evaluated };
}

function rankHarmonyCandidates(params: {
  sourceOklch: OklchColor;
  sourceSeedHex: string;
  reference: TonalHarmonyFingerprint;
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
      const metrics = createHarmonyMetrics(rendered.hex, sourceOklch, reference, 0);
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
      metrics: createHarmonyMetrics(sourceSeedHex, sourceOklch, reference, 0)
    });
  }

  return [...byHex.values()].sort(compareRankedCandidates);
}

function createHarmonyMetrics(
  hex: string,
  sourceOklch: OklchColor,
  reference: TonalHarmonyFingerprint,
  candidatesEvaluated: number
): TonalHarmonyMetrics {
  const emitted = hexToOklch(hex);
  const luminance = relativeLuminance(hex);
  const maximumChroma = maxSrgbChroma(emitted.l, emitted.h);
  const utilization = maximumChroma <= 0 ? 0 : clamp(emitted.c / maximumChroma, 0, 1);
  const lightnessDelta = emitted.l - reference.oklch.l;
  const relativeLuminanceDelta = luminance - reference.relativeLuminance;
  const contrastAgainstWhiteDelta = contrastRatio(hex, '#ffffff') - reference.contrastAgainstWhite;
  const contrastAgainstBlackDelta = contrastRatio(hex, '#000000') - reference.contrastAgainstBlack;
  const chromaUtilizationDelta = utilization - reference.chromaUtilization;
  const lightnessError = Math.abs(lightnessDelta) / HARMONY_V1_PARAMETERS.lightnessTolerance;
  const contrastLogError =
    Math.abs(Math.log((luminance + 0.05) / (reference.relativeLuminance + 0.05))) /
    HARMONY_V1_PARAMETERS.contrastLogTolerance;
  const chromaUtilizationError =
    Math.abs(chromaUtilizationDelta) / HARMONY_V1_PARAMETERS.chromaUtilizationTolerance;

  return {
    score: Math.max(lightnessError, contrastLogError, chromaUtilizationError),
    lightnessError,
    contrastLogError,
    chromaUtilizationError,
    lightnessDelta,
    relativeLuminanceDelta,
    contrastAgainstWhiteDelta,
    contrastAgainstBlackDelta,
    chromaUtilizationDelta,
    seedDeltaE: deltaEOk(sourceOklch, emitted),
    hueDrift: circularHueDistance(sourceOklch.h, emitted.h),
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
    policy
  };
}

function isAcceptedCandidate(
  scale: KiskadeeScaleResult,
  effectiveSeedHex: string,
  restTone: KiskadeeTone
): boolean {
  return (
    scale.diagnostics.valid &&
    !scale.diagnostics.chromaContinuityRelaxed &&
    scale.anchorTone === restTone &&
    resolveTone(scale, restTone)?.hex === effectiveSeedHex
  );
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

  // Functional equivalence is hierarchical at the tolerance boundary:
  // contrast/luminance outranks lightness, which outranks gamut utilization.
  // Once both candidates satisfy the same hierarchy, the minimax score keeps
  // the remaining soft objectives balanced before source distance is used.
  for (const metric of ['contrastLogError', 'lightnessError', 'chromaUtilizationError'] as const) {
    const leftExcess = Math.max(0, leftMetrics[metric] - 1);
    const rightExcess = Math.max(0, rightMetrics[metric] - 1);
    const excessDifference = leftExcess - rightExcess;
    if (Math.abs(excessDifference) > 1e-12) return excessDifference;
  }

  const scoreDifference = leftMetrics.score - rightMetrics.score;
  if (Math.abs(scoreDifference) > 1e-12) return scoreDifference;

  const leftSquared =
    leftMetrics.lightnessError ** 2 +
    leftMetrics.contrastLogError ** 2 +
    leftMetrics.chromaUtilizationError ** 2;
  const rightSquared =
    rightMetrics.lightnessError ** 2 +
    rightMetrics.contrastLogError ** 2 +
    rightMetrics.chromaUtilizationError ** 2;
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

function exactRestMismatchIssue(
  familyId: TonalFamilyId,
  theme: KiskadeeTheme,
  expected: KiskadeeTone,
  actual: KiskadeeTone | null
): TonalSystemIssue {
  const prefix = theme === 'light' ? 'L' : 'D';
  return {
    severity: 'error',
    code: 'PRIMARY_REST_MISMATCH',
    path: `/tonalAnchors/rest/${theme}`,
    message: `Exact primary ${theme} resolves to ${prefix}${actual ?? 'none'}, not locked ${prefix}${expected}.`,
    familyId,
    theme
  };
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
  return overrideIndex >= 0
    ? `/overrides/${overrideIndex}/${property}`
    : `/derived/${familyId}/${property}`;
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

function nearestRestTone(tone: KiskadeeTone): KiskadeeTone {
  return REST_TONES.reduce((nearest, candidate) => {
    const candidateDistance = Math.abs(candidate - tone);
    const nearestDistance = Math.abs(nearest - tone);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
