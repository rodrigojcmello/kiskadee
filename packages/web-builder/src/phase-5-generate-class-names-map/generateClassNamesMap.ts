import type {
  ComponentName,
  ComponentStyleKeyMap,
  ElementAllSizeValue,
  ElementSizeValue,
  emphasisVariantClassNames,
  InteractionState,
  SemanticColor,
  StyleKey
} from '@kiskadee/core';
import type {
  ToneMetadata,
  ToneMetadataByPalette
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';

// Color classes structure matching schema.ts
type ColorClasses = {
  // Legacy buckets (kept for backward compatibility with existing consumers).
  u?: string; // unique/single color (no emphasis variants)
  s?: string; // subtle
  o?: string; // subtle-outline (derived)
  f?: string; // subtle-flat (derived)
  v?: string; // vivid
};

// Shortened keys for optimization (Phase 5 artifact schema):
// d = decorations (always-on, flattened string)
// e = effects by interaction state (arrays of classes, opt-in at component level)
// s = scales (size variants only, flattened strings per size)
// c = color classes (organized by emphasis: u/s/v)
// cs = control states (selected)
export type ClassNamesByInteractionState = Partial<Record<string, string[]>>; // legacy for reference
export type ClassNameByElement = {
  // Flattened decorations only (always-on). Effects no longer merge here.
  d?: string;
  // Effects buckets (space-separated strings), opt-in at component level.
  // Keys are short for web payload optimization (single letters).
  e?: Partial<Record<string, string>>;
  // Scales aggregated per size as flattened strings (size variants only, not effects)
  s?: Partial<Record<ElementSizeValue | ElementAllSizeValue, string>>;
  // Color classes organized by emphasis (u/s/v)
  c?: ColorClasses;
  // Control-state specific (selected) — flattened string of utility classes
  l?: string;
};
export type ComponentClassNameMap = Partial<Record<string, Record<string, ClassNameByElement>>>;

export type ComponentClassNameMapSplit = {
  core: ComponentClassNameMap; // no palettes included
  palettes: Record<string, ComponentClassNameMap>; // each contains only flattened `p` for that palette
};

function mapArray(
  keys: string[] | undefined,
  shortenMap: ShortenCssClassNames
): string[] | undefined {
  if (!keys) return undefined;
  return keys.map((k) => shortenMap[k] ?? k);
}

/**
 * Produces two JSON-friendly maps of class names from the aggregated StyleKeys:
 * - core: decorations in `d` (always-on), effects in `e` per interaction state (opt-in),
 *         scales in `s` (size-only variants), no palettes included.
 * - palettes: one object per palette name, each containing only the flattened `p` string per element.
 *
 * Policy notes:
 * - Effects are never merged into `d` or `s` — they must be explicitly added by components from `e`.
 * - This aligns with Phase 4 where effect CSS is only emitted when gated (class activator/pseudo).
 * - Keys are shortened via ShortenCssClassNames map.
 * - toneMetadata is used to build the `t` field mapping tones to their class names.
 */
export function generateClassNamesMapSplit(
  styleKeys: ComponentStyleKeyMap,
  shortenMap: ShortenCssClassNames,
  toneMetadataByPalette: ToneMetadataByPalette
): ComponentClassNameMapSplit {
  const { outline: outlineClass, flat: flatClass } = emphasisVariantClassNames;

  const core: ComponentClassNameMap = {};
  const palettes: Record<string, ComponentClassNameMap> = {};

  for (const componentName of Object.keys(styleKeys)) {
    const elements = styleKeys[componentName as ComponentName];
    if (!elements) continue;
    core[componentName] = {};
    for (const elementName of Object.keys(elements)) {
      const el = elements[elementName];

      // Core (no palettes) — aggregate:
      // - decorations into `d` (always-on),
      // - effects into `e` per interaction state (opt-in),
      // - scales (size variants only) into `s`.
      const dSet = new Set<string>();
      const sMap = new Map<string, Set<string>>();
      // Effects buckets (by effect kind), excluding selected/control-state.
      const eBuckets = new Map<string, Set<string>>();
      // Control-state: selected — kept as a dedicated field (`l`) but must NOT include effects.
      // Control-state is expressed via runtime activators (e.g. `-s -a`) and palette/state rules.
      // Effects that happen to be authored under `selected*` interaction states must remain effects
      // and therefore must stay in `e` buckets (opt-in via component props like `radius`).
      const selectedSet = new Set<string>();

      // decorations → d
      mapArray(el.decorations, shortenMap)?.forEach((c) => {
        dSet.add(c);
      });

      // effects → e (bucketized; never merge effects into d/s)
      if (el.effects) {
        for (const st of Object.keys(el.effects)) {
          const arr = (el.effects as any)[st] as string[] | undefined;
          if (!arr || arr.length === 0) continue;
          for (const key of arr) {
            const cls = shortenMap[key] ?? key;

            // IMPORTANT:
            // Do not treat `selected*` interaction states as control-state (`l`).
            // `l` is reserved for control-state-only classes, while interaction-driven changes
            // (including selected-specific effects like MD3 animated corners) remain effects.

            // Bucket by effect family inferred from the style key prefix.
            // Keep single-letter bucket keys for minimal payload.
            let bucket: string;
            if (key.startsWith('shadow')) bucket = 'h';
            else if (key.startsWith('borderRadius')) bucket = 'r';
            else bucket = 'x';

            if (!eBuckets.has(bucket)) eBuckets.set(bucket, new Set());
            eBuckets.get(bucket)!.add(cls);
          }
        }
      }

      // scales → s[size] (size-only variants)
      if (el.scales) {
        for (const [size, arr] of Object.entries(el.scales)) {
          // Web artifact optimization: strip "s:" prefix from size keys (e.g. "s:md:1" -> "md:1").
          const sizeKey = size.startsWith('s:') ? size.slice(2) : size;
          const mapped = mapArray(arr, shortenMap);
          if (!mapped || mapped.length === 0) continue;
          if (!sMap.has(sizeKey)) sMap.set(sizeKey, new Set());
          const set = sMap.get(sizeKey)!;
          mapped.forEach((c) => {
            set.add(c);
          });
        }
      }

      // Palettes split per segment.theme; segregate by emphasis (unique/soft/solid)
      if (el.palettes) {
        // `el.palettes` is typed with a constrained key union in @kiskadee/core
        // but in practice schemas may use arbitrary segment keys. Treat it as a
        // string-keyed record for artifact generation.
        const palettesBySegment = el.palettes as unknown as Record<string, any>;

        for (const segmentName of Object.keys(palettesBySegment)) {
          const segmentThemes = palettesBySegment[segmentName] as Record<string, any> | undefined;
          if (!segmentThemes) continue;

          for (const themeName of Object.keys(segmentThemes)) {
            const bySemantic = segmentThemes[themeName] as Record<string, any> | undefined;
            if (!bySemantic) continue;

            // Create a composite key: segment.theme (e.g., "ios.light", "ios.dark")
            const bundleKey = `${segmentName}.${themeName}`;

            // IMPORTANT:
            // `toneMetadataByPalette` is scoped by palette (segment + theme) on purpose.
            //
            // Rationale:
            // - The same StyleKey can be used across multiple palettes because StyleKey encodes
            //   the final CSS rule/value and must remain globally deduplicable.
            // - However, the emphasis bucket (subtle/vivid) is semantic metadata and is allowed
            //   to differ per palette. If we used a single global metadata map keyed only by
            //   StyleKey, emphasis could "leak" from one palette to another and make the JSON
            //   artifact incorrectly classify subtle classes as vivid (or vice-versa).
            //
            // By resolving metadata through `bundleKey`, we keep CSS dedupe intact while producing
            // correct per-palette `c[semantic].s` / `c[semantic].v` buckets.
            const toneMetaForPalette = toneMetadataByPalette.get(bundleKey);
            if (!palettes[bundleKey]) palettes[bundleKey] = {};
            if (!palettes[bundleKey][componentName]) {
              palettes[bundleKey][componentName] = {};
            }
            // ensure element record exists (avoid assignment inside expression per Biome rule)
            if (!palettes[bundleKey][componentName][elementName]) {
              palettes[bundleKey][componentName][elementName] = {};
            }
            const elemRecord = palettes[bundleKey][componentName][elementName];

            // Build color classes per semantic: c[semantic] = { u, s, v, o, f }
            const colorBySemantic: Record<string, ColorClasses> = {};

            for (const sem of Object.keys(bySemantic)) {
              const byState = bySemantic[sem as SemanticColor];

              // Segregate classes by emphasis (or unique if no emphasis) per semantic
              const uniqueSet = new Set<string>();
              const softSet = new Set<string>();
              const softNoBoxSet = new Set<string>();
              const solidSet = new Set<string>();

              for (const stateKey of Object.keys(byState ?? {})) {
                const interactionState = stateKey as InteractionState;
                const styleKeys = byState?.[interactionState] as string[] | undefined;

                styleKeys?.forEach((styleKey: string) => {
                  const shortenedClass = shortenMap[styleKey] ?? styleKey;
                  const metaKey = `${sem}::${styleKey}`;
                  const meta = toneMetaForPalette?.get(metaKey);

                  const tones = meta?.tones ?? [];

                  // Do NOT move selected palette classes into core.cs. Always classify by emphasis/unique.
                  const isBoxColor = styleKey.startsWith('boxColor');

                  if (tones.includes('subtle')) {
                    softSet.add(shortenedClass);
                    if (!isBoxColor) softNoBoxSet.add(shortenedClass);
                  }

                  if (tones.includes('vivid')) {
                    solidSet.add(shortenedClass);
                  }

                  if (tones.length === 0) {
                    // No emphasis = unique/single color
                    uniqueSet.add(shortenedClass);
                  }
                });
              }

              const colorClasses: ColorClasses = {};
              if (uniqueSet.size > 0) colorClasses.u = Array.from(uniqueSet).join(' ');
              if (softSet.size > 0) colorClasses.s = Array.from(softSet).join(' ');
              if (solidSet.size > 0) colorClasses.v = Array.from(solidSet).join(' ');

              const isOutlineElement = componentName === 'button' && elementName === 'e1';
              if (isOutlineElement && softSet.size > 0) {
                const outlineSet = new Set(softNoBoxSet.size > 0 ? softNoBoxSet : softSet);
                outlineSet.add(outlineClass);
                colorClasses.o = Array.from(outlineSet).join(' ');

                const flatSet = new Set(softNoBoxSet.size > 0 ? softNoBoxSet : softSet);
                flatSet.add(flatClass);
                colorClasses.f = Array.from(flatSet).join(' ');
              }
              if (Object.keys(colorClasses).length > 0) {
                colorBySemantic[sem] = colorClasses;
              }
            }

            // Add to the element record only if we have color classes
            if (Object.keys(colorBySemantic).length > 0) {
              // c is now a map of semantic -> ColorClasses
              (elemRecord as any).c = colorBySemantic as any;
            }
          }
        }
      }

      // After processing palettes, finalize the core element record so `cs` includes palette-derived selected classes
      core[componentName][elementName] = {
        d: dSet.size ? Array.from(dSet).join(' ') : undefined,
        e:
          eBuckets.size > 0
            ? Object.fromEntries(
                Array.from(eBuckets.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined,
        // Intentionally empty until we have a dedicated source of control-state-only classes.
        // Do not backfill this from `effects.selected*`.
        l: selectedSet.size ? Array.from(selectedSet).join(' ') : undefined,
        s:
          sMap.size > 0
            ? Object.fromEntries(
                Array.from(sMap.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined
      };
    }
  }

  return { core, palettes };
}
