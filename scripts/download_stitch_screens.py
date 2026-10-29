import urllib.request
import json
import subprocess
import os

PROJECT_ID = '339375098252776117'
API_URL = 'https://stitch.googleapis.com/mcp'
API_KEY = os.environ.get('STITCH_API_KEY', '')

SCREENS = [
    {
        "index": 1,
        "slug": "01_signup",
        "folder": "01_signup",
        "id": "297ca81b260f435689d8ee5e046f22dd",
        "title": "إنشاء حساب — رتل"
    },
    {
        "index": 2,
        "slug": "02_login",
        "folder": "02_login",
        "id": "6d0f7ed710294c3088a39627acb4a8ff",
        "title": "تسجيل الدخول — رتل"
    },
    {
        "index": 3,
        "slug": "03_home_mobile",
        "folder": "03_home_mobile",
        "id": "58d8e75a787944ed949346279a61470d",
        "title": "الرئيسية — رتل"
    },
    {
        "index": 4,
        "slug": "04_reciters_index",
        "folder": "04_reciters_index",
        "id": "7ec8c0dece52487db2594b7110b96f23",
        "title": "فهرس القرّاء — رتل"
    },
    {
        "index": 5,
        "slug": "05_home_desktop",
        "folder": "05_home_desktop",
        "id": "e016b21e00ad44a7b1021fa5936f2bd9",
        "title": "الرئيسية — رتل (كمبيوتر)"
    },
    {
        "index": 6,
        "slug": "06_surah_kahf",
        "folder": "06_surah_kahf",
        "id": "0983f1013d3b40428848c12f8c142893",
        "title": "سورة الكهف — استماع وقراءة"
    },
    {
        "index": 7,
        "slug": "07_reciter_minshawi",
        "folder": "07_reciter_minshawi",
        "id": "4af62fa5387442b0b9ad59532ff4d909",
        "title": "ملف القارئ: المنشاوي — رتل"
    },
    {
        "index": 8,
        "slug": "08_browse_mushaf_desktop",
        "folder": "08_browse_mushaf_desktop",
        "id": "2e71447593f24705a86181cbd1484cd0",
        "title": "تصفح المصحف — رتل (كمبيوتر)"
    },
    {
        "index": 9,
        "slug": "09_choose_reciter",
        "folder": "09_choose_reciter",
        "id": "389713e03933438b8cf4c4e4f425a847",
        "title": "اختيار القارئ — رتل"
    },
    {
        "index": 10,
        "slug": "10_browse_mushaf_mobile",
        "folder": "10_browse_mushaf_mobile",
        "id": "86dfd06aff3342e688354ea527c66ead",
        "title": "تصفح المصحف — رتل"
    }
]

OUTPUT_DIR = '/home/ammar/ratil/stitch-screens'
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    'X-Goog-Api-Key': API_KEY,
    'Content-Type': 'application/json'
}

all_metadata = []

print(f"Starting retrieval of {len(SCREENS)} screens from project {PROJECT_ID}...")

for item in SCREENS:
    idx = item["index"]
    sid = item["id"]
    title = item["title"]
    slug = item["slug"]
    folder_name = item["folder"]
    folder_path = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    print(f"[{idx}/10] Fetching screen: {title} ({sid})...")
    
    call_body = {
        'jsonrpc': '2.0',
        'id': idx,
        'method': 'tools/call',
        'params': {
            'name': 'get_screen',
            'arguments': {
                'name': f'projects/{PROJECT_ID}/screens/{sid}'
            }
        }
    }
    
    req = urllib.request.Request(API_URL, data=json.dumps(call_body).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        sc = res.get('result', {}).get('structuredContent', {})
        
        device_type = sc.get('deviceType', 'UNKNOWN')
        width = sc.get('width', '')
        height = sc.get('height', '')
        html_url = sc.get('htmlCode', {}).get('downloadUrl', '')
        img_url = sc.get('screenshot', {}).get('downloadUrl', '')

        meta = {
            "index": idx,
            "id": sid,
            "title": title,
            "slug": slug,
            "folder": folder_name,
            "deviceType": device_type,
            "width": width,
            "height": height,
            "htmlDownloadUrl": html_url,
            "screenshotDownloadUrl": img_url,
            "htmlFile": f"{folder_name}/index.html",
            "screenshotFile": f"{folder_name}/screenshot.png"
        }
        all_metadata.append(meta)

        # Save metadata inside screen folder
        with open(os.path.join(folder_path, 'metadata.json'), 'w', encoding='utf-8') as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)

        # Download HTML using curl -L
        html_dest = os.path.join(folder_path, 'index.html')
        html_dest_flat = os.path.join(OUTPUT_DIR, f"{slug}.html")
        print(f"    Downloading HTML with curl -L...")
        subprocess.run(['curl', '-L', '-s', html_url, '-o', html_dest], check=True)
        subprocess.run(['cp', html_dest, html_dest_flat], check=True)

        # Download Screenshot using curl -L
        img_dest = os.path.join(folder_path, 'screenshot.png')
        img_dest_flat = os.path.join(OUTPUT_DIR, f"{slug}.png")
        print(f"    Downloading Screenshot with curl -L...")
        subprocess.run(['curl', '-L', '-s', img_url, '-o', img_dest], check=True)
        subprocess.run(['cp', img_dest, img_dest_flat], check=True)

        html_size = os.path.getsize(html_dest)
        img_size = os.path.getsize(img_dest)
        print(f"    -> Done! HTML: {html_size:,} bytes, Screenshot: {img_size:,} bytes")

# Save full metadata JSON
with open(os.path.join(OUTPUT_DIR, 'screens.json'), 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

print("\nAll 10 screens downloaded successfully!")
