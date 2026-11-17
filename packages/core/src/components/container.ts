import { resolveColorVariantLeaves } from '../color-variant.ts';
import {
  type ContentSurfaceContextMap,
  validateContentSurfaceContextMap
} from '../content-surface-context.ts';
import type { Schema } from '../schema.ts';
import {
  type ComponentEmphasis,
  type ContainerIntent,
  ContainerIntentKeys,
  colorVariants,
  componentEmphasisBuckets,
  type SegmentName,
  type SolidColor,
  type SurfaceContext,
  type SurfaceContextPalette,
  surfaceContexts,
  type ThemeMode
} from '../types/colors/colors.types.ts';
import { normalizeHexColor } from '../utils/hexColor.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

export type ContainerRestPalette = Partial<
  Record<ContainerIntent, Partial<Record<ComponentEmphasis, { rest: SolidColor }>>>
>;

export type ContainerSurfaceElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  palettes: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, SurfaceContextPalette<{ boxColor: ContainerRestPalette }>>>
    >
  >;
};

export type ContainerElements<TSegmentName extends SegmentName = never> = {
  e1: ContainerSurfaceElementStyle<TSegmentName>;
};

export type ContainerSurfaceCatalogEntry = {
  intent: ContainerIntent;
  emphasis: ComponentEmphasis;
  /** Identifies the canonical backdrop for build-time content surface derivation. */
  referenceFor?: SurfaceContext;
};

export type ContainerCanonicalSurface = ContainerSurfaceCatalogEntry & {
  contentSurfaceContext: SurfaceContext;
};

type DerivedContainerCanonicalSurface = ContainerSurfaceCatalogEntry & {
  contentSurfaceContext?: never;
};

type ContainerSurfaceCatalog<TSegmentName extends SegmentName, TEntry> = Partial<
  Record<TSegmentName | 'default' | 'dynamic', Partial<Record<ThemeMode, readonly TEntry[]>>>
>;

export type ContainerOptions<TSegmentName extends SegmentName = never> = {
  canonicalSurfaces?: ContainerSurfaceCatalog<TSegmentName, ContainerCanonicalSurface>;
};

export type ContainerSurfaceDerivation = {
  derive: { element: 'e1'; property: 'boxColor' };
};

export type ManualContainerComponent<TSegmentName extends SegmentName = never> = {
  contentSurfaceContext: ContentSurfaceContextMap<ContainerIntent, TSegmentName>;
  elements: ContainerElements<TSegmentName>;
  options?: ContainerOptions<TSegmentName>;
};

export type DerivedContainerComponent<TSegmentName extends SegmentName = never> = {
  contentSurfaceContext: ContainerSurfaceDerivation;
  elements: ContainerElements<TSegmentName>;
  options: {
    canonicalSurfaces: ContainerSurfaceCatalog<TSegmentName, DerivedContainerCanonicalSurface>;
  };
};

export type ContainerComponent<TSegmentName extends SegmentName = never> =
  | ManualContainerComponent<TSegmentName>
  | DerivedContainerComponent<TSegmentName>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const themeModes = ['light', 'dark', 'darker'] as const satisfies readonly ThemeMode[];

function declaresDerivation(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || !Object.hasOwn(value, 'derive')) return false;
  // A custom segment can be named "derive" and hold the ordinary theme map.
  return (
    !isRecord(value.derive) ||
    Object.keys(value.derive).some((key) => !themeModes.some((theme) => theme === key))
  );
}

export function isDerivedContainerSurfaceContext(
  value: unknown
): value is ContainerSurfaceDerivation {
  return (
    declaresDerivation(value) &&
    Object.keys(value).length === 1 &&
    isRecord(value.derive) &&
    Object.keys(value.derive).length === 2 &&
    value.derive.element === 'e1' &&
    value.derive.property === 'boxColor'
  );
}

export function isDerivedContainerComponent<TSegmentName extends SegmentName>(
  value: ContainerComponent<TSegmentName>
): value is DerivedContainerComponent<TSegmentName> {
  return isDerivedContainerSurfaceContext(value.contentSurfaceContext);
}

function allowKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  path: string,
  issues: string[]
) {
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  }
}

function atPath(value: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>(
    (current, key) => (isRecord(current) ? current[key] : undefined),
    value
  );
}

function validateCanonicalSurfaces(
  options: Record<string, unknown>,
  palettes: unknown,
  path: string,
  issues: string[],
  derived: boolean
): void {
  allowKeys(options, ['canonicalSurfaces'], path, issues);
  if (options.canonicalSurfaces === undefined) {
    if (derived) issues.push(`${path}.canonicalSurfaces: required for derivation`);
    return;
  }
  if (!isRecord(options.canonicalSurfaces)) {
    issues.push(`${path}.canonicalSurfaces: expected object`);
    return;
  }
  for (const [segment, themes] of Object.entries(options.canonicalSurfaces)) {
    const segmentPath = `${path}.canonicalSurfaces.${segment}`;
    if (!isRecord(themes)) {
      issues.push(`${segmentPath}: expected object`);
      continue;
    }
    allowKeys(themes, ['light', 'dark', 'darker'], segmentPath, issues);
    for (const [theme, entries] of Object.entries(themes)) {
      const themePath = `${segmentPath}.${theme}`;
      if (!Array.isArray(entries) || entries.length === 0) {
        issues.push(`${themePath}: expected non-empty array`);
        continue;
      }
      const seen = new Set<string>();
      const seenReferences = new Set<SurfaceContext>();
      for (const [index, entry] of entries.entries()) {
        const entryPath = `${themePath}.${index}`;
        if (!isRecord(entry)) {
          issues.push(`${entryPath}: expected object`);
          continue;
        }
        allowKeys(
          entry,
          derived
            ? ['intent', 'emphasis', 'referenceFor']
            : ['intent', 'emphasis', 'contentSurfaceContext', 'referenceFor'],
          entryPath,
          issues
        );
        const intent = String(entry.intent);
        const emphasis = String(entry.emphasis);
        if (!Object.hasOwn(ContainerIntentKeys, intent)) {
          issues.push(`${entryPath}.intent: expected Container intent`);
        }
        if (!Object.hasOwn(componentEmphasisBuckets, emphasis)) {
          issues.push(`${entryPath}.emphasis: expected component emphasis`);
        }
        if (!derived && !surfaceContexts.includes(entry.contentSurfaceContext as SurfaceContext)) {
          issues.push(`${entryPath}.contentSurfaceContext: expected onSubtle or onVivid`);
        }
        const referenceFor = entry.referenceFor;
        if (referenceFor !== undefined) {
          if (referenceFor !== 'onSubtle' && referenceFor !== 'onVivid') {
            issues.push(`${entryPath}.referenceFor: expected onSubtle or onVivid`);
          } else if (seenReferences.has(referenceFor)) {
            issues.push(`${entryPath}.referenceFor: duplicate reference for ${referenceFor}`);
          } else {
            seenReferences.add(referenceFor);
          }
        }
        const reference = `${intent}.${emphasis}`;
        if (seen.has(reference))
          issues.push(`${entryPath}: duplicate canonical surface "${reference}"`);
        seen.add(reference);
        const rest = atPath(palettes, [
          segment,
          theme,
          'onSubtle',
          'standard',
          'boxColor',
          intent,
          emphasis,
          'rest'
        ]);
        if (typeof rest !== 'string' || !rest.trim()) {
          issues.push(`${entryPath}: referenced Container boxColor.${reference}.rest is missing`);
        } else if (derived && referenceFor !== undefined) {
          try {
            const hex = normalizeHexColor(rest);
            if (hex.length === 9 && !hex.endsWith('ff')) throw new Error('transparent color');
          } catch {
            issues.push(`${entryPath}: canonical backdrop must be an opaque hex color`);
          }
        }
      }
      if (derived) {
        for (const context of surfaceContexts) {
          if (!seenReferences.has(context)) {
            issues.push(`${themePath}: missing referenceFor "${context}"`);
          }
        }
      }
    }
  }
}

