import { z } from 'zod';

export const tabsVariantSchema = z.enum(['line', 'box', 'segmented', 'dot', 'bridge']);
export const tabsIndicatorPositionSchema = z.enum(['top', 'bottom']);
export const tabsIndicatorShapeSchema = z.enum([
  'square',
  'rounded',
  'roundedClip',
  'dot',
  'pill',
  'segmented',
  'bridge'
]);
export const tabsIndicatorWidthSchema = z.enum(['tab', 'fixed', 'content']);
export const tabsTabWidthSchema = z.enum(['content', 'fixed', 'adaptive', 'distributed']);
export const tabsBridgeLowerCurveSchema = z.enum([
  'curved',
  'flush-start',
  'flush-end',
  'flush-both',
  'flush-all'
]);

export type TabsVariantSchemaValue = z.infer<typeof tabsVariantSchema>;

type TabsOptionsSchemaValue = {
  variant?: TabsVariantSchemaValue;
  indicatorPosition?: z.infer<typeof tabsIndicatorPositionSchema>;
  indicatorShape?: z.infer<typeof tabsIndicatorShapeSchema>;
  indicatorWidth?: z.infer<typeof tabsIndicatorWidthSchema>;
  tabWidth?: z.infer<typeof tabsTabWidthSchema>;
  separator?: boolean;
  lowerCurve?: z.infer<typeof tabsBridgeLowerCurveSchema>;
};

function refineTabsOptions(
  value: TabsOptionsSchemaValue,
  ctx: z.RefinementCtx,
  expectedVariant?: TabsVariantSchemaValue
) {
  if (
    expectedVariant !== undefined &&
    value.variant !== undefined &&
    value.variant !== expectedVariant
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['variant'],
      message: `expected "${expectedVariant}" when used inside variants.${expectedVariant}`
    });
  }

  const resolvedVariant = value.variant ?? expectedVariant;

  if (
    resolvedVariant === 'line' &&
    (value.indicatorShape === 'pill' || value.indicatorShape === 'dot')
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorShape'],
      message: '"line" supports only "square", "rounded", or "roundedClip"'
    });
  }

  if (
    resolvedVariant === 'box' &&
    (value.indicatorShape === 'roundedClip' || value.indicatorShape === 'dot')
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorShape'],
      message: '"box" supports only "square", "rounded", or "pill"'
    });
  }

  if (
    resolvedVariant === 'segmented' &&
    value.indicatorShape !== undefined &&
    value.indicatorShape !== 'segmented'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorShape'],
      message: '"segmented" does not accept alternate shapes'
    });
  }

  if (
    (resolvedVariant === 'box' || resolvedVariant === 'segmented') &&
    value.indicatorPosition !== undefined
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorPosition'],
      message: `"${resolvedVariant}" does not support indicatorPosition`
    });
  }

  if (
    resolvedVariant === 'dot' &&
    value.indicatorShape !== undefined &&
    value.indicatorShape !== 'dot'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorShape'],
      message: '"dot" does not accept alternate shapes'
    });
  }

  if (resolvedVariant === 'dot' && value.indicatorWidth !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidth'],
      message: '"dot" does not support indicatorWidth'
    });
  }

  if (resolvedVariant === 'segmented' && value.indicatorWidth !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidth'],
      message: '"segmented" does not support indicatorWidth'
    });
  }

  if (
    resolvedVariant === 'bridge' &&
    value.indicatorShape !== undefined &&
    value.indicatorShape !== 'bridge'
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorShape'],
      message: '"bridge" does not accept alternate shapes'
    });
  }

  if (resolvedVariant === 'bridge' && value.indicatorPosition !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorPosition'],
      message: '"bridge" does not support indicatorPosition'
    });
  }

  if (resolvedVariant === 'bridge' && value.indicatorWidth !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['indicatorWidth'],
      message: '"bridge" does not support indicatorWidth'
    });
  }

  if (resolvedVariant === 'bridge' && value.separator !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['separator'],
      message: '"bridge" does not support separator'
    });
  }

  if (resolvedVariant !== 'bridge' && value.lowerCurve !== undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['lowerCurve'],
      message: '"lowerCurve" is only supported by "bridge"'
    });
  }
}

export function createTabsOptionsSchema() {
  return z
    .object({
      variant: tabsVariantSchema.optional(),
      indicatorPosition: tabsIndicatorPositionSchema.optional(),
      indicatorShape: tabsIndicatorShapeSchema.optional(),
      indicatorWidth: tabsIndicatorWidthSchema.optional(),
      tabWidth: tabsTabWidthSchema.optional(),
      separator: z.boolean().optional(),
      lowerCurve: tabsBridgeLowerCurveSchema.optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      refineTabsOptions(value, ctx);
    });
}

export function createTabsVariantOptionsSchema(expectedVariant: TabsVariantSchemaValue) {
  return z
    .object({
      indicatorPosition: tabsIndicatorPositionSchema.optional(),
      indicatorShape: tabsIndicatorShapeSchema.optional(),
      indicatorWidth: tabsIndicatorWidthSchema.optional(),
      tabWidth: tabsTabWidthSchema.optional(),
      separator: z.boolean().optional(),
      lowerCurve: tabsBridgeLowerCurveSchema.optional()
    })
    .strict()
    .superRefine((value, ctx) => {
      refineTabsOptions(value, ctx, expectedVariant);
    });
}

export const tabsOptionsSchema = createTabsOptionsSchema();

export type TabsOptionsFromSchema = z.input<typeof tabsOptionsSchema>;
