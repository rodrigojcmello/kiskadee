import {
  type BreakpointValue,
  type ClassNameByElementJSON,
  componentSizeToScale,
  type LayoutResponsiveColumns,
  layoutColumnCssVariables
} from '@kiskadee/core';
import type { CSSProperties } from 'react';
import { joinClassNames } from '../../shared/class-resolution/classNames.ts';
import type {
  LayoutClassesMap,
  LayoutProps,
  LayoutSpacing,
  LayoutSpacingSize
} from './Layout.types.ts';

type Edge = 'blockStart' | 'inlineEnd' | 'blockEnd' | 'inlineStart';
type SpacingKey = 'pt' | 'pr' | 'pb' | 'pl' | 'mt' | 'mr' | 'mb' | 'ml';

const edges: readonly Edge[] = ['blockStart', 'inlineEnd', 'blockEnd', 'inlineStart'];
const paddingKeys = ['pt', 'pr', 'pb', 'pl'] as const;
const marginKeys = ['mt', 'mr', 'mb', 'ml'] as const;
const paddingModifiers = ['a', 'b', 'c', 'd'] as const;
const marginModifiers = ['e', 'f', 'g', 'h'] as const;

function edgeSize(value: LayoutSpacing | undefined, edge: Edge): LayoutSpacingSize | undefined {
  if (typeof value !== 'object' || value === null) return value;
  const axis = edge === 'blockStart' || edge === 'blockEnd' ? 'block' : 'inline';
  return value[edge] ?? value[axis];
}

function spacingClass(
  element: ClassNameByElementJSON | undefined,
  property: SpacingKey,
  size: LayoutSpacingSize | undefined,
  modifier: string
): string | undefined {
  if (!size) return undefined;
  const scale = componentSizeToScale(size);
  if (!scale) return undefined;
  const bucket = element?.sp?.[property];
  const selected = bucket?.[scale.slice(2)];
  if (!selected) return undefined;
  return joinClassNames(bucket?.all, selected, modifier);
}

type LayoutColumnStyle = CSSProperties &
  Partial<Record<(typeof layoutColumnCssVariables)[BreakpointValue], number>>;

function resolveColumns(
  element: ClassNameByElementJSON | undefined,
  columns: LayoutResponsiveColumns | undefined
): { className: string; style: LayoutColumnStyle } | undefined {
  if (!element?.gc || columns == null) return undefined;
  if (typeof columns !== 'number' && (typeof columns !== 'object' || Array.isArray(columns))) {
    return undefined;
  }

  const entries =
    typeof columns === 'number' ? [['bp:all', columns] as const] : Object.entries(columns);
  const classes: string[] = [];
  const style: LayoutColumnStyle = {};
  for (const [breakpoint, count] of entries) {
    if (
      !Object.hasOwn(layoutColumnCssVariables, breakpoint) ||
      typeof count !== 'number' ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 12
    ) {
      continue;
    }
    const key = breakpoint as BreakpointValue;
    const className = element.gc[key];
    if (!className) continue;
    // Pair every active selector with a local value instead of consuming inherited columns.
    classes.push(className);
    style[layoutColumnCssVariables[key]] = count;
  }

  return classes.length ? { className: classes.join(' '), style } : undefined;
}

/** Select property-scoped utility references; never combine whole size recipes. */
export function resolveLayoutClassNames(
  map: LayoutClassesMap | undefined,
  {
    padding,
    margin,
    gap,
    display = 'block',
    direction = 'row',
    wrap = false,
    align = 'stretch',
    justify = 'start',
    columns,
    className,
    classNames
  }: Pick<
    LayoutProps,
    | 'padding'
    | 'margin'
    | 'gap'
    | 'display'
    | 'direction'
    | 'wrap'
    | 'align'
    | 'justify'
    | 'columns'
    | 'className'
    | 'classNames'
  >
): Record<'e1' | 'e2', string | undefined> & { e2Style?: CSSProperties } {
  const rowGap = typeof gap === 'object' && gap !== null ? gap.row : gap;
  const columnGap = typeof gap === 'object' && gap !== null ? gap.column : gap;
  const resolvedColumns = display === 'grid' ? resolveColumns(map?.e2, columns) : undefined;
  const directionModifier = { row: '', 'row-reverse': 'e', column: 'f', 'column-reverse': 'g' };
  const alignModifier = { stretch: '', start: 'i', center: 'j', end: 'k', baseline: 'l' };
  const justifyModifier = {
    start: 'm',
    center: 'n',
    end: 'o',
    between: 'p',
    around: 'q',
    evenly: 'r'
  };

  return {
    e1: joinClassNames(
      'k-lyt',
      map?.e1?.d,
      ...edges.map((edge, index) =>
        spacingClass(
          map?.e1,
          paddingKeys[index]!,
          edgeSize(padding, edge),
          `k-lyt-e1${paddingModifiers[index]}`
        )
      ),
      ...edges.map((edge, index) =>
        spacingClass(
          map?.e1,
          marginKeys[index]!,
          edgeSize(margin, edge),
          `k-lyt-e1${marginModifiers[index]}`
        )
      ),
      classNames?.e1,
      className
    ),
    e2: joinClassNames(
      'k-lyt-e2',
      map?.e2?.d,
      spacingClass(map?.e2, 'pt', rowGap, 'k-lyt-e2a'),
      spacingClass(map?.e2, 'pl', columnGap, 'k-lyt-e2b'),
      display === 'flex' && 'k-lyt-e2c',
      display === 'grid' && 'k-lyt-e2d',
      display === 'flex' &&
        directionModifier[direction] &&
        `k-lyt-e2${directionModifier[direction]}`,
      display === 'flex' && wrap && 'k-lyt-e2h',
      alignModifier[align] && `k-lyt-e2${alignModifier[align]}`,
      `k-lyt-e2${justifyModifier[justify]}`,
      resolvedColumns?.className,
      classNames?.e2
    ),
    e2Style: resolvedColumns?.style
  };
}
