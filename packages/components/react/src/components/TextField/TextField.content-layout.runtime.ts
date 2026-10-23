import {
  observeTextFieldContentLayout,
  observeTextFieldDirection
} from './TextField.direction.runtime.ts';

const ACTION_INLINE_OFFSET = '--k-txf-aio';
const ACTION_BLOCK_OFFSET = '--k-txf-abo';
const REGION_PROPERTIES = [
  ACTION_INLINE_OFFSET,
  ACTION_BLOCK_OFFSET,
  '--k-txf-rbs',
  '--k-txf-rbe',
  '--k-txf-rio',
  '--k-txf-rii',
  '--k-txf-rr'
] as const;
const GEOMETRY_TOLERANCE = 0.125;

function pixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function setLength(element: HTMLElement, property: string, value: number): void {
  const previous = Number.parseFloat(element.style.getPropertyValue(property));
  if (Number.isFinite(previous) && Math.abs(previous - value) < GEOMETRY_TOLERANCE) return;
  element.style.setProperty(property, `${value}px`);
}

function getSingleAction(region: HTMLElement): HTMLElement | null {
  const content = Array.from(region.childNodes).filter(
    (node) =>
      node.nodeType === Node.ELEMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
  );
  const child = content.length === 1 ? content[0] : null;
  return child instanceof HTMLElement && child.hasAttribute('data-text-field-action')
    ? child
    : null;
}

/** Measures host-owned layout only; composed actions retain their own dimensions and padding. */
export function bindTextFieldContentLayout(options: {
  controlElement: HTMLElement;
  inputElement: HTMLInputElement;
}): () => void {
  const { controlElement, inputElement } = options;
  const view = controlElement.ownerDocument.defaultView;
  if (!view) return () => {};
  const getComputedStyles = view.getComputedStyle.bind(view);

  const measuredRegions = new Set<HTMLElement>();
  const observedActions = new Set<HTMLElement>();
  let disposed = false;
  let syncFrame = 0;

  const scheduleSync = () => {
    if (disposed || syncFrame !== 0) return;
    syncFrame = view.requestAnimationFrame(() => {
      syncFrame = 0;
      syncLayout();
    });
  };
  const resizeObserver = view.ResizeObserver ? new view.ResizeObserver(scheduleSync) : null;

  function syncLayout() {
    const regions = Array.from(
      controlElement.querySelectorAll<HTMLElement>(':scope > [data-text-field-content]')
    );
    for (const region of measuredRegions) {
      if (regions.includes(region)) continue;
      for (const property of REGION_PROPERTIES) region.style.removeProperty(property);
      measuredRegions.delete(region);
    }

    const styles = getComputedStyles(controlElement);
    const controlRect = controlElement.getBoundingClientRect();
    const borderTop = pixels(styles.borderTopWidth);
    const borderBottom = pixels(styles.borderBottomWidth);
    const borderLeft = pixels(styles.borderLeftWidth);
    const borderRight = pixels(styles.borderRightWidth);
    const innerTop = controlRect.top + borderTop;
    const innerBottom = controlRect.bottom - borderBottom;
    const innerLeft = controlRect.left + borderLeft;
    const innerRight = controlRect.right - borderRight;
    const isRtl = styles.direction === 'rtl';
    const nextActions = new Set<HTMLElement>();

    for (const region of regions) {
      const action = getSingleAction(region);
      if (!action) {
        region.style.removeProperty(ACTION_INLINE_OFFSET);
        region.style.removeProperty(ACTION_BLOCK_OFFSET);
        continue;
      }
      nextActions.add(action);
      if (!observedActions.has(action)) resizeObserver?.observe(action);
      const regionRect = region.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      const blockGap = Math.max(0, (innerBottom - innerTop - actionRect.height) / 2);
      const isPhysicalStart = (region.dataset.textFieldContent === 'start') !== isRtl;
      const currentGap = isPhysicalStart
        ? actionRect.left - innerLeft
        : innerRight - actionRect.right;
      // The measured inline margin participates in the rect; remove it before deriving a new one.
      const currentInlineOffset = pixels(region.style.getPropertyValue(ACTION_INLINE_OFFSET));
      setLength(region, ACTION_INLINE_OFFSET, currentInlineOffset + blockGap - currentGap);
      // Relative positioning never changes the region's unshifted center.
      setLength(
        region,
        ACTION_BLOCK_OFFSET,
        (innerTop + innerBottom - regionRect.top - regionRect.bottom) / 2
      );
    }
    for (const action of observedActions) {
      if (!nextActions.has(action)) resizeObserver?.unobserve(action);
    }
    observedActions.clear();
    for (const action of nextActions) observedActions.add(action);

    // Inline compensation can move the editable lane; measure paint after applying that layout.
    const inputRect = inputElement.getBoundingClientRect();
    for (const region of regions) {
      const regionRect = region.getBoundingClientRect();
      const isPhysicalStart = (region.dataset.textFieldContent === 'start') !== isRtl;
      const outerBorder = isPhysicalStart ? borderLeft : borderRight;
      const outerRadius = pixels(
        isPhysicalStart ? styles.borderTopLeftRadius : styles.borderTopRightRadius
      );
      setLength(region, '--k-txf-rbs', regionRect.top - innerTop);
      setLength(region, '--k-txf-rbe', innerBottom - regionRect.bottom);
      setLength(
        region,
        '--k-txf-rio',
        isPhysicalStart ? regionRect.left - innerLeft : innerRight - regionRect.right
      );
      setLength(
        region,
        '--k-txf-rii',
        Math.max(
          0,
          (isPhysicalStart
            ? inputRect.left - regionRect.right
            : regionRect.left - inputRect.right) / 2
        )
      );
      setLength(region, '--k-txf-rr', Math.max(0, outerRadius - outerBorder));
      measuredRegions.add(region);
    }
  }

  resizeObserver?.observe(controlElement);
  resizeObserver?.observe(inputElement);
  const stopObservingContent = observeTextFieldContentLayout(controlElement, scheduleSync);
  const stopObservingDirection = observeTextFieldDirection(controlElement, scheduleSync);
  const mutationObserver = view.MutationObserver ? new view.MutationObserver(scheduleSync) : null;
  mutationObserver?.observe(controlElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  const fonts = controlElement.ownerDocument.fonts;
  fonts?.addEventListener('loadingdone', scheduleSync);
  void fonts?.ready.then(scheduleSync);
  view.addEventListener('resize', scheduleSync);
  syncLayout();

  return () => {
    disposed = true;
    if (syncFrame !== 0) view.cancelAnimationFrame(syncFrame);
    resizeObserver?.disconnect();
    stopObservingContent();
    stopObservingDirection();
    mutationObserver?.disconnect();
    fonts?.removeEventListener('loadingdone', scheduleSync);
    view.removeEventListener('resize', scheduleSync);
    for (const region of measuredRegions) {
      for (const property of REGION_PROPERTIES) region.style.removeProperty(property);
    }
  };
}
