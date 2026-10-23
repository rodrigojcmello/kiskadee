import { z } from 'zod';
import {
  type ContentSurfaceContextMap,
  validateContentSurfaceContextMap
} from '../content-surface-context.ts';
import type { SegmentName } from '../types/colors/colors.types.ts';
import { formatZodIssue } from './tabs.zod.shared.ts';
import {
  createTextFieldContentRegionElementStyleSchema,
  createTextFieldControlElementStyleSchema,
  createTextFieldIconElementStyleSchema,
  createTextFieldIndicatorElementStyleSchema,
  createTextFieldInlineLabelElementStyleSchema,
  createTextFieldInputElementStyleSchema,
  createTextFieldLabelElementStyleSchema,
  createTextFieldMessageElementStyleSchema,
  createTextFieldRootElementStyleSchema,
  createTextFieldTextElementStyleSchema
} from './text-field.elements.zod.ts';
import {
  createTextFieldFloatingVariantOptionsSchema,
  createTextFieldModeOptionsSchema,
  createTextFieldStandardVariantOptionsSchema,
  textFieldOptionsSchema
} from './text-field.options.zod.ts';

function createTextFieldElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTextFieldRootElementStyleSchema().optional(),
      e2: createTextFieldLabelElementStyleSchema<TSegmentName>().optional(),
      e3: createTextFieldControlElementStyleSchema<TSegmentName>().optional(),
      e4: createTextFieldInputElementStyleSchema<TSegmentName>().optional(),
      e5: createTextFieldMessageElementStyleSchema<TSegmentName>().optional(),
      e6: createTextFieldIndicatorElementStyleSchema<TSegmentName>().optional(),
      e7: createTextFieldInlineLabelElementStyleSchema<TSegmentName>().optional(),
      e8: createTextFieldContentRegionElementStyleSchema<TSegmentName>().optional(),
      e9: createTextFieldIconElementStyleSchema<TSegmentName>().optional(),
      e10: createTextFieldTextElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTextFieldModeConfigSchema() {
  return z
    .object({
      options: createTextFieldModeOptionsSchema().optional(),
      contentSurfaceContext: z.custom<ContentSurfaceContextMap>().optional(),
      contentRegionSurfaceContext: z.custom<ContentSurfaceContextMap>().optional(),
      elements: createTextFieldElementsSchema()
    })
    .strict();
}

function createTextFieldStandardVariantConfigSchema() {
  return z
    .object({
      options: createTextFieldStandardVariantOptionsSchema().optional(),
      modes: z
        .object({
          outline: createTextFieldModeConfigSchema().optional(),
          underline: createTextFieldModeConfigSchema().optional(),
          borderless: createTextFieldModeConfigSchema().optional()
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
      }
    });
}

function createTextFieldFloatingVariantConfigSchema() {
  return z
    .object({
      options: createTextFieldFloatingVariantOptionsSchema().optional(),
      modes: z
        .object({
          notched: createTextFieldModeConfigSchema().optional(),
          inside: createTextFieldModeConfigSchema().optional()
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
      }
    });
}

function createTextFieldVariantsSchema() {
  return z
    .object({
      standard: createTextFieldStandardVariantConfigSchema().optional(),
      floating: createTextFieldFloatingVariantConfigSchema().optional()
    })
    .strict();
}

const textFieldComponentContractSchema = z
  .object({
    elements: z.unknown().optional(),
    options: textFieldOptionsSchema.optional(),
    variants: createTextFieldVariantsSchema().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.elements !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['elements'],
        message:
          'top-level "elements" is not allowed; use "variants.<variant>.modes.<mode>.elements"'
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

export function validateTextFieldComponentContract(
  value: unknown,
  path = 'components.textField'
): string[] {
  const result = textFieldComponentContractSchema.safeParse(value);
  if (!result.success) return result.error.issues.map((issue) => formatZodIssue(path, issue));
  const issues: string[] = [];
  for (const [variantName, variant] of Object.entries(result.data.variants ?? {})) {
    for (const [modeName, mode] of Object.entries(variant?.modes ?? {})) {
      for (const key of ['contentSurfaceContext', 'contentRegionSurfaceContext'] as const) {
        if (mode?.[key] !== undefined) {
          issues.push(
            ...validateContentSurfaceContextMap(
              mode[key],
              `${path}.variants.${variantName}.modes.${modeName}.${key}`
            )
          );
        }
      }
    }
  }
  return issues;
}
