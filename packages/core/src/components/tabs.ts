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

/**
 * Tabs elements canonical mapping:
 * - e1: bar
 * - e2: tab
 * - e3: label
 * - e4: icon
 * - e5: indicator
 * - e6: separator
 */
export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type TabsType = 'line' | 'box' | 'dot';
export type TabsIndicatorPosition = 'top' | 'bottom';
export type TabsIndicatorWidthMode = 'tab' | 'fixed' | 'content';
export type TabsTabWidthMode = 'auto' | 'fixed';
export const tabsIndicatorVariantsByType = {
  line: ['square', 'rounded', 'roundedClip'],
  box: ['square', 'rounded', 'pill'],
  dot: ['dot']
} as const;
export type TabsLineIndicatorVariant = (typeof tabsIndicatorVariantsByType.line)[number];
export type TabsBoxIndicatorVariant = (typeof tabsIndicatorVariantsByType.box)[number];
export type TabsDotIndicatorVariant = (typeof tabsIndicatorVariantsByType.dot)[number];
export type TabsIndicatorVariant =
  | TabsLineIndicatorVariant
  | TabsBoxIndicatorVariant
  | TabsDotIndicatorVariant;

export type TabsOptions = Partial<{
  type: TabsType;
  indicatorPosition: TabsIndicatorPosition;
  indicatorVariant: TabsIndicatorVariant;
  indicatorWidthMode: TabsIndicatorWidthMode;
  tabWidthMode: TabsTabWidthMode;
  separator: boolean;
}>;

/**
 * e1 — bar
 * - boxColor
 * - border
 *
 * NOTE:
 * The current schema supports border as a generic border color /width.
 * Side-specific border top/bottom is not yet modeled at schema level.
 */
export type TabsBarElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  decorations: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<
    'borderWidth' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  > & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
  effects: ElementEffects;
}>;

/**
 * e2 — tab
 * - boxColor
 * - boxWidth
 * - padding
 * - borderRadius
 *
 * NOTE:
 * `boxWidth` is only applied when `tabWidthMode` is `fixed`.
 */
export type TabsTriggerElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<
    'boxWidth' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  > & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
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
 * - boxWidth
 * - boxHeight
 * - margins
 * - boxColor
 * - borderRadius
 *
 * NOTE:
 * `boxWidth` is used by line indicators when `indicatorWidthMode` is `fixed`.
 * `content` width is measured from the rendered tab content by the visual component layer.
 * `boxHeight` is the line thickness for `line`, the diameter for `dot`, and the fill height for `box`.
 * `marginTop` / `marginBottom` define the gap between the indicator and the bar edge.
 *
 * `roundedClip` is a structural indicator variant handled by component styles (fixed geometry).
 * `dot` is a dedicated type handled by component styles (fixed circle geometry).
 * `rounded` / `pill` radius values must come from preset artifacts (JSON/CSS classes).
 */
export type TabsIndicatorElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<'boxWidth' | 'boxHeight' | 'marginTop' | 'marginBottom'> & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
  effects: ElementEffects;
}>;

/**
 * e6 — separator (between tabs)
 * - boxWidth
 * - boxHeight
 * - margins
 * - boxColor
 */
export type TabsSeparatorElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string;
  scales: ElementScalesByProperty<
    'boxWidth' | 'boxHeight' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'
  >;
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
  // e6: separator
  e6?: TabsSeparatorElementStyle<TSegmentName>;
};

type TabsLineBarElementStyle<TSegmentName extends SegmentName = never> = Omit<
  TabsBarElementStyle<TSegmentName>,
  'scales'
> & {
  scales?: ElementScalesByProperty<
    'borderWidth' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  >;
};

export type TabsLineElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1'
> & {
  // `line` bars must not define schema border radius.
  e1?: TabsLineBarElementStyle<TSegmentName>;
};

export type TabsTypeConfig<
  TSegmentName extends SegmentName = never,
  TElements extends TabsElements<TSegmentName> = TabsElements<TSegmentName>
> = {
  elements: TElements;
  options?: TabsOptions;
};

export type TabsLineTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName,
  TabsLineElements<TSegmentName>
>;

export type TabsBoxTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName
>;

export type TabsDotTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName
>;

export type TabsTypes<TSegmentName extends SegmentName = never> = Partial<{
  line: TabsLineTypeConfig<TSegmentName>;
  box: TabsBoxTypeConfig<TSegmentName>;
  dot: TabsDotTypeConfig<TSegmentName>;
}>;

