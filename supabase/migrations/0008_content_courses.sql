-- ============================================================
-- Coaching: Content Creation (complete package) + Video Editing
-- ============================================================
-- Run in the Supabase SQL Editor. Safe to re-run (updates them).
-- Negative sort_order shows them first on the Coaching page;
-- the existing courses stay as they are.
-- ============================================================

insert into public.courses
  (slug, title, summary, description, curriculum, price_naira, featured, sort_order, published)
values
  ('content-creation', 'Content Creation — The Complete Package',
   'Written, audio, video and design — create content for every platform.',
   'Content shouldn''t be one thing. Every platform wants something different, so this programme trains you across all of it: writing that gets read, audio that sounds professional, video that stops the scroll, and the design that ties it together. You''ll learn to use AI to find ideas, research and script faster, and you''ll edit your own videos from start to finish. You finish with a content system you can run for yourself or for paying clients.',
   array[
     'Content strategy: what each platform wants (Instagram, TikTok, YouTube, LinkedIn, X, podcasts)',
     'Using AI for ideation, research and scripting',
     'Written content: captions, threads, blogs and copy that converts',
     'Audio content: podcasts, voiceovers and clean sound',
     'Video content: shooting with your phone, short-form and long-form',
     'Video editing: cutting, captions, sound and pacing',
     'Design for content: thumbnails, carousels and graphics',
     'A content system: calendars, batching and turning one idea into many posts',
     'A portfolio of real content across every format'
   ], 95000, false, -2, true),

  ('video-editing', 'Video Editing',
   'Edit videos people actually watch to the end.',
   'Learn to turn raw footage into polished, engaging videos — for your own brand or for clients. From your first cut to captions, sound and colour, you''ll build a fast editing workflow for short-form and long-form content and finish with a portfolio you can sell with.',
   array[
     'Editing software and a fast workflow',
     'Cutting, pacing and storytelling',
     'Captions, text and motion graphics',
     'Sound: music, effects and a clean voice',
     'Colour correction basics',
     'Short-form edits for Reels, TikTok and Shorts',
     'Long-form edits for YouTube',
     'Exporting right for every platform',
     'A client-ready editing portfolio'
   ], 65000, false, -1, true)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  curriculum = excluded.curriculum,
  price_naira = excluded.price_naira,
  sort_order = excluded.sort_order,
  published = excluded.published;
