import { describe, expect, it } from 'vitest';
import {
  defineIconFamily,
  defineIconFamilyCatalogEntry,
  defineIconFamilyFallback,
  resolveIconGlyph
} from './defineIconFamily.ts';

function SearchGlyph() {
  return <svg />;
}

describe('defineIconFamily', () => {
  it('accepts canonical and namespaced glyphs', () => {
    const family = defineIconFamily({
      id: 'acme-classic',
      label: 'Acme Classic',
      glyphs: {
        search: SearchGlyph,
        'acme:invoice-approved': SearchGlyph
      }
    });

    expect(resolveIconGlyph(family, 'search')?.glyph).toBe(SearchGlyph);
    expect(resolveIconGlyph(family, 'acme:invoice-approved')?.glyph).toBe(SearchGlyph);
  });

  it('allows the same corporate name to have different geometry in each family', () => {
    function ClassicInvoiceGlyph() {
      return <svg data-style="classic" />;
    }
    function ModernInvoiceGlyph() {
      return <svg data-style="modern" />;
    }

    const classic = defineIconFamily({
      id: 'acme-classic',
      label: 'Acme Classic',
      glyphs: { 'acme:invoice-approved': ClassicInvoiceGlyph }
    });
    const modern = defineIconFamily({
      id: 'acme-modern',
      label: 'Acme Modern',
      glyphs: { 'acme:invoice-approved': ModernInvoiceGlyph }
    });

    expect(resolveIconGlyph(classic, 'acme:invoice-approved')?.glyph).toBe(ClassicInvoiceGlyph);
    expect(resolveIconGlyph(modern, 'acme:invoice-approved')?.glyph).toBe(ModernInvoiceGlyph);
  });

  it('preserves directional descriptors', () => {
    const family = defineIconFamily({
      id: 'directional',
      label: 'Directional',
      glyphs: {
        'chevron-left': {
          direction: 'mirror',
          glyph: SearchGlyph
        }
      }
    });

    expect(resolveIconGlyph(family, 'chevron-left')).toMatchObject({
      direction: 'mirror',
      glyph: SearchGlyph
    });
  });

  it('resolves local variants without changing the family identity', () => {
    function ThinSearchGlyph() {
      return <svg data-weight="thin" />;
    }
    function BoldSearchGlyph() {
      return <svg data-weight="bold" />;
    }

    const family = defineIconFamily({
      id: 'acme-interface',
      label: 'Acme Interface',
      defaultVariant: 'thin',
      variants: {
        thin: { label: 'Thin', glyphs: { search: ThinSearchGlyph } },
        bold: { label: 'Bold', glyphs: { search: BoldSearchGlyph } }
      }
    });

    expect(resolveIconGlyph(family, 'search')?.glyph).toBe(ThinSearchGlyph);
    expect(resolveIconGlyph(family, 'search', 'bold')?.glyph).toBe(BoldSearchGlyph);
    expect(resolveIconGlyph(family, 'search', 'missing')).toBeUndefined();
  });

  it('rejects invalid IDs and empty labels', () => {
    expect(() =>
      defineIconFamily({ id: 'Acme', label: 'Acme', glyphs: { search: SearchGlyph } })
    ).toThrow(/lowercase kebab-case/);
    expect(() =>
      defineIconFamily({ id: 'acme', label: ' ', glyphs: { search: SearchGlyph } })
    ).toThrow(/requires a label/);
    expect(() =>
      defineIconFamilyCatalogEntry({
        id: 'acme',
        label: ' ',
        defaultVariant: 'regular',
        variants: [{ id: 'regular', label: 'Regular' }],
        load: async () =>
          defineIconFamily({ id: 'acme', label: 'Acme', glyphs: { search: SearchGlyph } })
      })
    ).toThrow(/requires a label/);
    expect(() => defineIconFamilyFallback({ id: 'acme', label: '', fallbackTo: 'lucide' })).toThrow(
      /requires a label/
    );
  });
});
