'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/site/SectionHeading';
import { ProjectCard } from '@/components/site/ProjectCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/types';

const PLACEHOLDER_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Horizon Real Estate',
    slug: 'horizon-real-estate',
    category: 'Business Website',
    short_description: 'A property listing platform that positions Horizon as the market authority.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'browser',
    gallery: null,
    tech_stack: ['Next.js', 'Supabase'],
    live_url: null,
    is_published: true,
    is_featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Lagos Bites',
    slug: 'lagos-bites',
    category: 'E-commerce',
    short_description: 'Online food ordering with real-time tracking.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'browser',
    gallery: null,
    tech_stack: ['Next.js', 'Stripe'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Clarity Consulting',
    slug: 'clarity-consulting',
    category: 'Business Website',
    short_description: 'Brand positioning site for a management consulting firm.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'laptop',
    gallery: null,
    tech_stack: ['Next.js', 'Framer Motion'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Lumina Skincare',
    slug: 'lumina-skincare',
    category: 'Landing Page',
    short_description: 'High-converting product launch page.',
    full_description: null,
    cover_image_url: null,
    cover_device: 'phone',
    gallery: null,
    tech_stack: ['Next.js', 'Tailwind CSS'],
    live_url: null,
    is_published: true,
    is_featured: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('is_published', true)
          .order('sort_order');

        if (data && data.length > 0) {
          setProjects(data as unknown as Project[]);
        } else {
          setProjects(PLACEHOLDER_PROJECTS);
        }
      } catch {
        setProjects(PLACEHOLDER_PROJECTS);
      }
    }
    fetchProjects();
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      <SectionHeading
        eyebrow="Portfolio"
        title="Work that earns its place on the wall."
        subtitle="Each project is built with a single purpose: to make the client the most credible option in their market."
        className="mb-14 max-w-2xl"
      />

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-12">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory}>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[var(--muted)]">
              <p>No projects in this category yet.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
