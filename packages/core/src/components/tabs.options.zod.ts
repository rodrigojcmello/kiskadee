import { z } from 'zod';

export const tabsTypeSchema = z.enum(['line', 'box', 'segmented', 'dot', 'bridge']);
export const tabsIndicatorPositionSchema = z.enum(['top', 'bottom']);
export const tabsIndicatorVariantSchema = z.enum([
  'square',
  'rounded',
  'roundedClip',
  'dot',
  'pill',
  'segmented',
  'bridge'
]);
export const tabsIndicatorWidthModeSchema = z.enum(['tab', 'fixed', 'content']);
export const tabsTabWidthModeSchema = z.enum(['auto', 'fixed', 'distributed']);
export const tabsBridgeLowerCurveModeSchema = z.enum([
  'curved',
  'flush-start',
  'flush-end',
  'flush-both',
  'flush-all'
]);

export type TabsTypeSchemaValue = z.infer<typeof tabsTypeSchema>;

type TabsOptionsSchemaValue = {
  type?: TabsTypeSchemaValue;
  indicatorPosition?: z.infer<typeof tabsIndicatorPositionSchema>;
  indicatorVariant?: z.infer<typeof tabsIndicatorVariantSchema>;
  indicatorWidthMode?: z.infer<typeof tabsIndicatorWidthModeSchema>;
  tabWidthMode?: z.infer<typeof tabsTabWidthModeSchema>;
  separator?: boolean;
  lowerCurveMode?: z.infer<typeof tabsBridgeLowerCurveModeSchema>;
};

function refineTabsOptions(
  value: TabsOptionsSchemaValue,
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

export function createTabsOptionsSchema(expectedType?: TabsTypeSchemaValue) {
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

export const tabsOptionsSchema = createTabsOptionsSchema();

export type TabsOptionsFromSchema = z.input<typeof tabsOptionsSchema>;
