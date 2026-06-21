import {
  hasSwitchThumbShrinkClass,
  isSwitchReducedThumbSize,
  parseSwitchPixelValue,
  resolveSwitchTrackContentSize
} from '../.././SwitchGeometry.utils.ts';

export type SwitchRuntimeMotionGeometry = {
  translation: number;
  inlineStart: number;
  blockStart: number;
};

export type SwitchRuntimeMotionGeometryResult = SwitchRuntimeMotionGeometry & {
  isReducedThumb: boolean;
};

export type SwitchRuntimeMotionGeometryOptions = {
  alignReducedThumb?: boolean;
  preserveReducedThumbAlignment?: boolean;
};

export function calculateSwitchRuntimeMotionGeometry(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement,
  options: SwitchRuntimeMotionGeometryOptions = {}
): SwitchRuntimeMotionGeometryResult {
  const trackStyles = getComputedStyle(trackElement);
  const trackContentSize = resolveSwitchTrackContentSize(trackElement, trackStyles);
  const thumbWidth = thumbElement.offsetWidth;
  const thumbHeight = thumbElement.offsetHeight;
  const usesThumbShrink = hasSwitchThumbShrinkClass(thumbElement);
  const isReducedThumb = isSwitchReducedThumbSize({
    trackContentHeight: trackContentSize.height,
    width: thumbWidth
  });
  const shouldAlignReducedThumb =
    options.alignReducedThumb ??
    (usesThumbShrink || (options.preserveReducedThumbAlignment === true && isReducedThumb));
  const alignmentBoxWidth =
    shouldAlignReducedThumb ? Math.max(thumbWidth, trackContentSize.height) : thumbWidth;
  const translation = Math.max(0, trackContentSize.width - alignmentBoxWidth);
  const inlineStart =
    parseSwitchPixelValue(trackStyles.paddingInlineStart) +
    Math.max(0, (alignmentBoxWidth - thumbWidth) / 2);
  const blockStart =
    parseSwitchPixelValue(trackStyles.paddingBlockStart) +
    (trackContentSize.height - thumbHeight) / 2;

  return {
    translation,
    inlineStart,
    blockStart,
    isReducedThumb
  };
}

export function applySwitchRuntimeMotionGeometry(
  trackElement: HTMLSpanElement,
  geometry: SwitchRuntimeMotionGeometry
): void {
  const scopeElement = trackElement.parentElement ?? trackElement;

  trackElement.style.setProperty('--k-swt-tx', `${geometry.translation}px`);
  trackElement.style.setProperty('--k-swt-ti', `${geometry.inlineStart}px`);
  trackElement.style.setProperty('--k-swt-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-swt-tx', `${geometry.translation}px`);
  scopeElement.style.setProperty('--k-swt-ti', `${geometry.inlineStart}px`);
  scopeElement.style.setProperty('--k-swt-ty', `${geometry.blockStart}px`);
}

export function clearSwitchRuntimeMotionGeometry(trackElement: HTMLSpanElement): void {
  trackElement.style.removeProperty('--k-swt-tx');
  trackElement.style.removeProperty('--k-swt-ti');
  trackElement.style.removeProperty('--k-swt-ty');
  trackElement.parentElement?.style.removeProperty('--k-swt-tx');
  trackElement.parentElement?.style.removeProperty('--k-swt-ti');
  trackElement.parentElement?.style.removeProperty('--k-swt-ty');
}
