import { contrastRatio, deltaEOk, hexToOklch, normalizeHexColor } from './color-math.ts';
import { formatCanonicalJsonFile, stringifyCanonicalJson } from './export/canonical-json.ts';
import { sha256Hex } from './export/sha256.ts';
import {
  generateKiskadeeScale,
  KISKADEE_TONES,
  type KiskadeeScaleColor,
  type KiskadeeScaleDiagnostics,
  type KiskadeeScaleResult,
  type KiskadeeTheme,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from './kiskadee-tonal-scale.ts';

export const STANDALONE_TONAL_ARTIFACT_GENERATOR = {
  package: '@kiskadee/tonal-scale',
  version: '0.6.0'
} as const;

export const STANDALONE_TONAL_GRID_CONTRACT = 'kiskadee-tonal-v1' as const;
const CAP_SAFE_LIGHT_VIVID_TONE = 85 satisfies KiskadeeTone;

export type StandaloneTonalThemePolicy = 'source-exact';

export type GenerateStandaloneKiskadeeTonalFamilyInput = {
  seedHex: string;
  tonalProfile: KiskadeeTonalProfile;
  lightPolicy: StandaloneTonalThemePolicy;
  darkPolicy: StandaloneTonalThemePolicy;
};

export type StandaloneTonalReferenceSource =
  | 'generated-anchor'
  | 'cap-fallback'
  | 'surface-relative'
  | 'contrast-mirror';

export type StandaloneTonalFunctionalReference = {
  tone: KiskadeeTone;
  hex: string;
  source: StandaloneTonalReferenceSource;
};

export type StandaloneToneHexMap = Record<`${KiskadeeTone}`, string>;

export type StandaloneTonalIssue = {
  severity: 'info' | 'review';
  code: 'VIVID_REFERENCE_CAP_FALLBACK' | 'SUBTLE_REFERENCE_SURFACE_EDGE_FALLBACK';
  path: string;
  message: string;
  theme: KiskadeeTheme;
};

export type StandaloneTonalThemeDiagnostics = {
  sourceSeedPreserved: boolean;
  generatedAnchor: { tone: KiskadeeTone; hex: string };
  functionalReferences: {
    vivid: StandaloneTonalReferenceDiagnostics;
    subtle: StandaloneTonalReferenceDiagnostics;
  };
  scale: KiskadeeScaleDiagnostics;
};

export type StandaloneTonalReferenceDiagnostics = StandaloneTonalFunctionalReference & {
  surfaceContrast: number;
  surfaceDeltaE: number;
};

export type StandaloneKiskadeeTonalFamilyPayload = {
  kind: 'kiskadee.single-tonal-family';
  formatVersion: 1;
  generator: typeof STANDALONE_TONAL_ARTIFACT_GENERATOR;
  gridContract: typeof STANDALONE_TONAL_GRID_CONTRACT;
  seedHex: string;
  tonalProfile: KiskadeeTonalProfile;
  policies: {
    light: StandaloneTonalThemePolicy;
    dark: StandaloneTonalThemePolicy;
  };
  generatedAnchors: {
    light: { tone: KiskadeeTone; hex: string };
    dark: { tone: KiskadeeTone; hex: string };
  };
  functionalReferences: {
    light: {
      vivid: StandaloneTonalFunctionalReference;
      subtle: StandaloneTonalFunctionalReference;
    };
    dark: {
      vivid: StandaloneTonalFunctionalReference;
      subtle: StandaloneTonalFunctionalReference;
    };
  };
  scales: {
    light: StandaloneToneHexMap;
    dark: StandaloneToneHexMap;
  };
  diagnostics: {
    status: 'pass' | 'review';
    issues: StandaloneTonalIssue[];
    themes: {
      light: StandaloneTonalThemeDiagnostics;
      dark: StandaloneTonalThemeDiagnostics;
    };
  };
};

export type StandaloneKiskadeeTonalFamilyArtifact = StandaloneKiskadeeTonalFamilyPayload & {
  integrity: {
    algorithm: 'sha256';
    payloadSha256: string;
  };
};

export type StandaloneTonalArtifactVerificationIssue = {
  code:
    | 'INVALID_ARTIFACT'
    | 'UNSUPPORTED_FORMAT'
    | 'GENERATOR_MISMATCH'
    | 'INTEGRITY_MISMATCH'
    | 'REPLAY_MISMATCH';
  path: string;
  message: string;
};

export type StandaloneTonalArtifactVerificationResult =
  | {
      valid: true;
      issues: [];
      artifact: StandaloneKiskadeeTonalFamilyArtifact;
    }
  | {
      valid: false;
      issues: StandaloneTonalArtifactVerificationIssue[];
      artifact: null;
    };

export class StandaloneTonalFamilyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StandaloneTonalFamilyError';
  }
}

