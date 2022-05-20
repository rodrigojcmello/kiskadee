import styled from '@emotion/styled';
import type { ChangeEvent, FC } from 'react';
import { useContext, useEffect } from 'react';
import { KiskadeeContext } from '../../../context';
import { materialTheme } from '../../../themes/material/theme';
import { fluentTheme } from '../../../themes/fluent/theme';
import { iosTheme } from '../../../themes/ios/theme';
import type { KiskadeeSchema } from '../../../themes/theme.types';

const BarStyled = styled.div(() => ({
  padding: 8,
  borderBottom: '1px solid #ccc',
}));

const SelectTheme = styled.select(() => ({
  borderRadius: 8,
  border: '1px solid #ccc',
  height: 36,
  padding: '0 8px',
  width: 240,
}));

const themes: Record<string, KiskadeeSchema> = {
  material: materialTheme,
  fluent: fluentTheme,
  ios: iosTheme,
};

export const Bar: FC = () => {
  const [, setTheme] = useContext(KiskadeeContext);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setTheme(themes[event.target.value]);
  };

  useEffect(() => {
    setTheme(themes.ios);
  }, []);

  return (
    <BarStyled>
      <SelectTheme onChange={handleChange}>
        <option value="ios">iOS 15 by Apple</option>
        <option value="material">Material 3 by Google</option>
        <option value="fluent">Fluent 2 by Microsoft</option>
      </SelectTheme>
    </BarStyled>
  );
};
