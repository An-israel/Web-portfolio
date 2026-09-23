import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchBriefByToken } from '@/lib/data/briefs';
import { briefAnswersSchema } from '@/lib/brief';

// Client submits their brief. One submission per link — after
// that the brief is locked and only the admin can change it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const brief = await fetchBriefByToken(token);
    if (!brief) return NextResponse.json({ ok: false }, { status: 404 });
    if (brief.status !== 'sent') {
      return NextResponse.json({ ok: false, error: 'already_submitted' }, { status: 409 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const parsed = briefAnswersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const answers = parsed.data;
    // Only keep files uploaded into this brief's own folder.
    answers.attachments = answers.attachments.filter((f) => f.path.startsWith(`${brief.id}/`));
    answers.inspirations = answers.inspirations.filter((i) => i.url || i.notes);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('client_briefs')
      .update({ answers, status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', brief.id)
      .eq('status', 'sent');

    if (error) {
      console.error('[brief] update error:', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[brief] unexpected:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
