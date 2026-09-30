import {
  BRIEF_TIMELINES,
  countPages,
  estimateBrief,
  formatUsd,
  type BriefAnswers,
  type BriefPricing,
} from '@/lib/brief';
import { formatNaira } from '@/lib/format';

// ------------------------------------------------------------
// Turns a submitted client brief into a readable document, used
// by the PDF and Markdown downloads in the admin. Plain module.
// ------------------------------------------------------------

export interface ExportItem {
  label: string;
  value: string | string[];
  /** Long free text — rendered as a paragraph, not a label/value row. */
  long?: boolean;
}

export interface ExportSection {
  title: string;
  items: ExportItem[];
}

export interface BriefExportMeta {
  clientName: string;
  submittedAt: string | null;
}

export interface BriefExportOptions {
  pricing: BriefPricing | null;
  /** Adds the private price breakdown. Leave off for anything you might forward. */
  includePricing?: boolean;
  /** Signed download links for uploaded files, keyed by storage path. */
  fileUrls?: Record<string, string>;
}

const labelOf = (list: { key: string; label: string }[] | undefined, key: string) =>
  list?.find((i) => i.key === key)?.label ?? key;

/** Drops empty values so the document only shows what the client actually answered. */
function clean(items: ExportItem[]): ExportItem[] {
  return items.filter((i) => (Array.isArray(i.value) ? i.value.length > 0 : i.value.trim() !== ''));
}

export function briefSections(a: BriefAnswers, opts: BriefExportOptions): ExportSection[] {
  const p = opts.pricing;
  const timeline = labelOf([...BRIEF_TIMELINES], a.timeline);
  const pages = [
    ...a.pages,
    ...a.other_pages
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  ];

  const sections: ExportSection[] = [
    {
      title: 'Contact',
      items: clean([
        { label: 'Name', value: a.full_name },
        { label: 'Role', value: a.role },
        { label: 'Email', value: a.email },
        { label: 'Phone / WhatsApp', value: a.phone },
      ]),
    },
    {
      title: 'The business',
      items: clean([
        { label: 'Business name', value: a.business_name },
        { label: 'Industry', value: a.industry },
        { label: 'Tagline', value: a.tagline },
        { label: 'Location', value: a.location },
        { label: 'Years in business', value: a.years_in_business },
        { label: 'Current website', value: a.existing_website },
        { label: 'About the business', value: a.business_description, long: true },
        { label: 'Customers / audience', value: a.audience, long: true },
        { label: 'Social media', value: a.socials, long: true },
        { label: 'Competitors', value: a.competitors, long: true },
      ]),
    },
    {
      title: 'The website',
      items: clean([
        { label: 'Type', value: labelOf(p?.site_types, a.site_type) },
        { label: `Pages (${countPages(a)})`, value: pages },
        { label: 'Goals', value: a.goals },
        { label: 'Features', value: a.features.map((k) => labelOf(p?.features, k)) },
        { label: 'Number of products', value: a.product_count },
        { label: 'Text & photos ready?', value: a.content_ready },
        { label: 'Domain', value: [a.has_domain, a.domain_name].filter(Boolean).join(' — ') },
      ]),
    },
    {
      title: 'Look & feel',
      items: clean([
        ...a.inspirations
          .filter((i) => i.url || i.notes)
          .map((i, n) => ({
            label: `Inspiration ${n + 1}`,
            value: [i.url, i.notes].filter(Boolean).join('\n'),
            long: true,
          })),
        { label: 'Styles', value: a.styles },
        { label: 'Brand colours', value: a.colors },
        { label: 'The look they want', value: a.look_notes, long: true },
        { label: 'Avoid', value: a.dislikes, long: true },
        {
          label: 'Uploaded files',
          value: a.attachments.map((f) => {
            const url = opts.fileUrls?.[f.path];
            return url ? `${f.name} — ${url}` : f.name;
          }),
        },
      ]),
    },
    {
      title: 'Extra services',
      items: clean([
        { label: 'Has a logo?', value: a.has_logo },
        { label: 'Wants', value: a.addons.map((k) => labelOf(p?.addons, k)) },
        { label: 'Notes', value: a.extras_notes, long: true },
      ]),
    },
    {
      title: 'Budget & timeline',
      items: clean([
        { label: 'Budget', value: a.budget_range },
        { label: 'Timeline', value: timeline },
        { label: 'Deadline', value: a.deadline_notes },
        { label: 'Anything else', value: a.anything_else, long: true },
      ]),
    },
  ];

  if (opts.includePricing && p) {
    const est = estimateBrief(a, p);
    sections.push({
      title: 'Price estimate (private)',
      items: [
        ...est.lines.map((l) => ({
          label: l.label + (l.recurring ? ' (monthly)' : ''),
          value: `${formatNaira(l.naira)} / ${formatUsd(l.usd)}`,
        })),
        { label: 'One-off total', value: `${formatNaira(est.oneOff.naira)} / ${formatUsd(est.oneOff.usd)}` },
        ...(est.monthly.naira
          ? [{ label: 'Monthly total', value: `${formatNaira(est.monthly.naira)} / ${formatUsd(est.monthly.usd)}` }]
          : []),
      ],
    });
  }

  return sections.filter((s) => s.items.length > 0);
}

