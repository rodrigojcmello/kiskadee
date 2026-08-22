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

export function createSwitchRootElementStyleSchema() {
  return z
    .object({
      name: z.string()
    })
    .strict();
}

export function createSwitchTrackElementStyleSchema<TSegmentName extends SegmentName = never>() {
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

export function createSwitchLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
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

export function createSwitchStateElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      typography: elementTypographyContractSchema.optional(),
      scales: createScalesSchema([
        'boxWidth',
        'boxHeight',
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

export function createSwitchIconElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string(),
      iconSize: elementIconSizeContractSchema,
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export type SwitchRootElementStyleFromSchema = z.input<
  ReturnType<typeof createSwitchRootElementStyleSchema>
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

export type SwitchIconElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSwitchIconElementStyleSchema<TSegmentName>>
>;
