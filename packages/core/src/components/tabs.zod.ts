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

const roundedOnlyBorderRadiusScaleSchema = z
  .object({
    rounded: scaleValueSchema.optional()
  })
  .strict();

// TODO: Validate Tabs element.effects with type-specific restrictions before merging this feature.
const elementEffectsSchema = z.custom<ElementEffects>();

const tabsTypeSchema = z.enum(['line', 'box', 'segmented', 'dot', 'bridge']);
const tabsIndicatorPositionSchema = z.enum(['top', 'bottom']);
const tabsIndicatorVariantSchema = z.enum([
  'square',
  'rounded',
  'roundedClip',
  'dot',
  'pill',
  'segmented',
  'bridge'
]);
const tabsIndicatorWidthModeSchema = z.enum(['tab', 'fixed', 'content']);
const tabsTabWidthModeSchema = z.enum(['auto', 'fixed', 'distributed']);
const tabsBridgeLowerCurveModeSchema = z.enum([
  'curved',
  'flush-start',
  'flush-end',
  'flush-both',
  'flush-all'
]);

type TabsTypeSchemaValue = z.infer<typeof tabsTypeSchema>;

function refineTabsOptions(
  value: {
    type?: TabsTypeSchemaValue;
    indicatorPosition?: z.infer<typeof tabsIndicatorPositionSchema>;
    indicatorVariant?: z.infer<typeof tabsIndicatorVariantSchema>;
    indicatorWidthMode?: z.infer<typeof tabsIndicatorWidthModeSchema>;
    tabWidthMode?: z.infer<typeof tabsTabWidthModeSchema>;
    separator?: boolean;
    lowerCurveMode?: z.infer<typeof tabsBridgeLowerCurveModeSchema>;
  },
  ctx: z.RefinementCtx,
  expectedType?: TabsTypeSchemaValue
) {
  if (expectedType !== undefined && value.type !== undefined && value.type !== expectedType) {
    ctx.addIssue({
      code: 'custom',
      path: ['type'],
      message: `expected "${expectedType}" when used inside variants.${expectedType}`
    });
  }

  const resolvedType = value.type ?? expectedType;

  if (
    resolvedType === 'line' &&
    (value.indicatorVariant === 'pill' || value.indicatorVariant === 'dot')
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorVariant'],
      message: '"line" supports only "square", "rounded", or "roundedClip"'
    });
  }

  if (
    resolvedType === 'box' &&
    (value.indicatorVariant === 'roundedClip' || value.indicatorVariant === 'dot')
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorVariant'],
      message: '"box" supports only "square", "rounded", or "pill"'
    });
  }

  if (
    resolvedType === 'segmented' &&
    value.indicatorVariant !== undefined &&
    value.indicatorVariant !== 'segmented'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorVariant'],
      message: '"segmented" does not accept alternate variants'
    });
  }

  if (
    (resolvedType === 'box' || resolvedType === 'segmented') &&
    value.indicatorPosition !== undefined
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorPosition'],
      message: `"${resolvedType}" does not support indicatorPosition`
    });
  }

  if (
    resolvedType === 'dot' &&
    value.indicatorVariant !== undefined &&
    value.indicatorVariant !== 'dot'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorVariant'],
      message: '"dot" does not accept alternate variants'
    });
  }

  if (resolvedType === 'dot' && value.indicatorWidthMode !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidthMode'],
      message: '"dot" does not support indicatorWidthMode'
    });
  }

  if (resolvedType === 'segmented' && value.indicatorWidthMode !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidthMode'],
      message: '"segmented" does not support indicatorWidthMode'
    });
  }

  if (
    resolvedType === 'bridge' &&
    value.indicatorVariant !== undefined &&
    value.indicatorVariant !== 'bridge'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorVariant'],
      message: '"bridge" does not accept alternate variants'
    });
  }

  if (resolvedType === 'bridge' && value.indicatorPosition !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorPosition'],
      message: '"bridge" does not support indicatorPosition'
    });
  }

  if (resolvedType === 'bridge' && value.indicatorWidthMode !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidthMode'],
      message: '"bridge" does not support indicatorWidthMode'
    });
  }

  if (resolvedType === 'bridge' && value.separator !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['separator'],
      message: '"bridge" does not support separator'
    });
  }

  if (resolvedType !== 'bridge' && value.lowerCurveMode !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['lowerCurveMode'],
      message: '"lowerCurveMode" is only supported by "bridge"'
    });
  }
}

