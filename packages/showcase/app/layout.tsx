import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/global.kiskadee.scss';
import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lora:wght@400;600&family=Open+Sans:wght@400;600&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
