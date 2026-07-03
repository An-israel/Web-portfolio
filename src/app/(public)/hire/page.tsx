import type { Metadata } from 'next';
import { HireForm } from '@/components/site/HireForm';
import { fetchSiteSettings } from '@/lib/data/queries';

export const metadata: Metadata = {
  title: 'Hire Me',
  description:
    "Tell me what you're building. Direct line, reply within 24 hours, NDA-friendly. AI products, full-stack builds, and zero-to-one MVPs.",
};

export default async function HirePage() {
  const settings = await fetchSiteSettings();
  return <HireForm settings={settings} />;
}
