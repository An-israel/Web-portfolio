import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ExternalLink, Code2 } from "lucide-react";
import { MonoLabel } from "@/components/site/MonoLabel";
import { Paragraphs } from "@/components/site/Paragraphs";
import { fetchAllProjects, fetchProjectBySlug } from "@/lib/data/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Rendered on first visit, then cached; admin saves refresh it.
export const revalidate = 60;

// None prebuilt: each page is rendered on its first visit, then cached (ISR).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.one_liner,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} — Aniekan Israel`,
      description: project.one_liner ?? undefined,
    },
  };
}

const SECTIONS = [
  ["THE PROBLEM", "Why it needed to exist.", "problem"],
  ["THE ARCHITECTURE", "How it’s built.", "architecture"],
  ["THE BUILD", "The hard parts.", "build_notes"],
  ["THE OUTCOME", "What shipped.", "outcome"],
] as const;

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--steel)] py-14">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div>
          <MonoLabel>{label}</MonoLabel>
          <h2 className="mt-3 font-display text-2xl text-[var(--platinum)]">
            {title}
          </h2>
        </div>
        <div className="prose-obsidian text-[var(--mist)] space-y-4">
          {children}
        </div>
      </div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const [project, all] = await Promise.all([
    fetchProjectBySlug(slug),
    fetchAllProjects(),
  ]);
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === project.slug);
  const prev = idx > 0 ? all[idx - 1] : all[all.length - 1];
  const next = idx < all.length - 1 ? all[idx + 1] : all[0];

  return (
    <article className="max-w-[1000px] mx-auto px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumb */}
      <Link
        href="/work"
        className="group inline-flex items-center gap-2 mono-label text-[var(--mist)] hover:text-[var(--platinum)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        WORK / {project.title.toUpperCase()}
      </Link>

      {/* Title + description */}
      <h1 className="mt-8 font-display text-5xl sm:text-6xl text-[var(--platinum)]">
        {project.title}
      </h1>
      <p className="mt-5 text-lg text-[var(--mist)] max-w-2xl">
        {project.one_liner}
      </p>

      {/* Meta row */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        {[
          project.role && `ROLE — ${project.role.toUpperCase()}`,
          project.year && `YEAR — ${project.year}`,
          project.status && `STATUS — ${project.status.toUpperCase()}`,
        ]
          .filter(Boolean)
          .map((m, i) => (
            <span key={m as string} className="inline-flex items-center gap-6">
              {i > 0 && (
                <span className="h-3 w-px bg-[var(--steel)] hidden sm:block" />
              )}
              <MonoLabel>{m}</MonoLabel>
            </span>
          ))}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mono-label text-[var(--white)] hover:text-[var(--silver)] transition-colors"
          >
            VISIT LIVE <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mono-label text-[var(--white)] hover:text-[var(--silver)] transition-colors"
          >
            VIEW CODE <Code2 className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Hero frame */}
      <div className="mt-12 relative aspect-[16/9] rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.title} — ${project.one_liner}`}
            fill
            sizes="1000px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[10rem] leading-none text-[var(--steel)] select-none">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mt-16">
        {SECTIONS.map(
          ([label, title, key]) =>
            project[key] && (
              <Section key={key} label={label} title={title}>
                <Paragraphs text={project[key]} />
              </Section>
            ),
        )}

        {/* Stack */}
        {project.stack.length > 0 && (
          <section className="border-t border-[var(--steel)] py-14">
            <MonoLabel>STACK</MonoLabel>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="mono-label text-[var(--mist)] border border-[var(--steel)] rounded px-3 py-1.5"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Prev / Next */}
      {all.length > 1 && (
        <nav className="border-t border-[var(--steel)] pt-10 grid grid-cols-2 gap-6">
          <Link href={`/work/${prev.slug}`} className="group">
            <MonoLabel className="text-[var(--mist)]">← PREVIOUS</MonoLabel>
            <p className="mt-2 font-display text-lg text-[var(--platinum)] group-hover:text-[var(--white)] transition-colors">
              {prev.title}
            </p>
          </Link>
          <Link href={`/work/${next.slug}`} className="group text-right">
            <MonoLabel className="text-[var(--mist)]">NEXT →</MonoLabel>
            <p className="mt-2 font-display text-lg text-[var(--platinum)] group-hover:text-[var(--white)] transition-colors">
              {next.title}
            </p>
          </Link>
        </nav>
      )}

      {/* Hire CTA */}
      <div className="mt-16 rounded-md border border-[var(--steel)] bg-[var(--graphite)] p-10 text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-[var(--platinum)]">
          Want something like this?
        </h2>
        <Link
          href="/hire"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-[var(--silver)] px-6 py-3.5 text-sm font-medium text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--obsidian)] transition-colors"
        >
          Hire me <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
