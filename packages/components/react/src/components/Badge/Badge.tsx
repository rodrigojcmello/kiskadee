'use client';

import './Badge.structural.scss';
import { Children, forwardRef, isValidElement } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import {
  DEFAULT_BADGE_EMPHASIS,
  DEFAULT_BADGE_INTENT,
  DEFAULT_BADGE_RADIUS,
  DEFAULT_BADGE_SCALE,
  resolveBadgeClassNames
} from './Badge.class-names.ts';
import type { BadgeClassesMap, BadgeDotProps, BadgeMarkProps, BadgeProps } from './Badge.types.ts';

function useResolvedBadgeClasses({
  className,
  classNames = {},
  emphasis,
  intent,
  radius,
  scale,
  shadow,
  surfaceContext
}: Pick<BadgeProps, 'className' | 'classNames' | 'surfaceContext'> & {
  emphasis: NonNullable<BadgeProps['emphasis']>;
  intent: NonNullable<BadgeProps['intent']>;
  radius: NonNullable<BadgeProps['radius']>;
  scale: NonNullable<BadgeProps['scale']>;
  shadow: boolean;
}) {
  const { classesMap } = useKiskadee();
  const consumedSurfaceContext = useSurfaceContext(surfaceContext);
  const elements =
    useComponentClassMap('badge', classesMap.badge as BadgeClassesMap | undefined) ?? {};
  return resolveBadgeClassNames({
    elements,
    className,
    classNames,
    intent,
    emphasis,
    scale,
    radius,
    shadow,
    surfaceContext: consumedSurfaceContext
  });
}

function SeparationRing({ className, enabled }: { className?: string; enabled: boolean }) {
  return enabled && className ? <span aria-hidden="true" className={className} /> : null;
}

const BadgeRoot = forwardRef<HTMLSpanElement, BadgeProps>(function BadgeRoot(
  {
    className,
    classNames = {},
    emphasis = DEFAULT_BADGE_EMPHASIS,
    intent = DEFAULT_BADGE_INTENT,
    radius = DEFAULT_BADGE_RADIUS,
    scale = DEFAULT_BADGE_SCALE,
    separation = 'none',
    shadow = false,
    surfaceContext,
    children,
    ...props
  },
  ref
) {
  if (typeof children !== 'string' && typeof children !== 'number') {
    throw new Error('Badge requires exactly one string or number child.');
  }

  const resolved = useResolvedBadgeClasses({
    className,
    classNames,
    emphasis,
    intent,
    radius,
    scale,
    shadow,
    surfaceContext
  });

  return (
    <span {...props} ref={ref} className={resolved.e1}>
      <span className={resolved.e2}>{children}</span>
      <SeparationRing enabled={separation === 'ring'} className={resolved.e6} />
    </span>
  );
});

const BadgeDot = forwardRef<HTMLSpanElement, BadgeDotProps>(function BadgeDot(
  {
    className,
    classNames = {},
    intent = DEFAULT_BADGE_INTENT,
    scale = 's:sm:3',
    separation = 'none',
    shadow = false,
    surfaceContext,
    ...props
  },
  ref
) {
  const resolved = useResolvedBadgeClasses({
    className,
    classNames,
    emphasis: 'high',
    intent,
    radius: 'pill',
    scale,
    shadow,
    surfaceContext
  });
  return (
    <span {...props} ref={ref} className={resolved.e5}>
      <SeparationRing enabled={separation === 'ring'} className={resolved.e6} />
    </span>
  );
});

const BadgeMark = forwardRef<HTMLSpanElement, BadgeMarkProps>(function BadgeMark(
  {
    className,
    classNames = {},
    emphasis,
    intent = DEFAULT_BADGE_INTENT,
    presentation = 'contained',
    scale = DEFAULT_BADGE_SCALE,
    separation = 'none',
    shadow = false,
    surfaceContext,
    children,
    ...props
  },
  ref
) {
  if (Children.count(children) !== 1 || !isValidElement(children)) {
    throw new Error('Badge.Mark requires exactly one consumer-provided icon element.');
  }
  if (presentation === 'full-bleed' && emphasis !== undefined) {
    throw new Error('Badge.Mark does not accept emphasis when presentation is full-bleed.');
  }

  const fullBleed = presentation === 'full-bleed';
  const resolved = useResolvedBadgeClasses({
    className,
    classNames,
    emphasis: fullBleed ? 'high' : (emphasis ?? 'high'),
    intent,
    radius: 'pill',
    scale,
    shadow,
    surfaceContext
  });

  return (
    <span {...props} ref={ref} className={fullBleed ? resolved.e3 : resolved.e5}>
      {fullBleed ? children : <span className={resolved.e4}>{children}</span>}
      <SeparationRing enabled={separation === 'ring'} className={resolved.e6} />
    </span>
  );
});

export const Badge = Object.assign(BadgeRoot, {
  Dot: BadgeDot,
  Mark: BadgeMark
});
