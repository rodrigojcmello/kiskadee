/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC, ReactElement } from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Container } from '../../components/Container/Container';
import { BoxTitle } from '../../components/BoxTitle/BoxTitle';
import type {
  ButtonType,
  ButtonVariant,
  ButtonProps,
  Size,
} from '../../../components/Button';
import { KiskadeeContext } from '../../../context';
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
  const [theme] = useContext(KiskadeeContext);
  const [label, setLabel] = useState<string | undefined>('Click me');
  const [size, setSize] = useState<Size>('md');
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
    setIconType(undefined);
    setIconLeft(undefined);
    setTextAlign(undefined);
  }, [theme.name, theme.author, theme.version]);

  const buttonOption = theme.component.button?.option;
  const buttonContainer =
    theme.component.button?.elements?.container?.light?.default;
  const buttonVariant = buttonContainer?.type?.[type]?.variant;

  const width = label ? 'block' : undefined;

  // TODO: document the responsiveness feature

  return (
    <Container className={!pageLoad ? style['no-transition'] : undefined}>
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
                dark
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
                iconType={'attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconLeft(
                    <span className={'material-symbols-outlined'}>
                      thumb_up
                    </span>
                  );
                  setIconType('attached');
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
                iconType={'detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('detached');
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
                iconType={'attached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setIconType('attached');
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
                iconType={'detached'}
                textAlign={textAlign}
                size={size}
                onClick={(): void => {
                  setLabel('Click me');
                  setIconType('detached');
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
            {buttonOption?.borderRadius?.default ===
              buttonOption?.borderRadius?.variant?.rounded && ' (default)'}
          </BoxTitle>
          {buttonOption?.borderRadius?.variant?.rounded !== undefined ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'rounded'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('rounded')}
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
            {buttonOption?.borderRadius?.default ===
              buttonOption?.borderRadius?.variant?.full && ' (default)'}
          </BoxTitle>
          {buttonOption?.borderRadius?.variant?.full !== undefined ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'full'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('full')}
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
            {buttonOption?.borderRadius?.default ===
              buttonOption?.borderRadius?.none && ' (default)'}
          </BoxTitle>
          {buttonOption?.borderRadius?.none !== undefined ? (
            <div className={style.buttonWrap}>
              <Button
                label={label}
                width={width}
                borderRadius={'none'}
                type={type}
                variant={variant}
                textAlign={textAlign}
                size={size}
                onClick={(): void => setRadius('none')}
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
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={'detached'}
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
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={'detached'}
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
                iconLeft={iconLeft}
                iconRight={iconRight}
                iconType={'detached'}
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
