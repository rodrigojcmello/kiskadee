import { z } from 'zod';
import { elementSizeValues } from './breakpoints.ts';
import type { DensityScaleMap } from './density.ts';

export const densityScaleMapSchema = z
  .object({
    compact: z.enum(elementSizeValues).optional(),
    spacious: z.enum(elementSizeValues).optional()
  })
  .strict()
  .refine((value) => value.compact !== undefined || value.spacious !== undefined, {
    message: 'Declare at least one density.'
  })
  .refine((value) => value.compact === 's:md:1' || value.spacious === 's:md:1', {
    message: 'At least one density must reference s:md:1.'
  });

export function parseDensityScaleMap(value: unknown): DensityScaleMap {
  return densityScaleMapSchema.parse(value) as DensityScaleMap;
}
