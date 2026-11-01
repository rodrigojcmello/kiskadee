'use client';

import { useState } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import { KISKADEE_TONAL_PROFILES, type KiskadeeTonalProfile } from '@/src/kiskadee-tonal-scale';
import { classifyMunsellHex } from '@/src/munsell-oklch';
import type { KiskadeeTonalSystemResult } from '@/src/tonal-system';
import {
  type ComplementaryColorAssociation,
  createComplementaryColorId,
  nextTonalFamilyVariant,
  TONAL_FAMILY_IDENTITIES,
  type TonalCatalog,
  type TonalSystemRecipeV5
} from '@/src/tonal-system-contract';
import styles from './CatalogEditor.module.css';

export function CatalogEditor({
  recipe,
  result,
  isGenerating,
  onChange,
  onPrimaryChange
}: {
  recipe: TonalSystemRecipeV5;
  result: KiskadeeTonalSystemResult;
  isGenerating: boolean;
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
      ...(next.complementaryColors ?? []).map((n) => n.id)
    ]);
    const removed = new Set(
      [
        ...catalog.colors.map((c) => c.id),
        ...catalog.neutrals.map((n) => n.id),
        ...(catalog.complementaryColors ?? []).map((n) => n.id)
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
    ...(catalog.complementaryColors ?? []).map((n) => n.id)
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
        const complementary = catalog.complementaryColors?.find((n) => n.sourceId === entry.id);
        const parent = result.valid
          ? result.families.find(
              (f) => f.id === (entry.id === 'primary' ? result.primaryReference.familyId : entry.id)
            )
          : undefined;
        const complementaryFamily = complementary
          ? result.families.find((family) => family.id === complementary.id)
          : undefined;
        const canGenerateComplementary = parent?.colorKind === 'chromatic';
        const updateComplementary = (patch: Partial<ComplementaryColorAssociation>) =>
          change({
            ...catalog,
            complementaryColors: catalog.complementaryColors?.map((color) =>
              color.id === complementary?.id ? { ...color, ...patch } : color
            )
          });
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
                {association || complementary || legacyPrimaryNeutral ? (
                  <small>
                    {[
                      association
                        ? `Neutral: ${association.id}`
                        : legacyPrimaryNeutral
                          ? 'Neutral: n.black.v2'
                          : '',
                      complementary ? `Complementary: ${complementary.id}` : ''
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
                  aria-label={`Generate complementary color ${entry.id}`}
                  checked={!!complementary}
                  disabled={isGenerating || (!complementary && !canGenerateComplementary)}
                  onChange={(e) => {
                    if (e.target.checked && !parent) return;
                    change({
                      ...catalog,
                      complementaryColors: e.target.checked
                        ? [
                            ...(catalog.complementaryColors ?? []),
                            {
                              id: createComplementaryColorId(parent!.id),
                              sourceId: entry.id as ComplementaryColorAssociation['sourceId'],
                              strategy: 'material-complement-v1'
                            }
                          ]
                        : (catalog.complementaryColors ?? []).filter(
                            (n) => n.sourceId !== entry.id
                          ),
                      names: Object.fromEntries(
                        Object.entries(catalog.names).filter(([id]) => id !== complementary?.id)
                      )
                    });
                  }}
                />
                Generate complementary color
              </label>
              {complementary ? (
                <>
                  <label>
                    Complementary strategy
                    <select
                      aria-label={`Complementary strategy ${entry.id}`}
                      value={complementary.strategy}
                      onChange={(event) =>
                        updateComplementary({
                          strategy: event.target.value as ComplementaryColorAssociation['strategy']
                        })
                      }
                    >
                      <option value="material-complement-v1">Chromatic alternative</option>
                      <option value="contrast-complement-v1">Contrast accent</option>
                    </select>
                  </label>
                  <label>
                    Complementary profile
                    <select
                      aria-label={`Complementary profile ${entry.id}`}
                      value={complementary.tonalProfile ?? ''}
                      onChange={(event) =>
                        updateComplementary({
                          tonalProfile: (event.target.value || undefined) as
                            | KiskadeeTonalProfile
                            | undefined
                        })
                      }
                    >
                      <option value="">Strategy default</option>
                      {KISKADEE_TONAL_PROFILES.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Complementary name
                    <input
                      aria-label={`Complementary color name ${entry.id}`}
                      value={catalog.names[complementary.id] ?? ''}
                      onChange={(e) =>
                        change({
                          ...catalog,
                          names: { ...catalog.names, [complementary.id]: e.target.value }
                        })
                      }
                    />
                  </label>
                  <p>
                    <strong>{complementary.id}</strong> ·{' '}
                    {complementaryFamily?.sourceSeedHex ?? 'pending'}
                    {complementaryFamily?.identity
                      ? ` · Measured sector: ${complementaryFamily.identity.sector}`
                      : ''}
                    {complementaryFamily
                      ? ` · Profile: ${complementaryFamily.themes.light.scale.diagnostics.profile}`
                      : ''}
                  </p>
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
                      complementaryColors: (catalog.complementaryColors ?? []).filter(
                        (n) => n.sourceId !== entry.id
                      ),
                      names: Object.fromEntries(
                        Object.entries(catalog.names).filter(
                          ([id]) =>
                            id !== entry.id && id !== association?.id && id !== complementary?.id
                        )
                      )
                    })
                  }
                >
                  {association || complementary
                    ? `Remove color and derived colors ${[association?.id, complementary?.id].filter(Boolean).join(', ')}`
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
