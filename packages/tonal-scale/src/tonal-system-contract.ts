import { normalizeHexColor } from './color-math.ts';
import { compareStrings } from './deterministic-order.ts';
import {
  isKiskadeeTonalProfile,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from './kiskadee-tonal-scale.ts';

export const TONAL_SYSTEM_FORMAT_VERSION = 1 as const;
export const TONAL_GRID_CONTRACT = 'kiskadee-tonal-v1' as const;
export const TONAL_HARMONY_CONTRACT = 'kiskadee-rest-v1' as const;

export const TONAL_FAMILY_HUES = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'brown',
  'black'
] as const;

export const TONAL_FAMILY_VARIANTS = ['v1', 'v2', 'v3', 'v4'] as const;

export type TonalFamilyHue = (typeof TONAL_FAMILY_HUES)[number];
export type TonalFamilyVariant = (typeof TONAL_FAMILY_VARIANTS)[number];
export type TonalFamilyId = `${TonalFamilyHue}.${TonalFamilyVariant}`;
export type TonalFamilyKind = 'chromatic' | 'neutral';
export type TonalThemePolicy = 'source-exact' | 'adaptive' | 'harmonized';
export type PrimaryLightPolicy = 'source-exact';
export type PrimaryDarkPolicy = 'source-exact' | 'adaptive';

