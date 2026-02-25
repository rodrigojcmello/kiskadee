import type {
  ColorProperty,
  ColorSchema,
  SegmentName,
  ThemeMode
} from '../types/colors/colors.types';
import type { DecorationSchema } from '../types/decorations/decorations.types';
import type { ElementEffects } from '../types/effects';
import type {
  ScaleBySize,
  ScaleSchema,
  StandardScaleProperty
} from '../types/scales/scales.types';

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

/**
 * Tabs elements canonical mapping:
 * - e1: bar
 * - e2: tab
 * - e3: label
 * - e4: icon
 * - e5: indicator
 */
export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';
export type TabsIndicatorPosition = 'top' | 'bottom';

export type TabsOptions = Partial<{
  indicatorPosition: TabsIndicatorPosition;
}>;

/**
 * e1 — bar
 * - boxColor
 * - border
 *
 * NOTE:
 * Current schema supports border as generic border color/width.
 * Side-specific border top/bottom is not yet modeled at schema level.
 */
export type TabsBarElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  decorations: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<'borderWidth'>;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
  effects: ElementEffects;
}>;

/**
 * e2 — tab
 * - boxColor
 * - padding
 */
export type TabsTriggerElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
  effects: ElementEffects;
}>;

/**
 * e3 — label
 * - textColor
 * - textSize
 * - textFamily
 * - textWeight
 * - textLineHeight
 *
 * NOTE:
 * `textLineHeight` maps to `textHeight` in the current schema scale model.
 */
export type TabsLabelElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  decorations: Pick<DecorationSchema, 'textFont' | 'textWeight'>;
  scales: ElementScalesByProperty<'textSize' | 'textHeight'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
  effects: ElementEffects;
}>;

/**
 * e4 — icon
 * - iconSize
 * - iconColor
 * - padding
 *
 * NOTE:
 * `iconColor` maps to `textColor` for now (for currentColor-driven icons).
 * Dedicated icon fill/stroke color channels are not yet modeled at schema level.
 */
export type TabsIconElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<
    'boxWidth' | 'boxHeight' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  >;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
  effects: ElementEffects;
}>;

/**
 * e5 — indicator (line/background/pill)
 * - boxHeight
 * - borderRadius
 * - boxColor
 */
export type TabsIndicatorElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<'boxHeight'> & Pick<ScaleSchema, 'borderRadius'>;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
  effects: ElementEffects;
}>;

export type TabsElements<TSegmentName extends SegmentName = never> = {
  // e1: bar
  e1?: TabsBarElementStyle<TSegmentName>;
  // e2: tab
  e2?: TabsTriggerElementStyle<TSegmentName>;
  // e3: label
  e3?: TabsLabelElementStyle<TSegmentName>;
  // e4: icon
  e4?: TabsIconElementStyle<TSegmentName>;
  // e5: indicator
  e5?: TabsIndicatorElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  scales?: readonly string[];
  palettes?: readonly string[];
};

const TABS_COMPONENT_KEYS = ['elements', 'options'] as const;
const TABS_ELEMENTS_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5'] as const;
const TABS_ELEMENT_BASE_KEYS = ['name', 'decorations', 'scales', 'palettes', 'effects'] as const;
const TABS_OPTIONS_KEYS = ['indicatorPosition'] as const;

const TABS_RULES: Record<(typeof TABS_ELEMENTS_KEYS)[number], ElementContractRules> = {
  e1: {
    decorations: ['borderStyle'],
    scales: ['borderWidth'],
    palettes: ['boxColor', 'borderColor']
  },
  e2: {
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['boxColor']
  },
  e3: {
    decorations: ['textFont', 'textWeight'],
    scales: ['textSize', 'textHeight'],
    palettes: ['textColor']
  },
  e4: {
    scales: ['boxWidth', 'boxHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['textColor']
  },
  e5: {
    scales: ['boxHeight', 'borderRadius'],
    palettes: ['boxColor']
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
  allowedColorKeys: readonly string[],
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  for (const [segment, byTheme] of Object.entries(value)) {
    const themePath = `${path}.${segment}`;
    if (!isRecord(byTheme)) {
      issues.push(`${themePath}: expected object`);
      continue;
    }

    for (const [theme, colorMap] of Object.entries(byTheme)) {
      const colorPath = `${themePath}.${theme}`;
      if (!isRecord(colorMap)) {
        issues.push(`${colorPath}: expected object`);
        continue;
      }
      for (const key of Object.keys(colorMap)) {
        if (key === 'effects') continue;
        if (!allowedColorKeys.includes(key)) {
          issues.push(`${colorPath}.${key}: unrecognized key`);
        }
      }
    }
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

  validateAllowedKeys(value, TABS_ELEMENT_BASE_KEYS, path, issues);

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

function validateTabsOptions(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, TABS_OPTIONS_KEYS, path, issues);

  if (
    value.indicatorPosition !== undefined &&
    value.indicatorPosition !== 'top' &&
    value.indicatorPosition !== 'bottom'
  ) {
    issues.push(`${path}.indicatorPosition: expected "top" or "bottom"`);
  }
}

export function validateTabsComponentContract(value: unknown, path = 'components.tabs'): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, TABS_COMPONENT_KEYS, path, issues);

  const elements = value.elements;
  if (!isRecord(elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(elements, TABS_ELEMENTS_KEYS, `${path}.elements`, issues);

  for (const key of TABS_ELEMENTS_KEYS) {
    const element = elements[key];
    if (element === undefined) continue;
    validateElementContract(element, `${path}.elements.${key}`, TABS_RULES[key], issues);
  }

  if (value.options !== undefined) {
    validateTabsOptions(value.options, `${path}.options`, issues);
  }

  return issues;
}
