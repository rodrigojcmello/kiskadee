import {
  type ContentSurfaceContextMap,
  validateContentSurfaceContextMap
} from '../content-surface-context.ts';
import {
  type ComponentEmphasis,
  type ContainerIntent,
  ContainerIntentKeys,
  componentEmphasisBuckets,
  type SegmentName,
  type SolidColor,
  type SurfaceContext,
  surfaceContexts,
  type ThemeMode
} from '../types/colors/colors.types.ts';

export type ContainerRestPalette = Partial<
  Record<ContainerIntent, Partial<Record<ComponentEmphasis, { rest: SolidColor }>>>
>;

export type ContainerSurfaceElementStyle<TSegmentName extends SegmentName = never> = {
  name: string;
  palettes: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<
        Record<
          ThemeMode,
          {
            onSubtle: { boxColor: ContainerRestPalette };
            onVivid?: { boxColor: ContainerRestPalette };
          }
        >
      >
    >
  >;
};

export type ContainerElements<TSegmentName extends SegmentName = never> = {
  e1: ContainerSurfaceElementStyle<TSegmentName>;
};

export type ContainerCanonicalSurface = {
  intent: ContainerIntent;
  emphasis: ComponentEmphasis;
  contentSurfaceContext: SurfaceContext;
};

export type ContainerOptions<TSegmentName extends SegmentName = never> = {
  canonicalSurfaces?: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, readonly ContainerCanonicalSurface[]>>
    >
  >;
};

export type ContainerComponent<TSegmentName extends SegmentName = never> = {
  contentSurfaceContext: ContentSurfaceContextMap<ContainerIntent, TSegmentName>;
  elements: ContainerElements<TSegmentName>;
  options?: ContainerOptions<TSegmentName>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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
  issues: string[]
): void {
  allowKeys(options, ['canonicalSurfaces'], path, issues);
  if (options.canonicalSurfaces === undefined) return;
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
      for (const [index, entry] of entries.entries()) {
        const entryPath = `${themePath}.${index}`;
        if (!isRecord(entry)) {
          issues.push(`${entryPath}: expected object`);
          continue;
        }
        allowKeys(entry, ['intent', 'emphasis', 'contentSurfaceContext'], entryPath, issues);
        const intent = String(entry.intent);
        const emphasis = String(entry.emphasis);
        if (!Object.hasOwn(ContainerIntentKeys, intent)) {
          issues.push(`${entryPath}.intent: expected Container intent`);
        }
        if (!Object.hasOwn(componentEmphasisBuckets, emphasis)) {
          issues.push(`${entryPath}.emphasis: expected component emphasis`);
        }
        if (!surfaceContexts.includes(entry.contentSurfaceContext as SurfaceContext)) {
          issues.push(`${entryPath}.contentSurfaceContext: expected onSubtle or onVivid`);
        }
        const reference = `${intent}.${emphasis}`;
        if (seen.has(reference))
          issues.push(`${entryPath}: duplicate canonical surface "${reference}"`);
        seen.add(reference);
        const rest = atPath(palettes, [
          segment,
          theme,
          'onSubtle',
          'boxColor',
          intent,
          emphasis,
          'rest'
        ]);
        if (typeof rest !== 'string' || !rest.trim()) {
          issues.push(`${entryPath}: referenced Container boxColor.${reference}.rest is missing`);
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
  if (value.contentSurfaceContext === undefined) {
    issues.push(`${path}.contentSurfaceContext: required map`);
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
  if (value.options !== undefined) {
    if (!isRecord(value.options)) issues.push(`${path}.options: expected object`);
    else validateCanonicalSurfaces(value.options, element.palettes, `${path}.options`, issues);
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
      allowKeys(contexts, surfaceContexts, themePath, issues);
      if (!isRecord(contexts.onSubtle)) issues.push(`${themePath}.onSubtle: required context`);
      for (const [context, colors] of Object.entries(contexts)) {
        const contextPath = `${themePath}.${context}`;
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
            const output = isRecord(value.contentSurfaceContext)
              ? (value.contentSurfaceContext as Record<string, any>)[segment]?.[theme]?.[context]?.[
                  intent
                ]?.[emphasis]
              : undefined;
            if (!isRecord(output) || typeof output.rest !== 'string') {
              issues.push(
                `${path}.contentSurfaceContext.${segment}.${theme}.${context}.${intent}.${emphasis}.rest: required output`
              );
            } else {
              allowKeys(
                output,
                ['rest'],
                `${path}.contentSurfaceContext.${segment}.${theme}.${context}.${intent}.${emphasis}`,
                issues
              );
            }
          }
        }
      }
    }
  }
  return issues;
}
