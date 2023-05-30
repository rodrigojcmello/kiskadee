import { TextStyle } from './Text.style';

const mock = {
  iconType: 'detached',
  width: 'auto',
  typeStyle: 'contained',
  variant: 'primary',
  borderRadius: 'default',
};

describe('Text Component', () => {
  describe('Render', () => {
    it('Empty object should return undefined.', () => {
      expect(TextStyle.render({})).toBeUndefined();
    });
    it('Filled style object should return a className', () => {
      expect(TextStyle.render({ color: 'red' })).toEqual(
        expect.objectContaining({
          className: expect.any(String),
        })
      );
    });
    // test('First parameter as empty object and second one as filled should return undefined', () => {
    //   expect(TextStyle.render({}, { color: 'red' })).toBeUndefined();
    // });
    // test('Both parameters as empty object should return undefined', () => {
    //   expect(TextStyle.render({}, {})).toBeUndefined();
    // });
    // test('Both parameters as filled should return a className', () => {
    //   expect(TextStyle.render({ color: 'red' }, { color: 'red' })).toEqual(
    //     expect.objectContaining({
    //       className: expect.any(String),
    //     })
    //   );
    // });
  });
});
