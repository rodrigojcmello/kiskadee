import type { ControlCursorValue } from '@kiskadee/core';
import { useCallback, useState } from 'react';

/** Route-local inspection preferences deliberately do not survive a page reload. */
export function useRouteControlCursor(pathname: string) {
  const [overrides, setOverrides] = useState<Record<string, ControlCursorValue | undefined>>({});
  const setOverride = useCallback(
    (value: ControlCursorValue | undefined) => {
      setOverrides((current) => ({ ...current, [pathname]: value }));
    },
    [pathname]
  );
  return { override: overrides[pathname], setOverride };
}
