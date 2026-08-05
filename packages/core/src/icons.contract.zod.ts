import { z } from 'zod';
import type { SchemaIcons } from './schema.ts';

const ICON_FAMILY_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const iconFamilyIdContractSchema = z
  .string()
  .regex(ICON_FAMILY_ID_PATTERN, 'expected a lowercase kebab-case family id');

export const schemaIconsContractSchema = z
  .object({
    family: iconFamilyIdContractSchema
  })
  .strict() satisfies z.ZodType<SchemaIcons>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaIconsContract(value: unknown, path = 'global.icons'): string[] {
  const result = schemaIconsContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateSchemaGlobalIconContract(schemaLike: {
  global?: { icons?: unknown };
}): void {
  const icons = schemaLike.global?.icons;
  if (icons === undefined) return;

  const issues = validateSchemaIconsContract(icons);
  if (issues.length === 0) return;

  throw new Error(`Invalid global icon contract.\n${issues.join('\n')}`);
}
