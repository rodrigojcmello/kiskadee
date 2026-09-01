import { z } from 'zod';
import {
  type ElementForeground,
  type ForegroundFamilyProfiles,
  type ForegroundProfile,
  type ForegroundProfilePalettes,
  type ForegroundProfileReference,
  type ForegroundState,
  foregroundStateValues,
  isForegroundReferenceCandidate,
  parseForegroundReferenceToken,
  type SchemaForegrounds,
  textEmphasisValues
} from './foreground.ts';

const FOREGROUND_PROFILE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const themeValues = ['light', 'dark', 'darker'] as const;

export const foregroundFamilyIdContractSchema = z
  .string()
  .regex(FOREGROUND_PROFILE_ID_PATTERN, 'expected a lowercase kebab-case foreground family id')
  .refine((value) => value !== 'inherit', '"inherit" is reserved for the React API');

const foregroundProfileNameContractSchema = z.enum(['standard', 'deep']);

export const foregroundProfileReferenceContractSchema = z
  .object({
    family: foregroundFamilyIdContractSchema,
    profile: foregroundProfileNameContractSchema
  })
  .strict() satisfies z.ZodType<ForegroundProfileReference>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function addIssue(ctx: z.core.$RefinementCtx<unknown>, path: PropertyKey[], message: string): void {
  ctx.addIssue({ code: 'custom', path, message });
}

function validateEmphasisMap(
  value: unknown,
  path: PropertyKey[],
  ctx: z.core.$RefinementCtx<unknown>
): void {
  if (!isRecord(value)) {
    addIssue(ctx, path, 'expected object');
    return;
  }

  for (const emphasis of Object.keys(value)) {
    if (!textEmphasisValues.includes(emphasis as (typeof textEmphasisValues)[number])) {
      addIssue(ctx, [...path, emphasis], 'unrecognized emphasis');
    }
  }

  for (const emphasis of textEmphasisValues) {
    const stateMap = value[emphasis];
    if (!isRecord(stateMap)) {
      addIssue(ctx, [...path, emphasis], 'required emphasis');
      continue;
    }
    for (const state of Object.keys(stateMap)) {
      if (!foregroundStateValues.includes(state as ForegroundState)) {
        addIssue(ctx, [...path, emphasis, state], 'unrecognized state');
      }
    }
    if (!Object.hasOwn(stateMap, 'rest') || stateMap.rest === undefined) {
      addIssue(ctx, [...path, emphasis, 'rest'], 'required state');
    }
  }
}

const foregroundProfilePalettesContractSchema = z.unknown().superRefine((value, ctx) => {
  if (!isRecord(value)) {
    addIssue(ctx, [], 'expected object');
    return;
  }
  if (Object.keys(value).length === 0) {
    addIssue(ctx, [], 'expected at least one palette');
    return;
  }

  for (const [segment, byTheme] of Object.entries(value)) {
    if (!isRecord(byTheme)) {
      addIssue(ctx, [segment], 'expected object');
      continue;
    }
    if (Object.keys(byTheme).length === 0) {
      addIssue(ctx, [segment], 'expected at least one theme');
    }

    for (const [theme, byContext] of Object.entries(byTheme)) {
      if (!themeValues.includes(theme as (typeof themeValues)[number])) {
        addIssue(ctx, [segment, theme], 'unrecognized theme');
      }
      if (!isRecord(byContext)) {
        addIssue(ctx, [segment, theme], 'expected object');
        continue;
      }
      for (const context of Object.keys(byContext)) {
        if (context !== 'onSubtle' && context !== 'onVivid') {
          addIssue(ctx, [segment, theme, context], 'unrecognized surface context');
        }
      }
      if (!Object.hasOwn(byContext, 'onSubtle')) {
        addIssue(ctx, [segment, theme, 'onSubtle'], 'required surface context');
      } else {
        validateEmphasisMap(byContext.onSubtle, [segment, theme, 'onSubtle'], ctx);
      }
      if (Object.hasOwn(byContext, 'onVivid')) {
        validateEmphasisMap(byContext.onVivid, [segment, theme, 'onVivid'], ctx);
      }
    }
  }
}) as z.ZodType<ForegroundProfilePalettes>;

export const foregroundProfileContractSchema = z
  .object({ palettes: foregroundProfilePalettesContractSchema })
  .strict() satisfies z.ZodType<ForegroundProfile>;

const foregroundFamilyProfilesContractSchema = z
  .object({
    standard: foregroundProfileContractSchema,
    deep: foregroundProfileContractSchema.optional()
  })
  .strict() satisfies z.ZodType<ForegroundFamilyProfiles>;

export const schemaForegroundsContractSchema = z
  .object({
    profiles: z
      .record(z.string(), foregroundFamilyProfilesContractSchema)
      .refine((profiles) => Object.keys(profiles).length > 0, 'expected at least one family')
      .superRefine((profiles, ctx) => {
        for (const familyId of Object.keys(profiles)) {
          const result = foregroundFamilyIdContractSchema.safeParse(familyId);
          if (result.success) continue;
          for (const issue of result.error.issues) {
            ctx.addIssue({
              code: 'custom',
              path: [familyId, ...issue.path],
              message: issue.message
            });
          }
        }
      })
  })
  .strict() satisfies z.ZodType<SchemaForegrounds>;

