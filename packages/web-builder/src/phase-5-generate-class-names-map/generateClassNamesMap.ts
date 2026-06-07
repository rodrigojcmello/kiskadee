import type {
  ClassNameByElementJSON,
  ColorClasses,
  ComponentClassNameMapJSON,
  ComponentClassNameMapSplitJSON,
  ComponentEmphasis,
  ComponentName,
  ComponentStyleKeyMap
} from '@kiskadee/core';
import { componentEmphasisBuckets } from '@kiskadee/core';
import {
  buildScopedToneMetadataKey,
  type ToneMetadataByPalette
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import type { WebStyleEmissionPolicy } from '../style-emission/web-build-policy.ts';
import {
  canonicalizeWebStyleKeyIdentity,
  resolveWebStyleKeyIdentity,
  type WebStyleIdentityOptimizationOptions
} from '../style-emission/web-style-key-identity.ts';

// Shortened keys for optimization (Phase 5 artifact schema):
// d = decorations (always-on, flattened string)
// e = effects by interaction state (arrays of classes, opt-in at component level)
// s = scales (size variants only, flattened strings per size)
// w = width-only scales (opt-in at component level, flattened strings per size)
// c = color classes (organized by emphasis: h/m/l/ll)
// cs = control states (selected)
export type ClassNameByElement = ClassNameByElementJSON;
export type ComponentClassNameMap = ComponentClassNameMapJSON;
export type ComponentClassNameMapSplit = ComponentClassNameMapSplitJSON;

type ElementStyleKeyRecord = {
  decorations?: string[];
  effects?: Record<string, string[] | undefined>;
  scales?: Record<string, unknown>;
  radiusScales?: Partial<Record<string, Record<string, string[] | undefined>>>;
  palettes?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isElementMap(value: unknown): value is Record<string, ElementStyleKeyRecord> {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  const elementKeys = ['decorations', 'effects', 'scales', 'radiusScales', 'palettes'];
  return elementKeys.some((key) => key in first);
}

function getOrCreateSet(map: Map<string, Set<string>>, key: string): Set<string> {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  return set;
}

function isNestedVariantModeMap(
  value: unknown
): value is Record<string, Record<string, ElementStyleKeyRecord>> {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  return isElementMap(first);
}

function mapArray(
  keys: string[] | undefined,
  resolveClassName: (key: string) => string
): string[] | undefined {
  if (!keys) return undefined;
  return keys.map((k) => resolveClassName(k));
}

function extractSizeKeyFromStyleKey(styleKey: string): string | undefined {
  const head = styleKey.split('__')[0] ?? '';
  const sizeIndex = head.indexOf('++');
  if (sizeIndex === -1) return undefined;

  const rawSize = head.slice(sizeIndex + 2).split('::')[0];
  if (!rawSize) return undefined;

  return rawSize.startsWith('s:') ? rawSize.slice(2) : rawSize;
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
  toneMetadataByPalette: ToneMetadataByPalette,
  options?: {
    webStyleEmissionPolicy?: WebStyleEmissionPolicy;
  } & WebStyleIdentityOptimizationOptions
): ComponentClassNameMapSplit {
  const core: ComponentClassNameMap = {};
  const palettes: Record<string, ComponentClassNameMap> = {};
  const knownIdentities = new Set(Object.keys(shortenMap));

  const ensurePaletteElement = (
    bundleKey: string,
    componentName: string,
    variantName: string | undefined,
    modeName: string | undefined,
    elementName: string
  ): ClassNameByElement => {
    if (!palettes[bundleKey]) palettes[bundleKey] = {};
    if (!palettes[bundleKey][componentName]) {
      palettes[bundleKey][componentName] = variantName ? {} : {};
    }
    const componentEntry = palettes[bundleKey][componentName] as Record<string, unknown>;
    const variantTarget = variantName
      ? ((componentEntry[variantName] as Record<string, unknown> | undefined) ??
        // biome-ignore lint/suspicious/noAssignInExpressions: initializes the nested variant record inline
        (componentEntry[variantName] = {}))
      : componentEntry;
    const target = modeName
      ? ((variantTarget[modeName] as Record<string, unknown> | undefined) ??
        // biome-ignore lint/suspicious/noAssignInExpressions: initializes the nested mode record inline
        (variantTarget[modeName] = {}))
      : variantTarget;
    if (!target[elementName]) {
      target[elementName] = {};
    }
    return target[elementName] as ClassNameByElement;
  };

  const processElements = (
    componentName: string,
    elements: Record<string, ElementStyleKeyRecord>,
    coreTarget: Record<string, ClassNameByElement>,
    variantName?: string,
    modeName?: string
  ) => {
    for (const elementName of Object.keys(elements)) {
      const el = elements[elementName];
      const resolveClassName = (key: string) => {
        const localIdentity = resolveWebStyleKeyIdentity(
          key,
          options?.webStyleEmissionPolicy,
          componentName,
          elementName,
          variantName
        );
        const canonicalIdentity = canonicalizeWebStyleKeyIdentity(localIdentity, knownIdentities, {
          collapseDirectIntoMirrored: options?.collapseDirectIntoMirrored
        });
        return shortenMap[canonicalIdentity] ?? key;
      };

      // Core (no palettes) — aggregate:
      // - decorations into `d` (always-on),
      // - effects into `e` per interaction state (opt-in),
      // - scales (size variants only) into `s`,
      // - width-only scales into `w`.
      const dSet = new Set<string>();
      const sMap = new Map<string, Set<string>>();
      const wMap = new Map<string, Set<string>>();
      const rrMap = new Map<string, Set<string>>();
      const rpMap = new Map<string, Set<string>>();
      const rsMap = new Map<string, Set<string>>();
      // Effects buckets (by effect kind), excluding selected/control-state.
      const eBuckets = new Map<string, Set<string>>();
      const eSizedBuckets = new Map<string, Map<string, Set<string>>>();
      // Control-state: selected — kept as a dedicated field (`l`) but must NOT include effects.
      // Control-state is expressed via runtime activators (e.g. `-s -a`) and palette/state rules.
      // Effects that happen to be authored under `selected*` interaction states must remain effects
      // and therefore must stay in `e` buckets (opt-in via component props like `radius`).
      const selectedSet = new Set<string>();

      // decorations → d
      mapArray(el.decorations, resolveClassName)?.forEach((c) => {
        dSet.add(c);
      });

      // effects → e (bucketized; never merge effects into d/s)
      if (el.effects) {
        for (const st of Object.keys(el.effects)) {
          const arr = el.effects[st];
          if (!arr || arr.length === 0) continue;
          for (const key of arr) {
            const cls = resolveClassName(key);

            // IMPORTANT:
            // Do not treat `selected*` interaction states as control-state (`l`).
            // `l` is reserved for control-state-only classes, while interaction-driven changes
            // (including selected-specific effects like MD3 animated corners) remain effects.

            // Bucket by effect family inferred from the style key prefix.
            // Keep compact bucket keys (1-3 chars) for minimal payload.
            let bucket: string;
            if (key.startsWith('activationFeedback')) bucket = 'af';
            else if (key.startsWith('shadow')) bucket = 'h';
            else if (key.startsWith('borderRadiusRounded')) bucket = 'rr';
            else if (key.startsWith('borderRadiusPill')) bucket = 'rp';
            else if (key.startsWith('borderRadiusSquare')) bucket = 'rs';
            else if (key.startsWith('thumbShrink')) bucket = 'ts';
            // [RIPPLE EFFECT 15] START: Assign ripple style keys to compact ripple buckets.
            else if (key.startsWith('ripple')) bucket = rippleBucketForKey(key);
            // [RIPPLE EFFECT 15] END: Assign ripple style keys to compact ripple buckets.
            else bucket = 'x';

            const sizeKey = extractSizeKeyFromStyleKey(key);
            const isSizeAwareEffectBucket =
              bucket === 'rr' || bucket === 'rp' || bucket === 'rs' || bucket === 'ts';

            if (isSizeAwareEffectBucket) {
              const bySize = eSizedBuckets.get(bucket) ?? new Map<string, Set<string>>();
              if (!eSizedBuckets.has(bucket)) {
                eSizedBuckets.set(bucket, bySize);
              }
              getOrCreateSet(bySize, sizeKey ?? 'all').add(cls);
              continue;
            }

            getOrCreateSet(eBuckets, bucket).add(cls);
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
            const cls = resolveClassName(key);
            const isOptInWidthScale =
              componentName === 'tabs' && elementName === 'e2' && key.startsWith('boxWidth');
            const target = isOptInWidthScale ? wMap : sMap;
            getOrCreateSet(target, sizeKey).add(cls);
          }
        }
      }

      // radiusScales → rr/rp/rs[size] (rounded/pill/square radius)
      if (el.radiusScales) {
        const applyRadiusMap = (
          target: Map<string, Set<string>>,
          bySize: Record<string, string[] | undefined> | undefined
        ) => {
          if (!bySize) return;
          for (const [size, arr] of Object.entries(bySize)) {
            const sizeKey = size.startsWith('s:') ? size.slice(2) : size;
            const mapped = mapArray(arr, resolveClassName);
            if (!mapped || mapped.length === 0) continue;
            const set = getOrCreateSet(target, sizeKey);
            mapped.forEach((c) => {
              set.add(c);
            });
          }
        };

        applyRadiusMap(rrMap, el.radiusScales.rounded);
        applyRadiusMap(rpMap, el.radiusScales.pill);
        applyRadiusMap(rsMap, el.radiusScales.square);
      }
      // Palettes split per segment.theme; segregate by emphasis (unique/soft/solid)
      if (el.palettes) {
        // `el.palettes` is typed with a constrained key union in @kiskadee/core
        // but in practice schemas may use arbitrary segment keys. Treat it as a
        // string-keyed record for artifact generation.
        const palettesBySegment = el.palettes;

        for (const segmentName of Object.keys(palettesBySegment)) {
          const segmentThemes = palettesBySegment[segmentName];
          if (!isRecord(segmentThemes)) continue;

          for (const themeName of Object.keys(segmentThemes)) {
            const bySemantic = segmentThemes[themeName];
            if (!isRecord(bySemantic)) continue;

            // Create a composite key: segment.theme (e.g., "ios.light", "ios.dark")
            const bundleKey = `${segmentName}.${themeName}`;

            // IMPORTANT:
            // `toneMetadataByPalette` is scoped by palette (segment + theme) and element ownership.
            //
            // Rationale:
            // - The same StyleKey can be used across multiple palettes because StyleKey encodes
            //   the final CSS rule/value and must remain globally deduplicable.
            // - However, the component emphasis bucket (high/medium/low/lowest) is semantic
            //   metadata and is allowed to differ per palette and per component element. If we used a single global
            //   metadata map keyed only by StyleKey, emphasis could "leak" from one consumer to
            //   another and make the JSON artifact incorrectly classify high/medium/low/lowest classes.
            //
            // By resolving metadata through `bundleKey` plus the current component/variant/element,
            // we keep CSS dedupe intact while producing correct `c[semantic].h|m|l|ll` buckets.
            const toneMetaForPalette = toneMetadataByPalette.get(bundleKey);
            const elemRecord = ensurePaletteElement(
              bundleKey,
              componentName,
              variantName,
              modeName,
              elementName
            );

            // Build color classes per semantic: c[semantic] = { h, m, l, ll }
            const colorBySemantic: Record<string, ColorClasses> = {};

            for (const sem of Object.keys(bySemantic)) {
              const byState = bySemantic[sem];
              if (!isRecord(byState)) continue;

              // Segregate classes by emphasis (or unique if no emphasis) per semantic
              const emphasisSets = new Map<ComponentEmphasis, Set<string>>();

              for (const rawStyleKeys of Object.values(byState)) {
                const styleKeys = Array.isArray(rawStyleKeys)
                  ? rawStyleKeys.filter(
                      (styleKey): styleKey is string => typeof styleKey === 'string'
                    )
                  : undefined;

                styleKeys?.forEach((styleKey: string) => {
                  const shortenedClass = resolveClassName(styleKey);
                  const metaKey = buildScopedToneMetadataKey(
                    {
                      componentName,
                      variantName,
                      modeName,
                      elementName
                    },
                    `${sem}::${styleKey}`
                  );
                  const meta = toneMetaForPalette?.get(metaKey);

                  const tones = meta?.tones ?? [];

                  // Do NOT move selected palette classes into core.cs. Always classify by emphasis/unique.
                  for (const tone of tones) {
                    getOrCreateSet(emphasisSets, tone).add(shortenedClass);
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
              elemRecord.c = colorBySemantic;
            }
          }
        }
      }

      // After processing palettes, finalize the core element record so `cs` includes palette-derived selected classes
      coreTarget[elementName] = {
        d: dSet.size ? Array.from(dSet).join(' ') : undefined,
        e:
          eBuckets.size > 0 || eSizedBuckets.size > 0
            ? {
                ...Object.fromEntries(
                  Array.from(eBuckets.entries()).map(([k, set]) => [
                    k,
                    set.size ? Array.from(set).join(' ') : undefined
                  ])
                ),
                ...Object.fromEntries(
                  Array.from(eSizedBuckets.entries()).map(([bucket, bySize]) => [
                    bucket,
                    Object.fromEntries(
                      Array.from(bySize.entries()).map(([sizeKey, set]) => [
                        sizeKey,
                        set.size ? Array.from(set).join(' ') : undefined
                      ])
                    )
                  ])
                )
              }
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
        rr:
          rrMap.size > 0
            ? Object.fromEntries(
                Array.from(rrMap.entries()).map(([k, set]) => [
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

    const variantMap = elements as Record<string, unknown>;
    const coreVariants: Record<
      string,
      Record<string, ClassNameByElement> | Record<string, Record<string, ClassNameByElement>>
    > = {};
    core[componentName] = coreVariants;
    for (const [variantName, variantElements] of Object.entries(variantMap)) {
      if (!variantElements) continue;

      if (isElementMap(variantElements)) {
        coreVariants[variantName] = {};
        processElements(
          componentName,
          variantElements,
          coreVariants[variantName] as Record<string, ClassNameByElement>,
          variantName
        );
        continue;
      }

      if (!isNestedVariantModeMap(variantElements)) continue;
      const modeMap = variantElements as Record<string, Record<string, ElementStyleKeyRecord>>;
      const coreModes: Record<string, Record<string, ClassNameByElement>> = {};
      coreVariants[variantName] = coreModes;
      for (const [modeName, modeElements] of Object.entries(modeMap)) {
        if (!modeElements || !isElementMap(modeElements)) continue;
        coreModes[modeName] = {};
        processElements(componentName, modeElements, coreModes[modeName], variantName, modeName);
      }
    }
  }

  return { core, palettes };
}
