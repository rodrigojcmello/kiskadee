import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type {
  ColorProperty,
  ColorSchema,
  DropdownIntent,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { DropdownIntentKeys } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';
import { validateElementTypographyContract } from '../typography.contract.zod.ts';
import type { ElementTypography } from '../typography.ts';
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

export type DropdownElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';

export type DropdownSurfaceElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle'>;
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
}> &
  ElementNameMetadata;

export type DropdownItemElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
  > & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
}> &
  ElementNameMetadata;

export type DropdownIconElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  iconSize: ElementIconSize;
  scales: ElementScalesByProperty<'paddingRight'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type DropdownTextElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  typography: ElementTypography;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type DropdownIndicatorElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  iconSize: ElementIconSize;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

export type DropdownSeparatorElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<'boxHeight' | 'marginTop' | 'marginBottom'>;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor'>;
}> &
  ElementNameMetadata;

export type DropdownElements<TSegmentName extends SegmentName = never> = {
  e1: DropdownSurfaceElementStyle<TSegmentName>;
  e2: DropdownItemElementStyle<TSegmentName>;
  e3: DropdownIconElementStyle<TSegmentName>;
  e4: DropdownTextElementStyle<TSegmentName>;
  e5: DropdownTextElementStyle<TSegmentName>;
  e6: DropdownIndicatorElementStyle<TSegmentName>;
  e7: DropdownSeparatorElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  iconSize?: boolean;
  typography?: boolean;
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
  radiusModes?: readonly string[];
};

const DROPDOWN_COMPONENT_KEYS = ['effects', 'elements'] as const;
const DROPDOWN_COMPONENT_EFFECT_KEYS = ['shadow'] as const;
const DROPDOWN_SHADOW_ELEMENT_KEYS = ['e1'] as const;
const DROPDOWN_SHADOW_RECIPE_KEYS = ['fixedLevels', 'kind', 'states'] as const;
const DROPDOWN_ELEMENTS_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'] as const;
const DROPDOWN_ELEMENT_BASE_KEYS = [
  'name',
  'decorations',
  'iconSize',
  'typography',
  'scales',
  'palettes'
] as const;
const DROPDOWN_INTENTS = Object.keys(DropdownIntentKeys) as DropdownIntent[];

const DROPDOWN_RULES: Record<(typeof DROPDOWN_ELEMENTS_KEYS)[number], ElementContractRules> = {
  e1: {
    decorations: ['borderStyle'],
    scales: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius'
    ],
    palettes: ['boxColor', 'borderColor'],
    radiusModes: ['rounded', 'pill', 'square']
  },
  e2: {
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius'],
    palettes: ['boxColor'],
    radiusModes: ['rounded', 'pill', 'square']
  },
  e3: {
    iconSize: true,
    scales: ['paddingRight'],
    palettes: ['textColor']
  },
  e4: {
    typography: true,
    palettes: ['textColor']
  },
  e5: {
    typography: true,
    palettes: ['textColor']
  },
  e6: {
    iconSize: true,
    palettes: ['textColor']
  },
  e7: {
    scales: ['boxHeight', 'marginTop', 'marginBottom'],
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

function validateDropdownPaletteVocabulary(
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
            if (!DROPDOWN_INTENTS.includes(intent as DropdownIntent)) {
              issues.push(
                `${path}.${segment}.${theme}.${context}.${colorProperty}.${intent}: unrecognized Dropdown intent`
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
  validateDropdownPaletteVocabulary(value, allowedColorKeys, path, issues);
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

  validateAllowedKeys(value, DROPDOWN_ELEMENT_BASE_KEYS, path, issues);

  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    issues.push(`${path}.name: expected non-empty string`);
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

  if (value.iconSize !== undefined) {
    if (!rules.iconSize) {
      issues.push(`${path}.iconSize: not allowed for this element`);
    } else {
      issues.push(...validateElementIconSizeContract(value.iconSize, `${path}.iconSize`));
    }
  }

  if (value.typography !== undefined) {
    if (!rules.typography) {
      issues.push(`${path}.typography: not allowed for this element`);
    } else {
      issues.push(...validateElementTypographyContract(value.typography, `${path}.typography`));
    }
  }

  if (value.scales !== undefined) {
    if (!rules.scales) {
      issues.push(`${path}.scales: not allowed for this element`);
    } else if (!isRecord(value.scales)) {
      issues.push(`${path}.scales: expected object`);
    } else {
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
    if (!rules.palettes) {
      issues.push(`${path}.palettes: not allowed for this element`);
    } else {
      validatePalettes(value.palettes, rules.palettes, `${path}.palettes`, issues);
    }
  }
}

function validateEffects(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, DROPDOWN_COMPONENT_EFFECT_KEYS, path, issues);
  if (value.shadow === undefined) return;
  if (!isRecord(value.shadow)) {
    issues.push(`${path}.shadow: expected object`);
    return;
  }

  validateAllowedKeys(value.shadow, DROPDOWN_SHADOW_ELEMENT_KEYS, `${path}.shadow`, issues);
  if (!isRecord(value.shadow.e1)) {
    issues.push(`${path}.shadow.e1: expected object`);
    return;
  }

  validateAllowedKeys(value.shadow.e1, DROPDOWN_SHADOW_RECIPE_KEYS, `${path}.shadow.e1`, issues);
  if (value.shadow.e1.kind !== 'outer' && value.shadow.e1.kind !== 'inner') {
    issues.push(`${path}.shadow.e1.kind: expected "outer" or "inner"`);
  }
  if (value.shadow.e1.states !== undefined && !isRecord(value.shadow.e1.states)) {
    issues.push(`${path}.shadow.e1.states: expected object`);
  }
  if (value.shadow.e1.fixedLevels !== undefined && !Array.isArray(value.shadow.e1.fixedLevels)) {
    issues.push(`${path}.shadow.e1.fixedLevels: expected array`);
  }
}

export function validateDropdownComponentContract(
  value: unknown,
  path = 'components.dropdown'
): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) return [`${path}: expected object`];
  validateAllowedKeys(value, DROPDOWN_COMPONENT_KEYS, path, issues);

  if (value.effects !== undefined) {
    validateEffects(value.effects, `${path}.effects`, issues);
  }

  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, DROPDOWN_ELEMENTS_KEYS, `${path}.elements`, issues);
  for (const key of DROPDOWN_ELEMENTS_KEYS) {
    const element = value.elements[key];
    if (element === undefined) {
      issues.push(`${path}.elements.${key}: required element`);
      continue;
    }
    validateElement(element, `${path}.elements.${key}`, DROPDOWN_RULES[key], issues);
  }

  return issues;
}
