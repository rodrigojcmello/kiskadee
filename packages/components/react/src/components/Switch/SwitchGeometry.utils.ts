export const SWITCH_THUMB_SHRINK_CLASS_NAME = 'k-swt-e3b-a';
export const SWITCH_THUMB_VISUAL_CLASS_NAME = 'k-swt-x5-a';
export const SWITCH_REDUCED_THUMB_EPSILON = 0.5;

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
