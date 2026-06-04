import './SwitchV2ControlText.structural.css';
import {
  breakpoints,
  type ComponentEmphasis,
  type SwitchControlTextVisibility,
  type SwitchIntent
} from '@kiskadee/core';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { type ReactNode, useCallback, useSyncExternalStore } from 'react';
import { elem, join } from '../../../Switch/Switch.class-names.ts';
import type {
  SwitchClassesMap,
  SwitchClassNames,
  SwitchControlText
} from '../../../Switch/Switch.types.ts';

type SwitchV2ControlTextFeatureConfig = {
  controlText: SwitchControlText | undefined;
  visibility: SwitchControlTextVisibility;
};

export type SwitchV2ControlTextFeatureOptions = {
  elements: SwitchClassesMap;
  classNames: SwitchClassNames;
  scale: string;
  intent: SwitchIntent;
  emphasis: ComponentEmphasis;
};

export type SwitchV2ControlTextFeatureResult = {
  classNamePatch: SwitchClassNames;
};

type SwitchV2ControlSideProps = {
  children: ReactNode;
  controlText: SwitchControlText | undefined;
  shouldRenderControlText: boolean;
};

const SWITCH_V2_CONTROL_SIDE_CLASS_NAME = 'k-sw2-x2-a';
const SWITCH_V2_CONTROL_TEXT_OFF_CLASS_NAME = 'k-sw2-x3-a';
const SWITCH_V2_CONTROL_TEXT_ON_CLASS_NAME = 'k-sw2-x4-a';
const SWITCH_V2_CONTROL_VISUAL_CLASS_NAME = 'k-sw2-x6-a';
const SWITCH_V2_CONTROL_TEXT_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;

function subscribeToLargeControlTextViewport(
  enabled: boolean,
  onStoreChange: () => void
): () => void {
  if (!enabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(SWITCH_V2_CONTROL_TEXT_LARGE_QUERY);
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
    window.matchMedia(SWITCH_V2_CONTROL_TEXT_LARGE_QUERY).matches
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

export function useSwitchV2ControlTextFeature({
  controlText,
  visibility
}: SwitchV2ControlTextFeatureConfig): boolean {
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

export function resolveSwitchV2ControlTextFeature(
  options: SwitchV2ControlTextFeatureOptions
): SwitchV2ControlTextFeatureResult {
  return {
    classNamePatch: {
      e5:
        join('k-sw2-e5-a', elem(options.elements.e5, options), 'k-trn', options.classNames.e5) ??
        ''
    }
  };
}

export function SwitchV2ControlSide({
  children,
  controlText,
  shouldRenderControlText
}: SwitchV2ControlSideProps) {
  return (
    <span className={SWITCH_V2_CONTROL_SIDE_CLASS_NAME}>
      {shouldRenderControlText && controlText ? (
        <HeadlessSwitch.State>
          <span className={SWITCH_V2_CONTROL_TEXT_OFF_CLASS_NAME}>{controlText.off}</span>
          <span className={SWITCH_V2_CONTROL_TEXT_ON_CLASS_NAME}>{controlText.on}</span>
        </HeadlessSwitch.State>
      ) : null}
      <span className={SWITCH_V2_CONTROL_VISUAL_CLASS_NAME}>{children}</span>
    </span>
  );
}
