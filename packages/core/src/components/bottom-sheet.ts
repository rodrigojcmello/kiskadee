import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import { validateElementSeparatorContract } from '../separator.contract.zod.ts';
import type { ElementSeparator } from '../separator.ts';
import type {
  BottomSheetIntent,
  ColorProperty,
  ColorSchema,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { BottomSheetIntentKeys } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';
import { validateElementTypographyContract } from '../typography.contract.zod.ts';
import type { ElementTypography } from '../typography.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

export const bottomSheetInitialHeights = ['content', 'standard', 'maximum'] as const;
export type BottomSheetInitialHeight = (typeof bottomSheetInitialHeights)[number];

export const bottomSheetSwipeBehaviors = ['none', 'dismiss', 'expand-dismiss'] as const;
export type BottomSheetSwipeBehavior = (typeof bottomSheetSwipeBehaviors)[number];

export const bottomSheetPageTransitions = ['none', 'slide'] as const;
export type BottomSheetPageTransition = (typeof bottomSheetPageTransitions)[number];

export const bottomSheetItemLayouts = ['structured', 'centered'] as const;
export type BottomSheetItemLayout = (typeof bottomSheetItemLayouts)[number];

export const bottomSheetCenteredIconVisibilities = ['show', 'hide'] as const;
export type BottomSheetCenteredIcons = (typeof bottomSheetCenteredIconVisibilities)[number];

export type BottomSheetOptions = {
  initialHeight?: BottomSheetInitialHeight;
  swipeBehavior?: BottomSheetSwipeBehavior;
  pageTransition?: BottomSheetPageTransition;
  itemLayout?: BottomSheetItemLayout;
  centeredIcons?: BottomSheetCenteredIcons;
};

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

type RadiusScales = {
  borderRadius?: {
    rounded?: ScaleBySize | number;
    pill?: ScaleBySize | number;
    square?: ScaleBySize | number;
  };
};

export type BottomSheetElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12'
  | 'e13'
  | 'e14'
  | 'e15';

export type BottomSheetScrimElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetSurfaceElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<'borderWidth'> & RadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetHandleElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<'boxWidth' | 'boxHeight' | 'marginTop' | 'marginBottom'> &
    RadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetRegionElementStyle = Partial<{
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
}> &
  ElementNameMetadata;

export type BottomSheetItemElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'marginBottom'
  > &
    RadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetIconElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  iconSize: ElementIconSize;
  scales: ElementScalesByProperty<'paddingRight' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetTextElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  typography: ElementTypography;
  scales: ElementScalesByProperty<'paddingRight' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetGroupLabelElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  typography: ElementTypography;
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type BottomSheetSeparatorElementStyle = {
  name: string;
  separator: ElementSeparator;
};

export type BottomSheetElements<TSegmentName extends SegmentName = never> = {
  /** Modal scrim. */
  e1: BottomSheetScrimElementStyle<TSegmentName>;
  /** Sheet surface. */
  e2: BottomSheetSurfaceElementStyle<TSegmentName>;
  /** Optional swipe handle. */
  e3: BottomSheetHandleElementStyle<TSegmentName>;
  /** Fixed header region. */
  e4: BottomSheetRegionElementStyle;
  /** Current page title. */
  e5: BottomSheetTextElementStyle<TSegmentName>;
  /** Scrollable body region. */
  e6: BottomSheetRegionElementStyle;
  /** Interactive collection item. */
  e7: BottomSheetItemElementStyle<TSegmentName>;
  /** Optional content-provided leading icon. */
  e8: BottomSheetIconElementStyle<TSegmentName>;
  /** Principal item label. */
  e9: BottomSheetTextElementStyle<TSegmentName>;
  /** Optional supporting description. */
  e10: BottomSheetTextElementStyle<TSegmentName>;
  /** Optional trailing icon. */
  e11: BottomSheetIconElementStyle<TSegmentName>;
  /** Explicit separator. */
  e12: BottomSheetSeparatorElementStyle;
  /** Optional end text or shortcut. */
  e13: BottomSheetTextElementStyle<TSegmentName>;
  /** Visual group label. */
  e14: BottomSheetGroupLabelElementStyle<TSegmentName>;
  /** Persistent checkmark track for radio items. */
  e15: BottomSheetIconElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  iconSize?: boolean;
  separator?: boolean;
  typography?: boolean;
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
  radiusModes?: readonly string[];
};

const BOTTOM_SHEET_COMPONENT_KEYS = ['effects', 'options', 'elements'] as const;
const BOTTOM_SHEET_COMPONENT_EFFECT_KEYS = ['shadow'] as const;
const BOTTOM_SHEET_SHADOW_ELEMENT_KEYS = ['e2'] as const;
const BOTTOM_SHEET_SHADOW_RECIPE_KEYS = ['fixedLevels', 'kind', 'states'] as const;
const BOTTOM_SHEET_OPTION_KEYS = [
  'initialHeight',
  'swipeBehavior',
  'pageTransition',
  'itemLayout',
  'centeredIcons'
] as const;
const BOTTOM_SHEET_ELEMENTS_KEYS = [
  'e1',
  'e2',
  'e3',
  'e4',
  'e5',
  'e6',
  'e7',
  'e8',
  'e9',
  'e10',
  'e11',
  'e12',
  'e13',
  'e14',
  'e15'
] as const;
const BOTTOM_SHEET_ELEMENT_BASE_KEYS = [
  'name',
  'decorations',
  'iconSize',
  'separator',
  'typography',
  'scales',
  'palettes'
] as const;
const BOTTOM_SHEET_INTENTS = Object.keys(BottomSheetIntentKeys) as BottomSheetIntent[];

const BOTTOM_SHEET_RULES: Record<
  (typeof BOTTOM_SHEET_ELEMENTS_KEYS)[number],
  ElementContractRules
> = {
  e1: { palettes: ['boxColor'] },
  e2: {
    decorations: ['borderStyle'],
    scales: ['borderWidth', 'borderRadius'],
    palettes: ['boxColor', 'borderColor'],
    radiusModes: ['rounded', 'pill', 'square']
  },
  e3: {
    scales: ['boxWidth', 'boxHeight', 'marginTop', 'marginBottom', 'borderRadius'],
    palettes: ['boxColor'],
    radiusModes: ['rounded', 'pill', 'square']
  },
  e4: { scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] },
  e5: { typography: true, scales: ['paddingRight', 'paddingLeft'], palettes: ['textColor'] },
  e6: { scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] },
  e7: {
    scales: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'marginBottom',
      'borderRadius'
    ],
    palettes: ['boxColor'],
    radiusModes: ['rounded', 'pill', 'square']
  },
  e8: { iconSize: true, scales: ['paddingRight'], palettes: ['textColor'] },
  e9: { typography: true, scales: ['paddingRight', 'paddingLeft'], palettes: ['textColor'] },
  e10: { typography: true, scales: ['paddingRight', 'paddingLeft'], palettes: ['textColor'] },
  e11: { iconSize: true, scales: ['paddingLeft'], palettes: ['textColor'] },
  e12: { separator: true },
  e13: { typography: true, scales: ['paddingRight', 'paddingLeft'], palettes: ['textColor'] },
  e14: {
    typography: true,
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['textColor']
  },
  e15: { iconSize: true, scales: ['paddingRight'], palettes: ['textColor'] }
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
    if (!allowed.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  }
}

