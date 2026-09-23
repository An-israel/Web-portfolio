import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inquiryApiSchema, type InquiryApiData } from '@/lib/schemas';
import { escapeHtml } from '@/lib/html';
import { clientIp, isRateLimited } from '@/lib/server/rate-limit';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site-config';

// Notify the site owner only. There is deliberately no auto-reply to the
// visitor's address: that let anyone make this site email a stranger.
async function notifyOwner(d: InquiryApiData) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'Aniekan Israel <onboarding@resend.dev>';
  if (!key) return; // email is optional — skip cleanly if unconfigured

  const e = escapeHtml;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: CONTACT_EMAIL,
      reply_to: d.email,
      subject: `New inquiry — ${d.project_type} — ${d.budget_range ?? 'n/a'}`,
      html: `
        <div style="background:#060607;color:#edeff2;font-family:sans-serif;padding:24px">
          <h2 style="margin:0 0 16px">New inquiry</h2>
          <p><b>${e(d.full_name)}</b> &lt;${e(d.email)}&gt;${d.company ? ` · ${e(d.company)}` : ''}</p>
          <p>Type: ${e(d.project_type)}<br/>Budget: ${e(d.budget_range ?? '—')}<br/>Timeline: ${e(d.timeline ?? '—')}</p>
          <p style="white-space:pre-wrap;color:#8a8f98">${e(d.description)}</p>
          <p><a href="${SITE_URL}/admin/inquiries" style="color:#c7cbd1">Open in admin →</a></p>
        </div>`,
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    // Honeypot / too-fast submissions: pretend success, drop the data.
    if (typeof body.website === 'string' && body.website.length > 0) {
      return NextResponse.json({ ok: true });
    }
    if (typeof body.elapsed_ms === 'number' && body.elapsed_ms < 3000) {
      return NextResponse.json({ ok: true });
    }

    const parsed = inquiryApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    if (isRateLimited(`inquiry:${clientIp(req)}`)) {
      // Don't reveal the limit — pretend success.
      return NextResponse.json({ ok: true });
    }

    const d = parsed.data;
    const supabase = createAdminClient();
    const { error } = await supabase.from('inquiries').insert({
      full_name: d.full_name,
      email: d.email,
      company: d.company ?? null,
      role_at_company: d.role_at_company ?? null,
      project_type: d.project_type,
      budget_range: d.budget_range ?? null,
      timeline: d.timeline ?? null,
      description: d.description,
      how_found: d.how_found ?? null,
    });

    if (error) {
      console.error('[inquiry] insert error:', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    await notifyOwner(d);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[inquiry] unexpected:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
