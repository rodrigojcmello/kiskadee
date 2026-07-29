import type { SurfaceContext } from '@kiskadee/core';

export type DesignSystemSchemaArtifact = {
  components?: {
    card?: {
      elements?: {
        e1?: {
          palettes?: Record<
            string,
            Record<string, Partial<Record<SurfaceContext, DesignSystemCardColorSchema>>>
          >;
        };
      };
    };
  };
};

export type DesignSystemCardBoxColor = Record<
  string,
  Record<
    string,
    {
      rest?: unknown;
    }
  >
>;

export type DesignSystemCardColorSchema = {
  boxColor?: DesignSystemCardBoxColor;
};

export type ResolveDesignSystemCardSurfaceColorOptions = {
  schema?: DesignSystemSchemaArtifact;
  segment: string;
  theme: string;
  surfaceContext?: SurfaceContext;
  intent: string;
  emphasis: string;
};

function resolveSchemaColor(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return undefined;

  const ref = (value as { ref?: unknown }).ref;
  return typeof ref === 'string' ? ref : undefined;
}

export function resolveDesignSystemCardSurfaceColor({
  schema,
  segment,
  theme,
  surfaceContext = 'onSubtle',
  intent,
  emphasis
}: ResolveDesignSystemCardSurfaceColorOptions): string | undefined {
  return resolveSchemaColor(
    schema?.components?.card?.elements?.e1?.palettes?.[segment]?.[theme]?.[surfaceContext]
      ?.boxColor?.[intent]?.[emphasis]?.rest
  );
}
