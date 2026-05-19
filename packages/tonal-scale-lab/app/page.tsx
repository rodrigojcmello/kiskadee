'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_TONAL_PROFILE_ID,
  FLUENT_BLUE_HEX,
  resolveTonalProfile,
  TONAL_PROFILES,
  type TonalProfileId
} from '@/src/tonal-profiles';
import {
  type ChromaCurveProjection,
  type CurveControls,
  contrastRatio,
  createHexByTone,
  DEFAULT_SCALE_DISTRIBUTION_ID,
  formatHsl,
  formatOklch,
  generateTonalScaleWithDiagnostics,
  hexToOklch,
  isAbsoluteScaleCapTone,
  normalizeHexColor,
  resolveAppliedVividContrastRule,
  resolveChromaticDarkEndTone,
  resolveChromaticLightEndTone,
  resolveInputFitTone,
  resolveProfileReferenceScale,
  resolveScaleDistribution,
  rgbDistance,
  SCALE_DISTRIBUTIONS,
  type ScaleDistribution,
  type ScaleDistributionId,
  type ScaleTone,
  type TonalProfileMode,
  type TonalScaleColor,
  type VividContrastRule
} from '@/src/tonal-scale';

type ControlKey = keyof CurveControls;

type RangeControl = {
  key: ControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  modes?: TonalProfileMode[];
};

const RANGE_CONTROLS: RangeControl[] = [
  {
    key: 'darkFloorLightness',
    label: 'Dark floor L',
    min: 0,
    max: 24,
    step: 0.25,
    suffix: '%'
  },
  {
    key: 'lightCeilingLightness',
    label: 'Light ceiling L',
    min: 80,
    max: 100,
    step: 0.25,
    suffix: '%'
  },
  {
    key: 'darkLightnessGamma',
    label: 'Gamma escuro',
    min: 0.55,
    max: 1.8,
    step: 0.01
  },
  {
    key: 'lightLightnessGamma',
    label: 'Gamma claro',
    min: 0.55,
    max: 1.8,
    step: 0.01
  },
  {
    key: 'saturationScale',
    label: 'S global',
    min: 0.45,
    max: 1.45,
    step: 0.01
  },
  {
    key: 'darkSaturationBias',
    label: 'S escuro',
    min: 0.45,
    max: 1.65,
    step: 0.01,
    modes: ['reference-curve']
  },
  {
    key: 'lightSaturationBias',
    label: 'S claro',
    min: 0.45,
    max: 1.65,
    step: 0.01,
    modes: ['reference-curve']
  },
  {
    key: 'hueDriftStrength',
    label: 'Deriva H',
    min: 0,
    max: 1.8,
    step: 0.01,
    modes: ['reference-curve']
  }
];

const CHART_WIDTH = 720;
const CHART_HEIGHT = 360;
const CHART_PADDING = 42;
const CHART_CHROMA_MAX = 0.4;
const CHART_POINT_RADIUS = 4;
const COLOR_QUERY_PARAM = 'color';

