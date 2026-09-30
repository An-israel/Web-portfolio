import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { DEFAULT_BRIEF_PRICING, briefAnswersSchema } from '../src/lib/brief.ts';
import { briefFileName, briefMarkdown, briefPdf, briefSections } from '../src/lib/brief-export.ts';

const answers = briefAnswersSchema.parse({
  full_name: 'Tolu Adeyemi',
  email: 'tolu@example.com',
  phone: '08031234567',
  business_name: 'Tolu Bakes',
  industry: 'Food',
  business_description: 'We bake custom cakes for weddings and birthdays across Lagos.\n\nStarted in 2019 from our kitchen.',
  audience: 'Young professionals and event planners',
  site_type: 'ecommerce',
  pages: ['Home', 'Shop / Products'],
  other_pages: 'Custom orders',
  features: ['payments'],
  inspirations: [{ url: 'https://example.com', notes: 'Pastel colours' }, { url: '', notes: '' }],
  attachments: [{ path: 'b1/logo.png', name: 'logo.png', type: 'image/png', size: 1200 }],
  addons: ['logo'],
  budget_range: '₦500k – ₦1M',
  timeline: 'asap',
});
const meta = { clientName: 'Tolu', submittedAt: '2026-09-29T10:00:00Z' };

test('export skips unanswered questions and labels choices', () => {
  const sections = briefSections(answers, { pricing: DEFAULT_BRIEF_PRICING });
  const all = sections.flatMap((s) => s.items.map((i) => i.label));
  assert.ok(!all.includes('Tagline'), 'empty answers are left out');
  assert.ok(!all.some((l) => l.startsWith('Inspiration 2')), 'blank inspiration rows are left out');
  const site = sections.find((s) => s.title === 'The website')!;
  assert.equal(site.items.find((i) => i.label === 'Type')!.value, 'E-commerce / online store');
  assert.ok(!sections.some((s) => s.title.startsWith('Price')), 'pricing is off by default');
});

test('markdown brief has every answer, file links, and pricing only on request', () => {
  const md = briefMarkdown(answers, meta, {
    pricing: DEFAULT_BRIEF_PRICING,
    fileUrls: { 'b1/logo.png': 'https://files.example/logo.png' },
  });
  assert.match(md, /^# Project brief — Tolu Bakes/);
  assert.match(md, /> Started in 2019 from our kitchen\./);
  assert.match(md, /- Custom orders/);
  assert.match(md, /logo\.png — https:\/\/files\.example\/logo\.png/);
  assert.match(md, /\*\*Budget:\*\* ₦500k – ₦1M/);
  assert.doesNotMatch(md, /Price estimate/);
  const withPrice = briefMarkdown(answers, meta, { pricing: DEFAULT_BRIEF_PRICING, includePricing: true });
  assert.match(withPrice, /## Price estimate \(private\)/);
  assert.equal(briefFileName(answers, meta, 'pdf'), 'brief-tolu-bakes.pdf');
});

test('PDF is generated and readable', async () => {
  const blob = await briefPdf(answers, meta, { pricing: DEFAULT_BRIEF_PRICING });
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  assert.ok(bytes.length > 2000);
  if (process.env.SAVE_SAMPLE_PDF) writeFileSync(process.env.SAVE_SAMPLE_PDF, bytes);
});
