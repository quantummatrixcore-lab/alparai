// Standard Browser Agent Init Script
// Bu scripti her navigate sonrasi calistir
module.exports = {
  // Viewport'u reset et - scroll ve boyut sorunlarini coz
  resetViewport: `
    window.scrollTo(0, 0);
    document.documentElement.style.zoom = '1';
    document.documentElement.style.transform = 'none';
    document.body.style.transform = 'none';
    document.body.style.zoom = '1';
    // Sayfa genisligini kontrol et
    const w = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    console.log('Viewport:', w, 'ScrollWidth:', sw, 'Overflow:', sw > w);
  `,
  // Aktif sekmeyi dogru sekilde kullan - ASLA navigate ile yeni sekme acma
  safeNavigate: `
    // Kullanim: window.location.href = url yerine
    // Her zaman mevcut sekmede navigate et
  `,
};
