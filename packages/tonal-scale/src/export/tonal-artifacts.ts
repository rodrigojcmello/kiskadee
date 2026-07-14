import { compareStrings } from '../deterministic-order.ts';
import { FIXED_FAMILY_REFERENCE_SET, FIXED_FAMILY_SEEDS_V1 } from '../fixed-family-seeds.ts';
import { KISKADEE_TONES, type KiskadeeTone } from '../kiskadee-tonal-scale.ts';
import { classifyMunsellHex, type MunsellColorClassification } from '../munsell-oklch.ts';
import {
  generateKiskadeeTonalSystem,
  type ResolvedKiskadeeTonalSystem,
  type ResolvedTonalFamily,
  resolveTonalStateReference,
  type TonalStateReference,
  type TonalSystemIssue
} from '../tonal-system.ts';
import {
  type CoreTonalFamilyId,
  type LockedTonalSystemSourceV3,
  TONAL_CORE_FAMILY_IDS,
  type TonalFamilyAppearance,
  type TonalFamilyColorKind,
  type TonalFamilyId,
  type TonalFamilySectorNotation,
  type TonalFamilyVariant,
  type TonalThemePolicy,
  validateLockedTonalSystemSource
} from '../tonal-system-contract.ts';
import { formatCanonicalJsonFile } from './canonical-json.ts';
import { sha256Hex } from './sha256.ts';

export const TONAL_ARTIFACT_GENERATOR = {
  package: '@kiskadee/tonal-scale',
  version: '0.3.0'
} as const;
export const TONAL_SOURCE_PATH = 'tonal-system.source.json' as const;
export const TONAL_MANIFEST_PATH = 'tonal-system.json' as const;
export const TONAL_DIAGNOSTICS_PATH = 'tonal-system.diagnostics.json' as const;

export type TonalArtifactPath =
  | typeof TONAL_SOURCE_PATH
  | typeof TONAL_MANIFEST_PATH
  | typeof TONAL_DIAGNOSTICS_PATH
  | `colors/${TonalFamilyId}.json`;

export type ToneHexMap = Record<`${KiskadeeTone}`, string>;

export type PrimitiveTonalColorAssetV3 = {
  kind: 'kiskadee.primitive-tonal-family';
  formatVersion: 3;
  generator: typeof TONAL_ARTIFACT_GENERATOR;
  id: TonalFamilyId;
  munsellSector: TonalFamilySectorNotation | 'N';
  appearance: TonalFamilyAppearance;
  variant: TonalFamilyVariant;
  colorKind: TonalFamilyColorKind;
  role: 'primary' | 'support';
  tonalProfile: LockedTonalSystemSourceV3['tonalProfile'];
  seedHex: string;
  seedOrigin: ResolvedTonalFamily['seedOrigin'];
  policies: { light: TonalThemePolicy; dark: TonalThemePolicy };
  tonalAnchors: { rest: { light: KiskadeeTone; dark: KiskadeeTone } };
  generatedAnchors: {
    light: { tone: KiskadeeTone; hex: string };
    dark: { tone: KiskadeeTone; hex: string };
  };
  restColors: {
    light: { tone: KiskadeeTone; hex: string };
    dark: { tone: KiskadeeTone; hex: string };
  };
  stateReferences: {
    light: ArtifactStateReference;
    dark: ArtifactStateReference;
  };
  scales: { light: ToneHexMap; dark: ToneHexMap };
};

type ArtifactStateReference = Pick<TonalStateReference, 'tone' | 'hex' | 'source'>;

export type TonalManifestAssetEntry = {
  familyId: TonalFamilyId;
  path: `colors/${TonalFamilyId}.json`;
  sha256: string;
};

export type TonalSystemManifestV3 = {
  kind: 'kiskadee.tonal-system';
  formatVersion: 3;
  generator: typeof TONAL_ARTIFACT_GENERATOR;
  tonalProfile: LockedTonalSystemSourceV3['tonalProfile'];
  primaryReference: TonalFamilyId;
  tonalAnchors: { rest: { light: KiskadeeTone; dark: KiskadeeTone } };
  source: { path: typeof TONAL_SOURCE_PATH; sha256: string };
  diagnostics: { path: typeof TONAL_DIAGNOSTICS_PATH };
  assets: TonalManifestAssetEntry[];
};

