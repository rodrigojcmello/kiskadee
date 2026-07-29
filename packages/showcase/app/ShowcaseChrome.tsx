'use client';

import type { ReactNode } from 'react';
import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import DesignSystemToolbar from '@/components/DesignSystemToolbar/DesignSystemToolbar';
import style from './layout.module.scss';
import ShowcaseShell from './ShowcaseShell';

export default function ShowcaseChrome({ children }: { children: ReactNode }) {
  const globalPanelControls = <ShowcaseGlobalControls variant="panel" />;

  return (
    <div className={style.layout}>
      <DesignSystemToolbar />
      <ShowcaseShell globalControls={globalPanelControls}>{children}</ShowcaseShell>
    </div>
  );
}
