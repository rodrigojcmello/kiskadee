import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
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

export type ButtonIconLayout = 'inline' | 'edge';
export type ButtonIconPlacement = 'leading' | 'trailing';
export type ButtonIconSurfaceCorners = 'edge' | 'all';
export type ButtonIconTreatment = 'plain' | 'surface';

export type ButtonOptions = {
  /**
   * Controls whether icon and label form one centered group or occupy
   * independent edge/center tracks.
   */
  iconLayout?: ButtonIconLayout;
  /** Logical icon side. Leading/trailing follow the document direction. */
  iconPlacement?: ButtonIconPlacement;
  /** Visual treatment applied to the icon region. */
  iconTreatment?: ButtonIconTreatment;
  /** Corner policy applied to a surfaced icon region. */
  iconSurfaceCorners?: ButtonIconSurfaceCorners;
};

/**
 * Button elements canonical mapping:
 * - e1: button container/surface
 * - e2: button label
 * - e3: button icon
 * - e4: optional icon region/surface
 * - e5: optional trailing disclosure indicator
 */
export type ButtonElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

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
  decorations: Pick<DecorationSchema, 'textItalic' | 'textLineType'>;
  typography: ElementTypography;
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
  iconSize: ElementIconSize;
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
  effects: ElementEffects;
}> &
  ElementNameMetadata;

/**
 * e4 — optional icon region/surface
 */
export type ButtonIconRegionElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'boxColor' | 'textColor'>;
}> &
  ElementNameMetadata;

/**
 * e5 — optional trailing disclosure indicator
 */
export type ButtonDisclosureElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle'>;
  iconSize: ElementIconSize;
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  >;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor' | 'borderColor'>;
}> &
  ElementNameMetadata;

export type ButtonElements<TSegmentName extends SegmentName = never> = {
  e1?: ButtonContainerElementStyle<TSegmentName>;
  e2?: ButtonLabelElementStyle<TSegmentName>;
  e3?: ButtonIconElementStyle<TSegmentName>;
  e4?: ButtonIconRegionElementStyle<TSegmentName>;
  e5?: ButtonDisclosureElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  iconSize?: boolean;
  typography?: boolean;
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
};

const BUTTON_COMPONENT_KEYS = ['effects', 'elements', 'options'] as const;
const BUTTON_OPTION_KEYS = [
  'iconLayout',
  'iconPlacement',
  'iconTreatment',
  'iconSurfaceCorners'
] as const;
const BUTTON_ELEMENTS_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5'] as const;
const BUTTON_ELEMENT_BASE_KEYS = [
  'name',
  'decorations',
  'iconSize',
  'typography',
  'scales',
  'palettes',
  'effects'
] as const;

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
    decorations: ['textItalic', 'textLineType'],
    typography: true,
    palettes: ['textColor']
  },
  e3: {
    iconSize: true,
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['textColor']
  },
  e4: {
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['boxColor', 'textColor']
  },
  e5: {
    decorations: ['borderStyle'],
    iconSize: true,
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderWidth'],
    palettes: ['textColor', 'borderColor']
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

  if (value.typography !== undefined) {
    if (!rules.typography) {
      issues.push(`${path}.typography: not allowed for this element`);
    } else {
      issues.push(...validateElementTypographyContract(value.typography, `${path}.typography`));
    }
  }

  if (value.iconSize !== undefined) {
    if (!rules.iconSize) {
      issues.push(`${path}.iconSize: not allowed for this element`);
    } else {
      issues.push(...validateElementIconSizeContract(value.iconSize, `${path}.iconSize`));
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

  if (value.options !== undefined) {
    if (!isRecord(value.options)) {
      issues.push(`${path}.options: expected object`);
    } else {
      validateAllowedKeys(value.options, BUTTON_OPTION_KEYS, `${path}.options`, issues);

      if (
        value.options.iconLayout !== undefined &&
        value.options.iconLayout !== 'inline' &&
        value.options.iconLayout !== 'edge'
      ) {
        issues.push(`${path}.options.iconLayout: expected "inline" or "edge"`);
      }

      if (
        value.options.iconPlacement !== undefined &&
        value.options.iconPlacement !== 'leading' &&
        value.options.iconPlacement !== 'trailing'
      ) {
        issues.push(`${path}.options.iconPlacement: expected "leading" or "trailing"`);
      }

      if (
        value.options.iconTreatment !== undefined &&
        value.options.iconTreatment !== 'plain' &&
        value.options.iconTreatment !== 'surface'
      ) {
        issues.push(`${path}.options.iconTreatment: expected "plain" or "surface"`);
      }

      if (
        value.options.iconSurfaceCorners !== undefined &&
        value.options.iconSurfaceCorners !== 'edge' &&
        value.options.iconSurfaceCorners !== 'all'
      ) {
        issues.push(`${path}.options.iconSurfaceCorners: expected "edge" or "all"`);
      }
    }
  }

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

  if (
    isRecord(value.options) &&
    value.options.iconTreatment !== undefined &&
    value.options.iconTreatment !== 'plain' &&
    elements.e4 === undefined
  ) {
    issues.push(
      `${path}.options.iconTreatment: surfaced defaults require components.button.elements.e4`
    );
  }

  if (
    isRecord(value.options) &&
    value.options.iconSurfaceCorners !== undefined &&
    elements.e4 === undefined
  ) {
    issues.push(
      `${path}.options.iconSurfaceCorners: surfaced corner defaults require components.button.elements.e4`
    );
  }

  return issues;
}
