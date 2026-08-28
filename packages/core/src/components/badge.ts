import { type ElementSizeValue, elementSizeValues } from '../breakpoints.ts';
import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type {
  BadgeIntent,
  ColorProperty,
  ColorSchema,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { BadgeIntentKeys } from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';
import { validateElementTypographyContract } from '../typography.contract.zod.ts';
import type { ElementTypography } from '../typography.ts';
import {
  isContractRecord,
  validateComponentPalettes,
  validateComponentScales,
  validateContractKeys,
  validateNamedElement
} from './strict-component-contract.ts';

type ElementPalettesByColor<
  TSegmentName extends SegmentName,
  TColorProperty extends ColorProperty
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<Partial<Pick<ColorSchema, TColorProperty>>>>>
  >
>;

type ElementScalesByProperty<T extends StandardScaleProperty> = Partial<
  Record<T, ScaleBySize | number>
>;

export const badgeScales = ['s:sm:3', 's:sm:2', 's:sm:1', 's:md:1', 's:lg:1', 's:lg:2'] as const;
export type BadgeScale = (typeof badgeScales)[number];
export type BadgeEmphasis = 'high' | 'medium' | 'low' | 'lowest';
export type BadgeSeparation = 'none' | 'ring';
export type BadgeMarkPresentation = 'contained' | 'full-bleed';
export type BadgeElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type BadgeShadowElementName = 'e5';

export type BadgeStaticShadowRecipe = {
  kind: 'outer';
  states: {
    rest: ElementSizeValue;
  };
};

export type BadgeEffects = {
  shadow?: Partial<Record<BadgeShadowElementName, BadgeStaticShadowRecipe>>;
};

type BadgeRadiusScales = {
  borderRadius: {
    square?: ScaleBySize | number;
    rounded?: ScaleBySize | number;
    pill?: ScaleBySize | number;
  };
};

export type BadgeSurfaceElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  decorations?: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<
    'boxHeight' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > &
    BadgeRadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type BadgeContentElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  typography: ElementTypography;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type BadgeFullBleedMarkElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  iconSize: ElementIconSize;
  scales: BadgeRadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type BadgeContainedMarkElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  iconSize: ElementIconSize;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type BadgeDotSurfaceElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  decorations?: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<'boxHeight' | 'boxWidth' | 'borderWidth'> & BadgeRadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type BadgeSeparationRingElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  decorations?: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<'borderWidth'> & BadgeRadiusScales;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type BadgeElements<TSegmentName extends SegmentName = never> = {
  e1: BadgeSurfaceElementStyle<TSegmentName>;
  e2: BadgeContentElementStyle<TSegmentName>;
  e3: BadgeFullBleedMarkElementStyle<TSegmentName>;
  e4: BadgeContainedMarkElementStyle<TSegmentName>;
  e5: BadgeDotSurfaceElementStyle<TSegmentName>;
  e6?: BadgeSeparationRingElementStyle<TSegmentName>;
};

const ELEMENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'] as const;
const SHADOW_ELEMENT_KEYS = ['e5'] as const;
const REQUIRED_ELEMENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5'] as const;
const BASE_KEYS = ['name', 'decorations', 'iconSize', 'typography', 'scales', 'palettes'] as const;
const INTENTS = Object.keys(BadgeIntentKeys) as BadgeIntent[];
const EMPHASES: BadgeEmphasis[] = ['high', 'medium', 'low', 'lowest'];

function validateBadgeEffects(value: unknown, path: string, issues: string[]): void {
  if (!isContractRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }
  validateContractKeys(value, ['shadow'], path, issues);
  if (value.shadow === undefined) return;
  if (!isContractRecord(value.shadow)) {
    issues.push(`${path}.shadow: expected object`);
    return;
  }
  validateContractKeys(value.shadow, SHADOW_ELEMENT_KEYS, `${path}.shadow`, issues);

  for (const elementName of SHADOW_ELEMENT_KEYS) {
    const recipe = value.shadow[elementName];
    if (recipe === undefined) continue;
    const recipePath = `${path}.shadow.${elementName}`;
    if (!isContractRecord(recipe)) {
      issues.push(`${recipePath}: expected object`);
      continue;
    }
    validateContractKeys(recipe, ['kind', 'states'], recipePath, issues);
    if (recipe.kind !== 'outer') {
      issues.push(`${recipePath}.kind: expected "outer"`);
    }
    if (!isContractRecord(recipe.states)) {
      issues.push(`${recipePath}.states: expected object`);
      continue;
    }
    validateContractKeys(recipe.states, ['rest'], `${recipePath}.states`, issues);
    if (!elementSizeValues.includes(recipe.states.rest as ElementSizeValue)) {
      issues.push(`${recipePath}.states.rest: expected element size value`);
    }
  }
}

const RULES = {
  e1: {
    scales: [
      'boxHeight',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius'
    ],
    colors: ['boxColor', 'borderColor'] as ColorProperty[],
    radius: ['square', 'rounded', 'pill']
  },
  e2: { scales: [], colors: ['textColor'] as ColorProperty[], typography: true },
  e3: {
    scales: ['borderRadius'],
    colors: ['textColor'] as ColorProperty[],
    iconSize: true,
    radius: ['pill']
  },
  e4: { scales: [], colors: ['textColor'] as ColorProperty[], iconSize: true },
  e5: {
    scales: ['boxHeight', 'boxWidth', 'borderWidth', 'borderRadius'],
    colors: ['boxColor', 'borderColor'] as ColorProperty[],
    radius: ['square', 'rounded', 'pill']
  },
  e6: {
    scales: ['borderWidth', 'borderRadius'],
    colors: ['boxColor', 'borderColor'] as ColorProperty[],
    radius: ['square', 'rounded', 'pill']
  }
} as const;

export function validateBadgeComponentContract(
  value: unknown,
  path = 'components.badge'
): string[] {
  const issues: string[] = [];
  if (!isContractRecord(value)) return [`${path}: expected object`];
  validateContractKeys(value, ['effects', 'elements'], path, issues);
  if (value.effects !== undefined) {
    validateBadgeEffects(value.effects, `${path}.effects`, issues);
  }
  if (!isContractRecord(value.elements)) return [...issues, `${path}.elements: expected object`];
  validateContractKeys(value.elements, ELEMENT_KEYS, `${path}.elements`, issues);

  for (const elementName of REQUIRED_ELEMENT_KEYS) {
    if (value.elements[elementName] === undefined) {
      issues.push(`${path}.elements.${elementName}: expected object`);
    }
  }

  for (const elementName of ELEMENT_KEYS) {
    const elementPath = `${path}.elements.${elementName}`;
    const element = value.elements[elementName];
    if (element === undefined && elementName === 'e6') continue;
    if (!validateNamedElement(element, BASE_KEYS, elementPath, issues)) continue;
    const rule = RULES[elementName];
    if ('iconSize' in rule) {
      issues.push(...validateElementIconSizeContract(element.iconSize, `${elementPath}.iconSize`));
    }
    if ('typography' in rule) {
      issues.push(
        ...validateElementTypographyContract(element.typography, `${elementPath}.typography`)
      );
    }
    if (element.scales !== undefined) {
      validateComponentScales(
        element.scales,
        {
          allowedProperties: rule.scales,
          allowedScales: badgeScales,
          radiusModes: 'radius' in rule ? rule.radius : []
        },
        `${elementPath}.scales`,
        issues
      );
    } else if (
      elementName === 'e1' ||
      elementName === 'e3' ||
      elementName === 'e5' ||
      elementName === 'e6'
    ) {
      issues.push(`${elementPath}.scales: expected object`);
    }
    validateComponentPalettes(
      element.palettes,
      {
        allowedColors: rule.colors,
        allowedIntents: INTENTS,
        allowedEmphases: EMPHASES,
        allowedStates: ['rest']
      },
      `${elementPath}.palettes`,
      issues
    );
  }
  return issues;
}
