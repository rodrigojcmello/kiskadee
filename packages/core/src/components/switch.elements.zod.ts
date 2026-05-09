import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  elementEffectsSchema
} from './tabs.zod.shared.ts';

export function createSwitchRootElementStyleSchema() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema([
        'boxWidth',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSwitchInputElementStyleSchema() {
  return z
    .object({
      name: z.string().optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createSwitchTrackElementStyleSchema<TSegmentName extends SegmentName = never>() {
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
        'boxWidth',
        'boxHeight',
        'borderWidth',
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

export function createSwitchThumbElementStyleSchema<TSegmentName extends SegmentName = never>() {
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

export function createSwitchLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
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

export function createSwitchStateElementStyleSchema<TSegmentName extends SegmentName = never>() {
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
        'boxWidth',
        'boxHeight',
        'textSize',
        'textHeight',
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

export type SwitchRootElementStyleFromSchema = z.input<
  ReturnType<typeof createSwitchRootElementStyleSchema>
>;

export type SwitchInputElementStyleFromSchema = z.input<
  ReturnType<typeof createSwitchInputElementStyleSchema>
>;

export type SwitchTrackElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSwitchTrackElementStyleSchema<TSegmentName>>
>;

export type SwitchThumbElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSwitchThumbElementStyleSchema<TSegmentName>>
>;

export type SwitchLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSwitchLabelElementStyleSchema<TSegmentName>>
>;

export type SwitchStateElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSwitchStateElementStyleSchema<TSegmentName>>
>;
