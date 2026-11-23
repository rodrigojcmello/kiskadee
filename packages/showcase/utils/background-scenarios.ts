import type { ThemeMode } from '@kiskadee/core';
import type { ResolvedCanonicalCardSurface } from './canonical-card-surfaces';

export type BackgroundScenario = {
  key: string;
  label: string;
  canvas: ResolvedCanonicalCardSurface;
  card: ResolvedCanonicalCardSurface;
  splitSwatch: boolean;
};

/** Compose published semantic emphases, independently of theme luminosity. */
export function resolveBackgroundScenarios(
  surfaces: readonly ResolvedCanonicalCardSurface[],
  theme?: ThemeMode
) {
  const subtle = surfaces.filter((surface) => surface.contentSurfaceContext === 'onSubtle');
  const scenarios: BackgroundScenario[] = [];
  const append = (
    canvas: ResolvedCanonicalCardSurface,
    card: ResolvedCanonicalCardSurface,
    splitSwatch = false
  ) => {
    if (
      scenarios.some(
        (scenario) => scenario.canvas.key === canvas.key && scenario.card.key === card.key
      )
    ) {
      return;
    }
    // Swatch paint can change between themes. Only disambiguate genuinely shared canvases.
    const sharesCanvas = scenarios.some((scenario) => scenario.canvas.key === canvas.key);
    scenarios.push({
      key: sharesCanvas ? `${canvas.key}:cards:${card.key}` : canvas.key,
      label: `${canvas.label} canvas / ${card.label} cards`,
      canvas,
      card,
      splitSwatch
    });
  };
  const base = subtle.find((surface) => surface.key === 'neutral.lowest') ?? subtle[0];
  const alternate =
    subtle.find((surface) => surface.key === 'neutral.low' && surface !== base) ??
    subtle.find((surface) => surface.resolvedColor !== base?.resolvedColor);
  if (base) {
    append(base, base);
    if (alternate) append(base, alternate, true);
  }
  const neutralLow = subtle.find((surface) => surface.key === 'neutral.low');
  const neutralLowest = subtle.find((surface) => surface.key === 'neutral.lowest');
  if (neutralLow && neutralLowest) append(neutralLow, neutralLowest);
  const primaryPair = (theme === 'dark' ? ['highest', 'medium'] : ['medium'])
    .map((emphasis) => ({
      canvas: subtle.find((surface) => surface.key === `primaryComplementary.${emphasis}`),
      card: subtle.find((surface) => surface.key === `primary.${emphasis}`)
    }))
    .find((pair) => pair.canvas && pair.card);
  const intents = new Set(subtle.map((surface) => surface.key.split('.')[0]));
  for (const intent of intents) {
    if (primaryPair?.canvas && primaryPair.card) {
      if (intent === 'primaryComplementary') continue;
      if (intent === 'primary') {
        append(primaryPair.canvas, primaryPair.card, true);
        continue;
      }
    }
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
  const primaryCard = vivid.find((surface) => surface.key === 'primary.highest') ?? vivid[0];
  const hasPrimaryCompanion = vivid.some(
    (surface) => surface.key === 'primaryComplementary.highest'
  );
  for (const canvas of vivid) {
    if (hasPrimaryCompanion && canvas.key === 'primary.highest') continue;
    const card = primaryCard;
    if (!card) continue;
    append(canvas, card);
  }
  return scenarios;
}
