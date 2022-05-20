import type { FC } from 'react';
import Button from './components/Button/Button';
import { KiskadeeProvider } from './context';
import { theme } from './themes/theme';
import { Bar } from './site/components/Bar/Bar';

const App: FC = () => {
  return (
    <KiskadeeProvider theme={theme}>
      <Bar />
      <div style={{ padding: '30px' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <Button text="Rest" onClick={(): void => {}} />
      </div>
    </KiskadeeProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
