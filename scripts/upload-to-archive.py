#!/usr/bin/env python3
"""
رتل - سكريبت أرشفة التلاوات الآمن على Archive.org
scripts/upload-to-archive.py

يرفع التلاوات إلى archive.org كأصل دائم وملاذ أخير مع:
- حساب بصمة SHA-256 للملف الصوتي
- حظر الاشتقاق والتعديل التلقائي (derive=False)
- حقن بيانات المشاع العام والتراخيص القرآنية المعتمدة
"""

import os
import sys
import json
import hashlib
import argparse

def compute_sha256(filepath):
    """حساب بصمة SHA-256 للتأكد من سلامة بايتات التلاوة"""
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def build_metadata(reciter_name, riwaya, surah_id, file_hash):
    """بناء البيانات الوصفية الموحدة لعنصر التلاوة على أرشيف الإنترنت"""
    return {
        'collection': 'opensource_audio',
        'mediatype': 'audio',
        'creator': reciter_name,
        'subject': f"Quran;Ratil;{riwaya};{reciter_name};Surah_{surah_id}",
        'licenseurl': 'https://creativecommons.org/publicdomain/mark/1.0/',
        'description': f"تلاوة مصحف رتل المعتمدة - سورة {surah_id} - بصمة البايتات SHA-256: {file_hash}",
        'notes': 'Uploaded with no-derive policy for exact byte integrity.'
    }

def get_archive_identifier(riwaya, reciter_id):
    """توليد المعرف الفريد لعنصر الأرشيف"""
    clean_riwaya = riwaya.lower().strip()
    clean_reciter = reciter_id.lower().strip().replace('_', '-')
    return f"ratil-quran-{clean_riwaya}-{clean_reciter}"

def upload_file(reciter_id, riwaya, reciter_name, surah_id, file_path, dry_run=False):
    if not os.path.isfile(file_path):
        print(f"❌ الملف الصوتي غير موجود: {file_path}")
        return False

    file_hash = compute_sha256(file_path)
    file_name = os.path.basename(file_path)
    item_id = get_archive_identifier(riwaya, reciter_id)
    metadata = build_metadata(reciter_name, riwaya, surah_id, file_hash)
    direct_url = f"https://archive.org/download/{item_id}/{file_name}"

    print(f"📦 تجهيز التلاوة: {file_name}")
    print(f"   - المعرف في أرشيف: {item_id}")
    print(f"   - القارئ: {reciter_name} ({riwaya})")
    print(f"   - بصمة SHA-256: {file_hash}")
    print(f"   - الرابط المباشر المتوقع: {direct_url}")

    if dry_run:
        print("🔍 وضع المعاينة (Dry-run): تم التحقق من سلامة البيانات دون إرسال طلب الشبكة.")
        return direct_url

    access_key = os.environ.get('IA_ACCESS_KEY')
    secret_key = os.environ.get('IA_SECRET_KEY')
    if not access_key or not secret_key:
        print("⚠️ مفاتيح IA_ACCESS_KEY و IA_SECRET_KEY غير موجودة في بيئة العمل.")
        print("   يمكنك توليد المفاتيح من: https://archive.org/account/s3.php")
        print("   (استخدم خيار --dry-run للمعاينة والتحقق فقط).")
        return False

    try:
        from internetarchive import get_item
        item = get_item(item_id)
        print(f"⏳ جاري الرفع إلى Archive.org مع خيار حظر الاشتقاق (--no-derive)...")
        response = item.upload(
            file_path,
            metadata=metadata,
            access_key=access_key,
            secret_key=secret_key,
            derive=False,
            verify=True,
            retries=5
        )

        if response and response[0].status_code in [200, 201]:
            print(f"✅ تم الرفع بنجاح!")
            print(f"🔗 الرابط الدائم: {direct_url}")
            return direct_url
        else:
            status = response[0].status_code if response else 'Unknown'
            print(f"❌ فشل الرفع: كود الحالة {status}")
            return False
    except ImportError:
        print("⚠️ حزمة internetarchive غير مثبتة. يرجى تثبيتها عبر: pip install internetarchive")
        return False
    except Exception as e:
        print(f"❌ خطأ أثناء الرفع: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="رفع التلاوات القرآنية إلى أرشيف الإنترنت مع التحقق من البصمة")
    parser.add_argument("--reciter", required=True, help="معرف القارئ (مثل: al-minshawy)")
    parser.add_argument("--riwaya", default="hafs", help="الرواية (hafs أو warsh)")
    parser.add_argument("--name", required=True, help="اسم القارئ")
    parser.add_argument("--surah", type=int, required=True, help="رقم السورة (1-114)")
    parser.add_argument("--file", required=True, help="مسار ملف الصوت MP3")
    parser.add_argument("--dry-run", action="store_true", help="تشغيل اختباري دون رفع فعلي")

    args = parser.parse_args()
    success = upload_file(
        reciter_id=args.reciter,
        riwaya=args.riwaya,
        reciter_name=args.name,
        surah_id=args.surah,
        file_path=args.file,
        dry_run=args.dry_run
    )

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
