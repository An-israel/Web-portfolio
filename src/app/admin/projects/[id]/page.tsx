'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/use-toast';
import type { Project, GalleryImage } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const CATEGORIES = [
  'Business Website',
  'E-commerce',
  'Landing Page',
  'Portfolio',
  'Web Application',
  'Other',
];

export default function ProjectEditPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverDevice, setCoverDevice] = useState<'browser' | 'laptop' | 'phone'>('browser');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (isNew) return;

    async function fetchProject() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({ title: 'Project not found', variant: 'destructive' });
        router.push('/admin/projects');
        return;
      }

      const p = data as unknown as Project;
      setTitle(p.title);
      setSlug(p.slug);
      setSlugEdited(true);
      setCategory(p.category);
      setShortDesc(p.short_description || '');
      setFullDesc(p.full_description || '');
      setCoverUrl(p.cover_image_url || '');
      setCoverDevice(p.cover_device || 'browser');
      setTechStack(p.tech_stack || []);
      setLiveUrl(p.live_url || '');
      setIsPublished(p.is_published);
      setIsFeatured(p.is_featured);
      setSortOrder(p.sort_order);
      setGallery((p.gallery as unknown as GalleryImage[]) || []);
      setLoading(false);
    }

    fetchProject();
  }, [id, isNew, router, toast]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val));
    setSlugEdited(true);
  }

  function addTech() {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
    setTechInput('');
  }

  function removeTech(tech: string) {
    setTechStack(techStack.filter((t) => t !== tech));
  }

  function addGalleryImage() {
    setGallery([...gallery, { url: '', alt: '', device: 'browser' }]);
  }

  function updateGalleryImage(index: number, updates: Partial<GalleryImage>) {
    setGallery(gallery.map((img, i) => (i === index ? { ...img, ...updates } : img)));
  }

  function removeGalleryImage(index: number) {
    setGallery(gallery.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!title || !slug || !category) {
      toast({
        title: 'Validation error',
        description: 'Title, slug, and category are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      title,
      slug,
      category,
      short_description: shortDesc || null,
      full_description: fullDesc || null,
      cover_image_url: coverUrl || null,
      cover_device: coverDevice,
      tech_stack: techStack,
      live_url: liveUrl || null,
      is_published: isPublished,
      is_featured: isFeatured,
      sort_order: sortOrder,
      gallery: gallery.length > 0 ? (gallery as unknown as import('@/types/database').Json) : null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (isNew) {
      const res = await supabase.from('projects').insert(payload);
      error = res.error;
    } else {
      const res = await supabase.from('projects').update(payload).eq('id', id);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: isNew ? 'Project created!' : 'Project updated!',
        variant: 'default',
      });
      if (isNew) router.push('/admin/projects');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/projects"
          className="p-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors rounded-sm hover:bg-[var(--line)]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading font-semibold text-2xl text-[var(--ink)]">
            {isNew ? 'New project' : 'Edit project'}
          </h1>
        </div>
        <div className="ml-auto">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="font-heading text-xs tracking-widest uppercase"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save project'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic info */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-5">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Basic info
          </h2>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Horizon Real Estate"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="horizon-real-estate"
              className="font-mono text-sm"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              URL: /work/{slug}
            </p>
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="short_desc">Short description</Label>
            <Textarea
              id="short_desc"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="One-line summary that appears on cards and listings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="live_url">Live URL</Label>
            <Input
              id="live_url"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-24"
            />
          </div>
        </section>

        {/* Cover image */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-5">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Cover image
          </h2>
          <ImageUploader
            value={coverUrl}
            onChange={setCoverUrl}
            folder="covers"
          />
          <div>
            <Label>Device type</Label>
            <Select
              value={coverDevice}
              onValueChange={(v) => setCoverDevice(v as 'browser' | 'laptop' | 'phone')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="browser">Browser</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Full description */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-5">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Case study content
          </h2>
          <div>
            <Label htmlFor="full_desc">Full description</Label>
            <Textarea
              id="full_desc"
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Tell the full story of this project. Use double line breaks for paragraphs..."
              rows={10}
            />
          </div>
        </section>

        {/* Tech stack */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-5">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Tech stack
          </h2>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="e.g. Next.js"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTech();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTech} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[var(--line)] rounded-sm text-sm text-[var(--muted)]"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Gallery */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <h2 className="font-heading font-semibold text-sm text-[var(--ink)]">Gallery</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGalleryImage}
              className="font-heading text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add image
            </Button>
          </div>
          {gallery.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No gallery images yet.</p>
          ) : (
            <div className="space-y-4">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="p-4 border border-[var(--line)] rounded-sm space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="text-xs font-heading text-[var(--muted)] uppercase tracking-wider">
                      Image {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="text-[var(--muted)] hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ImageUploader
                    value={img.url}
                    onChange={(url) => updateGalleryImage(i, { url })}
                    folder="gallery"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Alt text</Label>
                      <Input
                        value={img.alt}
                        onChange={(e) => updateGalleryImage(i, { alt: e.target.value })}
                        placeholder="Describe this image"
                      />
                    </div>
                    <div>
                      <Label>Device</Label>
                      <Select
                        value={img.device}
                        onValueChange={(v) =>
                          updateGalleryImage(i, { device: v as 'browser' | 'laptop' | 'phone' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="browser">Browser</SelectItem>
                          <SelectItem value="laptop">Laptop</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Publish settings */}
        <section className="p-6 border border-[var(--line)] rounded-sm bg-[var(--bg-raised)] space-y-4">
          <h2 className="font-heading font-semibold text-sm text-[var(--ink)] pb-4 border-b border-[var(--line)]">
            Visibility
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-heading font-medium text-[var(--ink)]">Published</p>
              <p className="text-xs text-[var(--muted)]">Visible on the public site</p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-heading font-medium text-[var(--ink)]">Featured</p>
              <p className="text-xs text-[var(--muted)]">
                Shows in hero and featured section
              </p>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>
        </section>

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full font-heading text-xs tracking-widest uppercase"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving...' : isNew ? 'Create project' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
