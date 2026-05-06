import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  elementEffectsSchema
} from './tabs.zod.shared.ts';

export function createTextFieldRootElementStyleSchema() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema(['boxWidth']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTextFieldLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          textFont: z.custom<DecorationSchema['textFont']>().optional(),
          textWeight: z.custom<DecorationSchema['textWeight']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema([
        'textSize',
        'textHeight',
        'marginBottom',
        'marginTop',
        'marginLeft',
        'paddingRight',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTextFieldControlElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxHeight',
        'borderWidth',
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

export function createTextFieldInputElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          textFont: z.custom<DecorationSchema['textFont']>().optional(),
          textWeight: z.custom<DecorationSchema['textWeight']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema(['textSize', 'textHeight', 'paddingTop']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTextFieldMessageElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          textFont: z.custom<DecorationSchema['textFont']>().optional(),
          textWeight: z.custom<DecorationSchema['textWeight']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema(['textSize', 'textHeight', 'marginTop']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTextFieldIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema(['boxHeight']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export type TextFieldRootElementStyleFromSchema = z.input<
  ReturnType<typeof createTextFieldRootElementStyleSchema>
>;

export type TextFieldLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldLabelElementStyleSchema<TSegmentName>>>;

export type TextFieldControlElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldControlElementStyleSchema<TSegmentName>>>;

export type TextFieldInputElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldInputElementStyleSchema<TSegmentName>>>;

export type TextFieldMessageElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldMessageElementStyleSchema<TSegmentName>>>;

export type TextFieldIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldIndicatorElementStyleSchema<TSegmentName>>>;
