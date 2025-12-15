'use client';

import type {
  SwatchRadioGroupProps as HeadlessSwatchRadioGroupProps,
  SwatchRadioItem,
  SwatchRadioGroupRenderSwatchArgs
} from '@kiskadee/react-headless';
import { SwatchRadioGroup as HeadlessSwatchRadioGroup } from '@kiskadee/react-headless';
import type { CSSProperties, ReactNode } from 'react';
import styles from './SwatchRadioGroup.module.scss';

export type { SwatchRadioItem, SwatchRadioGroupRenderSwatchArgs };

export type SwatchRadioGroupProps = {
  groupLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showItemLabels?: boolean;
  renderSwatch?: (item: SwatchRadioItem, args: SwatchRadioGroupRenderSwatchArgs) => ReactNode;
} & Omit<HeadlessSwatchRadioGroupProps, 'classNames' | 'className' | 'renderSwatch'>;

export function SwatchRadioGroup({
  groupLabel,
  className = '',
  style,
  showItemLabels = false,
  renderSwatch,
  ...props
}: SwatchRadioGroupProps) {
  return (
    <div className={`${styles.container} ${className}`.trim()} style={style}>
      {groupLabel ? <span className={styles.groupLabel}>{groupLabel}</span> : null}
      <HeadlessSwatchRadioGroup
        {...props}
        classNames={{
          e1: styles.fieldset,
          e2: styles.swatches,
          e3: styles.swatch,
          e4: styles.input,
          e5: styles.dot,
          e5a: styles.selected,
          e6: showItemLabels ? styles.itemLabel : styles.itemLabelHidden
        }}
        renderSwatch={(item, args) => (
          <span
            className={args.selected ? `${styles.dot} ${styles.selected}` : styles.dot}
            style={item.swatch?.color ? ({ backgroundColor: item.swatch.color } as const) : undefined}
            aria-hidden="true"
          >
            {renderSwatch ? renderSwatch(item, args) : null}
          </span>
        )}
      />
    </div>
  );
}
