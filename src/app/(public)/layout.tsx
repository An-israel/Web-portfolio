'use client';

import { useState } from 'react';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { BookDialog } from '@/components/site/BookDialog';
import { Providers } from '@/components/site/Providers';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <Providers>
      <Nav onBookClick={() => setBookOpen(true)} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <BookDialog open={bookOpen} onOpenChange={setBookOpen} />
    </Providers>
  );
}
