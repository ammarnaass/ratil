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
    // حفظ محلي آمن عند عدم توفر اتصال قاعدة بيانات مباشرة في بيئة التطوير
    return {
      id: 'rep_' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      status: 'pending'
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
      id: 'audit_' + Date.now().toString(36),
      audit_date: new Date().toISOString(),
      status
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

/**
 * استرجاع قائمة البلاغات العلمية للحوكمة والتدقيق
 */
export async function getScientificReports({ limit = 20, status = null } = {}) {
  const sql = await getNeonClient();
  if (!sql) {
    return [];
  }
  try {
    if (status) {
      return await sql`
        SELECT * FROM scientific_reports
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    }
    return await sql`
      SELECT * FROM scientific_reports
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
  } catch (err) {
    return [];
  }
}

/**
 * تسجيل مستخدم جديد في قاعدة بيانات Neon
 */
export async function createUser({ email, username, displayName, passwordHash, salt, role = 'user', riwayaPreference = 'hafs' }) {
  const sql = await getNeonClient();
  if (!sql) {
    return {
      id: 'usr_' + Date.now().toString(36),
      email,
      displayName,
      role,
      created_at: new Date().toISOString()
    };
  }

  const result = await sql`
    INSERT INTO users (
      email, username, display_name, password_hash, salt, role, riwaya_preference
    ) VALUES (
      ${email.toLowerCase()}, ${username || null}, ${displayName}, ${passwordHash}, ${salt}, ${role}, ${riwayaPreference}
    )
    RETURNING id, email, display_name, role, riwaya_preference, created_at;
  `;

  return result[0];
}

/**
 * البحث عن مستخدم بالبريد الإلكتروني
 */
export async function getUserByEmail(email) {
  const sql = await getNeonClient();
  if (!sql || !email) return null;

  try {
    const result = await sql`
      SELECT * FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1;
    `;
    return result[0] || null;
  } catch {
    return null;
  }
}

/**
 * تحديث تاريخ آخر تسجيل دخول للمستخدم
 */
export async function updateUserLastLogin(userId) {
  const sql = await getNeonClient();
  if (!sql || !userId) return;

  try {
    await sql`
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${userId};
    `;
  } catch {
    // تجاهل الأخطاء الصامتة
  }
}

