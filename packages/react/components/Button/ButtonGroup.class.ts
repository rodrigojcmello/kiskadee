/* eslint-disable unicorn/filename-case */
import type { KiskadeeStyleType } from '../../utils';
import { KiskadeeStyle } from '../../utils';

export class ButtonGroupClass extends KiskadeeStyle {
  constructor(style: KiskadeeStyleType) {
    super(style);

    this.component = 'buttonGroup';
  }

  elementGroup() {
    return {
      base: this.groupBaseStyle(),
    };
  }

  groupBaseStyle() {
    return this.cache(['group', 'base'], () => {
      return ButtonGroupClass.render({
        display: 'flex',
        '& > button': {
          boxShadow: 'none',
          '&:hover': {
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
