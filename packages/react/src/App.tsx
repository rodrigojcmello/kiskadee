import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Bar } from './site/components/Bar/Bar';
import { schema } from './themes/schema';
import { KiskadeeProvider } from './context';
import { ButtonDocumentation } from './site/documentation/Button/ButtonDocumentation';
import { Button } from './components/Button';

const ButtonDocument = () => {
  return (
    <>
      <Bar />
      <ButtonDocumentation />
    </>
  );
};

const ButtonOnly = () => {
  return (
    <>
      <Bar />
      <div style={{ padding: 100 }}>
        <Button
          type={'contained'}
          variant={'tertiary'}
          label={'text text text'}
          size={'md'}
          iconLeft={
            <span className={'material-symbols-outlined'}>thumb_up</span>
          }
        />
      </div>
    </>
  );
};

// TODO: packages/react become packages/docs
export const App: FC = () => {
  return (
    <KiskadeeProvider schema={schema} only={'dark'}>
      <Routes>
        <Route path={'/'} element={<ButtonDocument />} />
        <Route path={'button'} element={<ButtonOnly />} />
      </Routes>
    </KiskadeeProvider>
  );
};
