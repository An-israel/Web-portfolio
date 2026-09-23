'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, Upload, X, Loader2, FileText, Plus } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { PulseLine } from '@/components/site/PulseLine';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  BRIEF_BUCKET,
  BRIEF_CONTENT_READY,
  BRIEF_DOMAIN,
  BRIEF_GOALS,
  BRIEF_HAS_LOGO,
  BRIEF_MAX_FILES,
  BRIEF_MAX_FILE_BYTES,
  BRIEF_PAGES,
  BRIEF_PRODUCT_COUNTS,
  BRIEF_STYLES,
  BRIEF_TIMELINES,
  briefAnswersSchema,
  type BriefAnswers,
  type BriefFormOptions,
} from '@/lib/brief';

export interface BriefShowcaseItem {
  slug: string;
  title: string;
  cover_image_url: string | null;
}

const STEPS = [
  { title: 'About you', fields: ['full_name', 'email', 'phone', 'role'] },
  {
    title: 'Your business',
    fields: [
      'business_name',
      'industry',
      'tagline',
      'business_description',
      'audience',
      'location',
      'years_in_business',
      'existing_website',
      'socials',
      'competitors',
    ],
  },
  {
    title: 'Your website',
    fields: ['site_type', 'goals', 'pages', 'other_pages', 'features', 'product_count', 'content_ready', 'has_domain', 'domain_name'],
  },
  { title: 'Look & feel', fields: ['inspirations', 'styles', 'colors', 'dislikes', 'look_notes', 'attachments'] },
  { title: 'Extra services', fields: ['has_logo', 'addons', 'extras_notes'] },
  { title: 'Budget & send', fields: ['budget_range', 'timeline', 'deadline_notes', 'anything_else'] },
] as const;

const EMPTY: BriefAnswers = {
  full_name: '',
  email: '',
  phone: '',
  role: '',
  business_name: '',
  industry: '',
  tagline: '',
  business_description: '',
  audience: '',
  location: '',
  years_in_business: '',
  existing_website: '',
  socials: '',
  competitors: '',
  site_type: '',
  goals: [],
  pages: [],
  other_pages: '',
  features: [],
  product_count: '',
  content_ready: '',
  has_domain: '',
  domain_name: '',
  inspirations: [{ url: '', notes: '' }],
  styles: [],
  colors: '',
  dislikes: '',
  look_notes: '',
  attachments: [],
  has_logo: '',
  addons: [],
  extras_notes: '',
  budget_range: '',
  timeline: '',
  deadline_notes: '',
  anything_else: '',
};

type Errors = Partial<Record<keyof BriefAnswers, string>>;

type Draft = { form: BriefAnswers; step: number } | null;

function readDraft(key: string): Draft {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { form?: Partial<BriefAnswers>; step?: number };
    if (!saved?.form) return null;
    const step = typeof saved.step === 'number' ? saved.step : 0;
    return { form: { ...EMPTY, ...saved.form }, step: Math.min(Math.max(step, 0), STEPS.length - 1) };
  } catch {
    return null; // no storage — start fresh
  }
}

const noopSubscribe = () => () => {};

type BriefFormProps = {
  token: string;
  clientName: string;
  options: BriefFormOptions;
  showcase: BriefShowcaseItem[];
};

// The draft lives in localStorage, so render only in the browser.
export function BriefForm(props: BriefFormProps) {
  const inBrowser = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!inBrowser) return <div className="min-h-screen" />;
  return <BriefFormInner {...props} />;
}

