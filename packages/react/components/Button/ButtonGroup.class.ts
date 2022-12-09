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
      const groupStyle = this.getResponsiveStyle('group');
      const containerStyle = this.getResponsiveStyle('container');

      const {
        '@media (min-width: 0px)': boxShadowRest,
        ...boxShadowResponsive
      } = KiskadeeStyle.pickResponsiveProperties(containerStyle, [
        'boxShadow',
        'background',
      ]);

      const { '@media (min-width: 0px)': divisorRest, ...divisorResponsive } =
        KiskadeeStyle.pickResponsiveProperties(groupStyle, [
          'height',
          'background',
          'top',
        ]);

      return ButtonGroupClass.render({
        ...boxShadowRest,
        ...boxShadowResponsive,

        transitionProperty: 'background, box-shadow, border-radius',
        display: 'flex',

        '& > .--interacted': {
          zIndex: 1,
          '& + span': {
            zIndex: 0,
          },
        },

        '& > span': {
          marginRight: -1,
          position: 'relative',

          '&:hover, &:active, &:focus': {
            zIndex: 1,
            '& + span': {
              zIndex: 0,
            },
            '& button::before': {
              background: 'transparent',
            },
            '& button::after': {
              background: 'transparent',
            },
          },

          '&:last-child': {
            marginRight: 0,

            '&::after': {
              content: 'none',
            },
          },

          '& > button': {
            boxShadow: 'none',
            width: 'auto',

            '&:focus-visible': {
              '&::after': {
                background: 'transparent',
                transitionDuration: '0ms',
              },
              '&::before': {
                background: 'transparent',
                transitionDuration: '0ms',
              },
            },

            '&::after': {
              transitionProperty: 'background, height, top',
              transitionDuration: 'inherit',
              transitionTimingFunction: 'inherit',
              content: '""',
              position: 'absolute',
              left: 0,
              width: 1,
              ...divisorRest,
              ...divisorResponsive,
              // background: 'red',
            },

            '&::before': {
              transitionProperty: 'background, height, top',
              transitionDuration: 'inherit',
              transitionTimingFunction: 'inherit',
              content: '""',
              position: 'absolute',
              right: 0,
              width: 1,
              ...divisorRest,
              ...divisorResponsive,
              // background: 'red',
            },

            '&:hover': {
              // TODO: disable shadow if button rest has shadow
              boxShadow: 'none',
            },
          },

          '&:nth-child(n+2):nth-last-child(n+2) > button': {
            borderRadius: 0,
          },

          '&:first-child > button': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },

          '&:last-child > button': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            marginRight: 0,
            '&::after': {
              content: 'none',
            },
          },
        },
      });
    });
  }
}
