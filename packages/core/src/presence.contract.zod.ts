import {
  type DropdownPresenceProfile,
  dropdownPresenceProfiles
} from './types/effects/presence/presence.types.ts';

const PRESENCE_KEYS = ['profiles'] as const;
const DROPDOWN_PRESENCE_KEYS = ['profile'] as const;
const FADE_TRANSLATE_KEYS = [
  'distancePx',
  'enterDurationMs',
  'exitDurationMs',
  'enterEasing',
  'exitEasing'
] as const;
const GROW_HEIGHT_KEYS = [
  'enterDurationMs',
  'exitDurationMs',
  'enterEasing',
  'exitEasing'
] as const;
const PRESENCE_EASINGS = ['ease-in', 'ease-out'] as const;

type SchemaPresenceContractInput = {
  global?: {
    effects?: {
      presence?: unknown;
    };
  };
  components?: {
    dropdown?: {
      effects?: {
        presence?: unknown;
      };
    };
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAllowedKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      issues.push(`${path}.${key}: unrecognized key`);
    }
  }
}

function validateDuration(value: unknown, path: string, issues: string[]): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    issues.push(`${path}: expected finite number greater than or equal to 0`);
  }
}

function validateEasing(value: unknown, path: string, issues: string[]): void {
  if (!PRESENCE_EASINGS.includes(value as (typeof PRESENCE_EASINGS)[number])) {
    issues.push(`${path}: expected "ease-in" or "ease-out"`);
  }
}

function validateTiming(value: Record<string, unknown>, path: string, issues: string[]): void {
  validateDuration(value.enterDurationMs, `${path}.enterDurationMs`, issues);
  validateDuration(value.exitDurationMs, `${path}.exitDurationMs`, issues);
  validateEasing(value.enterEasing, `${path}.enterEasing`, issues);
  validateEasing(value.exitEasing, `${path}.exitEasing`, issues);
}

function validateProfile(
  profile: DropdownPresenceProfile,
  value: unknown,
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(
    value,
    profile === 'fade-translate' ? FADE_TRANSLATE_KEYS : GROW_HEIGHT_KEYS,
    path,
    issues
  );
  validateTiming(value, path, issues);

  if (profile === 'fade-translate') {
    if (
      typeof value.distancePx !== 'number' ||
      !Number.isFinite(value.distancePx) ||
      value.distancePx <= 0
    ) {
      issues.push(`${path}.distancePx: expected finite number greater than 0`);
    }
  }
}

export function validatePresenceEffectContract(
  value: unknown,
  path = 'global.effects.presence'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  validateAllowedKeys(value, PRESENCE_KEYS, path, issues);
  if (!isRecord(value.profiles)) {
    issues.push(`${path}.profiles: expected non-empty object`);
    return issues;
  }

  const profileEntries = Object.entries(value.profiles);
  if (profileEntries.length === 0) {
    issues.push(`${path}.profiles: expected at least one profile`);
    return issues;
  }

  for (const [profile, definition] of profileEntries) {
    if (!dropdownPresenceProfiles.includes(profile as DropdownPresenceProfile)) {
      issues.push(`${path}.profiles.${profile}: unsupported profile`);
      continue;
    }
    validateProfile(
      profile as DropdownPresenceProfile,
      definition,
      `${path}.profiles.${profile}`,
      issues
    );
  }

  return issues;
}

export function validateDropdownPresenceEffectContract(
  value: unknown,
  path = 'components.dropdown.effects.presence'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  validateAllowedKeys(value, DROPDOWN_PRESENCE_KEYS, path, issues);
  if (!dropdownPresenceProfiles.includes(value.profile as DropdownPresenceProfile)) {
    issues.push(`${path}.profile: unsupported profile`);
  }
  return issues;
}

export function validateSchemaPresenceContract(schemaLike: SchemaPresenceContractInput): void {
  const presence = schemaLike.global?.effects?.presence;
  const dropdownPresence = schemaLike.components?.dropdown?.effects?.presence;
  const issues: string[] = [];

  if (presence !== undefined) {
    issues.push(...validatePresenceEffectContract(presence));
  }
  if (dropdownPresence !== undefined) {
    issues.push(...validateDropdownPresenceEffectContract(dropdownPresence));
  }

  if (isRecord(dropdownPresence)) {
    const profile = dropdownPresence.profile;
    if (dropdownPresenceProfiles.includes(profile as DropdownPresenceProfile)) {
      if (!isRecord(presence) || !isRecord(presence.profiles)) {
        issues.push(
          'components.dropdown.effects.presence.profile: requires global.effects.presence.profiles'
        );
      } else if (!Object.hasOwn(presence.profiles, profile as PropertyKey)) {
        issues.push(
          `components.dropdown.effects.presence.profile: references missing profile "${String(profile)}"`
        );
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(`Invalid presence effect contract.\n${issues.join('\n')}`);
  }
}
