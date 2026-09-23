import { ogCard, OG_SIZE } from '@/lib/og';
import { fetchProjectBySlug } from '@/lib/data/queries';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Project by Aniekan Israel';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await fetchProjectBySlug(slug);
  return ogCard({
    eyebrow: p ? `Work — ${p.category}` : 'Work',
    title: p?.title ?? 'Aniekan Israel',
    subtitle: p?.one_liner,
    image: p?.cover_image_url,
  });
}
