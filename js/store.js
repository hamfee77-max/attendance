// ============================================================================
//  STORE: state, persistence, seeding, helpers, statistics
// ============================================================================
(function () {
  const CFG = window.APP_CONFIG;
  const KEY = CFG.appId + ':data:v1';
  const UIKEY = CFG.appId + ':ui:v1';

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const todayStr = () => {
    const d = new Date(); const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  function defaultSettings() {
    return {
      lang: CFG.defaultLang, lecturer: '',
      warn1: CFG.rules.warn1, warn2: CFG.rules.warn2,
      failUnexcused: CFG.rules.failUnexcused, failTotal: CFG.rules.failTotal,
      recipients: clone(CFG.recipients || []),
    };
  }

  function seedState() {
    const d = clone(window.WRE_SEED || { years: [], groups: [], students: [], courses: [] });
    return {
      version: 1, settings: defaultSettings(),
      currentYear: d.years[0] ? d.years[0].id : '', currentTerm: 't1',
      years: d.years, groups: d.groups, students: d.students, courses: d.courses, sessions: [],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.years) return null;
      s.settings = Object.assign(defaultSettings(), s.settings || {});
      if (!Array.isArray(s.settings.recipients)) s.settings.recipients = clone(CFG.recipients || []);
      return s;
    } catch (e) { console.warn('load failed', e); return null; }
  }

  let S = load() || seedState();
  let UI = (() => { try { return JSON.parse(localStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } })();
  UI = Object.assign({ tab: 'attend', groupId: '', courseId: '', reportTab: 'memo', period: 'week', reportDate: todayStr(), mine: false }, UI);

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.error(e); alert('Storage full / unavailable'); } }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify(UI)); } catch (e) { /* ignore */ } }

  // ---------- lookups ----------
  const year = () => S.years.find((y) => y.id === S.currentYear) || S.years[0];
  const termOf = (termId, y) => ((y || year()) ? (y || year()).terms.find((t) => t.id === termId) : null);
  const term = () => termOf(S.currentTerm);
  const groupsOfYear = () => S.groups.filter((g) => g.yearId === S.currentYear).sort((a, b) => a.stage - b.stage || a.nameAr.localeCompare(b.nameAr, 'ar'));
  const group = (id) => S.groups.find((g) => g.id === id);
  const course = (id) => S.courses.find((c) => c.id === id);
  const student = (id) => S.students.find((s) => s.id === id);
  const studentsOf = (gid) => S.students.filter((s) => s.groupId === gid).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  const coursesFor = (gid, termId) => S.courses.filter((c) => c.yearId === S.currentYear && (!gid || c.groupId === gid) && c.termId === (termId || S.currentTerm));
  const sessionsOf = (cid) => S.sessions.filter((s) => s.courseId === cid).sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0));

  // Lecturer matching: strip academic titles and compare normalized names
  function normName(s) {
    return (s || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/(ا\.م\.د\.|ا\.د\.|م\.د\.|م\.م\.|ا\.م\.|أ\.م\.د\.|أ\.د\.|د\.|م\.|ا\.|أ\.|prof\.?|dr\.?|eng\.?|asst\.?|assoc\.?|lect\.?)/gi, ' ')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function isMine(c) {
    const me = normName(S.settings.lecturer); if (!me) return true;
    const lec = normName(c.lecturer);
    if (!lec) return false;
    const parts = me.split(' ').filter((p) => p.length > 1);
    return parts.length > 0 && parts.every((p) => lec.includes(p));
  }

  // ---------- statistics ----------
  function statusOf(pctU, pctT) {
    const r = S.settings;
    if (pctU > r.failUnexcused || pctT > r.failTotal) return 'fail';
    if (pctU >= r.warn2) return 'warn2';
    if (pctU >= r.warn1) return 'warn1';
    return 'ok';
  }
  const STATUS_RANK = { ok: 0, warn1: 1, warn2: 2, fail: 3 };

  // Stats of one student in one course. range = {from,to} filters the counted sessions (period),
  // while cumulative percentages always use the whole term.
  function courseStats(c, sid, range) {
    const t = termOf(c.termId) || { weeks: CFG.rules.weeksPerTerm };
    const planned = (Number(c.weeklyHours) || 0) * (Number(t.weeks) || CFG.rules.weeksPerTerm);
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
    const pctHeld = cum.held ? (cum.absentH / cum.held) * 100 : 0;
    return {
      planned, held: acc.held, sessions: acc.sessions, absentH: acc.absentH, excusedH: acc.excusedH, late: acc.late,
      absentDays: acc.absentDays.size, excusedDays: acc.excusedDays.size, absentSessions: acc.absentSessions,
      cumHeld: cum.held, cumAbsentH: cum.absentH, cumExcusedH: cum.excusedH,
      pctU, pctT, pctHeld, status: statusOf(pctU, pctT),
    };
  }

  // Aggregate across several courses for one student (e.g. a stage report)
  function studentAggregate(courses, sid, range) {
    const rows = courses.map((c) => ({ course: c, st: courseStats(c, sid, range) }));
    const agg = { planned: 0, held: 0, absentH: 0, excusedH: 0, late: 0, cumAbsentH: 0, cumExcusedH: 0, cumHeld: 0, absentDays: new Set(), worst: 'ok', worstCourse: null, rows };
    const dayset = new Set();
    for (const { course: c, st } of rows) {
      agg.planned += st.planned; agg.held += st.held; agg.absentH += st.absentH; agg.excusedH += st.excusedH; agg.late += st.late;
      agg.cumAbsentH += st.cumAbsentH; agg.cumExcusedH += st.cumExcusedH; agg.cumHeld += st.cumHeld;
      if (STATUS_RANK[st.status] > STATUS_RANK[agg.worst] || (STATUS_RANK[st.status] === STATUS_RANK[agg.worst] && agg.worstCourse && st.pctU > courseStats(agg.worstCourse, sid).pctU)) { agg.worst = st.status; agg.worstCourse = c; }
      // distinct absence dates across courses
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

  // ---------- mutations ----------
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
    const existing = coursesFor(gid, toTerm).map((c) => c.nameAr);
    let n = 0;
    for (const c of coursesFor(gid, fromTerm)) {
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
      for (const c of S.courses.filter((c) => c.yearId === copyFrom && map[c.groupId])) S.courses.push(Object.assign(clone(c), { id: 'c_' + uid(), yearId: y.id, groupId: map[c.groupId] }));
    }
  }

  // ---------- backup ----------
  function exportJSON() { return JSON.stringify(Object.assign({ exportedAt: new Date().toISOString(), app: CFG.appId }, S), null, 1); }
  function importJSON(text, mode) {
    const d = JSON.parse(text);
    if (!d || !Array.isArray(d.years) || !Array.isArray(d.sessions)) throw new Error('bad');
    if (mode === 'replace') {
      S = { version: 1, settings: Object.assign(defaultSettings(), d.settings || {}, { lang: S.settings.lang, lecturer: S.settings.lecturer }), currentYear: d.currentYear, currentTerm: d.currentTerm || 't1', years: d.years, groups: d.groups || [], students: d.students || [], courses: d.courses || [], sessions: d.sessions };
    } else {
      for (const y of d.years) if (!S.years.find((x) => x.id === y.id)) S.years.push(y);
      for (const k of ['groups', 'students', 'courses']) for (const o of d[k] || []) if (!S[k].find((x) => x.id === o.id)) S[k].push(o);
      for (const s of d.sessions) {
        const i = S.sessions.findIndex((x) => x.id === s.id);
        if (i < 0) S.sessions.push(s); else if ((s.updatedAt || 0) > (S.sessions[i].updatedAt || 0)) S.sessions[i] = s;
      }
    }
    if (!S.years.find((y) => y.id === S.currentYear)) S.currentYear = S.years[0] ? S.years[0].id : '';
    save();
  }
  function resetToSeed() { S = seedState(); save(); }

  window.Store = {
    get S() { return S; }, get UI() { return UI; }, CFG, uid, clone, todayStr, save, saveUI,
    year, term, termOf, groupsOfYear, group, course, student, studentsOf, coursesFor, sessionsOf, isMine,
    courseStats, studentAggregate, statusOf, STATUS_RANK,
    upsert, deleteGroup, deleteCourse, deleteStudent, deleteYear, copyCoursesToTerm, addYear,
    exportJSON, importJSON, resetToSeed,
  };
})();
