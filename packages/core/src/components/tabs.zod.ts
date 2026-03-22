import { z } from 'zod';
import type {
  ColorProperty,
  ColorSchema,
  SegmentName,
  ThemeMode
} from '../types/colors/colors.types';
import type { DecorationSchema } from '../types/decorations/decorations.types';
import type { ElementEffects } from '../types/effects';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types';

type ElementPalettesByColor<
  TSegmentName extends SegmentName,
  TColorProperty extends ColorProperty
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, Partial<Pick<ColorSchema, TColorProperty>>>>
  >
>;

type ElementScalesByProperty<TScaleProperty extends StandardScaleProperty> = Partial<
  Record<TScaleProperty, ScaleBySize | number>
>;

const scaleValueSchema = z.custom<ScaleBySize | number>(
  (value) => typeof value === 'number' || isRecord(value),
  { message: 'expected number or object' }
);

const borderRadiusScaleSchema = z
  .object({
    rounded: scaleValueSchema.optional(),
    pill: scaleValueSchema.optional(),
    square: scaleValueSchema.optional()
  })
  .strict();

// TODO: Validate Tabs element.effects with type-specific restrictions before merging this feature.
const elementEffectsSchema = z.custom<ElementEffects>();

const tabsOptionsSchema = z
  .object({
    type: z.enum(['line', 'box', 'dot']).optional(),
    indicatorPosition: z.enum(['top', 'bottom']).optional(),
    indicatorVariant: z.enum(['square', 'rounded', 'roundedClip', 'dot', 'pill']).optional(),
    indicatorWidthMode: z.enum(['tab', 'fixed', 'content']).optional(),
    tabWidthMode: z.enum(['auto', 'fixed']).optional(),
    separator: z.boolean().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.type === 'line' &&
      (value.indicatorVariant === 'pill' || value.indicatorVariant === 'dot')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['indicatorVariant'],
        message: '"line" supports only "square", "rounded", or "roundedClip"'
      });
    }

    if (
      value.type === 'box' &&
      (value.indicatorVariant === 'roundedClip' || value.indicatorVariant === 'dot')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['indicatorVariant'],
        message: '"box" supports only "square", "rounded", or "pill"'
      });
    }

    if (value.type === 'box' && value.indicatorPosition !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['indicatorPosition'],
        message: '"box" does not support indicatorPosition'
      });
    }

    if (
      value.type === 'dot' &&
      value.indicatorVariant !== undefined &&
      value.indicatorVariant !== 'dot'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['indicatorVariant'],
        message: '"dot" does not accept alternate variants'
      });
    }

    if (value.type === 'dot' && value.indicatorWidthMode !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['indicatorWidthMode'],
        message: '"dot" does not support indicatorWidthMode'
      });
    }
  });

function createScalesSchema<const TKeys extends readonly StandardScaleProperty[]>(keys: TKeys) {
  const shape = Object.fromEntries(keys.map((key) => [key, scaleValueSchema.optional()])) as Record<
    TKeys[number],
    z.ZodOptional<typeof scaleValueSchema>
  >;
  return z.object(shape).strict();
}

function createScalesSchemaWithBorderRadius<const TKeys extends readonly StandardScaleProperty[]>(
  keys: TKeys
) {
  return createScalesSchema(keys)
    .extend({
      borderRadius: borderRadiusScaleSchema.optional()
    })
    .strict();
}

function createPalettesSchema<
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

function createTabsEdgeBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          borderStyle: z.custom<DecorationSchema['borderStyle']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema([
        'borderWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor' | 'borderColor'>([
        'boxColor',
        'borderColor'
      ]).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsBoxBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z.union([
    createTabsBoxBarElementStyleSchema<TSegmentName>(),
    createTabsEdgeBarElementStyleSchema<TSegmentName>()
  ]);
}

function createTabsTriggerElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsLabelElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      decorations: z
        .object({
          textFont: z.custom<DecorationSchema['textFont']>().optional(),
          textWeight: z.custom<DecorationSchema['textWeight']>().optional()
        })
        .strict()
        .optional(),
      scales: createScalesSchema(['textSize', 'textHeight']).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsIconElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema([
        'boxWidth',
        'boxHeight',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'textColor'>(['textColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsIndicatorElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithBorderRadius([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginBottom'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

function createTabsSeparatorElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchema([
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft'
      ]).optional(),
      palettes: createPalettesSchema<TSegmentName, 'boxColor'>(['boxColor']).optional(),
      effects: elementEffectsSchema.optional()
    })
    .strict();
}

export type TabsOptionsFromSchema = z.input<typeof tabsOptionsSchema>;
export type TabsBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBarElementStyleSchema<TSegmentName>>
>;
export type TabsEdgeBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsEdgeBarElementStyleSchema<TSegmentName>>
>;
export type TabsBoxBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBoxBarElementStyleSchema<TSegmentName>>
>;
export type TabsTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsTriggerElementStyleSchema<TSegmentName>>
>;
export type TabsLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsLabelElementStyleSchema<TSegmentName>>
>;
export type TabsIconElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIconElementStyleSchema<TSegmentName>>
>;
export type TabsIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIndicatorElementStyleSchema<TSegmentName>>
>;
export type TabsSeparatorElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsSeparatorElementStyleSchema<TSegmentName>>
>;

function createTabsElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsIndicatorElementStyleSchema<TSegmentName>().optional(),
      e6: createTabsSeparatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTabsLineElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsEdgeBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsIndicatorElementStyleSchema<TSegmentName>().optional(),
      e6: createTabsSeparatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTabsBoxElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsBoxBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsIndicatorElementStyleSchema<TSegmentName>().optional(),
      e6: createTabsSeparatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTabsDotElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsEdgeBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsIndicatorElementStyleSchema<TSegmentName>().optional(),
      e6: createTabsSeparatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTabsTypeConfigSchema(elementsSchema: z.ZodTypeAny) {
  return z
    .object({
      elements: elementsSchema,
      options: tabsOptionsSchema.optional()
    })
    .strict();
}

function createTabsTypesSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      line: createTabsTypeConfigSchema(createTabsLineElementsSchema<TSegmentName>()).optional(),
      box: createTabsTypeConfigSchema(createTabsBoxElementsSchema<TSegmentName>()).optional(),
      dot: createTabsTypeConfigSchema(createTabsDotElementsSchema<TSegmentName>()).optional()
    })
    .strict();
}

const tabsComponentContractSchema = z
  .object({
    elements: createTabsElementsSchema().optional(),
    options: tabsOptionsSchema.optional(),
    variants: createTabsTypesSchema().optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.elements === undefined && value.variants === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'expected "elements" or "variants"'
      });
    }

    const elementsSchema =
      value.options?.type === 'line'
        ? createTabsLineElementsSchema()
        : value.options?.type === 'box'
          ? createTabsBoxElementsSchema()
          : value.options?.type === 'dot'
            ? createTabsDotElementsSchema()
            : undefined;

    if (elementsSchema !== undefined && value.elements !== undefined) {
      const result = elementsSchema.safeParse(value.elements);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: 'custom',
            path: ['elements', ...issue.path],
            message: issue.message
          });
        }
      }
    }
  });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateTabsComponentContract(value: unknown, path = 'components.tabs'): string[] {
  const result = tabsComponentContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
