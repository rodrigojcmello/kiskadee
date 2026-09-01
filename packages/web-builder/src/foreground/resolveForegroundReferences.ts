import {
  type Color,
  type ElementPalettes,
  isForegroundReferenceCandidate,
  parseForegroundReferenceToken,
  type SchemaForegrounds
} from '@kiskadee/core';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveForegroundToken(
  token: string,
  segment: string,
  foregrounds: SchemaForegrounds | undefined,
  path: string
): Color {
  if (!foregrounds) {
    throw new Error(`[web-builder] ${path} references foreground without global.foregrounds.`);
  }
  const coordinate = parseForegroundReferenceToken(token);
  if (!coordinate) {
    throw new Error(`[web-builder] ${path} contains invalid foreground token "${token}".`);
  }

  const family = foregrounds.profiles[coordinate.family];
  if (!family) {
    throw new Error(
      `[web-builder] ${path} references unknown foreground family "${coordinate.family}".`
    );
  }
  const profile = family[coordinate.profile];
  if (!profile) {
    throw new Error(
      `[web-builder] ${path} references unavailable foreground profile "${coordinate.family}.${coordinate.profile}".`
    );
  }
  const stateMap =
    profile.palettes[segment]?.[coordinate.theme]?.[coordinate.surfaceContext]?.[
      coordinate.emphasis
    ];
  const color = stateMap?.[coordinate.state];
  if (color === undefined) {
    throw new Error(
      `[web-builder] ${path} cannot resolve "${token}" in foreground segment "${segment}".`
    );
  }
  return color;
}

function resolveValue(
  value: unknown,
  options: {
    allowForeground: boolean;
    foregrounds: SchemaForegrounds | undefined;
    path: string;
    segment: string;
  }
): unknown {
  if (isForegroundReferenceCandidate(value)) {
    if (!options.allowForeground) {
      throw new Error(`[web-builder] ${options.path} uses an fg reference outside textColor.`);
    }
    return resolveForegroundToken(value, options.segment, options.foregrounds, options.path);
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      resolveValue(item, { ...options, path: `${options.path}.${index}` })
    );
  }
  if (!isRecord(value)) return value;

  if (Object.hasOwn(value, 'parentState')) {
    if (!options.allowForeground) {
      throw new Error(
        `[web-builder] ${options.path}.parentState uses an fg reference outside textColor.`
      );
    }
    if (!isForegroundReferenceCandidate(value.parentState)) {
      throw new Error(`[web-builder] ${options.path}.parentState requires an fg reference token.`);
    }
    return {
      ref: resolveForegroundToken(
        value.parentState,
        options.segment,
        options.foregrounds,
        `${options.path}.parentState`
      )
    };
  }
  if (Object.hasOwn(value, 'ref') && isForegroundReferenceCandidate(value.ref)) {
    throw new Error(
      `[web-builder] ${options.path}.ref must use the fg.parentState() authoring wrapper.`
    );
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      resolveValue(child, { ...options, path: `${options.path}.${key}` })
    ])
  );
}

/**
 * What
 *     Resolves atomic foreground coordinates before palettes enter the ordinary color pipeline.
 * Why
 *     Style Keys, CSS, manifests, and browser artifacts must remain unaware of schema-only `fg`
 *     references and continue consuming final colors through the existing pipeline.
 */
export function resolveForegroundReferences(
  palettes: ElementPalettes,
  foregrounds: SchemaForegrounds | undefined
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
                    allowForeground: colorProperty === 'textColor',
                    foregrounds,
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
