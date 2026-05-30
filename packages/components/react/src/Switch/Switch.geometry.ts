export type SwitchGeometry = {
  translation: number;
  inlineStart: number;
  blockStart: number;
  thumbRadius: number;
};

function parsePixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateSwitchGeometry(
  trackElement: HTMLSpanElement,
  thumbElement: HTMLSpanElement
): SwitchGeometry {
  const trackStyles = getComputedStyle(trackElement);
  const paddingInlineStart = parsePixelValue(trackStyles.paddingInlineStart);
  const paddingInlineEnd = parsePixelValue(trackStyles.paddingInlineEnd);
  const paddingBlockStart = parsePixelValue(trackStyles.paddingBlockStart);
  const paddingBlockEnd = parsePixelValue(trackStyles.paddingBlockEnd);
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
  const blockInset = Math.max(
    borderBlockStart + paddingBlockStart,
    borderBlockEnd + paddingBlockEnd
  );
  const thumbRadius = Math.max(0, trackRadius - blockInset);

  return {
    translation,
    inlineStart,
    blockStart,
    thumbRadius
  };
}

export function applySwitchGeometry(
  trackElement: HTMLSpanElement,
  geometry: SwitchGeometry
): void {
  const scopeElement = trackElement.parentElement ?? trackElement;

  trackElement.style.setProperty('--k-swt-tx', `${geometry.translation}px`);
  trackElement.style.setProperty('--k-swt-ti', `${geometry.inlineStart}px`);
  trackElement.style.setProperty('--k-swt-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-swt-tx', `${geometry.translation}px`);
  scopeElement.style.setProperty('--k-swt-ti', `${geometry.inlineStart}px`);
  scopeElement.style.setProperty('--k-swt-ty', `${geometry.blockStart}px`);
  scopeElement.style.setProperty('--k-swt-tr', `${geometry.thumbRadius}px`);
}

export function clearSwitchGeometry(trackElement: HTMLSpanElement): void {
  trackElement.style.removeProperty('--k-swt-tx');
  trackElement.style.removeProperty('--k-swt-ti');
  trackElement.style.removeProperty('--k-swt-ty');
  trackElement.style.removeProperty('--k-swt-tr');
  trackElement.parentElement?.style.removeProperty('--k-swt-tx');
  trackElement.parentElement?.style.removeProperty('--k-swt-ti');
  trackElement.parentElement?.style.removeProperty('--k-swt-ty');
  trackElement.parentElement?.style.removeProperty('--k-swt-tr');
}
