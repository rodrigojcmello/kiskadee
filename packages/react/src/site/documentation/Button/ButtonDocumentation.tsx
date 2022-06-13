/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC, PropsWithChildren, ReactElement } from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Box } from '../../components/Box/Box';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
import type {
  ButtonType,
  ButtonVariant,
  ButtonProps,
} from '../../../components/Button';
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
  const [radius, setRadius] = useState<ButtonProps['borderRadius']>('default');
  const [iconType, setIconType] = useState<ButtonProps['iconType'] | undefined>(
    undefined
  );
  const [iconLeft, setIconLeft] = useState<ReactElement | undefined>(undefined);
  const [iconRight, setIconRight] = useState<ReactElement | undefined>(
    undefined
  );
  const [textAlign, setTextAlign] =
    useState<ButtonProps['textAlign']>(undefined);

  useLayoutEffect(() => {
    setTimeout(() => {
      setPageLoad(true);
    }, 50);
  }, []);

  useEffect(() => {
    setType('contained');
    setVariant('primary');
    setRadius('default');
    // setIconType(undefined);
    // setIconLeft(undefined);
    setTextAlign(undefined);
  }, [theme.name, theme.author, theme.version]);

  const buttonContainer = theme.component.button?.container;
  const buttonVariant =
    theme.component.button?.container?.type?.[type]?.variant;

  return (
    <Container className={!pageLoad ? style['no-transition'] : undefined}>
      <Box>
        <div>
          <BoxTitle>No icon</BoxTitle>
          {buttonContainer?.type?.contained ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
                variant={variant}
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setIconLeft(undefined);
                  setIconRight(undefined);
                  setIconType(undefined);
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Left attached icon</BoxTitle>
          {buttonContainer?.option?.icon?.leftAttached ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={
                  <span className="material-symbols-outlined">thumb_up</span>
                }
                iconType="attached"
                textAlign={textAlign}
                onClick={(): void => {
                  setIconLeft(
                    <span className="material-symbols-outlined">thumb_up</span>
                  );
                  setIconType('attached');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Left detached icon</BoxTitle>
          {buttonContainer?.option?.icon?.leftDetached ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={
                  <span className="material-symbols-outlined">thumb_up</span>
                }
                iconType="detached"
                textAlign={textAlign}
                onClick={(): void => {
                  setIconLeft(
                    <span className="material-symbols-outlined">thumb_up</span>
                  );
                  setIconType('detached');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Right attached icon</BoxTitle>
          {buttonContainer?.option?.icon?.rightAttached ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
                variant={variant}
                borderRadius={radius}
                iconRight={
                  <span className="material-symbols-outlined">expand_more</span>
                }
                iconType="attached"
                textAlign={textAlign}
                onClick={(): void => {
                  setIconRight(
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  );
                  setIconType('attached');
                }}
              />
            </Applicable>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Right detached icon</BoxTitle>
          {buttonContainer?.option?.icon?.rightDetached ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type={type}
                variant={variant}
                borderRadius={radius}
                iconRight={
                  <span className="material-symbols-outlined">expand_more</span>
                }
                iconType="detached"
                textAlign={textAlign}
                onClick={(): void => {
                  setIconRight(
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  );
                  setIconType('detached');
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
          <BoxTitle>Contained</BoxTitle>
          {buttonContainer?.type?.contained ? (
            <Applicable>
              <Button
                text="Click me"
                width="block"
                type="contained"
                variant="primary"
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setType('contained');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setType('outline');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setType('flat');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('secondary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('tertiary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('success');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('warning');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                textAlign={textAlign}
                onClick={(): void => {
                  setVariant('danger');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                interaction="hover"
                textAlign={textAlign}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                interaction="focus"
                textAlign={textAlign}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                interaction="pressed"
                textAlign={textAlign}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                interaction="visited"
                textAlign={textAlign}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
                borderRadius={radius}
                disabled
                textAlign={textAlign}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
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
              borderRadius={radius}
              textAlign={textAlign}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
          <div>
            <Button
              text="Text text text text text text"
              width="auto"
              type={type}
              variant={variant}
              borderRadius={radius}
              textAlign={textAlign}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
          <div>
            <Button
              text="Text"
              width="min"
              type={type}
              variant={variant}
              borderRadius={radius}
              textAlign={textAlign}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
        </div>
      </div>
      <div>
        <BoxTitle>Radius Options</BoxTitle>
        <Box>
          <div>
            <BoxTitle>
              Rounded
              {buttonContainer?.option?.borderRadius?.default ===
                buttonContainer?.option?.borderRadius?.rounded && ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.borderRadius?.rounded !== undefined ? (
              <Applicable>
                <Button
                  text="Text"
                  width="block"
                  borderRadius="rounded"
                  type={type}
                  variant={variant}
                  textAlign={textAlign}
                  onClick={(): void => setRadius('rounded')}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>
              Full
              {buttonContainer?.option?.borderRadius?.default ===
                buttonContainer?.option?.borderRadius?.full && ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.borderRadius?.full !== undefined ? (
              <Applicable>
                <Button
                  text="Text"
                  width="block"
                  borderRadius="full"
                  type={type}
                  variant={variant}
                  textAlign={textAlign}
                  onClick={(): void => setRadius('full')}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>
              None
              {buttonContainer?.option?.borderRadius?.default ===
                buttonContainer?.option?.borderRadius?.none && ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.borderRadius?.none !== undefined ? (
              <Applicable>
                <Button
                  text="Text"
                  width="block"
                  borderRadius="none"
                  type={type}
                  variant={variant}
                  textAlign={textAlign}
                  onClick={(): void => setRadius('none')}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
        </Box>
        <Box>
          <div>
            <BoxTitle>
              Left
              {buttonContainer?.option?.textAlign?.default === 'left' &&
                ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.textAlign?.left ? (
              <Applicable>
                <Button
                  text="Click me"
                  width="block"
                  textAlign="left"
                  type={type}
                  variant={variant}
                  borderRadius={radius}
                  onClick={(): void => {
                    setTextAlign('left');
                  }}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>
              Center
              {buttonContainer?.option?.textAlign?.default === 'center' &&
                ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.textAlign?.center ? (
              <Applicable>
                <Button
                  text="Click me"
                  width="block"
                  textAlign="center"
                  type={type}
                  variant={variant}
                  borderRadius={radius}
                  onClick={(): void => {
                    setTextAlign('center');
                  }}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
                />
              </Applicable>
            ) : (
              <NotApplicable />
            )}
          </div>
          <div>
            <BoxTitle>
              Right
              {buttonContainer?.option?.textAlign?.default === 'right' &&
                ' (default)'}
            </BoxTitle>
            {buttonContainer?.option?.textAlign?.right ? (
              <Applicable>
                <Button
                  text="Click me"
                  width="block"
                  textAlign="right"
                  type={type}
                  variant={variant}
                  borderRadius={radius}
                  onClick={(): void => {
                    setTextAlign('right');
                  }}
                  iconLeft={iconLeft}
                  iconRight={iconRight}
                  iconType={iconType}
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
