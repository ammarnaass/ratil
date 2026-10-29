#!/usr/bin/env python3
"""
رتل - Ratil
توليد فهرس البحث العربي المُطبَّع
scripts/build-search-index.py
"""

import json
import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def normalize_arabic(text):
    if not text:
        return ""
    # حذف التشكيل
    text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    # توحيد الهمزات
    text = re.sub(r'[أإآٱ]', 'ا', text)
    # توحيد الياء
    text = re.sub(r'ى', 'ي', text)
    # توحيد التاء المربوطة
    text = re.sub(r'ة', 'ه', text)
    return text.strip()

# خريطة الأسماء اللاتينية للبحث السريع
LATIN_MAP = {
    'fatiha': 1, 'baqara': 2, 'imran': 3, 'nisa': 4, 'maidah': 5,
    'anam': 6, 'araf': 7, 'anfal': 8, 'tawbah': 9, 'yunus': 10,
    'hud': 11, 'yusuf': 12, 'rad': 13, 'ibrahim': 14, 'hijr': 15,
    'nahl': 16, 'isra': 17, 'kahf': 18, 'maryam': 19, 'taha': 20,
    'yasin': 36, 'rahman': 55, 'waqiah': 56, 'mulk': 67, 'naba': 78,
    'ikhlas': 112, 'falaq': 113, 'nas': 114
}

surahs_path = os.path.join(ROOT_DIR, 'data/surahs.json')
if not os.path.exists(surahs_path):
    surahs_path = os.path.join(ROOT_DIR, 'public/data/surahs.json')

with open(surahs_path, 'r', encoding='utf-8') as f:
    surahs = json.load(f)

index = []
for s in surahs:
    surah_id = s.get('id')
    name = s.get('name') or s.get('name_ar', '')
    index.append({
        'id': surah_id,
        'name': name,
        'name_normalized': normalize_arabic(name),
        'latin': [k for k, v in LATIN_MAP.items() if v == surah_id],
        'num': surah_id,
        'ayahs_hafs': s.get('ayahs_hafs', 0),
        'ayahs_warsh': s.get('ayahs_warsh', 0),
        'type': s.get('type', '')
    })

# ضمان وجود مجلد data ومجلد public
os.makedirs(os.path.join(ROOT_DIR, 'data'), exist_ok=True)
os.makedirs(os.path.join(ROOT_DIR, 'public'), exist_ok=True)

out_public = os.path.join(ROOT_DIR, 'public/search-index.json')
with open(out_public, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

out_data = os.path.join(ROOT_DIR, 'data/surahs.json')
if not os.path.exists(out_data):
    with open(out_data, 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)

print(f"✅ Search index generated: {len(index)} surahs -> {out_public}")
