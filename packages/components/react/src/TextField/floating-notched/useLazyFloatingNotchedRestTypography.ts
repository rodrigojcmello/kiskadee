import { type RefObject, useEffect } from 'react';

export function useLazyFloatingNotchedRestTypography(options: {
  enabled: boolean;
  labelRef: RefObject<HTMLLabelElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  useEffect(() => {
    const labelElement = options.labelRef.current;
    const inputElement = options.inputRef.current;
    if (!options.enabled || !labelElement || !inputElement) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('./floatingNotchedRestTypography.runtime').then((module) => {
      if (disposed) {
        return;
      }

      cleanup = module.bindFloatingNotchedRestTypography({
        labelElement,
        inputElement
      });
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [options.enabled, options.inputRef, options.labelRef]);
}
