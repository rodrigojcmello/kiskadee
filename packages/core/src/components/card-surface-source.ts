import { resolveColorVariantLeaves } from '../color-variant.ts';
import type { Schema } from '../schema.ts';
import { isDerivedContainerSurfaceContext } from './container.ts';

const COMPLEMENTARY_BASE_INTENT = {
  neutralComplementary: 'neutral',
  primaryComplementary: 'primary'
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${path}: required object`);
  return value;
}

function ensureRecord(
  parent: Record<string, unknown>,
  key: string,
  path: string
): Record<string, unknown> {
  if (parent[key] === undefined) parent[key] = {};
  return requireRecord(parent[key], path);
}

function readRest(source: Record<string, unknown>, path: readonly string[], owner: string): string {
  const value = path.reduce<unknown>(
    (current, key) => (isRecord(current) ? current[key] : undefined),
    source
  );
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${owner}.${path.join('.')}: required Rest value`);
  }
  return value;
}

const CARD_PALETTES = 'components.card.elements.e1.palettes';
const CONTAINER_PALETTES = 'components.container.elements.e1.palettes';

function readElementPalettes(
  component: Record<string, unknown>,
  owner: 'components.card' | 'components.container'
): Record<string, unknown> {
  const elements = requireRecord(component.elements, `${owner}.elements`);
  const element = requireRecord(elements.e1, `${owner}.elements.e1`);
  return requireRecord(element.palettes, `${owner}.elements.e1.palettes`);
}

function withInheritedAlternatives(palette: Record<string, unknown>): Record<string, unknown> {
  const result = structuredClone(palette);
  for (const themes of Object.values(result)) {
    if (!isRecord(themes)) continue;
    for (const contexts of Object.values(themes)) {
      if (!isRecord(contexts)) continue;
      for (const variants of Object.values(contexts)) {
        if (!isRecord(variants)) continue;
        variants.alternative = resolveColorVariantLeaves(variants.standard, variants.alternative);
      }
    }
  }
  return result;
}

function* cardRestPaintBranches(
  cardPalettes: Record<string, unknown>,
  containerPalettes: Record<string, unknown>
) {
  for (const [segment, themesValue] of Object.entries(cardPalettes)) {
    const themes = requireRecord(themesValue, `${CARD_PALETTES}.${segment}`);
    for (const [theme, contextsValue] of Object.entries(themes)) {
      const contexts = requireRecord(contextsValue, `${CARD_PALETTES}.${segment}.${theme}`);
      for (const [context, variantsValue] of Object.entries(contexts)) {
        const variants = requireRecord(
          variantsValue,
          `${CARD_PALETTES}.${segment}.${theme}.${context}`
        );
        for (const [variant, colorsValue] of Object.entries(variants)) {
          const address = [segment, theme, context, variant] as const;
          const path = address.join('.');
          const colors = requireRecord(colorsValue, `${CARD_PALETTES}.${path}`);
          if (variant === 'alternative' && colors.boxColor === undefined) continue;
          const cardBoxColor = requireRecord(colors.boxColor, `${CARD_PALETTES}.${path}.boxColor`);
          const containerBoxColor = requireRecord(
            [...address, 'boxColor'].reduce<unknown>(
              (current, key) => (isRecord(current) ? current[key] : undefined),
              containerPalettes
            ),
            `${CONTAINER_PALETTES}.${path}.boxColor`
          );
          const intentRecipes = [];
          for (const [intent, emphasesValue] of Object.entries(cardBoxColor)) {
            if (Object.hasOwn(COMPLEMENTARY_BASE_INTENT, intent)) {
              throw new Error(
                `${CARD_PALETTES}.${path}.boxColor.${intent}: complementary Rest is supplied only by Container`
              );
            }
            const emphases = requireRecord(
              emphasesValue,
              `${CARD_PALETTES}.${path}.boxColor.${intent}`
            );
            const recipes = [];
            for (const [emphasis, statesValue] of Object.entries(emphases)) {
              const paint = requireRecord(
                statesValue,
                `${CARD_PALETTES}.${path}.boxColor.${intent}.${emphasis}`
              );
              if (Object.hasOwn(paint, 'rest')) {
                throw new Error(
                  `${CARD_PALETTES}.${path}.boxColor.${intent}.${emphasis}.rest: Card Rest must come from Container`
                );
              }
              const rest = readRest(
                containerBoxColor,
                [intent, emphasis, 'rest'],
                `${CONTAINER_PALETTES}.${path}.boxColor`
              );
              recipes.push({ emphasis, paint, rest });
            }
            intentRecipes.push({ intent, recipes });
          }
          yield { address, path, cardBoxColor, containerBoxColor, intentRecipes };
        }
      }
    }
  }
}

