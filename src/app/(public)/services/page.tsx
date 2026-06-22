'use client';

import { useState, useEffect } from 'react';
import { SectionHeading } from '@/components/site/SectionHeading';
import { PricingTier as PricingTierCard } from '@/components/site/PricingTier';
import { BookDialog } from '@/components/site/BookDialog';
import { createClient } from '@/lib/supabase/client';
import type { PricingTier } from '@/types';

const PLACEHOLDER_TIERS: PricingTier[] = [
  {
    id: '1',
    name: 'Starter',
    price_label: 'From ₦350k',
    summary: 'A clean, professional site that builds trust and converts visitors into leads.',
    features: [
      'Up to 5 pages',
      'Mobile-first responsive design',
      'Contact form with WhatsApp integration',
      'Google Analytics setup',
      'Basic SEO (meta tags, sitemap)',
      '2 rounds of revisions',
      '7-day delivery',
    ],
    delivery_days: 7,
    is_highlighted: false,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Growth',
    price_label: 'From ₦650k',
    summary: 'A premium website built to position you as the undisputed authority in your market.',
    features: [
      'Up to 10 pages',
      'Custom animations & scroll interactions',
      'Blog or portfolio CMS',
      'Advanced SEO + structured data',
      'Performance optimization (95+ Lighthouse)',
      'Analytics dashboard setup',
      'WhatsApp live chat integration',
      '3 rounds of revisions',
      '14-day delivery',
    ],
    delivery_days: 14,
    is_highlighted: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Elite',
    price_label: 'Custom',
    summary: 'Full-stack web applications, e-commerce platforms, and enterprise solutions.',
    features: [
      'Unlimited pages',
      'E-commerce with payment integration',
      'Custom web application / dashboard',
      'User authentication & roles',
      'Third-party API integrations',
      'Admin panel',
      'Priority support & SLA',
      'Ongoing maintenance available',
      'Custom timeline',
    ],
    delivery_days: 30,
    is_highlighted: false,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

const FAQ = [
  {
    q: 'How do you determine the final price?',
    a: 'The packages above are starting points. Final pricing depends on the complexity, number of pages, integrations needed, and timeline. We confirm everything in our first conversation — no surprises after that.',
  },
  {
    q: 'What do I need to provide before we start?',
    a: 'Your logo (or we discuss branding), copy/text for the pages (I can help guide this), images if you have them, and access to your domain and hosting. I handle everything else.',
  },
  {
    q: 'Do you do ongoing maintenance?',
    a: 'Yes. After launch, I offer monthly retainer plans for updates, edits, and performance monitoring. Ask about this when we talk.',
  },
  {
    q: 'Can you redesign an existing website?',
    a: "Absolutely. Redesigns are some of my favorite projects. I audit what exists, identify what's costing you conversions, and rebuild it to win.",
  },
  {
    q: 'What tech stack do you use?',
    a: "Next.js for performance, Tailwind CSS for pixel-perfect design, Supabase or other backends as needed. You get modern, maintainable code — not a page builder you can't grow past.",
  },
  {
    q: 'Do I own the code?',
    a: "Yes. You own 100% of everything — code, assets, hosting account. I don't lock you into proprietary systems.",
  },
];

export default function ServicesPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [prefillTier, setPrefillTier] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('pricing_tiers')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (data && data.length > 0) setTiers(data as unknown as PricingTier[]);
        else setTiers(PLACEHOLDER_TIERS);
      } catch {
        setTiers(PLACEHOLDER_TIERS);
      }
    }
    fetchTiers();
  }, []);

  const displayTiers = tiers.length > 0 ? tiers : PLACEHOLDER_TIERS;

  const handleBook = (tierName: string) => {
    setPrefillTier(tierName);
    setBookOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Header */}
      <div className="max-w-2xl mb-20">
        <SectionHeading
          eyebrow="Services & pricing"
          title="Honest pricing for work that earns its cost."
          subtitle="Every project starts with a conversation. These packages give you a clear starting point — final quote confirmed before anything begins."
        />
      </div>

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {displayTiers.map((tier) => (
          <PricingTierCard key={tier.id} tier={tier} onBookClick={handleBook} />
        ))}
      </div>

      <p className="text-sm text-center text-[var(--muted)] mb-24">
        All prices in Nigerian Naira (₦). USD pricing available on request.
        Final quote confirmed in conversation — no surprises.
      </p>

      {/* What's included */}
      <section className="mb-24 border-t border-[var(--line)] pt-20">
        <SectionHeading
          eyebrow="Every project"
          title="What you always get — regardless of tier."
          className="mb-12 max-w-xl"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Mobile-first, responsive design',
            'Cross-browser testing',
            'Google Analytics / Search Console',
            'Performance optimization',
            'Full code & asset handover',
            'Deployment assistance',
            'Post-launch support (30 days)',
            'No vendor lock-in',
            'Direct communication with Aniekan',
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-5 border border-[var(--line)] rounded-sm"
            >
              <span className="text-[var(--gold)] text-lg leading-none mt-0.5">✓</span>
              <span className="text-sm text-[var(--muted)]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-24 border-t border-[var(--line)] pt-20">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." className="mb-12 max-w-xl" />
        <div className="max-w-3xl divide-y divide-[var(--line)]">
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                className="w-full text-left py-6 flex items-start justify-between gap-4 group"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-heading font-semibold text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors">
                  {item.q}
                </span>
                <span className="text-[var(--gold)] text-xl leading-none shrink-0 mt-0.5">
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-6 text-sm text-[var(--muted)] leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center border-t border-[var(--line)] pt-20">
        <p className="label-micro mb-4">Next step</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-6">
          Let&apos;s find the right fit for your project.
        </h2>
        <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
          Start the conversation. No commitment required — just a clear picture of what you need.
        </p>
        <button
          onClick={() => handleBook('')}
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--bg)] font-heading font-semibold text-sm tracking-widest uppercase px-8 py-4 rounded-sm hover:bg-[var(--gold-soft)] transition-colors"
        >
          Start a project
        </button>
      </section>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} prefillProjectType={prefillTier} />
    </div>
  );
}
