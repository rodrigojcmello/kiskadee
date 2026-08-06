'use client';

import type { ReactNode } from 'react';
import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import DesignSystemToolbar from '@/components/DesignSystemToolbar/DesignSystemToolbar';
import { ShowcaseIconFamilyBoundary } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import style from './layout.module.scss';
import ShowcaseShell from './ShowcaseShell';

export default function ShowcaseChrome({ children }: { children: ReactNode }) {
  const globalPanelControls = <ShowcaseGlobalControls variant="panel" />;

  return (
    <div className={style.layout}>
      <ShowcaseIconFamilyBoundary>
        <DesignSystemToolbar />
      </ShowcaseIconFamilyBoundary>
      <ShowcaseShell globalControls={globalPanelControls}>{children}</ShowcaseShell>
    </div>
  );
}
