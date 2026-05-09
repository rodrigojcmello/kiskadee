import { z } from 'zod';

export const switchVariantSchema = z.enum(['standard']);
export const switchStandardModeSchema = z.enum(['base']);
export const switchModeSchema = switchStandardModeSchema;
export const switchRadiusSchema = z.enum(['rounded', 'square', 'pill']);

export type SwitchVariantSchemaValue = z.infer<typeof switchVariantSchema>;
export type SwitchStandardModeSchemaValue = z.infer<typeof switchStandardModeSchema>;
export type SwitchModeSchemaValue = z.infer<typeof switchModeSchema>;

export function createSwitchOptionsSchema() {
  return z
    .object({
      variant: switchVariantSchema.optional(),
      radius: switchRadiusSchema.optional()
    })
    .strict();
}

export function createSwitchVariantOptionsSchema() {
  return z
    .object({
      mode: switchModeSchema.optional()
    })
    .strict();
}

export const switchOptionsSchema = createSwitchOptionsSchema();
export const switchVariantOptionsSchema = createSwitchVariantOptionsSchema();

export type SwitchOptionsFromSchema = z.input<typeof switchOptionsSchema>;
export type SwitchVariantOptionsFromSchema = z.input<typeof switchVariantOptionsSchema>;
