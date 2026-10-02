'use client';
import type { ComponentSize, SelectMode } from '@kiskadee/core';
import { Select } from '@kiskadee/react-components/select';
import { Separator } from '@kiskadee/react-components/separator';
import { Switch } from '@kiskadee/react-components/switch';
import { Text } from '@kiskadee/react-components/text';
import { useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { ShowcaseRouteControls } from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Select.module.scss';

const options = [
  { value: 'design', label: 'Design systems' },
  { value: 'archived', label: 'Archived workspace', disabled: true },
  { value: 'engineering', label: 'Frontend engineering' },
  { value: 'research', label: 'Research and accessibility' }
];
export default function SelectShowcase() {
  const profiles = useShowcaseTextProfiles();
  const [showChevron, setShowChevron] = useState(true);
  const [showDividers, setShowDividers] = useState(false);
  const [value, setValue] = useState<string | null>('design');
  const sequentialPresentation = { showChevron, showDividers };
  return (
    <main className={styles.page}>
      <Text as="h2" profile={profiles.pageTitle}>
        Select
      </Text>
      <Text as="p" profile={profiles.body}>
        Independent selection control. Presets without a Select recipe retain the functional,
        unstyled composition.
      </Text>
      <ShowcaseRouteControls id="select" eyebrow="Select" title="Examples">
        {null}
      </ShowcaseRouteControls>
      <section className={styles.section} aria-labelledby="select-standard-title">
        <Text as="h3" id="select-standard-title" profile={profiles.sectionTitle}>
          Standard
        </Text>
        <div className={styles.grid}>
          {(['outline', 'underline', 'borderless'] as SelectMode[]).map((mode) => (
            <ShowcaseExampleCard key={mode} className={styles.card} border shadow={false}>
              <Text as="h4" profile={profiles.subsectionTitle}>
                {mode[0]?.toUpperCase()}
                {mode.slice(1)}
              </Text>
              <Select label="Workspace" mode={mode} options={options} defaultValue="design" />
              <Select
                label="Disabled"
                mode={mode}
                options={options}
                defaultValue="design"
                disabled
              />
              <Select
                {...sequentialPresentation}
                label="Sequential · Loop enabled"
                mode={mode}
                options={options}
                defaultValue="design"
                sequential
                loop
              />
            </ShowcaseExampleCard>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="select-sizes-title">
        <Text as="h3" id="select-sizes-title" profile={profiles.sectionTitle}>
          Sizes
        </Text>
        <div className={`${styles.grid} ${styles.sizeGrid}`}>
          {(['sm', 'md', 'lg'] as ComponentSize[]).map((size) => (
            <ShowcaseExampleCard key={size} className={styles.card} border shadow={false}>
              <Select label={size} size={size} options={options} defaultValue="design" />
            </ShowcaseExampleCard>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="select-selection-title">
        <Text as="h3" id="select-selection-title" profile={profiles.sectionTitle}>
          Selection and suggestion
        </Text>
        <div className={styles.grid}>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Text as="h4" profile={profiles.subsectionTitle}>
              With selection
            </Text>
            <Text as="p" profile={profiles.body}>
              A confirmed value appears in the field and as Selected in the list.
            </Text>
            <Select label="Workspace" options={options} value={value} onValueChange={setValue} />
          </ShowcaseExampleCard>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Text as="h4" profile={profiles.subsectionTitle}>
              Suggestion without a choice
            </Text>
            <Text as="p" profile={profiles.body}>
              Opening highlights Frontend engineering. It stays a suggestion until confirmed.
            </Text>
            <Select
              label="Workspace"
              options={options}
              suggestedValue="engineering"
              placeholder="Choose a workspace"
            />
          </ShowcaseExampleCard>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Text as="h4" profile={profiles.subsectionTitle}>
              No suggestion
            </Text>
            <Text as="p" profile={profiles.body}>
              The field starts empty and the list opens without an initial highlight.
            </Text>
            <Select
              label="Workspace"
              options={options}
              suggestedValue={null}
              placeholder="Choose a workspace"
            />
          </ShowcaseExampleCard>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Text as="h4" profile={profiles.subsectionTitle}>
              Option to clear
            </Text>
            <Text as="p" profile={profiles.body}>
              Choose No workspace to remove the selection and restore the placeholder.
            </Text>
            <Select
              label="Workspace"
              options={[{ value: 'none', label: 'No workspace', kind: 'none' }, ...options]}
              defaultValue="design"
              placeholder="Choose a workspace"
            />
          </ShowcaseExampleCard>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="select-sequential-title">
        <div className={styles.sectionHeader}>
          <Text as="h3" id="select-sequential-title" profile={profiles.sectionTitle}>
            Sequential navigation
          </Text>
          <ShowcaseExampleCard
            className={styles.controlsCard}
            aria-label="Sequential presentation controls"
            role="group"
            border
            shadow={false}
          >
            <div className={styles.sectionControls}>
              <Switch
                id="select-show-chevron"
                label="Show chevron"
                emphasis="medium"
                controlState={showChevron}
                onControlStateChange={setShowChevron}
              />
              <Separator orientation="vertical" emphasis="low" />
              <Switch
                id="select-show-dividers"
                label="Show dividers"
                emphasis="medium"
                controlState={showDividers}
                onControlStateChange={setShowDividers}
              />
            </div>
          </ShowcaseExampleCard>
        </div>
        <Text as="p" profile={profiles.body}>
          Previous and Next confirm a value without opening the list. Disabled options are skipped.
          Loop affects these buttons only. The switches apply to every sequential example on this
          page.
        </Text>
        <div className={styles.grid}>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Select
              {...sequentialPresentation}
              label="Bounded · First option"
              options={options}
              defaultValue="design"
              sequential
            />
            <Select
              {...sequentialPresentation}
              label="Bounded · Last option"
              options={options}
              defaultValue="research"
              sequential
            />
          </ShowcaseExampleCard>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Select
              {...sequentialPresentation}
              label="Loop"
              options={options}
              defaultValue="research"
              sequential
              loop
            />
            <Select
              {...sequentialPresentation}
              label="Disabled sequential control"
              options={options}
              defaultValue="design"
              sequential
              loop
              disabled
            />
          </ShowcaseExampleCard>
          <ShowcaseExampleCard className={styles.card} border shadow={false}>
            <Select {...sequentialPresentation} label="Empty list" options={[]} sequential loop />
            <Select
              {...sequentialPresentation}
              label="No enabled values"
              options={[{ value: 'none', label: 'No workspace', kind: 'none' }, options[1]!]}
              sequential
              loop
            />
            <Select
              {...sequentialPresentation}
              label="Only one enabled option"
              options={[options[0]!, options[1]!]}
              defaultValue="design"
              sequential
              loop
            />
          </ShowcaseExampleCard>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="select-rtl-title">
        <Text as="h3" id="select-rtl-title" profile={profiles.sectionTitle}>
          Right-to-left (RTL)
        </Text>
        <Text as="p" profile={profiles.body}>
          The value, disclosure glyph and sequential controls follow the field&apos;s RTL direction.
        </Text>
        <ShowcaseExampleCard className={`${styles.card} ${styles.rtlCard}`} border shadow={false}>
          <Select
            {...sequentialPresentation}
            dir="rtl"
            label="Workspace"
            options={options}
            defaultValue="design"
            sequential
            loop
          />
        </ShowcaseExampleCard>
      </section>
    </main>
  );
}
