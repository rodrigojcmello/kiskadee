import './SmoothText.css';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface SmoothTextProps {
  children: ReactNode;
  fontName?: string;
  /**
   * Controls the horizontal alignment of the text within its container.
   * Useful for animating alignment changes (e.g., center -> left) when switching themes/presets.
   * When provided, the component takes full width (100%).
   */
  align?: 'left' | 'center';
  /** Transition speed for text swaps. */
  speed?: 'fast' | 'slow';
}

const ANIMATION_DURATION_BY_SPEED = {
  fast: 240,
  slow: 480
} as const;

export function SmoothText({ children, fontName, align, speed = 'slow' }: SmoothTextProps) {
  const [current, setCurrent] = useState(children);
  const [previous, setPrevious] = useState<ReactNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const lastTriggerKeyRef = useRef(fontName);
  const lastChildrenRef = useRef(children);

  useEffect(() => {
    const hasTriggerChanged = fontName !== lastTriggerKeyRef.current;
    const hasChildrenChanged = children !== lastChildrenRef.current;

    if (hasTriggerChanged || hasChildrenChanged) {
      setPrevious(current);
      setCurrent(children);
      setIsAnimating(true);

      lastTriggerKeyRef.current = fontName;
      lastChildrenRef.current = children;

      const timer = setTimeout(() => {
        setPrevious(null);
        setIsAnimating(false);
      }, ANIMATION_DURATION_BY_SPEED[speed]);
      return () => clearTimeout(timer);
    }
  }, [fontName, children, speed]);

  return (
    <span className="k-smooth-text" data-align={align} data-speed={speed}>
      {previous && (
        <span className="k-smooth-text-item k-smooth-text-exiting" aria-hidden="true">
          {previous}
        </span>
      )}
      <span className={`k-smooth-text-item ${isAnimating ? 'k-smooth-text-entering' : ''}`}>
        {current}
      </span>
    </span>
  );
}
