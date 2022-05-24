import styled from '@emotion/styled';
import type { ChangeEvent, FC } from 'react';
import { useContext, useEffect, useState } from 'react';
import { KiskadeeContext } from '../../../context';
import { materialTheme } from '../../../themes/material/theme';
import { fluentTheme } from '../../../themes/fluent/theme';
import { iosTheme } from '../../../themes/ios/theme';
import { materialKiskadeeTheme } from '../../../themes/materialKiskadee/theme';
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
  Material: materialTheme,
  MaterialKiskadee: materialKiskadeeTheme,
  Fluent: fluentTheme,
  iOS: iosTheme,
};

export const Bar: FC = () => {
  const [, setTheme] = useContext(KiskadeeContext);
  const [themeSelected, setThemeSelected] = useState('Fluent');

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setThemeSelected(event.target.value);
  };

  useEffect(() => {
    setTheme(themes[themeSelected]);
  }, [themeSelected]);

  return (
    <BarStyled>
      <SelectTheme value={themeSelected} onChange={handleChange}>
        <option value="Material">Material 3 by Google</option>
        <option value="MaterialKiskadee">
          Material 3 (modified) by Kiskadee
        </option>
        <option value="iOS">iOS 15 by Apple</option>
        <option value="Fluent">Fluent by Microsoft</option>
        {/* <option value="Carbon">Carbon by IBM</option> */}
      </SelectTheme>
    </BarStyled>
  );
};
