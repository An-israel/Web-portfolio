'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FeatureToggle } from '@/components/admin/FeatureToggle';
import { useToast } from '@/components/ui/use-toast';
import type { Project } from '@/types';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setProjects((data || []) as unknown as Project[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Project deleted', variant: 'default' });
      fetchProjects();
    }
  }

  async function handleToggle(id: string, field: 'is_published' | 'is_featured', value: boolean) {
    const supabase = createClient();
    const updatePayload = field === 'is_published' ? { is_published: value } : { is_featured: value };
    const { error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      throw error;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">Projects</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{projects.length} total</p>
        </div>
        <Button asChild className="font-heading text-xs tracking-widest uppercase">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4" />
            New project
          </Link>
        </Button>
      </div>

      <div className="border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">
            No projects yet.{' '}
            <Link href="/admin/projects/new" className="text-[var(--gold)] hover:underline">
              Create your first one
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-12 h-8 object-cover rounded border border-[var(--line)] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-[var(--line)] rounded shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-sm text-[var(--ink)] truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate font-mono">
                          /{project.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--muted)]">{project.category}</span>
                  </TableCell>
                  <TableCell>
                    <FeatureToggle
                      checked={project.is_published}
                      onChange={(val) => handleToggle(project.id, 'is_published', val)}
                    />
                  </TableCell>
                  <TableCell>
                    <FeatureToggle
                      checked={project.is_featured}
                      onChange={(val) => handleToggle(project.id, 'is_featured', val)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--muted)]">{project.sort_order}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 text-[var(--muted)] hover:text-[var(--gold)] transition-colors rounded-sm hover:bg-[var(--line)]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        className="p-2 text-[var(--muted)] hover:text-red-400 transition-colors rounded-sm hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
