import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBriefByToken } from '@/lib/data/briefs';
import { BRIEF_BUCKET, BRIEF_MAX_FILES, BRIEF_MAX_FILE_BYTES } from '@/lib/brief';

// Issues a one-time signed upload URL so the browser uploads
// straight to Supabase Storage (bypasses the serverless body limit).
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const brief = await fetchBriefByToken(token);
    if (!brief || brief.status !== 'sent') {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name : '';
    const type = typeof body?.type === 'string' ? body.type : '';
    const size = typeof body?.size === 'number' ? body.size : 0;

    if (!name || !(type.startsWith('image/') || type === 'application/pdf')) {
      return NextResponse.json({ ok: false, error: 'Only images and PDFs are allowed.' }, { status: 422 });
    }
    if (size <= 0 || size > BRIEF_MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Files must be under 10MB.' }, { status: 422 });
    }

    const safe = name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || 'file';
    const path = `${brief.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

    const supabase = createAdminClient();
    // Cap total uploads per brief (removed files still count) so a leaked link can't fill storage.
    const { data: existing } = await supabase.storage.from(BRIEF_BUCKET).list(brief.id, { limit: 100 });
    if ((existing?.length ?? 0) >= BRIEF_MAX_FILES * 3) {
      return NextResponse.json({ ok: false, error: 'Upload limit reached for this brief.' }, { status: 429 });
    }

    const { data, error } = await supabase.storage.from(BRIEF_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error('[brief upload] sign error:', error?.message);
      return NextResponse.json({ ok: false, error: 'Upload is unavailable right now.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, path: data.path, token: data.token });
  } catch (err) {
    console.error('[brief upload] unexpected:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
