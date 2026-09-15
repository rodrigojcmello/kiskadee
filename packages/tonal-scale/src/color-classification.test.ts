import { expect, it } from 'vitest';
import { classifyTonalReference } from './color-classification';

it('uses the generator sectors and explicitly represents achromatic references', () => {
  expect(classifyTonalReference('#0b57d0').sector).toBe('blue');
  expect(classifyTonalReference('#6750a4').sector).toBe('purple-blue');
  expect(classifyTonalReference('#808080').sector).toBeNull();
  expect(() => classifyTonalReference('invalid')).toThrow();
});
