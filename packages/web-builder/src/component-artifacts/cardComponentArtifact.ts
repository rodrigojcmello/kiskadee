import type { CardCanonicalSurface, Schema, SolidColor, ThemeMode } from '@kiskadee/core';

export const CARD_COMPONENT_ARTIFACT_PATH = 'components/card.kiskadee.json';

export type ResolvedCardCanonicalSurface = CardCanonicalSurface & {
  rest: SolidColor;
};

export type CardCanonicalSurfacesPayload = Record<
  string,
  Partial<Record<ThemeMode, ResolvedCardCanonicalSurface[]>>
>;

export type CardComponentArtifactJSON = {
  component: 'card';
  options: {
    canonicalSurfaces: CardCanonicalSurfacesPayload;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveCanonicalSurfaceRest({
  cardSchema,
  emphasis,
  intent,
  segment,
  theme
}: {
  cardSchema: NonNullable<Schema['components']['card']>;
  emphasis: string;
  intent: string;
  segment: string;
  theme: ThemeMode;
}): SolidColor {
  const palettes: unknown = cardSchema.elements.e1?.palettes;
  const segmentPalettes = isRecord(palettes) ? palettes[segment] : undefined;
  const themePalette = isRecord(segmentPalettes) ? segmentPalettes[theme] : undefined;
  const onSubtlePalette = isRecord(themePalette) ? themePalette.onSubtle : undefined;
  const boxColor = isRecord(onSubtlePalette) ? onSubtlePalette.boxColor : undefined;
  const intentMap = isRecord(boxColor) ? boxColor[intent] : undefined;
  const emphasisMap = isRecord(intentMap) ? intentMap[emphasis] : undefined;
  const rest = isRecord(emphasisMap) ? emphasisMap.rest : undefined;

  if (typeof rest !== 'string') {
    throw new Error(
      `[web-builder] Card canonical surface "${segment}.${theme}.${intent}.${emphasis}" ` +
        'must resolve to a solid Rest color.'
    );
  }

  return rest;
}

export function buildCardComponentArtifact(schema: Schema): CardComponentArtifactJSON | null {
  const cardSchema = schema.components?.card;
  const canonicalSurfaces = cardSchema?.options?.canonicalSurfaces;
  if (!cardSchema || !canonicalSurfaces) return null;

  const resolvedCanonicalSurfaces: CardCanonicalSurfacesPayload = {};

  for (const [segment, themes] of Object.entries(canonicalSurfaces)) {
    if (!themes) continue;

    const resolvedThemes: Partial<Record<ThemeMode, ResolvedCardCanonicalSurface[]>> = {};

    for (const [theme, surfaces] of Object.entries(themes) as Array<
      [ThemeMode, readonly CardCanonicalSurface[] | undefined]
    >) {
      if (!surfaces) continue;

      resolvedThemes[theme] = surfaces.map((surface) => ({
        ...surface,
        rest: resolveCanonicalSurfaceRest({
          cardSchema,
          segment,
          theme,
          intent: surface.intent,
          emphasis: surface.emphasis
        })
      }));
    }

    if (Object.keys(resolvedThemes).length > 0) {
      resolvedCanonicalSurfaces[segment] = resolvedThemes;
    }
  }

  if (Object.keys(resolvedCanonicalSurfaces).length === 0) return null;

  return {
    component: 'card',
    options: {
      canonicalSurfaces: resolvedCanonicalSurfaces
    }
  };
}
