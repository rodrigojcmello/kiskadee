'use client';

import './Icon.structural.scss';

import type { IconName } from '@kiskadee/icons/interface';
import type { HTMLAttributes, ReactNode } from 'react';
import { createElement } from 'react';
import { useResolvedIconGlyph } from '../../shared/contexts/IconFamilyContext.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type FamilyResolvedIconProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-hidden' | 'children' | 'role'
> & {
  name: IconName;
  fallback?: ReactNode;
};

function join(...parts: Array<string | undefined>): string | undefined {
  const value = parts.filter(Boolean).join(' ').trim();
  return value.length > 0 ? value : undefined;
}

/**
 * Presentation-only resolver for normalized glyph slots.
 * Accessibility semantics remain owned by Icon or by the parent component.
 */
export function FamilyResolvedIcon({
  name,
  fallback,
  className,
  ...props
}: FamilyResolvedIconProps) {
  const { familyId, variantId, glyph, hasProvider } = useResolvedIconGlyph(name);

  if (!glyph) {
    if (fallback !== undefined) {
      return (
        <span {...props} className={join('k-gly', className)} aria-hidden="true">
          {fallback}
        </span>
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(
        hasProvider
          ? `[kiskadee/icons] Icon "${name}" is not mapped by family "${familyId ?? 'unknown'}".`
          : `[kiskadee/icons] Icon "${name}" requires an IconFamilyProvider or an explicit fallback.`
      );
    }
    return null;
  }

  const Glyph = glyph.glyph;
  const RtlGlyph = glyph.rtlGlyph;
  const renderedGlyph = createElement(Glyph, glyph.rendererProps);

  return (
    <span
      {...props}
      className={join('k-gly', className)}
      aria-hidden="true"
      data-k-icon-direction={glyph.direction}
      data-k-icon-family={familyId}
      data-k-icon-name={name}
      data-k-icon-variant={variantId}
    >
      {RtlGlyph ? (
        <>
          <span className="k-gly-ltr">{renderedGlyph}</span>
          <span className="k-gly-rtl">{createElement(RtlGlyph, glyph.rendererProps)}</span>
        </>
      ) : (
        renderedGlyph
      )}
    </span>
  );
}
