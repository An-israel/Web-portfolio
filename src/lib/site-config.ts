// ------------------------------------------------------------
// Site-wide constants. Env vars win; the fallbacks are the real
// production values so nothing silently points at a dead domain.
// ------------------------------------------------------------

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://swiftcreator.vercel.app').replace(/\/+$/, '');

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'aniekaneazy@gmail.com';

/** True when the Supabase env vars are present (false in a bare local checkout). */
export const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Seconds public pages are cached before refreshing (admin saves refresh them immediately). */
export const PUBLIC_REVALIDATE = 60;
