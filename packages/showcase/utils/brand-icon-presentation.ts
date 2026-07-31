import type { BrandId } from '@kiskadee/brands';
import type { ComponentEmphasis, SurfaceContext } from '@kiskadee/core';

export type RecommendedBrandIconPresentation = 'brand' | 'monochrome';
export type RecommendedBrandIconAppearance = {
  construction: 'contained' | 'mark';
  presentation: RecommendedBrandIconPresentation;
};

export function getRecommendedBrandIconPresentation(
  surfaceContext: SurfaceContext,
  emphasis: ComponentEmphasis
): RecommendedBrandIconPresentation {
  const isHigh = emphasis === 'high';
  const usesBrandPresentation =
    (surfaceContext === 'onSubtle' && !isHigh) || (surfaceContext === 'onVivid' && isHigh);

  return usesBrandPresentation ? 'brand' : 'monochrome';
}

/**
 * Keeps Showcase recommendations explicit without turning them into an Icon or Button contract.
 */
export function getRecommendedBrandIconAppearance(
  brandId: BrandId,
  surfaceContext: SurfaceContext,
  emphasis: ComponentEmphasis,
  hasBrandPresentation: boolean
): RecommendedBrandIconAppearance {
  if (brandId === 'reddit') {
    const usesContainedBrand = surfaceContext === 'onSubtle' && emphasis !== 'high';

    return {
      construction: usesContainedBrand ? 'contained' : 'mark',
      presentation: usesContainedBrand ? 'brand' : 'monochrome'
    };
  }

  const presentation = hasBrandPresentation
    ? getRecommendedBrandIconPresentation(surfaceContext, emphasis)
    : 'monochrome';

  return {
    construction: 'mark',
    presentation
  };
}
