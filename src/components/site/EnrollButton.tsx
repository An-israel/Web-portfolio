'use client';

import { useEffect, useState } from 'react';
import { X, Copy, Check, MessageCircle, Loader2 } from 'lucide-react';
import { formatNaira } from '@/lib/format';
import { whatsAppTo } from '@/lib/brief';

interface Payment {
  bank: string;
  account: string;
  name: string;
  whatsapp: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnrollButton({
  courseId,
  courseTitle,
  price,
  payment,
}: {
  courseId: string;
  courseTitle: string;
  price: number;
  payment: Payment;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'pay'>('details');
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', website: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Esc closes; the page behind doesn't scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function copy() {
    navigator.clipboard.writeText(payment.account).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.full_name.trim().length < 2) return setError('Enter your full name.');
    if (form.phone.replace(/\D/g, '').length < 7) return setError('Enter your WhatsApp number.');
    if (form.email && !EMAIL_RE.test(form.email)) return setError('Enter a valid email, or leave it blank.');
    setSaving(true);
    try {
      await fetch('/api/enrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, ...form }),
      });
    } catch {
      /* never block payment on a network hiccup — the WhatsApp receipt still reaches me */
    }
    setSaving(false);
    setStep('pay');
  }

  const waText = `Hi Aniekan, I'm ${form.full_name || '…'} and I just paid ${formatNaira(price)} for the "${courseTitle}" course. Here's my payment receipt:`;
  const input =
    'w-full rounded-md border border-[var(--steel)] bg-[var(--obsidian)] px-4 py-3 text-sm text-[var(--platinum)] placeholder:text-[var(--mist)] focus:border-[var(--silver)] focus:outline-none';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Enrol — {formatNaira(price)}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Enrol in ${courseTitle}`}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[var(--steel)] bg-[var(--graphite)] p-6 sm:p-8 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono-label text-[var(--mist)]">
                  {step === 'details' ? 'STEP 1 OF 2 — YOUR DETAILS' : 'STEP 2 OF 2 — PAYMENT'}
                </p>
                <h3 className="mt-2 font-display text-2xl text-[var(--platinum)]">{courseTitle}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--mist)] hover:text-[var(--platinum)]"
                aria-label="Close"
                autoFocus
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'details' ? (
              <form onSubmit={saveDetails} className="mt-6 space-y-3">
                <input className={input} placeholder="Full name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} autoComplete="name" />
                <input className={input} placeholder="WhatsApp number *" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                <input className={input} placeholder="Email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--white)] text-[var(--obsidian)] px-6 py-3.5 text-sm font-semibold disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Continue to payment
                </button>
                <p className="text-xs text-[var(--mist)]">So I can confirm your spot and add you to the class.</p>
              </form>
            ) : (
              <>
                <p className="mt-6 mono-label text-[var(--mist)]">AMOUNT TO PAY</p>
                <p className="font-display text-4xl text-[var(--platinum)]">{formatNaira(price)}</p>

                <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--obsidian)] p-4 space-y-3">
                  <Line label="Bank" value={payment.bank} />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mono-label text-[var(--mist)]">Account number</p>
                      <p className="text-lg text-[var(--platinum)] tracking-wide select-all">{payment.account}</p>
                    </div>
                    <button
                      onClick={copy}
                      className="inline-flex items-center gap-1.5 mono-label rounded-md border border-[var(--steel)] px-3 py-2 text-[var(--mist)] hover:text-[var(--platinum)] hover:border-[var(--silver)]"
                    >
                      {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <Line label="Account name" value={payment.name} />
                </div>

                <p className="mt-5 text-sm text-[var(--mist)] leading-relaxed">
                  After paying, <span className="text-[var(--platinum)]">screenshot your receipt</span> and
                  send it to me on WhatsApp so I can confirm your slot and get you started.
                </p>

                <a
                  href={whatsAppTo(payment.whatsapp, waText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full rounded-md bg-[#25D366] text-black px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send receipt on WhatsApp
                </a>
                <p className="mt-3 text-center mono-label text-[var(--mist)]">WHATSAPP — {payment.whatsapp}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-label text-[var(--mist)]">{label}</p>
      <p className="text-sm text-[var(--platinum)]">{value}</p>
    </div>
  );
}
