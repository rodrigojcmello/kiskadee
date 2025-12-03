'use client';

import type { SelectProps as HeadlessSelectProps } from '@kiskadee/react-headless';
import { Select as HeadlessSelect } from '@kiskadee/react-headless';
import type { CSSProperties } from 'react';
import { Icon } from '@/components/Icon/Icon';
import styles from './Select.module.scss';

interface SelectProps extends Omit<HeadlessSelectProps, 'children' | 'classNames'> {
  className?: string;
}

export function Select({ value, onValueChange, options, disabled, className = '' }: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  // Flag interna para habilitar/desabilitar durações dinâmicas baseadas na quantidade de opções.
  const enableDynamicDurations = true;

  let dynamicStyle: CSSProperties | undefined;

  if (enableDynamicDurations) {
    const optionCount = options.length;

    const duration = (n: number, min: number, base: number, perItem: number, max: number) => {
      const raw = base + n * perItem;
      return Math.max(min, Math.min(raw, max));
    };

    // Opening animations
    const openOpacityMs = duration(optionCount, 120, 120, 4, 200);
    const openTransformMs = duration(optionCount, 160, 160, 6, 260);
    const openShadowMs = duration(optionCount, 240, 260, 8, 420);

    // Closing animations
    const closeOpacityMs = duration(optionCount, 80, 80, 3, 160);
    const closeTransformMs = duration(optionCount, 120, 120, 5, 220);
    const closeShadowMs = duration(optionCount, 160, 200, 6, 320);

    dynamicStyle = {
      '--select-open-opacity-duration': `${openOpacityMs}ms`,
      '--select-open-transform-duration': `${openTransformMs}ms`,
      '--select-open-shadow-duration': `${openShadowMs}ms`,
      '--select-close-opacity-duration': `${closeOpacityMs}ms`,
      '--select-close-transform-duration': `${closeTransformMs}ms`,
      '--select-close-shadow-duration': `${closeShadowMs}ms`
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
