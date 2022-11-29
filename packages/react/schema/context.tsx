import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';
import type { KiskadeeTheme } from '../utils';

type KiskadeeContextType = [
  KiskadeeTheme,
  (
    value: KiskadeeTheme | ((previousState: KiskadeeTheme) => KiskadeeTheme)
  ) => void
];

export const KiskadeeContext = createContext<KiskadeeContextType>(undefined!);

export const useKiskadee = (): KiskadeeContextType =>
  useContext(KiskadeeContext);

export const KiskadeeProvider: FC<
  PropsWithChildren<{
    schema: KiskadeeTheme;
    // theme?: { light?: string; dark?: string };
    only?: 'light' | 'dark';
  }>
> = ({ schema, only, children }) => {
  const newSchema = { ...schema };
  if (!newSchema.themeMode) {
    newSchema.themeMode = {};
  }
  newSchema.themeMode.only = only;

  return (
    <KiskadeeContext.Provider value={useState<KiskadeeTheme>(newSchema)}>
      {children}
    </KiskadeeContext.Provider>
  );
};

export const KiskadeeConsumer = KiskadeeContext.Consumer;
