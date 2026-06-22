'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { DeviceMockup } from './DeviceMockup';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/work/${project.slug}`} className="block">
        {/* Mockup */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--bg-card)]">
          <DeviceMockup
            src={project.cover_image_url || ''}
            alt={project.title}
            device={project.cover_device || 'browser'}
            animateOnView
          />
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between gap-4 px-1">
          <div className="min-w-0">
            <p className="text-xs text-[var(--muted)] font-heading uppercase tracking-widest mb-1.5">
              {project.category}
            </p>
            <h3 className="font-heading font-semibold text-base text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors leading-snug">
              {project.title}
            </h3>
            {project.short_description && (
              <p className="mt-1.5 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                {project.short_description}
              </p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[var(--gold)] transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
