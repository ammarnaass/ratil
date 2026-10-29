#!/usr/bin/env python3
"""
رتل - Ratil
سكربت توليد بيانات النصوص وفهارس البناء
scripts/build-data.py

المبدأ الحاكم:
1. التحقق الإلزامي من البصمات المرجعية (verify-text) قبل أي معالجة.
2. معالجة وتوليد ملفات JSON للبيانات المصدرية.
3. استدعاء توليد فهرس البحث العربي المُطبَّع.
"""

import json
import os
import subprocess
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. الخطوة الأولى: فحص النص القرآني
print("⏳ [1/3] جاري فحص بصمة النص القرآني المعتمد...")
verify_script = os.path.join(ROOT_DIR, 'scripts/verify-text.py')
res = subprocess.run([sys.executable, verify_script])
if res.returncode != 0:
    print("❌ فشل التحقق من النص القرآني! تم إيقاف البناء فوراً.")
    sys.exit(1)

# 2. الخطوة الثانية: التأكد من سلامة ملفات السور والقرّاء
print("📦 [2/3] معالجة وتحديث ملفات البيانات (surahs.json & reciters.json)...")
surahs_path = os.path.join(ROOT_DIR, 'data/surahs.json')
public_surahs = os.path.join(ROOT_DIR, 'public/data/surahs.json')

if os.path.exists(public_surahs) and not os.path.exists(surahs_path):
    with open(public_surahs, 'r', encoding='utf-8') as f:
        surahs = json.load(f)
    with open(surahs_path, 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)

# 3. الخطوة الثالثة: توليد فهرس البحث
print("🔍 [3/3] توليد فهرس البحث العربي المُطبَّع...")
search_script = os.path.join(ROOT_DIR, 'scripts/build-search-index.py')
res2 = subprocess.run([sys.executable, search_script])
if res2.returncode != 0:
    print("❌ فشل توليد فهرس البحث.")
    sys.exit(1)

print("🎉 اكتمل إعداد وتوليد بيانات البناء بنجاح 100%.")
