import { stateActivator } from '@kiskadee/core';

const FLOATING_BLOCK_OFFSET_PROPERTY = '--k-txf-fbo';

export function resolveFloatingInputBlockOffset(options: {
  currentOffset: number;
  inputLineBlockStart: number;
  labelBlockEnd: number;
  needsTextExpansion: boolean;
}): number {
  if (!options.needsTextExpansion) return 0;

  const overlap = options.labelBlockEnd - options.inputLineBlockStart;
  return Math.max(0, options.currentOffset + overlap);
}

function parsePixelValue(value: string): number {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function bindFloatingRestTypography(options: {
  labelElement: HTMLLabelElement;
  inputElement: HTMLInputElement;
}): () => void {
  const { labelElement, inputElement } = options;
  const controlElement =
    inputElement.offsetParent instanceof HTMLElement
      ? inputElement.offsetParent
      : inputElement.parentElement;

  if (!controlElement) {
    return () => {};
  }

  const rootElement = controlElement.parentElement;

  const syncRestPlaceholder = () => {
    const inputStyles = getComputedStyle(inputElement);
    const parsedLineHeight = Number.parseFloat(inputStyles.lineHeight);
    const parsedFontSize = Number.parseFloat(inputStyles.fontSize);
    const effectiveLineHeight = Number.isFinite(parsedLineHeight)
      ? parsedLineHeight
      : parsedFontSize;
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

    const isPromoted =
      rootElement?.classList.contains(stateActivator.focus) === true ||
      rootElement?.classList.contains(stateActivator.filled) === true;

    const controlStyles = getComputedStyle(controlElement);
    const tokenBlockSize = Number.parseFloat(controlStyles.getPropertyValue('--k-bxh'));
    const naturalContentBlockSize =
      parsePixelValue(controlStyles.paddingBlockStart) +
      parsePixelValue(controlStyles.paddingBlockEnd) +
      effectiveLineHeight +
      parsePixelValue(inputStyles.paddingBlockStart) +
      parsePixelValue(inputStyles.paddingBlockEnd) +
      parsePixelValue(inputStyles.borderBlockStartWidth) +
      parsePixelValue(inputStyles.borderBlockEndWidth);
    const needsTextExpansion =
      Number.isFinite(tokenBlockSize) && naturalContentBlockSize > tokenBlockSize + 0.125;

    if (!isPromoted || !needsTextExpansion) {
      controlElement.style.setProperty(FLOATING_BLOCK_OFFSET_PROPERTY, '0px');
      return;
    }

    const controlRect = controlElement.getBoundingClientRect();
    const inputRect = inputElement.getBoundingClientRect();
    const labelRect = labelElement.getBoundingClientRect();
    const parsedCurrentOffset = Number.parseFloat(
      controlStyles.getPropertyValue(FLOATING_BLOCK_OFFSET_PROPERTY)
    );
    const currentOffset = Number.isFinite(parsedCurrentOffset) ? parsedCurrentOffset : 0;
    const inputLineBlockStart =
      inputRect.top - controlRect.top + (inputElement.clientHeight - effectiveLineHeight) / 2;
    const labelBlockEnd = labelRect.bottom - controlRect.top;
    const nextOffset = resolveFloatingInputBlockOffset({
      currentOffset,
      inputLineBlockStart,
      labelBlockEnd,
      needsTextExpansion
    });

    if (Math.abs(nextOffset - currentOffset) >= 0.125) {
      controlElement.style.setProperty(FLOATING_BLOCK_OFFSET_PROPERTY, `${nextOffset}px`);
    }
  };

  syncRestPlaceholder();

  let syncFrame = 0;
  const scheduleSync = () => {
    if (syncFrame !== 0) return;

    syncFrame = window.requestAnimationFrame(() => {
      syncFrame = 0;
      syncRestPlaceholder();
    });
  };

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleSync) : null;
  resizeObserver?.observe(labelElement);
  resizeObserver?.observe(inputElement);
  resizeObserver?.observe(controlElement);

  const mutationObserver =
    rootElement && typeof MutationObserver !== 'undefined'
      ? new MutationObserver(scheduleSync)
      : null;
  if (rootElement) {
    mutationObserver?.observe(rootElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  labelElement.addEventListener('transitionend', scheduleSync);
  window.addEventListener('resize', scheduleSync);

  return () => {
    if (syncFrame !== 0) {
      window.cancelAnimationFrame(syncFrame);
    }
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    labelElement.removeEventListener('transitionend', scheduleSync);
    window.removeEventListener('resize', scheduleSync);
    controlElement.style.removeProperty(FLOATING_BLOCK_OFFSET_PROPERTY);
    labelElement.removeAttribute('data-rest-placeholder');
    labelElement.style.removeProperty('--k-txf-rts');
    labelElement.style.removeProperty('--k-txf-rth');
    labelElement.style.removeProperty('--k-txf-rbt');
    labelElement.style.removeProperty('--k-txf-ris');
    labelElement.style.removeProperty('--k-txf-riw');
  };
}
