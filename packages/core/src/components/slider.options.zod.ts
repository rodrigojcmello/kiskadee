import { z } from 'zod';

export const sliderVariantSchema = z.enum(['standard']);
export const sliderStandardModeSchema = z.enum(['base']);
export const sliderModeSchema = sliderStandardModeSchema;
export const sliderValueDisplaySchema = z.enum(['none', 'tooltip', 'summary', 'both', 'auto']);
export const sliderValueSummaryPlacementSchema = z.enum(['headerEnd', 'controlEnd']);
export const sliderValueAnimationSchema = z.enum(['none', 'rolling']);
export const sliderSnapAnimationSchema = z.enum(['none', 'smooth']);
export const sliderThumbStepBehaviorSchema = z.enum(['snap', 'hold', 'stops']);
export const sliderThumbCrossingSchema = z.enum(['prevent', 'swap']);
export const sliderMarksSchema = z.enum(['none', 'step']);
export const sliderEdgeMarksSchema = z.enum(['include', 'exclude']);
export const sliderMarkPlacementSchema = z.enum(['track', 'above', 'below']);
export const sliderMarkLabelPlacementSchema = z.enum(['adaptive', 'above', 'below']);
export const sliderEdgeLabelPlacementSchema = z.enum(['markLabels', 'endpoints', 'adaptive']);
export const sliderEdgeLabelAlignmentSchema = z.enum(['center', 'inside', 'adaptive']);
export const sliderThumbEdgeSchema = z.enum(['overflow', 'contain']);
export const sliderFillOriginSchema = z.union([z.enum(['min', 'center']), z.number().finite()]);
export const sliderFillOriginMarkSchema = z.enum(['none', 'auto']);

export type SliderVariantSchemaValue = z.infer<typeof sliderVariantSchema>;
export type SliderStandardModeSchemaValue = z.infer<typeof sliderStandardModeSchema>;
export type SliderModeSchemaValue = z.infer<typeof sliderModeSchema>;
export type SliderValueDisplaySchemaValue = z.infer<typeof sliderValueDisplaySchema>;
export type SliderValueSummaryPlacementSchemaValue = z.infer<
  typeof sliderValueSummaryPlacementSchema
>;
export type SliderValueAnimationSchemaValue = z.infer<typeof sliderValueAnimationSchema>;
export type SliderSnapAnimationSchemaValue = z.infer<typeof sliderSnapAnimationSchema>;
export type SliderThumbStepBehaviorSchemaValue = z.infer<typeof sliderThumbStepBehaviorSchema>;
export type SliderThumbCrossingSchemaValue = z.infer<typeof sliderThumbCrossingSchema>;
export type SliderMarksSchemaValue = z.infer<typeof sliderMarksSchema>;
export type SliderEdgeMarksSchemaValue = z.infer<typeof sliderEdgeMarksSchema>;
export type SliderMarkPlacementSchemaValue = z.infer<typeof sliderMarkPlacementSchema>;
export type SliderMarkLabelPlacementSchemaValue = z.infer<typeof sliderMarkLabelPlacementSchema>;
export type SliderEdgeLabelPlacementSchemaValue = z.infer<typeof sliderEdgeLabelPlacementSchema>;
export type SliderEdgeLabelAlignmentSchemaValue = z.infer<typeof sliderEdgeLabelAlignmentSchema>;
export type SliderThumbEdgeSchemaValue = z.infer<typeof sliderThumbEdgeSchema>;
export type SliderFillOriginSchemaValue = z.infer<typeof sliderFillOriginSchema>;
export type SliderFillOriginMarkSchemaValue = z.infer<typeof sliderFillOriginMarkSchema>;

export function createSliderOptionsSchema() {
  return z
    .object({
      variant: sliderVariantSchema.optional(),
      valueDisplay: sliderValueDisplaySchema.optional(),
      valueSummaryPlacement: sliderValueSummaryPlacementSchema.optional(),
      valueAnimation: sliderValueAnimationSchema.optional(),
      snapAnimation: sliderSnapAnimationSchema.optional(),
      thumbStepBehavior: sliderThumbStepBehaviorSchema.optional(),
      thumbCrossing: sliderThumbCrossingSchema.optional(),
      marks: sliderMarksSchema.optional(),
      markInterval: z.number().finite().positive().optional(),
      edgeMarks: sliderEdgeMarksSchema.optional(),
      markPlacement: sliderMarkPlacementSchema.optional(),
      markLabelPlacement: sliderMarkLabelPlacementSchema.optional(),
      edgeLabelPlacement: sliderEdgeLabelPlacementSchema.optional(),
      edgeLabelAlignment: sliderEdgeLabelAlignmentSchema.optional(),
      thumbEdge: sliderThumbEdgeSchema.optional(),
      fillOrigin: sliderFillOriginSchema.optional(),
      fillOriginMark: sliderFillOriginMarkSchema.optional()
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
