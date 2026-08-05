'use client';

import type { IconName } from '@kiskadee/icons/interface';
import type { HTMLAttributes, ReactNode } from 'react';
import { useResolvedIconGlyph } from '../../shared/contexts/IconFamilyContext.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type IconGlyphProps = Omit<
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
export function IconGlyph({ name, fallback, className, ...props }: IconGlyphProps) {
  const { familyId, glyph, hasProvider } = useResolvedIconGlyph(name);

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

  return (
    <span
      {...props}
      className={join('k-gly', className)}
      aria-hidden="true"
      data-k-icon-direction={glyph.direction}
      data-k-icon-family={familyId}
      data-k-icon-name={name}
    >
      {RtlGlyph ? (
        <>
          <span className="k-gly-ltr">
            <Glyph />
          </span>
          <span className="k-gly-rtl">
            <RtlGlyph />
          </span>
        </>
      ) : (
        <Glyph />
      )}
    </span>
  );
}
