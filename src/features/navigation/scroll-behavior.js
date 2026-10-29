/**
 * رتل - Ratil
 * إدارة سلوك شريط المشغل عند التمرير (Player Bar Scroll Behavior)
 * src/features/navigation/scroll-behavior.js
 */

let lastScrollTop = 0;
let scrollStopTimer = null;

/**
 * تفعيل السلوك الذكي لشريط المشغل عند التمرير (يتقلص عند النزول ويعود عند التوقف)
 */
export function setupScrollBehavior() {
  const playerBar = document.getElementById('audio-player-bar');
  if (!playerBar) return;

  window.addEventListener('scroll', () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    clearTimeout(scrollStopTimer);

    if (currentScrollTop > lastScrollTop && currentScrollTop > 120) {
      playerBar.classList.add('collapsed');
    } else {
      playerBar.classList.remove('collapsed');
    }

    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;

    scrollStopTimer = setTimeout(() => {
      playerBar.classList.remove('collapsed');
    }, 350);
  }, { passive: true });
}
