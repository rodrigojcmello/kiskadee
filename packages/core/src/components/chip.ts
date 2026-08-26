import type { ContentSurfaceContextMap } from '../content-surface-context.ts';
import { validateContentSurfaceContextMap } from '../content-surface-context.ts';
import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type {
  ChipIntent,
  ColorProperty,
  ColorSchema,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { ChipIntentKeys } from '../types/colors/colors.types.ts';
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

export const chipScales = ['s:sm:1', 's:md:1', 's:lg:1'] as const;
export type ChipScale = (typeof chipScales)[number];
export type ChipEmphasis = 'high' | 'medium' | 'low' | 'lowest';
export type ChipElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';

export type ChipContainerElementStyle = {
  name: string;
};

export type ChipPrimaryElementStyle<TSegmentName extends SegmentName = never> = {
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

export type ChipLabelElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales?: ElementScalesByProperty<'paddingRight' | 'paddingLeft'>;
  typography: ElementTypography;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type ChipIconElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  iconSize: ElementIconSize;
  scales?: ElementScalesByProperty<'marginRight'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
};

export type ChipRemoveElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  decorations?: Pick<DecorationSchema, 'borderStyle'>;
  scales: ElementScalesByProperty<
    'marginLeft' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > & {
    borderRadius: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'borderColor'>;
};

export type ChipBadgeRelationElementStyle = {
  name: string;
  scales: ElementScalesByProperty<'marginLeft'>;
};

export type ChipElements<TSegmentName extends SegmentName = never> = {
  e1: ChipContainerElementStyle;
  e2: ChipPrimaryElementStyle<TSegmentName>;
  e3: ChipLabelElementStyle<TSegmentName>;
  e4: ChipIconElementStyle<TSegmentName>;
  e5: ChipRemoveElementStyle<TSegmentName>;
  e6: ChipIconElementStyle<TSegmentName>;
  e7: ChipBadgeRelationElementStyle;
};

export type ChipComponent<TSegmentName extends SegmentName = never> = {
  contentSurfaceContext?: ContentSurfaceContextMap<ChipIntent, TSegmentName>;
  elements: ChipElements<TSegmentName>;
};

const ELEMENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'] as const;
const BASE_KEYS = ['name', 'decorations', 'iconSize', 'typography', 'scales', 'palettes'] as const;
const INTENTS = Object.keys(ChipIntentKeys) as ChipIntent[];
const EMPHASES: ChipEmphasis[] = ['high', 'medium', 'low', 'lowest'];

const RULES = {
  e1: { scales: [] as string[], colors: [] as ColorProperty[] },
  e2: {
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
  e3: {
    scales: ['paddingRight', 'paddingLeft'],
    colors: ['textColor'] as ColorProperty[],
    typography: true
  },
  e4: { scales: ['marginRight'], colors: ['textColor'] as ColorProperty[], iconSize: true },
  e5: {
    scales: [
      'marginLeft',
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
  e6: { scales: ['marginRight'], colors: ['textColor'] as ColorProperty[], iconSize: true },
  e7: { scales: ['marginLeft'], colors: [] as ColorProperty[] }
} as const;

export function validateChipComponentContract(value: unknown, path = 'components.chip'): string[] {
  const issues: string[] = [];
  if (!isContractRecord(value)) return [`${path}: expected object`];
  validateContractKeys(value, ['contentSurfaceContext', 'elements'], path, issues);
  if (value.contentSurfaceContext !== undefined) {
    issues.push(
      ...validateContentSurfaceContextMap(
        value.contentSurfaceContext,
        `${path}.contentSurfaceContext`
      )
    );
  }
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
    if (rule.scales.length > 0 && element.scales !== undefined) {
      validateComponentScales(
        element.scales,
        {
          allowedProperties: rule.scales,
          allowedScales: chipScales,
          radiusModes: 'radius' in rule ? rule.radius : []
        },
        `${elementPath}.scales`,
        issues
      );
    } else if (rule.scales.length === 0 && element.scales !== undefined) {
      issues.push(`${elementPath}.scales: unrecognized key`);
    } else if (
      (elementName === 'e2' || elementName === 'e5' || elementName === 'e7') &&
      element.scales === undefined
    ) {
      issues.push(`${elementPath}.scales: expected object`);
    }
    if (rule.colors.length > 0) {
      validateComponentPalettes(
        element.palettes,
        {
          allowedColors: rule.colors,
          allowedIntents: INTENTS,
          allowedEmphases: EMPHASES,
          allowedStates: ['rest', 'hover', 'pressed', 'focus', 'selected', 'disabled']
        },
        `${elementPath}.palettes`,
        issues
      );
    } else if (element.palettes !== undefined) {
      issues.push(`${elementPath}.palettes: unrecognized key`);
    }
  }
  return issues;
}
