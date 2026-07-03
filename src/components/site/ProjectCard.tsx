import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { MonoLabel } from './MonoLabel';
import type { WorkProject } from '@/types';

interface ProjectCardProps {
  project: WorkProject;
  index?: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block rounded-md border border-[var(--steel)] bg-[var(--graphite)] overflow-hidden transition-colors duration-300 hover:border-[var(--silver)]"
    >
      {/* Cover — 16:9 */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--obsidian)]">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.title} — ${project.one_liner}`}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display text-[7rem] leading-none text-[var(--steel)] select-none transition-transform duration-500 group-hover:scale-[1.03]"
              aria-hidden="true"
            >
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        {typeof index === 'number' && (
          <MonoLabel className="absolute top-4 left-4 text-[var(--mist)]">
            {String(index + 1).padStart(2, '0')}
          </MonoLabel>
        )}
      </div>

      {/* Meta */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <MonoLabel>{project.category}</MonoLabel>
          <ArrowUpRight className="w-4 h-4 text-[var(--mist)] group-hover:text-[var(--silver)] transition-colors" />
        </div>
        <h3 className="mt-3 font-display text-xl text-[var(--platinum)]">{project.title}</h3>
        <p className="mt-2 text-sm text-[var(--mist)] leading-relaxed line-clamp-2">
          {project.one_liner}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="mono-label text-[10px] text-[var(--mist)] border border-[var(--steel)] rounded px-2 py-1"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
