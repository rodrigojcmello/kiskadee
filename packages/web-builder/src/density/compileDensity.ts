import {
  breakpoints,
  type ComponentClassNameMapJSON,
  DENSITY_BREAKPOINT,
  type DensityScaleMap,
  type DensityScaleMapJSON,
  REGULAR_DENSITY_BREAKPOINT,
  type Schema
} from '@kiskadee/core';
import { parseDensityScaleMap } from '@kiskadee/core/density-contract';
import postcss, { type ChildNode, type Container, type Rule } from 'postcss';

export const DENSITY_COMPONENTS = [
  'badge',
  'bottomSheet',
  'button',
  'chip',
  'dropdown',
  'icon',
  'progress',
  'slider',
  'switch',
  'tabs',
  'textField'
] as const;

export type CompiledDensityMaps = Partial<
  Record<(typeof DENSITY_COMPONENTS)[number], DensityScaleMapJSON>
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function validateFixedRecipes(value: unknown, path: string): void {
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('bp:')) {
      throw new Error(
        `${path}.${key}: component sizes must be fixed; configure density instead of size breakpoints.`
      );
    }
    validateFixedRecipes(child, `${path}.${key}`);
  }
}

export function resolveSchemaDensityMaps(schema: Schema): CompiledDensityMaps {
  const globalMap = schema.global?.density;
  if (globalMap !== undefined) parseDensityScaleMap(globalMap);
  const result: CompiledDensityMaps = {};
  for (const name of DENSITY_COMPONENTS) {
    const component = schema.components?.[name];
    if (!component) continue;
    const value = component.options?.density ?? globalMap;
    if (value === undefined) continue;
    let map: DensityScaleMap;
    try {
      map = parseDensityScaleMap(value);
    } catch (error) {
      throw new Error(`components.${name}.options.density: ${String(error)}`);
    }
    for (const key of ['elements', 'variants'] as const) {
      if (key in component)
        validateFixedRecipes(component[key as keyof typeof component], `components.${name}.${key}`);
    }
    result[name] = {
      ...(map.compact ? { c: map.compact.slice(2) } : {}),
      ...(map.regular ? { r: map.regular.slice(2) } : {}),
      ...(map.spacious ? { s: map.spacious.slice(2) } : {})
    };
  }
  return result;
}

function visitElementMaps(
  value: unknown,
  visit: (elements: Record<string, unknown>) => void
): void {
  if (!isRecord(value)) return;
  if (Object.keys(value).some((key) => /^e\d+$/.test(key))) {
    visit(value);
    return;
  }
  for (const child of Object.values(value)) visitElementMaps(child, visit);
}

/**
 * Adds adaptive references to existing size buckets. Fixed utilities remain reusable; only
 * differing classes receive media-scoped aliases, including opt-in effects and projections.
 */
export function compileDensityClassMaps(
  classMap: ComponentClassNameMapJSON,
  maps: CompiledDensityMaps
) {
  const aliases = {
    compact: new Map<string, string>(),
    spacious: new Map<string, string>(),
    regular: new Map<string, string>(),
    mobile: new Map<string, string>()
  };
  const alias = (name: string, mode: keyof typeof aliases): string => {
    const current = aliases[mode].get(name);
    if (current) return current;
    const result = `${name}-${{ compact: 'dc', spacious: 'ds', regular: 'dr', mobile: 'dm' }[mode]}`;
    aliases[mode].set(name, result);
    return result;
  };
  const addAdaptiveBucket = (bucket: unknown, map: DensityScaleMapJSON): void => {
    if (!isRecord(bucket)) return;
    if (!Object.keys(bucket).some((key) => /^(sm|md|lg):[1-5]$/.test(key))) {
      for (const value of Object.values(bucket)) addAdaptiveBucket(value, map);
      return;
    }
    const modes = map.r
      ? { compact: map.c ?? map.r, regular: map.r, mobile: map.s ?? map.r }
      : { compact: map.c ?? map.s!, spacious: map.s ?? map.c! };
    const selections = Object.entries(modes).map(([mode, size]) => ({
      mode: mode as keyof typeof aliases,
      classes: String(bucket[size] ?? '')
        .split(/\s+/)
        .filter(Boolean)
    }));
    const common = selections[0].classes.filter((name) =>
      selections.every(({ classes }) => classes.includes(name))
    );
    const adaptive = [
      ...common,
      ...selections.flatMap(({ mode, classes }) =>
        classes.filter((name) => !common.includes(name)).map((name) => alias(name, mode))
      )
    ].join(' ');
    if (adaptive) bucket.a = adaptive;
  };
  for (const [name, map] of Object.entries(maps)) {
    visitElementMaps(classMap[name], (elements) => {
      const supported = new Set<string>();
      const collect = (value: unknown): void => {
        if (!isRecord(value)) return;
        for (const [key, child] of Object.entries(value)) {
          if (/^(sm|md|lg):[1-5]$/.test(key)) supported.add(key);
          else collect(child);
        }
      };
      for (const element of Object.values(elements)) {
        if (isRecord(element)) collect(element.s);
      }
      if (supported.size === 0) supported.add('md:1');
      for (const size of Object.values(map)) {
        if (!supported.has(size)) {
          throw new Error(
            `Density for ${name} references unavailable size ${size} in an element variant.`
          );
        }
      }
      for (const element of Object.values(elements)) {
        if (!isRecord(element)) continue;
        for (const bucket of ['s', 'w', 'rr', 'rp', 'rs', 'e', 'p', 'l']) {
          addAdaptiveBucket(element[bucket], map);
        }
      }
    });
  }
  return aliases;
}

function cloneMatchingRules(container: Container, aliases: Map<string, string>): ChildNode[] {
  const result: ChildNode[] = [];
  for (const node of container.nodes ?? []) {
    if (node.type === 'rule') {
      const rule = node as Rule;
      const selectors: string[] = [];
      for (const selector of rule.selectors) {
        let matched = false;
        const rewritten = selector.replace(/\.([a-zA-Z_][\w-]*)/g, (match, name: string) => {
          const alias = aliases.get(name);
          if (!alias) return match;
          matched = true;
          return `.${alias}`;
        });
        if (matched) selectors.push(rewritten);
      }
      if (selectors.length) result.push(rule.clone({ selectors }));
    } else if (node.type === 'atrule' && node.nodes) {
      const children = cloneMatchingRules(node, aliases);
      if (children.length) result.push(node.clone({ nodes: children }));
    }
  }
  return result;
}

/** Build-only CSS lowering; no viewport observer or density selector is shipped to React. */
export function appendDensityCss(
  css: string,
  aliases: ReturnType<typeof compileDensityClassMaps>
): string {
  if (Object.values(aliases).every((map) => !map.size)) return css;
  const root = postcss.parse(css);
  const width = breakpoints[DENSITY_BREAKPOINT]!;
  const regularWidth = breakpoints[REGULAR_DENSITY_BREAKPOINT]!;
  const queries = {
    compact: `(width >= ${width}px)`,
    spacious: `(width < ${width}px)`,
    regular: `(${regularWidth}px <= width < ${width}px)`,
    mobile: `(width < ${regularWidth}px)`
  };
  for (const mode of ['compact', 'spacious', 'regular', 'mobile'] as const) {
    const nodes = cloneMatchingRules(root, aliases[mode]);
    if (!nodes.length) continue;
    root.append(
      postcss.atRule({
        name: 'media',
        params: queries[mode],
        nodes
      })
    );
  }
  return root.toString();
}
