import {
  type ComponentClassNameMapSplitJSON,
  type ComponentEmphasis,
  type ComponentName,
  componentEmphasisBuckets,
  resolveContentSurfaceContextVariant,
  type Schema,
  type SurfaceContext,
  surfaceContextBuckets
} from '@kiskadee/core';
import {
  collectAlternativePaletteScopes,
  type ElementPaletteSource,
  getAuthoredElementPaletteSources,
  resolveElementPaletteSources
} from '../palettes/resolveElementPaletteSources.ts';
import type { ManifestComponent } from '../phase-7-publish-metadata/manifestTypes.ts';

export type ColorVariantCoverage = NonNullable<
  NonNullable<ManifestComponent['colorVariants']>['alternative']
>;
const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const hasPaint = (value: unknown): boolean =>
  isRecord(value) && Object.values(value).some((child) => child !== undefined);

/** Coverage is authored locally, then checked against complete effective recipes and emitted maps. */
export function buildColorVariantCapabilities(
  schema: Schema,
  componentName: ComponentName,
  classMaps?: ComponentClassNameMapSplitJSON
): ManifestComponent['colorVariants'] | undefined {
  const component = schema.components?.[componentName];
  if (!isRecord(component)) return undefined;
  const alternative: ColorVariantCoverage = {};
  const visit = (branch: Record<string, any>, path: string[] = []) => {
    if (isRecord(branch.elements)) {
      const elements = Object.entries(branch.elements).filter(
        ([name, element]) =>
          isRecord(element) && !(componentName === 'button' && ['e11', 'e12'].includes(name))
      );
      const catalogs = {
        foregrounds: schema.global?.foregrounds,
        contours: schema.global?.contours,
        separators: schema.global?.separators
      };
      const alternativePaletteScopes = collectAlternativePaletteScopes(
        Object.fromEntries(elements) as Record<string, ElementPaletteSource>,
        catalogs
      );
      const resolved = new Map(
        elements.map(([name, element]) => [
          name,
          resolveElementPaletteSources(element as ElementPaletteSource, catalogs, {
            alternativePaletteScopes
          }).palettes as Record<string, any> | undefined
        ])
      );
      const candidates = new Set<string>();
      for (const [, element] of elements) {
        for (const palettes of getAuthoredElementPaletteSources(
          element as ElementPaletteSource,
          catalogs
        )) {
          for (const [segment, themes] of Object.entries(palettes)) {
            for (const [theme, contexts] of Object.entries(themes as Record<string, any>)) {
              for (const [context, variants] of Object.entries(contexts as Record<string, any>)) {
                for (const property of Object.values((variants as any).alternative ?? {})) {
                  for (const [intent, levels] of Object.entries(property as Record<string, any>)) {
                    for (const [emphasis, states] of Object.entries(
                      levels as Record<string, any>
                    )) {
                      if (emphasis in componentEmphasisBuckets && hasPaint(states))
                        candidates.add(JSON.stringify([segment, theme, context, intent, emphasis]));
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (const encoded of candidates) {
        const [segment, theme, context, intent, emphasis] = JSON.parse(encoded) as [
          string,
          string,
          SurfaceContext,
          string,
          ComponentEmphasis
        ];
        const palette = `${segment}.${theme}`;
        if (!(context in surfaceContextBuckets)) continue;
        let map: any = classMaps?.palettes[palette]?.[componentName];
        for (const key of path) map = map?.[key];
        let hasRequiredPaint = false;
        const complete = elements.every(([name]) => {
          const variants = resolved.get(name)?.[segment]?.[theme]?.[context];
          if (!variants) return true;
          const required = Object.entries(variants.standard ?? {}).filter(
            ([, property]) => (property as any)?.[intent]?.[emphasis] !== undefined
          );
          if (!required.length) return true;
          hasRequiredPaint = true;
          if (
            !required.every(
              ([property]) =>
                variants.alternative?.[property]?.[intent]?.[emphasis]?.rest !== undefined
            )
          )
            return false;
          return (
            !classMaps ||
            Boolean(
              map?.[name]?.c?.[surfaceContextBuckets[context]]?.a?.[intent]?.[
                componentEmphasisBuckets[emphasis]
              ]
            )
          );
        });
        if (!complete || !hasRequiredPaint) continue;
        const output =
          branch.contentSurfaceContext ?? (component as Record<string, any>).contentSurfaceContext;
        if (output) {
          const variants = output[segment]?.[theme]?.[context];
          if (!variants) continue;
          const stateMap = resolveContentSurfaceContextVariant(variants, 'alternative')?.[intent]?.[
            emphasis
          ];
          if (!stateMap || !['onSubtle', 'onVivid', 'inherit'].includes(stateMap.rest)) continue;
        }
        alternative[palette] ??= {};
        alternative[palette][context] ??= {};
        alternative[palette][context]![intent] ??= [];
        const levels = alternative[palette][context]![intent]!;
        if (!levels.includes(emphasis)) levels.push(emphasis);
      }
    }
    for (const key of ['variants', 'modes'])
      for (const [name, child] of Object.entries(branch[key] ?? {}))
        if (isRecord(child)) visit(child, [...path, name]);
  };
  visit(component);
  return Object.keys(alternative).length ? { alternative } : undefined;
}
