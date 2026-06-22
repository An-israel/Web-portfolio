'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
];

interface NavProps {
  onBookClick?: () => void;
}

export function Nav({ onBookClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--line)]'
            : 'bg-transparent'
        )}
      >
        <nav className="relative max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading font-bold text-base text-[var(--ink)] tracking-tight z-10"
          >
            Swift<span className="text-[var(--gold)]">Creator</span>
          </Link>

          {/* Desktop nav — centered absolutely */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-heading font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA pill */}
          <div className="hidden md:flex items-center z-10">
            <button
              onClick={onBookClick}
              className="rounded-full px-5 py-2.5 bg-[var(--ink)] text-[var(--bg)] text-sm font-heading font-semibold hover:bg-[var(--gold)] transition-colors duration-200"
            >
              Let&apos;s Chat →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors z-10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-[var(--bg)] pt-16 flex flex-col"
          >
            <div className="flex flex-col px-6 py-8 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-2xl font-heading font-semibold text-[var(--ink)] border-b border-[var(--line)] hover:text-[var(--gold)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-8">
                <button
                  className="w-full rounded-full py-4 bg-[var(--ink)] text-[var(--bg)] text-sm font-heading font-semibold hover:bg-[var(--gold)] transition-colors"
                  onClick={() => {
                    setMobileOpen(false);
                    onBookClick?.();
                  }}
                >
                  Let&apos;s Chat →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
