import type { Metadata } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aniekanisrael.com';

export const metadata: Metadata = {
  title: {
    default: 'Aniekan Israel — Full-Stack & AI Engineer',
    template: '%s — Aniekan Israel',
  },
  description:
    'Full-stack & AI engineer and product builder in Lagos, working globally. I design, build, and ship AI products, multi-tenant SaaS, and autonomous tools — end to end.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Aniekan Israel',
  authors: [{ name: 'Aniekan Israel' }],
  creator: 'Aniekan Israel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Aniekan Israel',
    title: 'Aniekan Israel — Full-Stack & AI Engineer',
    description:
      'I build AI products that ship. Founder-level engineer — multi-tenant SaaS, AI content systems, and autonomous tools, built end to end.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aniekan Israel — Full-Stack & AI Engineer',
    description: 'I build AI products that ship. Founder-level engineer, Lagos / remote.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--obsidian)] text-[var(--mist)]">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
