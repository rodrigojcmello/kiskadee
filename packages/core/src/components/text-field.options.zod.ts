import { z } from 'zod';

export const textFieldVariantSchema = z.enum(['standard', 'floating']);
export const textFieldStandardModeSchema = z.enum(['outline', 'underline', 'borderless']);
export const textFieldFloatingModeSchema = z.enum(['notched', 'inside']);
export const textFieldModeSchema = z.enum([
  'outline',
  'underline',
  'borderless',
  'notched',
  'inside'
]);

export type TextFieldStandardModeSchemaValue = z.infer<typeof textFieldStandardModeSchema>;
export type TextFieldFloatingModeSchemaValue = z.infer<typeof textFieldFloatingModeSchema>;
export type TextFieldModeSchemaValue = z.infer<typeof textFieldModeSchema>;

function isStandardMode(
  value: TextFieldModeSchemaValue
): value is TextFieldStandardModeSchemaValue {
  return value === 'outline' || value === 'underline' || value === 'borderless';
}

function isFloatingMode(
  value: TextFieldModeSchemaValue
): value is TextFieldFloatingModeSchemaValue {
  return value === 'notched' || value === 'inside';
}

export function createTextFieldOptionsSchema() {
  return z
    .object({
      variant: textFieldVariantSchema.optional(),
      mode: textFieldModeSchema.optional(),
      labelRadiusOffset: z.boolean().optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      if (!value.mode || !value.variant) return;

      if (value.variant === 'standard' && !isStandardMode(value.mode)) {
        ctx.addIssue({
          code: 'custom',
          path: ['mode'],
          message: `mode "${value.mode}" is not valid for variant "${value.variant}"`
        });
      }

      if (value.variant === 'floating' && !isFloatingMode(value.mode)) {
        ctx.addIssue({
          code: 'custom',
          path: ['mode'],
          message: `mode "${value.mode}" is not valid for variant "${value.variant}"`
        });
      }
    });
}

export const textFieldOptionsSchema = createTextFieldOptionsSchema();

export type TextFieldOptionsFromSchema = z.input<typeof textFieldOptionsSchema>;
