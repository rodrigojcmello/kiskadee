export type SwitchRuntimeMotionGeometry = {
  translation: number;
  inlineStart: number;
  blockStart: number;
  thumbRadius: number;
};

function parsePixelValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function calculateSwitchRuntimeMotionGeometry(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement
): SwitchRuntimeMotionGeometry {
  const trackStyles = getComputedStyle(trackElement);
  const paddingInlineStart = parsePixelValue(trackStyles.paddingInlineStart);
  const paddingInlineEnd = parsePixelValue(trackStyles.paddingInlineEnd);
  const paddingBlockStart = parsePixelValue(trackStyles.paddingBlockStart);
  const paddingBlockEnd = parsePixelValue(trackStyles.paddingBlockEnd);
  const declaredPaddingBlockStart = parsePixelValue(
    trackStyles.getPropertyValue('--k-pdt'),
    paddingBlockStart
  );
  const declaredPaddingBlockEnd = parsePixelValue(
    trackStyles.getPropertyValue('--k-pdb'),
    paddingBlockEnd
  );
  const borderBlockStart = parsePixelValue(
    trackStyles.getPropertyValue('border-block-start-width')
  );
  const borderBlockEnd = parsePixelValue(trackStyles.getPropertyValue('border-block-end-width'));
  const trackRadius = parsePixelValue(
    trackStyles.getPropertyValue('--k-bdr') ||
      trackStyles.getPropertyValue('border-start-start-radius') ||
      trackStyles.borderTopLeftRadius
  );
  const trackContentWidth = trackElement.clientWidth - paddingInlineStart - paddingInlineEnd;
  const trackContentHeight = trackElement.clientHeight - paddingBlockStart - paddingBlockEnd;
  const thumbWidth = thumbElement.offsetWidth;
  const thumbHeight = thumbElement.offsetHeight;
  const translation = Math.max(0, trackContentWidth - thumbWidth);
  const inlineStart = paddingInlineStart;
  const blockStart = paddingBlockStart + Math.max(0, (trackContentHeight - thumbHeight) / 2);
  const radiusInsetStart = Math.max(
    borderBlockStart + paddingBlockStart,
    declaredPaddingBlockStart,
    borderBlockStart * 2
  );
  const radiusInsetEnd = Math.max(
    borderBlockEnd + paddingBlockEnd,
    declaredPaddingBlockEnd,
    borderBlockEnd * 2
  );
  const thumbRadius = Math.max(0, trackRadius - Math.max(radiusInsetStart, radiusInsetEnd));

  return {
    translation,
    inlineStart,
    blockStart,
    thumbRadius
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
  trackElement.style.setProperty('--k-swt-tr', `${geometry.thumbRadius}px`);
  scopeElement.style.setProperty('--k-swt-tx', `${geometry.translation}px`);
  scopeElement.style.setProperty('--k-swt-ti', `${geometry.inlineStart}px`);
  scopeElement.style.setProperty('--k-swt-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-swt-tr', `${geometry.thumbRadius}px`);
}

export function clearSwitchRuntimeMotionGeometry(trackElement: HTMLSpanElement): void {
  trackElement.style.removeProperty('--k-swt-tx');
  trackElement.style.removeProperty('--k-swt-ti');
  trackElement.style.removeProperty('--k-swt-ty');
  trackElement.style.removeProperty('--k-swt-tr');
  trackElement.parentElement?.style.removeProperty('--k-swt-tx');
  trackElement.parentElement?.style.removeProperty('--k-swt-ti');
  trackElement.parentElement?.style.removeProperty('--k-swt-ty');
  trackElement.parentElement?.style.removeProperty('--k-swt-tr');
}
