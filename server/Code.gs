/**
 * Student Attendance app — Google Drive server (Google Apps Script web app)
 * ---------------------------------------------------------------------------
 * Install once in the DEPARTMENT's Google account (see admin.html → "Google Drive"):
 *   1. script.google.com → New project → paste this file → Save.
 *   2. Run  setup  once and allow the permissions it asks for.
 *   3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy.
 *   4. Copy the web-app URL into the app: Settings → Administration → Department setup → Google Drive URL.
 *
 * What it does
 *   • submit  : a lecturer (or head) sends lectures → stored in the sheet "المحاضرات" (one row per lecture,
 *               newest version wins) + a JSON backup file in  <root>/<year>/<sender>/  + a log row in "الإرسالات".
 *               Lecturers may send only their assigned courses and may not change a lecture more than
 *               editWindowHours (72 h) after it first reached the server.
 *   • pull    : the head/delegates/administrator receive every lecture received since a time;
 *               a lecturer receives only their own courses (to restore a new phone).
 *   • archive : official reports (HTML/CSV) saved in  <root>/<year>/التقارير الرسمية  (or the lecturer's folder).
 *   • ping    : checks the connection and the account.
 * Who may do what is read from the published department file (accounts, roles, courses, key hashes),
 * so no password is ever stored here. Each request carries the account's private sending key, derived
 * from the user's password on their device; this server keeps only its SHA-256 hash (from the department file).
 */
const CONFIG = {
  DEPT_URL: 'https://hamfee77-max.github.io/attendance/js/department.js',
  ROOT_FOLDER: 'غيابات قسم هندسة الموارد المائية',
  EDIT_WINDOW_HOURS: 72,
  TIMEZONE: 'Asia/Baghdad',
};

// ---------------------------------------------------------------- setup (run once)
function setup() {
  const props = PropertiesService.getScriptProperties();
  let root;
  if (props.getProperty('ROOT_ID')) root = DriveApp.getFolderById(props.getProperty('ROOT_ID'));
  else { root = DriveApp.createFolder(CONFIG.ROOT_FOLDER); props.setProperty('ROOT_ID', root.getId()); }
  let ss;
  if (props.getProperty('SHEET_ID')) ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  else {
    ss = SpreadsheetApp.create('سجل الغيابات — Attendance log');
    DriveApp.getFileById(ss.getId()).moveTo(root);
    props.setProperty('SHEET_ID', ss.getId());
  }
  ensureSheet(ss, 'الإرسالات', ['الوقت', 'الحساب', 'الاسم', 'الصلاحية', 'عدد المحاضرات', 'عدد الغيابات', 'المرفوضة', 'نسخة احتياطية']);
  ensureSheet(ss, 'المحاضرات', ['id', 'courseId', 'date', 'updatedAt', 'firstReceived', 'lastReceived', 'by', 'json']);
  ensureSheet(ss, 'التقارير', ['الوقت', 'الحساب', 'الاسم', 'الملف']);
  ['Sheet1', 'ورقة1', 'الورقة1'].forEach(function (n) { const s = ss.getSheetByName(n); if (s && ss.getSheets().length > 1) ss.deleteSheet(s); });
  dept(true);   // checks the department file can be read
  Logger.log('Folder: ' + root.getUrl());
  Logger.log('Log sheet: ' + ss.getUrl());
  Logger.log('Setup complete. Now: Deploy → New deployment → Web app.');
}
function ensureSheet(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); sh.getRange(1, 1, 1, header.length).setFontWeight('bold'); }
  return sh;
}

