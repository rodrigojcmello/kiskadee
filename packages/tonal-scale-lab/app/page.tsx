'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import {
  BASE_TONE,
  type CurveControls,
  DEFAULT_CURVE_CONTROLS,
  FLUENT_BLUE_HEX,
  FLUENT_BLUE_REFERENCE_HEX_BY_TONE,
  FLUENT_BLUE_REFERENCE_SCALE,
  formatHsl,
  generateTonalScale,
  type HslColor,
  normalizeHexColor,
  rgbDistance,
  type TonalScaleColor
} from '@/src/tonal-scale';

type ControlKey = keyof CurveControls;

type RangeControl = {
  key: ControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
};

const RANGE_CONTROLS: RangeControl[] = [
  {
    key: 'darkFloorLightness',
    label: 'L10',
    min: 0,
    max: 24,
    step: 0.25,
    suffix: '%'
  },
  {
    key: 'lightCeilingLightness',
    label: 'L160',
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
    step: 0.01
  },
  {
    key: 'lightSaturationBias',
    label: 'S claro',
    min: 0.45,
    max: 1.65,
    step: 0.01
  },
  {
    key: 'hueDriftStrength',
    label: 'Deriva H',
    min: 0,
    max: 1.8,
    step: 0.01
  }
];

const CHART_WIDTH = 720;
const CHART_HEIGHT = 360;
const CHART_PADDING = 42;

export default function TonalScaleLabPage() {
  const [hexInput, setHexInput] = useState(FLUENT_BLUE_HEX);
  const [controls, setControls] = useState<CurveControls>(DEFAULT_CURVE_CONTROLS);
  const normalizedHex = normalizeHexColor(hexInput);
  const baseHex = normalizedHex ?? FLUENT_BLUE_HEX;
  const generatedScale = useMemo(() => generateTonalScale(baseHex, controls), [baseHex, controls]);
  const baseColor = generatedScale.find((entry) => entry.tone === BASE_TONE) ?? generatedScale[7];
  const meanDistance = useMemo(() => {
    const total = generatedScale.reduce(
      (sum, entry) => sum + rgbDistance(entry.hex, FLUENT_BLUE_REFERENCE_HEX_BY_TONE[entry.tone]),
      0
    );
    return total / generatedScale.length;
  }, [generatedScale]);

  const updateControl = (key: ControlKey, value: number) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Tonal scale controls">
        <div>
          <h1>Tonal Scale Lab</h1>
          <p>Fluent 2 blue reference curve</p>
        </div>
        <label className="hex-field">
          <span>Base hex</span>
          <input
            value={hexInput}
            onChange={(event) => setHexInput(event.target.value)}
            spellCheck={false}
            aria-invalid={!normalizedHex}
          />
        </label>
        <div className="base-chip" style={{ '--chip-color': baseHex } as CSSProperties}>
          <span>{baseColor.hex}</span>
          <strong>{formatHsl(baseColor.hsl)}</strong>
        </div>
      </section>

      <section className="scale-section" aria-label="Generated tonal scale">
        <div className="section-heading">
          <h2>Generated</h2>
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
            <span>S/L plane</span>
          </div>
          <CurveChart generated={generatedScale} reference={FLUENT_BLUE_REFERENCE_SCALE} />
        </div>

        <div className="controls-panel">
          <div className="section-heading">
            <h2>Curve Controls</h2>
            <button type="button" onClick={() => setControls(DEFAULT_CURVE_CONTROLS)}>
              Reset
            </button>
          </div>
          <div className="range-grid">
            {RANGE_CONTROLS.map((control) => (
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
          <h2>Fluent Reference</h2>
          <span>mean RGB delta {meanDistance.toFixed(2)}</span>
        </div>
        <ScaleStrip colors={FLUENT_BLUE_REFERENCE_SCALE} />
        <ScaleTable generated={generatedScale} />
      </section>
    </main>
  );
}

function ScaleStrip({ colors }: { colors: TonalScaleColor[] }) {
  return (
    <div className="scale-strip">
      {colors.map((color) => (
        <div className="swatch" key={color.tone} style={{ backgroundColor: color.hex }}>
          <span>{color.tone}</span>
          <strong>{color.hex}</strong>
        </div>
      ))}
    </div>
  );
}

function CurveChart({
  generated,
  reference
}: {
  generated: TonalScaleColor[];
  reference: TonalScaleColor[];
}) {
  const generatedPath = createPath(generated);
  const referencePath = createPath(reference);

  return (
    <svg className="curve-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
      <title>Generated and reference tonal scale curves</title>
      <rect width={CHART_WIDTH} height={CHART_HEIGHT} rx="8" />
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line
            x1={xForLightness(value)}
            x2={xForLightness(value)}
            y1={CHART_PADDING}
            y2={CHART_HEIGHT - CHART_PADDING}
          />
          <line
            x1={CHART_PADDING}
            x2={CHART_WIDTH - CHART_PADDING}
            y1={yForSaturation(value)}
            y2={yForSaturation(value)}
          />
          <text x={xForLightness(value)} y={CHART_HEIGHT - 14}>
            {value}
          </text>
          <text x="14" y={yForSaturation(value) + 4}>
            {value}
          </text>
        </g>
      ))}
      <text className="axis-label" x={CHART_WIDTH / 2} y={CHART_HEIGHT - 4}>
        lightness
      </text>
      <text className="axis-label" x="12" y="24">
        saturation
      </text>
      <path className="reference-path" d={referencePath} />
      <path className="generated-path" d={generatedPath} />
      {reference.map((color) => (
        <circle
          className="reference-point"
          key={`r-${color.tone}`}
          {...pointFor(color.hsl)}
          r="4"
        />
      ))}
      {generated.map((color) => (
        <g key={color.tone}>
          <circle className="generated-point" {...pointFor(color.hsl)} r="5" />
          <text
            className="point-label"
            x={pointFor(color.hsl).cx + 7}
            y={pointFor(color.hsl).cy - 7}
          >
            {color.tone}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ScaleTable({ generated }: { generated: TonalScaleColor[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>tone</th>
            <th>generated</th>
            <th>generated HSL</th>
            <th>reference</th>
            <th>RGB delta</th>
          </tr>
        </thead>
        <tbody>
          {generated.map((color) => (
            <tr key={color.tone}>
              <td>{color.tone}</td>
              <td>{color.hex}</td>
              <td>{formatHsl(color.hsl)}</td>
              <td>{FLUENT_BLUE_REFERENCE_HEX_BY_TONE[color.tone]}</td>
              <td>
                {rgbDistance(color.hex, FLUENT_BLUE_REFERENCE_HEX_BY_TONE[color.tone]).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function createPath(colors: TonalScaleColor[]): string {
  return colors
    .map((color, index) => {
      const { cx, cy } = pointFor(color.hsl);
      return `${index === 0 ? 'M' : 'L'} ${cx} ${cy}`;
    })
    .join(' ');
}

function pointFor(hsl: HslColor): { cx: number; cy: number } {
  return {
    cx: xForLightness(hsl.l),
    cy: yForSaturation(hsl.s)
  };
}

function xForLightness(lightness: number): number {
  return CHART_PADDING + (lightness / 100) * (CHART_WIDTH - CHART_PADDING * 2);
}

function yForSaturation(saturation: number): number {
  return CHART_PADDING + ((100 - saturation) / 100) * (CHART_HEIGHT - CHART_PADDING * 2);
}

function formatControlValue(value: number): string {
  return Number(value.toFixed(2)).toString();
}
