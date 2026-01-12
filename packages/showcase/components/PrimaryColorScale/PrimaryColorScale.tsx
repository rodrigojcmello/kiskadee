'use client';

import { KiskadeeContext } from '@kiskadee/react-components';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  type ColorScaleJson,
  colorsMaps,
  loadColorScaleFromBuild
} from '@/registry/colors.registry';
import style from './PrimaryColorScale.module.scss';

type ThemeKey = 'light' | 'dark';

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

export default function PrimaryColorScale() {
  const ctx = useContext(KiskadeeContext);
  const designSystemKey = String(ctx?.designSystem ?? '');
  const theme = normalizeTheme(ctx?.theme);

  const [scale, setScale] = useState<ColorScaleJson | null>(null);
  const [meta, setMeta] = useState<{
    primaryRef?: string;
    scaleFileName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const colorsLoader = useMemo(() => {
    return (colorsMaps as Record<string, (() => Promise<any>) | undefined>)[designSystemKey];
  }, [designSystemKey]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setScale(null);
      setMeta(null);

      if (!designSystemKey) return;
      if (!colorsLoader) {
        setError(`No colors registry found for designSystem="${designSystemKey}"`);
        return;
      }

      try {
        const colorsJson = await colorsLoader();
        const primaryRef = colorsJson?.globalSemantics?.[theme]?.primary as string | undefined;
        if (!primaryRef) {
          setError(`colors.json is missing globalSemantics.${theme}.primary`);
          return;
        }

        const parsed = parsePrimitiveRef(primaryRef);
        if (!parsed) {
          setError(`Unexpected primary reference format: "${primaryRef}"`);
          return;
        }

        const scaleFileName = colorsJson?.primitiveColors?.[parsed.baseColor]?.[parsed.variant]
          ?.solid?.[theme] as string | undefined;

        if (!scaleFileName) {
          setError(
            `Could not find primitiveColors.${parsed.baseColor}.${parsed.variant}.solid.${theme} in colors.json`
          );
          return;
        }

        const scaleJson = await loadColorScaleFromBuild(designSystemKey, scaleFileName);
        if (cancelled) return;

        setMeta({ primaryRef, scaleFileName });
        setScale(scaleJson);
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
      <div className={style.title}>Primary color scale</div>
      <div className={style.meta}>
        DS: <strong>{designSystemKey || '-'}</strong> | theme: <strong>{theme}</strong>
        {meta?.primaryRef ? (
          <>
            {' '}
            | primary: <code>{meta.primaryRef}</code>
          </>
        ) : null}
        {meta?.scaleFileName ? (
          <>
            {' '}
            | file: <code>{meta.scaleFileName}</code>
          </>
        ) : null}
      </div>

      {error ? <div className={style.error}>{error}</div> : null}

      {tracks.length ? (
        <div className={style.tracks}>
          {tracks.map((t) => (
            <div key={t.trackName}>
              <div className={style.trackTitle}>{t.trackName}</div>
              <div className={style.swatches}>
                {t.entries.map((e) => (
                  <div key={`${t.trackName}-${e.tone}`} className={style.swatch}>
                    <div className={style.chip} style={{ background: e.hex }} />
                    <div className={style.label}>
                      <span className={style.tone}>{e.tone}</span>
                      <span className={style.hex}>{e.hex}</span>
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
