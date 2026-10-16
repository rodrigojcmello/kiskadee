import { expectTypeOf, it } from 'vitest';
import type { AccordionProps } from './Accordion.types.ts';

it('accepts only the four bounded speed names and two coordination modes', () => {
  expectTypeOf<AccordionProps['motionSpeed']>().toEqualTypeOf<
    'normal' | 'fast' | 'slow' | 'debugSlow' | undefined
  >();
  expectTypeOf<AccordionProps['transitionCoordination']>().toEqualTypeOf<
    'synchronized' | 'independent' | undefined
  >();
  // @ts-expect-error Arbitrary milliseconds are not a public speed.
  const numeric: AccordionProps = { motionSpeed: 180 };
  // @ts-expect-error Arbitrary spring/duration objects are not a public speed.
  const custom: AccordionProps = { motionSpeed: { duration: 180 } };
  expectTypeOf(numeric).toMatchTypeOf<AccordionProps>();
  expectTypeOf(custom).toMatchTypeOf<AccordionProps>();
});
