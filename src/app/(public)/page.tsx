'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { SectionHeading } from '@/components/site/SectionHeading';
import { DeviceMockup } from '@/components/site/DeviceMockup';
import { ProjectCard } from '@/components/site/ProjectCard';
import { TestimonialCard } from '@/components/site/TestimonialCard';
import { PricingTier as PricingTierCard } from '@/components/site/PricingTier';
import { BookDialog } from '@/components/site/BookDialog';
import { createClient } from '@/lib/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import type { Project, PricingTier, Testimonial } from '@/types';

const PLACEHOLDER_FEATURED: Project = {
  id: 'placeholder',
  title: 'Horizon Real Estate',
  slug: 'horizon-real-estate',
  category: 'Business Website',
  short_description:
    'A property listing platform that positions Horizon as the market authority in Lagos luxury real estate.',
  full_description: null,
  cover_image_url: null,
  cover_device: 'browser',
  gallery: null,
  tech_stack: ['Next.js', 'Supabase', 'Tailwind CSS'],
  live_url: null,
  is_published: true,
  is_featured: true,
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const PLACEHOLDER_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Lagos Bites',
    slug: 'lagos-bites',
    category: 'E-commerce',
    short_description: 'Online food ordering with real-time tracking.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'browser',
    gallery: null,
    tech_stack: ['Next.js', 'Stripe'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Clarity Consulting',
    slug: 'clarity-consulting',
    category: 'Business Website',
    short_description: 'Brand positioning site for a management consulting firm.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'laptop',
    gallery: null,
    tech_stack: ['Next.js', 'Framer Motion'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Lumina Skincare',
    slug: 'lumina-skincare',
    category: 'Landing Page',
    short_description: 'High-converting product launch page with 42% conversion rate.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'phone',
    gallery: null,
    tech_stack: ['Next.js', 'Tailwind CSS'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const PLACEHOLDER_TIERS: PricingTier[] = [
  {
    id: '1',
    name: 'Starter',
    price_label: '₦350k',
    summary: 'For early-stage brands or small projects.',
    features: [
      'Up to 5 pages',
      'Mobile-first design',
      'Contact form + WhatsApp',
      'Basic SEO setup',
      '2 rounds of revisions',
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
    price_label: '₦650k',
    summary: 'For growing brands or MVP launches.',
    features: [
      'Up to 10 pages',
      'Custom animations',
      'Blog / portfolio CMS',
      'Advanced SEO + sitemap',
      'Analytics dashboard',
      '3 rounds of revisions',
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
    summary: 'For complex products or long-term builds.',
    features: [
      'Full product design + dev',
      'E-commerce / booking system',
      'Custom web application',
      'Payment integration',
      'Admin dashboard',
      'Priority support',
    ],
    delivery_days: 30,
    is_highlighted: false,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

// NGN base prices for currency conversion (keyed by tier name)
const TIER_NGN_PRICES: Record<string, number> = {
  Starter: 350_000,
  Growth: 650_000,
};

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Discover',
    description:
      'We talk. I ask the questions most developers skip — your market, your competition, your edge.',
  },
  {
    num: '02',
    title: 'Design',
    description:
      'I design in the browser, fast. You see real screens, not wireframes. Feedback loops stay tight.',
  },
  {
    num: '03',
    title: 'Build',
    description:
      'Clean code, fast load times, mobile-first. Built on modern tech that scales with your business.',
  },
  {
    num: '04',
    title: 'Launch',
    description:
      'Deployed, tested, handed over. You get everything — code, credentials, a site that works hard for you.',
  },
];

const SERVICES = [
  {
    num: '01',
    label: 'Business Sites',
    headline: 'Look like the undisputed market leader.',
    body: 'Your website is your best salesperson. Make it impossible to ignore.',
  },
  {
    num: '02',
    label: 'E-commerce',
    headline: 'Sell more with less friction.',
    body: 'Checkout flows that convert, product pages that close deals.',
  },
  {
    num: '03',
    label: 'Landing Pages',
    headline: 'One page. One mission.',
    body: 'Campaign pages engineered for a single conversion goal — and nothing else.',
  },
];

const STATS = [
  { value: '50+', label: 'Projects Launched' },
  { value: '3+', label: 'Years Experience' },
  { value: '30+', label: 'Happy Clients' },
];

const FAQ_ITEMS = [
  {
    question: 'How long does a typical project take?',
    answer:
      "Most projects are completed in 7–14 days. Starter sites take about 7 days, Growth sites 2–3 weeks, and complex builds up to 4 weeks. You'll always get a clear timeline before we start.",
  },
  {
    question: 'Do you offer ongoing support after launch?',
    answer:
      'Yes. Every project includes 2 weeks of post-launch support. For ongoing maintenance, content updates, or feature additions, we offer monthly retainer packages — just ask.',
  },
  {
    question: 'What if I only need design or development, not both?',
    answer:
      "We can handle either. Some clients come with an existing design and need development only. Others need the full stack. We'll scope the project to exactly what you need.",
  },
  {
    question: 'How does payment work?',
    answer:
      '50% upfront before we start, and 50% on delivery. For larger projects, we can arrange milestone-based payments. All payments via bank transfer.',
  },
  {
    question: 'Do you work with clients outside Nigeria?',
    answer:
      'Absolutely. We work with businesses worldwide. All communication happens over WhatsApp, email, or Zoom — location is never a barrier.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--line)]">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-heading font-medium text-[var(--ink)]">{question}</span>
        <div className="w-7 h-7 rounded-full border border-[var(--line)] flex items-center justify-center shrink-0">
          {open ? (
            <Minus className="w-3 h-3 text-[var(--muted)]" />
          ) : (
            <Plus className="w-3 h-3 text-[var(--muted)]" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-[var(--muted)] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [prefillTier, setPrefillTier] = useState('');
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);

  const shouldReduceMotion = useReducedMotion();
  const { formatNGN, currency } = useCurrency();

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [featuredRes, projectsRes, testimonialsRes, tiersRes] = await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .eq('is_featured', true)
            .eq('is_published', true)
            .order('sort_order')
            .limit(1)
            .single(),
          supabase.from('projects').select('*').eq('is_published', true).order('sort_order').limit(6),
          supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order'),
          supabase.from('pricing_tiers').select('*').eq('is_active', true).order('sort_order'),
        ]);

        if (featuredRes.data) setFeaturedProject(featuredRes.data as unknown as Project);
        if (projectsRes.data?.length) setRecentProjects(projectsRes.data as unknown as Project[]);
        if (testimonialsRes.data) setTestimonials(testimonialsRes.data as unknown as Testimonial[]);
        if (tiersRes.data?.length) setPricingTiers(tiersRes.data as unknown as PricingTier[]);
      } catch {
        // DB not configured — placeholders shown
      }
    }
    fetchData();
  }, []);

  const displayFeatured = featuredProject || PLACEHOLDER_FEATURED;
  const displayProjects = recentProjects.length > 0 ? recentProjects : PLACEHOLDER_PROJECTS;
  const displayTiers = pricingTiers.length > 0 ? pricingTiers : PLACEHOLDER_TIERS;

  const handleBookTier = (tierName: string) => {
    setPrefillTier(tierName);
    setBookOpen(true);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    }),
  };

  return (
    <>
      {/* 1. HERO */}
      <section className="min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="mb-7"
              >
                <span className="section-badge">✦ Web Design &amp; Development</span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[var(--ink)]"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <span className="font-display italic font-normal block">We Build</span>
                <span className="font-heading font-black block">Websites That</span>
                <span className="font-display italic font-normal block">Win Markets.</span>
              </motion.h1>

              <motion.p
                className="mt-7 text-base text-[var(--muted)] leading-relaxed max-w-md"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                Premium design. Fast delivery. Real results. SwiftCreator builds websites that
                position your business exactly where it deserves to be — at the top.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <button
                  onClick={() => setBookOpen(true)}
                  className="rounded-full px-7 py-3.5 bg-[var(--ink)] text-[var(--bg)] text-sm font-heading font-semibold hover:bg-[var(--gold)] transition-colors duration-200"
                >
                  Start a Project →
                </button>
                <Link
                  href="#work"
                  className="flex items-center gap-2 text-sm font-heading font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  See the Work <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Featured mockup */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--bg-card)]">
                <DeviceMockup
                  src={displayFeatured.cover_image_url || ''}
                  alt={displayFeatured.title}
                  device={displayFeatured.cover_device || 'browser'}
                  animateOnView
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="py-10 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 text-center"
              >
                <p className="font-heading font-black text-4xl md:text-5xl text-[var(--ink)] leading-none mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--muted)] font-heading uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SELECTED WORK */}
      <section id="work" className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <SectionHeading
              badge="◈ Selected Work"
              italic="Projects"
              title="That Speak for Themselves."
            />
            <Link
              href="/work"
              className="hidden md:flex items-center gap-1.5 text-sm font-heading text-[var(--muted)] hover:text-[var(--ink)] transition-colors shrink-0"
            >
              All work <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-10 md:hidden">
            <Link
              href="/work"
              className="flex items-center justify-center gap-2 w-full rounded-full border border-[var(--line)] py-3.5 text-sm font-heading text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              See all work <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            badge="⚙ Our Services"
            italic="Three Things"
            title="I Build Exceptionally Well."
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-7 flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-xs font-heading font-medium text-[var(--muted)] border border-[var(--line)] rounded-full px-3 py-1">
                    {service.num}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] font-heading uppercase tracking-widest mb-3">
                  {service.label}
                </p>
                <h3 className="font-heading font-bold text-lg text-[var(--ink)] leading-snug mb-3">
                  {service.headline}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mt-auto">{service.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROCESS */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            badge="⟳ How It Works"
            italic="From First Call"
            title="to Live Site."
            subtitle="Four clear steps. You're in control throughout."
            className="mb-14 max-w-2xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 relative overflow-hidden"
              >
                <span className="font-heading font-black text-6xl text-[var(--line)] leading-none block mb-4 select-none">
                  {step.num}
                </span>
                <h3 className="font-heading font-bold text-base text-[var(--ink)] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{step.description}</p>
                {/* Decorative circle */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full border border-[var(--line)] pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionHeading
              badge="★ Testimonials"
              italic="Hear from the Clients"
              title="We've Partnered With."
              className="mb-14"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. PRICING */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionHeading
              badge="$ Pricing Plan"
              italic="Plans"
              title="That Scale With You."
              subtitle="Whether you're launching a startup or growing a product, we've got a plan that fits your stage — no fluff, just what you need."
              align="center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {displayTiers.map((tier) => {
              const ngnAmount = TIER_NGN_PRICES[tier.name];
              const convertedPrice = ngnAmount ? formatNGN(ngnAmount) : undefined;
              return (
                <PricingTierCard
                  key={tier.id}
                  tier={tier}
                  convertedPrice={convertedPrice}
                  onBookClick={handleBookTier}
                />
              );
            })}
          </div>

          {currency && (
            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              Prices shown in {currency.code} — approximate conversion from NGN.
            </p>
          )}
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Final quote confirmed in conversation — no hidden fees.{' '}
            <Link href="/services" className="text-[var(--gold)] hover:underline">
              See full breakdown →
            </Link>
          </p>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionHeading
              badge="⊙ FAQs"
              italic="FAQ"
              title="s"
              align="center"
            />
          </div>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: CTA card */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-10 flex flex-col justify-between min-h-[280px]"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
            >
              <div>
                <h2 className="text-3xl md:text-4xl leading-tight text-[var(--ink)]">
                  <span className="font-heading font-bold block">Let&apos;s Talk</span>
                  <span className="font-display italic font-normal block">Your Next Big Idea</span>
                </h2>
              </div>
              <button
                onClick={() => setBookOpen(true)}
                className="mt-8 self-start rounded-full px-7 py-3.5 bg-[var(--ink)] text-[var(--bg)] text-sm font-heading font-semibold hover:bg-[var(--gold)] transition-colors"
              >
                Start a Project →
              </button>
            </div>

            {/* Right: Quick contact form */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-10">
              <p className="text-sm font-heading font-semibold text-[var(--ink)] mb-6">
                Fill This Form Below
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBookOpen(true);
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs text-[var(--muted)] font-heading mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full bg-transparent border-b border-[var(--line)] py-2 text-sm text-[var(--ink)] placeholder:text-[var(--line)] focus:outline-none focus:border-[var(--muted)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] font-heading mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter the e-mail"
                    className="w-full bg-transparent border-b border-[var(--line)] py-2 text-sm text-[var(--ink)] placeholder:text-[var(--line)] focus:outline-none focus:border-[var(--muted)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] font-heading mb-1.5">
                    More About The Project
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-transparent border-b border-[var(--line)] py-2 text-sm text-[var(--ink)] placeholder:text-[var(--line)] focus:outline-none focus:border-[var(--muted)] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl py-3 bg-[var(--ink)] text-[var(--bg)] text-sm font-heading font-semibold hover:bg-[var(--gold)] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <BookDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        prefillProjectType={prefillTier}
      />
    </>
  );
}
