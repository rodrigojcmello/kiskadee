import {
  createComplementaryColorId,
  type TonalFamilyId,
  type TonalSystemRecipeV5
} from '../../src/tonal-system-contract.ts';

/** Keep the primary's complementary link and authored references attached after an ID change. */
export function rebindPrimaryComplementary(
  recipe: TonalSystemRecipeV5,
  primaryId: TonalFamilyId | null
): TonalSystemRecipeV5 {
  const catalog = recipe.catalog;
  const complementary = catalog?.complementaryColors?.find((color) => color.sourceId === 'primary');
  if (!primaryId || !catalog || !complementary) return recipe;
  const id = createComplementaryColorId(primaryId);
  if (complementary.id === id) return recipe;
  return {
    ...recipe,
    catalog: {
      ...catalog,
      complementaryColors: catalog.complementaryColors?.map((color) =>
        color === complementary ? { ...color, id } : color
      ),
      names: Object.fromEntries(
        Object.entries(catalog.names).map(([key, name]) => [
          key === complementary.id ? id : key,
          name
        ])
      )
    },
    functionalReferences: recipe.functionalReferences.map((reference) =>
      reference.id === complementary.id ? { ...reference, id } : reference
    )
  };
}