export const elementForegroundContractSchema = z
  .record(z.string(), foregroundProfileReferenceContractSchema)
  .refine((references) => Object.keys(references).length > 0, 'expected at least one reference')
  .superRefine((references, ctx) => {
    for (const intent of Object.keys(references)) {
      const result = foregroundFamilyIdContractSchema.safeParse(intent);
      if (result.success) continue;
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: 'custom', path: [intent, ...issue.path], message: issue.message });
      }
    }
  }) as z.ZodType<ElementForeground>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaForegroundsDefinitionContract(
  value: unknown,
  path = 'global.foregrounds'
): string[] {
  const result = schemaForegroundsContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateElementForegroundContract(value: unknown, path = 'foreground'): string[] {
  const result = elementForegroundContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

type SchemaForegroundsContractInput = {
  global?: { foregrounds?: unknown };
  components?: unknown;
};

type ForegroundElementReference = {
  path: string;
  element: Record<string, unknown>;
};

type AtomicForegroundReference = {
  path: string;
  segment: string;
  token: unknown;
  colorProperty: string;
  kind: 'direct' | 'parentState' | 'legacyRef';
};

function collectAtomicReferenceValues(
  value: unknown,
  path: string,
  segment: string,
  colorProperty: string,
  references: AtomicForegroundReference[]
): void {
  if (isForegroundReferenceCandidate(value)) {
    references.push({ path, segment, token: value, colorProperty, kind: 'direct' });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectAtomicReferenceValues(item, `${path}.${index}`, segment, colorProperty, references);
    });
    return;
  }
  if (!isRecord(value)) return;

  if (Object.hasOwn(value, 'parentState')) {
    references.push({
      path: `${path}.parentState`,
      segment,
      token: value.parentState,
      colorProperty,
      kind: 'parentState'
    });
    return;
  }
  if (Object.hasOwn(value, 'ref') && isForegroundReferenceCandidate(value.ref)) {
    references.push({
      path: `${path}.ref`,
      segment,
      token: value.ref,
      colorProperty,
      kind: 'legacyRef'
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    collectAtomicReferenceValues(child, `${path}.${key}`, segment, colorProperty, references);
  }
}

function collectPaletteAtomicReferences(
  value: unknown,
  path: string,
  references: AtomicForegroundReference[]
): void {
  if (!isRecord(value)) return;
  for (const [segment, byTheme] of Object.entries(value)) {
    if (!isRecord(byTheme)) continue;
    for (const [theme, byContext] of Object.entries(byTheme)) {
      if (!isRecord(byContext)) continue;
      for (const [surfaceContext, colorSchema] of Object.entries(byContext)) {
        if (!isRecord(colorSchema)) continue;
        for (const [colorProperty, colorValue] of Object.entries(colorSchema)) {
          collectAtomicReferenceValues(
            colorValue,
            `${path}.${segment}.${theme}.${surfaceContext}.${colorProperty}`,
            segment,
            colorProperty,
            references
          );
        }
      }
    }
  }
}

function collectForegroundElements(
  value: unknown,
  path: string,
  references: ForegroundElementReference[],
  atomicReferences: AtomicForegroundReference[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectForegroundElements(item, `${path}.${index}`, references, atomicReferences);
    });
    return;
  }
  if (!isRecord(value)) return;

  if (Object.hasOwn(value, 'foreground')) references.push({ path, element: value });

  for (const [key, child] of Object.entries(value)) {
    if (key === 'foreground') continue;
    if (key === 'palettes') {
      collectPaletteAtomicReferences(child, `${path}.${key}`, atomicReferences);
      continue;
    }
    collectForegroundElements(child, `${path}.${key}`, references, atomicReferences);
  }
}

