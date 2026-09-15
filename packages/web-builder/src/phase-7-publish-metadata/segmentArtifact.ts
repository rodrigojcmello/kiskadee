import type {
  HueName,
  PrimitiveColorName,
  SchemaColors,
  ThemeName,
  TonalColorClassification
} from '@kiskadee/core';
import {
  MUNSELL_OKLCH_PROJECTION,
  MUNSELL_OKLCH_SECTOR_ORDER
} from '@kiskadee/tonal-scale/classification';

export type SegmentArtifactEntry = {
  id: string;
  name: string;
  classification?: TonalColorClassification;
  vivid: Record<string, string>;
};
export type SegmentArtifact = {
  version: 1;
  defaultSegment: string;
  sectorOrder: readonly string[];
  segments: SegmentArtifactEntry[];
};

export function buildSegmentArtifact(
  colors: SchemaColors,
  themes: Record<string, string[]>
): SegmentArtifact {
  if (!colors.globalSemantics || !colors.primitiveColors)
    throw new Error('[web-builder] Missing color layers');
  const globalSemantics = colors.globalSemantics;
  const primitiveColors = colors.primitiveColors;
  const registry = colors.globalSemanticsBySegment ?? {};
  const segments = Object.entries(registry).map(([id, entry]) => {
    if (!entry) throw new Error(`[web-builder] Missing segment ${id}`);
    if (typeof entry.meta?.name !== 'string' || !entry.meta.name.trim()) {
      throw new Error(`[web-builder] Segment ${id} requires a non-empty meta.name`);
    }
    const vivid: Record<string, string> = {};
    let classification: TonalColorClassification | undefined;
    for (const theme of new Set(['light', ...(themes[id] ?? [])])) {
      const baseTheme = theme === 'darker' ? 'dark' : theme;
      const key = baseTheme as ThemeName;
      const semantics = entry.themes?.[key]?.primary ?? globalSemantics[key]?.primary;
      const reference = typeof semantics === 'string' ? semantics : semantics?.v1;
      if (!reference) throw new Error(`[web-builder] Missing primary reference for ${id}.${theme}`);
      const [, hue, variant] = reference.split('.');
      const variants = primitiveColors[hue as HueName];
      const asset = variants?.[variant as PrimitiveColorName];
      if (!asset) throw new Error(`[web-builder] Missing primary asset ${reference}`);
      // Dynamic CSS colors cannot be resolved as static swatches at build time.
      if (asset.kind !== 'static') continue;
      if (theme === 'light') classification = asset.classification;
      const tone = asset.functionalReferences?.[key]?.vivid;
      const hex = tone === undefined ? undefined : asset.scales[key]?.[tone];
      if (hex) vivid[theme] = hex;
    }
    if (!classification)
      console.warn(
        `[web-builder] Segment ${id}: primary classification unavailable (dynamic or legacy asset without vivid metadata); publishing without classification`
      );
    return { id, name: entry.meta.name, classification, vivid };
  });
  if (!segments.some((entry) => entry.id === 'default'))
    throw new Error('[web-builder] Missing default segment');
  for (const entry of segments) {
    const value = entry.classification;
    if (
      value &&
      (value.classifier !== MUNSELL_OKLCH_PROJECTION ||
        (typeof value.referenceHex !== 'string' ? '' : value.referenceHex.toLowerCase()) !==
          entry.vivid.light?.toLowerCase() ||
        (value.sector === null && value.positionInSector !== null) ||
        (value.sector !== null &&
          (!MUNSELL_OKLCH_SECTOR_ORDER.includes(
            value.sector as (typeof MUNSELL_OKLCH_SECTOR_ORDER)[number]
          ) ||
            value.positionInSector === null ||
            !Number.isFinite(value.positionInSector) ||
            value.positionInSector < 0 ||
            value.positionInSector > 1)))
    ) {
      throw new Error(`[web-builder] Invalid primary classification for ${entry.id}`);
    }
  }
  return {
    version: 1,
    defaultSegment: 'default',
    sectorOrder: MUNSELL_OKLCH_SECTOR_ORDER,
    segments
  };
}
