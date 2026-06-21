import type {
  ColorProperty,
  ColorSchema,
  SegmentName,
  ThemeMode
} from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';

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

type ElementNameMetadata = {
  name: string;
};

export type CardRadiusMode = 'rounded' | 'square';

/**
 * Card elements canonical mapping:
 * - e1: card root/surface/state scope
 */
export type CardElementName = 'e1';

/**
 * e1 — card root/surface/state scope
 */
export type CardSurfaceElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > & {
    borderRadius?: {
      rounded?: ScaleBySize | number;
      square?: ScaleBySize | number;
      pill?: never;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
}> &
  ElementNameMetadata;

export type CardElements<TSegmentName extends SegmentName = never> = {
  e1?: CardSurfaceElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  scales?: readonly string[];
  palettes?: readonly string[];
  radiusModes?: readonly string[];
};

const CARD_COMPONENT_KEYS = ['effects', 'elements'] as const;
const CARD_COMPONENT_EFFECT_KEYS = ['shadow'] as const;
const CARD_SHADOW_ELEMENT_KEYS = ['e1'] as const;
const CARD_SHADOW_RECIPE_KEYS = ['fixedLevels', 'kind', 'states'] as const;
const CARD_ELEMENTS_KEYS = ['e1'] as const;
const CARD_ELEMENT_BASE_KEYS = ['name', 'decorations', 'scales', 'palettes'] as const;

const CARD_RULES: Record<(typeof CARD_ELEMENTS_KEYS)[number], ElementContractRules> = {
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
    radiusModes: ['rounded', 'square']
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
        if (!allowedColorKeys.includes(key)) {
          issues.push(`${colorPath}.${key}: unrecognized key`);
        }
      }
    }
  }
}

function validateRadiusModes(
  value: unknown,
  allowedRadiusModes: readonly string[],
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, allowedRadiusModes, path, issues);
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

  validateAllowedKeys(value, CARD_ELEMENT_BASE_KEYS, path, issues);

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
      if (value.scales.borderRadius !== undefined) {
        validateRadiusModes(
          value.scales.borderRadius,
          rules.radiusModes ?? [],
          `${path}.scales.borderRadius`,
          issues
        );
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

function validateComponentEffects(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, CARD_COMPONENT_EFFECT_KEYS, path, issues);

  if (value.shadow !== undefined) {
    if (!isRecord(value.shadow)) {
      issues.push(`${path}.shadow: expected object`);
      return;
    }

    validateAllowedKeys(value.shadow, CARD_SHADOW_ELEMENT_KEYS, `${path}.shadow`, issues);

    if (!isRecord(value.shadow.e1)) {
      issues.push(`${path}.shadow.e1: expected object`);
      return;
    }

    validateAllowedKeys(value.shadow.e1, CARD_SHADOW_RECIPE_KEYS, `${path}.shadow.e1`, issues);

    if (value.shadow.e1.kind !== 'outer' && value.shadow.e1.kind !== 'inner') {
      issues.push(`${path}.shadow.e1.kind: expected "outer" or "inner"`);
    }

    if (value.shadow.e1.states !== undefined && !isRecord(value.shadow.e1.states)) {
      issues.push(`${path}.shadow.e1.states: expected object`);
    }

    if (
      value.shadow.e1.fixedLevels !== undefined &&
      !Array.isArray(value.shadow.e1.fixedLevels)
    ) {
      issues.push(`${path}.shadow.e1.fixedLevels: expected array`);
    }
  }
}

export function validateCardComponentContract(value: unknown, path = 'components.card'): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, CARD_COMPONENT_KEYS, path, issues);

  if (value.effects !== undefined) {
    validateComponentEffects(value.effects, `${path}.effects`, issues);
  }

  const elements = value.elements;
  if (!isRecord(elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(elements, CARD_ELEMENTS_KEYS, `${path}.elements`, issues);

  for (const key of CARD_ELEMENTS_KEYS) {
    const element = elements[key];
    if (element === undefined) continue;
    validateElementContract(element, `${path}.elements.${key}`, CARD_RULES[key], issues);
  }

  return issues;
}
