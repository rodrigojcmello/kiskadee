import styled from '@emotion/styled';
import type { ChangeEvent, FC } from 'react';
import { useContext, useEffect, useState } from 'react';
import type { KiskadeeTheme } from '@kiskadee/react';
import { KiskadeeContext } from '@kiskadee/react';
import { material3, ios15, carbon, fluent2, sandbox } from '@kiskadee/theme';

const BarStyled = styled.div(() => ({
  padding: 8,
  borderBottom: '1px solid #ccc',
  position: 'fixed',
  width: '100%',
  top: 0,
  zIndex: 1,
  backgroundColor: '#FFF',
}));

const SelectTheme = styled.select(() => ({
  borderRadius: 8,
  border: '1px solid #ccc',
  height: 36,
  padding: '0 8px',
  width: 240,
}));

const themes: Record<string, KiskadeeTheme> = {
  Material: material3,
  Fluent: fluent2,
  iOS: ios15,
  Carbon: carbon,
  Sandbox: sandbox,
};

export const Bar: FC = () => {
  const [theme, setTheme] = useContext(KiskadeeContext);

  const localTheme = localStorage.getItem('theme') || 'Material';
  const [themeSelected, setThemeSelected] = useState(localTheme);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setThemeSelected(event.target.value);
  };

  useEffect(() => {
    if (theme.name !== themeSelected) {
      localStorage.setItem('theme', themeSelected);
      setTheme(themes[themeSelected]);
    }
  }, [themeSelected]);

  return (
    <BarStyled>
      <SelectTheme value={themeSelected} onChange={handleChange}>
        <option value={'Material'}>Material 3 by Google</option>
        <option value={'iOS'}>iOS 15.2 by Apple</option>
        <option value={'Fluent'}>Windows UI 2.7 by Microsoft</option>
        <option value={'Carbon'}>Carbon by IBM</option>
        <option value={'Sandbox'}>Sandbox by Kisakee</option>
      </SelectTheme>
    </BarStyled>
  );
};
