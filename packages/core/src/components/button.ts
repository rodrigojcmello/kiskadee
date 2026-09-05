import { validateContentSurfaceContextMap } from '../content-surface-context.ts';
import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type {
  Color,
  ColorProperty,
  ColorSchema,
  ComponentEmphasis,
  SegmentName,
  SurfaceContextPalette,
  SystemButtonIntent,
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
  /** Draws the preset-authored divider at every connected Button seam. */
  groupDivider?: boolean;
  /** Draws the preset-authored divider before the trailing disclosure slot. */
  disclosureDivider?: boolean;
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
 * - e6: optional decorative divider used by connected and disclosure compositions
 * - e7: optional inline Badge relation spacing
 */
export type ButtonElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';

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
export type ButtonIconElementStyle<TSegmentName extends SegmentName = never> = {
  iconSize: ElementIconSize;
} & Partial<{
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
export type ButtonDisclosureElementStyle<TSegmentName extends SegmentName = never> = {
  iconSize: ElementIconSize;
} & Partial<{
  scales: ElementScalesByProperty<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
  palettes: ElementPalettesByColor<TSegmentName, 'textColor'>;
}> &
  ElementNameMetadata;

type ButtonDividerStateColorMap = {
  rest: Color;
};

type ButtonDividerColorSchema = {
  boxColor: Partial<
    Record<SystemButtonIntent, Partial<Record<ComponentEmphasis, ButtonDividerStateColorMap>>>
  >;
};

type ButtonDividerPalettes<TSegmentName extends SegmentName> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<ButtonDividerColorSchema>>>
  >
>;

/**
 * e6 — optional decorative divider
 *
 * The divider owns only its physical line. Composition-specific positioning and spacing remain
 * structural concerns of Button and Button.Group.
 */
export type ButtonDividerElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales: {
    boxWidth: ScaleBySize;
    boxHeight: ScaleBySize;
  };
  palettes: ButtonDividerPalettes<TSegmentName>;
};

/**
 * e7 — optional inline Badge relation
 *
 * The relation owns only the logical spacing between a label and its passive Badge. Placement
 * and Button layout remain structural concerns.
 */
export type ButtonBadgeRelationElementStyle = {
  name: string;
  scales: {
    paddingLeft: ScaleBySize;
    paddingRight: ScaleBySize;
  };
};

export type ButtonElements<TSegmentName extends SegmentName = never> = {
  e1?: ButtonContainerElementStyle<TSegmentName>;
  e2?: ButtonLabelElementStyle<TSegmentName>;
  e3?: ButtonIconElementStyle<TSegmentName>;
  e4?: ButtonIconRegionElementStyle<TSegmentName>;
  e5?: ButtonDisclosureElementStyle<TSegmentName>;
  e6?: ButtonDividerElementStyle<TSegmentName>;
  e7?: ButtonBadgeRelationElementStyle;
};

type ElementContractRules = {
  decorations?: readonly string[];
  iconSize?: boolean;
  typography?: boolean;
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
};

const BUTTON_COMPONENT_KEYS = ['contentSurfaceContext', 'effects', 'elements', 'options'] as const;
const BUTTON_OPTION_KEYS = [
  'groupDivider',
  'disclosureDivider',
  'iconLayout',
  'iconPlacement',
  'iconTreatment',
  'iconSurfaceCorners'
] as const;
const BUTTON_ELEMENTS_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'] as const;
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
    iconSize: true,
    scales: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    palettes: ['textColor']
  },
  e6: {
    scales: ['boxWidth', 'boxHeight'],
    palettes: ['boxColor']
  },
  e7: {
    scales: ['paddingLeft', 'paddingRight']
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

function validatePositiveScaleMap(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    issues.push(`${path}: expected non-empty responsive scale`);
    return;
  }

  const validateLeaf = (leaf: unknown, leafPath: string): void => {
    if (typeof leaf === 'number') {
      if (!Number.isFinite(leaf) || leaf <= 0) {
        issues.push(`${leafPath}: expected finite number greater than 0`);
      }
      return;
    }

    if (!isRecord(leaf) || Object.keys(leaf).length === 0) {
      issues.push(`${leafPath}: expected finite number or non-empty breakpoint map`);
      return;
    }

    for (const [breakpoint, responsiveLeaf] of Object.entries(leaf)) {
      if (
        typeof responsiveLeaf !== 'number' ||
        !Number.isFinite(responsiveLeaf) ||
        responsiveLeaf <= 0
      ) {
        issues.push(`${leafPath}.${breakpoint}: expected finite number greater than 0`);
      }
    }
  };

  for (const [scale, leaf] of Object.entries(value)) {
    validateLeaf(leaf, `${path}.${scale}`);
  }
}