type ElementContractRules = {
  decorations?: readonly string[];
  scales?: readonly string[];
  palettes?: readonly string[];
};

type ElementDisallowedRules = Partial<{
  decorations: readonly string[];
  scales: readonly string[];
  palettes: readonly string[];
}>;

const TABS_COMPONENT_KEYS = ['elements', 'options', 'variants'] as const;
const TABS_ELEMENTS_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'] as const;
const TABS_ELEMENT_BASE_KEYS = ['name', 'decorations', 'scales', 'palettes', 'effects'] as const;
const TABS_OPTIONS_KEYS = [
  'type',
  'indicatorPosition',
  'indicatorVariant',
  'indicatorWidthMode',
  'tabWidthMode',
  'separator'
] as const;

const TABS_RULES: Record<(typeof TABS_ELEMENTS_KEYS)[number], ElementContractRules> = {
  e1: {
    decorations: ['borderStyle'],
    scales: [
      'borderWidth',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderRadius'
    ],
    palettes: ['boxColor', 'borderColor']
  },
  e2: {
    scales: ['boxWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius'],
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
    scales: ['boxWidth', 'boxHeight', 'marginTop', 'marginBottom', 'borderRadius'],
    palettes: ['boxColor']
  },
  e6: {
    scales: ['boxWidth', 'boxHeight', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    palettes: ['boxColor']
  }
};

const TABS_TYPE_DISALLOWED_RULES: Partial<
  Record<TabsType, Partial<Record<TabsElementName, ElementDisallowedRules>>>
> = {
  line: {
    e1: {
      scales: ['borderRadius']
    }
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTabsType(value: unknown): value is TabsType {
  return value === 'line' || value === 'box' || value === 'dot';
}

function readTabsType(value: unknown): TabsType | undefined {
  if (!isRecord(value)) return undefined;
  return isTabsType(value.type) ? value.type : undefined;
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

function validateDisallowedKeys(
  target: Record<string, unknown>,
  disallowed: readonly string[],
  path: string,
  tabsType: TabsType,
  issues: string[]
): void {
  for (const key of Object.keys(target)) {
    if (disallowed.includes(key)) {
      issues.push(`${path}.${key}: not allowed for tabs type "${tabsType}"`);
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

function validateTypeSpecificElementRestrictions(
  value: unknown,
  path: string,
  tabsType: TabsType | undefined,
  elementName: TabsElementName,
  issues: string[]
): void {
  if (!tabsType || !isRecord(value)) return;

  const disallowedRules = TABS_TYPE_DISALLOWED_RULES[tabsType]?.[elementName];
  if (!disallowedRules) return;

  if (disallowedRules.decorations && isRecord(value.decorations)) {
    validateDisallowedKeys(
      value.decorations,
      disallowedRules.decorations,
      `${path}.decorations`,
      tabsType,
      issues
    );
  }

  if (disallowedRules.scales && isRecord(value.scales)) {
    validateDisallowedKeys(
      value.scales,
      disallowedRules.scales,
      `${path}.scales`,
      tabsType,
      issues
    );
  }

  if (disallowedRules.palettes && isRecord(value.palettes)) {
    validateDisallowedKeys(
      value.palettes,
      disallowedRules.palettes,
      `${path}.palettes`,
      tabsType,
      issues
    );
  }

  // TODO: Extend type-specific Tabs restrictions to element.effects before merging this feature.
}

function validateTabsOptions(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, TABS_OPTIONS_KEYS, path, issues);

  if (
    value.type !== undefined &&
    value.type !== 'line' &&
    value.type !== 'box' &&
    value.type !== 'dot'
  ) {
    issues.push(`${path}.type: expected "line", "box", or "dot"`);
  }

  if (
    value.indicatorPosition !== undefined &&
    value.indicatorPosition !== 'top' &&
    value.indicatorPosition !== 'bottom'
  ) {
    issues.push(`${path}.indicatorPosition: expected "top" or "bottom"`);
  }

  if (
    value.indicatorVariant !== undefined &&
    value.indicatorVariant !== 'square' &&
    value.indicatorVariant !== 'rounded' &&
    value.indicatorVariant !== 'roundedClip' &&
    value.indicatorVariant !== 'dot' &&
    value.indicatorVariant !== 'pill'
  ) {
    issues.push(
      `${path}.indicatorVariant: expected "square", "rounded", "roundedClip", "dot", or "pill"`
    );
  }

  if (
    value.indicatorWidthMode !== undefined &&
    value.indicatorWidthMode !== 'tab' &&
    value.indicatorWidthMode !== 'fixed' &&
    value.indicatorWidthMode !== 'content'
  ) {
    issues.push(`${path}.indicatorWidthMode: expected "tab", "fixed", or "content"`);
  }

  if (
    value.type === 'line' &&
    (value.indicatorVariant === 'pill' || value.indicatorVariant === 'dot')
  ) {
    issues.push(
      `${path}.indicatorVariant: "line" supports only "square", "rounded", or "roundedClip"`
    );
  }

  if (
    value.type === 'box' &&
    (value.indicatorVariant === 'roundedClip' || value.indicatorVariant === 'dot')
  ) {
    issues.push(`${path}.indicatorVariant: "box" supports only "square", "rounded", or "pill"`);
  }

  if (
    value.type === 'dot' &&
    value.indicatorVariant !== undefined &&
    value.indicatorVariant !== 'dot'
  ) {
    issues.push(`${path}.indicatorVariant: "dot" does not accept alternate variants`);
  }

  if (value.type === 'dot' && value.indicatorWidthMode !== undefined) {
    issues.push(`${path}.indicatorWidthMode: "dot" does not support indicatorWidthMode`);
  }

  if (
    value.tabWidthMode !== undefined &&
    value.tabWidthMode !== 'auto' &&
    value.tabWidthMode !== 'fixed'
  ) {
    issues.push(`${path}.tabWidthMode: expected "auto" or "fixed"`);
  }

  if (value.separator !== undefined && typeof value.separator !== 'boolean') {
    issues.push(`${path}.separator: expected boolean`);
  }
}

export function validateTabsComponentContract(value: unknown, path = 'components.tabs'): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, TABS_COMPONENT_KEYS, path, issues);

  const componentType = readTabsType(value.options);

  const elements = value.elements;
  if (elements !== undefined) {
    if (!isRecord(elements)) {
      issues.push(`${path}.elements: expected object`);
    } else {
      validateAllowedKeys(elements, TABS_ELEMENTS_KEYS, `${path}.elements`, issues);

      for (const key of TABS_ELEMENTS_KEYS) {
        const element = elements[key];
        if (element === undefined) continue;
        validateElementContract(element, `${path}.elements.${key}`, TABS_RULES[key], issues);
        validateTypeSpecificElementRestrictions(
          element,
          `${path}.elements.${key}`,
          componentType,
          key,
          issues
        );
      }
    }
  }

  const variants = value.variants;
  if (variants !== undefined) {
    if (!isRecord(variants)) {
      issues.push(`${path}.variants: expected object`);
    } else {
      for (const [variantName, variant] of Object.entries(variants)) {
        const variantPath = `${path}.variants.${variantName}`;
        if (!isRecord(variant)) {
          issues.push(`${variantPath}: expected object`);
          continue;
        }

        const variantElements = (variant as Record<string, unknown>).elements;
        if (!isRecord(variantElements)) {
          issues.push(`${variantPath}.elements: expected object`);
          continue;
        }

        validateAllowedKeys(variantElements, TABS_ELEMENTS_KEYS, `${variantPath}.elements`, issues);

        const variantOptions = (variant as Record<string, unknown>).options;
        const variantType = isTabsType(variantName) ? variantName : readTabsType(variantOptions);

        for (const key of TABS_ELEMENTS_KEYS) {
          const element = (variantElements as Record<string, unknown>)[key];
          if (element === undefined) continue;
          validateElementContract(
            element,
            `${variantPath}.elements.${key}`,
            TABS_RULES[key],
            issues
          );
          validateTypeSpecificElementRestrictions(
            element,
            `${variantPath}.elements.${key}`,
            variantType,
            key,
            issues
          );
        }

        if (variantOptions !== undefined) {
          validateTabsOptions(variantOptions, `${variantPath}.options`, issues);
        }
      }
    }
  }

  if (elements === undefined && variants === undefined) {
    issues.push(`${path}: expected "elements" or "variants"`);
  }

  if (value.options !== undefined) {
    validateTabsOptions(value.options, `${path}.options`, issues);
  }

  return issues;
}
