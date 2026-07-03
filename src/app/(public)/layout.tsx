import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { PageViewLogger } from '@/components/site/PageViewLogger';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <PageViewLogger />
    </>
  );
}
