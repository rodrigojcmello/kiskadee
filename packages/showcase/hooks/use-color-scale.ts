'use client';

import type { ThemeMode, TonalFunctionalReferenceName } from '@kiskadee/core';
import { useEffect, useMemo, useState } from 'react';
import {
  type ColorScaleJson,
  colorsMaps,
  loadColorScaleFromBuild
} from '@/registry/colors.registry';
import {
  type ColorsArtifact,
  collectPrimitiveColorDescriptors,
  collectPrimitiveToneEntries,
  type LoadedPrimitiveColor,
  materializePrimitiveColorCatalog
} from '@/utils/primitive-color-catalog';

export type ColorsJson = ColorsArtifact;

export type SelectionValue = `semantic:${string}` | `primitive:${string}.${string}`;

export type ColorScaleMeta = {
  resolvedPrimitiveRef?: string;
  scaleFileName?: string;
};

type PrimitiveRef = { baseColor: string; variant: string };

// Cache while the tab is open.
// We cache Promises to dedupe concurrent requests too.
const colorsPromiseCache = new Map<string, Promise<ColorsJson>>();
const scalePromiseCache = new Map<string, Promise<ColorScaleJson>>();

function parsePrimitiveRef(ref: string): PrimitiveRef | null {
  // Expected: "primitive.<baseColor>.<variant>" (e.g. "primitive.purple.v1")
  const parts = ref.split('.');
  if (parts.length < 3) return null;
  if (parts[0] !== 'primitive') return null;
  return { baseColor: parts[1]!, variant: parts[2]! };
}

function getColorsLoader(designSystemKey: string): (() => Promise<any>) | null {
  const loader = (colorsMaps as Record<string, (() => Promise<any>) | undefined>)[designSystemKey];
  return loader ?? null;
}

function loadColorsJsonCached(designSystemKey: string): Promise<ColorsJson> {
  const cached = colorsPromiseCache.get(designSystemKey);
  if (cached) return cached;

  const loader = getColorsLoader(designSystemKey);
  if (!loader) {
    // Keep the promise shape stable.
    const p = Promise.reject(
      new Error(`No colors registry found for designSystem="${designSystemKey}"`)
    );
    colorsPromiseCache.set(designSystemKey, p);
    return p;
  }

  const p = loader().then((json) => json as ColorsJson);
  colorsPromiseCache.set(designSystemKey, p);
  return p;
}

function loadScaleJsonCached(
  designSystemKey: string,
  scaleFileName: string
): Promise<ColorScaleJson> {
  const key = `${designSystemKey}|${scaleFileName}`;
  const cached = scalePromiseCache.get(key);
  if (cached) return cached;

  const p = loadColorScaleFromBuild(designSystemKey, scaleFileName);
  scalePromiseCache.set(key, p);
  return p;
}

function resolvePrimitiveRefFromSelection(params: {
  colors: ColorsJson;
  theme: ThemeMode;
  selection: SelectionValue;
}): string | null {
  const { colors, theme, selection } = params;

  if (selection.startsWith('semantic:')) {
    const semanticRaw = selection.replace('semantic:', '');
    const [semanticKey, variant] = semanticRaw.split('.');
    if (!semanticKey) return null;
    const ref = colors.globalSemantics?.[theme]?.[semanticKey];
    if (!ref) return null;
    if (typeof ref === 'string') return ref;
    if (variant === 'v2') return ref.v2 ?? ref.v1;
    return ref.v1;
  }

  if (selection.startsWith('primitive:')) {
    const target = selection.replace('primitive:', '');
    return `primitive.${target}`;
  }

  return null;
}

function resolveScaleFileName(params: {
  colors: ColorsJson;
  theme: ThemeMode;
  resolvedPrimitiveRef: string;
}): string | null {
  const { colors, theme, resolvedPrimitiveRef } = params;
  const parsed = parsePrimitiveRef(resolvedPrimitiveRef);
  if (!parsed) return null;

  const fileName = colors.primitiveColors?.[parsed.baseColor]?.[parsed.variant]?.scales?.[theme] as
    | string
    | undefined;
  return fileName ?? null;
}

export function pickScaleTone(params: { scale: ColorScaleJson; tone: string }): string | undefined {
  const { scale, tone } = params;
  const value = scale[tone];
  return typeof value === 'string' ? value : undefined;
}

