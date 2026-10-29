import urllib.request
import json
import base64
import os

PROJECT_ID = '339375098252776117'
API_KEY = os.environ.get('STITCH_API_KEY', '')

TARGET_SCREENS = [
    {
        "index": 11,
        "slug": "11_admin_overview",
        "folder": "11_admin_overview",
        "id": "3a74510ff2bc462298d4cfb0fd23a3ec",
        "title": "رتل الإدارية — نظرة عامة"
    },
    {
        "index": 12,
        "slug": "12_reports_errors",
        "folder": "12_reports_errors",
        "id": "263d891d10c946afba4a497b0cf63fba",
        "title": "البلاغات والأخطاء — رتل"
    },
    {
        "index": 13,
        "slug": "13_audio_files",
        "folder": "13_audio_files",
        "id": "52752d61920e4302994540a7636f53fb",
        "title": "إدارة الملفات الصوتية — رتل"
    },
    {
        "index": 14,
        "slug": "14_text_integrity",
        "folder": "14_text_integrity",
        "id": "1563636b6775402eb736a4058a8477f7",
        "title": "سلامة النص القرآني — رتل"
    },
    {
        "index": 15,
        "slug": "15_reciters_admin",
        "folder": "15_reciters_admin",
        "id": "d670546cc49243759a7a3047465e699e",
        "title": "إدارة القرّاء — رتل"
    },
    {
        "index": 16,
        "slug": "16_bookmarks_desktop",
        "folder": "16_bookmarks_desktop",
        "id": "da974ce37d0e45e897104cfa2bb0098c",
        "title": "المحفوظات — رتل (كمبيوتر)"
    },
    {
        "index": 17,
        "slug": "17_reciters_desktop",
        "folder": "17_reciters_desktop",
        "id": "14bc4ed72f354ca183c8c00f94897251",
        "title": "القرّاء — رتل (كمبيوتر)"
    }
]

OUTPUT_DIR = '/home/ammar/ratil/stitch-screens'
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    'X-Goog-Api-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Load existing metadata if available
screens_json_path = os.path.join(OUTPUT_DIR, 'screens.json')
if os.path.exists(screens_json_path):
    with open(screens_json_path, 'r', encoding='utf-8') as f:
        all_metadata = json.load(f)
else:
    all_metadata = []

print(f"Starting retrieval of {len(TARGET_SCREENS)} screens from project {PROJECT_ID}...")

for item in TARGET_SCREENS:
    idx = item["index"]
    sid = item["id"]
    title = item["title"]
    slug = item["slug"]
    folder_name = item["folder"]
    folder_path = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    print(f"\n[{idx}] Fetching screen metadata: {title} ({sid})...")
    
    # 1. Fetch screen info
    screen_api_url = f"https://stitch.googleapis.com/v1/projects/{PROJECT_ID}/screens/{sid}"
    req = urllib.request.Request(screen_api_url, headers={'X-Goog-Api-Key': API_KEY})
    with urllib.request.urlopen(req) as resp:
        sc = json.loads(resp.read().decode('utf-8'))
        
    device_type = sc.get('deviceType', 'DESKTOP')
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

    # 2. Download HTML
    print(f"    Downloading HTML ({html_url})...")
    req_html = urllib.request.Request(html_url, headers={'X-Goog-Api-Key': API_KEY})
    with urllib.request.urlopen(req_html) as resp:
        res_json = json.loads(resp.read().decode('utf-8'))
        html_content = res_json.get('dataString', '')

    html_dest = os.path.join(folder_path, 'index.html')
    html_dest_flat = os.path.join(OUTPUT_DIR, f"{slug}.html")
    with open(html_dest, 'w', encoding='utf-8') as f:
        f.write(html_content)
    with open(html_dest_flat, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # 3. Download Screenshot
    print(f"    Downloading Screenshot ({img_url})...")
    req_img = urllib.request.Request(img_url, headers={'X-Goog-Api-Key': API_KEY})
    with urllib.request.urlopen(req_img) as resp:
        res_json = json.loads(resp.read().decode('utf-8'))
        b64_img = res_json.get('dataString', '')
        img_bytes = base64.b64decode(b64_img)

    img_dest = os.path.join(folder_path, 'screenshot.png')
    img_dest_flat = os.path.join(OUTPUT_DIR, f"{slug}.png")
    with open(img_dest, 'wb') as f:
        f.write(img_bytes)
    with open(img_dest_flat, 'wb') as f:
        f.write(img_bytes)

    # 4. Save metadata
    with open(os.path.join(folder_path, 'metadata.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    # Update global list
    all_metadata = [m for m in all_metadata if m["id"] != sid]
    all_metadata.append(meta)

    print(f"    -> Successfully saved {title}: HTML {len(html_content):,} chars, PNG {len(img_bytes):,} bytes")

# Sort metadata by index
all_metadata.sort(key=lambda x: x["index"])

# Save updated full metadata JSON
with open(screens_json_path, 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

print(f"\nAll 7 screens successfully retrieved and updated!")
