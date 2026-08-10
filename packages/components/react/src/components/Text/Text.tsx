import './Text.structural.scss';
import type { TypographyProfileId } from '@kiskadee/core';
import type { ElementType, ReactNode } from 'react';
import { forwardRef } from 'react';
import {
  joinClassNames,
  resolveTypographyClassName
} from '../../shared/class-resolution/classNames.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import type { TextComponent } from './Text.types.ts';

declare const process: { env: { NODE_ENV?: string } };

const warnedMissingProfiles = new Set<string>();

type TextRuntimeProps = {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  profile: TypographyProfileId;
};

const TextRuntime = forwardRef<HTMLElement, TextRuntimeProps>(function TextRuntime(
  { as, className, profile, ...nativeProps }: TextRuntimeProps,
  ref
) {
  const { designSystem, global } = useKiskadee();
  const element = global?.classMap?.text?.e1;
  const profileClassName = resolveTypographyClassName(element, profile);

  if (element?.t && !profileClassName && process.env.NODE_ENV !== 'production') {
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
      className={joinClassNames('k-txt', profileClassName, className)}
    />
  );
});

export const Text = TextRuntime as TextComponent;

export default Text;
