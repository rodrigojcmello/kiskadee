import { createHash } from 'node:crypto';
import {
  type CardSurfaceIntent,
  type ComponentEmphasis,
  type ContainerIntent,
  ContainerIntentKeys,
  type ContentSurfaceContextMap,
  componentEmphasisBuckets,
  isButtonDerivedContentSurfaceContext,
  isDerivedContainerComponent,
  type ManualContainerComponent,
  resolveCardSurfaceSource,
  type Schema,
  type SolidColor,
  type SurfaceContext,
  type ThemeMode,
  validateContentSurfaceContextMap,
  validateSchemaComponentContracts
} from '@kiskadee/core';
import type { SurfacePreset } from './load-presets.ts';
import type { SurfaceDiagnostic, SurfaceRegionBranch } from './region-types.ts';
import {
  compileSurfaceRegions,
  parentSurfaceElement,
  surfaceElementIds,
  surfaceProducerNames,
  usesSubtlePaint
} from './regions.ts';

type PublishedSurface<TIntent extends string> = {
  intent: TIntent;
  emphasis: ComponentEmphasis;
  contentSurfaceContext: SurfaceContext;
  rest: SolidColor;
  referenceFor?: SurfaceContext;
};

type PublishedCatalog<TIntent extends string> = Record<
  string,
  Partial<Record<ThemeMode, readonly PublishedSurface<TIntent>[]>>
>;

type CatalogSurfaceBranch<TIntent extends string> = SurfaceRegionBranch & {
  options?: { canonicalSurfaces: PublishedCatalog<TIntent> };
};
export type SurfaceContextsArtifact = {
  formatVersion: 2;
  diagnostics?: SurfaceDiagnostic[];
  preset: { key: string; version: Schema['version']; revision: string };
  components: Partial<Record<string, SurfaceRegionBranch>> & {
    container?: CatalogSurfaceBranch<ContainerIntent>;
    card?: CatalogSurfaceBranch<CardSurfaceIntent>;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])])
  );
}

export function getSurfacePresetRevision(schema: Schema): string {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(schema)))
    .digest('hex');
}

function read(path: readonly string[], root: unknown): unknown {
  return path.reduce<unknown>(
    (node, key) => (isRecord(node) && Object.hasOwn(node, key) ? node[key] : undefined),
    root
  );
}

function fail(path: string, details: string): never {
  throw new Error(`[surface-builder] ${path}: ${details}`);
}

function assertKeys(
  value: unknown,
  path: string,
  keys: readonly string[]
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) fail(path, 'expected object');
  const unexpected = Object.keys(value).find((key) => !keys.includes(key));
  if (unexpected) fail(path, `unrecognized key "${unexpected}"`);
}

function checkMap<TIntent extends string>(
  value: unknown,
  path: string
): ContentSurfaceContextMap<TIntent> | undefined {
  if (value === undefined) return undefined;
  const issues = validateContentSurfaceContextMap(value, path);
  if (issues.length) fail(path, issues.join('\n'));
  return value as ContentSurfaceContextMap<TIntent>;
}

