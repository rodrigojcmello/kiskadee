import { breakpoints } from '@kiskadee/core';
import { useCallback, useSyncExternalStore } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';

const COMPACT_VIEWPORT_QUERY = `(min-width: ${breakpoints['bp:md:2']}px)`;

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

function getCompactViewportSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;

  return !window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}

function subscribeToCompactViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(COMPACT_VIEWPORT_QUERY) as LegacyMediaQueryList;

  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', onStoreChange);
    return () => {
      mediaQueryList.removeEventListener('change', onStoreChange);
    };
  }

  mediaQueryList.addListener?.(onStoreChange);
  return () => {
    mediaQueryList.removeListener?.(onStoreChange);
  };
}

function getCompactViewportServerSnapshot(): boolean {
  return false;
}

export function useIsCompactViewport(): boolean {
  const { layoutEnvironment } = useKiskadee();
  const subscribe = useCallback(subscribeToCompactViewport, []);
  const isCompactViewport = useSyncExternalStore(
    subscribe,
    getCompactViewportSnapshot,
    getCompactViewportServerSnapshot
  );

  return layoutEnvironment?.isCompactViewport ?? isCompactViewport;
}
