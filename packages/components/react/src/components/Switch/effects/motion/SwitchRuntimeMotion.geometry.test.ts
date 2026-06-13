/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  applySwitchRuntimeMotionGeometry,
  calculateSwitchRuntimeMotionGeometry,
  clearSwitchRuntimeMotionGeometry
} from './SwitchRuntimeMotion.geometry.ts';

function numberPropertyValue(element: HTMLElement, property: string): number {
  const value = element.style.getPropertyValue(property);
  return Number.parseFloat(value);
}

describe('SwitchRuntimeMotionGeometry', () => {
  it('calcula a geometria baseada no tamanho real de track e thumb', () => {
    const track = document.createElement('span');
    const thumb = document.createElement('span');
    const scope = document.createElement('span');

    scope.appendChild(track);
    track.appendChild(thumb);
    track.style.paddingInlineStart = '4px';
    track.style.paddingInlineEnd = '2px';
    track.style.paddingBlockStart = '3px';
    track.style.paddingBlockEnd = '0px';

    Object.defineProperty(track, 'clientWidth', { value: 120 });
    Object.defineProperty(track, 'clientHeight', { value: 32 });
    Object.defineProperty(thumb, 'offsetWidth', { value: 30 });
    Object.defineProperty(thumb, 'offsetHeight', { value: 14 });

    const geometry = calculateSwitchRuntimeMotionGeometry(track, thumb);

    expect(geometry.translation).toBe(84);
    expect(geometry.inlineStart).toBe(4);
    expect(geometry.blockStart).toBe(10.5);
    expect(geometry.isReducedThumb).toBe(false);

    applySwitchRuntimeMotionGeometry(track, geometry);
    expect(numberPropertyValue(track, '--k-swt-tx')).toBe(84);
    expect(numberPropertyValue(track, '--k-swt-ti')).toBe(4);
    expect(numberPropertyValue(track, '--k-swt-ty')).toBe(10.5);

    expect(numberPropertyValue(scope, '--k-swt-tx')).toBe(84);
    expect(numberPropertyValue(scope, '--k-swt-ti')).toBe(4);
    expect(numberPropertyValue(scope, '--k-swt-ty')).toBe(10.5);
  });

  it('keeps compact thumbs on generated padding unless reduced alignment is requested', () => {
    const track = document.createElement('span');
    const thumb = document.createElement('span');

    track.style.paddingInlineStart = '2px';
    track.style.paddingInlineEnd = '2px';
    track.style.paddingBlockStart = '0px';
    track.style.paddingBlockEnd = '0px';

    Object.defineProperty(track, 'clientWidth', { value: 40 });
    Object.defineProperty(track, 'clientHeight', { value: 20 });
    Object.defineProperty(thumb, 'offsetWidth', { value: 14 });
    Object.defineProperty(thumb, 'offsetHeight', { value: 14 });

    expect(calculateSwitchRuntimeMotionGeometry(track, thumb)).toEqual({
      translation: 22,
      inlineStart: 2,
      blockStart: 3,
      isReducedThumb: true
    });

    expect(calculateSwitchRuntimeMotionGeometry(track, thumb, { alignReducedThumb: true })).toEqual(
      {
        translation: 16,
        inlineStart: 5,
        blockStart: 3,
        isReducedThumb: true
      }
    );

    expect(
      calculateSwitchRuntimeMotionGeometry(track, thumb, {
        preserveReducedThumbAlignment: true
      })
    ).toEqual({
      translation: 16,
      inlineStart: 5,
      blockStart: 3,
      isReducedThumb: true
    });
  });

  it('remove propriedades de geometria de escopo e elemento', () => {
    const track = document.createElement('span');
    const thumb = document.createElement('span');
    const scope = document.createElement('span');

    scope.appendChild(track);
    track.appendChild(thumb);

    applySwitchRuntimeMotionGeometry(track, {
      translation: 10,
      inlineStart: 2,
      blockStart: 3
    });
    clearSwitchRuntimeMotionGeometry(track);

    expect(track.style.getPropertyValue('--k-swt-tx')).toBe('');
    expect(track.style.getPropertyValue('--k-swt-ti')).toBe('');
    expect(track.style.getPropertyValue('--k-swt-ty')).toBe('');
    expect(scope.style.getPropertyValue('--k-swt-tx')).toBe('');
    expect(scope.style.getPropertyValue('--k-swt-ti')).toBe('');
    expect(scope.style.getPropertyValue('--k-swt-ty')).toBe('');
  });
});
