import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SpecifyThat | Context Files for Your AI Coding Tool';
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
          Free · No signup · 60 seconds
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
          Get the context file your AI coding tool needs
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
          Describe your idea. AI asks the right questions. Get a file you can paste straight into your editor.
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
