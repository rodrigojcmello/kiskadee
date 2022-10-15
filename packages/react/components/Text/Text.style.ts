/* eslint-disable unicorn/filename-case */
import { ButtonClass } from '../Button/Button.class';

export class TextStyle extends ButtonClass {
  elementContainer() {
    return {
      color: TextStyle.containerColor(),
    };
  }

  static containerColor() {
    return ButtonClass.render({
      color: 'red',
    });
  }

  element() {
    return {
      container: this.elementContainer(),
    };
  }
}
