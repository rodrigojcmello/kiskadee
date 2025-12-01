import type {
  DarkTrackTones,
  LightTrackTones,
  Segment,
  SemanticColor,
  SolidColor
} from '../types/colors/colors.types';
import { withAlpha } from './withAlpha';

export type ModeKeyShort = 'l' | 'd';

const modeFromShort = (m: ModeKeyShort) => (m === 'l' ? 'light' : 'dark');

function resolveSeriesAndKey(
  tone: number
): { series: 'soft'; key: LightTrackTones } | { series: 'solid'; key: DarkTrackTones } {
  // New normalized grids (Option B):
  // soft: 0–10 (step 1) then 15, 20, 25, 30
  // solid: 40, 50, 60, 70, 80, 90, 100
  const softKeys: LightTrackTones[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30] as const;
  const solidKeys: DarkTrackTones[] = [40, 50, 60, 70, 80, 90, 100] as const;

  if (tone <= 30) {
    const clamped = Math.max(0, Math.min(30, Math.round(tone)));
    // snap to nearest allowed soft key
    let best = softKeys[0];
    let bestDiff = Math.abs(clamped - best);
    for (const k of softKeys) {
      const diff = Math.abs(clamped - k);
      if (diff < bestDiff) {
        best = k;
        bestDiff = diff;
      }
    }
    return { series: 'soft', key: best };
  }

  const clamped = Math.max(40, Math.min(100, Math.round(tone)));
  let best = solidKeys[0];
  let bestDiff = Math.abs(clamped - best);
  for (const k of solidKeys) {
    const diff = Math.abs(clamped - k);
    if (diff < bestDiff) {
      best = k;
      bestDiff = diff;
    }
  }
  return { series: 'solid', key: best };
}

export function color(
  segment: Segment,
  mode: ModeKeyShort,
  role: SemanticColor,
  tone: number,
  alpha?: number
): SolidColor {
  const m = modeFromShort(mode) as 'light' | 'dark';
  const { series, key } = resolveSeriesAndKey(tone);

  const theme = segment?.themes?.[m];
  if (!theme) {
    throw new Error(`Theme not found for provided segment in mode=${m}`);
  }

  // Narrow by series to keep key types aligned with buckets
  if (series === 'soft') {
    const bucket = theme?.[role]?.soft as Partial<Record<LightTrackTones, SolidColor>> | undefined;
    if (!bucket) {
      throw new Error(`Role/series not found: role=${role} series=soft in mode=${m}`);
    }
    const value = bucket[key as LightTrackTones] as SolidColor | undefined;
    if (!value) {
      const available = Object.keys(bucket).join(', ');
      throw new Error(`Tone ${key} not available in ${role}.soft. Available: ${available}`);
    }
    return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
  } else {
    const bucket = theme?.[role]?.solid as Partial<Record<DarkTrackTones, SolidColor>> | undefined;
    if (!bucket) {
      throw new Error(`Role/series not found: role=${role} series=solid in mode=${m}`);
    }
    const value = bucket[key as DarkTrackTones] as SolidColor | undefined;
    if (!value) {
      const available = Object.keys(bucket).join(', ');
      throw new Error(`Tone ${key} not available in ${role}.solid. Available: ${available}`);
    }
    return typeof alpha === 'number' ? (withAlpha(value, alpha) as SolidColor) : value;
  }
}
