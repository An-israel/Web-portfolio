'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/site/SectionHeading';
import { DeviceMockup } from '@/components/site/DeviceMockup';
import { ProjectCard } from '@/components/site/ProjectCard';
import { TestimonialCard } from '@/components/site/TestimonialCard';
import { PricingTier as PricingTierCard } from '@/components/site/PricingTier';
import { BookDialog } from '@/components/site/BookDialog';
import { createClient } from '@/lib/supabase/client';
import type { Project, PricingTier, Testimonial } from '@/types';

// Placeholder data used when DB is empty
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
    price_label: 'From ₦350k',
    summary: 'A clean, professional site that builds trust and converts visitors into leads.',
    features: [
      'Up to 5 pages',
      'Mobile-first design',
      'Contact form with WhatsApp integration',
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
    price_label: 'From ₦650k',
    summary: 'A premium website built to position you as the undisputed authority in your market.',
    features: [
      'Up to 10 pages',
      'Custom animations & interactions',
      'Blog or portfolio section',
      'Advanced SEO + sitemap',
      'CMS integration',
      'Analytics dashboard setup',
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
    summary: 'Full-stack web applications, e-commerce platforms, and enterprise solutions.',
    features: [
      'Unlimited pages',
      'E-commerce / booking system',
      'Custom web application',
      'Payment integration',
      'Admin dashboard',
      'Priority support',
      'Ongoing maintenance',
    ],
    delivery_days: 30,
    is_highlighted: false,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Discover',
    description:
      'We talk. I ask the questions most developers skip — your market, your competition, your edge. This shapes everything.',
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
    label: 'Business Sites',
    headline: 'Look like the undisputed market leader.',
    body: 'Your website is your best salesperson. Make it impossible to ignore.',
  },
  {
    label: 'E-commerce',
    headline: 'Sell more with less friction.',
    body: 'Checkout flows that convert, product pages that close deals.',
  },
  {
    label: 'Landing Pages',
    headline: 'One page. One mission. Maximum conversions.',
    body: 'Campaign pages engineered for a single conversion goal — and nothing else.',
  },
];

