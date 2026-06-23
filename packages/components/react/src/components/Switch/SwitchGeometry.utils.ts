export const SWITCH_THUMB_SHRINK_CLASS_NAME = 'k-swt-e3b-a';
export const SWITCH_THUMB_VISUAL_CLASS_NAME = 'k-swt-x5-a';
export const SWITCH_REDUCED_THUMB_EPSILON = 0.5;
const SWITCH_FOCUS_RING_EXPANSION_PROPERTY = '--k-swt-frx';

export type SwitchTrackContentSize = {
  height: number;
  width: number;
};

export function parseSwitchPixelValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveSwitchTrackContentSize(
  trackElement: HTMLSpanElement,
  trackStyle: CSSStyleDeclaration = getComputedStyle(trackElement)
): SwitchTrackContentSize {
  const paddingInlineStart = parseSwitchPixelValue(trackStyle.paddingInlineStart);
  const paddingInlineEnd = parseSwitchPixelValue(trackStyle.paddingInlineEnd);
  const paddingBlockStart = parseSwitchPixelValue(trackStyle.paddingBlockStart);
  const paddingBlockEnd = parseSwitchPixelValue(trackStyle.paddingBlockEnd);

  return {
    width: trackElement.clientWidth - paddingInlineStart - paddingInlineEnd,
    height: trackElement.clientHeight - paddingBlockStart - paddingBlockEnd
  };
}

export function hasSwitchThumbShrinkClass(thumbElement: HTMLSpanElement): boolean {
  return thumbElement.classList.contains(SWITCH_THUMB_SHRINK_CLASS_NAME);
}

export function resolveSwitchThumbVisualElement(
  thumbElement: HTMLSpanElement
): HTMLSpanElement | null {
  return thumbElement.querySelector<HTMLSpanElement>(`.${SWITCH_THUMB_VISUAL_CLASS_NAME}`);
}

export function isSwitchReducedThumbSize({
  height,
  trackContentHeight,
  width
}: {
  height?: number;
  trackContentHeight: number;
  width: number;
}): boolean {
  return (
    trackContentHeight > 0 &&
    (width < trackContentHeight - SWITCH_REDUCED_THUMB_EPSILON ||
      (height !== undefined && height < trackContentHeight - SWITCH_REDUCED_THUMB_EPSILON))
  );
}

export function calculateSwitchFocusOffsetExtra(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement
): number {
  const trackHeight = trackElement.offsetHeight;
  const thumbHeight = thumbElement.offsetHeight;
  if (trackHeight <= 0 || thumbHeight <= 0) return 0;

  return Math.max(0, (thumbHeight - trackHeight) / 2);
}

export function applySwitchFocusOffsetExtra(
  trackElement: HTMLSpanElement,
  offsetExtra: number
): void {
  trackElement.style.setProperty(SWITCH_FOCUS_RING_EXPANSION_PROPERTY, `${offsetExtra}px`);
}

export function clearSwitchFocusOffsetExtra(trackElement: HTMLSpanElement): void {
  trackElement.style.removeProperty(SWITCH_FOCUS_RING_EXPANSION_PROPERTY);
}
