/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC, ReactElement } from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import type {
  ButtonProps,
  ButtonType,
  ButtonVariant,
  Size,
} from '@kiskadee/react';
import { Button, KiskadeeContext } from '@kiskadee/react';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
// TODO: fix 2x and 3x
import logoGooglePng from './assets/logo-google.png';
import logoInstagram from './assets/logo-instagram.png';
import { ReactComponent as LogoGoogleSvg } from './assets/logo-google.svg';
import { ReactComponent as LogoInstagramSvg } from './assets/logo-instagram.svg';

import style from './ButtonDocumentation.module.scss';

const NotApplicable: FC = () => {
  return (
    <div className={style.buttonWrap}>
      <span
        className={'material-symbols-outlined'}
        style={{ color: '#e6e6e6', fontSize: 24 }}
      >
        block
      </span>
    </div>
  );
};

export const ButtonDocumentation: FC = () => {
  const [schema, setSchema] = useContext(KiskadeeContext);
  const [label, setLabel] = useState<string | undefined>('Click me');
  const [size, setSize] = useState<Size>('md');
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [type, setType] = useState<ButtonType>('contained');
  const [pageLoad, setPageLoad] = useState(false);
  const [radius, setRadius] = useState<ButtonProps['borderRadius']>();
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
    setRadius(undefined);
    setIconType(undefined);
    setIconLeft(undefined);
    setTextAlign(undefined);
  }, [schema.name, schema.author, schema.version]);

  const buttonOption = schema.component.button?.option;
  const buttonContainer =
    schema.component.button?.elements?.container?.light?.default;
  const buttonVariant = buttonContainer?.type?.[type]?.variant;

  const width = label ? 'block' : undefined;

  // TODO: document the responsiveness feature

  return (
    <Container className={!pageLoad ? style['no-transition'] : undefined}>
      <button
        type={'button'}
        onClick={() => {
          const mode = schema.theme?.only === 'dark' ? 'light' : 'dark';

          // TODO: create a setDarkMode / setContrastMode
          setSchema({
            ...schema,
            theme: {
              ...schema.theme,
              only: mode,
            },
          });
        }}
      >
        dark mode
      </button>
      <button
        type={'button'}
        onClick={() => {
          setSchema({
            ...schema,
            theme: {
              ...schema.theme,
              only: undefined,
            },
          });
        }}
      >
        OS Default
      </button>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Medium</BoxTitle>
          {buttonOption?.size?.sm ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                textAlign={textAlign}
                iconType={iconType}
                iconLeft={iconLeft}
                iconRight={iconRight}
                size={'md'}
                onClick={(): void => {
                  setSize('md');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Small</BoxTitle>
          {buttonOption?.size?.sm ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconType={iconType}
                iconLeft={iconLeft}
                iconRight={iconRight}
                textAlign={textAlign}
                size={'sm'}
                onClick={(): void => {
                  setSize('sm');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Large</BoxTitle>
          {buttonOption?.size?.lg ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconType={iconType}
                iconLeft={iconLeft}
                iconRight={iconRight}
                textAlign={textAlign}
                size={'lg'}
                onClick={(): void => {
                  setSize('lg');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Extra Large</BoxTitle>
          {buttonOption?.size?.lg ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconType={iconType}
                iconLeft={iconLeft}
                iconRight={iconRight}
                textAlign={textAlign}
                size={'xl'}
                onClick={(): void => {
                  setSize('xl');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Label</BoxTitle>
          {buttonContainer?.type?.contained ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                textAlign={textAlign}
                // size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconLeft(undefined);
                  setIconRight(undefined);
                  setIconType(undefined);
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Icon</BoxTitle>
          {buttonOption?.size?.sm ? (
            <div className={style.buttonWrap}>
              <Button
                type={type}
                variant={variant}
                borderRadius={radius}
                iconType={'Alone'}
                iconLeft={
                  <span className={'material-symbols-outlined'}>thumb_up</span>
                }
                size={size}
                onClick={(): void => {
                  setIconLeft(
                    <span className={'material-symbols-outlined'}>
                      thumb_up
                    </span>
                  );
                  setLabel(undefined);
                  setIconRight(undefined);
                  setIconType(undefined);
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Left attached icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={
                  <span className={'material-symbols-outlined'}>thumb_up</span>
                }
                iconType={'Attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconLeft(
                    <span className={'material-symbols-outlined'}>
                      thumb_up
                    </span>
                  );
                  setIconType('Attached');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Left detached icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={
                  <span className={'material-symbols-outlined'}>thumb_up</span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconLeft(
                    <span className={'material-symbols-outlined'}>
                      thumb_up
                    </span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Right attached icon</BoxTitle>
          {buttonOption?.icon?.enable?.right ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconRight={
                  <span className={'material-symbols-outlined'}>
                    expand_more
                  </span>
                }
                iconType={'Attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setIconType('Attached');
                  setLabel('Click me');
                  setIconRight(
                    <span className={'material-symbols-outlined'}>
                      expand_more
                    </span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Right detached icon</BoxTitle>
          {buttonOption?.icon?.enable?.right ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconRight={
                  <span className={'material-symbols-outlined'}>
                    expand_more
                  </span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconRight(
                    <span className={'material-symbols-outlined'}>
                      expand_more
                    </span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Detached PNG icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Sign in with Google'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<img src={logoGooglePng} alt={'Google'} />}
                iconRight={
                  <span className={'material-symbols-outlined'}>
                    chevron_right
                  </span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconLeft(<img src={logoGooglePng} alt={'Google'} />);
                  setIconRight(
                    <span className={'material-symbols-outlined'}>
                      chevron_right
                    </span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Detached SVG icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Sign in with Google'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<LogoGoogleSvg />}
                iconRight={
                  <span className={'material-symbols-outlined'}>
                    chevron_right
                  </span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconLeft(<LogoGoogleSvg />);
                  setIconRight(
                    <span className={'material-symbols-outlined'}>
                      chevron_right
                    </span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Attached font icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Sign in with Google'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<LogoGoogleSvg />}
                iconType={'Attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Attached');
                  setIconLeft(<LogoGoogleSvg />);
                  setIconRight(undefined);
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Detached PNG icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Share on Instagram'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<img src={logoInstagram} alt={'Google'} />}
                iconRight={
                  <span className={'material-symbols-outlined'}>share</span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconLeft(<img src={logoInstagram} alt={'Google'} />);
                  setIconRight(
                    <span className={'material-symbols-outlined'}>share</span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Detached SVG icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Share on Instagram'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<LogoInstagramSvg />}
                iconRight={
                  <span className={'material-symbols-outlined'}>share</span>
                }
                iconType={'Detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Detached');
                  setIconLeft(<LogoInstagramSvg />);
                  setIconRight(
                    <span className={'material-symbols-outlined'}>share</span>
                  );
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Attached font icon</BoxTitle>
          {buttonOption?.icon?.enable?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Share on Instagram'}
                width={'block'}
                type={type}
                variant={variant}
                borderRadius={radius}
                iconLeft={<LogoInstagramSvg />}
                iconType={'Attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('Attached');
                  setIconLeft(<LogoInstagramSvg />);
                  setIconRight(undefined);
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Contained</BoxTitle>
          {buttonContainer?.type?.contained ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'contained'}
                variant={'primary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setType('contained');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Outline</BoxTitle>
          {buttonContainer?.type?.outline ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'outline'}
                variant={'primary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setType('outline');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Flat</BoxTitle>
          {buttonContainer?.type?.flat ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'flat'}
                variant={'primary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setType('flat');
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Primary</BoxTitle>
          {buttonVariant?.primary ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={'primary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('primary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Secondary</BoxTitle>
          {buttonVariant?.secondary ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'contained'}
                variant={'secondary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('secondary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
        <div>
          <BoxTitle>Tertiary</BoxTitle>
          {buttonVariant?.tertiary ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'contained'}
                variant={'tertiary'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('tertiary');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Success</BoxTitle>
          {buttonVariant?.success ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'contained'}
                variant={'success'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('success');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Warning</BoxTitle>
          {buttonVariant?.warning ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={'contained'}
                variant={'warning'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('warning');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Danger</BoxTitle>
          {buttonVariant?.danger ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={'block'}
                type={type}
                variant={'danger'}
                borderRadius={radius}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setVariant('danger');
                }}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>Hover</BoxTitle>
          {buttonContainer?.base?.hover || buttonVariant?.[variant]?.hover ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                interaction={'hover'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Focus</BoxTitle>
          {buttonContainer?.base?.focus || buttonVariant?.[variant]?.focus ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                interaction={'focus'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Pressed</BoxTitle>
          {buttonContainer?.base?.pressed ||
          buttonVariant?.[variant]?.pressed ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                interaction={'pressed'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Visited</BoxTitle>
          {buttonContainer?.base?.visited ||
          buttonVariant?.[variant]?.visited ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                interaction={'visited'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>Disabled</BoxTitle>
          {buttonContainer?.base?.disabled ||
          buttonVariant?.[variant]?.disabled ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                type={type}
                variant={variant}
                borderRadius={radius}
                disabled
                textAlign={textAlign}
                size={size}
                onClick={(): void => {}}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={style.buttonRow}>
        <BoxTitle>Width options</BoxTitle>
        <div className={style.width}>
          <div>
            <Button
              label={'Text'}
              width={'block'}
              type={type}
              variant={variant}
              borderRadius={radius}
              textAlign={textAlign}
              size={size}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
          <div>
            <Button
              label={'Text text text text text text'}
              width={'auto'}
              type={type}
              variant={variant}
              borderRadius={radius}
              textAlign={textAlign}
              size={size}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
          <div>
            <Button
              label={'Text'}
              width={'min'}
              type={type}
              variant={variant}
              borderRadius={radius}
              textAlign={textAlign}
              size={size}
              onClick={(): void => {}}
              iconLeft={iconLeft}
              iconRight={iconRight}
              iconType={iconType}
            />
          </div>
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>
            Rounded
            {buttonOption?.borderRadius === 'Rounded' && ' (default)'}
          </BoxTitle>
          {buttonContainer?.base?.borderRadiusRounded ||
          buttonContainer?.type?.[type]?.variant?.[variant]
            ?.borderRadiusRounded ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'Rounded'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('Rounded')}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>
            Full
            {buttonOption?.borderRadius === 'Full' && ' (default)'}
          </BoxTitle>
          {buttonContainer?.base?.borderRadiusFull ||
          buttonContainer?.type?.[type]?.variant?.[variant]
            ?.borderRadiusFull ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'Full'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('Full')}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>
            None
            {buttonOption?.borderRadius === 'None' && ' (default)'}
          </BoxTitle>
          {buttonContainer?.base?.borderRadiusNone ||
          buttonContainer?.type?.[type]?.variant?.[variant]
            ?.borderRadiusNone ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'None'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('None')}
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={iconType}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>

      <div className={`${style.buttonRow} ${style.buttonGrid}`}>
        <div>
          <BoxTitle>
            Left
            {buttonOption?.textAlign?.default === 'left' && ' (default)'}
          </BoxTitle>
          {buttonOption?.textAlign?.left ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                textAlign={'left'}
                type={type}
                variant={variant}
                borderRadius={radius}
                size={size}
                onClick={(): void => {
                  setTextAlign('left');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>
            Center
            {buttonOption?.textAlign?.default === 'center' && ' (default)'}
          </BoxTitle>
          {buttonOption?.textAlign?.center ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                textAlign={'center'}
                type={type}
                variant={variant}
                borderRadius={radius}
                size={size}
                onClick={(): void => {
                  setTextAlign('center');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>

        <div>
          <BoxTitle>
            Right
            {buttonOption?.textAlign?.default === 'right' && ' (default)'}
          </BoxTitle>
          {buttonOption?.textAlign?.right ? (
            <div className={style.buttonWrap}>
              <Button
                label={'Click me'}
                width={'block'}
                textAlign={'right'}
                type={type}
                variant={variant}
                borderRadius={radius}
                size={size}
                onClick={(): void => {
                  setTextAlign('right');
                }}
              />
            </div>
          ) : (
            <NotApplicable />
          )}
        </div>
      </div>
    </Container>
  );
};
