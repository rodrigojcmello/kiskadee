'use client';

import { useCallback, useMemo, useState } from 'react';
import type { InspectionDataset } from '../model/inspection.ts';
import {
  createRootNode,
  type InspectionNode,
  type NodeSegment,
  resolveNearestNode
} from '../model/navigation.ts';
import { ColumnsView } from './ColumnsView.tsx';
import styles from './explorer.module.css';
import { GraphView } from './GraphView.tsx';
import { Icon } from './Icon.tsx';
import { Inspector } from './Inspector.tsx';

export function JsonExplorer({ model, reference, secondaryLabelField }: InspectionDataset) {
  const [mode, setMode] = useState<'graph' | 'columns'>('graph');
  const [referenceEnabled, setReferenceEnabled] = useState(reference !== undefined);
  const [path, setPath] = useState<NodeSegment[]>([]);
  const root = useMemo(
    () => createRootNode(model, reference, referenceEnabled),
    [model, reference, referenceEnabled]
  );
  const selected = useMemo(
    () => resolveNearestNode(model, path, reference, referenceEnabled),
    [model, path, reference, referenceEnabled]
  );
  const select = useCallback((node: InspectionNode) => setPath(node.path), []);
  const changeMode = (next: 'graph' | 'columns') => {
    if (next !== mode) {
      setMode(next);
      setPath([]);
    }
  };
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>{'{}'}</span>
          <h1>JSON Explorer</h1>
          <span className={styles.documentName}>{model.root.name}</span>
          <span className={`${styles.badge} ${referenceEnabled ? styles.referenceBadge : ''}`}>
            {referenceEnabled ? 'Reference attached' : 'Type only'}
          </span>
        </div>
        <div className={styles.headerControls}>
          <fieldset className={styles.modeControl} aria-label="View mode">
            <button
              type="button"
              aria-pressed={mode === 'graph'}
              onClick={() => changeMode('graph')}
            >
              <Icon name="graph" />
              Graph
            </button>
            <button
              type="button"
              aria-pressed={mode === 'columns'}
              onClick={() => changeMode('columns')}
            >
              <Icon name="columns" />
              Columns
            </button>
          </fieldset>
          <label className={styles.referenceControl}>
            <span>Reference JSON</span>
            <input
              role="switch"
              aria-checked={referenceEnabled}
              type="checkbox"
              checked={referenceEnabled}
              disabled={reference === undefined}
              onChange={(event) => {
                const enabled = event.target.checked;
                setPath(resolveNearestNode(model, path, reference, enabled).path);
                setReferenceEnabled(enabled);
              }}
            />
            <span className={styles.switchTrack} aria-hidden="true" />
          </label>
        </div>
      </header>
      <div className={mode === 'graph' ? styles.graphLayout : styles.mainArea}>
        <div className={styles.workspace}>
          <section className={styles.viewHeading}>
            {model.diagnostics.length ? (
              <details className={styles.diagnostics}>
                <summary>
                  {model.diagnostics.length} inspection diagnostics · some structures need review
                </summary>
                <ul>
                  {model.diagnostics.map((diagnostic) => (
                    <li key={`${diagnostic.typeId ?? ''}-${diagnostic.message}`}>
                      {diagnostic.message}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            <h2>
              <span className={styles.headingText}>
                {referenceEnabled ? 'Overlay reference values' : 'Inspect the type'}
              </span>
            </h2>
            <p>
              <span className={styles.headingText}>
                {referenceEnabled
                  ? 'A reference adds values; optional properties without a value still belong to the type.'
                  : 'Every permitted property remains visible, even without a JSON reference.'}
              </span>
            </p>
            {mode === 'graph' ? (
              <div className={styles.headingMeta}>
                <span className={styles.badge}>
                  {referenceEnabled ? 'Type + reference JSON' : 'Type contract'}
                </span>
                <span className={styles.breadcrumb}>
                  <span className={styles.headingText}>
                    {[model.source.exportName, ...model.source.path].join(' → ')}
                  </span>
                </span>
              </div>
            ) : null}
          </section>
          {mode === 'graph' ? (
            <GraphView
              key="graph"
              model={model}
              root={root}
              selected={selected}
              onSelect={select}
              secondaryLabelField={secondaryLabelField}
            />
          ) : (
            <ColumnsView
              key="columns"
              model={model}
              root={root}
              selected={selected}
              onSelect={select}
              secondaryLabelField={secondaryLabelField}
            />
          )}
        </div>
        {mode === 'graph' ? (
          <Inspector node={selected} model={model} secondaryLabelField={secondaryLabelField} />
        ) : null}
      </div>
      <footer className={styles.status}>
        <span>
          {mode === 'graph'
            ? 'Card: details · + / −: children · Space + drag: pan'
            : 'Select a card: description + children · Selected ancestors stay first'}
        </span>
        <span>
          {mode === 'graph'
            ? 'Fixed scale · switching views starts navigation again'
            : 'New ancestor: replace descendants · view switch: start again'}
        </span>
      </footer>
    </main>
  );
}
