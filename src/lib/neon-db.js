/**
 * رتل - Ratil
 * موديول الاتصال بقاعدة بيانات Neon للحوكمة والبلاغات العلمية
 * src/lib/neon-db.js
 * 
 * المبادئ الحاكمة:
 * 1. مخصص حصرياً للعمليات الإدارية والبلاغات وتوثيق البصمات (بعيداً عن مسار القارئ والمستمع).
 * 2. يستخدم محرك WebSocket لتقليل استهلاك اتصالات TCP على الـ Serverless.
 * 3. يدعم العمل الآمن عند غياب DATABASE_URL في البيئات المحلية والتطوير.
 */

let neonModule = null;

async function loadNeon() {
  if (!neonModule) {
    try {
      neonModule = await import('@neondatabase/serverless');
      if (neonModule && neonModule.neonConfig) {
        neonModule.neonConfig.fetchConnectionCache = true;
      }
    } catch (e) {
      // التعامل الآمن إذا لم تكن الحزمة محملة بعد
    }
  }
  return neonModule;
}

/**
 * الحصول على عميل الاستعلام المباشر من Neon
 */
export async function getNeonClient() {
  const connectionString = (typeof process !== 'undefined' && process.env)
    ? (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL)
    : null;

  if (!connectionString) {
    return null;
  }

  const mod = await loadNeon();
  if (!mod || !mod.neon) {
    return null;
  }

  return mod.neon(connectionString);
}

/**
 * التحقق من صحة مدخلات البلاغ العلمي
 */
export function validateReportInput(report) {
  if (!report) return { valid: false, error: 'بيانات البلاغ فارغة' };
  const { surahId, ayaNumber, riwaya, description, reportType } = report;

  if (!surahId || surahId < 1 || surahId > 114) {
    return { valid: false, error: 'رقم السورة غير صالح (يجب أن يكون بين 1 و 114)' };
  }
  if (!ayaNumber || ayaNumber < 1) {
    return { valid: false, error: 'رقم الآية غير صالح' };
  }
  if (!riwaya || (riwaya !== 'hafs' && riwaya !== 'warsh')) {
    return { valid: false, error: 'الرواية يجب أن تكون حفص أو ورش' };
  }
  if (!description || description.trim().length < 5) {
    return { valid: false, error: 'وصف البلاغ قصير جداً (أقل من 5 أحرف)' };
  }
  const validTypes = ['timing_mismatch', 'audio_quality', 'text_display', 'other'];
  if (reportType && !validTypes.includes(reportType)) {
    return { valid: false, error: 'نوع البلاغ غير معروف' };
  }

  return { valid: true };
}

/**
 * تسجيل بلاغ علمي جديد عن خطأ في التوقيت أو الصوت في قاعدة بيانات Neon
 */
export async function submitScientificReport(report) {
  const validation = validateReportInput(report);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const sql = await getNeonClient();
  if (!sql) {
    // وضع المحاكاة الآمن عند عدم توفر قاعدة بيانات حية في بيئة التطوير
    return {
      id: 'mock-report-id-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'pending',
      simulated: true
    };
  }

  const { surahId, ayaNumber, riwaya, reciterId, reportType, timestampMs, description, reporterContact } = report;

  const result = await sql`
    INSERT INTO scientific_reports (
      surah_id, aya_number, riwaya, reciter_id, report_type, timestamp_ms, description, reporter_contact
    ) VALUES (
      ${surahId}, ${ayaNumber}, ${riwaya}, ${reciterId || null}, ${reportType || 'other'}, ${timestampMs || null}, ${description}, ${reporterContact || null}
    )
    RETURNING id, created_at, status;
  `;

  return result[0];
}

/**
 * تسجيل نتيجة فحص بصمات النصوص القرآنية في سجل الحوكمة
 */
export async function logIntegrityAudit(commitHash, hafsSha, warshSha, status = 'VERIFIED') {
  const sql = await getNeonClient();
  if (!sql) {
    return {
      id: 'mock-audit-id-' + Date.now(),
      audit_date: new Date().toISOString(),
      status,
      simulated: true
    };
  }

  const result = await sql`
    INSERT INTO text_integrity_audits (
      commit_hash, hafs_sha256, warsh_sha256, status
    ) VALUES (
      ${commitHash}, ${hafsSha}, ${warshSha}, ${status}
    )
    RETURNING id, audit_date, status;
  `;

  return result[0];
}
