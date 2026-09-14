import postcss from 'postcss';
import { expect, it } from 'vitest';
import { partitionComponentCss } from './partitionComponentCss.ts';
import { buildSizeSupport } from './publishComponentResources.ts';

it('partitions shared rules by exact consumers, preserving media conditions and cascade', () => {
  const css =
    '.shared{width:10px}.a{width:20px}@media(width>5px){.shared{width:30px}}.b{color:red}';
  const chunks = partitionComponentCss(css, { a: { s: 'shared a' }, b: { s: 'shared b' } });
  expect(
    chunks
      .filter((part) => part.consumers.includes('a'))
      .map((part) => part.css)
      .join('')
  ).toContain('@media(width>5px){.shared{width:30px}}');
  const declarations: string[] = [];
  postcss.parse(chunks.map((part) => part.css).join('')).walkDecls('width', (decl) => {
    declarations.push(decl.value);
  });
  expect(declarations).toEqual(['10px', '20px', '30px']);
  expect(
    chunks
      .filter((part) => part.consumers.includes('a'))
      .every((part) => !part.css.includes('color:red'))
  ).toBe(true);
});
it('keeps recipe size support separate by active variant/mode and validates Medium', () => {
  const branch = (sizes: object) => ({ elements: { e1: { scales: { boxWidth: sizes } } } });
  expect(
    buildSizeSupport({
      variants: {
        one: { modes: { base: branch({ 's:md:1': 10 }) } },
        two: branch({ 's:sm:1': 10, 's:md:1': 15 })
      }
    })
  ).toEqual({
    variants: { one: { modes: { base: { sizes: ['md:1'] } } }, two: { sizes: ['md:1', 'sm:1'] } }
  });
  expect(() => buildSizeSupport(branch({ 's:lg:1': 20 }))).toThrow('Medium');
  expect(buildSizeSupport(branch({ boxWidth: 10 }))).toEqual({ sizes: [] });
});
it('scales to 2,000 components: selecting 15 never includes the other component rules', () => {
  const names = Array.from({ length: 2000 }, (_, index) => `component${index}`);
  const maps = Object.fromEntries(
    names.map((name) => [name, { e1: { s: { 'md:1': `${name} shared` } } }])
  );
  const css = `.shared{display:block}${names.map((name, index) => `.${name}{width:${index}px}`).join('')}`;
  const chunks = partitionComponentCss(css, maps);
  const active = new Set(names.slice(0, 15));
  const selected = chunks.filter((part) => part.consumers.some((name) => active.has(name)));
  expect(selected).toHaveLength(16);
  expect(selected.map((part) => part.css).join('')).not.toMatch(/\.component(?:15|1999)\{/);
  expect(chunks.filter((part) => part.css.includes('.shared{'))).toHaveLength(1);
});
