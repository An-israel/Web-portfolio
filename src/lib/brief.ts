import { z } from 'zod';

// ------------------------------------------------------------
// Client briefs — shared by the public form, its API routes,
// and the admin. Plain module: safe on server and client.
// ------------------------------------------------------------

export const BRIEF_BUCKET = 'client-briefs';
export const BRIEF_PRICING_KEY = 'private_brief_pricing';
export const BRIEF_MAX_FILES = 8;
export const BRIEF_MAX_FILE_BYTES = 10 * 1024 * 1024;

export type BriefStatus =
  | 'sent'
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'won'
  | 'lost'
  | 'archived';

export const BRIEF_STATUSES: BriefStatus[] = [
  'sent',
  'submitted',
  'reviewing',
  'quoted',
  'won',
  'lost',
  'archived',
];

export const BRIEF_STATUS_LABEL: Record<BriefStatus, string> = {
  sent: 'Awaiting client',
  submitted: 'Submitted',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
};

// ---------- Pricing (admin-only) ----------

export interface Money {
  naira: number;
  usd: number;
}

export interface PriceItem extends Money {
  key: string;
  label: string;
  description: string;
}

export interface AddonItem extends PriceItem {
  recurring: boolean; // billed monthly
}

export interface BriefPricing {
  site_types: PriceItem[];
  included_pages: number;
  extra_page: Money;
  features: PriceItem[];
  addons: AddonItem[];
  rush_percent: number;
  budget_ranges: string[];
}

export const DEFAULT_BRIEF_PRICING: BriefPricing = {
  site_types: [
    {
      key: 'business',
      label: 'Business / company website',
      description: 'Tell people who you are and what you offer — Home, About, Services, Contact.',
      naira: 250000,
      usd: 400,
    },
    {
      key: 'ecommerce',
      label: 'E-commerce / online store',
      description: 'Sell products online with a cart, checkout and payments.',
      naira: 600000,
      usd: 900,
    },
    {
      key: 'portfolio',
      label: 'Portfolio / personal brand',
      description: 'Show off your work and build trust — for creators, coaches and freelancers.',
      naira: 180000,
      usd: 300,
    },
    {
      key: 'webapp',
      label: 'Web app / custom platform',
      description: 'Logins, dashboards, bookings or other custom functionality.',
      naira: 1200000,
      usd: 2000,
    },
  ],
  included_pages: 5,
  extra_page: { naira: 25000, usd: 40 },
  features: [
    { key: 'contact_form', label: 'Contact / enquiry form', description: '', naira: 15000, usd: 25 },
    { key: 'whatsapp', label: 'WhatsApp chat button', description: '', naira: 5000, usd: 10 },
    { key: 'payments', label: 'Online payments (Paystack, Flutterwave, OPay…)', description: '', naira: 80000, usd: 120 },
    { key: 'booking', label: 'Bookings / appointments', description: '', naira: 100000, usd: 150 },
    { key: 'blog', label: 'Blog / news section', description: '', naira: 50000, usd: 80 },
    { key: 'newsletter', label: 'Newsletter / email sign-up', description: '', naira: 20000, usd: 30 },
    { key: 'accounts', label: 'Customer accounts / login', description: '', naira: 150000, usd: 250 },
    { key: 'cms', label: 'Dashboard to edit your own content', description: '', naira: 120000, usd: 200 },
    { key: 'multilang', label: 'Multiple languages', description: '', naira: 80000, usd: 120 },
    { key: 'search', label: 'Search', description: '', naira: 30000, usd: 50 },
    { key: 'maps', label: 'Google Maps / location', description: '', naira: 10000, usd: 15 },
    { key: 'seo', label: 'SEO & analytics setup', description: '', naira: 40000, usd: 60 },
  ],
  addons: [
    {
      key: 'logo',
      label: 'Logo design',
      description: 'A professional, original logo with files ready for web, print and social media.',
      naira: 80000,
      usd: 120,
      recurring: false,
    },
    {
      key: 'brand_identity',
      label: 'Full brand identity',
      description: 'Logo, colours, fonts and a brand guide — plus business cards and letterheads.',
      naira: 250000,
      usd: 400,
      recurring: false,
    },
    {
      key: 'brand_retainer',
      label: 'Ongoing brand design help',
      description: 'A monthly design partner for flyers, social media graphics, banners and more.',
      naira: 100000,
      usd: 150,
      recurring: true,
    },
    {
      key: 'care',
      label: 'Website care & maintenance',
      description: 'Monthly updates, backups, security checks and small content changes.',
      naira: 30000,
      usd: 50,
      recurring: true,
    },
    {
      key: 'domain_hosting',
      label: 'Domain & hosting setup',
      description: 'I register your domain, set up hosting and business email — you don’t touch the tech.',
      naira: 50000,
      usd: 80,
      recurring: false,
    },
    {
      key: 'copywriting',
      label: 'Content & copywriting',
      description: 'I write the words on your website so it sounds professional and sells.',
      naira: 60000,
      usd: 100,
      recurring: false,
    },
  ],
  rush_percent: 25,
  budget_ranges: [
    'Under ₦200k',
    '₦200k – ₦500k',
    '₦500k – ₦1M',
    '₦1M – ₦2.5M',
    '₦2.5M+',
    'Not sure yet',
  ],
};

