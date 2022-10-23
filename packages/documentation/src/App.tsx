import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Button, KiskadeeProvider } from '@kiskadee/react';
import { material3 } from '@kiskadee/theme';
import { Bar } from './components/Bar/Bar';
import { ButtonDocumentation } from './documentation/Button/ButtonDocumentation';

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

  console.log('ButtonOnly');

  return (
    <>
      <Bar />
      <div style={{ paddingTop: 100, paddingLeft: 50, width: 200 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          label={'fulano'}
          size={'sm'}
          isLoading={loading}
          // onClick={() => {
          //   setLoading(true);
          // }}
          // iconLeft={
          //   <span className={'material-symbols-outlined'}>thumb_up</span>
          // }
        />
      </div>
      <div style={{ paddingTop: 100, paddingLeft: 50, width: 200 }}>
        <Button
          type={'contained'}
          variant={'primary'}
          label={'fulano'}
          isLoading={loading}
          // onClick={() => {
          //   setLoading(true);
          // }}
          // iconLeft={
          //   <span className={'material-symbols-outlined'}>thumb_up</span>
          // }
        />
      </div>
      {/* <div style={{ paddingTop: 50, paddingLeft: 50 }}> */}
      {/*  <Button */}
      {/*    type={'contained'} */}
      {/*    variant={'primary'} */}
      {/*    label={'text text text text text'} */}
      {/*    size={'md'} */}
      {/*    isLoading={loading} */}
      {/*    onClick={() => { */}
      {/*      setLoading(true); */}
      {/*    }} */}
      {/*    iconLeft={ */}
      {/*      <span className={'material-symbols-outlined'}>thumb_up</span> */}
      {/*    } */}
      {/*  /> */}
      {/* </div> */}
      {/* <div style={{ paddingTop: 50, paddingLeft: 50 }}> */}
      {/*  <Button */}
      {/*    type={'contained'} */}
      {/*    variant={'primary'} */}
      {/*    size={'sm'} */}
      {/*    label={'text text text text text'} */}
      {/*    isLoading={loading} */}
      {/*    onClick={() => { */}
      {/*      setLoading(true); */}
      {/*    }} */}
      {/*    iconLeft={ */}
      {/*      <span className={'material-symbols-outlined'}>thumb_up</span> */}
      {/*    } */}
      {/*  /> */}
      {/* </div> */}
      {/* <div style={{ paddingTop: 50, paddingLeft: 50 }}> */}
      {/*  <Button */}
      {/*    type={'contained'} */}
      {/*    variant={'primary'} */}
      {/*    label={'text text text text text'} */}
      {/*    isLoading={loading} */}
      {/*    onClick={() => { */}
      {/*      setLoading(true); */}
      {/*    }} */}
      {/*    iconLeft={ */}
      {/*      <span className={'material-symbols-outlined'}>thumb_up</span> */}
      {/*    } */}
      {/*  /> */}
      {/* </div> */}
    </>
  );
};

export const App: FC = () => {
  console.log('app');

  return (
    <KiskadeeProvider schema={material3}>
      <Routes>
        <Route path={'/'} element={<ButtonDocument />} />
        <Route path={'button'} element={<ButtonOnly />} />
      </Routes>
    </KiskadeeProvider>
  );
};
