import type {
  ComponentEmphasis,
  SegmentName,
  SolidColor,
  SurfaceContext,
  ThemeMode
} from './types/colors/colors.types.ts';

/** Shared, state-independent paint for outlines and dividing lines. */
export type ContourEmphasisMap = { medium: { rest: SolidColor } } & Partial<
  Record<Exclude<ComponentEmphasis, 'medium'>, { rest: SolidColor }>
>;
export type ContourProfile = {
  palettes: Partial<
    Record<
      SegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, { onSubtle: ContourEmphasisMap; onVivid?: ContourEmphasisMap }>>
    >
  >;
};
export type SchemaContours = {
  profiles: Readonly<
    Record<string, { standard: ContourProfile } & Partial<Record<string, ContourProfile>>>
  >;
};
export type ContourCoordinate =
  `${string}.${string}.${ThemeMode}.${SurfaceContext}.${ComponentEmphasis}`;
export type ContourReferenceToken = `contour:${ContourCoordinate}`;

/** Authors an atomic Rest color reference; the containing palette supplies the segment. */
export function contour<T extends ContourCoordinate>(coordinate: T): `contour:${T}` {
  return `contour:${coordinate}`;
}

export function isContourReferenceCandidate(value: unknown): value is `contour:${string}` {
  return typeof value === 'string' && value.startsWith('contour:');
}

/** Resolves one published coordinate without inventing missing themes or contexts. */
export function resolveContourReference(
  token: string,
  segment: string,
  contours?: SchemaContours
): SolidColor {
  const match =
    /^contour:([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\.(light|dark|darker)\.(onSubtle|onVivid)\.(lowest|low|medium|high|highest)$/.exec(
      token
    );
  if (!match) throw new Error(`Invalid contour coordinate "${token}".`);
  const [, intent, profile, theme, context, emphasis] = match;
  const color =
    contours?.profiles[intent]?.[profile]?.palettes[segment]?.[theme as ThemeMode]?.[
      context as SurfaceContext
    ]?.[emphasis as ComponentEmphasis]?.rest;
  if (color === undefined)
    throw new Error(`Cannot resolve contour "${token}" in segment "${segment}".`);
  if (isContourReferenceCandidate(color))
    throw new Error('Contour profiles must contain concrete colors, not references.');
  return color;
}
