import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service-role admin client — bypasses RLS.
 * Only use in server-side API routes and server actions.
 * Never expose to the client.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
