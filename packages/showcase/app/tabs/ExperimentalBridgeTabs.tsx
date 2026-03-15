'use client';

import type { CSSProperties, KeyboardEvent } from 'react';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './ExperimentalBridgeTabs.module.scss';

type ExperimentalTabItem = {
  value: string;
  label: string;
  description: string;
  eyebrow: string;
};

type RadiusPreset = {
  value: 'tight' | 'balanced' | 'relaxed';
  label: string;
  radius: number;
  curve: number;
};

type IndicatorMetrics = {
  x: number;
  width: number;
  height: number;
};

const tabs: ExperimentalTabItem[] = [
  {
    value: 'basic',
    label: 'Basic',
    eyebrow: 'Essentials',
    description:
      'Base plan with the attached tab shape. This keeps the active tab visually fused to the rail while preserving a clean inactive state.'
  },
  {
    value: 'integrations',
    label: 'Integrations',
    eyebrow: 'Connected',
    description:
      'Used here to validate a wider label and confirm that the side curves still hold when the active tab grows horizontally.'
  },
  {
    value: 'team',
    label: 'Team',
    eyebrow: 'Collaboration',
    description:
      'Middle selection is the critical case for this concept because both curve joints need to connect back into the shared bottom rail.'
  },
  {
    value: 'billing',
    label: 'Billing',
    eyebrow: 'Operations',
    description:
      'This tab helps verify that shorter labels still look intentional and do not collapse the shoulder curve into a cramped corner.'
  },
  {
    value: 'advanced',
    label: 'Advanced',
    eyebrow: 'Power users',
    description:
      'Last-item selection is useful to check the right-side attachment and make sure the silhouette stays stable near the container edge.'
  }
];

const radiusPresets: RadiusPreset[] = [
  { value: 'tight', label: 'Tight', radius: 16, curve: 18 },
  { value: 'balanced', label: 'Balanced', radius: 22, curve: 24 },
  { value: 'relaxed', label: 'Relaxed', radius: 28, curve: 30 }
];

function buildBridgeIndicatorShape(args: {
  bodyWidth: number;
  height: number;
  radius: number;
  curve: number;
  offsetX: number;
  strokeWidth: number;
  hasStartCurve: boolean;
  hasEndCurve: boolean;
}) {
  const { bodyWidth, height, radius, curve, offsetX, strokeWidth, hasStartCurve, hasEndCurve } =
    args;
  const topBleed = Math.max(2, strokeWidth * 2);
  const top = topBleed + strokeWidth / 2;
  const bottom = topBleed + height - strokeWidth / 2;
  const shoulderWidth = Math.round(curve);
  const roundedOffsetX = Math.round(offsetX);
  const roundedBodyWidth = Math.round(bodyWidth);
  const roundedHeight = Math.round(height);
  const leftInset = hasStartCurve ? shoulderWidth : 0;
  const rightInset = hasEndCurve ? shoulderWidth : 0;
  const viewWidth = roundedBodyWidth + leftInset + rightInset;
  const leftWall = leftInset;
  const rightWall = leftInset + roundedBodyWidth;
  const safeRadius = Math.min(
    radius,
    Math.max(12, roundedBodyWidth / 2 - 10),
    Math.max(12, roundedHeight - 12)
  );
  const capRadius = safeRadius;
  const shoulderLift = Math.min(
    Math.max(safeRadius * 1.12, shoulderWidth * 0.8),
    roundedHeight * 0.42
  );
  const shoulderY = Math.max(top + capRadius + 5, bottom - shoulderLift);
  const leftControlX = leftInset * 0.42;
  const rightControlX = viewWidth - rightInset * 0.42;
  const controlY = shoulderY + shoulderWidth * 0.6;
  const viewHeight = roundedHeight + topBleed;
  const capTop = Math.round(top);
  const capHeight = Math.max(0, Math.round(shoulderY - top));
  const leftStrokeWall = leftWall - strokeWidth / 2;
  const rightStrokeWall = rightWall + strokeWidth / 2;
  const wallExtensionTop = Math.round(shoulderY);
  const wallExtensionHeight = Math.max(0, Math.round(bottom - shoulderY));

  const fillPathParts = [`M 0 ${bottom}`];

  if (hasStartCurve) {
    fillPathParts.push(
      `C ${leftControlX} ${bottom}, ${leftWall} ${controlY}, ${leftWall} ${shoulderY}`
    );
  } else {
    fillPathParts.push(`L ${leftWall} ${shoulderY}`);
  }

  fillPathParts.push(
    `L ${leftWall} ${top + capRadius}`,
    `A ${capRadius} ${capRadius} 0 0 1 ${leftWall + capRadius} ${top}`,
    `L ${rightWall - capRadius} ${top}`,
    `A ${capRadius} ${capRadius} 0 0 1 ${rightWall} ${top + capRadius}`
  );

  if (hasEndCurve) {
    fillPathParts.push(
      `L ${rightWall} ${shoulderY}`,
      `C ${rightWall} ${controlY}, ${rightControlX} ${bottom}, ${viewWidth} ${bottom}`
    );
  } else {
    fillPathParts.push(`L ${rightWall} ${shoulderY}`, `L ${viewWidth} ${bottom}`);
  }

  fillPathParts.push(`L ${viewWidth} ${viewHeight}`, `L 0 ${viewHeight}`, 'Z');

  const strokePathParts: string[] = [];

  if (hasStartCurve) {
    strokePathParts.push(
      `M 0 ${bottom}`,
      `C ${leftControlX} ${bottom}, ${leftStrokeWall} ${controlY}, ${leftStrokeWall} ${shoulderY}`
    );
  }

  if (hasEndCurve) {
    strokePathParts.push(
      `M ${rightStrokeWall} ${shoulderY}`,
      `C ${rightStrokeWall} ${controlY}, ${rightControlX} ${bottom}, ${viewWidth} ${bottom}`
    );
  }

  return {
    viewWidth,
    viewHeight,
    fillPath: fillPathParts.join(' '),
    strokePath: strokePathParts.join(' '),
    style: {
      left: `${roundedOffsetX - leftInset}px`,
      width: `${viewWidth}px`,
      height: `${viewHeight}px`
    },
    capStyle: {
      left: `${leftWall - strokeWidth}px`,
      top: `${capTop}px`,
      width: `${roundedBodyWidth + strokeWidth * 2}px`,
      height: `${capHeight}px`,
      borderTopLeftRadius: `${Math.round(capRadius)}px`,
      borderTopRightRadius: `${Math.round(capRadius)}px`
    } satisfies CSSProperties,
    leftWallExtensionStyle: hasStartCurve
      ? null
      : ({
          left: `${leftWall - strokeWidth}px`,
          top: `${wallExtensionTop}px`,
          height: `${wallExtensionHeight}px`
        } satisfies CSSProperties),
    rightWallExtensionStyle: hasEndCurve
      ? null
      : ({
          left: `${rightWall}px`,
          top: `${wallExtensionTop}px`,
          height: `${wallExtensionHeight}px`
        } satisfies CSSProperties),
    hasStartCurve,
    hasEndCurve
  };
}

