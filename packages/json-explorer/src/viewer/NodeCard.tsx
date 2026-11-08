import { memo, type Ref } from 'react';
import type { InspectionModel } from '../model/inspection.ts';
import {
  canExpand,
  formatJsonValue,
  formatReference,
  getSecondaryLabel,
  getTypeSummary,
  type InspectionNode
} from '../model/navigation.ts';
import styles from './explorer.module.css';
import { Icon } from './Icon.tsx';
import { hasCompactValue, nodeType } from './node-presentation.ts';

interface Props {
  node: InspectionNode;
  model: InspectionModel;
  secondaryLabelField?: string;
  selected: boolean;
  expanded?: boolean;
  column?: boolean;
  onSelect: (node: InspectionNode) => void;
  onToggle?: (node: InspectionNode) => void;
  cardRef?: Ref<HTMLElement>;
}

export const NodeCard = memo(function NodeCard({
  node,
  model,
  secondaryLabelField,
  selected,
  expanded,
  column,
  onSelect,
  onToggle,
  cardRef
}: Props) {
  const secondary = getSecondaryLabel(node, secondaryLabelField);
  const expandable = canExpand(model, node);
  const summary = getTypeSummary(model, node);
  const displayType = nodeType(model, node);
  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${selected ? styles.selectedCard : ''}`}
      data-node-id={node.id}
      data-node-label={node.label}
      data-selected={selected}
    >
      <button
        type="button"
        className={styles.cardBody}
        onClick={() => onSelect(node)}
        aria-label={`Inspect ${node.label}`}
        aria-pressed={selected}
      >
        <span className={`${styles.keyRow} ${expandable && !column ? styles.withToggle : ''}`}>
          <span className={styles.nodeKey}>{node.label}</span>
          {column && expandable ? <Icon name="right" /> : null}
        </span>
        {secondary ? <span className={styles.secondary}>{secondary}</span> : null}
        <span className={styles.cardMeta}>
          <span className={styles.mono}>
            {displayType}
            {!column && node.optional ? ' · Optional' : ''}
          </span>
          <span className={node.reference.kind === 'missing' ? styles.missingText : ''}>
            {!column && node.reference.kind === 'missing'
              ? 'Not provided'
              : summary === displayType
                ? ''
                : summary}
          </span>
        </span>
        {column ? (
          <span className={styles.cardMeta}>
            <span>{node.optional ? 'Optional' : 'Required'}</span>
            <span className={node.reference.kind === 'missing' ? styles.missingText : ''}>
              {formatReference(node.reference)}
            </span>
          </span>
        ) : null}
        {hasCompactValue(node) && node.reference.kind === 'value' ? (
          <span className={styles.compactValue}>{formatJsonValue(node.reference.value, 80)}</span>
        ) : null}
      </button>
      {!column && expandable && onToggle ? (
        <button
          className={styles.expandButton}
          type="button"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.label}`}
          aria-expanded={expanded}
          onClick={() => onToggle(node)}
        >
          <Icon name={expanded ? 'minus' : 'plus'} />
        </button>
      ) : null}
      {column && selected ? (
        <div className={styles.inlineDetails}>
          {secondary ? (
            <p className={styles.micro}>
              Label ·{' '}
              {node.documentation?.summary ? 'JSDoc @summary' : `reference.${secondaryLabelField}`}
            </p>
          ) : null}
          <p className={node.documentation?.description ? styles.description : styles.muted}>
            {node.documentation?.description || 'No description in source.'}
          </p>
          {node.documentation?.source ? (
            <p className={styles.micro}>JSDoc · {node.documentation.source.kind}</p>
          ) : null}
          {node.recursive ? (
            <p className={styles.description}>Recursive type reference · this branch ends here.</p>
          ) : null}
          {node.reference.kind === 'value' &&
          hasCompactValue(node) &&
          formatJsonValue(node.reference.value, Infinity).length > 80 ? (
            <pre className={styles.fullColumnValue}>
              {formatJsonValue(node.reference.value, Infinity)}
            </pre>
          ) : null}
          <details className={styles.typeDetails}>
            <summary>Type declaration</summary>
            <pre>{node.typeLabel}</pre>
          </details>
        </div>
      ) : null}
    </article>
  );
});
