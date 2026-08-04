import { z } from 'zod';
import type { SchemaFonts } from './schema.ts';

const FONT_FAMILY_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const fontFamilyIdContractSchema = z
  .string()
  .regex(FONT_FAMILY_ID_PATTERN, 'expected a lowercase kebab-case family id');

const fontStackItemContractSchema = z
  .string()
  .refine((value) => value.trim().length > 0, 'expected a non-empty font-family name');

export const fontStackContractSchema = z.tuple(
  [fontStackItemContractSchema],
  fontStackItemContractSchema
);

export const schemaFontFamilyContractSchema = z
  .object({
    stack: fontStackContractSchema
  })
  .strict();

export const schemaFontsContractSchema = z
  .object({
    families: z
      .record(fontFamilyIdContractSchema, schemaFontFamilyContractSchema)
      .refine((families) => Object.keys(families).length > 0, 'expected at least one family'),
    roles: z
      .object({
        body: fontFamilyIdContractSchema,
        heading: fontFamilyIdContractSchema.optional(),
        code: fontFamilyIdContractSchema.optional()
      })
      .strict()
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const role of ['body', 'heading', 'code'] as const) {
      const familyId = value.roles[role];
      if (familyId === undefined || Object.hasOwn(value.families, familyId)) continue;

      ctx.addIssue({
        code: 'custom',
        path: ['roles', role],
        message: `references unknown family "${familyId}"`
      });
    }
  }) satisfies z.ZodType<SchemaFonts>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaFontsContract(value: unknown, path = 'global.fonts'): string[] {
  const result = schemaFontsContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateSchemaGlobalFontContract(schemaLike: {
  global?: { fonts?: unknown };
}): void {
  const fonts = schemaLike.global?.fonts;
  if (fonts === undefined) return;

  const issues = validateSchemaFontsContract(fonts);
  if (issues.length === 0) return;

  throw new Error(`Invalid global font contract.\n${issues.join('\n')}`);
}
