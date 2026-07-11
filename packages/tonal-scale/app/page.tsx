'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateKiskadeeScale } from '@/src/kiskadee-tonal-scale';

const DEFAULT_SEED = '#0f6cbd';
const COLOR_QUERY_PARAM = 'color';
const CHART_WIDTH = 720;
const CHART_HEIGHT = 300;
const CHART_PADDING_X = 42;
const CHART_PADDING_Y = 30;
const CHART_LABEL_TONES = new Set([0, 10, 30, 50, 70, 100]);

type ScaleResult = ReturnType<typeof generateKiskadeeScale>;
type ScaleColor = ScaleResult['colors'][number];
type Theme = 'light' | 'dark';
type ChartMetric = 'lightness' | 'chroma';

export default function TonalScalePage() {
  const [hexInput, setHexInput] = useState(DEFAULT_SEED);
  const urlReadyRef = useRef(false);

  const lightResult = useMemo(
    () =>
      generateKiskadeeScale({
        seedHex: hexInput,
        theme: 'light',
        variant: 'standard'
      }),
    [hexInput]
  );
  const darkResult = useMemo(
    () =>
      generateKiskadeeScale({
        seedHex: hexInput,
        theme: 'dark',
        variant: 'standard'
      }),
    [hexInput]
  );

  const isValid = lightResult.diagnostics.valid && darkResult.diagnostics.valid;
  const seedColor = resolveAnchorColor(lightResult)?.hex ?? resolveAnchorColor(darkResult)?.hex;
  const inputIsInvalid =
    lightResult.diagnostics.error?.code === 'INVALID_HEX' ||
    darkResult.diagnostics.error?.code === 'INVALID_HEX';

  useEffect(() => {
    const applyColorFromUrl = () => {
      const url = new URL(window.location.href);
      const color = url.searchParams.get(COLOR_QUERY_PARAM);

      if (color !== null) {
        setHexInput(color.startsWith('#') ? color : `#${color}`);
      }

      urlReadyRef.current = true;
    };

    applyColorFromUrl();
    window.addEventListener('popstate', applyColorFromUrl);

    return () => window.removeEventListener('popstate', applyColorFromUrl);
  }, []);

  useEffect(() => {
    if (!urlReadyRef.current || !isValid || !seedColor) {
      return;
    }

    const url = new URL(window.location.href);
    const serializedColor = seedColor.slice(1);

    if (url.searchParams.get(COLOR_QUERY_PARAM) === serializedColor) {
      return;
    }

    url.searchParams.set(COLOR_QUERY_PARAM, serializedColor);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [isValid, seedColor]);

  const errorMessage =
    lightResult.diagnostics.error?.message ??
    darkResult.diagnostics.error?.message ??
    'The scale could not satisfy every required invariant for this input.';
  const seedStyle = {
    '--seed-color': seedColor ?? 'transparent'
  } as CSSProperties;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Kiskadee v1 · Standard</span>
          <h1>One seed. One canonical tonal scale.</h1>
          <p className="hero-copy">
            Generate the same 35 stable positions for light and dark themes. The input color stays
            exact; the surrounding curve adapts and reports every compromise.
          </p>
        </div>

        <div className="seed-form">
          <label htmlFor="seed-hex">Color family seed</label>
          <div className="seed-input-row">
            <span className="seed-preview" style={seedStyle} aria-hidden="true" />
            <input
              id="seed-hex"
              aria-describedby="seed-help"
              aria-invalid={inputIsInvalid}
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              value={hexInput}
              onChange={(event) => setHexInput(event.target.value)}
            />
          </div>
          <p id="seed-help" className={`field-help${isValid ? '' : ' error'}`}>
            {isValid
              ? `${seedColor} is preserved exactly in both theme orientations.`
              : errorMessage}
          </p>
        </div>
      </header>

      {isValid ? (
        <ScaleWorkspace lightResult={lightResult} darkResult={darkResult} />
      ) : (
        <section className="empty-state" aria-live="polite">
          <div>
            <strong>No scale generated</strong>
            <p>
              Generation never falls back to another color. Enter a valid value such as #0f6cbd to
              generate the Kiskadee scale.
            </p>
          </div>
        </section>
      )}

      <footer className="app-footer">
        <span>Milestone 1 validates only the standard Kiskadee scale.</span>
        <code>Soft Dark: deferred until visual approval</code>
      </footer>
    </main>
  );
}

function ScaleWorkspace({
  lightResult,
  darkResult
}: {
  lightResult: ScaleResult;
  darkResult: ScaleResult;
}) {
  return (
    <>
      <section className="section-block" aria-labelledby="theme-preview-title">
        <div className="section-heading">
          <h2 id="theme-preview-title">Theme orientations</h2>
          <p>
            Labels stay fixed. Light progresses from white to black; dark reverses the physical
            lightness targets without reordering the slots.
          </p>
        </div>
        <div className="theme-grid">
          <ThemePanel theme="light" result={lightResult} />
          <ThemePanel theme="dark" result={darkResult} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="curve-title">
        <div className="section-heading">
          <h2 id="curve-title">OKLCH curves</h2>
          <p>
            Solid lines show emitted sRGB colors. Dashed lightness lines show the frozen nominal
            targets before the exact anchor and constraints adapt the curve.
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
            Caps, exact anchor, monotonicity, spacing, contrast and sRGB fitting are measured for
            each orientation independently.
          </p>
        </div>
        <div className="diagnostics-grid">
          <DiagnosticsPanel theme="light" result={lightResult} />
          <DiagnosticsPanel theme="dark" result={darkResult} />
        </div>
      </section>

      <section className="section-block" aria-labelledby="slot-details-title">
        <div className="section-heading">
          <h2 id="slot-details-title">Slot details</h2>
          <p>Inspect actual lightness deltas, nominal deviation, vivid contrast and gamut loss.</p>
        </div>
        <div className="theme-grid">
          <DetailTable theme="light" result={lightResult} />
          <DetailTable theme="dark" result={darkResult} />
        </div>
      </section>
    </>
  );
}

