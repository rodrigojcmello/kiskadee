import { z } from 'zod';
import { elementSizeValues } from './breakpoints.ts';
import type { DensityScaleMap } from './density.ts';

export const densityScaleMapSchema = z
  .object({
    compact: z.enum(elementSizeValues).optional(),
    regular: z.enum(elementSizeValues).optional(),
    spacious: z.enum(elementSizeValues).optional()
  })
  .strict()
  .refine((value) => Object.values(value).some((size) => size !== undefined), {
    message: 'Declare at least one density.'
  })
  .refine(
    (value) =>
      Object.values(value).filter((size) => size !== undefined).length !== 1 ||
      value.regular !== undefined,
    { message: 'A single density must be regular.' }
  )
  .refine((value) => Object.values(value).includes('s:md:1'), {
    message: 'At least one density must reference s:md:1.'
  });

export function parseDensityScaleMap(value: unknown): DensityScaleMap {
  return densityScaleMapSchema.parse(value) as DensityScaleMap;
}
