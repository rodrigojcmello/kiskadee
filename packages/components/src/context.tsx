import type { FC, PropsWithChildren } from 'react';
import { createContext } from 'react';
import type { KiskadeeSchema } from './themes/theme.types';

export const KiskadeeContext = createContext<KiskadeeSchema>(
  {} as KiskadeeSchema
);

export const KiskadeeProvider: FC<
  PropsWithChildren<{ theme: KiskadeeSchema }>
> = ({ theme, children }) => {
  return (
    <KiskadeeContext.Provider value={theme}>
      {children}
    </KiskadeeContext.Provider>
  );
};
