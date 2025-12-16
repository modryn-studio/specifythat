import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'SpecifyThat - Turn Ideas Into Build-Ready Specs'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #0A2540 0%, #1E4D8B 100%)',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              maxWidth: '900px',
            }}
          >
            Turn Ideas Into Build-Ready Specs
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            Stop staring at a blank page. Get from idea to building in under 30 minutes.
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: '#3B82F6',
              marginTop: '16px',
            }}
          >
            specifythat.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
