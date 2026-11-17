import { createHash } from 'node:crypto';
import {
  type CardSurfaceIntent,
  type ChipIntent,
  type ComponentEmphasis,
  type ContainerIntent,
  ContainerIntentKeys,
  type ContentSurfaceContextMap,
  componentEmphasisBuckets,
  isButtonDerivedContentSurfaceContext,
  isDerivedContainerComponent,
  type ManualContainerComponent,
  materializeContainerSurfaceContext,
  resolveCardSurfaceSource,
  type Schema,
  type SolidColor,
  type SurfaceContext,
  type SystemButtonIntent,
  type ThemeMode,
  validateContentSurfaceContextMap,
  validateSchemaComponentContracts
} from '@kiskadee/core';
import {
  deriveCardSurfaceContext,
  deriveContainerSurfaceContext,
  resolveButtonContentSurfaceContext
} from './derive.ts';
import type { SurfacePreset } from './load-presets.ts';

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

type ComponentSurfaces<TIntent extends string = string> = {
  contentSurfaceContext?: ContentSurfaceContextMap<TIntent>;
  options?: { canonicalSurfaces: PublishedCatalog<TIntent> };
};

type TextFieldModeSurfaces = {
  contentSurfaceContext?: ContentSurfaceContextMap;
  contentRegionSurfaceContext?: ContentSurfaceContextMap;
};

type TextFieldSurfaces = {
  variants: Record<string, { modes: Record<string, TextFieldModeSurfaces> }>;
};

