'use client';

import { Text } from '@kiskadee/react-components/text';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './ComponentAudit.module.scss';
import { componentRows, surfaceStatuses } from './surface-audit';

const criteria = [
  'Accessibility',
  'Static',
  'Motion',
  'Lazy loading',
  'Effect count',
  'Nested components',
  'Typography profile',
  'Surface profile',
  'Icon profile'
] as const;

export default function ComponentAuditPage() {
  const profiles = useShowcaseTextProfiles();

  return (
    <section className={styles.page} aria-labelledby="component-audit-title">
      <Text as="h2" profile={profiles.pageTitle} id="component-audit-title" className={styles.copy}>
        Component audit
      </Text>
      <Text as="p" profile={profiles.body} id="component-audit-description" className={styles.copy}>
        Surface context tracks what nested content receives across presets. Blank criteria await
        review.
      </Text>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the table in this region. */}
      <section className={styles.tableWindow} aria-label="Audit criteria" tabIndex={0}>
        <Text
          as="table"
          profile={profiles.body}
          className={styles.table}
          aria-labelledby="component-audit-title"
          aria-describedby="component-audit-description"
        >
          <thead>
            <tr>
              {['Component', 'Surface context', ...criteria].map((label) => (
                <th key={label} scope="col">
                  <Text as="span" profile={profiles.bodyStrong}>
                    {label}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {componentRows.map(({ label, status, summary, details }) => (
              <tr key={label}>
                <th scope="row">
                  <Text as="span" profile={profiles.body}>
                    {label}
                  </Text>
                </th>
                <td className={styles.surfaceCell}>
                  <Text
                    className={styles.status}
                    profile={profiles.bodyStrong}
                    foreground="inherit"
                  >
                    <span aria-hidden="true">{surfaceStatuses[status].symbol}</span>
                    {surfaceStatuses[status].label}
                  </Text>
                  <p>{summary}</p>
                  {details && (
                    <details>
                      <summary
                        className="k-foc"
                        aria-label={`Surface context details for ${label}`}
                      >
                        Details
                      </summary>
                      <ul>
                        {details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </td>
                {criteria.map((criterion) => (
                  <td key={criterion} />
                ))}
              </tr>
            ))}
          </tbody>
        </Text>
      </section>
    </section>
  );
}
