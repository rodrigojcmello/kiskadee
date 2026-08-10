import { z } from 'zod';
import {
  type ElementAllSizeValue,
  type ElementSizeValue,
  elementSizeValues
} from './breakpoints.ts';
import {
  CssTextWeightValue,
  type TextFontValue,
  type TextWeightValue
} from './types/decorations/decorations.types.ts';
import type {
  ElementTypography,
  ElementTypographyProfile,
  SchemaTypography,
  TypographyProfile,
  TypographyProfileByBreakpoint
} from './typography.ts';

const TYPOGRAPHY_PROFILE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const textFontValues = ['body', 'heading', 'code'] as const satisfies readonly TextFontValue[];
const textWeightValues = Object.keys(CssTextWeightValue) as [TextWeightValue, ...TextWeightValue[]];
const elementTypographySizeValues = ['s:all', ...elementSizeValues] as const satisfies readonly (
  | ElementSizeValue
  | ElementAllSizeValue
)[];

export const typographyProfileIdContractSchema = z
  .string()
  .regex(TYPOGRAPHY_PROFILE_ID_PATTERN, 'expected a lowercase kebab-case typography profile id');

const positiveFiniteNumberSchema = z.number().finite().positive();
const finiteNumberSchema = z.number().finite();

function getTypographyProfileIdentity(profile: TypographyProfile): string {
  const { textLetterSpacing, textHeight, textSize } = profile.scales;

  return JSON.stringify([
    profile.decorations.textFont,
    profile.decorations.textWeight,
    textSize,
    textHeight,
    textLetterSpacing === undefined ? ['omitted'] : ['value', textLetterSpacing]
  ]);
}

export const typographyProfileContractSchema = z
  .object({
    decorations: z
      .object({
        textFont: z.enum(textFontValues),
        textWeight: z.enum(textWeightValues)
      })
      .strict(),
    scales: z
      .object({
        textSize: positiveFiniteNumberSchema,
        textHeight: positiveFiniteNumberSchema,
        textLetterSpacing: finiteNumberSchema.optional()
      })
      .strict()
  })
  .strict() satisfies z.ZodType<TypographyProfile>;

export const schemaTypographyContractSchema = z
  .object({
    profiles: z
      .record(z.string(), typographyProfileContractSchema)
      .refine((profiles) => Object.keys(profiles).length > 0, 'expected at least one profile')
      .superRefine((profiles, ctx) => {
        const firstProfileIdByIdentity = new Map<string, string>();

        for (const profileId of Object.keys(profiles)) {
          const result = typographyProfileIdContractSchema.safeParse(profileId);
          if (!result.success) {
            for (const issue of result.error.issues) {
              ctx.addIssue({
                code: 'custom',
                path: [profileId, ...issue.path],
                message: issue.message
              });
            }
          }

          const identity = getTypographyProfileIdentity(profiles[profileId]!);
          const originalProfileId = firstProfileIdByIdentity.get(identity);
          if (originalProfileId) {
            ctx.addIssue({
              code: 'custom',
              path: [profileId],
              message: `duplicates typography profile "${originalProfileId}"`
            });
            continue;
          }

          firstProfileIdByIdentity.set(identity, profileId);
        }
      })
  })
  .strict() satisfies z.ZodType<SchemaTypography>;

export const typographyProfileByBreakpointContractSchema = z
  .object({
    'bp:all': typographyProfileIdContractSchema,
    'bp:sm:1': typographyProfileIdContractSchema.optional(),
    'bp:sm:2': typographyProfileIdContractSchema.optional(),
    'bp:sm:3': typographyProfileIdContractSchema.optional(),
    'bp:md:1': typographyProfileIdContractSchema.optional(),
    'bp:md:2': typographyProfileIdContractSchema.optional(),
    'bp:md:3': typographyProfileIdContractSchema.optional(),
    'bp:lg:1': typographyProfileIdContractSchema.optional(),
    'bp:lg:2': typographyProfileIdContractSchema.optional(),
    'bp:lg:3': typographyProfileIdContractSchema.optional(),
    'bp:lg:4': typographyProfileIdContractSchema.optional()
  })
  .strict() satisfies z.ZodType<TypographyProfileByBreakpoint>;

const elementTypographyProfileContractSchema = z.unknown().superRefine((value, ctx) => {
  const schema =
    typeof value === 'string'
      ? typographyProfileIdContractSchema
      : typographyProfileByBreakpointContractSchema;
  const result = schema.safeParse(value);
  if (result.success) return;

  for (const issue of result.error.issues) {
    ctx.addIssue({
      code: 'custom',
      path: issue.path,
      message: issue.message
    });
  }
}) as z.ZodType<ElementTypographyProfile>;

const elementTypographyShape = Object.fromEntries(
  elementTypographySizeValues.map((size) => [
    size,
    elementTypographyProfileContractSchema.optional()
  ])
) as Record<
  ElementSizeValue | ElementAllSizeValue,
  z.ZodOptional<typeof elementTypographyProfileContractSchema>
>;

