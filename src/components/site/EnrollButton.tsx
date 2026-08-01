'use client';

import { useState } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { formatNaira } from '@/lib/format';

interface Payment {
  bank: string;
  account: string;
  name: string;
  whatsapp: string;
}

function waLink(number: string, text: string) {
  let digits = (number || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '234' + digits.slice(1);
  else if (!digits.startsWith('234') && digits.length === 10) digits = '234' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function EnrollButton({
  courseTitle,
  price,
  payment,
}: {
  courseTitle: string;
  price: number;
  payment: Payment;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(payment.account).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const waText = `Hi Aniekan, I just paid ${formatNaira(price)} for the "${courseTitle}" course. Here's my payment receipt:`;

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
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[var(--steel)] bg-[var(--graphite)] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono-label text-[var(--mist)]">SECURE YOUR SPOT</p>
                <h3 className="mt-2 font-display text-2xl text-[var(--platinum)]">{courseTitle}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--mist)] hover:text-[var(--platinum)]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-6 mono-label text-[var(--mist)]">AMOUNT TO PAY</p>
            <p className="font-display text-4xl text-[var(--platinum)]">{formatNaira(price)}</p>

            <div className="mt-6 rounded-md border border-[var(--steel)] bg-[var(--obsidian)] p-4 space-y-3">
              <Line label="Bank" value={payment.bank} />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="mono-label text-[var(--mist)]">Account number</p>
                  <p className="text-lg text-[var(--platinum)] tracking-wide">{payment.account}</p>
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
              href={waLink(payment.whatsapp, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-md bg-[#25D366] text-black px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              Send receipt on WhatsApp
            </a>
            <p className="mt-3 text-center mono-label text-[var(--mist)]">
              WHATSAPP — {payment.whatsapp}
            </p>
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
