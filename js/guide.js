// Shared script for the guide pages (help, admin, publishing guide, privacy):
// language switch (?lang=ar|en or the app's language), print button, department logos/names, owner credit.
(function () {
  const CFG = window.APP_CONFIG || {}; const D = (window.DEPT && window.DEPT.config) || {};
  const logos = Object.assign({}, CFG.logos || {}, D.logos || {});
  const inst = Object.assign({}, CFG.institution || {}, D.institution || {});
  const owner = CFG.owner || {};
  const appLang = () => { try { const s = JSON.parse(localStorage.getItem((CFG.appId || 'wre-attendance') + ':data:v1') || 'null'); return s && s.settings && s.settings.lang; } catch (e) { return null; } };
  let lang = new URLSearchParams(location.search).get('lang') || appLang() || 'ar';
  if (lang !== 'en') lang = 'ar';
  document.querySelectorAll('img[data-logo]').forEach((img) => { const src = logos[img.dataset.logo]; if (src) img.src = src; else img.remove(); });
  function apply() {
    const i = lang === 'ar' ? 0 : 1;
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('article[data-lang]').forEach((a) => { a.hidden = a.dataset.lang !== lang; });
    document.querySelectorAll('[data-ar]').forEach((el) => { el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en; });
    document.querySelectorAll('[data-inst]').forEach((el) => { const v = inst[el.dataset.inst]; if (v) el.textContent = v[i]; });
    const t = document.body.dataset; if (t.titleAr) document.title = lang === 'ar' ? t.titleAr : t.titleEn;
    const f = document.getElementById('owner-foot');
    if (f && owner.name) f.innerHTML = `${owner.role[i]}: <b>${owner.name[i]}</b><br><a href="mailto:${owner.email}" dir="ltr">${owner.email}</a> · <a href="tel:${owner.phone}" dir="ltr">${owner.phone}</a><br>© 2026 ${owner.name[i]} — ${lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}`;
  }
  const lb = document.getElementById('langBtn'); if (lb) lb.addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; apply(); window.scrollTo(0, 0); });
  const pb = document.getElementById('printBtn'); if (pb) pb.addEventListener('click', () => window.print());
  apply();
})();
