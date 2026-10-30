import type { ClassNameByElementJSON, ColorClasses, SurfaceContext } from '@kiskadee/core';
import { componentEmphasisBuckets, surfaceContextBuckets } from '@kiskadee/core';
import {
  buildScopedToneMetadataKey,
  type ToneMetadataByPalette,
  type ToneMetadataScope
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';

export type ButtonGroupClassMapJSON = {
  frame?: ClassNameByElementJSON;
  member?: Pick<ClassNameByElementJSON, 'c' | 'd'>;
  selectionRestMember?: Pick<ClassNameByElementJSON, 'c' | 'd'>;
};

export const BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY = 'borderColor__#00000000';

type SourceElement = {
  decorations?: string[];
  scales?: Record<string, unknown>;
  radiusScales?: Partial<Record<string, Record<string, string[] | undefined>>>;
  palettes?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const borderPaint = (key: string) => /^border(?:Top|Right|Bottom|Left)?Color(?:--|==|__)/.test(key);
const stateOf = (key: string) => key.split('__')[0]?.split(/--|==/)[1] ?? 'rest';
const isSelected = (state: string, key: string) =>
  state.startsWith('selected') || stateOf(key).startsWith('selected');

/** Reuses existing utilities; the Group never authors a second Button palette. */
export function compileButtonGroupArtifact(
  element: SourceElement,
  scope: ToneMetadataScope,
  metadata: ToneMetadataByPalette,
  resolveClassName: (key: string) => string,
  suppressionAvailable: boolean
):
  | { core: ButtonGroupClassMapJSON; palettes: Record<string, ButtonGroupClassMapJSON> }
  | undefined {
  if (!suppressionAvailable) return undefined;
  const select = (keys: string[] | undefined, predicate: (key: string) => boolean) => {
    const classes = [...new Set(keys?.filter(predicate).map(resolveClassName))];
    return classes.length ? classes.join(' ') : undefined;
  };
  const sizes = (
    source: Record<string, unknown> | undefined,
    predicate: (key: string) => boolean
  ) => {
    const output: Record<string, string> = {};
    for (const [size, value] of Object.entries(source ?? {})) {
      if (!Array.isArray(value)) continue;
      const classes = select(
        value.filter((key): key is string => typeof key === 'string'),
        predicate
      );
      if (classes) output[size.startsWith('s:') ? size.slice(2) : size] = classes;
    }
    return Object.keys(output).length ? output : undefined;
  };
  const suppression = resolveClassName(BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY);
  const core: ButtonGroupClassMapJSON = {
    frame: {
      d: select(element.decorations, (key) => key.startsWith('borderStyle__')),
      s: sizes(element.scales, (key) => key.startsWith('borderWidth')),
      rr: sizes(element.radiusScales?.rounded, () => true),
      rp: sizes(element.radiusScales?.pill, () => true),
      rs: sizes(element.radiusScales?.square, () => true)
    },
    member: { d: suppression },
    selectionRestMember: { d: suppression }
  };
  const palettes: Record<string, ButtonGroupClassMapJSON> = {};
  for (const [segment, themes] of Object.entries(element.palettes ?? {})) {
    if (!isRecord(themes)) continue;
    for (const [theme, contexts] of Object.entries(themes)) {
      if (!isRecord(contexts)) continue;
      const bundle = `${segment}.${theme}`;
      for (const [context, semantics] of Object.entries(contexts)) {
        if (!isRecord(semantics) || !(context in surfaceContextBuckets)) continue;
        const contextBucket = surfaceContextBuckets[context as SurfaceContext];
        const contextMetadata = metadata.get(`${bundle}.${context}`);
        for (const [semantic, states] of Object.entries(semantics)) {
          if (!isRecord(states)) continue;
          const recipes = {
            frame: new Map<keyof ColorClasses, Set<string>>(),
            member: new Map<keyof ColorClasses, Set<string>>(),
            selectionRestMember: new Map<keyof ColorClasses, Set<string>>()
          };
          for (const [state, keys] of Object.entries(states)) {
            if (!Array.isArray(keys)) continue;
            for (const key of keys) {
              if (typeof key !== 'string') continue;
              const tones = contextMetadata?.get(
                buildScopedToneMetadataKey(scope, `${semantic}::${key}`)
              )?.tones;
              for (const tone of tones ?? []) {
                const bucket = componentEmphasisBuckets[tone];
                const add = (recipe: keyof typeof recipes) => {
                  const set = recipes[recipe].get(bucket) ?? new Set<string>();
                  set.add(resolveClassName(key));
                  recipes[recipe].set(bucket, set);
                };
                if (borderPaint(key)) {
                  if (state === 'rest' && stateOf(key) === 'rest') add('frame');
                } else {
                  add('member');
                  if (tone === 'high' && !isSelected(state, key)) add('selectionRestMember');
                }
              }
            }
          }
          for (const [recipe, levels] of Object.entries(recipes)) {
            if (!levels.size) continue;
            const name = recipe as keyof ButtonGroupClassMapJSON;
            palettes[bundle] ??= {};
            const target = palettes[bundle];
            target[name] ??= {};
            const elementTarget = target[name];
            elementTarget.c ??= {};
            elementTarget.c[contextBucket] ??= {};
            elementTarget.c[contextBucket][semantic] = Object.fromEntries(
              [...levels].map(([tone, classes]) => [tone, [...classes].join(' ')])
            );
          }
        }
      }
    }
  }
  return { core, palettes };
}
