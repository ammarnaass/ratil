/**
 * رتل - Ratil
 * المحرك البرمجي التفاعلي لمشغل التلاوات وتتبع الآيات
 * src/app.js
 */

import { normalizeQuranSearchText, toIndicDigits } from './lib/normalize.js';

// الحالة العامة للتطبيق
const state = {
  surahs: [],
  reciters: [],
  currentSurah: null,
  currentSurahData: null,
  currentReciter: null,
  currentNarration: 'hafs',
  isPlaying: false,
  activeAyah: 1,
  fontSizeLevel: 2, // 1: صغير، 2: متوسط، 3: كبير
  isReadingMode: false,
  sleepTimer: 'end_of_surah', // 'end_of_surah' افتراضياً
  sleepTimerTimeout: null,
  loopAyah: null,
  lastSession: null,
  verseTimings: []
};

// كائن الصوت الأساسي
const audio = new Audio();
let previewAudio = new Audio();

// متغيرات كشف اتجاه التمرير
let lastScrollTop = 0;
let scrollStopTimer = null;

async function fetchData(path) {
  const candidates = [
    path,
    `./public${path}`,
    `/public${path}`,
    `public${path}`
  ];
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate);
      if (res.ok) return res;
    } catch (e) {}
  }
  return fetch(path);
}

// ==========================================================================
// التهيئة الأولية
// ==========================================================================
async function initApp() {
  loadStoredTheme();
  loadStoredSession();

  try {
    // 1. تحميل بيانات السور والقرّاء
    const [surahsRes, recitersRes] = await Promise.all([
      fetchData('/data/surahs.json'),
      fetchData('/audio-manifest/reciters.json')
    ]);

    state.surahs = await surahsRes.json();
    const recitersManifest = await recitersRes.json();
    state.reciters = recitersManifest.reciters;

    // ضبط القارئ الافتراضي
    const savedReciterId = localStorage.getItem('ratil_last_reciter');
    state.currentReciter = state.reciters.find(r => r.id === savedReciterId) || state.reciters[0];
    state.currentNarration = state.currentReciter.narration;

    // 2. بناء واجهة الرئيسية
    renderResumeCard();
    renderSurahList(state.surahs);
    setupEventListeners();
    setupAudioListeners();
    setupScrollBehavior();

    // 3. التحقق من الروابط المباشرة والمشاركة العميقة (#surah=18&aya=45)
    checkDeepLink();

  } catch (err) {
    console.error('فشل تحميل بيانات التطبيق:', err);
  }
}