function validateBottomSheetPaletteVocabulary(
  value: unknown,
  allowedColorKeys: readonly ColorProperty[],
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) return;

  for (const [segment, byTheme] of Object.entries(value)) {
    if (!isRecord(byTheme)) continue;
    for (const [theme, byContext] of Object.entries(byTheme)) {
      if (!isRecord(byContext)) continue;
      for (const [context, colorMap] of Object.entries(byContext)) {
        if (!isRecord(colorMap)) continue;
        for (const colorProperty of allowedColorKeys) {
          const byIntent = colorMap[colorProperty];
          if (!isRecord(byIntent)) continue;
          for (const [intent, byEmphasis] of Object.entries(byIntent)) {
            if (!BOTTOM_SHEET_INTENTS.includes(intent as BottomSheetIntent)) {
              issues.push(
                `${path}.${segment}.${theme}.${context}.${colorProperty}.${intent}: unrecognized BottomSheet intent`
              );
              continue;
            }
            if (!isRecord(byEmphasis)) continue;
            for (const emphasis of Object.keys(byEmphasis)) {
              if (emphasis !== 'medium') {
                issues.push(
                  `${path}.${segment}.${theme}.${context}.${colorProperty}.${intent}.${emphasis}: expected "medium" emphasis`
                );
              }
            }
          }
        }
      }
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
  validateBottomSheetPaletteVocabulary(value, allowedColorKeys, path, issues);
}

function validateElement(
  value: unknown,
  path: string,
  rules: ElementContractRules,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, BOTTOM_SHEET_ELEMENT_BASE_KEYS, path, issues);
  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    issues.push(`${path}.name: expected non-empty string`);
  }

  if (value.decorations !== undefined) {
    if (!rules.decorations) issues.push(`${path}.decorations: not allowed for this element`);
    else if (!isRecord(value.decorations)) issues.push(`${path}.decorations: expected object`);
    else validateAllowedKeys(value.decorations, rules.decorations, `${path}.decorations`, issues);
  }

  if (value.iconSize !== undefined) {
    if (!rules.iconSize) issues.push(`${path}.iconSize: not allowed for this element`);
    else issues.push(...validateElementIconSizeContract(value.iconSize, `${path}.iconSize`));
  }

  if (value.separator !== undefined) {
    if (!rules.separator) issues.push(`${path}.separator: not allowed for this element`);
    else issues.push(...validateElementSeparatorContract(value.separator, `${path}.separator`));
  } else if (rules.separator) {
    issues.push(`${path}.separator: required reference`);
  }

  if (value.typography !== undefined) {
    if (!rules.typography) issues.push(`${path}.typography: not allowed for this element`);
    else issues.push(...validateElementTypographyContract(value.typography, `${path}.typography`));
  }

  if (value.scales !== undefined) {
    if (!rules.scales) issues.push(`${path}.scales: not allowed for this element`);
    else if (!isRecord(value.scales)) issues.push(`${path}.scales: expected object`);
    else {
      validateAllowedKeys(value.scales, rules.scales, `${path}.scales`, issues);
      if (value.scales.borderRadius !== undefined) {
        if (!isRecord(value.scales.borderRadius)) {
          issues.push(`${path}.scales.borderRadius: expected object`);
        } else {
          validateAllowedKeys(
            value.scales.borderRadius,
            rules.radiusModes ?? [],
            `${path}.scales.borderRadius`,
            issues
          );
        }
      }
    }
  }

  if (value.palettes !== undefined) {
    if (!rules.palettes) issues.push(`${path}.palettes: not allowed for this element`);
    else validatePalettes(value.palettes, rules.palettes, `${path}.palettes`, issues);
  }
}

