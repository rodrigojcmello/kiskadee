'use client';

import {
  type ControlCursorValue,
  DEFAULT_CONTROL_CURSOR,
  type Density,
  resolveControlCursor
} from '@kiskadee/core';
import { DensityProvider, KiskadeeContext } from '@kiskadee/react-components';
import type { ReactNode } from 'react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useShowcasePanel } from '@/app/ShowcasePanelContext';
import { ShowcaseIconFamilyBoundary } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
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
  const {
    densityMap,
    densityOverride,
    setDensityOverride,
    panelSlotElement,
    registerPanelDetail,
    clearPanelDetail,
    administrativeContext,
    controlCursorAvailable,
    controlCursorOverride,
    setControlCursorOverride
  } = useShowcasePanel();
  const presetCursor =
    administrativeContext.global?.interaction?.controlCursor ?? DEFAULT_CONTROL_CURSOR;

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

  return createPortal(
    <KiskadeeContext.Provider value={administrativeContext}>
      <DensityProvider value="adaptive">
        <ShowcaseIconFamilyBoundary>
          {densityMap ? (
            <ShowcaseControlGroup title="Density">
              <ShowcaseSelectControl
                label="Density"
                value={densityOverride ?? 'preset'}
                options={[
                  {
                    value: 'preset',
                    label: `Preset default · ${densityMap.c && densityMap.s ? 'Adaptive' : densityMap.c ? 'Compact' : 'Spacious'}`
                  },
                  ...(densityMap.c && densityMap.s
                    ? [{ value: 'adaptive', label: 'Adaptive' }]
                    : []),
                  ...(densityMap.c ? [{ value: 'compact', label: 'Compact' }] : []),
                  ...(densityMap.s ? [{ value: 'spacious', label: 'Spacious' }] : [])
                ]}
                onValueChange={(value) =>
                  setDensityOverride(value === 'preset' ? undefined : (value as Density))
                }
              />
            </ShowcaseControlGroup>
          ) : null}
          {children}
          {controlCursorAvailable ? (
            <ShowcaseControlGroup title="Interaction">
              <ShowcaseSelectControl
                label="Control cursor"
                value={controlCursorOverride ?? 'preset'}
                options={[
                  {
                    value: 'preset',
                    label: `Preset default · ${resolveControlCursor(presetCursor) === 'pointer' ? 'Pointer' : 'Default'} (${presetCursor.scope === 'web' ? 'Web only' : 'All platforms'})`
                  },
                  { value: 'default', label: 'Default (arrow)' },
                  { value: 'pointer', label: 'Pointer (hand)' }
                ]}
                onValueChange={(value) =>
                  setControlCursorOverride(
                    value === 'preset' ? undefined : (value as ControlCursorValue)
                  )
                }
              />
            </ShowcaseControlGroup>
          ) : null}
        </ShowcaseIconFamilyBoundary>
      </DensityProvider>
    </KiskadeeContext.Provider>,
    panelSlotElement
  );
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
  embedded = false,
  label,
  onValueChange,
  options,
  value
}: {
  className?: string;
  disabled?: boolean;
  embedded?: boolean;
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
        className={joinClassNames(styles.segmentedControl, embedded && styles.segmentedEmbedded)}
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
