/**
 * Cache-busting version for the static images embedded in emails.
 *
 * Gmail rewrites remote images to its own proxy (`ci*.googleusercontent.com`),
 * which caches the *result* of each fetch keyed by the origin URL — including
 * failures. An asset that was unreachable once (a tunnel outage, a blocked
 * request) keeps rendering as a broken image in every mail that references it,
 * because the proxy answers 404 from cache and never re-fetches the origin.
 *
 * Bump this to mint fresh URLs, which forces the proxy to fetch again.
 */
export const EMAIL_ASSET_VERSION = '2';

/**
 * Resolve a static email asset path against the asset base URL, cache-busted
 * with `EMAIL_ASSET_VERSION`.
 *
 * The base is normalised to end with a trailing slash and the path is
 * normalised to have no leading slash, so a sub-path in the base URL
 * (e.g. "/ESign") is preserved. Passing a root-absolute path straight to
 * `new URL()` would otherwise replace the base pathname entirely.
 *
 * `getEmailAssetUrl('https://host/ESign', 'static/logo.png')` -> `https://host/ESign/static/logo.png?v=2`
 * `getEmailAssetUrl('https://host/ESign/', '/static/logo.png')` -> `https://host/ESign/static/logo.png?v=2`
 */
export const getEmailAssetUrl = (assetBaseUrl: string, path: string): string => {
  const base = assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`;
  const relativePath = path.startsWith('/') ? path.slice(1) : path;

  const url = new URL(relativePath, base);

  url.searchParams.set('v', EMAIL_ASSET_VERSION);

  return url.toString();
};
