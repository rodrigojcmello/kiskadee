'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import ColorScaleViewer from '@/components/ColorScaleViewer/ColorScaleViewer';
import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import DesignSystemToolbar from '@/components/DesignSystemToolbar/DesignSystemToolbar';
import style from './layout.module.scss';
import ShowcaseShell from './ShowcaseShell';

export default function ShowcaseChrome({ children }: { children: ReactNode }) {
  const [showColorScale, setShowColorScale] = useState(false);
  const globalPanelControls = (
    <ShowcaseGlobalControls
      variant="panel"
      showColorScale={showColorScale}
      onToggleColorScale={setShowColorScale}
    />
  );

  return (
    <div className={style.layout}>
      <DesignSystemToolbar showColorScale={showColorScale} onToggleColorScale={setShowColorScale} />
      {showColorScale ? <ColorScaleViewer /> : null}
      <ShowcaseShell globalControls={globalPanelControls}>{children}</ShowcaseShell>
    </div>
  );
}
