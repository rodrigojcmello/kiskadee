'use client';

import {
  breakpoints,
  DENSITY_BREAKPOINT,
  type Density,
  type DensityScaleMapJSON,
  REGULAR_DENSITY_BREAKPOINT
} from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore
} from 'react';

type FixedDensity = Exclude<Density, 'adaptive'>;
export function resolveDisplayedDensity(
  map: DensityScaleMapJSON,
  width: number,
  override?: Density
): FixedDensity {
  if (override === 'compact' && map.c) return override;
  if (override === 'regular' && map.r) return override;
  if (override === 'spacious' && map.s) return override;
  if (width >= breakpoints[DENSITY_BREAKPOINT]!)
    return map.c ? 'compact' : map.r ? 'regular' : 'spacious';
  if (width >= breakpoints[REGULAR_DENSITY_BREAKPOINT]! && map.r) return 'regular';
  return map.s ? 'spacious' : map.r ? 'regular' : 'compact';
}

function subscribe(onChange: () => void) {
  const queries = [REGULAR_DENSITY_BREAKPOINT, DENSITY_BREAKPOINT].map((key) =>
    window.matchMedia(`(min-width: ${breakpoints[key]}px)`)
  );
  for (const query of queries) query.addEventListener('change', onChange);
  return () => {
    for (const query of queries) query.removeEventListener('change', onChange);
  };
}
const getWidth = () => window.innerWidth;
const getServerWidth = () => 0;

type DensityContextValue = {
  densityMap: DensityScaleMapJSON | undefined;
  densityOverride: Density | undefined;
  activeDensity: FixedDensity;
  setDensityOverride: (value: Density | undefined) => void;
};
const Context = createContext<DensityContextValue | null>(null);
export function ShowcaseDensityProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { global } = useKiskadee();
  const [overrides, setOverrides] = useState<Record<string, Density | undefined>>({});
  const route = pathname.split('/')[1];
  const component =
    (
      {
        'bottom-sheet': 'bottomSheet',
        'text-field': 'textField',
        icons: 'icon',
        'brand-buttons': 'button'
      } as Record<string, string>
    )[route] ?? route;
  const densityMap = global?.density?.[component];
  const requested = overrides[pathname];
  const densityOverride =
    (requested === 'compact' && !densityMap?.c) ||
    (requested === 'regular' && !densityMap?.r) ||
    (requested === 'spacious' && !densityMap?.s)
      ? undefined
      : requested;
  const setDensityOverride = useCallback(
    (value: Density | undefined) => setOverrides((current) => ({ ...current, [pathname]: value })),
    [pathname]
  );
  const width = useSyncExternalStore(subscribe, getWidth, getServerWidth);
  return (
    <Context.Provider
      value={{
        densityMap,
        densityOverride,
        activeDensity: resolveDisplayedDensity(densityMap ?? {}, width, densityOverride),
        setDensityOverride
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useShowcaseDensity() {
  const value = useContext(Context);
  if (!value) throw new Error('Showcase density requires its provider.');
  return value;
}
