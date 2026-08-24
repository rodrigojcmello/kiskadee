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
export type BadgeElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type BadgeSurfaceElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  decorations?: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<
    'boxHeight' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > & {
    borderRadius: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type BadgeTextElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  typography: ElementTypography;
  scales?: ElementScalesByProperty<'marginLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type BadgeIconElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  iconSize: ElementIconSize;
  scales?: ElementScalesByProperty<'marginRight'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type BadgeDotElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales: ElementScalesByProperty<'boxHeight' | 'boxWidth'> & {
    borderRadius: { pill: ScaleBySize | number };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type BadgeElements<TSegmentName extends SegmentName = never> = {
  e1: BadgeSurfaceElementStyle<TSegmentName>;
  e2: BadgeTextElementStyle<TSegmentName>;
  e3: BadgeIconElementStyle<TSegmentName>;
  e4: BadgeTextElementStyle<TSegmentName>;
  e5: BadgeDotElementStyle<TSegmentName>;
};

const ELEMENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5'] as const;
const BASE_KEYS = ['name', 'decorations', 'iconSize', 'typography', 'scales', 'palettes'] as const;
const INTENTS = Object.keys(BadgeIntentKeys) as BadgeIntent[];
const EMPHASES: BadgeEmphasis[] = ['high', 'medium', 'low', 'lowest'];

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
    radius: ['rounded', 'pill']
  },
  e2: { scales: ['marginLeft'], colors: ['textColor'] as ColorProperty[], typography: true },
  e3: { scales: ['marginRight'], colors: ['textColor'] as ColorProperty[], iconSize: true },
  e4: { scales: ['marginLeft'], colors: ['textColor'] as ColorProperty[], typography: true },
  e5: {
    scales: ['boxHeight', 'boxWidth', 'borderRadius'],
    colors: ['boxColor', 'borderColor'] as ColorProperty[],
    radius: ['pill']
  }
} as const;

export function validateBadgeComponentContract(
  value: unknown,
  path = 'components.badge'
): string[] {
  const issues: string[] = [];
  if (!isContractRecord(value)) return [`${path}: expected object`];
  validateContractKeys(value, ['elements'], path, issues);
  if (!isContractRecord(value.elements)) return [...issues, `${path}.elements: expected object`];
  validateContractKeys(value.elements, ELEMENT_KEYS, `${path}.elements`, issues);

  for (const elementName of ELEMENT_KEYS) {
    const elementPath = `${path}.elements.${elementName}`;
    const element = value.elements[elementName];
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
    } else if (elementName === 'e1' || elementName === 'e5') {
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
