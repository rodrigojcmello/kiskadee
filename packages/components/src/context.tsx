import type { FC, PropsWithChildren } from 'react';
import { createContext, useState } from 'react';
import type { KiskadeeSchema } from './themes/theme.types';

type KiskadeeContextType = [
  KiskadeeSchema,
  (
    value: KiskadeeSchema | ((previousState: KiskadeeSchema) => KiskadeeSchema)
  ) => void
];

export const KiskadeeContext = createContext<KiskadeeContextType>(undefined!);

export const KiskadeeProvider: FC<
  PropsWithChildren<{ theme: KiskadeeSchema }>
> = ({ theme, children }) => {
  return (
    <KiskadeeContext.Provider value={useState<KiskadeeSchema>(theme)}>
      {children}
    </KiskadeeContext.Provider>
  );
};

export const KiskadeeConsumer = KiskadeeContext.Consumer;
