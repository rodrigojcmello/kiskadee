import type { ContainerCanonicalSurface, Schema, SolidColor, ThemeMode } from '@kiskadee/core';

export const CONTAINER_COMPONENT_ARTIFACT_PATH = 'components/container.kiskadee.json';

export type ResolvedContainerCanonicalSurface = ContainerCanonicalSurface & { rest: SolidColor };
export type ContainerCanonicalSurfacesPayload = Record<
  string,
  Partial<Record<ThemeMode, ResolvedContainerCanonicalSurface[]>>
>;

export type ContainerComponentArtifactJSON = {
  component: 'container';
  options: { canonicalSurfaces: ContainerCanonicalSurfacesPayload };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRest(
  schema: Schema,
  segment: string,
  theme: ThemeMode,
  intent: string,
  emphasis: string
): string {
  const palettes: unknown = schema.components?.container?.elements.e1.palettes;
  const bySegment = isRecord(palettes) ? palettes[segment] : undefined;
  const byTheme = isRecord(bySegment) ? bySegment[theme] : undefined;
  const byContext = isRecord(byTheme) ? byTheme.onSubtle : undefined;
  const colors = isRecord(byContext) ? byContext.boxColor : undefined;
  const byIntent = isRecord(colors) ? colors[intent] : undefined;
  const byEmphasis = isRecord(byIntent) ? byIntent[emphasis] : undefined;
  const rest = isRecord(byEmphasis) ? byEmphasis.rest : undefined;
  if (typeof rest !== 'string' || !rest.trim()) {
    throw new Error(
      `[web-builder] Container canonical surface "${segment}.${theme}.${intent}.${emphasis}" must resolve to a solid Rest color.`
    );
  }
  return rest;
}

export function buildContainerComponentArtifact(
  schema: Schema
): ContainerComponentArtifactJSON | null {
  const canonicalSurfaces = schema.components?.container?.options?.canonicalSurfaces;
  if (!canonicalSurfaces) return null;

  const resolved: ContainerCanonicalSurfacesPayload = {};
  for (const [segment, themes] of Object.entries(canonicalSurfaces)) {
    if (!themes) continue;
    const resolvedThemes: Partial<Record<ThemeMode, ResolvedContainerCanonicalSurface[]>> = {};
    for (const [theme, surfaces] of Object.entries(themes) as Array<
      [ThemeMode, readonly ContainerCanonicalSurface[] | undefined]
    >) {
      if (!surfaces) continue;
      resolvedThemes[theme] = surfaces.map((surface) => ({
        ...surface,
        rest: readRest(schema, segment, theme, surface.intent, surface.emphasis)
      }));
    }
    if (Object.keys(resolvedThemes).length) resolved[segment] = resolvedThemes;
  }
  if (!Object.keys(resolved).length) return null;
  return { component: 'container', options: { canonicalSurfaces: resolved } };
}
