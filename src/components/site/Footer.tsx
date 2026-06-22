'use client';

import Link from 'next/link';
import { buildWhatsAppLink, buildMailtoLink } from '@/lib/contact';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const waLink = buildWhatsAppLink("Hi Aniekan, I'd like to discuss a website project.");
  const mailLink = buildMailtoLink(
    'Project Inquiry — SwiftCreator',
    "Hi Aniekan,\n\nI'd like to discuss a website project.\n\n"
  );

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-[var(--line)]">
          {/* Location */}
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-heading mb-4">
              Location
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Abuja, Nigeria
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-heading mb-4">
              Links
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-heading mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={mailLink}
                  className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors break-all"
                >
                  aniekaneazy@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-heading mb-4">
              Social
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Instagram', href: '#' },
                { label: 'X (Twitter)', href: '#' },
                { label: 'Behance', href: '#' },
              ].map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright row */}
        <div className="flex items-center justify-between py-5">
          <p className="text-xs text-[var(--muted)]">
            © {currentYear} SwiftCreator. All Right Reserved
          </p>
          <button
            onClick={scrollToTop}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] rounded-full px-4 py-1.5 transition-colors font-heading"
          >
            Back to Top ↑
          </button>
        </div>
      </div>

      {/* Giant brand text */}
      <div className="overflow-hidden pointer-events-none select-none">
        <p
          className="font-display font-bold text-center leading-none pb-2"
          style={{
            fontSize: 'clamp(72px, 16vw, 220px)',
            color: 'rgba(255,255,255,0.035)',
          }}
        >
          SwiftCreator
        </p>
      </div>
    </footer>
  );
}
