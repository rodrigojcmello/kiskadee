/** @vitest-environment jsdom */
import { resolve } from 'node:path';
import { compile } from 'sass';
import { afterEach, describe, expect, it } from 'vitest';

const componentsDirectory = resolve(process.cwd(), 'packages/components/react/src/components');
const buttonStyles = compile(resolve(componentsDirectory, 'Button/Button.structural.scss')).css;
const branches = [
  ['floating-notched', 'a'],
  ['standard-outline', 'b'],
  ['floating-inside', 'c'],
  ['standard-underline', 'd'],
  ['standard-borderless', 'e']
].map(([mode, letter]) => ({
  mode,
  letter,
  css: compile(resolve(componentsDirectory, `TextField/${mode}/TextField.${mode}.structural.scss`))
    .css
}));

afterEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
});

describe('TextField direct Button alignment', () => {
  it.each(branches)('centers multiple direct Buttons only in $mode for either stylesheet order', ({
    letter,
    css
  }) => {
    for (const sheets of [
      [buttonStyles, css],
      [css, buttonStyles]
    ]) {
      document.head.replaceChildren();
      document.body.replaceChildren();
      for (const sheet of sheets) {
        const style = document.createElement('style');
        style.textContent = sheet;
        document.head.append(style);
      }
      const region = document.createElement('span');
      region.className = `k-txf-e8-${letter}`;
      const copy = document.createElement('button');
      const send = document.createElement('button');
      const outside = document.createElement('button');
      const nested = document.createElement('button');
      const wrapper = document.createElement('span');
      const passive = document.createElement('span');
      const announcement = document.createElement('span');
      announcement.className = `k-txf-x4-${letter}`;
      announcement.textContent = 'Search cleared.';
      for (const button of [copy, send, outside, nested]) button.className = 'k-btn';
      copy.textContent = 'Copy';
      send.setAttribute('aria-label', 'Send');
      passive.textContent = 'R$';
      wrapper.append(nested);
      region.append(passive, copy, send, wrapper);
      document.body.append(region, outside, announcement);

      for (const direction of ['ltr', 'rtl']) {
        region.dir = direction;
        expect(getComputedStyle(copy).alignSelf).toBe('center');
        expect(getComputedStyle(send).alignSelf).toBe('center');
        expect(getComputedStyle(outside).alignSelf).toBe('flex-start');
        expect(getComputedStyle(nested).alignSelf).toBe('flex-start');
        expect(getComputedStyle(passive).alignSelf).not.toBe('center');
        expect(getComputedStyle(copy).fontSize).toBe('0px');
        const announcementStyles = getComputedStyle(announcement);
        expect(announcementStyles.position).toBe('absolute');
        expect(announcementStyles.blockSize).toBe('1px');
        expect(announcementStyles.inlineSize).toBe('1px');
        expect(announcementStyles.clipPath).toBe('inset(50%)');
        expect(announcementStyles.overflow).toBe('hidden');
        expect(announcementStyles.display).not.toBe('none');
        expect(announcementStyles.visibility).not.toBe('hidden');
      }
    }
  });
});
