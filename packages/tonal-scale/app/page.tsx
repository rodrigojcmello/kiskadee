'use client';

import type { CSSProperties } from 'react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { createTonalArtifactBundle, type TonalArtifactBundle } from '@/src/export/tonal-artifacts';
import { createTonalBundleZip } from '@/src/export/tonal-bundle-zip';
import { KISKADEE_TONAL_PROFILES, type KiskadeeTonalProfile } from '@/src/kiskadee-tonal-scale';
import {
  generateKiskadeeTonalSystem,
  type ResolvedKiskadeeTonalSystem,
  type ResolvedTonalFamily,
  type ResolvedTonalTheme
} from '@/src/tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  type TonalFamilyId,
  type TonalSystemRecipeV1,
  validateTonalSystemRecipe
} from '@/src/tonal-system-contract';
import RecipeEditor from './components/RecipeEditor';

const RECIPE_QUERY_PARAM = 'recipe';
const COLOR_QUERY_PARAM = 'color';
const PROFILE_QUERY_PARAM = 'profile';
const CHART_WIDTH = 720;
const CHART_HEIGHT = 300;
const CHART_PADDING_X = 42;
const CHART_PADDING_Y = 30;
const CHART_LABEL_TONES = new Set([0, 10, 30, 50, 70, 100]);
const SURFACE_STRESS_ROLES = [
  { label: 'Base', tone: 0 },
  { label: 'Level 1', tone: 1 },
  { label: 'Level 2', tone: 2 },
  { label: 'Level 3', tone: 3 }
] as const;

type ScaleResult = ResolvedTonalTheme['scale'];
type ScaleColor = ScaleResult['colors'][number];
type Theme = 'light' | 'dark';
type ChartMetric = 'lightness' | 'chroma';

