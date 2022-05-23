/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC } from 'react';
import { Button } from '../../../components/Button/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';

export const ButtonDocumentation: FC = () => {
  return (
    <Container>
      <Box>
        <div>
          <BoxTitle>Rest</BoxTitle>
          <Button text="Text" width="block" onClick={(): void => {}} />
        </div>

        <div>
          <BoxTitle>Hover</BoxTitle>
          <Button
            text="Text"
            width="block"
            interaction="hover"
            onClick={(): void => {}}
          />
        </div>

        <div>
          <BoxTitle>Focus</BoxTitle>
          <Button
            text="Text"
            width="block"
            interaction="focus"
            onClick={(): void => {}}
          />
        </div>

        <div>
          <BoxTitle>Pressed</BoxTitle>
          <Button
            text="Text"
            width="block"
            interaction="pressed"
            onClick={(): void => {}}
          />
        </div>

        <div>
          <BoxTitle>Visited</BoxTitle>
          <Button
            text="Text"
            width="block"
            interaction="visited"
            onClick={(): void => {}}
          />
        </div>
      </Box>
    </Container>
  );
};
