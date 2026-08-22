'use client';

import type { EssentialIconMap, EssentialIconName, IconName } from '@kiskadee/icons/interface';
import { createContext, type ReactNode, useContext } from 'react';
import { useResolvedIconGlyph } from './IconFamilyContext.tsx';

export type EssentialIconProviderProps = {
  children: ReactNode;
  icons: Readonly<EssentialIconMap>;
};

const EssentialIconContext = createContext<Readonly<EssentialIconMap> | undefined>(undefined);

export function EssentialIconProvider({ children, icons }: EssentialIconProviderProps) {
  return <EssentialIconContext.Provider value={icons}>{children}</EssentialIconContext.Provider>;
}

export function useEssentialIcon(name: EssentialIconName): IconName | undefined {
  const icons = useContext(EssentialIconContext);
  const iconName = icons?.[name];
  const resolved = useResolvedIconGlyph(iconName);

  return resolved.glyph ? iconName : undefined;
}
