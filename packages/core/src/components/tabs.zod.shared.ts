import { z } from 'zod';
import type {
  ColorProperty,
  ColorSchema,
  SegmentName,
  ThemeMode
} from '../types/colors/colors.types';
import type { ElementEffects } from '../types/effects';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types';

export type ElementPalettesByColor<
  TSegmentName extends SegmentName,
  TColorProperty extends ColorProperty
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, Partial<Pick<ColorSchema, TColorProperty>>>>
  >
>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const scaleValueSchema = z.custom<ScaleBySize | number>(
  (value) => typeof value === 'number' || isRecord(value),
  { message: 'expected number or object' }
);

export const borderRadiusScaleSchema = z
  .object({
    rounded: scaleValueSchema.optional(),
    pill: scaleValueSchema.optional(),
    square: scaleValueSchema.optional()
  })
  .strict();

export const roundedOnlyBorderRadiusScaleSchema = z
  .object({
    rounded: scaleValueSchema.optional()
  })
  .strict();

// TODO: Validate Tabs element.effects with type-specific restrictions before merging this feature.
export const elementEffectsSchema = z.custom<ElementEffects>();

export function createScalesSchema<const TKeys extends readonly StandardScaleProperty[]>(keys: TKeys) {
  const shape = Object.fromEntries(keys.map((key) => [key, scaleValueSchema.optional()])) as Record<
    TKeys[number],
    z.ZodOptional<typeof scaleValueSchema>
  >;

  return z.object(shape).strict();
}

export function createScalesSchemaWithBorderRadius<
  const TKeys extends readonly StandardScaleProperty[]
>(keys: TKeys) {
  return createScalesSchema(keys)
    .extend({
      borderRadius: borderRadiusScaleSchema.optional()
    })
    .strict();
}

export function createScalesSchemaWithRoundedOnlyBorderRadius<
  const TKeys extends readonly StandardScaleProperty[]
>(keys: TKeys) {
  return createScalesSchema(keys)
    .extend({
      borderRadius: roundedOnlyBorderRadiusScaleSchema.optional()
    })
    .strict();
}

export function createPalettesSchema<
  TSegmentName extends SegmentName,
  TColorProperty extends ColorProperty
>(allowedColorKeys: readonly TColorProperty[]) {
  return z
    .custom<ElementPalettesByColor<TSegmentName, TColorProperty>>()
    .superRefine((value, ctx) => {
      if (!isRecord(value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'expected object'
        });
        return;
      }

      for (const [segment, byTheme] of Object.entries(value)) {
        if (!isRecord(byTheme)) {
          ctx.addIssue({
            code: 'custom',
            path: [segment],
            message: 'expected object'
          });
          continue;
        }

        for (const [theme, colorMap] of Object.entries(byTheme)) {
          if (!isRecord(colorMap)) {
            ctx.addIssue({
              code: 'custom',
              path: [segment, theme],
              message: 'expected object'
            });
            continue;
          }

          for (const key of Object.keys(colorMap)) {
            if (key === 'effects') continue;
            if (!allowedColorKeys.includes(key as TColorProperty)) {
              ctx.addIssue({
                code: 'custom',
                path: [segment, theme, key],
                message: 'unrecognized key'
              });
            }
          }
        }
      }
    });
}

export function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}
