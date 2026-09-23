'use client';

// ------------------------------------------------------------
// Admin helpers: surface failed saves (instead of silently
// looking saved) and refresh cached public pages after a change.
// ------------------------------------------------------------

export type AdminNotice = { message: string; kind: 'error' | 'success' };

export function notify(message: string, kind: AdminNotice['kind'] = 'error') {
  window.dispatchEvent(new CustomEvent<AdminNotice>('admin-notice', { detail: { message, kind } }));
}

/** Ask the server to rebuild cached public pages so changes show immediately. */
export function refreshSite() {
  fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
}

/**
 * Check a Supabase write result. On failure: undo the optimistic change,
 * show why, and return false. On success: refresh the public site.
 */
export function checkSave(
  res: { error: { message: string } | null },
  opts: { revert?: () => void; publicChange?: boolean } = {}
): boolean {
  if (res.error) {
    opts.revert?.();
    const expired = /jwt|auth|permission|row-level/i.test(res.error.message);
    notify(
      expired
        ? 'Couldn’t save — your login may have expired. Refresh the page and sign in again.'
        : `Couldn’t save — ${res.error.message}`
    );
    return false;
  }
  if (opts.publicChange !== false) refreshSite();
  return true;
}
