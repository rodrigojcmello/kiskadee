import type {
  ComponentEmphasis,
  SegmentName,
  SurfaceContext,
  ThemeMode
} from './types/colors/colors.types.ts';

export type ContentSurfaceContextValue = SurfaceContext | 'inherit';

export type ContentSurfaceContextStateMap = {
  rest: ContentSurfaceContextValue;
  selected?: ContentSurfaceContextValue;
  pending?: ContentSurfaceContextValue;
  disabled?: ContentSurfaceContextValue;
};

/**
 * Serializable descendant-surface output authored by a component.
 *
 * Index order: segment -> theme -> consumed surface -> intent -> emphasis -> state.
 */
export type ContentSurfaceContextMap<
  TIntent extends string = string,
  TSegmentName extends SegmentName = string
> = Partial<
  Record<
    TSegmentName | 'default' | 'dynamic',
    Partial<
      Record<
        ThemeMode,
        Partial<
          Record<
            SurfaceContext,
            Partial<
              Record<TIntent, Partial<Record<ComponentEmphasis, ContentSurfaceContextStateMap>>>
            >
          >
        >
      >
    >
  >
>;

const OUTPUT_VALUES = ['onSubtle', 'onVivid', 'inherit'] as const;
const OUTPUT_STATE_KEYS = ['rest', 'selected', 'pending', 'disabled'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function validateContentSurfaceContextMap(value: unknown, path: string): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  for (const [segment, themes] of Object.entries(value)) {
    if (!isRecord(themes)) {
      issues.push(`${path}.${segment}: expected object`);
      continue;
    }
    for (const [theme, inputContexts] of Object.entries(themes)) {
      if (!['light', 'dark', 'darker'].includes(theme)) {
        issues.push(`${path}.${segment}.${theme}: unrecognized theme`);
      }
      if (!isRecord(inputContexts)) {
        issues.push(`${path}.${segment}.${theme}: expected object`);
        continue;
      }
      for (const [inputContext, intents] of Object.entries(inputContexts)) {
        if (!['onSubtle', 'onVivid'].includes(inputContext)) {
          issues.push(`${path}.${segment}.${theme}.${inputContext}: unrecognized surface context`);
        }
        if (!isRecord(intents)) {
          issues.push(`${path}.${segment}.${theme}.${inputContext}: expected object`);
          continue;
        }
        for (const [intent, emphases] of Object.entries(intents)) {
          if (!isRecord(emphases)) {
            issues.push(`${path}.${segment}.${theme}.${inputContext}.${intent}: expected object`);
            continue;
          }
          for (const [emphasis, states] of Object.entries(emphases)) {
            const statePath = `${path}.${segment}.${theme}.${inputContext}.${intent}.${emphasis}`;
            if (!['highest', 'high', 'medium', 'low', 'lowest'].includes(emphasis)) {
              issues.push(`${statePath}: unrecognized emphasis`);
            }
            if (!isRecord(states)) {
              issues.push(`${statePath}: expected object`);
              continue;
            }
            for (const key of Object.keys(states)) {
              if (!OUTPUT_STATE_KEYS.includes(key as (typeof OUTPUT_STATE_KEYS)[number])) {
                issues.push(`${statePath}.${key}: unrecognized state`);
              }
            }
            if (!Object.hasOwn(states, 'rest')) {
              issues.push(`${statePath}.rest: required state`);
            }
            for (const [state, output] of Object.entries(states)) {
              if (!OUTPUT_VALUES.includes(output as (typeof OUTPUT_VALUES)[number])) {
                issues.push(`${statePath}.${state}: expected onSubtle, onVivid, or inherit`);
              }
            }
          }
        }
      }
    }
  }
  return issues;
}
