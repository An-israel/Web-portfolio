import { ogCard, OG_SIZE } from '@/lib/og';
import { fetchDesignBySlug } from '@/lib/data/queries';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Design by Aniekan Israel';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fetchDesignBySlug(slug);
  return ogCard({
    eyebrow: d ? `Design — ${d.category}` : 'Design',
    title: d?.title ?? 'Aniekan Israel',
    subtitle: d?.summary,
    image: d?.cover_image_url,
  });
}
