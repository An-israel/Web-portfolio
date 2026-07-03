import Link from 'next/link';
import { PulseLine } from './PulseLine';
import { MonoLabel } from './MonoLabel';
import { fetchSiteSettings } from '@/lib/data/queries';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/hire', label: 'Hire Me' },
];

export async function Footer() {
  const settings = await fetchSiteSettings();

  const socials = [
    { label: 'GitHub', href: settings.github_url },
    { label: 'X', href: settings.x_url },
    { label: 'LinkedIn', href: settings.linkedin_url },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <footer className="border-t border-[var(--steel)] bg-[var(--obsidian)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        {/* signature line, static */}
        <div className="mb-12 flex items-center gap-4">
          <PulseLine animated={false} className="flex-1" />
          <MonoLabel className="shrink-0">SYSTEMS: OPERATIONAL — LAGOS / REMOTE</MonoLabel>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <MonoLabel as="p" className="mb-4 text-[var(--mist)]">
              Navigate
            </MonoLabel>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <MonoLabel as="p" className="mb-4 text-[var(--mist)]">
              Contact
            </MonoLabel>
            <a
              href={`mailto:${settings.email}`}
              className="text-sm text-[var(--mist)] hover:text-[var(--platinum)] transition-colors break-all"
            >
              {settings.email}
            </a>
          </div>

          {socials.length > 0 && (
            <div>
              <MonoLabel as="p" className="mb-4 text-[var(--mist)]">
                Elsewhere
              </MonoLabel>
              <ul className="space-y-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="col-span-2 md:col-span-1">
            <MonoLabel as="p" className="mb-4 text-[var(--mist)]">
              Status
            </MonoLabel>
            <div className="flex items-center gap-2">
              <span className="pulse-dot" aria-hidden="true" />
              <MonoLabel>{settings.availability_status.toUpperCase()}</MonoLabel>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[var(--steel)]">
          <MonoLabel>© 2026 ANIEKAN ISRAEL — BUILT &amp; ENGINEERED BY ME</MonoLabel>
        </div>
      </div>
    </footer>
  );
}
