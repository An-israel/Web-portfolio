'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading font-bold text-lg text-[var(--ink)] tracking-tight hover:text-[var(--gold)] transition-colors"
          >
            Swift<span className="text-[var(--gold)]">Creator</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-heading font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Button
              size="sm"
              onClick={onBookClick}
              className="font-heading text-xs tracking-widest uppercase"
            >
              Start a project
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
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
                <Button
                  size="lg"
                  className="w-full font-heading text-sm tracking-widest uppercase"
                  onClick={() => {
                    setMobileOpen(false);
                    onBookClick?.();
                  }}
                >
                  Start a project
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
