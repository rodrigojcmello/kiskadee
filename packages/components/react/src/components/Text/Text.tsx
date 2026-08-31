'use client';

import './Text.structural.scss';
import type {
  SurfaceContext,
  TextEmphasis,
  TextForegroundName,
  TypographyProfileId
} from '@kiskadee/core';
import type { ElementType, ReactNode } from 'react';
import { forwardRef } from 'react';
import {
  joinClassNames,
  resolveIntentClassName,
  resolveTypographyClassName
} from '../../shared/class-resolution/classNames.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMapResolution } from '../../shared/contexts/useComponentClassMap.ts';
import type { TextClassesMap, TextComponent } from './Text.types.ts';

declare const process: { env: { NODE_ENV?: string } };

const warnedMissingProfiles = new Set<string>();

type TextRuntimeProps = {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  emphasis?: TextEmphasis;
  foreground?: TextForegroundName | 'inherit';
  profile: TypographyProfileId;
  surfaceContext?: SurfaceContext;
};

const TextRuntime = forwardRef<HTMLElement, TextRuntimeProps>(function TextRuntime(
  {
    as,
    className,
    emphasis = 'medium',
    foreground = 'neutral',
    profile,
    surfaceContext,
    ...nativeProps
  }: TextRuntimeProps,
  ref
) {
  const { classesMap, designSystem, global } = useKiskadee();
  const typographyElement = global?.classMap?.text?.e1;
  const profileClassName = resolveTypographyClassName(typographyElement, profile);
  const resolvedSurfaceContext = useSurfaceContext(surfaceContext);
  const colorResolution = useComponentClassMapResolution(
    'text',
    classesMap.text as TextClassesMap | undefined,
    foreground !== 'inherit'
  );
  const colorElement = colorResolution.pending ? undefined : colorResolution.classMap?.e1;
  const foregroundClassName =
    foreground === 'inherit'
      ? ''
      : resolveIntentClassName(colorElement, foreground, emphasis, {
          surfaceContext: resolvedSurfaceContext
        });

  if (typographyElement?.t && !profileClassName && process.env.NODE_ENV !== 'production') {
    const warningKey = `${designSystem}:${profile}`;
    if (!warnedMissingProfiles.has(warningKey)) {
      warnedMissingProfiles.add(warningKey);
      console.warn(
        `[Kiskadee] Text profile "${profile}" is not available in design system "${designSystem}".`
      );
    }
  }

  const Component = as ?? 'span';

  return (
    <Component
      {...nativeProps}
      ref={ref}
      className={joinClassNames('k-txt', profileClassName, foregroundClassName, className)}
    />
  );
});

export const Text = TextRuntime as TextComponent;

export default Text;
