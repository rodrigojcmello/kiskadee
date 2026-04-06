import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types';
import type { DecorationSchema } from '../types/decorations/decorations.types';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  createScalesSchemaWithRoundedOnlyBorderRadius,
  elementEffectsSchema
} from './tabs.zod.shared';

export function createTabsEdgeBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema([
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

export function createTabsBoxBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsSegmentedBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'borderWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'borderColor'>(['borderColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsBridgeBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z.union([
    createTabsBoxBarElementStyleSchema<TSegmentName>(),
    createTabsEdgeBarElementStyleSchema<TSegmentName>()
  ]);
}

export function createTabsTriggerElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsSegmentedTriggerElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'boxWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsBridgeTriggerElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'boxWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
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
      scales: createScalesSchema(['textSize', 'textHeight']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsIconElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema([
        'boxWidth',
        'boxHeight',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsIndicatorElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginBottom'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsSegmentedIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginBottom'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsBridgeIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginBottom'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export function createTabsSeparatorElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export type TabsBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBarElementStyleSchema<TSegmentName>>
>;

export type TabsEdgeBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsEdgeBarElementStyleSchema<TSegmentName>>
>;

export type TabsBoxBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBoxBarElementStyleSchema<TSegmentName>>
>;

export type TabsBridgeBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBridgeBarElementStyleSchema<TSegmentName>>
>;

export type TabsSegmentedBarElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedBarElementStyleSchema<TSegmentName>>>;

export type TabsTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsTriggerElementStyleSchema<TSegmentName>>
>;

export type TabsBridgeTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsBridgeTriggerElementStyleSchema<TSegmentName>>>;

export type TabsSegmentedTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedTriggerElementStyleSchema<TSegmentName>>>;

export type TabsLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsLabelElementStyleSchema<TSegmentName>>
>;

export type TabsIconElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIconElementStyleSchema<TSegmentName>>
>;

export type TabsIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIndicatorElementStyleSchema<TSegmentName>>
>;

export type TabsBridgeIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsBridgeIndicatorElementStyleSchema<TSegmentName>>>;

export type TabsSegmentedIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedIndicatorElementStyleSchema<TSegmentName>>>;

export type TabsSeparatorElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsSeparatorElementStyleSchema<TSegmentName>>
>;
