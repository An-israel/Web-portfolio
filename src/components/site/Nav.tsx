'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/designs', label: 'Designs' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-300',
          scrolled
            ? 'bg-[var(--obsidian)]/80 backdrop-blur-md border-b border-[var(--steel)]'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-[1200px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="mono-label text-[var(--platinum)] hover:text-[var(--white)] transition-colors"
          >
            ANIEKAN ISRAEL
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/hire"
              className="mono-label text-[var(--white)] border border-[var(--steel)] hover:border-[var(--silver)] rounded-md px-4 py-2 transition-colors"
            >
              Hire Me
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--obsidian)] pt-24 px-6 md:hidden flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-5 border-b border-[var(--steel)] font-display text-3xl text-[var(--platinum)] reveal is-visible"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/hire"
            className="mt-8 text-center mono-label text-[var(--white)] border border-[var(--silver)] rounded-md py-4"
          >
            Hire Me
          </Link>
        </div>
      )}
    </>
  );
}
