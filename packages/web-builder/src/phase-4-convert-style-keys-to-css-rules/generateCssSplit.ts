import type {
  ComponentName,
  ComponentStyleKeyMap,
  ElementAllSizeValue,
  ElementSizeValue,
  InteractionState,
  SemanticColor,
  ThemeMode
} from '@kiskadee/core';
import { createKiskadeePostcssPlugins } from '@kiskadee/css-build';
import postcss from 'postcss';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';
import {
  resolveElementStyleEmissionPolicy,
  type WebStyleEmissionPolicy
} from '../style-emission/web-build-policy';
import {
  applyCanonicalStyleEmissionPolicy,
  canonicalizeWebStyleKeyIdentity,
  resolveWebStyleKeyIdentity,
  type WebStyleIdentityOptimizationOptions
} from '../style-emission/web-style-key-identity';
import {
  type GenerateCssRuleFromStyleKeyOptions,
  generateCssRuleFromStyleKey
} from './generateCss';
import { transformColorKeyToCss } from './palettes/transformColorKeyToCss';

export type GenerateCssSplitOptions = {
  forceState?: boolean;
  webStyleEmissionPolicy?: WebStyleEmissionPolicy;
} & GenerateCssRuleFromStyleKeyOptions &
  WebStyleIdentityOptimizationOptions;

export type SplitCssBundles = {
  coreCss: string;
  effectsCss: string; // new: effects separated from core
  palettes: Record<string, string>;
};

// Policy switch: whether to emit passive (non-gated) effects rules.
// Default false — effects must be gated by class activator (.-a, .-h, .-f, .-p, .-s, .-d, .-r)
// or a native pseudo (:hover, :focus, :active, etc.). Passive effects are ignored to avoid dead CSS.
const EMIT_PASSIVE_EFFECTS = false;

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

