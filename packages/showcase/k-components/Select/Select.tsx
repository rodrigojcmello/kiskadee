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
    const duration = (count: number, baseMs: number, perItemMs: number, maxMs: number) => {
      // As opções só aparecem a partir de 2 itens.
      // Consideramos 2 como "tamanho base" e só adicionamos tempo a partir do 3º item.
      const MIN_VISIBLE_OPTIONS = 2;
      const effectiveCount = Math.max(count - MIN_VISIBLE_OPTIONS, 0);
      const raw = baseMs + effectiveCount * perItemMs;
      return Math.min(raw, maxMs);
    };

    // Uma única duração base para abertura, escalando com a quantidade de opções.
    // baseMs = duração para 2 itens (mínimo visível).
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
