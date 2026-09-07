/** @vitest-environment jsdom */
import { resolve } from 'node:path';
import { compile } from 'sass';
import { afterEach, describe, expect, it } from 'vitest';

const switchDirectory = resolve(process.cwd(), 'packages/components/react/src/components/Switch');
const base = compile(resolve(switchDirectory, 'Switch.structural.scss')).css;
const motion = compile(
  resolve(switchDirectory, 'effects/motion/SwitchRuntimeMotion.structural.scss')
).css;

afterEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('Switch motion stylesheet ordering', () => {
  it.each([
    ['base first', [base, motion]],
    ['motion first', [motion, base]]
  ] as const)('preserves runtime geometry with %s', (_name, sheets) => {
    for (const css of sheets) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.append(style);
    }
    const thumb = document.createElement('span');
    thumb.className = 'k-swt-e3-a k-swt-e3d-a';
    document.body.append(thumb);
    const style = getComputedStyle(thumb);
    expect(style.insetBlockStart).toBe('var(--k-swt-ty)');
    expect(style.insetInlineStart).toBe('var(--k-swt-ti)');
    expect(style.transform).toBe('none');
    expect(style.pointerEvents).toBe('auto');
  });
});
