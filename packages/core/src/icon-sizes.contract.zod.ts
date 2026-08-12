import { z } from 'zod';
import {
  type ElementAllSizeValue,
  type ElementSizeValue,
  elementSizeValues
} from './breakpoints.ts';
import type {
  ElementIconSize,
  ElementIconSizeValue,
  IconSizeByBreakpoint,
  SchemaIconSizes
} from './icon-sizes.ts';

const iconSizeTokenContractSchema = z.enum(
  elementSizeValues as [ElementSizeValue, ...ElementSizeValue[]]
);
const positiveFiniteNumberSchema = z.number().finite().positive();

export const schemaIconSizesContractSchema = z
  .object({
    's:sm:5': positiveFiniteNumberSchema.optional(),
    's:sm:4': positiveFiniteNumberSchema.optional(),
    's:sm:3': positiveFiniteNumberSchema.optional(),
    's:sm:2': positiveFiniteNumberSchema.optional(),
    's:sm:1': positiveFiniteNumberSchema.optional(),
    's:md:1': positiveFiniteNumberSchema,
    's:lg:1': positiveFiniteNumberSchema.optional(),
    's:lg:2': positiveFiniteNumberSchema.optional(),
    's:lg:3': positiveFiniteNumberSchema.optional(),
    's:lg:4': positiveFiniteNumberSchema.optional(),
    's:lg:5': positiveFiniteNumberSchema.optional()
  })
  .strict() satisfies z.ZodType<SchemaIconSizes>;

export const iconSizeByBreakpointContractSchema = z
  .object({
    'bp:all': iconSizeTokenContractSchema,
    'bp:sm:1': iconSizeTokenContractSchema.optional(),
    'bp:sm:2': iconSizeTokenContractSchema.optional(),
    'bp:sm:3': iconSizeTokenContractSchema.optional(),
    'bp:md:1': iconSizeTokenContractSchema.optional(),
    'bp:md:2': iconSizeTokenContractSchema.optional(),
    'bp:md:3': iconSizeTokenContractSchema.optional(),
    'bp:lg:1': iconSizeTokenContractSchema.optional(),
    'bp:lg:2': iconSizeTokenContractSchema.optional(),
    'bp:lg:3': iconSizeTokenContractSchema.optional(),
    'bp:lg:4': iconSizeTokenContractSchema.optional()
  })
  .strict() satisfies z.ZodType<IconSizeByBreakpoint>;

const elementIconSizeValueContractSchema = z.unknown().superRefine((value, ctx) => {
  const schema =
    typeof value === 'string' ? iconSizeTokenContractSchema : iconSizeByBreakpointContractSchema;
  const result = schema.safeParse(value);
  if (result.success) return;

  for (const issue of result.error.issues) {
    ctx.addIssue({
      code: 'custom',
      path: issue.path,
      message: issue.message
    });
  }
}) as z.ZodType<ElementIconSizeValue>;

const elementIconSizeTokens = ['s:all', ...elementSizeValues] as const satisfies readonly (
  | ElementSizeValue
  | ElementAllSizeValue
)[];
const elementIconSizeShape = Object.fromEntries(
  elementIconSizeTokens.map((size) => [size, elementIconSizeValueContractSchema.optional()])
) as Record<
  ElementSizeValue | ElementAllSizeValue,
  z.ZodOptional<typeof elementIconSizeValueContractSchema>
>;

export const elementIconSizeContractSchema = z
  .object(elementIconSizeShape)
  .strict()
  .superRefine((value, ctx) => {
    const declaredSizes = Object.keys(value).filter(
      (size) => value[size as keyof typeof value] !== undefined
    );
    if (declaredSizes.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'expected at least one size reference' });
    }
    if (value['s:all'] !== undefined && declaredSizes.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['s:all'],
        message: '"s:all" cannot be combined with another size'
      });
    }
  }) as z.ZodType<ElementIconSize>;

function formatZodIssue(path: string, issue: z.core.$ZodIssue): string {
  const issuePath = issue.path.length > 0 ? `${path}.${issue.path.map(String).join('.')}` : path;
  return `${issuePath}: ${issue.message}`;
}

