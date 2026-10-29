import urllib.request
import json
import subprocess
import os

PROJECT_ID = '339375098252776117'
API_URL = 'https://stitch.googleapis.com/mcp'
API_KEY = os.environ.get('STITCH_API_KEY', '')

NEW_SCREENS = [
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

# Filter out if any of the new ones already exist by id
existing_ids = {m["id"] for m in all_metadata}

print(f"Starting retrieval of {len(NEW_SCREENS)} screens from project {PROJECT_ID}...")

for item in NEW_SCREENS:
    idx = item["index"]
    sid = item["id"]
    title = item["title"]
    slug = item["slug"]
    folder_name = item["folder"]
    folder_path = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    print(f"[{idx}] Fetching screen: {title} ({sid})...")
    
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
        
        # update or append
        all_metadata = [m for m in all_metadata if m["id"] != sid]
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

# Sort metadata by index
all_metadata.sort(key=lambda x: x["index"])

# Save updated full metadata JSON
with open(screens_json_path, 'w', encoding='utf-8') as f:
    json.dump(all_metadata, f, indent=2, ensure_ascii=False)

print(f"\nBatch download completed! Total screens tracked: {len(all_metadata)}")
