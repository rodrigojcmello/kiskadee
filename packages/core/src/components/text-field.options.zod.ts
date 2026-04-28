import { z } from 'zod';

export const textFieldVariantSchema = z.enum(['standard', 'floating']);

export type TextFieldVariantSchemaValue = z.infer<typeof textFieldVariantSchema>;

export function createTextFieldOptionsSchema() {
  return z
    .object({
      variant: textFieldVariantSchema.optional()
    })
    .strict();
}

export const textFieldOptionsSchema = createTextFieldOptionsSchema();

export type TextFieldOptionsFromSchema = z.input<typeof textFieldOptionsSchema>;