type ResolvedTheme = {
  theme: KiskadeeTheme;
  scale: KiskadeeScaleResult;
  anchor: { tone: KiskadeeTone; hex: string };
  vivid: StandaloneTonalReferenceDiagnostics;
  subtle: StandaloneTonalReferenceDiagnostics;
};

/**
 * Generates one portable tonal family without assigning it to a Munsell sector,
 * preset, semantic role, or component formula.
 */
export async function generateStandaloneKiskadeeTonalFamily(
  input: GenerateStandaloneKiskadeeTonalFamilyInput
): Promise<StandaloneKiskadeeTonalFamilyArtifact> {
  assertSourceExactPolicies(input);
  const seedHex = normalizeHexColor(input.seedHex);
  if (!seedHex) {
    throw new StandaloneTonalFamilyError(`Invalid sRGB hex color: ${input.seedHex}`);
  }

  const lightScale = generateRequiredScale(seedHex, 'light', input.tonalProfile);
  const darkScale = generateRequiredScale(seedHex, 'dark', input.tonalProfile);
  const issues: StandaloneTonalIssue[] = [];
  const lightAnchor = resolveAnchor(lightScale, seedHex, 'light');
  const darkAnchor = resolveAnchor(darkScale, seedHex, 'dark');
  const lightVivid = resolveVividReference(lightScale, lightAnchor, 'light', seedHex, issues);
  const darkVivid = resolveVividReference(
    darkScale,
    darkAnchor,
    'dark',
    seedHex,
    issues,
    lightVivid
  );
  const lightSubtle = resolveLightSubtleReference(lightScale, lightVivid, issues);
  const darkSubtle = resolveDarkSubtleReference(darkScale, darkVivid, lightSubtle, issues);
  const light = resolveTheme('light', lightScale, lightAnchor, lightVivid, lightSubtle);
  const dark = resolveTheme('dark', darkScale, darkAnchor, darkVivid, darkSubtle);

  const payload = normalizeArtifactNumbers({
    kind: 'kiskadee.single-tonal-family',
    formatVersion: 1,
    generator: STANDALONE_TONAL_ARTIFACT_GENERATOR,
    gridContract: STANDALONE_TONAL_GRID_CONTRACT,
    seedHex,
    tonalProfile: input.tonalProfile,
    policies: {
      light: input.lightPolicy,
      dark: input.darkPolicy
    },
    generatedAnchors: {
      light: light.anchor,
      dark: dark.anchor
    },
    functionalReferences: {
      light: {
        vivid: toPublicReference(light.vivid),
        subtle: toPublicReference(light.subtle)
      },
      dark: {
        vivid: toPublicReference(dark.vivid),
        subtle: toPublicReference(dark.subtle)
      }
    },
    scales: {
      light: createToneHexMap(light.scale.colors),
      dark: createToneHexMap(dark.scale.colors)
    },
    diagnostics: {
      status: issues.some((issue) => issue.severity === 'review') ? 'review' : 'pass',
      issues,
      themes: {
        light: createThemeDiagnostics(light, seedHex),
        dark: createThemeDiagnostics(dark, seedHex)
      }
    }
  } satisfies StandaloneKiskadeeTonalFamilyPayload);

  return {
    ...payload,
    integrity: {
      algorithm: 'sha256',
      payloadSha256: await hashPayload(payload)
    }
  };
}

export function formatStandaloneKiskadeeTonalFamilyArtifact(
  artifact: StandaloneKiskadeeTonalFamilyArtifact
): string {
  return formatCanonicalJsonFile(artifact);
}

/**
 * Verifies integrity and regenerates the family from its replayable input.
 * A recomputed hash cannot hide an artifact that diverges from the generator.
 */