function resolveCatalog<TIntent extends string>(
  catalog: unknown,
  palettes: unknown,
  owner: string,
  map: ContentSurfaceContextMap | undefined
): PublishedCatalog<TIntent> | undefined {
  if (!isRecord(catalog)) return undefined;
  const segments: PublishedCatalog<TIntent> = {};
  for (const [segment, themes] of Object.entries(catalog)) {
    if (!isRecord(themes)) continue;
    const resolved: Partial<Record<ThemeMode, readonly PublishedSurface<TIntent>[]>> = {};
    for (const [theme, entries] of Object.entries(themes)) {
      if (!Array.isArray(entries) || entries.length === 0) continue;
      resolved[theme as ThemeMode] = entries.map(
        (entry: Omit<PublishedSurface<TIntent>, 'rest'>) => {
          const { intent, emphasis, referenceFor } = entry;
          const output =
            map?.[segment]?.[theme as ThemeMode]?.onSubtle?.standard?.[intent]?.[emphasis]?.rest;
          const contentSurfaceContext =
            output === 'inherit' ? 'onSubtle' : (output ?? entry.contentSurfaceContext);
          const rest = read(
            [segment, theme, 'onSubtle', 'standard', 'boxColor', intent, emphasis, 'rest'],
            palettes
          );
          if (typeof rest !== 'string' || !rest.trim()) {
            fail(
              `components.${owner}.options.canonicalSurfaces.${segment}.${theme}.${intent}.${emphasis}`,
              'expected a solid Rest fill'
            );
          }
          return {
            intent,
            emphasis,
            contentSurfaceContext,
            rest,
            ...(referenceFor !== undefined && { referenceFor })
          };
        }
      );
    }
    if (Object.keys(resolved).length) segments[segment] = resolved;
  }
  return Object.keys(segments).length ? segments : undefined;
}

/** Computes all component surface outputs while keeping the authored preset intact. */
export function buildSurfaceContextsArtifact(preset: SurfacePreset): SurfaceContextsArtifact {
  const { schema, key } = preset;
  validateSchemaComponentContracts(schema);
  const diagnostics: SurfaceDiagnostic[] = [];
  const components: SurfaceContextsArtifact['components'] = {};
  const container = schema.components.container;
  const containerRegions = compileSurfaceRegions(schema, 'container', diagnostics);
  const containerMap =
    containerRegions.regions?.e1?.output ??
    (container && !isDerivedContainerComponent(container)
      ? container.contentSurfaceContext
      : undefined);
  const containerCatalog = resolveCatalog<ContainerIntent>(
    container?.options?.canonicalSurfaces,
    container?.elements.e1.palettes,
    'container',
    containerMap
  );
  if (container && containerMap) {
    components.container = {
      ...containerRegions,
      ...(containerCatalog && { options: { canonicalSurfaces: containerCatalog } })
    };
  }
  // Card receives the materialized Container Rest before the rest of the anatomy is walked.
  const withContainer =
    container && containerMap
      ? {
          ...schema,
          components: {
            ...schema.components,
            container: {
              elements: container.elements,
              contentSurfaceContext: containerMap,
              ...(containerCatalog && {
                options: { canonicalSurfaces: stripCatalogRest(containerCatalog) }
              })
            } satisfies ManualContainerComponent
          }
        }
      : schema;
  const effective = resolveCardSurfaceSource(withContainer);
  for (const name of surfaceProducerNames) {
    if (name === 'container') continue;
    const branch = compileSurfaceRegions(effective, name, diagnostics);
    if (!Object.keys(branch).length) continue;
    if (name === 'card') {
      const contentSurfaceContext = branch.regions?.e1?.output;
      const card = effective.components.card;
      const catalog = resolveCatalog<CardSurfaceIntent>(
        card?.options?.canonicalSurfaces,
        card?.elements.e1?.palettes,
        'card',
        contentSurfaceContext
      );
      components.card = {
        ...branch,
        ...(catalog && { options: { canonicalSurfaces: catalog } })
      };
    } else components[name] = branch;
  }
  return {
    formatVersion: 2,
    preset: { key, version: schema.version, revision: getSurfacePresetRevision(schema) },
    components,
    ...(diagnostics.length && { diagnostics })
  };
}

