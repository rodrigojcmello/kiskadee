/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC, PropsWithChildren } from 'react';
import { useContext, useState } from 'react';
import { Button } from '../../../components/Button/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
import { ButtonVariant } from '../../../components/Button/Button.types';
import { KiskadeeContext } from '../../../context';
import style from './ButtonDocumentation.module.scss';

const Applicable: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => {
  return (
    <div className={style.applicable}>
      <div className={style['applicable-outer']}>
        <div className={style['applicable-middle']}>
          <div className={style['applicable-inner']}>{children}</div>
        </div>
      </div>
    </div>
  );
};

const NotApplicable: FC = () => {
  return (
    <div style={{ textAlign: 'center', fontSize: 0, padding: '13px 0' }}>
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
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="primary"
                onClick={(): void => {
                  setVariant('primary');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Secondary</BoxTitle>
          {theme.component.button?.container?.contained?.secondary ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="secondary"
                onClick={(): void => {
                  setVariant('secondary');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Tertiary</BoxTitle>
          {theme.component.button?.container?.contained?.tertiary ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="tertiary"
                onClick={(): void => {
                  setVariant('tertiary');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>

      <Box>
        <div>
          <BoxTitle>Success</BoxTitle>
          {theme.component.button?.container?.contained?.success ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="success"
                onClick={(): void => {
                  setVariant('success');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Warning</BoxTitle>
          {theme.component.button?.container?.contained?.warning ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="warning"
                onClick={(): void => {
                  setVariant('warning');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Danger</BoxTitle>

          {theme.component.button?.container?.contained?.danger ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant="danger"
                onClick={(): void => {
                  setVariant('danger');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>
      <Box>
        <div>
          <BoxTitle>Hover</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.hover ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant={variant}
                interaction="hover"
                onClick={(): void => {}}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Focus</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.focus ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant={variant}
                interaction="focus"
                onClick={(): void => {}}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Pressed</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.pressed ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant={variant}
                interaction="pressed"
                onClick={(): void => {}}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Visited</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.visited ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant={variant}
                interaction="visited"
                onClick={(): void => {}}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Disabled</BoxTitle>
          {theme.component.button?.container?.contained?.[variant]?.disabled ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type="contained"
                variant={variant}
                disabled
                onClick={(): void => {}}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
      </Box>
    </Container>
  );
};
