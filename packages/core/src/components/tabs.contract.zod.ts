import { z } from 'zod';
import type { SegmentName } from '../types/colors/colors.types';
import {
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
  createTabsVariantOptionsSchema,
  type TabsVariantSchemaValue,
  tabsOptionsSchema
} from './tabs.options.zod';
import { formatZodIssue } from './tabs.zod.shared';

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

function createTabsVariantConfigSchema(
  expectedVariant: TabsVariantSchemaValue,
  elementsSchema: z.ZodTypeAny
) {
  return z
    .object({
      elements: elementsSchema,
      options: createTabsVariantOptionsSchema(expectedVariant).optional()
    })
    .strict();
}

function createTabsVariantsSchema<TSegmentName extends SegmentName = never>() {
  return z
    .object({
      line: createTabsVariantConfigSchema(
        'line',
        createTabsLineElementsSchema<TSegmentName>()
      ).optional(),
      box: createTabsVariantConfigSchema(
        'box',
        createTabsBoxElementsSchema<TSegmentName>()
      ).optional(),
      segmented: createTabsVariantConfigSchema(
        'segmented',
        createTabsSegmentedElementsSchema<TSegmentName>()
      ).optional(),
      dot: createTabsVariantConfigSchema(
        'dot',
        createTabsDotElementsSchema<TSegmentName>()
      ).optional(),
      bridge: createTabsVariantConfigSchema(
        'bridge',
        createTabsBridgeElementsSchema<TSegmentName>()
      ).optional()
    })
    .strict();
}

const tabsComponentContractSchema = z
  .object({
    elements: z.unknown().optional(),
    options: tabsOptionsSchema.optional(),
    variants: createTabsVariantsSchema().optional()
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

export function validateTabsComponentContract(value: unknown, path = 'components.tabs'): string[] {
  const result = tabsComponentContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}
