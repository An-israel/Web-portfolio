'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DeviceMockupProps {
  src: string;
  alt: string;
  device?: 'browser' | 'laptop' | 'phone';
  animateOnView?: boolean;
  className?: string;
  priority?: boolean;
}

function BrowserMockup({
  src,
  alt,
  animateOnView,
}: {
  src: string;
  alt: string;
  animateOnView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotion();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!animateOnView || shouldReduceMotion) return;
    if (!isInView) return;

    let frame: number;
    let start: number | null = null;
    const duration = 1800;
    const maxScroll = 40; // percent

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setScrollY(eased * maxScroll);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        // Settle back slightly
        setScrollY(maxScroll * 0.15);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, animateOnView, shouldReduceMotion]);

  return (
    <div
      ref={ref}
      className="rounded-lg overflow-hidden border border-[var(--line)] bg-[var(--bg-raised)] shadow-2xl shadow-black/40"
      style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      {/* Browser chrome */}
      <div className="bg-[#1a1a1a] border-b border-[var(--line)] px-4 py-3 flex items-center gap-3">
        {/* Traffic light dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {/* URL bar */}
        <div className="flex-1 flex items-center bg-[var(--bg)] rounded-md px-3 py-1 gap-2 min-w-0">
          <svg
            className="w-3 h-3 text-[var(--muted)] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2C4 17.5 12 22 12 22z"
            />
          </svg>
          <span className="text-[10px] text-[var(--muted)] truncate font-mono">
            swiftcreator.com
          </span>
        </div>
      </div>
      {/* Screenshot viewport */}
      <div className="overflow-hidden bg-[#fff]" style={{ height: '220px' }}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full object-cover object-top transition-none"
            style={{
              transform: `translateY(-${scrollY}%)`,
              transition: shouldReduceMotion ? 'none' : undefined,
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
            <div className="text-center opacity-30">
              <div className="w-12 h-1 bg-[var(--muted)] rounded mb-2 mx-auto" />
              <div className="w-20 h-1 bg-[var(--muted)] rounded mb-2 mx-auto" />
              <div className="w-16 h-1 bg-[var(--muted)] rounded mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LaptopMockup({
  src,
  alt,
  animateOnView,
}: {
  src: string;
  alt: string;
  animateOnView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!animateOnView || shouldReduceMotion || !isInView) return;
    let frame: number;
    let start: number | null = null;
    const duration = 2000;
    const maxScroll = 35;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScrollY(eased * maxScroll);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, animateOnView, shouldReduceMotion]);

  return (
    <div ref={ref} className="relative">
      {/* Lid + screen */}
      <div
        className="relative rounded-t-xl overflow-hidden border border-b-0 border-[var(--line)] bg-[#1a1a1a]"
        style={{ paddingTop: '62%' }}
      >
        {/* Screen bezel */}
        <div className="absolute inset-2 rounded-lg overflow-hidden bg-white">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="w-full object-cover object-top"
              style={{ transform: `translateY(-${scrollY}%)` }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
          )}
        </div>
        {/* Webcam dot */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />
      </div>
      {/* Base */}
      <div
        className="h-2.5 bg-[#222] border border-t-0 border-[var(--line)] rounded-b-sm"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)',
        }}
      />
      {/* Hinge shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

function PhoneMockup({
  src,
  alt,
  animateOnView,
}: {
  src: string;
  alt: string;
  animateOnView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!animateOnView || shouldReduceMotion || !isInView) return;
    let frame: number;
    let start: number | null = null;
    const duration = 2200;
    const maxScroll = 50;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScrollY(eased * maxScroll);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, animateOnView, shouldReduceMotion]);

  return (
    <div
      ref={ref}
      className="relative mx-auto"
      style={{ width: '220px' }}
    >
      {/* Phone shell */}
      <div
        className="relative rounded-[2.5rem] overflow-hidden border-4 border-[#2a2a2a] bg-[#111]"
        style={{
          boxShadow: '0 30px 70px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Notch bar */}
        <div className="relative bg-black h-8 flex items-center justify-center z-10">
          <div className="w-20 h-5 bg-black rounded-b-xl flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
          </div>
        </div>
        {/* Screen */}
        <div className="overflow-hidden bg-white" style={{ height: '360px' }}>
          {src ? (
            <img
              src={src}
              alt={alt}
              className="w-full object-cover object-top"
              style={{ transform: `translateY(-${scrollY}%)` }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
          )}
        </div>
        {/* Home indicator */}
        <div className="bg-black h-6 flex items-center justify-center">
          <div className="w-24 h-1 rounded-full bg-[#333]" />
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute top-24 -right-1 w-1 h-8 bg-[#2a2a2a] rounded-r-sm" />
      <div className="absolute top-16 -left-1 w-1 h-5 bg-[#2a2a2a] rounded-l-sm" />
      <div className="absolute top-24 -left-1 w-1 h-8 bg-[#2a2a2a] rounded-l-sm" />
    </div>
  );
}

export function DeviceMockup({
  src,
  alt,
  device = 'browser',
  animateOnView = false,
  className,
}: DeviceMockupProps) {
  const content = (() => {
    switch (device) {
      case 'laptop':
        return <LaptopMockup src={src} alt={alt} animateOnView={animateOnView} />;
      case 'phone':
        return <PhoneMockup src={src} alt={alt} animateOnView={animateOnView} />;
      default:
        return <BrowserMockup src={src} alt={alt} animateOnView={animateOnView} />;
    }
  })();

  return (
    <div className={cn('w-full', className)}>
      {content}
    </div>
  );
}

// Re-export motion for pages that use it
export { motion };
