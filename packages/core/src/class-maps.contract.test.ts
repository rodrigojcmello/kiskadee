import { describe, expectTypeOf, it } from 'vitest';
import type {
  ButtonGroupClassMapJSON,
  ButtonGroupFrameOmissions,
  ComponentClassNameMapSplitJSON,
  ComponentProjectedClassNameMapJSON
} from './schema.ts';

describe('Component class-map projection contract', () => {
  it('accepts connected Button metadata in core and split palette class maps', () => {
    const group = {
      frame: { s: { 'md:1': 'border-width' } },
      member: { d: 'border-off' },
      frameOmissions: { v: { neutral: { m: { pressed: true, selected: true } } } }
    } satisfies ButtonGroupClassMapJSON;
    const button = {
      e1: { d: 'root' },
      selectionRest: { e1: { c: { v: { neutral: { h: 'high-rest' } } } } },
      group
    } satisfies ComponentProjectedClassNameMapJSON;
    const split = {
      core: { button },
      palettes: { 'default.light': { button } }
    } satisfies ComponentClassNameMapSplitJSON;

    expectTypeOf<typeof split>().toExtend<ComponentClassNameMapSplitJSON>();
  });

  it('keeps omission metadata bounded rather than accepting arbitrary projection values', () => {
    expectTypeOf<{
      v: { neutral: { m: { pressed: false } } };
    }>().not.toExtend<ButtonGroupFrameOmissions>();
    expectTypeOf<{
      group: { frameOmissions: string };
    }>().not.toExtend<ComponentProjectedClassNameMapJSON>();
  });
});
