import type { FC } from 'react';
import { Bar } from './site/components/Bar/Bar';
import { theme } from './themes/theme';
import { KiskadeeProvider } from './context';
import { ButtonDocument } from './site/documentation/Button/ButtonDocumentation';

export const App: FC = () => {
  return (
    <KiskadeeProvider theme={theme}>
      <Bar />
      <ButtonDocument />
    </KiskadeeProvider>
  );
};
