import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/site-config';

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded share card (WhatsApp / X / LinkedIn previews). */
export function ogCard({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
}) {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#060607',
          color: '#edeff2',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 64,
          }}
        >
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: '#8a8f98' }}>
            {eyebrow.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: image ? 60 : 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: 'flex', marginTop: 24, fontSize: 28, color: '#8a8f98', lineHeight: 1.35 }}>
                {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, letterSpacing: 3, color: '#c7cbd1' }}>
            <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 10, background: '#c7cbd1', marginRight: 14 }} />
            ANIEKAN ISRAEL · {host.toUpperCase()}
          </div>
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" width={460} height={630} style={{ objectFit: 'cover', borderLeft: '1px solid #23262c' }} />
        ) : null}
      </div>
    ),
    OG_SIZE
  );
}
