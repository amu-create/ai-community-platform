import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'AI Community Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to right bottom, #9333ea, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
        <div style={{ fontSize: 48, fontWeight: 'bold' }}>AI Community Platform</div>
        <div style={{ fontSize: 32, marginTop: 20 }}>AI 학습의 새로운 기준</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
