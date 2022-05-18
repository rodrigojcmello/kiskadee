import type { FC } from 'react';
import './App.css';
import Button from './components/Button/Button';

const App: FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
      <Button text="Rest" onClick={(): void => {}} />
    </div>
  );
};

export default App;
