/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC, PropsWithChildren } from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
import type { ButtonType, ButtonVariant } from '../../../components/Button';
import { KiskadeeContext } from '../../../context';
import style from './ButtonDocumentation.module.scss';

const Applicable: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => {
  return (
    <div className={style.applicable}>
      <div className={style['applicable-table']}>
        <div className={style['applicable-cell']}>{children}</div>
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
  const [type, setType] = useState<ButtonType>('contained');
  const [pageLoad, setPageLoad] = useState(false);

  useLayoutEffect(() => {
    setTimeout(() => {
      setPageLoad(true);
    }, 50);
  }, []);

  useEffect(() => {
    setType('contained');
    setVariant('primary');
  }, [theme.name, theme.author, theme.version]);

  const buttonContainer = theme.component.button?.container;
  const buttonVariant =
    theme.component.button?.container?.type?.[type]?.variant;

  return (
    <Container className={!pageLoad ? style['no-transition'] : undefined}>
      <Box>
        <div>
          <BoxTitle>Contained</BoxTitle>
          {buttonContainer?.type?.contained ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type="contained"
                variant="primary"
                onClick={(): void => {
                  setType('contained');
                  setVariant('primary');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Outline</BoxTitle>
          {buttonContainer?.type?.outline ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type="outline"
                variant="primary"
                onClick={(): void => {
                  setType('outline');
                  setVariant('primary');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Flat</BoxTitle>
          {buttonContainer?.type?.flat ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type="flat"
                variant="primary"
                onClick={(): void => {
                  setType('flat');
                  setVariant('primary');
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
          <BoxTitle>Primary</BoxTitle>
          {buttonVariant?.primary ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
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
          {buttonVariant?.secondary ? (
            <Applicable>
              <Button
                text="Click me"
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
          {buttonVariant?.tertiary ? (
            <Applicable>
              <Button
                text="Click me"
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
          {buttonVariant?.success ? (
            <Applicable>
              <Button
                text="Click me"
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
          {buttonVariant?.warning ? (
            <Applicable>
              <Button
                text="Click me"
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
          {buttonVariant?.danger ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
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
          {buttonContainer?.base?.hover || buttonVariant?.[variant]?.hover ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type={type}
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
          {buttonContainer?.base?.focus || buttonVariant?.[variant]?.focus ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type={type}
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
          {buttonContainer?.base?.pressed ||
          buttonVariant?.[variant]?.pressed ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type={type}
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
          {buttonContainer?.base?.visited ||
          buttonVariant?.[variant]?.visited ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type={type}
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
          {buttonContainer?.base?.disabled ||
          buttonVariant?.[variant]?.disabled ? (
            <Applicable>
              <Button
                text="Text"
                width="block"
                type={type}
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
      <div className={style['width-container']}>
        <BoxTitle>Width options</BoxTitle>
        <div className={style.width}>
          <div>
            <Button
              text="Text"
              width="block"
              type={type}
              variant={variant}
              onClick={(): void => {}}
            />
          </div>
          <div>
            <Button
              text="Text text text text text text"
              width="auto"
              type={type}
              variant={variant}
              onClick={(): void => {}}
            />
          </div>
          <div>
            <Button
              text="Text"
              width="min-width"
              type={type}
              variant={variant}
              onClick={(): void => {}}
            />
          </div>
        </div>
      </div>
      <div>
        <BoxTitle>Radius Options</BoxTitle>
        <Box>
          <div>
            <BoxTitle>Default</BoxTitle>
            {buttonContainer?.option.borderRadius?.default !== undefined ? (
              <Applicable>
                <Button
                  text="Default"
                  width="block"
                  type={type}
                  variant={variant}
                  onClick={(): void => {}}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>Rounded</BoxTitle>
            {buttonContainer?.option.borderRadius?.rounded !== undefined ? (
              <Applicable>
                <Button
                  text="Rounded"
                  width="block"
                  borderRadius="rounded"
                  type={type}
                  variant={variant}
                  onClick={(): void => {}}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>Full</BoxTitle>
            {buttonContainer?.option.borderRadius?.full !== undefined ? (
              <Applicable>
                <Button
                  text="Full"
                  width="block"
                  borderRadius="full"
                  type={type}
                  variant={variant}
                  onClick={(): void => {}}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>None</BoxTitle>
            {buttonContainer?.option.borderRadius?.none !== undefined ? (
              <Applicable>
                <Button
                  text="Text"
                  width="block"
                  borderRadius="none"
                  type={type}
                  variant={variant}
                  onClick={(): void => {}}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
        </Box>
      </div>
    </Container>
  );
};
