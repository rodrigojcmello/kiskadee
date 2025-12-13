'use client';

import type { SelectProps as HeadlessSelectProps } from '@kiskadee/react-headless';
import { Select as HeadlessSelect } from '@kiskadee/react-headless';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@/components/Icon/Icon';
import styles from './Select.module.scss';

interface SelectProps extends Omit<HeadlessSelectProps, 'children' | 'classNames'> {
  className?: string;
  label?: ReactNode;
}

export function Select({
  value,
  onValueChange,
  options,
  disabled,
  className = '',
  label
}: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  // Internal flag to enable/disable dynamic durations based on option count.
  const enableDynamicDurations = true;

  let dynamicStyle: CSSProperties | undefined;

  if (enableDynamicDurations) {
    const duration = (count: number, baseMs: number, perItemMs: number, maxMs: number) => {
      // Options are only visible starting from 2 items.
      // Treat 2 as the base size and add extra time from the 3rd item onwards.
      const MIN_VISIBLE_OPTIONS = 2;
      const effectiveCount = Math.max(count - MIN_VISIBLE_OPTIONS, 0);
      const raw = baseMs + effectiveCount * perItemMs;
      return Math.min(raw, maxMs);
    };

    // Single base duration for opening, scaling with the number of options.
    // baseMs = duration for 2 options (visible minimum).
    const openDurationMs = duration(options.length, 100, 8, 200);

    // Fechamento: metade do tempo de abertura.
    const closeDurationMs = openDurationMs / 2;

    dynamicStyle = {
      '--select-open-opacity-duration': `${openDurationMs}ms`,
      '--select-close-opacity-duration': `${closeDurationMs}ms`
    } as CSSProperties;
  }

  return (
    <HeadlessSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      options={options}
      style={dynamicStyle}
      classNames={{
        e1: `${styles.container} ${className}`.trim(),
        e5: styles.label,
        e2: styles.trigger,
        e3: styles.dropdown,
        e4: styles.option,
        e4a: `${styles.option} ${styles.selected}`,
        e4d: `${styles.option} ${styles.optionDisabled}`
      }}
    >
      {label ? <HeadlessSelect.Label>{label}</HeadlessSelect.Label> : null}
      <HeadlessSelect.Trigger>
        <span>{selectedOption?.label || value}</span>
        <Icon name="ChevronDown" className={styles.chevron} />
      </HeadlessSelect.Trigger>
      <HeadlessSelect.Content>
        {options.map((opt) => (
          <HeadlessSelect.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </HeadlessSelect.Option>
        ))}
      </HeadlessSelect.Content>
    </HeadlessSelect.Root>
  );
}
