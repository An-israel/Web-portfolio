import { createAdminClient } from '@/lib/supabase/admin';
import { BRIEF_PRICING_KEY, normalizePricing, type BriefPricing } from '@/lib/brief';

// ------------------------------------------------------------
// Server-only reads for the public brief flow. Uses the
// service-role client: client_briefs and the pricing row are
// admin-only under RLS, and the token is the client's access.
// ------------------------------------------------------------

export interface BriefByToken {
  id: string;
  client_name: string;
  status: string;
}

const TOKEN_RE = /^[a-f0-9]{16,64}$/;

export async function fetchBriefByToken(token: string): Promise<BriefByToken | null> {
  if (!TOKEN_RE.test(token)) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('client_briefs')
      .select('id, client_name, status')
      .eq('token', token)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchBriefPricing(): Promise<BriefPricing> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', BRIEF_PRICING_KEY)
      .maybeSingle();
    return normalizePricing(data?.value);
  } catch {
    return normalizePricing(null);
  }
}
