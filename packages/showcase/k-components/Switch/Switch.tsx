'use client';

import type { SwitchRootProps as HeadlessSwitchRootProps } from '@kiskadee/react-headless';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import type { ReactNode } from 'react';
import styles from './Switch.module.scss';

export type SwitchProps = Omit<HeadlessSwitchRootProps, 'children' | 'classNames'> & {
  className?: string;
  label?: ReactNode;
};

export function Switch({ className = '', label, ...props }: SwitchProps) {
  return (
    <HeadlessSwitch.Root
      {...props}
      classNames={{
        e1: `${styles.container} ${className}`.trim(),
        e2: styles.track,
        e3: styles.thumb,
        e4: styles.label
      }}
    >
      {label ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
      <HeadlessSwitch.Track>
        <HeadlessSwitch.Thumb />
      </HeadlessSwitch.Track>
    </HeadlessSwitch.Root>
  );
}
