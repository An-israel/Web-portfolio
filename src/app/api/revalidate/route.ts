import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/admin-auth';

// Admin saves call this so cached public pages show changes immediately.
export async function POST() {
  if (!(await isAdminRequest())) return NextResponse.json({ ok: false }, { status: 401 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
