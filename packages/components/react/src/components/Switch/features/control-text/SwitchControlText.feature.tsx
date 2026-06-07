import './SwitchControlText.structural.scss';
import {
  breakpoints,
  type ComponentEmphasis,
  type SwitchControlTextVisibility,
  type SwitchIntent
} from '@kiskadee/core';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { type ReactNode, useCallback, useSyncExternalStore } from 'react';
import { elem, join } from '../.././Switch.class-names.ts';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchControlText
} from '../.././Switch.types.ts';

type SwitchControlTextFeatureConfig = {
  controlText: SwitchControlText | undefined;
  visibility: SwitchControlTextVisibility;
};

export type SwitchControlTextFeatureOptions = {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis;
};

export type SwitchControlTextFeatureResult = {
  classNamePatch: SwitchClassNames;
};

type SwitchControlSideProps = {
  children: ReactNode;
  controlText: SwitchControlText | undefined;
  controlState: boolean;
  shouldRenderControlText: boolean;
};

const SWITCH_CONTROL_SIDE_CLASS_NAME = 'k-swt-x2-a';
const SWITCH_CONTROL_TEXT_OFF_CLASS_NAME = 'k-swt-x3-a';
const SWITCH_CONTROL_TEXT_OFF_SELECTED_CLASS_NAME = 'k-swt-x3a-a';
const SWITCH_CONTROL_TEXT_ON_CLASS_NAME = 'k-swt-x4-a';
const SWITCH_CONTROL_TEXT_ON_SELECTED_CLASS_NAME = 'k-swt-x4a-a';
const SWITCH_CONTROL_VISUAL_CLASS_NAME = 'k-swt-x6-a';
const SWITCH_CONTROL_TEXT_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;

function subscribeToLargeControlTextViewport(
  enabled: boolean,
  onStoreChange: () => void
): () => void {
  if (!enabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange);
  };
}

function getLargeControlTextViewportSnapshot(enabled: boolean): boolean {
  return (
    enabled &&
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY).matches
  );
}

function getLargeControlTextViewportServerSnapshot(): boolean {
  return false;
}

function useLargeControlTextViewport(enabled: boolean): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToLargeControlTextViewport(enabled, onStoreChange),
    [enabled]
  );
  const getSnapshot = useCallback(() => getLargeControlTextViewportSnapshot(enabled), [enabled]);

  return useSyncExternalStore(subscribe, getSnapshot, getLargeControlTextViewportServerSnapshot);
}

export function useSwitchControlTextFeature({
  controlText,
  visibility
}: SwitchControlTextFeatureConfig): boolean {
  const hasControlText = controlText !== undefined && controlText !== null;
  const shouldObserveLargeControlTextViewport = hasControlText && visibility === 'largeOnly';
  const isLargeControlTextViewport = useLargeControlTextViewport(
    shouldObserveLargeControlTextViewport
  );

  return (
    hasControlText &&
    (visibility === 'always' || (visibility === 'largeOnly' && isLargeControlTextViewport))
  );
}

export function resolveSwitchControlTextFeature(
  options: SwitchControlTextFeatureOptions
): SwitchControlTextFeatureResult {
  return {
    classNamePatch: {
      e5:
        join('k-swt-e5-a', elem(options.elements.e5, options), 'k-trn', options.classNames.e5) ??
        ''
    }
  };
}

export function SwitchControlSide({
  children,
  controlText,
  controlState,
  shouldRenderControlText
}: SwitchControlSideProps) {
  return (
    <span className={SWITCH_CONTROL_SIDE_CLASS_NAME}>
      {shouldRenderControlText && controlText ? (
        <HeadlessSwitch.State>
          <span
            className={join(
              SWITCH_CONTROL_TEXT_OFF_CLASS_NAME,
              controlState ? SWITCH_CONTROL_TEXT_OFF_SELECTED_CLASS_NAME : ''
            )}
          >
            {controlText.off}
          </span>
          <span
            className={join(
              SWITCH_CONTROL_TEXT_ON_CLASS_NAME,
              controlState ? SWITCH_CONTROL_TEXT_ON_SELECTED_CLASS_NAME : ''
            )}
          >
            {controlText.on}
          </span>
        </HeadlessSwitch.State>
      ) : null}
      <span className={SWITCH_CONTROL_VISUAL_CLASS_NAME}>{children}</span>
    </span>
  );
}
