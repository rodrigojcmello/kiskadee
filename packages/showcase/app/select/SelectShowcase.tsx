'use client';

import {
  Dropdown,
  FamilyResolvedIcon,
  Text,
  useEssentialIcon,
  useShowcase
} from '@kiskadee/react-components';
import { Select as HeadlessSelect } from '@kiskadee/react-headless/select';
import { useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { ShowcaseRouteControls } from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Select.module.scss';

const STANDARD_OPTIONS = [
  { value: 'design', label: 'Design systems' },
  { value: 'engineering', label: 'Frontend engineering' },
  {
    value: 'research',
    label: 'Research, accessibility and interaction documentation'
  },
  { value: 'archived', label: 'Archived workspace', disabled: true }
];

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'comfortable', label: 'Comfortable' }
];

type PreviewSelectProps = {
  label: string;
  options: typeof STANDARD_OPTIONS;
  value: string;
  onValueChange: (value: string) => void;
  sequential?: boolean;
};

function PreviewSelect({
  label,
  options,
  value,
  onValueChange,
  sequential = false
}: PreviewSelectProps) {
  const selectedOption = options.find((option) => option.value === value);
  const previousIcon = useEssentialIcon('chevron-left');
  const nextIcon = useEssentialIcon('chevron-end');
  const disclosureIcon = useEssentialIcon('chevron-down');

  return (
    <Dropdown.VisualProvider>
      <HeadlessSelect.Root options={options} value={value} onValueChange={onValueChange}>
        <HeadlessSelect.Label className={styles.label}>{label}</HeadlessSelect.Label>
        {sequential ? (
          <div className={styles.sequential}>
            <HeadlessSelect.Previous className={styles.stepButton}>
              {previousIcon ? <FamilyResolvedIcon name={previousIcon} /> : null}
            </HeadlessSelect.Previous>
            <HeadlessSelect.Trigger className={`${styles.trigger} ${styles.sequentialTrigger}`}>
              <span className={styles.value}>{selectedOption?.label}</span>
            </HeadlessSelect.Trigger>
            <HeadlessSelect.Next className={styles.stepButton}>
              {nextIcon ? <FamilyResolvedIcon name={nextIcon} /> : null}
            </HeadlessSelect.Next>
          </div>
        ) : (
          <HeadlessSelect.Trigger className={styles.trigger}>
            <span className={styles.value}>{selectedOption?.label}</span>
            {disclosureIcon ? (
              <span className={styles.disclosure} aria-hidden="true">
                <FamilyResolvedIcon name={disclosureIcon} />
              </span>
            ) : null}
          </HeadlessSelect.Trigger>
        )}
        <Dropdown.Presence>
          {({ forceMount, render }) => (
            <HeadlessSelect.Content
              portalled
              offset={6}
              width="anchor"
              forceMount={forceMount}
              render={render}
            >
              <Dropdown.Surface>
                <Dropdown.Items>
                  <Dropdown.Group>
                    {options.map((option) => (
                      <HeadlessSelect.Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        textValue={option.label}
                        render={(optionProps, state) => {
                          const { ref, children, ...itemProps } = optionProps;
                          return (
                            <Dropdown.Item
                              {...itemProps}
                              ref={ref}
                              disabled={state.disabled}
                              selected={state.selected || state.active}
                            >
                              <Dropdown.Label>{children}</Dropdown.Label>
                            </Dropdown.Item>
                          );
                        }}
                      >
                        {option.label}
                      </HeadlessSelect.Option>
                    ))}
                  </Dropdown.Group>
                </Dropdown.Items>
              </Dropdown.Surface>
            </HeadlessSelect.Content>
          )}
        </Dropdown.Presence>
      </HeadlessSelect.Root>
    </Dropdown.VisualProvider>
  );
}

export default function SelectShowcase() {
  const { manifest } = useShowcase();
  const textProfiles = useShowcaseTextProfiles();
  const [workspace, setWorkspace] = useState('design');
  const [density, setDensity] = useState('default');
  const available = Boolean(manifest?.components?.dropdown);

  return (
    <main className={styles.page}>
      <Text as="h2" profile={textProfiles.pageTitle}>
        Select
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.lead}>
        A headless value-selection contract rendered with the active preset Dropdown.
      </Text>
      <ShowcaseRouteControls id="select" eyebrow="Select" title="Examples" isAvailable={available}>
        {null}
      </ShowcaseRouteControls>

      {!available ? (
        <div className={styles.unavailable}>
          <Text as="p" profile={textProfiles.body}>
            Dropdown is not available in the active design system, so this visual preview cannot be
            rendered.
          </Text>
        </div>
      ) : (
        <>
          <section className={styles.section} aria-labelledby="select-preview-title">
            <Text as="h3" id="select-preview-title" profile={textProfiles.sectionTitle}>
              Visual preview
            </Text>
            <div className={styles.grid}>
              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Standard
                </Text>
                <PreviewSelect
                  label="Workspace"
                  options={STANDARD_OPTIONS}
                  value={workspace}
                  onValueChange={setWorkspace}
                />
              </ShowcaseExampleCard>
              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Sequential
                </Text>
                <PreviewSelect
                  label="Density"
                  options={DENSITY_OPTIONS}
                  value={density}
                  onValueChange={setDensity}
                  sequential
                />
              </ShowcaseExampleCard>
            </div>
          </section>
          <aside className={styles.notice}>
            <Text as="p" profile={textProfiles.caption}>
              Preview only: the selection behavior is public Headless Select, while this trigger
              shell remains local to the Showcase until a styled Select contract is designed.
            </Text>
          </aside>
        </>
      )}
    </main>
  );
}
