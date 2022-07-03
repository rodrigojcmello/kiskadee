import type { FC } from 'react';
import { Bar } from './site/components/Bar/Bar';
import { schema } from './themes/schema';
import { KiskadeeProvider } from './context';
import { ButtonDocumentation } from './site/documentation/Button/ButtonDocumentation';

export const App: FC = () => {
  return (
    <KiskadeeProvider schema={schema} only={'dark'}>
      <Bar />
      <ButtonDocumentation />
    </KiskadeeProvider>
  );
};
