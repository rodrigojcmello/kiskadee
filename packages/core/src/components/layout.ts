import type { BreakpointValue, ElementSizeValue } from '../breakpoints.ts';
import { elementSizeValues } from '../breakpoints.ts';

export type LayoutColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type LayoutResponsiveColumns =
  | LayoutColumnCount
  | Partial<Record<BreakpointValue, LayoutColumnCount>>;

export type LayoutSpacingScale = Record<ElementSizeValue, number>;
export type LayoutFrameSpacingProperty =
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft';
export type LayoutFlowSpacingProperty = 'paddingTop' | 'paddingLeft';

/** e1 owns frame spacing; e2 supplies vertical and horizontal flow spacing. */
export type LayoutComponent = {
  elements: {
    e1: { name: 'frame'; scales: Record<LayoutFrameSpacingProperty, LayoutSpacingScale> };
    e2: { name: 'flow'; scales: Record<LayoutFlowSpacingProperty, LayoutSpacingScale> };
  };
};

const FRAME_PROPERTIES: readonly LayoutFrameSpacingProperty[] = [
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft'
];
const FLOW_PROPERTIES: readonly LayoutFlowSpacingProperty[] = ['paddingTop', 'paddingLeft'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function allowKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  }
}

/** Validate the complete shared spacing ladder without introducing preset values into Core. */
export function validateLayoutComponentContract(
  value: unknown,
  path = 'components.layout'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];
  allowKeys(value, ['elements'], path, issues);
  if (!isRecord(value.elements)) return [...issues, `${path}.elements: expected object`];
  allowKeys(value.elements, ['e1', 'e2'], `${path}.elements`, issues);

  let reference: Record<string, unknown> | undefined;
  for (const [slot, name, properties] of [
    ['e1', 'frame', FRAME_PROPERTIES],
    ['e2', 'flow', FLOW_PROPERTIES]
  ] as const) {
    const elementPath = `${path}.elements.${slot}`;
    const element = value.elements[slot];
    if (!isRecord(element)) {
      issues.push(`${elementPath}: expected object`);
      continue;
    }
    allowKeys(element, ['name', 'scales'], elementPath, issues);
    if (element.name !== name) issues.push(`${elementPath}.name: expected "${name}"`);
    if (!isRecord(element.scales)) {
      issues.push(`${elementPath}.scales: expected object`);
      continue;
    }
    allowKeys(element.scales, properties, `${elementPath}.scales`, issues);
    for (const property of properties) {
      const scalePath = `${elementPath}.scales.${property}`;
      const scale = element.scales[property];
      if (!isRecord(scale)) {
        issues.push(`${scalePath}: expected complete size scale`);
        continue;
      }
      allowKeys(scale, elementSizeValues, scalePath, issues);
      let previous: number | undefined;
      for (const size of elementSizeValues) {
        const spacing = scale[size];
        if (typeof spacing !== 'number' || !Number.isFinite(spacing) || spacing <= 0) {
          issues.push(`${scalePath}.${size}: expected positive finite number`);
          continue;
        }
        if (previous !== undefined && spacing <= previous) {
          issues.push(`${scalePath}.${size}: expected strictly increasing spacing`);
        }
        previous = spacing;
        if (reference && spacing !== reference[size]) {
          issues.push(`${scalePath}.${size}: expected the shared frame/flow spacing value`);
        }
      }
      reference ??= scale;
    }
  }
  return issues;
}