export type TonalSystemDiagnosticsV3 = {
  kind: 'kiskadee.tonal-system-diagnostics';
  formatVersion: 3;
  generator: typeof TONAL_ARTIFACT_GENERATOR;
  seedModel: 'fixed-reference';
  referenceSet: typeof FIXED_FAMILY_REFERENCE_SET;
  status: 'pass' | 'review';
  issues: TonalSystemIssue[];
  functionalRest: ResolvedKiskadeeTonalSystem['functionalRestDiagnostics'];
  primaryReference: ResolvedKiskadeeTonalSystem['primaryReference'];
  families: Array<{
    familyId: TonalFamilyId;
    seedOrigin: ResolvedTonalFamily['seedOrigin'];
    classification: ResolvedTonalFamily['identity'];
    status: 'pass' | 'review';
    themes: {
      light: ThemeDiagnostics;
      dark: ThemeDiagnostics;
    };
  }>;
};

type ThemeDiagnostics = {
  policy: TonalThemePolicy;
  status: 'pass' | 'review';
  sourceSeedPreserved: boolean;
  effectiveSeedHex: string;
  generatedAnchor: { tone: KiskadeeTone; hex: string };
  functionalRest: { tone: KiskadeeTone; hex: string };
  stateReference: ArtifactStateReference;
  classification: MunsellColorClassification | null;
  harmony: ResolvedTonalFamily['themes']['light']['harmony'];
  scale: ResolvedTonalFamily['themes']['light']['scale']['diagnostics'];
};

export type TonalArtifactBundle = {
  source: LockedTonalSystemSourceV3;
  manifest: TonalSystemManifestV3;
  diagnostics: TonalSystemDiagnosticsV3;
  assets: PrimitiveTonalColorAssetV3[];
  files: ReadonlyMap<TonalArtifactPath, string>;
};

export type TonalArtifactVerificationIssue = {
  code:
    | 'INVALID_SOURCE_JSON'
    | 'INVALID_SOURCE'
    | 'UNRESOLVABLE_SOURCE'
    | 'MISSING_FILE'
    | 'EXTRA_FILE'
    | 'NON_CANONICAL_FILE'
    | 'CONTENT_MISMATCH';
  path: string;
  message: string;
};

export type TonalArtifactVerificationResult =
  | {
      valid: true;
      issues: [];
      source: LockedTonalSystemSourceV3;
      manifest: TonalSystemManifestV3;
      diagnostics: TonalSystemDiagnosticsV3;
      assets: PrimitiveTonalColorAssetV3[];
    }
  | {
      valid: false;
      issues: TonalArtifactVerificationIssue[];
      source: null;
      manifest: null;
      diagnostics: null;
      assets: [];
    };

export class TonalArtifactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TonalArtifactError';
  }
}

export async function createTonalArtifactBundle(
  system: ResolvedKiskadeeTonalSystem
): Promise<TonalArtifactBundle> {
  assertResolvedSystem(system);

  const assets = system.families.map((family) => createColorAsset(system, family));
  assets.sort((left, right) => compareStrings(left.id, right.id));
  const assetRecords = await Promise.all(
    assets.map(async (asset) => ({
      asset,
      path: colorAssetPath(asset.id),
      sha256: await hashCanonicalFile(asset)
    }))
  );
  const diagnostics = normalizeArtifactNumbers<TonalSystemDiagnosticsV3>({
    kind: 'kiskadee.tonal-system-diagnostics',
    formatVersion: system.source.formatVersion,
    generator: TONAL_ARTIFACT_GENERATOR,
    seedModel: 'fixed-reference',
    referenceSet: FIXED_FAMILY_REFERENCE_SET,
    status: system.status,
    issues: normalizeIssues(system.issues),
    functionalRest: system.functionalRestDiagnostics,
    primaryReference: system.primaryReference,
    families: system.families
      .map((family) => ({
        familyId: family.id,
        seedOrigin: family.seedOrigin,
        classification: family.identity,
        status: family.status,
        themes: {
          light: createThemeDiagnostics(family, family.themes.light),
          dark: createThemeDiagnostics(family, family.themes.dark)
        }
      }))
      .sort((left, right) => compareStrings(left.familyId, right.familyId))
  });
  const manifest: TonalSystemManifestV3 = {
    kind: 'kiskadee.tonal-system',
    formatVersion: system.source.formatVersion,
    generator: TONAL_ARTIFACT_GENERATOR,
    tonalProfile: system.source.tonalProfile,
    primaryReference: system.primaryReference.familyId,
    tonalAnchors: { rest: { light: system.rest.light, dark: system.rest.dark } },
    source: {
      path: TONAL_SOURCE_PATH,
      sha256: await hashCanonicalFile(system.source)
    },
    diagnostics: { path: TONAL_DIAGNOSTICS_PATH },
    assets: assetRecords.map(({ asset, path, sha256 }) => ({
      familyId: asset.id,
      path,
      sha256
    }))
  };

  const files = new Map<TonalArtifactPath, string>();
  files.set(TONAL_SOURCE_PATH, formatCanonicalJsonFile(system.source));
  files.set(TONAL_MANIFEST_PATH, formatCanonicalJsonFile(manifest));
  files.set(TONAL_DIAGNOSTICS_PATH, formatCanonicalJsonFile(diagnostics));
  for (const { asset, path } of assetRecords) files.set(path, formatCanonicalJsonFile(asset));

  return { source: system.source, manifest, diagnostics, assets, files };
}