export type SurfaceContextsArtifact = {
  formatVersion: 1;
  preset: { key: string; version: Schema['version']; revision: string };
  components: {
    button?: ComponentSurfaces<SystemButtonIntent>;
    container?: ComponentSurfaces<ContainerIntent>;
    card?: ComponentSurfaces<CardSurfaceIntent>;
    chip?: ComponentSurfaces<ChipIntent>;
    textField?: TextFieldSurfaces;
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
  owner: string
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
          const { intent, emphasis, contentSurfaceContext, referenceFor } = entry;
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

function collectTextFieldSurfaces(schema: Schema): TextFieldSurfaces | undefined {
  const variants: TextFieldSurfaces['variants'] = {};
  for (const [variant, value] of Object.entries(schema.components.textField?.variants ?? {})) {
    const modes: Record<string, TextFieldModeSurfaces> = {};
    for (const [mode, source] of Object.entries(value?.modes ?? {})) {
      const { contentSurfaceContext, contentRegionSurfaceContext } = source ?? {};
      if (contentSurfaceContext === undefined && contentRegionSurfaceContext === undefined)
        continue;
      modes[mode] = {
        ...(contentSurfaceContext !== undefined && { contentSurfaceContext }),
        ...(contentRegionSurfaceContext !== undefined && { contentRegionSurfaceContext })
      };
    }
    if (Object.keys(modes).length) variants[variant] = { modes };
  }
  return Object.keys(variants).length ? { variants } : undefined;
}

function collectComponent<TIntent extends string>(
  map: ContentSurfaceContextMap<TIntent> | undefined,
  catalog?: PublishedCatalog<TIntent>
): ComponentSurfaces<TIntent> | undefined {
  return map !== undefined || catalog !== undefined
    ? {
        ...(map !== undefined && { contentSurfaceContext: map }),
        ...(catalog !== undefined && { options: { canonicalSurfaces: catalog } })
      }
    : undefined;
}

/** Computes all component surface outputs while keeping the authored preset intact. */
export function buildSurfaceContextsArtifact(preset: SurfacePreset): SurfaceContextsArtifact {
  const { schema, key } = preset;
  validateSchemaComponentContracts(schema);
  const sourceContainer = schema.components.container;
  const derived = sourceContainer !== undefined && isDerivedContainerComponent(sourceContainer);
  const containerMap = derived
    ? deriveContainerSurfaceContext(schema)
    : sourceContainer?.contentSurfaceContext;
  const withContainer =
    derived && containerMap ? materializeContainerSurfaceContext(schema, containerMap) : schema;
  const effective = resolveCardSurfaceSource(withContainer);
  if (derived) validateSchemaComponentContracts(effective);
  const container = effective.components.container;
  const card = effective.components.card;
  const cardRest = checkMap<CardSurfaceIntent>(
    card?.contentSurfaceContext,
    'components.card.contentSurfaceContext'
  );
  const cardMap =
    derived && schema.components.card?.surfaceSource === 'container' && cardRest
      ? deriveCardSurfaceContext(effective, cardRest)
      : cardRest;
  const button = collectComponent(resolveButtonContentSurfaceContext(effective));
  const containerData = collectComponent(
    containerMap,
    resolveCatalog<ContainerIntent>(
      container?.options?.canonicalSurfaces,
      container?.elements.e1.palettes,
      'container'
    )
  );
  const cardData = collectComponent(
    cardMap,
    resolveCatalog<CardSurfaceIntent>(
      card?.options?.canonicalSurfaces,
      card?.elements.e1?.palettes,
      'card'
    )
  );
  const chip = collectComponent(effective.components.chip?.contentSurfaceContext);
  const textField = collectTextFieldSurfaces(effective);
  return structuredClone({
    formatVersion: 1,
    preset: { key, version: schema.version, revision: getSurfacePresetRevision(schema) },
    components: {
      ...(button && { button }),
      ...(containerData && { container: containerData }),
      ...(cardData && { card: cardData }),
      ...(chip && { chip }),
      ...(textField && { textField })
    }
  });
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

function validateTextField(value: unknown, path: string): void {
  assertKeys(value, path, ['variants']);
  const { variants } = value;
  assertKeys(variants, `${path}.variants`, ['standard', 'floating']);
  for (const [variant, entry] of Object.entries(variants)) {
    const variantPath = `${path}.variants.${variant}`;
    assertKeys(entry, variantPath, ['modes']);
    assertKeys(
      entry.modes,
      `${variantPath}.modes`,
      variant === 'standard' ? ['outline', 'underline', 'borderless'] : ['notched', 'inside']
    );
    for (const [mode, surfaces] of Object.entries(entry.modes)) {
      const modePath = `${variantPath}.modes.${mode}`;
      assertKeys(surfaces, modePath, ['contentSurfaceContext', 'contentRegionSurfaceContext']);
      if (!Object.keys(surfaces).length) fail(modePath, 'expected at least one surface map');
      for (const [field, map] of Object.entries(surfaces)) checkMap(map, `${modePath}.${field}`);
    }
  }
}

function requireSuppliedMaps(preset: SurfacePreset, components: Record<string, unknown>): void {
  const { button, card, chip, container } = preset.schema.components;
  for (const [name, required] of [
    ['button', button?.contentSurfaceContext !== undefined],
    ['card', card?.surfaceSource === 'container' || card?.contentSurfaceContext !== undefined],
    ['chip', chip?.contentSurfaceContext !== undefined],
    ['container', container !== undefined]
  ] as const) {
    if (required && read([name, 'contentSurfaceContext'], components) === undefined)
      fail(`components.${name}.contentSurfaceContext`, 'required surface map is missing');
  }
  if (isButtonDerivedContentSurfaceContext(button?.contentSurfaceContext)) {
    const map = read(['button', 'contentSurfaceContext'], components);
    if (isRecord(map) && !Object.keys(map).length)
      fail('components.button.contentSurfaceContext', 'derived surface map cannot be empty');
  }
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
  const textField = collectTextFieldSurfaces(preset.schema);
  for (const [variant, { modes }] of Object.entries(textField?.variants ?? {})) {
    for (const [mode, declared] of Object.entries(modes)) {
      for (const field of Object.keys(declared)) {
        const path = ['textField', 'variants', variant, 'modes', mode, field];
        if (read(path, components) === undefined)
          fail(`components.${path.join('.')}`, 'required surface map is missing');
      }
    }
  }
}

export function validateSurfaceContextsArtifact(
  value: unknown,
  preset: SurfacePreset
): asserts value is SurfaceContextsArtifact {
  assertKeys(value, 'surface-contexts.json', ['formatVersion', 'preset', 'components']);
  if (value.formatVersion !== 1)
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
  assertKeys(components, 'components', ['button', 'container', 'card', 'chip', 'textField']);
  for (const [component, entry] of Object.entries(components)) {
    const path = `components.${component}`;
    if (component === 'textField') {
      validateTextField(entry, path);
      continue;
    }
    const hasCatalog = component === 'container' || component === 'card';
    assertKeys(entry, path, ['contentSurfaceContext', ...(hasCatalog ? ['options'] : [])]);
    if (!Object.keys(entry).length) fail(path, 'expected at least one surface field');
    checkMap(entry.contentSurfaceContext, `${path}.contentSurfaceContext`);
    if (entry.options !== undefined && hasCatalog) {
      assertKeys(entry.options, `${path}.options`, ['canonicalSurfaces']);
      validateCatalog(
        entry.options.canonicalSurfaces,
        `${path}.options.canonicalSurfaces`,
        component
      );
    }
  }
  requireSuppliedMaps(preset, components);
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
  surfaces: TextFieldSurfaces
): NonNullable<Schema['components']['textField']> {
  const result = structuredClone(component);
  for (const [variant, { modes }] of Object.entries(surfaces.variants)) {
    for (const [mode, fields] of Object.entries(modes)) {
      const destination = read(['variants', variant, 'modes', mode], result);
      if (!isRecord(destination))
        fail(`components.textField.variants.${variant}.modes.${mode}`, 'missing authored mode');
      Object.assign(destination, fields);
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
    authoredContainer && container?.contentSurfaceContext
      ? {
          elements: authoredContainer.elements,
          contentSurfaceContext: container.contentSurfaceContext,
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
      ...(button?.contentSurfaceContext &&
        source.button && {
          button: { ...source.button, contentSurfaceContext: button.contentSurfaceContext }
        }),
      ...(card &&
        source.card && {
          card: {
            ...source.card,
            ...(card.contentSurfaceContext && {
              contentSurfaceContext: card.contentSurfaceContext
            }),
            ...(card.options && {
              options: {
                ...source.card.options!,
                canonicalSurfaces: stripCatalogRest(card.options.canonicalSurfaces)
              }
            })
          }
        }),
      ...(chip?.contentSurfaceContext &&
        source.chip && {
          chip: { ...source.chip, contentSurfaceContext: chip.contentSurfaceContext }
        }),
      ...(textField &&
        source.textField && {
          textField: applyTextFieldSurfaces(source.textField, textField)
        })
    }
  };
}
