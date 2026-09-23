import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrolApiSchema } from '@/lib/schemas';
import { clientIp, isRateLimited } from '@/lib/server/rate-limit';

// Records a coaching enrolment before the student sees the payment
// details. Title and price come from the database, not the browser.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });
    if (typeof body.website === 'string' && body.website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const parsed = enrolApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    if (isRateLimited(`enrol:${clientIp(req)}`, 5)) {
      return NextResponse.json({ ok: true });
    }

    const d = parsed.data;
    const supabase = createAdminClient();
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, price_naira, published')
      .eq('id', d.course_id)
      .maybeSingle();
    if (!course || !course.published) return NextResponse.json({ ok: false }, { status: 404 });

    const { error } = await supabase.from('enrolments').insert({
      course_id: course.id,
      course_title: course.title,
      amount_naira: course.price_naira,
      full_name: d.full_name,
      phone: d.phone,
      email: d.email || null,
    });
    if (error) {
      console.error('[enrol] insert error:', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[enrol] unexpected:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
