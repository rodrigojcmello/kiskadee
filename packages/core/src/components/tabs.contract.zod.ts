import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types';
import {
  createTabsBarElementStyleSchema,
  createTabsBoxBarElementStyleSchema,
  createTabsBridgeBarElementStyleSchema,
  createTabsBridgeIndicatorElementStyleSchema,
  createTabsBridgeTriggerElementStyleSchema,
  createTabsEdgeBarElementStyleSchema,
  createTabsIconElementStyleSchema,
  createTabsIndicatorElementStyleSchema,
  createTabsLabelElementStyleSchema,
  createTabsSegmentedBarElementStyleSchema,
  createTabsSegmentedIndicatorElementStyleSchema,
  createTabsSegmentedTriggerElementStyleSchema,
  createTabsSeparatorElementStyleSchema,
  createTabsTriggerElementStyleSchema
} from './tabs.elements.zod';
import {
  createTabsOptionsSchema,
  tabsOptionsSchema,
  type TabsTypeSchemaValue
} from './tabs.options.zod';
import { formatZodIssue } from './tabs.zod.shared';

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

export function validateTabsComponentContract(value: unknown, path = 'components.tabs'): string[] {
  const result = tabsComponentContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
