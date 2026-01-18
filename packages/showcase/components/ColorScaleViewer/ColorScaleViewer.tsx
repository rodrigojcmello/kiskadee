'use client';

import { KiskadeeContext } from '@kiskadee/react-components';
import { useContext, useEffect, useMemo, useState } from 'react';
import { type SelectionValue, useColorScale } from '@/hooks/use-color-scale';
import { Select } from '@/k-components/Select/Select';
import style from './ColorScaleViewer.module.scss';

type ThemeKey = 'light' | 'dark';

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
  const [selection, setSelection] = useState<SelectionValue>('semantic:primary');

  // Always reset selection when switching design systems.
  // Not every design system supports every primitive color; "primary" is the safest default.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ...
  useEffect(() => {
    setSelection('semantic:primary');
  }, [designSystemKey]);

  const { colors, scale, meta, error } = useColorScale({
    designSystemKey,
    theme,
    selection,
    enabled: Boolean(designSystemKey)
  });

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

  // Keep the UI stable: when the resolved ref is invalid for this DS/theme,
  // fallback to the safest semantic.
  useEffect(() => {
    if (!designSystemKey) return;
    if (!colors) return;
    if (meta?.resolvedPrimitiveRef) return;

    if (selection !== 'semantic:primary') {
      setSelection('semantic:primary');
    }
  }, [designSystemKey, colors, meta?.resolvedPrimitiveRef, selection]);

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
