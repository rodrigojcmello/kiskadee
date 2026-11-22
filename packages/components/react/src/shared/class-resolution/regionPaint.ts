import type { ClassNameByElementJSON } from '@kiskadee/core';
import type { RegionCoordinate } from '../contexts/useRegionSurface.ts';
import { resolveIntentColorRecipe } from './classNames.ts';

export const neutralMediumFallback = {
  fallbackIntent: 'neutral',
  useFirstIntentFallback: true,
  emphasisFallbackOrder: ['m', 'h', 'hh', 'l', 'll']
} as const;

/** Follow the same emitted recipe as the painted element, including sparse intent/emphasis fallbacks. */
export function resolveRegionPaint(
  element: ClassNameByElementJSON | undefined,
  coordinate: RegionCoordinate,
  options: NonNullable<Parameters<typeof resolveIntentColorRecipe>[3]>
): RegionCoordinate {
  const recipe = resolveIntentColorRecipe(element, coordinate.intent, coordinate.emphasis, {
    ...options,
    colorVariant: coordinate.colorVariant,
    surfaceContext: coordinate.surfaceContext
  });
  return recipe ? { ...coordinate, intent: recipe.intent, emphasis: recipe.emphasis } : coordinate;
}
