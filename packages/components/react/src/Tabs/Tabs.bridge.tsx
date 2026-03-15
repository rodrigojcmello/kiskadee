import {
  type CSSProperties,
  type ElementType,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { IndicatorRect } from './Tabs.common';

type BridgeIndicatorMetrics = {
  borderColor: string;
  borderWidth: number;
  curveWidth: number;
  fillColor: string;
  radius: number;
};

type BridgeIndicatorShape = {
  fillPath: string;
  strokePath: string;
  viewHeight: number;
  viewWidth: number;
  wrapperStyle: CSSProperties;
  capStyle: CSSProperties;
  leftWallExtensionStyle: CSSProperties | null;
  rightWallExtensionStyle: CSSProperties | null;
};

type BridgeIndicatorProps = {
  as?: ElementType;
  animate?: boolean;
  barRef: RefObject<HTMLDivElement | null>;
  className?: string;
  indicatorRect: IndicatorRect;
  onAnimationComplete?: () => void;
  probeClassName?: string;
  selected: string | undefined;
  style?: CSSProperties;
  transition?: Record<string, unknown>;
  trimOuterCurves: boolean;
};

const DEFAULT_BRIDGE_METRICS: BridgeIndicatorMetrics = {
  borderColor: 'rgba(0, 0, 0, 0.18)',
  borderWidth: 1,
  curveWidth: 24,
  fillColor: '#fff',
  radius: 22
};

function clampBorderWidth(value: number): number {
  return Math.min(6, Math.max(1, Math.round(value)));
}

function parsePx(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveBridgeEdgeState(options: {
  barElement: HTMLDivElement | null;
  selected: string | undefined;
  trimOuterCurves: boolean;
}): {
  hasEndCurve: boolean;
  hasStartCurve: boolean;
} {
  const { barElement, selected, trimOuterCurves } = options;
  if (!trimOuterCurves || !barElement || !selected) {
    return { hasStartCurve: true, hasEndCurve: true };
  }

  const tabs = Array.from(barElement.querySelectorAll<HTMLElement>('[role="tab"]'));
  if (tabs.length === 0) {
    return { hasStartCurve: true, hasEndCurve: true };
  }

  const selectedIndex = tabs.findIndex((tab) => tab.getAttribute('data-tab-value') === selected);
  if (selectedIndex === -1) {
    return { hasStartCurve: true, hasEndCurve: true };
  }

  return {
    hasStartCurve: selectedIndex > 0,
    hasEndCurve: selectedIndex < tabs.length - 1
  };
}

function buildBridgeIndicatorShape(args: {
  borderWidth: number;
  curveWidth: number;
  hasEndCurve: boolean;
  hasStartCurve: boolean;
  indicatorRect: IndicatorRect;
  radius: number;
}): BridgeIndicatorShape {
  const { borderWidth, curveWidth, hasEndCurve, hasStartCurve, indicatorRect, radius } = args;
  const strokeWidth = clampBorderWidth(borderWidth);
  const topBleed = Math.max(2, strokeWidth * 2);
  const roundedX = Math.round(indicatorRect.x);
  const roundedY = Math.round(indicatorRect.y);
  const roundedBodyWidth = Math.round(indicatorRect.width);
  const roundedHeight = Math.round(indicatorRect.height) + 1;
  const top = topBleed + strokeWidth / 2;
  const bottom = topBleed + roundedHeight - strokeWidth / 2;
  const shoulderWidth = Math.max(strokeWidth * 2, Math.round(curveWidth));
  const leftInset = hasStartCurve ? shoulderWidth : 0;
  const rightInset = hasEndCurve ? shoulderWidth : 0;
  const viewWidth = roundedBodyWidth + leftInset + rightInset;
  const leftWall = leftInset;
  const rightWall = leftInset + roundedBodyWidth;
  const safeRadius = Math.min(
    radius,
    Math.max(0, roundedBodyWidth / 2 - 10),
    Math.max(0, roundedHeight - 12)
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
    wrapperStyle: {
      left: `${roundedX - leftInset}px`,
      top: `${roundedY + roundedHeight - viewHeight}px`,
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
    },
    leftWallExtensionStyle: hasStartCurve
      ? null
      : {
          left: `${leftWall - strokeWidth}px`,
          top: `${wallExtensionTop}px`,
          height: `${wallExtensionHeight}px`
        },
    rightWallExtensionStyle: hasEndCurve
      ? null
      : {
          left: `${rightWall}px`,
          top: `${wallExtensionTop}px`,
          height: `${wallExtensionHeight}px`
        }
  };
}

export function TabsBridgeIndicator({
  as,
  animate,
  barRef,
  className,
  indicatorRect,
  onAnimationComplete,
  probeClassName,
  selected,
  style,
  transition,
  trimOuterCurves
}: BridgeIndicatorProps) {
  const probeRef = useRef<HTMLSpanElement | null>(null);
  const [metrics, setMetrics] = useState<BridgeIndicatorMetrics>(DEFAULT_BRIDGE_METRICS);
  const Component = (as ?? 'div') as ElementType;

  useLayoutEffect(() => {
    const probeElement = probeRef.current;
    const barElement = barRef.current;
    if (!probeElement || !barElement) {
      return;
    }

    const probeStyles = window.getComputedStyle(probeElement);
    const barStyles = window.getComputedStyle(barElement);
    const nextMetrics: BridgeIndicatorMetrics = {
      borderColor:
        barStyles.borderBottomColor || barStyles.borderColor || DEFAULT_BRIDGE_METRICS.borderColor,
      borderWidth: clampBorderWidth(
        parsePx(probeStyles.getPropertyValue('--k-bw'), DEFAULT_BRIDGE_METRICS.borderWidth)
      ),
      curveWidth: Math.max(
        8,
        Math.round(parsePx(probeStyles.getPropertyValue('--k-tab-cw'), DEFAULT_BRIDGE_METRICS.curveWidth))
      ),
      fillColor: probeStyles.backgroundColor || DEFAULT_BRIDGE_METRICS.fillColor,
      radius: Math.max(0, Math.round(parsePx(probeStyles.getPropertyValue('--k-br'), DEFAULT_BRIDGE_METRICS.radius)))
    };

    setMetrics((previous) =>
      previous.borderColor === nextMetrics.borderColor &&
      previous.borderWidth === nextMetrics.borderWidth &&
      previous.curveWidth === nextMetrics.curveWidth &&
      previous.fillColor === nextMetrics.fillColor &&
      previous.radius === nextMetrics.radius
        ? previous
        : nextMetrics
    );
  }, [barRef, indicatorRect.height, indicatorRect.width, probeClassName, selected, trimOuterCurves]);

  const edgeState = useMemo(
    () =>
      resolveBridgeEdgeState({
        barElement: barRef.current,
        selected,
        trimOuterCurves
      }),
    [barRef, selected, trimOuterCurves]
  );
  const shape = useMemo(
    () =>
      buildBridgeIndicatorShape({
        borderWidth: metrics.borderWidth,
        curveWidth: metrics.curveWidth,
        hasEndCurve: edgeState.hasEndCurve,
        hasStartCurve: edgeState.hasStartCurve,
        indicatorRect,
        radius: metrics.radius
      }),
    [edgeState.hasEndCurve, edgeState.hasStartCurve, indicatorRect, metrics]
  );
  const animatedWrapperStyle = animate ? shape.wrapperStyle : undefined;
  const wrapperStyle = animate ? style : { ...shape.wrapperStyle, ...style };

  return (
    <Component
      aria-hidden="true"
      animate={animatedWrapperStyle}
      className={className}
      initial={false}
      onAnimationComplete={onAnimationComplete}
      style={{
        ...wrapperStyle,
        ['--k-tab-bridge-border-width' as const]: `${metrics.borderWidth}px`
      }}
      transition={transition}
    >
      <span ref={probeRef} className={probeClassName ? `${probeClassName} k-tab-e5v` : 'k-tab-e5 k-tab-e5v'} />
      <svg
        className="k-tab-e5n"
        viewBox={`0 0 ${shape.viewWidth} ${shape.viewHeight}`}
        preserveAspectRatio="none"
      >
        <path className="k-tab-e5o" d={shape.fillPath} style={{ fill: metrics.fillColor }} />
        {shape.strokePath ? (
          <path
            className="k-tab-e5r"
            d={shape.strokePath}
            style={{ stroke: metrics.borderColor, strokeWidth: metrics.borderWidth }}
          />
        ) : null}
      </svg>
      <div
        className="k-tab-e5p"
        style={{
          ...shape.capStyle,
          backgroundColor: metrics.fillColor,
          borderTop: `${metrics.borderWidth}px solid ${metrics.borderColor}`,
          borderLeft: `${metrics.borderWidth}px solid ${metrics.borderColor}`,
          borderRight: `${metrics.borderWidth}px solid ${metrics.borderColor}`
        }}
      />
      {shape.leftWallExtensionStyle ? (
        <div
          className="k-tab-e5q"
          style={{
            ...shape.leftWallExtensionStyle,
            backgroundColor: metrics.borderColor
          }}
        />
      ) : null}
      {shape.rightWallExtensionStyle ? (
        <div
          className="k-tab-e5q"
          style={{
            ...shape.rightWallExtensionStyle,
            backgroundColor: metrics.borderColor
          }}
        />
      ) : null}
    </Component>
  );
}

export default TabsBridgeIndicator;
