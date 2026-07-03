import Link from 'next/link';
import { MonoLabel } from '@/components/site/MonoLabel';

export default function NotFound() {
  return (
    <section className="min-h-screen bg-[var(--obsidian)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <MonoLabel>404 — NOT FOUND</MonoLabel>
        {/* flat-lined pulse — a quiet joke */}
        <div className="my-8 h-px bg-[var(--silver)]/40" />
        <h1 className="font-display text-4xl text-[var(--platinum)]">
          This page never shipped.
        </h1>
        <p className="mt-4 text-[var(--mist)]">The link is dead, but the systems are still running.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md border border-[var(--silver)] px-6 py-3 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
