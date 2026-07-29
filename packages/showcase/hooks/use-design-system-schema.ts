'use client';

import { useEffect, useState } from 'react';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';
import type { DesignSystemSchemaArtifact } from '@/utils/design-system-card-surface';

export type { DesignSystemSchemaArtifact } from '@/utils/design-system-card-surface';

const schemaCache = new Map<string, Promise<DesignSystemSchemaArtifact | undefined>>();

type SchemaState = {
  designSystemKey?: string;
  schema?: DesignSystemSchemaArtifact;
};

function loadDesignSystemSchema(
  designSystemKey: string
): Promise<DesignSystemSchemaArtifact | undefined> {
  const cached = schemaCache.get(designSystemKey);
  if (cached) return cached;

  const promise = loadJsonFromBuild<DesignSystemSchemaArtifact | undefined>(
    `${designSystemKey}/schema.json`,
    {
      required: false,
      fallback: undefined
    }
  ).catch(() => undefined);

  schemaCache.set(designSystemKey, promise);
  return promise;
}

export function useDesignSystemSchema(
  designSystemKey?: string
): DesignSystemSchemaArtifact | undefined {
  const [state, setState] = useState<SchemaState>({});

  useEffect(() => {
    let cancelled = false;

    if (!designSystemKey) {
      setState({});
      return () => {
        cancelled = true;
      };
    }

    loadDesignSystemSchema(designSystemKey).then((result) => {
      if (!cancelled) {
        setState({ designSystemKey, schema: result });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [designSystemKey]);

  return state.designSystemKey === designSystemKey ? state.schema : undefined;
}
