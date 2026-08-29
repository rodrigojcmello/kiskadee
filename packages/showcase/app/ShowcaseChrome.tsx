'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import DesignSystemToolbar from '@/components/DesignSystemToolbar/DesignSystemToolbar';
import { ShowcaseDisplayPreferencesProvider } from '@/components/ShowcaseDisplayPreferences';
import { ShowcaseIconFamilyBoundary } from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import style from './layout.module.scss';
import ShowcaseShell from './ShowcaseShell';

export default function ShowcaseChrome({ children }: { children: ReactNode }) {
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const globalPanelControls = <ShowcaseGlobalControls variant="panel" />;

  return (
    <ShowcaseDisplayPreferencesProvider>
      <div className={style.layout}>
        <ShowcaseIconFamilyBoundary>
          <DesignSystemToolbar isDesktopSidebarVisible={isDesktopSidebarVisible} />
        </ShowcaseIconFamilyBoundary>
        <ShowcaseShell
          globalControls={globalPanelControls}
          isDesktopSidebarVisible={isDesktopSidebarVisible}
          onDesktopSidebarVisibilityChange={setIsDesktopSidebarVisible}
        >
          {children}
        </ShowcaseShell>
      </div>
    </ShowcaseDisplayPreferencesProvider>
  );
}
