'use client';

import { useState } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import { classifyMunsellHex } from '@/src/munsell-oklch';
import type { KiskadeeTonalSystemResult } from '@/src/tonal-system';
import {
  nextTonalFamilyVariant,
  TONAL_FAMILY_IDENTITIES,
  type TonalCatalog,
  type TonalSystemRecipeV5
} from '@/src/tonal-system-contract';
import styles from './CatalogEditor.module.css';

export function CatalogEditor({
  recipe,
  result,
  onChange
}: {
  recipe: TonalSystemRecipeV5;
  result: KiskadeeTonalSystemResult;
  onChange: (recipe: TonalSystemRecipeV5) => void;
}) {
  const catalog = recipe.catalog ?? { colors: [], names: {}, neutrals: [] };
  const [newSeed, setNewSeed] = useState('#6750A4');
  const [newName, setNewName] = useState('');
  const change = (next: TonalCatalog) => {
    const primaryNeutral = next.neutrals.find(
      (n) => n.sourceId === 'primary' && n.id === 'n.black.v2'
    );
    const remaining = new Set([...next.colors.map((c) => c.id), ...next.neutrals.map((n) => n.id)]);
    const removed = new Set(
      [...catalog.colors.map((c) => c.id), ...catalog.neutrals.map((n) => n.id)].filter(
        (id) => !remaining.has(id)
      )
    );
    onChange({
      ...recipe,
      catalog: next,
      functionalReferences: recipe.functionalReferences.filter((r) => !removed.has(r.id)),
      ...(recipe.neutral?.mode === 'derived-from-primary'
        ? {
            neutral: primaryNeutral
              ? { ...recipe.neutral, intensity: primaryNeutral.intensity }
              : undefined
          }
        : {})
    });
  };
  const ids = [
    ...result.families.map((f) => f.id),
    ...recipe.overrides.map((o) => o.id),
    ...catalog.colors.map((o) => o.id),
    ...catalog.neutrals.map((n) => n.id)
  ];
  if (recipe.neutral) ids.push('n.black.v2');
  const entries = [
    { id: 'primary', seedHex: recipe.primary.seedHex },
    ...recipe.overrides.filter((o) => !o.id.startsWith('n.black.')),
    ...catalog.colors
  ];
  const normalizedSeed = normalizeHexColor(newSeed);
  const identity = normalizedSeed ? classifyMunsellHex(normalizedSeed) : null;
  const family = identity
    ? TONAL_FAMILY_IDENTITIES.find((f) => f.sector === identity.sector)
    : null;
  const add = () => {
    if (!normalizedSeed || !family) return;
    const id = `${family.stem}.${nextTonalFamilyVariant(ids, family.stem)}` as const;
    change({
      ...catalog,
      colors: [
        ...catalog.colors,
        { id, seedHex: normalizedSeed, policies: { light: 'source-exact', dark: 'adaptive' } }
      ],
      names: { ...catalog.names, [id]: newName.trim() }
    });
  };
  return (
    <section className={styles.catalog} aria-label="Shared color catalog">
      <h3>Shared color catalog</h3>
      <p>
        Additional colors follow the base primary without recalibrating shared colors. Names are
        internal labels.
      </p>
      {entries.map((entry) => {
        const association = catalog.neutrals.find((n) => n.sourceId === entry.id);
        const additional = catalog.colors.find((c) => c.id === entry.id);
        const legacyPrimaryNeutral =
          entry.id === 'primary' && recipe.neutral?.mode === 'derived-from-primary' && !association;
        return (
          <fieldset key={entry.id}>
            <legend>{entry.id}</legend>
            <label>
              Internal name
              <input
                aria-label={`Name ${entry.id}`}
                value={catalog.names[entry.id] ?? ''}
                onChange={(e) =>
                  change({ ...catalog, names: { ...catalog.names, [entry.id]: e.target.value } })
                }
              />
            </label>
            {additional ? (
              <>
                <label>
                  Seed
                  <input
                    aria-label={`Seed ${entry.id}`}
                    value={additional.seedHex}
                    onChange={(e) =>
                      change({
                        ...catalog,
                        colors: catalog.colors.map((c) =>
                          c.id === entry.id ? { ...c, seedHex: e.target.value } : c
                        )
                      })
                    }
                  />
                </label>
                {(['light', 'dark'] as const).map((theme) => (
                  <label key={theme}>
                    {theme}
                    <select
                      aria-label={`${theme} policy ${entry.id}`}
                      value={additional.policies[theme]}
                      onChange={(e) =>
                        change({
                          ...catalog,
                          colors: catalog.colors.map((c) =>
                            c.id === entry.id
                              ? {
                                  ...c,
                                  policies: {
                                    ...c.policies,
                                    [theme]: e.target.value as typeof c.policies.light
                                  }
                                }
                              : c
                          )
                        })
                      }
                    >
                      <option value="source-exact">Source exact</option>
                      <option value="adaptive">Adaptive</option>
                      <option value="harmonized">Harmonized</option>
                    </select>
                  </label>
                ))}
              </>
            ) : (
              <p>Seed: {entry.seedHex}</p>
            )}
            {legacyPrimaryNeutral ? (
              <p>Associated neutral: n.black.v2. Configure it in Neutral below.</p>
            ) : (
              <label>
                <input
                  type="checkbox"
                  aria-label={`Generate neutral ${entry.id}`}
                  checked={!!association}
                  onChange={(e) =>
                    change({
                      ...catalog,
                      neutrals: e.target.checked
                        ? [
                            ...catalog.neutrals,
                            {
                              id: `n.black.${nextTonalFamilyVariant(ids, 'n.black')}`,
                              sourceId: entry.id as 'primary',
                              intensity: 'subtle'
                            }
                          ]
                        : catalog.neutrals.filter((n) => n.sourceId !== entry.id),
                      names: Object.fromEntries(
                        Object.entries(catalog.names).filter(([id]) => id !== association?.id)
                      )
                    })
                  }
                />
                Generate neutral
              </label>
            )}
            {association ? (
              <label>
                Neutral derivation ({association.id})
                <select
                  aria-label={`Neutral strategy ${entry.id}`}
                  value={association.intensity}
                  onChange={(e) =>
                    change({
                      ...catalog,
                      neutrals: catalog.neutrals.map((n) =>
                        n.id === association.id
                          ? { ...n, intensity: e.target.value as 'subtle' | 'chromatic' }
                          : n
                      )
                    })
                  }
                >
                  <option value="subtle">Subtle (default)</option>
                  <option value="chromatic">Chromatic offset</option>
                </select>
              </label>
            ) : null}
            {association ? (
              <p>
                Generated neutral:{' '}
                {result.families.find((f) => f.id === association.id)?.sourceSeedHex ?? 'pending'}
              </p>
            ) : null}
            {additional ? (
              <button
                type="button"
                onClick={() =>
                  change({
                    ...catalog,
                    colors: catalog.colors.filter((c) => c.id !== entry.id),
                    neutrals: catalog.neutrals.filter((n) => n.sourceId !== entry.id),
                    names: Object.fromEntries(
                      Object.entries(catalog.names).filter(
                        ([id]) => id !== entry.id && id !== association?.id
                      )
                    )
                  })
                }
              >
                {association
                  ? `Remove color and associated neutral ${association.id}`
                  : 'Remove color'}
              </button>
            ) : null}
          </fieldset>
        );
      })}
      <fieldset>
        <legend>Add color</legend>
        <label>
          Internal name
          <input
            aria-label="New color name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </label>
        <label>
          Seed
          <input
            aria-label="New color seed"
            value={newSeed}
            onChange={(e) => setNewSeed(e.target.value)}
          />
        </label>
        <button type="button" disabled={!family} onClick={add}>
          Add catalog color
        </button>
      </fieldset>
    </section>
  );
}