/** Merge whatever is stored in site_settings over the defaults. */
export function normalizePricing(raw: unknown): BriefPricing {
  const d = DEFAULT_BRIEF_PRICING;
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<BriefPricing>;
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  const money = (m: unknown, fallback: Money): Money => {
    const o = (m ?? {}) as Partial<Money>;
    return { naira: num(o.naira, fallback.naira), usd: num(o.usd, fallback.usd) };
  };
  const items = (list: unknown): AddonItem[] | null =>
    Array.isArray(list)
      ? list
          .filter((i) => i && typeof i.key === 'string' && typeof i.label === 'string')
          .map((i) => ({
            key: i.key,
            label: i.label,
            description: typeof i.description === 'string' ? i.description : '',
            ...money(i, { naira: 0, usd: 0 }),
            recurring: !!i.recurring,
          }))
      : null;

  return {
    site_types: items(r.site_types) ?? d.site_types,
    included_pages: num(r.included_pages, d.included_pages),
    extra_page: money(r.extra_page, d.extra_page),
    features: items(r.features) ?? d.features,
    addons: items(r.addons) ?? d.addons,
    rush_percent: num(r.rush_percent, d.rush_percent),
    budget_ranges:
      Array.isArray(r.budget_ranges) && r.budget_ranges.length
        ? r.budget_ranges.filter((b): b is string => typeof b === 'string')
        : d.budget_ranges,
  };
}

// ---------- What the client sees (no prices) ----------

export interface BriefOption {
  key: string;
  label: string;
  description: string;
}

export interface BriefFormOptions {
  site_types: BriefOption[];
  features: BriefOption[];
  addons: (BriefOption & { recurring: boolean })[];
  budget_ranges: string[];
}

export function publicOptions(p: BriefPricing): BriefFormOptions {
  const strip = ({ key, label, description }: PriceItem): BriefOption => ({ key, label, description });
  return {
    site_types: p.site_types.map(strip),
    features: p.features.map(strip),
    addons: p.addons.map((a) => ({ ...strip(a), recurring: a.recurring })),
    budget_ranges: p.budget_ranges,
  };
}

// ---------- Fixed question options ----------

export const BRIEF_GOALS = [
  'Get more enquiries / leads',
  'Sell products online',
  'Take bookings',
  'Show off my work',
  'Look more professional / credible',
  'Share information with customers',
  'Grow my personal brand',
];

export const BRIEF_PAGES = [
  'Home',
  'About',
  'Services',
  'Shop / Products',
  'Portfolio / Gallery',
  'Blog / News',
  'Testimonials / Reviews',
  'Pricing',
  'Team',
  'FAQ',
  'Contact',
  'Booking',
];

export const BRIEF_STYLES = [
  'Clean & minimal',
  'Bold & colourful',
  'Elegant / luxury',
  'Corporate & professional',
  'Modern & techy',
  'Warm & friendly',
  'Playful & fun',
];

export const BRIEF_PRODUCT_COUNTS = ['1–20', '21–100', '101–500', '500+'];

export const BRIEF_CONTENT_READY = [
  'Yes — I have text and photos ready',
  'Some of it',
  'No — I need help with content',
];

export const BRIEF_DOMAIN = ['Yes, I have a domain', 'No, I need one', 'Not sure'];

export const BRIEF_HAS_LOGO = [
  'Yes, and I’m happy with it',
  'Yes, but it needs a refresh',
  'No, I don’t have one',
];

export const BRIEF_TIMELINES = [
  { key: 'asap', label: 'ASAP — within 2 weeks', rush: true },
  { key: '2-4w', label: '2–4 weeks', rush: false },
  { key: '1-2m', label: '1–2 months', rush: false },
  { key: 'flexible', label: 'Flexible', rush: false },
] as const;

// ---------- Answers ----------

const str = (max: number) => z.string().trim().max(max);
const opt = (max: number) => z.string().trim().max(max).default('');
const list = (max = 30) => z.array(z.string().max(200)).max(max).default([]);

export const briefAttachmentSchema = z.object({
  path: z.string().max(400),
  name: z.string().max(200),
  type: z.string().max(100),
  size: z.number().int().nonnegative(),
});
export type BriefAttachment = z.infer<typeof briefAttachmentSchema>;

