import { ImageResponse } from 'next/og';
import surahs from '@/data/surahs.json';
export const alt = 'رتل - القرآن الكريم';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export async function generateStaticParams() {
  return surahs.map((s) => ({ id: String(s.id) }));
}

export default async function Image({ params }: { params: { id: string } }) {
  const surahId = Number(params.id);
  const surah = surahs.find((s) => s.id === surahId);
  const name = surah?.ar || surah?.name_ar || `سورة ${params.id}`;
  const ayahs = surah?.ayahs || 0;
  const type = surah?.type || 'مكية';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0e14',
          color: '#ffffff',
          direction: 'rtl',
          padding: '40px',
          border: '12px solid #1e222d',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: 28,
            color: '#61eccd',
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          <span>رتّل</span>
          <span style={{ color: '#4b5563' }}>•</span>
          <span>تلاوات القرآن الكريم بروايتي حفص وورش</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: 20,
          }}
        >
          {`سورة ${name}`}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            fontSize: 30,
            color: '#9ca3af',
            backgroundColor: '#191b22',
            padding: '12px 32px',
            borderRadius: '16px',
            border: '1px solid #282a30',
          }}
        >
          <span>{`عدد الآيات: ${ayahs}`}</span>
          <span style={{ color: '#4b5563' }}>|</span>
          <span>{type}</span>
          <span style={{ color: '#4b5563' }}>|</span>
          <span>{`رقم السورة: ${surahId}`}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
