import type { ComponentClassNameMapJSON, Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  appendDensityCss,
  compileDensityClassMaps,
  resolveSchemaDensityMaps
} from './compileDensity.ts';

describe('density schema handoff', () => {
  it('replaces the global mapping entirely for a single-density component', () => {
    const schema = {
      global: { density: { compact: 's:sm:1', spacious: 's:md:1' } },
      components: {
        button: { elements: {} },
        dropdown: { options: { density: { regular: 's:md:1' } }, elements: {} }
      }
    } as unknown as Schema;
    expect(resolveSchemaDensityMaps(schema)).toEqual({
      button: { c: 'sm:1', s: 'md:1' },
      dropdown: { r: 'md:1' }
    });
  });

  it('rejects invalid local mappings even when the global mapping is valid', () => {
    const schema = {
      global: { density: { regular: 's:md:1' } },
      components: { button: { options: { density: { compact: 's:sm:1' } } } }
    } as unknown as Schema;
    expect(() => resolveSchemaDensityMaps(schema)).toThrow('components.button.options.density');
  });

  it('rejects viewport overrides nested inside a fixed size recipe', () => {
    const schema = {
      global: { density: { regular: 's:md:1' } },
      components: {
        button: { elements: { e1: { padding: { 's:md:1': { 'bp:all': 8, 'bp:lg:1': 4 } } } } }
      }
    } as unknown as Schema;
    expect(() => resolveSchemaDensityMaps(schema)).toThrow('component sizes must be fixed');
  });
});

function fixture(): ComponentClassNameMapJSON {
  return {
    button: {
      e1: {
        s: { all: 'fm-common', 'sm:1': 'fm-small fm-shared', 'md:1': 'fm-medium fm-shared' },
        rr: { 'sm:1': 'fm-rs', 'md:1': 'fm-rm' },
        e: { rr: { 'sm:1': 'fm-es', 'md:1': 'fm-em' } },
        p: { gd: { 'sm:1': 'fm-div', 'md:1': 'fm-div' } }
      },
      e2: { s: { 'sm:1': 'fm-ts', 'md:1': 'fm-tm' } }
    }
  };
}

describe('density artifact lowering', () => {
  it('keeps one size map, shares identical classes and covers optional size buckets', () => {
    const maps = fixture();
    compileDensityClassMaps(maps, { button: { c: 'sm:1', s: 'md:1' } });
    const button = maps.button as any;
    expect(button.e1.s).toEqual({
      all: 'fm-common',
      'sm:1': 'fm-small fm-shared',
      'md:1': 'fm-medium fm-shared',
      a: 'fm-shared fm-small-dc fm-medium-ds'
    });
    expect(button.e1.rr.a).toBe('fm-rs-dc fm-rm-ds');
    expect(button.e1.e.rr.a).toBe('fm-es-dc fm-em-ds');
    expect(button.e1.p.gd.a).toBe('fm-div');
    expect(button.e2.s.a).toBe('fm-ts-dc fm-tm-ds');
  });

  it('reuses a single density without producing additional CSS', () => {
    const maps = fixture();
    const aliases = compileDensityClassMaps(maps, { button: { c: 'md:1' } });
    expect((maps.button as any).e1.s.a).toBe('fm-medium fm-shared');
    expect(appendDensityCss('.fm-medium{padding:8px}', aliases)).toBe('.fm-medium{padding:8px}');
  });

  it('preserves interaction selectors and enclosing rules with exclusive width ranges', () => {
    const aliases = compileDensityClassMaps(fixture(), { button: { c: 'sm:1', s: 'md:1' } });
    const css = appendDensityCss(
      '.fm-small{padding:4px}.fm-medium{padding:8px}' +
        '@media(hover:hover){.fm-es:hover,.fm-es.k-pressed{border-radius:2px}}',
      aliases
    );
    expect(css).toContain('@media (width >= 1152px)');
    expect(css).toContain('@media (width < 1152px)');
    expect(css).toContain('.fm-small-dc{padding:4px}');
    expect(css).toContain('.fm-medium-ds{padding:8px}');
    expect(css).toContain('.fm-es-dc:hover,.fm-es-dc.k-pressed{border-radius:2px}');
    expect(css).not.toContain('.fm-small-ds');
  });

  it('rejects absent sizes in each variant rather than silently substituting another size', () => {
    expect(() => compileDensityClassMaps(fixture(), { button: { c: 'sm:2', s: 'md:1' } })).toThrow(
      'unavailable size sm:2'
    );
  });
});

it('emits disjoint regular/mobile ranges alongside legacy two-density aliases', () => {
  const maps = fixture();
  const aliases = compileDensityClassMaps(maps, { button: { c: 'sm:1', r: 'md:1', s: 'md:1' } });
  const css = appendDensityCss('.fm-small { width: 10px } .fm-medium { width: 20px }', aliases);
  expect(css).toContain('(768px <= width < 1152px)');
  expect(css).toContain('(width < 768px)');
  expect(css).toContain('(width >= 1152px)');
  expect(css).toContain('.fm-medium-dr');
  expect(css).toContain('.fm-medium-dm');
  const single = fixture();
  compileDensityClassMaps(single, { button: { r: 'md:1' } });
  expect(single.button.e1.s.a).toBe('fm-medium fm-shared');
});
