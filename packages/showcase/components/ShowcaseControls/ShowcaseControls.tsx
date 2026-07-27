'use client';

import type { ReactNode } from 'react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useShowcasePanel } from '@/app/ShowcasePanelContext';
import { Select, type SelectProps, Switch } from '@/k-components';
import styles from './ShowcaseControls.module.scss';

function joinClassNames(...parts: Array<string | undefined | false | null>): string | undefined {
  const className = parts.filter(Boolean).join(' ').trim();
  return className.length > 0 ? className : undefined;
}

export function ShowcaseRouteControls({
  children,
  eyebrow,
  id,
  isAvailable = true,
  showGlobalControls = true,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  isAvailable?: boolean;
  showGlobalControls?: boolean;
  title: string;
}) {
  const { panelSlotElement, registerPanelDetail, clearPanelDetail } = useShowcasePanel();

  useEffect(() => {
    if (!isAvailable) {
      clearPanelDetail(id);
      return;
    }

    registerPanelDetail({ id, eyebrow, showGlobalControls, title });

    return () => {
      clearPanelDetail(id);
    };
  }, [clearPanelDetail, eyebrow, id, isAvailable, registerPanelDetail, showGlobalControls, title]);

  if (!isAvailable || !panelSlotElement) return null;

  return createPortal(children, panelSlotElement);
}

export function ShowcaseControlPanel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClassNames(styles.panel, className)}>{children}</div>;
}

export function ShowcaseControlGroup({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={joinClassNames(styles.group, className)}>
      <div className={styles.groupTitle}>{title}</div>
      {children}
    </div>
  );
}

export function ShowcaseControlGrid({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClassNames(styles.grid, className)}>{children}</div>;
}

export function ShowcaseControlStack({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClassNames(styles.stack, className)}>{children}</div>;
}

export function ShowcaseControlField({
  children,
  className,
  fullWidth = false
}: {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={joinClassNames(styles.field, fullWidth && styles.fullWidth, className)}>
      {children}
    </div>
  );
}

export function ShowcaseSelectControl({ className, width = '100%', ...props }: SelectProps) {
  return <Select {...props} width={width} className={joinClassNames(styles.select, className)} />;
}

export function ShowcaseSegmentedControl({
  className,
  disabled = false,
  label,
  onValueChange,
  options,
  value
}: {
  className?: string;
  disabled?: boolean;
  label: ReactNode;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<{
    disabled?: boolean;
    label: ReactNode;
    value: string;
  }>;
  value: string;
}) {
  const groupName = useId();

  return (
    <fieldset className={joinClassNames(styles.segmentedField, className)} disabled={disabled}>
      <legend className={styles.segmentedLabel}>{label}</legend>
      <div
        className={styles.segmentedControl}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <label
              className={styles.segmentedOption}
              data-selected={isSelected ? 'true' : 'false'}
              key={option.value}
            >
              <input
                className={styles.segmentedInput}
                type="radio"
                name={groupName}
                value={option.value}
                checked={isSelected}
                disabled={option.disabled}
                onChange={() => onValueChange(option.value)}
              />
              <span className={styles.segmentedOptionContent}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ShowcaseBooleanControl({
  checked,
  className,
  description,
  disabled,
  label,
  onCheckedChange
}: {
  checked: boolean;
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Switch
      className={className}
      controlState={checked}
      disabled={disabled}
      onControlStateChange={onCheckedChange}
      label={
        <span className={styles.booleanLabel}>
          <span className={styles.booleanLabelText}>{label}</span>
          {description ? <span className={styles.booleanDescription}>{description}</span> : null}
        </span>
      }
    />
  );
}
