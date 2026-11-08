import type { InspectionModel } from '../model/inspection.ts';
import {
  formatJsonValue,
  formatReference,
  getNavigationDefinition,
  getNodeBreadcrumb,
  getNodeChildren,
  getSecondaryLabel,
  getTypeSummary,
  type InspectionNode
} from '../model/navigation.ts';
import styles from './explorer.module.css';
import { nodeType } from './node-presentation.ts';

export function Inspector({
  node,
  model,
  secondaryLabelField
}: {
  node: InspectionNode;
  model: InspectionModel;
  secondaryLabelField?: string;
}) {
  const secondary = getSecondaryLabel(node, secondaryLabelField);
  const children = getNodeChildren(model, node);
  const type = getNavigationDefinition(model, node);
  const referenceText =
    node.reference.kind === 'value' ? formatJsonValue(node.reference.value, Infinity) : undefined;
  return (
    <aside className={styles.inspector} aria-label="Property inspector">
      <div className={styles.inspectorContent}>
        <p className={styles.eyebrow}>PROPERTY</p>
        <h2 className={styles.inspectorKey}>{node.label}</h2>
        {secondary ? (
          <div>
            <p className={styles.secondary}>{secondary}</p>
            <p className={styles.micro}>
              Label ·{' '}
              {node.documentation?.summary ? 'JSDoc @summary' : `reference.${secondaryLabelField}`}
            </p>
          </div>
        ) : null}
        <div className={styles.inspectorMeta}>
          <span className={styles.typeBadge}>{nodeType(model, node)}</span>
          <span>{getTypeSummary(model, node)}</span>
        </div>
        <section className={styles.detailSection}>
          <h3>Description</h3>
          <p className={node.documentation?.description ? styles.description : styles.muted}>
            {node.documentation?.description || 'No description in source.'}
          </p>
          {node.documentation?.source ? (
            <p className={styles.micro}>JSDoc · {node.documentation.source.kind}</p>
          ) : null}
        </section>
        <section className={styles.detailSection}>
          <h3>Reference value</h3>
          <span
            className={`${styles.badge} ${node.reference.kind === 'missing' ? styles.missingBadge : ''}`}
          >
            {formatReference(node.reference)}
          </span>
          {node.reference.kind === 'value' ? (
            <textarea
              className={styles.referenceValue}
              aria-label={`JSON value of ${node.label}`}
              readOnly
              rows={Math.min(12, referenceText?.split('\n').length ?? 1)}
              value={referenceText}
            />
          ) : null}
          {node.reference.kind === 'none' && node.reference.applicable !== false ? (
            <p className={styles.hint}>
              Only the type is being inspected. No field is marked as missing.
            </p>
          ) : null}
        </section>
        {children.length ? (
          <section className={styles.detailSection}>
            <h3>
              {type.kind === 'union' || type.kind === 'intersection' ? 'Allowed forms' : 'Children'}
            </h3>
            <ul className={styles.childList}>
              {children.slice(0, 8).map((child) => (
                <li key={child.id}>
                  {child.label}
                  {child.optional ? '?' : ''}
                </li>
              ))}
            </ul>
            {children.length > 8 ? (
              <p className={styles.micro}>{children.length - 8} more</p>
            ) : null}
          </section>
        ) : null}
        <details className={styles.typeDetails}>
          <summary>Type declaration</summary>
          <pre>{node.typeLabel}</pre>
        </details>
        {node.recursive ? (
          <p className={styles.hint}>
            Recursive reference. The type is retained without expanding this branch forever.
          </p>
        ) : null}
        {model.diagnostics.some((d) => d.typeId === node.typeId) ? (
          <p role="status" className={styles.hint}>
            Structure not expanded.{' '}
            {model.diagnostics
              .filter((d) => d.typeId === node.typeId)
              .map((d) => d.message)
              .join(' ')}
          </p>
        ) : null}
      </div>
      <section className={styles.source}>
        <h3>SOURCE PATH</h3>
        <p>{getNodeBreadcrumb(node).join(' → ')}</p>
        {node.documentation?.source ? (
          <p>
            {node.documentation.source.file}:{node.documentation.source.line}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
