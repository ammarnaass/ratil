#!/usr/bin/env python3
"""
رتل - Ratil
فحص سلامة النص القرآني المعتمد (SHA-256)
scripts/verify-text.py

المبدأ الحاكم الأول: النص القرآني لا يُكتب ولا يُعدل يدوياً؛
يُستورد من مصدر معتمد ويُتحقق من بصمته (SHA-256).
أي اختلاف، ولو في حركة أو مسافة واحدة، يُفشل البناء فوراً بكود خطأ (Exit Code 1).
"""

import hashlib
import json
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAFS_SOURCE = os.path.join(ROOT_DIR, 'data/source/quran-hafs.txt')
if not os.path.exists(HAFS_SOURCE):
    HAFS_SOURCE = os.path.join(ROOT_DIR, 'data/source/quran-uthmani-hafs.txt')

CHECKSUMS_FILE = os.path.join(ROOT_DIR, 'data/checksums.json')

if not os.path.exists(HAFS_SOURCE):
    print(f"❌ Source file not found: {HAFS_SOURCE}")
    sys.exit(1)

if not os.path.exists(CHECKSUMS_FILE):
    print(f"❌ Checksums file not found: {CHECKSUMS_FILE}")
    sys.exit(1)

with open(HAFS_SOURCE, 'rb') as f:
    actual = hashlib.sha256(f.read()).hexdigest()

with open(CHECKSUMS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
    expected = data.get('hafs') or data.get('sources', {}).get('hafs', {}).get('sha256')

if actual != expected:
    print(f"❌ CHECKSUM MISMATCH")
    print(f"Expected: {expected}")
    print(f"Actual:   {actual}")
    sys.exit(1)          # يوقف البناء

print(f"✅ Text verified: {actual}")