function validateCatalog(value: unknown, path: string, owner: 'container' | 'card'): void {
  if (!isRecord(value)) fail(path, 'expected object');
  for (const [segment, themes] of Object.entries(value)) {
    assertKeys(themes, `${path}.${segment}`, ['light', 'dark', 'darker']);
    for (const [theme, entries] of Object.entries(themes)) {
      const themePath = `${path}.${segment}.${theme}`;
      if (!Array.isArray(entries) || entries.length === 0)
        fail(themePath, 'expected a non-empty array');
      const coordinates = new Set<string>();
      for (const [index, entry] of entries.entries()) {
        const entryPath = `${themePath}[${index}]`;
        assertKeys(entry, entryPath, [
          'intent',
          'emphasis',
          'contentSurfaceContext',
          'rest',
          ...(owner === 'container' ? ['referenceFor'] : [])
        ]);
        const intent = entry.intent;
        if (typeof intent !== 'string' || !Object.hasOwn(ContainerIntentKeys, intent))
          fail(entryPath, 'invalid intent');
        const emphasis = entry.emphasis;
        if (typeof emphasis !== 'string' || !Object.hasOwn(componentEmphasisBuckets, emphasis))
          fail(entryPath, 'invalid emphasis');
        if (entry.contentSurfaceContext !== 'onSubtle' && entry.contentSurfaceContext !== 'onVivid')
          fail(entryPath, 'invalid content surface context');
        if (typeof entry.rest !== 'string' || !entry.rest.trim())
          fail(entryPath, 'expected a solid Rest color');
        const reference = entry.referenceFor;
        if (reference !== undefined && reference !== 'onSubtle' && reference !== 'onVivid')
          fail(entryPath, 'invalid backdrop reference');
        const coordinate = `${intent}.${emphasis}`;
        if (coordinates.has(coordinate)) fail(entryPath, `duplicate ${coordinate}`);
        coordinates.add(coordinate);
      }
    }
  }
}

function validateRegions(value: unknown, path: string, component: string, source: unknown): void {
  if (!isRecord(value) || !Object.keys(value).length) fail(path, 'expected regions');
  for (const [id, region] of Object.entries(value)) {
    const location = `${path}.${id}`;
    if (!surfaceElementIds(component).includes(id) || !read(['elements', id], source))
      fail(location, 'unknown surface region');
    assertKeys(region, location, ['output', 'against']);
    if (!checkMap(region.output, `${location}.output`)) fail(location, 'missing region output');
    if (!Object.keys(region.output as object).length)
      fail(location, 'derived surface map cannot be empty');
    if (region.against === undefined) continue;
    if (!parentSurfaceElement(component, id))
      fail(location, 'unexpected parent overrides for top-level surface');
    if (!isRecord(region.against) || !Object.keys(region.against).length)
      fail(`${location}.against`, 'expected override maps');
    for (const [address, map] of Object.entries(region.against)) {
      let coordinate: unknown;
      try {
        coordinate = JSON.parse(address);
      } catch {
        fail(`${location}.against`, 'invalid parent coordinate');
      }
      if (
        !Array.isArray(coordinate) ||
        coordinate.length !== 5 ||
        JSON.stringify(coordinate) !== address ||
        !['onSubtle', 'onVivid'].includes(coordinate[0]) ||
        !['standard', 'alternative'].includes(coordinate[1]) ||
        typeof coordinate[2] !== 'string' ||
        !coordinate[2] ||
        typeof coordinate[3] !== 'string' ||
        !Object.hasOwn(componentEmphasisBuckets, coordinate[3]) ||
        !['rest', 'selected', 'pending', 'disabled'].includes(coordinate[4])
      )
        fail(`${location}.against`, 'invalid parent coordinate');
      if (!checkMap(map, `${location}.against.${address}`)) fail(location, 'missing override map');
    }
  }
}

function validateBranch(
  value: unknown,
  path: string,
  component: string,
  source: unknown,
  depth = 0
): void {
  if (!isRecord(source)) fail(path, 'missing authored branch');
  const keys = ['regions'];
  if (depth === 0 && isRecord(source.variants)) keys.push('variants');
  if (depth === 1 && isRecord(source.modes)) keys.push('modes');
  if (depth === 0 && ['container', 'card'].includes(component)) keys.push('options');
  assertKeys(value, path, keys);
  if (!Object.keys(value).length) fail(path, 'expected at least one surface field');
  if (value.regions !== undefined)
    validateRegions(value.regions, `${path}.regions`, component, source);
  if (value.options !== undefined && (component === 'container' || component === 'card')) {
    assertKeys(value.options, `${path}.options`, ['canonicalSurfaces']);
    validateCatalog(
      value.options.canonicalSurfaces,
      `${path}.options.canonicalSurfaces`,
      component
    );
  }
  for (const key of ['variants', 'modes']) {
    if (value[key] === undefined) continue;
    if (!isRecord(value[key])) fail(`${path}.${key}`, 'expected branches');
    for (const [name, child] of Object.entries(value[key]))
      validateBranch(
        child,
        `${path}.${key}.${name}`,
        component,
        read([key, name], source),
        depth + 1
      );
  }
}

