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
 * Builds the absolute, cache-busted URL for a static email asset.
 *
 * `path` is resolved against `assetBaseUrl` (the public webapp URL), so it must
 * be root-relative, e.g. `/static/logo.png`.
 */
export const getEmailAssetUrl = (path: string, assetBaseUrl: string): string => {
  const url = new URL(path, assetBaseUrl);

  url.searchParams.set('v', EMAIL_ASSET_VERSION);

  return url.toString();
};
