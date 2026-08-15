import { z } from 'zod';
import {
  type ElementAllSizeValue,
  type ElementSizeValue,
  elementSizeValues
} from './breakpoints.ts';
import { getElementPaletteValidationIssues } from './components/palettes.ts';
import type {
  ElementSeparator,
  ElementSeparatorProfile,
  SchemaSeparators,
  SeparatorProfile,
  SeparatorProfileByBreakpoint,
  SeparatorProfilePalettes
} from './separator.ts';

const SEPARATOR_PROFILE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const separatorSizeValues = ['s:all', ...elementSizeValues] as const satisfies readonly (
  | ElementSizeValue
  | ElementAllSizeValue
)[];
const themeValues = ['light', 'dark', 'darker'] as const;

export const separatorProfileIdContractSchema = z
  .string()
  .regex(SEPARATOR_PROFILE_ID_PATTERN, 'expected a lowercase kebab-case separator profile id');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, canonicalize(value[key])])
  );
}

function getSeparatorProfileIdentity(profile: SeparatorProfile): string {
  return JSON.stringify(canonicalize(profile));
}

function getSeparatorPaletteIdentity(palettes: SeparatorProfilePalettes): string {
  return JSON.stringify(canonicalize(palettes));
}

function addPaletteIssue(
  ctx: z.core.$RefinementCtx<unknown>,
  path: PropertyKey[],
  message: string
): void {
  ctx.addIssue({ code: 'custom', path, message });
}

function validateSeparatorColorMap(
  value: unknown,
  path: PropertyKey[],
  ctx: z.core.$RefinementCtx<unknown>
): void {
  if (!isRecord(value)) return;

  for (const key of Object.keys(value)) {
    if (key !== 'boxColor') addPaletteIssue(ctx, [...path, key], 'unrecognized key');
  }

  const boxColor = value.boxColor;
  if (!isRecord(boxColor)) {
    addPaletteIssue(ctx, [...path, 'boxColor'], 'expected object');
    return;
  }
  for (const key of Object.keys(boxColor)) {
    if (key !== 'neutral') addPaletteIssue(ctx, [...path, 'boxColor', key], 'unrecognized intent');
  }

  const neutral = boxColor.neutral;
  if (!isRecord(neutral)) {
    addPaletteIssue(ctx, [...path, 'boxColor', 'neutral'], 'required intent');
    return;
  }
  for (const key of Object.keys(neutral)) {
    if (key !== 'medium') {
      addPaletteIssue(ctx, [...path, 'boxColor', 'neutral', key], 'expected "medium" emphasis');
    }
  }

  const medium = neutral.medium;
  if (!isRecord(medium)) {
    addPaletteIssue(ctx, [...path, 'boxColor', 'neutral', 'medium'], 'required emphasis');
    return;
  }
  for (const key of Object.keys(medium)) {
    if (key !== 'rest') {
      addPaletteIssue(ctx, [...path, 'boxColor', 'neutral', 'medium', key], 'unrecognized state');
    }
  }
  if (medium.rest === undefined) {
    addPaletteIssue(ctx, [...path, 'boxColor', 'neutral', 'medium', 'rest'], 'required state');
  }
}

const separatorProfilePalettesContractSchema = z.unknown().superRefine((value, ctx) => {
  if (!isRecord(value)) {
    addPaletteIssue(ctx, [], 'expected object');
    return;
  }
  if (Object.keys(value).length === 0) {
    addPaletteIssue(ctx, [], 'expected at least one palette');
    return;
  }

  for (const issue of getElementPaletteValidationIssues(value, ['boxColor'])) {
    addPaletteIssue(ctx, issue.path, issue.message);
  }

  for (const [segment, byTheme] of Object.entries(value)) {
    if (!isRecord(byTheme)) continue;
    for (const [theme, byContext] of Object.entries(byTheme)) {
      if (!themeValues.includes(theme as (typeof themeValues)[number])) {
        addPaletteIssue(ctx, [segment, theme], 'unrecognized theme');
      }
      if (!isRecord(byContext)) continue;
      for (const [context, colorMap] of Object.entries(byContext)) {
        if (context !== 'onSubtle' && context !== 'onVivid') continue;
        validateSeparatorColorMap(colorMap, [segment, theme, context], ctx);
      }
    }
  }
}) as z.ZodType<SeparatorProfilePalettes>;

export const separatorProfileContractSchema = z
  .object({
    scales: z
      .object({
        boxWidth: z.number().finite().positive()
      })
      .strict(),
    palettes: separatorProfilePalettesContractSchema
  })
  .strict() satisfies z.ZodType<SeparatorProfile>;

