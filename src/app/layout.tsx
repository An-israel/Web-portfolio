import type { Metadata } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site-config';
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

export const metadata: Metadata = {
  title: {
    default: 'Aniekan Israel — Websites, Brands & Web Apps',
    template: '%s — Aniekan Israel',
  },
  description:
    'Designer and full-stack engineer in Lagos, working globally. I design brands and build fast, modern websites, online stores and web apps for businesses — end to end.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Aniekan Israel',
  authors: [{ name: 'Aniekan Israel' }],
  creator: 'Aniekan Israel',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Aniekan Israel',
    title: 'Aniekan Israel — Websites, Brands & Web Apps',
    description:
      'Brand design, websites, online stores and web apps — designed and built end to end by Aniekan Israel.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aniekan Israel — Websites, Brands & Web Apps',
    description: 'Brand design, websites and web apps — designed and built end to end. Lagos / remote.',
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