export async function verifyTonalArtifactBundle(
  files: ReadonlyMap<string, string>
): Promise<TonalArtifactVerificationResult> {
  const sourceText = files.get(TONAL_SOURCE_PATH);
  if (sourceText === undefined) {
    return failedVerification([
      {
        code: 'MISSING_FILE',
        path: TONAL_SOURCE_PATH,
        message: `${TONAL_SOURCE_PATH} is required.`
      }
    ]);
  }

  let rawSource: unknown;
  try {
    rawSource = JSON.parse(sourceText);
  } catch {
    return failedVerification([
      {
        code: 'INVALID_SOURCE_JSON',
        path: TONAL_SOURCE_PATH,
        message: `${TONAL_SOURCE_PATH} must contain valid JSON.`
      }
    ]);
  }

  const sourceValidation = validateLockedTonalSystemSource(rawSource);
  if (!sourceValidation.valid) {
    return failedVerification(
      sourceValidation.issues.map((issue) => ({
        code: 'INVALID_SOURCE' as const,
        path: `${TONAL_SOURCE_PATH}${issue.path}`,
        message: issue.message
      }))
    );
  }

  const system = generateKiskadeeTonalSystem(sourceValidation.value);
  if (!system.valid) {
    return failedVerification(
      system.issues.map((issue) => ({
        code: 'UNRESOLVABLE_SOURCE' as const,
        path: `${TONAL_SOURCE_PATH}${issue.path}`,
        message: issue.message
      }))
    );
  }

  const expected = await createTonalArtifactBundle(system);
  const issues: TonalArtifactVerificationIssue[] = [];
  const expectedFiles = new Map<string, string>(expected.files);

  for (const [path, expectedText] of expectedFiles) {
    const actualText = files.get(path);
    if (actualText === undefined) {
      issues.push({ code: 'MISSING_FILE', path, message: `${path} is required by the source.` });
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(actualText);
    } catch {
      issues.push({ code: 'CONTENT_MISMATCH', path, message: `${path} must contain valid JSON.` });
      continue;
    }
    let canonicalText: string;
    try {
      canonicalText = formatCanonicalJsonFile(parsed);
    } catch {
      issues.push({
        code: 'CONTENT_MISMATCH',
        path,
        message: `${path} contains a value outside the canonical JSON contract.`
      });
      continue;
    }
    if (canonicalText !== actualText) {
      issues.push({
        code: 'NON_CANONICAL_FILE',
        path,
        message: `${path} does not use the canonical serialization.`
      });
    } else if (actualText !== expectedText) {
      issues.push({
        code: 'CONTENT_MISMATCH',
        path,
        message: `${path} does not match the locked source.`
      });
    }
  }

  for (const path of files.keys()) {
    if (!expectedFiles.has(path)) {
      issues.push({
        code: 'EXTRA_FILE',
        path,
        message: `${path} is not part of this artifact set.`
      });
    }
  }

  issues.sort(compareVerificationIssues);
  if (issues.length > 0) return failedVerification(issues);
  return {
    valid: true,
    issues: [],
    source: expected.source,
    manifest: expected.manifest,
    diagnostics: expected.diagnostics,
    assets: expected.assets
  };
}

