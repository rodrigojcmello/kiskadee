import type { CSSProperties } from 'react';
import type { IconGlyphRenderer, IconGlyphRendererProps } from './types.ts';

type FontAwesomeIconDefinition = {
  iconName: string;
  icon: readonly [
    width: number,
    height: number,
    ligatures: readonly (number | string)[],
    unicode: string,
    svgPathData: string | readonly string[]
  ];
};

export function createFontAwesomeGlyph(
  icon: FontAwesomeIconDefinition,
  defaults: Readonly<{ style?: CSSProperties }> = {}
): IconGlyphRenderer {
  function FontAwesomeGlyph(props: IconGlyphRendererProps) {
    const [width, height, , , svgPathData] = icon.icon;
    const paths = typeof svgPathData === 'string' ? [svgPathData] : svgPathData;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={props.className}
        fill="currentColor"
        focusable="false"
        height="1em"
        style={{ ...defaults.style, ...props.style }}
        viewBox={`0 0 ${width} ${height}`}
        width="1em"
      >
        {paths.map((path) => (
          <path d={path} key={path} />
        ))}
      </svg>
    );
  }

  FontAwesomeGlyph.displayName = `KiskadeeGlyph(FontAwesome:${icon.iconName})`;
  return FontAwesomeGlyph;
}
