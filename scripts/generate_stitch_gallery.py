import json
import os

screens_file = '/home/ammar/ratil/stitch-screens/screens.json'
with open(screens_file, 'r', encoding='utf-8') as f:
    screens = json.load(f)

# Sort by index
screens.sort(key=lambda s: s.get('index', 0))

# 1. Generate clean README.md
readme = ['# شاشات مشروع رتل — Stitch Screens\n']
readme.append('**اسم المشروع:** Ratil Admin Quran Platform  ')
readme.append('**معرف المشروع في Stitch:** `339375098252776117`  ')
readme.append('**تاريخ التحميل:** 2026-10-27  ')
readme.append(f'**إجمالي الشاشات:** {len(screens)} شاشة  \n')
readme.append('---\n')
readme.append('## فهرس الشاشات المرجعية الشامل\n')
readme.append('| # | اسم الشاشة | المعرف (ID) | الجهاز | الأبعاد | كود HTML | لقطة الشاشة |')
readme.append('|---|---|---|---|---|---|---|')

for s in screens:
    idx = s['index']
    title = s['title']
    sid = s['id']
    device = 'كمبيوتر 💻' if s['deviceType'] == 'DESKTOP' else 'جوال 📱'
    dims = f"{s['width']}×{s['height']}"
    html_link = f"[{s['slug']}.html](./{s['slug']}.html)"
    img_link = f"[عرض الصورة](./{s['slug']}.png)"
    readme.append(f"| {idx} | **{title}** | `{sid[:8]}...` | {device} | {dims} | {html_link} | {img_link} |")

readme.append('\n---\n')
readme.append('## تفاصيل الشاشات\n')

for s in screens:
    idx = s['index']
    title = s['title']
    sid = s['id']
    device = 'شاشة كمبيوتر (Desktop)' if s['deviceType'] == 'DESKTOP' else 'شاشة جوال (Mobile)'
    dims = f"{s['width']} × {s['height']} بكسل"
    folder = s['folder']
    slug = s['slug']

    readme.append(f"### {idx}. {title}")
    readme.append(f"- **معرف الشاشة الكامل:** `{sid}`")
    readme.append(f"- **نوع الجهاز:** {device}")
    readme.append(f"- **الأبعاد الأصلية:** {dims}")
    readme.append(f"- **ملفات الشاشة:**")
    readme.append(f"  - المجلد المستقل: [`stitch-screens/{folder}/`](./{folder}/)")
    readme.append(f"  - كود الواجهة: [`{slug}.html`](./{slug}.html) ([المجلد](./{folder}/index.html))")
    readme.append(f"  - لقطة الشاشة: [`{slug}.png`](./{slug}.png) ([المجلد](./{folder}/screenshot.png))")
    readme.append(f"  - البيانات الوصفية: [`{folder}/metadata.json`](./{folder}/metadata.json)\n")
    readme.append(f"![{title}](./{slug}.png)\n")
    readme.append('---\n')

