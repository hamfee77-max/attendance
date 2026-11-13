// ============================================================================
//  UI: rendering + event handling (vanilla JS, no build step)
// ============================================================================
(function () {
  const St = window.Store, R = window.Reports, A = window.Auth, N = window.Names, CFG = St.CFG;
  const lang = () => St.S.settings.lang;
  const t = (k, p) => R.tr(k, lang(), p);
  const esc = R.esc;
  const $ = (s) => document.querySelector(s);
  const UI = St.UI;
  const L = () => (lang() === 'ar' ? 0 : 1);
  let draft = null;              // lecture being edited
  let deferredPrompt = null;
  let lastReport = { html: '', csv: '', name: 'report' };
  const newPasswords = {};       // passwords created in this session (master), for the credentials sheet

  const gname = (g) => R.groupName(g, lang());
  const cname = (c) => R.courseName(c, lang());
  const termLabel = (id) => R.termName(id, lang());
  const typeLabel = (ty) => t({ T: 'typeT', U: 'typeU', P: 'typeP', X: 'typeX' }[ty] || 'typeX');
  const sysChip = (c) => `<span class="chip ${St.isYearCourse(c) ? 'yr' : ''}">${St.isYearCourse(c) ? t('annualChip') : t('semesterChip')}</span>`;
  const opt = (v, label, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(label)}</option>`;
  const roleLabel = (r) => t({ admin: 'roleAdmin', head: 'roleHead', lecturer: 'roleLecturer' }[A.normRole(r)] || 'roleLecturer');
  const accRoleText = (a) => (a && a.title ? a.title : roleLabel(a && a.role));
  const accName = (a) => (lang() === 'en' && a.nameEn ? a.nameEn : a.name);
  const isLecturer = () => A.role() === 'lecturer';
  // apply a configuration change on this device and keep it as an unpublished draft (master)
  const applyCfg = (patch) => { St.saveDraft({ config: patch }); St.deepMerge(CFG, patch); };

  const fmtDT = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  // ---- alerts: lectures due but not recorded (lecturer) / not received (head, administrator) ----
  function alertsCard() {
    if (!window.Excel || !A.current) return '';
    const today = St.todayStr();
    if (isLecturer()) {
      const due = R.missingData({ upTo: today }).items;
      const unsent = Cloud.enabled() ? Cloud.pending() > 0 : St.S.sessions.some((s) => { const c = St.course(s.courseId); return c && St.inScope(c) && (s.updatedAt || 0) > (UI.lastSentAt || 0); });
      let h = '';
      if (due.length) {
        const todayN = due.filter((d) => d.date === today).length;
        h += `<div class="card alert"><h3>⚠️ ${t('missingTitle', { n: due.length })}</h3>${todayN ? `<p class="small"><b>📅 ${t('missingToday', { n: todayN })}</b></p>` : ''}
          <div class="chips">${due.slice(-14).reverse().map((d) => `<button class="chip-btn ${d.date === today ? 'today' : ''}" data-act="record-missing" data-id="${d.course.id}" data-date="${d.date}">${d.date === today ? '📅 ' : ''}${esc(cname(d.course))} · ${R.dmy(d.date)}</button>`).join('')}${due.length > 14 ? `<span class="muted small">+${due.length - 14}</span>` : ''}</div>
          <p class="muted small">${t('missingLectHint')}</p></div>`;
      }
      if (unsent) h += `<div class="card alert info"><span>📤 ${t('unsentReminder')}</span> <button class="btn sm primary" data-act="send-my-data">📤 ${t('sendMyData')}</button></div>`;
      return h;
    }
    const m = R.missingData({ upTo: R.addDays(today, -1) });
    if (!m.items.length) return '';
    return `<div class="card alert"><span>⚠️ ${t('notReceivedTitle', { n: m.items.length, l: m.lecturers.length })}</span> <button class="btn sm" data-act="open-missing">${t('openMissing')}</button></div>`;
  }
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600); }
  function applyDir() { document.documentElement.lang = lang(); document.documentElement.dir = lang() === 'ar' ? 'rtl' : 'ltr'; document.title = t('appName'); }

  function ensureSelection() {
    const groups = St.groupsOfYear();
    if (!groups.find((g) => g.id === UI.groupId)) UI.groupId = groups[0] ? groups[0].id : '';
    const courses = St.coursesFor(UI.groupId).filter((c) => !UI.mine || St.isMine(c));
    if (!courses.find((c) => c.id === UI.courseId)) UI.courseId = courses[0] ? courses[0].id : '';
  }
  function allowedTabs() {
    if (isLecturer()) return ['attend', 'reports', 'settings'];
    return ['attend', 'courses', 'students', 'reports', 'settings'];
  }

  function render() {
    if (!A.current) return renderLock();
    applyDir();
    if (!allowedTabs().includes(UI.tab)) UI.tab = 'attend';
    ensureSelection(); renderTop(); renderTabs();
    const v = { attend: viewAttend, courses: viewCourses, students: viewStudents, reports: viewReports, settings: viewSettings }[UI.tab] || viewAttend;
    $('#view').innerHTML = v();
    St.saveUI(); window.scrollTo(0, 0);
  }

  function logosHTML() {
    const lg = CFG.logos;
    return `${lg.university ? `<img src="${lg.university}" alt="">` : ''}${lg.college ? `<img src="${lg.college}" alt="">` : ''}${lg.department ? `<img src="${R.deptLogoSrc()}" onerror="window.__deptPng=false;this.onerror=null;this.src='${lg.department}'" alt="">` : ''}`;
  }
  function renderTop() {
    const ins = CFG.institution;
    $('#top').innerHTML = `<div class="brand">
      <div class="logos">${logosHTML()}</div>
      <div class="title"><h1>${esc(ins.department[L()])}</h1><small>👤 ${esc(A.displayName(lang()))} · ${esc(accRoleText(A.current))}</small></div>
      <button class="lang" data-act="toggle-lang">${lang() === 'ar' ? 'EN' : 'عربي'}</button>
      <button class="lang out" data-act="lock-now" title="${esc(t('signOut'))}">⎋ ${t('signOutShort')}</button></div>
      <div class="ctx">
        <select data-set="currentYear">${St.S.years.map((x) => opt(x.id, x.name, x.id === St.S.currentYear)).join('')}</select>
        <select data-set="currentTerm">${CFG.terms.map((x) => opt(x[0], lang() === 'ar' ? x[1] : x[2], x[0] === St.S.currentTerm)).join('')}</select>
      </div>`;
  }
  function renderTabs() {
    const all = { attend: ['✓', 'tabAttend'], courses: ['📚', 'tabCourses'], students: ['👥', 'tabStudents'], reports: ['📄', 'tabReports'], settings: ['⚙️', 'tabSettings'] };
    let badge = 0;
    try { if (isLecturer() && window.Excel) badge = R.missingData({ upTo: St.todayStr() }).items.length; } catch (e) { badge = 0; }
    $('#tabs').innerHTML = `<div class="tabs-in">${allowedTabs().map((id) => `<button class="${UI.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}"><span class="ic">${all[id][0]}${id === 'attend' && badge ? `<i class="badge">${badge > 99 ? '99+' : badge}</i>` : ''}</span>${t(all[id][1])}</button>`).join('')}</div>`;
  }

  // ---------- shared selectors ----------
  function groupSelect(attr, value, allowAll) {
    const gs = St.groupsOfYear();
    return `<select ${attr}>${allowAll ? opt('', t('allGroups'), !value) : ''}${gs.map((g) => opt(g.id, gname(g), g.id === value)).join('')}</select>`;
  }
  function courseSelect(attr, gid, value, allowAll) {
    const cs = St.coursesFor(gid).filter((c) => !UI.mine || St.isMine(c));
    return `<select ${attr}>${allowAll ? opt('', t('allCourses'), !value) : (cs.length ? '' : opt('', t('selectCourse'), true))}${cs.map((c) => opt(c.id, `${cname(c)}${St.isYearCourse(c) ? ' (' + t('annualChip') + ')' : ''} — ${c.lecturer || ''}`, c.id === value)).join('')}</select>`;
  }
  const mineBox = () => (!isLecturer() && A.current && (A.current.courses || []).length ? `<label class="row fix" style="gap:6px"><input type="checkbox" data-set="ui.mine" ${UI.mine ? 'checked' : ''}><span class="small">${t('myCourses')}</span></label>` : '');

  // ================= ATTENDANCE =================
  function viewAttend() {
    if (draft) return viewSession();
    const groups = St.groupsOfYear();
    if (!groups.length) return `<div class="card empty">${isLecturer() ? t('noAssigned') : t('noGroups')}</div>`;
    const c = St.course(UI.courseId);
    const todayIdx = new Date().getDay(); const dayAr = I18N.dayNames[0].split(',')[todayIdx]; const dayEn = I18N.dayNames[1].split(',')[todayIdx];
    const pool = isLecturer() || UI.mine ? St.coursesFor('') : St.coursesFor(UI.groupId);
    const todays = pool.filter((x) => (!UI.mine || St.isMine(x)) && x.schedule && (N.norm(x.schedule).includes(N.norm(dayAr)) || x.schedule.toLowerCase().includes(dayEn.toLowerCase())));
    let html = alertsCard() + cloudCard() + `<div class="card"><label class="f">${t('group')}</label>${groupSelect('data-set="ui.groupId"', UI.groupId)}
      <label class="f">${t('course')}</label><div class="row">${courseSelect('data-set="ui.courseId"', UI.groupId, UI.courseId)}${mineBox()}</div></div>`;
    if (todays.length) html += `<div class="card"><h3>${t('todayCourses')} · ${lang() === 'ar' ? dayAr : dayEn} ${R.dmy(St.todayStr())}</h3><div class="today-strip">${todays.map((x) => `<div class="tc" data-act="pick-course" data-id="${x.id}" data-g="${x.groupId}"><b>${esc(cname(x))}</b>${esc(gname(St.group(x.groupId)))}<br>${esc(x.schedule)} · ${esc(x.room || '')}</div>`).join('')}</div></div>`;
    if (!c) return html + `<div class="card empty">${t('noCourses')}</div>`;
    const sess = St.sessionsOf(c.id); const students = St.studentsOf(c.groupId);
    const held = sess.reduce((a, s) => a + (Number(s.hours) || 0), 0);
    const planned = (c.weeklyHours || 0) * St.weeksOf(c);
    html += `<div class="card"><h3><span>${esc(cname(c))}</span><span>${sysChip(c)} <span class="chip">${typeLabel(c.type)}</span></span></h3>
      <div class="stat-row"><span>${t('lecturer')}: ${esc(c.lecturer || '—')}</span><span>${esc(c.schedule || '')}</span><span>${esc(c.room || '')}</span></div>
      <div class="kpis"><div class="kpi"><b>${students.length}</b><span>${t('studentsCount')}</span></div><div class="kpi"><b>${sess.length}</b><span>${t('sessions')}</span></div><div class="kpi"><b>${R.fmtH(held)}</b><span>${t('heldHours')}</span></div><div class="kpi"><b>${R.fmtH(planned)}</b><span>${t('plannedHours')}</span></div></div>
      <button class="btn primary block" data-act="new-session">＋ ${t('newSession')}</button>
      <div class="toolbar"><button class="btn" data-act="xls-import">📥 ${t('xlsImport')}</button><button class="btn" data-act="xls-template">⬇ ${t('xlsTemplate')}</button></div></div>`;
    html += `<div class="card"><h3>${t('sessions')}</h3>`;
    if (!sess.length) html += `<div class="empty">${t('noSessions')}</div>`;
    else html += `<div class="list">${sess.slice().reverse().map((s) => {
      const abs = Object.values(s.records || {}).filter((v) => v === 'A' || v === 'E').length;
      const editable = A.canEditSession(s);
      const until = !A.can('editAnytime') && editable ? ` · ⏳ ${t('editUntil', { t: fmtDT(A.editDeadline(s)) })}` : '';
      return `<div class="item ${editable ? '' : 'locked'}" data-act="edit-session" data-id="${s.id}"><div class="main"><div class="t">${editable ? '' : '🔒 '}${R.dmy(s.date)} · ${R.dayName(s.date, lang())} · ${R.fmtH(s.hours)} ${t('hours')}</div><div class="s">${abs} ${t('absentCount')}${s.topic ? ' · ' + esc(s.topic) : ''}${until}${s.editedBy ? ` · ✎ ${t('editedByL', { n: esc(s.editedBy) })}` : ''}</div></div>${editable ? `<div class="acts"><button class="icon" data-act="del-session" data-id="${s.id}" title="${t('delete')}">🗑</button></div>` : ''}</div>`; }).join('')}</div>`;
    return html + '</div>';
  }

  function viewSession() {
    const c = St.course(draft.courseId); const students = St.studentsOf(c.groupId);
    const span = St.termOf(c.termId);
    const outside = span && (draft.date < span.start || draft.date > span.end);
    const absN = Object.values(draft.records).filter((v) => v === 'A' || v === 'E').length;
    const ro = !!draft.readOnly;
    const seg = (sid) => { const r = draft.records[sid] || 'P'; return `<div class="seg">${['P', 'A', 'E', 'L'].map((k) => `<button class="${r === k ? 'on ' + k : ''}" ${ro ? 'disabled' : `data-act="set-rec" data-id="${sid}" data-v="${k}"`} title="${t({ P: 'present', A: 'absent', E: 'excused', L: 'late' }[k])}">${t({ P: 'presentShort', A: 'absentShort', E: 'excusedShort', L: 'lateShort' }[k])}</button>`).join('')}</div>`; };
    return `<div class="card"><h3><span>${esc(cname(c))}</span><button class="btn sm ghost" data-act="cancel-session">✕ ${t('cancel')}</button></h3>
      <div class="muted">${esc(gname(St.group(c.groupId)))} · ${esc(c.lecturer || '')}</div>
      ${ro ? `<div class="warnbox small">🔒 ${t('lockedSession', { h: Number(CFG.rules.editWindowHours) || 72 })}</div>` : ''}
      <div class="grid2"><div><label class="f">${t('date')}</label><input type="date" data-draft="date" value="${draft.date}" ${ro ? 'disabled' : ''}></div><div><label class="f">${t('hours')}</label><input type="number" min="0.5" step="0.5" data-draft="hours" value="${draft.hours}" ${ro ? 'disabled' : ''}></div></div>
      <label class="f">${t('topic')}</label><input type="text" data-draft="topic" value="${esc(draft.topic || '')}" ${ro ? 'disabled' : ''}>
      ${outside ? `<p class="small" style="color:var(--warn2)">${t('outsideTerm')}</p>` : ''}
      ${ro ? '' : `<div class="toolbar"><button class="btn" data-act="all-present">✓ ${t('allPresent')}</button></div>
      <p class="muted small">${t('tapToCycle')} · ${t('present')} / ${t('absent')} / ${t('excused')} / ${t('late')}</p>`}</div>
      <div class="card sheet">${students.length ? students.map((s, i) => { const r = draft.records[s.id] || 'P'; const note = draft.notes[s.id]; return `<div class="srow ${r}"><div class="nm" ${ro ? '' : `data-act="cycle" data-id="${s.id}"`}><span class="idx">${i + 1}</span>${esc(s.name)}${note ? `<span class="nt">✎ ${esc(note)}</span>` : ''}</div>${r === 'E' && !ro ? `<button class="icon" data-act="note" data-id="${s.id}">✎</button>` : ''}${seg(s.id)}</div>`; }).join('') : `<div class="empty">${t('noStudents')}</div>`}</div>
      <div class="sticky-actions"><div class="toolbar">${ro ? `<button class="btn" data-act="close-session">${t('close')}</button>` : `<button class="btn primary" data-act="save-session">💾 ${t('save')} (${absN} ${t('absentCount')})</button><button class="btn" data-act="cancel-session">${t('cancel')}</button>`}</div></div>`;
  }
  function newDraft(courseId, sess, date) {
    const c = St.course(courseId);
    draft = sess ? { id: sess.id, courseId, date: sess.date, hours: sess.hours, topic: sess.topic || '', records: Object.assign({}, sess.records || {}), notes: Object.assign({}, sess.notes || {}), createdAt: sess.createdAt, by: sess.by, readOnly: !A.canEditSession(sess) }
      : { id: null, courseId, date: date || St.todayStr(), hours: c.weeklyHours || 2, topic: '', records: {}, notes: {} };
  }
  function saveDraftSession() {
    if (!draft.date) { toast(t('required')); return; }
    const prev = draft.id ? St.S.sessions.find((x) => x.id === draft.id) : null;
    if (prev && !A.canEditSession(prev)) { toast(t('lockedSession', { h: Number(CFG.rules.editWindowHours) || 72 })); return; }
    const records = {}; for (const k in draft.records) if (draft.records[k] && draft.records[k] !== 'P') records[k] = draft.records[k];
    const notes = {}; for (const k in draft.notes) if (draft.notes[k]) notes[k] = draft.notes[k];
    const me = A.current ? A.current.name : '';
    const s = { id: draft.id || 's_' + St.uid(), courseId: draft.courseId, date: draft.date, hours: Number(draft.hours) || 0, topic: draft.topic || '', records, notes, by: prev ? (prev.by || '') : (A.current ? A.current.id : ''), byName: prev ? (prev.byName || '') : me, createdAt: draft.createdAt || Date.now(), updatedAt: Date.now() };
    if (prev && A.current && prev.by !== A.current.id) { s.editedBy = me; s.editedAt = Date.now(); }
    St.upsert(St.S.sessions, s); St.save(); draft = null; toast(t('saved')); render();
    sendToStore([s.id]);
  }

  // ================= COURSES =================
  function viewCourses() {
    const groups = St.groupsOfYear();
    if (!groups.length) return `<div class="card empty">${t('noGroups')}</div>`;
    const edit = A.can('editLists');
    const other = CFG.terms.find((x) => x[0] !== St.S.currentTerm);
    const cs = St.coursesFor(UI.groupId).filter((c) => !UI.mine || St.isMine(c));
    return `<div class="card"><label class="f">${t('group')}</label><div class="row">${groupSelect('data-set="ui.groupId"', UI.groupId)}${mineBox()}</div>
      ${edit ? `<div class="toolbar"><button class="btn primary" data-act="add-course">＋ ${t('addCourse')}</button>${other ? `<button class="btn" data-act="copy-term" data-id="${other[0]}">⇄ ${t('copyToOtherTerm')} ${lang() === 'ar' ? other[1] : other[2]}</button>` : ''}</div>` : `<p class="muted small">${t('readOnlyLists')}</p>`}</div>
      <div class="card"><h3>${termLabel(St.S.currentTerm)} · ${cs.length} ${t('course')}</h3>${cs.length ? `<div class="list">${cs.map((c) => `<div class="item"><div class="main"><div class="t">${esc(cname(c))} ${sysChip(c)} <span class="chip">${typeLabel(c.type)}</span> <span class="chip">${c.weeklyHours} ${t('hours')}</span></div><div class="s">${esc(c.lecturer || '—')} · ${esc(c.schedule || '')} · ${esc(c.room || '')}</div></div>${edit ? `<div class="acts"><button class="icon" data-act="edit-course" data-id="${c.id}">✎</button><button class="icon" data-act="del-course" data-id="${c.id}">🗑</button></div>` : ''}</div>`).join('')}</div>` : `<div class="empty">${t('noCourses')}</div>`}</div>`;
  }
  function courseForm(c) {
    const g0 = St.group(UI.groupId);
    c = c || { groupId: UI.groupId, termId: g0 && g0.system === 'annual' ? 'year' : St.S.currentTerm, nameAr: '', nameEn: '', lecturer: '', type: 'T', weeklyHours: 2, schedule: '', room: '' };
    const yr = St.isYearCourse(c);
    modal(c.id ? t('editCourse') : t('addCourse'), `
      <label class="f">${t('group')}</label>${groupSelect('id="f-group"', c.groupId)}
      <label class="f">${t('courseSystem')}</label><select id="f-csys">${CFG.courseSystems.map((x) => opt(x[0], lang() === 'ar' ? x[1] : x[2], (x[0] === 'year') === yr)).join('')}</select>
      <div id="f-term-wrap" ${yr ? 'style="display:none"' : ''}><label class="f">${t('term')}</label><select id="f-term">${CFG.terms.map((x) => opt(x[0], lang() === 'ar' ? x[1] : x[2], x[0] === (yr ? St.S.currentTerm : c.termId))).join('')}</select></div>
      <label class="f">${t('nameAr')} *</label><input type="text" id="f-nameAr" value="${esc(c.nameAr)}" dir="rtl">
      <label class="f">${t('nameEn')}</label><input type="text" id="f-nameEn" value="${esc(c.nameEn || '')}" dir="ltr">
      <label class="f">${t('lecturer')}</label><input type="text" id="f-lecturer" value="${esc(c.lecturer || '')}">
      <div class="grid2"><div><label class="f">${t('type')}</label><select id="f-type">${['T', 'U', 'P', 'X'].map((k) => opt(k, typeLabel(k), c.type === k)).join('')}</select></div><div><label class="f">${t('weeklyHours')} *</label><input type="number" id="f-wh" min="0.5" step="0.5" value="${c.weeklyHours}"></div></div>
      <div class="grid2"><div><label class="f">${t('schedule')}</label><input type="text" id="f-schedule" value="${esc(c.schedule || '')}" placeholder="${esc(I18N.dayNames[L()].split(',')[0])} 8:30-10:30"></div><div><label class="f">${t('room')}</label><input type="text" id="f-room" value="${esc(c.room || '')}"></div></div>`,
      () => {
        const nameAr = $('#f-nameAr').value.trim(); const wh = Number($('#f-wh').value);
        if (!nameAr || !wh) { toast(t('required')); return false; }
        const termId = $('#f-csys').value === 'year' ? 'year' : $('#f-term').value;
        const o = Object.assign({}, c, { id: c.id || 'c_' + St.uid(), yearId: c.yearId || St.S.currentYear, groupId: $('#f-group').value, termId, nameAr, nameEn: $('#f-nameEn').value.trim(), lecturer: $('#f-lecturer').value.trim(), type: $('#f-type').value, weeklyHours: wh, schedule: $('#f-schedule').value.trim(), room: $('#f-room').value.trim() });
        St.upsert(St.S.courses, o); St.save(); toast(t('saved')); return true;
      });
  }

  // ================= STUDENTS =================
  function viewStudents() {
    const groups = St.groupsOfYear(); const g = St.group(UI.groupId); const edit = A.can('editLists');
    let html = `<div class="card"><label class="f">${t('group')}</label><div class="row">${groups.length ? groupSelect('data-set="ui.groupId"', UI.groupId) : `<span class="muted">${t('noGroups')}</span>`}${edit ? `<div class="acts fix"><button class="icon" data-act="add-group" title="${t('addGroup')}">＋</button>${g ? `<button class="icon" data-act="edit-group" data-id="${g.id}">✎</button><button class="icon" data-act="del-group" data-id="${g.id}">🗑</button>` : ''}</div>` : ''}</div>`;
    if (g && edit) html += `<div class="toolbar"><button class="btn primary" data-act="add-student">＋ ${t('addStudent')}</button><button class="btn" data-act="import-students">📋 ${t('importNames')}</button></div>`;
    if (!edit) html += `<p class="muted small">${t('readOnlyLists')}</p>`;
    html += '</div>';
    if (!g) return html;
    const ss = St.studentsOf(g.id);
    html += `<div class="card"><h3><span>${esc(gname(g))}</span><span class="chip">${ss.length} ${t('studentsCount')}</span></h3>${ss.length ? `<div class="list">${ss.map((s, i) => `<div class="item"><div class="main"><div class="t"><span class="muted small">${i + 1}</span> ${esc(s.name)}</div><div class="s">${esc(s.sid || '')}${s.note ? ' · ' + esc(s.note) : ''}</div></div>${edit ? `<div class="acts"><button class="icon" data-act="edit-student" data-id="${s.id}">✎</button><button class="icon" data-act="del-student" data-id="${s.id}">🗑</button></div>` : ''}</div>`).join('')}</div>` : `<div class="empty">${t('noStudents')}</div>`}</div>`;
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
    if (!groups.length) return `<div class="card empty">${isLecturer() ? t('noAssigned') : t('noGroups')}</div>`;
    UI.reportLang = UI.reportLang || lang();
    const tabs = isLecturer() ? [['memo', 'repMemo'], ['course', 'repCourse'], ['register', 'repRegister']]
      : [['memo', 'repMemo'], ['final', 'repFinal'], ['missing', 'repMissing'], ['course', 'repCourse'], ['student', 'repStudent'], ['overview', 'repGroup'], ['register', 'repRegister']];
    if (!tabs.find((x) => x[0] === UI.reportTab)) UI.reportTab = 'memo';
    let html = '';
    if (A.can('import')) html += `<div class="card row"><span class="small muted">${t('importLecturerHint')}</span><label class="btn fix">📥 ${t('importLecturer')}<input type="file" id="f-import-abs" accept=".json,application/json" multiple style="display:none"></label></div>`;
    html += `<div class="subtabs">${tabs.map(([id, k]) => `<button class="${UI.reportTab === id ? 'on' : ''}" data-act="rtab" data-id="${id}">${t(k)}</button>`).join('')}</div>`;
    html += `<div class="card"><div class="row"><div><label class="f">${t('group')}</label>${groupSelect('data-set="ui.groupId"', UI.groupId)}</div><div class="fix"><label class="f">${t('reportLang')}</label><div class="seg"><button class="${UI.reportLang === 'ar' ? 'on L' : ''}" data-act="rlang" data-v="ar">عربي</button><button class="${UI.reportLang === 'en' ? 'on L' : ''}" data-act="rlang" data-v="en">EN</button></div></div></div>`;
    const rl = UI.reportLang; let out = null;
    const absBox = (key) => `<label class="row fix" style="gap:6px"><input type="checkbox" data-set="ui.${key}" ${UI[key] ? 'checked' : ''}><span class="small">${t('absOnly')}</span></label>`;
    if (UI.reportTab === 'memo' || UI.reportTab === 'final') {
      const fin = UI.reportTab === 'final';
      const periods = fin ? [['term', 'pTerm'], ['year', 'pYear'], ['custom', 'pCustom']] : [['day', 'pDay'], ['week', 'pWeek'], ['month', 'pMonth'], ['term', 'pTerm'], ['year', 'pYear'], ['custom', 'pCustom']];
      const pkey = fin ? 'finalPeriod' : 'period';
      let pt = UI[pkey] || (fin ? 'term' : 'week'); if (!periods.find((p) => p[0] === pt)) pt = periods[0][0];
      html += `<div class="row"><div><label class="f">${t('course')}</label>${courseSelect('data-set="ui.reportCourseId"', UI.groupId, UI.reportCourseId, true)}</div>${mineBox()}${absBox(fin ? 'finalAbsOnly' : 'absOnly')}</div>
        <div class="grid2"><div><label class="f">${t('period')}</label><select data-set="ui.${pkey}">${periods.map(([v, k]) => opt(v, t(k), pt === v)).join('')}</select></div>
        ${pt === 'custom' ? `<div><label class="f">${t('from')}</label><input type="date" data-set="ui.from" value="${UI.from || ''}"></div><div><label class="f">${t('to')}</label><input type="date" data-set="ui.to" value="${UI.to || ''}"></div>` : (pt === 'term' || pt === 'year') ? '' : `<div><label class="f">${t('date')}</label><input type="date" data-set="ui.reportDate" value="${UI.reportDate || St.todayStr()}"></div>`}</div>`;
      const range = R.periodRange(pt, UI.reportDate || St.todayStr(), UI.from, UI.to);
      if (range.from && range.to) {
        const rc = St.course(UI.reportCourseId); const cid = rc && rc.groupId === UI.groupId && St.inScope(rc) ? rc.id : '';
        const d = R.memoData({ groupId: UI.groupId, courseId: cid, mine: UI.mine, range, periodType: pt, absOnly: fin ? !!UI.finalAbsOnly : !!UI.absOnly, final: fin, fromLecturer: isLecturer() });
        out = { html: R.memoHTML(d, rl), csv: R.memoCSV(d, rl), name: `${fin ? 'final' : 'absences'}_${range.from}_${range.to}`, text: R.memoText(d, rl) };
      }
    } else if (UI.reportTab === 'course' || UI.reportTab === 'register') {
      html += `<div class="row"><div><label class="f">${t('course')}</label>${courseSelect('data-set="ui.courseId"', UI.groupId, UI.courseId)}</div>${mineBox()}</div>`;
      const c = St.course(UI.courseId);
      if (c && St.inScope(c)) { const r = UI.reportTab === 'course' ? R.courseTable(c, rl) : R.register(c.id, rl); out = { html: r.html, csv: r.csv, name: `${UI.reportTab}_${c.nameEn || c.nameAr}` }; }
    } else if (UI.reportTab === 'student') {
      const ss = St.studentsOf(UI.groupId); if (!ss.find((s) => s.id === UI.studentId)) UI.studentId = ss[0] ? ss[0].id : '';
      html += `<label class="f">${t('student')}</label><select data-set="ui.studentId">${ss.map((s) => opt(s.id, s.name, s.id === UI.studentId)).join('')}</select>`;
      if (UI.studentId) { const r = R.studentReport(UI.studentId, rl); out = { html: r.html, csv: r.csv, name: `student_${St.student(UI.studentId).name}` }; }
    } else if (UI.reportTab === 'missing') {
      html += `<p class="muted small">${t('missingHint', { d: R.dmy(CFG.rules.trackFrom || '') })}</p>`;
      const m = R.missingData({ upTo: R.addDays(St.todayStr(), -1) }); const r = R.missingReport(m, rl);
      out = { html: r.html, csv: r.csv, name: `not_received_${St.todayStr()}`, text: r.text };
    } else if (UI.reportTab === 'overview') {
      html += `<div class="row">${mineBox() || '<span></span>'}</div>`;
      const r = R.overview(UI.groupId, rl, UI.mine); out = { html: r.html, csv: r.csv, name: `overview_${gname(St.group(UI.groupId))}` };
    }
    const recs = authorizedRecipients();
    html += `<div class="toolbar"><button class="btn primary" data-act="print" ${out ? '' : 'disabled'}>🖨 ${t('print')}</button><button class="btn" data-act="csv" ${out ? '' : 'disabled'}>⬇ ${t('exportCsv')}</button>${Cloud.enabled() ? `<button class="btn" data-act="send" ${out ? '' : 'disabled'}>☁️ ${t('cloudSendBtn', { d: storeName() })}</button><button class="btn" data-act="share" ${out ? '' : 'disabled'}>📤 ${t('shareBtn')}</button>` : `<button class="btn" data-act="send" ${out ? '' : 'disabled'}>📤 ${t('sendReport')}</button>`}</div>
      <p class="muted small">${recs.length ? `${t('sendTo')}: ${recs.map((r) => `${recTitle(r)}${r.name ? ' ' + esc(r.name) : ''}`).join('، ')}` : t('noRecipients')} · ${t('sendHint')}</p></div>`;
    lastReport = out || { html: '', csv: '', name: 'report' };
    html += out ? `<div class="tbl-wrap">${out.html}</div>` : `<div class="card empty">${t('nothingToShow')}</div>`;
    return html;
  }

  // ================= SETTINGS =================
  function viewSettings() {
    if (UI.adminView === 'accounts' && A.can('accounts')) return viewAccounts();
    const s = St.S.settings, acc = A.current, rb = St.rules('bologna'), ra = St.rules('annual');
    const myCourses = isLecturer() ? (acc.courses || []).map((id) => St.course(id)).filter(Boolean) : [];
    let html = '';
    if (A.can('exportDept') && St.hasDraft()) html += `<div class="card warnbox">⚠️ ${A.can('admin') ? t('draftBanner') : t('draftBannerHead')} <button class="btn sm" data-act="export-dept">⬇ ${t('exportDept')}</button></div>`;
    html += `<div class="card"><h3><span>👤 ${t('myAccount')}</span><span class="chip">${esc(accRoleText(acc))}</span></h3>
      <p><b>${esc(accName(acc))}</b></p>
      ${myCourses.length ? `<details><summary>${t('myCoursesList')} (${myCourses.length})</summary><ul class="small">${myCourses.map((c) => `<li>${esc(cname(c))} — ${esc(gname(St.group(c.groupId)))}${St.isYearCourse(c) ? ' (' + t('annualChip') + ')' : ''}</li>`).join('')}</ul></details>` : ''}
      <label class="f">${t('language')}</label><select data-set="settings.lang">${opt('ar', 'العربية', s.lang === 'ar')}${opt('en', 'English', s.lang === 'en')}</select>
      <div class="toolbar"><a class="btn" href="help.html?lang=${lang()}">📖 ${t('userGuide')}</a><button class="btn" data-act="lock-now">🔒 ${t('signOut')}</button></div></div>`;
    if (isLecturer()) html += `<div class="card"><h3>📤 ${t('sendMyData')}</h3><p class="muted small">${t('sendMyDataHint')}</p><button class="btn primary block" data-act="send-my-data">📤 ${t('sendMyData')}</button></div>`;
    html += `<div class="card"><h3>${t('thresholds')}</h3><div class="tbl"><table class="rep"><tr><th>${t('system')}</th><th>${t('warn1')}</th><th>${t('warn2')}</th><th>${t('failU')}</th><th>${t('failT')}</th></tr>
      <tr><td><b>${t('sysBologna')}</b></td><td>${rb.warn1}%</td><td>${rb.warn2}%</td><td>&gt; ${rb.failUnexcused}%</td><td>&gt; ${rb.failTotal}%</td></tr>
      <tr><td><b>${t('sysAnnual')}</b></td><td>${ra.warn1}%</td><td>${ra.warn2}%</td><td>&gt; ${ra.failUnexcused}%</td><td>&gt; ${ra.failTotal}%</td></tr></table></div><p class="muted small">${t('regulation')}</p></div>`;
    if (A.can('accounts')) html += adminCard();
    if (A.can('years')) html += yearsCard();
    if (A.can('backup')) html += `<div class="card"><h3>${t('backup')}</h3><p class="muted small">${t('backupHint')}</p>
        <div class="toolbar"><button class="btn primary" data-act="export-json">⬇ ${t('exportJson')}</button><label class="btn">⬆ ${t('importJson')}<input type="file" accept=".json,application/json" id="f-import" style="display:none"></label></div>
        <label class="f">${t('importJson')}: </label><select id="f-import-mode">${opt('merge', t('merge'), true)}${opt('replace', t('replace'))}</select>
        ${A.can('admin') ? `<div class="sp"></div><button class="btn danger block" data-act="reset-seed">${t('resetSeed')}</button>` : ''}</div>`;
    else html += `<div class="card"><h3>${t('backup')}</h3><p class="muted small">${t('backupHint')}</p><button class="btn block" data-act="export-json">⬇ ${t('exportJson')}</button></div>`;
    html += storageSettingsCard() + installCard() + aboutCard();
    return html;
  }
  function installCard() {
    return `<div class="card"><h3>${t('install')}</h3>${!R.isNative() && CFG.androidApk ? `<a class="btn block mb" href="${CFG.androidApk}" download>🤖 ${t('downloadApk')}</a><p class="muted small">${t('apkHint')}</p>` : ''}${R.isNative() ? `<p class="muted">${t('nativeApp')}</p>` : window.matchMedia('(display-mode: standalone)').matches || navigator.standalone ? `<p class="muted">${t('installed')}</p>` : `${deferredPrompt ? `<button class="btn primary block mb" data-act="install">📲 ${t('installBtn')}</button>` : ''}<p class="muted small">${t('installAndroid')}</p><p class="muted small">${t('installIos')}</p>`}
      <p class="muted small">${t('version')} ${CFG.version} · ${St.S.students.length} ${t('studentsCount')} · ${St.S.courses.length} ${t('course')} · ${St.S.sessions.length} ${t('sessions')}</p></div>`;
  }
  function aboutCard() {
    const o = CFG.owner;
    return `<div class="card about"><h3>ℹ️ ${t('aboutApp')}</h3>
      <p><b>${esc(t('appName'))}</b> — ${t('version')} ${CFG.version}</p>
      <p>${esc(o.role[L()])}: <b>${esc(o.name[L()])}</b></p>
      <p class="small">${t('contact')}: <a href="mailto:${esc(o.email)}" dir="ltr">${esc(o.email)}</a> · <a href="tel:${esc(o.phone)}" dir="ltr">${esc(o.phone)}</a> · <a href="https://wa.me/${esc(o.phone.replace(/\D/g, ''))}" target="_blank" rel="noopener">${t('whatsapp')}</a></p>
      <p class="small muted">© 2026 ${esc(o.name[L()])} — ${t('rights')} · <a href="privacy.html?lang=${lang()}">${t('privacy')}</a></p></div>`;
  }
  function yearsCard() {
    const years = St.S.years.map((y) => `<div class="item"><div class="main"><div class="t">${esc(y.name)} ${y.id === St.S.currentYear ? '<span class="chip ok">✓</span>' : ''}</div><div class="s">${R.dmy(y.start)} – ${R.dmy(y.end)} · ${y.terms.map((tm) => `${termLabel(tm.id)}: ${R.dmy(tm.start)} – ${R.dmy(tm.end)} (${tm.weeks} ${t('weeks')})`).join(' · ')}</div>${(y.events || []).length ? `<div class="s">${y.events.map((e) => `${lang() === 'ar' ? e.nameAr : e.nameEn}: ${R.dmy(e.start)}${e.end && e.end !== e.start ? ' – ' + R.dmy(e.end) : ''}`).join(' · ')}</div>` : ''}</div><div class="acts"><button class="icon" data-act="edit-year" data-id="${y.id}">✎</button><button class="icon" data-act="del-year" data-id="${y.id}">🗑</button></div></div>`).join('');
    return `<div class="card"><h3><span>${t('years')}</span><button class="btn sm" data-act="add-year">＋ ${t('addYear')}</button></h3><div class="list">${years}</div></div>`;
  }

  // ---- administration (master) ----
  const recTitle = (r) => (r.title === 'head' ? t('rHead') : r.title === 'committee' ? t('rCommittee') : r.title === 'person' ? t('rPerson') : esc(r.title || ''));
  const authorizedRecipients = () => (CFG.recipients || []).filter((r) => r.authorized !== false);
  function adminCard() {
    const recs = CFG.recipients || []; const c = CFG.committee || {};
    const accs = St.accounts();
    const list = recs.length ? `<div class="list">${recs.map((r) => `<div class="item"><div class="main"><div class="t">${recTitle(r)}${r.name ? ' — ' + esc(r.name) : ''} ${r.authorized === false ? '' : '<span class="chip ok">✓</span>'}</div><div class="s">${esc(r.email || '')}${r.phone ? ' · ' + esc(r.phone) : ''}</div></div><div class="acts"><button class="icon" data-act="edit-recipient" data-id="${r.id}">✎</button><button class="icon" data-act="del-recipient" data-id="${r.id}">🗑</button></div></div>`).join('')}</div>` : `<div class="empty">${t('noRecipients')}</div>`;
    const adm = A.can('admin');
    return `<div class="card admin"><h3>🛡 ${adm ? t('adminTitle') : t('headMgmtTitle')}</h3><p class="muted small">${adm ? t('adminIntro') : t('headIntro')}</p>
      <div class="admin-grid">
        <button class="btn" data-act="accounts-view">🔑 ${t('accountsMgr')} <span class="chip">${accs.length}</span></button>
        <button class="btn" data-act="committee-form">👥 ${t('committeeSetup')}</button>
        ${adm ? `<button class="btn" data-act="dept-form">🏛 ${t('deptSetup')}</button>` : ''}
        <button class="btn primary" data-act="export-dept">⬇ ${t('exportDept')}</button>
      </div>
      <p class="muted small">${adm ? t('exportDeptHint') : t('exportDeptHeadHint')}</p>
      <p class="small"><b>${esc(R.tr('committeeSetup', lang()))}:</b> ${esc(c.chair || '—')} · ${esc(c.member1 || '—')} · ${esc(c.member2 || '—')}</p>
      <h4 style="margin-top:12px">${t('recipients')} <button class="btn sm" data-act="add-recipient">＋ ${t('addRecipient')}</button></h4><p class="muted small">${t('adminHint')}</p>${list}
      <div class="toolbar"><a class="btn sm" href="admin.html?lang=${lang()}">📘 ${t('adminGuide')}</a>${adm ? `<a class="btn sm" href="publish-guide.html?lang=${lang()}">🏪 ${t('storeGuide')}</a>` : ''}</div></div>`;
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
        const list = St.clone(CFG.recipients || []); St.upsert(list, o); applyCfg({ recipients: list }); toast(t('saved')); return true;
      });
  }
  function committeeForm() {
    const c = CFG.committee || {}; const title = c.title || ['', ''];
    modal(t('committeeSetup'), `<p class="muted small">${t('committeeHint')}</p>
      <label class="f">${t('committeeTitleL')} (AR)</label><input type="text" id="f-ct-ar" value="${esc(title[0])}" dir="rtl">
      <label class="f">${t('committeeTitleL')} (EN)</label><input type="text" id="f-ct-en" value="${esc(title[1])}" dir="ltr">
      <label class="f">${t('chairName')}</label><input type="text" id="f-chair" value="${esc(c.chair || '')}">
      <label class="f">${t('member1Name')}</label><input type="text" id="f-m1" value="${esc(c.member1 || '')}">
      <label class="f">${t('member2Name')}</label><input type="text" id="f-m2" value="${esc(c.member2 || '')}">`,
      () => { applyCfg({ committee: { title: [$('#f-ct-ar').value.trim(), $('#f-ct-en').value.trim()], chair: $('#f-chair').value.trim(), member1: $('#f-m1').value.trim(), member2: $('#f-m2').value.trim() } }); toast(t('saved')); return true; });
  }
  let pendingLogos = {};
  function deptForm() {
    const ins = CFG.institution, r = CFG.rules, lg = CFG.logos; pendingLogos = {};
    const pair = (k, label) => `<div class="grid2"><div><label class="f">${label} (AR)</label><input type="text" id="f-${k}-ar" value="${esc(ins[k][0])}" dir="rtl"></div><div><label class="f">${label} (EN)</label><input type="text" id="f-${k}-en" value="${esc(ins[k][1])}" dir="ltr"></div></div>`;
    const logo = (k, label) => `<div class="logo-pick"><img id="prev-${k}" src="${esc(lg[k] || '')}" alt=""><label class="btn sm">${label}<input type="file" accept="image/*" data-logo="${k}" style="display:none"></label></div>`;
    const num = (k, label, step) => `<div><label class="f">${label}</label><input type="number" id="f-r-${k}" min="0" step="${step || 0.5}" value="${r[k]}"></div>`;
    const sysNum = (sy, k, label) => `<div><label class="f">${label}</label><input type="number" id="f-r-${sy}-${k}" min="0" step="0.5" value="${(r[sy] || {})[k]}"></div>`;
    const sysBlock = (sy, label) => `<h4>${label}</h4><div class="grid2">${sysNum(sy, 'warn1', t('warn1'))}${sysNum(sy, 'warn2', t('warn2'))}${sysNum(sy, 'failUnexcused', t('failU'))}${sysNum(sy, 'failTotal', t('failT'))}</div>`;
    modal(t('deptSetup'), `${pair('university', t('universityL'))}${pair('college', t('collegeL'))}${pair('department', t('departmentL'))}${pair('headTitle', t('headTitleL'))}
      <h4>${t('logosL')}</h4><div class="logo-row">${logo('university', t('logoUni'))}${logo('college', t('logoCol'))}${logo('department', t('logoDept'))}</div>
      <h4>${t('rulesTitle')}</h4>${sysBlock('bologna', t('sysBologna'))}${sysBlock('annual', t('sysAnnual'))}<div class="grid2">${num('weeksPerTerm', t('weeksPerTerm'), 1)}${num('editWindowHours', t('editWindowL'), 1)}<div><label class="f">${t('trackFromL')}</label><input type="date" id="f-trackFrom" value="${esc(r.trackFrom || '')}"></div><div><label class="f">${t('stagesCount')}</label><input type="number" id="f-stages" min="1" max="8" value="${CFG.stages}"></div></div>
      <h4>☁️ ${t('storeTitle')}</h4><p class="muted small">${t('storeHint')}</p>
      <label class="f">${t('storeProvider')}</label><select id="f-provider">${PROVIDERS.map((p) => opt(p, t('prov_' + p), (CFG.cloud.provider || (CFG.cloud.url ? 'gdrive' : 'none')) === p)).join('')}</select>
      <label class="f">${t('storeName')}</label><input type="text" id="f-store-label" value="${esc(CFG.cloud.label || '')}" placeholder="${esc(t('storeNamePh'))}">
      <label class="f">${t('storeUrl')}</label><input type="text" id="f-store-url" value="${esc(CFG.cloud.url || '')}" dir="ltr" placeholder="https://script.google.com/macros/s/…/exec  |  https://…/attendance-api.php">
      <p class="muted small">${t('storeUrlHint')}</p>`,
      () => {
        const institution = {}; for (const k of ['university', 'college', 'department', 'headTitle']) institution[k] = [$(`#f-${k}-ar`).value.trim(), $(`#f-${k}-en`).value.trim()];
        const rules = { bologna: {}, annual: {} };
        for (const sy of ['bologna', 'annual']) for (const k of ['warn1', 'warn2', 'failUnexcused', 'failTotal']) rules[sy][k] = Number($(`#f-r-${sy}-${k}`).value) || CFG.rules[sy][k];
        for (const k of ['weeksPerTerm', 'editWindowHours']) rules[k] = Number($(`#f-r-${k}`).value) || CFG.rules[k];
        rules.trackFrom = $('#f-trackFrom').value || CFG.rules.trackFrom;
        const provider = $('#f-provider').value, surl = $('#f-store-url').value.trim();
        if (provider !== 'none' && !/^https:\/\//i.test(surl)) { toast(t('storeUrlBad')); return false; }
        const cloud = { provider, url: provider === 'none' ? '' : surl, label: $('#f-store-label').value.trim() };
        applyCfg({ institution, rules, cloud, stages: Number($('#f-stages').value) || CFG.stages, logos: Object.assign({}, pendingLogos) });
        toast(t('saved')); setTimeout(() => location.reload(), 400); return true;
      });
  }
  function readLogo(file, key) {
    const img = new Image(); const fr = new FileReader();
    fr.onload = () => { img.onload = () => { const s = 256 / Math.max(img.width, img.height, 1); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * Math.min(1, s)); cv.height = Math.round(img.height * Math.min(1, s)); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); pendingLogos[key] = cv.toDataURL('image/png'); const p = $(`#prev-${key}`); if (p) p.src = pendingLogos[key]; }; img.src = fr.result; };
    fr.readAsDataURL(file);
  }

  // ---- accounts manager (master) ----
  function viewAccounts() {
    const rank = (a) => ({ admin: 0, head: 1, lecturer: 2 }[A.normRole(a.role)]);
    const accs = St.accounts().slice().sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'ar'));
    const fresh = Object.keys(newPasswords).length;
    return `<div class="card"><h3><span>🔑 ${t('accountsMgr')} <span class="chip">${accs.length}</span></span><button class="btn sm" data-act="accounts-back">← ${t('back')}</button></h3>
      <div class="toolbar"><button class="btn primary" data-act="add-account">＋ ${t('addAccount')}</button><button class="btn" data-act="auto-accounts">⚡ ${t('autoAccounts')}</button><button class="btn" data-act="cred-sheet" ${fresh ? '' : 'disabled'}>🖨 ${t('credentialsSheet')} (${fresh})</button></div>
      <p class="muted small">${t('exportDeptHint')}</p></div>
      <div class="card"><div class="list">${accs.map((a) => { const r = A.normRole(a.role); const mine = canManage(a); return `<div class="item"><div class="main"><div class="t">${esc(accName(a))} <span class="chip ${r}">${esc(accRoleText(a))}</span>${newPasswords[a.id] ? ' <span class="chip ok">🔑</span>' : ''}</div><div class="s">${r === 'lecturer' ? t('coursesN', { n: (a.courses || []).length }) : esc(roleLabel(r))}${a.hash ? '' : ' ⚠️ ' + t('setPasswordFirst')}</div></div>${mine ? `<div class="acts"><button class="icon" data-act="edit-account" data-id="${a.id}" title="${t('edit')}">✎</button><button class="icon" data-act="pw-account" data-id="${a.id}" title="${t('resetPassword')}">🔑</button>${a.id === (A.current && A.current.id) ? '' : `<button class="icon" data-act="del-account" data-id="${a.id}" title="${t('delete')}">🗑</button>`}</div>` : ''}</div>`; }).join('') || `<div class="empty">—</div>`}</div></div>`;
  }
  // the head (and delegates) manage head-level and lecturer accounts; only the administrator manages administrators
  const canManage = (a) => A.can('manageAdmins') || A.normRole(a.role) !== 'admin';
  function yearCourses() { return St.S.courses.filter((c) => c.yearId === St.S.currentYear); }
  function accountForm(a) {
    const isNew = !a; a = a || { id: 'u_' + St.uid(), name: '', nameEn: '', role: 'lecturer', title: '', courses: [] };
    if (!isNew && !canManage(a)) { toast(t('notAllowed')); return; }
    const sel = new Set(a.courses || []);
    const byGroup = St.S.groups.filter((g) => g.yearId === St.S.currentYear).map((g) => {
      const cs = yearCourses().filter((c) => c.groupId === g.id); if (!cs.length) return '';
      return `<details ${cs.some((c) => sel.has(c.id)) ? 'open' : ''}><summary>${esc(gname(g))} (${cs.filter((c) => sel.has(c.id)).length}/${cs.length})</summary>${cs.map((c) => `<label class="ck"><input type="checkbox" class="f-acc-c" value="${c.id}" ${sel.has(c.id) ? 'checked' : ''}> ${esc(cname(c))} <span class="muted small">${St.isYearCourse(c) ? t('annualChip') : termLabel(c.termId)} · ${esc(c.lecturer || '')}</span></label>`).join('')}</details>`;
    }).join('');
    modal(isNew ? t('addAccount') : t('editAccount'), `
      <label class="f">${t('accName')} *</label><input type="text" id="f-acc-name" value="${esc(a.name)}" dir="rtl">
      <label class="f">${t('accNameEn')}</label><input type="text" id="f-acc-nameEn" value="${esc(a.nameEn || '')}" dir="ltr">
      <label class="f">${t('accRole')}</label><select id="f-acc-role">${(A.can('manageAdmins') ? ['lecturer', 'head', 'admin'] : ['lecturer', 'head']).map((r) => opt(r, roleLabel(r), A.normRole(a.role) === r)).join('')}</select>
      <label class="f">${t('accTitle')}</label><input type="text" id="f-acc-title" value="${esc(a.title || '')}" placeholder="${esc(t('accTitlePh'))}">
      <h4>${t('accCourses')} <button type="button" class="btn sm" data-act="acc-auto">⚡ ${t('autoAssign')}</button></h4><div class="acc-courses">${byGroup}</div>`,
      () => {
        const name = $('#f-acc-name').value.trim(); if (!name) { toast(t('required')); return false; }
        const o = Object.assign({}, a, { name, nameEn: $('#f-acc-nameEn').value.trim(), role: $('#f-acc-role').value, title: $('#f-acc-title').value.trim(), courses: [...document.querySelectorAll('.f-acc-c:checked')].map((x) => x.value) });
        if (!canManage(o)) { toast(t('notAllowed')); return false; }
        const list = St.clone(St.accounts()); St.upsert(list, o); St.saveDraft({ accounts: list });
        if (isNew || !o.hash) setTimeout(() => newPasswordFor(o.id), 50);
        toast(t('saved')); return true;
      });
  }
  // Issue a password: a generated one is proposed, and the master/head may type their own instead
  function newPasswordFor(id) {
    const a = St.accounts().find((x) => x.id === id); if (!a || !canManage(a)) return;
    modal(t('newPasswordIs', { n: accName(a) }), `<p class="muted small">${t('pwChooseHint')}</p>
      <input type="text" id="f-newpw" class="pw-input" value="${esc(A.newPassword())}" dir="ltr" autocomplete="off" autocapitalize="none" spellcheck="false">
      <p class="muted small">${t('passwordOnce')}</p>`, () => {
      const pw = $('#f-newpw').value.trim();
      if (pw.length < 6) { toast(t('pwTooShort')); return false; }
      setPassword(id, pw); return true;
    });
  }
  async function setPassword(id, pw) {
    const list = St.clone(St.accounts()); const a = list.find((x) => x.id === id); if (!a) return;
    Object.assign(a, await A.makeCredential(pw));
    St.saveDraft({ accounts: list }); newPasswords[id] = { name: a.name, nameEn: a.nameEn, role: a.role, pw };
    toast(t('saved')); render();
  }
  async function autoAccounts() {
    const list = St.clone(St.accounts()); const courses = yearCourses();
    const names = N.extract(courses).filter((n) => !list.some((a) => N.same(a.name, n)));
    toast('…'); let n = 0;
    for (const name of names) {
      const pw = A.newPassword(); const id = 'u_' + St.uid() + n;
      const acc = Object.assign({ id, name, nameEn: '', role: 'lecturer', courses: courses.filter((c) => N.teaches(name, c)).map((c) => c.id) }, await A.makeCredential(pw));
      list.push(acc); newPasswords[id] = { name, role: 'lecturer', pw }; n++;
    }
    St.saveDraft({ accounts: list }); toast(t('autoAccountsDone', { n })); render();
  }
  function credentialsSheet() {
    const rows = Object.values(newPasswords).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    if (!rows.length) { toast(t('noNewPasswords')); return; }
    const lg = lang();
    const html = `<div class="doc" dir="${lg === 'ar' ? 'rtl' : 'ltr'}">${R.headerHTML(lg)}<h3>${t('credTitle')}</h3><p class="small">${t('credNote')}</p>
      <p class="small">${location.origin + location.pathname.replace(/[^/]*$/, '')}</p>
      <table class="rep"><thead><tr><th>${t('n')}</th><th>${t('name')}</th><th>${t('accRole')}</th><th>${t('password')}</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td class="name">${esc(lg === 'en' && r.nameEn ? r.nameEn : r.name)}</td><td>${esc(roleLabel(r.role))}</td><td dir="ltr"><b>${esc(r.pw)}</b></td></tr>`).join('')}</tbody></table></div>`;
    R.printHTML(html);
  }

  function yearForm(y) {
    const isNew = !y;
    y = y || { name: '', start: '', end: '', terms: CFG.terms.map((x) => ({ id: x[0], start: '', end: '', weeks: CFG.rules.weeksPerTerm })), events: [] };
    const termRows = y.terms.map((tm, i) => `<div class="grid2"><div><label class="f">${termLabel(tm.id)} ${t('termStart')}</label><input type="date" id="f-t${i}s" value="${tm.start}"></div><div><label class="f">${t('termEnd')}</label><input type="date" id="f-t${i}e" value="${tm.end}"></div></div><label class="f">${t('weeks')}</label><input type="number" id="f-t${i}w" min="1" max="40" value="${tm.weeks}">`).join('');
    const evRows = (y.events || []).map((e, i) => `<div class="row"><input type="text" value="${esc(e.nameAr)}" placeholder="عربي" dir="rtl"><input type="text" value="${esc(e.nameEn)}" placeholder="English" dir="ltr"><input type="date" value="${e.start}" class="fix" style="flex:0 0 140px"><input type="date" value="${e.end || ''}" class="fix" style="flex:0 0 140px"></div>`).join('');
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
        if (isNew) {
          if (St.S.years.find((x) => x.id === o.id)) { toast(t('required')); return false; }
          const cmap = St.addYear(o, $('#f-copy').checked ? St.S.currentYear : null); St.S.currentYear = o.id;
          // carry course assignments over to the copied courses of the new year
          if (Object.keys(cmap).length) { const list = St.clone(St.accounts()); for (const a of list) a.courses = (a.courses || []).concat((a.courses || []).map((id) => cmap[id]).filter(Boolean)); St.saveDraft({ accounts: list }); }
        } else St.upsert(St.S.years, o);
        St.save(); toast(t('saved')); return true;
      });
  }

  async function sendCurrentReport() {
    if (!lastReport.html) return;
    const recs = authorizedRecipients(); const to = recs.map((r) => `${recTitle(r)}${r.name ? ' ' + r.name : ''}`).join(', ');
    const text = (lastReport.text || lastReport.name) + (to ? `\n\n${t('sendTo')}: ${to}` : '');
    const base = lastReport.name.replace(/[\\/:*?"<>|]+/g, '_');
    const att = [{ name: base + '.csv', content: lastReport.csv, mime: 'text/csv;charset=utf-8' }];
    if (isLecturer()) att.push({ name: `absences_data_${St.todayStr()}.json`, content: St.exportAbsences(A.current.courses || [], A.current.name), mime: 'application/json' });
    if (Cloud.enabled()) {
      // the storage chosen by the administrator (Google Drive / data centre) receives the data and an archived copy
      toast(t('cloudSending'));
      const f = await Cloud.flush();
      const page = await R.fullPageFor(base, lastReport.html);
      const a = await Cloud.archive([{ name: base + '.html', content: page, mime: 'text/html' }, { name: base + '.csv', content: lastReport.csv, mime: 'text/csv' }]);
      if (f && !f.error && a && !a.error) { toast(t('cloudSaved', { d: storeName() })); if (isLecturer()) { UI.lastSentAt = Date.now(); St.saveUI(); } render(); return; }
      toast(t('cloudError', { e: (a && a.error) || (f && f.error) || '?' }));
      return;
    }
    const res = await R.sendReport(base, lastReport.html, att, text, recs);
    if (res === 'shared' || res === 'mail') { toast(t('saved')); if (isLecturer()) { UI.lastSentAt = Date.now(); St.saveUI(); } }
  }
  async function shareCurrentReport() {
    if (!lastReport.html) return;
    const recs = authorizedRecipients(); const base = lastReport.name.replace(/[\\/:*?"<>|]+/g, '_');
    const att = [{ name: base + '.csv', content: lastReport.csv, mime: 'text/csv;charset=utf-8' }];
    if (isLecturer()) att.push({ name: `absences_data_${St.todayStr()}.json`, content: St.exportAbsences(A.current.courses || [], A.current.name), mime: 'application/json' });
    await R.sendReport(base, lastReport.html, att, lastReport.text || lastReport.name, recs);
  }

  // ================= EXCEL IMPORT =================
  let imp = null;
  function xlsImportForm(c) {
    imp = { courseId: c.id, wb: null, sheet: '', parsed: null };
    modal(t('xlsImport'), `<p class="muted small">${t('xlsHint')}</p>
      <div class="small"><b>${esc(cname(c))}</b> · ${esc(gname(St.group(c.groupId)))}</div>
      <label class="f">${t('xlsFile')}</label><input type="file" id="f-xls" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv">
      <div class="grid2"><div><label class="f">${t('hoursPerLecture')}</label><input type="number" id="f-xls-hours" min="0.5" step="0.5" value="${c.weeklyHours || 2}"></div>
      ${A.can('editLists') ? `<label class="row" style="gap:8px;align-self:end"><input type="checkbox" id="f-xls-add" class="fix"><span class="small">${t('addUnmatched')}</span></label>` : '<span></span>'}</div>
      <div id="xls-preview"></div>`, () => {
      if (!imp || !imp.parsed || imp.parsed.error) { toast(t('xlsChooseFirst')); return false; }
      const course = St.course(imp.courseId); const add = $('#f-xls-add');
      const res = Excel.applyAttendance(course, imp.parsed, { defaultHours: Number($('#f-xls-hours').value) || course.weeklyHours || 2, addUnmatched: !!(add && add.checked), canTouch: (s) => A.canEditSession(s), by: A.current ? A.current.id : '', byName: A.current ? A.current.name : '' });
      St.save(); toast(t('xlsDone', { c: res.created, u: res.updated }) + (res.skipped ? ' · ' + t('xlsSkipped', { n: res.skipped, h: Number(CFG.rules.editWindowHours) || 72 }) : '')); imp = null;
      sendToStore(St.sessionsOf(course.id).filter((x) => (x.updatedAt || 0) >= Date.now() - 60000).map((x) => x.id)); return true;
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
  function infoModal(title, body) {
    modalSave = null;
    $('#modal-box').innerHTML = `<h3>${esc(title)}</h3>${body}<div class="acts"><button class="btn primary" data-act="modal-close">${t('close')}</button></div>`;
    $('#modal').classList.add('open');
  }
  function closeModal() { $('#modal').classList.remove('open'); modalSave = null; }

  // ================= EVENTS =================
  function setPath(path, val) {
    const [root, key] = path.split('.');
    if (root === 'ui') UI[key] = val; else if (root === 'settings') St.S.settings[key] = val; else St.S[path] = val;
  }
  function readText(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsText(file); }); }
  document.addEventListener('change', async (e) => {
    const el = e.target;
    if (el.dataset.set) {
      let v = el.type === 'checkbox' ? el.checked : el.value; if (el.type === 'number') v = Number(v);
      setPath(el.dataset.set, v);
      if (el.dataset.set === 'currentYear') { UI.groupId = ''; UI.courseId = ''; }
      if (el.dataset.set === 'ui.groupId') { UI.courseId = ''; UI.reportCourseId = ''; UI.studentId = ''; }
      St.save(); render(); return;
    }
    if (el.dataset.draft && draft) { draft[el.dataset.draft] = el.value; if (el.dataset.draft === 'date') render(); return; }
    if (el.dataset.logo && el.files[0]) { readLogo(el.files[0], el.dataset.logo); return; }
    if (el.id === 'f-csys') { $('#f-term-wrap').style.display = el.value === 'year' ? 'none' : ''; return; }
    if (el.id === 'f-acc') { const w = $('#f-rem-wrap'); if (w) { const ok = A.canRemember(A.byId(el.value)); w.style.display = ok ? '' : 'none'; if (!ok) $('#f-remember').checked = false; } return; }
    if (el.id === 'f-xls' && el.files[0] && imp) {
      const box = $('#xls-preview'); if (box) box.innerHTML = `<p class="muted small">${t('xlsReading')}</p>`;
      Excel.readFile(el.files[0]).then((wb) => {
        imp.wb = wb; const studs = St.studentsOf(St.course(imp.courseId).groupId);
        let best = wb.SheetNames[0], bestN = -1;
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
    if (el.id === 'f-import-abs' && el.files.length) {
      let a = 0, u = 0, bad = 0;
      for (const f of el.files) { try { const r = St.importAny(await readText(f), 'merge'); a += r.added || 0; u += r.updated || 0; } catch (err) { bad++; } }
      toast(bad && !a && !u ? t('importBad') : t('importedAbs', { a, u })); render(); return;
    }
    if (el.id === 'f-import' && el.files[0]) {
      const mode = $('#f-import-mode').value;
      try { const r = St.importAny(await readText(el.files[0]), mode); toast(r.kind === 'absences' ? t('importedAbs', { a: r.added, u: r.updated }) : t('importDone')); render(); } catch (err) { toast(t('importBad')); }
    }
  });
  document.addEventListener('input', (e) => { const el = e.target; if (el.dataset.draft && draft && el.dataset.draft !== 'date') draft[el.dataset.draft] = el.value; });

  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    const cycle = { P: 'A', A: 'E', E: 'L', L: 'P' };
    const admin = A.can('admin'), edit = A.can('editLists');
    switch (act) {
      case 'toggle-lang': St.S.settings.lang = lang() === 'ar' ? 'en' : 'ar'; UI.reportLang = St.S.settings.lang; St.save(); render(); break;
      case 'toggle-lang-lock': St.S.settings.lang = lang() === 'ar' ? 'en' : 'ar'; St.save(); renderLock(); break;
      case 'tab': if (draft && UI.tab === 'attend' && id !== 'attend' && !confirm(t('unsaved'))) return; if (id !== 'attend') draft = null; UI.tab = id; UI.adminView = ''; render(); break;
      case 'pick-course': UI.groupId = el.dataset.g; UI.courseId = id; render(); break;
      case 'new-session': newDraft(UI.courseId); render(); break;
      case 'edit-session': { const s = St.S.sessions.find((x) => x.id === id); if (s && St.inScope(St.course(s.courseId))) { newDraft(s.courseId, s); render(); } break; }
      case 'del-session': { e.stopPropagation(); const s = St.S.sessions.find((x) => x.id === id); if (!A.canEditSession(s)) { toast(t('lockedSession', { h: Number(CFG.rules.editWindowHours) || 72 })); break; } if (confirm(t('confirmDeleteSession'))) { Object.assign(s, { deleted: true, updatedAt: Date.now(), editedBy: A.current ? A.current.name : '' }); St.save(); toast(t('deleted')); render(); sendToStore([s.id]); } break; }
      case 'close-session': draft = null; render(); break;
      case 'record-missing': { const c = St.course(id); if (c && St.inScope(c)) { UI.groupId = c.groupId; UI.courseId = c.id; newDraft(c.id, null, el.dataset.date); UI.tab = 'attend'; render(); } break; }
      case 'cancel-session': if (confirm(t('unsaved'))) { draft = null; render(); } break;
      case 'save-session': saveDraftSession(); break;
      case 'all-present': draft.records = {}; render(); break;
      case 'cycle': draft.records[id] = cycle[draft.records[id] || 'P']; render(); break;
      case 'set-rec': draft.records[id] = el.dataset.v; render(); break;
      case 'note': { const v = prompt(t('excuseNote'), draft.notes[id] || ''); if (v !== null) { draft.notes[id] = v.trim(); render(); } break; }
      case 'add-course': if (edit) courseForm(); break;
      case 'edit-course': if (edit) courseForm(St.course(id)); break;
      case 'del-course': if (edit && confirm(t('confirmDeleteCourse'))) { St.deleteCourse(id); St.save(); toast(t('deleted')); render(); } break;
      case 'copy-term': if (edit) { const n = St.copyCoursesToTerm(UI.groupId, St.S.currentTerm, id); St.save(); toast(t('copied', { n })); } break;
      case 'add-group': if (edit) groupForm(); break;
      case 'edit-group': if (edit) groupForm(St.group(id)); break;
      case 'del-group': if (edit && confirm(t('confirmDeleteGroup'))) { St.deleteGroup(id); UI.groupId = ''; St.save(); toast(t('deleted')); render(); } break;
      case 'add-student': if (edit) studentForm(); break;
      case 'edit-student': if (edit) studentForm(St.student(id)); break;
      case 'del-student': if (edit && confirm(t('confirmDeleteStudent'))) { St.deleteStudent(id); St.save(); toast(t('deleted')); render(); } break;
      case 'import-students': if (edit) importForm(); break;
      case 'rtab': UI.reportTab = id; render(); break;
      case 'rlang': UI.reportLang = el.dataset.v; render(); break;
      case 'print': if (lastReport.html) { R.printHTML(lastReport.html); if (R.isNative()) toast(t('printNative')); } break;
      case 'csv': if (lastReport.csv) R.deliver(lastReport.name.replace(/[\\/:*?"<>|]+/g, '_') + '.csv', lastReport.csv, 'text/csv;charset=utf-8'); break;
      case 'send': sendCurrentReport(); break;
      case 'share': shareCurrentReport(); break;
      case 'cloud-sync': { toast(t('cloudSending')); const r = await Cloud.sync(); const p = r.pull || {}; toast(r.flush && r.flush.error ? t('cloudError', { e: r.flush.error }) : p.error ? t('cloudError', { e: p.error }) : t('cloudSynced', { a: p.added || 0, u: p.updated || 0 })); render(); break; }
      case 'cloud-full': { if (!confirm(t('cloudFullConfirm'))) break; Cloud.resetPull(); const p = await Cloud.pull(true); toast(p && p.error ? t('cloudError', { e: p.error }) : t('cloudSynced', { a: (p && p.added) || 0, u: (p && p.updated) || 0 })); render(); break; }
      case 'cloud-test': { const r = await Cloud.ping(); toast(r.ok ? t('cloudOk', { n: r.name, d: storeName() }) : t('cloudError', { e: r.error })); break; }
      case 'send-my-data': if (A.current && Cloud.enabled()) { const f = await Cloud.flush(); toast(f && f.error ? t('cloudError', { e: f.error }) : t('cloudSaved', { d: storeName() })); render(); break; }
      if (A.current) { await R.deliver(`absences_data_${St.todayStr()}.json`, St.exportAbsences(A.current.courses || [], A.current.name), 'application/json'); UI.lastSentAt = Date.now(); St.saveUI(); render(); } break;
      case 'open-missing': UI.tab = 'reports'; UI.reportTab = 'missing'; render(); break;
      case 'xls-import': { const c = St.course(UI.courseId); if (c && St.inScope(c)) xlsImportForm(c); break; }
      case 'xls-template': { const c = St.course(UI.courseId); if (c && St.inScope(c)) xlsTemplateDownload(c); break; }
      case 'add-recipient': if (A.can('committee')) recipientForm(); break;
      case 'edit-recipient': if (A.can('committee')) recipientForm((CFG.recipients || []).find((r) => r.id === id)); break;
      case 'del-recipient': if (A.can('committee') && confirm(t('confirmDeleteRecipient'))) { applyCfg({ recipients: (CFG.recipients || []).filter((r) => r.id !== id) }); toast(t('deleted')); render(); } break;
      case 'committee-form': if (A.can('committee')) committeeForm(); break;
      case 'dept-form': if (admin) deptForm(); break;
      case 'export-dept': if (A.can('exportDept')) R.deliver('department.js', St.departmentFile(), 'text/javascript'); break;
      case 'accounts-view': if (A.can('accounts')) { UI.adminView = 'accounts'; render(); } break;
      case 'accounts-back': UI.adminView = ''; render(); break;
      case 'add-account': if (A.can('accounts')) accountForm(); break;
      case 'edit-account': if (A.can('accounts')) accountForm(St.accounts().find((a) => a.id === id)); break;
      case 'pw-account': if (A.can('accounts')) newPasswordFor(id); break;
      case 'del-account': { const acc = St.accounts().find((a) => a.id === id); if (!A.can('accounts') || !acc || !canManage(acc) || (A.current && acc.id === A.current.id)) break; if (!confirm(t('confirmDeleteAccount'))) break; const list = St.accounts().filter((a) => a.id !== id); if (!list.some((a) => A.normRole(a.role) === 'admin' && a.hash)) { toast(t('needMaster')); break; } St.saveDraft({ accounts: list }); delete newPasswords[id]; render(); break; }
      case 'auto-accounts': if (A.can('accounts')) autoAccounts(); break;
      case 'cred-sheet': if (A.can('accounts')) credentialsSheet(); break;
      case 'acc-auto': { const name = $('#f-acc-name').value.trim(); if (!name) break; document.querySelectorAll('.f-acc-c').forEach((x) => { const c = St.course(x.value); if (c && N.teaches(name, c)) { x.checked = true; x.closest('details').open = true; } }); break; }
      case 'add-year': if (A.can('years')) yearForm(); break;
      case 'edit-year': if (A.can('years')) yearForm(St.S.years.find((y) => y.id === id)); break;
      case 'del-year': if (A.can('years') && confirm(t('confirmDeleteYear'))) { St.deleteYear(id); St.save(); toast(t('deleted')); render(); } break;
      case 'add-event-row': { const box = $('#f-events'); box.insertAdjacentHTML('beforeend', `<div class="row"><input type="text" placeholder="عربي" dir="rtl"><input type="text" placeholder="English" dir="ltr"><input type="date" class="fix" style="flex:0 0 140px"><input type="date" class="fix" style="flex:0 0 140px"></div>`); break; }
      case 'export-json': if (A.can('backup')) R.deliver(`${CFG.appId}_backup_${St.todayStr()}.json`, St.exportJSON(), 'application/json'); else R.deliver(`absences_data_${St.todayStr()}.json`, St.exportAbsences((A.current && A.current.courses) || [], A.current ? A.current.name : ''), 'application/json'); break;
      case 'reset-seed': if (admin && confirm(t('confirmReset'))) { St.resetToSeed(); UI.groupId = ''; UI.courseId = ''; render(); } break;
      case 'install': if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; render(); } break;
      case 'lock-now': A.signOut(); draft = null; UI.adminView = ''; renderLock(); break;
      case 'modal-save': if (modalSave && modalSave() !== false) { closeModal(); render(); } break;
      case 'modal-close': closeModal(); break;
    }
  });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (UI.tab === 'settings' && A.current) render(); });

  // ================= SIGN-IN SCREEN =================
  function renderLock(error) {
    applyDir(); const ins = CFG.institution, o = CFG.owner;
    const accs = A.list();
    const admins = accs.filter((a) => a.role !== 'lecturer').sort((a, b) => accName(a).localeCompare(accName(b), 'ar'));
    const lects = accs.filter((a) => a.role === 'lecturer').sort((a, b) => accName(a).localeCompare(accName(b), 'ar'));
    const optg = (label, list) => (list.length ? `<optgroup label="${esc(label)}">${list.map((a) => opt(a.id, accName(a), a.id === UI.lastAccount)).join('')}</optgroup>` : '');
    $('#top').innerHTML = ''; $('#tabs').innerHTML = '';
    $('#view').innerHTML = `<div class="lock"><div class="card">
      <div class="lock-logos">${logosHTML()}</div>
      <h2 class="center">${esc(ins.department[L()])}</h2><div class="center muted">${esc(ins.college[L()])} — ${esc(ins.university[L()])}</div>
      <h3 class="center" style="margin-top:14px;justify-content:center">🔒 ${t('lockTitle')}</h3>
      <p class="muted small center">${t('lockHint')}</p>
      ${A.secure() ? '' : `<p class="small" style="color:var(--fail)">${t('needSecure')}</p>`}
      <form id="lock-form"><label class="f">${t('selectAccount')}</label><select id="f-acc">${optg(t('groupAdmin'), admins)}${optg(t('groupLecturers'), lects)}</select>
      <label class="f">${t('password')}</label><input type="password" id="f-code" autocomplete="current-password" autocapitalize="none" dir="ltr">
      <label class="row" id="f-rem-wrap" style="gap:8px;margin-top:8px;${A.canRemember(A.byId(UI.lastAccount) || accs[0]) ? '' : 'display:none'}"><input type="checkbox" id="f-remember" class="fix"><span class="small">${t('rememberDevice', { n: CFG.access.rememberDays })}</span></label>
      ${error === 'idle' ? `<p class="small" style="color:var(--warn2)">🔒 ${t('idleLocked', { n: CFG.access.idleLockMinutes })}</p>` : error ? `<p class="small" style="color:var(--fail)">${t('wrongPassword')}</p>` : ''}
      <div class="toolbar"><button class="btn primary block" type="submit">${t('signIn')}</button></div></form>
      <div class="center"><button class="btn sm ghost" data-act="toggle-lang-lock">${lang() === 'ar' ? 'English' : 'عربي'}</button> <a class="btn sm ghost" href="help.html?lang=${lang()}">📖 ${t('userGuide')}</a></div>
      <p class="credit">${esc(o.role[L()])}: ${esc(o.name[L()])} · <a href="mailto:${esc(o.email)}" dir="ltr">${esc(o.email)}</a> · <span dir="ltr">${esc(o.phone)}</span></p></div></div>`;
    setTimeout(() => { const i = $('#f-code'); if (i) i.focus(); }, 50);
  }
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'lock-form') return; e.preventDefault();
    const id = $('#f-acc').value, pw = $('#f-code').value, rem = $('#f-remember');
    const btn = e.target.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
    const ok = await A.signIn(id, pw, !!(rem && rem.checked));
    if (ok) { UI.lastAccount = id; UI.tab = 'attend'; UI.groupId = ''; UI.courseId = ''; St.saveUI(); render(); lastAuto = 0; setTimeout(autoSync, 500); } else renderLock(true);
  });

  // ---- storage destination (Google Drive / college data centre / another data centre) ----
  const PROVIDERS = ['none', 'gdrive', 'college', 'server'];
  function storeName() { const c = CFG.cloud || {}; return c.label || t('prov_' + (c.provider || (c.url ? 'gdrive' : 'none'))); }
  function sendToStore(ids) { if (!Cloud.configured()) return; Cloud.queue(ids); Cloud.flush().then(() => { const el = document.getElementById('cloud-line'); if (el) el.outerHTML = cloudLine(); }); }
  function cloudLine() {
    const s = Cloud.status();
    const st = s.lastError ? `⚠️ ${t('cloudError', { e: esc(s.lastError) })}` : s.pending ? `⏳ ${t('cloudPending', { n: s.pending })}` : `✅ ${t('cloudUpToDate')}`;
    return `<span id="cloud-line" class="small">${st}${s.lastPull ? ' · ' + t('cloudLastPull', { t: fmtDT(s.lastPull) }) : ''}</span>`;
  }
  function cloudCard() {
    if (!Cloud.enabled()) return '';
    return `<div class="card cloud row"><span>☁️ <b>${esc(storeName())}</b> · ${cloudLine()}</span><button class="btn sm fix" data-act="cloud-sync">🔄 ${t('cloudSync')}</button></div>`;
  }
  function storageSettingsCard() {
    if (!Cloud.configured()) return A.can('admin') ? `<div class="card"><h3>☁️ ${t('storeTitle')}</h3><p class="muted small">${t('cloudNotSet')}</p></div>` : '';
    const s = Cloud.status();
    return `<div class="card"><h3>☁️ ${t('storeTitle')}: ${esc(storeName())}</h3>
      <p class="small">${cloudLine()}${s.lastSent ? ' · ' + t('cloudLastSent', { t: fmtDT(s.lastSent) }) : ''}</p>
      <p class="muted small">${t(isLecturer() ? 'cloudHintLect' : 'cloudHintHead', { d: esc(storeName()) })}</p>
      <div class="toolbar"><button class="btn primary" data-act="cloud-sync">🔄 ${t('cloudSync')}</button><button class="btn" data-act="cloud-test">🔌 ${t('cloudTest')}</button>${A.can('allCourses') ? `<button class="btn" data-act="cloud-full">⬇ ${t('cloudFull')}</button>` : ''}</div></div>`;
  }
  let lastAuto = 0;
  async function autoSync() {
    if (!Cloud.enabled() || !navigator.onLine) return;
    if (Date.now() - lastAuto < 120000) return; lastAuto = Date.now();
    const r = await Cloud.sync();
    if (r && r.pull && (r.pull.added || r.pull.updated) && !draft && !document.getElementById('modal').classList.contains('open')) render();
    else { const el = document.getElementById('cloud-line'); if (el) el.outerHTML = cloudLine(); }
  }
  setInterval(autoSync, 180000);
  window.addEventListener('online', () => { lastAuto = 0; autoSync(); });

  // Auto-lock: sessions that are not remembered lock after idleLockMinutes without use
  let lastTouch = 0;
  const activity = () => { if (!A.current) return; const n = Date.now(); if (n - lastTouch > 15000) { lastTouch = n; A.touch(); } };
  ['click', 'keydown', 'touchstart', 'scroll', 'input'].forEach((ev) => document.addEventListener(ev, activity, { passive: true }));
  const idleCheck = () => { if (A.current && A.idleExpired()) { A.signOut(); draft = null; UI.adminView = ''; closeModal(); renderLock('idle'); } };
  setInterval(idleCheck, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') idleCheck(); });

  window.UI = { render, toast, t, lock: () => { A.signOut(); renderLock(); } };
  A.restore(); render(); setTimeout(autoSync, 1500);
})();