export function useColorScale(params: {
  designSystemKey: string;
  theme: ThemeMode;
  selection: SelectionValue;
  enabled?: boolean;
}): {
  colors: ColorsJson | null;
  scale: ColorScaleJson | null;
  meta: ColorScaleMeta | null;
  loading: boolean;
  error: string | null;
} {
  const { designSystemKey, theme, selection, enabled = true } = params;

  const [colors, setColors] = useState<ColorsJson | null>(null);
  const [scale, setScale] = useState<ColorScaleJson | null>(null);
  const [meta, setMeta] = useState<ColorScaleMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setLoading(true);
      setScale(null);
      setMeta(null);
      setColors(null);

      if (!enabled) {
        setLoading(false);
        return;
      }

      if (!designSystemKey) {
        setLoading(false);
        return;
      }

      try {
        const colorsJson = await loadColorsJsonCached(designSystemKey);
        if (cancelled) return;
        setColors(colorsJson);

        const resolvedPrimitiveRef = resolvePrimitiveRefFromSelection({
          colors: colorsJson,
          theme,
          selection
        });
        if (!resolvedPrimitiveRef) {
          setMeta(null);
          setScale(null);
          setLoading(false);
          return;
        }

        const scaleFileName = resolveScaleFileName({
          colors: colorsJson,
          theme,
          resolvedPrimitiveRef
        });
        if (!scaleFileName) {
          setMeta({ resolvedPrimitiveRef });
          setScale(null);
          setLoading(false);
          return;
        }

        try {
          const scaleJson = await loadScaleJsonCached(designSystemKey, scaleFileName);
          if (cancelled) return;
          setMeta({ resolvedPrimitiveRef, scaleFileName });
          setScale(scaleJson);
          setLoading(false);
        } catch {
          // A 404 is acceptable: not every DS has every referenced scale file.
          if (cancelled) return;
          setMeta({ resolvedPrimitiveRef, scaleFileName });
          setScale(null);
          setLoading(false);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [designSystemKey, theme, selection, enabled]);

  return { colors, scale, meta, loading, error };
}

export function usePrimitiveColorCatalog(params: { designSystemKey: string; enabled?: boolean }): {
  colors: LoadedPrimitiveColor[];
  error: string | null;
  loading: boolean;
} {
  const { designSystemKey, enabled = true } = params;
  const [colors, setColors] = useState<LoadedPrimitiveColor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setColors([]);
      setError(null);

      if (!enabled || !designSystemKey) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const colorsJson = await loadColorsJsonCached(designSystemKey);
        const descriptors = collectPrimitiveColorDescriptors(colorsJson);
        const scalePromises = descriptors.flatMap((descriptor) =>
          descriptor.scales.map(async (scaleDescriptor) => {
            if (!scaleDescriptor.fileName) {
              throw new Error(
                `${descriptor.id} does not publish a ${scaleDescriptor.theme} scale.`
              );
            }

            const scale = await loadScaleJsonCached(designSystemKey, scaleDescriptor.fileName);
            return collectPrimitiveToneEntries(scale);
          })
        );
        const settledScales = await Promise.allSettled(scalePromises);

        if (cancelled) return;

        const loadedColors = materializePrimitiveColorCatalog(descriptors, settledScales);

        setColors(loadedColors);
        setLoading(false);
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [designSystemKey, enabled]);

  return { colors, error, loading };
}

export function useColorScaleTones(params: {
  designSystemKey: string;
  theme: ThemeMode;
  selection: SelectionValue;
  tones: readonly (string | TonalFunctionalReferenceName)[];
  enabled?: boolean;
}): {
  meta: ColorScaleMeta | null;
  loading: boolean;
  error: string | null;
  picked: Record<string, string | undefined>;
} {
  const { designSystemKey, theme, selection, tones, enabled } = params;
  const { colors, scale, meta, loading, error } = useColorScale({
    designSystemKey,
    theme,
    selection,
    enabled
  });

  const picked = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const t of tones) out[t] = undefined;
    if (!scale) return out;

    for (const t of tones) {
      let resolvedTone = String(t);

      if (t === 'subtle' || t === 'vivid') {
        const resolvedPrimitive = meta?.resolvedPrimitiveRef
          ? parsePrimitiveRef(meta.resolvedPrimitiveRef)
          : null;
        const functionalTone = resolvedPrimitive
          ? colors?.primitiveColors?.[resolvedPrimitive.baseColor]?.[resolvedPrimitive.variant]
              ?.functionalReferences?.[theme]?.[t]
          : undefined;

        if (functionalTone === undefined) continue;
        resolvedTone = String(functionalTone);
      }

      out[t] = pickScaleTone({
        scale,
        tone: resolvedTone
      });
    }

    return out;
  }, [colors, meta?.resolvedPrimitiveRef, scale, theme, tones]);

  return { meta, loading, error, picked };
}
