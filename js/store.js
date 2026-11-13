// ============================================================================
//  STORE: department file, state, persistence, scope, statistics
// ============================================================================
(function () {
  const CFG = window.APP_CONFIG;
  const DEPT = window.DEPT || {};
  const KEY = CFG.appId + ':data:v1';
  const UIKEY = CFG.appId + ':ui:v1';
  const DRAFTKEY = CFG.appId + ':deptdraft';

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const todayStr = () => {
    const d = new Date(); const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  function deepMerge(dst, src) {
    for (const k in src || {}) {
      const v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) deepMerge(dst[k], v);
      else dst[k] = clone(v);
    }
    return dst;
  }

  // ---------- department configuration: base config <- department.js <- master's unpublished draft ----------
  deepMerge(CFG, DEPT.config || {});
  let DRAFT = (() => { try { return JSON.parse(localStorage.getItem(DRAFTKEY)) || null; } catch (e) { return null; } })();
  if (DRAFT && DRAFT.basedOn !== (DEPT.version || 0)) DRAFT = null;          // a newer department file was published
  if (DRAFT && DRAFT.config) deepMerge(CFG, DRAFT.config);
  function saveDraft(patch) {
    DRAFT = DRAFT || { basedOn: DEPT.version || 0, config: {} };
    if (patch.config) deepMerge(DRAFT.config, patch.config);
    if (patch.accounts) DRAFT.accounts = patch.accounts;
    DRAFT.changed = true;
    try { localStorage.setItem(DRAFTKEY, JSON.stringify(DRAFT)); } catch (e) { alert('Storage full'); }
  }
  const accounts = () => (DRAFT && DRAFT.accounts) || DEPT.accounts || [];
  const hasDraft = () => !!(DRAFT && DRAFT.changed);

  // ---------- state ----------
  function defaultSettings() { return { lang: CFG.defaultLang }; }
  function seedLists() { return clone(DEPT.lists || window.WRE_SEED || { years: [], groups: [], students: [], courses: [] }); }
  function seedState() {
    const d = seedLists();
    return {
      version: 2, listsVersion: DEPT.version || 0, settings: defaultSettings(),
      currentYear: d.years[0] ? d.years[0].id : '', currentTerm: 't1',
      years: d.years, groups: d.groups, students: d.students, courses: d.courses, sessions: [],
    };
  }
  function migrate(s) {
    if ((s.version || 1) < 2) {
      // v2: courses of annual-system stages become year-long courses
      for (const c of s.courses) { const g = s.groups.find((x) => x.id === c.groupId); if (g && g.system === 'annual' && c.termId !== 'year') c.termId = 'year'; }
      delete s.settings.warn1; delete s.settings.warn2; delete s.settings.failUnexcused; delete s.settings.failTotal; delete s.settings.recipients; delete s.settings.lecturer;
      s.version = 2;
    }
    return s;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY); if (!raw) return null;
      const s = JSON.parse(raw); if (!s || !s.years) return null;
      s.settings = Object.assign(defaultSettings(), s.settings || {});
      return migrate(s);
    } catch (e) { console.warn('load failed', e); return null; }
  }
  // Bring the published lists (years, stages, students, courses) onto this device when department.js changes.
  function syncLists(s) {
    if (!DEPT.lists || (s.listsVersion || 0) === (DEPT.version || 0)) return s;
    const L = clone(DEPT.lists);
    for (const k of ['years', 'groups', 'students', 'courses']) {
      const ids = new Set(L[k].map((x) => x.id));
      const used = k === 'courses' ? new Set(s.sessions.map((x) => x.courseId)) : null;
      // keep local items only if they are not part of the published lists and still referenced by recorded lectures
      const keep = s[k].filter((x) => !ids.has(x.id) && used && used.has(x.id));
      s[k] = L[k].concat(keep);
    }
    if (!s.years.find((y) => y.id === s.currentYear)) s.currentYear = s.years[0] ? s.years[0].id : '';
    s.listsVersion = DEPT.version || 0;
    return s;
  }

  let S = load() || seedState();
  S = syncLists(S);
  let UI = (() => { try { return JSON.parse(localStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } })();
  UI = Object.assign({ tab: 'attend', groupId: '', courseId: '', reportTab: 'memo', period: 'week', reportDate: todayStr(), mine: false, absOnly: true }, UI);

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.error(e); alert('Storage full / unavailable'); } }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify(UI)); } catch (e) { /* ignore */ } }
  save();

  // ---------- scope: which courses the signed-in account may see (null = all) ----------
  let scope = null, mineSet = null;
  function setScope(ids, mine) { scope = ids ? new Set(ids) : null; mineSet = mine ? new Set(mine) : null; }
  const inScope = (c) => !scope || scope.has(c.id);
  const isMine = (c) => !!(mineSet && mineSet.has(c.id));

  // ---------- lookups ----------
  const year = () => S.years.find((y) => y.id === S.currentYear) || S.years[0];
  const termOf = (termId, y) => { const yy = y || year(); if (!yy) return null; if (termId === 'year') return { id: 'year', start: yy.start, end: yy.end, weeks: yy.terms.reduce((a, t) => a + (Number(t.weeks) || 0), 0) }; return yy.terms.find((t) => t.id === termId); };
  const term = () => termOf(S.currentTerm);
  const isYearCourse = (c) => c.termId === 'year';
  const weeksOf = (c) => { const t = termOf(c.termId); return (t && Number(t.weeks)) || CFG.rules.weeksPerTerm; };
  const group = (id) => S.groups.find((g) => g.id === id);
  const course = (id) => S.courses.find((c) => c.id === id);
  const student = (id) => S.students.find((s) => s.id === id);
  const studentsOf = (gid) => S.students.filter((s) => s.groupId === gid).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  const coursesFor = (gid, termId) => S.courses.filter((c) => c.yearId === S.currentYear && (!gid || c.groupId === gid) && (c.termId === (termId || S.currentTerm) || c.termId === 'year') && inScope(c));
  const groupsOfYear = () => S.groups.filter((g) => g.yearId === S.currentYear && (!scope || S.courses.some((c) => c.groupId === g.id && inScope(c))))
    .sort((a, b) => a.stage - b.stage || a.nameAr.localeCompare(b.nameAr, 'ar'));
  const sessionsOf = (cid) => S.sessions.filter((s) => s.courseId === cid).sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0));

  // ---------- statistics ----------
  // Teaching system of a course: annual stages / year-long courses follow the annual rules, others Bologna
  const systemOfGroup = (g) => (g && g.system === 'annual' ? 'annual' : 'bologna');
  const systemOf = (c) => (c && (c.termId === 'year' || systemOfGroup(group(c.groupId)) === 'annual') ? 'annual' : 'bologna');
  const rules = (sys) => { const R = CFG.rules; return Object.assign({ weeksPerTerm: R.weeksPerTerm, editWindowHours: R.editWindowHours, trackFrom: R.trackFrom }, R[sys || 'annual'] || R.annual || {}); };
  function statusOf(pctU, pctT, sys, weeks) {
    const r = rules(sys); let w1 = r.warn1, w2 = r.warn2;
    // Bologna: the alert is due at 7 % "or one study week", the final warning at 14 % "or two weeks"
    if (r.weekEquivalent && weeks) { w1 = Math.min(w1, 100 / weeks); w2 = Math.min(w2, 200 / weeks); }
    const e = 1e-9;
    if (pctU > r.failUnexcused + e || pctT > r.failTotal + e) return 'fail';
    if (pctU >= w2 - e) return 'warn2';
    if (pctU >= w1 - e) return 'warn1';
    return 'ok';
  }
  const STATUS_RANK = { ok: 0, warn1: 1, warn2: 2, fail: 3 };

  // Stats of one student in one course. range = {from,to} filters the counted lectures (period);
  // cumulative percentages always use the whole course duration (term for Bologna, year for annual).
  function courseStats(c, sid, range) {
    const planned = (Number(c.weeklyHours) || 0) * weeksOf(c);
    const all = sessionsOf(c.id);
    const inRange = (s) => !range || ((!range.from || s.date >= range.from) && (!range.to || s.date <= range.to));
    const acc = { held: 0, absentH: 0, excusedH: 0, late: 0, absentDays: new Set(), excusedDays: new Set(), sessions: 0, absentSessions: 0 };
    const cum = { held: 0, absentH: 0, excusedH: 0 };
    for (const s of all) {
      const h = Number(s.hours) || 0; const r = (s.records || {})[sid] || 'P';
      cum.held += h; if (r === 'A') cum.absentH += h; else if (r === 'E') cum.excusedH += h;
      if (!inRange(s)) continue;
      acc.sessions += 1; acc.held += h;
      if (r === 'A') { acc.absentH += h; acc.absentDays.add(s.date); acc.absentSessions++; }
      else if (r === 'E') { acc.excusedH += h; acc.excusedDays.add(s.date); acc.absentSessions++; }
      else if (r === 'L') acc.late += 1;
    }
    const pctU = planned ? (cum.absentH / planned) * 100 : 0;
    const pctT = planned ? ((cum.absentH + cum.excusedH) / planned) * 100 : 0;
    return {
      planned, held: acc.held, sessions: acc.sessions, absentH: acc.absentH, excusedH: acc.excusedH, late: acc.late,
      absentDays: acc.absentDays.size, excusedDays: acc.excusedDays.size, absentSessions: acc.absentSessions,
      cumHeld: cum.held, cumAbsentH: cum.absentH, cumExcusedH: cum.excusedH,
      pctU, pctT, sys: systemOf(c), status: statusOf(pctU, pctT, systemOf(c), weeksOf(c)),
    };
  }

  function studentAggregate(courses, sid, range) {
    const rows = courses.map((c) => ({ course: c, st: courseStats(c, sid, range) }));
    const agg = { planned: 0, held: 0, absentH: 0, excusedH: 0, late: 0, cumAbsentH: 0, cumExcusedH: 0, cumHeld: 0, worst: 'ok', worstCourse: null, worstPct: -1, rows, periodAbsences: 0 };
    const dayset = new Set();
    for (const { course: c, st } of rows) {
      agg.planned += st.planned; agg.held += st.held; agg.absentH += st.absentH; agg.excusedH += st.excusedH; agg.late += st.late;
      agg.cumAbsentH += st.cumAbsentH; agg.cumExcusedH += st.cumExcusedH; agg.cumHeld += st.cumHeld; agg.periodAbsences += st.absentSessions;
      if (STATUS_RANK[st.status] > STATUS_RANK[agg.worst] || (STATUS_RANK[st.status] === STATUS_RANK[agg.worst] && st.pctU > agg.worstPct)) { agg.worst = st.status; agg.worstCourse = c; agg.worstPct = st.pctU; }
      for (const s of sessionsOf(c.id)) {
        if (range && ((range.from && s.date < range.from) || (range.to && s.date > range.to))) continue;
        const r = (s.records || {})[sid]; if (r === 'A' || r === 'E') dayset.add(s.date);
      }
    }
    agg.absentDays = dayset.size;
    agg.pctU = agg.planned ? (agg.cumAbsentH / agg.planned) * 100 : 0;
    agg.pctT = agg.planned ? ((agg.cumAbsentH + agg.cumExcusedH) / agg.planned) * 100 : 0;
    if (!agg.worstCourse && rows.length) agg.worstCourse = rows[0].course;
    return agg;
  }

  // ---------- mutations (lists: master account only; enforced in the UI) ----------
  function upsert(list, obj) { const i = list.findIndex((x) => x.id === obj.id); if (i >= 0) list[i] = obj; else list.push(obj); }
  function deleteGroup(gid) {
    const cids = S.courses.filter((c) => c.groupId === gid).map((c) => c.id);
    S.sessions = S.sessions.filter((s) => !cids.includes(s.courseId));
    S.courses = S.courses.filter((c) => c.groupId !== gid);
    S.students = S.students.filter((s) => s.groupId !== gid);
    S.groups = S.groups.filter((g) => g.id !== gid);
  }
  function deleteCourse(cid) { S.sessions = S.sessions.filter((s) => s.courseId !== cid); S.courses = S.courses.filter((c) => c.id !== cid); }
  function deleteStudent(sid) {
    S.students = S.students.filter((s) => s.id !== sid);
    for (const s of S.sessions) { if (s.records) delete s.records[sid]; if (s.notes) delete s.notes[sid]; }
  }
  function deleteYear(yid) {
    for (const g of S.groups.filter((g) => g.yearId === yid)) deleteGroup(g.id);
    S.courses = S.courses.filter((c) => c.yearId !== yid);
    S.years = S.years.filter((y) => y.id !== yid);
    if (S.currentYear === yid) S.currentYear = S.years[0] ? S.years[0].id : '';
  }
  function copyCoursesToTerm(gid, fromTerm, toTerm) {
    const existing = S.courses.filter((c) => c.yearId === S.currentYear && c.groupId === gid && c.termId === toTerm).map((c) => c.nameAr);
    let n = 0;
    for (const c of S.courses.filter((c) => c.yearId === S.currentYear && c.groupId === gid && c.termId === fromTerm)) {
      if (existing.includes(c.nameAr)) continue;
      S.courses.push(Object.assign(clone(c), { id: 'c_' + uid(), termId: toTerm })); n++;
    }
    return n;
  }
  function addYear(y, copyFrom) {
    S.years.push(y);
    if (copyFrom) {
      const map = {};
      for (const g of S.groups.filter((g) => g.yearId === copyFrom)) {
        const ng = Object.assign(clone(g), { id: 'g_' + uid(), yearId: y.id }); map[g.id] = ng.id; S.groups.push(ng);
        for (const s of S.students.filter((s) => s.groupId === g.id)) S.students.push(Object.assign(clone(s), { id: 's_' + uid(), groupId: ng.id }));
      }
      const cmap = {};
      for (const c of S.courses.filter((c) => c.yearId === copyFrom && map[c.groupId])) { const nc = Object.assign(clone(c), { id: 'c_' + uid(), yearId: y.id, groupId: map[c.groupId] }); cmap[c.id] = nc.id; S.courses.push(nc); }
      return cmap;
    }
    return {};
  }

  // ---------- data exchange ----------
  function exportJSON() { return JSON.stringify(Object.assign({ exportedAt: new Date().toISOString(), app: CFG.appId, type: 'wre-backup' }, S), null, 1); }
  // A lecturer's absence file: only the lectures of the given courses (present students are never stored)
  function exportAbsences(courseIds, who) {
    const ids = new Set(courseIds);
    return JSON.stringify({ type: 'wre-absences', app: CFG.appId, version: 1, exportedAt: new Date().toISOString(), lecturer: who || '', yearId: S.currentYear, courses: [...ids], sessions: S.sessions.filter((s) => ids.has(s.courseId)) }, null, 1);
  }
  function mergeSessions(list) {
    let added = 0, updated = 0;
    for (const s of list || []) {
      if (!s || !s.id || !course(s.courseId)) continue;
      const i = S.sessions.findIndex((x) => x.id === s.id);
      if (i < 0) { S.sessions.push(s); added++; } else if ((s.updatedAt || 0) > (S.sessions[i].updatedAt || 0)) { S.sessions[i] = s; updated++; }
    }
    return { added, updated };
  }
  function importAny(text, mode) {
    const d = JSON.parse(text);
    if (d && d.type === 'wre-absences') { const r = mergeSessions(d.sessions); save(); return Object.assign({ kind: 'absences', lecturer: d.lecturer }, r); }
    if (!d || !Array.isArray(d.years) || !Array.isArray(d.sessions)) throw new Error('bad');
    if (mode === 'replace') {
      S = migrate({ version: d.version || 1, listsVersion: d.listsVersion || 0, settings: Object.assign(defaultSettings(), d.settings || {}, { lang: S.settings.lang }), currentYear: d.currentYear, currentTerm: d.currentTerm || 't1', years: d.years, groups: d.groups || [], students: d.students || [], courses: d.courses || [], sessions: d.sessions });
    } else {
      for (const y of d.years) if (!S.years.find((x) => x.id === y.id)) S.years.push(y);
      for (const k of ['groups', 'students', 'courses']) for (const o of d[k] || []) if (!S[k].find((x) => x.id === o.id)) S[k].push(o);
      mergeSessions(d.sessions);
    }
    if (!S.years.find((y) => y.id === S.currentYear)) S.currentYear = S.years[0] ? S.years[0].id : '';
    save();
    return { kind: 'backup' };
  }
  function resetToSeed() { const keepLang = S.settings.lang; S = seedState(); S.settings.lang = keepLang; save(); }

  // ---------- department file export (master) ----------
  function departmentFile() {
    const pickCfg = { institution: CFG.institution, logos: CFG.logos, rules: CFG.rules, committee: CFG.committee, recipients: CFG.recipients, stages: CFG.stages, androidApk: CFG.androidApk };
    const dept = {
      version: Date.now(),
      exportedAt: new Date().toISOString(),
      config: clone(pickCfg),
      accounts: clone(accounts()),
      lists: { years: clone(S.years), groups: clone(S.groups), students: clone(S.students), courses: clone(S.courses) },
    };
    return '// Department file for the Student Attendance app — exported from Settings → Administration.\n'
      + '// Replace js/department.js on the website with this file, then publish.\n'
      + 'window.DEPT = ' + JSON.stringify(dept, null, 1) + ';\n';
  }

  window.Store = {
    get S() { return S; }, get UI() { return UI; }, CFG, DEPT, uid, clone, todayStr, save, saveUI, deepMerge,
    saveDraft, accounts, hasDraft, setScope, inScope, isMine,
    year, term, termOf, isYearCourse, weeksOf, groupsOfYear, group, course, student, studentsOf, coursesFor, sessionsOf,
    rules, systemOf, systemOfGroup, courseStats, studentAggregate, statusOf, STATUS_RANK,
    upsert, deleteGroup, deleteCourse, deleteStudent, deleteYear, copyCoursesToTerm, addYear,
    exportJSON, exportAbsences, importAny, resetToSeed, departmentFile,
  };
})();
