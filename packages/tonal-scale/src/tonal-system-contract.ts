import { normalizeHexColor } from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
import {
  isKiskadeeTonalProfile,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from './kiskadee-tonal-scale.ts';

export const TONAL_SYSTEM_FORMAT_VERSION = 5 as const;
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

export const MUNSELL_SECTOR_IDENTITIES = [
  { sector: 'red', code: 'r', notation: 'R', appearance: 'red', stem: 'r.red' },
  {
    sector: 'yellow-red',
    code: 'yr',
    notation: 'YR',
    appearance: 'orange',
    stem: 'yr.orange'
  },
  {
    sector: 'yellow-red',
    code: 'yr',
    notation: 'YR',
    appearance: 'brown',
    stem: 'yr.brown'
  },
  { sector: 'yellow', code: 'y', notation: 'Y', appearance: 'yellow', stem: 'y.yellow' },
  {
    sector: 'green-yellow',
    code: 'gy',
    notation: 'GY',
    appearance: 'lime',
    stem: 'gy.lime'
  },
  { sector: 'green', code: 'g', notation: 'G', appearance: 'green', stem: 'g.green' },
  {
    sector: 'blue-green',
    code: 'bg',
    notation: 'BG',
    appearance: 'teal',
    stem: 'bg.teal'
  },
  { sector: 'blue', code: 'b', notation: 'B', appearance: 'blue', stem: 'b.blue' },
  {
    sector: 'purple-blue',
    code: 'pb',
    notation: 'PB',
    appearance: 'indigo',
    stem: 'pb.indigo'
  },
  {
    sector: 'purple',
    code: 'p',
    notation: 'P',
    appearance: 'purple',
    stem: 'p.purple'
  },
  {
    sector: 'red-purple',
    code: 'rp',
    notation: 'RP',
    appearance: 'magenta',
    stem: 'rp.magenta'
  }
] as const;

export const TONAL_ACHROMATIC_IDENTITY = {
  sector: null,
  code: 'n',
  notation: 'N',
  appearance: 'black',
  stem: 'n.black'
} as const;

export const TONAL_FAMILY_IDENTITIES = [
  ...MUNSELL_SECTOR_IDENTITIES,
  TONAL_ACHROMATIC_IDENTITY
] as const;
export const TONAL_FAMILY_VARIANTS = ['v1', 'v2', 'v3', 'v4'] as const;

export type TonalFamilySector = (typeof MUNSELL_SECTORS)[number];
export type TonalFamilySectorCode = (typeof MUNSELL_SECTOR_IDENTITIES)[number]['code'];
export type TonalFamilySectorNotation = (typeof MUNSELL_SECTOR_IDENTITIES)[number]['notation'];
export type TonalChromaticAppearance = (typeof MUNSELL_SECTOR_IDENTITIES)[number]['appearance'];
export type TonalFamilyAppearance =
  | TonalChromaticAppearance
  | typeof TONAL_ACHROMATIC_IDENTITY.appearance;
export type TonalFamilyStem = (typeof TONAL_FAMILY_IDENTITIES)[number]['stem'];
export type TonalFamilyVariant = (typeof TONAL_FAMILY_VARIANTS)[number];
export type TonalPrimaryAppearance = 'auto' | TonalChromaticAppearance;
export type TonalFamilyId = `${TonalFamilyStem}.${TonalFamilyVariant}`;
export type TonalFamilyColorKind = 'chromatic' | 'achromatic';
export type TonalThemePolicy = 'source-exact' | 'adaptive' | 'harmonized';
export type PrimaryLightPolicy = 'source-exact';
export type PrimaryDarkPolicy = 'source-exact' | 'adaptive';

export const TONAL_CORE_FAMILY_IDS = [
  'r.red.v1',
  'yr.orange.v1',
  'yr.brown.v1',
  'y.yellow.v1',
  'gy.lime.v1',
  'g.green.v1',
  'bg.teal.v1',
  'b.blue.v1',
  'pb.indigo.v1',
  'p.purple.v1',
  'rp.magenta.v1',
  'n.black.v1'
] as const satisfies readonly TonalFamilyId[];

export type CoreTonalFamilyId = (typeof TONAL_CORE_FAMILY_IDS)[number];

export const TONAL_BASE_FAMILY_ID_BY_SECTOR = {
  red: 'r.red.v1',
  'yellow-red': 'yr.orange.v1',
  yellow: 'y.yellow.v1',
  'green-yellow': 'gy.lime.v1',
  green: 'g.green.v1',
  'blue-green': 'bg.teal.v1',
  blue: 'b.blue.v1',
  'purple-blue': 'pb.indigo.v1',
  purple: 'p.purple.v1',
  'red-purple': 'rp.magenta.v1'
} as const satisfies Record<TonalFamilySector, CoreTonalFamilyId>;

export const TONAL_BASE_FAMILY_IDS = MUNSELL_SECTORS.map(
  (sector) => TONAL_BASE_FAMILY_ID_BY_SECTOR[sector]
);

export type TonalPrimaryDraftV5 = {
  seedHex: string;
  appearance: TonalPrimaryAppearance;
  variant: TonalFamilyVariant;
  policies: {
    light: PrimaryLightPolicy;
    dark: PrimaryDarkPolicy;
  };
};

export type TonalPrimaryLockedV5 = {
  id: TonalFamilyId;
  seedHex: string;
  policies: TonalPrimaryDraftV5['policies'];
};

export type TonalFamilyOverrideV5 = {
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

export type TonalVividReferenceRule =
  | { mode: 'auto' }
  | { mode: 'generated-anchor' }
  | { mode: 'harmony-rest' }
  | { mode: 'locked'; tone: KiskadeeTone };

export type TonalSubtleReferenceRule =
  | { mode: 'auto' }
  | { mode: 'reference-match'; referenceHex: string }
  | { mode: 'locked'; tone: KiskadeeTone };

export type TonalFamilyFunctionalReferenceRulesV5 = {
  id: TonalFamilyId;
  light: {
    vivid: TonalVividReferenceRule;
    subtle: TonalSubtleReferenceRule;
  };
  dark: {
    vivid: TonalVividReferenceRule;
    subtle: TonalSubtleReferenceRule;
  };
};

export type LockedTonalFunctionalReferenceV5 =
  | {
      tone: KiskadeeTone;
      source:
        | 'generated-anchor'
        | 'harmony-rest'
        | 'contrast-mirror'
        | 'surface-relative'
        | 'locked';
    }
  | {
      tone: KiskadeeTone;
      source: 'reference-match';
      referenceHex: string;
    };

export type LockedTonalFamilyFunctionalReferencesV5 = {
  id: TonalFamilyId;
  light: {
    vivid: LockedTonalFunctionalReferenceV5;
    subtle: LockedTonalFunctionalReferenceV5;
  };
  dark: {
    vivid: LockedTonalFunctionalReferenceV5;
    subtle: LockedTonalFunctionalReferenceV5;
  };
};

type TonalSystemContractBase = {
  formatVersion: typeof TONAL_SYSTEM_FORMAT_VERSION;
  gridContract: typeof TONAL_GRID_CONTRACT;
  harmonyContract: typeof TONAL_HARMONY_CONTRACT;
  tonalProfile: KiskadeeTonalProfile;
  overrides: TonalFamilyOverrideV5[];
};

export type TonalSystemRecipeV5 = TonalSystemContractBase & {
  primary: TonalPrimaryDraftV5;
  tonalAnchors: {
    rest: AutoRest | LockedRest;
  };
  functionalReferences: TonalFamilyFunctionalReferenceRulesV5[];
};

export type LockedTonalSystemSourceV5 = TonalSystemContractBase & {
  primary: TonalPrimaryLockedV5;
  tonalAnchors: {
    rest: LockedRest;
  };
  functionalReferences: LockedTonalFamilyFunctionalReferencesV5[];
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
    appearance: 'auto',
    variant: 'v1',
    policies: { light: 'source-exact', dark: 'source-exact' }
  },
  tonalAnchors: {
    rest: {
      mode: 'auto'
    }
  },
  functionalReferences: [],
  overrides: []
} as const satisfies TonalSystemRecipeV5;

const RECIPE_KEYS = [
  'formatVersion',
  'gridContract',
  'harmonyContract',
  'tonalProfile',
  'primary',
  'tonalAnchors',
  'functionalReferences',
  'overrides'
] as const;
const PRIMARY_DRAFT_KEYS = ['seedHex', 'appearance', 'variant', 'policies'] as const;
const PRIMARY_LOCKED_KEYS = ['id', 'seedHex', 'policies'] as const;
const OVERRIDE_KEYS = ['id', 'seedHex', 'policies'] as const;
const FAMILY_POLICY_KEYS = ['light', 'dark'] as const;
const TONAL_ANCHOR_KEYS = ['rest'] as const;
const AUTO_REST_KEYS = ['mode'] as const;
const LOCKED_REST_KEYS = ['mode', 'light', 'dark'] as const;
const FUNCTIONAL_REFERENCE_KEYS = ['id', 'light', 'dark'] as const;
const FUNCTIONAL_REFERENCE_THEME_KEYS = ['vivid', 'subtle'] as const;
const REFERENCE_RULE_KEYS = ['mode'] as const;
const LOCKED_REFERENCE_RULE_KEYS = ['mode', 'tone'] as const;
const REFERENCE_MATCH_RULE_KEYS = ['mode', 'referenceHex'] as const;
const LOCKED_FUNCTIONAL_REFERENCE_KEYS = ['tone', 'source'] as const;
const LOCKED_REFERENCE_MATCH_KEYS = ['tone', 'source', 'referenceHex'] as const;

export type ParsedTonalFamilyId = {
  stem: TonalFamilyStem;
  appearance: TonalFamilyAppearance;
  sector: TonalFamilySector | null;
  sectorCode: TonalFamilySectorCode | typeof TONAL_ACHROMATIC_IDENTITY.code;
  munsellSector: TonalFamilySectorNotation | typeof TONAL_ACHROMATIC_IDENTITY.notation;
  colorKind: TonalFamilyColorKind;
  variant: TonalFamilyVariant;
};

export function createTonalFamilyId(
  stem: TonalFamilyStem,
  variant: TonalFamilyVariant
): TonalFamilyId {
  return `${stem}.${variant}`;
}

export function parseTonalFamilyId(value: string): ParsedTonalFamilyId | null {
  const [sectorCode, appearance, variant, extra] = value.split('.');

  if (extra !== undefined || !TONAL_FAMILY_VARIANTS.includes(variant as TonalFamilyVariant)) {
    return null;
  }

  const identity = TONAL_FAMILY_IDENTITIES.find(
    (candidate) => candidate.code === sectorCode && candidate.appearance === appearance
  );
  if (!identity) return null;

  return {
    stem: identity.stem,
    appearance: identity.appearance,
    sector: identity.sector,
    sectorCode: identity.code,
    munsellSector: identity.notation,
    colorKind: identity.sector === null ? 'achromatic' : 'chromatic',
    variant: variant as TonalFamilyVariant
  };
}

export function resolveTonalFamilyColorKind(id: TonalFamilyId): TonalFamilyColorKind {
  return parseTonalFamilyId(id)?.colorKind ?? 'chromatic';
}

export function resolveTonalFamilyStem(
  sector: TonalFamilySector,
  appearance: TonalChromaticAppearance
): TonalFamilyStem | null {
  return (
    MUNSELL_SECTOR_IDENTITIES.find(
      (candidate) => candidate.sector === sector && candidate.appearance === appearance
    )?.stem ?? null
  );
}

export function validateTonalSystemRecipe(
  input: unknown
): TonalSystemValidationResult<TonalSystemRecipeV5> {
  return validateContract(input, 'draft');
}

export function validateLockedTonalSystemSource(
  input: unknown
): TonalSystemValidationResult<LockedTonalSystemSourceV5> {
  return validateContract(input, 'locked');
}

export function lockTonalSystemRecipe(
  recipe: TonalSystemRecipeV5,
  primaryId: TonalFamilyId,
  rest: { light: KiskadeeTone; dark: KiskadeeTone },
  functionalReferences: readonly LockedTonalFamilyFunctionalReferencesV5[]
): LockedTonalSystemSourceV5 {
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
  if (normalizedRecipe.primary.variant !== parsedPrimary.variant) {
    throw new Error('The locked primary id must preserve the explicit primary variant.');
  }
  if (
    normalizedRecipe.primary.appearance !== 'auto' &&
    normalizedRecipe.primary.appearance !== parsedPrimary.appearance
  ) {
    throw new Error('The locked primary id must preserve the explicit primary appearance.');
  }
  if (!isRestTone(rest.light) || !isRestTone(rest.dark)) {
    throw new Error('Locked rest positions must be public chromatic tones from 1 through 99.');
  }

  const source: LockedTonalSystemSourceV5 = {
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
    functionalReferences: functionalReferences.map((family) => ({
      id: family.id,
      light: {
        vivid: cloneLockedFunctionalReference(family.light.vivid),
        subtle: cloneLockedFunctionalReference(family.light.subtle)
      },
      dark: {
        vivid: cloneLockedFunctionalReference(family.dark.vivid),
        subtle: cloneLockedFunctionalReference(family.dark.subtle)
      }
    })),
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
): TonalSystemValidationResult<TonalSystemRecipeV5>;
function validateContract(
  input: unknown,
  stage: 'locked'
): TonalSystemValidationResult<LockedTonalSystemSourceV5>;
function validateContract(
  input: unknown,
  stage: 'draft' | 'locked'
): TonalSystemValidationResult<TonalSystemRecipeV5 | LockedTonalSystemSourceV5> {
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
  const functionalReferences =
    stage === 'draft'
      ? validateDraftFunctionalReferences(input.functionalReferences, issue)
      : validateLockedFunctionalReferences(input.functionalReferences, issue);

  if (
    stage === 'locked' &&
    primary &&
    overrides?.some((override) => override.id === (primary as TonalPrimaryLockedV5).id)
  ) {
    issue(
      'PRIMARY_OVERRIDE_CONFLICT',
      '/overrides',
      'A locked primary cannot also be configured as a family override.'
    );
  }

  if (stage === 'locked' && primary && overrides && functionalReferences) {
    validateLockedFunctionalReferenceCompleteness(
      primary as TonalPrimaryLockedV5,
      overrides,
      functionalReferences as LockedTonalFamilyFunctionalReferencesV5[],
      issue
    );
  }

  issues.sort((left, right) =>
    left.path === right.path
      ? compareStrings(left.code, right.code)
      : compareStrings(left.path, right.path)
  );
  if (
    issues.length > 0 ||
    !tonalProfile ||
    !primary ||
    !rest ||
    !overrides ||
    !functionalReferences
  ) {
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
      value: {
        ...base,
        primary: primary as TonalPrimaryDraftV5,
        tonalAnchors: { rest },
        functionalReferences: functionalReferences as TonalFamilyFunctionalReferenceRulesV5[]
      },
      issues: []
    };
  }

  return {
    valid: true,
    value: {
      ...base,
      primary: primary as TonalPrimaryLockedV5,
      tonalAnchors: { rest: rest as LockedRest },
      functionalReferences: functionalReferences as LockedTonalFamilyFunctionalReferencesV5[]
    },
    issues: []
  };
}

function validateContractIdentifiers(
  input: Record<string, unknown>,
  issue: (code: string, path: string, message: string) => void
): void {
  if (input.formatVersion !== TONAL_SYSTEM_FORMAT_VERSION) {
    const legacy =
      input.formatVersion === 1 || input.formatVersion === 2 || input.formatVersion === 3
        ? ` Version ${input.formatVersion} is not migrated automatically.`
        : '';
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
): TonalPrimaryDraftV5 | null {
  const path = '/primary';
  if (!isPlainObject(input)) {
    issue('INVALID_PRIMARY', path, 'Primary must be a plain object.');
    return null;
  }

  reportUnknownKeys(input, PRIMARY_DRAFT_KEYS, path, issue);
  const seedHex = validateSeed(input.seedHex, `${path}/seedHex`, issue);
  const appearance =
    input.appearance === 'auto' ||
    MUNSELL_SECTOR_IDENTITIES.some((identity) => identity.appearance === input.appearance)
      ? (input.appearance as TonalPrimaryAppearance)
      : null;
  if (!appearance) {
    issue(
      'INVALID_PRIMARY_APPEARANCE',
      `${path}/appearance`,
      'Primary appearance must be auto or a supported chromatic appearance.'
    );
  }
  const variant = TONAL_FAMILY_VARIANTS.includes(input.variant as TonalFamilyVariant)
    ? (input.variant as TonalFamilyVariant)
    : null;
  if (!variant) {
    issue(
      'INVALID_PRIMARY_VARIANT',
      `${path}/variant`,
      'Primary variant must be a supported v1 through v4 variant.'
    );
  }
  const policies = validatePrimaryPolicies(input.policies, `${path}/policies`, issue);

  return seedHex && appearance && variant && policies
    ? { seedHex, appearance, variant, policies }
    : null;
}

function validateLockedPrimary(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): TonalPrimaryLockedV5 | null {
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
): TonalPrimaryDraftV5['policies'] | null {
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
): TonalFamilyOverrideV5[] | null {
  if (!Array.isArray(input)) {
    issue('INVALID_OVERRIDES', '/overrides', 'Overrides must be an array.');
    return null;
  }

  const overrides: TonalFamilyOverrideV5[] = [];
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
    if (id === 'n.black.v1') {
      issue(
        'CANONICAL_BLACK_OVERRIDE_UNSUPPORTED',
        `${path}/id`,
        'n.black.v1 is the immutable pure-grayscale family. Use n.black.v2 through n.black.v4 for authored tinted neutrals.'
      );
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
): TonalFamilyOverrideV5['policies'] | null {
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

function validateDraftFunctionalReferences(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): TonalFamilyFunctionalReferenceRulesV5[] | null {
  const collectionPath = '/functionalReferences';
  if (!Array.isArray(input)) {
    issue(
      'INVALID_FUNCTIONAL_REFERENCES',
      collectionPath,
      'Functional references must be an array.'
    );
    return null;
  }

  const references: TonalFamilyFunctionalReferenceRulesV5[] = [];
  const seen = new Set<TonalFamilyId>();
  input.forEach((rawFamily, index) => {
    const path = `${collectionPath}/${index}`;
    if (!isPlainObject(rawFamily)) {
      issue(
        'INVALID_FUNCTIONAL_REFERENCE_FAMILY',
        path,
        'Family functional references must be a plain object.'
      );
      return;
    }

    reportUnknownKeys(rawFamily, FUNCTIONAL_REFERENCE_KEYS, path, issue);
    const id = validateFamilyId(rawFamily.id, `${path}/id`, issue);
    const light = validateDraftFunctionalReferenceTheme(rawFamily.light, `${path}/light`, issue);
    const dark = validateDraftFunctionalReferenceTheme(rawFamily.dark, `${path}/dark`, issue);

    if (id && seen.has(id)) {
      issue(
        'DUPLICATE_FUNCTIONAL_REFERENCE_ID',
        `${path}/id`,
        `Duplicate functional reference id: ${id}.`
      );
    }
    if (id) seen.add(id);
    if (!id || !light || !dark) return;
    if (
      light.vivid.mode === 'auto' &&
      light.subtle.mode === 'auto' &&
      dark.vivid.mode === 'auto' &&
      dark.subtle.mode === 'auto'
    ) {
      return;
    }
    references.push({ id, light, dark });
  });

  return references.sort((left, right) => compareStrings(left.id, right.id));
}

function validateDraftFunctionalReferenceTheme(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalFamilyFunctionalReferenceRulesV5['light'] | null {
  if (!isPlainObject(input)) {
    issue(
      'INVALID_FUNCTIONAL_REFERENCE_THEME',
      path,
      'Theme functional references must be a plain object.'
    );
    return null;
  }
  reportUnknownKeys(input, FUNCTIONAL_REFERENCE_THEME_KEYS, path, issue);
  const vivid = validateVividReferenceRule(input.vivid, `${path}/vivid`, issue);
  const subtle = validateSubtleReferenceRule(input.subtle, `${path}/subtle`, issue);
  if (vivid?.mode === 'locked' && subtle?.mode === 'locked') {
    const subtleIndex = KISKADEE_TONES.indexOf(subtle.tone);
    const vividIndex = KISKADEE_TONES.indexOf(vivid.tone);
    if (subtleIndex >= vividIndex) {
      issue(
        'INVALID_FUNCTIONAL_REFERENCE_ORDER',
        `${path}/subtle/tone`,
        'A manually locked subtle reference must be closer to the theme surface than the vivid reference.'
      );
    }
  }
  return vivid && subtle ? { vivid, subtle } : null;
}

function validateVividReferenceRule(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalVividReferenceRule | null {
  if (!isPlainObject(input)) {
    issue('INVALID_VIVID_REFERENCE_RULE', path, 'Vivid reference rule must be a plain object.');
    return null;
  }

  if (input.mode === 'locked') {
    reportUnknownKeys(input, LOCKED_REFERENCE_RULE_KEYS, path, issue);
    const tone = validateFunctionalReferenceTone(input.tone, `${path}/tone`, issue);
    return tone === null ? null : { mode: 'locked', tone };
  }

  reportUnknownKeys(input, REFERENCE_RULE_KEYS, path, issue);
  if (input.mode === 'auto' || input.mode === 'generated-anchor' || input.mode === 'harmony-rest') {
    return { mode: input.mode };
  }

  issue(
    'INVALID_VIVID_REFERENCE_MODE',
    `${path}/mode`,
    'Vivid reference mode must be auto, generated-anchor, harmony-rest, or locked.'
  );
  return null;
}

function validateSubtleReferenceRule(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): TonalSubtleReferenceRule | null {
  if (!isPlainObject(input)) {
    issue('INVALID_SUBTLE_REFERENCE_RULE', path, 'Subtle reference rule must be a plain object.');
    return null;
  }

  if (input.mode === 'locked') {
    reportUnknownKeys(input, LOCKED_REFERENCE_RULE_KEYS, path, issue);
    const tone = validateFunctionalReferenceTone(input.tone, `${path}/tone`, issue);
    return tone === null ? null : { mode: 'locked', tone };
  }
  if (input.mode === 'reference-match') {
    reportUnknownKeys(input, REFERENCE_MATCH_RULE_KEYS, path, issue);
    const referenceHex = validateReferenceHex(input.referenceHex, `${path}/referenceHex`, issue);
    return referenceHex ? { mode: 'reference-match', referenceHex } : null;
  }

  reportUnknownKeys(input, REFERENCE_RULE_KEYS, path, issue);
  if (input.mode === 'auto') return { mode: 'auto' };

  issue(
    'INVALID_SUBTLE_REFERENCE_MODE',
    `${path}/mode`,
    'Subtle reference mode must be auto, reference-match, or locked.'
  );
  return null;
}

function validateLockedFunctionalReferences(
  input: unknown,
  issue: (code: string, path: string, message: string) => void
): LockedTonalFamilyFunctionalReferencesV5[] | null {
  const collectionPath = '/functionalReferences';
  if (!Array.isArray(input)) {
    issue(
      'INVALID_LOCKED_FUNCTIONAL_REFERENCES',
      collectionPath,
      'Locked functional references must be an array.'
    );
    return null;
  }

  const references: LockedTonalFamilyFunctionalReferencesV5[] = [];
  const seen = new Set<TonalFamilyId>();
  input.forEach((rawFamily, index) => {
    const path = `${collectionPath}/${index}`;
    if (!isPlainObject(rawFamily)) {
      issue(
        'INVALID_LOCKED_FUNCTIONAL_REFERENCE_FAMILY',
        path,
        'Locked family functional references must be a plain object.'
      );
      return;
    }

    reportUnknownKeys(rawFamily, FUNCTIONAL_REFERENCE_KEYS, path, issue);
    const id = validateFamilyId(rawFamily.id, `${path}/id`, issue);
    const light = validateLockedFunctionalReferenceTheme(rawFamily.light, `${path}/light`, issue);
    const dark = validateLockedFunctionalReferenceTheme(rawFamily.dark, `${path}/dark`, issue);

    if (id && seen.has(id)) {
      issue(
        'DUPLICATE_FUNCTIONAL_REFERENCE_ID',
        `${path}/id`,
        `Duplicate functional reference id: ${id}.`
      );
    }
    if (id) seen.add(id);
    if (!id || !light || !dark) return;

    if (light.vivid.source === 'contrast-mirror') {
      issue(
        'INVALID_CONTRAST_MIRROR_REFERENCE',
        `${path}/light/vivid/source`,
        'Contrast-mirror is available only for an achromatic Dark vivid reference.'
      );
    }
    if (
      dark.vivid.source === 'contrast-mirror' &&
      resolveTonalFamilyColorKind(id) !== 'achromatic'
    ) {
      issue(
        'INVALID_CONTRAST_MIRROR_REFERENCE',
        `${path}/dark/vivid/source`,
        'Contrast-mirror is available only for an achromatic Dark vivid reference.'
      );
    }
    validateFunctionalReferenceOrder(light, `${path}/light`, issue);
    validateFunctionalReferenceOrder(dark, `${path}/dark`, issue);
    references.push({ id, light, dark });
  });

  return references.sort((left, right) => compareStrings(left.id, right.id));
}

function validateLockedFunctionalReferenceTheme(
  input: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): LockedTonalFamilyFunctionalReferencesV5['light'] | null {
  if (!isPlainObject(input)) {
    issue(
      'INVALID_LOCKED_FUNCTIONAL_REFERENCE_THEME',
      path,
      'Locked theme functional references must be a plain object.'
    );
    return null;
  }
  reportUnknownKeys(input, FUNCTIONAL_REFERENCE_THEME_KEYS, path, issue);
  const vivid = validateLockedFunctionalReference(input.vivid, `${path}/vivid`, 'vivid', issue);
  const subtle = validateLockedFunctionalReference(input.subtle, `${path}/subtle`, 'subtle', issue);
  return vivid && subtle ? { vivid, subtle } : null;
}

function validateLockedFunctionalReference(
  input: unknown,
  path: string,
  kind: 'vivid' | 'subtle',
  issue: (code: string, path: string, message: string) => void
): LockedTonalFunctionalReferenceV5 | null {
  if (!isPlainObject(input)) {
    issue(
      'INVALID_LOCKED_FUNCTIONAL_REFERENCE',
      path,
      'Locked functional reference must be a plain object.'
    );
    return null;
  }

  const source = input.source;
  const allowedSources =
    kind === 'vivid'
      ? ['generated-anchor', 'harmony-rest', 'contrast-mirror', 'locked']
      : ['surface-relative', 'reference-match', 'locked'];
  if (typeof source !== 'string' || !allowedSources.includes(source)) {
    issue(
      'INVALID_LOCKED_FUNCTIONAL_REFERENCE_SOURCE',
      `${path}/source`,
      `Locked ${kind} reference has an unsupported source.`
    );
  }

  const isReferenceMatch = source === 'reference-match';
  reportUnknownKeys(
    input,
    isReferenceMatch ? LOCKED_REFERENCE_MATCH_KEYS : LOCKED_FUNCTIONAL_REFERENCE_KEYS,
    path,
    issue
  );
  const tone = validateFunctionalReferenceTone(input.tone, `${path}/tone`, issue);
  const referenceHex = isReferenceMatch
    ? validateReferenceHex(input.referenceHex, `${path}/referenceHex`, issue)
    : null;

  if (tone === null || typeof source !== 'string' || !allowedSources.includes(source)) return null;
  if (source === 'reference-match') {
    return referenceHex ? { tone, source, referenceHex } : null;
  }
  return {
    tone,
    source: source as Exclude<LockedTonalFunctionalReferenceV5['source'], 'reference-match'>
  };
}

function validateFunctionalReferenceOrder(
  references: LockedTonalFamilyFunctionalReferencesV5['light'],
  path: string,
  issue: (code: string, path: string, message: string) => void
): void {
  const subtleIndex = KISKADEE_TONES.indexOf(references.subtle.tone);
  const vividIndex = KISKADEE_TONES.indexOf(references.vivid.tone);
  const isSurfaceEdgeFallback =
    references.subtle.tone === 1 &&
    references.vivid.tone === 1 &&
    references.subtle.source !== 'locked';
  if (subtleIndex >= vividIndex && !isSurfaceEdgeFallback) {
    issue(
      'INVALID_FUNCTIONAL_REFERENCE_ORDER',
      `${path}/subtle/tone`,
      'Subtle reference must be closer to the theme surface than the vivid reference; equality is reserved for the tone-1 surface-edge fallback.'
    );
  }
}

function validateLockedFunctionalReferenceCompleteness(
  primary: TonalPrimaryLockedV5,
  overrides: TonalFamilyOverrideV5[],
  references: LockedTonalFamilyFunctionalReferencesV5[],
  issue: (code: string, path: string, message: string) => void
): void {
  const expectedIds = new Set<TonalFamilyId>(TONAL_CORE_FAMILY_IDS);
  expectedIds.add(primary.id);
  for (const override of overrides) expectedIds.add(override.id);
  const actualIds = new Set(references.map((reference) => reference.id));

  for (const id of [...expectedIds].sort(compareStrings)) {
    if (!actualIds.has(id)) {
      issue(
        'MISSING_LOCKED_FUNCTIONAL_REFERENCE',
        '/functionalReferences',
        `Locked source is missing functional references for ${id}.`
      );
    }
  }
  references.forEach((reference, index) => {
    if (!expectedIds.has(reference.id)) {
      issue(
        'UNKNOWN_LOCKED_FUNCTIONAL_REFERENCE_FAMILY',
        `/functionalReferences/${index}/id`,
        `${reference.id} is not part of the locked tonal system.`
      );
    }
    if (
      reference.id !== primary.id &&
      (reference.light.subtle.source === 'reference-match' ||
        reference.dark.subtle.source === 'reference-match')
    ) {
      issue(
        'SUPPORT_REFERENCE_MATCH_UNSUPPORTED',
        `/functionalReferences/${index}`,
        'Only the Primary may retain a HEX target for its subtle reference.'
      );
    }
  });
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
  issue('INVALID_FAMILY_ID', path, 'Family id is not supported by tonal-system format 4.');
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

function validateFunctionalReferenceTone(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): KiskadeeTone | null {
  if (!isRestTone(value)) {
    issue(
      'INVALID_FUNCTIONAL_REFERENCE_TONE',
      path,
      'Functional reference must be a non-cap public tone from 1 through 99.'
    );
    return null;
  }
  return value;
}

function validateReferenceHex(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): string | null {
  const referenceHex = typeof value === 'string' ? normalizeHexColor(value) : null;
  if (!referenceHex) {
    issue(
      'INVALID_FUNCTIONAL_REFERENCE_HEX',
      path,
      'Functional reference target must be a valid opaque sRGB hex color.'
    );
  }
  return referenceHex;
}

function cloneLockedFunctionalReference(
  reference: LockedTonalFunctionalReferenceV5
): LockedTonalFunctionalReferenceV5 {
  return reference.source === 'reference-match'
    ? {
        tone: reference.tone,
        source: reference.source,
        referenceHex: reference.referenceHex
      }
    : { tone: reference.tone, source: reference.source };
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