export async function verifyStandaloneKiskadeeTonalFamilyArtifact(
  input: unknown
): Promise<StandaloneTonalArtifactVerificationResult> {
  const structuralIssues = validateArtifactEnvelope(input);
  if (structuralIssues.length > 0) {
    return { valid: false, issues: structuralIssues, artifact: null };
  }
  const artifact = input as StandaloneKiskadeeTonalFamilyArtifact;
  const { integrity: _integrity, ...payload } = artifact;
  const issues: StandaloneTonalArtifactVerificationIssue[] = [];
  const payloadSha256 = await hashPayload(payload);
  if (payloadSha256 !== artifact.integrity.payloadSha256) {
    issues.push({
      code: 'INTEGRITY_MISMATCH',
      path: '/integrity/payloadSha256',
      message: 'The standalone tonal artifact payload hash does not match its contents.'
    });
  }

  try {
    const replay = await generateStandaloneKiskadeeTonalFamily({
      seedHex: artifact.seedHex,
      tonalProfile: artifact.tonalProfile,
      lightPolicy: artifact.policies.light,
      darkPolicy: artifact.policies.dark
    });
    if (stringifyCanonicalJson(replay) !== stringifyCanonicalJson(artifact)) {
      issues.push({
        code: 'REPLAY_MISMATCH',
        path: '/',
        message: 'The standalone tonal artifact does not match deterministic generator replay.'
      });
    }
  } catch (error) {
    issues.push({
      code: 'REPLAY_MISMATCH',
      path: '/',
      message: `The standalone tonal artifact cannot be replayed: ${toErrorMessage(error)}`
    });
  }

  return issues.length === 0
    ? { valid: true, issues: [], artifact }
    : { valid: false, issues, artifact: null };
}

function assertSourceExactPolicies(input: GenerateStandaloneKiskadeeTonalFamilyInput): void {
  if (input.lightPolicy !== 'source-exact' || input.darkPolicy !== 'source-exact') {
    throw new StandaloneTonalFamilyError(
      'Standalone tonal families support source-exact Light and Dark policies only.'
    );
  }
}

function generateRequiredScale(
  seedHex: string,
  theme: KiskadeeTheme,
  profile: KiskadeeTonalProfile
): KiskadeeScaleResult {
  const result = generateKiskadeeScale({ seedHex, theme, profile });
  if (!result.diagnostics.valid || result.anchorTone === null) {
    const error = result.diagnostics.error?.message ?? `${theme} scale generation failed.`;
    throw new StandaloneTonalFamilyError(error);
  }
  return result;
}

function resolveAnchor(
  scale: KiskadeeScaleResult,
  seedHex: string,
  theme: KiskadeeTheme
): { tone: KiskadeeTone; hex: string } {
  const color = scale.colors.find((candidate) => candidate.tone === scale.anchorTone);
  if (!color || color.hex !== seedHex) {
    throw new StandaloneTonalFamilyError(
      `${theme} source-exact scale does not preserve ${seedHex} at its generated anchor.`
    );
  }
  return { tone: color.tone, hex: color.hex };
}

function resolveVividReference(
  scale: KiskadeeScaleResult,
  anchor: { tone: KiskadeeTone; hex: string },
  theme: KiskadeeTheme,
  seedHex: string,
  issues: StandaloneTonalIssue[],
  lightVivid?: StandaloneTonalReferenceDiagnostics
): StandaloneTonalReferenceDiagnostics {
  const anchorColor = resolveColor(scale, anchor.tone);
  if (!anchorColor.flags.isCap) {
    return createReference(anchorColor, theme, 'generated-anchor');
  }

  if (theme === 'dark' && seedHex === '#000000' && lightVivid) {
    const mirrored = findContrastMirror(
      scale,
      theme,
      lightVivid.surfaceContrast,
      KISKADEE_TONES.filter((tone) => tone > 0 && tone < 100)
    );
    issues.push(createCapFallbackIssue(theme, anchor.tone, mirrored.tone, 'contrast-mirror'));
    return createReference(mirrored, theme, 'contrast-mirror');
  }

  const fallback = resolveColor(scale, CAP_SAFE_LIGHT_VIVID_TONE);
  issues.push(createCapFallbackIssue(theme, anchor.tone, fallback.tone, 'cap-fallback'));
  return createReference(fallback, theme, 'cap-fallback');
}

