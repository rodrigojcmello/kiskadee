import { z } from 'zod';
import {
  isContourReferenceCandidate,
  resolveContourReference,
  type SchemaContours
} from './contour.ts';

const id = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const color = z
  .string()
  .min(1)
  .refine(
    (value) => !value.startsWith('contour:') && !value.startsWith('fg:'),
    'expected a concrete color'
  );
const state = z.object({ rest: color }).strict();
const emphasis = z
  .object({
    medium: state,
    lowest: state.optional(),
    low: state.optional(),
    high: state.optional(),
    highest: state.optional()
  })
  .strict();
const contexts = z.object({ onSubtle: emphasis, onVivid: emphasis.optional() }).strict();
const themes = z
  .object({ light: contexts.optional(), dark: contexts.optional(), darker: contexts.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'expected a theme');
const profile = z
  .object({
    palettes: z
      .record(z.string().min(1), themes)
      .refine((value) => Object.keys(value).length > 0, 'expected a segment')
  })
  .strict();
export const schemaContoursContractSchema = z
  .object({
    profiles: z
      .record(
        id,
        z.record(id, profile).refine((value) => !!value.standard, 'standard profile required')
      )
      .refine((value) => Object.keys(value).length > 0, 'expected an intent')
  })
  .strict();

/** Validates both the catalog and references in component and separator palettes. */
export function validateSchemaContoursContract(schema: {
  global?: { contours?: unknown; separators?: unknown };
  components?: unknown;
}): void {
  const catalog = schema.global?.contours;
  if (catalog !== undefined) schemaContoursContractSchema.parse(catalog);
  function visit(value: unknown, path: string[], segment = '', channel = ''): void {
    if (isContourReferenceCandidate(value)) {
      if (channel !== 'borderColor' && channel !== 'boxColor')
        throw new Error(`${path.join('.')}: contour references require borderColor or boxColor.`);
      try {
        resolveContourReference(value, segment, catalog as SchemaContours | undefined);
      } catch (error) {
        throw new Error(`${path.join('.')}: ${String(error)}`);
      }
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      const paletteIndex = path.lastIndexOf('palettes');
      visit(
        child,
        [...path, key],
        paletteIndex >= 0 && path.length === paletteIndex + 1 ? key : segment,
        key === 'boxColor' || key === 'borderColor' || key === 'textColor' ? key : channel
      );
    }
  }
  visit(schema.components, ['components']);
  visit(schema.global?.separators, ['global', 'separators']);
}
