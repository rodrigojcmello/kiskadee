import { z } from 'zod';

export const sliderVariantSchema = z.enum(['standard']);
export const sliderStandardModeSchema = z.enum(['base']);
export const sliderModeSchema = sliderStandardModeSchema;
export const sliderValueDisplaySchema = z.enum(['none', 'tooltip', 'summary', 'both']);
export const sliderValueAnimationSchema = z.enum(['none', 'rolling']);
export const sliderSnapMotionSchema = z.enum(['none', 'smooth']);
export const sliderThumbCrossingSchema = z.enum(['prevent', 'swap']);
export const sliderMarksSchema = z.enum(['none', 'step']);
export const sliderEdgeMarksSchema = z.enum(['include', 'exclude']);
export const sliderMarkPlacementSchema = z.enum(['track', 'above', 'below']);
export const sliderMarkLabelPlacementSchema = z.enum(['auto', 'above', 'below']);
export const sliderEdgeMarkLabelPlacementSchema = z.enum(['auto', 'endpoints', 'markLabels']);
export const sliderEdgeMarkLabelAlignmentSchema = z.enum(['auto', 'center', 'inside']);
export const sliderThumbEdgeBehaviorSchema = z.enum(['overflow', 'contain']);
export const sliderActiveTrackOriginSchema = z.union([
  z.enum(['min', 'center']),
  z.number().finite()
]);
export const sliderOriginMarkSchema = z.enum(['none', 'auto']);

export type SliderVariantSchemaValue = z.infer<typeof sliderVariantSchema>;
export type SliderStandardModeSchemaValue = z.infer<typeof sliderStandardModeSchema>;
export type SliderModeSchemaValue = z.infer<typeof sliderModeSchema>;
export type SliderValueDisplaySchemaValue = z.infer<typeof sliderValueDisplaySchema>;
export type SliderValueAnimationSchemaValue = z.infer<typeof sliderValueAnimationSchema>;
export type SliderSnapMotionSchemaValue = z.infer<typeof sliderSnapMotionSchema>;
export type SliderThumbCrossingSchemaValue = z.infer<typeof sliderThumbCrossingSchema>;
export type SliderMarksSchemaValue = z.infer<typeof sliderMarksSchema>;
export type SliderEdgeMarksSchemaValue = z.infer<typeof sliderEdgeMarksSchema>;
export type SliderMarkPlacementSchemaValue = z.infer<typeof sliderMarkPlacementSchema>;
export type SliderMarkLabelPlacementSchemaValue = z.infer<
  typeof sliderMarkLabelPlacementSchema
>;
export type SliderEdgeMarkLabelPlacementSchemaValue = z.infer<
  typeof sliderEdgeMarkLabelPlacementSchema
>;
export type SliderEdgeMarkLabelAlignmentSchemaValue = z.infer<
  typeof sliderEdgeMarkLabelAlignmentSchema
>;
export type SliderThumbEdgeBehaviorSchemaValue = z.infer<typeof sliderThumbEdgeBehaviorSchema>;
export type SliderActiveTrackOriginSchemaValue = z.infer<typeof sliderActiveTrackOriginSchema>;
export type SliderOriginMarkSchemaValue = z.infer<typeof sliderOriginMarkSchema>;

export function createSliderOptionsSchema() {
  return z
    .object({
      variant: sliderVariantSchema.optional(),
      valueDisplay: sliderValueDisplaySchema.optional(),
      valueAnimation: sliderValueAnimationSchema.optional(),
      snapMotion: sliderSnapMotionSchema.optional(),
      thumbCrossing: sliderThumbCrossingSchema.optional(),
      marks: sliderMarksSchema.optional(),
      edgeMarks: sliderEdgeMarksSchema.optional(),
      markPlacement: sliderMarkPlacementSchema.optional(),
      markLabelPlacement: sliderMarkLabelPlacementSchema.optional(),
      edgeMarkLabelPlacement: sliderEdgeMarkLabelPlacementSchema.optional(),
      edgeMarkLabelAlignment: sliderEdgeMarkLabelAlignmentSchema.optional(),
      thumbEdgeBehavior: sliderThumbEdgeBehaviorSchema.optional(),
      activeTrackOrigin: sliderActiveTrackOriginSchema.optional(),
      originMark: sliderOriginMarkSchema.optional()
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