/** Container owns passive surface Rest colors and the context it produces for descendants. */
export function validateContainerComponentContract(
  value: unknown,
  path = 'components.container'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];
  allowKeys(value, ['contentSurfaceContext', 'elements', 'options'], path, issues);
  const derived = declaresDerivation(value.contentSurfaceContext);
  if (value.contentSurfaceContext === undefined) {
    issues.push(`${path}.contentSurfaceContext: required map or derivation`);
  } else if (derived) {
    if (!isDerivedContainerSurfaceContext(value.contentSurfaceContext)) {
      issues.push(
        `${path}.contentSurfaceContext: expected { derive: { element: "e1", property: "boxColor" } }`
      );
    }
  } else {
    issues.push(
      ...validateContentSurfaceContextMap(
        value.contentSurfaceContext,
        `${path}.contentSurfaceContext`
      )
    );
  }
  if (!isRecord(value.elements)) return [...issues, `${path}.elements: expected object`];
  allowKeys(value.elements, ['e1'], `${path}.elements`, issues);
  const element = value.elements.e1;
  if (!isRecord(element)) return [...issues, `${path}.elements.e1: expected object`];
  allowKeys(element, ['name', 'palettes'], `${path}.elements.e1`, issues);
  if (typeof element.name !== 'string' || !element.name.trim()) {
    issues.push(`${path}.elements.e1.name: expected non-empty string`);
  }
  if (!isRecord(element.palettes) || Object.keys(element.palettes).length === 0) {
    return [...issues, `${path}.elements.e1.palettes: expected non-empty object`];
  }
  for (const issue of getElementPaletteValidationIssues(element.palettes, ['boxColor'])) {
    issues.push(`${path}.elements.e1.palettes.${issue.path.join('.')}: ${issue.message}`);
  }
  if (value.options !== undefined) {
    if (!isRecord(value.options)) issues.push(`${path}.options: expected object`);
    else
      validateCanonicalSurfaces(
        value.options,
        element.palettes,
        `${path}.options`,
        issues,
        derived
      );
  } else if (derived) {
    issues.push(`${path}.options.canonicalSurfaces: required for derivation`);
  }

  for (const [segment, themes] of Object.entries(element.palettes)) {
    const segmentPath = `${path}.elements.e1.palettes.${segment}`;
    if (!isRecord(themes)) {
      issues.push(`${segmentPath}: expected object`);
      continue;
    }
    allowKeys(themes, ['light', 'dark', 'darker'], segmentPath, issues);
    for (const [theme, contexts] of Object.entries(themes)) {
      const themePath = `${segmentPath}.${theme}`;
      if (!isRecord(contexts)) {
        issues.push(`${themePath}: expected object`);
        continue;
      }
      if (derived && !Array.isArray(atPath(value.options, ['canonicalSurfaces', segment, theme]))) {
        issues.push(
          `${path}.options.canonicalSurfaces.${segment}.${theme}: required for derivation`
        );
      }
      allowKeys(contexts, surfaceContexts, themePath, issues);
      if (!isRecord(contexts.onSubtle)) issues.push(`${themePath}.onSubtle: required context`);
      for (const [context, variants] of Object.entries(contexts)) {
        const variantPath = `${themePath}.${context}`;
        if (!isRecord(variants)) {
          issues.push(`${variantPath}: expected object`);
          continue;
        }
        allowKeys(variants, colorVariants, variantPath, issues);
        if (!isRecord(variants.standard))
          issues.push(`${variantPath}.standard: required color variant`);
        for (const [variant, colors] of Object.entries(variants)) {
          const contextPath = `${variantPath}.${variant}`;
          if (!isRecord(colors)) {
            issues.push(`${contextPath}: expected object`);
            continue;
          }
          allowKeys(colors, ['boxColor'], contextPath, issues);
          if (!isRecord(colors.boxColor) || Object.keys(colors.boxColor).length === 0) {
            issues.push(`${contextPath}.boxColor: expected non-empty object`);
            continue;
          }
          allowKeys(
            colors.boxColor,
            Object.keys(ContainerIntentKeys),
            `${contextPath}.boxColor`,
            issues
          );
          for (const [intent, emphases] of Object.entries(colors.boxColor)) {
            const intentPath = `${contextPath}.boxColor.${intent}`;
            if (!isRecord(emphases)) {
              issues.push(`${intentPath}: expected object`);
              continue;
            }
            allowKeys(emphases, Object.keys(componentEmphasisBuckets), intentPath, issues);
            for (const [emphasis, states] of Object.entries(emphases)) {
              const statePath = `${intentPath}.${emphasis}`;
              if (!isRecord(states)) {
                issues.push(`${statePath}: expected object`);
                continue;
              }
              allowKeys(states, ['rest'], statePath, issues);
              if (typeof states.rest !== 'string' || !states.rest.trim()) {
                issues.push(`${statePath}.rest: expected solid color`);
              }
              if (derived) continue;
              const outputVariants = atPath(value.contentSurfaceContext, [segment, theme, context]);
              const outputMap = isRecord(outputVariants)
                ? resolveColorVariantLeaves(
                    outputVariants.standard,
                    variant === 'alternative' ? outputVariants.alternative : undefined
                  )
                : undefined;
              const output = atPath(outputMap, [intent, emphasis]);
              if (!isRecord(output) || typeof output.rest !== 'string') {
                issues.push(
                  `${path}.contentSurfaceContext.${segment}.${theme}.${context}.${variant}.${intent}.${emphasis}.rest: required output`
                );
              } else {
                allowKeys(
                  output,
                  ['rest'],
                  `${path}.contentSurfaceContext.${segment}.${theme}.${context}.${variant}.${intent}.${emphasis}`,
                  issues
                );
              }
            }
          }
        }
      }
    }
  }
  return issues;
}