export const briefAnswersSchema = z.object({
  // You
  full_name: str(120).min(1, 'Tell me your name.'),
  email: z.string().trim().email('Enter a valid email.').max(200),
  phone: str(40).min(7, 'Enter a phone / WhatsApp number.'),
  role: opt(120),
  // Business
  business_name: str(200).min(1, 'What is your business called?'),
  industry: str(200).min(2, 'What industry are you in?'),
  tagline: opt(300),
  business_description: str(8000).min(80, 'Tell me more — at least a few sentences (80+ characters).'),
  audience: str(3000).min(10, 'Who are your customers?'),
  location: opt(300),
  years_in_business: opt(60),
  existing_website: opt(300),
  socials: opt(1000),
  competitors: opt(2000),
  // Website
  site_type: str(60).min(1, 'Pick the kind of website you need.'),
  goals: list(),
  pages: list(),
  other_pages: opt(1000),
  features: list(50),
  product_count: opt(60),
  content_ready: opt(100),
  has_domain: opt(100),
  domain_name: opt(200),
  // Look & feel
  inspirations: z
    .array(z.object({ url: opt(500), notes: opt(2000) }))
    .max(5)
    .default([]),
  styles: list(),
  colors: opt(500),
  dislikes: opt(2000),
  look_notes: opt(4000),
  attachments: z.array(briefAttachmentSchema).max(BRIEF_MAX_FILES).default([]),
  // Extras
  has_logo: opt(100),
  addons: list(),
  extras_notes: opt(2000),
  // Project
  budget_range: str(60).min(1, 'Choose a budget range.'),
  timeline: str(30).min(1, 'Choose a timeline.'),
  deadline_notes: opt(500),
  anything_else: opt(4000),
});

export type BriefAnswers = z.infer<typeof briefAnswersSchema>;

// ---------- Estimate (admin-only) ----------

export interface EstimateLine extends Money {
  label: string;
  recurring?: boolean;
}

export interface BriefEstimate {
  lines: EstimateLine[];
  pageCount: number;
  oneOff: Money;
  monthly: Money;
}

export function countPages(a: Pick<BriefAnswers, 'pages' | 'other_pages'>): number {
  const others = (a.other_pages || '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  return (a.pages?.length || 0) + others;
}

export function estimateBrief(a: BriefAnswers, p: BriefPricing): BriefEstimate {
  const lines: EstimateLine[] = [];
  const find = <T extends PriceItem>(items: T[], key: string) => items.find((i) => i.key === key);

  const site = find(p.site_types, a.site_type);
  lines.push({
    label: site ? `Base — ${site.label}` : `Base — ${a.site_type} (no longer priced)`,
    naira: site?.naira ?? 0,
    usd: site?.usd ?? 0,
  });

  const pageCount = countPages(a);
  const extraPages = Math.max(0, pageCount - p.included_pages);
  if (extraPages > 0) {
    lines.push({
      label: `${extraPages} extra page${extraPages === 1 ? '' : 's'} (${pageCount} requested, ${p.included_pages} included)`,
      naira: extraPages * p.extra_page.naira,
      usd: extraPages * p.extra_page.usd,
    });
  }

  for (const key of a.features || []) {
    const f = find(p.features, key);
    lines.push({ label: f ? f.label : `${key} (no longer priced)`, naira: f?.naira ?? 0, usd: f?.usd ?? 0 });
  }

  for (const key of a.addons || []) {
    const ad = find(p.addons, key);
    lines.push({
      label: ad ? ad.label : `${key} (no longer priced)`,
      naira: ad?.naira ?? 0,
      usd: ad?.usd ?? 0,
      recurring: ad?.recurring,
    });
  }

  const sum = (ls: EstimateLine[]): Money =>
    ls.reduce((t, l) => ({ naira: t.naira + l.naira, usd: t.usd + l.usd }), { naira: 0, usd: 0 });

  const oneOff = sum(lines.filter((l) => !l.recurring));
  const rush = BRIEF_TIMELINES.find((t) => t.key === a.timeline)?.rush;
  if (rush && p.rush_percent > 0) {
    const r = {
      label: `Rush fee (+${p.rush_percent}%)`,
      naira: Math.round((oneOff.naira * p.rush_percent) / 100),
      usd: Math.round((oneOff.usd * p.rush_percent) / 100),
    };
    lines.push(r);
    oneOff.naira += r.naira;
    oneOff.usd += r.usd;
  }

  return { lines, pageCount, oneOff, monthly: sum(lines.filter((l) => l.recurring)) };
}

// ---------- Helpers ----------

export function formatUsd(n: number): string {
  return `$${(n || 0).toLocaleString('en-US')}`;
}

/** Public link to a brief — call in the browser (uses the current origin). */
export function briefLink(token: string): string {
  return `${window.location.origin}/brief/${token}`;
}

export function briefInviteText(name: string, link: string): string {
  return `Hi ${name.split(' ')[0]}, thanks for choosing to work with me! Please fill in this project brief so I can understand your business and the website you want: ${link}`;
}

/** wa.me link to a client's number. Local Nigerian numbers (0803…) become 234803…. */
export function whatsAppTo(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = `234${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