function createTabsOptionsSchema(expectedType?: TabsTypeSchemaValue) {
  return z
    .object({
      type: tabsTypeSchema.optional(),
      indicatorPosition: tabsIndicatorPositionSchema.optional(),
      indicatorVariant: tabsIndicatorVariantSchema.optional(),
      indicatorWidthMode: tabsIndicatorWidthModeSchema.optional(),
      tabWidthMode: tabsTabWidthModeSchema.optional(),
      separator: z.boolean().optional(),
      lowerCurveMode: tabsBridgeLowerCurveModeSchema.optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      refineTabsOptions(value, ctx, expectedType);
    });
}

const tabsOptionsSchema = createTabsOptionsSchema();

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

function createScalesSchemaWithRoundedOnlyBorderRadius<
  const TKeys extends readonly StandardScaleProperty[]
>(keys: TKeys) {
  return createScalesSchema(keys)
    .extend({
      borderRadius: roundedOnlyBorderRadiusScaleSchema.optional()
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

function createTabsSegmentedBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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

function createTabsBridgeBarElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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

function createTabsSegmentedTriggerElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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

function createTabsBridgeTriggerElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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

function createTabsSegmentedIndicatorElementStyleSchema<
  TSegmentName extends SegmentName = never
>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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

function createTabsBridgeIndicatorElementStyleSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      name: z.string().optional(),
      scales: createScalesSchemaWithRoundedOnlyBorderRadius([
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
export type TabsBridgeBarElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsBridgeBarElementStyleSchema<TSegmentName>>
>;
export type TabsSegmentedBarElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedBarElementStyleSchema<TSegmentName>>>;
export type TabsTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsTriggerElementStyleSchema<TSegmentName>>
>;
export type TabsBridgeTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsBridgeTriggerElementStyleSchema<TSegmentName>>>;
export type TabsSegmentedTriggerElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedTriggerElementStyleSchema<TSegmentName>>>;
export type TabsLabelElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsLabelElementStyleSchema<TSegmentName>>
>;
export type TabsIconElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIconElementStyleSchema<TSegmentName>>
>;
export type TabsIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> = z.input<
  ReturnType<typeof createTabsIndicatorElementStyleSchema<TSegmentName>>
>;
export type TabsBridgeIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsBridgeIndicatorElementStyleSchema<TSegmentName>>>;
export type TabsSegmentedIndicatorElementStyleFromSchema<TSegmentName extends SegmentName = never> =
  z.input<ReturnType<typeof createTabsSegmentedIndicatorElementStyleSchema<TSegmentName>>>;
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

function createTabsSegmentedElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsSegmentedBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsSegmentedTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsSegmentedIndicatorElementStyleSchema<TSegmentName>().optional(),
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

function createTabsBridgeElementsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      e1: createTabsBridgeBarElementStyleSchema<TSegmentName>().optional(),
      e2: createTabsBridgeTriggerElementStyleSchema<TSegmentName>().optional(),
      e3: createTabsLabelElementStyleSchema<TSegmentName>().optional(),
      e4: createTabsIconElementStyleSchema<TSegmentName>().optional(),
      e5: createTabsBridgeIndicatorElementStyleSchema<TSegmentName>().optional()
    })
    .strict();
}

function createTabsVariantTypeConfigSchema(
  expectedType: TabsTypeSchemaValue,
  elementsSchema: z.ZodTypeAny
) {
  return z
    .object({
      elements: elementsSchema,
      options: createTabsOptionsSchema(expectedType).optional()
    })
    .strict();
}

function createTabsTypesSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      line: createTabsVariantTypeConfigSchema(
        'line',
        createTabsLineElementsSchema<TSegmentName>()
      ).optional(),
      box: createTabsVariantTypeConfigSchema(
        'box',
        createTabsBoxElementsSchema<TSegmentName>()
      ).optional(),
      segmented: createTabsVariantTypeConfigSchema(
        'segmented',
        createTabsSegmentedElementsSchema<TSegmentName>()
      ).optional(),
      dot: createTabsVariantTypeConfigSchema(
        'dot',
        createTabsDotElementsSchema<TSegmentName>()
      ).optional(),
      bridge: createTabsVariantTypeConfigSchema(
        'bridge',
        createTabsBridgeElementsSchema<TSegmentName>()
      ).optional()
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
          : value.options?.type === 'segmented'
            ? createTabsSegmentedElementsSchema()
            : value.options?.type === 'dot'
              ? createTabsDotElementsSchema()
              : value.options?.type === 'bridge'
                ? createTabsBridgeElementsSchema()
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
