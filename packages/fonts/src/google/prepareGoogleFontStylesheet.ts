import type { FontFamilyPreparationResult } from '@kiskadee/runtime/font-family';

const GOOGLE_FONTS_STYLESHEET_ORIGIN = 'https://fonts.googleapis.com';
const preparationByUrl = new Map<string, Promise<FontFamilyPreparationResult>>();

function createStylesheetUrl(googleFamilyParameters: string): string {
  const url = new URL('/css2', GOOGLE_FONTS_STYLESHEET_ORIGIN);
  url.searchParams.set('family', googleFamilyParameters);
  url.searchParams.set('display', 'swap');
  return url.href;
}

function findStylesheet(url: string): HTMLLinkElement | undefined {
  const links = document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  return [...links].find((link) => link.href === url);
}

function loadStylesheet(familyId: string, url: string): Promise<void> {
  const existing = findStylesheet(url);

  if (existing?.dataset.kiskadeeFontLoaded === 'true' || existing?.sheet) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const link = existing ?? document.createElement('link');

    const handleLoad = () => {
      link.dataset.kiskadeeFontLoaded = 'true';
      resolve();
    };
    const handleError = () => {
      link.remove();
      reject(new Error(`Unable to load the Google Fonts stylesheet for "${familyId}".`));
    };

    link.addEventListener('load', handleLoad, { once: true });
    link.addEventListener('error', handleError, { once: true });

    if (!existing) {
      link.rel = 'stylesheet';
      link.dataset.kiskadeeFontFamily = familyId;
      link.href = url;
      document.head.appendChild(link);
    }
  });
}

/**
 * What
 *     Loads one Google Fonts stylesheet and deduplicates matching source URLs.
 * Why
 *     Multiple semantic family ids may share one online fallback without duplicate requests.
 */
export function prepareGoogleFontStylesheet(
  familyId: string,
  googleFamilyParameters: string
): Promise<FontFamilyPreparationResult> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Google Fonts preparation requires a browser document.'));
  }

  const url = createStylesheetUrl(googleFamilyParameters);
  const cached = preparationByUrl.get(url);
  if (cached) return cached;

  const preparation = loadStylesheet(familyId, url)
    .then(
      (): FontFamilyPreparationResult => ({
        family: googleFamilyParameters.split(':', 1)[0] ?? familyId,
        source: 'online'
      })
    )
    .catch((error: unknown) => {
      if (preparationByUrl.get(url) === preparation) {
        preparationByUrl.delete(url);
      }
      throw error;
    });

  preparationByUrl.set(url, preparation);
  return preparation;
}

export function resetGoogleFontStylesheetPreparation(): void {
  preparationByUrl.clear();
}
