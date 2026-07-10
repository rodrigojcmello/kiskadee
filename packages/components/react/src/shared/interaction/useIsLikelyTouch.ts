import { breakpoints } from '@kiskadee/core';
import { useCallback, useSyncExternalStore } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';

const LIKELY_TOUCH_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

function getPlatformLikelyTouch(): boolean | undefined {
  if (typeof navigator === 'undefined') return undefined;

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  if (/android/i.test(userAgent)) return true;
  if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
  if (platform === 'MacIntel' && maxTouchPoints > 1) return true;

  return undefined;
}

function getViewportLikelyTouch(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;

  return !window.matchMedia(LIKELY_TOUCH_LARGE_QUERY).matches;
}

function getLikelyTouchSnapshot(): boolean {
  return getPlatformLikelyTouch() ?? getViewportLikelyTouch();
}

function subscribeToLikelyTouch(onStoreChange: () => void): () => void {
  if (
    getPlatformLikelyTouch() === true ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(LIKELY_TOUCH_LARGE_QUERY) as LegacyMediaQueryList;

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

function getLikelyTouchServerSnapshot(): boolean {
  return false;
}

export function useIsLikelyTouch(): boolean {
  const { interactionEnvironment } = useKiskadee();
  const subscribe = useCallback(subscribeToLikelyTouch, []);
  const isLikelyTouch = useSyncExternalStore(
    subscribe,
    getLikelyTouchSnapshot,
    getLikelyTouchServerSnapshot
  );

  return interactionEnvironment?.isLikelyTouch ?? isLikelyTouch;
}
