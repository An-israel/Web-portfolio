import { createClient } from '@/lib/supabase/server';

/** True when the request comes from a signed-in admin (verified with Supabase, not just a cookie). */
export async function isAdminRequest(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    const { data } = await supabase.rpc('is_admin');
    return data === true;
  } catch {
    return false;
  }
}
