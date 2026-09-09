import { resolveControlCursor } from '@kiskadee/core';
import { type CSSProperties, useContext } from 'react';
import { KiskadeeContext } from './KiskadeeContext.tsx';

const styles = {
  default: { '--k-cc': 'default' } as CSSProperties,
  pointer: { '--k-cc': 'pointer' } as CSSProperties
};

/** Projects explicit context preferences at DOM owners, including portalled surfaces. */
export function useControlCursorStyle(): CSSProperties | undefined {
  const context = useContext(KiskadeeContext);
  return context?.controlCursor ? styles[resolveControlCursor(context.controlCursor)] : undefined;
}
