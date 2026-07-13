import { normalizeHexColor } from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
import {
  isKiskadeeTonalProfile,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from './kiskadee-tonal-scale.ts';

export const TONAL_SYSTEM_FORMAT_VERSION = 2 as const;
export const TONAL_GRID_CONTRACT = 'kiskadee-tonal-v1' as const;
export const TONAL_HARMONY_CONTRACT = 'kiskadee-munsell-rest-v1' as const;

export const MUNSELL_SECTORS = [
  'red',
  'yellow-red',
  'yellow',
  'green-yellow',
  'green',
  'blue-green',
  'blue',
  'purple-blue',
  'purple',
  'red-purple'
] as const;

export const TONAL_FAMILY_NAMES = [...MUNSELL_SECTORS, 'black'] as const;
export const TONAL_FAMILY_VARIANTS = ['v1', 'v2', 'v3', 'v4'] as const;

export type TonalFamilySector = (typeof MUNSELL_SECTORS)[number];
export type TonalFamilyName = (typeof TONAL_FAMILY_NAMES)[number];
export type TonalFamilyVariant = (typeof TONAL_FAMILY_VARIANTS)[number];
export type TonalPrimaryVariant = 'auto' | TonalFamilyVariant;
export type TonalFamilyId = `${TonalFamilyName}.${TonalFamilyVariant}`;
export type TonalFamilyColorKind = 'chromatic' | 'achromatic';
export type TonalThemePolicy = 'source-exact' | 'adaptive' | 'harmonized';
export type PrimaryLightPolicy = 'source-exact';
export type PrimaryDarkPolicy = 'source-exact' | 'adaptive';

export const TONAL_CORE_FAMILY_IDS = [
  'red.v1',
  'yellow-red.v1',
  'yellow-red.v2',
  'yellow.v1',
  'green-yellow.v1',
  'green.v1',
  'blue-green.v1',
  'blue.v1',
  'purple-blue.v1',
  'purple.v1',
  'red-purple.v1',
  'black.v1'
] as const satisfies readonly TonalFamilyId[];

export type CoreTonalFamilyId = (typeof TONAL_CORE_FAMILY_IDS)[number];

export type TonalPrimaryDraftV2 = {
  seedHex: string;
  variant: TonalPrimaryVariant;
  policies: {
    light: PrimaryLightPolicy;
    dark: PrimaryDarkPolicy;
  };
};

export type TonalPrimaryLockedV2 = {
  id: TonalFamilyId;
  seedHex: string;
  policies: TonalPrimaryDraftV2['policies'];
};

export type TonalFamilyOverrideV2 = {
  id: TonalFamilyId;
  seedHex: string;
  policies: {
    light: TonalThemePolicy;
    dark: TonalThemePolicy;
  };
};

export type AutoRest = {
  mode: 'auto';
};

export type LockedRest = {
  mode: 'locked';
  light: KiskadeeTone;
  dark: KiskadeeTone;
};

type TonalSystemContractBase = {
  formatVersion: typeof TONAL_SYSTEM_FORMAT_VERSION;
  gridContract: typeof TONAL_GRID_CONTRACT;
  harmonyContract: typeof TONAL_HARMONY_CONTRACT;
  tonalProfile: KiskadeeTonalProfile;
  overrides: TonalFamilyOverrideV2[];
};

export type TonalSystemRecipeV2 = TonalSystemContractBase & {
  primary: TonalPrimaryDraftV2;
  tonalAnchors: {
    rest: AutoRest | LockedRest;
  };
};

export type LockedTonalSystemSourceV2 = TonalSystemContractBase & {
  primary: TonalPrimaryLockedV2;
  tonalAnchors: {
    rest: LockedRest;
  };
};

export type TonalSystemValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export type TonalSystemValidationResult<T> =
  | { valid: true; value: T; issues: [] }
  | { valid: false; value: null; issues: TonalSystemValidationIssue[] };

export const DEFAULT_TONAL_SYSTEM_RECIPE = {
  formatVersion: TONAL_SYSTEM_FORMAT_VERSION,
  gridContract: TONAL_GRID_CONTRACT,
  harmonyContract: TONAL_HARMONY_CONTRACT,
  tonalProfile: 'balanced',
  primary: {
    seedHex: '#0f6cbd',
    variant: 'auto',
    policies: { light: 'source-exact', dark: 'source-exact' }
  },
  tonalAnchors: {
    rest: {
      mode: 'auto'
    }
  },
  overrides: []
} as const satisfies TonalSystemRecipeV2;

const RECIPE_KEYS = [
  'formatVersion',
  'gridContract',
  'harmonyContract',
  'tonalProfile',
  'primary',
  'tonalAnchors',
  'overrides'
] as const;
const PRIMARY_DRAFT_KEYS = ['seedHex', 'variant', 'policies'] as const;
const PRIMARY_LOCKED_KEYS = ['id', 'seedHex', 'policies'] as const;
const OVERRIDE_KEYS = ['id', 'seedHex', 'policies'] as const;
const FAMILY_POLICY_KEYS = ['light', 'dark'] as const;
const TONAL_ANCHOR_KEYS = ['rest'] as const;
const AUTO_REST_KEYS = ['mode'] as const;
const LOCKED_REST_KEYS = ['mode', 'light', 'dark'] as const;

export type ParsedTonalFamilyId =
  | {
      family: TonalFamilySector;
      sector: TonalFamilySector;
      variant: TonalFamilyVariant;
    }
  | {
      family: 'black';
      sector: null;
      variant: TonalFamilyVariant;
    };

export function createTonalFamilyId(
  family: TonalFamilyName,
  variant: TonalFamilyVariant
): TonalFamilyId {
  return `${family}.${variant}`;
}

export function parseTonalFamilyId(value: string): ParsedTonalFamilyId | null {
  const [family, variant, extra] = value.split('.');

  if (
    extra !== undefined ||
    !TONAL_FAMILY_NAMES.includes(family as TonalFamilyName) ||
    !TONAL_FAMILY_VARIANTS.includes(variant as TonalFamilyVariant)
  ) {
    return null;
  }

  if (family === 'black') {
    return { family, sector: null, variant: variant as TonalFamilyVariant };
  }

  return {
    family: family as TonalFamilySector,
    sector: family as TonalFamilySector,
    variant: variant as TonalFamilyVariant
  };
}

export function resolveTonalFamilyColorKind(id: TonalFamilyId): TonalFamilyColorKind {
  return id.startsWith('black.') ? 'achromatic' : 'chromatic';
}

export function validateTonalSystemRecipe(
  input: unknown
): TonalSystemValidationResult<TonalSystemRecipeV2> {
  return validateContract(input, 'draft');
}

export function validateLockedTonalSystemSource(
  input: unknown
): TonalSystemValidationResult<LockedTonalSystemSourceV2> {
  return validateContract(input, 'locked');
}

export function lockTonalSystemRecipe(
  recipe: TonalSystemRecipeV2,
  primaryId: TonalFamilyId,
  rest: { light: KiskadeeTone; dark: KiskadeeTone }
): LockedTonalSystemSourceV2 {
  const recipeValidation = validateTonalSystemRecipe(recipe);
  if (!recipeValidation.valid) {
    throw new Error(
      `Cannot lock an invalid tonal-system recipe: ${recipeValidation.issues
        .map((issue) => `${issue.path || '/'} ${issue.code}`)
        .join(', ')}.`
    );
  }
  const normalizedRecipe = recipeValidation.value;
  const parsedPrimary = parseTonalFamilyId(primaryId);
  if (!parsedPrimary || parsedPrimary.sector === null) {
    throw new Error('The locked primary id must identify a chromatic Munsell family.');
  }
  if (
    normalizedRecipe.primary.variant !== 'auto' &&
    normalizedRecipe.primary.variant !== parsedPrimary.variant
  ) {
    throw new Error('The locked primary id must preserve the explicit primary variant.');
  }
  if (!isRestTone(rest.light) || !isRestTone(rest.dark)) {
    throw new Error('Locked rest positions must be public chromatic tones from 1 through 99.');
  }

  const source: LockedTonalSystemSourceV2 = {
    formatVersion: normalizedRecipe.formatVersion,
    gridContract: normalizedRecipe.gridContract,
    harmonyContract: normalizedRecipe.harmonyContract,
    tonalProfile: normalizedRecipe.tonalProfile,
    primary: {
      id: primaryId,
      seedHex: normalizedRecipe.primary.seedHex,
      policies: { ...normalizedRecipe.primary.policies }
    },
    tonalAnchors: {
      rest: {
        mode: 'locked',
        light: rest.light,
        dark: rest.dark
      }
    },
    overrides: normalizedRecipe.overrides.map((override) => ({
      ...override,
      policies: { ...override.policies }
    }))
  };

  const sourceValidation = validateLockedTonalSystemSource(source);
  if (!sourceValidation.valid) {
    throw new Error(
      `Cannot lock an invalid tonal-system source: ${sourceValidation.issues
        .map((issue) => `${issue.path || '/'} ${issue.code}`)
        .join(', ')}.`
    );
  }
  return sourceValidation.value;
}

function validateContract(
  input: unknown,
  stage: 'draft'
): TonalSystemValidationResult<TonalSystemRecipeV2>;
function validateContract(
  input: unknown,
  stage: 'locked'
): TonalSystemValidationResult<LockedTonalSystemSourceV2>;
function validateContract(
  input: unknown,
  stage: 'draft' | 'locked'
): TonalSystemValidationResult<TonalSystemRecipeV2 | LockedTonalSystemSourceV2> {
  const issues: TonalSystemValidationIssue[] = [];
  const issue = (code: string, path: string, message: string) => {
    issues.push({ code, path, message });
  };

  if (!isPlainObject(input)) {
    return {
      valid: false,
      value: null,
      issues: [{ code: 'INVALID_RECIPE', path: '', message: 'Recipe must be a plain object.' }]
    };
  }

  reportUnknownKeys(input, RECIPE_KEYS, '', issue);
  validateContractIdentifiers(input, issue);

  const tonalProfile =
    typeof input.tonalProfile === 'string' && isKiskadeeTonalProfile(input.tonalProfile)
      ? input.tonalProfile
      : null;
  if (!tonalProfile) issue('UNSUPPORTED_PROFILE', '/tonalProfile', 'Unsupported tonal profile.');

  const primary =
    stage === 'draft'
      ? validateDraftPrimary(input.primary, issue)
      : validateLockedPrimary(input.primary, issue);
  const rest = validateRest(input.tonalAnchors, stage, issue);
  const overrides = validateOverrides(input.overrides, issue);

  if (
    stage === 'locked' &&
    primary &&
    overrides?.some((override) => override.id === (primary as TonalPrimaryLockedV2).id)
  ) {
    issue(
      'PRIMARY_OVERRIDE_CONFLICT',
      '/overrides',
      'A locked primary cannot also be configured as a family override.'
    );
  }

  issues.sort((left, right) =>
    left.path === right.path
      ? compareStrings(left.code, right.code)
      : compareStrings(left.path, right.path)
  );
  if (issues.length > 0 || !tonalProfile || !primary || !rest || !overrides) {
    return { valid: false, value: null, issues };
  }

  const base = {
    formatVersion: TONAL_SYSTEM_FORMAT_VERSION,
    gridContract: TONAL_GRID_CONTRACT,
    harmonyContract: TONAL_HARMONY_CONTRACT,
    tonalProfile,
    overrides
  };

  if (stage === 'draft') {
    return {
      valid: true,
      value: { ...base, primary: primary as TonalPrimaryDraftV2, tonalAnchors: { rest } },
      issues: []
    };
  }

  return {
    valid: true,
    value: {
      ...base,
      primary: primary as TonalPrimaryLockedV2,
      tonalAnchors: { rest: rest as LockedRest }
    },
    issues: []
  };
}

function validateContractIdentifiers(
  input: Record<string, unknown>,
  issue: (code: string, path: string, message: string) => void
): void {
  if (input.formatVersion !== TONAL_SYSTEM_FORMAT_VERSION) {
    const legacy = input.formatVersion === 1 ? ' Version 1 is not migrated automatically.' : '';
    issue(
      'UNSUPPORTED_FORMAT',
      '/formatVersion',
      `Unsupported tonal-system format version.${legacy}`
    );
  }
  if (input.gridContract !== TONAL_GRID_CONTRACT) {
    issue('UNSUPPORTED_GRID', '/gridContract', 'Unsupported tonal grid contract.');
  }
  if (input.harmonyContract !== TONAL_HARMONY_CONTRACT) {
    issue('UNSUPPORTED_HARMONY', '/harmonyContract', 'Unsupported harmony contract.');
  }
}

function validateDraftPrimary(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): TonalPrimaryDraftV2 | null {
  const path = '/primary';
  if (!isPlainObject(input)) {
    issue('INVALID_PRIMARY', path, 'Primary must be a plain object.');
    return null;
  }

  reportUnknownKeys(input, PRIMARY_DRAFT_KEYS, path, issue);
  const seedHex = validateSeed(input.seedHex, `${path}/seedHex`, issue);
  const variant = TONAL_FAMILY_VARIANTS.includes(input.variant as TonalFamilyVariant)
    ? (input.variant as TonalFamilyVariant)
    : input.variant === 'auto'
      ? 'auto'
      : null;
  if (!variant) {
    issue(
      'INVALID_PRIMARY_VARIANT',
      `${path}/variant`,
      'Primary variant must be auto or a supported v1 through v4 variant.'
    );
  }
  const policies = validatePrimaryPolicies(input.policies, `${path}/policies`, issue);

  return seedHex && variant && policies ? { seedHex, variant, policies } : null;
}

function validateLockedPrimary(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): TonalPrimaryLockedV2 | null {
  const path = '/primary';
  if (!isPlainObject(input)) {
    issue('INVALID_PRIMARY', path, 'Primary must be a plain object.');
    return null;
  }

  reportUnknownKeys(input, PRIMARY_LOCKED_KEYS, path, issue);
  const id = validateFamilyId(input.id, `${path}/id`, issue);
  if (id && resolveTonalFamilyColorKind(id) === 'achromatic') {
    issue(
      'ACHROMATIC_PRIMARY_UNSUPPORTED',
      `${path}/id`,
      'Black families cannot be the chromatic harmony reference.'
    );
  }
  const seedHex = validateSeed(input.seedHex, `${path}/seedHex`, issue);
  const policies = validatePrimaryPolicies(input.policies, `${path}/policies`, issue);

  return id && seedHex && policies ? { id, seedHex, policies } : null;
}

function validatePrimaryPolicies(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalPrimaryDraftV2['policies'] | null {
  if (!isPlainObject(input)) {
    issue('INVALID_PRIMARY_POLICIES', path, 'Primary policies must be a plain object.');
    return null;
  }

  reportUnknownKeys(input, FAMILY_POLICY_KEYS, path, issue);
  const light = input.light === 'source-exact' ? 'source-exact' : null;
  if (!light) {
    issue(
      'UNSUPPORTED_PRIMARY_LIGHT_POLICY',
      `${path}/light`,
      'Primary Light must use source-exact policy.'
    );
  }
  const dark = input.dark === 'source-exact' || input.dark === 'adaptive' ? input.dark : null;
  if (!dark) {
    issue(
      'UNSUPPORTED_PRIMARY_DARK_POLICY',
      `${path}/dark`,
      'Primary Dark must use source-exact or adaptive policy.'
    );
  }

  return light && dark ? { light, dark } : null;
}

function validateOverrides(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): TonalFamilyOverrideV2[] | null {
  if (!Array.isArray(input)) {
    issue('INVALID_OVERRIDES', '/overrides', 'Overrides must be an array.');
    return null;
  }

  const overrides: TonalFamilyOverrideV2[] = [];
  const seen = new Set<TonalFamilyId>();
  input.forEach((rawOverride, index) => {
    const path = `/overrides/${index}`;
    if (!isPlainObject(rawOverride)) {
      issue('INVALID_OVERRIDE', path, 'Override must be a plain object.');
      return;
    }

    reportUnknownKeys(rawOverride, OVERRIDE_KEYS, path, issue);
    const id = validateFamilyId(rawOverride.id, `${path}/id`, issue);
    const seedHex = validateSeed(rawOverride.seedHex, `${path}/seedHex`, issue);
    const policies = validateOverridePolicies(rawOverride.policies, `${path}/policies`, issue);

    if (id && seen.has(id)) {
      issue('DUPLICATE_OVERRIDE_ID', `${path}/id`, `Duplicate override id: ${id}.`);
    }
    if (
      id &&
      policies &&
      resolveTonalFamilyColorKind(id) === 'achromatic' &&
      (policies.light === 'harmonized' || policies.dark === 'harmonized')
    ) {
      issue(
        'ACHROMATIC_HARMONIZATION_UNSUPPORTED',
        `${path}/policies`,
        'Black families may use source-exact or adaptive policies, not chromatic harmonization.'
      );
    }

    if (id) seen.add(id);
    if (id && seedHex && policies) overrides.push({ id, seedHex, policies });
  });

  return overrides.sort((left, right) => compareStrings(left.id, right.id));
}

function validateOverridePolicies(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalFamilyOverrideV2['policies'] | null {
  if (!isPlainObject(input)) {
    issue('INVALID_OVERRIDE_POLICIES', path, 'Override policies must be a plain object.');
    return null;
  }
  reportUnknownKeys(input, FAMILY_POLICY_KEYS, path, issue);
  const light = validateThemePolicy(input.light, `${path}/light`, issue);
  const dark = validateThemePolicy(input.dark, `${path}/dark`, issue);
  return light && dark ? { light, dark } : null;
}

function validateRest(
  input: unknown,
  stage: 'draft' | 'locked',
  issue: (code: string, path: string, message: string) => void
): AutoRest | LockedRest | null {
  if (!isPlainObject(input)) {
    issue('INVALID_TONAL_ANCHORS', '/tonalAnchors', 'Tonal anchors must be an object.');
    return null;
  }
  reportUnknownKeys(input, TONAL_ANCHOR_KEYS, '/tonalAnchors', issue);
  const rawRest = input.rest;
  if (!isPlainObject(rawRest)) {
    issue('INVALID_REST', '/tonalAnchors/rest', 'rest must be an object.');
    return null;
  }
  if (rawRest.mode === 'auto') {
    reportUnknownKeys(rawRest, AUTO_REST_KEYS, '/tonalAnchors/rest', issue);
    if (stage === 'locked') {
      issue(
        'AUTO_REST_NOT_EXPORTABLE',
        '/tonalAnchors/rest/mode',
        'Exported sources must lock Light and Dark rest positions.'
      );
      return null;
    }
    return { mode: 'auto' };
  }
  if (rawRest.mode !== 'locked') {
    issue('INVALID_REST_MODE', '/tonalAnchors/rest/mode', 'rest mode must be auto or locked.');
    return null;
  }

  reportUnknownKeys(rawRest, LOCKED_REST_KEYS, '/tonalAnchors/rest', issue);
  const light = validateRestTone(rawRest.light, '/tonalAnchors/rest/light', issue);
  const dark = validateRestTone(rawRest.dark, '/tonalAnchors/rest/dark', issue);
  return light !== null && dark !== null ? { mode: 'locked', light, dark } : null;
}

function validateThemePolicy(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalThemePolicy | null {
  if (value === 'source-exact' || value === 'adaptive' || value === 'harmonized') return value;
  issue(
    'UNSUPPORTED_THEME_POLICY',
    path,
    'Theme policy must be source-exact, adaptive, or harmonized.'
  );
  return null;
}

function validateFamilyId(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalFamilyId | null {
  if (typeof value === 'string' && parseTonalFamilyId(value)) return value as TonalFamilyId;
  issue('INVALID_FAMILY_ID', path, 'Family id is not supported by tonal-system format 2.');
  return null;
}

function validateSeed(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): string | null {
  const seedHex = typeof value === 'string' ? normalizeHexColor(value) : null;
  if (!seedHex) issue('INVALID_SEED', path, 'Seed must be a valid sRGB hex color.');
  return seedHex;
}

function validateRestTone(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): KiskadeeTone | null {
  if (!isRestTone(value)) {
    issue('INVALID_REST_TONE', path, 'rest must be a chromatic public tone from 1 through 99.');
    return null;
  }
  return value;
}

function isRestTone(value: unknown): value is KiskadeeTone {
  return (
    typeof value === 'number' &&
    KISKADEE_TONES.includes(value as KiskadeeTone) &&
    value > 0 &&
    value < 100
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function reportUnknownKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  basePath: string,
  issue: (code: string, path: string, message: string) => void
): void {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      issue(
        'UNKNOWN_PROPERTY',
        `${basePath}/${escapeJsonPointer(key)}`,
        `Unknown property: ${key}.`
      );
    }
  }
}

function escapeJsonPointer(value: string): string {
  return value.replaceAll('~', '~0').replaceAll('/', '~1');
}
