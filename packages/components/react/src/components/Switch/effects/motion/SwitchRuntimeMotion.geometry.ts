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

function parsePixelValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function calculateSwitchRuntimeMotionGeometry(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement,
  options: SwitchRuntimeMotionGeometryOptions = {}
): SwitchRuntimeMotionGeometryResult {
  const trackStyles = getComputedStyle(trackElement);
  const paddingInlineStart = parsePixelValue(trackStyles.paddingInlineStart);
  const paddingInlineEnd = parsePixelValue(trackStyles.paddingInlineEnd);
  const paddingBlockStart = parsePixelValue(trackStyles.paddingBlockStart);
  const paddingBlockEnd = parsePixelValue(trackStyles.paddingBlockEnd);
  const trackContentWidth = trackElement.clientWidth - paddingInlineStart - paddingInlineEnd;
  const trackContentHeight = trackElement.clientHeight - paddingBlockStart - paddingBlockEnd;
  const thumbWidth = thumbElement.offsetWidth;
  const thumbHeight = thumbElement.offsetHeight;
  const usesThumbShrink = thumbElement.classList.contains('k-swt-e3b-a');
  const isReducedThumb = thumbWidth < trackContentHeight - 0.5;
  const shouldAlignReducedThumb =
    options.alignReducedThumb ??
    (usesThumbShrink || (options.preserveReducedThumbAlignment === true && isReducedThumb));
  const alignmentBoxWidth =
    shouldAlignReducedThumb ? Math.max(thumbWidth, trackContentHeight) : thumbWidth;
  const translation = Math.max(0, trackContentWidth - alignmentBoxWidth);
  const inlineStart = paddingInlineStart + Math.max(0, (alignmentBoxWidth - thumbWidth) / 2);
  const blockStart = paddingBlockStart + Math.max(0, (trackContentHeight - thumbHeight) / 2);

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
