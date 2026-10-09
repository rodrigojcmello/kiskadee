'use client';

import { forwardRef, type HTMLAttributes, useRef } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';
import { useVisualMotion } from '../../shared/visual-motion/visualMotion.loader.ts';
import type { VisualMotionTiming } from '../../shared/visual-motion/visualMotion.types.ts';
import './Rotate.structural.scss';

export type RotateProps = HTMLAttributes<HTMLElement> &
  VisualMotionTiming & {
    angle: number;
    motion?: boolean;
    as?: 'span' | 'div';
  };
export const Rotate = forwardRef<HTMLElement, RotateProps>(function Rotate(
  { as = 'span', angle, durationMs, easing, motion = true, className, style, children, ...props },
  ref
) {
  const element = useRef<HTMLElement>(null);
  const initialAngle = useRef(angle);
  const previousAngle = useRef(angle);
  const module = useVisualMotion(motion);
  const Element = as;
  useIsomorphicLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const changed = previousAngle.current !== angle;
    previousAngle.current = angle;
    if (!changed || !module || !motion || durationMs <= 0) {
      node.style.transform = `rotate(${angle}deg)`;
      return;
    }
    return module.rotate(node, angle, { durationMs, easing });
  }, [angle, module, motion, durationMs, easing]);
  return (
    <Element
      {...props}
      className={joinClassNames('k-rot', className)}
      style={{ ...style, transform: `rotate(${initialAngle.current}deg)` }}
      ref={(node) => {
        element.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
    >
      {children}
    </Element>
  );
});
