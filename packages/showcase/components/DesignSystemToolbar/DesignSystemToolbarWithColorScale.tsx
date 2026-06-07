'use client';

import { useState } from 'react';
import ColorScaleViewer from '@/components/ColorScaleViewer/ColorScaleViewer';
import DesignSystemToolbar from './DesignSystemToolbar';

export default function DesignSystemToolbarWithColorScale() {
  const [showColorScale, setShowColorScale] = useState(false);

  return (
    <>
      <DesignSystemToolbar showColorScale={showColorScale} onToggleColorScale={setShowColorScale} />
      {showColorScale ? <ColorScaleViewer /> : null}
    </>
  );
}