export default function TonalScaleLabPage() {
  const [profileId, setProfileId] = useState<TonalProfileId>(DEFAULT_TONAL_PROFILE_ID);
  const [distributionId, setDistributionId] = useState<ScaleDistributionId>(
    DEFAULT_SCALE_DISTRIBUTION_ID
  );
  const selectedProfile = resolveTonalProfile(profileId);
  const selectedDistribution = resolveScaleDistribution(distributionId);
  const [hexInput, setHexInput] = useState(FLUENT_BLUE_HEX);
  const lastUrlColorRef = useRef<string | null>(null);
  const skipNextUrlUpdateRef = useRef(false);
  const [controls, setControls] = useState<CurveControls>(selectedProfile.defaultControls);
  const normalizedHex = normalizeHexColor(hexInput);
  const baseHex = normalizedHex ?? FLUENT_BLUE_HEX;
  const referenceScale = useMemo(
    () => resolveProfileReferenceScale(baseHex, selectedProfile, selectedDistribution),
    [baseHex, selectedProfile, selectedDistribution]
  );
  const referenceHexByTone = useMemo(() => createHexByTone(referenceScale), [referenceScale]);
  const generatedResult = useMemo(
    () =>
      generateTonalScaleWithDiagnostics(baseHex, controls, selectedProfile, selectedDistribution),
    [baseHex, controls, selectedProfile, selectedDistribution]
  );
  const generatedScale = generatedResult.scale;
  const plannedChromaCurve = generatedResult.diagnostics.plannedChromaCurve;
  const inputFitTone = useMemo(
    () => resolveInputFitTone(baseHex, selectedProfile, generatedScale),
    [baseHex, selectedProfile, generatedScale]
  );
  const activeVividContrast = resolveAppliedVividContrastRule(
    baseHex,
    selectedProfile,
    selectedDistribution
  );
  const structuralNodeTones = resolveChartStructuralNodeTones(
    selectedDistribution,
    activeVividContrast,
    inputFitTone
  );
  const baseColor =
    generatedScale.find((entry) => entry.tone === inputFitTone) ?? generatedScale[0];
  const chromaticDarkEndTone = resolveChromaticDarkEndTone(selectedDistribution);
  const meanDistance = useMemo(() => {
    const total = generatedScale.reduce(
      (sum, entry) => sum + rgbDistance(entry.hex, referenceHexByTone[entry.tone]),
      0
    );
    return total / generatedScale.length;
  }, [generatedScale, referenceHexByTone]);
  const visibleRangeControls = RANGE_CONTROLS.filter(
    (control) => !control.modes || control.modes.includes(selectedProfile.mode)
  );

  useEffect(() => {
    const applyColorFromUrl = () => {
      const urlColor = readUrlColor();
      const nextHex = urlColor ?? FLUENT_BLUE_HEX;

      lastUrlColorRef.current = urlColor ? serializeColorParam(urlColor) : null;
      skipNextUrlUpdateRef.current = true;
      setHexInput(nextHex);
    };

    applyColorFromUrl();
    window.addEventListener('popstate', applyColorFromUrl);

    return () => window.removeEventListener('popstate', applyColorFromUrl);
  }, []);

  useEffect(() => {
    if (skipNextUrlUpdateRef.current) {
      skipNextUrlUpdateRef.current = false;
      return;
    }

    if (!normalizedHex) {
      return;
    }

    const nextUrlColor = serializeColorParam(normalizedHex);

    if (lastUrlColorRef.current === nextUrlColor) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set(COLOR_QUERY_PARAM, nextUrlColor);
    window.history.pushState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    lastUrlColorRef.current = nextUrlColor;
  }, [normalizedHex]);

  const updateControl = (key: ControlKey, value: number) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  const updateProfile = (id: TonalProfileId) => {
    const nextProfile = resolveTonalProfile(id);
    setProfileId(nextProfile.id as TonalProfileId);
    setControls(nextProfile.defaultControls);
  };

  const updateDistribution = (id: ScaleDistributionId) => {
    const nextDistribution = resolveScaleDistribution(id);
    setDistributionId(nextDistribution.id as ScaleDistributionId);
  };

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Tonal scale controls">
        <div>
          <h1>Tonal Scale Lab</h1>
          <p>Flexible scale distributions with selectable tonal profiles</p>
        </div>
        <label className="field">
          <span>Scale distribution</span>
          <select
            value={selectedDistribution.id}
            onChange={(event) => updateDistribution(event.target.value as ScaleDistributionId)}
          >
            {SCALE_DISTRIBUTIONS.map((distribution) => (
              <option key={distribution.id} value={distribution.id}>
                {distribution.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tonal profile</span>
          <select
            value={selectedProfile.id}
            onChange={(event) => updateProfile(event.target.value as TonalProfileId)}
          >
            {TONAL_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {formatProfileSelectLabel(profile)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Base hex</span>
          <input
            value={hexInput}
            onChange={(event) => setHexInput(event.target.value)}
            spellCheck={false}
            aria-invalid={!normalizedHex}
          />
        </label>
        <div className="base-chip" style={{ '--chip-color': baseColor.hex } as CSSProperties}>
          <span>{baseColor.hex}</span>
          <strong>
            {formatInputStrategy(selectedProfile.inputStrategy)} · {formatScaleLabel(baseColor)} ·{' '}
            {formatHsl(baseColor.hsl)}
          </strong>
        </div>
      </section>

      <section className="scale-section" aria-label="Generated tonal scale">
        <div className="section-heading">
          <h2>Generated Scale</h2>
          <span className={normalizedHex ? 'status ok' : 'status error'}>
            {normalizedHex ? 'valid hex' : 'invalid hex'}
          </span>
        </div>
        <ScaleStrip colors={generatedScale} />
      </section>

      <section className="workspace-grid">
        <div className="chart-panel">
          <div className="section-heading">
            <h2>Curve</h2>
            <span>OKLCH plane</span>
          </div>
          <CurveChart
            baseTone={inputFitTone}
            generated={generatedScale}
            plannedChromaCurve={plannedChromaCurve}
            reference={referenceScale}
            bridgeStartTone={selectedDistribution.vividBridgeStartTone}
            structuralNodeTones={structuralNodeTones}
            vividStartTone={activeVividContrast?.startTone}
          />
        </div>

        <div className="controls-panel">
          <div className="section-heading">
            <h2>Curve Controls</h2>
            <button type="button" onClick={() => setControls(selectedProfile.defaultControls)}>
              Reset
            </button>
          </div>
          <div className="range-grid">
            {visibleRangeControls.map((control) => (
              <label className="range-row" key={control.key}>
                <span>{control.label}</span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={controls[control.key]}
                  onChange={(event) => updateControl(control.key, Number(event.target.value))}
                />
                <output>
                  {formatControlValue(controls[control.key])}
                  {control.suffix}
                </output>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="comparison-section" aria-label="Reference comparison">
        <div className="section-heading">
          <h2>{selectedProfile.label} Reference</h2>
          <span>
            {generatedScale.length} slots · {selectedDistribution.label} · mean RGB delta{' '}
            {meanDistance.toFixed(2)}
          </span>
        </div>
        {activeVividContrast ? (
          <p className="profile-note">
            Vivid guard: K{activeVividContrast.startTone}-K{chromaticDarkEndTone} keeps{' '}
            {activeVividContrast.minRatio}:1 contrast with white text. Bridge starts at K
            {selectedDistribution.vividBridgeStartTone ?? activeVividContrast.bridgeStartTone}.
          </p>
        ) : null}
        <ScaleStrip colors={referenceScale} />
        <ScaleTable
          generated={generatedScale}
          referenceHexByTone={referenceHexByTone}
          vividContrast={activeVividContrast}
        />
      </section>
    </main>
  );
}

function ScaleStrip({ colors }: { colors: TonalScaleColor[] }) {
  return (
    <div className="scale-strip" style={{ '--scale-columns': colors.length } as CSSProperties}>
      {colors.map((color) => {
        const foregroundColor = resolveSwatchForeground(color);
        const style = {
          backgroundColor: color.hex,
          color: foregroundColor
        } as CSSProperties;

        return (
          <div className="swatch" key={color.id} style={style} title={color.label}>
            <span>{color.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function resolveSwatchForeground(color: TonalScaleColor): '#111827' | '#ffffff' {
  return contrastRatio(color.hex, '#ffffff') >= 3 ? '#ffffff' : '#111827';
}

function readUrlColor(): string | null {
  const rawColor = new URLSearchParams(window.location.search).get(COLOR_QUERY_PARAM);

  return rawColor ? normalizeHexColor(rawColor) : null;
}

function serializeColorParam(hex: string): string {
  return hex.replace(/^#/, '').toLowerCase();
}

function CurveChart({
  baseTone,
  generated,
  plannedChromaCurve,
  reference,
  bridgeStartTone,
  structuralNodeTones,
  vividStartTone
}: {
  baseTone: ScaleTone;
  generated: TonalScaleColor[];
  plannedChromaCurve?: ChromaCurveProjection;
  reference: TonalScaleColor[];
  bridgeStartTone?: ScaleTone;
  structuralNodeTones: readonly ScaleTone[];
  vividStartTone?: ScaleTone;
}) {
  const chartGenerated = generated.filter((color) => !isAbsoluteScaleCapTone(color.tone));
  const chartReference = reference.filter((color) => !isAbsoluteScaleCapTone(color.tone));
  const generatedPath = createPath(chartGenerated);
  const referencePath = createPath(chartReference);
  const plannedPath = plannedChromaCurve ? createProjectionPath(plannedChromaCurve.samples) : '';

  return (
    <svg className="curve-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
      <title>Generated and reference tonal scale curves</title>
      <rect width={CHART_WIDTH} height={CHART_HEIGHT} rx="8" />
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line
            x1={xForOklLightness(value)}
            x2={xForOklLightness(value)}
            y1={CHART_PADDING}
            y2={CHART_HEIGHT - CHART_PADDING}
          />
          <text x={xForOklLightness(value)} y={CHART_HEIGHT - 14}>
            {value}
          </text>
        </g>
      ))}
      {[0, 0.1, 0.2, 0.3, 0.4].map((value) => (
        <g key={value}>
          <line
            x1={CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y1={yForOklChroma(value)}
            y2={yForOklChroma(value)}
          />
          <text x="14" y={yForOklChroma(value) + 4}>
            {value.toFixed(1)}
          </text>
        </g>
      ))}
      <text className="axis-label" x={CHART_WIDTH / 2} y={CHART_HEIGHT - 4}>
        OKL lightness
      </text>
      <text className="axis-label" x="12" y="24">
        OKL chroma
      </text>
      <path className="reference-path" d={referencePath} />
      {plannedPath ? <path className="planned-curve-path" d={plannedPath} /> : null}
      <path className="generated-path" d={generatedPath} />
      {plannedChromaCurve?.points.map((point) => (
        <circle
          className="planned-curve-point"
          key={point.role}
          {...projectionPointFor(point)}
          r={CHART_POINT_RADIUS}
        />
      ))}
      {chartReference.map((color) => (
        <circle
          className="reference-point"
          key={`r-${color.id}`}
          {...pointFor(color)}
          r={CHART_POINT_RADIUS}
        />
      ))}
      {chartGenerated.map((color) => {
        const isStructuralNodePoint = structuralNodeTones.includes(color.tone);

        return (
          <g key={color.id}>
            <circle
              className={isStructuralNodePoint ? 'generated-node-point' : 'generated-point'}
              {...pointFor(color)}
              r={CHART_POINT_RADIUS}
            />
            {shouldLabelPoint(
              color,
              baseTone,
              bridgeStartTone,
              structuralNodeTones,
              vividStartTone,
              chartGenerated.length
            ) ? (
              <text className="point-label" x={pointFor(color).cx + 7} y={pointFor(color).cy - 7}>
                {color.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function resolveChartStructuralNodeTones(
  distribution: ScaleDistribution,
  vividContrast: VividContrastRule | undefined,
  inputFitTone: ScaleTone
): ScaleTone[] {
  const tones = [
    resolveChromaticLightEndTone(distribution),
    distribution.vividBridgeStartTone,
    vividContrast?.startTone,
    resolveChromaticDarkEndTone(distribution),
    inputFitTone
  ].filter((tone): tone is ScaleTone => tone !== undefined && !isAbsoluteScaleCapTone(tone));

  return Array.from(new Set(tones));
}

function shouldLabelPoint(
  color: TonalScaleColor,
  baseTone: ScaleTone,
  bridgeStartTone: ScaleTone | undefined,
  structuralNodeTones: readonly ScaleTone[],
  vividStartTone: ScaleTone | undefined,
  pointCount: number
): boolean {
  if (pointCount <= 16) {
    return true;
  }

  const tone = color.tone;

  return (
    tone === baseTone ||
    tone === bridgeStartTone ||
    structuralNodeTones.includes(tone) ||
    tone === vividStartTone ||
    tone % 10 === 0
  );
}

function ScaleTable({
  generated,
  referenceHexByTone,
  vividContrast
}: {
  generated: TonalScaleColor[];
  referenceHexByTone: Record<ScaleTone, string>;
  vividContrast?: VividContrastRule;
}) {
  const chromaticDarkEndTone = generated
    .filter((color) => !isAbsoluteScaleCapTone(color.tone))
    .reduce((current, color) => Math.max(current, color.tone), 0);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>slot</th>
            <th>generated</th>
            <th>generated HSL</th>
            <th>generated OKLCH</th>
            <th>OKL L delta</th>
            <th>reference</th>
            <th>white contrast</th>
            <th>vivid guard</th>
            <th>RGB delta</th>
          </tr>
        </thead>
        <tbody>
          {generated.map((color, index) => (
            <tr key={color.id}>
              <td>{color.label}</td>
              <td>{color.hex}</td>
              <td>{formatHsl(color.hsl)}</td>
              <td>{formatOklch(hexToOklch(color.hex))}</td>
              <td>{formatOklLightnessDelta(color, generated[index - 1])}</td>
              <td>{referenceHexByTone[color.tone]}</td>
              <td>{contrastRatio(color.hex, '#ffffff').toFixed(2)}</td>
              <td>{formatVividGuardStatus(color, vividContrast, chromaticDarkEndTone)}</td>
              <td>{rgbDistance(color.hex, referenceHexByTone[color.tone]).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatOklLightnessDelta(color: TonalScaleColor, previous?: TonalScaleColor): string {
  return previous ? (hexToOklch(previous.hex).l - hexToOklch(color.hex).l).toFixed(2) : '-';
}

function formatVividGuardStatus(
  color: TonalScaleColor,
  vividContrast: VividContrastRule | undefined,
  chromaticDarkEndTone: ScaleTone
): string {
  if (!vividContrast) {
    return '-';
  }

  if (isAbsoluteScaleCapTone(color.tone)) {
    return 'absolute cap';
  }

  if (color.tone < vividContrast.startTone || color.tone > chromaticDarkEndTone) {
    return 'not checked';
  }

  return contrastRatio(color.hex, vividContrast.foregroundHex) >= vividContrast.minRatio
    ? 'pass'
    : 'fail';
}

function createPath(colors: TonalScaleColor[]): string {
  return colors
    .map((color, index) => {
      const { cx, cy } = pointFor(color);
      return `${index === 0 ? 'M' : 'L'} ${cx} ${cy}`;
    })
    .join(' ');
}

function createProjectionPath(points: readonly { lightness: number; chroma: number }[]): string {
  return points
    .map((point, index) => {
      const { cx, cy } = projectionPointFor(point);
      return `${index === 0 ? 'M' : 'L'} ${cx} ${cy}`;
    })
    .join(' ');
}

function pointFor(color: TonalScaleColor): { cx: number; cy: number } {
  const oklch = hexToOklch(color.hex);

  return projectionPointFor({
    lightness: oklch.l,
    chroma: oklch.c
  });
}

function projectionPointFor(point: { lightness: number; chroma: number }): {
  cx: number;
  cy: number;
} {
  return {
    cx: xForOklLightness(point.lightness),
    cy: yForOklChroma(point.chroma)
  };
}

function xForOklLightness(lightness: number): number {
  return CHART_PADDING + (lightness / 100) * (CHART_WIDTH - CHART_PADDING * 2);
}

function yForOklChroma(chroma: number): number {
  return (
    CHART_PADDING +
    ((CHART_CHROMA_MAX - clampChartChroma(chroma)) / CHART_CHROMA_MAX) *
      (CHART_HEIGHT - CHART_PADDING * 2)
  );
}

function clampChartChroma(chroma: number): number {
  return Math.min(CHART_CHROMA_MAX, Math.max(0, chroma));
}

function formatControlValue(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function formatScaleLabel(color: TonalScaleColor): string {
  return color.label === `${color.tone}` ? `K${color.label}` : color.label;
}

function formatProfileSelectLabel(profile: { label: string; commercialName?: string }): string {
  return profile.commercialName ? `${profile.commercialName} - ${profile.label}` : profile.label;
}

function formatInputStrategy(strategy: string): string {
  if (strategy === 'auto-fit') {
    return 'auto fit';
  }

  if (strategy === 'fixed-anchor') {
    return 'fixed anchor';
  }

  return 'seed';
}
