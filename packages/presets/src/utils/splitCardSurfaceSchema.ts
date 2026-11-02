import type { Schema } from '@kiskadee/core';

type Entry = Record<string, unknown>;

const entries = (value: unknown): [string, unknown][] =>
  value && typeof value === 'object' ? Object.entries(value) : [];

/** Transfer authored Card Rest surfaces to Container without changing interaction recipes. */
export function splitCardSurfaceSchema<TSegment extends string>(card: {
  elements: { e1: Entry & { palettes: object } };
  contentSurfaceContext?: object;
  [key: string]: unknown;
}): {
  container: NonNullable<Schema<TSegment>['components']['container']>;
  card: NonNullable<Schema<TSegment>['components']['card']>;
} {
  const cardPalettes: Entry = {};
  const containerPalettes: Entry = {};

  for (const [segment, themes] of entries(card.elements.e1.palettes)) {
    const cardThemes: Entry = {};
    const containerThemes: Entry = {};
    for (const [theme, contexts] of entries(themes)) {
      const cardContexts: Entry = {};
      const containerContexts: Entry = {};
      for (const [context, variants] of entries(contexts)) {
        const cardVariants: Entry = {};
        const containerVariants: Entry = {};
        for (const [variant, palette] of entries(variants)) {
          const source = palette as Entry;
          const cardColors: Entry = {};
          const containerColors: Entry = {};
          for (const [intent, emphases] of entries(source.boxColor)) {
            const cardEmphases: Entry = {};
            const containerEmphases: Entry = {};
            for (const [emphasis, states] of entries(emphases)) {
              const { rest, ...interactionStates } = states as Entry;
              if (rest === undefined) {
                throw new Error(
                  `Card ${segment}.${theme}.${context}.${intent}.${emphasis} has no Rest surface`
                );
              }
              cardEmphases[emphasis] = interactionStates;
              containerEmphases[emphasis] = { rest };
            }
            cardColors[intent] = cardEmphases;
            containerColors[intent] = containerEmphases;
          }
          const hasSurfaces = Object.keys(containerColors).length > 0;
          cardVariants[variant] = {
            ...source,
            ...(hasSurfaces ? { boxColor: cardColors } : {})
          };
          // A border-only alternative inherits Standard surfaces; it does not author a Container variant.
          if (hasSurfaces || variant === 'standard')
            containerVariants[variant] = { boxColor: containerColors };
        }
        cardContexts[context] = cardVariants;
        containerContexts[context] = containerVariants;
      }
      cardThemes[theme] = cardContexts;
      containerThemes[theme] = containerContexts;
    }
    cardPalettes[segment] = cardThemes;
    containerPalettes[segment] = containerThemes;
  }

  const containerContexts: Entry = {};
  const cardContexts: Entry = {};
  for (const [segment, themes] of entries(card.contentSurfaceContext)) {
    const containerThemes: Entry = {};
    const cardThemes: Entry = {};
    for (const [theme, contexts] of entries(themes)) {
      const containerInputs: Entry = {};
      const cardInputs: Entry = {};
      for (const [context, variants] of entries(contexts)) {
        const containerVariants: Entry = {};
        const cardVariants: Entry = {};
        for (const [variant, intents] of entries(variants)) {
          const containerIntents: Entry = {};
          const cardIntents: Entry = {};
          for (const [intent, emphases] of entries(intents)) {
            const containerEmphases: Entry = {};
            const cardEmphases: Entry = {};
            for (const [emphasis, states] of entries(emphases)) {
              const { rest, ...stateChanges } = states as Entry;
              if (rest === undefined) {
                throw new Error(
                  `Card ${segment}.${theme}.${context}.${intent}.${emphasis} has no Rest context`
                );
              }
              containerEmphases[emphasis] = { rest };
              // An authored Alternative Rest-only leaf must still replace Standard states.
              if (variant === 'alternative' || Object.keys(stateChanges).length)
                cardEmphases[emphasis] = stateChanges;
            }
            containerIntents[intent] = containerEmphases;
            if (Object.keys(cardEmphases).length) cardIntents[intent] = cardEmphases;
          }
          containerVariants[variant] = containerIntents;
          if (Object.keys(cardIntents).length) cardVariants[variant] = cardIntents;
        }
        containerInputs[context] = containerVariants;
        if (Object.keys(cardVariants).length) cardInputs[context] = cardVariants;
      }
      containerThemes[theme] = containerInputs;
      if (Object.keys(cardInputs).length) cardThemes[theme] = cardInputs;
    }
    containerContexts[segment] = containerThemes;
    if (Object.keys(cardThemes).length) cardContexts[segment] = cardThemes;
  }

  // Presets without an authored descendant context previously inherited their input context.
  for (const [segment, themes] of entries(containerPalettes)) {
    containerContexts[segment] ??= {};
    const contextThemes = containerContexts[segment] as Entry;
    for (const [theme, palettes] of entries(themes)) {
      contextThemes[theme] ??= {};
      const contextPalettes = contextThemes[theme] as Entry;
      for (const [context, variants] of entries(palettes)) {
        contextPalettes[context] ??= {};
        const contextVariants = contextPalettes[context] as Entry;
        for (const [variant, palette] of entries(variants)) {
          const contextIntents = (contextVariants[variant] ?? {}) as Entry;
          for (const [intent, emphases] of entries((palette as Entry).boxColor)) {
            const contextEmphases = (contextIntents[intent] ?? {}) as Entry;
            for (const [emphasis] of entries(emphases)) {
              const standardIntent = (contextVariants.standard as Entry | undefined)?.[intent] as
                | Entry
                | undefined;
              if (variant === 'alternative' && standardIntent?.[emphasis] !== undefined) continue;
              contextEmphases[emphasis] ??= { rest: 'inherit' };
            }
            if (Object.keys(contextEmphases).length) contextIntents[intent] = contextEmphases;
          }
          if (Object.keys(contextIntents).length) contextVariants[variant] = contextIntents;
        }
      }
    }
  }

  const { contentSurfaceContext: _context, elements, options, ...cardMetadata } = card;
  const { canonicalSurfaces, ...cardOptions } = (options ?? {}) as Entry;
  return {
    container: {
      ...(Object.keys(containerContexts).length
        ? { contentSurfaceContext: containerContexts }
        : {}),
      ...(canonicalSurfaces ? { options: { canonicalSurfaces } } : {}),
      elements: { e1: { name: 'container', palettes: containerPalettes } }
    } as NonNullable<Schema<TSegment>['components']['container']>,
    card: {
      ...cardMetadata,
      surfaceSource: 'container',
      ...(Object.keys(cardOptions).length ? { options: cardOptions } : {}),
      ...(Object.keys(cardContexts).length ? { contentSurfaceContext: cardContexts } : {}),
      elements: { ...elements, e1: { ...elements.e1, palettes: cardPalettes } }
    } as NonNullable<Schema<TSegment>['components']['card']>
  };
}
