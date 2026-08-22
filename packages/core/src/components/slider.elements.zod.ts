import { z } from 'zod';
import { elementIconSizeContractSchema } from '../icon-sizes.contract.zod.ts';
import type { SegmentName } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import { elementTypographyContractSchema } from '../typography.contract.zod.ts';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  elementEffectsSchema
} from './tabs.zod.shared.ts';

export function createSliderRootElementStyleSchema() {
  return z
    .object({
      name: z.string()
    })
    .strict();
}

export function createSliderFieldLabelElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema([
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderOptionalIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema(['marginLeft']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderValueSummaryElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderFieldLabelElementStyleSchema<TSegmentName>();
}

export function createSliderControlRowElementStyleSchema() {
  return z
    .object({
      name: z.string(),
      scales: createScalesSchema([
        'boxHeight',
        'marginTop',
        'paddingTop',
        'paddingBottom'
      ]).optional()
    })
    .strict();
}

export function createSliderEndpointElementStyleSchema() {
  return z
    .object({
      name: z.string(),
      scales: createScalesSchema(['marginRight', 'marginLeft', 'paddingLeft']).optional()
    })
    .strict();
}

export function createSliderEndpointIconElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      iconSize: elementIconSizeContractSchema,
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderThumbIconElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderEndpointIconElementStyleSchema<TSegmentName>();
}

export function createSliderEndpointLabelElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderFieldLabelElementStyleSchema<TSegmentName>();
}

export function createSliderTrackElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'boxHeight',
        'borderWidth',
        'marginTop',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor'>([
        'boxColor',
        'borderColor'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderActiveTrackElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderTrackElementStyleSchema<TSegmentName>();
}

export function createSliderThumbElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'boxHeight',
        'borderWidth',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor'>([
        'boxColor',
        'borderColor'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderThumbInnerElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderThumbElementStyleSchema<TSegmentName>();
}

export function createSliderThumbWithIconElementStyleSchema() {
  return z
    .object({
      name: z.string(),
      scales: createScalesSchema(['boxWidth', 'boxHeight']).optional()
    })
    .strict();
}

export function createSliderThumbInnerWithIconElementStyleSchema() {
  return createSliderThumbWithIconElementStyleSchema();
}

export function createSliderValueIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxHeight',
        'borderWidth',
        'marginTop',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor' | 'textColor'>([
        'boxColor',
        'borderColor',
        'textColor'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderMarkElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'boxHeight',
        'borderWidth',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor'>([
        'boxColor',
        'borderColor'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSliderOriginMarkElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderMarkElementStyleSchema<TSegmentName>();
}

export function createSliderMarkLabelElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderFieldLabelElementStyleSchema<TSegmentName>();
}

export function createSliderHelperTextElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return createSliderFieldLabelElementStyleSchema<TSegmentName>();
}

export type SliderRootElementStyleFromSchema = z.input<
  ReturnType<typeof createSliderRootElementStyleSchema>
>;

export type SliderFieldLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderFieldLabelElementStyleSchema<TSegmentName>>>;

export type SliderOptionalIndicatorElementStyleFromSchema<
  TSegmentName extends SegmentName = never
> = z.input<ReturnType<typeof createSliderOptionalIndicatorElementStyleSchema<TSegmentName>>>;

export type SliderValueSummaryElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderValueSummaryElementStyleSchema<TSegmentName>>>;

export type SliderControlRowElementStyleFromSchema = z.input<
  ReturnType<typeof createSliderControlRowElementStyleSchema>
>;

export type SliderEndpointElementStyleFromSchema = z.input<
  ReturnType<typeof createSliderEndpointElementStyleSchema>
>;

export type SliderEndpointIconElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderEndpointIconElementStyleSchema<TSegmentName>>>;

export type SliderThumbIconElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderThumbIconElementStyleSchema<TSegmentName>>>;

export type SliderEndpointLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderEndpointLabelElementStyleSchema<TSegmentName>>>;

export type SliderTrackElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSliderTrackElementStyleSchema<TSegmentName>>
>;

export type SliderActiveTrackElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderActiveTrackElementStyleSchema<TSegmentName>>>;

export type SliderThumbElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSliderThumbElementStyleSchema<TSegmentName>>
>;

export type SliderThumbInnerElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderThumbInnerElementStyleSchema<TSegmentName>>>;

export type SliderThumbWithIconElementStyleFromSchema = z.input<
  ReturnType<typeof createSliderThumbWithIconElementStyleSchema>
>;

export type SliderThumbInnerWithIconElementStyleFromSchema = z.input<
  ReturnType<typeof createSliderThumbInnerWithIconElementStyleSchema>
>;

export type SliderValueIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderValueIndicatorElementStyleSchema<TSegmentName>>>;

export type SliderMarkElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSliderMarkElementStyleSchema<TSegmentName>>
>;

export type SliderOriginMarkElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderOriginMarkElementStyleSchema<TSegmentName>>>;

export type SliderMarkLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderMarkLabelElementStyleSchema<TSegmentName>>>;

export type SliderHelperTextElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createSliderHelperTextElementStyleSchema<TSegmentName>>>;
