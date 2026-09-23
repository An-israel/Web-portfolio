import { ogCard, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Aniekan Israel — websites, brands and products';

export default function Image() {
  return ogCard({
    eyebrow: 'Designer & full-stack engineer — Lagos / remote',
    title: 'Websites and brands that win you customers.',
    subtitle: 'Brand design, websites, online stores and web apps — designed and built end to end.',
  });
}
