import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /admin/login itself)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page through
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Create a response to mutate cookies on
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() verifies the session with Supabase (getSession only trusts the cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in isn't enough — the account must be flagged as admin.
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'not_admin');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