export function ExperimentalBridgeTabs() {
  const [selected, setSelected] = useState<ExperimentalTabItem['value']>('basic');
  const [radiusPreset, setRadiusPreset] = useState<RadiusPreset['value']>('balanced');
  const [lineWidth, setLineWidth] = useState(1);
  const [trimOuterCurves, setTrimOuterCurves] = useState(false);
  const [indicatorMetrics, setIndicatorMetrics] = useState<IndicatorMetrics | null>(null);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const selectedIndex = useMemo(() => tabs.findIndex((tab) => tab.value === selected), [selected]);
  const selectedTab = useMemo(
    () => tabs.find((tab) => tab.value === selected) ?? tabs[0],
    [selected]
  );
  const preset = useMemo(
    () => radiusPresets.find((item) => item.value === radiusPreset) ?? radiusPresets[1],
    [radiusPreset]
  );
  const hasStartCurve = !trimOuterCurves || selectedIndex > 0;
  const hasEndCurve = !trimOuterCurves || selectedIndex < tabs.length - 1;

  const rootStyle = useMemo(
    () =>
      ({
        '--bridge-curve': `${preset.curve}px`,
        '--bridge-line-width': `${lineWidth}px`
      }) as CSSProperties,
    [lineWidth, preset]
  );
  const indicatorShape = useMemo(
    () =>
      indicatorMetrics
        ? buildBridgeIndicatorShape({
            bodyWidth: indicatorMetrics.width,
            height: indicatorMetrics.height,
            radius: preset.radius,
            curve: preset.curve,
            offsetX: indicatorMetrics.x,
            strokeWidth: lineWidth,
            hasStartCurve,
            hasEndCurve
          })
        : null,
    [hasEndCurve, hasStartCurve, indicatorMetrics, lineWidth, preset]
  );

  useLayoutEffect(() => {
    const tabListElement = tabListRef.current;
    const selectedIndex = tabs.findIndex((tab) => tab.value === selected);
    const selectedTabElement = selectedIndex === -1 ? null : tabRefs.current[selectedIndex];

    if (!tabListElement || !selectedTabElement) {
      setIndicatorMetrics(null);
      return;
    }

    const updateIndicatorMetrics = () => {
      const listRect = tabListElement.getBoundingClientRect();
      const tabRect = selectedTabElement.getBoundingClientRect();

      setIndicatorMetrics({
        x: Math.round(tabRect.left - listRect.left + tabListElement.scrollLeft),
        width: Math.round(tabRect.width),
        height: Math.round(tabRect.height) + 1
      });
    };

    updateIndicatorMetrics();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateIndicatorMetrics) : null;

    resizeObserver?.observe(tabListElement);
    resizeObserver?.observe(selectedTabElement);
    window.addEventListener('resize', updateIndicatorMetrics);
    tabListElement.addEventListener('scroll', updateIndicatorMetrics, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateIndicatorMetrics);
      tabListElement.removeEventListener('scroll', updateIndicatorMetrics);
    };
  }, [selected]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    event.preventDefault();

    let nextIndex = index;

    if (event.key === 'ArrowRight') {
      nextIndex = index === tabs.length - 1 ? 0 : index + 1;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = index === 0 ? tabs.length - 1 : index - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    const nextTab = tabs[nextIndex];
    setSelected(nextTab.value);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className={styles.demo} style={rootStyle}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Experimental Tab Shape</p>
          <h3 className={styles.title}>Bridge tab</h3>
          <p className={styles.description}>
            Local showcase prototype to validate the active tab body and the curved shoulders that
            reconnect into the bottom rail. This does not use the Kiskadee tabs runtime.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.radiusControls} role="group" aria-label="Radius presets">
            {radiusPresets.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === radiusPreset ? styles.radiusChipActive : styles.radiusChip
                }
                onClick={() => setRadiusPreset(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className={styles.lineWidthControl}>
            <span className={styles.lineWidthLabel}>Bridge line</span>
            <input
              className={styles.lineWidthInput}
              type="range"
              min="1"
              max="6"
              step="1"
              value={lineWidth}
              onChange={(event) => setLineWidth(Number(event.target.value))}
            />
            <output className={styles.lineWidthValue}>{lineWidth}px</output>
          </label>

          <label className={styles.switchControl}>
            <span className={styles.switchLabel}>Trim outer curves</span>
            <span className={styles.switchField}>
              <input
                className={styles.switchInput}
                type="checkbox"
                checked={trimOuterCurves}
                onChange={(event) => setTrimOuterCurves(event.target.checked)}
              />
              <span className={styles.switchTrack} aria-hidden="true">
                <span className={styles.switchThumb} />
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.surface}>
        <div
          ref={tabListRef}
          className={styles.tablist}
          role="tablist"
          aria-label="Experimental bridge tabs"
        >
          {indicatorShape ? (
            <>
              <div className={styles.indicatorWrap} aria-hidden="true" style={indicatorShape.style}>
                <svg
                  className={styles.indicatorSvg}
                  viewBox={`0 0 ${indicatorShape.viewWidth} ${indicatorShape.viewHeight}`}
                  preserveAspectRatio="none"
                >
                  <path className={styles.indicatorFill} d={indicatorShape.fillPath} />
                  <path className={styles.indicatorStroke} d={indicatorShape.strokePath} />
                </svg>
              </div>
              <div
                className={styles.indicatorCapWrap}
                aria-hidden="true"
                style={indicatorShape.style}
              >
                <div className={styles.indicatorCapBox} style={indicatorShape.capStyle} />
                {indicatorShape.leftWallExtensionStyle ? (
                  <div
                    className={styles.indicatorWallExtension}
                    style={indicatorShape.leftWallExtensionStyle}
                  />
                ) : null}
                {indicatorShape.rightWallExtensionStyle ? (
                  <div
                    className={styles.indicatorWallExtension}
                    style={indicatorShape.rightWallExtensionStyle}
                  />
                ) : null}
              </div>
            </>
          ) : null}

          {tabs.map((tab, index) => {
            const isSelected = tab.value === selected;
            const tabId = `${baseId}-${tab.value}-tab`;
            const panelId = `${baseId}-${tab.value}-panel`;

            return (
              <button
                key={tab.value}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                className={isSelected ? styles.tabActive : styles.tab}
                onClick={() => setSelected(tab.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => {
          const isSelected = tab.value === selected;

          return (
            <div
              key={tab.value}
              id={`${baseId}-${tab.value}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-${tab.value}-tab`}
              className={styles.panel}
              hidden={!isSelected}
            >
              <p className={styles.panelEyebrow}>{tab.eyebrow}</p>
              <h4 className={styles.panelTitle}>{tab.label}</h4>
              <p className={styles.panelText}>{tab.description}</p>
              <dl className={styles.metrics}>
                <div>
                  <dt>Radius</dt>
                  <dd>{preset.radius}px</dd>
                </div>
                <div>
                  <dt>Curve</dt>
                  <dd>{preset.curve}px</dd>
                </div>
                <div>
                  <dt>Selected</dt>
                  <dd>{selectedTab.label}</dd>
                </div>
                <div>
                  <dt>Line width</dt>
                  <dd>{lineWidth}px</dd>
                </div>
                <div>
                  <dt>Outer curves</dt>
                  <dd>{trimOuterCurves ? 'Trimmed' : 'Full'}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
