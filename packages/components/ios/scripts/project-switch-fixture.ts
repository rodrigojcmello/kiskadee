/**
 * Project canonical Switch palettes into the native MVP's segment/theme/paint shape.
 * Native fixtures currently consume only Standard paint on a subtle surface.
 * Foreground references are preserved; resolving them is a separate existing exporter gap.
 */
export function projectSwitchFixturePalettes<T>(component: T): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (value === null || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => {
        if (key !== 'palettes') return [key, visit(child)];
        const segments = child as Record<
          string,
          Record<
            string,
            {
              onSubtle: { standard: unknown };
            }
          >
        >;
        return [
          key,
          Object.fromEntries(
            Object.entries(segments).map(([segment, themes]) => [
              segment,
              Object.fromEntries(
                Object.entries(themes).map(([theme, contexts]) => {
                  if (!contexts.onSubtle?.standard) {
                    throw new Error(
                      `Switch ${segment}.${theme}: missing onSubtle.standard palette`
                    );
                  }
                  return [theme, structuredClone(contexts.onSubtle.standard)];
                })
              )
            ])
          )
        ];
      })
    );
  };
  return visit(component) as T;
}
