import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/global.kiskadee.scss';
import AppHead from '@/components/AppHead/AppHead';
import ColorScaleViewer from '@/components/ColorScaleViewer/ColorScaleViewer';
import DesignSystemToolbar from '@/components/DesignSystemToolbar/DesignSystemToolbar';
import style from './layout.module.scss';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <AppHead />
      <body>
        <Providers>
          <DesignSystemToolbar />
          <ColorScaleViewer />
          <div className={style.container}>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
