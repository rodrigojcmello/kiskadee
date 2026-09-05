import type { ResolvedCanonicalCardSurface } from './canonical-card-surfaces';

export type BackgroundScenario = {
  key: string;
  label: string;
  canvas: ResolvedCanonicalCardSurface;
  card: ResolvedCanonicalCardSurface;
  splitSwatch: boolean;
};

/** Compose published surfaces; do not add colors to, or deduplicate, the scenario catalog. */
export function resolveBackgroundScenarios(surfaces: readonly ResolvedCanonicalCardSurface[]) {
  const subtle = surfaces.filter((surface) => surface.contentSurfaceContext === 'onSubtle');
  return surfaces.flatMap<BackgroundScenario>((canvas) => {
    const card = surfaces.find(
      (surface) => surface.contentSurfaceContext === canvas.contentSurfaceContext
    );
    if (!card) return [];
    const scenario = {
      key: canvas.key,
      label: `${canvas.label} canvas / ${card.label} cards`,
      canvas,
      card,
      splitSwatch: false
    };
    if (canvas !== subtle[0] || !subtle[1]) return [scenario];
    return [
      scenario,
      {
        key: `${canvas.key}:cards:${subtle[1].key}`,
        label: `${canvas.label} canvas / ${subtle[1].label} cards`,
        canvas,
        card: subtle[1],
        splitSwatch: true
      }
    ];
  });
}
