import type {
  ComponentEmphasis,
  ComponentName,
  ComponentStyleKeyMap,
  ElementAllSizeValue,
  ElementSizeValue,
  InteractionState,
  SemanticColor
} from '@kiskadee/core';
import { componentEmphasisBuckets } from '@kiskadee/core';
import type { ToneMetadataByPalette } from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';

type ColorClasses = {
  h?: string; // high
  m?: string; // medium
  l?: string; // low
  ll?: string; // lowest
};

// Shortened keys for optimization (Phase 5 artifact schema):
// d = decorations (always-on, flattened string)
// e = effects by interaction state (arrays of classes, opt-in at component level)
// s = scales (size variants only, flattened strings per size)
// w = width-only scales (opt-in at component level, flattened strings per size)
// c = color classes (organized by emphasis: h/m/l/ll)
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
  // Width-only scales aggregated per size (opt-in at component level)
  w?: Partial<Record<ElementSizeValue | ElementAllSizeValue, string>>;
  // Rounded radius scales aggregated per size (opt-in at component level)
  r?: Partial<Record<ElementSizeValue | ElementAllSizeValue, string>>;
  // Pill radius scales aggregated per size (opt-in at component level)
  rp?: Partial<Record<ElementSizeValue | ElementAllSizeValue, string>>;
  // Square radius scales aggregated per size (opt-in at component level)
  rs?: Partial<Record<ElementSizeValue | ElementAllSizeValue, string>>;
  // Color classes organized by emphasis (h/m/l/ll)
  c?: ColorClasses;
  // Control-state specific (selected) — flattened string of utility classes
  l?: string;
};
export type ComponentClassNameMap = Partial<
  Record<
    string,
    Record<string, ClassNameByElement> | Record<string, Record<string, ClassNameByElement>>
  >
>;

