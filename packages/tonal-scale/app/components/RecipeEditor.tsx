'use client';

import { useId, useState } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import {
  KISKADEE_TONAL_PROFILES,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from '@/src/kiskadee-tonal-scale';
import {
  classifyMunsellHex,
  type MunsellHexClassification,
  suggestYellowRedVariant
} from '@/src/munsell-oklch';
import type {
  KiskadeeTonalSystemResult,
  ResolvedTonalFamily,
  TonalSystemIssue
} from '@/src/tonal-system';
import {
  createTonalFamilyId,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  TONAL_CORE_FAMILY_IDS,
  TONAL_FAMILY_NAMES,
  TONAL_FAMILY_VARIANTS,
  type TonalFamilyId,
  type TonalFamilyName,
  type TonalFamilyOverrideV2,
  type TonalFamilyVariant,
  type TonalPrimaryDraftV2,
  type TonalPrimaryVariant,
  type TonalSystemRecipeV2,
  type TonalThemePolicy
} from '@/src/tonal-system-contract';
import styles from './RecipeEditor.module.css';

const REST_TONES = KISKADEE_TONES.filter((tone): tone is KiskadeeTone => tone > 0 && tone < 100);
const CORE_FAMILY_ID_SET = new Set<TonalFamilyId>(TONAL_CORE_FAMILY_IDS);
const EXTRA_VARIANTS = TONAL_FAMILY_VARIANTS.filter((variant) => variant !== 'v1');
const EXTRA_FAMILY_IDS = TONAL_FAMILY_NAMES.flatMap((family) =>
  EXTRA_VARIANTS.map((variant) => createTonalFamilyId(family, variant))
).filter((id) => !CORE_FAMILY_ID_SET.has(id));

const DEFAULT_SEEDS = {
  red: '#d13438',
  'yellow-red': '#ca5010',
  yellow: '#ffb900',
  'green-yellow': '#7fba00',
  green: '#107c10',
  'blue-green': '#038387',
  blue: '#0f6cbd',
  'purple-blue': '#4f6bed',
  purple: '#8764b8',
  'red-purple': '#e3008c',
  black: '#20252b'
} as const satisfies Record<TonalFamilyName, string>;

const POLICY_LABELS = {
  'source-exact': 'Source exact',
  adaptive: 'Adaptive',
  harmonized: 'Harmonized'
} as const satisfies Record<TonalThemePolicy, string>;

export type RecipeEditorProps = {
  recipe: TonalSystemRecipeV2;
  result: KiskadeeTonalSystemResult;
  isGenerating: boolean;
  onChange: (next: TonalSystemRecipeV2) => void;
};

export function RecipeEditor({ recipe, result, isGenerating, onChange }: RecipeEditorProps) {
  const editorId = useId();
  const [requestedExtraId, setRequestedExtraId] = useState<TonalFamilyId | ''>('');
  const classification = classifyPrimary(recipe.primary.seedHex);
  const suggestedVariant = resolveSuggestedVariant(classification);
  const inferredPrimaryId = resolvePrimaryId(recipe, classification);
  const resolvedPrimaryId = result.valid ? result.primaryReference.familyId : inferredPrimaryId;
  const usedIds = new Set(recipe.overrides.map((override) => override.id));
  const extraOptions = EXTRA_FAMILY_IDS.filter(
    (id) => !usedIds.has(id) && id !== resolvedPrimaryId
  );
  const extraId =
    requestedExtraId && extraOptions.includes(requestedExtraId)
      ? requestedExtraId
      : (extraOptions[0] ?? '');
  const proposal = !isGenerating && result.rest ? result.rest : null;
  const visibleStatus = isGenerating ? 'generating' : result.status;
  const primaryIssue = resolvePrimaryIssue(result.issues);
  const primaryError = resolvePrimaryError(recipe.primary.seedHex, classification, primaryIssue);
  const resolvedPrimary = result.valid
    ? result.families.find((family) => family.id === result.primaryReference.familyId)
    : undefined;

  const updatePrimary = (primary: TonalPrimaryDraftV2) => {
    const nextRecipe: TonalSystemRecipeV2 = { ...recipe, primary };
    const nextPrimaryId = resolvePrimaryId(nextRecipe, classifyPrimary(primary.seedHex));

    onChange({
      ...nextRecipe,
      overrides: nextPrimaryId
        ? nextRecipe.overrides.filter((override) => override.id !== nextPrimaryId)
        : nextRecipe.overrides
    });
  };

  const addOverride = (id: TonalFamilyId) => {
    if (recipe.overrides.some((override) => override.id === id) || id === resolvedPrimaryId) return;

    const parsed = parseTonalFamilyId(id);
    if (!parsed) return;
    const resolved = result.families.find((family) => family.id === id);
    const sectorPeer = result.families.find(
      (family) => parsed.sector !== null && family.sector === parsed.sector
    );
    const seedHex =
      resolved?.sourceSeedHex ??
      sectorPeer?.sourceSeedHex ??
      (id === 'yellow-red.v2' ? '#8e562e' : DEFAULT_SEEDS[parsed.family]);
    const colorKind = resolveTonalFamilyColorKind(id);
    const override: TonalFamilyOverrideV2 = {
      id,
      seedHex,
      policies:
        colorKind === 'achromatic'
          ? { light: 'source-exact', dark: 'source-exact' }
          : { light: 'harmonized', dark: 'harmonized' }
    };

    onChange({ ...recipe, overrides: [...recipe.overrides, override] });
  };

  const updateOverride = (nextOverride: TonalFamilyOverrideV2) => {
    onChange({
      ...recipe,
      overrides: recipe.overrides.map((override) =>
        override.id === nextOverride.id ? nextOverride : override
      )
    });
  };

  const removeOverride = (id: TonalFamilyId) => {
    onChange({
      ...recipe,
      overrides: recipe.overrides.filter((override) => override.id !== id)
    });
  };

  const lockProposal = () => {
    if (!proposal) return;

    onChange({
      ...recipe,
      tonalAnchors: {
        rest: { mode: 'locked', light: proposal.light, dark: proposal.dark }
      }
    });
  };

  const setRestTone = (theme: 'light' | 'dark', tone: KiskadeeTone) => {
    const rest = recipe.tonalAnchors.rest;
    if (rest.mode !== 'locked') return;

    onChange({
      ...recipe,
      tonalAnchors: { rest: { ...rest, [theme]: tone } }
    });
  };

  return (
    <section className={styles.editor} aria-labelledby={`${editorId}-title`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Primary-derived recipe</p>
          <h2 id={`${editorId}-title`}>Primary color and Munsell projection</h2>
          <p className={styles.intro}>
            The exact primary establishes the shared Light and Dark rest fingerprint. Kiskadee then
            derives every canonical Munsell family while optional overrides preserve Design System
            source colors.
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

      <section className={styles.primaryCard} aria-labelledby={`${editorId}-primary-title`}>
        <div className={styles.primaryHeading}>
          <div>
            <p className={styles.kicker}>Global reference</p>
            <h3 id={`${editorId}-primary-title`}>Primary</h3>
          </div>
          <div className={styles.classificationBadges} aria-live="polite">
            <span>
              Sector{' '}
              <strong>{classification ? formatFamilyName(classification.sector) : '—'}</strong>
            </span>
            <span>
              Suggested{' '}
              <strong>
                {classification ? `${classification.sector}.${suggestedVariant}` : '—'}
              </strong>
            </span>
            <span>
              Resolved <strong>{resolvedPrimaryId ?? '—'}</strong>
            </span>
          </div>
        </div>

        <div className={styles.primaryControls}>
          <label className={styles.primarySeedField} htmlFor={`${editorId}-primary-seed`}>
            <span>Exact primary hex</span>
            <span
              className={`${styles.swatch}${classification ? '' : ` ${styles.invalidSwatch}`}`}
              style={{
                backgroundColor: normalizeHexColor(recipe.primary.seedHex) ?? 'transparent'
              }}
              aria-hidden="true"
            />
            <input
              id={`${editorId}-primary-seed`}
              value={recipe.primary.seedHex}
              aria-invalid={Boolean(primaryError)}
              aria-describedby={primaryError ? `${editorId}-primary-seed-error` : undefined}
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              onChange={(event) =>
                updatePrimary({ ...recipe.primary, seedHex: event.target.value })
              }
            />
            {primaryError ? (
              <span className={styles.fieldError} id={`${editorId}-primary-seed-error`}>
                {primaryError}
              </span>
            ) : null}
          </label>

          <label className={styles.compactField} htmlFor={`${editorId}-primary-variant`}>
            <span>Primary variant</span>
            <select
              id={`${editorId}-primary-variant`}
              value={recipe.primary.variant}
              onChange={(event) =>
                updatePrimary({
                  ...recipe.primary,
                  variant: event.target.value as TonalPrimaryVariant
                })
              }
            >
              <option value="auto">Auto · suggested {suggestedVariant.toUpperCase()}</option>
              {TONAL_FAMILY_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.fixedPolicy}>
            <span>Light policy</span>
            <strong>Source exact</strong>
          </div>

          <label className={styles.compactField} htmlFor={`${editorId}-primary-dark-policy`}>
            <span>Dark policy</span>
            <select
              id={`${editorId}-primary-dark-policy`}
              value={recipe.primary.policies.dark}
              onChange={(event) =>
                updatePrimary({
                  ...recipe.primary,
                  policies: {
                    ...recipe.primary.policies,
                    dark: event.target.value as TonalPrimaryDraftV2['policies']['dark']
                  }
                })
              }
            >
              <option value="source-exact">Source exact</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </label>
        </div>

        <p className={styles.primaryNote}>
          {classification
            ? `Hue ${classification.hue.toFixed(1)}° · ${(classification.positionInSector * 100).toFixed(1)}% through ${formatFamilyName(classification.sector)} · ${classification.isInSafeCore ? 'inside the safe generation region' : `near the ${classification.boundarySide} boundary`}.`
            : 'Enter a valid six-digit sRGB hex to classify the primary.'}
          {resolvedPrimary
            ? ` Current anchors: L${resolvedPrimary.themes.light.restTone} / D${resolvedPrimary.themes.dark.restTone}.`
            : ''}
        </p>
      </section>

      <fieldset className={styles.familyFieldset}>
        <legend>Canonical primitive color families</legend>
        <div className={styles.familySectionHeading}>
          <div>
            <h3>Core families</h3>
            <p>All twelve assets are generated on every run and cannot be removed.</p>
          </div>
          <span>{TONAL_CORE_FAMILY_IDS.length} required</span>
        </div>
        <div className={styles.familyHeader} aria-hidden="true">
          <span>Family</span>
          <span>Seed</span>
          <span>Light / Dark policies</span>
          <span>Override</span>
        </div>

        <div className={styles.familyList}>
          {TONAL_CORE_FAMILY_IDS.map((id) => {
            const override = recipe.overrides.find((candidate) => candidate.id === id);
            const overrideIndex = recipe.overrides.findIndex((candidate) => candidate.id === id);
            return (
              <FamilyRow
                key={id}
                id={id}
                required
                isPrimary={id === resolvedPrimaryId}
                override={override}
                resolved={result.families.find((family) => family.id === id)}
                seedIssue={resolveFamilySeedIssue(result.issues, id, overrideIndex)}
                onEnable={() => addOverride(id)}
                onChange={updateOverride}
                onRemove={() => removeOverride(id)}
              />
            );
          })}
        </div>
      </fieldset>

      <section className={styles.extraSection} aria-labelledby={`${editorId}-extras-title`}>
        <div className={styles.familySectionHeading}>
          <div>
            <h3 id={`${editorId}-extras-title`}>Additional variants</h3>
            <p>Optional V2–V4 assets require their own explicit seed and may be removed.</p>
          </div>
          <span>
            {recipe.overrides.filter((override) => !CORE_FAMILY_ID_SET.has(override.id)).length}{' '}
            added
          </span>
        </div>

        {recipe.overrides.some((override) => !CORE_FAMILY_ID_SET.has(override.id)) ? (
          <div className={styles.familyList}>
            {recipe.overrides
              .filter((override) => !CORE_FAMILY_ID_SET.has(override.id))
              .map((override) => {
                const overrideIndex = recipe.overrides.findIndex(
                  (candidate) => candidate.id === override.id
                );
                return (
                  <FamilyRow
                    key={override.id}
                    id={override.id}
                    required={false}
                    isPrimary={override.id === resolvedPrimaryId}
                    override={override}
                    resolved={result.families.find((family) => family.id === override.id)}
                    seedIssue={resolveFamilySeedIssue(result.issues, override.id, overrideIndex)}
                    onEnable={() => addOverride(override.id)}
                    onChange={updateOverride}
                    onRemove={() => removeOverride(override.id)}
                  />
                );
              })}
          </div>
        ) : (
          <p className={styles.emptyExtras}>No additional variants in this recipe.</p>
        )}

        <div className={styles.addExtraRow}>
          <label htmlFor={`${editorId}-extra-family`}>
            <span>Family variant</span>
            <select
              id={`${editorId}-extra-family`}
              value={extraId}
              disabled={extraOptions.length === 0}
              onChange={(event) => setRequestedExtraId(event.target.value as TonalFamilyId)}
            >
              {extraOptions.map((id) => (
                <option key={id} value={id}>
                  {formatFamilyId(id)}
                </option>
              ))}
            </select>
          </label>
          <button
            className={styles.addButton}
            type="button"
            disabled={!extraId}
            onClick={() => {
              if (!extraId) return;
              addOverride(extraId);
              setRequestedExtraId('');
            }}
          >
            <span aria-hidden="true">+</span> Add variant
          </button>
        </div>
      </section>

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
            The primary proposes one Light and one Dark rest position. Every generated family uses
            those same positions.
          </p>

          {recipe.tonalAnchors.rest.mode === 'auto' ? (
            <div className={styles.autoAnchor}>
              <p>
                {proposal
                  ? `Current proposal: L${proposal.light} / D${proposal.dark}`
                  : isGenerating
                    ? 'Resolving the current Light and Dark proposal…'
                    : 'A proposal will appear when the primary is valid.'}
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
                onClick={() => onChange({ ...recipe, tonalAnchors: { rest: { mode: 'auto' } } })}
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
              ? 'Resolving the primary-derived recipe and every dependent family.'
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

type FamilyRowProps = {
  id: TonalFamilyId;
  required: boolean;
  isPrimary: boolean;
  override: TonalFamilyOverrideV2 | undefined;
  resolved: ResolvedTonalFamily | undefined;
  seedIssue: string | undefined;
  onEnable: () => void;
  onChange: (override: TonalFamilyOverrideV2) => void;
  onRemove: () => void;
};

function FamilyRow({
  id,
  required,
  isPrimary,
  override,
  resolved,
  seedIssue,
  onEnable,
  onChange,
  onRemove
}: FamilyRowProps) {
  const rowId = useId();
  const colorKind = resolveTonalFamilyColorKind(id);
  const activeSeed = override?.seedHex ?? resolved?.sourceSeedHex;
  const normalizedSeed = activeSeed ? normalizeHexColor(activeSeed) : null;
  const policies =
    override?.policies ??
    (resolved
      ? { light: resolved.themes.light.policy, dark: resolved.themes.dark.policy }
      : colorKind === 'achromatic'
        ? { light: 'source-exact' as const, dark: 'source-exact' as const }
        : { light: 'harmonized' as const, dark: 'harmonized' as const });
  const canDisable = Boolean(override);

  return (
    <div
      className={`${styles.familyRow}${isPrimary ? ` ${styles.primaryRow}` : ''}${override ? ` ${styles.overrideRow}` : ''}`}
    >
      <div className={styles.familyIdentity}>
        <span
          className={`${styles.familySwatch}${normalizedSeed ? '' : ` ${styles.invalidSwatch}`}`}
          style={{ backgroundColor: normalizedSeed ?? 'transparent' }}
          aria-hidden="true"
        />
        <span>
          <strong>{formatFamilyId(id)}</strong>
          <small>
            {isPrimary
              ? 'Primary · exact input'
              : override
                ? 'Explicit override'
                : resolved?.seedOrigin === 'canonical'
                  ? 'Canonical source'
                  : 'Derived from primary'}
          </small>
        </span>
      </div>

      {override ? (
        <label className={styles.seedField} htmlFor={`${rowId}-seed`}>
          <span className={styles.mobileLabel}>Override seed</span>
          <input
            id={`${rowId}-seed`}
            value={override.seedHex}
            aria-invalid={normalizeHexColor(override.seedHex) === null || Boolean(seedIssue)}
            aria-describedby={seedIssue ? `${rowId}-seed-error` : undefined}
            aria-label={`${id} override seed hex`}
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
            onChange={(event) => onChange({ ...override, seedHex: event.target.value })}
          />
          {seedIssue ? (
            <span className={styles.fieldError} id={`${rowId}-seed-error`}>
              {seedIssue}
            </span>
          ) : null}
        </label>
      ) : (
        <div className={styles.generatedSeed}>
          <span className={styles.mobileLabel}>Generated seed</span>
          <code>{activeSeed ?? 'Generating…'}</code>
        </div>
      )}

      <div className={styles.policyCell}>
        {(['light', 'dark'] as const).map((theme) =>
          override ? (
            <label className={styles.themePolicy} htmlFor={`${rowId}-${theme}-policy`} key={theme}>
              <span>{capitalize(theme)}</span>
              <select
                id={`${rowId}-${theme}-policy`}
                value={override.policies[theme]}
                onChange={(event) =>
                  onChange({
                    ...override,
                    policies: {
                      ...override.policies,
                      [theme]: event.target.value as TonalThemePolicy
                    }
                  })
                }
              >
                <option value="source-exact">Source exact</option>
                <option value="adaptive">Adaptive</option>
                {colorKind === 'chromatic' ? <option value="harmonized">Harmonized</option> : null}
              </select>
            </label>
          ) : (
            <span className={styles.policyTag} key={theme}>
              {capitalize(theme)} · {POLICY_LABELS[policies[theme]]}
            </span>
          )
        )}
      </div>

      <div className={styles.actions}>
        {required ? (
          <label
            className={`${styles.overrideToggle}${isPrimary && !override ? ` ${styles.disabledToggle}` : ''}`}
            title={
              isPrimary ? 'The primary seed is edited in the global reference above.' : undefined
            }
          >
            <input
              type="checkbox"
              checked={Boolean(override)}
              disabled={isPrimary && !override}
              onChange={() => (canDisable ? onRemove() : onEnable())}
            />
            <span aria-hidden="true" />
            <b>{override ? 'On' : isPrimary ? 'Primary' : 'Off'}</b>
          </label>
        ) : (
          <button className={styles.removeButton} type="button" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function classifyPrimary(seedHex: string): MunsellHexClassification | null {
  if (!normalizeHexColor(seedHex)) return null;
  try {
    return classifyMunsellHex(seedHex);
  } catch {
    return null;
  }
}

function resolveSuggestedVariant(
  classification: MunsellHexClassification | null
): TonalFamilyVariant {
  if (classification?.sector !== 'yellow-red') return 'v1';
  return suggestYellowRedVariant(classification.oklch).variant;
}

function resolvePrimaryId(
  recipe: TonalSystemRecipeV2,
  classification: MunsellHexClassification | null
): TonalFamilyId | null {
  if (!classification) return null;
  const variant =
    recipe.primary.variant === 'auto'
      ? resolveSuggestedVariant(classification)
      : recipe.primary.variant;
  return createTonalFamilyId(classification.sector, variant);
}

function resolvePrimaryIssue(issues: TonalSystemIssue[]): TonalSystemIssue | undefined {
  return issues.find(
    (issue) =>
      issue.severity === 'error' &&
      (issue.path === '/primary' || issue.path.startsWith('/primary/'))
  );
}

function resolvePrimaryError(
  seedHex: string,
  classification: MunsellHexClassification | null,
  issue: TonalSystemIssue | undefined
): string | undefined {
  if (!normalizeHexColor(seedHex)) return 'Enter a six-digit sRGB hex color such as #0f6cbd.';
  const diagnostic = classification?.diagnostics.find(
    (candidate) => candidate.severity === 'error'
  );
  return diagnostic?.message ?? issue?.message;
}

function resolveFamilySeedIssue(
  issues: TonalSystemIssue[],
  id: TonalFamilyId,
  overrideIndex: number
): string | undefined {
  return issues.find(
    (issue) =>
      issue.severity === 'error' &&
      ((issue.familyId === id && issue.path.endsWith('/seedHex')) ||
        (overrideIndex >= 0 && issue.path === `/overrides/${overrideIndex}/seedHex`))
  )?.message;
}

function formatFamilyId(id: TonalFamilyId): string {
  if (id === 'yellow-red.v1') return 'Yellow-red · Orange · V1';
  if (id === 'yellow-red.v2') return 'Yellow-red · Brown · V2';
  const parsed = parseTonalFamilyId(id);
  return parsed ? `${formatFamilyName(parsed.family)} · ${parsed.variant.toUpperCase()}` : id;
}

function formatFamilyName(value: string): string {
  return value
    .split('-')
    .map((part) => capitalize(part))
    .join('-');
}

function capitalize<T extends string>(value: T): Capitalize<T> {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as Capitalize<T>;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
