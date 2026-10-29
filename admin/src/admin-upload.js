/**
 * رتل - Ratil
 * Cloudflare Worker: admin-upload.js
 * خدمة إنشاء روابط الرفع المباشرة إلى Cloudflare R2
 * ومصادقة عمليات الإدارة وإعادة البناء
 */

function isValidAdmin(authHeader, adminSecret) {
  if (!authHeader || !adminSecret) return false;
  // يدعم كلاً من Bearer Token و Basic Auth
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return token === adminSecret;
  }
  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.substring(6).trim());
      const [, password] = decoded.split(':');
      return password === adminSecret;
    } catch {
      return false;
    }
  }
  return authHeader.trim() === adminSecret;
}

export default {
  async fetch(request, env) {
    // التعامل مع طلبات CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
    };

    // 1. التحقق من صلاحيات المدير
    const auth = request.headers.get('Authorization');
    if (!isValidAdmin(auth, env.ADMIN_SECRET)) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح: مفتاح المدير غير صحيح أو مفقود' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const url = new URL(request.url);

    // 2. مسار تفعيل إعادة البناء (Webhook إلى GitHub Actions)
    if (url.pathname === '/api/trigger-build' && request.method === 'POST') {
      if (!env.GITHUB_DISPATCH_TOKEN || !env.GITHUB_REPO) {
        return new Response(
          JSON.stringify({ error: 'إعدادات GitHub Actions غير مهيأة في بيئة العمل' }),
          { status: 500, headers: corsHeaders }
        );
      }

      const ghResponse = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
        {
          method: 'POST',
          headers: {
            'User-Agent': 'Ratil-Cloudflare-Worker',
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${env.GITHUB_DISPATCH_TOKEN}`,
          },
          body: JSON.stringify({ event_type: 'admin_rebuild' }),
        }
      );

      if (!ghResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'فشل إرسال إشعار البناء إلى GitHub Actions' }),
          { status: 502, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'تم إطلاق بناء جديد بنجاح' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 3. مسار إنشاء رابط رفع الصوتيات إلى R2
    if (url.pathname === '/api/upload-url' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { reciterId, filename, surahId } = body;

        if (!reciterId || !filename) {
          return new Response(
            JSON.stringify({ error: 'reciterId و filename حقول مطلوبة' }),
            { status: 400, headers: corsHeaders }
          );
        }

        // تنظيف وتأمين مسار الملف لمنع Path Traversal
        const safeReciterId = reciterId.replace(/[^a-zA-Z0-9_-]/g, '');
        const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
        const key = `audio/${safeReciterId}/${safeFilename}`;

        // إذا كان ارتباط R2 متوفراً في البيئة
        if (env.R2) {
          const upload = await env.R2.createMultipartUpload(key);
          return new Response(
            JSON.stringify({
              success: true,
              upload_id: upload.uploadId,
              key: key,
              reciterId: safeReciterId,
              surahId: surahId || null,
              expires_in: 900 // 15 دقيقة
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            key: key,
            message: 'تم توليد مسار المفتاح بنجاح (ارتباط R2 يحتاج للربط في wrangler.toml)'
          }),
          { status: 200, headers: corsHeaders }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'خطأ في معالجة طلب الرفع: ' + err.message }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'المسار غير موجود' }),
      { status: 404, headers: corsHeaders }
    );
  }
};