export const schemaSeparatorsContractSchema = z
  .object({
    profiles: z
      .record(z.string(), separatorProfileContractSchema)
      .refine((profiles) => Object.keys(profiles).length > 0, 'expected at least one profile')
      .superRefine((profiles, ctx) => {
        const firstProfileIdByIdentity = new Map<string, string>();

        for (const profileId of Object.keys(profiles)) {
          const idResult = separatorProfileIdContractSchema.safeParse(profileId);
          if (!idResult.success) {
            for (const issue of idResult.error.issues) {
              ctx.addIssue({
                code: 'custom',
                path: [profileId, ...issue.path],
                message: issue.message
              });
            }
          }

          const identity = getSeparatorProfileIdentity(profiles[profileId]!);
          const originalProfileId = firstProfileIdByIdentity.get(identity);
          if (originalProfileId) {
            ctx.addIssue({
              code: 'custom',
              path: [profileId],
              message: `duplicates separator profile "${originalProfileId}"`
            });
            continue;
          }
          firstProfileIdByIdentity.set(identity, profileId);
        }
      })
  })
  .strict() satisfies z.ZodType<SchemaSeparators>;

export const separatorProfileByBreakpointContractSchema = z
  .object({
    'bp:all': separatorProfileIdContractSchema,
    'bp:sm:1': separatorProfileIdContractSchema.optional(),
    'bp:sm:2': separatorProfileIdContractSchema.optional(),
    'bp:sm:3': separatorProfileIdContractSchema.optional(),
    'bp:md:1': separatorProfileIdContractSchema.optional(),
    'bp:md:2': separatorProfileIdContractSchema.optional(),
    'bp:md:3': separatorProfileIdContractSchema.optional(),
    'bp:lg:1': separatorProfileIdContractSchema.optional(),
    'bp:lg:2': separatorProfileIdContractSchema.optional(),
    'bp:lg:3': separatorProfileIdContractSchema.optional(),
    'bp:lg:4': separatorProfileIdContractSchema.optional()
  })
  .strict() satisfies z.ZodType<SeparatorProfileByBreakpoint>;

const elementSeparatorProfileContractSchema = z.unknown().superRefine((value, ctx) => {
  const schema =
    typeof value === 'string'
      ? separatorProfileIdContractSchema
      : separatorProfileByBreakpointContractSchema;
  const result = schema.safeParse(value);
  if (result.success) return;

  for (const issue of result.error.issues) {
    ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message });
  }
}) as z.ZodType<ElementSeparatorProfile>;

const elementSeparatorShape = Object.fromEntries(
  separatorSizeValues.map((size) => [size, elementSeparatorProfileContractSchema.optional()])
) as Record<
  ElementSizeValue | ElementAllSizeValue,
  z.ZodOptional<typeof elementSeparatorProfileContractSchema>
>;

