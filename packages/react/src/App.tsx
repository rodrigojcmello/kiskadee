import type { FC } from 'react';
import { Bar } from './site/components/Bar/Bar';
import { theme } from './themes/theme';
import { KiskadeeProvider } from './context';
import { ButtonDocumentation } from './site/documentation/Button/ButtonDocumentation';

export const App: FC = () => {
  return (
    <KiskadeeProvider theme={theme}>
      <Bar />
      <ButtonDocumentation />
    </KiskadeeProvider>
  );
};