function validateOptions(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }
  validateAllowedKeys(value, BOTTOM_SHEET_OPTION_KEYS, path, issues);

  const optionContracts = [
    ['initialHeight', bottomSheetInitialHeights],
    ['swipeBehavior', bottomSheetSwipeBehaviors],
    ['pageTransition', bottomSheetPageTransitions],
    ['itemLayout', bottomSheetItemLayouts],
    ['centeredIcons', bottomSheetCenteredIconVisibilities]
  ] as const;
  for (const [key, values] of optionContracts) {
    if (value[key] !== undefined && !values.includes(value[key] as never)) {
      issues.push(`${path}.${key}: unsupported value`);
    }
  }
}

function validateEffects(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, BOTTOM_SHEET_COMPONENT_EFFECT_KEYS, path, issues);
  if (value.shadow === undefined) return;
  if (!isRecord(value.shadow)) {
    issues.push(`${path}.shadow: expected object`);
    return;
  }

  validateAllowedKeys(value.shadow, BOTTOM_SHEET_SHADOW_ELEMENT_KEYS, `${path}.shadow`, issues);
  if (!isRecord(value.shadow.e2)) {
    issues.push(`${path}.shadow.e2: expected object`);
    return;
  }

  validateAllowedKeys(
    value.shadow.e2,
    BOTTOM_SHEET_SHADOW_RECIPE_KEYS,
    `${path}.shadow.e2`,
    issues
  );
  if (value.shadow.e2.kind !== 'outer' && value.shadow.e2.kind !== 'inner') {
    issues.push(`${path}.shadow.e2.kind: expected "outer" or "inner"`);
  }
  if (value.shadow.e2.states !== undefined && !isRecord(value.shadow.e2.states)) {
    issues.push(`${path}.shadow.e2.states: expected object`);
  }
  if (value.shadow.e2.fixedLevels !== undefined && !Array.isArray(value.shadow.e2.fixedLevels)) {
    issues.push(`${path}.shadow.e2.fixedLevels: expected array`);
  }
}

export function validateBottomSheetComponentContract(
  value: unknown,
  path = 'components.bottomSheet'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  validateAllowedKeys(value, BOTTOM_SHEET_COMPONENT_KEYS, path, issues);
  if (value.effects !== undefined) validateEffects(value.effects, `${path}.effects`, issues);
  if (value.options !== undefined) validateOptions(value.options, `${path}.options`, issues);

  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, BOTTOM_SHEET_ELEMENTS_KEYS, `${path}.elements`, issues);
  for (const key of BOTTOM_SHEET_ELEMENTS_KEYS) {
    const element = value.elements[key];
    if (element === undefined) {
      issues.push(`${path}.elements.${key}: required element`);
      continue;
    }
    validateElement(element, `${path}.elements.${key}`, BOTTOM_SHEET_RULES[key], issues);
  }
  return issues;
}
