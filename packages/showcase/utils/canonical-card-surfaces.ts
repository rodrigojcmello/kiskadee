import type { DesignSystemSchemaArtifact } from '@/hooks/use-design-system-schema';

export const CANONICAL_CARD_SURFACE_ROLES = [
  { key: 'neutral.low', intent: 'neutral', emphasis: 'low', label: 'Neutral low' },
  { key: 'neutral.medium', intent: 'neutral', emphasis: 'medium', label: 'Neutral medium' },
  { key: 'primary.medium', intent: 'primary', emphasis: 'medium', label: 'Primary medium' },
  { key: 'neutral.high', intent: 'neutral', emphasis: 'high', label: 'Neutral high' },
  {
    key: 'primary.highest',
    intent: 'primary',
    emphasis: 'highest',
    label: 'Primary highest'
  },
  { key: 'neutral.highest', intent: 'neutral', emphasis: 'highest', label: 'Neutral highest' }
] as const;

export type CanonicalCardSurfaceKey = (typeof CANONICAL_CARD_SURFACE_ROLES)[number]['key'];

export type ResolvedCanonicalCardSurface = {
  key: CanonicalCardSurfaceKey;
  label: string;
  resolvedColor: string;
};

function resolveSchemaColor(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return undefined;

  const ref = (value as { ref?: unknown }).ref;
  return typeof ref === 'string' ? ref : undefined;
}

export function normalizeSurfaceColor(color: string): string {
  return color.trim().toLowerCase();
}

export function resolveCanonicalCardSurfaces({
  schema,
  segment,
  theme
}: {
  schema: DesignSystemSchemaArtifact | undefined;
  segment: string;
  theme: string;
}): ResolvedCanonicalCardSurface[] {
  const boxColor =
    schema?.components?.card?.elements?.e1?.palettes?.[segment]?.[theme]?.default?.boxColor;
  if (!boxColor) return [];

  const seenColors = new Set<string>();
  const surfaces: ResolvedCanonicalCardSurface[] = [];

  for (const role of CANONICAL_CARD_SURFACE_ROLES) {
    const resolvedColor = resolveSchemaColor(boxColor[role.intent]?.[role.emphasis]?.rest);
    if (!resolvedColor) continue;

    const normalizedColor = normalizeSurfaceColor(resolvedColor);
    if (seenColors.has(normalizedColor)) continue;

    seenColors.add(normalizedColor);
    surfaces.push({
      key: role.key,
      label: role.label,
      resolvedColor
    });
  }

  return surfaces;
}

function parseOpaqueHex(color: string): [number, number, number] | undefined {
  const normalized = normalizeSurfaceColor(color);
  const match = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/.exec(normalized);
  if (!match) return undefined;

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ];
}

function linearizeSrgb(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function isDarkSurfaceColor(color: string): boolean {
  const rgb = parseOpaqueHex(color);
  if (!rgb) return false;

  const [red, green, blue] = rgb.map(linearizeSrgb);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance < 0.35;
}
