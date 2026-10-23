function getTextFieldDirection(controlElement: HTMLElement): string {
  return controlElement.ownerDocument.defaultView?.getComputedStyle(controlElement).direction ?? '';
}

export function getTextFieldInlineStartOffset(
  controlElement: HTMLElement,
  inputElement: HTMLElement
): number {
  const controlRect = controlElement.getBoundingClientRect();
  const inputRect = inputElement.getBoundingClientRect();
  return Math.max(
    0,
    getTextFieldDirection(controlElement) === 'rtl'
      ? controlRect.right - inputRect.right
      : inputRect.left - controlRect.left
  );
}

const directionSubscriptions = new WeakMap<
  HTMLElement,
  { listeners: Set<() => void>; stop: () => void }
>();

export function observeTextFieldDirection(
  controlElement: HTMLElement,
  onChange: () => void
): () => void {
  const current = directionSubscriptions.get(controlElement);
  if (current) {
    current.listeners.add(onChange);
    return () => {
      current.listeners.delete(onChange);
      if (current.listeners.size === 0) current.stop();
    };
  }
  let direction = getTextFieldDirection(controlElement);
  const MutationObserverClass = controlElement.ownerDocument.defaultView?.MutationObserver;
  if (!MutationObserverClass) return () => {};

  const listeners = new Set([onChange]);
  const observer = new MutationObserverClass(() => {
    const nextDirection = getTextFieldDirection(controlElement);
    if (nextDirection === direction) return;
    direction = nextDirection;
    for (const listener of listeners) listener();
  });

  for (
    let ancestor: HTMLElement | null = controlElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ['dir', 'class', 'style']
    });
  }

  const stop = () => {
    observer.disconnect();
    directionSubscriptions.delete(controlElement);
  };
  directionSubscriptions.set(controlElement, { listeners, stop });
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) stop();
  };
}

export function observeTextFieldContentLayout(
  controlElement: HTMLElement,
  onChange: () => void
): () => void {
  const view = controlElement.ownerDocument.defaultView;
  const resizeObserver = view?.ResizeObserver ? new view.ResizeObserver(onChange) : undefined;
  let regions: HTMLElement[] = [];
  const mutationObserver = view?.MutationObserver
    ? new view.MutationObserver(() => {
        syncRegions();
        onChange();
      })
    : undefined;

  function syncRegions() {
    const nextRegions = Array.from(
      controlElement.querySelectorAll<HTMLElement>(':scope > [data-text-field-content]')
    );
    if (
      nextRegions.length === regions.length &&
      nextRegions.every((region, index) => region === regions[index])
    ) {
      return;
    }

    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    regions = nextRegions;
    mutationObserver?.observe(controlElement, { childList: true });
    for (const region of regions) {
      resizeObserver?.observe(region);
      mutationObserver?.observe(region, {
        attributes: true,
        attributeFilter: ['data-text-field-content'],
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  mutationObserver?.observe(controlElement, { childList: true });
  syncRegions();
  return () => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  };
}
