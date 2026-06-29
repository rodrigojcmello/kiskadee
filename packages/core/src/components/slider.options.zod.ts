import { z } from 'zod';

export const sliderVariantSchema = z.enum(['standard']);
export const sliderStandardModeSchema = z.enum(['base']);
export const sliderModeSchema = sliderStandardModeSchema;
export const sliderValueDisplaySchema = z.enum(['none', 'tooltip', 'summary', 'both']);
export const sliderMarksSchema = z.enum(['none', 'step']);

export type SliderVariantSchemaValue = z.infer<typeof sliderVariantSchema>;
export type SliderStandardModeSchemaValue = z.infer<typeof sliderStandardModeSchema>;
export type SliderModeSchemaValue = z.infer<typeof sliderModeSchema>;
export type SliderValueDisplaySchemaValue = z.infer<typeof sliderValueDisplaySchema>;
export type SliderMarksSchemaValue = z.infer<typeof sliderMarksSchema>;

export function createSliderOptionsSchema() {
  return z
    .object({
      variant: sliderVariantSchema.optional(),
      valueDisplay: sliderValueDisplaySchema.optional(),
      marks: sliderMarksSchema.optional()
    })
    .strict();
}

export function createSliderVariantOptionsSchema() {
  return z
    .object({
      mode: sliderModeSchema.optional()
    })
    .strict();
}

export const sliderOptionsSchema = createSliderOptionsSchema();
export const sliderVariantOptionsSchema = createSliderVariantOptionsSchema();

export type SliderOptionsFromSchema = z.input<typeof sliderOptionsSchema>;
export type SliderVariantOptionsFromSchema = z.input<typeof sliderVariantOptionsSchema>;
