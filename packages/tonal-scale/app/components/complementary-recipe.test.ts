import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  type TonalSystemRecipeV5
} from '../../src/tonal-system-contract.ts';
import { rebindPrimaryComplementary } from './complementary-recipe.ts';

describe('Primary complementary editing', () => {
  it('moves its lineage ID, name and reference locks without changing other associations', () => {
    const recipe: TonalSystemRecipeV5 = {
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      catalog: {
        colors: [],
        neutrals: [],
        names: { 'b.blue.v1.c': 'Accent', 'r.red.v1.c': 'Red accent' },
        complementaryColors: [
          {
            id: 'b.blue.v1.c',
            sourceId: 'primary',
            strategy: 'contrast-complement-v1',
            tonalProfile: 'balanced'
          },
          { id: 'r.red.v1.c', sourceId: 'r.red.v1', strategy: 'material-complement-v1' }
        ]
      },
      functionalReferences: [
        {
          id: 'b.blue.v1.c',
          light: { subtle: { mode: 'locked', tone: 4 }, vivid: { mode: 'locked', tone: 18 } },
          dark: { subtle: { mode: 'auto' }, vivid: { mode: 'auto' } }
        }
      ]
    };
    const rebound = rebindPrimaryComplementary(recipe, 'pb.indigo.v2');
    expect(rebound.catalog?.complementaryColors?.[0]).toEqual({
      ...recipe.catalog!.complementaryColors![0],
      id: 'pb.indigo.v2.c'
    });
    expect(rebound.catalog?.names).toEqual({
      'pb.indigo.v2.c': 'Accent',
      'r.red.v1.c': 'Red accent'
    });
    expect(rebound.functionalReferences[0]).toEqual({
      ...recipe.functionalReferences[0],
      id: 'pb.indigo.v2.c'
    });
    expect(rebound.catalog?.complementaryColors?.[1]).toBe(
      recipe.catalog?.complementaryColors?.[1]
    );
    expect(recipe.catalog?.complementaryColors?.[0].id).toBe('b.blue.v1.c');
  });

  it('leaves pending primary input and recipes without a complementary unchanged', () => {
    expect(rebindPrimaryComplementary(DEFAULT_TONAL_SYSTEM_RECIPE, null)).toBe(
      DEFAULT_TONAL_SYSTEM_RECIPE
    );
    expect(rebindPrimaryComplementary(DEFAULT_TONAL_SYSTEM_RECIPE, 'b.blue.v1')).toBe(
      DEFAULT_TONAL_SYSTEM_RECIPE
    );
  });
});
