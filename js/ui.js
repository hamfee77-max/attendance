// ============================================================================
//  UI: rendering + event handling (vanilla JS, no build step)
// ============================================================================
(function () {
  const St = window.Store, R = window.Reports, CFG = St.CFG;
  const lang = () => St.S.settings.lang;
  const t = (k, p) => R.tr(k, lang(), p);
  const esc = R.esc;
  const $ = (s) => document.querySelector(s);
  const UI = St.UI;
  let draft = null;              // lecture being edited
  let deferredPrompt = null;
  let lastReport = { html: '', csv: '', name: 'report' };

  const gname = (g) => R.groupName(g, lang());
  const cname = (c) => R.courseName(c, lang());
  const termLabel = (id) => R.termName(id, lang());
  const typeLabel = (ty) => t({ T: 'typeT', U: 'typeU', P: 'typeP', X: 'typeX' }[ty] || 'typeX');
  const opt = (v, label, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(label)}</option>`;

  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2200); }
  function applyDir() { document.documentElement.lang = lang(); document.documentElement.dir = lang() === 'ar' ? 'rtl' : 'ltr'; document.title = t('appName'); }

  // ---------- guards: keep selected group/course valid ----------
  function ensureSelection() {
    const groups = St.groupsOfYear();
    if (!groups.find((g) => g.id === UI.groupId)) UI.groupId = groups[0] ? groups[0].id : '';
    const courses = St.coursesFor(UI.groupId).filter((c) => !UI.mine || St.isMine(c));
    if (!courses.find((c) => c.id === UI.courseId)) UI.courseId = courses[0] ? courses[0].id : '';
  }

  function render() {
    applyDir(); ensureSelection();
    renderTop(); renderTabs();
    const v = { attend: viewAttend, courses: viewCourses, students: viewStudents, reports: viewReports, settings: viewSettings }[UI.tab] || viewAttend;
    $('#view').innerHTML = v();
    St.saveUI(); window.scrollTo(0, 0);
  }

  function renderTop() {
    const ins = CFG.institution, lg = CFG.logos, L = lang() === 'ar' ? 0 : 1;
    const y = St.year();
    $('#top').innerHTML = `<div class="brand">
      <div class="logos">${lg.university ? `<img src="${lg.university}" alt="">` : ''}${lg.college ? `<img src="${lg.college}" alt="">` : ''}<img src="${R.deptLogoSrc()}" onerror="window.__deptPng=false;this.onerror=null;this.src='${lg.department}'" alt=""></div>
      <div class="title"><h1>${esc(ins.department[L])}</h1><small>${esc(ins.college[L])} — ${esc(ins.university[L])} · ${esc(t('appName'))}</small></div>
      <button class="lang" data-act="toggle-lang">${lang() === 'ar' ? 'EN' : 'عربي'}</button></div>
      <div class="ctx">
        <select data-set="currentYear">${St.S.years.map((x) => opt(x.id, x.name, x.id === St.S.currentYear)).join('')}</select>
        <select data-set="currentTerm">${CFG.terms.map((x) => opt(x[0], lang() === 'ar' ? x[1] : x[2], x[0] === St.S.currentTerm)).join('')}</select>
      </div>`;
  }
  function renderTabs() {
    const tabs = [['attend', '✓', 'tabAttend'], ['courses', '📚', 'tabCourses'], ['students', '👥', 'tabStudents'], ['reports', '📄', 'tabReports'], ['settings', '⚙️', 'tabSettings']];
    $('#tabs').innerHTML = tabs.map(([id, ic, k]) => `<button class="${UI.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}"><span class="ic">${ic}</span>${t(k)}</button>`).join('');
  }

  // ---------- shared selectors ----------
  function groupSelect(attr, value, allowAll) {
    const gs = St.groupsOfYear();
    return `<select ${attr}>${allowAll ? opt('', t('allGroups'), !value) : ''}${gs.map((g) => opt(g.id, gname(g), g.id === value)).join('')}</select>`;
  }
  function courseSelect(attr, gid, value, allowAll) {
    const cs = St.coursesFor(gid).filter((c) => !UI.mine || St.isMine(c));
    return `<select ${attr}>${allowAll ? opt('', t('allCourses'), !value) : (cs.length ? '' : opt('', t('selectCourse'), true))}${cs.map((c) => opt(c.id, `${cname(c)} — ${c.lecturer || ''}`, c.id === value)).join('')}</select>`;
  }
  const mineBox = () => St.S.settings.lecturer ? `<label class="row fix" style="gap:6px"><input type="checkbox" data-set="ui.mine" ${UI.mine ? 'checked' : ''}><span class="small">${t('myCourses')}</span></label>` : '';

  // ================= ATTENDANCE =================
  function viewAttend() {
    if (draft) return viewSession();
    const groups = St.groupsOfYear();
    if (!groups.length) return `<div class="card empty">${t('noGroups')}</div>`;
    const c = St.course(UI.courseId);
    const todayIdx = new Date().getDay(); const dayAr = I18N.dayNames[0].split(',')[todayIdx]; const dayEn = I18N.dayNames[1].split(',')[todayIdx];
    const todays = St.coursesFor(UI.mine ? '' : UI.groupId).filter((x) => (!UI.mine || St.isMine(x)) && x.schedule && (x.schedule.includes(dayAr) || x.schedule.toLowerCase().includes(dayEn.toLowerCase())));
    let html = `<div class="card"><label class="f">${t('group')}</label>${groupSelect('data-set="ui.groupId"', UI.groupId)}
      <label class="f">${t('course')}</label><div class="row">${courseSelect('data-set="ui.courseId"', UI.groupId, UI.courseId)}${mineBox()}</div></div>`;
    if (todays.length) html += `<div class="card"><h3>${t('todayCourses')} · ${lang() === 'ar' ? dayAr : dayEn} ${R.dmy(St.todayStr())}</h3><div class="today-strip">${todays.map((x) => `<div class="tc" data-act="pick-course" data-id="${x.id}" data-g="${x.groupId}"><b>${esc(cname(x))}</b>${esc(gname(St.group(x.groupId)))}<br>${esc(x.schedule)} · ${esc(x.room || '')}</div>`).join('')}</div></div>`;
    if (!c) return html + `<div class="card empty">${t('noCourses')}</div>`;
    const sess = St.sessionsOf(c.id); const students = St.studentsOf(c.groupId);
    const held = sess.reduce((a, s) => a + (Number(s.hours) || 0), 0);
    const term = St.termOf(c.termId) || {}; const planned = (c.weeklyHours || 0) * (term.weeks || CFG.rules.weeksPerTerm);
    html += `<div class="card"><h3><span>${esc(cname(c))}</span><span class="chip">${typeLabel(c.type)}</span></h3>
      <div class="stat-row"><span>${t('lecturer')}: ${esc(c.lecturer || '—')}</span><span>${esc(c.schedule || '')}</span><span>${esc(c.room || '')}</span></div>
      <div class="kpis"><div class="kpi"><b>${students.length}</b><span>${t('studentsCount')}</span></div><div class="kpi"><b>${sess.length}</b><span>${t('sessions')}</span></div><div class="kpi"><b>${R.fmtH(held)}</b><span>${t('heldHours')}</span></div><div class="kpi"><b>${R.fmtH(planned)}</b><span>${t('plannedHours')}</span></div></div>
      <button class="btn primary block" data-act="new-session">＋ ${t('newSession')}</button>
      <div class="toolbar"><button class="btn" data-act="xls-import">📥 ${t('xlsImport')}</button><button class="btn" data-act="xls-template">⬇ ${t('xlsTemplate')}</button></div></div>`;
    html += `<div class="card"><h3>${t('sessions')}</h3>`;
    if (!sess.length) html += `<div class="empty">${t('noSessions')}</div>`;
    else html += `<div class="list">${sess.slice().reverse().map((s) => { const abs = Object.values(s.records || {}).filter((v) => v === 'A' || v === 'E').length; return `<div class="item" data-act="edit-session" data-id="${s.id}"><div class="main"><div class="t">${R.dmy(s.date)} · ${R.dayName(s.date, lang())} · ${R.fmtH(s.hours)} ${t('hours')}</div><div class="s">${abs} ${t('absentCount')}${s.topic ? ' · ' + esc(s.topic) : ''}</div></div><div class="acts"><button class="icon" data-act="del-session" data-id="${s.id}" title="${t('delete')}">🗑</button></div></div>`; }).join('')}</div>`;
    return html + '</div>';
  }

  function viewSession() {
    const c = St.course(draft.courseId); const students = St.studentsOf(c.groupId);
    const term = St.termOf(c.termId);
    const outside = term && (draft.date < term.start || draft.date > term.end);
    const absN = Object.values(draft.records).filter((v) => v === 'A' || v === 'E').length;
    const seg = (sid) => { const r = draft.records[sid] || 'P'; return `<div class="seg">${['P', 'A', 'E', 'L'].map((k) => `<button class="${r === k ? 'on ' + k : ''}" data-act="set-rec" data-id="${sid}" data-v="${k}" title="${t({ P: 'present', A: 'absent', E: 'excused', L: 'late' }[k])}">${t({ P: 'presentShort', A: 'absentShort', E: 'excusedShort', L: 'lateShort' }[k])}</button>`).join('')}</div>`; };
    return `<div class="card"><h3><span>${esc(cname(c))}</span><button class="btn sm ghost" data-act="cancel-session">✕ ${t('cancel')}</button></h3>
      <div class="muted">${esc(gname(St.group(c.groupId)))} · ${esc(c.lecturer || '')}</div>
      <div class="grid2"><div><label class="f">${t('date')}</label><input type="date" data-draft="date" value="${draft.date}"></div><div><label class="f">${t('hours')}</label><input type="number" min="0.5" step="0.5" data-draft="hours" value="${draft.hours}"></div></div>
      <label class="f">${t('topic')}</label><input type="text" data-draft="topic" value="${esc(draft.topic || '')}">
      ${outside ? `<p class="small" style="color:var(--warn2)">${t('outsideTerm')}</p>` : ''}
      <div class="toolbar"><button class="btn" data-act="all-present">✓ ${t('allPresent')}</button></div>
      <p class="muted small">${t('tapToCycle')} · ${t('present')} / ${t('absent')} / ${t('excused')} / ${t('late')}</p></div>
      <div class="card sheet">${students.length ? students.map((s, i) => { const r = draft.records[s.id] || 'P'; const note = draft.notes[s.id]; return `<div class="srow ${r}"><div class="nm" data-act="cycle" data-id="${s.id}"><span class="idx">${i + 1}</span>${esc(s.name)}${note ? `<span class="nt">✎ ${esc(note)}</span>` : ''}</div>${r === 'E' ? `<button class="icon" data-act="note" data-id="${s.id}">✎</button>` : ''}${seg(s.id)}</div>`; }).join('') : `<div class="empty">${t('noStudents')}</div>`}</div>
      <div class="sticky-actions"><div class="toolbar"><button class="btn primary" data-act="save-session">💾 ${t('save')} (${absN} ${t('absentCount')})</button><button class="btn" data-act="cancel-session">${t('cancel')}</button></div></div>`;
  }
  function newDraft(courseId, sess) {
    const c = St.course(courseId);
    draft = sess ? { id: sess.id, courseId, date: sess.date, hours: sess.hours, topic: sess.topic || '', records: Object.assign({}, sess.records || {}), notes: Object.assign({}, sess.notes || {}), createdAt: sess.createdAt }
      : { id: null, courseId, date: St.todayStr(), hours: c.weeklyHours || 2, topic: '', records: {}, notes: {} };
  }
  function saveDraft() {
    if (!draft.date) { toast(t('required')); return; }
    const records = {}; for (const k in draft.records) if (draft.records[k] && draft.records[k] !== 'P') records[k] = draft.records[k];
    const notes = {}; for (const k in draft.notes) if (draft.notes[k]) notes[k] = draft.notes[k];
    const s = { id: draft.id || 's_' + St.uid(), courseId: draft.courseId, date: draft.date, hours: Number(draft.hours) || 0, topic: draft.topic || '', records, notes, createdAt: draft.createdAt || Date.now(), updatedAt: Date.now() };
    St.upsert(St.S.sessions, s); St.save(); draft = null; toast(t('saved')); render();
  }

  // ================= COURSES =================
  function viewCourses() {
    const groups = St.groupsOfYear();
    if (!groups.length) return `<div class="card empty">${t('noGroups')}</div>`;
    const other = CFG.terms.find((x) => x[0] !== St.S.currentTerm);
    const cs = St.coursesFor(UI.groupId).filter((c) => !UI.mine || St.isMine(c));
    return `<div class="card"><label class="f">${t('group')}</label><div class="row">${groupSelect('data-set="ui.groupId"', UI.groupId)}${mineBox()}</div>
      <div class="toolbar"><button class="btn primary" data-act="add-course">＋ ${t('addCourse')}</button>${other ? `<button class="btn" data-act="copy-term" data-id="${other[0]}">⇄ ${t('copyToOtherTerm')} ${lang() === 'ar' ? other[1] : other[2]}</button>` : ''}</div></div>
      <div class="card"><h3>${termLabel(St.S.currentTerm)} · ${cs.length} ${t('course')}</h3>${cs.length ? `<div class="list">${cs.map((c) => `<div class="item"><div class="main"><div class="t">${esc(cname(c))} <span class="chip">${typeLabel(c.type)}</span> <span class="chip">${c.weeklyHours} ${t('hours')}</span></div><div class="s">${esc(c.lecturer || '—')} · ${esc(c.schedule || '')} · ${esc(c.room || '')}</div></div><div class="acts"><button class="icon" data-act="edit-course" data-id="${c.id}">✎</button><button class="icon" data-act="del-course" data-id="${c.id}">🗑</button></div></div>`).join('')}</div>` : `<div class="empty">${t('noCourses')}</div>`}</div>`;
  }
  function courseForm(c) {
    c = c || { groupId: UI.groupId, termId: St.S.currentTerm, nameAr: '', nameEn: '', lecturer: St.S.settings.lecturer || '', type: 'T', weeklyHours: 2, schedule: '', room: '' };
    modal(c.id ? t('editCourse') : t('addCourse'), `
      <label class="f">${t('group')}</label>${groupSelect('id="f-group"', c.groupId)}
      <label class="f">${t('term')}</label><select id="f-term">${CFG.terms.map((x) => opt(x[0], lang() === 'ar' ? x[1] : x[2], x[0] === c.termId)).join('')}</select>
      <label class="f">${t('nameAr')} *</label><input type="text" id="f-nameAr" value="${esc(c.nameAr)}" dir="rtl">
      <label class="f">${t('nameEn')}</label><input type="text" id="f-nameEn" value="${esc(c.nameEn || '')}" dir="ltr">
      <label class="f">${t('lecturer')}</label><input type="text" id="f-lecturer" value="${esc(c.lecturer || '')}">
      <div class="grid2"><div><label class="f">${t('type')}</label><select id="f-type">${['T', 'U', 'P', 'X'].map((k) => opt(k, typeLabel(k), c.type === k)).join('')}</select></div><div><label class="f">${t('weeklyHours')} *</label><input type="number" id="f-wh" min="0.5" step="0.5" value="${c.weeklyHours}"></div></div>
      <div class="grid2"><div><label class="f">${t('schedule')}</label><input type="text" id="f-schedule" value="${esc(c.schedule || '')}" placeholder="${esc(I18N.dayNames[lang() === 'ar' ? 0 : 1].split(',')[0])} 8:30-10:30"></div><div><label class="f">${t('room')}</label><input type="text" id="f-room" value="${esc(c.room || '')}"></div></div>`,
      () => {
        const nameAr = $('#f-nameAr').value.trim(); const wh = Number($('#f-wh').value);
        if (!nameAr || !wh) { toast(t('required')); return false; }
        const o = Object.assign({}, c, { id: c.id || 'c_' + St.uid(), yearId: c.yearId || St.S.currentYear, groupId: $('#f-group').value, termId: $('#f-term').value, nameAr, nameEn: $('#f-nameEn').value.trim(), lecturer: $('#f-lecturer').value.trim(), type: $('#f-type').value, weeklyHours: wh, schedule: $('#f-schedule').value.trim(), room: $('#f-room').value.trim() });
        St.upsert(St.S.courses, o); St.save(); toast(t('saved')); return true;
      });
  }

  // ================= STUDENTS =================
  function viewStudents() {
    const groups = St.groupsOfYear(); const g = St.group(UI.groupId);
    let html = `<div class="card"><label class="f">${t('group')}</label><div class="row">${groups.length ? groupSelect('data-set="ui.groupId"', UI.groupId) : `<span class="muted">${t('noGroups')}</span>`}<div class="acts fix"><button class="icon" data-act="add-group" title="${t('addGroup')}">＋</button>${g ? `<button class="icon" data-act="edit-group" data-id="${g.id}">✎</button><button class="icon" data-act="del-group" data-id="${g.id}">🗑</button>` : ''}</div></div>`;
    if (g) html += `<div class="toolbar"><button class="btn primary" data-act="add-student">＋ ${t('addStudent')}</button><button class="btn" data-act="import-students">📋 ${t('importNames')}</button></div>`;
    html += '</div>';
    if (!g) return html;
    const ss = St.studentsOf(g.id);
    html += `<div class="card"><h3><span>${esc(gname(g))}</span><span class="chip">${ss.length} ${t('studentsCount')}</span></h3>${ss.length ? `<div class="list">${ss.map((s, i) => `<div class="item"><div class="main"><div class="t"><span class="muted small">${i + 1}</span> ${esc(s.name)}</div><div class="s">${esc(s.sid || '')}${s.note ? ' · ' + esc(s.note) : ''}</div></div><div class="acts"><button class="icon" data-act="edit-student" data-id="${s.id}">✎</button><button class="icon" data-act="del-student" data-id="${s.id}">🗑</button></div></div>`).join('')}</div>` : `<div class="empty">${t('noStudents')}</div>`}</div>`;
    return html;
  }
  function groupForm(g) {
    g = g || { stage: 1, system: CFG.systems[0][0], section: '', nameAr: '', nameEn: '' };
    const stages = Array.from({ length: CFG.stages }, (_, i) => i + 1);
    modal(g.id ? t('editGroup') : t('addGroup'), `
      <div class="grid2"><div><label class="f">${t('stage')}</label><select id="f-stage">${stages.map((n) => opt(n, t('stageN', { n }), g.stage === n)).join('')}</select></div><div><label class="f">${t('system')}</label><select id="f-system">${CFG.systems.map((s) => opt(s[0], lang() === 'ar' ? s[1] : s[2], g.system === s[0])).join('')}</select></div></div>
      <label class="f">${t('section')}</label><input type="text" id="f-section" value="${esc(g.section || '')}" placeholder="A / B">
      <label class="f">${t('nameAr')}</label><input type="text" id="f-nameAr" value="${esc(g.nameAr)}" dir="rtl">
      <label class="f">${t('nameEn')}</label><input type="text" id="f-nameEn" value="${esc(g.nameEn || '')}" dir="ltr">`,
      () => {
        const stage = Number($('#f-stage').value), system = $('#f-system').value, section = $('#f-section').value.trim();
        const sys = CFG.systems.find((s) => s[0] === system) || ['', '', ''];
        const nameAr = $('#f-nameAr').value.trim() || `${R.tr('stageN', 'ar', { n: stage })} - ${sys[1]}${section ? ' ' + section : ''}`;
        const nameEn = $('#f-nameEn').value.trim() || `${R.tr('stageN', 'en', { n: stage })} - ${sys[2]}${section ? ' ' + section : ''}`;
        const o = Object.assign({}, g, { id: g.id || 'g_' + St.uid(), yearId: g.yearId || St.S.currentYear, stage, system, section, nameAr, nameEn });
        St.upsert(St.S.groups, o); UI.groupId = o.id; St.save(); toast(t('saved')); return true;
      });
  }
  function studentForm(s) {
    s = s || { groupId: UI.groupId, name: '', sid: '', note: '' };
    modal(s.id ? t('editStudent') : t('addStudent'), `
      <label class="f">${t('studentName')} *</label><input type="text" id="f-name" value="${esc(s.name)}">
      <label class="f">${t('studentId')}</label><input type="text" id="f-sid" value="${esc(s.sid || '')}">
      <label class="f">${t('note')}</label><input type="text" id="f-note" value="${esc(s.note || '')}">`,
      () => {
        const name = $('#f-name').value.trim(); if (!name) { toast(t('required')); return false; }
        St.upsert(St.S.students, Object.assign({}, s, { id: s.id || 's_' + St.uid(), name, sid: $('#f-sid').value.trim(), note: $('#f-note').value.trim() })); St.save(); toast(t('saved')); return true;
      });
  }
  function importForm() {
    modal(t('importNames'), `<p class="muted small">${t('importHint')}</p><label class="f">${t('orExcel')}</label><input type="file" id="f-stu-xls" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"><div class="sp"></div><textarea id="f-names"></textarea>`, () => {
      const lines = $('#f-names').value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean); let n = 0;
      for (const l of lines) { const [name, sid] = l.split(/[,\t،]/).map((x) => (x || '').trim()); if (!name) continue; St.S.students.push({ id: 's_' + St.uid(), groupId: UI.groupId, name, sid: sid || '', note: '' }); n++; }
      St.save(); toast(t('imported', { n })); return true;
    });
  }

  // ================= REPORTS =================
  function viewReports() {
    const groups = St.groupsOfYear();
    if (!groups.length) return `<div class="card empty">${t('noGroups')}</div>`;
    UI.reportLang = UI.reportLang || lang();
    const tabs = [['memo', 'repMemo'], ['course', 'repCourse'], ['student', 'repStudent'], ['overview', 'repGroup'], ['register', 'repRegister']];
    let html = `<div class="subtabs">${tabs.map(([id, k]) => `<button class="${UI.reportTab === id ? 'on' : ''}" data-act="rtab" data-id="${id}">${t(k)}</button>`).join('')}</div>`;
    html += `<div class="card"><div class="row"><div><label class="f">${t('group')}</label>${groupSelect('data-set="ui.groupId"', UI.groupId)}</div><div class="fix"><label class="f">${t('reportLang')}</label><div class="seg"><button class="${UI.reportLang === 'ar' ? 'on L' : ''}" data-act="rlang" data-v="ar">عربي</button><button class="${UI.reportLang === 'en' ? 'on L' : ''}" data-act="rlang" data-v="en">EN</button></div></div></div>`;
    const rl = UI.reportLang; let out = null;
    if (UI.reportTab === 'memo') {
      const pt = UI.period || 'week';
      html += `<div class="row"><div><label class="f">${t('course')}</label>${courseSelect('data-set="ui.reportCourseId"', UI.groupId, UI.reportCourseId, true)}</div>${mineBox()}</div>
        <div class="grid2"><div><label class="f">${t('period')}</label><select data-set="ui.period">${[['day', 'pDay'], ['week', 'pWeek'], ['month', 'pMonth'], ['term', 'pTerm'], ['custom', 'pCustom']].map(([v, k]) => opt(v, t(k), pt === v)).join('')}</select></div>
        ${pt === 'custom' ? `<div><label class="f">${t('from')}</label><input type="date" data-set="ui.from" value="${UI.from || ''}"></div><div><label class="f">${t('to')}</label><input type="date" data-set="ui.to" value="${UI.to || ''}"></div>` : pt === 'term' ? '' : `<div><label class="f">${t('date')}</label><input type="date" data-set="ui.reportDate" value="${UI.reportDate || St.todayStr()}"></div>`}</div>`;
      const range = R.periodRange(pt, UI.reportDate || St.todayStr(), UI.from, UI.to);
      if (range.from && range.to) {
        const cid = UI.reportCourseId && St.course(UI.reportCourseId) && St.course(UI.reportCourseId).groupId === UI.groupId ? UI.reportCourseId : '';
        const d = R.memoData({ groupId: UI.groupId, courseId: cid, mine: UI.mine, range, periodType: pt });
        out = { html: R.memoHTML(d, rl), csv: R.memoCSV(d, rl), name: `memo_${range.from}_${range.to}`, text: R.memoText(d, rl) };
      }
    } else if (UI.reportTab === 'course' || UI.reportTab === 'register') {
      html += `<div class="row"><div><label class="f">${t('course')}</label>${courseSelect('data-set="ui.courseId"', UI.groupId, UI.courseId)}</div>${mineBox()}</div>`;
      const c = St.course(UI.courseId);
      if (c) { const r = UI.reportTab === 'course' ? R.courseTable(c, rl) : R.register(c.id, rl); out = { html: r.html, csv: r.csv, name: `${UI.reportTab}_${c.nameEn || c.nameAr}` }; }
    } else if (UI.reportTab === 'student') {
      const ss = St.studentsOf(UI.groupId); if (!ss.find((s) => s.id === UI.studentId)) UI.studentId = ss[0] ? ss[0].id : '';
      html += `<label class="f">${t('student')}</label><select data-set="ui.studentId">${ss.map((s) => opt(s.id, s.name, s.id === UI.studentId)).join('')}</select>`;
      if (UI.studentId) { const r = R.studentReport(UI.studentId, rl); out = { html: r.html, csv: r.csv, name: `student_${St.student(UI.studentId).name}` }; }
    } else if (UI.reportTab === 'overview') {
      html += `<div class="row">${mineBox() || '<span></span>'}</div>`;
      const r = R.overview(UI.groupId, rl, UI.mine); out = { html: r.html, csv: r.csv, name: `overview_${gname(St.group(UI.groupId))}` };
    }
    const recs = authorizedRecipients();
    html += `<div class="toolbar"><button class="btn primary" data-act="print" ${out ? '' : 'disabled'}>🖨 ${t('print')}</button><button class="btn" data-act="csv" ${out ? '' : 'disabled'}>⬇ ${t('exportCsv')}</button><button class="btn" data-act="send" ${out ? '' : 'disabled'}>📤 ${t('sendReport')}</button></div>
      <p class="muted small">${recs.length ? `${t('sendTo')}: ${recs.map((r) => `${recTitle(r)}${r.name ? ' ' + esc(r.name) : ''}`).join('، ')}` : t('noRecipients')} · ${t('sendHint')}</p></div>`;
    lastReport = out || { html: '', csv: '', name: 'report' };
    html += out ? `<div class="tbl-wrap">${out.html}</div>` : `<div class="card empty">${t('nothingToShow')}</div>`;
    return html;
  }

  // ================= SETTINGS =================
  function viewSettings() {
    const s = St.S.settings;
    const num = (k, label) => `<div><label class="f">${label} %</label><input type="number" min="0" max="100" step="0.5" data-set="settings.${k}" value="${s[k]}"></div>`;
    const years = St.S.years.map((y) => `<div class="item"><div class="main"><div class="t">${esc(y.name)} ${y.id === St.S.currentYear ? '<span class="chip ok">✓</span>' : ''}</div><div class="s">${R.dmy(y.start)} – ${R.dmy(y.end)} · ${y.terms.map((tm) => `${termLabel(tm.id)}: ${R.dmy(tm.start)} – ${R.dmy(tm.end)} (${tm.weeks} ${t('weeks')})`).join(' · ')}</div>${(y.events || []).length ? `<div class="s">${y.events.map((e) => `${lang() === 'ar' ? e.nameAr : e.nameEn}: ${R.dmy(e.start)}${e.end && e.end !== e.start ? ' – ' + R.dmy(e.end) : ''}`).join(' · ')}</div>` : ''}</div><div class="acts"><button class="icon" data-act="edit-year" data-id="${y.id}">✎</button><button class="icon" data-act="del-year" data-id="${y.id}">🗑</button></div></div>`).join('');
    return `<div class="card"><h3>${t('tabSettings')}</h3>
      <label class="f">${t('lecturerName')}</label><input type="text" data-set="settings.lecturer" value="${esc(s.lecturer)}">
      <label class="f">${t('language')}</label><select data-set="settings.lang">${opt('ar', 'العربية', s.lang === 'ar')}${opt('en', 'English', s.lang === 'en')}</select>
      <div class="sp"></div><a class="btn block" href="help.html?lang=${lang()}">📖 ${t('userGuide')}</a></div>
      <div class="card"><h3>${t('thresholds')}</h3><div class="grid2">${num('warn1', t('warn1'))}${num('warn2', t('warn2'))}${num('failUnexcused', t('failU'))}${num('failTotal', t('failT'))}</div><p class="muted small">${t('regulation')}</p></div>
      <div class="card"><h3><span>${t('years')}</span><button class="btn sm" data-act="add-year">＋ ${t('addYear')}</button></h3><div class="list">${years}</div></div>
      <div class="card"><h3>${t('backup')}</h3><p class="muted small">${t('backupHint')}</p>
        <div class="toolbar"><button class="btn primary" data-act="export-json">⬇ ${t('exportJson')}</button><label class="btn">⬆ ${t('importJson')}<input type="file" accept=".json,application/json" id="f-import" style="display:none"></label></div>
        <label class="f">${t('importJson')}: </label><select id="f-import-mode">${opt('merge', t('merge'), true)}${opt('replace', t('replace'))}</select>
        <div class="sp"></div><button class="btn danger block" data-act="reset-seed">${t('resetSeed')}</button></div>
      ${CFG.access && CFG.access.enabled ? `<div class="card"><h3>${t('security')}</h3><p><b>${t('signedInAs')}:</b> ${role() === 'master' ? t('roleMaster') : t('roleUser')}</p><p class="muted small">${t('accessInfo')}</p><div class="toolbar"><button class="btn" data-act="lock-now">🔒 ${t('lockNow')}</button><button class="btn" data-act="lock-now">⇄ ${t('switchRole')}</button></div></div>` : ''}
      ${adminCard()}
      <div class="card"><h3>${t('install')}</h3>${!R.isNative() && CFG.androidApk ? `<a class="btn block mb" href="${CFG.androidApk}" download>🤖 ${t('downloadApk')}</a><p class="muted small">${t('apkHint')}</p>` : ''}${R.isNative() ? `<p class="muted">${t('nativeApp')}</p>` : window.matchMedia('(display-mode: standalone)').matches || navigator.standalone ? `<p class="muted">${t('installed')}</p>` : `${deferredPrompt ? `<button class="btn primary block mb" data-act="install">📲 ${t('installBtn')}</button>` : ''}<p class="muted small">${t('installAndroid')}</p><p class="muted small">${t('installIos')}</p>`}
        <p class="muted small">${t('version')} ${CFG.version} · ${St.S.students.length} ${t('studentsCount')} · ${St.S.courses.length} ${t('course')} · ${St.S.sessions.length} ${t('sessions')}</p></div>`;
  }
  // ---- report recipients (master account) ----
  const recTitle = (r) => (r.title === 'head' ? t('rHead') : r.title === 'committee' ? t('rCommittee') : r.title === 'person' ? t('rPerson') : esc(r.title || ''));
  const authorizedRecipients = () => (St.S.settings.recipients || []).filter((r) => r.authorized !== false);
  function adminCard() {
    const recs = St.S.settings.recipients || []; const master = role() === 'master';
    const list = recs.length ? `<div class="list">${recs.map((r) => `<div class="item"><div class="main"><div class="t">${recTitle(r)}${r.name ? ' — ' + esc(r.name) : ''} ${r.authorized === false ? '' : '<span class="chip ok">✓</span>'}</div><div class="s">${esc(r.email || '')}${r.phone ? ' · ' + esc(r.phone) : ''}</div></div>${master ? `<div class="acts"><button class="icon" data-act="edit-recipient" data-id="${r.id}">✎</button><button class="icon" data-act="del-recipient" data-id="${r.id}">🗑</button></div>` : ''}</div>`).join('')}</div>` : `<div class="empty">${t('noRecipients')}</div>`;
    return `<div class="card"><h3><span>${master ? t('admin') : t('recipients')}</span>${master ? `<button class="btn sm" data-act="add-recipient">＋ ${t('addRecipient')}</button>` : `<span class="chip">${t('masterOnly')}</span>`}</h3><p class="muted small">${t('adminHint')}</p>${list}</div>`;
  }
  function recipientForm(r) {
    r = r || { title: 'head', name: '', email: '', phone: '', authorized: true };
    modal(r.id ? t('editRecipient') : t('addRecipient'), `
      <label class="f">${t('recipientTitle')}</label><select id="f-rtitle">${[['head', 'rHead'], ['committee', 'rCommittee'], ['person', 'rPerson']].map(([v, k]) => opt(v, t(k), r.title === v)).join('')}</select>
      <label class="f">${t('name')}</label><input type="text" id="f-rname" value="${esc(r.name || '')}">
      <label class="f">${t('email')}</label><input type="text" id="f-remail" value="${esc(r.email || '')}" dir="ltr" inputmode="email">
      <label class="f">${t('phone')}</label><input type="text" id="f-rphone" value="${esc(r.phone || '')}" dir="ltr" inputmode="tel">
      <label class="row" style="gap:8px;margin-top:8px"><input type="checkbox" id="f-rauth" class="fix" ${r.authorized === false ? '' : 'checked'}><span>${t('authorized')}</span></label>`,
      () => {
        const o = Object.assign({}, r, { id: r.id || 'r_' + St.uid(), title: $('#f-rtitle').value, name: $('#f-rname').value.trim(), email: $('#f-remail').value.trim(), phone: $('#f-rphone').value.trim(), authorized: $('#f-rauth').checked });
        if (!St.S.settings.recipients) St.S.settings.recipients = [];
        St.upsert(St.S.settings.recipients, o); St.save(); toast(t('saved')); return true;
      });
  }
  async function sendCurrentReport() {
    if (!lastReport.html) return;
    const recs = authorizedRecipients(); const to = recs.map((r) => `${recTitle(r)}${r.name ? ' ' + r.name : ''}`).join(', ');
    const text = (lastReport.text || lastReport.name) + (to ? `\n\n${t('sendTo')}: ${to}` : '');
    const res = await R.sendReport(lastReport.name.replace(/[\\/:*?"<>|]+/g, '_'), lastReport.html, lastReport.csv, text, recs);
    if (res === 'shared' || res === 'mail') toast(t('saved'));
  }

  function yearForm(y) {
    const isNew = !y;
    y = y || { name: '', start: '', end: '', terms: CFG.terms.map((x) => ({ id: x[0], start: '', end: '', weeks: CFG.rules.weeksPerTerm })), events: [] };
    const termRows = y.terms.map((tm, i) => `<div class="grid2"><div><label class="f">${termLabel(tm.id)} ${t('termStart')}</label><input type="date" id="f-t${i}s" value="${tm.start}"></div><div><label class="f">${t('termEnd')}</label><input type="date" id="f-t${i}e" value="${tm.end}"></div></div><label class="f">${t('weeks')}</label><input type="number" id="f-t${i}w" min="1" max="40" value="${tm.weeks}">`).join('');
    const evRows = (y.events || []).map((e, i) => `<div class="row"><input type="text" id="f-ev${i}a" value="${esc(e.nameAr)}" placeholder="عربي" dir="rtl"><input type="text" id="f-ev${i}b" value="${esc(e.nameEn)}" placeholder="English" dir="ltr"><input type="date" id="f-ev${i}s" value="${e.start}" class="fix" style="flex:0 0 140px"><input type="date" id="f-ev${i}e" value="${e.end || ''}" class="fix" style="flex:0 0 140px"></div>`).join('');
    modal(isNew ? t('addYear') : t('year') + ' ' + y.name, `
      <label class="f">${t('yearName')} *</label><input type="text" id="f-yname" value="${esc(y.name)}" dir="ltr">
      <div class="grid2"><div><label class="f">${t('yearStart')}</label><input type="date" id="f-ys" value="${y.start}"></div><div><label class="f">${t('yearEnd')}</label><input type="date" id="f-ye" value="${y.end}"></div></div>
      ${termRows}
      ${isNew ? `<label class="row" style="gap:8px;margin-top:10px"><input type="checkbox" id="f-copy" class="fix" checked><span>${t('copyFromCurrent')}</span></label>` : `<h4 style="margin-top:12px">${t('events')} <button class="btn sm" data-act="add-event-row" type="button">＋</button></h4><div id="f-events">${evRows}</div>`}`,
      () => {
        const name = $('#f-yname').value.trim(); if (!name) { toast(t('required')); return false; }
        const terms = y.terms.map((tm, i) => ({ id: tm.id, start: $(`#f-t${i}s`).value, end: $(`#f-t${i}e`).value, weeks: Number($(`#f-t${i}w`).value) || CFG.rules.weeksPerTerm }));
        const events = []; if (!isNew) document.querySelectorAll('#f-events .row').forEach((row) => { const [a, b, s, e] = row.querySelectorAll('input'); if (a.value.trim() || b.value.trim()) events.push({ nameAr: a.value.trim(), nameEn: b.value.trim(), start: s.value, end: e.value || s.value }); });
        const o = { id: isNew ? name.replace(/\s+/g, '') : y.id, name, start: $('#f-ys').value, end: $('#f-ye').value, terms, events: isNew ? [] : events };
        if (isNew) { if (St.S.years.find((x) => x.id === o.id)) { toast(t('required')); return false; } St.addYear(o, $('#f-copy').checked ? St.S.currentYear : null); St.S.currentYear = o.id; }
        else St.upsert(St.S.years, o);
        St.save(); toast(t('saved')); return true;
      });
  }

  // ================= EXCEL IMPORT =================
  let imp = null;
  function xlsImportForm(c) {
    imp = { courseId: c.id, wb: null, sheet: '', parsed: null };
    modal(t('xlsImport'), `<p class="muted small">${t('xlsHint')}</p>
      <div class="small"><b>${esc(cname(c))}</b> · ${esc(gname(St.group(c.groupId)))}</div>
      <label class="f">${t('xlsFile')}</label><input type="file" id="f-xls" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv">
      <div class="grid2"><div><label class="f">${t('hoursPerLecture')}</label><input type="number" id="f-xls-hours" min="0.5" step="0.5" value="${c.weeklyHours || 2}"></div>
      <label class="row" style="gap:8px;align-self:end"><input type="checkbox" id="f-xls-add" class="fix"><span class="small">${t('addUnmatched')}</span></label></div>
      <div id="xls-preview"></div>`, () => {
      if (!imp || !imp.parsed || imp.parsed.error) { toast(t('xlsChooseFirst')); return false; }
      const course = St.course(imp.courseId);
      const res = Excel.applyAttendance(course, imp.parsed, { defaultHours: Number($('#f-xls-hours').value) || course.weeklyHours || 2, addUnmatched: $('#f-xls-add').checked });
      St.save(); toast(t('xlsDone', { c: res.created, u: res.updated })); imp = null; return true;
    });
  }
  function xlsParse() { const c = St.course(imp.courseId); imp.parsed = Excel.parseAttendance(imp.wb.Sheets[imp.sheet], St.studentsOf(c.groupId)); }
  function xlsPreview() {
    const box = $('#xls-preview'); if (!box || !imp) return;
    const p = imp.parsed; const sheets = imp.wb ? imp.wb.SheetNames : [];
    let h = sheets.length > 1 ? `<label class="f">${t('sheet')}</label><select id="f-xls-sheet">${sheets.map((s) => opt(s, s, s === imp.sheet)).join('')}</select>` : '';
    if (!p) { box.innerHTML = h; return; }
    if (p.error) { box.innerHTML = h + `<p class="small" style="color:var(--fail)">${t(p.error === 'noDates' ? 'xlsNoDates' : 'xlsNoNames')}</p>`; return; }
    const meaning = { A: t('absent'), E: t('excused'), L: t('late'), P: t('present'), '?': t('unknownValue') };
    const vals = Object.entries(p.values).sort((a, b) => b[1] - a[1]).map(([k, n]) => { const i = k.lastIndexOf('|'); return `<tr><td>${esc(k.slice(0, i))}</td><td>${meaning[k.slice(i + 1)]}</td><td>${n}</td></tr>`; }).join('');
    h += `<div class="kpis"><div class="kpi"><b>${p.dates.length}</b><span>${t('datesFound')}</span></div><div class="kpi"><b>${p.matched}/${p.rows.length}</b><span>${t('matchedStudents')}</span></div><div class="kpi"><b>${p.absent}</b><span>${t('absent')}</span></div><div class="kpi"><b>${p.excused + p.late}</b><span>${t('excused')} / ${t('late')}</span></div></div>
      <div class="small mb">${p.dates.map((d) => `<span class="chip">${R.dmy(d.date)}${d.hours ? ' (' + d.hours + ')' : ''}</span>`).join(' ')}</div>
      ${p.unmatched.length ? `<div class="small mb" style="color:var(--fail)"><b>${t('unmatchedNames')}:</b> ${p.unmatched.map((r) => esc(r.name)).join('، ')}</div>` : ''}
      ${p.missing.length ? `<div class="small mb muted"><b>${t('notInFile')} (${p.missing.length}):</b> ${p.missing.map((s) => esc(s.name)).join('، ')}</div>` : ''}
      ${vals ? `<div class="small"><b>${t('valueMeaning')}</b></div><table class="rep small"><tbody>${vals}</tbody></table>` : ''}
      <p class="muted small">${t('xlsExistingNote')}</p>`;
    box.innerHTML = h;
  }
  async function xlsTemplateDownload(c) {
    try { const r = await Excel.template(c, lang()); await R.deliver(r.name, r.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); toast(t('templateDates', { n: r.dates })); }
    catch (e) { console.error(e); toast(t('xlsBad')); }
  }

  // ================= MODAL =================
  let modalSave = null;
  function modal(title, body, onSave) {
    modalSave = onSave;
    $('#modal-box').innerHTML = `<h3>${esc(title)}</h3>${body}<div class="acts"><button class="btn primary" data-act="modal-save">${t('save')}</button><button class="btn" data-act="modal-close">${t('cancel')}</button></div>`;
    $('#modal').classList.add('open');
    const first = $('#modal-box input[type=text]'); if (first) setTimeout(() => first.focus(), 50);
  }
  function closeModal() { $('#modal').classList.remove('open'); modalSave = null; }

  // ================= EVENTS =================
  function setPath(path, val) {
    const [root, key] = path.split('.');
    if (root === 'ui') UI[key] = val; else if (root === 'settings') St.S.settings[key] = val; else St.S[path] = val;
  }
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.set) {
      let v = el.type === 'checkbox' ? el.checked : el.value; if (el.type === 'number') v = Number(v);
      setPath(el.dataset.set, v);
      if (el.dataset.set === 'currentYear') { UI.groupId = ''; UI.courseId = ''; }
      if (el.dataset.set === 'ui.groupId') { UI.courseId = ''; UI.reportCourseId = ''; UI.studentId = ''; }
      St.save(); render(); return;
    }
    if (el.dataset.draft && draft) { draft[el.dataset.draft] = el.value; if (el.dataset.draft === 'date') render(); return; }
    if (el.id === 'f-xls' && el.files[0] && imp) {
      const box = $('#xls-preview'); if (box) box.innerHTML = `<p class="muted small">${t('xlsReading')}</p>`;
      Excel.readFile(el.files[0]).then((wb) => {
        imp.wb = wb; const studs = St.studentsOf(St.course(imp.courseId).groupId);
        let best = wb.SheetNames[0], bestN = -1;                 // pick the sheet with the most dates / matches
        for (const s of wb.SheetNames) { const p = Excel.parseAttendance(wb.Sheets[s], studs); const n = p.error ? 0 : p.dates.length * 1000 + p.matched; if (n > bestN) { bestN = n; best = s; } }
        imp.sheet = best; xlsParse(); xlsPreview();
      }).catch((err) => { console.error(err); if (box) box.innerHTML = `<p class="small" style="color:var(--fail)">${t('xlsBad')}</p>`; });
      return;
    }
    if (el.id === 'f-xls-sheet' && imp) { imp.sheet = el.value; xlsParse(); xlsPreview(); return; }
    if (el.id === 'f-stu-xls' && el.files[0]) {
      Excel.readFile(el.files[0]).then((wb) => {
        let list = []; for (const s of wb.SheetNames) { const l = Excel.parseStudents(wb.Sheets[s]); if (l.length > list.length) list = l; }
        $('#f-names').value = list.map((s) => (s.sid ? `${s.name}, ${s.sid}` : s.name)).join('\n');
      }).catch(() => toast(t('xlsBad')));
      return;
    }
    if (el.id === 'f-import' && el.files[0]) {
      const mode = $('#f-import-mode').value; const fr = new FileReader();
      fr.onload = () => { try { St.importJSON(fr.result, mode); toast(t('importDone')); render(); } catch (err) { toast(t('importBad')); } };
      fr.readAsText(el.files[0]);
    }
  });
  document.addEventListener('input', (e) => { const el = e.target; if (el.dataset.draft && draft && el.dataset.draft !== 'date') draft[el.dataset.draft] = el.value; });

  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    const cycle = { P: 'A', A: 'E', E: 'L', L: 'P' };
    switch (act) {
      case 'toggle-lang': St.S.settings.lang = lang() === 'ar' ? 'en' : 'ar'; UI.reportLang = St.S.settings.lang; St.save(); render(); break;
      case 'tab': if (draft && UI.tab === 'attend' && id !== 'attend' && !confirm(t('unsaved'))) return; if (id !== 'attend') draft = null; UI.tab = id; render(); break;
      case 'pick-course': UI.groupId = el.dataset.g; UI.courseId = id; render(); break;
      case 'new-session': newDraft(UI.courseId); render(); break;
      case 'edit-session': { const s = St.S.sessions.find((x) => x.id === id); if (s) { newDraft(s.courseId, s); render(); } break; }
      case 'del-session': e.stopPropagation(); if (confirm(t('confirmDeleteSession'))) { St.S.sessions = St.S.sessions.filter((x) => x.id !== id); St.save(); toast(t('deleted')); render(); } break;
      case 'cancel-session': if (confirm(t('unsaved'))) { draft = null; render(); } break;
      case 'save-session': saveDraft(); break;
      case 'all-present': draft.records = {}; render(); break;
      case 'cycle': draft.records[id] = cycle[draft.records[id] || 'P']; render(); break;
      case 'set-rec': draft.records[id] = el.dataset.v; render(); break;
      case 'note': { const v = prompt(t('excuseNote'), draft.notes[id] || ''); if (v !== null) { draft.notes[id] = v.trim(); render(); } break; }
      case 'add-course': courseForm(); break;
      case 'edit-course': courseForm(St.course(id)); break;
      case 'del-course': if (confirm(t('confirmDeleteCourse'))) { St.deleteCourse(id); St.save(); toast(t('deleted')); render(); } break;
      case 'copy-term': { const n = St.copyCoursesToTerm(UI.groupId, St.S.currentTerm, id); St.save(); toast(t('copied', { n })); break; }
      case 'add-group': groupForm(); break;
      case 'edit-group': groupForm(St.group(id)); break;
      case 'del-group': if (confirm(t('confirmDeleteGroup'))) { St.deleteGroup(id); UI.groupId = ''; St.save(); toast(t('deleted')); render(); } break;
      case 'add-student': studentForm(); break;
      case 'edit-student': studentForm(St.student(id)); break;
      case 'del-student': if (confirm(t('confirmDeleteStudent'))) { St.deleteStudent(id); St.save(); toast(t('deleted')); render(); } break;
      case 'import-students': importForm(); break;
      case 'rtab': UI.reportTab = id; render(); break;
      case 'rlang': UI.reportLang = el.dataset.v; render(); break;
      case 'print': if (lastReport.html) { R.printHTML(lastReport.html); if (R.isNative()) toast(t('printNative')); } break;
      case 'csv': if (lastReport.csv) R.deliver(lastReport.name.replace(/[\\/:*?"<>|]+/g, '_') + '.csv', lastReport.csv, 'text/csv;charset=utf-8'); break;
      case 'send': sendCurrentReport(); break;
      case 'xls-import': { const c = St.course(UI.courseId); if (c) xlsImportForm(c); break; }
      case 'xls-template': { const c = St.course(UI.courseId); if (c) xlsTemplateDownload(c); break; }
      case 'add-recipient': if (role() === 'master') recipientForm(); break;
      case 'edit-recipient': if (role() === 'master') recipientForm((St.S.settings.recipients || []).find((r) => r.id === id)); break;
      case 'del-recipient': if (role() === 'master' && confirm(t('confirmDeleteRecipient'))) { St.S.settings.recipients = (St.S.settings.recipients || []).filter((r) => r.id !== id); St.save(); toast(t('deleted')); render(); } break;
      case 'add-year': yearForm(); break;
      case 'edit-year': yearForm(St.S.years.find((y) => y.id === id)); break;
      case 'del-year': if (confirm(t('confirmDeleteYear'))) { St.deleteYear(id); St.save(); toast(t('deleted')); render(); } break;
      case 'add-event-row': { const box = $('#f-events'); const i = box.children.length; box.insertAdjacentHTML('beforeend', `<div class="row"><input type="text" placeholder="عربي" dir="rtl"><input type="text" placeholder="English" dir="ltr"><input type="date" class="fix" style="flex:0 0 140px"><input type="date" class="fix" style="flex:0 0 140px"></div>`); break; }
      case 'export-json': R.deliver(`${CFG.appId}_backup_${St.todayStr()}.json`, St.exportJSON(), 'application/json'); break;
      case 'reset-seed': if (confirm(t('confirmReset'))) { St.resetToSeed(); UI.groupId = ''; UI.courseId = ''; render(); } break;
      case 'install': if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; render(); } break;
      case 'modal-save': if (modalSave && modalSave() !== false) { closeModal(); render(); } break;
      case 'modal-close': closeModal(); break;
    }
  });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (UI.tab === 'settings') render(); });

  // ================= ACCESS CODE LOCK =================
  const LOCKKEY = CFG.appId + ':unlock';
  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return sha256js(str);
  }
  // Compact pure-JS SHA-256 fallback (used only where crypto.subtle is unavailable, e.g. file://)
  function sha256js(ascii) {
    const rr = (v, a) => (v >>> a) | (v << (32 - a)); const bytes = unescape(encodeURIComponent(ascii)); let words = [], i, j, result = '';
    const K = [], H = []; let prime = 2;
    for (i = 0; i < 64; prime++) { let isPrime = true; for (j = 2; j * j <= prime; j++) if (prime % j === 0) { isPrime = false; break; } if (isPrime) { if (i < 8) H[i] = (Math.pow(prime, 1 / 2) * 4294967296) | 0; K[i++] = (Math.pow(prime, 1 / 3) * 4294967296) | 0; } }
    const len = bytes.length * 8; let s = bytes + '\x80'; while (s.length % 64 - 56) s += '\x00';
    for (i = 0; i < s.length; i++) { j = s.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = (len / 4294967296) | 0; words[words.length] = len;
    for (j = 0; j < words.length;) {
      const w = words.slice(j, j += 16); const oldHash = H.slice(0); let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const s0 = i < 16 ? 0 : rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3), s1 = i < 16 ? 0 : rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = h + S1 + ch + K[i] + w[i], S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c), t2 = S0 + maj;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (H[i] >> (j * 8)) & 255; result += (b < 16 ? '0' : '') + b.toString(16); }
    return result;
  }
  const validHash = (h) => !!h && (h === CFG.access.codeHash || h === CFG.access.masterHash);
  function storedHash() {
    try {
      const s = sessionStorage.getItem(LOCKKEY); if (validHash(s)) return s;
      const until = Number(localStorage.getItem(LOCKKEY + ':until') || 0); const l = localStorage.getItem(LOCKKEY);
      if (until && Date.now() < until && validHash(l)) return l;
    } catch (e) { /* ignore */ }
    return null;
  }
  function isUnlocked() { const a = CFG.access; if (!a || !a.enabled || !a.codeHash) return true; return !!storedHash(); }
  function role() { const a = CFG.access; if (!a || !a.enabled) return 'master'; return storedHash() === a.masterHash && a.masterHash ? 'master' : 'user'; }
  function lock() { try { sessionStorage.removeItem(LOCKKEY); localStorage.removeItem(LOCKKEY); localStorage.removeItem(LOCKKEY + ':until'); } catch (e) { /* ignore */ } renderLock(); }
  function renderLock(error) {
    applyDir(); const ins = CFG.institution, lg = CFG.logos, L = lang() === 'ar' ? 0 : 1;
    $('#top').innerHTML = ''; $('#tabs').innerHTML = '';
    $('#view').innerHTML = `<div class="lock"><div class="card">
      <div class="lock-logos">${lg.university ? `<img src="${lg.university}" alt="">` : ''}<img src="${R.deptLogoSrc()}" onerror="window.__deptPng=false;this.onerror=null;this.src='${lg.department}'" alt="">${lg.college ? `<img src="${lg.college}" alt="">` : ''}</div>
      <h2 class="center">${esc(ins.department[L])}</h2><div class="center muted">${esc(ins.college[L])} — ${esc(ins.university[L])}</div>
      <h3 class="center" style="margin-top:14px;justify-content:center">🔒 ${t('lockTitle')}</h3>
      <p class="muted small center">${t('lockHint')}</p>
      <form id="lock-form"><label class="f">${t('accessCode')}</label><input type="password" id="f-code" autocomplete="current-password" inputmode="text" autocapitalize="none" dir="ltr">
      ${CFG.access.rememberDays > 0 ? `<label class="row" style="gap:8px;margin-top:8px"><input type="checkbox" id="f-remember" class="fix" checked><span class="small">${t('rememberDevice', { n: CFG.access.rememberDays })}</span></label>` : ''}
      ${error ? `<p class="small" style="color:var(--fail)">${t('wrongCode')}</p>` : ''}
      <div class="toolbar"><button class="btn primary block" type="submit">${t('unlock')}</button></div></form>
      <div class="center"><button class="btn sm ghost" data-act="toggle-lang-lock">${lang() === 'ar' ? 'English' : 'عربي'}</button> <a class="btn sm ghost" href="help.html?lang=${lang()}">📖 ${t('userGuide')}</a></div></div></div>`;
    setTimeout(() => { const i = $('#f-code'); if (i) i.focus(); }, 50);
  }
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'lock-form') return; e.preventDefault();
    const code = $('#f-code').value.trim(); const h = await sha256(code);
    if (validHash(h)) {
      try { sessionStorage.setItem(LOCKKEY, h); const rem = $('#f-remember'); if (rem && rem.checked) { localStorage.setItem(LOCKKEY, h); localStorage.setItem(LOCKKEY + ':until', String(Date.now() + CFG.access.rememberDays * 86400000)); } } catch (err) { /* ignore */ }
      render();
    } else renderLock(true);
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'toggle-lang-lock') { St.S.settings.lang = lang() === 'ar' ? 'en' : 'ar'; St.save(); renderLock(); }
    if (el.dataset.act === 'lock-now') lock();
  });

  window.UI = { render, toast, t, lock };
  if (isUnlocked()) render(); else renderLock();
})();