// segment / theme / consumed surface / color variant / color property / intent
function hasRegionRecipe(value: unknown, remaining: number): boolean {
  if (!isRecord(value)) return false;
  if (remaining === 0)
    return Object.keys(value).some((emphasis) => Object.hasOwn(componentEmphasisBuckets, emphasis));
  return Object.values(value).some((child) => hasRegionRecipe(child, remaining - 1));
}

function requireAuthoredRegions(
  component: string,
  source: unknown,
  published: unknown,
  path: string
) {
  if (!isRecord(source)) return;
  for (const id of surfaceElementIds(component)) {
    const palettes = read(['elements', id, 'palettes'], source);
    if (!isRecord(palettes)) continue;
    const suppliesRecipe = usesSubtlePaint(component, id)
      ? Object.values(palettes).some(
          (themes) =>
            isRecord(themes) &&
            Object.values(themes).some(
              (contexts) => isRecord(contexts) && hasRegionRecipe(contexts.onSubtle, 3)
            )
        )
      : hasRegionRecipe(palettes, 6);
    if (suppliesRecipe && !read(['regions', id, 'output'], published))
      fail(`${path}.regions.${id}.output`, 'required surface map is missing');
  }
  for (const key of ['variants', 'modes']) {
    const children = source[key];
    if (!isRecord(children)) continue;
    for (const [name, child] of Object.entries(children))
      requireAuthoredRegions(
        component,
        child,
        read([key, name], published),
        `${path}.${key}.${name}`
      );
  }
}

function requireSuppliedMaps(preset: SurfacePreset, components: Record<string, unknown>): void {
  const { button, card, container } = preset.schema.components;
  if (
    isButtonDerivedContentSurfaceContext(button?.contentSurfaceContext) &&
    read(['button', 'regions', 'e1', 'output'], components) === undefined
  )
    fail('components.button.regions.e1.output', 'required surface map is missing');
  for (const [name, declared] of [
    ['container', container?.options?.canonicalSurfaces],
    ['card', card?.options?.canonicalSurfaces]
  ] as const) {
    const populated = Object.values(declared ?? {}).some((themes) =>
      Object.values(themes ?? {}).some((entries) => Array.isArray(entries) && entries.length > 0)
    );
    if (populated && read([name, 'options', 'canonicalSurfaces'], components) === undefined)
      fail(`components.${name}.options.canonicalSurfaces`, 'required catalog is missing');
  }
}

