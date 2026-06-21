import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DeviceMockup } from '@/components/site/DeviceMockup';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CaseStudyCTA } from './CaseStudyCTA';
import type { Project, GalleryImage } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    return data as unknown as Project | null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select('slug')
      .eq('is_published', true);

    return (data || []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.title,
    description: project.short_description || undefined,
    openGraph: {
      title: project.title,
      description: project.short_description || undefined,
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const gallery = (project.gallery as unknown as GalleryImage[] | null) || [];

  return (
    <article className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Back */}
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        All work
      </Link>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
        <div>
          <p className="label-micro mb-4">{project.category}</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--ink)] leading-tight mb-6">
            {project.title}
          </h1>
          {project.short_description && (
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
              {project.short_description}
            </p>
          )}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="default">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
          {project.live_url && (
            <Button variant="outline" asChild className="font-heading text-xs tracking-widest uppercase">
              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                Visit live site <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
        <DeviceMockup
          src={project.cover_image_url || ''}
          alt={project.title}
          device={project.cover_device || 'browser'}
          animateOnView
        />
      </div>

      {/* Full description — admin-authored content, safe to render */}
      {project.full_description && (
        <section className="mb-20 max-w-3xl">
          <SectionHeading eyebrow="Case study" title="The full story." className="mb-10" />
          {/*
            Admin-authored content rendered as simple paragraphs.
            This content is written by Aniekan (admin) only — not user-generated.
          */}
          <div className="prose-admin">
            {project.full_description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="mb-20">
          <SectionHeading eyebrow="Gallery" title="More screens." className="mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gallery.map((img, i) => (
              <DeviceMockup
                key={i}
                src={img.url}
                alt={img.alt}
                device={img.device || 'browser'}
                animateOnView
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <CaseStudyCTA projectTitle={project.title} />
    </article>
  );
}
