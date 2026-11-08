'use client';

import { useEffect, useState } from 'react';
import { inspectionRevision } from '../../generated/revision.ts';
import type { InspectionDataset } from '../model/inspection.ts';
import { JsonExplorer } from '../viewer/JsonExplorer.tsx';

let cached: { revision: string; promise: Promise<InspectionDataset> } | undefined;

function loadDataset(revision: string) {
  if (cached?.revision === revision) return cached.promise;
  const promise = fetch(`/inspection/fluent-button.json?revision=${revision}`, {
    cache: 'no-store'
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Could not load inspection data (${response.status}).`);
    const result = await response.json();
    if (!result?.model?.root || !result.model.definitions)
      throw new Error('Invalid inspection data.');
    return result as InspectionDataset;
  });
  cached = { revision, promise };
  promise.catch(() => {
    if (cached?.promise === promise) cached = undefined;
  });
  return promise;
}

export default function Page() {
  const [state, setState] = useState<{
    data?: InspectionDataset;
    error?: string;
    revision?: string;
  }>({});
  useEffect(() => {
    let active = true;
    loadDataset(inspectionRevision).then(
      (data) => {
        if (active) setState({ data, revision: inspectionRevision });
      },
      (error: Error) => {
        if (active) setState({ error: error.message });
      }
    );
    return () => {
      active = false;
    };
  }, [inspectionRevision]);
  if (state.error)
    return (
      <main style={{ padding: 40 }}>
        <h1>JSON Explorer</h1>
        <p role="alert">{state.error}</p>
        <p>
          Run <code>pnpm --filter @kiskadee/json-explorer inspect</code> and reload.
        </p>
      </main>
    );
  if (!state.data)
    return (
      <main style={{ padding: 40 }} aria-busy="true">
        <h1>JSON Explorer</h1>
        <p>Loading the type contract…</p>
      </main>
    );
  return <JsonExplorer key={state.revision} {...state.data} />;
}