export function validateSurfaceContextsArtifact(
  value: unknown,
  preset: SurfacePreset
): asserts value is SurfaceContextsArtifact {
  assertKeys(value, 'surface-contexts.json', [
    'formatVersion',
    'preset',
    'components',
    'diagnostics'
  ]);
  if (value.formatVersion !== 2)
    fail('formatVersion', `unsupported portable surface format "${String(value.formatVersion)}"`);
  const identity = value.preset;
  assertKeys(identity, 'preset', ['key', 'version', 'revision']);
  if (
    identity.key !== preset.key ||
    JSON.stringify(identity.version) !== JSON.stringify(preset.schema.version)
  )
    fail('preset', `identity mismatch for "${preset.key}"`);
  if (identity.revision !== getSurfacePresetRevision(preset.schema))
    fail('preset.revision', `stale surface data for "${preset.key}"`);
  const components = value.components;
  assertKeys(components, 'components', surfaceProducerNames);
  for (const [component, entry] of Object.entries(components)) {
    if (!Object.hasOwn(preset.schema.components, component))
      fail(`components.${component}`, 'component absent from preset');
    validateBranch(
      entry,
      `components.${component}`,
      component,
      read([component], preset.schema.components)
    );
  }
  if (value.diagnostics !== undefined) {
    if (!Array.isArray(value.diagnostics)) fail('diagnostics', 'expected list of diagnostics');
    for (const item of value.diagnostics) {
      assertKeys(item, 'diagnostics', ['path', 'reason']);
      if (typeof item.path !== 'string' || typeof item.reason !== 'string')
        fail('diagnostics', 'invalid diagnostic');
    }
  }
  requireSuppliedMaps(preset, components);
  for (const name of surfaceProducerNames)
    requireAuthoredRegions(
      name,
      read([name], preset.schema.components),
      components[name],
      `components.${name}`
    );
}

function stripCatalogRest<TIntent extends string>(catalog: PublishedCatalog<TIntent>) {
  return Object.fromEntries(
    Object.entries(catalog).map(([segment, themes]) => [
      segment,
      Object.fromEntries(
        Object.entries(themes).map(([theme, surfaces]) => [
          theme,
          surfaces.map(({ rest: _rest, ...entry }) => entry)
        ])
      )
    ])
  );
}

function applyTextFieldSurfaces(
  component: NonNullable<Schema['components']['textField']>,
  surfaces: SurfaceRegionBranch
): NonNullable<Schema['components']['textField']> {
  const result = structuredClone(component);
  for (const [variant, { modes }] of Object.entries(surfaces.variants ?? {})) {
    for (const [mode, fields] of Object.entries(modes ?? {})) {
      const destination = read(['variants', variant, 'modes', mode], result);
      if (!isRecord(destination))
        fail(`components.textField.variants.${variant}.modes.${mode}`, 'missing authored mode');
      if (fields.regions?.e3) destination.contentSurfaceContext = fields.regions.e3.output;
      if (fields.regions?.e8) destination.contentRegionSurfaceContext = fields.regions.e8.output;
    }
  }
  return result;
}

/** Supplies effective maps to legacy Web phases from the validated portable artifact. */
export function materializeSurfaceContexts(
  schema: Schema,
  artifact: SurfaceContextsArtifact
): Schema {
  const { button, container, card, chip, textField } = structuredClone(artifact.components);
  const authoredContainer = schema.components.container;
  const materializedContainer: ManualContainerComponent | undefined =
    authoredContainer && container?.regions?.e1?.output
      ? {
          elements: authoredContainer.elements,
          contentSurfaceContext: container.regions.e1.output,
          ...(container.options && {
            options: {
              canonicalSurfaces: stripCatalogRest(container.options.canonicalSurfaces)
            }
          })
        }
      : undefined;
  const withContainer = materializedContainer
    ? { ...schema, components: { ...schema.components, container: materializedContainer } }
    : schema;
  const effective = resolveCardSurfaceSource(withContainer);
  const source = effective.components;
  return {
    ...effective,
    components: {
      ...source,
      ...(button?.regions?.e1?.output &&
        source.button && {
          button: { ...source.button, contentSurfaceContext: button.regions.e1.output }
        }),
      ...(card &&
        source.card && {
          card: {
            ...source.card,
            ...(card.regions?.e1?.output && {
              contentSurfaceContext: card.regions.e1.output
            }),
            ...(card.options && {
              options: {
                ...source.card.options!,
                canonicalSurfaces: stripCatalogRest(card.options.canonicalSurfaces)
              }
            })
          }
        }),
      ...(chip?.regions?.e2?.output &&
        source.chip && {
          chip: { ...source.chip, contentSurfaceContext: chip.regions.e2.output }
        }),
      ...(textField &&
        source.textField && {
          textField: applyTextFieldSurfaces(source.textField, textField)
        })
    }
  };
}
