export type SwitchV2MotionGeometry = {
  translation: number;
  inlineStart: number;
  blockStart: number;
  thumbRadius: number;
};

function parsePixelValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function calculateSwitchV2MotionGeometry(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement
): SwitchV2MotionGeometry {
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
  const borderInlineStart = parsePixelValue(
    trackStyles.getPropertyValue('border-inline-start-width')
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
  const inlineStart = borderInlineStart + paddingInlineStart;
  const blockStart =
    borderBlockStart + paddingBlockStart + Math.max(0, (trackContentHeight - thumbHeight) / 2);
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

export function applySwitchV2MotionGeometry(
  trackElement: HTMLSpanElement,
  geometry: SwitchV2MotionGeometry
): void {
  const scopeElement = trackElement.parentElement ?? trackElement;

  trackElement.style.setProperty('--k-sw2-tx', `${geometry.translation}px`);
  trackElement.style.setProperty('--k-sw2-ti', `${geometry.inlineStart}px`);
  trackElement.style.setProperty('--k-sw2-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-sw2-tx', `${geometry.translation}px`);
  scopeElement.style.setProperty('--k-sw2-ti', `${geometry.inlineStart}px`);
  scopeElement.style.setProperty('--k-sw2-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-sw2-tr', `${geometry.thumbRadius}px`);
}

export function clearSwitchV2MotionGeometry(trackElement: HTMLSpanElement): void {
  trackElement.style.removeProperty('--k-sw2-tx');
  trackElement.style.removeProperty('--k-sw2-ti');
  trackElement.style.removeProperty('--k-sw2-ty');
  trackElement.style.removeProperty('--k-sw2-tr');
  trackElement.parentElement?.style.removeProperty('--k-sw2-tx');
  trackElement.parentElement?.style.removeProperty('--k-sw2-ti');
  trackElement.parentElement?.style.removeProperty('--k-sw2-ty');
  trackElement.parentElement?.style.removeProperty('--k-sw2-tr');
}
