/**
 * Returns which social auth providers are currently configured.
 * Evaluated server-side only; never returns actual secrets.
 */
export function getConfiguredProviders(): { google: boolean; facebook: boolean } {
  const googleId =
    process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
  const googleSecret =
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  const facebookId =
    process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID;
  const facebookSecret =
    process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET;

  return {
    google: !!(googleId && googleSecret),
    facebook: !!(facebookId && facebookSecret),
  };
}
