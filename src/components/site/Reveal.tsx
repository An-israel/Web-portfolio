import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** kept for call-site compatibility; the CSS scroll animation doesn't stagger */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/**
 * Subtle 12px rise as the element scrolls into view — pure CSS
 * (scroll-driven animation, see .reveal in globals.css). Content is
 * always visible: browsers without support, crawlers, link previews,
 * screenshots and reduced-motion users simply see it in place.
 */
export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  return <Tag className={cn('reveal', className)}>{children}</Tag>;
}
