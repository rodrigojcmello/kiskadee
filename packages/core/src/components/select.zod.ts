import { z } from 'zod';
import { densityScaleMapSchema } from '../density.contract.zod.ts';
import { elementSeparatorContractSchema } from '../separator.contract.zod.ts';
import type { SegmentName } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import { elementTypographyContractSchema } from '../typography.contract.zod.ts';
import {
  createPalettesSchema,
  createScalesSchema,
  createScalesSchemaWithBorderRadius,
  formatZodIssue
} from './tabs.zod.shared.ts';

export const selectModeSchema = z.enum(['outline', 'underline', 'borderless']);
export type SelectMode = z.infer<typeof selectModeSchema>;
export type SelectVariant = 'standard';
// Each slot exposes only the styling owned by its current composition.
export function createSelectElementsSchema<TSegmentName extends SegmentName = never>() {
  const name = z.string();
  const typography = elementTypographyContractSchema.optional();
  const decorations = z
    .object({ borderStyle: z.custom<DecorationSchema['borderStyle']>().optional() })
    .strict()
    .optional();
  const text = createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional();
  const paint = createPalettesSchema<
    TSegmentName,
    'boxColor' | 'borderColor' | 'borderBottomColor'
  >(['boxColor', 'borderColor', 'borderBottomColor']).optional();
  const padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const;
  const step = z
    .object({
      name,
      typography,
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'textColor'>([
        'boxColor',
        'textColor'
      ]).optional()
    })
    .strict();
  return z
    .object({
      e1: z.object({ name }).strict().optional(),
      e2: z
        .object({
          name,
          typography,
          scales: createScalesSchema(['marginBottom']).optional(),
          palettes: text
        })
        .strict()
        .optional(),
      e3: z
        .object({
          name,
          decorations,
          scales: createScalesSchemaWithBorderRadius([
            'boxHeight',
            'borderWidth',
            ...padding
          ]).optional(),
          palettes: paint
        })
        .strict()
        .optional(),
      e4: z
        .object({
          name,
          decorations,
          scales: createScalesSchemaWithBorderRadius(['borderWidth', ...padding]).optional(),
          palettes: paint
        })
        .strict()
        .optional(),
      e5: z.object({ name, typography, palettes: text }).strict().optional(),
      e6: z
        .object({
          name,
          scales: createScalesSchema(['boxWidth', 'boxHeight', 'marginLeft']).optional(),
          palettes: text
        })
        .strict()
        .optional(),
      e7: z
        .object({
          name,
          scales: createScalesSchema(['boxHeight']).optional(),
          palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional()
        })
        .strict()
        .optional(),
      e8: step
        .extend({
          scales: createScalesSchemaWithBorderRadius([
            'boxWidth',
            'borderWidth',
            ...padding,
            'marginRight'
          ]).optional()
        })
        .optional(),
      e9: step
        .extend({
          scales: createScalesSchemaWithBorderRadius([
            'boxWidth',
            'borderWidth',
            ...padding,
            'marginLeft'
          ]).optional()
        })
        .optional(),
      e10: z
        .object({
          name,
          typography,
          scales: createScalesSchema(['marginTop']).optional(),
          palettes: text
        })
        .strict()
        .optional(),
      e11: z.object({ name, typography, palettes: text }).strict().optional(),
      e12: selectDividerElementSchema.optional(),
      e13: z
        .object({
          name,
          scales: createScalesSchema(['marginTop', ...padding]).required()
        })
        .strict()
        .optional()
    })
    .strict();
}
export const selectDividerElementSchema = z
  .object({
    name: z.string(),
    separator: elementSeparatorContractSchema,
    scales: createScalesSchema(['boxHeight']).optional()
  })
  .strict();
export type SelectDividerElement = z.input<typeof selectDividerElementSchema>;
export type SelectElements<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createSelectElementsSchema<TSegmentName>>
>;
export type SelectElementName = keyof SelectElements;
export type SelectElement<TSegmentName extends SegmentName = never> = NonNullable<
  SelectElements<TSegmentName>[Exclude<SelectElementName, 'e12'>]
>;
export const selectPresentationOptionsSchema = z
  .object({
    focusIndicator: z.enum(['underline', 'inner', 'outer']).optional(),
    focusRingColorSource: z.enum(['global', 'component']).optional(),
    showDividers: z.boolean().optional()
  })
  .strict();
export type SelectPresentationOptions = z.input<typeof selectPresentationOptionsSchema>;
export const selectOptionsSchema = z
  .object({
    variant: z.literal('standard').optional(),
    mode: selectModeSchema.optional(),
    ...selectPresentationOptionsSchema.shape,
    density: densityScaleMapSchema.optional()
  })
  .strict();
export type SelectOptions = z.input<typeof selectOptionsSchema>;
export type SelectVariants<TSegmentName extends SegmentName = never> = {
  standard: {
    modes: Partial<
      Record<
        SelectMode,
        { elements: SelectElements<TSegmentName>; options?: SelectPresentationOptions }
      >
    >;
  };
};
const mode = z
  .object({
    options: selectPresentationOptionsSchema.optional(),
    elements: createSelectElementsSchema()
  })
  .strict();
export const selectComponentSchema = z
  .object({
    options: selectOptionsSchema.optional(),
    variants: z
      .object({
        standard: z
          .object({
            modes: z
              .object({
                outline: mode.optional(),
                underline: mode.optional(),
                borderless: mode.optional()
              })
              .strict()
          })
          .strict()
      })
      .strict()
  })
  .strict();
export function validateSelectComponentContract(
  value: unknown,
  path = 'components.select'
): string[] {
  const result = selectComponentSchema.safeParse(value);
  return result.success ? [] : result.error.issues.map((issue) => formatZodIssue(path, issue));
}
