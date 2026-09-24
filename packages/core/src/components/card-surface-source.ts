import type { Schema } from '../schema.ts';

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
  const cardElements = requireRecord(card.elements, 'components.card.elements');
  const cardElement = requireRecord(cardElements.e1, 'components.card.elements.e1');
  const cardPalettes = requireRecord(cardElement.palettes, 'components.card.elements.e1.palettes');
  const containerElements = requireRecord(container.elements, 'components.container.elements');
  const containerElement = requireRecord(containerElements.e1, 'components.container.elements.e1');
  const containerPalettes = requireRecord(
    containerElement.palettes,
    'components.container.elements.e1.palettes'
  );
  const containerContexts = requireRecord(
    container.contentSurfaceContext,
    'components.container.contentSurfaceContext'
  );
  const cardContexts = isRecord(card.contentSurfaceContext) ? card.contentSurfaceContext : {};
  card.contentSurfaceContext = cardContexts;

  for (const [segment, cardThemesValue] of Object.entries(cardPalettes)) {
    const cardThemes = requireRecord(
      cardThemesValue,
      `components.card.elements.e1.palettes.${segment}`
    );
    for (const [theme, cardContextsValue] of Object.entries(cardThemes)) {
      const cardByContext = requireRecord(
        cardContextsValue,
        `components.card.elements.e1.palettes.${segment}.${theme}`
      );
      for (const [context, cardColorsValue] of Object.entries(cardByContext)) {
        const path = `${segment}.${theme}.${context}`;
        const cardColors = requireRecord(
          cardColorsValue,
          `components.card.elements.e1.palettes.${path}`
        );
        const cardBoxColor = requireRecord(
          cardColors.boxColor,
          `components.card.elements.e1.palettes.${path}.boxColor`
        );
        const containerBoxColor = requireRecord(
          [segment, theme, context, 'boxColor'].reduce<unknown>(
            (current, key) => (isRecord(current) ? current[key] : undefined),
            containerPalettes
          ),
          `components.container.elements.e1.palettes.${path}.boxColor`
        );

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
        const outputByIntent = ensureRecord(
          outputByContext,
          context,
          `components.card.contentSurfaceContext.${path}`
        );

        for (const [intent, emphasesValue] of Object.entries(cardBoxColor)) {
          if (Object.hasOwn(COMPLEMENTARY_BASE_INTENT, intent)) {
            throw new Error(
              `components.card.elements.e1.palettes.${path}.boxColor.${intent}: complementary Rest is supplied only by Container`
            );
          }
          const emphases = requireRecord(
            emphasesValue,
            `components.card.elements.e1.palettes.${path}.boxColor.${intent}`
          );
          const outputEmphases = ensureRecord(
            outputByIntent,
            intent,
            `components.card.contentSurfaceContext.${path}.${intent}`
          );
          for (const [emphasis, statesValue] of Object.entries(emphases)) {
            const states = requireRecord(
              statesValue,
              `components.card.elements.e1.palettes.${path}.boxColor.${intent}.${emphasis}`
            );
            if (Object.hasOwn(states, 'rest')) {
              throw new Error(
                `components.card.elements.e1.palettes.${path}.boxColor.${intent}.${emphasis}.rest: Card Rest must come from Container`
              );
            }
            states.rest = readRest(
              containerPalettes,
              [segment, theme, context, 'boxColor', intent, emphasis, 'rest'],
              'components.container.elements.e1.palettes'
            );
            const outputStates = isRecord(outputEmphases[emphasis]) ? outputEmphases[emphasis] : {};
            if (Object.hasOwn(outputStates, 'rest')) {
              throw new Error(
                `components.card.contentSurfaceContext.${path}.${intent}.${emphasis}.rest: Card Rest output must come from Container`
              );
            }
            outputStates.rest = readRest(
              containerContexts,
              [segment, theme, context, intent, emphasis, 'rest'],
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
            `components.container.elements.e1.palettes.${path}.boxColor.${intent}`
          );
          const baseEmphases = cardBoxColor[baseIntent];
          if (!isRecord(baseEmphases)) continue;
          const resolvedEmphases: Record<string, unknown> = {};
          for (const emphasis of Object.keys(complementEmphases)) {
            if (!Object.hasOwn(baseEmphases, emphasis)) continue;
            resolvedEmphases[emphasis] = {
              rest: readRest(
                containerPalettes,
                [segment, theme, context, 'boxColor', intent, emphasis, 'rest'],
                'components.container.elements.e1.palettes'
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
                [segment, theme, context, intent, emphasis, 'rest'],
                'components.container.contentSurfaceContext'
              )
            };
          }
          if (Object.keys(resolvedEmphases).length) cardBoxColor[intent] = resolvedEmphases;
        }
      }
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
        const cardEntries = entriesValue.filter((entry) => {
          if (!isRecord(entry)) return false;
          const intent = entry.intent;
          const emphasis = entry.emphasis;
          if (typeof intent !== 'string' || typeof emphasis !== 'string') return false;
          const states = [segment, theme, 'onSubtle', 'boxColor', intent, emphasis].reduce<unknown>(
            (current, key) => (isRecord(current) ? current[key] : undefined),
            cardPalettes
          );
          return isRecord(states) && typeof states.rest === 'string';
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
