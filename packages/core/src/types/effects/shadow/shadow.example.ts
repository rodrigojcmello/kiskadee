import type { ElementEffects } from '../index.ts';

const buttonEffects: ElementEffects = {
  shadow: {
    color: { rest: [0, 0, 0, 0.5] },
    blur: { rest: 5, hover: 10 },
    y: { rest: 2, hover: 4 },
    x: { rest: 2, hover: 4 }
  }
};

console.log(buttonEffects);