export type TonalFamilySourceV1 = {
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

export type TonalSystemRecipeV1 = {
  formatVersion: typeof TONAL_SYSTEM_FORMAT_VERSION;
  gridContract: typeof TONAL_GRID_CONTRACT;
  harmonyContract: typeof TONAL_HARMONY_CONTRACT;
  tonalProfile: KiskadeeTonalProfile;
  primaryReference: TonalFamilyId;
  tonalAnchors: {
    rest: AutoRest | LockedRest;
  };
  families: TonalFamilySourceV1[];
};

export type LockedTonalSystemSourceV1 = Omit<TonalSystemRecipeV1, 'tonalAnchors'> & {
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
  primaryReference: 'blue.v1',
  tonalAnchors: {
    rest: {
      mode: 'auto'
    }
  },
  families: [
    {
      id: 'blue.v1',
      seedHex: '#0f6cbd',
      policies: { light: 'source-exact', dark: 'source-exact' }
    },
    {
      id: 'green.v1',
      seedHex: '#107c10',
      policies: { light: 'harmonized', dark: 'harmonized' }
    },
    {
      id: 'yellow.v1',
      seedHex: '#ffb900',
      policies: { light: 'harmonized', dark: 'harmonized' }
    },
    {
      id: 'red.v1',
      seedHex: '#d13438',
      policies: { light: 'harmonized', dark: 'harmonized' }
    },
    {
      id: 'purple.v1',
      seedHex: '#8764b8',
      policies: { light: 'harmonized', dark: 'harmonized' }
    },
    {
      id: 'pink.v1',
      seedHex: '#e3008c',
      policies: { light: 'harmonized', dark: 'harmonized' }
    },
    {
      id: 'black.v1',
      seedHex: '#20252b',
      policies: { light: 'source-exact', dark: 'source-exact' }
    }
  ]
} as const satisfies TonalSystemRecipeV1;

const RECIPE_KEYS = [
  'formatVersion',
  'gridContract',
  'harmonyContract',
  'tonalProfile',
  'primaryReference',
  'tonalAnchors',
  'families'
] as const;
const FAMILY_KEYS = ['id', 'seedHex', 'policies'] as const;
const FAMILY_POLICY_KEYS = ['light', 'dark'] as const;
const TONAL_ANCHOR_KEYS = ['rest'] as const;
const AUTO_REST_KEYS = ['mode'] as const;
const LOCKED_REST_KEYS = ['mode', 'light', 'dark'] as const;

export function createTonalFamilyId(
  hue: TonalFamilyHue,
  variant: TonalFamilyVariant
): TonalFamilyId {
  return `${hue}.${variant}`;
}

export function parseTonalFamilyId(
  value: string
): { hue: TonalFamilyHue; variant: TonalFamilyVariant } | null {
  const [hue, variant, extra] = value.split('.');

  if (
    extra !== undefined ||
    !TONAL_FAMILY_HUES.includes(hue as TonalFamilyHue) ||
    !TONAL_FAMILY_VARIANTS.includes(variant as TonalFamilyVariant)
  ) {
    return null;
  }

  return { hue: hue as TonalFamilyHue, variant: variant as TonalFamilyVariant };
}

export function resolveTonalFamilyKind(id: TonalFamilyId): TonalFamilyKind {
  return id.startsWith('black.') ? 'neutral' : 'chromatic';
}

export function validateTonalSystemRecipe(
  input: unknown,
  options: { allowAutoRest?: boolean } = {}
): TonalSystemValidationResult<TonalSystemRecipeV1> {
  const allowAutoRest = options.allowAutoRest ?? true;
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

  if (input.formatVersion !== TONAL_SYSTEM_FORMAT_VERSION) {
    issue('UNSUPPORTED_FORMAT', '/formatVersion', 'Unsupported tonal-system format version.');
  }
  if (input.gridContract !== TONAL_GRID_CONTRACT) {
    issue('UNSUPPORTED_GRID', '/gridContract', 'Unsupported tonal grid contract.');
  }
  if (input.harmonyContract !== TONAL_HARMONY_CONTRACT) {
    issue('UNSUPPORTED_HARMONY', '/harmonyContract', 'Unsupported harmony contract.');
  }
  if (typeof input.tonalProfile !== 'string' || !isKiskadeeTonalProfile(input.tonalProfile)) {
    issue('UNSUPPORTED_PROFILE', '/tonalProfile', 'Unsupported tonal profile.');
  }
  if (typeof input.primaryReference !== 'string' || !parseTonalFamilyId(input.primaryReference)) {
    issue(
      'INVALID_PRIMARY_REFERENCE',
      '/primaryReference',
      'Primary reference must be a valid family id.'
    );
  }
  let rest: AutoRest | LockedRest | null = null;
  if (!isPlainObject(input.tonalAnchors)) {
    issue('INVALID_TONAL_ANCHORS', '/tonalAnchors', 'Tonal anchors must be an object.');
  } else {
    reportUnknownKeys(input.tonalAnchors, TONAL_ANCHOR_KEYS, '/tonalAnchors', issue);
    const rawRest = input.tonalAnchors.rest;

    if (!isPlainObject(rawRest)) {
      issue('INVALID_REST', '/tonalAnchors/rest', 'rest must be an object.');
    } else if (rawRest.mode === 'auto') {
      reportUnknownKeys(rawRest, AUTO_REST_KEYS, '/tonalAnchors/rest', issue);
      if (!allowAutoRest) {
        issue(
          'AUTO_REST_NOT_EXPORTABLE',
          '/tonalAnchors/rest/mode',
          'Exported recipes must lock Light and Dark rest positions.'
        );
      }
      rest = { mode: 'auto' };
    } else if (rawRest.mode === 'locked') {
      reportUnknownKeys(rawRest, LOCKED_REST_KEYS, '/tonalAnchors/rest', issue);
      const light = validateRestTone(rawRest.light, '/tonalAnchors/rest/light', issue);
      const dark = validateRestTone(rawRest.dark, '/tonalAnchors/rest/dark', issue);
      if (light !== null && dark !== null) rest = { mode: 'locked', light, dark };
    } else {
      issue('INVALID_REST_MODE', '/tonalAnchors/rest/mode', 'rest mode must be auto or locked.');
    }
  }

  const normalizedFamilies: TonalFamilySourceV1[] = [];
  if (!Array.isArray(input.families) || input.families.length === 0) {
    issue('EMPTY_FAMILIES', '/families', 'At least one primitive family is required.');
  } else {
    const seen = new Set<string>();

    input.families.forEach((rawFamily, index) => {
      const path = `/families/${index}`;
      if (!isPlainObject(rawFamily)) {
        issue('INVALID_FAMILY', path, 'Family must be a plain object.');
        return;
      }

      reportUnknownKeys(rawFamily, FAMILY_KEYS, path, issue);
      const id =
        typeof rawFamily.id === 'string' && parseTonalFamilyId(rawFamily.id)
          ? (rawFamily.id as TonalFamilyId)
          : null;
      const seedHex =
        typeof rawFamily.seedHex === 'string' ? normalizeHexColor(rawFamily.seedHex) : null;
      let policies: TonalFamilySourceV1['policies'] | null = null;

      if (!isPlainObject(rawFamily.policies)) {
        issue('INVALID_FAMILY_POLICIES', `${path}/policies`, 'Family policies must be an object.');
      } else {
        reportUnknownKeys(rawFamily.policies, FAMILY_POLICY_KEYS, `${path}/policies`, issue);
        const light = validateThemePolicy(
          rawFamily.policies.light,
          `${path}/policies/light`,
          issue
        );
        const dark = validateThemePolicy(rawFamily.policies.dark, `${path}/policies/dark`, issue);
        if (light && dark) policies = { light, dark };
      }

      if (!id) issue('INVALID_FAMILY_ID', `${path}/id`, 'Family id is not supported by v1.');
      if (!seedHex)
        issue('INVALID_SEED', `${path}/seedHex`, 'Seed must be a valid sRGB hex color.');
      if (id && seen.has(id))
        issue('DUPLICATE_FAMILY_ID', `${path}/id`, `Duplicate family id: ${id}.`);
      if (
        id &&
        policies &&
        resolveTonalFamilyKind(id) === 'neutral' &&
        (policies.light === 'harmonized' || policies.dark === 'harmonized')
      ) {
        issue(
          'NEUTRAL_HARMONIZATION_UNSUPPORTED',
          `${path}/policies`,
          'Black families may use source-exact or adaptive policies, not chromatic harmonization.'
        );
      }

      if (id) seen.add(id);
      if (id && seedHex && policies) normalizedFamilies.push({ id, seedHex, policies });
    });
  }

  const primaryReference =
    typeof input.primaryReference === 'string' && parseTonalFamilyId(input.primaryReference)
      ? (input.primaryReference as TonalFamilyId)
      : null;
  if (primaryReference && !normalizedFamilies.some((family) => family.id === primaryReference)) {
    issue(
      'PRIMARY_NOT_FOUND',
      '/primaryReference',
      'Primary reference must identify exactly one configured family.'
    );
  }
  const primaryFamily = primaryReference
    ? normalizedFamilies.find((family) => family.id === primaryReference)
    : undefined;
  if (primaryReference && resolveTonalFamilyKind(primaryReference) === 'neutral') {
    issue(
      'NEUTRAL_PRIMARY_UNSUPPORTED',
      '/primaryReference',
      'Black families cannot be the chromatic harmony reference.'
    );
  }
  if (primaryFamily && primaryFamily.policies.light !== 'source-exact') {
    issue(
      'UNSUPPORTED_PRIMARY_LIGHT_POLICY',
      familyPropertyPath(normalizedFamilies, primaryFamily.id, 'policies/light'),
      'Primary Light must use source-exact policy.'
    );
  }
  if (
    primaryFamily &&
    primaryFamily.policies.dark !== 'source-exact' &&
    primaryFamily.policies.dark !== 'adaptive'
  ) {
    issue(
      'UNSUPPORTED_PRIMARY_DARK_POLICY',
      familyPropertyPath(normalizedFamilies, primaryFamily.id, 'policies/dark'),
      'Primary Dark must use source-exact or adaptive policy.'
    );
  }

  issues.sort((left, right) =>
    left.path === right.path
      ? compareStrings(left.code, right.code)
      : compareStrings(left.path, right.path)
  );
  if (issues.length > 0 || !rest || !primaryReference) {
    return { valid: false, value: null, issues };
  }

  return {
    valid: true,
    value: {
      formatVersion: TONAL_SYSTEM_FORMAT_VERSION,
      gridContract: TONAL_GRID_CONTRACT,
      harmonyContract: TONAL_HARMONY_CONTRACT,
      tonalProfile: input.tonalProfile as KiskadeeTonalProfile,
      primaryReference,
      tonalAnchors: { rest },
      families: normalizedFamilies.sort((left, right) => compareStrings(left.id, right.id))
    },
    issues: []
  };
}

export function lockTonalSystemRecipe(
  recipe: TonalSystemRecipeV1,
  rest: { light: KiskadeeTone; dark: KiskadeeTone }
): LockedTonalSystemSourceV1 {
  return {
    ...recipe,
    tonalAnchors: {
      rest: {
        mode: 'locked',
        light: rest.light,
        dark: rest.dark
      }
    }
  };
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

function familyPropertyPath(
  families: TonalFamilySourceV1[],
  familyId: TonalFamilyId,
  property: string
): string {
  return `/families/${Math.max(
    0,
    families.findIndex((family) => family.id === familyId)
  )}/${property}`;
}

function validateRestTone(
  value: unknown,
  path: string,
  issue: (code: string, path: string, message: string) => void
): KiskadeeTone | null {
  if (
    typeof value !== 'number' ||
    !KISKADEE_TONES.includes(value as KiskadeeTone) ||
    value <= 0 ||
    value >= 100
  ) {
    issue('INVALID_REST_TONE', path, 'rest must be a chromatic public tone from 1 through 99.');
    return null;
  }

  return value as KiskadeeTone;
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