export default function HomePage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [prefillTier, setPrefillTier] = useState('');
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const featuredRes = await supabase
          .from('projects')
          .select('*')
          .eq('is_featured', true)
          .eq('is_published', true)
          .order('sort_order')
          .limit(1)
          .single();
        const projectsRes = await supabase
          .from('projects')
          .select('*')
          .eq('is_published', true)
          .order('sort_order')
          .limit(6);
        const testimonialsRes = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_published', true)
          .order('sort_order');
        const tiersRes = await supabase
          .from('pricing_tiers')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (featuredRes.data) setFeaturedProject(featuredRes.data as unknown as Project);
        if (projectsRes.data && projectsRes.data.length > 0)
          setRecentProjects(projectsRes.data as unknown as Project[]);
        if (testimonialsRes.data) setTestimonials(testimonialsRes.data as unknown as Testimonial[]);
        if (tiersRes.data && tiersRes.data.length > 0)
          setPricingTiers(tiersRes.data as unknown as PricingTier[]);
      } catch {
        // DB not configured — placeholders will show
      } finally {
        setLoading(false);
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
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
  };

  return (
    <>
      {/* 1. HERO */}
      <section className="min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Copy */}
            <div>
              <motion.p
                className="label-micro mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                Web design & development
              </motion.p>

              <motion.h1
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--ink)] leading-[1.05] tracking-tight"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                We build websites that make your business look like the{' '}
                <span className="text-[var(--gold)]">leader</span> in its market.
              </motion.h1>

              <motion.p
                className="mt-8 text-lg text-[var(--muted)] leading-relaxed max-w-lg"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                Premium design. Fast delivery. Real results. SwiftCreator builds
                websites that position your business exactly where it deserves to be — at the top.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <Button
                  size="xl"
                  className="font-heading text-sm tracking-widest uppercase"
                  onClick={() => setBookOpen(true)}
                >
                  Start a project
                </Button>
                <Button
                  variant="ghost"
                  size="xl"
                  className="font-heading text-sm tracking-widest uppercase text-[var(--muted)]"
                  asChild
                >
                  <Link href="#work">
                    See the work <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="mt-10 flex items-center gap-6 text-xs text-[var(--muted)]"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={4}
              >
                {['Fast turnaround', 'Premium design', '100% custom'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--gold)]" />
                    {item}
                  </span>
                ))}
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
              <DeviceMockup
                src={displayFeatured.cover_image_url || ''}
                alt={displayFeatured.title}
                device={displayFeatured.cover_device || 'browser'}
                animateOnView
              />
              {/* Decorative gold line */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-[var(--gold)]/20 rounded-sm pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Background subtle gradient */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--gold)]/3 to-transparent" />
        </div>
      </section>

      {/* 2. FEATURED WORK */}
      <section id="work" className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                eyebrow="Featured project"
                title={displayFeatured.title}
                subtitle={displayFeatured.short_description || undefined}
              />
              {displayFeatured.tech_stack && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {displayFeatured.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-heading font-medium px-3 py-1 border border-[var(--line)] text-[var(--muted)] rounded-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Button variant="outline" size="lg" asChild className="font-heading text-xs tracking-widest uppercase">
                  <Link href={`/work/${displayFeatured.slug}`}>
                    View case study <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <DeviceMockup
              src={displayFeatured.cover_image_url || ''}
              alt={displayFeatured.title}
              device={displayFeatured.cover_device || 'browser'}
              animateOnView
            />
          </div>
        </div>
      </section>

      {/* 3. SELECTED WORK */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <SectionHeading eyebrow="Selected work" title="Projects that speak for themselves." />
            <Button variant="ghost" asChild className="hidden md:flex font-heading text-xs tracking-widest uppercase text-[var(--muted)] shrink-0">
              <Link href="/work">
                All work <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-12 md:hidden">
            <Button variant="outline" asChild className="w-full font-heading text-xs tracking-widest uppercase">
              <Link href="/work">See all work</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. WHAT I BUILD */}
      <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Services"
            title="Three things I build exceptionally well."
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)]">
            {SERVICES.map((service, i) => (
              <div key={i} className="bg-[var(--bg-raised)] p-8">
                <p className="label-micro mb-4">{service.label}</p>
                <h3 className="font-display text-2xl text-[var(--ink)] font-semibold leading-snug mb-4">
                  {service.headline}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{service.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-start">
            <Button variant="outline" asChild className="font-heading text-xs tracking-widest uppercase">
              <Link href="/services">
                View pricing <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. WHY SWIFTCREATOR */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <SectionHeading
              eyebrow="Why SwiftCreator"
              title="The difference between a website and a competitive weapon."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: 'Design that converts',
                  body: 'Every layout decision is made to move visitors toward action — not just to look good.',
                },
                {
                  title: 'Fast delivery',
                  body: "Most projects ship in 7–14 days. You don't wait months to see results.",
                },
                {
                  title: 'Performance obsessed',
                  body: 'Sub-second load times, perfect Lighthouse scores. Your site will outrun the competition technically, too.',
                },
                {
                  title: 'Full handover',
                  body: 'You own everything. Code, hosting, credentials. No vendor lock-in, ever.',
                },
              ].map((item, i) => (
                <div key={i} className="p-6 border border-[var(--line)] rounded-sm">
                  <div className="w-8 h-px bg-[var(--gold)] mb-4" />
                  <h4 className="font-heading font-semibold text-[var(--ink)] mb-2">{item.title}</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From first call to live site — and you're in control throughout."
            className="mb-16 max-w-2xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-8 h-px bg-[var(--line)] -translate-x-4" />
                )}
                <span className="font-display text-5xl font-bold text-[var(--line)] leading-none block mb-4">
                  {step.num}
                </span>
                <h3 className="font-heading font-semibold text-lg text-[var(--ink)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      {(testimonials.length > 0) && (
        <section className="py-24 border-t border-[var(--line)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionHeading
              eyebrow="Client words"
              title="The results speak. So do the clients."
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

      {/* 8. PRICING TEASER */}
      <section className="py-24 border-t border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <SectionHeading eyebrow="Investment" title="Transparent pricing. No surprises." />
            <Button variant="ghost" asChild className="hidden md:flex font-heading text-xs tracking-widest uppercase text-[var(--muted)] shrink-0">
              <Link href="/services">
                Full pricing <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayTiers.map((tier) => (
              <PricingTierCard
                key={tier.id}
                tier={tier}
                compact
                onBookClick={handleBookTier}
              />
            ))}
          </div>

          <p className="mt-8 text-sm text-[var(--muted)] text-center">
            Final quote confirmed in conversation — no hidden fees.{' '}
            <Link href="/services" className="text-[var(--gold)] hover:underline">
              See full breakdown
            </Link>
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA BAND */}
      <section className="py-24 border-t border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="label-micro mb-6">Ready?</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--ink)] leading-tight">
            Your competitors are online right now.<br />
            <span className="text-[var(--gold)]">Make sure you look better.</span>
          </h2>
          <p className="mt-8 text-lg text-[var(--muted)] max-w-xl mx-auto">
            Let&apos;s build something that makes people stop scrolling. The conversation starts here.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="xl"
              className="font-heading text-sm tracking-widest uppercase"
              onClick={() => setBookOpen(true)}
            >
              Start a project
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="font-heading text-sm tracking-widest uppercase"
            >
              <Link href="/work">See the work</Link>
            </Button>
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
