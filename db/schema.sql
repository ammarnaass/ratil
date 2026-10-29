-- ─── رتل — Ratil ──────────────────────────────────────────────
-- مخطط قاعدة بيانات Neon PostgreSQL المعتمد
-- db/schema.sql

-- ─── 1. القرّاء ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reciters (
  id              VARCHAR(60)  PRIMARY KEY,  -- 'al-minshawy'
  name            TEXT         NOT NULL,     -- 'الشيخ محمد صديق المنشاوي'
  riwaya          VARCHAR(20)  NOT NULL,     -- 'hafs' | 'warsh' | 'qalon'
  license         VARCHAR(50)  NOT NULL,     -- 'public-domain' | 'cc-by' | 'permission'
  source_name     TEXT         NOT NULL,     -- 'Egyptian Radio Archive'
  source_url      TEXT,
  license_url     TEXT,
  is_visible      BOOLEAN      DEFAULT TRUE,
  notes           TEXT,                      -- ملاحظات داخلية للمدير
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── 2. الملفات الصوتية ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS surah_audio (
  id               SERIAL      PRIMARY KEY,
  reciter_id       VARCHAR(60) REFERENCES reciters(id) ON DELETE CASCADE,
  surah_number     SMALLINT    NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  audio_url        TEXT        NOT NULL,  -- archive.org/download/...
  timings_url      TEXT,                  -- JSON توقيت الآيات
  duration_seconds INTEGER,
  size_mb          NUMERIC(6,2),
  verified         BOOLEAN     DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (reciter_id, surah_number)
);

-- ─── 3. البلاغات ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id           SERIAL      PRIMARY KEY,
  type         VARCHAR(20) NOT NULL,       -- 'text' | 'audio' | 'request'
  surah_number SMALLINT,
  ayah_number  SMALLINT,
  reciter_id   VARCHAR(60),
  description  TEXT        NOT NULL,
  status       VARCHAR(20) DEFAULT 'new',  -- 'new' | 'reviewed' | 'closed'
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. سجل فحص الصوت ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_logs (
  id               SERIAL      PRIMARY KEY,
  reciter_id       VARCHAR(60),
  audio_url        TEXT,
  http_status      SMALLINT,
  supports_range   BOOLEAN,
  response_ms      INTEGER,
  error_msg        TEXT,
  checked_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. الفهارس ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audio_reciter   ON surah_audio (reciter_id);
CREATE INDEX IF NOT EXISTS idx_audio_surah     ON surah_audio (surah_number);
CREATE INDEX IF NOT EXISTS idx_reports_status  ON reports (status);
CREATE INDEX IF NOT EXISTS idx_health_reciter  ON health_logs (reciter_id, checked_at DESC);

-- ─── 6. بذور البيانات الأولية (Initial Seed) ─────────────────
INSERT INTO reciters (id, name, riwaya, license, source_name, source_url, is_visible)
VALUES 
  ('al-minshawy', 'الشيخ محمد صديق المنشاوي', 'hafs', 'public-domain', 'Egyptian Radio Archive', 'https://archive.org/details/ratil-al-minshawy-hafs', TRUE),
  ('al-husary', 'الشيخ محمود خليل الحصري', 'warsh', 'public-domain', 'Egyptian Radio Archive', 'https://archive.org/details/ratil-al-husary-warsh', TRUE),
  ('alafasy', 'الشيخ مشاري راشد العفاسي', 'hafs', 'public-domain', 'High Quality Studio Recording', 'https://archive.org/details/ratil-alafasy', TRUE)
ON CONFLICT (id) DO NOTHING;
