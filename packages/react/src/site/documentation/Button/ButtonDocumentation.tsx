/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC } from 'react';
import { useContext, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
import { ButtonVariant } from '../../../components/Button/Button.types';
import { KiskadeeContext } from '../../../context';

const NotApplicable: FC = () => {
  return (
    <div style={{ textAlign: 'center', fontSize: 0, padding: '12px 0' }}>
      <span
        className="material-symbols-outlined"
        style={{ color: '#e6e6e6', fontSize: 24 }}
      >
        block
      </span>
    </div>
  );
};

export const ButtonDocumentation: FC = () => {
  const [theme] = useContext(KiskadeeContext);
  const [variant, setVariant] = useState<ButtonVariant>('primary');

  return (
    <Container>
      <Box>
        <div>
          <BoxTitle>Primary</BoxTitle>
          {theme.component.button?.container?.contained?.primary ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="primary"
              onClick={(): void => {
                setVariant('primary');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Secondary</BoxTitle>
          {theme.component.button?.container?.contained?.secondary ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="secondary"
              onClick={(): void => {
                setVariant('secondary');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Tertiary</BoxTitle>
          {theme.component.button?.container?.contained?.tertiary ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="tertiary"
              onClick={(): void => {
                setVariant('tertiary');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>

      <Box>
        <div>
          <BoxTitle>Success</BoxTitle>
          {theme.component.button?.container?.contained?.success ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="success"
              onClick={(): void => {
                setVariant('success');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Warning</BoxTitle>
          {theme.component.button?.container?.contained?.warning ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="warning"
              onClick={(): void => {
                setVariant('warning');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Danger</BoxTitle>

          {theme.component.button?.container?.contained?.danger ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant="danger"
              onClick={(): void => {
                setVariant('danger');
              }}
            />
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>
      <Box>
        <div>
          <BoxTitle>Hover</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.hover ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant={variant}
              interaction="hover"
              onClick={(): void => {}}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Focus</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.focus ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant={variant}
              interaction="focus"
              onClick={(): void => {}}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Pressed</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.pressed ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant={variant}
              interaction="pressed"
              onClick={(): void => {}}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Visited</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.visited ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant={variant}
              interaction="visited"
              onClick={(): void => {}}
            />
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Disabled</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.disabled ? (
            <Button
              text="Text"
              width="block"
              type="contained"
              variant={variant}
              disabled
              onClick={(): void => {}}
            />
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>
    </Container>
  );
};
