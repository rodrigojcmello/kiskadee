import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import './SmoothText.scss';

interface SmoothTextProps {
  children: ReactNode;
  triggerKey?: string;
  duration?: number;
}

export function SmoothText({ children, triggerKey, duration = 600 }: SmoothTextProps) {
  const [current, setCurrent] = useState(children);
  const [previous, setPrevious] = useState<ReactNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const lastTriggerKeyRef = useRef(triggerKey);
  const lastChildrenRef = useRef(children);

  useEffect(() => {
    const hasTriggerChanged = triggerKey !== lastTriggerKeyRef.current;
    const hasChildrenChanged = children !== lastChildrenRef.current;

    // Only trigger animation if we have a previous value (not initial mount)
    // But wait, we initialized current with children.
    // If this runs on update:

    if (hasTriggerChanged || hasChildrenChanged) {
      setPrevious(current);
      setCurrent(children);
      setIsAnimating(true);

      lastTriggerKeyRef.current = triggerKey;
      lastChildrenRef.current = children;

      const timer = setTimeout(() => {
        setPrevious(null);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [triggerKey, children, current, duration]); // current is dependency because we setPrevious(current)

  const style = {
    '--k-smooth-text-duration': `${duration}ms`
  } as CSSProperties;

  return (
    <span className="k-smooth-text" style={style}>
      {previous && (
        <span className="k-smooth-text__item k-smooth-text__exiting" aria-hidden="true">
          {previous}
        </span>
      )}
      <span className={`k-smooth-text__item ${isAnimating ? 'k-smooth-text__entering' : ''}`}>
        {current}
      </span>
    </span>
  );
}
