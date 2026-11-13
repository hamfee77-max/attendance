// ============================================================================
//  AUTH: personal accounts, password hashing (PBKDF2-SHA256), sessions, roles
//  Three levels:
//    admin    = system administrator: everything the head can do, plus the app's own details
//               (adapting it to another department: names, logos, rules, settings) and administrator accounts
//    head     = head of department, or whoever the head authorizes (coordinator, committee member…):
//               everything within the department — lecturers' accounts and passwords, students, stages,
//               courses, academic years, receiving reports, editing absences at any time,
//               final reports signed by the absence committee
//    lecturer = documents absences of the assigned courses only; may edit a lecture within
//               rules.editWindowHours (72 h) of recording it
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
  const BOOT = { id: 'bootstrap-master', name: 'مدير النظام', nameEn: 'System administrator', role: 'admin', courses: [] };
  // older role names: master -> admin, committee -> head
  const normRole = (r) => (r === 'master' ? 'admin' : r === 'committee' ? 'head' : (r || 'lecturer'));
  function list() { const a = St.accounts().map((x) => (x.role === normRole(x.role) ? x : Object.assign({}, x, { role: normRole(x.role) }))); return a.length ? a : [BOOT]; }
  const byId = (id) => list().find((a) => a.id === id);

  // Sign-in policy: administrators and heads are asked for their password at every opening;
  // only lecturers may keep a device remembered (rememberDays). Sessions that are not remembered
  // lock after idleLockMinutes without use. SESS_V rejects sign-ins saved under older rules.
  const SESS_V = 2;
  const canRemember = (acc) => !!acc && (CFG.access.rememberRoles || ['lecturer']).includes(normRole(acc.role)) && (Number(CFG.access.rememberDays) || 0) > 0;
  const idleMs = () => (Number(CFG.access.idleLockMinutes) || 0) * 60000;
  const ACTKEY = SESSKEY + ':active';
  let remembered = false;
  function touch() { try { sessionStorage.setItem(ACTKEY, String(Date.now())); } catch (e) { /* ignore */ } }
  function idleExpired() {
    if (!current || remembered || !idleMs()) return false;
    let last = 0; try { last = Number(sessionStorage.getItem(ACTKEY) || 0); } catch (e) { /* ignore */ }
    return !last || Date.now() - last > idleMs();
  }

  let current = null;
  async function signIn(accountId, password, remember) {
    const acc = byId(accountId); if (!acc || !secure()) return false;
    let ok = false, token = '';
    if (acc.id === BOOT.id) { token = await sha256(password); ok = token === CFG.access.bootstrapMasterHash; }
    else { token = await pbkdf2(password, acc.salt, acc.iter || CFG.access.pbkdf2Iterations); ok = token === acc.hash; }
    if (!ok) return false;
    remember = !!remember && canRemember(acc);
    const sess = { v: SESS_V, id: acc.id, token, remember, until: remember ? Date.now() + Number(CFG.access.rememberDays) * 86400000 : 0 };
    try { sessionStorage.setItem(SESSKEY, JSON.stringify(sess)); if (remember) localStorage.setItem(SESSKEY, JSON.stringify(sess)); else localStorage.removeItem(SESSKEY); } catch (e) { /* ignore */ }
    remembered = remember; touch();
    activate(acc);
    return true;
  }
  function restore() {
    if (!CFG.access || !CFG.access.enabled) { activate(BOOT); return true; }
    const read = (store) => { try { return JSON.parse(store.getItem(SESSKEY)); } catch (e) { return null; } };
    const fromSession = read(sessionStorage), fromLocal = read(localStorage);
    for (const s of [fromSession, fromLocal]) {
      if (!s || !s.id || s.v !== SESS_V) continue;                       // sign-ins saved under older rules are not accepted
      if (s.until && Date.now() > s.until) continue;
      const acc = byId(s.id); if (!acc) continue;
      if (s.remember && !canRemember(acc)) continue;                      // only lecturers may stay remembered
      if (s === fromLocal && !s.remember) continue;
      const valid = acc.id === BOOT.id ? s.token === CFG.access.bootstrapMasterHash : s.token === acc.hash;   // password changed => signed out
      if (!valid) continue;
      remembered = !!s.remember;
      if (!remembered) { let last = 0; try { last = Number(sessionStorage.getItem(ACTKEY) || 0); } catch (e) { /* ignore */ } if (idleMs() && (!last || Date.now() - last > idleMs())) continue; }
      activate(acc); touch(); return true;
    }
    try { localStorage.removeItem(SESSKEY); } catch (e) { /* ignore */ }
    return false;
  }
  function signOut() { try { sessionStorage.removeItem(SESSKEY); sessionStorage.removeItem(ACTKEY); localStorage.removeItem(SESSKEY); } catch (e) { /* ignore */ } current = null; remembered = false; St.setScope([], []); }
  function activate(acc) {
    current = acc.role === normRole(acc.role) ? acc : Object.assign({}, acc, { role: normRole(acc.role) });
    acc = current;
    if (acc.role === 'lecturer') St.setScope(acc.courses || [], acc.courses || []);
    else St.setScope(null, acc.courses || []);
  }

  const PERMS = {
    admin: ['allCourses', 'editLists', 'years', 'admin', 'accounts', 'manageAdmins', 'import', 'final', 'backup', 'editAnytime', 'committee', 'exportDept'],
    head: ['allCourses', 'editLists', 'years', 'accounts', 'import', 'final', 'backup', 'editAnytime', 'committee', 'exportDept'],
    lecturer: [],
  };
  const can = (p) => !!(current && (PERMS[current.role] || []).includes(p));
  // Lecturer edit window: a lecture can be changed within editWindowHours of being recorded
  const windowMs = () => (Number(CFG.rules.editWindowHours) || 72) * 3600000;
  const editDeadline = (s) => (Number((s && s.createdAt) || 0) + windowMs());
  function canEditSession(s) {
    if (!current || !s) return false;
    const c = St.course(s.courseId); if (!c || !St.inScope(c)) return false;
    if (can('editAnytime')) return true;
    return Date.now() <= editDeadline(s);
  }
  const role = () => (current ? current.role : null);
  const displayName = (lang) => (current ? (lang === 'en' && current.nameEn ? current.nameEn : current.name) : '');

  window.Auth = { list, byId, signIn, restore, signOut, can, role, displayName, normRole, canEditSession, editDeadline, windowMs, canRemember, touch, idleExpired, get current() { return current; }, makeCredential, newPassword, normPw, secure, BOOT };
})();
