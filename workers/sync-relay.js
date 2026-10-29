/**
 * رتل - Ratil
 * خادم الوسيط الأعمى للمزامنة المشفرة (Zero-Knowledge Sync Relay)
 * workers/sync-relay.js
 * 
 * المبادئ الحاكمة:
 * 1. لا يعرف هوية أحد (No Email, No Name, No Personal Data).
 * 2. لا يستطيع فك تشفير المحتوى (مستودع بايتات عمياء مشفرة بـ AES-GCM-256 محلياً).
 * 3. يخزن ويسترجع البيانات عبر مفتاح بحث أعمى مشتق محلياً (Storage Key Hash).
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 1. رفع البيانات المشفرة (POST /api/sync)
    if (url.pathname === '/api/sync' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { storageKey, encryptedBase64, timestamp } = body;

        if (!storageKey || !encryptedBase64) {
          return new Response(
            JSON.stringify({ error: 'حقول storageKey و encryptedBase64 مطلوبة' }),
            { status: 400, headers: corsHeaders }
          );
        }

        // حد أقصى للحجم (100 كيلوبايت) لمنع الإساءة
        if (encryptedBase64.length > 100 * 1024) {
          return new Response(
            JSON.stringify({ error: 'حجم البيانات يتجاوز الحد المسموح (100KB)' }),
            { status: 413, headers: corsHeaders }
          );
        }

        // إذا كان ارتباط KV متوفراً في البيئة
        if (env.RATIL_SYNC_KV) {
          await env.RATIL_SYNC_KV.put(
            storageKey,
            JSON.stringify({ encryptedBase64, timestamp: timestamp || Date.now() }),
            { expirationTtl: 180 * 24 * 60 * 60 } // تنتهي الصلاحية بعد 180 يوماً من عدم النشاط
          );
        }

        return new Response(
          JSON.stringify({ success: true, updated_at: timestamp || Date.now() }),
          { status: 200, headers: corsHeaders }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'خطأ في معالجة طلب المزامنة: ' + err.message }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // 2. سحب البيانات المشفرة بجهاز آخر (GET /api/sync?key=...)
    if (url.pathname === '/api/sync' && request.method === 'GET') {
      const storageKey = url.searchParams.get('key');
      if (!storageKey) {
        return new Response(
          JSON.stringify({ error: 'معلمة البحث key مطلوبة' }),
          { status: 400, headers: corsHeaders }
        );
      }

      if (!env.RATIL_SYNC_KV) {
        return new Response(
          JSON.stringify({ error: 'بيئة RATIL_SYNC_KV غير مهيأة بعد' }),
          { status: 503, headers: corsHeaders }
        );
      }

      const payload = await env.RATIL_SYNC_KV.get(storageKey);
      if (!payload) {
        return new Response(
          JSON.stringify({ error: 'لم يتم العثور على بيانات مزامنة لهذا المفتاح' }),
          { status: 404, headers: corsHeaders }
        );
      }

      return new Response(payload, { status: 200, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({ error: 'المسار غير موجود' }),
      { status: 404, headers: corsHeaders }
    );
  }
};
