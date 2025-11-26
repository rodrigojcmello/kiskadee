"use client";
import { Select } from "@kiskadee/react-headless";
import { useKiskadee } from "@kiskadee/react-components";
import { playWowTransition } from "@/utils/playWowTransition";
import { Icon } from "../Icon/Icon";
import styles from "./DesignSystemControls.module.scss";

export default function DesignSystemControls() {
  const {
    designSystem,
    setDesignSystem,
    designSystemKeys,
    designSystemMeta,
    segment,
    setSegment,
    availableSegments
  } = useKiskadee();

  const designSystemOptions = designSystemKeys.map((key) => ({
    value: key,
    label: designSystemMeta[key]?.displayName || key
  }));

  const segmentOptions = availableSegments.map((s) => ({
    value: s,
    label: s
  }));

  return (
    <div className={styles.container}>
      {/* 1. Design system selector */}
      <div className={styles.group}>
        <span className={styles.label}>Design System</span>
        <Select.Root
          options={designSystemOptions}
          value={designSystem}
          onValueChange={(value) => {
            playWowTransition();
            setDesignSystem(value);
          }}
          classNames={{
            e1: styles.selectContainer,
            e2: styles.trigger,
            e3: styles.dropdown,
            e4: styles.option,
            e4a: `${styles.option} ${styles.selected}`
          }}
        >
          <Select.Trigger>
            <span>{designSystemMeta[designSystem]?.displayName || designSystem}</span>
            <Icon name="ChevronDown" className={styles.chevron} />
          </Select.Trigger>
          <Select.Content>
            {designSystemOptions.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* 2. Segment selector (Brand/Product) */}
      <div className={styles.group}>
        <span className={styles.label}>Segment</span>
        <Select.Root
          options={segmentOptions}
          value={segment}
          onValueChange={(value) => {
            playWowTransition();
            setSegment(value);
          }}
          disabled={availableSegments.length <= 1}
          classNames={{
            e1: styles.selectContainer,
            e2: styles.trigger,
            e3: styles.dropdown,
            e4: styles.option,
            e4a: `${styles.option} ${styles.selected}`,
            e4d: `${styles.option} ${styles.optionDisabled}`
          }}
        >
          <Select.Trigger>
            <span>{segment}</span>
            <Icon name="ChevronDown" className={styles.chevron} />
          </Select.Trigger>
          <Select.Content>
            {segmentOptions.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  );
}
