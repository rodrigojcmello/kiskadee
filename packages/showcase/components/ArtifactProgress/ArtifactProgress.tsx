'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ArtifactProgress.module.css';

export type ArtifactLoad = { id: number; status: 'pending' | 'ready' | 'error' };

export function estimatedProgress(elapsed: number): number {
  if (elapsed <= 300) return (elapsed / 300) * 50;
  if (elapsed <= 5000) return 50 + 30 * (1 - (1 - (elapsed - 300) / 4700) ** 2);
  return 80 + 15 * (1 - (1 - Math.min(1, (elapsed - 5000) / 5000)) ** 2);
}

/** Decorative estimate; only the actual resource handoff can complete it. */
export function ArtifactProgress({ load }: { load: ArtifactLoad }) {
  const status = useRef(load.status);
  const [frame, setFrame] = useState({ visible: false, value: 0, fading: false });
  useEffect(() => {
    status.current = load.status;
  }, [load.status]);
  useEffect(() => {
    if (!load.id) return;
    const start = performance.now();
    let request = 0;
    let completion: { start: number; value: number } | undefined;
    setFrame({ visible: true, value: 0, fading: false });
    const tick = (now: number) => {
      const elapsed = now - start;
      if (status.current === 'error') {
        setFrame({ visible: false, value: 0, fading: false });
        return;
      }
      if (status.current === 'ready' && elapsed >= 300 && !completion)
        completion = { start: now, value: estimatedProgress(elapsed) };
      const finishElapsed = completion ? now - completion.start : 0;
      if (completion && finishElapsed >= 300) {
        setFrame({ visible: false, value: 100, fading: false });
        return;
      }
      setFrame({
        visible: true,
        value: completion
          ? completion.value + (100 - completion.value) * Math.min(1, finishElapsed / 150)
          : estimatedProgress(elapsed),
        fading: Boolean(completion && finishElapsed >= 150)
      });
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [load.id]);
  if (!frame.visible) return null;
  return (
    <div className={styles.track} aria-hidden="true" data-artifact-progress="true">
      <div
        className={styles.bar}
        style={{ transform: `scaleX(${frame.value / 100})`, opacity: frame.fading ? 0 : 1 }}
      />
    </div>
  );
}
