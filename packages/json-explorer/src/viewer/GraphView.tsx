'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { InspectionModel } from '../model/inspection.ts';
import { getNodeChildren, type InspectionNode } from '../model/navigation.ts';
import styles from './explorer.module.css';
import { layoutGraph } from './layout-graph.ts';
import { NodeCard } from './NodeCard.tsx';

interface Props {
  model: InspectionModel;
  root: InspectionNode;
  selected: InspectionNode;
  secondaryLabelField?: string;
  onSelect: (node: InspectionNode) => void;
}

type Measurement = { width: number; height: number };

export function GraphView({ model, root, selected, secondaryLabelField, onSelect }: Props) {
  const [expanded, setExpanded] = useState(() => new Set([root.id]));
  const [measurements, setMeasurements] = useState<Record<string, Measurement>>({});
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [panReady, setPanReady] = useState(false);
  const viewport = useRef<HTMLElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const nodes = useMemo(() => {
    const result: InspectionNode[] = [];
    function visit(node: InspectionNode) {
      result.push(node);
      if (expanded.has(node.id)) getNodeChildren(model, node).forEach(visit);
    }
    visit(root);
    return result;
  }, [model, root, expanded]);
  const visibleIds = useMemo(() => nodes.map((node) => node.id).join('\n'), [nodes]);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = plane.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      setMeasurements((previous) => {
        let next = previous;
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.nodeId;
          if (!id) continue;
          const rect = entry.target.getBoundingClientRect();
          const width = Math.ceil(rect.width);
          const height = Math.ceil(rect.height);
          if (previous[id]?.width !== width || previous[id]?.height !== height) {
            if (next === previous) next = { ...previous };
            next[id] = { width, height };
          }
        }
        return next;
      });
    });
    element.querySelectorAll<HTMLElement>('[data-node-id]').forEach((node) => {
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [visibleIds]);

  const graph = useMemo(() => {
    if (nodes.some((node) => !measurements[node.id])) return undefined;
    return layoutGraph(
      nodes.map((node) => ({ id: node.id, parentId: node.parentId, ...measurements[node.id] }))
    );
  }, [nodes, measurements]);

  const offsetY = graph ? Math.max(132, (viewportSize.height - graph.height) / 2) : 0;
  const toggle = useCallback(
    (node: InspectionNode) => {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      if (
        expanded.has(node.id) &&
        selected.path.length > node.path.length &&
        selected.path
          .slice(0, node.path.length)
          .every((part, index) => JSON.stringify(part) === JSON.stringify(node.path[index]))
      )
        onSelect(node);
    },
    [expanded, selected.path, onSelect]
  );

  useEffect(() => {
    const clear = () => {
      setPanReady(false);
      drag.current = null;
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') clear();
    };
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clear);
    };
  }, []);

  return (
    <section
      className={`${styles.graphViewport} ${panReady ? styles.panReady : ''}`}
      ref={viewport}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Scrollable canvas needs focus for keyboard scrolling and Space panning.
      tabIndex={0}
      aria-label="Graph canvas"
      onKeyDown={(event) => {
        if (
          event.code !== 'Space' ||
          (event.target as HTMLElement).closest('button,input,summary,pre')
        )
          return;
        event.preventDefault();
        setPanReady(true);
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button,summary,pre')) return;
        event.currentTarget.focus({ preventScroll: true });
        if (!panReady || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          left: event.currentTarget.scrollLeft,
          top: event.currentTarget.scrollTop
        };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
        event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div
        ref={plane}
        className={styles.graphPlane}
        style={{
          width: Math.max(viewportSize.width, graph?.width ?? 0),
          height: Math.max(viewportSize.height, (graph?.height ?? 0) + offsetY)
        }}
        aria-busy={!graph}
      >
        {graph ? (
          <svg
            className={styles.connections}
            width={Math.max(viewportSize.width, graph.width)}
            height={Math.max(viewportSize.height, graph.height + offsetY)}
            aria-hidden="true"
          >
            {nodes
              .filter((node) => node.parentId)
              .map((node) => {
                const from = graph.positions[node.parentId as string];
                const to = graph.positions[node.id];
                const x1 = from.x + from.width,
                  y1 = from.y + from.height / 2 + offsetY;
                const x2 = to.x,
                  y2 = to.y + to.height / 2 + offsetY;
                const bend = (x2 - x1) / 2;
                const active =
                  selected.id === node.id ||
                  (selected.ancestorTypeIds.length > 0 &&
                    selected.path
                      .slice(0, node.path.length)
                      .every(
                        (segment, index) =>
                          JSON.stringify(segment) === JSON.stringify(node.path[index])
                      ));
                return (
                  <path
                    key={node.id}
                    d={`M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`}
                    stroke={active ? '#6351d6' : '#c5cddc'}
                  />
                );
              })}
          </svg>
        ) : null}
        {nodes.map((node) => {
          const position = graph?.positions[node.id];
          const hasOutput = expanded.has(node.id) && getNodeChildren(model, node).length > 0;
          return (
            <div
              className={styles.graphNode}
              key={node.id}
              style={{
                width: node.parentId ? 350 : 320,
                left: position?.x ?? 0,
                top: (position?.y ?? 0) + offsetY,
                visibility: graph ? 'visible' : 'hidden'
              }}
            >
              <NodeCard
                node={node}
                model={model}
                selected={selected.id === node.id}
                expanded={expanded.has(node.id)}
                onSelect={onSelect}
                onToggle={toggle}
                secondaryLabelField={secondaryLabelField}
              />
              {hasOutput ? (
                <span
                  className={`${styles.outputPort} ${selected.id === node.id ? styles.activePort : ''}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
