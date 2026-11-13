// ============================================================================
//  AUTH: personal accounts, password hashing (PBKDF2-SHA256), sessions, roles
//  Roles:  master    = head of department or anyone the head authorizes (everything)
//          committee = absence follow-up committee (all courses, import, final reports)
//          lecturer  = sees and reports only the courses assigned to the account
// ============================================================================
(function () {
  const St = window.Store, CFG = St.CFG;
  const SESSKEY = CFG.appId + ':session';
  const enc = (s) => new TextEncoder().encode(s);
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const unhex = (h) => new Uint8Array((h.match(/.{2}/g) || []).map((x) => parseInt(x, 16)));
  // Passwords are compared case-insensitively, trimmed, with Arabic-Indic digits converted
  const normPw = (p) => String(p || '').trim().toLowerCase()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

  const secure = () => !!(window.crypto && crypto.subtle);
  async function pbkdf2(password, saltHex, iterations) {
    const key = await crypto.subtle.importKey('raw', enc(normPw(password)), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unhex(saltHex), iterations, hash: 'SHA-256' }, key, 256);
    return hex(bits);
  }
  async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc(normPw(s)))); }
  function randomSalt() { const b = new Uint8Array(16); crypto.getRandomValues(b); return hex(b.buffer); }
  // Readable random password, e.g. "k7m4-qx9p" (no 0/o/1/l/i to avoid confusion)
  function newPassword() {
    const a = 'abcdefghjkmnpqrstuvwxyz23456789'; const b = new Uint8Array(8); crypto.getRandomValues(b);
    const s = Array.from(b, (x) => a[x % a.length]).join(''); return s.slice(0, 4) + '-' + s.slice(4);
  }
  async function makeCredential(password) {
    const salt = randomSalt(), iter = CFG.access.pbkdf2Iterations || 120000;
    return { salt, iter, hash: await pbkdf2(password, salt, iter) };
  }

  // Fallback master when no accounts exist yet (fresh deployment for another department)
  const BOOT = { id: 'bootstrap-master', name: 'رئيس القسم', nameEn: 'Head of Department', role: 'master', courses: [] };
  function list() { const a = St.accounts(); return a.length ? a : [BOOT]; }
  const byId = (id) => list().find((a) => a.id === id);

  let current = null;
  async function signIn(accountId, password, remember) {
    const acc = byId(accountId); if (!acc || !secure()) return false;
    let ok = false, token = '';
    if (acc.id === BOOT.id) { token = await sha256(password); ok = token === CFG.access.bootstrapMasterHash; }
    else { token = await pbkdf2(password, acc.salt, acc.iter || CFG.access.pbkdf2Iterations); ok = token === acc.hash; }
    if (!ok) return false;
    const sess = { id: acc.id, token, until: remember ? Date.now() + (CFG.access.rememberDays || 0) * 86400000 : 0 };
    try { sessionStorage.setItem(SESSKEY, JSON.stringify(sess)); if (remember && CFG.access.rememberDays > 0) localStorage.setItem(SESSKEY, JSON.stringify(sess)); else localStorage.removeItem(SESSKEY); } catch (e) { /* ignore */ }
    activate(acc);
    return true;
  }
  function restore() {
    if (!CFG.access || !CFG.access.enabled) { activate(BOOT); return true; }
    const read = (store) => { try { return JSON.parse(store.getItem(SESSKEY)); } catch (e) { return null; } };
    for (const s of [read(sessionStorage), read(localStorage)]) {
      if (!s || !s.id) continue;
      if (s.until && Date.now() > s.until) continue;
      const acc = byId(s.id); if (!acc) continue;
      const valid = acc.id === BOOT.id ? s.token === CFG.access.bootstrapMasterHash : s.token === acc.hash;   // password changed => signed out
      if (valid) { activate(acc); return true; }
    }
    return false;
  }
  function signOut() { try { sessionStorage.removeItem(SESSKEY); localStorage.removeItem(SESSKEY); } catch (e) { /* ignore */ } current = null; St.setScope([], []); }
  function activate(acc) {
    current = acc;
    if (acc.role === 'lecturer') St.setScope(acc.courses || [], acc.courses || []);
    else St.setScope(null, acc.courses || []);
  }

  const PERMS = {
    master: ['allCourses', 'editLists', 'admin', 'import', 'final', 'backup'],
    committee: ['allCourses', 'import', 'final', 'backup'],
    lecturer: [],
  };
  const can = (p) => !!(current && (PERMS[current.role] || []).includes(p));
  const role = () => (current ? current.role : null);
  const displayName = (lang) => (current ? (lang === 'en' && current.nameEn ? current.nameEn : current.name) : '');

  window.Auth = { list, byId, signIn, restore, signOut, can, role, displayName, get current() { return current; }, makeCredential, newPassword, normPw, secure, BOOT };
})();