export const elementTypographyContractSchema = z
  .object(elementTypographyShape)
  .strict()
  .superRefine((value, ctx) => {
    const declaredSizes = Object.keys(value).filter(
      (size) => value[size as keyof typeof value] !== undefined
    );
    if (declaredSizes.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'expected at least one size reference'
      });
    }

    if (value['s:all'] !== undefined && declaredSizes.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['s:all'],
        message: '"s:all" cannot be combined with another size'
      });
    }
  }) as z.ZodType<ElementTypography>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaTypographyDefinitionContract(
  value: unknown,
  path = 'global.typography'
): string[] {
  const result = schemaTypographyContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateElementTypographyContract(value: unknown, path = 'typography'): string[] {
  const result = elementTypographyContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

type SchemaTypographyContractInput = {
  breakpoints?: unknown;
  global?: { typography?: unknown };
  components?: unknown;
};

type TypographyElementReference = {
  path: string;
  element: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectTypographyElements(
  value: unknown,
  path: string,
  references: TypographyElementReference[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectTypographyElements(item, `${path}.${index}`, references);
    });
    return;
  }
  if (!isRecord(value)) return;

  if (Object.hasOwn(value, 'typography')) {
    references.push({ path, element: value });
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'typography') continue;
    collectTypographyElements(child, `${path}.${key}`, references);
  }
}

function addRawTypographyConflicts(reference: TypographyElementReference, issues: string[]): void {
  const { element, path } = reference;
  const decorations = isRecord(element.decorations) ? element.decorations : undefined;
  const scales = isRecord(element.scales) ? element.scales : undefined;

  for (const property of ['textFont', 'textWeight'] as const) {
    if (decorations && Object.hasOwn(decorations, property)) {
      issues.push(
        `${path}.decorations.${property}: cannot be authored together with ${path}.typography`
      );
    }
  }

  for (const property of ['textSize', 'textHeight', 'textLetterSpacing'] as const) {
    if (scales && Object.hasOwn(scales, property)) {
      issues.push(
        `${path}.scales.${property}: cannot be authored together with ${path}.typography`
      );
    }
  }
}

function getReferencedTypographyProfiles(
  value: ElementTypography,
  path: string,
  profiles: Readonly<Record<string, TypographyProfile>>,
  declaredBreakpoints: ReadonlySet<string>,
  issues: string[]
): void {
  for (const [size, assignment] of Object.entries(value)) {
    if (assignment === undefined) continue;

    if (typeof assignment === 'string') {
      if (!Object.hasOwn(profiles, assignment)) {
        issues.push(`${path}.${size}: references unknown typography profile "${assignment}"`);
      }
      continue;
    }

    const baseProfileId = assignment['bp:all'];
    const baseProfile = baseProfileId ? profiles[baseProfileId] : undefined;

    for (const [breakpoint, profileId] of Object.entries(assignment) as [string, string][]) {
      if (profileId === undefined) continue;

      if (!declaredBreakpoints.has(breakpoint)) {
        issues.push(
          `${path}.${size}.${breakpoint}: breakpoint "${breakpoint}" is not declared in schema.breakpoints`
        );
      }

      const profile = profiles[profileId];
      if (!profile) {
        issues.push(
          `${path}.${size}.${breakpoint}: references unknown typography profile "${profileId}"`
        );
        continue;
      }

      if (!baseProfile || breakpoint === 'bp:all') continue;

      if (profile.decorations.textFont !== baseProfile.decorations.textFont) {
        issues.push(
          `${path}.${size}.${breakpoint}: responsive typography must preserve textFont "${baseProfile.decorations.textFont}"`
        );
      }

      if (profile.decorations.textWeight !== baseProfile.decorations.textWeight) {
        issues.push(
          `${path}.${size}.${breakpoint}: responsive typography must preserve textWeight "${baseProfile.decorations.textWeight}"`
        );
      }
    }
  }
}

export function getSchemaTypographyContractIssues(
  schemaLike: SchemaTypographyContractInput
): string[] {
  const issues: string[] = [];
  const typographyDefinition = schemaLike.global?.typography;
  const definitionResult = schemaTypographyContractSchema.safeParse(typographyDefinition);

  if (typographyDefinition !== undefined && !definitionResult.success) {
    issues.push(
      ...definitionResult.error.issues.map((issue) => formatZodIssue('global.typography', issue))
    );
  }

  const typographyElements: TypographyElementReference[] = [];
  collectTypographyElements(schemaLike.components, 'components', typographyElements);
  if (typographyElements.length === 0) return issues;

  if (typographyDefinition === undefined) {
    issues.push(
      'global.typography: required when component elements reference typography profiles'
    );
  }

  const profiles = definitionResult.success ? definitionResult.data.profiles : {};
  const declaredBreakpoints = new Set(
    isRecord(schemaLike.breakpoints)
      ? Object.entries(schemaLike.breakpoints).flatMap(([breakpoint, value]) =>
          typeof value === 'number' && Number.isFinite(value) ? [breakpoint] : []
        )
      : []
  );

  for (const reference of typographyElements) {
    addRawTypographyConflicts(reference, issues);

    const typographyResult = elementTypographyContractSchema.safeParse(
      reference.element.typography
    );
    if (!typographyResult.success) {
      issues.push(
        ...typographyResult.error.issues.map((issue) =>
          formatZodIssue(`${reference.path}.typography`, issue)
        )
      );
      continue;
    }

    if (definitionResult.success) {
      getReferencedTypographyProfiles(
        typographyResult.data,
        `${reference.path}.typography`,
        profiles,
        declaredBreakpoints,
        issues
      );
    }
  }

  return issues;
}

export function validateSchemaTypographyContract(schemaLike: SchemaTypographyContractInput): void {
  const issues = getSchemaTypographyContractIssues(schemaLike);
  if (issues.length === 0) return;

  throw new Error(`Invalid typography contract.\n${issues.join('\n')}`);
}
