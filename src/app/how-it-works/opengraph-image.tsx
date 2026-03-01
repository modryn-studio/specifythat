import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'How SpecifyThat Works — Context Files for Cursor, Claude Code, Copilot & Windsurf';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#111111',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top label */}
        <div
          style={{
            fontSize: 14,
            color: '#6366f1',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontWeight: 600,
          }}
        >
          Cursor · Claude Code · Copilot · Windsurf
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          Your AI coding tool has no idea what you&apos;re building
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 22,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Unless you tell it. Context files fix that — and SpecifyThat generates one in 60 seconds.
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 18,
            color: '#6366f1',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          specifythat.com
        </div>
      </div>
    ),
    { ...size },
  );
}
