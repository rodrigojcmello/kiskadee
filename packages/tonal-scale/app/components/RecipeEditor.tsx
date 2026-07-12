'use client';

import { useId } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import {
  KISKADEE_TONAL_PROFILES,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from '@/src/kiskadee-tonal-scale';
import type { KiskadeeTonalSystemResult } from '@/src/tonal-system';
import {
  createTonalFamilyId,
  parseTonalFamilyId,
  resolveTonalFamilyKind,
  TONAL_FAMILY_HUES,
  TONAL_FAMILY_VARIANTS,
  type TonalFamilyHue,
  type TonalFamilyId,
  type TonalFamilySourceV1,
  type TonalSystemRecipeV1,
  type TonalThemePolicy
} from '@/src/tonal-system-contract';
import styles from './RecipeEditor.module.css';

const REST_TONES = KISKADEE_TONES.filter((tone): tone is KiskadeeTone => tone > 0 && tone < 100);
const TONAL_FAMILY_IDS = TONAL_FAMILY_HUES.flatMap((hue) =>
  TONAL_FAMILY_VARIANTS.map((variant) => createTonalFamilyId(hue, variant))
);

const DEFAULT_SEEDS = {
  red: '#d13438',
  orange: '#ca5010',
  yellow: '#ffb900',
  green: '#107c10',
  teal: '#038387',
  cyan: '#00b7c3',
  blue: '#0f6cbd',
  purple: '#8764b8',
  pink: '#e3008c',
  brown: '#8e562e',
  black: '#20252b'
} as const satisfies Record<TonalFamilyHue, string>;

export type RecipeEditorProps = {
  recipe: TonalSystemRecipeV1;
  result: KiskadeeTonalSystemResult;
  isGenerating: boolean;
  onChange: (next: TonalSystemRecipeV1) => void;
};

export function RecipeEditor({ recipe, result, isGenerating, onChange }: RecipeEditorProps) {
  const editorId = useId();
  const nextAvailableFamily = findNextAvailableFamily(recipe.families);
  const proposal = isGenerating ? null : result.rest;
  const visibleStatus = isGenerating ? 'generating' : result.status;

  const updateFamily = (index: number, nextFamily: TonalFamilySourceV1) => {
    const currentFamily = recipe.families[index];
    if (!currentFamily) return;

    const families = recipe.families.map((family, familyIndex) =>
      familyIndex === index ? nextFamily : family
    );
    const primaryReference =
      currentFamily.id === recipe.primaryReference ? nextFamily.id : recipe.primaryReference;

    onChange({ ...recipe, primaryReference, families });
  };

  const updateFamilyId = (index: number, id: TonalFamilyId) => {
    const currentFamily = recipe.families[index];
    if (!currentFamily) return;

    if (recipe.families.some((family, familyIndex) => familyIndex !== index && family.id === id)) {
      return;
    }

    updateFamily(index, {
      ...currentFamily,
      id,
      policies:
        resolveTonalFamilyKind(id) === 'neutral'
          ? {
              light:
                currentFamily.policies.light === 'harmonized'
                  ? 'source-exact'
                  : currentFamily.policies.light,
              dark:
                currentFamily.policies.dark === 'harmonized'
                  ? 'source-exact'
                  : currentFamily.policies.dark
            }
          : currentFamily.policies
    });
  };

  const setPrimary = (id: TonalFamilyId) => {
    if (resolveTonalFamilyKind(id) === 'neutral') return;
    onChange({
      ...recipe,
      primaryReference: id,
      families: recipe.families.map((family) =>
        family.id === id
          ? {
              ...family,
              policies: {
                light: 'source-exact',
                dark: family.policies.dark === 'harmonized' ? 'source-exact' : family.policies.dark
              }
            }
          : family
      )
    });
  };

  const addFamily = () => {
    if (!nextAvailableFamily) return;

    const family: TonalFamilySourceV1 = {
      id: nextAvailableFamily.id,
      seedHex: DEFAULT_SEEDS[nextAvailableFamily.hue],
      policies:
        nextAvailableFamily.hue === 'black'
          ? { light: 'source-exact', dark: 'source-exact' }
          : { light: 'harmonized', dark: 'harmonized' }
    };
    onChange({ ...recipe, families: [...recipe.families, family] });
  };

  const removeFamily = (index: number) => {
    const family = recipe.families[index];
    if (!family || family.id === recipe.primaryReference) return;

    onChange({
      ...recipe,
      families: recipe.families.filter((_, familyIndex) => familyIndex !== index)
    });
  };

  const lockProposal = () => {
    if (!proposal) return;

    onChange({
      ...recipe,
      tonalAnchors: {
        rest: {
          mode: 'locked',
          light: proposal.light,
          dark: proposal.dark
        }
      }
    });
  };

  const setRestTone = (theme: 'light' | 'dark', tone: KiskadeeTone) => {
    const rest = recipe.tonalAnchors.rest;
    if (rest.mode !== 'locked') return;

    onChange({
      ...recipe,
      tonalAnchors: {
        rest: {
          ...rest,
          [theme]: tone
        }
      }
    });
  };

  return (
    <section className={styles.editor} aria-labelledby={`${editorId}-title`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Tonal system recipe</p>
          <h2 id={`${editorId}-title`}>Families and harmony reference</h2>
          <p className={styles.intro}>
            The chromatic primary defines the shared rest fingerprint. Each family chooses how its
            Light and Dark seed is preserved, adapted, or harmonized.
          </p>
        </div>

        <label className={styles.profileField} htmlFor={`${editorId}-profile`}>
          <span>Tonal profile</span>
          <select
            id={`${editorId}-profile`}
            value={recipe.tonalProfile}
            onChange={(event) => {
              const profile = event.target.value as KiskadeeTonalProfile;
              if (KISKADEE_TONAL_PROFILES.some((candidate) => candidate.id === profile)) {
                onChange({ ...recipe, tonalProfile: profile });
              }
            }}
          >
            {KISKADEE_TONAL_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className={styles.familyFieldset}>
        <legend>Primitive color families</legend>
        <div className={styles.familyHeader} aria-hidden="true">
          <span>Primary</span>
          <span>Family ID</span>
          <span>Seed</span>
          <span>Light / Dark policies</span>
          <span>Actions</span>
        </div>

        <div className={styles.familyList}>
          {recipe.families.map((family, index) => {
            const parsed = parseTonalFamilyId(family.id);
            if (!parsed) return null;

            const isPrimary = family.id === recipe.primaryReference;
            const isNeutral = resolveTonalFamilyKind(family.id) === 'neutral';
            const normalizedSeed = normalizeHexColor(family.seedHex);
            const rowId = `${editorId}-family-${index}`;
            const seedIssue = result.issues.find(
              (issue) => issue.familyId === family.id && issue.path.endsWith('/seedHex')
            );
            const seedIssueMessage =
              normalizedSeed === null
                ? 'Enter a six-digit sRGB hex color such as #0f6cbd.'
                : seedIssue?.message;
            const seedIssueId = seedIssueMessage ? `${rowId}-seed-error` : undefined;

            return (
              <div
                className={`${styles.familyRow}${isPrimary ? ` ${styles.primaryRow}` : ''}`}
                key={family.id}
              >
                <label className={styles.primaryControl} title="Use as harmony reference">
                  <input
                    type="radio"
                    name={`${editorId}-primary-family`}
                    checked={isPrimary}
                    disabled={isNeutral}
                    aria-label={`Use ${family.id} as primary harmony reference`}
                    onChange={() => setPrimary(family.id)}
                  />
                  <span className={styles.mobileLabel}>Primary</span>
                </label>

                <label
                  className={`${styles.compactField} ${styles.familyIdField}`}
                  htmlFor={`${rowId}-family-id`}
                >
                  <span className={styles.mobileLabel}>Family ID</span>
                  <select
                    id={`${rowId}-family-id`}
                    value={family.id}
                    onChange={(event) => updateFamilyId(index, event.target.value as TonalFamilyId)}
                  >
                    {TONAL_FAMILY_IDS.map((id) => {
                      const option = parseTonalFamilyId(id);
                      if (!option) return null;
                      return (
                        <option
                          key={id}
                          value={id}
                          disabled={
                            isFamilyIdUsed(recipe.families, index, id) ||
                            (isPrimary && resolveTonalFamilyKind(id) === 'neutral')
                          }
                        >
                          {capitalize(option.hue)} · {option.variant.toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className={styles.seedField} htmlFor={`${rowId}-seed`}>
                  <span className={styles.mobileLabel}>Seed</span>
                  <span
                    className={`${styles.swatch}${normalizedSeed ? '' : ` ${styles.invalidSwatch}`}`}
                    style={{ backgroundColor: normalizedSeed ?? 'transparent' }}
                    aria-hidden="true"
                  />
                  <input
                    id={`${rowId}-seed`}
                    value={family.seedHex}
                    aria-invalid={normalizedSeed === null || Boolean(seedIssue)}
                    aria-describedby={seedIssueId}
                    aria-label={`${capitalize(parsed.hue)} ${parsed.variant.toUpperCase()} seed hex`}
                    autoComplete="off"
                    inputMode="text"
                    spellCheck={false}
                    onChange={(event) =>
                      updateFamily(index, { ...family, seedHex: event.target.value })
                    }
                  />
                  {seedIssueMessage ? (
                    <span className={styles.fieldError} id={seedIssueId}>
                      {seedIssueMessage}
                    </span>
                  ) : null}
                </label>

                <div className={styles.policyCell}>
                  {(['light', 'dark'] as const).map((theme) => (
                    <label
                      className={styles.themePolicy}
                      htmlFor={`${rowId}-${theme}-policy`}
                      key={theme}
                    >
                      <span>{capitalize(theme)}</span>
                      <select
                        id={`${rowId}-${theme}-policy`}
                        value={family.policies[theme]}
                        disabled={isPrimary && theme === 'light'}
                        onChange={(event) =>
                          updateFamily(index, {
                            ...family,
                            policies: {
                              ...family.policies,
                              [theme]: event.target.value as TonalThemePolicy
                            }
                          })
                        }
                      >
                        <option value="source-exact">Source exact</option>
                        <option value="adaptive">Adaptive</option>
                        {!isNeutral && !(isPrimary && theme === 'dark') ? (
                          <option value="harmonized">Harmonized</option>
                        ) : null}
                      </select>
                    </label>
                  ))}
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.removeButton}
                    type="button"
                    disabled={isPrimary}
                    title={
                      isPrimary ? 'Select another primary before removing this family.' : undefined
                    }
                    onClick={() => removeFamily(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={styles.addButton}
          type="button"
          disabled={!nextAvailableFamily}
          onClick={addFamily}
        >
          <span aria-hidden="true">+</span> Add family
        </button>
      </fieldset>

      <div className={styles.lowerGrid}>
        <section className={styles.anchorCard} aria-labelledby={`${editorId}-rest-title`}>
          <div className={styles.cardHeading}>
            <div>
              <p className={styles.kicker}>Shared functional anchor</p>
              <h3 id={`${editorId}-rest-title`}>Rest</h3>
            </div>
            <span className={styles.modeTag}>{recipe.tonalAnchors.rest.mode}</span>
          </div>
          <p className={styles.anchorHelp}>
            Any chromatic position from 1 through 99 may be rest. Contrast against both caps is
            reported in the primary reference diagnostics.
          </p>

          {recipe.tonalAnchors.rest.mode === 'auto' ? (
            <div className={styles.autoAnchor}>
              <p>
                {proposal
                  ? `Current proposal: L${proposal.light} / D${proposal.dark}`
                  : isGenerating
                    ? 'Resolving the current Light and Dark proposal…'
                    : 'A proposal will appear when the recipe is valid.'}
              </p>
              <button type="button" disabled={!proposal} onClick={lockProposal}>
                Lock proposal
              </button>
            </div>
          ) : (
            <div className={styles.lockedAnchor}>
              <label htmlFor={`${editorId}-rest-light`}>
                <span>Light position</span>
                <select
                  id={`${editorId}-rest-light`}
                  value={recipe.tonalAnchors.rest.light}
                  onChange={(event) =>
                    setRestTone('light', Number(event.target.value) as KiskadeeTone)
                  }
                >
                  {REST_TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      L{tone}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor={`${editorId}-rest-dark`}>
                <span>Dark position</span>
                <select
                  id={`${editorId}-rest-dark`}
                  value={recipe.tonalAnchors.rest.dark}
                  onChange={(event) =>
                    setRestTone('dark', Number(event.target.value) as KiskadeeTone)
                  }
                >
                  {REST_TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      D{tone}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() =>
                  onChange({
                    ...recipe,
                    tonalAnchors: { rest: { mode: 'auto' } }
                  })
                }
              >
                Return to auto
              </button>
            </div>
          )}
        </section>

        <section
          className={`${styles.statusCard} ${styles[`status${capitalize(visibleStatus)}`]}`}
          aria-labelledby={`${editorId}-status-title`}
          aria-live="polite"
        >
          <div className={styles.cardHeading}>
            <div>
              <p className={styles.kicker}>Generator health</p>
              <h3 id={`${editorId}-status-title`}>System status</h3>
            </div>
            <span className={styles.statusBadge}>{capitalize(visibleStatus)}</span>
          </div>

          <p className={styles.statusSummary}>
            {isGenerating
              ? 'Resolving the current recipe and every dependent family.'
              : result.issues.length === 0
                ? `${result.families.length} ${pluralize(result.families.length, 'family', 'families')} resolved without issues.`
                : `${result.issues.length} ${pluralize(result.issues.length, 'issue', 'issues')} require attention.`}
          </p>

          {!isGenerating && result.issues.length > 0 ? (
            <details className={styles.issueDetails} open={result.status === 'error'}>
              <summary>Review issues</summary>
              <ul>
                {result.issues.map((issue) => (
                  <li key={`${issue.code}-${issue.path}-${issue.message}`}>
                    <strong>{issue.code}</strong>
                    <span>{issue.message}</span>
                    <code>{issue.path || '/'}</code>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      </div>
    </section>
  );
}

export default RecipeEditor;

function isFamilyIdUsed(
  families: TonalFamilySourceV1[],
  currentIndex: number,
  id: TonalFamilyId
): boolean {
  return families.some((family, index) => index !== currentIndex && family.id === id);
}

function findNextAvailableFamily(
  families: TonalFamilySourceV1[]
): { id: TonalFamilyId; hue: TonalFamilyHue } | null {
  const usedIds = new Set(families.map((family) => family.id));

  for (const variant of TONAL_FAMILY_VARIANTS) {
    for (const hue of TONAL_FAMILY_HUES) {
      const id = createTonalFamilyId(hue, variant);
      if (!usedIds.has(id)) return { id, hue };
    }
  }

  return null;
}

function capitalize<T extends string>(value: T): Capitalize<T> {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as Capitalize<T>;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