export function validateSchemaIconSizesDefinitionContract(
  value: unknown,
  path = 'global.iconSizes'
): string[] {
  const result = schemaIconSizesContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

export function validateElementIconSizeContract(value: unknown, path = 'iconSize'): string[] {
  const result = elementIconSizeContractSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => formatZodIssue(path, issue));
}

type SchemaIconSizesContractInput = {
  breakpoints?: unknown;
  global?: { iconSizes?: unknown };
  components?: unknown;
};

type IconSizeElementReference = {
  path: string;
  element: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectIconSizeElements(
  value: unknown,
  path: string,
  references: IconSizeElementReference[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectIconSizeElements(item, `${path}.${index}`, references);
    });
    return;
  }
  if (!isRecord(value)) return;

  if (Object.hasOwn(value, 'iconSize')) references.push({ path, element: value });

  for (const [key, child] of Object.entries(value)) {
    if (key === 'iconSize') continue;
    collectIconSizeElements(child, `${path}.${key}`, references);
  }
}

function validateIconSizeReferences(
  value: ElementIconSize,
  path: string,
  iconSizes: Readonly<Record<string, number>>,
  declaredBreakpoints: ReadonlySet<string>,
  issues: string[]
): void {
  for (const [size, assignment] of Object.entries(value)) {
    if (assignment === undefined) continue;

    if (typeof assignment === 'string') {
      if (!Object.hasOwn(iconSizes, assignment)) {
        issues.push(`${path}.${size}: references unknown icon size "${assignment}"`);
      }
      continue;
    }

    for (const [breakpoint, iconSize] of Object.entries(assignment) as [string, string][]) {
      if (!declaredBreakpoints.has(breakpoint)) {
        issues.push(
          `${path}.${size}.${breakpoint}: breakpoint "${breakpoint}" is not declared in schema.breakpoints`
        );
      }
      if (!Object.hasOwn(iconSizes, iconSize)) {
        issues.push(`${path}.${size}.${breakpoint}: references unknown icon size "${iconSize}"`);
      }
    }
  }
}

export function getSchemaIconSizesContractIssues(
  schemaLike: SchemaIconSizesContractInput
): string[] {
  const issues: string[] = [];
  const definition = schemaLike.global?.iconSizes;
  const definitionResult = schemaIconSizesContractSchema.safeParse(definition);

  if (definition !== undefined && !definitionResult.success) {
    issues.push(
      ...definitionResult.error.issues.map((issue) => formatZodIssue('global.iconSizes', issue))
    );
  }

  const references: IconSizeElementReference[] = [];
  collectIconSizeElements(schemaLike.components, 'components', references);
  if (references.length === 0) return issues;

  if (definition === undefined) {
    issues.push('global.iconSizes: required when component elements reference icon sizes');
  }

  const iconSizes = definitionResult.success ? definitionResult.data : {};
  const declaredBreakpoints = new Set(
    isRecord(schemaLike.breakpoints)
      ? Object.entries(schemaLike.breakpoints).flatMap(([breakpoint, value]) =>
          typeof value === 'number' && Number.isFinite(value) ? [breakpoint] : []
        )
      : []
  );

  for (const reference of references) {
    const scales = isRecord(reference.element.scales) ? reference.element.scales : undefined;
    for (const property of ['boxWidth', 'boxHeight'] as const) {
      if (scales && Object.hasOwn(scales, property)) {
        issues.push(
          `${reference.path}.scales.${property}: cannot be authored together with ${reference.path}.iconSize`
        );
      }
    }

    const result = elementIconSizeContractSchema.safeParse(reference.element.iconSize);
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => formatZodIssue(`${reference.path}.iconSize`, issue))
      );
      continue;
    }

    if (definitionResult.success) {
      validateIconSizeReferences(
        result.data,
        `${reference.path}.iconSize`,
        iconSizes,
        declaredBreakpoints,
        issues
      );
    }
  }

  return issues;
}

export function validateSchemaIconSizesContract(schemaLike: SchemaIconSizesContractInput): void {
  const issues = getSchemaIconSizesContractIssues(schemaLike);
  if (issues.length === 0) return;
  throw new Error(`Invalid icon size contract.\n${issues.join('\n')}`);
}
