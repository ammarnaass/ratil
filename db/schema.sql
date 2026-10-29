-- رتل - Ratil
-- مخطط قاعدة بيانات الحوكمة والبلاغات العلمية وتوثيق البصمات والتراخيص والمستخدمين
-- db/schema.sql (Neon Serverless Postgres)

-- 1. جدول البلاغات العلمية عن الأخطاء في التلاوة أو النص
CREATE TABLE IF NOT EXISTS scientific_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surah_id INTEGER NOT NULL CHECK (surah_id BETWEEN 1 AND 114),
    aya_number INTEGER NOT NULL,
    riwaya VARCHAR(20) NOT NULL CHECK (riwaya IN ('hafs', 'warsh')),
    reciter_id VARCHAR(50),
    report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('timing_mismatch', 'audio_quality', 'text_display', 'other')),
    timestamp_ms INTEGER,
    description TEXT NOT NULL,
    reporter_contact VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified_fixed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. جدول سجل تدقيق البصمات الرقمية وسلامة النصوص القرآنية
CREATE TABLE IF NOT EXISTS text_integrity_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_hash VARCHAR(64) NOT NULL,
    hafs_sha256 VARCHAR(64) NOT NULL,
    warsh_sha256 VARCHAR(64) NOT NULL,
    verified_by VARCHAR(50) DEFAULT 'CI/CD Automated Script',
    status VARCHAR(20) NOT NULL,
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول توثيق تراخيص وأصول التلاوات الصوتية
CREATE TABLE IF NOT EXISTS audio_licenses_registry (
    reciter_id VARCHAR(50) PRIMARY KEY,
    reciter_name VARCHAR(100) NOT NULL,
    riwaya VARCHAR(20) NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    archive_identifier VARCHAR(100) NOT NULL,
    source_attribution TEXT NOT NULL,
    verified_date DATE NOT NULL
);

-- 4. جدول حسابات المستخدمين للمصادقة والمزامنة
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'auditor', 'admin')),
    riwaya_preference VARCHAR(20) DEFAULT 'hafs' CHECK (riwaya_preference IN ('hafs', 'warsh', 'qalun')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- فهارس تحسين أداء الاستعلامات
CREATE INDEX IF NOT EXISTS idx_reports_surah ON scientific_reports(surah_id, aya_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON scientific_reports(status);
CREATE INDEX IF NOT EXISTS idx_audits_commit ON text_integrity_audits(commit_hash);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
