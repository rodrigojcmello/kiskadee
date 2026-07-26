import type {
  CardIntent,
  ColorProperty,
  ColorSchema,
  ComponentEmphasis,
  SegmentName,
  SurfaceContext,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import {
  CardIntentKeys,
  componentEmphasisBuckets,
  surfaceContexts
} from '../types/colors/colors.types.ts';
import type { DecorationSchema } from '../types/decorations/decorations.types.ts';
import type { ScaleBySize, StandardScaleProperty } from '../types/scales/scales.types.ts';
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

export type CardCanonicalSurface = {
  intent: CardIntent;
  emphasis: ComponentEmphasis;
  contentSurfaceContext: SurfaceContext;
};

export type CardOptions<TSegmentName extends SegmentName = never> = {
  canonicalSurfaces?: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, readonly CardCanonicalSurface[]>>
    >
  >;
};

type ElementContractRules = {
  decorations?: readonly string[];
  scales?: readonly string[];
  palettes?: readonly ColorProperty[];
  radiusModes?: readonly string[];
};

const CARD_COMPONENT_KEYS = ['effects', 'options', 'elements'] as const;
const CARD_COMPONENT_EFFECT_KEYS = ['shadow'] as const;
const CARD_COMPONENT_OPTION_KEYS = ['canonicalSurfaces'] as const;
const CARD_CANONICAL_SURFACE_KEYS = ['intent', 'emphasis', 'contentSurfaceContext'] as const;
const CARD_SHADOW_ELEMENT_KEYS = ['e1'] as const;
const CARD_SHADOW_RECIPE_KEYS = ['fixedLevels', 'kind', 'states'] as const;
const CARD_ELEMENTS_KEYS = ['e1'] as const;
const CARD_ELEMENT_BASE_KEYS = ['name', 'decorations', 'scales', 'palettes'] as const;
const CARD_THEME_KEYS = ['light', 'dark', 'darker'] as const satisfies readonly ThemeMode[];

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
  allowedColorKeys: readonly ColorProperty[],
  path: string,
  issues: string[]
): void {
  for (const issue of getElementPaletteValidationIssues(value, allowedColorKeys)) {
    const issuePath = issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path;
    issues.push(`${issuePath}: ${issue.message}`);
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

    if (value.shadow.e1.fixedLevels !== undefined && !Array.isArray(value.shadow.e1.fixedLevels)) {
      issues.push(`${path}.shadow.e1.fixedLevels: expected array`);
    }
  }
}

function validateCanonicalSurfaceReference(
  entry: Record<string, unknown>,
  palette: unknown,
  path: string,
  issues: string[]
): void {
  if (!isRecord(palette)) {
    issues.push(`${path}: referenced Card palette is missing`);
    return;
  }

  const boxColor = palette.boxColor;
  const intentMap = isRecord(boxColor) ? boxColor[entry.intent as string] : undefined;
  const emphasisMap = isRecord(intentMap) ? intentMap[entry.emphasis as string] : undefined;
  const rest = isRecord(emphasisMap) ? emphasisMap.rest : undefined;

  if (rest === undefined) {
    issues.push(
      `${path}: referenced boxColor.${String(entry.intent)}.${String(entry.emphasis)}.rest is missing`
    );
  }
}

function validateCanonicalSurfaces(
  value: unknown,
  elements: unknown,
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  const palettes =
    isRecord(elements) && isRecord(elements.e1) && isRecord(elements.e1.palettes)
      ? elements.e1.palettes
      : undefined;

  for (const [segmentName, segmentValue] of Object.entries(value)) {
    const segmentPath = `${path}.${segmentName}`;
    if (!isRecord(segmentValue)) {
      issues.push(`${segmentPath}: expected object`);
      continue;
    }

    validateAllowedKeys(segmentValue, CARD_THEME_KEYS, segmentPath, issues);

    for (const [themeName, themeValue] of Object.entries(segmentValue)) {
      if (!CARD_THEME_KEYS.includes(themeName as ThemeMode)) continue;

      const themePath = `${segmentPath}.${themeName}`;
      if (!Array.isArray(themeValue)) {
        issues.push(`${themePath}: expected array`);
        continue;
      }
      if (themeValue.length === 0) {
        issues.push(`${themePath}: expected at least one canonical surface`);
        continue;
      }

      const seenReferences = new Set<string>();
      for (const [index, entryValue] of themeValue.entries()) {
        const entryPath = `${themePath}.${index}`;
        if (!isRecord(entryValue)) {
          issues.push(`${entryPath}: expected object`);
          continue;
        }

        validateAllowedKeys(entryValue, CARD_CANONICAL_SURFACE_KEYS, entryPath, issues);

        if (!Object.hasOwn(CardIntentKeys, String(entryValue.intent))) {
          issues.push(`${entryPath}.intent: expected Card intent`);
        }
        if (!Object.hasOwn(componentEmphasisBuckets, String(entryValue.emphasis))) {
          issues.push(`${entryPath}.emphasis: expected component emphasis`);
        }
        if (!surfaceContexts.includes(entryValue.contentSurfaceContext as SurfaceContext)) {
          issues.push(`${entryPath}.contentSurfaceContext: expected "default" or "inverse"`);
        }

        const referenceKey = `${String(entryValue.intent)}.${String(entryValue.emphasis)}`;
        if (seenReferences.has(referenceKey)) {
          issues.push(`${entryPath}: duplicate canonical surface "${referenceKey}"`);
        }
        seenReferences.add(referenceKey);

        const palette =
          isRecord(palettes?.[segmentName]) && isRecord(palettes[segmentName][themeName])
            ? palettes[segmentName][themeName].default
            : undefined;
        validateCanonicalSurfaceReference(entryValue, palette, entryPath, issues);
      }
    }
  }
}

function validateComponentOptions(
  value: unknown,
  elements: unknown,
  path: string,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, CARD_COMPONENT_OPTION_KEYS, path, issues);

  if (value.canonicalSurfaces !== undefined) {
    validateCanonicalSurfaces(
      value.canonicalSurfaces,
      elements,
      `${path}.canonicalSurfaces`,
      issues
    );
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

  if (value.options !== undefined) {
    validateComponentOptions(value.options, elements, `${path}.options`, issues);
  }

  validateAllowedKeys(elements, CARD_ELEMENTS_KEYS, `${path}.elements`, issues);

  for (const key of CARD_ELEMENTS_KEYS) {
    const element = elements[key];
    if (element === undefined) continue;
    validateElementContract(element, `${path}.elements.${key}`, CARD_RULES[key], issues);
  }

  return issues;
}