function createCapFallbackIssue(
  theme: KiskadeeTheme,
  anchorTone: KiskadeeTone,
  fallbackTone: KiskadeeTone,
  source: 'cap-fallback' | 'contrast-mirror'
): StandaloneTonalIssue {
  return {
    severity: 'info',
    code: 'VIVID_REFERENCE_CAP_FALLBACK',
    path: `/functionalReferences/${theme}/vivid`,
    message: `${theme} anchors at absolute cap ${anchorTone}; functional vivid uses tone ${fallbackTone} via ${source} without recoloring the scale.`,
    theme
  };
}

function resolveLightSubtleReference(
  scale: KiskadeeScaleResult,
  vivid: StandaloneTonalReferenceDiagnostics,
  issues: StandaloneTonalIssue[]
): StandaloneTonalReferenceDiagnostics {
  const candidates = resolveSurfaceSideCandidates(scale, vivid.tone);
  if (candidates.length === 0) {
    const fallback = resolveColor(scale, 1);
    issues.push(createSubtleFallbackIssue('light', vivid.tone, fallback.tone));
    return createReference(fallback, 'light', 'surface-relative');
  }
  const color = candidates.find((candidate) => candidate.tone === 4) ?? candidates.at(-1);
  if (!color)
    throw new StandaloneTonalFamilyError('Light scale has no subtle reference candidate.');
  return createReference(color, 'light', 'surface-relative');
}

function resolveDarkSubtleReference(
  scale: KiskadeeScaleResult,
  vivid: StandaloneTonalReferenceDiagnostics,
  lightSubtle: StandaloneTonalReferenceDiagnostics,
  issues: StandaloneTonalIssue[]
): StandaloneTonalReferenceDiagnostics {
  const candidates = resolveSurfaceSideCandidates(scale, vivid.tone);
  if (candidates.length === 0) {
    const fallback = resolveColor(scale, 1);
    issues.push(createSubtleFallbackIssue('dark', vivid.tone, fallback.tone));
    return createReference(fallback, 'dark', 'contrast-mirror');
  }
  const color = findContrastMirror(
    scale,
    'dark',
    lightSubtle.surfaceContrast,
    candidates.map((candidate) => candidate.tone)
  );
  return createReference(color, 'dark', 'contrast-mirror');
}

function createSubtleFallbackIssue(
  theme: KiskadeeTheme,
  vividTone: KiskadeeTone,
  fallbackTone: KiskadeeTone
): StandaloneTonalIssue {
  return {
    severity: 'review',
    code: 'SUBTLE_REFERENCE_SURFACE_EDGE_FALLBACK',
    path: `/functionalReferences/${theme}/subtle`,
    message: `${theme} vivid tone ${vividTone} leaves no distinct non-cap surface-side tone; subtle reuses tone ${fallbackTone}.`,
    theme
  };
}

function resolveSurfaceSideCandidates(
  scale: KiskadeeScaleResult,
  vividTone: KiskadeeTone
): KiskadeeScaleColor[] {
  const vividIndex = KISKADEE_TONES.indexOf(vividTone);
  return scale.colors.filter(
    (color, index) => color.tone > 0 && color.tone < 100 && index < vividIndex
  );
}

function findContrastMirror(
  scale: KiskadeeScaleResult,
  theme: KiskadeeTheme,
  targetContrast: number,
  allowedTones: KiskadeeTone[]
): KiskadeeScaleColor {
  const surfaceHex = theme === 'light' ? '#ffffff' : '#000000';
  const candidates = scale.colors.filter(
    (color) => color.tone > 0 && color.tone < 100 && allowedTones.includes(color.tone)
  );
  const best = candidates.reduce<KiskadeeScaleColor | null>((current, candidate) => {
    if (!current) return candidate;
    const currentContrast = contrastRatio(current.hex, surfaceHex);
    const candidateContrast = contrastRatio(candidate.hex, surfaceHex);
    const currentError = Math.abs(Math.log(currentContrast / targetContrast));
    const candidateError = Math.abs(Math.log(candidateContrast / targetContrast));
    return candidateError < currentError ||
      (candidateError === currentError && candidate.tone < current.tone)
      ? candidate
      : current;
  }, null);
  if (!best)
    throw new StandaloneTonalFamilyError(`${theme} scale has no contrast-mirror candidate.`);
  return best;
}

