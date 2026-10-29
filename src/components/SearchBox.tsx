import React, { useState, useEffect, useRef } from 'react';

interface SurahIndexItem {
  id: number;
  name: string;
  name_normalized: string;
  latin: string[];
  num: number;
  ayahs_hafs?: number;
  type?: string;
}

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآٱ]/g, 'ا')               // توحيد الهمزات
    .replace(/ى/g, 'ي')                    // توحيد الياء
    .replace(/ة/g, 'ه')                    // توحيد التاء المربوطة
    .trim();
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SurahIndexItem[]>([]);
  const [indexData, setIndexData] = useState<SurahIndexItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // تحميل الفهرس المُطبَّع المسبق مرة واحدة
  useEffect(() => {
    fetch('/search-index.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setIndexData(data))
      .catch((err) => console.debug('Search index load skipped:', err));
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    const cleaned = val.trim().toLowerCase();
    if (!cleaned) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const normQuery = normalizeArabic(cleaned);
    const isNum = !isNaN(Number(cleaned));
    const targetNum = Number(cleaned);

    const matches = indexData.filter((item) => {
      if (isNum && item.id === targetNum) return true;
      if (item.name_normalized && item.name_normalized.includes(normQuery)) return true;
      if (item.name && item.name.includes(cleaned)) return true;
      if (item.latin && item.latin.some((lat) => lat.includes(cleaned))) return true;
      return false;
    });

    setResults(matches.slice(0, 7));
    setIsOpen(matches.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      if (target) {
        window.location.href = `/surah/${target.id}`;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-box-wrapper" ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto' }}>
      <div className="search-input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder="ابحث عن سورة (مثال: الكهف، البقرة، 18، fatiha)..."
          className="search-input-field"
          aria-label="ابحث عن سورة"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          style={{
            width: '100%',
            padding: '14px 44px 14px 18px',
            fontSize: '15px',
            fontFamily: 'var(--font-ui)',
            color: 'var(--color-text-primary, #F3F4F6)',
            backgroundColor: 'var(--color-surface, #181B22)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: 'var(--radius-full, 9999px)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}
        />
        <div style={{ position: 'absolute', right: '16px', color: 'var(--color-text-secondary, #9EA3B0)', pointerEvents: 'none', display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--color-surface, #181B22)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            padding: '8px',
            margin: 0,
            listStyle: 'none',
            zIndex: 100,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {results.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === selectedIndex}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => {
                window.location.href = `/surah/${item.id}`;
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: idx === selectedIndex ? 'rgba(62, 207, 178, 0.12)' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-primary, #3ECFB2)',
                  background: 'rgba(62, 207, 178, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {String(item.id).padStart(3, '0')}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #F3F4F6)' }}>
                  سورة {item.name}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #9EA3B0)' }}>
                {item.type || 'مكية'} • {item.ayahs_hafs || 0} آية
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