with open('/home/ammar/ratil/stitch-screens/README.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(readme))

# Counts
desktop_count = sum(1 for s in screens if s['deviceType'] == 'DESKTOP')
mobile_count = sum(1 for s in screens if s['deviceType'] == 'MOBILE')
admin_count = sum(1 for s in screens if 'admin' in s['slug'] or s['index'] in [11, 12, 13, 14, 15])

# 2. Generate Interactive Gallery index.html
gallery_html = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معرض شاشات رتل الشامل — Stitch Screens Gallery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #111318;
      --surface: #1a1c22;
      --surface-card: #21242c;
      --border: #2e333d;
      --primary: #3ecfb2;
      --primary-hover: #5be3c8;
      --text: #f0f2f5;
      --text-muted: #9ba3af;
      --badge-desktop: #2563eb;
      --badge-mobile: #10b981;
      --badge-admin: #8b5cf6;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;
    }}
    body {{
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2.5rem 1.5rem;
    }}
    .container {{
      max-width: 1440px;
      margin: 0 auto;
    }}
    header {{
      text-align: center;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2rem;
    }}
    .brand {{
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }}
    .brand-dot {{
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 16px var(--primary);
    }}
    h1 {{
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .subtitle {{
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-top: 0.5rem;
    }}
    .meta-badges {{
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }}
    .meta-badge {{
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }}
    .meta-badge strong {{
      color: var(--primary);
      margin-left: 0.25rem;
    }}
    .filters {{
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }}
    .filter-btn {{
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }}
    .filter-btn:hover, .filter-btn.active {{
      background: var(--primary);
      color: #0c1815;
      border-color: var(--primary);
      font-weight: 600;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }}
    .card {{
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    }}
    .card:hover {{
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
    }}
    .preview-box {{
      position: relative;
      background: #000;
      height: 380px;
      overflow: hidden;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      cursor: pointer;
    }}
    .preview-img {{
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s;
    }}
    .preview-box:hover .preview-img {{
      transform: scale(1.02);
    }}
    .preview-overlay {{
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      gap: 0.5rem;
    }}
    .preview-box:hover .preview-overlay {{
      opacity: 1;
    }}
    .card-body {{
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }}
    .card-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }}
    .screen-number {{
      font-size: 0.85rem;
      color: var(--primary);
      font-weight: 700;
    }}
    .badges-row {{
      display: flex;
      gap: 0.4rem;
    }}
    .device-badge {{
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      text-transform: uppercase;
    }}
    .device-badge.desktop {{
      background: rgba(37, 99, 235, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(37, 99, 235, 0.3);
    }}
    .device-badge.mobile {{
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }}
    .device-badge.admin {{
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }}
    .card-title {{
      font-size: 1.15rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }}
    .card-meta {{
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      font-family: monospace;
      direction: ltr;
      text-align: right;
    }}
    .card-actions {{
      display: flex;
      gap: 0.75rem;
      margin-top: auto;
    }}
    .btn {{
      flex: 1;
      text-align: center;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }}
    .btn-primary {{
      background: var(--primary);
      color: #0a1815;
      font-weight: 600;
    }}
    .btn-primary:hover {{
      background: var(--primary-hover);
    }}
    .btn-secondary {{
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }}
    .btn-secondary:hover {{
      background: #2b303c;
    }}
    /* Modal */
    .modal {{
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      backdrop-filter: blur(8px);
    }}
    .modal.open {{
      display: flex;
    }}
    .modal-content {{
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      border-radius: 12px;
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1rem;
    }}
    .modal-content img {{
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
    }}
    .modal-close {{
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      background: rgba(0,0,0,0.6);
      color: #fff;
      border: none;
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <span class="brand-dot"></span>
        <h1>معرض شاشات رتل الشامل — Stitch Screens</h1>
      </div>
      <p class="subtitle">المشروع: <strong>Ratil Admin Quran Platform</strong> (المعرف: <code>339375098252776117</code>)</p>
      <div class="meta-badges">
        <span class="meta-badge">إجمالي الشاشات: <strong>{len(screens)} شاشة</strong></span>
        <span class="meta-badge">شاشات كمبيوتر: <strong>{desktop_count}</strong></span>
        <span class="meta-badge">شاشات جوال: <strong>{mobile_count}</strong></span>
        <span class="meta-badge">لوحة الإدارة: <strong>{admin_count}</strong></span>
      </div>
    </header>

    <div class="filters">
      <button class="filter-btn active" onclick="filterScreens('ALL')">الكل ({len(screens)})</button>
      <button class="filter-btn" onclick="filterScreens('DESKTOP')">كمبيوتر 💻 ({desktop_count})</button>
      <button class="filter-btn" onclick="filterScreens('MOBILE')">جوال 📱 ({mobile_count})</button>
      <button class="filter-btn" onclick="filterScreens('ADMIN')">لوحة الإدارة ⚙️ ({admin_count})</button>
    </div>

    <div class="grid" id="screensGrid">
"""

for s in screens:
    is_admin = 'admin' in s['slug'] or s['index'] in [11, 12, 13, 14, 15]
    device_cls = "desktop" if s['deviceType'] == 'DESKTOP' else "mobile"
    device_label = "كمبيوتر 💻" if s['deviceType'] == 'DESKTOP' else "جوال 📱"
    cat_type = "ADMIN" if is_admin else s['deviceType']
    
    admin_badge_html = '<span class="device-badge admin">لوحة الإدارة</span>' if is_admin else ''

    gallery_html += f"""
      <div class="card" data-device="{s['deviceType']}" data-is-admin="{str(is_admin).lower()}">
        <div class="preview-box" onclick="openModal('{s['slug']}.png')">
          <img class="preview-img" src="{s['slug']}.png" alt="{s['title']}" loading="lazy">
          <div class="preview-overlay">
            <span>🔍 تكبير الصورة</span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <span class="screen-number">الشاشة #{s['index']:02d}</span>
            <div class="badges-row">
              {admin_badge_html}
              <span class="device-badge {device_cls}">{device_label}</span>
            </div>
          </div>
          <h2 class="card-title">{s['title']}</h2>
          <div class="card-meta">
            ID: {s['id'][:12]}... &bull; {s['width']}×{s['height']}px
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="{s['slug']}.html" target="_blank">
              ⚡ فتح صفحة HTML
            </a>
            <a class="btn btn-secondary" href="{s['slug']}.png" target="_blank">
              🖼️ عرض الصورة
            </a>
          </div>
        </div>
      </div>
"""

gallery_html += """
    </div>
  </div>

  <div class="modal" id="imageModal" onclick="closeModal()">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="modal-content" onclick="event.stopPropagation()">
      <img id="modalImg" src="" alt="معاينة الشاشة">
    </div>
  </div>

  <script>
    function filterScreens(type) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        if (type === 'ALL') {
          card.style.display = 'flex';
        } else if (type === 'ADMIN') {
          card.style.display = card.dataset.isAdmin === 'true' ? 'flex' : 'none';
        } else if (card.dataset.device === type) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function openModal(imgSrc) {
      document.getElementById('modalImg').src = imgSrc;
      document.getElementById('imageModal').classList.add('open');
    }

    function closeModal() {
      document.getElementById('imageModal').classList.remove('open');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>
"""

with open('/home/ammar/ratil/stitch-screens/index.html', 'w', encoding='utf-8') as f:
    f.write(gallery_html)

print(f'Generated stitch-screens/index.html and README.md with {len(screens)} screens successfully!')
