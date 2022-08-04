import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Bar } from './site/components/Bar/Bar';
import { materialTheme } from './themes/material/theme';
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
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Bar />
      <div style={{ paddingTop: 100, paddingLeft: 50 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          label={'text text text text text'}
          size={'lg'}
          isLoading={loading}
          onClick={() => {
            setLoading(true);
          }}
          iconLeft={<span className={'material-symbols-outlined'}>thumb_up</span>}
        />
      </div>
      <div style={{ paddingTop: 50, paddingLeft: 50 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          label={'text text text text text'}
          size={'md'}
          isLoading={loading}
          onClick={() => {
            setLoading(true);
          }}
          iconLeft={<span className={'material-symbols-outlined'}>thumb_up</span>}
        />
      </div>
      <div style={{ paddingTop: 50, paddingLeft: 50 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          size={'sm'}
          label={'text text text text text'}
          isLoading={loading}
          onClick={() => {
            setLoading(true);
          }}
          iconLeft={<span className={'material-symbols-outlined'}>thumb_up</span>}
        />
      </div>
      <div style={{ paddingTop: 50, paddingLeft: 50 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          label={'text text text text text'}
          isLoading={loading}
          onClick={() => {
            setLoading(true);
          }}
          iconLeft={<span className={'material-symbols-outlined'}>thumb_up</span>}
        />
      </div>
    </>
  );
};

// TODO: packages/react become packages/docs
export const App: FC = () => {
  return (
    <KiskadeeProvider schema={materialTheme}>
      <Routes>
        <Route path={'/'} element={<ButtonDocument />} />
        <Route path={'button'} element={<ButtonOnly />} />
      </Routes>
    </KiskadeeProvider>
  );
};