// ==========================================================================
// إدارة الثيم (الوضع الليلي والنهاري)
// ==========================================================================
function loadStoredTheme() {
  const savedTheme = localStorage.getItem('ratil_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('ratil_theme', nextTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.innerHTML = current === 'dark'
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ==========================================================================
// إدارة الجلسة واستئناف الموضع (المستخدم العائد)
// ==========================================================================
function loadStoredSession() {
  try {
    const raw = localStorage.getItem('ratil_last_session');
    if (raw) {
      state.lastSession = JSON.parse(raw);
    }
  } catch (e) {
    state.lastSession = null;
  }
}

function saveCurrentSession() {
  if (!state.currentSurah) return;
  const session = {
    surahId: state.currentSurah.id,
    surahNameAr: state.currentSurah.name_ar,
    reciterId: state.currentReciter.id,
    reciterNameAr: state.currentReciter.name_ar,
    narration: state.currentNarration,
    narrationAr: state.currentReciter.narration_ar,
    ayah: state.activeAyah,
    currentTime: audio.currentTime || 0,
    timestamp: Date.now()
  };
  localStorage.setItem('ratil_last_session', JSON.stringify(session));
  localStorage.setItem('ratil_last_reciter', state.currentReciter.id);
  state.lastSession = session;
}

function renderResumeCard() {
  const container = document.getElementById('resume-card-container');
  if (!container) return;

  if (!state.lastSession) {
    container.innerHTML = '';
    return;
  }

  const s = state.lastSession;
  container.innerHTML = `
    <div class="resume-card" id="btn-resume-session">
      <div class="resume-info">
        <div class="resume-info-title">▶ سورة ${s.surahNameAr}</div>
        <div class="resume-info-meta">${s.reciterNameAr} (${s.narrationAr}) · توقفت عند: الآية ${toIndicDigits(s.ayah)}</div>
      </div>
      <button class="resume-play-btn" aria-label="أكمل الاستماع">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
    </div>
  `;

  document.getElementById('btn-resume-session')?.addEventListener('click', () => {
    resumeSession();
  });
}

async function resumeSession() {
  if (!state.lastSession) return;
  const s = state.lastSession;
  const surah = state.surahs.find(item => item.id === s.surahId);
  const reciter = state.reciters.find(item => item.id === s.reciterId) || state.currentReciter;
  
  if (surah) {
    state.currentReciter = reciter;
    state.currentNarration = reciter.narration;
    await openSurahView(surah, s.ayah, s.currentTime, true);
  }
}

// ==========================================================================
// عرض قائمة السور والبحث
// ==========================================================================
function renderSurahList(surahsToRender) {
  const grid = document.getElementById('surah-grid');
  if (!grid) return;

  grid.innerHTML = surahsToRender.map(s => `
    <div class="surah-card" data-surah-id="${s.id}">
      <div class="surah-card-left">
        <span class="surah-index">${s.id}</span>
        <div class="surah-names-box">
          <span class="surah-ar-name">${s.name_ar}</span>
          <span class="surah-en-name">${s.name_en}</span>
        </div>
      </div>
      <div class="surah-card-right">
        <span class="surah-meta-badge">${s.type}</span>
        <span class="surah-ayahs-count">${s.ayahs_hafs} آية</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.surah-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === id);
      if (surah) openReciterSheet(surah);
    });
  });
}

// محرك البحث فائق السرعة
function handleSearch(query) {
  const cleanQ = query.trim();
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;

  if (!cleanQ) {
    dropdown.classList.remove('active');
    dropdown.innerHTML = '';
    return;
  }

  const normQ = normalizeQuranSearchText(cleanQ);
  const numQ = parseInt(cleanQ, 10);

  const matchedSurahs = state.surahs.filter(s => {
    // 1. رقم السورة المباشر
    if (!isNaN(numQ) && s.id === numQ) return true;
    // 2. الاسم العربي المطبّع
    if (normalizeQuranSearchText(s.name_ar).includes(normQ)) return true;
    // 3. الاسم اللاتيني (Kahf, Baqara...)
    if (s.name_en.toLowerCase().includes(cleanQ.toLowerCase())) return true;
    return false;
  });

  if (matchedSurahs.length === 0) {
    dropdown.innerHTML = `<div style="padding: 18px; text-align: center; color: var(--color-text-muted);">لا توجد سورة مطابقة لـ "${cleanQ}"</div>`;
    dropdown.classList.add('active');
    return;
  }

  dropdown.innerHTML = matchedSurahs.slice(0, 6).map(s => `
    <div class="search-result-item" data-surah-id="${s.id}">
      <div class="result-item-main">
        <span class="result-num-badge">${s.id}</span>
        <span class="result-surah-title">سورة ${s.name_ar}</span>
      </div>
      <span style="font-size: 13px; color: var(--color-text-muted);">${s.name_en} · ${s.ayahs_hafs} آية</span>
    </div>
  `).join('');

  dropdown.classList.add('active');

  dropdown.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === id);
      dropdown.classList.remove('active');
      document.getElementById('search-input').value = '';
      if (surah) openReciterSheet(surah);
    });
  });
}

// ==========================================================================
// لوحة اختيار القارئ (Reciter Bottom Sheet)
// ==========================================================================
function openReciterSheet(surah) {
  state.currentSurah = surah;
  const sheet = document.getElementById('reciter-sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  const title = document.getElementById('sheet-surah-title');
  const listContainer = document.getElementById('reciter-list-container');

  if (!sheet || !backdrop || !listContainer) return;

  title.textContent = `سورة ${surah.name_ar}`;

  listContainer.innerHTML = state.reciters.map(reciter => {
    const isSelected = reciter.id === state.currentReciter.id;
    return `
      <div class="reciter-option-card ${isSelected ? 'selected' : ''}" data-reciter-id="${reciter.id}">
        <div class="reciter-option-right">
          <div class="radio-indicator"></div>
          <div class="reciter-name-wrap">
            <span class="reciter-name">${reciter.name_ar}</span>
            <span class="reciter-narration-badge">${reciter.narration_ar}</span>
          </div>
        </div>
        <button class="preview-btn" data-preview-reciter="${reciter.id}" aria-label="استماع 5 ثواني">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ٥ ث
        </button>
      </div>
    `;
  }).join('');

  listContainer.querySelectorAll('.reciter-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.preview-btn')) return;
      const reciterId = card.dataset.reciterId;
      selectReciter(reciterId);
    });
  });

  listContainer.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const reciterId = btn.dataset.previewReciter;
      playPreviewAudio(reciterId, surah.id);
    });
  });

  backdrop.classList.add('active');
  sheet.classList.add('active');
}

function selectReciter(reciterId) {
  const reciter = state.reciters.find(r => r.id === reciterId);
  if (!reciter) return;
  state.currentReciter = reciter;
  state.currentNarration = reciter.narration;
  localStorage.setItem('ratil_last_reciter', reciter.id);

  document.querySelectorAll('.reciter-option-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.reciterId === reciterId);
  });
}

function closeReciterSheet() {
  previewAudio.pause();
  document.getElementById('sheet-backdrop')?.classList.remove('active');
  document.getElementById('reciter-sheet')?.classList.remove('active');
}

function playPreviewAudio(reciterId, surahId) {
  const reciter = state.reciters.find(r => r.id === reciterId);
  if (!reciter) return;

  previewAudio.pause();
  const previewUrl = getSurahAudioUrl(reciter, surahId);
  previewAudio.src = previewUrl;
  previewAudio.currentTime = 0;
  previewAudio.play().catch(() => {});

  // إيقاف المعاينة تلقائياً بعد 5 ثوانٍ
  setTimeout(() => {
    previewAudio.pause();
  }, 5000);
}

// ==========================================================================
// مسار الصوت ومصادر التلاوات
// ==========================================================================
function getSurahAudioUrl(reciter, surahId) {
  if (reciter.id === 'yassin_al_jazaery') {
    // تنسيق ملفات السور لياسين الجزائري (ورش)
    const padded = String(surahId).padStart(3, '0');
    return `https://server11.mp3quran.net/jaza/001.mp3`.replace('001', padded);
  } else if (reciter.id === 'husary') {
    return `https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/${surahId}.mp3`;
  } else {
    // مشاري راشد العفاسي (حفص)
    return `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahId}.mp3`;
  }
}

// ==========================================================================
// صفحة السورة وعرض النص القرآني المعتمد
// ==========================================================================
async function openSurahView(surah, startAyah = 1, startTime = 0, autoPlay = true) {
  closeReciterSheet();

  state.currentSurah = surah;
  state.activeAyah = startAyah;

  // إخفاء الصفحة الرئيسية وإظهار صفحة السورة
  document.getElementById('home-view-page').style.display = 'none';
  const surahView = document.getElementById('surah-view-page');
  surahView.classList.add('active');

  // تحديث الترويسة
  document.getElementById('view-surah-title').textContent = `سورة ${surah.name_ar}`;
  document.getElementById('view-surah-sub').textContent = `${state.currentReciter.name_ar} · ${state.currentReciter.narration_ar}`;

  // ضبط خط القراءة المناسب للرواية (حفص أو ورش)
  const textContainer = document.getElementById('quran-text-container');
  if (state.currentNarration === 'warsh') {
    textContainer.style.fontFamily = 'var(--font-quran-warsh)';
  } else {
    textContainer.style.fontFamily = 'var(--font-quran-hafs)';
  }

  // تحميل ملف السورة المعتمد
  const surahFileUrl = `/data/${state.currentNarration}/${surah.id}.json`;
  const res = await fetchData(surahFileUrl);
  state.currentSurahData = await res.json();

  // بناء النص القرآني
  renderQuranText(state.currentSurahData);

  // إعداد وتشغيل الصوت
  loadSurahAudio(surah.id, startTime, autoPlay);

  // تمرير إلى الآية المحددة بعد اكتمال العرض
  setTimeout(() => {
    scrollToAyah(startAyah);
  }, 150);

  // تحديث Media Session
  updateMediaSession(surah, state.currentReciter);
}

function renderQuranText(data) {
  const container = document.getElementById('quran-text-container');
  if (!container) return;

  const showBasmalah = data.id !== 9 && data.id !== 1;
  let html = '';

  if (showBasmalah) {
    html += `<div class="basmalah-box">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
  }

  html += data.ayahs.map(a => `
    <span class="quran-verse ${a.aya === state.activeAyah ? 'active-verse' : ''}" 
          id="verse-${a.aya}" 
          data-aya="${a.aya}">
      ${a.text_uthmani}
      <span class="aya-badge" data-aya="${a.aya}">${a.aya_indic}</span>
    </span>
  `).join(' ');

  container.innerHTML = html;

  // مستمعات النقر على الآيات
  container.querySelectorAll('.quran-verse').forEach(el => {
    el.addEventListener('click', (e) => {
      const ayaNum = parseInt(el.dataset.aya, 10);
      if (e.target.classList.contains('aya-badge')) {
        showVersePopup(ayaNum, e.target);
      } else {
        seekToAyah(ayaNum);
      }
    });
  });
}

function closeSurahView() {
  document.getElementById('surah-view-page').classList.remove('active');
  document.getElementById('home-view-page').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderResumeCard();
}

// ==========================================================================
// محرك الصوت وتزامن الآيات (Audio Engine & Synchronization)
// ==========================================================================
function loadSurahAudio(surahId, startTime = 0, autoPlay = true) {
  const audioUrl = getSurahAudioUrl(state.currentReciter, surahId);
  audio.src = audioUrl;
  audio.currentTime = startTime;

  updatePlayerTrackInfo();

  if (autoPlay) {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayBtnVisuals();
    }).catch(err => {
      console.warn('يتطلب التشغيل تفاعل المستخدم أولاً:', err);
    });
  }
}

function setupAudioListeners() {
  audio.addEventListener('timeupdate', () => {
    updateScrubber();
    syncActiveAyahWithTime();
    saveCurrentSession();
  });

  audio.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayBtnVisuals();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayBtnVisuals();
    saveCurrentSession();
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    updatePlayBtnVisuals();
    if (state.sleepTimer === 'end_of_surah') {
      showToast('اكتملت السورة وتوقف المشغل (مؤقت النوم).');
    }
  });
}

function togglePlayPause() {
  if (audio.paused) {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayBtnVisuals();
    });
  } else {
    audio.pause();
    state.isPlaying = false;
    updatePlayBtnVisuals();
  }
}

function seekRelative(seconds) {
  audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
}

function updatePlayBtnVisuals() {
  const playIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const pauseIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

  const icon = state.isPlaying ? pauseIcon : playIcon;

  document.querySelectorAll('#main-play-btn, #collapsed-play-btn').forEach(btn => {
    if (btn) btn.innerHTML = icon;
  });
}

function updatePlayerTrackInfo() {
  const surahName = state.currentSurah ? `سورة ${state.currentSurah.name_ar}` : 'رتل';
  const reciterName = state.currentReciter ? `${state.currentReciter.name_ar} (${state.currentReciter.narration_ar})` : '';

  const trackTitle = document.getElementById('player-surah-title');
  const trackReciter = document.getElementById('player-reciter-name');
  const collapsedTitle = document.getElementById('collapsed-surah-title');

  if (trackTitle) trackTitle.textContent = surahName;
  if (trackReciter) trackReciter.textContent = reciterName;
  if (collapsedTitle) collapsedTitle.textContent = `${surahName} · ${state.currentReciter.name_ar}`;
}

function updateScrubber() {
  const fill = document.getElementById('scrubber-fill');
  const thumb = document.getElementById('scrubber-thumb');
  const currentLabel = document.getElementById('time-current');
  const durationLabel = document.getElementById('time-duration');

  const curr = audio.currentTime || 0;
  const dur = audio.duration || 1;
  const pct = Math.min(100, (curr / dur) * 100);

  if (fill) fill.style.width = `${pct}%`;
  if (thumb) thumb.style.right = `${pct}%`;
  if (currentLabel) currentLabel.textContent = formatTime(curr);
  if (durationLabel) durationLabel.textContent = formatTime(dur);
}

function formatTime(sec) {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const remainingS = s % 60;
  return `${m}:${remainingS < 10 ? '0' : ''}${remainingS}`;
}

// حساب ومزامنة الآية الحالية بالنسبة المئوية للتوقيت
function syncActiveAyahWithTime() {
  if (!state.currentSurahData || !state.currentSurahData.ayahs.length) return;
  const totalAyahs = state.currentSurahData.ayahs.length;
  const dur = audio.duration;
  if (!dur || dur <= 0) return;

  const fraction = audio.currentTime / dur;
  let estimatedAyah = Math.min(totalAyahs, Math.max(1, Math.floor(fraction * totalAyahs) + 1));

  // في حال تم تكرار آية معينة للحفظ
  if (state.loopAyah && estimatedAyah > state.loopAyah) {
    seekToAyah(state.loopAyah);
    return;
  }

  if (estimatedAyah !== state.activeAyah) {
    highlightAyah(estimatedAyah);
  }
}

function highlightAyah(ayaNum, shouldScroll = true) {
  state.activeAyah = ayaNum;

  document.querySelectorAll('.quran-verse').forEach(el => {
    el.classList.toggle('active-verse', parseInt(el.dataset.aya, 10) === ayaNum);
  });

  if (shouldScroll) {
    scrollToAyah(ayaNum);
  }
}

function scrollToAyah(ayaNum) {
  const el = document.getElementById(`verse-${ayaNum}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function seekToAyah(ayaNum) {
  if (!state.currentSurahData || !audio.duration) return;
  const totalAyahs = state.currentSurahData.ayahs.length;
  const targetTime = ((ayaNum - 1) / totalAyahs) * audio.duration;
  audio.currentTime = targetTime;
  highlightAyah(ayaNum, false);
}

// ==========================================================================
// التمرير التكيفي للمشغل (Adaptive Scroll Behavior)
// ==========================================================================
function setupScrollBehavior() {
  window.addEventListener('scroll', () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const playerBar = document.getElementById('audio-player-bar');
    if (!playerBar) return;

    // تمرير لأسفل: تقليص المشغل إلى شريط نحيف (44px)
    if (currentScrollTop > lastScrollTop + 10 && currentScrollTop > 100) {
      playerBar.classList.add('collapsed');
    } 
    // تمرير لأعلى: عودة فورية للحجم الكامل (< 200ms)
    else if (currentScrollTop < lastScrollTop - 10) {
      playerBar.classList.remove('collapsed');
    }

    lastScrollTop = Math.max(0, currentScrollTop);

    // عند توقف التمرير لمدة 600ms، يعود المشغل للظهور كاملاً
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      playerBar.classList.remove('collapsed');
    }, 600);
  }, { passive: true });
}

// ==========================================================================
// أدوات التحكم بالخط ووضع القراءة
// ==========================================================================
function changeFontSize(delta) {
  state.fontSizeLevel = Math.max(1, Math.min(3, state.fontSizeLevel + delta));
  const sizes = { 1: '19px', 2: '23px', 3: '28px' };
  document.documentElement.style.setProperty('--font-size-quran', sizes[state.fontSizeLevel]);
}

function toggleReadingMode() {
  state.isReadingMode = !state.isReadingMode;
  const header = document.getElementById('surah-view-header');
  const player = document.getElementById('audio-player-bar');
  const btn = document.getElementById('btn-reading-mode');

  if (state.isReadingMode) {
    header?.classList.add('hidden-mode');
    player?.classList.add('collapsed');
    btn?.classList.add('active');
    showToast('وضع القراءة المجردة: اضغط في أي مكان للخروج');
  } else {
    header?.classList.remove('hidden-mode');
    player?.classList.remove('collapsed');
    btn?.classList.remove('active');
  }
}

// ==========================================================================
// مؤقت النوم (Sleep Timer)
// ==========================================================================
function openSleepTimerModal() {
  document.getElementById('sleep-modal-backdrop')?.classList.add('active');
}

function closeSleepTimerModal() {
  document.getElementById('sleep-modal-backdrop')?.classList.remove('active');
}

function setSleepTimer(val) {
  clearTimeout(state.sleepTimerTimeout);
  state.sleepTimer = val;

  document.querySelectorAll('.sleep-option-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.sleepVal === String(val));
  });

  if (typeof val === 'number') {
    state.sleepTimerTimeout = setTimeout(() => {
      audio.pause();
      showToast(`انتهى مؤقت النوم (${val} دقيقة) وتم إيقاف التلاوة.`);
    }, val * 60 * 1000);
    showToast(`تم ضبط مؤقت النوم: ${val} دقيقة`);
  } else if (val === 'end_of_surah') {
    showToast('سيتوقف المشغل تلقائياً عند نهاية السورة');
  } else {
    showToast('تم إلغاء مؤقت النوم');
  }

  closeSleepTimerModal();
}

