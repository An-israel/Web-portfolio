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
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/work/${project.slug}`} className="block">
        {/* Mockup */}
        <div className="mb-5 rounded-sm overflow-hidden">
          <DeviceMockup
            src={project.cover_image_url || ''}
            alt={project.title}
            device={project.cover_device || 'browser'}
            animateOnView
          />
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-micro mb-1.5">{project.category}</p>
            <h3 className="font-heading font-semibold text-lg text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors">
              {project.title}
            </h3>
            {project.short_description && (
              <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                {project.short_description}
              </p>
            )}
            {/* Gold underline grows on hover */}
            <div className="mt-3 h-px w-0 bg-[var(--gold)] transition-all duration-300 group-hover:w-full" />
          </div>
          <ArrowUpRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}
