import React, { useState, useEffect, useRef } from 'react';

interface ReciterConfig {
  id: string;
  name: string;
  riwaya: string;
  baseUrl: string;
  archiveBaseUrl?: string;
}

const RECITERS: ReciterConfig[] = [
  {
    id: 'al-minshawy',
    name: 'الشيخ محمد صديق المنشاوي',
    riwaya: 'hafs',
    baseUrl: 'https://cdn.ratil.app/audio/al-minshawy/',
    archiveBaseUrl: 'https://archive.org/download/ratil-quran-hafs-al-minshawy/'
  },
  {
    id: 'al-husary',
    name: 'الشيخ محمود خليل الحصري',
    riwaya: 'warsh',
    baseUrl: 'https://cdn.ratil.app/audio/al-husary-warsh/',
    archiveBaseUrl: 'https://archive.org/download/ratil-quran-warsh-al-husary/'
  },
  {
    id: 'alafasy',
    name: 'الشيخ مشاري راشد العفاسي',
    riwaya: 'hafs',
    baseUrl: 'https://cdn.ratil.app/audio/alafasy/',
    archiveBaseUrl: 'https://archive.org/download/ratil-quran-hafs-alafasy/'
  }
];

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<{ id: number; name: string }>({ id: 1, name: 'الفاتحة' });
  const [currentReciter, setCurrentReciter] = useState<ReciterConfig>(RECITERS[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(50);
  const [isCached, setIsCached] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // مسار الملف الصوتي
  const surahNumPadded = String(currentSurah.id).padStart(3, '0');
  const audioSrc = `${currentReciter.baseUrl}${surahNumPadded}.mp3`;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // إرسال حدث التزامن للآية المعروضة
      window.dispatchEvent(
        new CustomEvent('ratil:timeupdate', {
          detail: { currentTimeMs: audio.currentTime * 1000, durationMs: (audio.duration || 50) * 1000 }
        })
      );
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 50);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      window.dispatchEvent(new CustomEvent('ratil:audioended'));
    };

    const handleError = () => {
      // إذا تعذر الوصول للمصدر الأساسي، يتم التحويل لمرآة أرشيف الإنترنت
      if (audioRef.current && currentReciter.archiveBaseUrl) {
        const pad = String(currentSurah.id).padStart(3, '0');
        const fallbackSrc = `${currentReciter.archiveBaseUrl}${pad}.mp3`;
        if (audioRef.current.src !== fallbackSrc) {
          console.warn(`[Player] تعذر التشغيل من المصدر السريع، التحويل التلقائي لمرآة أرشيف الإنترنت: ${fallbackSrc}`);
          audioRef.current.src = fallbackSrc;
          audioRef.current.play().catch(() => setIsPlaying(false));
          return;
        }
      }
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // استقبال أوامر التشغيل من أي مكان في الصفحة
    const handleGlobalPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ surahId: number; surahName?: string; reciterId?: string }>;
      if (customEvent.detail) {
        const { surahId, surahName, reciterId } = customEvent.detail;
        if (reciterId) {
          const rec = RECITERS.find((r) => r.id === reciterId);
          if (rec) setCurrentReciter(rec);
        }
        setCurrentSurah({ id: surahId, name: surahName || `السورة ${surahId}` });
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }, 50);
      }
    };

    window.addEventListener('ratil:play', handleGlobalPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      window.removeEventListener('ratil:play', handleGlobalPlay);
      audio.pause();
    };
  }, [currentSurah.id, currentReciter.id]);

  // تحديث مصدر الصوت عند تغيير السورة أو القارئ
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.src = audioSrc;
      audioRef.current.playbackRate = playbackRate;
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }

    // Media Session API
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentSurah.name}`,
        artist: currentReciter.name,
        album: `المصحف المرتل — رواية ${currentReciter.riwaya === 'hafs' ? 'حفص عن عاصم' : 'ورش عن نافع'}`,
        artwork: [
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    }
  }, [currentSurah.id, currentReciter.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside className="persistent-audio-player" aria-label="مشغل التلاوة الصوتي">
      <div className="player-container">
        
        {/* معلومات السورة والقارئ */}
        <div className="player-meta-group">
          <button 
            onClick={togglePlay}
            className="player-play-btn"
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                <rect x="14" y="4" width="4" height="16" rx="1"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <div className="player-track-info">
            <span className="player-track-title">سورة {currentSurah.name}</span>
            <div className="player-reciter-selector">
              <select 
                value={currentReciter.id} 
                onChange={(e) => {
                  const rec = RECITERS.find((r) => r.id === e.target.value);
                  if (rec) setCurrentReciter(rec);
                }}
                className="player-reciter-dropdown"
                aria-label="اختر القارئ"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.riwaya === 'hafs' ? 'حفص' : 'ورش'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* شريط التقدم والوقت */}
        <div className="player-timeline-group">
          <span className="player-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="player-seek-slider"
            aria-label="شريط تقدم التلاوة"
          />
          <span className="player-time">{formatTime(duration)}</span>
        </div>

        {/* أدوات التحكم الثانوية (السرعة، الحفظ أوفلاين) */}
        <div className="player-actions-group">
          <button 
            onClick={cycleSpeed}
            className="player-speed-btn"
            title="سرعة التلاوة"
          >
            {playbackRate}x
          </button>

          <button
            onClick={() => {
              if ('caches' in window) {
                caches.open('ratil-audio-v1').then((cache) => {
                  cache.add(audioSrc).then(() => setIsCached(true)).catch(() => {});
                });
              }
            }}
            className={`player-cache-btn ${isCached ? 'cached' : ''}`}
            title={isCached ? 'تم الحفظ أوفلاين' : 'تحميل للاستماع بدون إنترنت'}
          >
            {isCached ? '✓ محفوظ' : '⬇ أوفلاين'}
          </button>
        </div>

      </div>

      <style>{`
        .persistent-audio-player {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--player-height-full, 76px);
          background: rgba(17, 19, 24, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 20px;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
        }

        .player-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .player-meta-group {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 240px;
        }

        .player-play-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-primary, #3ECFB2);
          color: #0E1015;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease, background-color 0.15s ease;
          flex-shrink: 0;
        }

        .player-play-btn:hover {
          transform: scale(1.06);
          background: var(--color-primary-bright, #61ECCD);
        }

        .player-track-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .player-track-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--color-text-primary, #F3F4F6);
        }

        .player-reciter-dropdown {
          background: transparent;
          border: none;
          color: var(--color-text-secondary, #9EA3B0);
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          outline: none;
        }

        .player-reciter-dropdown option {
          background: #181B22;
          color: #F3F4F6;
        }

        .player-timeline-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 600px;
        }

        .player-time {
          font-size: 12px;
          color: var(--color-text-secondary, #9EA3B0);
          font-variant-numeric: tabular-nums;
          min-width: 34px;
        }

        .player-seek-slider {
          flex: 1;
          height: 6px;
          accent-color: var(--color-primary, #3ECFB2);
          cursor: pointer;
        }

        .player-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .player-speed-btn, .player-cache-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-secondary, #9EA3B0);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .player-speed-btn:hover, .player-cache-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.12);
        }

        .player-cache-btn.cached {
          background: rgba(62, 207, 178, 0.15);
          color: var(--color-primary, #3ECFB2);
          border-color: var(--color-primary, #3ECFB2);
        }

        @media (max-width: 768px) {
          .player-timeline-group {
            display: none;
          }
          .persistent-audio-player {
            padding: 0 12px;
            height: 66px;
          }
        }
      `}</style>
    </aside>
  );
}
