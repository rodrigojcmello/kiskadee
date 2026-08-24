'use client';

import './Badge.structural.scss';
import { Children, createContext, forwardRef, type ReactNode, useContext } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import {
  DEFAULT_BADGE_EMPHASIS,
  DEFAULT_BADGE_INTENT,
  DEFAULT_BADGE_RADIUS,
  DEFAULT_BADGE_SCALE,
  resolveBadgeClassNames
} from './Badge.class-names.ts';
import type { BadgeClassesMap, BadgeDotProps, BadgeProps, BadgeSlotProps } from './Badge.types.ts';

type BadgeSlotContextValue = ReturnType<typeof resolveBadgeClassNames>;
const BadgeSlotContext = createContext<BadgeSlotContextValue | undefined>(undefined);

function useBadgeSlot(name: keyof BadgeSlotContextValue): string {
  const context = useContext(BadgeSlotContext);
  if (!context) throw new Error(`Badge.${name} must be rendered inside Badge.`);
  return context[name];
}

const BadgeLabel = forwardRef<HTMLSpanElement, BadgeSlotProps>(function BadgeLabel(
  { className, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      className={[useBadgeSlot('e2'), className].filter(Boolean).join(' ')}
    />
  );
});

const BadgeIcon = forwardRef<HTMLSpanElement, BadgeSlotProps>(function BadgeIcon(
  { className, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      className={[useBadgeSlot('e3'), className].filter(Boolean).join(' ')}
    />
  );
});

const BadgeCount = forwardRef<HTMLSpanElement, BadgeSlotProps>(function BadgeCount(
  { className, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      className={[useBadgeSlot('e4'), className].filter(Boolean).join(' ')}
    />
  );
});

function normalizeChildren(children: ReactNode): ReactNode {
  return Children.map(flattenFragmentChildren(children), (child) => {
    if (typeof child === 'string' || typeof child === 'number' || typeof child === 'bigint') {
      return <BadgeLabel>{child}</BadgeLabel>;
    }
    return child;
  });
}

const BadgeRoot = forwardRef<HTMLSpanElement, BadgeProps>(function BadgeRoot(
  {
    className,
    classNames = {},
    emphasis = DEFAULT_BADGE_EMPHASIS,
    intent = DEFAULT_BADGE_INTENT,
    radius = DEFAULT_BADGE_RADIUS,
    scale = DEFAULT_BADGE_SCALE,
    surfaceContext: explicitSurfaceContext,
    children,
    ...props
  },
  ref
) {
  const { classesMap } = useKiskadee();
  const surfaceContext = useSurfaceContext(explicitSurfaceContext);
  const elements =
    useComponentClassMap('badge', classesMap.badge as BadgeClassesMap | undefined) ?? {};
  const resolved = resolveBadgeClassNames({
    elements,
    className,
    classNames,
    intent,
    emphasis,
    scale,
    radius,
    surfaceContext
  });

  return (
    <BadgeSlotContext.Provider value={resolved}>
      <span {...props} ref={ref} className={resolved.e1}>
        {normalizeChildren(children)}
      </span>
    </BadgeSlotContext.Provider>
  );
});

const BadgeDot = forwardRef<HTMLSpanElement, BadgeDotProps>(function BadgeDot(
  {
    className,
    classNames = {},
    emphasis = 'high',
    intent = DEFAULT_BADGE_INTENT,
    scale = 's:sm:3',
    surfaceContext: explicitSurfaceContext,
    ...props
  },
  ref
) {
  const { classesMap } = useKiskadee();
  const surfaceContext = useSurfaceContext(explicitSurfaceContext);
  const elements =
    useComponentClassMap('badge', classesMap.badge as BadgeClassesMap | undefined) ?? {};
  const resolved = resolveBadgeClassNames({
    elements,
    className,
    classNames,
    intent,
    emphasis,
    scale,
    radius: 'pill',
    surfaceContext
  });
  return <span {...props} ref={ref} className={resolved.e5} />;
});

export const Badge = Object.assign(BadgeRoot, {
  Count: BadgeCount,
  Dot: BadgeDot,
  Icon: BadgeIcon,
  Label: BadgeLabel
});
