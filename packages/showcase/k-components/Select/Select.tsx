'use client';

import type { SelectProps as HeadlessSelectProps } from '@kiskadee/react-headless';
import { Select as HeadlessSelect } from '@kiskadee/react-headless';
import { Icon } from '@/components/Icon/Icon';
import styles from './Select.module.scss';

interface SelectProps extends Omit<HeadlessSelectProps, 'children' | 'classNames'> {
  className?: string;
}

export function Select({ value, onValueChange, options, disabled, className = '' }: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <HeadlessSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      options={options}
      classNames={{
        e1: `${styles.container} ${className}`.trim(),
        e2: styles.trigger,
        e3: styles.dropdown,
        e4: styles.option,
        e4a: `${styles.option} ${styles.selected}`,
        e4d: `${styles.option} ${styles.optionDisabled}`
      }}
    >
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
