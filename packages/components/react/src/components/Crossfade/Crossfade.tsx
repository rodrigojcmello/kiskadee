'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useRef, useState } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';
import { useVisualMotion } from '../../shared/visual-motion/visualMotion.loader.ts';
import type { VisualMotionTiming } from '../../shared/visual-motion/visualMotion.types.ts';
import './Crossfade.structural.scss';

export type CrossfadeProps = HTMLAttributes<HTMLElement> &
  VisualMotionTiming & {
    /** Changes only when a visual replacement is intended. */
    transitionKey: string | number;
    motion?: boolean;
    as?: 'span' | 'div';
  };
type Snapshot = { key: string | number; content: ReactNode };
export const Crossfade = forwardRef<HTMLElement, CrossfadeProps>(function Crossfade(
  { as = 'span', children, transitionKey, durationMs, easing, motion = true, className, ...props },
  ref
) {
  const module = useVisualMotion(motion);
  const Element = as;
  const [state, setState] = useState<{ current: Snapshot; previous: Snapshot | null }>({
    current: { key: transitionKey, content: children },
    previous: null
  });
  if (state.current.key !== transitionKey) {
    setState({ current: { key: transitionKey, content: children }, previous: state.current });
  } else if (state.current.content !== children) {
    setState({ ...state, current: { key: transitionKey, content: children } });
  }
  const current = useRef<HTMLElement>(null);
  const previous = useRef<HTMLElement>(null);
  const lastKey = useRef(transitionKey);
  useIsomorphicLayoutEffect(() => {
    const changed = lastKey.current !== transitionKey;
    lastKey.current = transitionKey;
    const incoming = current.current;
    const outgoing = previous.current;
    const finish = () =>
      setState((value) =>
        value.current.key === transitionKey && value.previous ? { ...value, previous: null } : value
      );
    if (!incoming) return;
    if (!changed || !module || !motion || durationMs <= 0 || !outgoing) {
      incoming.style.opacity = '1';
      if (outgoing) finish();
      return;
    }
    return module.crossfade(incoming, outgoing, { durationMs, easing }, finish);
  }, [transitionKey, module, motion, durationMs, easing]);
  return (
    <Element
      {...props}
      ref={(node) => {
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      className={joinClassNames('k-cfd', className)}
    >
      {state.previous && (
        <Element
          key={state.previous.key}
          ref={(node) => {
            previous.current = node;
          }}
          className="k-cfd-x1"
          aria-hidden="true"
          inert
        >
          {state.previous.content}
        </Element>
      )}
      <Element
        key={state.current.key}
        ref={(node) => {
          current.current = node;
        }}
        className="k-cfd-x1"
      >
        {state.current.content}
      </Element>
    </Element>
  );
});
