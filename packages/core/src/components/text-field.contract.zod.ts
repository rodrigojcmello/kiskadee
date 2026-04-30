import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types';
import { formatZodIssue } from './tabs.zod.shared';
import {
  createTextFieldControlElementStyleSchema,
  createTextFieldIndicatorElementStyleSchema,
  createTextFieldInputElementStyleSchema,
  createTextFieldLabelElementStyleSchema,
  createTextFieldMessageElementStyleSchema,
  createTextFieldRootElementStyleSchema
} from './text-field.elements.zod';
import {
  createTextFieldOptionsSchema,
  type TextFieldModeSchemaValue,
  textFieldOptionsSchema
} from './text-field.options.zod';

function isStandardMode(
  value: TextFieldModeSchemaValue
): value is 'outline' | 'underline' | 'borderless' {
  return value === 'outline' || value === 'underline' || value === 'borderless';
}

function isFloatingMode(value: TextFieldModeSchemaValue): value is 'notched' | 'inside' {
  return value === 'notched' || value === 'inside';
}

function createTextFieldElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTextFieldRootElementStyleSchema().optional(),
      e2: createTextFieldLabelElementStyleSchema<TSegmentName>().optional(),
      e3: createTextFieldControlElementStyleSchema<TSegmentName>().optional(),
      e4: createTextFieldInputElementStyleSchema<TSegmentName>().optional(),
      e5: createTextFieldMessageElementStyleSchema<TSegmentName>().optional(),
      e6: createTextFieldIndicatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTextFieldModeConfigSchema() {
  return z
    .object({
      elements: createTextFieldElementsSchema()
    })
    .strict();
}

function createTextFieldStandardVariantConfigSchema() {
  return z
    .object({
      options: createTextFieldOptionsSchema()
        .superRefine((value, ctx) => {
          if (value.variant !== undefined) {
            ctx.addIssue({
              code: 'custom',
              path: ['variant'],
              message: 'variant must not be repeated inside a variant branch'
            });
          }

          if (value.mode && !isStandardMode(value.mode)) {
            ctx.addIssue({
              code: 'custom',
              path: ['mode'],
              message: `mode "${value.mode}" is not valid for variant "standard"`
            });
          }
        })
        .optional(),
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
      options: createTextFieldOptionsSchema()
        .superRefine((value, ctx) => {
          if (value.variant !== undefined) {
            ctx.addIssue({
              code: 'custom',
              path: ['variant'],
              message: 'variant must not be repeated inside a variant branch'
            });
          }

          if (value.mode && !isFloatingMode(value.mode)) {
            ctx.addIssue({
              code: 'custom',
              path: ['mode'],
              message: `mode "${value.mode}" is not valid for variant "floating"`
            });
          }
        })
        .optional(),
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
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
