import type { ElementType } from 'react';
import type { IconGlyphRenderer, IconGlyphRendererProps } from './types.ts';

type UpstreamIconProps = IconGlyphRendererProps & Record<string, unknown>;

export function createSvgGlyph(
  Component: ElementType,
  defaults: Readonly<Record<string, unknown>> = {}
): IconGlyphRenderer {
  function SvgGlyph(props: IconGlyphRendererProps) {
    return (
      <Component
        aria-hidden="true"
        focusable="false"
        {...defaults}
        {...(props as UpstreamIconProps)}
      />
    );
  }

  const componentMetadata =
    typeof Component === 'string'
      ? { displayName: Component }
      : (Component as { displayName?: string; name?: string });
  SvgGlyph.displayName = `KiskadeeGlyph(${
    componentMetadata.displayName ?? componentMetadata.name ?? 'Icon'
  })`;
  return SvgGlyph;
}