export default function TonalScalePage() {
  const [recipe, setRecipe] = useState<TonalSystemRecipeV1>(() =>
    structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE)
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<TonalFamilyId>(
    DEFAULT_TONAL_SYSTEM_RECIPE.primaryReference
  );
  const [urlReady, setUrlReady] = useState(false);
  const deferredRecipe = useDeferredValue(recipe);
  const system = useMemo(() => generateKiskadeeTonalSystem(deferredRecipe), [deferredRecipe]);
  const isGenerating = deferredRecipe !== recipe;
  const resolvedFamily = system.valid
    ? (system.families.find((family) => family.id === selectedFamilyId) ??
      system.families.find((family) => family.id === system.primaryReference.familyId) ??
      system.families[0])
    : undefined;

  useEffect(() => {
    const applyStateFromUrl = () => {
      const url = new URL(window.location.href);
      const serializedRecipe = url.searchParams.get(RECIPE_QUERY_PARAM);

      if (serializedRecipe) {
        try {
          const parsed = validateTonalSystemRecipe(JSON.parse(serializedRecipe));
          if (parsed.valid) {
            setRecipe(parsed.value);
            setSelectedFamilyId(parsed.value.primaryReference);
            setUrlReady(true);
            return;
          }
        } catch {
          // Invalid shared state is ignored in favor of the explicit defaults.
        }
      }

      const color = url.searchParams.get(COLOR_QUERY_PARAM);
      const profile = url.searchParams.get(PROFILE_QUERY_PARAM);
      if (color !== null || profile !== null) {
        const legacy = structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV1;
        if (color !== null) {
          const blueIndex = legacy.families.findIndex((family) => family.id === 'blue.v1');
          legacy.families[blueIndex] = {
            ...legacy.families[blueIndex],
            seedHex: color.startsWith('#') ? color : `#${color}`
          };
        }
        if (profile !== null && KISKADEE_TONAL_PROFILES.some((item) => item.id === profile)) {
          legacy.tonalProfile = profile as KiskadeeTonalProfile;
        }
        setRecipe(legacy);
      }
      setUrlReady(true);
    };

    applyStateFromUrl();
    window.addEventListener('popstate', applyStateFromUrl);

    return () => window.removeEventListener('popstate', applyStateFromUrl);
  }, []);

  useEffect(() => {
    if (!urlReady) return;

    const validation = validateTonalSystemRecipe(recipe);
    if (!validation.valid) return;

    const url = new URL(window.location.href);
    const serializedRecipe = JSON.stringify(validation.value);
    if (url.searchParams.get(RECIPE_QUERY_PARAM) !== serializedRecipe) {
      url.searchParams.set(RECIPE_QUERY_PARAM, serializedRecipe);
      url.searchParams.delete(COLOR_QUERY_PARAM);
      url.searchParams.delete(PROFILE_QUERY_PARAM);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [recipe, urlReady]);

  return (
    <main className="app-shell" aria-busy={isGenerating}>
      <header className="hero">
        <div>
          <span className="eyebrow">Kiskadee harmonized tonal system v1</span>
          <h1>Many seeds. One coherent color system.</h1>
          <p className="hero-copy">
            Select one primitive family as the primary reference. Its Light and Dark rest colors
            establish the shared tonal target while each chromatic or neutral family keeps an
            explicit Light and Dark generation policy.
          </p>
        </div>
        <div
          className={`system-hero-status ${isGenerating ? 'generating' : system.status}`}
          aria-live="polite"
        >
          <span>{isGenerating ? 'Generating' : capitalize(system.status)}</span>
          <strong>{recipe.families.length} primitive families</strong>
          <p>
            {isGenerating
              ? 'Resolving the current recipe and every dependent family.'
              : system.valid
                ? `${system.primaryReference.familyId} · L${system.rest.light} / D${system.rest.dark} · ${resolveProfileLabel(recipe.tonalProfile)}`
                : (system.issues[0]?.message ?? 'The tonal recipe is incomplete.')}
          </p>
        </div>
      </header>

      <section className="section-block" aria-labelledby="recipe-title">
        <div className="section-heading">
          <h2 id="recipe-title">Tonal recipe</h2>
          <p>
            Inputs remain primitive Layer 1 families. Semantic aliases and preset integration are
            intentionally outside this package.
          </p>
        </div>
        <RecipeEditor
          recipe={recipe}
          result={system}
          isGenerating={isGenerating}
          onChange={setRecipe}
        />
      </section>

      {system.valid && resolvedFamily ? (
        <>
          <SystemReference system={system} />
          <HarmonyComparison system={system} />
          <ScaleOverview
            system={system}
            selectedFamilyId={resolvedFamily.id}
            onSelectFamily={setSelectedFamilyId}
          />
          <ScaleWorkspace
            family={resolvedFamily}
            tonalProfile={recipe.tonalProfile}
            rest={system.rest}
            onSelectFamily={setSelectedFamilyId}
            families={system.families}
          />
          <ArtifactExportPanel system={system} disabled={isGenerating} />
        </>
      ) : isGenerating ? (
        <section className="empty-state generating-state" aria-live="polite">
          <div>
            <strong>Generating the current tonal system</strong>
            <p>
              Resolving the primary reference and every dependent Light and Dark family. No stale
              intermediate result can be exported.
            </p>
          </div>
        </section>
      ) : (
        <section className="empty-state" aria-live="polite">
          <div>
            <strong>No exportable tonal system generated</strong>
            <p>
              Correct the recipe issues above. Generation does not substitute colors, move locked
              rest positions, or emit a partial bundle silently.
            </p>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <span>Balanced + Source Exact remains protected by its byte-for-byte Golden barrier.</span>
        <code>Primitive inputs · One primary reference · Atomic bundle</code>
      </footer>
    </main>
  );
}

function ScaleWorkspace({
  family,
  tonalProfile,
  rest,
  families,
  onSelectFamily
}: {
  family: ResolvedTonalFamily;
  tonalProfile: KiskadeeTonalProfile;
  rest: ResolvedKiskadeeTonalSystem['rest'];
  families: ResolvedTonalFamily[];
  onSelectFamily: (familyId: TonalFamilyId) => void;
}) {
  const lightResult = family.themes.light.scale;
  const darkResult = family.themes.dark.scale;

  return (
    <>
      <section className="section-block" aria-labelledby="family-inspector-title">
        <div className="section-heading">
          <h2 id="family-inspector-title">Family inspector</h2>
          <p>
            Full previews and diagnostics for one family at a time. The system comparison remains
            visible above.
          </p>
        </div>
        <fieldset className="family-tabs">
          <legend className="visually-hidden">Primitive family inspector</legend>
          {families.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === family.id}
              className={candidate.id === family.id ? 'selected' : undefined}
              onClick={() => onSelectFamily(candidate.id)}
            >
              <i
                style={{ '--tab-color': candidate.themes.light.restColor.hex } as CSSProperties}
                aria-hidden="true"
              />
              {candidate.id}
            </button>
          ))}
        </fieldset>
      </section>

      <section className="section-block" aria-labelledby="theme-preview-title">
        <div className="section-heading">
          <h2 id="theme-preview-title">Theme previews</h2>
          <p>
            {family.id} uses its shared rest positions for representative Light and Dark actions.
          </p>
        </div>
        <div className="theme-grid">
          <ThemePanel theme="light" resolution={family.themes.light} />
          <ThemePanel theme="dark" resolution={family.themes.dark} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="tonal-scales-title">
        <div className="section-heading">
          <h2 id="tonal-scales-title">Theme-relative tonal scales</h2>
          <p>
            Light uses L0→L100 and dark uses D0→D100. K remains an internal physical coordinate; no
            L96–L98 slots are exposed.
          </p>
        </div>
        <div className="scale-stack">
          <TonalScalePanel theme="light" result={lightResult} restTone={rest.light} />
          <TonalScalePanel theme="dark" result={darkResult} restTone={rest.dark} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="curve-title">
        <div className="section-heading">
          <h2 id="curve-title">OKLCH curves</h2>
          <p>
            {tonalProfile === 'balanced'
              ? 'Light and dark use the canonical chroma trajectory with theme-relative lightness distributions.'
              : 'Lightness geometry stays canonical while chroma is reduced only on the physically dark side of the seed.'}{' '}
            Dashed lines show nominal lightness targets before exact-anchor adaptation.
          </p>
        </div>
        <div className="chart-grid">
          <CurveChart metric="lightness" lightResult={lightResult} darkResult={darkResult} />
          <CurveChart metric="chroma" lightResult={lightResult} darkResult={darkResult} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="integrity-title">
        <div className="section-heading">
          <h2 id="integrity-title">Integrity report</h2>
          <p>
            Caps, exact anchors, monotonicity, spacing, contrast, profile chroma changes and sRGB
            fitting are measured independently for each theme.
          </p>
        </div>
        <div className="diagnostics-grid">
          <DiagnosticsPanel theme="light" resolution={family.themes.light} />
          <DiagnosticsPanel theme="dark" resolution={family.themes.dark} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="slot-details-title">
        <div className="section-heading">
          <h2 id="slot-details-title">Slot details</h2>
          <p>
            Inspect actual deltas, nominal deviation, profile attenuation, constraint restoration,
            guard contrast and gamut loss.
          </p>
        </div>
        <div className="scale-stack">
          <DetailTable theme="light" result={lightResult} />
          <DetailTable theme="dark" result={darkResult} />
        </div>
      </section>
    </>
  );
}

function SystemReference({ system }: { system: ResolvedKiskadeeTonalSystem }) {
  const references = [system.primaryReference.light, system.primaryReference.dark];

  return (
    <section className="section-block" aria-labelledby="primary-reference-title">
      <div className="section-heading">
        <h2 id="primary-reference-title">Primary reference</h2>
        <p>
          Light and Dark fingerprints are measured independently from the emitted primary rest
          colors. Support families target these measurements, not the primary hex itself.
        </p>
      </div>
      <div className="reference-grid">
        {references.map((reference) => {
          const prefix = resolveThemePrefix(reference.theme);
          return (
            <article key={reference.theme} className="panel reference-card">
              <div
                className="reference-swatch"
                style={{ '--reference-color': reference.hex } as CSSProperties}
                aria-hidden="true"
              />
              <div>
                <span className="theme-kicker">{reference.theme} reference</span>
                <h3>
                  {prefix}
                  {reference.tone} · {reference.hex}
                </h3>
                <dl className="reference-metrics">
                  <Metric label="OKL L" value={reference.oklch.l.toFixed(2)} />
                  <Metric label="OKL C" value={reference.oklch.c.toFixed(4)} />
                  <Metric label="Luminance" value={reference.relativeLuminance.toFixed(4)} />
                  <Metric
                    label="Gamut use"
                    value={`${(reference.chromaUtilization * 100).toFixed(1)}%`}
                  />
                  <Metric
                    label="vs white"
                    value={`${reference.contrastAgainstWhite.toFixed(2)}:1`}
                  />
                  <Metric
                    label="vs black"
                    value={`${reference.contrastAgainstBlack.toFixed(2)}:1`}
                  />
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HarmonyComparison({ system }: { system: ResolvedKiskadeeTonalSystem }) {
  return (
    <section className="section-block" aria-labelledby="harmony-comparison-title">
      <div className="section-heading">
        <h2 id="harmony-comparison-title">Rest harmony comparison</h2>
        <p>
          Source seeds establish identity. Effective rest colors are the actual scale anchors used
          for functional equivalence against the primary reference.
        </p>
      </div>
      <article className="panel harmony-panel">
        <div className="table-wrap harmony-table-wrap">
          <table className="detail-table harmony-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Theme</th>
                <th>Policy</th>
                <th>Source</th>
                <th>Effective rest</th>
                <th>Position</th>
                <th>OKL L</th>
                <th>Gamut use</th>
                <th>Harmony score</th>
                <th>Source ΔE</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {system.families.flatMap((family) =>
                (['light', 'dark'] as const).map((theme) => {
                  const resolution = family.themes[theme];
                  const harmony = resolution.harmony;
                  const reference = system.primaryReference[theme];

                  return (
                    <tr key={`${family.id}-${theme}`}>
                      <td>
                        <span className="color-cell">
                          <i
                            className="color-dot"
                            style={{ '--color': resolution.effectiveSeedHex } as CSSProperties}
                            aria-hidden="true"
                          />
                          {family.id}
                        </span>
                      </td>
                      <td>{capitalize(theme)}</td>
                      <td>{resolution.policy}</td>
                      <td>{resolution.sourceSeedHex}</td>
                      <td>{resolution.effectiveSeedHex}</td>
                      <td>
                        {resolveThemePrefix(theme)}
                        {resolution.restTone}
                      </td>
                      <td>{resolution.restColor.oklch.l.toFixed(2)}</td>
                      <td>
                        {harmony
                          ? `${((reference.chromaUtilization + harmony.chromaUtilizationDelta) * 100).toFixed(1)}%`
                          : `${(reference.chromaUtilization * 100).toFixed(1)}%`}
                      </td>
                      <td>{harmony ? harmony.score.toFixed(3) : 'reference'}</td>
                      <td>{harmony ? harmony.seedDeltaE.toFixed(3) : '0.000'}</td>
                      <td>
                        <span className={`inline-status ${resolution.status}`}>
                          {capitalize(resolution.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function ScaleOverview({
  system,
  selectedFamilyId,
  onSelectFamily
}: {
  system: ResolvedKiskadeeTonalSystem;
  selectedFamilyId: TonalFamilyId;
  onSelectFamily: (familyId: TonalFamilyId) => void;
}) {
  return (
    <section className="section-block" aria-labelledby="scale-overview-title">
      <div className="section-heading">
        <h2 id="scale-overview-title">System scale overview</h2>
        <p>
          Every row uses the same 36 public positions. The marker identifies the shared Light or
          Dark rest checkpoint.
        </p>
      </div>
      <div className="overview-stack">
        {system.families.map((family) => (
          <article
            key={family.id}
            className={`panel overview-family${family.id === selectedFamilyId ? ' selected' : ''}`}
          >
            <button type="button" onClick={() => onSelectFamily(family.id)}>
              <span>
                <strong>{family.id}</strong>
                <small>
                  {family.role} · {family.status}
                </small>
              </span>
              <span>Inspect family</span>
            </button>
            <CompactScaleStrip resolution={family.themes.light} />
            <CompactScaleStrip resolution={family.themes.dark} />
          </article>
        ))}
      </div>
    </section>
  );
}

function CompactScaleStrip({ resolution }: { resolution: ResolvedTonalTheme }) {
  const prefix = resolveThemePrefix(resolution.theme);

  return (
    <div className="overview-scale-row">
      <span>{prefix}</span>
      <div
        className="overview-strip"
        role="img"
        aria-label={`${capitalize(resolution.theme)} scale, rest ${prefix}${resolution.restTone}`}
      >
        {resolution.scale.colors.map((color) => (
          <i
            key={color.tone}
            className={color.tone === resolution.restTone ? 'rest' : undefined}
            style={{ '--overview-color': color.hex } as CSSProperties}
            title={`${prefix}${color.tone} · ${color.hex}`}
          />
        ))}
      </div>
      <code>{resolution.effectiveSeedHex}</code>
    </div>
  );
}

function ArtifactExportPanel({
  system,
  disabled
}: {
  system: ResolvedKiskadeeTonalSystem;
  disabled: boolean;
}) {
  const [prepared, setPrepared] = useState<{
    owner: ResolvedKiskadeeTonalSystem;
    bundle: TonalArtifactBundle;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bundle = !disabled && prepared?.owner === system ? prepared.bundle : null;

  const prepareBundle = async () => {
    if (disabled) return;
    setBusy(true);
    setError(null);
    try {
      const nextBundle = await createTonalArtifactBundle(system);
      setPrepared({ owner: system, bundle: nextBundle });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Artifact generation failed.');
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => {
    if (!bundle) return;
    downloadBlob('kiskadee-tonal-system.zip', createTonalBundleZip(bundle.files));
  };

  return (
    <section className="section-block" aria-labelledby="artifact-export-title">
      <div className="section-heading">
        <h2 id="artifact-export-title">Canonical artifact set</h2>
        <p>
          Export locks the proposed rest positions and separates compact consumption assets from the
          complete review diagnostics.
        </p>
      </div>
      <article className="panel export-panel" aria-busy={busy || disabled}>
        <div>
          <span className="theme-kicker">Directory-shaped output</span>
          <pre>{`tonal-system.source.json\ntonal-system.json\ntonal-system.diagnostics.json\ncolors/\n${system.families.map((family) => `  ${family.id}.json`).join('\n')}`}</pre>
        </div>
        <div className="export-actions">
          <p>Artifact serialization is available only when the complete atomic batch is valid.</p>
          <button type="button" disabled={busy || disabled} onClick={prepareBundle}>
            {disabled
              ? 'Waiting for current recipe…'
              : busy
                ? 'Preparing hashes…'
                : bundle
                  ? 'Rebuild artifact set'
                  : 'Prepare artifact set'}
          </button>
          {error ? (
            <p className="export-error" role="alert">
              {error}
            </p>
          ) : null}
          {bundle ? (
            <>
              <div className="export-ready" aria-live="polite">
                <strong>{bundle.files.size} canonical JSON files ready</strong>
                <code>
                  {bundle.manifest.generator.package}@{bundle.manifest.generator.version}
                </code>
              </div>
              <button className="secondary-action" type="button" onClick={downloadAll}>
                Download canonical ZIP
              </button>
              <ul className="artifact-file-list">
                {[...bundle.files].map(([path, contents]) => (
                  <li key={path}>
                    <code>{path}</code>
                    <button type="button" onClick={() => downloadArtifact(path, contents)}>
                      Download JSON
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function downloadArtifact(path: string, contents: string): void {
  downloadBlob(
    path.split('/').at(-1) ?? path,
    new Blob([contents], { type: 'application/json;charset=utf-8' })
  );
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ThemePanel({ theme, resolution }: { theme: Theme; resolution: ResolvedTonalTheme }) {
  const result = resolution.scale;
  const prefix = resolveThemePrefix(theme);
  const surface = resolveTone(result, 0);
  const surfaceRaised = resolveTone(result, 4);
  const border = resolveTone(result, 10);
  const text = resolveTone(result, 100);
  const muted = resolveTone(result, 70);
  const action = resolution.restColor;
  const status = resolveIntegrityStatus(result);
  const previewStyle = {
    '--preview-bg': surface?.hex,
    '--preview-surface': surfaceRaised?.hex,
    '--preview-border': border?.hex,
    '--preview-text': text?.hex,
    '--preview-muted': muted?.hex,
    '--preview-action': action?.hex,
    '--preview-action-text': action ? bestTextColor(action.hex) : undefined
  } as CSSProperties;

  return (
    <article className="theme-panel">
      <div className="theme-header">
        <div>
          <span className="theme-kicker">{theme} theme</span>
          <h3>{`${prefix}0 → ${prefix}100 · rest ${prefix}${resolution.restTone}`}</h3>
          <p className="scale-guard-note">
            {capitalize(resolution.policy)} · effective {resolution.effectiveSeedHex}
          </p>
        </div>
        <StatusBadge result={result} label={status.label} className={status.className} />
      </div>

      <div className="component-preview" style={previewStyle}>
        <div className="preview-card">
          <small>Example surface</small>
          <strong>Stable positions, flexible identity</strong>
          <p>The same slots can power another color family without changing component intent.</p>
          <ul
            className="surface-stress"
            aria-label={`${capitalize(theme)} early surface slot differentiation`}
          >
            {SURFACE_STRESS_ROLES.map(({ label, tone }) => {
              const color = resolveTone(result, tone);
              const style = {
                '--stress-surface': color?.hex,
                '--stress-text': color ? bestTextColor(color.hex) : undefined
              } as CSSProperties;

              return (
                <li key={tone} className="surface-role" style={style}>
                  <span className="surface-slot">
                    {prefix}
                    {tone}
                  </span>
                  <span className="surface-name">{label}</span>
                </li>
              );
            })}
          </ul>
          <button className="preview-button" type="button">
            Primary action
          </button>
        </div>
      </div>
    </article>
  );
}

function TonalScalePanel({
  theme,
  result,
  restTone
}: {
  theme: Theme;
  result: ScaleResult;
  restTone: number;
}) {
  const prefix = resolveThemePrefix(theme);
  const status = resolveIntegrityStatus(result);
  const guardForeground = theme === 'light' ? '#ffffff' : '#000000';
  const guardForegroundLabel = theme === 'light' ? 'white' : 'black';
  const guardColor = resolveTone(result, 35);
  const guardRatio = guardColor ? contrastRatio(guardColor.hex, guardForeground) : null;

  return (
    <article className="panel scale-panel">
      <div className="scale-panel-header">
        <div>
          <span className="theme-kicker">{theme} scale</span>
          <h3>{`${prefix}0 → ${prefix}100 · anchor ${prefix}${result.anchorTone}`}</h3>
          <p className="scale-guard-note">
            <strong>{prefix}35</strong>
            {` · ${guardForegroundLabel} 3:1 guard starts${guardRatio === null ? '' : ` (${guardRatio.toFixed(2)}:1)`} · swatch labels use max contrast`}
          </p>
        </div>
        <StatusBadge result={result} label={status.label} className={status.className} />
      </div>
      <div className="scale-strip">
        {result.colors.map((color) => (
          <Swatch key={color.tone} color={color} prefix={prefix} isRest={color.tone === restTone} />
        ))}
      </div>
    </article>
  );
}

function Swatch({
  color,
  prefix,
  isRest
}: {
  color: ScaleColor;
  prefix: 'L' | 'D';
  isRest: boolean;
}) {
  const blackContrast = contrastRatio(color.hex, '#000000');
  const whiteContrast = contrastRatio(color.hex, '#ffffff');
  const style = {
    '--swatch': color.hex,
    '--swatch-text': bestTextColor(color.hex)
  } as CSSProperties;

  return (
    <div
      className={`swatch${color.flags.isAnchor ? ' anchor' : ''}${isRest ? ' rest' : ''}`}
      style={style}
      title={`${prefix}${color.tone} · ${color.hex} · black ${blackContrast.toFixed(2)}:1 · white ${whiteContrast.toFixed(2)}:1`}
    >
      <span className="swatch-tone">
        {prefix}
        {color.tone}
      </span>
      <span className="swatch-hex">{color.hex}</span>
    </div>
  );
}

function CurveChart({
  metric,
  lightResult,
  darkResult
}: {
  metric: ChartMetric;
  lightResult: ScaleResult;
  darkResult: ScaleResult;
}) {
  const chartId = `oklch-${metric}-chart`;
  const lightValues = lightResult.colors.map((color) =>
    metric === 'lightness' ? color.oklch.l : color.oklch.c
  );
  const darkValues = darkResult.colors.map((color) =>
    metric === 'lightness' ? color.oklch.l : color.oklch.c
  );
  const maxValue =
    metric === 'lightness'
      ? 100
      : Math.max(0.16, round(Math.max(...lightValues, ...darkValues) * 1.12, 3));
  const lightPath = createChartPath(lightValues, maxValue);
  const darkPath = createChartPath(darkValues, maxValue);
  const lightNominalPath =
    metric === 'lightness'
      ? createChartPath(
          lightResult.colors.map((color) => color.nominalLightness),
          maxValue
        )
      : null;
  const darkNominalPath =
    metric === 'lightness'
      ? createChartPath(
          darkResult.colors.map((color) => color.nominalLightness),
          maxValue
        )
      : null;
  const lightAnchorIndex = lightResult.colors.findIndex((color) => color.flags.isAnchor);
  const darkAnchorIndex = darkResult.colors.findIndex((color) => color.flags.isAnchor);
  const gridFractions = [0, 0.25, 0.5, 0.75, 1];

  return (
    <article className="panel chart-panel">
      <div className="chart-title">
        <div>
          <h3>{metric === 'lightness' ? 'Lightness' : 'Chroma'}</h3>
          <p>{metric === 'lightness' ? 'OKL L by public slot' : 'OKL C by public slot'}</p>
        </div>
        <div className="chart-legend" aria-hidden="true">
          <span className="legend-item">
            <i className="legend-dot" style={{ '--legend': '#0f6cbd' } as CSSProperties} /> Light
          </span>
          <span className="legend-item">
            <i className="legend-dot" style={{ '--legend': '#8250df' } as CSSProperties} /> Dark
          </span>
          {metric === 'lightness' ? <span className="legend-item">— — nominal</span> : null}
        </div>
      </div>

      <svg
        className="curve-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-labelledby={`${chartId}-title ${chartId}-description`}
      >
        <title id={`${chartId}-title`}>
          {metric === 'lightness'
            ? 'Light and dark OKLCH lightness'
            : 'Light and dark OKLCH chroma'}
        </title>
        <desc id={`${chartId}-description`}>
          {metric === 'lightness'
            ? 'Theme-relative lightness progression from position zero to one hundred, including nominal targets.'
            : 'Theme-relative chroma progression from position zero to one hundred.'}
        </desc>
        <rect
          className="plot-bg"
          x={CHART_PADDING_X}
          y={CHART_PADDING_Y}
          width={CHART_WIDTH - CHART_PADDING_X * 2}
          height={CHART_HEIGHT - CHART_PADDING_Y * 2}
          rx="9"
        />
        {gridFractions.map((fraction) => {
          const y = chartY(fraction * maxValue, maxValue);
          return (
            <g key={fraction}>
              <line
                className="grid-line"
                x1={CHART_PADDING_X}
                x2={CHART_WIDTH - CHART_PADDING_X}
                y1={y}
                y2={y}
              />
              <text x={CHART_PADDING_X - 8} y={y + 3} textAnchor="end">
                {metric === 'lightness'
                  ? Math.round(fraction * 100)
                  : round(fraction * maxValue, 2).toFixed(2)}
              </text>
            </g>
          );
        })}
        {lightResult.colors.map((color, index) =>
          CHART_LABEL_TONES.has(color.tone) ? (
            <text
              key={color.tone}
              x={chartX(index, lightResult.colors.length)}
              y={CHART_HEIGHT - 10}
              textAnchor="middle"
            >
              {color.tone}
            </text>
          ) : null
        )}
        {lightNominalPath ? <path className="curve nominal-curve" d={lightNominalPath} /> : null}
        {darkNominalPath ? <path className="curve nominal-curve" d={darkNominalPath} /> : null}
        <path className="curve light-curve" d={lightPath} />
        <path className="curve dark-curve" d={darkPath} />
        {lightAnchorIndex >= 0 ? (
          <circle
            className="anchor-point light-curve"
            cx={chartX(lightAnchorIndex, lightValues.length)}
            cy={chartY(lightValues[lightAnchorIndex], maxValue)}
            r="5"
            fill="#0f6cbd"
          />
        ) : null}
        {darkAnchorIndex >= 0 ? (
          <circle
            className="anchor-point dark-curve"
            cx={chartX(darkAnchorIndex, darkValues.length)}
            cy={chartY(darkValues[darkAnchorIndex], maxValue)}
            r="5"
            fill="#8250df"
          />
        ) : null}
      </svg>
    </article>
  );
}

function DiagnosticsPanel({ theme, resolution }: { theme: Theme; resolution: ResolvedTonalTheme }) {
  const result = resolution.scale;
  const prefix = resolveThemePrefix(theme);
  const guardForeground = theme === 'light' ? '#ffffff' : '#000000';
  const guardAt35 = resolveTone(result, 35);
  const diagnostics = result.diagnostics;
  const status = resolveIntegrityStatus(result);
  const anchor = resolveAnchorColor(result);
  const anchorDiagnostics = diagnostics.anchor;
  const continuity = diagnostics.emittedContinuity;
  const continuityAnchor = continuity.anchor;
  const duplicateCount = diagnostics.adjacentDuplicates.length;
  const contrastFailureCount = diagnostics.contrastFailures.length;
  const adaptiveTextCrossover = resolveAdaptiveTextCrossover(result);
  const notes: Array<{ text: string; ok: boolean }> = [
    resolution.policy === 'source-exact'
      ? {
          text: `Source seed preserved exactly at ${prefix}${result.anchorTone} as ${anchor?.hex}.`,
          ok: true
        }
      : {
          text: `${capitalize(resolution.policy)} policy resolved ${resolution.sourceSeedHex} to effective rest ${resolution.effectiveSeedHex} at ${prefix}${resolution.restTone}.`,
          ok: resolution.status === 'pass'
        },
    diagnostics.profile === 'muted-darks'
      ? {
          text: `${diagnostics.profileChromaAdjustedCount} physically dark slot${diagnostics.profileChromaAdjustedCount === 1 ? '' : 's'} received intentional profile chroma reduction (max ${diagnostics.maxProfileChromaReduction.toFixed(4)}).`,
          ok: true
        }
      : {
          text: 'Balanced uses the frozen canonical chroma trajectory without profile attenuation.',
          ok: true
        },
    diagnostics.gamutMappedCount > 0
      ? {
          text: `${diagnostics.gamutMappedCount} slot${diagnostics.gamutMappedCount === 1 ? '' : 's'} fitted to sRGB by chroma reduction.`,
          ok: true
        }
      : { text: 'Every generated target was already inside sRGB.', ok: true }
  ];

  if (diagnostics.profile === 'muted-darks') {
    notes.push({
      text: diagnostics.anchorChromaProtected
        ? 'The exact seed anchor is excluded from profile attenuation.'
        : 'The neutral seed anchor has no chroma to protect from profile attenuation.',
      ok: true
    });
  }
  if (diagnostics.profileChromaRestoredCount > 0) {
    notes.push({
      text: `${diagnostics.profileChromaRestoredCount} slot${diagnostics.profileChromaRestoredCount === 1 ? '' : 's'} recovered only the chroma required to preserve canonical lightness, contrast and chroma-direction constraints.`,
      ok: true
    });
  }
  if (diagnostics.profileChromaFullyRestoredCount > 0) {
    notes.push({
      text: `${diagnostics.profileChromaFullyRestoredCount} slot${diagnostics.profileChromaFullyRestoredCount === 1 ? '' : 's'} returned fully to its Balanced chroma endpoint.`,
      ok: false
    });
  }

  if (diagnostics.separationRelaxed) {
    notes.push({
      text: 'Minimum spacing was relaxed locally to protect higher-priority invariants.',
      ok: false
    });
  }
  if (anchorDiagnostics?.relocated) {
    const reason =
      anchorDiagnostics.relocationReason === 'vivid-contrast'
        ? 'the 3:1 vivid contrast guard'
        : 'strict emitted-color spacing';
    notes.push({
      text: `Nearest nominal ${prefix}${anchorDiagnostics.nominalNearestTone} was not feasible; the anchor moved to ${prefix}${anchorDiagnostics.tone} to preserve ${reason}.`,
      ok: false
    });
  }
  if (continuity.fairing.status === 'applied') {
    notes.push({
      text: `Local emitted-curve fairing adjusted ${continuity.fairing.adjustedTones.map((tone) => `${prefix}${tone}`).join(', ')} with at most ${formatLightness(continuity.fairing.maxLightnessAdjustment, 2)} lightness movement.`,
      ok: true
    });
  } else if (continuity.fairing.status === 'rejected') {
    notes.push({
      text: 'A local fairing was evaluated but did not meet the bounded acceptance criteria.',
      ok: false
    });
  }
  if (continuity.reviewRequired) {
    const reviewMetrics = [
      continuityAnchor.stepImbalance === null
        ? null
        : `${continuityAnchor.stepImbalance.toFixed(2)}× anchor-step imbalance`,
      continuityAnchor.chromaExcess === null
        ? null
        : `${continuityAnchor.chromaExcess.toFixed(4)} anchor chroma excess`,
      continuityAnchor.normalizedChromaTurn === null
        ? null
        : `${continuityAnchor.normalizedChromaTurn.toFixed(3)} normalized chroma turn`
    ].filter((metric): metric is string => metric !== null);
    notes.push({
      text: `Emitted continuity remains under review${reviewMetrics.length > 0 ? `: ${reviewMetrics.join(', ')}.` : '.'}`,
      ok: false
    });
  }
  if (
    diagnostics.chromaContinuityRelaxed &&
    diagnostics.maxLocalChromaProminence > 0.01 &&
    diagnostics.chromaPeakTone !== null
  ) {
    notes.push({
      text: `An unavoidable emitted chroma prominence of ${diagnostics.maxLocalChromaProminence.toFixed(4)} remains at ${prefix}${diagnostics.chromaPeakTone}.`,
      ok: false
    });
  }
  if (contrastFailureCount > 0) {
    notes.push({
      text: `${contrastFailureCount} vivid slot contrast guard failure(s).`,
      ok: false
    });
  }
  if (duplicateCount > 0) {
    notes.push({ text: `${duplicateCount} adjacent duplicate color(s) detected.`, ok: false });
  }
  if (!diagnostics.darkSurfaceContrastMonotonic) {
    notes.push({
      text: `${diagnostics.darkSurfaceContrastFailures.length} emitted contrast reversal(s) detected between D0 and D35.`,
      ok: false
    });
  }

  return (
    <article className="panel diagnostics-panel">
      <div className="diagnostics-heading">
        <h3>{capitalize(theme)} theme</h3>
        <StatusBadge result={result} label={status.label} className={status.className} />
      </div>
      <dl className="metrics">
        <Metric label="Tonal profile" value={resolveProfileLabel(diagnostics.profile)} />
        <Metric label="Seed policy" value={capitalize(resolution.policy)} />
        <Metric label="Source seed" value={resolution.sourceSeedHex} />
        <Metric label="Effective seed" value={resolution.effectiveSeedHex} />
        <Metric
          label="Harmony score"
          value={resolution.harmony ? resolution.harmony.score.toFixed(3) : 'Reference'}
        />
        <Metric
          label="Source Delta E"
          value={resolution.harmony ? resolution.harmony.seedDeltaE.toFixed(3) : '0.000'}
        />
        <Metric label="Anchor" value={`${prefix}${result.anchorTone}`} />
        <Metric
          label="Nominal anchor"
          value={
            anchorDiagnostics?.relocated
              ? `${prefix}${anchorDiagnostics.nominalNearestTone} → ${prefix}${result.anchorTone}`
              : `${prefix}${result.anchorTone}`
          }
        />
        <Metric label="Monotonic" value={diagnostics.monotonic ? 'Pass' : 'Fail'} />
        <Metric label="Min ΔL" value={formatLightness(diagnostics.minLightnessDelta, 2)} />
        <Metric label="Duplicates" value={String(duplicateCount)} />
        <Metric
          label={`${prefix}35 vs ${theme === 'light' ? 'white' : 'black'}`}
          value={guardAt35 ? `${contrastRatio(guardAt35.hex, guardForeground).toFixed(2)}:1` : '—'}
        />
        <Metric
          label="Swatch label switch"
          value={adaptiveTextCrossover === null ? '—' : `${prefix}${adaptiveTextCrossover}`}
        />
        {theme === 'dark' ? (
          <Metric
            label="D0–D35 contrast"
            value={diagnostics.darkSurfaceContrastMonotonic ? 'Pass' : 'Fail'}
          />
        ) : null}
        <Metric label="Guard failures" value={String(contrastFailureCount)} />
        <Metric label="Profile adjusted" value={String(diagnostics.profileChromaAdjustedCount)} />
        <Metric
          label="Constraint restores"
          value={String(diagnostics.profileChromaRestoredCount)}
        />
        <Metric
          label="Fully restored"
          value={String(diagnostics.profileChromaFullyRestoredCount)}
        />
        <Metric
          label="Anchor chroma"
          value={
            diagnostics.profile === 'balanced'
              ? 'Canonical'
              : diagnostics.anchorChromaProtected
                ? 'Protected'
                : 'Neutral'
          }
        />
        <Metric label="Max profile ΔC" value={diagnostics.maxProfileChromaReduction.toFixed(4)} />
        <Metric label="Mean profile ΔC" value={diagnostics.meanProfileChromaReduction.toFixed(4)} />
        <Metric label="Gamut mapped" value={String(diagnostics.gamutMappedCount)} />
        <Metric label="Max gamut ΔC" value={diagnostics.maxGamutChromaLoss.toFixed(4)} />
        <Metric label="Max emitted ΔE" value={continuity.maxAdjacentDeltaE.toFixed(3)} />
        <Metric
          label="Anchor ΔE"
          value={formatMetricPair(
            continuityAnchor.incomingDeltaE,
            continuityAnchor.outgoingDeltaE,
            3
          )}
        />
        <Metric
          label="Step imbalance"
          value={
            continuityAnchor.stepImbalance === null
              ? '—'
              : `${continuityAnchor.stepImbalance.toFixed(2)}×`
          }
        />
        <Metric
          label="Chroma slope Δ"
          value={
            continuityAnchor.chromaSlopeChange === null
              ? '—'
              : continuityAnchor.chromaSlopeChange.toFixed(4)
          }
        />
        <Metric
          label="Fairing"
          value={
            continuity.fairing.status === 'not-needed'
              ? 'Not needed'
              : capitalize(continuity.fairing.status)
          }
        />
        <Metric label="Peak prominence" value={diagnostics.maxLocalChromaProminence.toFixed(4)} />
        <Metric
          label="Max nominal ΔL"
          value={formatLightness(diagnostics.maxNominalDeviation, 2)}
        />
        <Metric
          label="Mean nominal ΔL"
          value={formatLightness(diagnostics.meanNominalDeviation, 2)}
        />
      </dl>
      <ul className="diagnostic-notes">
        {notes.map((note) => (
          <li key={note.text} className={`diagnostic-note${note.ok ? ' ok' : ''}`}>
            {note.text}
          </li>
        ))}
      </ul>
    </article>
  );
}

function StatusBadge({
  result,
  label,
  className
}: {
  result: ScaleResult;
  label: string;
  className: 'ok' | 'warning' | 'error';
}) {
  return (
    <span
      className={`status-badge ${className}`}
      title={result.diagnostics.error?.message ?? undefined}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <dt className="metric-label">{label}</dt>
      <dd className="metric-value" title={value}>
        {value}
      </dd>
    </div>
  );
}

function DetailTable({ theme, result }: { theme: Theme; result: ScaleResult }) {
  const prefix = resolveThemePrefix(theme);
  const contrastBackground = theme === 'light' ? '#ffffff' : '#000000';
  const adjacentDeltaEByTone = new Map(
    result.diagnostics.emittedContinuity.adjacentDeltaE.map((edge) => [edge.toTone, edge.value])
  );

  return (
    <article className="panel detail-panel">
      <div className="detail-heading">
        <h3>{`${prefix}0 → ${prefix}100`}</h3>
        <p>Contrast measured against {theme === 'light' ? 'white' : 'black'}.</p>
      </div>
      <div className="table-wrap">
        <table className="detail-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Color</th>
              <th>L</th>
              <th>C</th>
              <th>H</th>
              <th>ΔL prev</th>
              <th>ΔE prev</th>
              <th>Nominal ΔL</th>
              <th>Contrast vs {theme === 'light' ? 'white' : 'black'}</th>
              <th>Profile ΔC</th>
              <th>Restore</th>
              <th>Gamut ΔC</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {result.colors.map((color, index) => {
              const previous = result.colors[index - 1];
              const deltaFromPrevious = previous
                ? Math.abs(color.oklch.l - previous.oklch.l)
                : null;
              const deltaEFromPrevious = adjacentDeltaEByTone.get(color.tone);
              const flags = resolveFlags(color);

              return (
                <tr key={color.tone}>
                  <td>
                    {prefix}
                    {color.tone}
                  </td>
                  <td>
                    <span className="color-cell">
                      <i
                        className="color-dot"
                        style={{ '--color': color.hex } as CSSProperties}
                        aria-hidden="true"
                      />
                      {color.hex}
                    </span>
                  </td>
                  <td>{color.oklch.l.toFixed(2)}</td>
                  <td>{color.oklch.c.toFixed(4)}</td>
                  <td>{formatHue(color.oklch.h)}</td>
                  <td>{deltaFromPrevious === null ? '—' : deltaFromPrevious.toFixed(2)}</td>
                  <td>{deltaEFromPrevious?.toFixed(3) ?? '—'}</td>
                  <td>{Math.abs(color.oklch.l - color.nominalLightness).toFixed(2)}</td>
                  <td>{contrastRatio(color.hex, contrastBackground).toFixed(2)}:1</td>
                  <td>{color.profileChromaReduction.toFixed(4)}</td>
                  <td>
                    {color.flags.profileConstraintRestored
                      ? `${Math.round(color.profileRestoreRatio * 100)}%`
                      : '—'}
                  </td>
                  <td>{color.gamutChromaLoss.toFixed(4)}</td>
                  <td>{flags}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function resolveAnchorColor(result: ScaleResult): ScaleColor | undefined {
  return result.colors.find((color) => color.flags.isAnchor);
}

function resolveProfileDefinition(profile: KiskadeeTonalProfile) {
  return (
    KISKADEE_TONAL_PROFILES.find((candidate) => candidate.id === profile) ??
    KISKADEE_TONAL_PROFILES[0]
  );
}

function resolveProfileLabel(profile: KiskadeeTonalProfile | null): string {
  return profile === null ? '—' : resolveProfileDefinition(profile).label;
}

function resolveTone(result: ScaleResult, tone: number): ScaleColor | undefined {
  return result.colors.find((color) => color.tone === tone);
}

function resolveThemePrefix(theme: Theme): 'L' | 'D' {
  return theme === 'light' ? 'L' : 'D';
}

function resolveAdaptiveTextCrossover(result: ScaleResult): number | null {
  for (let index = 1; index < result.colors.length; index += 1) {
    if (bestTextColor(result.colors[index].hex) !== bestTextColor(result.colors[index - 1].hex)) {
      return result.colors[index].tone;
    }
  }

  return null;
}

function resolveIntegrityStatus(result: ScaleResult): {
  label: string;
  className: 'ok' | 'warning' | 'error';
} {
  const diagnostics = result.diagnostics;

  if (!diagnostics.valid || !diagnostics.monotonic) {
    return { label: 'Invalid', className: 'error' };
  }

  if (
    diagnostics.separationRelaxed ||
    diagnostics.chromaContinuityRelaxed ||
    diagnostics.adjacentDuplicates.length > 0 ||
    diagnostics.contrastFailures.length > 0
  ) {
    return { label: 'Review', className: 'warning' };
  }

  return { label: 'Pass', className: 'ok' };
}

function resolveFlags(color: ScaleColor): string {
  const flags = [
    color.flags.isCap ? 'cap' : null,
    color.flags.isAnchor ? 'anchor' : null,
    color.flags.isVivid ? 'vivid' : null,
    color.flags.contrastAdjusted ? 'contrast fit' : null,
    color.flags.gamutMapped ? 'gamut fit' : null,
    color.flags.separationRelaxed ? 'spacing' : null,
    color.flags.profileChromaAdjusted ? 'profile muted' : null,
    color.flags.profileConstraintRestored ? 'profile restore' : null
  ].filter((flag): flag is string => flag !== null);

  return flags.length > 0 ? flags.join(', ') : '—';
}

function createChartPath(values: number[], maxValue: number): string {
  return values
    .map((value, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command}${chartX(index, values.length)} ${chartY(value, maxValue)}`;
    })
    .join(' ');
}

function chartX(index: number, length: number): number {
  const plotWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const ratio = length <= 1 ? 0 : index / (length - 1);
  return round(CHART_PADDING_X + ratio * plotWidth, 3);
}

function chartY(value: number, maxValue: number): number {
  const plotHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const ratio = maxValue <= 0 ? 0 : Math.min(1, Math.max(0, value / maxValue));
  return round(CHART_PADDING_Y + (1 - ratio) * plotHeight, 3);
}

function round(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

function formatLightness(value: number, precision: number): string {
  return `${value.toFixed(precision)}%`;
}

function formatMetricPair(
  incoming: number | null,
  outgoing: number | null,
  precision: number
): string {
  return incoming === null || outgoing === null
    ? '—'
    : `${incoming.toFixed(precision)} / ${outgoing.toFixed(precision)}`;
}

function formatHue(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)}°` : '—';
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function bestTextColor(hex: string): '#000000' | '#ffffff' {
  return contrastRatio(hex, '#000000') >= contrastRatio(hex, '#ffffff') ? '#000000' : '#ffffff';
}

function contrastRatio(firstHex: string, secondHex: string): number {
  const first = relativeLuminance(firstHex);
  const second = relativeLuminance(secondHex);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
