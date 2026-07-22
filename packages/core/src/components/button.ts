import type {
  ColorProperty,
  ColorSchema,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ElementEffects } from '../types/effects/index.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

type ElementPalettesByColor<
  TSegmentName extends SegmentName,
  TColorProperty extends ColorProperty
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<Partial<Pick<ColorSchema, TColorProperty>>>>>
  >
>;

type ElementScalesByProperty<TScaleProperty extends StandardScaleProperty> = Partial<
  Record<TScaleProperty, ScaleBySize | number>
>;

type ElementNameMetadata = {
  name: string;
};

/**
 * Button elements canonical mapping:
 * - e1: button container/surface
 * - e2: button label
 * - e3: button icon
 */
export type ButtonElementName = 'e1' | 'e2' | 'e3';

/**
 * e1 — button container/surface
 */
export type ButtonContainerElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle' | 'textAlign'>;
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
  effects: ElementEffects;
}> &
  ElementNameMetadata;

/**
 * e2 — button label
 */
export type ButtonLabelElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'textFont' | 'textWeight' | 'textItalic' | 'textLineType'>;
  scales: ElementScalesByProperty<'textSize' | 'textHeight'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
  effects: ElementEffects;
}> &
  ElementNameMetadata;

/**
 * e3 — button icon
 *
 * NOTE:
 * `iconColor` maps to `textColor` in the current schema model.
 */
export type ButtonIconElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<
    'boxWidth' | 'boxHeight' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  >;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
  effects: ElementEffects;
}> &
  ElementNameMetadata;

export type ButtonElements<TSegmentName extends SegmentName = never> = {
  e1?: ButtonContainerElementStyle<TSegmentName>;
  e2?: ButtonLabelElementStyle<TSegmentName>;
  e3?: ButtonIconElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
};

const BUTTON_COMPONENT_KEYS = ['effects', 'elements'] as const;
const BUTTON_ELEMENTS_KEYS = ['e1', 'e2', 'e3'] as const;
const BUTTON_ELEMENT_BASE_KEYS = ['name', 'decorations', 'scales', 'palettes', 'effects'] as const;

const BUTTON_RULES: Record<(typeof BUTTON_ELEMENTS_KEYS)[number], ElementContractRules> = {
  e1: {
    decorations: ['borderStyle', 'textAlign'],
    scales: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius'
    ],
    palettes: ['boxColor', 'borderColor']
  },
  e2: {
    decorations: ['textFont', 'textWeight', 'textItalic', 'textLineType'],
    scales: ['textSize', 'textHeight'],
    palettes: ['textColor']
  },
  e3: {
    scales: ['boxWidth', 'boxHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['textColor']
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAllowedKeys(
  target: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(target)) {
    if (!allowed.includes(key)) {
      issues.push(`${path}.${key}: unrecognized key`);
    }
  }
}

function validatePalettes(
  value: unknown,
  allowedColorKeys: readonly ColorProperty[],
  path: string,
  issues: string[]
): void {
  for (const issue of getElementPaletteValidationIssues(value, allowedColorKeys)) {
    const issuePath = issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path;
    issues.push(`${issuePath}: ${issue.message}`);
  }
}

function validateElementContract(
  value: unknown,
  path: string,
  rules: ElementContractRules,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, BUTTON_ELEMENT_BASE_KEYS, path, issues);

  if (typeof value.name !== 'string') {
    issues.push(`${path}.name: expected string`);
  }

  if (value.decorations !== undefined) {
    if (!rules.decorations) {
      issues.push(`${path}.decorations: not allowed for this element`);
    } else if (!isRecord(value.decorations)) {
      issues.push(`${path}.decorations: expected object`);
    } else {
      validateAllowedKeys(value.decorations, rules.decorations, `${path}.decorations`, issues);
    }
  }

  if (value.scales !== undefined) {
    if (!rules.scales) {
      issues.push(`${path}.scales: not allowed for this element`);
    } else if (!isRecord(value.scales)) {
      issues.push(`${path}.scales: expected object`);
    } else {
      validateAllowedKeys(value.scales, rules.scales, `${path}.scales`, issues);
    }
  }

  if (value.palettes !== undefined) {
    if (!rules.palettes) {
      issues.push(`${path}.palettes: not allowed for this element`);
    } else {
      validatePalettes(value.palettes, rules.palettes, `${path}.palettes`, issues);
    }
  }
}

export function validateButtonComponentContract(
  value: unknown,
  path = 'components.button'
): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, BUTTON_COMPONENT_KEYS, path, issues);

  const elements = value.elements;
  if (!isRecord(elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(elements, BUTTON_ELEMENTS_KEYS, `${path}.elements`, issues);

  for (const key of BUTTON_ELEMENTS_KEYS) {
    const element = elements[key];
    if (element === undefined) continue;
    validateElementContract(element, `${path}.elements.${key}`, BUTTON_RULES[key], issues);
  }

  return issues;
}
