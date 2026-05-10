import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types.ts';
import {
  createSwitchLabelElementStyleSchema,
  createSwitchRootElementStyleSchema,
  createSwitchStateElementStyleSchema,
  createSwitchThumbElementStyleSchema,
  createSwitchTrackElementStyleSchema
} from './switch.elements.zod.ts';
import { createSwitchVariantOptionsSchema, switchOptionsSchema } from './switch.options.zod.ts';
import { formatZodIssue } from './tabs.zod.shared.ts';

function createSwitchElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createSwitchRootElementStyleSchema().optional(),
      e2: createSwitchTrackElementStyleSchema<TSegmentName>().optional(),
      e3: createSwitchThumbElementStyleSchema<TSegmentName>().optional(),
      e4: createSwitchLabelElementStyleSchema<TSegmentName>().optional(),
      e5: createSwitchStateElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createSwitchModeConfigSchema() {
  return z
    .object({
      elements: createSwitchElementsSchema()
    })
    .strict();
}

function createSwitchStandardVariantConfigSchema() {
  return z
    .object({
      options: createSwitchVariantOptionsSchema().optional(),
      modes: z
        .object({
          base: createSwitchModeConfigSchema().optional()
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

function createSwitchVariantsSchema() {
  return z
    .object({
      standard: createSwitchStandardVariantConfigSchema().optional()
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

const switchComponentContractSchema = z
  .object({
    elements: z.unknown().optional(),
    options: switchOptionsSchema.optional(),
    variants: createSwitchVariantsSchema().optional()
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

export function validateSwitchComponentContract(
  value: unknown,
  path = 'components.switch'
): string[] {
  const result = switchComponentContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
