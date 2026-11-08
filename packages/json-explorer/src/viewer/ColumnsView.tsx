'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { InspectionModel } from '../model/inspection.ts';
import { canExpand, getNodeBreadcrumb, type InspectionNode } from '../model/navigation.ts';
import { type BranchColumn, getBranchColumns } from './columns.ts';
import styles from './explorer.module.css';
import { Icon } from './Icon.tsx';
import { NodeCard } from './NodeCard.tsx';

interface Props {
  model: InspectionModel;
  root: InspectionNode;
  selected: InspectionNode;
  secondaryLabelField?: string;
  onSelect: (node: InspectionNode) => void;
}

function Column({
  column,
  level,
  model,
  secondaryLabelField,
  onSelect
}: {
  column: BranchColumn;
  level: number;
  model: InspectionModel;
  secondaryLabelField?: string;
  onSelect: (node: InspectionNode) => void;
}) {
  const scroll = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (scroll.current) scroll.current.scrollTop = 0;
  }, [column.selectedId]);
  return (
    <section className={styles.column} aria-label={`Level ${level}`}>
      <header className={styles.columnHeading}>
        <h2>{column.parent?.label ?? 'Root'}</h2>
        <span className={styles.badge}>Level {level}</span>
      </header>
      <div className={styles.columnScroll} ref={scroll}>
        {column.nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            model={model}
            selected={node.id === column.selectedId}
            column
            onSelect={onSelect}
            secondaryLabelField={secondaryLabelField}
          />
        ))}
      </div>
      <footer className={styles.columnFooter}>
        {column.nodes.length} {column.nodes.length === 1 ? 'entry' : 'entries'}
      </footer>
    </section>
  );
}

export function ColumnsView({ model, root, selected, secondaryLabelField, onSelect }: Props) {
  const columns = useMemo(
    () => getBranchColumns(model, root, selected.path),
    [model, root, selected.path]
  );
  const [start, setStart] = useState(0);
  const maxStart = Math.max(0, columns.length - 4);
  const windowStart = Math.min(start, maxStart);
  const select = (node: InspectionNode) => {
    onSelect(node);
    setStart(Math.max(0, getBranchColumns(model, root, node.path).length - 4));
  };
  return (
    <div className={styles.columnsView}>
      <div className={styles.columnNavigation}>
        <p className={styles.breadcrumb}>{getNodeBreadcrumb(selected).join(' → ')}</p>
        <div>
          <span>
            Levels {windowStart + 1}–{Math.min(windowStart + 4, columns.length)} of {columns.length}
          </span>
          <button
            type="button"
            aria-label="Previous levels"
            disabled={!windowStart}
            onClick={() => setStart(windowStart - 1)}
          >
            <Icon name="left" />
          </button>
          <button
            type="button"
            aria-label="Next levels"
            disabled={windowStart === maxStart}
            onClick={() => setStart(windowStart + 1)}
          >
            <Icon name="right" />
          </button>
        </div>
      </div>
      <div className={styles.columnGrid}>
        {Array.from({ length: 4 }, (_, offset) => {
          const index = windowStart + offset;
          const column = columns[index];
          if (column)
            return (
              <Column
                key={`${index}-${column.parent?.id ?? 'root'}`}
                column={column}
                level={index + 1}
                model={model}
                secondaryLabelField={secondaryLabelField}
                onSelect={select}
              />
            );
          const firstEmpty = index === columns.length;
          return (
            <section
              key={`empty-${index}`}
              className={`${styles.column} ${styles.emptyColumn}`}
              aria-label="Unopened column"
            >
              <header className={styles.columnHeading}>
                <h2>{firstEmpty ? 'Continue exploring' : 'No level'}</h2>
                {firstEmpty ? <span className={styles.badge}>Unopened</span> : null}
              </header>
              {firstEmpty ? (
                <div className={styles.emptyMessage}>
                  <Icon name="right" />
                  <h3>
                    {canExpand(model, selected) ? 'Select a property' : 'No child properties'}
                  </h3>
                  <p>
                    {canExpand(model, selected)
                      ? 'Choose a property to read its description and open its children.'
                      : 'The selected value is a leaf. This branch ends here.'}
                  </p>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
