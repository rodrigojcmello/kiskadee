export function bindFloatingNotchedRestTypography(options: {
  labelElement: HTMLLabelElement;
  inputElement: HTMLInputElement;
}): () => void {
  const { labelElement, inputElement } = options;

  const syncFloatingTypography = () => {
    const inputStyles = getComputedStyle(inputElement);
    labelElement.style.setProperty('--k-txf-rts', inputStyles.fontSize);
    labelElement.style.setProperty('--k-txf-rth', inputStyles.lineHeight);
    labelElement.setAttribute('data-rest-typography', '');
  };

  syncFloatingTypography();

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncFloatingTypography) : null;
  resizeObserver?.observe(inputElement);

  window.addEventListener('resize', syncFloatingTypography);

  return () => {
    resizeObserver?.disconnect();
    window.removeEventListener('resize', syncFloatingTypography);
    labelElement.removeAttribute('data-rest-typography');
    labelElement.style.removeProperty('--k-txf-rts');
    labelElement.style.removeProperty('--k-txf-rth');
  };
}
