import { ButtonStyle } from './Button.style';

const mock = {
  iconType: 'detached',
  width: 'auto',
  typeStyle: 'contained',
  variant: 'primary',
  borderRadius: 'default',
};

describe('ButtonStyle', () => {
  describe('Render', () => {
    test('Empty object should return undefined.', () => {
      expect(ButtonStyle.render({})).toBeUndefined();
    });
    test('Filled style object should return a className', () => {
      expect(ButtonStyle.render({ color: 'red' })).toEqual(
        expect.objectContaining({
          className: expect.any(String),
        })
      );
    });
    test('First parameter as empty object and second one as filled should return undefined', () => {
      expect(ButtonStyle.render({}, { color: 'red' })).toBeUndefined();
    });
    test('Both parameters as empty object should return undefined', () => {
      expect(ButtonStyle.render({}, {})).toBeUndefined();
    });
  });
});
