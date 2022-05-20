/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC } from 'react';
import { Bar } from './site/components/Bar/Bar';
import { Button } from './components/Button/Button';
import { theme } from './themes/theme';
import { KiskadeeProvider } from './context';

export const App: FC = () => {
  return (
    <KiskadeeProvider theme={theme}>
      <Bar />
      <div style={{ padding: '30px', display: 'flex', gap: 32 }}>
        <Button text="Rested" onClick={(): void => {}} />
        <Button text="Hovered" hover onClick={(): void => {}} />
        <Button text="Focused" onClick={(): void => {}} />
        <Button text="Pressed" onClick={(): void => {}} />
      </div>
    </KiskadeeProvider>
  );
};
