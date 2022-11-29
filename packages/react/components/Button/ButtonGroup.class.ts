/* eslint-disable unicorn/filename-case */
import { keyframes } from '@stitches/core';

import { KiskadeeStyle } from '../../utils';

const rippleKeyframe = keyframes({
  to: {
    transform: 'scale(4)',
    opacity: 0,
  },
});

export class ButtonGroupClass extends KiskadeeStyle {
  elementGroup() {
    return {
      base: this.groupBaseStyle(),
    };
  }

  groupBaseStyle() {
    return this.cache(['group', 'base'], () => {
      return ButtonGroupClass.render({
        display: 'flex',
      });
    });
  }
}
