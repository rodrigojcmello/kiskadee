import { type RefObject, useEffect } from 'react';

type FloatingRestTypographyBinder = (options: {
  labelElement: HTMLLabelElement;
  inputElement: HTMLInputElement;
}) => () => void;

export function useLazyFloatingRestTypography(options: {
  enabled: boolean;
  labelRef: RefObject<HTMLLabelElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  loadBinder: () => Promise<FloatingRestTypographyBinder>;
}) {
  useEffect(() => {
    const labelElement = options.labelRef.current;
    const inputElement = options.inputRef.current;
    if (!options.enabled || !labelElement || !inputElement) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void options.loadBinder().then((bindFloatingRestTypography) => {
      if (disposed) {
        return;
      }

      cleanup = bindFloatingRestTypography({
        labelElement,
        inputElement
      });
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [options.enabled, options.inputRef, options.labelRef, options.loadBinder]);
}
