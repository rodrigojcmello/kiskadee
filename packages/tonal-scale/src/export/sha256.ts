export type Sha256Input = string | Uint8Array;

/** Computes a lowercase SHA-256 digest using the browser-compatible Web Crypto API. */
export async function sha256Hex(input: Sha256Input): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('SHA-256 requires the Web Crypto API.');
  }

  const bytes: Uint8Array<ArrayBuffer> =
    typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
