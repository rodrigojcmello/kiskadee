const registrations = new WeakMap<Document, { count: number; dispose: () => void }>();

/** Installs one shared pointer tracker per document, including portaled controls. */
export function acquirePointerModality(
  documentRef: Document | undefined = typeof document === 'undefined' ? undefined : document
): () => void {
  if (!documentRef) return () => {};
  let registration = registrations.get(documentRef);
  if (!registration) {
    const root = documentRef.documentElement;
    const previous = root.getAttribute('data-k-input');
    let suppressed = previous === 'touch';
    const setSuppressed = (next: boolean) => {
      if (next === suppressed) return;
      suppressed = next;
      if (next) root.setAttribute('data-k-input', 'touch');
      else root.removeAttribute('data-k-input');
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || (event.pointerType === 'pen' && event.buttons !== 0)) {
        setSuppressed(true);
      } else if (
        event.pointerType === 'mouse' ||
        (event.pointerType === 'pen' && event.buttons === 0)
      ) {
        setSuppressed(false);
      }
    };
    // Compatibility mouse events following touch are deliberately not observed.
    const events = ['pointerdown', 'pointerover', 'pointermove'] as const;
    for (const type of events)
      documentRef.addEventListener(type, onPointer, { capture: true, passive: true });
    registration = {
      count: 0,
      dispose: () => {
        for (const type of events) documentRef.removeEventListener(type, onPointer, true);
        if (previous === null) root.removeAttribute('data-k-input');
        else root.setAttribute('data-k-input', previous);
      }
    };
    registrations.set(documentRef, registration);
  }
  registration.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--registration.count === 0) {
      registration.dispose();
      registrations.delete(documentRef);
    }
  };
}
