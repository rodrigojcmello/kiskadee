import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types';
import { formatZodIssue } from './tabs.zod.shared';
import {
  createTextFieldControlElementStyleSchema,
  createTextFieldInputElementStyleSchema,
  createTextFieldLabelElementStyleSchema,
  createTextFieldMessageElementStyleSchema,
  createTextFieldRootElementStyleSchema
} from './text-field.elements.zod';
import {
  textFieldOptionsSchema
} from './text-field.options.zod';

function createTextFieldElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTextFieldRootElementStyleSchema().optional(),
      e2: createTextFieldLabelElementStyleSchema<TSegmentName>().optional(),
      e3: createTextFieldControlElementStyleSchema<TSegmentName>().optional(),
      e4: createTextFieldInputElementStyleSchema<TSegmentName>().optional(),
      e5: createTextFieldMessageElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTextFieldVariantConfigSchema() {
  return z
    .object({
      elements: createTextFieldElementsSchema()
    })
    .strict();
}

function createTextFieldVariantsSchema() {
  return z
    .object({
      stacked: createTextFieldVariantConfigSchema().optional(),
      floating: createTextFieldVariantConfigSchema().optional()
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
        message: 'top-level "elements" is not allowed; use "variants.<name>.elements"'
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