export const elementSeparatorContractSchema = z
  .object(elementSeparatorShape)
  .strict()
  .superRefine((value, ctx) => {
    const declaredSizes = Object.keys(value).filter(
      (size) => value[size as keyof typeof value] !== undefined
    );
    if (declaredSizes.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'expected at least one size reference' });
    }
    if (value['s:all'] !== undefined && declaredSizes.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['s:all'],
        message: '"s:all" cannot be combined with another size'
      });
    }
  }) as z.ZodType<ElementSeparator>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaSeparatorsDefinitionContract(
  value: unknown,
  path = 'global.separators'
): string[] {
  const result = schemaSeparatorsContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateElementSeparatorContract(value: unknown, path = 'separator'): string[] {
  const result = elementSeparatorContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

type SchemaSeparatorsContractInput = {
  breakpoints?: unknown;
  global?: { separators?: unknown };
  components?: unknown;
};

type SeparatorElementReference = {
  path: string;
  element: Record<string, unknown>;
};

function collectSeparatorElements(
  value: unknown,
  path: string,
  references: SeparatorElementReference[]
): void {
  if (!isRecord(value)) return;

  const collectElementMap = (elementMap: unknown, elementMapPath: string): void => {
    if (!isRecord(elementMap)) return;
    for (const [elementName, element] of Object.entries(elementMap)) {
      if (!isRecord(element) || !Object.hasOwn(element, 'separator')) continue;
      references.push({ path: `${elementMapPath}.${elementName}`, element });
    }
  };

  for (const [componentName, component] of Object.entries(value)) {
    if (!isRecord(component)) continue;
    const componentPath = `${path}.${componentName}`;
    collectElementMap(component.elements, `${componentPath}.elements`);

    if (!isRecord(component.variants)) continue;
    for (const [variantName, variant] of Object.entries(component.variants)) {
      if (!isRecord(variant)) continue;
      const variantPath = `${componentPath}.variants.${variantName}`;
      collectElementMap(variant.elements, `${variantPath}.elements`);

      if (!isRecord(variant.modes)) continue;
      for (const [modeName, mode] of Object.entries(variant.modes)) {
        if (!isRecord(mode)) continue;
        collectElementMap(mode.elements, `${variantPath}.modes.${modeName}.elements`);
      }
    }
  }
}

function collectPropertyPaths(
  value: unknown,
  property: string,
  path: string,
  matches: string[]
): void {
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (key === property) matches.push(childPath);
    collectPropertyPaths(child, property, childPath, matches);
  }
}

function addRawSeparatorConflicts(reference: SeparatorElementReference, issues: string[]): void {
  const { element, path } = reference;
  const scales = isRecord(element.scales) ? element.scales : undefined;
  if (scales && Object.hasOwn(scales, 'boxWidth')) {
    issues.push(`${path}.scales.boxWidth: cannot be authored together with ${path}.separator`);
  }

  const boxColorPaths: string[] = [];
  collectPropertyPaths(element.palettes, 'boxColor', `${path}.palettes`, boxColorPaths);
  for (const boxColorPath of boxColorPaths) {
    issues.push(`${boxColorPath}: cannot be authored together with ${path}.separator`);
  }
}

function validateSeparatorReferences(
  value: ElementSeparator,
  path: string,
  profiles: Readonly<Record<string, SeparatorProfile>>,
  declaredBreakpoints: ReadonlySet<string>,
  issues: string[]
): void {
  let expectedPaletteIdentity: string | undefined;
  let expectedProfileId: string | undefined;

  const validateProfile = (profileId: string, referencePath: string): void => {
    const profile = profiles[profileId];
    if (!profile) {
      issues.push(`${referencePath}: references unknown separator profile "${profileId}"`);
      return;
    }

    const paletteIdentity = getSeparatorPaletteIdentity(profile.palettes);
    if (expectedPaletteIdentity === undefined) {
      expectedPaletteIdentity = paletteIdentity;
      expectedProfileId = profileId;
      return;
    }
    if (paletteIdentity !== expectedPaletteIdentity) {
      issues.push(
        `${referencePath}: separator profiles in one element must preserve the palettes from "${expectedProfileId}"`
      );
    }
  };

  for (const [size, assignment] of Object.entries(value)) {
    if (assignment === undefined) continue;
    if (typeof assignment === 'string') {
      validateProfile(assignment, `${path}.${size}`);
      continue;
    }

    for (const [breakpoint, profileId] of Object.entries(assignment) as [string, string][]) {
      if (!declaredBreakpoints.has(breakpoint)) {
        issues.push(
          `${path}.${size}.${breakpoint}: breakpoint "${breakpoint}" is not declared in schema.breakpoints`
        );
      }
      validateProfile(profileId, `${path}.${size}.${breakpoint}`);
    }
  }
}

export function getSchemaSeparatorsContractIssues(
  schemaLike: SchemaSeparatorsContractInput
): string[] {
  const issues: string[] = [];
  const definition = schemaLike.global?.separators;
  const definitionResult = schemaSeparatorsContractSchema.safeParse(definition);

  if (definition !== undefined && !definitionResult.success) {
    issues.push(
      ...definitionResult.error.issues.map((issue) => formatZodIssue('global.separators', issue))
    );
  }

  const references: SeparatorElementReference[] = [];
  collectSeparatorElements(schemaLike.components, 'components', references);
  if (references.length === 0) return issues;

  if (definition === undefined) {
    issues.push('global.separators: required when component elements reference separator profiles');
  }

  const profiles = definitionResult.success ? definitionResult.data.profiles : {};
  const declaredBreakpoints = new Set(
    isRecord(schemaLike.breakpoints)
      ? Object.entries(schemaLike.breakpoints).flatMap(([breakpoint, value]) =>
          typeof value === 'number' && Number.isFinite(value) ? [breakpoint] : []
        )
      : []
  );

  for (const reference of references) {
    addRawSeparatorConflicts(reference, issues);

    const result = elementSeparatorContractSchema.safeParse(reference.element.separator);
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => formatZodIssue(`${reference.path}.separator`, issue))
      );
      continue;
    }

    if (definitionResult.success) {
      validateSeparatorReferences(
        result.data,
        `${reference.path}.separator`,
        profiles,
        declaredBreakpoints,
        issues
      );
    }
  }

  return issues;
}

export function validateSchemaSeparatorsContract(schemaLike: SchemaSeparatorsContractInput): void {
  const issues = getSchemaSeparatorsContractIssues(schemaLike);
  if (issues.length === 0) return;
  throw new Error(`Invalid separator contract.\n${issues.join('\n')}`);
}
