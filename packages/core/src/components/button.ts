import { breakpointValues, elementSizeValues } from '../breakpoints.ts';
import { validateContentSurfaceContextMap } from '../content-surface-context.ts';
import type { DensityScaleMap } from '../density.ts';
import type { ElementHeightReference } from '../element-height-reference.ts';
import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type { RadiusMode } from '../schema.ts';
import type {
  Color,
  ColorProperty,
  ColorSchema,
  ComponentEmphasis,
  InteractionStateColorMap,
  SegmentName,
  SurfaceContextPalette,
  SystemButtonIntent,
  ThemeMode
} from '../types/colors/colors.types.ts';
import {
  ButtonIntentKeys,
  componentEmphasisBuckets,
  interactionStateKeys
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

export type ButtonIconLayout = 'inline' | 'edge' | 'stacked';
export type ButtonStackedRadiusMode = 'rounded' | 'square';

/** Resolves the stacked shape without changing preset-authored radius values. */
export function resolveButtonStackedRadiusMode(radius: RadiusMode): ButtonStackedRadiusMode {
  return radius === 'square' ? 'square' : 'rounded';
}

export type ButtonIndicatorPlacement = 'inside' | 'outside';
export type ButtonSelectionEmphasis = 'lowest' | 'low' | 'medium' | 'high';
export type ButtonIconPlacement = 'leading' | 'trailing';
export type ButtonIconSurfaceCorners = 'edge' | 'all';
export type ButtonIconTreatment = 'plain' | 'surface';

export type ButtonOptions = {
  density?: DensityScaleMap;
  /** Draws the preset-authored divider at every connected Button seam. */
  groupDivider?: boolean;
  /** Draws the preset-authored divider before the trailing disclosure slot. */
  disclosureDivider?: boolean;
  /**
   * Controls whether icon and label form one centered group, occupy
   * independent edge/center tracks, or stack the icon above the label.
   */
  iconLayout?: ButtonIconLayout;
  /** Logical icon side. Leading/trailing follow the document direction. */
  iconPlacement?: ButtonIconPlacement;
  /** Visual treatment applied to the icon region. */
  iconTreatment?: ButtonIconTreatment;
  /** Corner policy applied to a surfaced icon region. */
  iconSurfaceCorners?: ButtonIconSurfaceCorners;
  /** Places the optional decorative state indicator relative to the Button border box. */
  indicatorPlacement?: ButtonIndicatorPlacement;
  /** Selects the presentation of the semantic selected state; omission defaults to lowest. */
  selectionEmphasis?: ButtonSelectionEmphasis;
  /** Selects the system intent used while selected; omission follows the base Button intent. */
  selectionIntent?: SystemButtonIntent;
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
 * - e8: optional stacked container geometry
 * - e9: optional stacked label typography and icon-to-label spacing
 * - e10: optional stacked icon viewport
 * - e11: optional inside state indicator recipe
 * - e12: optional outside state indicator recipe, applied to the same rendered indicator
 */
export type ButtonElementName =
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
  | 'e12';

/**
 * e1 — button container/surface
 */
export type ButtonContainerElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  decorations: Pick<DecorationSchema, 'borderStyle' | 'textAlign'>;
  scales: ElementScalesByProperty<
    'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'borderWidth'
  > & {
    /** Nominal border-box height for inspection; does not emit visual styles. */
    _boxHeight?: ElementHeightReference;
    borderRadius?: {
      rounded?: ScaleBySize | number;
      pill?: ScaleBySize | number;
      square?: ScaleBySize | number;
    };
  };
  palettes: ElementPalettesByColor<
    TSegmentName,
    | 'boxColor'
    | 'borderColor'
    | 'borderTopColor'
    | 'borderRightColor'
    | 'borderBottomColor'
    | 'borderLeftColor'
  >;
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

/** e8 replaces root geometry while e1 retains surface, decoration and effects ownership. */
export type ButtonStackedContainerElementStyle = {
  name: string;
  scales: Required<
    Omit<NonNullable<ButtonContainerElementStyle['scales']>, '_boxHeight' | 'borderRadius'>
  > &
    Pick<NonNullable<ButtonContainerElementStyle['scales']>, '_boxHeight'> & {
      borderRadius: Partial<Record<ButtonStackedRadiusMode, ScaleBySize | number>> & {
        pill?: never;
      };
    };
};

/** e9 replaces label typography; e2 retains foreground and effects ownership. */
export type ButtonStackedLabelElementStyle = {
  name: string;
  decorations?: Pick<DecorationSchema, 'textItalic' | 'textLineType'>;
  typography: ElementTypography;
  scales: {
    marginTop: ScaleBySize | number;
  };
};

/** e10 replaces the icon viewport; e3 retains foreground and effects ownership. */
export type ButtonStackedIconElementStyle = {
  name: string;
  iconSize: ElementIconSize;
};

type ButtonIndicatorParentPaint = { ref: Color } | { parentState: Color };
type ButtonIndicatorStateColors = {
  rest?: Color;
  selected?: Partial<Record<'rest' | 'hover' | 'pressed' | 'focus', ButtonIndicatorParentPaint>>;
} & Partial<
  Record<Exclude<keyof InteractionStateColorMap, 'rest' | 'selected'>, ButtonIndicatorParentPaint>
>;
type ButtonIndicatorColorSchema = {
  boxColor: Partial<
    Record<SystemButtonIntent, Partial<Record<ComponentEmphasis, ButtonIndicatorStateColors>>>
  >;
};

/** Sparse state maps are local to the indicator; ordinary palettes still require Rest. */
export type ButtonIndicatorPalettes<TSegmentName extends SegmentName = never> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<
      Record<
        ThemeMode,
        {
          onSubtle: ButtonIndicatorColorSchema;
          onVivid?: ButtonIndicatorColorSchema;
        }
      >
    >
  >
>;

/** e11/e12 author alternate recipes for one passive indicator without layout contribution. */
export type ButtonIndicatorElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales: Required<
    ElementScalesByProperty<
      'boxWidth' | 'boxHeight' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'
    >
  > & {
    borderRadius: {
      rounded: ScaleBySize | number;
      pill: ScaleBySize | number;
      square: ScaleBySize | number;
    };
  };
  palettes: ButtonIndicatorPalettes<TSegmentName>;
};

export type ButtonElements<TSegmentName extends SegmentName = never> = {
  e1?: ButtonContainerElementStyle<TSegmentName>;
  e2?: ButtonLabelElementStyle<TSegmentName>;
  e3?: ButtonIconElementStyle<TSegmentName>;
  e4?: ButtonIconRegionElementStyle<TSegmentName>;
  e5?: ButtonDisclosureElementStyle<TSegmentName>;
  e6?: ButtonDividerElementStyle<TSegmentName>;
  e7?: ButtonBadgeRelationElementStyle;
  e8?: ButtonStackedContainerElementStyle;
  e9?: ButtonStackedLabelElementStyle;
  e10?: ButtonStackedIconElementStyle;
  e11?: ButtonIndicatorElementStyle<TSegmentName>;
  e12?: ButtonIndicatorElementStyle<TSegmentName>;
};

type ElementContractRules = {
  decorations?: readonly string[];
  iconSize?: boolean;
  typography?: boolean;
  typographyRequired?: boolean;
  scales?: readonly string[];
  requiredScales?: readonly string[];
  radiusModes?: readonly string[];
  palettes?: readonly ColorProperty[];
  effects?: false;
};

const BUTTON_COMPONENT_KEYS = ['contentSurfaceContext', 'effects', 'elements', 'options'] as const;
const BUTTON_OPTION_KEYS = [
  'density',
  'groupDivider',
  'disclosureDivider',
  'iconLayout',
  'iconPlacement',
  'iconTreatment',
  'iconSurfaceCorners',
  'indicatorPlacement',
  'selectionEmphasis',
  'selectionIntent'
] as const;
const BUTTON_ELEMENTS_KEYS = [
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
  'e12'
] as const;
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
      'borderRadius',
      '_boxHeight'
    ],
    palettes: [
      'boxColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor'
    ]
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
  },
  e8: {
    scales: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius',
      '_boxHeight'
    ],
    requiredScales: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius'
    ],
    radiusModes: ['rounded', 'square'],
    effects: false
  },
  e9: {
    decorations: ['textItalic', 'textLineType'],
    typography: true,
    typographyRequired: true,
    scales: ['marginTop'],
    requiredScales: ['marginTop'],
    effects: false
  },
  e10: {
    iconSize: true,
    effects: false
  },
  e11: {},
  e12: {}
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