function BriefFormInner({
  token,
  clientName,
  options,
  showcase,
}: BriefFormProps) {
  const storageKey = `brief:${token}`;
  const [draft] = useState(() => readDraft(storageKey));
  const [step, setStep] = useState(draft?.step ?? 0);
  const [form, setForm] = useState<BriefAnswers>(draft?.form ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const restored = !!draft;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Auto-save the draft on every change.
  useEffect(() => {
    if (done) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ form, step }));
    } catch {
      /* ignore */
    }
  }, [form, step, storageKey, done]);

  function set<K extends keyof BriefAnswers>(key: K, value: BriefAnswers[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function toggle(key: 'goals' | 'pages' | 'features' | 'styles' | 'addons', value: string) {
    const cur = form[key];
    set(key, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
  }

  function collectErrors(): Errors {
    const res = briefAnswersSchema.safeParse(form);
    if (res.success) return {};
    const fe = res.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const out: Errors = {};
    for (const [k, v] of Object.entries(fe)) if (v?.[0]) out[k as keyof BriefAnswers] = v[0];
    return out;
  }

  function validateStep(s: number): boolean {
    const all = collectErrors();
    const fields = STEPS[s].fields as readonly string[];
    const e: Errors = {};
    for (const [k, v] of Object.entries(all)) if (fields.includes(k)) e[k as keyof BriefAnswers] = v;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function go(s: number) {
    setStep(s);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function next() {
    if (validateStep(step)) go(Math.min(STEPS.length - 1, step + 1));
  }

  async function submit() {
    setSubmitError('');
    const all = collectErrors();
    if (Object.keys(all).length) {
      setErrors(all);
      const first = STEPS.findIndex((s) => (s.fields as readonly string[]).some((f) => f in all));
      if (first >= 0) go(first);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/brief/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setSubmitError('This brief has already been submitted. Reach out to me if you need to change anything.');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      setDone(true);
    } catch {
      setSubmitError('Something went wrong sending your brief. Your answers are saved — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="min-h-screen flex items-center">
        <div className="max-w-[700px] mx-auto px-6 text-center py-32">
          <PulseLine className="mb-10" />
          <h1 className="font-display text-5xl sm:text-6xl text-[var(--platinum)]">Thank you.</h1>
          <p className="mt-6 text-lg text-[var(--mist)]">
            Your brief is in. I&apos;ll go through everything and get back to you with next steps and a
            quote on <span className="text-[var(--platinum)]">{form.phone}</span> or{' '}
            <span className="text-[var(--platinum)]">{form.email}</span>.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/designs"
              className="rounded-md border border-[var(--silver)] px-7 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
            >
              See my design work
            </Link>
            <Link
              href="/coaching"
              className="rounded-md border border-[var(--steel)] px-7 py-3.5 text-sm font-medium text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)] transition-colors"
            >
              Coaching
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const firstName = clientName.split(' ')[0];
  const isStore = form.site_type === 'ecommerce';
  const hasDomain = form.has_domain === BRIEF_DOMAIN[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_1fr] min-h-screen">
      <aside className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between bg-[var(--obsidian)] border-b lg:border-b-0 lg:border-r border-[var(--steel)] px-6 lg:px-12 pt-32 pb-10">
        <div>
          <MonoLabel>PROJECT BRIEF</MonoLabel>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl text-[var(--platinum)]">
            Hi {firstName}, let&apos;s plan your website.
          </h1>
          <p className="mt-5 text-[var(--mist)]">
            The more detail you give, the better I can shape your site. Your answers save
            automatically on this device — close the tab and come back to this link anytime.
          </p>
          <ol className="mt-8 hidden lg:block space-y-2">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  onClick={() => (i < step ? go(i) : undefined)}
                  className={cn(
                    'flex items-center gap-3 mono-label transition-colors',
                    i === step ? 'text-[var(--platinum)]' : i < step ? 'text-[var(--silver)] hover:text-[var(--white)]' : 'text-[var(--mist)] cursor-default'
                  )}
                >
                  <span className="w-5">{i < step ? <Check className="w-4 h-4" /> : String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <PulseLine className="hidden lg:block mt-10 max-w-xs" />
      </aside>

      <div ref={topRef} className="px-6 lg:px-16 pt-10 lg:pt-32 pb-20 scroll-mt-24">
        <div className="max-w-2xl">
          <div className="mb-10">
            <div className="flex items-start justify-between gap-4 mb-3">
              <MonoLabel>
                STEP {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')} — {STEPS[step].title.toUpperCase()}
              </MonoLabel>
              {restored && <MonoLabel className="text-[var(--mist)] shrink-0">DRAFT RESTORED</MonoLabel>}
            </div>
            <div className="h-px bg-[var(--steel)] relative">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--silver)] transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <Field label="Full name *" value={form.full_name} onChange={(v) => set('full_name', v)} error={errors.full_name} />
              <Field label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} error={errors.email} placeholder="you@business.com" />
              <Field label="Phone / WhatsApp *" type="tel" value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} placeholder="0803 000 0000" />
              <Field label="Your role in the business" value={form.role} onChange={(v) => set('role', v)} placeholder="Owner, manager, marketing lead…" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="Business name *" value={form.business_name} onChange={(v) => set('business_name', v)} error={errors.business_name} />
              <Field label="Industry *" value={form.industry} onChange={(v) => set('industry', v)} error={errors.industry} placeholder="e.g. Fashion, Real estate, Restaurant, Consulting" />
              <Field label="Slogan / tagline" value={form.tagline} onChange={(v) => set('tagline', v)} placeholder="If you have one" />
              <Area
                label="Tell me about your business *"
                hint="What do you do, what do you sell or offer, how did you start, and what makes you different? Write as much as you like."
                rows={8}
                value={form.business_description}
                onChange={(v) => set('business_description', v)}
                error={errors.business_description}
              />
              <Area
                label="Who are your customers? *"
                hint="Age, location, type of people or businesses — who should this website speak to?"
                value={form.audience}
                onChange={(v) => set('audience', v)}
                error={errors.audience}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Where are you based?" value={form.location} onChange={(v) => set('location', v)} placeholder="City / country" />
                <Field label="Years in business" value={form.years_in_business} onChange={(v) => set('years_in_business', v)} placeholder="e.g. 3 years, just starting" />
              </div>
              <Field label="Current website (if any)" value={form.existing_website} onChange={(v) => set('existing_website', v)} placeholder="https://" />
              <Area label="Social media handles / links" value={form.socials} onChange={(v) => set('socials', v)} rows={2} placeholder="Instagram, Facebook, TikTok, LinkedIn…" />
              <Area label="Competitors or similar businesses" value={form.competitors} onChange={(v) => set('competitors', v)} rows={2} hint="Names or links — helps me see your market." />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <Group label="What kind of website do you need? *" error={errors.site_type}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.site_types.map((t) => (
                    <Card key={t.key} active={form.site_type === t.key} onClick={() => set('site_type', t.key)} title={t.label} description={t.description} />
                  ))}
                </div>
              </Group>

              <Group label="What should the website achieve?" hint="Pick all that apply.">
                <Chips values={BRIEF_GOALS} selected={form.goals} onToggle={(v) => toggle('goals', v)} />
              </Group>

              <Group label="Which pages do you want?" hint="Pick all that apply.">
                <Chips values={BRIEF_PAGES} selected={form.pages} onToggle={(v) => toggle('pages', v)} />
                <textarea
                  rows={2}
                  value={form.other_pages}
                  onChange={(e) => set('other_pages', e.target.value)}
                  placeholder="Any other pages? One per line."
                  className={inputCls('mt-3 resize-y')}
                />
              </Group>

              <Group label="Features you need" hint="Pick all that apply — not sure? Leave it and we’ll discuss.">
                <Chips
                  values={options.features.map((f) => f.key)}
                  labels={Object.fromEntries(options.features.map((f) => [f.key, f.label]))}
                  selected={form.features}
                  onToggle={(v) => toggle('features', v)}
                />
              </Group>

              {isStore && (
                <Group label="Roughly how many products will you sell?">
                  <Pills values={BRIEF_PRODUCT_COUNTS} value={form.product_count} onChange={(v) => set('product_count', v)} />
                </Group>
              )}

              <Group label="Do you have the text and photos for the website?">
                <Pills values={BRIEF_CONTENT_READY} value={form.content_ready} onChange={(v) => set('content_ready', v)} />
              </Group>

              <Group label="Do you have a domain name (e.g. yourbusiness.com)?">
                <Pills values={BRIEF_DOMAIN} value={form.has_domain} onChange={(v) => set('has_domain', v)} />
                {hasDomain && (
                  <input value={form.domain_name} onChange={(e) => set('domain_name', e.target.value)} placeholder="yourbusiness.com" className={inputCls('mt-3')} />
                )}
              </Group>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <Group label="Websites you like" hint="Share links to sites you love (any industry) and tell me exactly what you like — the colours, layout, fonts, photos, how it feels.">
                <div className="space-y-4">
                  {form.inspirations.map((insp, i) => (
                    <div key={i} className="rounded-md border border-[var(--steel)] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <MonoLabel className="text-[var(--mist)]">EXAMPLE {i + 1}</MonoLabel>
                        {form.inspirations.length > 1 && (
                          <button
                            onClick={() => set('inspirations', form.inspirations.filter((_, j) => j !== i))}
                            className="text-[var(--mist)] hover:text-[var(--danger)]"
                            aria-label="Remove example"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        value={insp.url}
                        onChange={(e) => set('inspirations', form.inspirations.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                        placeholder="https://"
                        className={inputCls()}
                      />
                      <textarea
                        rows={3}
                        value={insp.notes}
                        onChange={(e) => set('inspirations', form.inspirations.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))}
                        placeholder="What do you like about it?"
                        className={inputCls('resize-y')}
                      />
                    </div>
                  ))}
                  {form.inspirations.length < 5 && (
                    <button
                      onClick={() => set('inspirations', [...form.inspirations, { url: '', notes: '' }])}
                      className="inline-flex items-center gap-2 mono-label text-[var(--silver)] hover:text-[var(--white)]"
                    >
                      <Plus className="w-4 h-4" /> Add another
                    </button>
                  )}
                </div>
              </Group>

              <Group label="Which styles fit your brand?" hint="Pick all that apply.">
                <Chips values={BRIEF_STYLES} selected={form.styles} onToggle={(v) => toggle('styles', v)} />
              </Group>

              <Field label="Brand colours" value={form.colors} onChange={(v) => set('colors', v)} placeholder="e.g. navy and gold, or ‘use my logo colours’" />
              <Area label="Describe the look you want" hint="Paint me a picture — how should people feel when they land on your site?" rows={5} value={form.look_notes} onChange={(v) => set('look_notes', v)} />
              <Area label="Anything you don’t like?" rows={3} value={form.dislikes} onChange={(v) => set('dislikes', v)} placeholder="Colours, styles or websites to avoid" />

              <Group label="Upload files" hint="Your logo, brand guide, photos, or screenshots of designs you like. Images or PDFs, up to 10MB each.">
                <Uploader token={token} files={form.attachments} onChange={(v) => set('attachments', v)} />
              </Group>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10">
              <p className="text-[var(--mist)]">
                Beyond the website, I also help businesses look their best everywhere. Tick anything
                you&apos;d like included — I&apos;ll add it to your proposal.
              </p>

              <Group label="Do you already have a logo?">
                <Pills values={BRIEF_HAS_LOGO} value={form.has_logo} onChange={(v) => set('has_logo', v)} />
              </Group>

              <Group label="Additional services">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.addons.map((a) => (
                    <Card
                      key={a.key}
                      multi
                      active={form.addons.includes(a.key)}
                      onClick={() => toggle('addons', a.key)}
                      title={a.label}
                      description={a.description}
                      badge={a.recurring ? 'MONTHLY' : undefined}
                    />
                  ))}
                </div>
              </Group>

              {showcase.length > 0 && (
                <Group label="Some of my design work">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {showcase.map((d) => (
                      <Link key={d.slug} href={`/designs/${d.slug}`} target="_blank" className="group block">
                        <div className="aspect-square rounded-md overflow-hidden border border-[var(--steel)] bg-[var(--graphite)]">
                          {d.cover_image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.cover_image_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          )}
                        </div>
                        <p className="mt-2 text-xs text-[var(--mist)] group-hover:text-[var(--platinum)] truncate">{d.title}</p>
                      </Link>
                    ))}
                  </div>
                </Group>
              )}

              <Area label="Anything else about these services?" rows={3} value={form.extras_notes} onChange={(v) => set('extras_notes', v)} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10">
              <Group label="What budget do you have in mind? *" error={errors.budget_range}>
                <Pills values={options.budget_ranges} value={form.budget_range} onChange={(v) => set('budget_range', v)} />
              </Group>
              <Group label="When do you need it? *" error={errors.timeline}>
                <Pills
                  values={BRIEF_TIMELINES.map((t) => t.key)}
                  labels={Object.fromEntries(BRIEF_TIMELINES.map((t) => [t.key, t.label]))}
                  value={form.timeline}
                  onChange={(v) => set('timeline', v)}
                />
                <input
                  value={form.deadline_notes}
                  onChange={(e) => set('deadline_notes', e.target.value)}
                  placeholder="Any specific date or event? (optional)"
                  className={inputCls('mt-3')}
                />
              </Group>
              <Area label="Anything else I should know?" rows={4} value={form.anything_else} onChange={(v) => set('anything_else', v)} />

              <div>
                <MonoLabel>QUICK CHECK</MonoLabel>
                <dl className="mt-4 divide-y divide-[var(--steel)] border-y border-[var(--steel)]">
                  {[
                    { label: 'Name', value: form.full_name, step: 0 },
                    { label: 'Business', value: form.business_name, step: 1 },
                    { label: 'Website', value: options.site_types.find((t) => t.key === form.site_type)?.label, step: 2 },
                    { label: 'Pages', value: [...form.pages, ...form.other_pages.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)].join(', '), step: 2 },
                    { label: 'Files', value: form.attachments.length ? `${form.attachments.length} uploaded` : '', step: 3 },
                    { label: 'Extras', value: form.addons.map((k) => options.addons.find((a) => a.key === k)?.label ?? k).join(', '), step: 4 },
                  ].map((row) => (
                    <div key={row.label} className="py-3 flex items-start justify-between gap-4">
                      <dt className="mono-label text-[var(--mist)] shrink-0">{row.label}</dt>
                      <dd className="text-sm text-[var(--platinum)] text-right flex-1 break-words">
                        {row.value || '—'}
                        <button onClick={() => go(row.step)} className="ml-3 mono-label text-[var(--silver)] hover:text-[var(--white)]">
                          Edit
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {submitError && <ErrorLine>{submitError}</ErrorLine>}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                onClick={() => go(step - 1)}
                className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="group inline-flex items-center gap-2 rounded-md border border-[var(--steel)] hover:border-[var(--silver)] px-6 py-3 text-sm font-medium text-[var(--platinum)] transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 sm:flex-none rounded-md bg-[var(--white)] text-[var(--obsidian)] px-8 py-4 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send my brief'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Uploads ----------

function Uploader({
  token,
  files,
  onChange,
}: {
  token: string;
  files: BriefAnswers['attachments'];
  onChange: (v: BriefAnswers['attachments']) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(list: FileList | null) {
    if (!list?.length) return;
    setError('');
    const room = BRIEF_MAX_FILES - files.length;
    const picked = Array.from(list).slice(0, room);
    if (list.length > room) setError(`You can upload up to ${BRIEF_MAX_FILES} files.`);

    setBusy(true);
    const added: BriefAnswers['attachments'] = [];
    const supabase = createClient();
    for (const file of picked) {
      if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
        setError(`${file.name}: only images and PDFs are allowed.`);
        continue;
      }
      if (file.size > BRIEF_MAX_FILE_BYTES) {
        setError(`${file.name} is larger than 10MB.`);
        continue;
      }
      try {
        const res = await fetch(`/api/brief/${token}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.path) throw new Error(json.error || 'Upload failed.');
        const { error: upErr } = await supabase.storage
          .from(BRIEF_BUCKET)
          .uploadToSignedUrl(json.path, json.token, file, { contentType: file.type });
        if (upErr) throw upErr;
        added.push({ path: json.path, name: file.name, type: file.type, size: file.size });
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : 'upload failed'}`);
      }
    }
    if (added.length) onChange([...files, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      {files.length < BRIEF_MAX_FILES && (
        <div
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !busy && inputRef.current?.click()}
          className="border-2 border-dashed border-[var(--steel)] rounded-md p-8 text-center cursor-pointer hover:border-[var(--silver)] transition-colors"
        >
          {busy ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--silver)]" />
              <p className="text-sm text-[var(--mist)]">Uploading…</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--mist)] mx-auto mb-3" />
              <p className="text-sm text-[var(--mist)]">
                Drop files here or <span className="text-[var(--platinum)] underline">browse</span>
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-3 rounded-md border border-[var(--steel)] px-3 py-2">
              <FileText className="w-4 h-4 text-[var(--mist)] shrink-0" />
              <span className="text-sm text-[var(--platinum)] truncate flex-1">{f.name}</span>
              <span className="mono-label text-[var(--mist)] shrink-0">{Math.max(1, Math.round(f.size / 1024))} KB</span>
              <button
                onClick={() => onChange(files.filter((x) => x.path !== f.path))}
                className="text-[var(--mist)] hover:text-[var(--danger)]"
                aria-label={`Remove ${f.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

// ---------- Inputs ----------

function inputCls(extra?: string) {
  return cn(
    'w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none',
    extra
  );
}

function Group({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <MonoLabel className="block">{label.toUpperCase()}</MonoLabel>
      {hint && <p className="mt-1 text-sm text-[var(--mist)]">{hint}</p>}
      <div className="mt-4">{children}</div>
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function Card({
  title,
  description,
  active,
  onClick,
  multi,
  badge,
}: {
  title: string;
  description?: string;
  active: boolean;
  onClick: () => void;
  multi?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'text-left rounded-md border p-4 transition-colors flex gap-3',
        active
          ? 'border-[var(--silver)] bg-[var(--graphite)]'
          : 'border-[var(--steel)] hover:border-[var(--mist)]'
      )}
    >
      <span
        className={cn(
          'mt-1 w-4 h-4 shrink-0 border flex items-center justify-center',
          multi ? 'rounded-sm' : 'rounded-full',
          active ? 'border-[var(--platinum)] bg-[var(--platinum)] text-[var(--obsidian)]' : 'border-[var(--mist)]'
        )}
      >
        {active && <Check className="w-3 h-3" />}
      </span>
      <span className="min-w-0">
        <span className={cn('font-display text-lg block', active ? 'text-[var(--platinum)]' : 'text-[var(--platinum)]/90')}>
          {title}
          {badge && <span className="ml-2 mono-label text-[var(--mist)] align-middle">{badge}</span>}
        </span>
        {description && <span className="mt-1 block text-sm text-[var(--mist)]">{description}</span>}
      </span>
    </button>
  );
}

function Chips({
  values,
  labels,
  selected,
  onToggle,
}: {
  values: readonly string[];
  labels?: Record<string, string>;
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => {
        const on = selected.includes(v);
        return (
          <button
            key={v}
            onClick={() => onToggle(v)}
            aria-pressed={on}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors',
              on
                ? 'border-[var(--silver)] text-[var(--platinum)] bg-[var(--graphite)]'
                : 'border-[var(--steel)] text-[var(--mist)] hover:border-[var(--mist)]'
            )}
          >
            {on && <Check className="w-3.5 h-3.5" />}
            {labels?.[v] ?? v}
          </button>
        );
      })}
    </div>
  );
}

function Pills({
  values,
  labels,
  value,
  onChange,
}: {
  values: readonly string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn(
            'rounded-md border px-4 py-2.5 text-sm transition-colors',
            value === v
              ? 'border-[var(--silver)] text-[var(--platinum)] bg-[var(--graphite)]'
              : 'border-[var(--steel)] text-[var(--mist)] hover:border-[var(--mist)]'
          )}
        >
          {labels?.[v] ?? v}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  const id = `brief-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mono-label block mb-2">
        {label.toUpperCase()}
      </label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls()} />
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function Area({
  label,
  hint,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
}) {
  const id = `brief-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mono-label block">
        {label.toUpperCase()}
      </label>
      {hint && <p className="mt-1 text-sm text-[var(--mist)]">{hint}</p>}
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls('mt-2 resize-y')} />
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-[var(--danger)]">{children}</p>;
}
