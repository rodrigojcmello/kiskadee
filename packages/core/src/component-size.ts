import type { ElementSizeValue } from './breakpoints.ts';

/** Public component sizes; schema scale identifiers remain canonical internally. */
export const componentSizeScales = {
  sm5: 's:sm:5',
  sm4: 's:sm:4',
  sm3: 's:sm:3',
  sm2: 's:sm:2',
  sm: 's:sm:1',
  md: 's:md:1',
  lg: 's:lg:1',
  lg2: 's:lg:2',
  lg3: 's:lg:3',
  lg4: 's:lg:4',
  lg5: 's:lg:5'
} as const satisfies Record<string, ElementSizeValue>;

export type ComponentSize = keyof typeof componentSizeScales;

/** Narrows public sizes to the scales supported by a component contract. */
export type ComponentSizeFor<Scale extends ElementSizeValue> = {
  [Size in ComponentSize]: (typeof componentSizeScales)[Size] extends Scale ? Size : never;
}[ComponentSize];

export function componentSizeToScale<Size extends ComponentSize>(
  size: Size
): (typeof componentSizeScales)[Size] {
  return componentSizeScales[size];
}

/** Converts preset catalog entries for public component consumption. */
export function componentScaleToSize<Scale extends ElementSizeValue>(
  scale: Scale
): ComponentSizeFor<Scale>;
export function componentScaleToSize<Scale extends ElementSizeValue>(
  scale: Scale | undefined
): ComponentSizeFor<Scale> | undefined;
export function componentScaleToSize(
  scale: ElementSizeValue | undefined
): ComponentSize | undefined {
  if (scale === undefined) return undefined;
  const [, family, level] = scale.split(':');
  return `${family}${level === '1' ? '' : level}` as ComponentSize;
}
