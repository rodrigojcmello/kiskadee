import type {
  Color,
  ColorProperty,
  InteractionState,
  ProgressIntent,
  SegmentName,
  SurfaceContextPalette,
  ThemeMode
} from '../types/colors/colors.types.ts';
import { ProgressIntentKeys } from '../types/colors/colors.types.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

type ProgressNonRestState = Exclude<InteractionState, 'rest'>;

export type ProgressRestStateColorMap = {
  rest: Color;
} & Partial<Record<ProgressNonRestState, never>>;

/** Progress has one canonical visual emphasis: medium. */
export type ProgressIntentColorMap = Record<
  ProgressIntent,
  {
    medium: ProgressRestStateColorMap;
  }
>;

/** Track palettes deliberately publish only the neutral medium profile. */
export type ProgressTrackColorMap = {
  neutral: {
    medium: ProgressRestStateColorMap;
  };
};

export type ProgressColorSchema = {
  boxColor: ProgressIntentColorMap;
  borderColor?: never;
  textColor?: never;
};

export type ProgressTrackColorSchema = {
  boxColor: ProgressTrackColorMap;
  borderColor?: never;
  textColor?: never;
};

export type ProgressElementPalettes<
  TSegmentName extends SegmentName = never,
  TColorSchema extends ProgressColorSchema | ProgressTrackColorSchema = ProgressColorSchema
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<Record<ThemeMode, SurfaceContextPalette<TColorSchema>>>
  >
>;

export type ProgressPillRadiusScale = {
  pill: number;
  rounded?: never;
  square?: never;
};

export type ProgressScale = 's:md:1' | 's:lg:1';
export type ProgressScaleMap = Record<ProgressScale, number>;

/**
 * Progress elements canonical mapping:
 * - e1: semantic root
 * - e2: track
 * - e3: indicator
 */
export type ProgressElementName = 'e1' | 'e2' | 'e3';

export type ProgressRootElementStyle = {
  name: string;
};

export type ProgressTrackElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales: {
    boxHeight: ProgressScaleMap;
    borderRadius: ProgressPillRadiusScale;
  };
  palettes: ProgressElementPalettes<TSegmentName, ProgressTrackColorSchema>;
};

export type ProgressIndicatorElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  scales: {
    borderRadius: ProgressPillRadiusScale;
  };
  palettes: ProgressElementPalettes<TSegmentName>;
};

export type ProgressElements<TSegmentName extends SegmentName = never> = {
  e1: ProgressRootElementStyle;
  e2: ProgressTrackElementStyle<TSegmentName>;
  e3: ProgressIndicatorElementStyle<TSegmentName>;
};

const PROGRESS_COMPONENT_KEYS = ['elements'] as const;
const PROGRESS_ELEMENT_KEYS = ['e1', 'e2', 'e3'] as const;
const PROGRESS_ROOT_KEYS = ['name'] as const;
const PROGRESS_VISUAL_ELEMENT_KEYS = ['name', 'scales', 'palettes'] as const;
const PROGRESS_TRACK_SCALE_KEYS = ['boxHeight', 'borderRadius'] as const;
const PROGRESS_INDICATOR_SCALE_KEYS = ['borderRadius'] as const;
const PROGRESS_RADIUS_KEYS = ['pill'] as const;
const PROGRESS_SCALE_KEYS = ['s:md:1', 's:lg:1'] as const;
const PROGRESS_SCALE_VALUES = {
  's:md:1': 2,
  's:lg:1': 4
} as const satisfies ProgressScaleMap;
const PROGRESS_COLOR_PROPERTIES = ['boxColor'] as const satisfies readonly ColorProperty[];
const PROGRESS_INTENTS = Object.keys(ProgressIntentKeys) as ProgressIntent[];

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

function validateFiniteNumber(
  value: unknown,
  path: string,
  issues: string[],
  minimum: number
): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) {
    issues.push(`${path}: expected a finite number greater than or equal to ${minimum}`);
  }
}

function validatePillRadius(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, PROGRESS_RADIUS_KEYS, path, issues);
  validateFiniteNumber(value.pill, `${path}.pill`, issues, 0);
}

