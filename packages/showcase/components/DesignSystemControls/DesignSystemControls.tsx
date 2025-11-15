'use client';
import type { ThemeMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';

export default function DesignSystemControls() {
  const {
    template,
    setTemplate,
    templateKeys,
    templateMeta,
    segment,
    setSegment,
    availableSegments,
    theme,
    setTheme,
    availableThemes
  } = useKiskadee();

  return (
    <div style={{ padding: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {/* 1. Template selector (Design System) */}
      <label>
        Design System:
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {templateKeys.map((k) => (
            <option key={k} value={k}>
              {templateMeta[k]?.displayName || k}
            </option>
          ))}
        </select>
      </label>

      {/* 2. Segment selector (Brand/Product) */}
      <label>
        Segment:
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          style={{ marginLeft: 8 }}
          disabled={availableSegments.length <= 1}
        >
          {availableSegments.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* 3. Theme Mode selector (Light/Dark) */}
      <label>
        Theme:
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeMode)}
          style={{ marginLeft: 8 }}
          disabled={availableThemes.length <= 1}
        >
          {availableThemes.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
