/* eslint-disable unicorn/filename-case */
import type { KiskadeeStyleType } from '../../utils';
import { KiskadeeStyle } from '../../utils';
import type { ButtonStyleProps, ButtonOptions } from './Button.types';

export class ButtonGroupClass extends KiskadeeStyle {
  readonly borderRadius: ButtonStyleProps['borderRadius'];

  readonly options?: ButtonOptions;

  constructor(
    style: Pick<ButtonStyleProps, 'borderRadius' | 'options'> &
      KiskadeeStyleType
  ) {
    super(style);

    this.borderRadius = style.borderRadius;
    this.component = 'buttonGroup';
    this.options = style.componentOptions;
  }

  elementGroup() {
    return {
      base: this.groupBaseStyle(),
      radius: this.groupRadiusStyle(),
    };
  }

  groupRadiusStyle(): string | undefined {
    let state = 'borderRadiusNone';
    if (!this.borderRadius && this.options?.borderRadius) {
      state = `borderRadius${this.options?.borderRadius}`;
    } else if (this.borderRadius === 'Rounded') {
      state = 'borderRadiusRounded';
    } else if (this.borderRadius === 'Full') {
      state = 'borderRadiusFull';
    }

    return this.propertyRadiusStyle('container', state);
  }

  groupBaseStyle() {
    return this.cache(['buttonGroup', 'base'], () => {
      const elementStyle = this.getResponsiveStyle('container');

      const { '@media (min-width: 0px)': elementRest, ...elementResponsive } =
        KiskadeeStyle.pickResponsiveProperties(elementStyle, ['boxShadow']);

      return ButtonGroupClass.render({
        ...elementRest,
        ...elementResponsive,

        transitionProperty: 'box-shadow, border-radius',
        display: 'flex',
        '& > button': {
          boxShadow: 'none',
          width: 'auto',
          '&:hover': {
            // TODO: disable shadow if button rest has shadow
            boxShadow: 'none',
            zIndex: 1,
          },
        },
        '& > button:nth-child(n+2):nth-last-child(n+2)': {
          borderRadius: 0,
        },
        '& > button:first-child': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        '& > button:last-child': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      });
    });
  }
}