function validateTrackScales(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, PROGRESS_TRACK_SCALE_KEYS, path, issues);
  if (!isRecord(value.boxHeight)) {
    issues.push(`${path}.boxHeight: expected object`);
  } else {
    validateAllowedKeys(value.boxHeight, PROGRESS_SCALE_KEYS, `${path}.boxHeight`, issues);
    for (const scale of PROGRESS_SCALE_KEYS) {
      const height = value.boxHeight[scale];
      if (height !== PROGRESS_SCALE_VALUES[scale]) {
        issues.push(
          `${path}.boxHeight.${scale}: expected ${PROGRESS_SCALE_VALUES[scale]} but received ${String(height)}`
        );
      }
    }
  }
  validatePillRadius(value.borderRadius, `${path}.borderRadius`, issues);
}

function validateIndicatorScales(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, PROGRESS_INDICATOR_SCALE_KEYS, path, issues);
  validatePillRadius(value.borderRadius, `${path}.borderRadius`, issues);
}

function validateProgressColorMap(
  value: unknown,
  path: string,
  issues: string[],
  kind: 'track' | 'indicator'
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  const intents = kind === 'track' ? ['neutral'] : PROGRESS_INTENTS;
  for (const intent of Object.keys(value)) {
    if (!intents.includes(intent)) {
      issues.push(`${path}.${intent}: unrecognized intent`);
    }
  }

  for (const intent of intents) {
    const emphasisMap = value[intent];
    if (!isRecord(emphasisMap)) {
      issues.push(`${path}.${intent}: required intent`);
      continue;
    }

    for (const emphasis of Object.keys(emphasisMap)) {
      if (emphasis !== 'medium') {
        issues.push(`${path}.${intent}.${emphasis}: unrecognized emphasis`);
      }
    }

    const stateMap = emphasisMap.medium;
    if (!isRecord(stateMap)) {
      issues.push(`${path}.${intent}.medium: required emphasis`);
      continue;
    }

    validateAllowedKeys(stateMap, ['rest'], `${path}.${intent}.medium`, issues);
    if (!Object.hasOwn(stateMap, 'rest')) {
      issues.push(`${path}.${intent}.medium.rest: required state`);
    }
  }
}

function validateProgressPalettes(
  value: unknown,
  path: string,
  kind: 'track' | 'indicator',
  issues: string[]
): void {
  for (const issue of getElementPaletteValidationIssues(value, PROGRESS_COLOR_PROPERTIES)) {
    const issuePath = issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path;
    issues.push(`${issuePath}: ${issue.message}`);
  }

  if (!isRecord(value)) return;

  for (const [segment, themes] of Object.entries(value)) {
    if (!isRecord(themes)) continue;
    for (const [theme, contexts] of Object.entries(themes)) {
      if (!isRecord(contexts)) continue;
      for (const [context, colorSchema] of Object.entries(contexts)) {
        if (!isRecord(colorSchema)) continue;
        validateProgressColorMap(
          colorSchema.boxColor,
          `${path}.${segment}.${theme}.${context}.boxColor`,
          issues,
          kind
        );
      }
    }
  }
}

function validateRootElement(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, PROGRESS_ROOT_KEYS, path, issues);
  if (typeof value.name !== 'string') {
    issues.push(`${path}.name: expected string`);
  }
}

function validateVisualElement(
  value: unknown,
  path: string,
  kind: 'track' | 'indicator',
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }

  validateAllowedKeys(value, PROGRESS_VISUAL_ELEMENT_KEYS, path, issues);
  if (typeof value.name !== 'string') {
    issues.push(`${path}.name: expected string`);
  }

  if (kind === 'track') {
    validateTrackScales(value.scales, `${path}.scales`, issues);
  } else {
    validateIndicatorScales(value.scales, `${path}.scales`, issues);
  }
  validateProgressPalettes(value.palettes, `${path}.palettes`, kind, issues);
}

/**
 * Validates the three-element Progress schema and its Rest-only palette contract.
 * The track publishes neutral medium; the indicator publishes one medium profile per intent.
 */
export function validateProgressComponentContract(
  value: unknown,
  path = 'components.progress'
): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) {
    return [`${path}: expected object`];
  }

  validateAllowedKeys(value, PROGRESS_COMPONENT_KEYS, path, issues);
  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, PROGRESS_ELEMENT_KEYS, `${path}.elements`, issues);

  validateRootElement(value.elements.e1, `${path}.elements.e1`, issues);
  validateVisualElement(value.elements.e2, `${path}.elements.e2`, 'track', issues);
  validateVisualElement(value.elements.e3, `${path}.elements.e3`, 'indicator', issues);
  return issues;
}
