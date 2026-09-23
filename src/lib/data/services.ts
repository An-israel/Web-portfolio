// ------------------------------------------------------------
// What I sell to clients. Drives the home Services section, the
// /services page, and the “What do you need?” options on /hire.
// ------------------------------------------------------------

export interface Service {
  key: string;
  title: string;
  summary: string;
  includes: string[];
  idealFor: string;
  monthly?: boolean;
}

export const SERVICES: Service[] = [
  {
    key: 'website',
    title: 'Business website',
    summary: 'A fast, professional website that explains what you do and turns visitors into enquiries.',
    includes: ['Custom design — no templates', 'Mobile-first and fast', 'Contact form & WhatsApp button', 'SEO basics and Google setup'],
    idealFor: 'Service businesses, consultants, clinics, agencies, churches and NGOs.',
  },
  {
    key: 'store',
    title: 'Online store',
    summary: 'Sell online with a store that’s easy to manage and takes payments from day one.',
    includes: ['Product catalogue & cart', 'Paystack / Flutterwave / OPay payments', 'Order notifications', 'Dashboard to add products yourself'],
    idealFor: 'Fashion, food, beauty and retail brands selling on WhatsApp or Instagram today.',
  },
  {
    key: 'brand',
    title: 'Brand identity & logo',
    summary: 'A logo and visual identity that makes people take your business seriously.',
    includes: ['Original logo in every format', 'Colours & typography', 'Brand guide', 'Business cards & letterheads'],
    idealFor: 'New businesses, rebrands, and anyone whose logo was “just something quick”.',
  },
  {
    key: 'brand-care',
    title: 'Ongoing brand design',
    summary: 'A monthly design partner for everything your brand needs to keep showing up.',
    includes: ['Flyers & social media graphics', 'Banners, menus & price lists', 'Campaign and event designs', 'Fast turnaround'],
    idealFor: 'Businesses posting weekly that want a consistent, professional look.',
    monthly: true,
  },
  {
    key: 'webapp',
    title: 'Web apps & AI products',
    summary: 'Custom platforms, dashboards and AI tools — from idea to a live product.',
    includes: ['Logins, roles & dashboards', 'Bookings, payments & automations', 'AI features built in', 'Secure, scalable backend'],
    idealFor: 'Founders and teams with a product idea or a process to automate.',
  },
  {
    key: 'care',
    title: 'Website care & hosting',
    summary: 'I keep your site online, secure and up to date so you never touch the tech.',
    includes: ['Domain, hosting & business email', 'Updates, backups & security', 'Small content changes', 'Monthly check-ups'],
    idealFor: 'Anyone who wants their website handled for them.',
    monthly: true,
  },
];

/** Options on the /hire form. `role` keeps the job/contract path (no budget needed). */
export const HIRE_PROJECT_TYPES = [
  ...SERVICES.map((s) => ({ key: s.key, label: s.title })),
  { key: 'other', label: 'Something else' },
  { key: 'role', label: 'Job / contract role' },
];