function validateRestOnlyPaletteStates(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) return;

  if (Object.hasOwn(value, 'rest')) {
    for (const state of Object.keys(value)) {
      if (state !== 'rest') {
        issues.push(`${path}.${state}: only Rest is allowed for the Button divider`);
      }
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    validateRestOnlyPaletteStates(child, `${path}.${key}`, issues);
  }
}

function hasRestPaletteValue(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (Object.hasOwn(value, 'rest') && value.rest !== undefined) return true;
  return Object.values(value).some(hasRestPaletteValue);
}

function validateButtonDividerContract(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) return;

  if (value.effects !== undefined) {
    issues.push(`${path}.effects: not allowed for the Button divider`);
  }

  if (!isRecord(value.scales)) {
    issues.push(`${path}.scales: required object`);
  } else {
    validatePositiveScaleMap(value.scales.boxWidth, `${path}.scales.boxWidth`, issues);
    validatePositiveScaleMap(value.scales.boxHeight, `${path}.scales.boxHeight`, issues);
  }

  if (!isRecord(value.palettes) || Object.keys(value.palettes).length === 0) {
    issues.push(`${path}.palettes: expected non-empty object`);
  } else {
    validateRestOnlyPaletteStates(value.palettes, `${path}.palettes`, issues);
    if (!hasRestPaletteValue(value.palettes)) {
      issues.push(`${path}.palettes: expected at least one boxColor Rest value`);
    }
  }
}

function validateButtonBadgeRelationContract(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) return;

  if (!isRecord(value.scales)) {
    issues.push(`${path}.scales: required object`);
    return;
  }

  validatePositiveScaleMap(value.scales.paddingLeft, `${path}.scales.paddingLeft`, issues);
  validatePositiveScaleMap(value.scales.paddingRight, `${path}.scales.paddingRight`, issues);
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
  } else if (rules.iconSize) {
    issues.push(`${path}.iconSize: required reference`);
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

  if (value.contentSurfaceContext !== undefined) {
    issues.push(
      ...validateContentSurfaceContextMap(
        value.contentSurfaceContext,
        `${path}.contentSurfaceContext`
      )
    );
  }

  if (value.options !== undefined) {
    if (!isRecord(value.options)) {
      issues.push(`${path}.options: expected object`);
    } else {
      validateAllowedKeys(value.options, BUTTON_OPTION_KEYS, `${path}.options`, issues);

      for (const key of ['groupDivider', 'disclosureDivider'] as const) {
        if (value.options[key] !== undefined && typeof value.options[key] !== 'boolean') {
          issues.push(`${path}.options.${key}: expected boolean`);
        }
      }

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
    if (key === 'e6') {
      validateButtonDividerContract(element, `${path}.elements.e6`, issues);
    }
    if (key === 'e7') {
      validateButtonBadgeRelationContract(element, `${path}.elements.e7`, issues);
    }
  }

  if (
    isRecord(value.options) &&
    (value.options.groupDivider === true || value.options.disclosureDivider === true) &&
    elements.e6 === undefined
  ) {
    issues.push(`${path}.options: enabled divider defaults require components.button.elements.e6`);
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
