import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inquiryApiSchema } from '@/lib/schemas';

// In-memory rate limiter: max 3 per IP per 10 min. (Per-instance on
// serverless — a coarse guard; the honeypot + min-time do most of the work.)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@aniekanisrael.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aniekanisrael.com';

async function sendEmails(data: {
  full_name: string;
  email: string;
  company?: string | null;
  project_type: string;
  budget_range?: string | null;
  timeline?: string | null;
  description: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'Aniekan Israel <onboarding@resend.dev>';
  if (!key) return; // email is optional — skip cleanly if unconfigured

  const send = (payload: Record<string, unknown>) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

  // 1) Notify admin
  await send({
    from,
    to: ADMIN_EMAIL,
    reply_to: data.email,
    subject: `NEW INQUIRY — ${data.project_type} — ${data.budget_range ?? 'n/a'}`,
    html: `
      <div style="background:#060607;color:#edeff2;font-family:sans-serif;padding:24px">
        <h2 style="margin:0 0 16px">New inquiry</h2>
        <p><b>${data.full_name}</b> &lt;${data.email}&gt;${data.company ? ` · ${data.company}` : ''}</p>
        <p>Type: ${data.project_type}<br/>Budget: ${data.budget_range ?? '—'}<br/>Timeline: ${data.timeline ?? '—'}</p>
        <p style="white-space:pre-wrap;color:#8a8f98">${data.description}</p>
        <p><a href="${SITE_URL}/admin/inquiries" style="color:#c7cbd1">Open in admin →</a></p>
      </div>`,
  });

  // 2) Auto-confirmation to sender
  await send({
    from,
    to: data.email,
    subject: 'Your inquiry is in — Aniekan Israel',
    html: `
      <div style="background:#060607;color:#edeff2;font-family:sans-serif;padding:24px">
        <p>Hi ${data.full_name.split(' ')[0]},</p>
        <p>Your inquiry is in. I read every one personally and I'll reply within 24 hours.</p>
        <p style="color:#8a8f98">— Aniekan Israel</p>
      </div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    // Honeypot — silently accept (looks successful to the bot), drop the data.
    if (typeof body.website === 'string' && body.website.length > 0) {
      return NextResponse.json({ ok: true });
    }
    // Min time on form.
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

    if (isRateLimited(ip)) {
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

    await sendEmails(d);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[inquiry] unexpected:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