export type ComponentClassNameMapSplit = {
  core: ComponentClassNameMap; // no palettes included
  palettes: Record<string, ComponentClassNameMap>; // each contains only flattened `p` for that palette
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isElementMap(value: unknown): value is Record<string, any> {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  const elementKeys = ['decorations', 'effects', 'scales', 'radiusScales', 'palettes'];
  return elementKeys.some((key) => key in first);
}

function mapArray(
  keys: string[] | undefined,
  shortenMap: ShortenCssClassNames
): string[] | undefined {
  if (!keys) return undefined;
  return keys.map((k) => shortenMap[k] ?? k);
}

// Ripple buckets follow a compact 3-letter convention to keep artifact payloads small.
// This is not a universal rule for every bucket, but for ripple we intentionally
// cap the key size at 3 characters: ris/rio/rix/rip.
// [RIPPLE EFFECT 14] START: Ripple bucket compaction for class-map payload.
function rippleBucketForKey(key: string): string {
  if (key.startsWith('ripplePressed')) return 'rip';

  const separatorIndex = key.indexOf('__');
  const rawValue = separatorIndex === -1 ? '' : key.slice(separatorIndex + 2);

  if (rawValue.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawValue) as { mode?: string };
      if (parsed.mode === 'surface') return 'ris';
      if (parsed.mode === 'overflow') return 'rio';
      if (parsed.mode === 'overflow-static') return 'rix';
    } catch {
      // fall through to string matching
    }
  }

  if (rawValue.includes('overflow-static')) return 'rix';
  if (rawValue.includes('overflow')) return 'rio';
  if (rawValue.includes('surface')) return 'ris';
  throw new Error(
    `Unable to resolve ripple bucket for style key "${key}". Expected mode: surface|overflow|overflow-static.`
  );
}
// [RIPPLE EFFECT 14] END: Ripple bucket compaction for class-map payload.

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
  const core: ComponentClassNameMap = {};
  const palettes: Record<string, ComponentClassNameMap> = {};

  const ensurePaletteElement = (
    bundleKey: string,
    componentName: string,
    variantName: string | undefined,
    elementName: string
  ): Record<string, unknown> => {
    if (!palettes[bundleKey]) palettes[bundleKey] = {};
    if (!palettes[bundleKey][componentName]) {
      palettes[bundleKey][componentName] = variantName ? {} : {};
    }
    const componentEntry = palettes[bundleKey][componentName] as Record<string, unknown>;
    const target = variantName
      ? ((componentEntry[variantName] as Record<string, unknown> | undefined) ??
        (componentEntry[variantName] = {}))
      : componentEntry;
    if (!target[elementName]) {
      target[elementName] = {};
    }
    return target[elementName] as Record<string, unknown>;
  };

  const processElements = (
    componentName: string,
    elements: Record<string, any>,
    coreTarget: Record<string, ClassNameByElement>,
    variantName?: string
  ) => {
    for (const elementName of Object.keys(elements)) {
      const el = elements[elementName];

      // Core (no palettes) — aggregate:
      // - decorations into `d` (always-on),
      // - effects into `e` per interaction state (opt-in),
      // - scales (size variants only) into `s`,
      // - width-only scales into `w`.
      const dSet = new Set<string>();
      const sMap = new Map<string, Set<string>>();
      const wMap = new Map<string, Set<string>>();
      const rMap = new Map<string, Set<string>>();
      const rpMap = new Map<string, Set<string>>();
      const rsMap = new Map<string, Set<string>>();
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
            // Keep compact bucket keys (1-3 chars) for minimal payload.
            let bucket: string;
            if (key.startsWith('shadow')) bucket = 'h';
            else if (key.startsWith('borderRadiusRounded')) bucket = 'rr';
            else if (key.startsWith('borderRadiusPill')) bucket = 'rp';
            else if (key.startsWith('borderRadiusSquare')) bucket = 'rs';
            // [RIPPLE EFFECT 15] START: Assign ripple style keys to compact ripple buckets.
            else if (key.startsWith('ripple')) bucket = rippleBucketForKey(key);
            // [RIPPLE EFFECT 15] END: Assign ripple style keys to compact ripple buckets.
            else bucket = 'x';

            if (!eBuckets.has(bucket)) eBuckets.set(bucket, new Set());
            eBuckets.get(bucket)!.add(cls);
          }
        }
      }

      // scales → s[size] (generic scale variants), width-only scales → w[size]
      if (el.scales) {
        for (const [size, raw] of Object.entries(el.scales as Record<string, unknown>)) {
          const arr = Array.isArray(raw) ? (raw as string[]) : undefined;
          // Web artifact optimization: strip "s:" prefix from size keys (e.g. "s:md:1" -> "md:1").
          const sizeKey = size.startsWith('s:') ? size.slice(2) : size;
          if (!arr || arr.length === 0) continue;

          for (const key of arr) {
            const cls = shortenMap[key] ?? key;
            const isOptInWidthScale =
              componentName === 'tabs' && elementName === 'e2' && key.startsWith('boxWidth');
            const target = isOptInWidthScale ? wMap : sMap;
            if (!target.has(sizeKey)) target.set(sizeKey, new Set());
            target.get(sizeKey)!.add(cls);
          }
        }
      }

      // radiusScales → r/rp/rs[size] (rounded/pill/square radius)
      if (el.radiusScales) {
        const applyRadiusMap = (
          target: Map<string, Set<string>>,
          bySize: Record<string, string[] | undefined> | undefined
        ) => {
          if (!bySize) return;
          for (const [size, arr] of Object.entries(bySize)) {
            const sizeKey = size.startsWith('s:') ? size.slice(2) : size;
            const mapped = mapArray(arr, shortenMap);
            if (!mapped || mapped.length === 0) continue;
            if (!target.has(sizeKey)) target.set(sizeKey, new Set());
            const set = target.get(sizeKey)!;
            mapped.forEach((c) => {
              set.add(c);
            });
          }
        };

        applyRadiusMap(rMap, el.radiusScales.rounded);
        applyRadiusMap(rpMap, el.radiusScales.pill);
        applyRadiusMap(rsMap, el.radiusScales.square);
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
            //   artifact incorrectly classify high/medium/low/lowest classes.
            //
            // By resolving metadata through `bundleKey`, we keep CSS dedupe intact while producing
            // correct per-palette `c[semantic].h|m|l|ll` buckets.
            const toneMetaForPalette = toneMetadataByPalette.get(bundleKey);
            const elemRecord = ensurePaletteElement(
              bundleKey,
              componentName,
              variantName,
              elementName
            );

            // Build color classes per semantic: c[semantic] = { h, m, l, ll }
            const colorBySemantic: Record<string, ColorClasses> = {};

            for (const sem of Object.keys(bySemantic)) {
              const byState = bySemantic[sem as SemanticColor];

              // Segregate classes by emphasis (or unique if no emphasis) per semantic
              const emphasisSets = new Map<ComponentEmphasis, Set<string>>();

              for (const stateKey of Object.keys(byState ?? {})) {
                const interactionState = stateKey as InteractionState;
                const styleKeys = byState?.[interactionState] as string[] | undefined;

                styleKeys?.forEach((styleKey: string) => {
                  const shortenedClass = shortenMap[styleKey] ?? styleKey;
                  const metaKey = `${sem}::${styleKey}`;
                  const meta = toneMetaForPalette?.get(metaKey);

                  const tones = meta?.tones ?? [];

                  // Do NOT move selected palette classes into core.cs. Always classify by emphasis/unique.
                  for (const tone of tones) {
                    if (!emphasisSets.has(tone)) emphasisSets.set(tone, new Set());
                    emphasisSets.get(tone)!.add(shortenedClass);
                  }

                  // No unique bucket; all component colors must declare emphasis.
                });
              }

              const colorClasses: ColorClasses = {};
              for (const [tone, set] of emphasisSets.entries()) {
                if (set.size === 0) continue;
                const bucket = componentEmphasisBuckets[tone];
                (colorClasses as Record<string, string>)[bucket] = Array.from(set).join(' ');
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
      coreTarget[elementName] = {
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
            : undefined,
        w:
          wMap.size > 0
            ? Object.fromEntries(
                Array.from(wMap.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined,
        r:
          rMap.size > 0
            ? Object.fromEntries(
                Array.from(rMap.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined,
        rp:
          rpMap.size > 0
            ? Object.fromEntries(
                Array.from(rpMap.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined,
        rs:
          rsMap.size > 0
            ? Object.fromEntries(
                Array.from(rsMap.entries()).map(([k, set]) => [
                  k,
                  set.size ? Array.from(set).join(' ') : undefined
                ])
              )
            : undefined
      };
    }
  };

  for (const componentName of Object.keys(styleKeys)) {
    const elements = styleKeys[componentName as ComponentName];
    if (!elements) continue;

    if (isElementMap(elements)) {
      core[componentName] = {};
      processElements(
        componentName,
        elements,
        core[componentName] as Record<string, ClassNameByElement>
      );
      continue;
    }

    const variantMap = elements as Record<string, any>;
    const coreVariants: Record<string, Record<string, ClassNameByElement>> = {};
    core[componentName] = coreVariants;
    for (const [variantName, variantElements] of Object.entries(variantMap)) {
      if (!variantElements || !isElementMap(variantElements)) continue;
      coreVariants[variantName] = {};
      processElements(componentName, variantElements, coreVariants[variantName], variantName);
    }
  }

  return { core, palettes };
}
