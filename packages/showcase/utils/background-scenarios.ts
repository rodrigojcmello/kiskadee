import type { ResolvedCanonicalCardSurface } from './canonical-card-surfaces';

export type BackgroundScenario = {
  key: string;
  label: string;
  canvas: ResolvedCanonicalCardSurface;
  card: ResolvedCanonicalCardSurface;
  splitSwatch: boolean;
  cardBorder: boolean;
};

/** Compose published semantic emphases, independently of theme luminosity. */
export function resolveBackgroundScenarios(surfaces: readonly ResolvedCanonicalCardSurface[]) {
  const subtle = surfaces.filter((surface) => surface.contentSurfaceContext === 'onSubtle');
  const scenarios: BackgroundScenario[] = [];
  const append = (
    canvas: ResolvedCanonicalCardSurface,
    card: ResolvedCanonicalCardSurface,
    splitSwatch = false,
    cardBorder = splitSwatch
  ) => {
    scenarios.push({
      key: splitSwatch ? `${canvas.key}:cards:${card.key}` : canvas.key,
      label: `${canvas.label} canvas / ${card.label} cards`,
      canvas,
      card,
      splitSwatch,
      cardBorder
    });
  };
  const base = subtle.find((surface) => surface.key === 'neutral.lowest') ?? subtle[0];
  const alternate =
    subtle.find((surface) => surface.key === 'neutral.low' && surface !== base) ??
    subtle.find((surface) => surface.resolvedColor !== base?.resolvedColor);
  if (base) {
    append(base, base, false, true);
    if (alternate) append(base, alternate, true);
  }
  const neutralLow = subtle.find((surface) => surface.key === 'neutral.low');
  const neutralLowest = subtle.find((surface) => surface.key === 'neutral.lowest');
  if (neutralLow && neutralLowest) append(neutralLow, neutralLowest, false, true);
  const intents = new Set(subtle.map((surface) => surface.key.split('.')[0]));
  for (const intent of intents) {
    const candidates = subtle.filter((surface) => surface.key.startsWith(`${intent}.`));
    const medium = candidates.find((surface) => surface.key === `${intent}.medium`);
    const canvas =
      medium ?? candidates.find((surface) => surface.key === `${intent}.low`) ?? candidates[0];
    if (!canvas || scenarios.some((scenario) => scenario.key === canvas.key)) continue;
    const card =
      candidates.find((surface) => surface.key === `${intent}.low`) ??
      candidates.find((surface) => surface.key === `${intent}.lowest`) ??
      base ??
      canvas;
    append(canvas, card);
  }
  const neutralMediumIndex = scenarios.findIndex((scenario) => scenario.key === 'neutral.medium');
  if (neutralMediumIndex >= 0) scenarios.push(...scenarios.splice(neutralMediumIndex, 1));
  const vivid = surfaces.filter((surface) => surface.contentSurfaceContext === 'onVivid');
  for (const canvas of vivid) {
    const card = vivid[0];
    append(canvas, card, false, canvas.resolvedColor === card.resolvedColor);
  }
  return scenarios;
}
