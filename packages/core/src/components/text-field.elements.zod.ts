import { z } from 'zod';
import { elementIconSizeContractSchema } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
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
      palettes: createPalettesSchema<
        TSegmentName,
        'boxColor' | 'borderColor' | 'borderBottomColor' | 'textColor'
      >(['boxColor', 'borderColor', 'borderBottomColor', 'textColor']).optional(),
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

export function createTextFieldContentRegionElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string(),
      scales: createScalesSchema(['paddingLeft', 'marginRight', 'borderWidth']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor'>([
        'boxColor',
        'borderColor'
      ]).optional()
    })
    .strict();
}

export function createTextFieldIconElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      iconSize: elementIconSizeContractSchema as z.ZodType<ElementIconSize, ElementIconSize>,
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional()
    })
    .strict();
}

export function createTextFieldTextElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional()
    })
    .strict();
}

export type TextFieldContentRegionElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTextFieldContentRegionElementStyleSchema<TSegmentName>>>;
export type TextFieldIconElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTextFieldIconElementStyleSchema<TSegmentName>>
>;
export type TextFieldTextElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTextFieldTextElementStyleSchema<TSegmentName>>
>;

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
