'use client';

import './Layout.structural.scss';

import { forwardRef } from 'react';
import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { resolveLayoutClassNames } from './Layout.class-names.ts';
import type { LayoutClassesMap, LayoutProps } from './Layout.types.ts';

const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  {
    padding,
    margin,
    gap,
    display,
    direction,
    wrap,
    align,
    justify,
    columns,
    className,
    classNames,
    children,
    ...restProps
  },
  ref
) {
  const { classesMap } = useKiskadee();
  const map = useComponentClassMap('layout', classesMap.layout as LayoutClassesMap | undefined);
  const resolved = resolveLayoutClassNames(map, {
    padding,
    margin,
    gap,
    display,
    direction,
    wrap,
    align,
    justify,
    columns,
    className,
    classNames
  });

  return (
    <div {...restProps} ref={ref} className={resolved.e1}>
      <div className={resolved.e2} style={resolved.e2Style}>
        {children}
      </div>
    </div>
  );
});

export const Layout = withComponentResources('layout', LayoutRoot);