// ==========================================================================
// مشاركة الآيات والروابط العميقة (Deep Links & Sharing)
// ==========================================================================
function showVersePopup(ayaNum, anchorEl) {
  const popup = document.getElementById('verse-popup');
  if (!popup) return;

  const rect = anchorEl.getBoundingClientRect();
  popup.style.top = `${rect.top - 46}px`;
  popup.style.left = `${Math.max(10, rect.left - 50)}px`;
  popup.classList.add('active');

  document.getElementById('popup-share-btn').onclick = () => {
    shareVerse(ayaNum);
    popup.classList.remove('active');
  };

  document.getElementById('popup-loop-btn').onclick = () => {
    toggleLoopVerse(ayaNum);
    popup.classList.remove('active');
  };
}

function shareVerse(ayaNum) {
  if (!state.currentSurah) return;
  const url = `${window.location.origin}${window.location.pathname}#surah=${state.currentSurah.id}&aya=${ayaNum}&reciter=${state.currentReciter.id}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`تم نسخ رابط الآية ${toIndicDigits(ayaNum)} بنجاح`);
    });
  } else {
    showToast(url);
  }
}

function toggleLoopVerse(ayaNum) {
  if (state.loopAyah === ayaNum) {
    state.loopAyah = null;
    showToast('تم إلغاء تكرار الآية');
  } else {
    state.loopAyah = ayaNum;
    seekToAyah(ayaNum);
    showToast(`تكرار الآية ${toIndicDigits(ayaNum)} للحفظ مُفعَّل`);
  }
}

function checkDeepLink() {
  const hash = window.location.hash;
  if (!hash.includes('surah=')) return;

  const params = new URLSearchParams(hash.replace('#', ''));
  const surahId = parseInt(params.get('surah'), 10);
  const ayaNum = parseInt(params.get('aya'), 10) || 1;
  const reciterId = params.get('reciter');

  const surah = state.surahs.find(s => s.id === surahId);
  if (surah) {
    if (reciterId) {
      const r = state.reciters.find(item => item.id === reciterId);
      if (r) {
        state.currentReciter = r;
        state.currentNarration = r.narration;
      }
    }
    openSurahView(surah, ayaNum, 0, true);

    // وميض الآية الجارية لثلاث ثوانٍ
    setTimeout(() => {
      const el = document.getElementById(`verse-${ayaNum}`);
      if (el) el.classList.add('shared-flash');
    }, 400);
  }
}

// ==========================================================================
// Media Session API (التحكم من قفل الشاشة)
// ==========================================================================
function updateMediaSession(surah, reciter) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: `سورة ${surah.name_ar}`,
    artist: `${reciter.name_ar} (${reciter.narration_ar})`,
    album: 'رتل — مصحف مسموع',
    artwork: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  });

  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('seekbackward', () => seekRelative(-10));
  navigator.mediaSession.setActionHandler('seekforward', () => seekRelative(10));
}

// ==========================================================================
// إشعار Toast السريع
// ==========================================================================
function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}

// ==========================================================================
// ربط جميع مستمعات الأحداث (Event Listeners)
// ==========================================================================
function setupEventListeners() {
  // زر تبديل الثيم
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // البحث
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', (e) => handleSearch(e.target.value));
  document.getElementById('search-clear-btn')?.addEventListener('click', () => {
    searchInput.value = '';
    handleSearch('');
  });

  // النقر خارج قائمة البحث يغلقها
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      document.getElementById('search-dropdown')?.classList.remove('active');
    }
    if (!e.target.closest('.verse-popup') && !e.target.closest('.aya-badge')) {
      document.getElementById('verse-popup')?.classList.remove('active');
    }
  });

  // شرائح السور الأكثر استماعاً
  document.querySelectorAll('.shortcut-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const surahId = parseInt(chip.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === surahId);
      if (surah) openReciterSheet(surah);
    });
  });

  // أزرار لوحة اختيار القارئ
  document.getElementById('sheet-close-btn')?.addEventListener('click', closeReciterSheet);
  document.getElementById('sheet-backdrop')?.addEventListener('click', closeReciterSheet);
  document.getElementById('sheet-start-btn')?.addEventListener('click', () => {
    if (state.currentSurah) {
      openSurahView(state.currentSurah, 1, 0, true);
    }
  });

  // أزرار صفحة السورة
  document.getElementById('btn-back-home')?.addEventListener('click', closeSurahView);
  document.getElementById('btn-font-plus')?.addEventListener('click', () => changeFontSize(1));
  document.getElementById('btn-font-minus')?.addEventListener('click', () => changeFontSize(-1));
  document.getElementById('btn-reading-mode')?.addEventListener('click', toggleReadingMode);

  // أزرار المشغل الرئيسي
  document.getElementById('main-play-btn')?.addEventListener('click', togglePlayPause);
  document.getElementById('collapsed-play-btn')?.addEventListener('click', togglePlayPause);
  document.getElementById('btn-seek-back')?.addEventListener('click', () => seekRelative(-10));
  document.getElementById('btn-seek-forward')?.addEventListener('click', () => seekRelative(10));
  document.getElementById('btn-open-reciters')?.addEventListener('click', () => {
    if (state.currentSurah) openReciterSheet(state.currentSurah);
  });

  // شريط التقدم (Scrubber)
  const track = document.getElementById('scrubber-track');
  track?.addEventListener('click', (e) => {
    const rect = track.getBoundingClientRect();
    // حساب الموضع في واجهة RTL من اليمين
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const fraction = 1 - (clickX / width);
    if (audio.duration) {
      audio.currentTime = fraction * audio.duration;
    }
  });

  // مؤقت النوم
  document.getElementById('btn-sleep-timer')?.addEventListener('click', openSleepTimerModal);
  document.getElementById('sleep-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'sleep-modal-backdrop') closeSleepTimerModal();
  });

  document.querySelectorAll('.sleep-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.sleepVal;
      if (val === 'end_of_surah') setSleepTimer('end_of_surah');
      else if (val === 'off') setSleepTimer(null);
      else setSleepTimer(parseInt(val, 10));
    });
  });
}

// بدء التشغيل فور اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', initApp);
