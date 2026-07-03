'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message || 'Invalid credentials.');
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5 p-8 border border-[var(--steel)] rounded-md bg-[var(--graphite)]"
    >
      <div>
        <label htmlFor="email" className="mono-label block mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-3 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mono-label block mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-3 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)] border border-[var(--danger)]/30 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3.5 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="mono-label text-[var(--platinum)]">ANIEKAN ISRAEL</p>
          <p className="mt-2 mono-label text-[var(--mist)]">ADMIN ACCESS</p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-[var(--graphite)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
