// Run with: npm test  (Node's built-in test runner, no extra dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BRIEF_PRICING,
  briefAnswersSchema,
  estimateBrief,
  normalizePricing,
  publicOptions,
  whatsAppTo,
} from '../src/lib/brief.ts';
import { escapeHtml } from '../src/lib/html.ts';
import { SITE_SETTINGS, mergeSettings, parsePipeLines, parseToolbox } from '../src/lib/data/site.ts';
import { enrolApiSchema, inquiryApiSchema } from '../src/lib/schemas.ts';

const baseAnswers = {
  full_name: 'Tolu Adeyemi',
  email: 'tolu@example.com',
  phone: '08031234567',
  business_name: 'Tolu Bakes',
  industry: 'Food',
  business_description: 'x'.repeat(90),
  audience: 'Young professionals in Lagos',
  site_type: 'ecommerce',
  pages: ['Home', 'About', 'Shop / Products', 'Contact', 'Blog / News', 'FAQ', 'Testimonials / Reviews'],
  other_pages: 'Custom orders\nGallery',
  features: ['payments', 'whatsapp'],
  addons: ['logo', 'care'],
  budget_range: '₦500k – ₦1M',
  timeline: 'asap',
};

test('brief estimate: base + extra pages + features + add-ons + rush, monthly kept separate', () => {
  const est = estimateBrief(briefAnswersSchema.parse(baseAnswers), DEFAULT_BRIEF_PRICING);
  assert.equal(est.pageCount, 9);
  // 600k + 4×25k + 80k + 5k + 80k = 865k, +25% rush = 1,081,250
  assert.equal(est.oneOff.naira, 1_081_250);
  assert.equal(est.monthly.naira, 30_000);
  assert.equal(est.oneOff.usd, 1638);
});

test('brief estimate: no rush fee on a flexible timeline', () => {
  const est = estimateBrief(briefAnswersSchema.parse({ ...baseAnswers, timeline: 'flexible' }), DEFAULT_BRIEF_PRICING);
  assert.equal(est.oneOff.naira, 865_000);
  assert.ok(!est.lines.some((l) => l.label.startsWith('Rush')));
});

test('brief answers: required fields are enforced', () => {
  const res = briefAnswersSchema.safeParse({ ...baseAnswers, business_description: 'too short' });
  assert.equal(res.success, false);
});

test('pricing: garbage in storage falls back to defaults; client options carry no prices', () => {
  assert.deepEqual(normalizePricing(null), DEFAULT_BRIEF_PRICING);
  assert.deepEqual(normalizePricing('nonsense'), DEFAULT_BRIEF_PRICING);
  const p = normalizePricing({ rush_percent: 10, addons: [{ key: 'x', label: 'X', naira: 5, recurring: true }] });
  assert.equal(p.rush_percent, 10);
  assert.equal(p.addons[0].recurring, true);
  assert.equal(p.addons[0].usd, 0);
  assert.ok(!JSON.stringify(publicOptions(DEFAULT_BRIEF_PRICING)).includes('naira'));
});

test('whatsAppTo: local Nigerian numbers become +234', () => {
  assert.match(whatsAppTo('0803 123 4567', 'hi'), /^https:\/\/wa\.me\/2348031234567\?text=hi$/);
  assert.match(whatsAppTo('+2348031234567', 'hi'), /wa\.me\/2348031234567/);
});

test('escapeHtml neutralises markup from visitors', () => {
  assert.equal(escapeHtml('<a href="x">hi</a> & \'y\''), '&lt;a href=&quot;x&quot;&gt;hi&lt;/a&gt; &amp; &#39;y&#39;');
  assert.equal(escapeHtml(null), '');
});

test('settings: blank payment details fall back to defaults, blank URLs mean unset', () => {
  const s = mergeSettings(
    new Map<string, unknown>([
      ['payment_account', ''],
      ['payment_bank', '  '],
      ['github_url', ''],
      ['linkedin_url', 'https://linkedin.com/in/x'],
      ['stats', { products_shipped: '10+' }],
      ['budget_options', []],
      ['hero_headline', 'Custom headline'],
    ])
  );
  assert.equal(s.payment_account, SITE_SETTINGS.payment_account);
  assert.equal(s.payment_bank, SITE_SETTINGS.payment_bank);
  assert.equal(s.github_url, null);
  assert.equal(s.linkedin_url, 'https://linkedin.com/in/x');
  assert.equal(s.stats.products_shipped, '10+');
  assert.equal(s.stats.years_building, SITE_SETTINGS.stats.years_building);
  assert.deepEqual(s.budget_options, SITE_SETTINGS.budget_options);
  assert.equal(s.hero_headline, 'Custom headline');
});

test('about text parsers', () => {
  assert.deepEqual(parsePipeLines('2022 | Started\n\n2024|Shipped | twice'), [
    ['2022', 'Started'],
    ['2024', 'Shipped | twice'],
  ]);
  assert.deepEqual(parseToolbox('Design: Figma, UI\nAI'), [
    { group: 'Design', items: ['Figma', 'UI'] },
    { group: 'AI', items: [] },
  ]);
});

test('public form schemas', () => {
  assert.equal(
    inquiryApiSchema.safeParse({
      full_name: 'A',
      email: 'a@b.co',
      project_type: 'Business website',
      description: 'I need a website for my bakery with online orders.',
    }).success,
    true
  );
  assert.equal(enrolApiSchema.safeParse({ course_id: 'not-a-uuid', full_name: 'Ab', phone: '0803123' }).success, false);
  assert.equal(
    enrolApiSchema.safeParse({ course_id: '6f1c2b7e-8a3d-4c5e-9f10-1a2b3c4d5e6f', full_name: 'Ada Obi', phone: '08031234567', email: '' }).success,
    true
  );
});