function validateAtomicForegroundReference(
  reference: AtomicForegroundReference,
  profiles: Readonly<Record<string, ForegroundFamilyProfiles>>,
  definitionIsValid: boolean
): string[] {
  const issues: string[] = [];
  if (reference.colorProperty !== 'textColor') {
    issues.push(`${reference.path}: fg references are accepted only in textColor`);
  }
  if (reference.kind === 'legacyRef') {
    issues.push(`${reference.path}: use fg.parentState() instead of the legacy ref wrapper`);
  }
  if (!isForegroundReferenceCandidate(reference.token)) {
    issues.push(`${reference.path}: parentState requires an fg reference token`);
    return issues;
  }

  const parsed = parseForegroundReferenceToken(reference.token);
  if (!parsed) {
    issues.push(
      `${reference.path}: invalid fg coordinate; expected family.profile.theme.surfaceContext.emphasis[.state]`
    );
    return issues;
  }

  const familyResult = foregroundFamilyIdContractSchema.safeParse(parsed.family);
  if (!familyResult.success) {
    issues.push(...familyResult.error.issues.map((issue) => formatZodIssue(reference.path, issue)));
    return issues;
  }
  if (!definitionIsValid) return issues;

  const family = profiles[parsed.family];
  if (!family) {
    issues.push(`${reference.path}: references unknown foreground family "${parsed.family}"`);
    return issues;
  }
  const profile = family[parsed.profile];
  if (!profile) {
    issues.push(
      `${reference.path}: references unavailable foreground profile "${parsed.family}.${parsed.profile}"`
    );
    return issues;
  }
  const segment = profile.palettes[reference.segment];
  if (!segment) {
    issues.push(
      `${reference.path}: foreground profile "${parsed.family}.${parsed.profile}" does not publish segment "${reference.segment}"`
    );
    return issues;
  }
  const theme = segment[parsed.theme];
  if (!theme) {
    issues.push(
      `${reference.path}: foreground profile "${parsed.family}.${parsed.profile}" does not publish theme "${parsed.theme}" for segment "${reference.segment}"`
    );
    return issues;
  }
  const surfaceContext = theme[parsed.surfaceContext];
  if (!surfaceContext) {
    issues.push(
      `${reference.path}: foreground profile "${parsed.family}.${parsed.profile}" does not publish ${parsed.surfaceContext} for ${reference.segment}.${parsed.theme}`
    );
    return issues;
  }
  const emphasis = surfaceContext[parsed.emphasis];
  if (!emphasis) {
    issues.push(
      `${reference.path}: foreground profile "${parsed.family}.${parsed.profile}" does not publish emphasis "${parsed.emphasis}"`
    );
    return issues;
  }
  if (emphasis[parsed.state] === undefined) {
    issues.push(
      `${reference.path}: foreground coordinate "${reference.token}" does not publish state "${parsed.state}"`
    );
  }

  return issues;
}

function collectTextColorPaths(value: unknown, path: string, paths: string[]): void {
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (key === 'textColor') {
      paths.push(childPath);
      continue;
    }
    collectTextColorPaths(child, childPath, paths);
  }
}

export function getSchemaForegroundsContractIssues(
  schemaLike: SchemaForegroundsContractInput
): string[] {
  const issues: string[] = [];
  const foregroundsDefinition = schemaLike.global?.foregrounds;
  const definitionResult = schemaForegroundsContractSchema.safeParse(foregroundsDefinition);

  if (foregroundsDefinition !== undefined && !definitionResult.success) {
    issues.push(
      ...definitionResult.error.issues.map((issue) => formatZodIssue('global.foregrounds', issue))
    );
  }

  const foregroundElements: ForegroundElementReference[] = [];
  const atomicReferences: AtomicForegroundReference[] = [];
  collectForegroundElements(
    schemaLike.components,
    'components',
    foregroundElements,
    atomicReferences
  );
  if (foregroundElements.length === 0 && atomicReferences.length === 0) return issues;

  if (foregroundsDefinition === undefined) {
    issues.push(
      'global.foregrounds: required when component elements reference foreground profiles or coordinates'
    );
  }

  const profiles = definitionResult.success ? definitionResult.data.profiles : {};
  for (const reference of foregroundElements) {
    const foregroundResult = elementForegroundContractSchema.safeParse(
      reference.element.foreground
    );
    if (!foregroundResult.success) {
      issues.push(
        ...foregroundResult.error.issues.map((issue) =>
          formatZodIssue(`${reference.path}.foreground`, issue)
        )
      );
    } else if (definitionResult.success) {
      for (const [intent, referenceValue] of Object.entries(foregroundResult.data)) {
        const familyProfiles = profiles[referenceValue.family];
        if (!familyProfiles) {
          issues.push(
            `${reference.path}.foreground.${intent}: references unknown foreground family "${referenceValue.family}"`
          );
          continue;
        }
        if (!familyProfiles[referenceValue.profile]) {
          issues.push(
            `${reference.path}.foreground.${intent}: references unavailable foreground profile "${referenceValue.family}.${referenceValue.profile}"`
          );
        }
      }
    }

    const textColorPaths: string[] = [];
    collectTextColorPaths(reference.element.palettes, `${reference.path}.palettes`, textColorPaths);
    for (const textColorPath of textColorPaths) {
      issues.push(
        `${textColorPath}: cannot be authored together with ${reference.path}.foreground`
      );
    }
  }

  for (const reference of atomicReferences) {
    issues.push(
      ...validateAtomicForegroundReference(reference, profiles, definitionResult.success)
    );
  }

  return issues;
}

export function validateSchemaForegroundsContract(
  schemaLike: SchemaForegroundsContractInput
): void {
  const issues = getSchemaForegroundsContractIssues(schemaLike);
  if (issues.length === 0) return;
  throw new Error(`Invalid foreground contract.\n${issues.join('\n')}`);
}