/** Validate linked paint coordinates while the Container's context map is still a directive. */
export function validateCardRestSurfaceSource(schema: Schema): void {
  const card = requireRecord(schema.components.card, 'components.card');
  const container = requireRecord(schema.components.container, 'components.container');
  const cardPalettes = readElementPalettes(card, 'components.card');
  const containerPalettes = withInheritedAlternatives(
    readElementPalettes(container, 'components.container')
  );
  // Consume the shared traversal to validate its coordinates without assigning resolved paint.
  Array.from(cardRestPaintBranches(cardPalettes, containerPalettes));
}

/**
 * Resolve Container Rest paint and descendant context into the Card's effective build schema.
 * Card state colors and boundaries stay authored on Card; complementary paint has no action states.
 */
export function resolveCardSurfaceSource<TSegmentName extends string>(
  schema: Schema<TSegmentName>
): Schema<TSegmentName> {
  const authoredCard = schema.components?.card;
  if (!authoredCard?.surfaceSource) return schema;
  if (authoredCard.surfaceSource !== 'container') {
    throw new Error('components.card.surfaceSource: expected "container"');
  }
  if (isDerivedContainerSurfaceContext(schema.components.container?.contentSurfaceContext)) {
    throw new Error(
      'components.container.contentSurfaceContext: materialize derivation before resolving Card'
    );
  }

  const resolved = structuredClone(schema);
  const card = requireRecord(resolved.components.card, 'components.card');
  const container = requireRecord(resolved.components.container, 'components.container');
  const cardOptions = isRecord(card.options) ? card.options : {};
  if (Object.hasOwn(cardOptions, 'canonicalSurfaces')) {
    throw new Error(
      'components.card.options.canonicalSurfaces: authored catalog belongs to Container'
    );
  }
  const containerOptions = isRecord(container.options) ? container.options : {};
  const cardPalettes = readElementPalettes(card, 'components.card');
  const containerPalettes = withInheritedAlternatives(
    readElementPalettes(container, 'components.container')
  );
  const containerContexts = withInheritedAlternatives(
    requireRecord(container.contentSurfaceContext, 'components.container.contentSurfaceContext')
  );
  const cardContexts = isRecord(card.contentSurfaceContext) ? card.contentSurfaceContext : {};
  card.contentSurfaceContext = cardContexts;
  const materializeOutputRest = (value: Record<string, unknown>, path: string[] = []) => {
    if (path.length === 6) {
      if (Object.hasOwn(value, 'rest')) {
        throw new Error(
          `components.card.contentSurfaceContext.${path.join('.')}.rest: Card Rest output must come from Container`
        );
      }
      value.rest = readRest(
        containerContexts,
        [...path, 'rest'],
        'components.container.contentSurfaceContext'
      );
      return;
    }
    for (const [key, child] of Object.entries(value))
      materializeOutputRest(
        requireRecord(child, `components.card.contentSurfaceContext.${[...path, key].join('.')}`),
        [...path, key]
      );
  };
  // Output leaves own their states even when the alternative only changes contour paint.
  materializeOutputRest(cardContexts);

  for (const {
    address,
    path,
    cardBoxColor,
    containerBoxColor,
    intentRecipes
  } of cardRestPaintBranches(cardPalettes, containerPalettes)) {
    const [segment, theme, context, variant] = address;
    const outputThemes = ensureRecord(
      cardContexts,
      segment,
      `components.card.contentSurfaceContext.${segment}`
    );
    const outputByContext = ensureRecord(
      outputThemes,
      theme,
      `components.card.contentSurfaceContext.${segment}.${theme}`
    );
    const outputByVariant = ensureRecord(
      outputByContext,
      context,
      `components.card.contentSurfaceContext.${segment}.${theme}.${context}`
    );
    const outputByIntent = ensureRecord(
      outputByVariant,
      variant,
      `components.card.contentSurfaceContext.${path}`
    );

    for (const { intent, recipes } of intentRecipes) {
      const outputEmphases = ensureRecord(
        outputByIntent,
        intent,
        `components.card.contentSurfaceContext.${path}.${intent}`
      );
      for (const { emphasis, paint, rest } of recipes) {
        paint.rest = rest;
        const standardOutputStates = [
          segment,
          theme,
          context,
          'standard',
          intent,
          emphasis
        ].reduce<unknown>(
          (current, key) => (isRecord(current) ? current[key] : undefined),
          authoredCard.contentSurfaceContext
        );
        const outputStates = isRecord(outputEmphases[emphasis])
          ? outputEmphases[emphasis]
          : variant === 'alternative' && isRecord(standardOutputStates)
            ? structuredClone(standardOutputStates)
            : {};
        outputStates.rest = readRest(
          containerContexts,
          [...address, intent, emphasis, 'rest'],
          'components.container.contentSurfaceContext'
        );
        outputEmphases[emphasis] = outputStates;
      }
    }

    for (const [intent, baseIntent] of Object.entries(COMPLEMENTARY_BASE_INTENT)) {
      const complement = containerBoxColor[intent];
      if (complement === undefined) continue;
      const complementEmphases = requireRecord(
        complement,
        `${CONTAINER_PALETTES}.${path}.boxColor.${intent}`
      );
      const baseEmphases = cardBoxColor[baseIntent];
      if (!isRecord(baseEmphases)) continue;
      const resolvedEmphases: Record<string, unknown> = {};
      for (const emphasis of Object.keys(complementEmphases)) {
        if (!Object.hasOwn(baseEmphases, emphasis)) continue;
        resolvedEmphases[emphasis] = {
          rest: readRest(
            containerBoxColor,
            [intent, emphasis, 'rest'],
            `${CONTAINER_PALETTES}.${path}.boxColor`
          )
        };
        const outputEmphases = ensureRecord(
          outputByIntent,
          intent,
          `components.card.contentSurfaceContext.${path}.${intent}`
        );
        outputEmphases[emphasis] = {
          rest: readRest(
            containerContexts,
            [...address, intent, emphasis, 'rest'],
            'components.container.contentSurfaceContext'
          )
        };
      }
      if (Object.keys(resolvedEmphases).length) cardBoxColor[intent] = resolvedEmphases;
    }
  }

  if (containerOptions.canonicalSurfaces !== undefined) {
    const catalog = requireRecord(
      containerOptions.canonicalSurfaces,
      'components.container.options.canonicalSurfaces'
    );
    const cardCatalog: Record<string, unknown> = {};
    for (const [segment, themesValue] of Object.entries(catalog)) {
      const themes = requireRecord(
        themesValue,
        `components.container.options.canonicalSurfaces.${segment}`
      );
      const cardThemes: Record<string, unknown> = {};
      for (const [theme, entriesValue] of Object.entries(themes)) {
        if (!Array.isArray(entriesValue)) continue;
        const cardEntries = entriesValue.flatMap((entry) => {
          if (!isRecord(entry)) return [];
          const intent = entry.intent;
          const emphasis = entry.emphasis;
          if (typeof intent !== 'string' || typeof emphasis !== 'string') return [];
          const states = [
            segment,
            theme,
            'onSubtle',
            'standard',
            'boxColor',
            intent,
            emphasis
          ].reduce<unknown>(
            (current, key) => (isRecord(current) ? current[key] : undefined),
            cardPalettes
          );
          if (!isRecord(states) || typeof states.rest !== 'string') return [];
          const { referenceFor: _referenceFor, ...cardEntry } = entry;
          return [cardEntry];
        });
        if (cardEntries.length) cardThemes[theme] = cardEntries;
      }
      if (Object.keys(cardThemes).length) cardCatalog[segment] = cardThemes;
    }
    if (Object.keys(cardCatalog).length) {
      card.options = { ...cardOptions, canonicalSurfaces: cardCatalog };
    }
  }

  delete card.surfaceSource;
  return resolved;
}
