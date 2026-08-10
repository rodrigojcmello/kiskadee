import type { FontFamilyPreparationResult } from '@kiskadee/runtime/font-family';

const GOOGLE_FONTS_STYLESHEET_ORIGIN = 'https://fonts.googleapis.com';
const GOOGLE_FONT_FACE_LOAD_TIMEOUT_MS = 5_000;
const GOOGLE_FONT_FACE_SAMPLE = 'BESbswy';
const preparationByUrl = new Map<string, Promise<FontFamilyPreparationResult>>();

type GoogleFontStylesheetPreparationOptions = Readonly<{
  weights: readonly number[];
}>;

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

function getGoogleFamilyName(googleFamilyParameters: string): string {
  return googleFamilyParameters.split(':', 1)[0]?.trim() ?? '';
}

function toCssFamilyName(familyName: string): string {
  return `"${familyName.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

/**
 * What
 *     Waits until every declared Google Font weight is ready for actual text rendering.
 * Why
 *     A loaded stylesheet does not guarantee its font binaries are ready for an atomic switch.
 */
async function waitForFontFaces(
  familyId: string,
  familyName: string,
  weights: readonly number[]
): Promise<void> {
  if (!document.fonts || typeof document.fonts.load !== 'function') return;

  const cssFamilyName = toCssFamilyName(familyName);
  const uniqueWeights = [...new Set(weights)];
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const loadFaces = Promise.all(
    uniqueWeights.map(async (weight) => {
      const faces = await document.fonts.load(
        `${weight} 1em ${cssFamilyName}`,
        GOOGLE_FONT_FACE_SAMPLE
      );

      if (faces.length === 0) {
        throw new Error(`Google Font "${familyName}" did not expose its ${weight} weight.`);
      }
    })
  );

  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Timed out while loading Google Font faces for "${familyId}" after ` +
            `${GOOGLE_FONT_FACE_LOAD_TIMEOUT_MS}ms.`
        )
      );
    }, GOOGLE_FONT_FACE_LOAD_TIMEOUT_MS);
  });

  try {
    await Promise.race([loadFaces, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

/**
 * What
 *     Loads one Google Fonts stylesheet and deduplicates matching source URLs.
 * Why
 *     Multiple semantic family ids may share one online fallback without duplicate requests.
 */
export function prepareGoogleFontStylesheet(
  familyId: string,
  googleFamilyParameters: string,
  options: GoogleFontStylesheetPreparationOptions
): Promise<FontFamilyPreparationResult> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Google Fonts preparation requires a browser document.'));
  }

  const url = createStylesheetUrl(googleFamilyParameters);
  const cached = preparationByUrl.get(url);
  if (cached) return cached;

  const familyName = getGoogleFamilyName(googleFamilyParameters);
  if (!familyName) {
    return Promise.reject(new Error(`Google Font "${familyId}" requires a family name.`));
  }

  const preparation = loadStylesheet(familyId, url)
    .then(() => waitForFontFaces(familyId, familyName, options.weights))
    .then(
      (): FontFamilyPreparationResult => ({
        family: familyName,
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
