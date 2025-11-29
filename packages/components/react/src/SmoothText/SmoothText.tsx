import { type ReactNode, useEffect, useRef, useState } from 'react';
import './SmoothText.scss';

interface SmoothTextProps {
  children: ReactNode;
  triggerKey?: string;
}

const ANIMATION_DURATION = 600;

export function SmoothText({ children, triggerKey }: SmoothTextProps) {
  const [current, setCurrent] = useState(children);
  const [previous, setPrevious] = useState<ReactNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const lastTriggerKeyRef = useRef(triggerKey);
  const lastChildrenRef = useRef(children);

  useEffect(() => {
    const hasTriggerChanged = triggerKey !== lastTriggerKeyRef.current;
    const hasChildrenChanged = children !== lastChildrenRef.current;

    if (hasTriggerChanged || hasChildrenChanged) {
      setPrevious(current);
      setCurrent(children);
      setIsAnimating(true);

      lastTriggerKeyRef.current = triggerKey;
      lastChildrenRef.current = children;

      const timer = setTimeout(() => {
        setPrevious(null);
        setIsAnimating(false);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [triggerKey, children, current]);

  return (
    <span className="k-smooth-text">
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
