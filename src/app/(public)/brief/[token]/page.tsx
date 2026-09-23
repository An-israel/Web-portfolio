import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BriefForm } from '@/components/site/BriefForm';
import { PulseLine } from '@/components/site/PulseLine';
import { fetchBriefByToken, fetchBriefPricing } from '@/lib/data/briefs';
import { fetchFeaturedDesigns } from '@/lib/data/queries';
import { publicOptions } from '@/lib/brief';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Brief',
  description: 'Tell me about your business and the website you want.',
  robots: { index: false, follow: false },
};

export default async function BriefPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const brief = await fetchBriefByToken(token);
  if (!brief) notFound();

  if (brief.status !== 'sent') {
    return (
      <section className="min-h-screen flex items-center">
        <div className="max-w-[700px] mx-auto px-6 text-center py-32">
          <PulseLine className="mb-10" />
          <h1 className="font-display text-5xl sm:text-6xl text-[var(--platinum)]">Brief received.</h1>
          <p className="mt-6 text-lg text-[var(--mist)]">
            Thanks, {brief.client_name.split(' ')[0]} — your brief has already been submitted. I&apos;ll be
            in touch soon. Need to change something? Just message me.
          </p>
          <Link
            href="/"
            className="mt-10 inline-block rounded-md border border-[var(--silver)] px-7 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  const [pricing, designs] = await Promise.all([fetchBriefPricing(), fetchFeaturedDesigns(4)]);
  // Only labels/descriptions cross to the browser — never prices.
  const options = publicOptions(pricing);
  const showcase = designs.map((d) => ({ slug: d.slug, title: d.title, cover_image_url: d.cover_image_url }));

  return <BriefForm token={token} clientName={brief.client_name} options={options} showcase={showcase} />;
}
