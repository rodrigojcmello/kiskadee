import {
  type ElementPalettes,
  isContourReferenceCandidate,
  resolveContourReference,
  type SchemaContours
} from '@kiskadee/core';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function resolveValue(
  value: unknown,
  options: {
    allowContour: boolean;
    contours: SchemaContours | undefined;
    path: string;
    segment: string;
  }
): unknown {
  if (isContourReferenceCandidate(value)) {
    if (!options.allowContour) {
      throw new Error(
        `[web-builder] ${options.path} uses a contour reference outside borderColor or boxColor.`
      );
    }
    return resolveContourReference(value, options.segment, options.contours);
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      resolveValue(item, { ...options, path: `${options.path}.${index}` })
    );
  }
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      resolveValue(child, { ...options, path: `${options.path}.${key}` })
    ])
  );
}

/**
 * What
 *     Resolves atomic contour coordinates before palettes enter the ordinary color pipeline.
 * Why
 *     Style Keys, CSS, manifests, and browser artifacts must remain unaware of schema-only `contour`
 *     references and continue consuming final colors through the existing pipeline.
 */
export function resolveContourReferences(
  palettes: ElementPalettes,
  contours: SchemaContours | undefined
): ElementPalettes {
  return Object.fromEntries(
    Object.entries(palettes).map(([segment, byTheme]) => [
      segment,
      Object.fromEntries(
        Object.entries(byTheme ?? {}).map(([theme, byContext]) => [
          theme,
          Object.fromEntries(
            Object.entries(byContext ?? {}).map(([surfaceContext, colorSchema]) => [
              surfaceContext,
              Object.fromEntries(
                Object.entries(colorSchema ?? {}).map(([colorProperty, value]) => [
                  colorProperty,
                  resolveValue(value, {
                    allowContour: colorProperty === 'boxColor' || colorProperty === 'borderColor',
                    contours,
                    path: `${segment}.${theme}.${surfaceContext}.${colorProperty}`,
                    segment
                  })
                ])
              )
            ])
          )
        ])
      )
    ])
  ) as ElementPalettes;
}
