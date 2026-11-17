'use client';

import type { ComponentName } from '@kiskadee/core';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './ComponentAudit.module.scss';

const componentLabels = {
  accordion: 'Accordion',
  badge: 'Badge',
  bottomSheet: 'BottomSheet',
  button: 'Button',
  card: 'Card',
  chip: 'Chip',
  container: 'Container',
  dropdown: 'Dropdown',
  icon: 'Icon',
  layout: 'Layout',
  progress: 'Progress',
  select: 'Select',
  separator: 'Separator',
  slider: 'Slider',
  switch: 'Switch',
  tabs: 'Tabs',
  text: 'Text',
  textField: 'TextField'
} satisfies Record<ComponentName, string>;

const componentRows = Object.entries(componentLabels).sort(([, left], [, right]) =>
  left.localeCompare(right, 'en')
);

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
        Blank cells are awaiting review.
      </Text>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the table in this region. */}
      <section className={styles.tableWindow} aria-label="Audit criteria" tabIndex={0}>
        <table
          className={styles.table}
          aria-labelledby="component-audit-title"
          aria-describedby="component-audit-description"
        >
          <thead>
            <tr>
              {['Component', ...criteria].map((label) => (
                <th key={label} scope="col">
                  <Text as="span" profile={profiles.bodyStrong}>
                    {label}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {componentRows.map(([component, label]) => (
              <tr key={component}>
                <th scope="row">
                  <Text as="span" profile={profiles.body}>
                    {label}
                  </Text>
                </th>
                {criteria.map((criterion) => (
                  <td key={criterion} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
