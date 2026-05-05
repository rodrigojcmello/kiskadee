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
export const textFieldLabelOffsetStrategySchema = z.enum([
  'schema',
  'radius',
  'input-start',
  'none'
]);
export const textFieldFocusRingColorSourceSchema = z.enum(['global', 'component']);
export const textFieldLabelOffsetByRadiusSchema = z
  .object({
    square: textFieldLabelOffsetStrategySchema.optional(),
    rounded: textFieldLabelOffsetStrategySchema.optional(),
    pill: textFieldLabelOffsetStrategySchema.optional()
  })
  .strict();

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
      focusRingColorSource: textFieldFocusRingColorSourceSchema.optional()
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

export function createTextFieldModeOptionsSchema() {
  return z
    .object({
      labelOffset: textFieldLabelOffsetByRadiusSchema.optional(),
      focusRingColorSource: textFieldFocusRingColorSourceSchema.optional()
    })
    .strict();
}

export const textFieldOptionsSchema = createTextFieldOptionsSchema();
export const textFieldModeOptionsSchema = createTextFieldModeOptionsSchema();

export type TextFieldOptionsFromSchema = z.input<typeof textFieldOptionsSchema>;
export type TextFieldModeOptionsFromSchema = z.input<typeof textFieldModeOptionsSchema>;
export type TextFieldFocusRingColorSourceFromSchema = z.input<
  typeof textFieldFocusRingColorSourceSchema
>;
