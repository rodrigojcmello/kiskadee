import type { ReactNode } from 'react';
import type { IndicatorRect } from './Tabs.measurements';
import type { TabsSpringConfig, TabsSpringPreset } from './Tabs.types';

export type TabsMotionEngineProps = {
  children?: ReactNode;
};

/**
 * What
 *     Resolves the final spring configuration from a preset name or a custom spring object.
 * Why
 *     Motion renderers need one normalized spring config before handing transitions to the
 *     animation library.
 */
export function resolveSpringConfig(
  spring: TabsSpringPreset | TabsSpringConfig | undefined
): TabsSpringConfig {
  if (!spring || spring === 'snappy') {
    return { stiffness: 520, damping: 40, mass: 0.9 };
  }

  if (spring === 'gentle') {
    return { stiffness: 320, damping: 34, mass: 0.95 };
  }

  if (spring === 'debugSlow') {
    return { stiffness: 70, damping: 22, mass: 2.4 };
  }

  return spring;
}

/**
 * What
 *     Builds the temporary stretched rectangle used during stretch-style indicator motion.
 * Why
 *     Line and box indicators share the same overshoot geometry, so this avoids duplicating
 *     that transition math in each motion renderer.
 */
export function resolveStretchIndicatorRect(options: {
  originRect: IndicatorRect;
  finalRect: IndicatorRect;
}): IndicatorRect {
  const { originRect, finalRect } = options;
  const originRight = originRect.x + originRect.width;
  const finalRight = finalRect.x + finalRect.width;
  const movingRight = finalRect.x >= originRect.x;

  if (movingRight) {
    const width = Math.min(finalRight - originRect.x, 400);
    return {
      x: finalRight - width,
      y: finalRect.y,
      width,
      height: finalRect.height
    };
  }

  const width = Math.min(originRight - finalRect.x, 400);
  return {
    x: finalRect.x,
    y: finalRect.y,
    width,
    height: finalRect.height
  };
}
