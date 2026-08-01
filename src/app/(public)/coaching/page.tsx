import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { MonoLabel } from '@/components/site/MonoLabel';
import { Reveal } from '@/components/site/Reveal';
import { PulseLine } from '@/components/site/PulseLine';
import { EnrollButton, formatNaira } from '@/components/site/EnrollButton';
import { fetchCourses, fetchSiteSettings } from '@/lib/data/queries';

export const metadata: Metadata = {
  title: 'Coaching',
  description:
    'Learn directly from Aniekan Israel — web development, graphic design, content & copywriting, and videography. Practical, project-based training that gets you job-ready.',
};

export default async function CoachingPage() {
  const [courses, settings] = await Promise.all([fetchCourses(), fetchSiteSettings()]);
  const payment = {
    bank: settings.payment_bank,
    account: settings.payment_account,
    name: settings.payment_name,
    whatsapp: settings.whatsapp_number,
  };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--steel)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-36 pb-16">
          <Reveal>
            <MonoLabel>LEARN FROM ME</MonoLabel>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--platinum)] max-w-4xl">
              Learn the skills I use to build and ship.
            </h1>
            <p className="mt-6 text-lg text-[var(--mist)] max-w-2xl">
              Practical, project-based coaching — no fluff. You finish with real skills and work you
              can show. Pick a track, secure your spot, and let’s build.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Courses */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          {courses.length === 0 ? (
            <div className="text-center py-24">
              <p className="metal-text font-display text-5xl">Coaching</p>
              <p className="mt-4 text-[var(--mist)]">Courses are being set up — check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={(i % 2) * 80}>
                  <div className="h-full flex flex-col rounded-lg border border-[var(--steel)] bg-[var(--graphite)] p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl text-[var(--platinum)]">{course.title}</h2>
                        {course.summary && (
                          <p className="mt-2 text-sm text-[var(--mist)]">{course.summary}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-2xl text-[var(--platinum)]">
                          {formatNaira(course.price_naira)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.duration && (
                        <span className="mono-label border border-[var(--steel)] rounded px-2.5 py-1.5 text-[var(--mist)]">
                          {course.duration}
                        </span>
                      )}
                      {course.level && (
                        <span className="mono-label border border-[var(--steel)] rounded px-2.5 py-1.5 text-[var(--mist)]">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="mt-5 text-sm text-[var(--mist)] leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {course.curriculum.length > 0 && (
                      <div className="mt-6">
                        <MonoLabel className="text-[var(--mist)]">WHAT YOU’LL LEARN</MonoLabel>
                        <ul className="mt-3 space-y-2">
                          {course.curriculum.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--platinum)]">
                              <Check className="w-4 h-4 text-[var(--silver)] shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-8 pt-2 flex-1 flex items-end">
                      <div className="w-full">
                        <EnrollButton
                          courseTitle={course.title}
                          price={course.price_naira}
                          payment={payment}
                        />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-[var(--steel)]">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8 py-16 text-center">
          <PulseLine className="mb-8 max-w-sm mx-auto" />
          <p className="text-[var(--mist)]">
            Questions before you enrol? Message me on WhatsApp at{' '}
            <span className="text-[var(--platinum)]">{settings.whatsapp_number}</span> — I reply
            personally.
          </p>
        </div>
      </section>
    </>
  );
}