function validateHeightReference(value: unknown, path: string, issues: string[]): void {
  const validateNumber = (height: unknown, heightPath: string): void => {
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
      issues.push(`${heightPath}: expected finite number greater than 0`);
    }
  };

  if (typeof value === 'number') {
    validateNumber(value, path);
    return;
  }

  if (!isRecord(value) || Object.keys(value).length === 0) {
    issues.push(`${path}: expected positive number or non-empty fixed-size map`);
    return;
  }

  validateAllowedKeys(value, elementSizeValues, path, issues);
  for (const [size, height] of Object.entries(value)) {
    validateNumber(height, `${path}.${size}`);
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

function validateButtonIndicatorContract(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }
  validateAllowedKeys(value, ['name', 'scales', 'palettes'], path, issues);
  if (typeof value.name !== 'string') issues.push(`${path}.name: expected string`);
  const validateScale = (scale: unknown, scalePath: string, positive: boolean): void => {
    const leaf = (entry: unknown, entryPath: string): void => {
      if (
        typeof entry !== 'number' ||
        !Number.isFinite(entry) ||
        (positive ? entry <= 0 : entry < 0)
      ) {
        issues.push(
          `${entryPath}: expected finite ${positive ? 'positive' : 'non-negative'} number`
        );
      }
    };
    if (typeof scale === 'number') {
      leaf(scale, scalePath);
      return;
    }
    if (!isRecord(scale) || Object.keys(scale).length === 0) {
      issues.push(`${scalePath}: expected number or non-empty size map`);
      return;
    }
    validateAllowedKeys(scale, [...elementSizeValues, 's:all'], scalePath, issues);
    for (const [size, entry] of Object.entries(scale)) {
      if (!isRecord(entry)) leaf(entry, `${scalePath}.${size}`);
      else {
        validateAllowedKeys(entry, breakpointValues, `${scalePath}.${size}`, issues);
        if (!Object.keys(entry).length)
          issues.push(`${scalePath}.${size}: expected non-empty breakpoint map`);
        for (const [breakpoint, number] of Object.entries(entry))
          leaf(number, `${scalePath}.${size}.${breakpoint}`);
      }
    }
  };
  if (!isRecord(value.scales)) issues.push(`${path}.scales: required object`);
  else {
    validateAllowedKeys(
      value.scales,
      [
        'boxWidth',
        'boxHeight',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'borderRadius'
      ],
      `${path}.scales`,
      issues
    );
    for (const property of [
      'boxWidth',
      'boxHeight',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight'
    ]) {
      validateScale(
        value.scales[property],
        `${path}.scales.${property}`,
        property.startsWith('box')
      );
    }
    if (!isRecord(value.scales.borderRadius))
      issues.push(`${path}.scales.borderRadius: required object`);
    else {
      validateAllowedKeys(
        value.scales.borderRadius,
        ['rounded', 'pill', 'square'],
        `${path}.scales.borderRadius`,
        issues
      );
      for (const radius of ['rounded', 'pill', 'square'])
        validateScale(
          value.scales.borderRadius[radius],
          `${path}.scales.borderRadius.${radius}`,
          false
        );
    }
  }
  for (const issue of getElementPaletteValidationIssues(value.palettes, ['boxColor'], {
    requireRest: false
  })) {
    const issuePath = issue.path.length
      ? `${path}.palettes.${issue.path.join('.')}`
      : `${path}.palettes`;
    issues.push(`${issuePath}: ${issue.message}`);
  }
  let paints = 0;
  const validateParentReference = (paint: unknown, paintPath: string): void => {
    if (
      !isRecord(paint) ||
      Object.keys(paint).length !== 1 ||
      (paint.ref === undefined && paint.parentState === undefined)
    ) {
      issues.push(`${paintPath}: expected parent-state reference`);
    }
  };
  const validateStates = (entry: unknown, entryPath: string, depth = 0): void => {
    if (!isRecord(entry)) return;
    if (depth === 4) validateAllowedKeys(entry, Object.keys(ButtonIntentKeys), entryPath, issues);
    if (depth === 5)
      validateAllowedKeys(entry, Object.keys(componentEmphasisBuckets), entryPath, issues);
    if (depth === 6) {
      validateAllowedKeys(entry, interactionStateKeys, entryPath, issues);
      for (const [state, color] of Object.entries(entry)) {
        if (state === 'rest') {
          if (color !== undefined) paints++;
          continue;
        }
        if (state === 'selected' && isRecord(color)) {
          validateAllowedKeys(
            color,
            ['rest', 'hover', 'focus', 'pressed'],
            `${entryPath}.selected`,
            issues
          );
          for (const [substate, paint] of Object.entries(color)) {
            validateParentReference(paint, `${entryPath}.selected.${substate}`);
            paints++;
          }
        } else {
          validateParentReference(color, `${entryPath}.${state}`);
          paints++;
        }
      }
      return;
    }
    for (const [key, child] of Object.entries(entry))
      validateStates(child, `${entryPath}.${key}`, depth + 1);
  };
  validateStates(value.palettes, `${path}.palettes`);
  if (paints === 0) issues.push(`${path}.palettes: expected at least one boxColor state`);
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
  } else if (rules.typographyRequired) {
    issues.push(`${path}.typography: required reference`);
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
      if (rules.scales.includes('_boxHeight') && value.scales._boxHeight !== undefined) {
        validateHeightReference(value.scales._boxHeight, `${path}.scales._boxHeight`, issues);
      }
      if (rules.radiusModes && value.scales.borderRadius !== undefined) {
        if (!isRecord(value.scales.borderRadius)) {
          issues.push(`${path}.scales.borderRadius: expected object`);
        } else {
          validateAllowedKeys(
            value.scales.borderRadius,
            rules.radiusModes,
            `${path}.scales.borderRadius`,
            issues
          );
        }
      }
    }
  }

  if (rules.requiredScales) {
    if (value.scales === undefined) {
      issues.push(`${path}.scales: required object`);
    } else if (isRecord(value.scales)) {
      for (const property of rules.requiredScales) {
        if (value.scales[property] === undefined) {
          issues.push(`${path}.scales.${property}: required scale`);
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

  if (value.effects !== undefined && rules.effects === false) {
    issues.push(`${path}.effects: not allowed for this element`);
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
        value.options.iconLayout !== 'edge' &&
        value.options.iconLayout !== 'stacked'
      ) {
        issues.push(`${path}.options.iconLayout: expected "inline", "edge" or "stacked"`);
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
        value.options.selectionEmphasis !== undefined &&
        value.options.selectionEmphasis !== 'lowest' &&
        value.options.selectionEmphasis !== 'low' &&
        value.options.selectionEmphasis !== 'medium' &&
        value.options.selectionEmphasis !== 'high'
      ) {
        issues.push(
          `${path}.options.selectionEmphasis: expected "lowest", "low", "medium" or "high"`
        );
      }

      if (
        value.options.selectionIntent !== undefined &&
        (typeof value.options.selectionIntent !== 'string' ||
          !Object.hasOwn(ButtonIntentKeys, value.options.selectionIntent))
      ) {
        issues.push(`${path}.options.selectionIntent: expected a system Button intent`);
      }

      if (
        value.options.indicatorPlacement !== undefined &&
        value.options.indicatorPlacement !== 'inside' &&
        value.options.indicatorPlacement !== 'outside'
      ) {
        issues.push(`${path}.options.indicatorPlacement: expected "inside" or "outside"`);
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
    if (key === 'e11' || key === 'e12') {
      validateButtonIndicatorContract(element, `${path}.elements.${key}`, issues);
      continue;
    }
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
    value.options.iconLayout === 'stacked' &&
    ['e8', 'e9', 'e10'].some((element) => elements[element] === undefined)
  ) {
    issues.push(
      `${path}.options.iconLayout: stacked defaults require components.button.elements.e8, e9 and e10`
    );
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
