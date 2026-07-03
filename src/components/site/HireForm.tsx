'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { PulseLine } from '@/components/site/PulseLine';
import { cn } from '@/lib/utils';
import type {
  InquiryProjectType,
  InquiryBudget,
  InquiryTimeline,
  SiteSettings,
} from '@/types';

const PROJECT_TYPES: InquiryProjectType[] = [
  'AI Product',
  'Full-Stack Build',
  'MVP / Zero-to-One',
  'Consulting',
  'Full-Time Role',
  'Other',
];

const BUDGETS: InquiryBudget[] = ['<$2k', '$2k–$5k', '$5k–$15k', '$15k–$50k', '$50k+'];
const TIMELINES: InquiryTimeline[] = ['ASAP', '2–4 weeks', '1–3 months', 'Flexible'];
const HOW_FOUND = ['GitHub', 'X', 'LinkedIn', 'Referral', 'Search', 'Other'];

interface FormState {
  project_type: InquiryProjectType | '';
  budget_range: InquiryBudget | 'Salary role' | '';
  timeline: InquiryTimeline | '';
  description: string;
  full_name: string;
  email: string;
  company: string;
  role_at_company: string;
  how_found: string;
}

const EMPTY: FormState = {
  project_type: '',
  budget_range: '',
  timeline: '',
  description: '',
  full_name: '',
  email: '',
  company: '',
  role_at_company: '',
  how_found: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function HireForm({ settings }: { settings: SiteSettings }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const mountedAt = useRef(Date.now());

  const isSalaryRole = form.project_type === 'Full-Time Role';

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1 && !form.project_type) e.project_type = 'Pick what you need so I can scope it.';
    if (s === 2) {
      if (!isSalaryRole && !form.budget_range) e.budget_range = 'Choose a budget range.';
      if (!form.timeline) e.timeline = 'Choose a timeline.';
      if (form.description.trim().length < 30)
        e.description = 'Give me at least a sentence or two (30+ characters).';
    }
    if (s === 3) {
      if (!form.full_name.trim()) e.full_name = 'Tell me your name.';
      if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email so I can reply.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function mailtoFallback(payload: Record<string, unknown>) {
    try {
      const body = [
        `Name: ${payload.full_name}`,
        `Email: ${payload.email}`,
        `Company: ${payload.company ?? '—'}`,
        `Role: ${payload.role_at_company ?? '—'}`,
        `Project type: ${payload.project_type}`,
        `Budget: ${payload.budget_range ?? '—'}`,
        `Timeline: ${payload.timeline ?? '—'}`,
        `How found: ${payload.how_found ?? '—'}`,
        '',
        String(payload.description ?? ''),
      ].join('\n');
      window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(
        `New inquiry — ${payload.project_type}`
      )}&body=${encodeURIComponent(body)}`;
    } catch {
      /* ignore */
    }
  }

  async function submit() {
    setSubmitError('');
    if (honeypot) return;
    if (Date.now() - mountedAt.current < 3000) {
      setSubmitError('That was a little too fast — take a breath and try again.');
      return;
    }
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      role_at_company: form.role_at_company.trim() || null,
      project_type: form.project_type,
      budget_range: isSalaryRole ? 'Salary role' : form.budget_range || null,
      timeline: form.timeline || null,
      description: form.description.trim(),
      how_found: form.how_found || null,
      website: honeypot, // honeypot passthrough
      elapsed_ms: Date.now() - mountedAt.current,
    };

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
    } catch {
      // API unavailable (e.g. backend not yet configured): fall back to email
      // so no inquiry is lost, and still confirm to the visitor.
      mailtoFallback(payload);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  const summary = useMemo(
    () => [
      { label: 'Need', value: form.project_type, step: 1 },
      { label: 'Budget', value: isSalaryRole ? 'Salary role' : form.budget_range, step: 2 },
      { label: 'Timeline', value: form.timeline, step: 2 },
      { label: 'Details', value: form.description, step: 2 },
      { label: 'Name', value: form.full_name, step: 3 },
      { label: 'Email', value: form.email, step: 3 },
      { label: 'Company', value: form.company || '—', step: 3 },
      { label: 'How found', value: form.how_found || '—', step: 3 },
    ],
    [form, isSalaryRole]
  );

  if (done) {
    return (
      <section className="min-h-screen flex items-center">
        <div className="max-w-[700px] mx-auto px-6 text-center py-32">
          <PulseLine className="mb-10" />
          <h1 className="font-display text-5xl sm:text-6xl text-[var(--platinum)]">Received.</h1>
          <p className="mt-6 text-lg text-[var(--mist)]">
            I read every inquiry personally. You&apos;ll hear from me within 24 hours — check{' '}
            <span className="text-[var(--platinum)]">{form.email}</span>.
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] min-h-screen">
      <aside className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between bg-[var(--obsidian)] border-b lg:border-b-0 lg:border-r border-[var(--steel)] px-6 lg:px-12 pt-32 pb-12">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[var(--platinum)]">
            Let&apos;s build something that matters.
          </h1>
          <div className="mt-8 inline-flex items-center gap-2">
            <span className="pulse-dot" aria-hidden="true" />
            <MonoLabel>
              AVAILABILITY — {settings.availability_status === 'Available' ? 'OPEN' : settings.availability_status.toUpperCase()} · RESPONDS &lt; 24H
            </MonoLabel>
          </div>
          <ul className="mt-10 space-y-3">
            {['Direct line — no account managers', 'Reply within 24 hours', 'NDA-friendly'].map(
              (line) => (
                <li key={line} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[var(--silver)] shrink-0" />
                  <MonoLabel className="text-[var(--mist)]">{line}</MonoLabel>
                </li>
              )
            )}
          </ul>
        </div>
        <PulseLine className="hidden lg:block mt-12 max-w-xs" />
      </aside>

      <div className="px-6 lg:px-16 pt-28 lg:pt-32 pb-20">
        <div className="max-w-xl">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <MonoLabel>STEP {String(step).padStart(2, '0')} / 04</MonoLabel>
            </div>
            <div className="h-px bg-[var(--steel)] relative">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--silver)] transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div>
              <MonoLabel>WHAT DO YOU NEED?</MonoLabel>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => set('project_type', t)}
                    className={cn(
                      'text-left rounded-md border p-4 transition-colors',
                      form.project_type === t
                        ? 'border-[var(--silver)] bg-[var(--graphite)] text-[var(--platinum)]'
                        : 'border-[var(--steel)] text-[var(--mist)] hover:border-[var(--mist)]'
                    )}
                  >
                    <span className="font-display text-lg">{t}</span>
                  </button>
                ))}
              </div>
              {errors.project_type && <ErrorLine>{errors.project_type}</ErrorLine>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <MonoLabel>BUDGET</MonoLabel>
                {isSalaryRole ? (
                  <p className="mt-4 text-sm text-[var(--mist)]">
                    Full-time role — we&apos;ll talk compensation directly. No budget needed here.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <Pill key={b} active={form.budget_range === b} onClick={() => set('budget_range', b)}>
                        {b}
                      </Pill>
                    ))}
                  </div>
                )}
                {errors.budget_range && <ErrorLine>{errors.budget_range}</ErrorLine>}
              </div>

              <div>
                <MonoLabel>TIMELINE</MonoLabel>
                <div className="mt-4 flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <Pill key={t} active={form.timeline === t} onClick={() => set('timeline', t)}>
                      {t}
                    </Pill>
                  ))}
                </div>
                {errors.timeline && <ErrorLine>{errors.timeline}</ErrorLine>}
              </div>

              <div>
                <label htmlFor="description" className="mono-label block">
                  TELL ME ABOUT IT
                </label>
                <p className="mt-1 text-sm text-[var(--mist)]">
                  What are you building, who is it for, and what does success look like?
                </p>
                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="mt-3 w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none resize-none"
                  placeholder="A few sentences is plenty."
                />
                {errors.description && <ErrorLine>{errors.description}</ErrorLine>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <MonoLabel>ABOUT YOU</MonoLabel>
              <Field label="Full name *" value={form.full_name} onChange={(v) => set('full_name', v)} error={errors.full_name} placeholder="Your name" />
              <Field label="Email *" value={form.email} onChange={(v) => set('email', v)} error={errors.email} placeholder="you@company.com" type="email" />
              <Field label="Company" value={form.company} onChange={(v) => set('company', v)} placeholder="Optional" />
              <Field label="Your role" value={form.role_at_company} onChange={(v) => set('role_at_company', v)} placeholder="Optional" />
              <div>
                <label htmlFor="how_found" className="mono-label block mb-2">
                  HOW DID YOU FIND ME?
                </label>
                <select
                  id="how_found"
                  value={form.how_found}
                  onChange={(e) => set('how_found', e.target.value)}
                  className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] focus:border-[var(--silver)] focus:outline-none"
                >
                  <option value="">Select…</option>
                  {HOW_FOUND.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <MonoLabel>REVIEW &amp; SEND</MonoLabel>
              <dl className="mt-6 divide-y divide-[var(--steel)] border-y border-[var(--steel)]">
                {summary.map((row) => (
                  <div key={row.label} className="py-3 flex items-start justify-between gap-4">
                    <dt className="mono-label text-[var(--mist)] shrink-0">{row.label}</dt>
                    <dd className="text-sm text-[var(--platinum)] text-right flex-1 break-words">
                      {row.value || '—'}
                      <button
                        onClick={() => setStep(row.step)}
                        className="ml-3 mono-label text-[var(--silver)] hover:text-[var(--white)]"
                      >
                        Edit
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
              {submitError && <ErrorLine>{submitError}</ErrorLine>}
            </div>
          )}

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
          />

          <div className="mt-10 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={back}
                className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
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
                className="w-full rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-4 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send inquiry'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'mono-label rounded-md border px-4 py-2.5 transition-colors',
        active
          ? 'border-[var(--silver)] text-[var(--platinum)] bg-[var(--graphite)]'
          : 'border-[var(--steel)] text-[var(--mist)] hover:border-[var(--mist)]'
      )}
    >
      {children}
    </button>
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
  const id = label.replace(/\W+/g, '-').toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="mono-label block mb-2">
        {label.toUpperCase()}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--steel)] bg-[var(--graphite)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none"
      />
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-[var(--danger)]">{children}</p>;
}
