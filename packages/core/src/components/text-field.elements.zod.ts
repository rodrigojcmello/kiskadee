import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import { elementTypographyContractSchema } from '../typography.contract.zod.ts';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  elementEffectsSchema
} from './tabs.zod.shared.ts';

export function createTextFieldRootElementStyleSchema() {
  return z
    .object({
      name: z.string(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTextFieldLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema([
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

export function createTextFieldInlineLabelElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema([
        'boxWidth',
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
      name: z.string(),
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
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema(['paddingTop']).optional(),
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
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema(['marginTop']).optional(),
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
      name: z.string(),
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

export type TextFieldInlineLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldInlineLabelElementStyleSchema<TSegmentName>>>;

export type TextFieldControlElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldControlElementStyleSchema<TSegmentName>>>;

export type TextFieldInputElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldInputElementStyleSchema<TSegmentName>>>;

export type TextFieldMessageElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldMessageElementStyleSchema<TSegmentName>>>;

export type TextFieldIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldIndicatorElementStyleSchema<TSegmentName>>>;