function resolveTheme(
  theme: KiskadeeTheme,
  scale: KiskadeeScaleResult,
  anchor: { tone: KiskadeeTone; hex: string },
  vivid: StandaloneTonalReferenceDiagnostics,
  subtle: StandaloneTonalReferenceDiagnostics
): ResolvedTheme {
  return { theme, scale, anchor, vivid, subtle };
}

function createReference(
  color: KiskadeeScaleColor,
  theme: KiskadeeTheme,
  source: StandaloneTonalReferenceSource
): StandaloneTonalReferenceDiagnostics {
  const surfaceHex = theme === 'light' ? '#ffffff' : '#000000';
  return {
    tone: color.tone,
    hex: color.hex,
    source,
    surfaceContrast: contrastRatio(color.hex, surfaceHex),
    surfaceDeltaE: deltaEOk(color.oklch, hexToOklch(surfaceHex))
  };
}

function createThemeDiagnostics(
  theme: ResolvedTheme,
  seedHex: string
): StandaloneTonalThemeDiagnostics {
  return {
    sourceSeedPreserved: theme.anchor.hex === seedHex,
    generatedAnchor: theme.anchor,
    functionalReferences: {
      vivid: theme.vivid,
      subtle: theme.subtle
    },
    scale: theme.scale.diagnostics
  };
}

function toPublicReference(
  reference: StandaloneTonalReferenceDiagnostics
): StandaloneTonalFunctionalReference {
  return {
    tone: reference.tone,
    hex: reference.hex,
    source: reference.source
  };
}

function resolveColor(scale: KiskadeeScaleResult, tone: KiskadeeTone): KiskadeeScaleColor {
  const color = scale.colors.find((candidate) => candidate.tone === tone);
  if (!color) throw new StandaloneTonalFamilyError(`Scale is missing public tone ${tone}.`);
  return color;
}

function createToneHexMap(colors: KiskadeeScaleColor[]): StandaloneToneHexMap {
  return Object.fromEntries(
    colors.map((color) => [String(color.tone), color.hex])
  ) as StandaloneToneHexMap;
}

async function hashPayload(payload: StandaloneKiskadeeTonalFamilyPayload): Promise<string> {
  return sha256Hex(formatCanonicalJsonFile(payload));
}

function normalizeArtifactNumbers<T>(value: T): T {
  if (typeof value === 'number') return Number(value.toFixed(8)) as T;
  if (Array.isArray(value)) return value.map((item) => normalizeArtifactNumbers(item)) as T;
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeArtifactNumbers(item)])
    ) as T;
  }
  return value;
}

function validateArtifactEnvelope(input: unknown): StandaloneTonalArtifactVerificationIssue[] {
  if (!isRecord(input)) {
    return [
      {
        code: 'INVALID_ARTIFACT',
        path: '/',
        message: 'Standalone tonal artifact must be an object.'
      }
    ];
  }
  if (input.kind !== 'kiskadee.single-tonal-family' || input.formatVersion !== 1) {
    return [
      {
        code: 'UNSUPPORTED_FORMAT',
        path: '/',
        message: 'Unsupported standalone tonal artifact kind or format version.'
      }
    ];
  }
  if (
    !isRecord(input.generator) ||
    input.generator.package !== STANDALONE_TONAL_ARTIFACT_GENERATOR.package ||
    input.generator.version !== STANDALONE_TONAL_ARTIFACT_GENERATOR.version
  ) {
    return [
      {
        code: 'GENERATOR_MISMATCH',
        path: '/generator',
        message: 'Standalone tonal artifact generator does not match this package.'
      }
    ];
  }
  if (
    typeof input.seedHex !== 'string' ||
    typeof input.tonalProfile !== 'string' ||
    !isRecord(input.policies) ||
    input.policies.light !== 'source-exact' ||
    input.policies.dark !== 'source-exact' ||
    !isRecord(input.integrity) ||
    input.integrity.algorithm !== 'sha256' ||
    typeof input.integrity.payloadSha256 !== 'string'
  ) {
    return [
      {
        code: 'INVALID_ARTIFACT',
        path: '/',
        message: 'Standalone tonal artifact is missing its replay or integrity contract.'
      }
    ];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
