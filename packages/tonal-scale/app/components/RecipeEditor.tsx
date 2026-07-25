'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { normalizeHexColor } from '@/src/color-math';
import { FIXED_FAMILY_SEEDS_V2 } from '@/src/fixed-family-seeds';
import {
  KISKADEE_TONAL_PROFILES,
  KISKADEE_TONES,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from '@/src/kiskadee-tonal-scale';
import {
  classifyMunsellHex,
  type MunsellHexClassification,
  suggestYellowRedAppearance
} from '@/src/munsell-oklch';
import type {
  KiskadeeTonalSystemResult,
  ResolvedTonalFamily,
  TonalFunctionalReference,
  TonalSystemIssue
} from '@/src/tonal-system';
import { resolveTonalFunctionalReference } from '@/src/tonal-system';
import {
  type CoreTonalFamilyId,
  createTonalFamilyId,
  MUNSELL_SECTOR_IDENTITIES,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  resolveTonalFamilyStem,
  TONAL_CORE_FAMILY_IDS,
  TONAL_FAMILY_IDENTITIES,
  TONAL_FAMILY_VARIANTS,
  type TonalFamilyFunctionalReferenceRulesV5,
  type TonalFamilyId,
  type TonalFamilyOverrideV5,
  type TonalFamilyVariant,
  type TonalPrimaryAppearance,
  type TonalPrimaryDraftV5,
  type TonalSubtleReferenceRule,
  type TonalSystemRecipeV5,
  type TonalThemePolicy,
  type TonalVividReferenceRule
} from '@/src/tonal-system-contract';
import styles from './RecipeEditor.module.css';

const REST_TONES = KISKADEE_TONES.filter((tone): tone is KiskadeeTone => tone > 0 && tone < 100);
const CORE_FAMILY_ID_SET = new Set<TonalFamilyId>(TONAL_CORE_FAMILY_IDS);
const EXTRA_VARIANTS = TONAL_FAMILY_VARIANTS.filter((variant) => variant !== 'v1');
const TINTED_NEUTRAL_STARTER_SEED = '#20252b';
const EXTRA_FAMILY_IDS = TONAL_FAMILY_IDENTITIES.flatMap((identity) =>
  EXTRA_VARIANTS.map((variant) => createTonalFamilyId(identity.stem, variant))
).filter((id) => !CORE_FAMILY_ID_SET.has(id));

const POLICY_LABELS = {
  'source-exact': 'Source exact',
  adaptive: 'Adaptive',
  harmonized: 'Harmonized'
} as const satisfies Record<TonalThemePolicy, string>;

const VIVID_REFERENCE_MODE_LABELS = {
  auto: 'Auto',
  'generated-anchor': 'Generated',
  'harmony-rest': 'Harmony',
  locked: 'Locked'
} as const satisfies Record<TonalVividReferenceRule['mode'], string>;

const SUBTLE_REFERENCE_MODE_LABELS = {
  auto: 'Auto',
  'reference-match': 'Match reference',
  locked: 'Locked'
} as const satisfies Record<TonalSubtleReferenceRule['mode'], string>;

export type RecipeEditorProps = {
  recipe: TonalSystemRecipeV5;
  result: KiskadeeTonalSystemResult;
  isGenerating: boolean;
  onChange: (next: TonalSystemRecipeV5) => void;
};

export function RecipeEditor({ recipe, result, isGenerating, onChange }: RecipeEditorProps) {
  const editorId = useId();
  const [requestedExtraId, setRequestedExtraId] = useState<TonalFamilyId | ''>('');
  const lastValidPrimaryId = useRef<TonalFamilyId | null>(null);
  const classification = classifyPrimary(recipe.primary.seedHex);
  const suggestedAppearance = resolveSuggestedAppearance(classification);
  const appearanceOptions = classification
    ? MUNSELL_SECTOR_IDENTITIES.filter((identity) => identity.sector === classification.sector)
    : [];
  const inferredPrimaryId = resolvePrimaryId(recipe, classification);
  const resolvedPrimaryId = result.valid ? result.primaryReference.familyId : inferredPrimaryId;
  useEffect(() => {
    if (resolvedPrimaryId !== null) lastValidPrimaryId.current = resolvedPrimaryId;
  }, [resolvedPrimaryId]);
  const usedIds = new Set(recipe.overrides.map((override) => override.id));
  const extraOptions = EXTRA_FAMILY_IDS.filter(
    (id) => !usedIds.has(id) && id !== resolvedPrimaryId
  );
  const additionalVariantIds = [
    ...(resolvedPrimaryId && !CORE_FAMILY_ID_SET.has(resolvedPrimaryId) ? [resolvedPrimaryId] : []),
    ...recipe.overrides.map((override) => override.id).filter((id) => !CORE_FAMILY_ID_SET.has(id))
  ]
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .sort((left, right) => left.localeCompare(right));
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
  const functionalPrimaryId = resolvedPrimaryId ?? lastValidPrimaryId.current;
  const configuredPrimaryReferences = functionalPrimaryId
    ? recipe.functionalReferences.find(
        (functionalReferences) => functionalReferences.id === functionalPrimaryId
      )
    : undefined;
  const resolvedPrimarySubtleReferences = functionalPrimaryId
    ? {
        light: tryResolveFunctionalReference(result, functionalPrimaryId, 'light', 'subtle'),
        dark: tryResolveFunctionalReference(result, functionalPrimaryId, 'dark', 'subtle')
      }
    : { light: null, dark: null };
  const resolvedPrimaryVividReferences = functionalPrimaryId
    ? {
        light: tryResolveFunctionalReference(result, functionalPrimaryId, 'light', 'vivid'),
        dark: tryResolveFunctionalReference(result, functionalPrimaryId, 'dark', 'vivid')
      }
    : { light: null, dark: null };

  const updatePrimary = (primary: TonalPrimaryDraftV5) => {
    const nextClassification = classifyPrimary(primary.seedHex);
    const nextPrimary =
      nextClassification &&
      primary.appearance !== 'auto' &&
      !resolveTonalFamilyStem(nextClassification.sector, primary.appearance)
        ? { ...primary, appearance: 'auto' as const }
        : primary;
    const nextRecipe: TonalSystemRecipeV5 = { ...recipe, primary: nextPrimary };
    const nextPrimaryId = resolvePrimaryId(nextRecipe, nextClassification);
    const nextOverrides = nextPrimaryId
      ? nextRecipe.overrides.filter((override) => override.id !== nextPrimaryId)
      : nextRecipe.overrides;
    const previousPrimaryId = inferredPrimaryId ?? resolvedPrimaryId ?? lastValidPrimaryId.current;
    const shouldRemovePreviousReference =
      nextPrimaryId !== null &&
      previousPrimaryId !== null &&
      previousPrimaryId !== nextPrimaryId &&
      !CORE_FAMILY_ID_SET.has(previousPrimaryId) &&
      !nextOverrides.some((override) => override.id === previousPrimaryId);
    const movedFunctionalReferences =
      nextPrimaryId && previousPrimaryId && nextPrimaryId !== previousPrimaryId
        ? movePrimarySubtleReferences(
            nextRecipe.functionalReferences,
            previousPrimaryId,
            nextPrimaryId
          )
        : nextRecipe.functionalReferences;

    onChange({
      ...nextRecipe,
      overrides: nextOverrides,
      functionalReferences: shouldRemovePreviousReference
        ? movedFunctionalReferences.filter(
            (functionalReferences) => functionalReferences.id !== previousPrimaryId
          )
        : movedFunctionalReferences
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
    const referenceId = createTonalFamilyId(parsed.stem, 'v1') as CoreTonalFamilyId;
    const colorKind = resolveTonalFamilyColorKind(id);
    const seedHex =
      resolved?.sourceSeedHex ??
      (colorKind === 'achromatic' && parsed.variant !== 'v1'
        ? TINTED_NEUTRAL_STARTER_SEED
        : (sectorPeer?.sourceSeedHex ?? FIXED_FAMILY_SEEDS_V2[referenceId]));
    const override: TonalFamilyOverrideV5 = {
      id,
      seedHex,
      policies:
        colorKind === 'achromatic'
          ? { light: 'source-exact', dark: 'source-exact' }
          : { light: 'harmonized', dark: 'harmonized' }
    };

    onChange({ ...recipe, overrides: [...recipe.overrides, override] });
  };

  const updateOverride = (nextOverride: TonalFamilyOverrideV5) => {
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

  const removeExtraOverride = (id: TonalFamilyId) => {
    onChange({
      ...recipe,
      overrides: recipe.overrides.filter((override) => override.id !== id),
      functionalReferences: recipe.functionalReferences.filter(
        (functionalReferences) => functionalReferences.id !== id
      )
    });
  };

  const updateVividReference = (
    id: TonalFamilyId,
    theme: 'light' | 'dark',
    rule: TonalVividReferenceRule
  ) => {
    onChange(updateFamilyFunctionalReference(recipe, id, theme, 'vivid', rule));
  };

  const updateSubtleReference = (
    id: TonalFamilyId,
    theme: 'light' | 'dark',
    rule: TonalSubtleReferenceRule
  ) => {
    onChange(updateFamilyFunctionalReference(recipe, id, theme, 'subtle', rule));
  };

  const lockProposal = () => {
    if (!proposal) return;

    onChange({
      ...recipe,
      tonalAnchors: {
        ...recipe.tonalAnchors,
        rest: { mode: 'locked', light: proposal.light, dark: proposal.dark }
      }
    });
  };

  const setRestTone = (theme: 'light' | 'dark', tone: KiskadeeTone) => {
    const rest = recipe.tonalAnchors.rest;
    if (rest.mode !== 'locked') return;

    onChange({
      ...recipe,
      tonalAnchors: { ...recipe.tonalAnchors, rest: { ...rest, [theme]: tone } }
    });
  };

  return (
    <section className={styles.editor} aria-labelledby={`${editorId}-title`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>Fixed-reference harmony</p>
          <h2 id={`${editorId}-title`}>Primary color and functional references</h2>
          <p className={styles.intro}>
            The exact primary remains preserved at its generated anchors. Every support family
            starts from a fixed reference seed while Kiskadee resolves shared harmony checkpoints
            and independent vivid and subtle references for Light and Dark.
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
              <strong>{classification ? formatMunsellSector(classification.sector) : '—'}</strong>
            </span>
            <span>
              Suggested{' '}
              <strong>
                {resolveSuggestedPrimaryId(classification, suggestedAppearance) ?? '—'}
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

          <label className={styles.compactField} htmlFor={`${editorId}-primary-appearance`}>
            <span>Primary appearance</span>
            <select
              id={`${editorId}-primary-appearance`}
              value={recipe.primary.appearance}
              onChange={(event) =>
                updatePrimary({
                  ...recipe.primary,
                  appearance: event.target.value as TonalPrimaryAppearance
                })
              }
            >
              <option value="auto">
                Auto{suggestedAppearance ? ` · ${capitalize(suggestedAppearance)}` : ''}
              </option>
              {appearanceOptions.map((identity) => (
                <option key={identity.appearance} value={identity.appearance}>
                  {capitalize(identity.appearance)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.compactField} htmlFor={`${editorId}-primary-variant`}>
            <span>Primary variant</span>
            <select
              id={`${editorId}-primary-variant`}
              value={recipe.primary.variant}
              onChange={(event) =>
                updatePrimary({
                  ...recipe.primary,
                  variant: event.target.value as TonalFamilyVariant
                })
              }
            >
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
                    dark: event.target.value as TonalPrimaryDraftV5['policies']['dark']
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
            ? ` Generated anchors: L${resolvedPrimary.themes.light.scale.anchorTone} / D${resolvedPrimary.themes.dark.scale.anchorTone}. Harmony rest: L${resolvedPrimary.themes.light.restTone} / D${resolvedPrimary.themes.dark.restTone}.`
            : ''}
        </p>
      </section>

      <section
        className={styles.functionalReferenceCard}
        aria-labelledby={`${editorId}-subtle-reference-title`}
      >
        <div className={styles.cardHeading}>
          <div>
            <p className={styles.kicker}>Functional emphasis calibration</p>
            <h3 id={`${editorId}-subtle-reference-title`}>Primary subtle reference</h3>
          </div>
          <span className={styles.modeTag}>Light / Dark</span>
        </div>
        <p className={styles.functionalReferenceIntro}>
          An optional Design System color can identify the nearest emitted subtle position without
          changing the generated scale. Light and Dark resolve independently relative to their
          surfaces; exported sources lock the resulting positions.
        </p>
        <div className={styles.subtleReferenceGrid}>
          {(['light', 'dark'] as const).map((theme) => {
            const prefix = theme === 'light' ? 'L' : 'D';
            const rule = configuredPrimaryReferences?.[theme].subtle ?? {
              mode: 'auto' as const
            };
            const resolvedReference = resolvedPrimarySubtleReferences[theme];
            const resolvedVividReference = resolvedPrimaryVividReferences[theme];
            const vividIndex = resolvedVividReference
              ? KISKADEE_TONES.indexOf(resolvedVividReference.tone)
              : -1;
            const surfaceSideTones =
              vividIndex < 0
                ? REST_TONES
                : REST_TONES.filter((tone) => KISKADEE_TONES.indexOf(tone) < vividIndex);
            const lockedTones = surfaceSideTones.length > 0 ? surfaceSideTones : ([1] as const);
            const fallbackHex =
              resolvedReference?.hex ?? normalizeHexColor(recipe.primary.seedHex) ?? '#0f6cbd';
            const fallbackTone = resolvedReference?.tone ?? 4;
            const invalidReference =
              rule.mode === 'reference-match' && normalizeHexColor(rule.referenceHex) === null;

            return (
              <div className={styles.subtleReferenceTheme} key={theme}>
                <label htmlFor={`${editorId}-${theme}-subtle-mode`}>
                  <span>{capitalize(theme)} mode</span>
                  <select
                    id={`${editorId}-${theme}-subtle-mode`}
                    value={rule.mode}
                    disabled={!functionalPrimaryId}
                    onChange={(event) => {
                      if (!functionalPrimaryId) return;
                      const mode = event.target.value as TonalSubtleReferenceRule['mode'];
                      const nextRule: TonalSubtleReferenceRule =
                        mode === 'reference-match'
                          ? { mode, referenceHex: fallbackHex }
                          : mode === 'locked'
                            ? { mode, tone: fallbackTone }
                            : { mode };
                      updateSubtleReference(functionalPrimaryId, theme, nextRule);
                    }}
                  >
                    {Object.entries(SUBTLE_REFERENCE_MODE_LABELS).map(([mode, label]) => (
                      <option key={mode} value={mode}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {rule.mode === 'reference-match' ? (
                  <label htmlFor={`${editorId}-${theme}-subtle-reference`}>
                    <span>Reference hex</span>
                    <input
                      className={styles.subtleReferenceHex}
                      id={`${editorId}-${theme}-subtle-reference`}
                      value={rule.referenceHex}
                      aria-invalid={invalidReference}
                      autoComplete="off"
                      inputMode="text"
                      spellCheck={false}
                      onChange={(event) => {
                        if (!functionalPrimaryId) return;
                        updateSubtleReference(functionalPrimaryId, theme, {
                          mode: 'reference-match',
                          referenceHex: event.target.value
                        });
                      }}
                    />
                  </label>
                ) : rule.mode === 'locked' ? (
                  <label htmlFor={`${editorId}-${theme}-subtle-tone`}>
                    <span>Locked position</span>
                    <select
                      id={`${editorId}-${theme}-subtle-tone`}
                      value={rule.tone}
                      onChange={(event) => {
                        if (!functionalPrimaryId) return;
                        updateSubtleReference(functionalPrimaryId, theme, {
                          mode: 'locked',
                          tone: Number(event.target.value) as KiskadeeTone
                        });
                      }}
                    >
                      {lockedTones.map((tone) => (
                        <option key={tone} value={tone}>
                          {prefix}
                          {tone}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className={styles.fixedPolicy}>
                    <span>Selection</span>
                    <strong>Surface relative</strong>
                  </div>
                )}

                <span className={styles.subtleReferenceResult} aria-live="polite">
                  <strong>
                    {resolvedReference
                      ? `${prefix}${resolvedReference.tone} · ${resolvedReference.hex}`
                      : isGenerating
                        ? 'Resolving…'
                        : 'Unavailable'}
                  </strong>
                  <small>
                    {resolvedReference
                      ? formatFunctionalReferenceSource(resolvedReference.source)
                      : invalidReference
                        ? 'Enter a valid sRGB hex'
                        : 'Generate a valid system'}
                  </small>
                  {resolvedReference?.deltaE !== undefined ? (
                    <small>Reference ΔE {resolvedReference.deltaE.toFixed(3)}</small>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
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
          <span>Vivid references</span>
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
                primarySeedHex={id === resolvedPrimaryId ? recipe.primary.seedHex : undefined}
                override={override}
                resolved={result.families.find((family) => family.id === id)}
                resolvedVividReferences={
                  result.valid
                    ? {
                        light: tryResolveFunctionalReference(result, id, 'light', 'vivid'),
                        dark: tryResolveFunctionalReference(result, id, 'dark', 'vivid')
                      }
                    : undefined
                }
                functionalReferences={recipe.functionalReferences.find(
                  (functionalReferences) => functionalReferences.id === id
                )}
                seedIssue={resolveFamilySeedIssue(result.issues, id, overrideIndex)}
                onEnable={() => addOverride(id)}
                onChange={updateOverride}
                onRemove={() => removeOverride(id)}
                onVividReferenceChange={(theme, rule) => updateVividReference(id, theme, rule)}
              />
            );
          })}
        </div>
      </fieldset>

      <section className={styles.extraSection} aria-labelledby={`${editorId}-extras-title`}>
        <div className={styles.familySectionHeading}>
          <div>
            <h3 id={`${editorId}-extras-title`}>Additional variants</h3>
            <p>
              Optional V2–V4 assets require their own explicit seed and may be removed. Achromatic
              variants represent authored tinted neutrals.
            </p>
          </div>
          <span>{additionalVariantIds.length} added</span>
        </div>

        {additionalVariantIds.length > 0 ? (
          <div className={styles.familyList}>
            {additionalVariantIds.map((id) => {
              const override = recipe.overrides.find((candidate) => candidate.id === id);
              const overrideIndex = recipe.overrides.findIndex((candidate) => candidate.id === id);
              return (
                <FamilyRow
                  key={id}
                  id={id}
                  required={false}
                  isPrimary={id === resolvedPrimaryId}
                  primarySeedHex={id === resolvedPrimaryId ? recipe.primary.seedHex : undefined}
                  override={override}
                  resolved={result.families.find((family) => family.id === id)}
                  resolvedVividReferences={
                    result.valid
                      ? {
                          light: tryResolveFunctionalReference(result, id, 'light', 'vivid'),
                          dark: tryResolveFunctionalReference(result, id, 'dark', 'vivid')
                        }
                      : undefined
                  }
                  functionalReferences={recipe.functionalReferences.find(
                    (functionalReferences) => functionalReferences.id === id
                  )}
                  seedIssue={resolveFamilySeedIssue(result.issues, id, overrideIndex)}
                  onEnable={() => addOverride(id)}
                  onChange={updateOverride}
                  onRemove={() => removeExtraOverride(id)}
                  onVividReferenceChange={(theme, rule) => updateVividReference(id, theme, rule)}
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
              <p className={styles.kicker}>Shared harmony checkpoint</p>
              <h3 id={`${editorId}-rest-title`}>Harmony rest</h3>
            </div>
            <span className={styles.modeTag}>{recipe.tonalAnchors.rest.mode}</span>
          </div>
          <p className={styles.anchorHelp}>
            The system tests the exact primary anchor as the shared rest first. It moves Light or
            Dark independently only when the ten emitted chromatic v1 sectors cannot remain coherent
            there. Harmonized support families may keep their generated anchor at another tone while
            still sharing that harmony rest.
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
                onClick={() =>
                  onChange({
                    ...recipe,
                    tonalAnchors: { ...recipe.tonalAnchors, rest: { mode: 'auto' } }
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
              ? 'Resolving the exact primary against every fixed harmony reference.'
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
  primarySeedHex?: string;
  override: TonalFamilyOverrideV5 | undefined;
  resolved: ResolvedTonalFamily | undefined;
  resolvedVividReferences:
    | { light: TonalFunctionalReference | null; dark: TonalFunctionalReference | null }
    | undefined;
  functionalReferences: TonalFamilyFunctionalReferenceRulesV5 | undefined;
  seedIssue: string | undefined;
  onEnable: () => void;
  onChange: (override: TonalFamilyOverrideV5) => void;
  onRemove: () => void;
  onVividReferenceChange: (theme: 'light' | 'dark', rule: TonalVividReferenceRule) => void;
};

function FamilyRow({
  id,
  required,
  isPrimary,
  primarySeedHex,
  override,
  resolved,
  resolvedVividReferences,
  functionalReferences,
  seedIssue,
  onEnable,
  onChange,
  onRemove,
  onVividReferenceChange
}: FamilyRowProps) {
  const rowId = useId();
  const colorKind = resolveTonalFamilyColorKind(id);
  const referenceSeed = required ? FIXED_FAMILY_SEEDS_V2[id as CoreTonalFamilyId] : undefined;
  const activeSeed =
    primarySeedHex ?? override?.seedHex ?? resolved?.sourceSeedHex ?? referenceSeed;
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
                : resolved?.seedOrigin === 'reference'
                  ? 'Fixed harmony reference'
                  : resolved?.seedOrigin === 'canonical'
                    ? 'Canonical pure grayscale'
                    : required && id === 'n.black.v1'
                      ? 'Canonical source'
                      : required
                        ? 'Fixed harmony reference'
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
          <span className={styles.mobileLabel}>
            {isPrimary ? 'Primary seed' : required ? 'Reference seed' : 'Generated seed'}
          </span>
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

      <div className={styles.vividReferenceCell}>
        {(['light', 'dark'] as const).map((theme) => {
          const rule = functionalReferences?.[theme].vivid ?? { mode: 'auto' as const };
          const resolvedReference = resolvedVividReferences?.[theme] ?? null;
          const lockedTone = rule.mode === 'locked' ? rule.tone : (resolvedReference?.tone ?? 50);

          return (
            <div className={styles.vividReferenceTheme} key={theme}>
              <span className={styles.vividThemeLabel}>{theme === 'light' ? 'L' : 'D'}</span>
              <label htmlFor={`${rowId}-${theme}-vivid-mode`}>
                <span className={styles.visuallyHidden}>
                  {capitalize(theme)} vivid reference mode
                </span>
                <select
                  id={`${rowId}-${theme}-vivid-mode`}
                  value={rule.mode}
                  aria-label={`${id} ${theme} vivid reference mode`}
                  onChange={(event) => {
                    const mode = event.target.value as TonalVividReferenceRule['mode'];
                    onVividReferenceChange(
                      theme,
                      mode === 'locked' ? { mode, tone: lockedTone } : { mode }
                    );
                  }}
                >
                  {Object.entries(VIVID_REFERENCE_MODE_LABELS).map(([mode, label]) => (
                    <option key={mode} value={mode}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {rule.mode === 'locked' ? (
                <label htmlFor={`${rowId}-${theme}-vivid-tone`}>
                  <span className={styles.visuallyHidden}>
                    {capitalize(theme)} locked vivid reference position
                  </span>
                  <select
                    className={styles.vividToneSelect}
                    id={`${rowId}-${theme}-vivid-tone`}
                    value={rule.tone}
                    aria-label={`${id} ${theme} locked vivid reference position`}
                    onChange={(event) =>
                      onVividReferenceChange(theme, {
                        mode: 'locked',
                        tone: Number(event.target.value) as KiskadeeTone
                      })
                    }
                  >
                    {REST_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {theme === 'light' ? 'L' : 'D'}
                        {tone}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <span
                className={styles.resolvedVividReference}
                title={
                  resolvedReference
                    ? `${capitalize(theme)} vivid reference resolves from ${formatFunctionalReferenceSource(resolvedReference.source)}`
                    : 'Generate a valid system to resolve this vivid reference.'
                }
              >
                {resolvedReference
                  ? `${theme === 'light' ? 'L' : 'D'}${resolvedReference.tone}`
                  : '—'}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        {id === 'n.black.v1' ? (
          <span className={styles.policyTag}>Immutable</span>
        ) : required || isPrimary ? (
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

function tryResolveFunctionalReference(
  result: KiskadeeTonalSystemResult,
  familyId: TonalFamilyId,
  theme: 'light' | 'dark',
  kind: 'vivid' | 'subtle'
): TonalFunctionalReference | null {
  if (!result.valid) return null;
  try {
    return resolveTonalFunctionalReference(result, familyId, theme, kind);
  } catch {
    return null;
  }
}

function formatFunctionalReferenceSource(source: TonalFunctionalReference['source']): string {
  if (source === 'generated-anchor') return 'the generated anchor';
  if (source === 'harmony-rest') return 'the harmony rest';
  if (source === 'contrast-mirror') return 'the Light contrast mirror';
  if (source === 'surface-relative') return 'surface-relative auto';
  if (source === 'reference-match') return 'reference match';
  return 'a locked position';
}

function classifyPrimary(seedHex: string): MunsellHexClassification | null {
  if (!normalizeHexColor(seedHex)) return null;
  try {
    return classifyMunsellHex(seedHex);
  } catch {
    return null;
  }
}

function resolveSuggestedAppearance(
  classification: MunsellHexClassification | null
): TonalPrimaryAppearance | null {
  if (!classification) return null;
  if (classification.sector === 'yellow-red') {
    return suggestYellowRedAppearance(classification.oklch).appearance;
  }
  return (
    MUNSELL_SECTOR_IDENTITIES.find((identity) => identity.sector === classification.sector)
      ?.appearance ?? null
  );
}

function resolvePrimaryId(
  recipe: TonalSystemRecipeV5,
  classification: MunsellHexClassification | null
): TonalFamilyId | null {
  if (!classification) return null;
  const appearance =
    recipe.primary.appearance === 'auto'
      ? resolveSuggestedAppearance(classification)
      : recipe.primary.appearance;
  if (!appearance || appearance === 'auto') return null;
  const stem = resolveTonalFamilyStem(classification.sector, appearance);
  return stem ? createTonalFamilyId(stem, recipe.primary.variant) : null;
}

function updateFamilyFunctionalReference(
  recipe: TonalSystemRecipeV5,
  id: TonalFamilyId,
  theme: 'light' | 'dark',
  kind: 'vivid',
  rule: TonalVividReferenceRule
): TonalSystemRecipeV5;
function updateFamilyFunctionalReference(
  recipe: TonalSystemRecipeV5,
  id: TonalFamilyId,
  theme: 'light' | 'dark',
  kind: 'subtle',
  rule: TonalSubtleReferenceRule
): TonalSystemRecipeV5;
function updateFamilyFunctionalReference(
  recipe: TonalSystemRecipeV5,
  id: TonalFamilyId,
  theme: 'light' | 'dark',
  kind: 'vivid' | 'subtle',
  rule: TonalVividReferenceRule | TonalSubtleReferenceRule
): TonalSystemRecipeV5 {
  const current =
    recipe.functionalReferences.find((functionalReferences) => functionalReferences.id === id) ??
    createAutoFunctionalReferences(id);
  const nextTheme =
    kind === 'vivid'
      ? { ...current[theme], vivid: rule as TonalVividReferenceRule }
      : { ...current[theme], subtle: rule as TonalSubtleReferenceRule };
  const next = { ...current, [theme]: nextTheme };
  const retained = recipe.functionalReferences.filter(
    (functionalReferences) => functionalReferences.id !== id
  );
  const functionalReferences = isAutoFunctionalReferences(next)
    ? retained
    : [...retained, next].sort((left, right) => left.id.localeCompare(right.id));

  return { ...recipe, functionalReferences };
}

function createAutoFunctionalReferences(id: TonalFamilyId): TonalFamilyFunctionalReferenceRulesV5 {
  return {
    id,
    light: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } },
    dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
  };
}

function movePrimarySubtleReferences(
  references: TonalFamilyFunctionalReferenceRulesV5[],
  previousPrimaryId: TonalFamilyId,
  nextPrimaryId: TonalFamilyId
): TonalFamilyFunctionalReferenceRulesV5[] {
  const previous =
    references.find((entry) => entry.id === previousPrimaryId) ??
    createAutoFunctionalReferences(previousPrimaryId);
  if (previous.light.subtle.mode === 'auto' && previous.dark.subtle.mode === 'auto') {
    return references;
  }

  const next =
    references.find((entry) => entry.id === nextPrimaryId) ??
    createAutoFunctionalReferences(nextPrimaryId);
  const retained = references.filter(
    (entry) => entry.id !== previousPrimaryId && entry.id !== nextPrimaryId
  );
  const previousAfterMove: TonalFamilyFunctionalReferenceRulesV5 = {
    ...previous,
    light: {
      ...previous.light,
      subtle:
        previous.light.subtle.mode === 'reference-match'
          ? { mode: 'auto' }
          : { ...previous.light.subtle }
    },
    dark: {
      ...previous.dark,
      subtle:
        previous.dark.subtle.mode === 'reference-match'
          ? { mode: 'auto' }
          : { ...previous.dark.subtle }
    }
  };
  const nextWithSubtle: TonalFamilyFunctionalReferenceRulesV5 = {
    ...next,
    light: {
      ...next.light,
      subtle:
        previous.light.subtle.mode === 'reference-match'
          ? { ...previous.light.subtle }
          : { ...next.light.subtle }
    },
    dark: {
      ...next.dark,
      subtle:
        previous.dark.subtle.mode === 'reference-match'
          ? { ...previous.dark.subtle }
          : { ...next.dark.subtle }
    }
  };

  return [
    ...retained,
    ...(isAutoFunctionalReferences(previousAfterMove) ? [] : [previousAfterMove]),
    ...(isAutoFunctionalReferences(nextWithSubtle) ? [] : [nextWithSubtle])
  ].sort((left, right) => left.id.localeCompare(right.id));
}

function isAutoFunctionalReferences(references: TonalFamilyFunctionalReferenceRulesV5): boolean {
  return (
    references.light.vivid.mode === 'auto' &&
    references.light.subtle.mode === 'auto' &&
    references.dark.vivid.mode === 'auto' &&
    references.dark.subtle.mode === 'auto'
  );
}

function resolveSuggestedPrimaryId(
  classification: MunsellHexClassification | null,
  appearance: TonalPrimaryAppearance | null
): TonalFamilyId | null {
  if (!classification || !appearance || appearance === 'auto') return null;
  const stem = resolveTonalFamilyStem(classification.sector, appearance);
  return stem ? createTonalFamilyId(stem, 'v1') : null;
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
  const parsed = parseTonalFamilyId(id);
  if (!parsed) return id;
  const appearance =
    parsed.colorKind === 'achromatic'
      ? parsed.variant === 'v1'
        ? 'Pure grayscale'
        : 'Tinted neutral'
      : capitalize(parsed.appearance);
  return `${parsed.munsellSector} · ${appearance} · ${parsed.variant.toUpperCase()}`;
}

function formatMunsellSector(sector: MunsellHexClassification['sector']): string {
  return (
    MUNSELL_SECTOR_IDENTITIES.find((identity) => identity.sector === sector)?.notation ?? sector
  );
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