function createColorAsset(
  system: ResolvedKiskadeeTonalSystem,
  family: ResolvedTonalFamily
): PrimitiveTonalColorAssetV3 {
  const lightAnchor = resolveSourceAnchor(family, 'light');
  const darkAnchor = resolveSourceAnchor(family, 'dark');
  const lightStateReference = resolveArtifactStateReference(family, 'light');
  const darkStateReference = resolveArtifactStateReference(family, 'dark');
  return {
    kind: 'kiskadee.primitive-tonal-family',
    formatVersion: system.source.formatVersion,
    generator: TONAL_ARTIFACT_GENERATOR,
    id: family.id,
    munsellSector: family.munsellSector,
    appearance: family.appearance,
    variant: family.variant,
    colorKind: family.colorKind,
    role: family.role,
    tonalProfile: system.source.tonalProfile,
    seedHex: family.sourceSeedHex,
    seedOrigin: family.seedOrigin,
    policies: {
      light: family.themes.light.policy,
      dark: family.themes.dark.policy
    },
    tonalAnchors: { rest: { light: system.rest.light, dark: system.rest.dark } },
    generatedAnchors: { light: lightAnchor, dark: darkAnchor },
    restColors: {
      light: { tone: family.themes.light.restTone, hex: family.themes.light.restColor.hex },
      dark: { tone: family.themes.dark.restTone, hex: family.themes.dark.restColor.hex }
    },
    stateReferences: { light: lightStateReference, dark: darkStateReference },
    scales: {
      light: createToneHexMap(family.themes.light.scale.colors),
      dark: createToneHexMap(family.themes.dark.scale.colors)
    }
  };
}

function resolveArtifactStateReference(
  family: ResolvedTonalFamily,
  theme: 'light' | 'dark'
): ArtifactStateReference {
  const { tone, hex, source } = resolveTonalStateReference(family, theme);
  return { tone, hex, source };
}

function resolveSourceAnchor(
  family: ResolvedTonalFamily,
  theme: 'light' | 'dark'
): { tone: KiskadeeTone; hex: string } {
  const resolution = family.themes[theme];
  const anchorTone = resolution.scale.anchorTone;
  const anchorColor = resolution.scale.colors.find((color) => color.tone === anchorTone);
  if (anchorTone === null || !anchorColor) {
    throw new TonalArtifactError(`${family.id} ${theme} is missing its generated anchor.`);
  }
  return { tone: anchorTone, hex: anchorColor.hex };
}

function createThemeDiagnostics(
  family: ResolvedTonalFamily,
  theme: ResolvedTonalFamily['themes']['light']
): ThemeDiagnostics {
  const anchorTone = theme.scale.anchorTone;
  const anchorColor =
    anchorTone === null ? undefined : theme.scale.colors.find((color) => color.tone === anchorTone);
  if (anchorTone === null || !anchorColor) {
    throw new TonalArtifactError(`${family.id} ${theme.theme} is missing its generated anchor.`);
  }
  return {
    policy: theme.policy,
    status: theme.status,
    sourceSeedPreserved: theme.sourceSeedPreserved,
    effectiveSeedHex: theme.effectiveSeedHex,
    generatedAnchor: { tone: anchorTone, hex: anchorColor.hex },
    functionalRest: { tone: theme.restTone, hex: theme.restColor.hex },
    stateReference: resolveArtifactStateReference(family, theme.theme),
    classification:
      family.colorKind === 'chromatic' ? classifyMunsellHex(theme.effectiveSeedHex) : null,
    harmony: theme.harmony,
    scale: theme.scale.diagnostics
  };
}

function createToneHexMap(
  colors: ResolvedTonalFamily['themes']['light']['scale']['colors']
): ToneHexMap {
  return Object.fromEntries(colors.map((color) => [String(color.tone), color.hex])) as ToneHexMap;
}

function normalizeIssues(issues: TonalSystemIssue[]): TonalSystemIssue[] {
  return issues
    .map((issue) => ({ ...issue }))
    .sort((left, right) => {
      const pathDifference = compareStrings(left.path, right.path);
      if (pathDifference !== 0) return pathDifference;
      const codeDifference = compareStrings(left.code, right.code);
      if (codeDifference !== 0) return codeDifference;
      return compareStrings(left.familyId ?? '', right.familyId ?? '');
    });
}

