'use client';

import { useState } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import { classifyMunsellHex } from '@/src/munsell-oklch';
import { deriveSupportingColor, SUPPORTING_COLOR_STRATEGY } from '@/src/supporting-color';
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
  onChange,
  onPrimaryChange
}: {
  recipe: TonalSystemRecipeV5;
  result: KiskadeeTonalSystemResult;
  onChange: (recipe: TonalSystemRecipeV5) => void;
  onPrimaryChange: (primary: TonalSystemRecipeV5['primary']) => void;
}) {
  const catalog = recipe.catalog ?? { colors: [], names: {}, neutrals: [] };
  const [newSeed, setNewSeed] = useState('#6750A4');
  const [newName, setNewName] = useState('');
  const change = (next: TonalCatalog) => {
    const primaryNeutral = next.neutrals.find(
      (n) => n.sourceId === 'primary' && n.id === 'n.black.v2'
    );
    const remaining = new Set([
      ...next.colors.map((c) => c.id),
      ...next.neutrals.map((n) => n.id),
      ...(next.supportingColors ?? []).map((n) => n.id)
    ]);
    const removed = new Set(
      [
        ...catalog.colors.map((c) => c.id),
        ...catalog.neutrals.map((n) => n.id),
        ...(catalog.supportingColors ?? []).map((n) => n.id)
      ].filter((id) => !remaining.has(id))
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
    ...catalog.neutrals.map((n) => n.id),
    ...(catalog.supportingColors ?? []).map((n) => n.id)
  ];
  if (recipe.neutral) ids.push('n.black.v2');
  const entries = [
    { ...recipe.primary, id: 'primary' },
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
        Edit the base primary, custom seeds and additional variants here. Expand an entry to set its
        seed, policies, name and derived colors. Additional variants do not recalibrate the base.
      </p>
      {entries.map((entry) => {
        const association = catalog.neutrals.find((n) => n.sourceId === entry.id);
        const support = catalog.supportingColors?.find((n) => n.sourceId === entry.id);
        const parent = result.valid
          ? result.families.find(
              (f) => f.id === (entry.id === 'primary' ? result.primaryReference.familyId : entry.id)
            )
          : undefined;
        const derivedSupport = parent
          ? deriveSupportingColor(parent.themes.light.restColor.hex)
          : undefined;
        const supportFamily = derivedSupport
          ? TONAL_FAMILY_IDENTITIES.find((f) => f.sector === derivedSupport.identity.sector)
          : undefined;
        const additional = catalog.colors.find((c) => c.id === entry.id);
        const updateEntry = (next: {
          seedHex: string;
          policies: TonalSystemRecipeV5['overrides'][number]['policies'];
        }) => {
          if (entry.id === 'primary') {
            onPrimaryChange({
              ...recipe.primary,
              seedHex: next.seedHex,
              policies: {
                light: 'source-exact',
                dark: next.policies.dark === 'source-exact' ? 'source-exact' : 'adaptive'
              }
            });
          } else if (additional) {
            change({
              ...catalog,
              colors: catalog.colors.map((color) =>
                color.id === entry.id
                  ? { ...color, seedHex: next.seedHex, policies: next.policies }
                  : color
              )
            });
          } else {
            onChange({
              ...recipe,
              overrides: recipe.overrides.map((color) =>
                color.id === entry.id
                  ? { ...color, seedHex: next.seedHex, policies: next.policies }
                  : color
              )
            });
          }
        };
        const legacyPrimaryNeutral =
          entry.id === 'primary' && recipe.neutral?.mode === 'derived-from-primary' && !association;
        return (
          <details key={entry.id} className={styles.entry}>
            <summary>
              <span
                className={styles.swatch}
                style={{ backgroundColor: normalizeHexColor(entry.seedHex) ?? 'transparent' }}
                aria-hidden="true"
              />
              <span>
                <strong>{catalog.names[entry.id] || parent?.id || entry.id}</strong>
                <small>
                  {catalog.names[entry.id] ? `${parent?.id ?? entry.id} · ` : ''}
                  {entry.seedHex}
                </small>
                {association || support || legacyPrimaryNeutral ? (
                  <small>
                    {[
                      association
                        ? `Neutral: ${association.id}`
                        : legacyPrimaryNeutral
                          ? 'Neutral: n.black.v2'
                          : '',
                      support ? `Support: ${support.id}` : ''
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                ) : null}
              </span>
            </summary>
            <fieldset>
              <legend>Edit {parent?.id ?? entry.id}</legend>
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
              <label>
                Seed
                <input
                  aria-label={`Seed ${entry.id}`}
                  value={entry.seedHex}
                  onChange={(event) => updateEntry({ ...entry, seedHex: event.target.value })}
                />
              </label>
              {(['light', 'dark'] as const).map((theme) => (
                <label key={theme}>
                  {theme === 'light' ? 'Light policy' : 'Dark policy'}
                  <select
                    aria-label={`${theme} policy ${entry.id}`}
                    value={entry.policies[theme]}
                    onChange={(event) =>
                      updateEntry({
                        ...entry,
                        policies: {
                          ...entry.policies,
                          [theme]: event.target.value as typeof entry.policies.light
                        }
                      })
                    }
                  >
                    <option value="source-exact">Source exact</option>
                    {entry.id !== 'primary' || theme === 'dark' ? (
                      <option value="adaptive">Adaptive</option>
                    ) : null}
                    {entry.id !== 'primary' ? <option value="harmonized">Harmonized</option> : null}
                  </select>
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  aria-label={`Generate supporting color ${entry.id}`}
                  checked={!!support}
                  disabled={!support && !supportFamily}
                  onChange={(e) => {
                    if (e.target.checked && !supportFamily) return;
                    change({
                      ...catalog,
                      supportingColors: e.target.checked
                        ? [
                            ...(catalog.supportingColors ?? []),
                            {
                              id: `${supportFamily!.stem}.${nextTonalFamilyVariant(ids, supportFamily!.stem)}`,
                              sourceId: entry.id as 'primary',
                              strategy: SUPPORTING_COLOR_STRATEGY
                            }
                          ]
                        : (catalog.supportingColors ?? []).filter((n) => n.sourceId !== entry.id),
                      names: Object.fromEntries(
                        Object.entries(catalog.names).filter(([id]) => id !== support?.id)
                      )
                    });
                  }}
                />
                Generate supporting color (Material)
              </label>
              {support ? (
                <>
                  <p>
                    Supporting color: {support.id} ·{' '}
                    {result.families.find((f) => f.id === support.id)?.sourceSeedHex ?? 'pending'}
                  </p>
                  <label>
                    Supporting color name
                    <input
                      aria-label={`Supporting color name ${entry.id}`}
                      value={catalog.names[support.id] ?? ''}
                      onChange={(e) =>
                        change({
                          ...catalog,
                          names: { ...catalog.names, [support.id]: e.target.value }
                        })
                      }
                    />
                  </label>
                </>
              ) : null}
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
                      supportingColors: (catalog.supportingColors ?? []).filter(
                        (n) => n.sourceId !== entry.id
                      ),
                      names: Object.fromEntries(
                        Object.entries(catalog.names).filter(
                          ([id]) => id !== entry.id && id !== association?.id && id !== support?.id
                        )
                      )
                    })
                  }
                >
                  {association || support
                    ? `Remove color and derived colors ${[association?.id, support?.id].filter(Boolean).join(', ')}`
                    : 'Remove color'}
                </button>
              ) : null}
            </fieldset>
          </details>
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