export function briefTitle(a: BriefAnswers, meta: BriefExportMeta): string {
  return `Project brief — ${a.business_name || meta.clientName}`;
}

export function briefFileName(a: BriefAnswers, meta: BriefExportMeta, ext: string): string {
  const base = (a.business_name || meta.clientName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `brief-${base || 'client'}.${ext}`;
}

function submittedLine(meta: BriefExportMeta): string {
  return meta.submittedAt
    ? `Submitted ${new Date(meta.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : '';
}

/** Markdown version — paste straight into Claude (or hand to a developer) as the build brief. */
export function briefMarkdown(a: BriefAnswers, meta: BriefExportMeta, opts: BriefExportOptions): string {
  const out: string[] = [`# ${briefTitle(a, meta)}`, ''];
  const sub = submittedLine(meta);
  if (sub) out.push(`_${sub}_`, '');
  for (const s of briefSections(a, opts)) {
    out.push(`## ${s.title}`, '');
    for (const i of s.items) {
      if (Array.isArray(i.value)) {
        out.push(`**${i.label}:**`, ...i.value.map((v) => `- ${v}`), '');
      } else if (i.long || i.value.includes('\n')) {
        out.push(`**${i.label}:**`, '', ...i.value.split('\n').map((l) => (l.trim() ? `> ${l}` : '>')), '');
      } else {
        out.push(`**${i.label}:** ${i.value}`, '');
      }
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** The same content as a PDF (built in the browser; jsPDF is loaded only when used). */
export function briefPdf(a: BriefAnswers, meta: BriefExportMeta, opts: BriefExportOptions): Promise<Blob> {
  return documentPdf({
    title: briefTitle(a, meta),
    subtitle: [submittedLine(meta), `Client: ${a.full_name}`].filter(Boolean).join('  ·  '),
    sections: briefSections(a, opts),
  });
}

/** Render titled sections of label/value items as a clean A4 PDF. */
export async function documentPdf(docSpec: {
  title: string;
  subtitle?: string;
  sections: ExportSection[];
}): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  // The built-in PDF fonts can't draw ₦ or emoji — spell the currency out, drop the rest.
  const safe = (t: string) =>
    t
      .replace(/₦\s?/g, 'NGN ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2022\u2026\u20AC]/g, '');

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const maxW = W - M * 2;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const write = (text: string, size: number, style: 'normal' | 'bold', color: number, gap = 4) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(safe(text), maxW) as string[];
    const lh = size * 1.35;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M, y + size);
      y += lh;
    }
    y += gap;
  };

  write(docSpec.title, 20, 'bold', 20, 2);
  if (docSpec.subtitle) write(docSpec.subtitle, 10, 'normal', 110, 14);

  for (const s of docSpec.sections) {
    ensure(40);
    doc.setDrawColor(210);
    doc.line(M, y, W - M, y);
    y += 12;
    write(s.title.toUpperCase(), 11, 'bold', 40, 6);
    for (const i of s.items) {
      write(i.label, 9, 'bold', 95, 1);
      const value = Array.isArray(i.value) ? i.value.map((v) => `•  ${v}`).join('\n') : i.value;
      write(value, 11, 'normal', 25, 10);
    }
    y += 6;
  }

  const pages = doc.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(safe(`${docSpec.title}  ·  page ${n} of ${pages}`), M, H - 28);
  }
  return doc.output('blob');
}

/** Save a Blob as a file (works on desktop and mobile browsers). */
export function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