function colorAssetPath(familyId: TonalFamilyId): `colors/${TonalFamilyId}.json` {
  return `colors/${familyId}.json`;
}

async function hashCanonicalFile(value: unknown): Promise<string> {
  return sha256Hex(formatCanonicalJsonFile(value));
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

function assertResolvedSystem(system: ResolvedKiskadeeTonalSystem): void {
  if (system.source.tonalAnchors.rest.mode !== 'locked') {
    throw new TonalArtifactError('Export requires locked Light and Dark rest positions.');
  }
  if (
    system.families.length < TONAL_CORE_FAMILY_IDS.length ||
    TONAL_CORE_FAMILY_IDS.some((id) => !system.families.some((family) => family.id === id))
  ) {
    throw new TonalArtifactError('Export is atomic and requires all twelve core families.');
  }
  const overrideById = new Map(system.source.overrides.map((override) => [override.id, override]));
  const seen = new Set<TonalFamilyId>();
  for (const family of system.families) {
    if (seen.has(family.id)) {
      throw new TonalArtifactError(`${family.id} is duplicated in the resolved system.`);
    }
    if (
      family.seedOrigin === 'primary' &&
      (family.id !== system.source.primary.id ||
        family.sourceSeedHex !== system.source.primary.seedHex)
    ) {
      throw new TonalArtifactError(`${family.id} does not match the locked primary.`);
    }
    if (
      family.seedOrigin === 'override' &&
      overrideById.get(family.id)?.seedHex !== family.sourceSeedHex
    ) {
      throw new TonalArtifactError(`${family.id} does not match its locked override.`);
    }
    if (family.seedOrigin === 'reference') {
      const referenceSeed = Object.hasOwn(FIXED_FAMILY_SEEDS_V1, family.id)
        ? FIXED_FAMILY_SEEDS_V1[family.id as CoreTonalFamilyId]
        : undefined;
      if (referenceSeed !== family.sourceSeedHex) {
        throw new TonalArtifactError(`${family.id} does not match the fixed reference set.`);
      }
    }
    if (family.seedOrigin === 'derived') {
      throw new TonalArtifactError(
        `${family.id} cannot use a primary-derived seed in a fixed-reference artifact.`
      );
    }
    if (
      family.seedOrigin === 'canonical' &&
      (family.id !== 'n.black.v1' || family.sourceSeedHex !== FIXED_FAMILY_SEEDS_V1['n.black.v1'])
    ) {
      throw new TonalArtifactError(`${family.id} cannot use canonical seed origin.`);
    }
    seen.add(family.id);
    assertThemeScale(family, 'light');
    assertThemeScale(family, 'dark');
  }
}

function assertThemeScale(family: ResolvedTonalFamily, theme: 'light' | 'dark'): void {
  const resolution = family.themes[theme];
  if (!resolution.scale.diagnostics.valid || resolution.restTone !== resolution.restColor.tone) {
    throw new TonalArtifactError(`${family.id} ${theme} scale is invalid.`);
  }
  if (
    resolution.scale.colors.length !== KISKADEE_TONES.length ||
    KISKADEE_TONES.some((tone, index) => resolution.scale.colors[index]?.tone !== tone)
  ) {
    throw new TonalArtifactError(`${family.id} ${theme} scale has an invalid public grid.`);
  }
  const expectedCaps = theme === 'light' ? ['#ffffff', '#000000'] : ['#000000', '#ffffff'];
  if (
    resolution.scale.colors[0]?.hex !== expectedCaps[0] ||
    resolution.scale.colors.at(-1)?.hex !== expectedCaps[1]
  ) {
    throw new TonalArtifactError(`${family.id} ${theme} scale has invalid absolute caps.`);
  }
}

function failedVerification(
  issues: TonalArtifactVerificationIssue[]
): TonalArtifactVerificationResult {
  return { valid: false, issues, source: null, manifest: null, diagnostics: null, assets: [] };
}

function compareVerificationIssues(
  left: TonalArtifactVerificationIssue,
  right: TonalArtifactVerificationIssue
): number {
  const pathDifference = compareStrings(left.path, right.path);
  return pathDifference === 0 ? compareStrings(left.code, right.code) : pathDifference;
}
