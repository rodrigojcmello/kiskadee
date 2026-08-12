import type { ElementSizeValue } from '../breakpoints.ts';
import { validateElementIconSizeContract } from '../icon-sizes.contract.zod.ts';
import type { ElementIconSize } from '../icon-sizes.ts';
import type {
  ColorProperty,
  ColorSchema,
  IconIntent,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { IconIntentKeys } from '../types/colors/colors.types.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

export type IconScale = ElementSizeValue;

type IconPalettes<TSegmentName extends SegmentName> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<Partial<Pick<ColorSchema, 'textColor'>>>>>
  >
>;

/**
 * Icon elements canonical mapping:
 * - e1: glyph root and generated foreground/geometry owner
 */
export type IconElementName = 'e1';

/**
 * e1 — glyph root
 */
export type IconGlyphElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  iconSize: ElementIconSize;
  palettes: IconPalettes<TSegmentName>;
};

export type IconElements<TSegmentName extends SegmentName = never> = {
  e1: IconGlyphElementStyle<TSegmentName>;
};

const ICON_COMPONENT_KEYS = ['elements'] as const;
const ICON_ELEMENTS_KEYS = ['e1'] as const;
const ICON_ELEMENT_KEYS = ['name', 'iconSize', 'palettes'] as const;
const ICON_COLOR_PROPERTIES = ['textColor'] as const satisfies readonly ColorProperty[];
const ICON_INTENTS = Object.keys(IconIntentKeys) as IconIntent[];

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

function validateIconColorMap(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) return;

  for (const [intent, emphasisMap] of Object.entries(value)) {
    if (!ICON_INTENTS.includes(intent as IconIntent)) {
      issues.push(`${path}.${intent}: unrecognized intent`);
      continue;
    }
    if (!isRecord(emphasisMap)) continue;

    for (const [emphasis, stateMap] of Object.entries(emphasisMap)) {
      if (emphasis !== 'medium') {
        issues.push(`${path}.${intent}.${emphasis}: unrecognized emphasis`);
        continue;
      }
      if (!isRecord(stateMap)) continue;

      for (const state of Object.keys(stateMap)) {
        if (state !== 'rest') {
          issues.push(`${path}.${intent}.${emphasis}.${state}: unrecognized state`);
        }
      }
    }
  }
}

function validateIconPalettes(value: unknown, path: string, issues: string[]): void {
  for (const issue of getElementPaletteValidationIssues(value, ICON_COLOR_PROPERTIES)) {
    const issuePath = issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path;
    issues.push(`${issuePath}: ${issue.message}`);
  }

  if (!isRecord(value)) return;

  for (const [segment, themes] of Object.entries(value)) {
    if (!isRecord(themes)) continue;
    for (const [theme, contexts] of Object.entries(themes)) {
      if (!isRecord(contexts)) continue;
      for (const [context, colorSchema] of Object.entries(contexts)) {
        if (!isRecord(colorSchema) || !isRecord(colorSchema.textColor)) continue;
        validateIconColorMap(
          colorSchema.textColor,
          `${path}.${segment}.${theme}.${context}.textColor`,
          issues
        );
      }
    }
  }
}

/**
 * Strict build-time validation for the one-element Icon contract.
 */
export function validateIconComponentContract(value: unknown, path = 'components.icon'): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, ICON_COMPONENT_KEYS, path, issues);

  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, ICON_ELEMENTS_KEYS, `${path}.elements`, issues);

  const element = value.elements.e1;
  if (!isRecord(element)) {
    issues.push(`${path}.elements.e1: expected object`);
    return issues;
  }

  validateAllowedKeys(element, ICON_ELEMENT_KEYS, `${path}.elements.e1`, issues);

  if (typeof element.name !== 'string') {
    issues.push(`${path}.elements.e1.name: expected string`);
  }

  issues.push(...validateElementIconSizeContract(element.iconSize, `${path}.elements.e1.iconSize`));

  validateIconPalettes(element.palettes, `${path}.elements.e1.palettes`, issues);

  return issues;
}
