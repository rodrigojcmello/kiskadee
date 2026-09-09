import { z } from 'zod';
import type { SchemaInteraction } from './controlCursor.ts';

export const schemaInteractionContractSchema = z
  .object({
    controlCursor: z
      .object({
        value: z.enum(['default', 'pointer']),
        scope: z.enum(['web', 'all'])
      })
      .strict()
      .optional()
  })
  .strict() satisfies z.ZodType<SchemaInteraction>;

export function validateSchemaInteractionContract(schema: {
  global?: { interaction?: unknown };
}): void {
  if (schema.global?.interaction === undefined) return;
  schemaInteractionContractSchema.parse(schema.global.interaction);
}
