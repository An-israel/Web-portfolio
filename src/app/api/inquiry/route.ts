import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inquiryApiSchema } from '@/lib/schemas';

// Simple in-memory rate limiter: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

// Periodically clean old entries to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  },
  60 * 60 * 1000 // every hour
);

export async function POST(req: NextRequest) {
  // Always return 200 to the client (fire-and-forget UX)
  // but do validation and storage server-side

  try {
    // Get IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      // Return 200 anyway to not reveal rate limiting to bots
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();

    // Honeypot check — if website field is filled, silently drop
    if (body.website && body.website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Validate
    const result = inquiryApiSchema.safeParse(body);
    if (!result.success) {
      // Return 200 for fire-and-forget; errors logged server-side
      console.error('[inquiry] Validation failed:', result.error.issues);
      return NextResponse.json({ ok: true });
    }

    const data = result.data;

    // Insert via service role client
    const supabase = createAdminClient();
    const { error } = await supabase.from('inquiries').insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      project_type: data.project_type,
      message: data.message || null,
      is_read: false,
    });

    if (error) {
      console.error('[inquiry] DB insert error:', error.message);
    }
  } catch (err) {
    console.error('[inquiry] Unexpected error:', err);
  }

  return NextResponse.json({ ok: true });
}
