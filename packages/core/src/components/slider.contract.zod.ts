import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types.ts';
import {
  createSliderActiveTrackElementStyleSchema,
  createSliderControlRowElementStyleSchema,
  createSliderEndpointElementStyleSchema,
  createSliderEndpointIconElementStyleSchema,
  createSliderEndpointLabelElementStyleSchema,
  createSliderFieldLabelElementStyleSchema,
  createSliderHelperTextElementStyleSchema,
  createSliderMarkElementStyleSchema,
  createSliderMarkLabelElementStyleSchema,
  createSliderRootElementStyleSchema,
  createSliderThumbElementStyleSchema,
  createSliderTrackElementStyleSchema,
  createSliderValueIndicatorElementStyleSchema,
  createSliderValueSummaryElementStyleSchema
} from './slider.elements.zod.ts';
import { createSliderVariantOptionsSchema, sliderOptionsSchema } from './slider.options.zod.ts';
import { formatZodIssue } from './tabs.zod.shared.ts';

function createSliderElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createSliderRootElementStyleSchema().optional(),
      e2: createSliderFieldLabelElementStyleSchema<TSegmentName>().optional(),
      e3: createSliderValueSummaryElementStyleSchema<TSegmentName>().optional(),
      e4: createSliderControlRowElementStyleSchema().optional(),
      e5: createSliderEndpointElementStyleSchema().optional(),
      e6: createSliderEndpointIconElementStyleSchema<TSegmentName>().optional(),
      e7: createSliderEndpointLabelElementStyleSchema<TSegmentName>().optional(),
      e8: createSliderTrackElementStyleSchema<TSegmentName>().optional(),
      e9: createSliderActiveTrackElementStyleSchema<TSegmentName>().optional(),
      e10: createSliderThumbElementStyleSchema<TSegmentName>().optional(),
      e11: createSliderValueIndicatorElementStyleSchema<TSegmentName>().optional(),
      e12: createSliderMarkElementStyleSchema<TSegmentName>().optional(),
      e13: createSliderMarkLabelElementStyleSchema<TSegmentName>().optional(),
      e14: createSliderHelperTextElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createSliderModeConfigSchema() {
  return z
    .object({
      elements: createSliderElementsSchema()
    })
    .strict();
}

function createSliderStandardVariantConfigSchema() {
  return z
    .object({
      options: createSliderVariantOptionsSchema().optional(),
      modes: z
        .object({
          base: createSliderModeConfigSchema().optional()
        })
        .optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.modes === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['modes'],
          message: 'expected "modes"'
        });
        return;
      }

      if (value.modes.base === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['modes', 'base'],
          message: 'expected "base" mode'
        });
      }
    });
}

function createSliderVariantsSchema() {
  return z
    .object({
      standard: createSliderStandardVariantConfigSchema().optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.standard === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['standard'],
          message: 'expected "standard" variant'
        });
      }
    });
}

const sliderComponentContractSchema = z
  .object({
    elements: z.unknown().optional(),
    options: sliderOptionsSchema.optional(),
    variants: createSliderVariantsSchema().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.elements !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['elements'],
        message: 'top-level "elements" is not allowed; use "variants.standard.modes.base.elements"'
      });
    }

    if (value.variants === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'expected "variants"'
      });
    }
  });

export function validateSliderComponentContract(
  value: unknown,
  path = 'components.slider'
): string[] {
  const result = sliderComponentContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
