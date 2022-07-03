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
  PropsWithChildren<{
    schema: KiskadeeSchema;
    // theme?: { light?: string; dark?: string };
    only?: 'light' | 'dark';
  }>
> = ({ schema, only, children }) => {
  const newSchema = { ...schema };
  if (!newSchema.theme) {
    newSchema.theme = {};
  }
  newSchema.theme.only = only;

  return (
    <KiskadeeContext.Provider value={useState<KiskadeeSchema>(newSchema)}>
      {children}
    </KiskadeeContext.Provider>
  );
};

export const KiskadeeConsumer = KiskadeeContext.Consumer;