function ThemePanel({ theme, result }: { theme: Theme; result: ScaleResult }) {
  const anchorColor = resolveAnchorColor(result);
  const surface = resolveTone(result, 0);
  const surfaceRaised = resolveTone(result, 4);
  const border = resolveTone(result, 10);
  const text = resolveTone(result, 100);
  const muted = resolveTone(result, 70);
  const action = anchorColor ?? resolveTone(result, 50);
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
          <h3>
            {theme === 'light' ? 'White → black' : 'Black → white'} · anchor K{result.anchorTone}
          </h3>
        </div>
        <StatusBadge result={result} label={status.label} className={status.className} />
      </div>

      <div className="component-preview" style={previewStyle}>
        <div className="preview-card">
          <small>Example surface</small>
          <strong>Stable positions, flexible identity</strong>
          <p>The same slots can power another color family without changing component intent.</p>
          <button className="preview-button" type="button">
            Primary action
          </button>
        </div>
      </div>

      <div className="scale-scroll">
        <div className="scale-strip">
          {result.colors.map((color) => (
            <Swatch key={color.tone} color={color} />
          ))}
        </div>
      </div>
    </article>
  );
}

function Swatch({ color }: { color: ScaleColor }) {
  const style = {
    '--swatch': color.hex,
    '--swatch-text': bestTextColor(color.hex)
  } as CSSProperties;

  return (
    <div
      className={`swatch${color.flags.isAnchor ? ' anchor' : ''}`}
      style={style}
      title={`K${color.tone} · ${color.hex}`}
    >
      <span className="swatch-tone">K{color.tone}</span>
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
          {metric === 'lightness' ? 'OKLCH lightness curves' : 'OKLCH chroma curves'}
        </title>
        <desc id={`${chartId}-description`}>
          {metric === 'lightness'
            ? 'Light and dark OKL lightness progression, including nominal targets.'
            : 'Light and dark OKL chroma progression.'}
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
              K{color.tone}
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

function DiagnosticsPanel({ theme, result }: { theme: Theme; result: ScaleResult }) {
  const diagnostics = result.diagnostics;
  const status = resolveIntegrityStatus(result);
  const anchor = resolveAnchorColor(result);
  const anchorDiagnostics = diagnostics.anchor;
  const duplicateCount = diagnostics.adjacentDuplicates.length;
  const contrastFailureCount = diagnostics.contrastFailures.length;
  const notes: Array<{ text: string; ok: boolean }> = [
    {
      text: `Exact seed preserved at K${result.anchorTone} as ${anchor?.hex}.`,
      ok: true
    },
    diagnostics.gamutMappedCount > 0
      ? {
          text: `${diagnostics.gamutMappedCount} slot${diagnostics.gamutMappedCount === 1 ? '' : 's'} fitted to sRGB by chroma reduction.`,
          ok: true
        }
      : { text: 'Every generated target was already inside sRGB.', ok: true }
  ];

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
      text: `Nearest nominal K${anchorDiagnostics.nominalNearestTone} was not feasible; the anchor moved to K${anchorDiagnostics.tone} to preserve ${reason}.`,
      ok: false
    });
  }
  if (diagnostics.chromaContinuityRelaxed) {
    notes.push({
      text: `An unavoidable emitted chroma prominence of ${diagnostics.maxLocalChromaProminence.toFixed(4)} remains at K${diagnostics.chromaPeakTone}.`,
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

  return (
    <article className="panel diagnostics-panel">
      <div className="diagnostics-heading">
        <h3>{capitalize(theme)} orientation</h3>
        <StatusBadge result={result} label={status.label} className={status.className} />
      </div>
      <dl className="metrics">
        <Metric label="Anchor" value={`K${result.anchorTone}`} />
        <Metric
          label="Nominal anchor"
          value={
            anchorDiagnostics?.relocated
              ? `K${anchorDiagnostics.nominalNearestTone} → K${result.anchorTone}`
              : `K${result.anchorTone}`
          }
        />
        <Metric label="Monotonic" value={diagnostics.monotonic ? 'Pass' : 'Fail'} />
        <Metric label="Min ΔL" value={formatLightness(diagnostics.minLightnessDelta, 2)} />
        <Metric label="Duplicates" value={String(duplicateCount)} />
        <Metric label="Contrast fails" value={String(contrastFailureCount)} />
        <Metric label="Gamut mapped" value={String(diagnostics.gamutMappedCount)} />
        <Metric label="Max ΔC" value={diagnostics.maxGamutChromaLoss.toFixed(4)} />
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
  const contrastBackground = theme === 'light' ? '#ffffff' : '#000000';

  return (
    <article className="panel detail-panel">
      <div className="detail-heading">
        <h3>{capitalize(theme)}</h3>
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
              <th>Nominal ΔL</th>
              <th>Contrast</th>
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
              const flags = resolveFlags(color);

              return (
                <tr key={color.tone}>
                  <td>K{color.tone}</td>
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
                  <td>{Math.abs(color.oklch.l - color.nominalLightness).toFixed(2)}</td>
                  <td>{contrastRatio(color.hex, contrastBackground).toFixed(2)}:1</td>
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

function resolveTone(result: ScaleResult, tone: number): ScaleColor | undefined {
  return result.colors.find((color) => color.tone === tone);
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
    color.flags.separationRelaxed ? 'spacing' : null
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
