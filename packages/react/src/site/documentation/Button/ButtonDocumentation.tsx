/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC } from 'react';
import { Button } from '../../../components/Button/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';

export const ButtonDocumentation: FC = () => {
  return (
    <Container>
      <Box>
        <div>
          <Button text="Text" width="block" onClick={(): void => {}} />
        </div>

        <div>
          <Button text="Text" width="block" hover onClick={(): void => {}} />
        </div>

        <div>
          <Button text="Text" width="block" focus onClick={(): void => {}} />
        </div>

        <div>
          <Button text="Text" width="block" pressed onClick={(): void => {}} />
        </div>

        <div>
          <Button text="Text" width="block" visited onClick={(): void => {}} />
        </div>
      </Box>
    </Container>
  );
};
