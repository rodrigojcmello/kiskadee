import { describe, expect, it } from 'vitest';
import {
  getButtonBackgroundForSurfaceContext,
  getButtonSurfaceContext
} from './getButtonSurfaceContext';

describe('getButtonSurfaceContext', () => {
  it.each([
    'white',
    'gray',
    'light-primary'
  ] as const)('uses the default context for the light surface %s', (surface) => {
    expect(getButtonSurfaceContext(surface)).toBe('default');
  });

  it.each([
    'primary',
    'dark-primary',
    'very-dark-primary',
    'dark-gray',
    'black'
  ] as const)('uses the inverse context for the strong surface %s', (surface) => {
    expect(getButtonSurfaceContext(surface)).toBe('inverse');
  });

  it.each([
    ['default', 'white'],
    ['inverse', 'primary']
  ] as const)('maps the %s context to its canonical %s background', (context, background) => {
    expect(getButtonBackgroundForSurfaceContext(context)).toBe(background);
  });
});
