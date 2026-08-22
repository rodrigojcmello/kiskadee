import type { CSSProperties } from 'react';
import type { IconGlyphRenderer, IconGlyphRendererProps } from './types.ts';

const MATERIAL_SYMBOLS_FONT_FAMILY = 'Material Symbols Outlined';
const MATERIAL_SYMBOLS_LINK_ATTRIBUTE = 'data-kiskadee-material-symbols';
let materialSymbolsPreparation: Promise<void> | undefined;

type MaterialSymbolGlyphProps = IconGlyphRendererProps & {
  fill?: 0 | 1;
};

export function createMaterialSymbolGlyph(
  ligature: string,
  defaults: Readonly<{ style?: CSSProperties }> = {}
): IconGlyphRenderer {
  function MaterialSymbolGlyph(props: IconGlyphRendererProps) {
    const { fill = 0, ...glyphProps } = props as MaterialSymbolGlyphProps;
    const className = ['k-ms', props.className].filter(Boolean).join(' ');
    return (
      <span
        {...glyphProps}
        aria-hidden="true"
        className={className}
        style={{
          direction: 'ltr',
          display: 'inline-block',
          fontFamily: `"${MATERIAL_SYMBOLS_FONT_FAMILY}"`,
          fontFeatureSettings: '"liga"',
          fontStyle: 'normal',
          fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
          fontWeight: 400,
          letterSpacing: 'normal',
          lineHeight: 1,
          overflowWrap: 'normal',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          ...defaults.style,
          ...props.style
        }}
      >
        {ligature}
      </span>
    );
  }

  MaterialSymbolGlyph.displayName = `KiskadeeGlyph(MaterialSymbols:${ligature})`;
  return MaterialSymbolGlyph;
}

function findExistingStylesheet(url: string): HTMLLinkElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLLinkElement>(`link[${MATERIAL_SYMBOLS_LINK_ATTRIBUTE}]`)
  ).find((link) => link.href === url);
}

export function prepareMaterialSymbolsOutlined(iconNames: readonly string[]): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (materialSymbolsPreparation) return materialSymbolsPreparation;

  const ligatures = [...new Set(iconNames)].sort();
  const axes = 'FILL,GRAD,opsz,wght@0..1,0,24,400';
  const query = new URLSearchParams({
    family: `${MATERIAL_SYMBOLS_FONT_FAMILY}:${axes}`,
    icon_names: ligatures.join(','),
    display: 'block'
  });
  const url = `https://fonts.googleapis.com/css2?${query.toString()}`;
  const existing = findExistingStylesheet(url);

  materialSymbolsPreparation = new Promise<void>((resolve, reject) => {
    const link = existing ?? document.createElement('link');
    let settled = false;

    const complete = async () => {
      if (settled) return;
      settled = true;
      try {
        if ('fonts' in document) {
          await document.fonts.load(`24px "${MATERIAL_SYMBOLS_FONT_FAMILY}"`, ligatures[0]);
        }
        resolve();
      } catch (error) {
        materialSymbolsPreparation = undefined;
        if (!existing) link.remove();
        reject(error);
      }
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      materialSymbolsPreparation = undefined;
      if (!existing) link.remove();
      reject(new Error('[kiskadee/icons] Material Symbols stylesheet failed to load.'));
    };

    link.addEventListener('load', complete, { once: true });
    link.addEventListener('error', fail, { once: true });

    if (!existing) {
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute(MATERIAL_SYMBOLS_LINK_ATTRIBUTE, '');
      document.head.append(link);
    } else if (existing.sheet) {
      void complete();
    }
  });

  return materialSymbolsPreparation;
}
