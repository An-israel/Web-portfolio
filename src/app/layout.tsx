import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SwiftCreator — Websites That Make You Look Like the Leader',
    template: '%s | SwiftCreator',
  },
  description:
    'SwiftCreator builds high-performance websites for businesses that want to stand out — fast turnaround, premium design, real results.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://swiftcreator.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://swiftcreator.com',
    siteName: 'SwiftCreator',
    title: 'SwiftCreator — Websites That Make You Look Like the Leader',
    description:
      'SwiftCreator builds high-performance websites for businesses that want to stand out.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwiftCreator — Websites That Make You Look Like the Leader',
    description:
      'SwiftCreator builds high-performance websites for businesses that want to stand out.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
