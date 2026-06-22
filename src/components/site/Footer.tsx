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

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-heading font-bold text-lg text-[var(--ink)] tracking-tight hover:text-[var(--gold)] transition-colors"
            >
              Swift<span className="text-[var(--gold)]">Creator</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Premium websites built for businesses that refuse to be overlooked.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="label-micro mb-4">Navigation</p>
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
            <p className="label-micro mb-4">Get in touch</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors flex items-center gap-2"
                >
                  <span className="text-[var(--gold)]">&rarr;</span> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={mailLink}
                  className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors flex items-center gap-2"
                >
                  <span className="text-[var(--gold)]">&rarr;</span> Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            &copy; {currentYear} SwiftCreator. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Built for leaders, by Aniekan Israel.
          </p>
        </div>
      </div>
    </footer>
  );
}
