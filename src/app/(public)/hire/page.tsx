import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HireForm } from '@/components/site/HireForm';
import { fetchSiteSettings } from '@/lib/data/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Start a Project',
  description:
    'Tell me what you need — a website, online store, brand identity or web app. Direct line, reply within 24 hours.',
  alternates: { canonical: '/hire' },
};

export default async function HirePage() {
  const settings = await fetchSiteSettings();
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HireForm settings={settings} />
    </Suspense>
  );
}
