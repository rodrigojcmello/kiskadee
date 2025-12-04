import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/global.kiskadee.scss';
import AppHead from '@/components/AppHead/AppHead';
import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import style from './layout.module.scss';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <AppHead />
      <body>
        <Providers>
          <DesignSystemControls />
          <div
            style={{
              position: 'fixed',
              right: 12,
              top: 12,
              display: 'flex',
              gap: 8,
              zIndex: 10000
            }}
          >
            <ThemeModePicker position="inline" />
            <BackgroundTonePicker position="inline" />
            <FontNamePicker position="inline" />
          </div>
          <div className={style.container}>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
