/** biome-ignore-all lint/style/noHeadElement: ... */
import { FONTS } from '@/app/registry/fonts.registry';

export default function AppHead() {
  const googleFontsParams = FONTS.map((f) => f.googleFontParams)
    .filter(Boolean)
    .join('&family=');

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${googleFontsParams}&display=swap`;

  return (
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontsUrl} rel="stylesheet" />
    </head>
  );
}
