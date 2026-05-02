export function bindFloatingNotchedRestTypography(options: {
  labelElement: HTMLLabelElement;
  inputElement: HTMLInputElement;
}): () => void {
  const { labelElement, inputElement } = options;
  const controlElement =
    inputElement.offsetParent instanceof HTMLElement ? inputElement.offsetParent : inputElement.parentElement;

  if (!controlElement) {
    return () => {};
  }

  const syncRestPlaceholder = () => {
    const inputStyles = getComputedStyle(inputElement);
    const parsedLineHeight = Number.parseFloat(inputStyles.lineHeight);
    const parsedFontSize = Number.parseFloat(inputStyles.fontSize);
    const effectiveLineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : parsedFontSize;
    const restBlockTop = Math.max(
      0,
      inputElement.offsetTop + (inputElement.clientHeight - effectiveLineHeight) / 2
    );
    const restInlineStart = inputElement.offsetLeft;
    const restInlineWidth = inputElement.clientWidth;

    labelElement.style.setProperty('--k-txf-rts', inputStyles.fontSize);
    labelElement.style.setProperty('--k-txf-rth', inputStyles.lineHeight);
    labelElement.style.setProperty('--k-txf-rbt', `${restBlockTop}px`);
    labelElement.style.setProperty('--k-txf-ris', `${restInlineStart}px`);
    labelElement.style.setProperty('--k-txf-riw', `${restInlineWidth}px`);
    labelElement.setAttribute('data-rest-placeholder', '');
  };

  syncRestPlaceholder();

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncRestPlaceholder) : null;
  resizeObserver?.observe(inputElement);
  resizeObserver?.observe(controlElement);

  window.addEventListener('resize', syncRestPlaceholder);

  return () => {
    resizeObserver?.disconnect();
    window.removeEventListener('resize', syncRestPlaceholder);
    labelElement.removeAttribute('data-rest-placeholder');
    labelElement.style.removeProperty('--k-txf-rts');
    labelElement.style.removeProperty('--k-txf-rth');
    labelElement.style.removeProperty('--k-txf-rbt');
    labelElement.style.removeProperty('--k-txf-ris');
    labelElement.style.removeProperty('--k-txf-riw');
  };
}
