'use client';

import { KiskadeeContext } from '@kiskadee/react-components';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Select } from '@/k-components/Select/Select';
import {
  type ColorScaleJson,
  colorsMaps,
  loadColorScaleFromBuild
} from '@/registry/colors.registry';
import style from './ColorScaleViewer.module.scss';

type ThemeKey = 'light' | 'dark';

type ColorsJson = {
  primitiveColors?: Record<
    string,
    Record<
      string,
      {
        solid?: Record<ThemeKey, string>;
      }
    >
  >;
  globalSemantics?: Record<ThemeKey, Record<string, string>>;
};

type SelectionValue = `semantic:${string}` | `primitive:${string}.${string}`;

function parsePrimitiveRef(ref: string): { baseColor: string; variant: string } | null {
  // Expected: "primitive.<baseColor>.<variant>" (e.g. "primitive.purple.v1")
  const parts = ref.split('.');
  if (parts.length < 3) return null;
  if (parts[0] !== 'primitive') return null;
  return { baseColor: parts[1]!, variant: parts[2]! };
}

function normalizeTheme(theme: unknown): ThemeKey {
  return theme === 'dark' ? 'dark' : 'light';
}

function getSelectionLabel(value: SelectionValue): string {
  if (value.startsWith('semantic:')) return `Global: ${value.replace('semantic:', '')}`;
  if (value.startsWith('primitive:')) return `Primitive: ${value.replace('primitive:', '')}`;
  return value;
}

export default function ColorScaleViewer() {
  const ctx = useContext(KiskadeeContext);
  const designSystemKey = String(ctx?.designSystem ?? '');
  const theme = normalizeTheme(ctx?.theme);

  const [colors, setColors] = useState<ColorsJson | null>(null);
  const [selection, setSelection] = useState<SelectionValue>('semantic:primary');
  const [scale, setScale] = useState<ColorScaleJson | null>(null);
  const [meta, setMeta] = useState<{
    resolvedPrimitiveRef?: string;
    scaleFileName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Always reset selection when switching design systems.
  // Not every design system supports every primitive color; "primary" is the safest default.
  useEffect(() => {
    setSelection('semantic:primary');
  }, [designSystemKey]);

  const colorsLoader = useMemo(() => {
    return (colorsMaps as Record<string, (() => Promise<any>) | undefined>)[designSystemKey];
  }, [designSystemKey]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setScale(null);
      setMeta(null);
      setColors(null);

      if (!designSystemKey) return;
      if (!colorsLoader) {
        setError(`No colors registry found for designSystem="${designSystemKey}"`);
        return;
      }

      try {
        const colorsJson = (await colorsLoader()) as ColorsJson;
        if (cancelled) return;
        setColors(colorsJson);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [designSystemKey, theme, colorsLoader]);

  const selectOptions = useMemo(() => {
    if (!colors) return [];

    const out: Array<{ value: string; label: string }> = [];

    // Layer 2: global semantics (use `light` as the registry of keys)
    // and resolve by current theme when selected.
    const semanticKeys = Object.keys(colors.globalSemantics?.light ?? {});
    for (const key of semanticKeys) {
      const value = `semantic:${key}` as const;
      out.push({ value, label: getSelectionLabel(value) });
    }

    // Layer 1: primitive colors
    for (const [baseColor, variants] of Object.entries(colors.primitiveColors ?? {})) {
      for (const variant of Object.keys(variants ?? {})) {
        const value = `primitive:${baseColor}.${variant}` as const;
        out.push({ value, label: getSelectionLabel(value) });
      }
    }

    out.sort((a, b) => a.label.localeCompare(b.label));
    return out;
  }, [colors]);

  const resolvedPrimitiveRef = useMemo(() => {
    if (!colors) return null;

    if (selection.startsWith('semantic:')) {
      const semanticKey = selection.replace('semantic:', '');
      const ref = colors.globalSemantics?.[theme]?.[semanticKey];
      return typeof ref === 'string' ? ref : null;
    }

    if (selection.startsWith('primitive:')) {
      const target = selection.replace('primitive:', '');
      return `primitive.${target}`;
    }

    return null;
  }, [colors, selection, theme]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setScale(null);
      setMeta(null);

      if (!colors) return;
      if (!resolvedPrimitiveRef) {
        if (selection !== 'semantic:primary') {
          setSelection('semantic:primary');
        }
        return;
      }

      const parsed = parsePrimitiveRef(resolvedPrimitiveRef);
      if (!parsed) {
        if (selection !== 'semantic:primary') {
          setSelection('semantic:primary');
        }
        return;
      }

      const scaleFileName =
        colors?.primitiveColors?.[parsed.baseColor]?.[parsed.variant]?.solid?.[theme] as
          | string
          | undefined;
      if (!scaleFileName) {
        if (selection !== 'semantic:primary') {
          setSelection('semantic:primary');
        }
        return;
      }

      try {
        const scaleJson = await loadColorScaleFromBuild(designSystemKey, scaleFileName);
        if (cancelled) return;
        setMeta({ resolvedPrimitiveRef, scaleFileName });
        setScale(scaleJson);
      } catch {
        // A 404 is acceptable: not every DS has every referenced scale file.
        // Keep the UI stable and allow the user to switch selections.
        if (cancelled) return;
        setMeta({ resolvedPrimitiveRef, scaleFileName });
        setScale(null);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [colors, resolvedPrimitiveRef, designSystemKey, theme, selection]);

  const tracks = useMemo(() => {
    if (!scale) return [];
    return Object.entries(scale).map(([trackName, tones]) => {
      const entries = Object.entries(tones)
        .map(([tone, hex]) => ({ tone, hex }))
        .sort((a, b) => Number(a.tone) - Number(b.tone));
      return { trackName, entries };
    });
  }, [scale]);

  return (
    <div className={style.container}>
      <div className={style.title}>Color scale viewer</div>
      <div className={style.meta}>
        DS: <strong>{designSystemKey || '-'}</strong> | theme: <strong>{theme}</strong>
        {meta?.resolvedPrimitiveRef ? (
          <>
            {' '}
            | ref: <code>{meta.resolvedPrimitiveRef}</code>
          </>
        ) : null}
        {meta?.scaleFileName ? (
          <>
            {' '}
            | file: <code>{meta.scaleFileName}</code>
          </>
        ) : null}
      </div>

      <Select
        label="Color"
        value={selection}
        onValueChange={(v) => setSelection(v as SelectionValue)}
        options={selectOptions}
        width={290}
      />

      {error ? <div className={style.error}>{error}</div> : null}

      {tracks.length ? (
        <div className={style.tracks}>
          {tracks.map((t) => (
            <div key={t.trackName}>
              <div className={style.trackTitle}>{t.trackName}</div>
              <div className={style.swatches}>
                {t.entries.map((e) => (
                  <div key={`${t.trackName}-${e.tone}`} className={style.swatch}>
                    <div className={style.chip} style={{ background: e.hex }}>
                      <div
                        className={`${style.chipLabel} ${
                          t.trackName === 'subtle' ? style.textOnSubtle : style.textOnVivid
                        }`}
                      >
                        <span className={style.tone}>{e.tone}</span>
                        <span className={style.hex}>{e.hex}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