/** Attach calculated Rest values and catalog labels to a separate build schema. */
export function materializeContainerSurfaceContext<TSegmentName extends SegmentName>(
  schema: Schema<TSegmentName>,
  map: ContentSurfaceContextMap<ContainerIntent, TSegmentName>
): Schema<TSegmentName> {
  const container = schema.components?.container;
  if (!container || !isDerivedContainerComponent(container)) {
    return schema;
  }
  const card = schema.components.card;
  if (card?.surfaceSource === 'container' && card.contentSurfaceContext !== undefined) {
    throw new Error('components.card.contentSurfaceContext: derived Container owns the context');
  }
  const source = container.options?.canonicalSurfaces;
  if (!source) {
    throw new Error('components.container.options.canonicalSurfaces: required for derivation');
  }

  const canonicalSurfaces: ContainerSurfaceCatalog<TSegmentName, ContainerCanonicalSurface> = {};
  for (const segment of Object.keys(source) as (TSegmentName | 'default' | 'dynamic')[]) {
    const themes = source[segment];
    if (!themes) continue;
    const catalog: Partial<Record<ThemeMode, readonly ContainerCanonicalSurface[]>> = {};
    for (const theme of themeModes) {
      const entries = themes[theme];
      if (!entries) continue;
      catalog[theme] = entries.map((entry) => {
        const rest = atPath(map, [
          segment,
          theme,
          'onSubtle',
          'standard',
          entry.intent,
          entry.emphasis,
          'rest'
        ]);
        if (rest !== 'onSubtle' && rest !== 'onVivid' && rest !== 'inherit') {
          throw new Error(
            `components.container.contentSurfaceContext.${segment}.${theme}.onSubtle.standard.${entry.intent}.${entry.emphasis}.rest: required output`
          );
        }
        return { ...entry, contentSurfaceContext: rest === 'inherit' ? 'onSubtle' : rest };
      });
    }
    canonicalSurfaces[segment] = catalog;
  }
  const effective: ManualContainerComponent<TSegmentName> = {
    ...container,
    contentSurfaceContext: map,
    options: { canonicalSurfaces }
  };
  const issues = validateContainerComponentContract(effective);
  if (issues.length) throw new Error(issues.join('\n'));
  return { ...schema, components: { ...schema.components, container: effective } };
}
