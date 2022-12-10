/* eslint-disable unicorn/filename-case */
import { ButtonStyle } from '../Button/ButtonStyle';

export class TextStyle extends ButtonStyle {
  // textElementContainer() {
  //   return {
  //     color: TextStyle.containerColor(),
  //   };
  // }

  static containerColor() {
    return ButtonStyle.render({
      color: 'red',
    });
  }

  element() {
    return {
      container: this.elementContainer(),
    };
  }
}