// ---------------------------------------------------------------- web entry points
function doGet() {
  return json({ ok: true, service: 'attendance-drive', time: Date.now() });
}
function doPost(e) {
  let out;
  try { out = handle(JSON.parse(e.postData.contents)); }
  catch (err) { out = { ok: false, error: String((err && err.message) || err) }; }
  return json(out);
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handle(req) {
  const acc = authenticate(req.account, req.key);
  if (!acc) return { ok: false, error: 'auth' };
  switch (req.action) {
    case 'ping': return { ok: true, name: acc.name, role: acc.role, time: Date.now() };
    case 'submit': return submit(acc, req);
    case 'pull': return pull(acc, req);
    case 'archive': return archive(acc, req);
  }
  return { ok: false, error: 'action' };
}

// ---------------------------------------------------------------- accounts (from the published department file)
function dept(force) {
  const cache = CacheService.getScriptCache();
  if (!force) { const c = cache.get('dept'); if (c) return JSON.parse(c); }
  const txt = UrlFetchApp.fetch(CONFIG.DEPT_URL + '?t=' + Date.now(), { muteHttpExceptions: false }).getContentText();
  const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  const slim = {
    accounts: (j.accounts || []).map(function (a) { return { id: a.id, name: a.name, role: a.role, courses: a.courses || [], keyHash: a.keyHash || '' }; }),
    editWindowHours: Number(((j.config || {}).rules || {}).editWindowHours) || CONFIG.EDIT_WINDOW_HOURS,
  };
  try { cache.put('dept', JSON.stringify(slim), 600); } catch (e) { /* too large to cache: fine */ }
  return slim;
}
function sha256hex(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function authenticate(id, key) {
  if (!id || !key) return null;
  const a = dept().accounts.filter(function (x) { return x.id === id; })[0];
  if (!a || !a.keyHash || sha256hex(String(key)) !== a.keyHash) return null;
  a.role = a.role === 'master' ? 'admin' : a.role === 'committee' ? 'head' : (a.role || 'lecturer');
  return a;
}

// ---------------------------------------------------------------- actions
function submit(acc, req) {
  const lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    const ss = SpreadsheetApp.openById(prop('SHEET_ID'));
    const sh = ss.getSheetByName('المحاضرات');
    const now = Date.now(), windowMs = dept().editWindowHours * 3600000;
    const data = sh.getDataRange().getValues(); const index = {};
    for (let i = 1; i < data.length; i++) index[data[i][0]] = i;
    const accepted = [], rejected = [], latest = {};
    (req.sessions || []).forEach(function (s) { if (s && s.id) latest[s.id] = s; });   // one version per lecture
    Object.keys(latest).map(function (k) { return latest[k]; }).forEach(function (s) {
      if (!s || !s.id || !s.courseId) return;
      if (acc.role === 'lecturer' && acc.courses.indexOf(s.courseId) < 0) { rejected.push({ id: s.id, why: 'course' }); return; }
      const i = index[s.id];
      if (i) {
        const first = Number(data[i][4]) || 0, prevUpdated = Number(data[i][3]) || 0;
        if (acc.role === 'lecturer' && now - first > windowMs) { rejected.push({ id: s.id, why: 'locked' }); return; }
        if ((Number(s.updatedAt) || 0) > prevUpdated) sh.getRange(i + 1, 2, 1, 7).setValues([[s.courseId, s.date, Number(s.updatedAt) || now, first, now, acc.name, JSON.stringify(s)]]);
      } else {
        sh.appendRow([s.id, s.courseId, s.date, Number(s.updatedAt) || now, now, now, acc.name, JSON.stringify(s)]);
      }
      accepted.push(s.id);
    });
    const file = (req.sessions || []).length ? backupFile(acc, req, now) : null;
    const absences = (req.sessions || []).reduce(function (n, s) { return n + Object.keys(s.records || {}).filter(function (k) { const v = s.records[k]; return v === 'A' || v === 'E'; }).length; }, 0);
    ss.getSheetByName('الإرسالات').appendRow([new Date(now), acc.id, acc.name, acc.role, (req.sessions || []).length, absences, rejected.length, file ? file.getUrl() : '']);
    return { ok: true, accepted: accepted, rejected: rejected, time: now };
  } finally { lock.releaseLock(); }
}

function pull(acc, req) {
  const sh = SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('المحاضرات');
  const since = Number(req.since) || 0, data = sh.getDataRange().getValues(), out = [];
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][5]) <= since) continue;
    if (acc.role === 'lecturer' && acc.courses.indexOf(data[i][1]) < 0) continue;
    try { const s = JSON.parse(data[i][7]); s.receivedAt = Number(data[i][5]); s.firstReceived = Number(data[i][4]); s.sentBy = data[i][6]; out.push(s); } catch (e) { /* skip */ }
  }
  return { ok: true, sessions: out, time: Date.now() };
}

function archive(acc, req) {
  const now = Date.now();
  const folder = folderPath([String(req.yearId || 'year'), acc.role === 'lecturer' ? acc.name : 'التقارير الرسمية']);
  const stamp = Utilities.formatDate(new Date(now), CONFIG.TIMEZONE, 'yyyy-MM-dd HH-mm');
  const urls = [];
  (req.files || []).slice(0, 5).forEach(function (f) {
    const file = folder.createFile(stamp + ' — ' + String(f.name || 'report').replace(/[\\/:*?"<>|]+/g, '_'), String(f.content || ''), f.mime || 'text/plain');
    urls.push(file.getUrl());
  });
  SpreadsheetApp.openById(prop('SHEET_ID')).getSheetByName('التقارير').appendRow([new Date(now), acc.id, acc.name, urls.join('\n')]);
  return { ok: true, files: urls, time: now };
}

// ---------------------------------------------------------------- helpers
function prop(k) { const v = PropertiesService.getScriptProperties().getProperty(k); if (!v) throw new Error('Run setup first'); return v; }
function folderPath(names) {
  let f = DriveApp.getFolderById(prop('ROOT_ID'));
  names.forEach(function (n) { const it = f.getFoldersByName(n); f = it.hasNext() ? it.next() : f.createFolder(n); });
  return f;
}
function backupFile(acc, req, now) {
  const folder = folderPath([String(req.yearId || 'year'), acc.name]);
  const stamp = Utilities.formatDate(new Date(now), CONFIG.TIMEZONE, 'yyyy-MM-dd HH-mm-ss');
  return folder.createFile(stamp + '.json', JSON.stringify({ lecturer: acc.name, account: acc.id, sentAt: new Date(now).toISOString(), yearId: req.yearId || '', sessions: req.sessions || [] }, null, 1), 'application/json');
}