export async function generateCssSplit(
  styleKeys: ComponentStyleKeyMap,
  shortenMap: ShortenCssClassNames,
  forceStateOrOptions?: boolean | GenerateCssSplitOptions
): Promise<SplitCssBundles> {
  const options: GenerateCssSplitOptions | undefined =
    typeof forceStateOrOptions === 'boolean'
      ? { forceState: forceStateOrOptions }
      : forceStateOrOptions;

  const forceState = options?.forceState;
  const coreRules: Set<string> = new Set();
  const effectsRules: Set<string> = new Set(); // collect effects separately
  const paletteRules: Record<string, Set<string>> = {};
  const knownIdentities = new Set(Object.keys(shortenMap));

  // Helper: detect if a CSS rule is "gated" by interaction/state.
  // We consider a selector complex (i.e., gated) when:
  // - It uses native interaction pseudos like :hover, :focus, :focus-visible, :focus-within, :active,
  //   :disabled, :read-only. These represent runtime UI states and must live outside the core bundle.
  // - It uses our forced state classes (.-a, .-h, .-f, .-p, .-s, .-d, .-r), which act as explicit activators
  //   to simulate states or opt-in effects via class toggling. Examples:
  //   .btn.-h:hover, .card.-a, .chip.-s.-a .icon, etc.
  // If neither applies, the selector is "simple" (passive): no activation, always-on if emitted.
  const isComplexSelector = (rule: string): boolean => {
    // Native pseudos
    if (/:(hover|focus|focus-visible|focus-within|active|disabled|read-only)\b/.test(rule))
      return true;
    // Forced state classes (activation gate via class names)
    return /\.-[a-z]\b/.test(rule);
  };

  const consumeElements = (
    componentName: string,
    elements: Record<string, any>,
    variantName?: string
  ) => {
    for (const elementName in elements) {
      const el = elements[elementName];
      const localStyleEmissionPolicy = resolveElementStyleEmissionPolicy(
        options?.webStyleEmissionPolicy,
        componentName,
        elementName,
        variantName
      );
      const resolveCssClass = (key: string) => {
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
        const styleEmissionPolicy = applyCanonicalStyleEmissionPolicy(
          key,
          localStyleEmissionPolicy,
          canonicalIdentity,
          {
            collapseDirectIntoMirrored: options?.collapseDirectIntoMirrored
          }
        );

        return {
          className: shortenMap[canonicalIdentity] ?? key,
          styleEmissionPolicy
        };
      };

      // decorations: string[] — always-on, static styles (no state). Safe to emit into core.
      if (Array.isArray(el.decorations)) {
        for (const key of el.decorations) {
          const { className, styleEmissionPolicy } = resolveCssClass(key);
          const rule = generateCssRuleFromStyleKey(key, className, forceState, {
            ...options,
            styleEmissionPolicy
          });
          if (rule && rule.trim() !== '') coreRules.add(rule);
        }
      }

      // scales: Record<string, string[]> — static size variants (no interaction). Also go to core.
      if (el.scales) {
        for (const scaleKey in el.scales) {
          const arr: string[] = el.scales[scaleKey as ElementSizeValue | ElementAllSizeValue] ?? [];
          for (const key of arr) {
            const { className, styleEmissionPolicy } = resolveCssClass(key);
            const rule = generateCssRuleFromStyleKey(key, className, forceState, {
              ...options,
              styleEmissionPolicy
            });
            if (rule && rule.trim() !== '') coreRules.add(rule);
          }
        }
      }

      // radiusScales: border-radius scales by mode (size variants). Also go to the core.
      if (el.radiusScales) {
        for (const bySize of Object.values(el.radiusScales as Record<string, unknown>)) {
          if (!isRecord(bySize)) continue;
          const bySizeRecord = bySize as Partial<
            Record<ElementSizeValue | ElementAllSizeValue, string[]>
          >;
          for (const scaleKey in bySizeRecord) {
            const arr: string[] =
              bySizeRecord[scaleKey as ElementSizeValue | ElementAllSizeValue] ?? [];
            for (const key of arr) {
              const { className, styleEmissionPolicy } = resolveCssClass(key);
              const rule = generateCssRuleFromStyleKey(key, className, forceState, {
                ...options,
                styleEmissionPolicy
              });
              if (rule && rule.trim() !== '') coreRules.add(rule);
            }
          }
        }
      }

      // effects: by interaction state -> string[]
      // Policy: effects are opt-in (activatable). We only emit rules that are gated by native
      // pseudos or forced state classes. Simple (passive) effects are ignored by default to avoid
      // shipping dead CSS; they should live under `decorations` instead if always-on.
      if (el.effects) {
        for (const st in el.effects) {
          const arr: string[] = el.effects[st as InteractionState] ?? [];
          for (const key of arr) {
            const { className, styleEmissionPolicy } = resolveCssClass(key);
            const rule = generateCssRuleFromStyleKey(key, className, forceState, {
              ...options,
              styleEmissionPolicy
            });
            if (rule && rule.trim() !== '') {
              if (isComplexSelector(rule)) {
                // Gated by class activator or native pseudo → goes to effects bundle
                effectsRules.add(rule);
              } else if (EMIT_PASSIVE_EFFECTS) {
                // Debug/override: still emit passive effects, but keep them in effects bundle
                // to avoid polluting core with stateful semantics.
                effectsRules.add(rule);
              } else {
                // Passive effect (no gate): do not emit. This enforces the contract that
                // effects are opt-in. Consider moving this style key to `decorations` if it is
                // truly always-on.
              }
            }
          }
        }
      }

      // palettes: segmentName -> themeName -> semantic -> interactionState -> string[] (color keys only)
      if (el.palettes) {
        for (const segmentName of Object.keys(el.palettes) as Array<keyof typeof el.palettes>) {
          const themes = el.palettes[segmentName];
          if (!themes) continue;

          for (const themeName of Object.keys(themes) as ThemeMode[]) {
            const bySemantic = themes[themeName];
            if (!bySemantic) continue;

            // Create a composite key: segment.theme (e.g., "ios.light", "ios.dark")
            const bundleKey = `${String(segmentName)}.${themeName}`;
            if (!paletteRules[bundleKey]) paletteRules[bundleKey] = new Set();

            for (const sem in bySemantic) {
              const byState = bySemantic[sem as SemanticColor];
              for (const st in byState) {
                const arr: string[] = byState[st as InteractionState] ?? [];
                for (const key of arr) {
                  const { className, styleEmissionPolicy } = resolveCssClass(key);
                  // Only color keys are expected here; call color transformer directly and pass the forceState flag
                  const rule = transformColorKeyToCss(key, className, forceState, {
                    ...options,
                    styleEmissionPolicy
                  });
                  if (rule && rule.trim() !== '') paletteRules[bundleKey].add(rule);
                }
              }
            }
          }
        }
      }
    }
  };

  // Walk through all style keys by component/element to preserve palette grouping
  for (const componentName in styleKeys) {
    const elements = styleKeys[componentName as ComponentName];
    if (!elements) continue;

    if (isElementMap(elements)) {
      consumeElements(componentName, elements);
      continue;
    }

    for (const [variantName, variantElements] of Object.entries(elements as Record<string, any>)) {
      if (!variantElements) continue;
      if (isElementMap(variantElements)) {
        consumeElements(componentName, variantElements, variantName);
      }
    }
  }

  // Build strings, sort for stability, and post-process media queries per bundle
  const coreRaw = Array.from(coreRules).sort().join('\n');
  const mediaQueryPostcssPlugins = createKiskadeePostcssPlugins({
    combineMediaQueries: true
  });
  const coreOut = await postcss(mediaQueryPostcssPlugins).process(coreRaw, { from: undefined });

  // CSS emission order rules (critical for overlapping native states like :hover vs :active)
  //
  // Rationale:
  // - Browsers keep :hover active while :active is also true during mouse press.
  // - Our selectors for parent-ref colors (.-i:hover .child and .-i:active .child) often have
  //   identical specificity. When both match, the one that appears LAST in the file wins.
  // - Design intent: pressed (:active) should take precedence over hover when both are active.
  //
  // Strategy:
  // - Always emit forced-only class rules (no native pseudos) first.
  // - Then emit native pseudo rules ordered by ascending precedence: focus < hover < active.
  //   This guarantees :active rules are printed last and therefore win ties in specificity.
  // - If multiple pseudos appear in the same selector, take the highest-precedence one.
  //
  // Note: This ordering is applied identically to both effects and palette bundles.
  const precedenceOf = (rule: string): number => {
    // 0 = forced-only/no native; 1 = focus; 2 = hover; 3 = active (printed last)
    // We match within @media wrappers as well.
    const isActive = /:(active)\b/.test(rule);
    if (isActive) return 3;
    const isHover = /:(hover)\b/.test(rule);
    if (isHover) return 2;
    const isFocus = /:(focus|focus-visible|focus-within)\b/.test(rule);
    if (isFocus) return 1;
    return 0;
  };

  const effectsRaw = Array.from(effectsRules)
    .sort((a, b) => {
      const wa = precedenceOf(a);
      const wb = precedenceOf(b);
      if (wa !== wb) return wa - wb; // ascending precedence; higher wins later in file
      return a.localeCompare(b);
    })
    .join('\n');
  const effectsOut = await postcss(mediaQueryPostcssPlugins).process(effectsRaw, {
    from: undefined
  });

  const palettes: Record<string, string> = {};
  for (const p in paletteRules) {
    const raw = Array.from(paletteRules[p])
      .sort((a, b) => {
        const wa = precedenceOf(a);
        const wb = precedenceOf(b);
        if (wa !== wb) return wa - wb; // forced/no-native first; then focus < hover < active
        return a.localeCompare(b);
      })
      .join('\n');
    const out = await postcss(mediaQueryPostcssPlugins).process(raw, { from: undefined });
    palettes[p] = out.css;
  }

  return { coreCss: coreOut.css, effectsCss: effectsOut.css, palettes };
}
