import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/style';
import { Providers } from './providers';
import ShowcaseChrome from './ShowcaseChrome';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <body>
        {/*
         * Browser inspection tooling may claim and rewrite the first body div
         * before React hydrates. Keep this sentinel in both the server and
         * client trees so that external attribute changes never reach the app
         * root. The warning escape hatch is intentionally scoped to this empty
         * element only.
         */}
        <div hidden aria-hidden="true" suppressHydrationWarning />
        <Providers>
          <ShowcaseChrome>{children}</ShowcaseChrome>
        </Providers>
      </body>
    </html>
  );
}
