'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5 p-8 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)]"
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@swiftcreator.com"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-sm px-4 py-3">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full font-heading text-xs tracking-widest uppercase"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-heading font-bold text-xl text-[var(--ink)]">
            Swift<span className="text-[var(--gold)]">Creator</span>
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">Admin access</p>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-[var(--bg-raised)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
