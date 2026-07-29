'use client';

import { useKiskadee } from '@kiskadee/react-components';
import type { CSSProperties } from 'react';
import { ShowcaseRouteControls } from '@/components/ShowcaseControls';
import { usePrimitiveColorCatalog } from '@/hooks/use-color-scale';
import type {
  LoadedPrimitiveColor,
  LoadedPrimitiveScale,
  PrimitiveToneEntry
} from '@/utils/primitive-color-catalog';
import s from './Colors.module.scss';

const functionalReferenceLabels = {
  subtle: 'Subtle reference',
  vivid: 'Vivid reference'
} as const;

function FunctionalMarker({
  compact = false,
  name
}: {
  compact?: boolean;
  name: keyof typeof functionalReferenceLabels;
}) {
  const className = `${s.marker} ${name === 'subtle' ? s.subtleMarker : s.vividMarker} ${
    compact ? s.toneMarker : ''
  }`.trim();

  return (
    <span
      className={className}
      role="img"
      aria-label={functionalReferenceLabels[name]}
      title={functionalReferenceLabels[name]}
    />
  );
}

function Tone({
  prefix,
  scale,
  tone
}: {
  prefix: 'D' | 'L';
  scale: LoadedPrimitiveScale;
  tone: PrimitiveToneEntry;
}) {
  const references = scale.functionalReferences;
  const markerNames = (['subtle', 'vivid'] as const).filter(
    (name) => references?.[name] === tone.tone
  );
  const label = `${scale.theme} ${prefix}${tone.tone}: ${tone.value}${
    markerNames.length > 0
      ? `; ${markerNames.map((name) => functionalReferenceLabels[name]).join(', ')}`
      : ''
  }`;
  const style = {
    '--primitive-tone-color': tone.value
  } as CSSProperties;

  return (
    <div className={s.tone} role="img" aria-label={label} title={label}>
      <div className={s.toneMarkers}>
        {markerNames.map((name) => (
          <FunctionalMarker key={name} compact name={name} />
        ))}
      </div>
      <div className={s.toneColor}>
        <div className={s.toneColorFill} style={style} />
      </div>
      <code className={s.toneLabel}>
        {prefix}
        {tone.tone}
      </code>
    </div>
  );
}

function ThemeScale({ scale }: { scale: LoadedPrimitiveScale }) {
  const prefix = scale.theme === 'light' ? 'L' : 'D';

  return (
    <section className={s.themeScale} aria-label={`${scale.theme} tonal scale`}>
      <div className={s.themeHeader}>
        <span className={s.themeName}>{scale.theme}</span>
        <code className={s.fileName}>{scale.fileName ?? 'Not published'}</code>
      </div>
      {scale.error || !scale.tones ? (
        <div className={s.scaleError} role="alert">
          {scale.error ?? `Unable to load the ${scale.theme} scale.`}
        </div>
      ) : (
        <div className={s.scaleScroll}>
          <div className={s.scale}>
            {scale.tones.map((tone) => (
              <Tone key={tone.tone} prefix={prefix} scale={scale} tone={tone} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PrimitiveFamily({ color }: { color: LoadedPrimitiveColor }) {
  return (
    <article className={s.family}>
      <header className={s.familyHeader}>
        <h2 className={s.familyTitle}>{color.id}</h2>
        <span className={s.familyKind}>{color.kind}</span>
      </header>
      <div className={s.themeScales}>
        {color.scales.map((scale) => (
          <ThemeScale key={scale.theme} scale={scale} />
        ))}
      </div>
    </article>
  );
}

export default function ColorsShowcase() {
  const { designSystem } = useKiskadee();
  const designSystemKey = String(designSystem ?? '');
  const { colors, error, loading } = usePrimitiveColorCatalog({
    designSystemKey,
    enabled: Boolean(designSystemKey)
  });

  return (
    <section className={s.page}>
      <ShowcaseRouteControls id="colors" eyebrow="Foundations" title="Colors">
        {null}
      </ShowcaseRouteControls>

      <header className={s.header}>
        <p className={s.eyebrow}>Foundations</p>
        <h1 className={s.title}>Colors</h1>
        <p className={s.summary}>
          Every primitive tonal scale published by {designSystemKey || 'the active Design System'}.
          Light and Dark are loaded directly from the post-build color artifacts.
        </p>
      </header>

      <aside className={s.legend} aria-label="Functional reference legend">
        <span className={s.legendItem}>
          <FunctionalMarker name="subtle" />
          Subtle
        </span>
        <span className={s.legendItem}>
          <FunctionalMarker name="vivid" />
          Vivid
        </span>
        <span className={s.legendDescription}>
          Dynamic references use the current runtime seed when their CSS variables are available.
        </span>
      </aside>

      {loading ? (
        <div className={s.status} role="status">
          Loading published primitive scales…
        </div>
      ) : null}

      {error ? (
        <div className={s.scaleError} role="alert">
          Unable to load colors.json for {designSystemKey}: {error}
        </div>
      ) : null}

      {!loading && !error && colors.length === 0 ? (
        <div className={s.status} role="status">
          This Design System does not publish primitive color scales.
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div className={s.catalog}>
          {colors.map((color) => (
            <PrimitiveFamily key={color.id} color={color} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
