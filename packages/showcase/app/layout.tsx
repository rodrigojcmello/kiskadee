import type { ReactNode } from 'react';
import './globals.css';
import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
