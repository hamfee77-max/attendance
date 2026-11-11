// ============================================================================
//  REPORTS: period memo, course / student / overview / register reports,
//  CSV export, print. Every report can be produced in Arabic or English.
// ============================================================================
(function () {
  const St = window.Store, CFG = St.CFG, I = window.I18N;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tr = (k, lang, p) => { let s = (I[k] || [k, k])[lang === 'ar' ? 0 : 1]; if (p) for (const x in p) s = s.split('{' + x + '}').join(p[x]); return s; };
  const pick = (pair, lang) => Array.isArray(pair) ? pair[lang === 'ar' ? 0 : 1] : pair;
  const fmt1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  const fmtH = (n) => (Number.isInteger(n) ? String(n) : fmt1(n));
  const dmy = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
  const courseName = (c, lang) => (lang === 'en' && c.nameEn ? c.nameEn : c.nameAr);
  const groupName = (g, lang) => (g ? (lang === 'en' && g.nameEn ? g.nameEn : g.nameAr) : '');
  const termName = (id, lang) => { const t = CFG.terms.find((x) => x[0] === id); return t ? (lang === 'ar' ? t[1] : t[2]) : id; };
  const statusLabel = (st, lang) => tr({ ok: 'stOk', warn1: 'stWarn1', warn2: 'stWarn2', fail: 'stFail' }[st], lang);
  const actionLabel = (st, lang) => tr({ ok: 'actOk', warn1: 'actWarn1', warn2: 'actWarn2', fail: 'actFail' }[st], lang);
  const dayName = (iso, lang) => { const d = new Date(iso + 'T00:00:00'); return tr('dayNames', lang).split(',')[d.getDay()]; };

  function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); const p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
  function periodRange(type, date, from, to) {
    const t = St.term();
    if (type === 'day') return { from: date, to: date };
    if (type === 'week') { const d = new Date(date + 'T00:00:00'); const off = (d.getDay() - CFG.weekStartsOn + 7) % 7; const s = addDays(date, -off); return { from: s, to: addDays(s, 6) }; }
    if (type === 'month') { const [y, m] = date.split('-'); const last = new Date(Number(y), Number(m), 0).getDate(); return { from: `${y}-${m}-01`, to: `${y}-${m}-${String(last).padStart(2, '0')}` }; }
    if (type === 'term') return { from: t ? t.start : '', to: t ? t.end : '' };
    return { from: from || '', to: to || '' };
  }

  // Department logo: prefer logos/department.png when the file exists, else the configured file (SVG)
  const deptLogoSrc = () => (window.__deptPng === false ? CFG.logos.department : 'logos/department.png');

  // ---------- shared header for printed documents ----------
  function headerHTML(lang) {
    const ins = CFG.institution, lg = CFG.logos;
    const img = (src, cls) => (src ? `<img class="lg ${cls}" src="${src}" alt="">` : '<span class="lg"></span>');
    const dept = lg.department ? `<img class="lg dept" src="${deptLogoSrc()}" alt="" onerror="window.__deptPng=false;this.onerror=null;this.src='${lg.department}'">` : '';
    return `<div class="doc-head">
      <div class="side ar">${img(lg.university, 'uni')}<div><div>${esc(ins.university[0])}</div><div>${esc(ins.college[0])}</div><div>${esc(ins.department[0])}</div></div></div>
      <div class="mid">${dept}</div>
      <div class="side en">${img(lg.college, 'col')}<div><div>${esc(ins.university[1])}</div><div>${esc(ins.college[1])}</div><div>${esc(ins.department[1])}</div></div></div>
    </div>`;
  }
  function footerHTML(lang) {
    const me = St.S.settings.lecturer;
    return `<div class="doc-foot">
      <div><b>${tr('preparedBy', lang)}:</b> ${esc(me || '....................')}</div>
      <div><b>${tr('signature', lang)}:</b> ....................</div>
      <div><b>${tr('printedOn', lang)}:</b> ${dmy(St.todayStr())}</div>
    </div>`;
  }
  const rangeText = (r, lang) => `${dmy(r.from)} – ${dmy(r.to)}`;

  // ---------- period memo ----------
  function memoData(opts) {
    const g = St.group(opts.groupId);
    let courses = St.coursesFor(opts.groupId).filter((c) => !opts.mine || St.isMine(c));
    if (opts.courseId) courses = courses.filter((c) => c.id === opts.courseId);
    const students = St.studentsOf(opts.groupId);
    const rows = students.map((s) => ({ s, agg: St.studentAggregate(courses, s.id, opts.range) }));
    const summary = { n: rows.length, ok: 0, w1: 0, w2: 0, f: 0 };
    for (const r of rows) summary[{ ok: 'ok', warn1: 'w1', warn2: 'w2', fail: 'f' }[r.agg.worst]]++;
    const lectures = [];
    for (const c of courses) for (const se of St.sessionsOf(c.id)) if ((!opts.range.from || se.date >= opts.range.from) && (!opts.range.to || se.date <= opts.range.to)) lectures.push({ c, se });
    lectures.sort((a, b) => a.se.date.localeCompare(b.se.date));
    return { g, courses, rows, summary, lectures, range: opts.range, periodType: opts.periodType };
  }

  function memoHTML(d, lang) {
    const S = St.S.settings, dir = lang === 'ar' ? 'rtl' : 'ltr';
    const one = d.courses.length === 1 ? d.courses[0] : null;
    const courseTxt = one ? `${tr('inCourse', lang)} «${courseName(one, lang)}»` : tr('allCoursesOf', lang);
    const body = tr('memoBody', lang, { group: groupName(d.g, lang), course: courseTxt, from: dmy(d.range.from), to: dmy(d.range.to), period: tr({ day: 'pDay', week: 'pWeek', month: 'pMonth', term: 'pTerm', custom: 'pCustom' }[d.periodType] || 'pCustom', lang), ref: pick(CFG.rules.regulationRef, lang), failU: S.failUnexcused, failT: S.failTotal, warn1: S.warn1, warn2: S.warn2 });
    let rowsHtml = d.rows.map((r, i) => {
      const a = r.agg; const wc = a.worstCourse;
      return `<tr class="st-${a.worst}"><td>${i + 1}</td><td class="name">${esc(r.s.name)}</td><td>${a.absentDays}</td><td>${fmtH(a.absentH)}</td><td>${fmtH(a.excusedH)}</td>
        <td>${fmtH(a.cumAbsentH)} / ${fmtH(a.planned)}</td><td>${fmt1(a.pctU)}%</td><td>${fmt1(a.pctT)}%</td>
        ${one ? '' : `<td>${wc ? esc(courseName(wc, lang)) : ''}</td>`}<td><b>${statusLabel(a.worst, lang)}</b></td><td>${actionLabel(a.worst, lang)}</td></tr>`;
    }).join('');
    const detail = [];
    for (const r of d.rows) for (const { course: c, st } of r.agg.rows) if (st.absentSessions > 0) detail.push(`<tr class="st-${st.status}"><td class="name">${esc(r.s.name)}</td><td>${esc(courseName(c, lang))}</td><td>${st.absentDays + st.excusedDays}</td><td>${fmtH(st.absentH)}</td><td>${fmtH(st.excusedH)}</td><td>${fmtH(st.cumAbsentH)} / ${fmtH(st.planned)}</td><td>${fmt1(st.pctU)}%</td><td>${fmt1(st.pctT)}%</td><td>${statusLabel(st.status, lang)}</td></tr>`);
    const lect = d.lectures.map((l) => `<tr><td>${dmy(l.se.date)}</td><td>${dayName(l.se.date, lang)}</td><td>${esc(courseName(l.c, lang))}</td><td>${fmtH(l.se.hours)}</td><td>${Object.values(l.se.records || {}).filter((v) => v === 'A' || v === 'E').length}</td><td>${esc(l.se.topic || '')}</td></tr>`).join('');
    return `<div class="doc" dir="${dir}" lang="${lang}">${headerHTML(lang)}
      <div class="doc-meta"><span>${tr('year', lang)}: ${esc(St.year().name)}</span><span>${termName(St.S.currentTerm, lang)}</span><span>${tr('date', lang)}: ${dmy(St.todayStr())}</span></div>
      <p class="to">${tr('memoTo', lang, { head: pick(CFG.institution.headTitle, lang) })}</p>
      <p class="subj"><b>${tr('memoSubject', lang)}</b> — ${esc(groupName(d.g, lang))}${one ? ' — ' + esc(courseName(one, lang)) : ''} — ${rangeText(d.range, lang)}</p>
      <p>${tr('memoGreeting', lang)}</p>
      <p class="body">${body}</p>
      ${d.rows.length ? `<table class="rep"><thead><tr><th>${tr('n', lang)}</th><th>${tr('student', lang)}</th><th>${tr('absentDays', lang)}</th><th>${tr('absentH', lang)}</th><th>${tr('excusedH', lang)}</th><th>${tr('overall', lang)} (${tr('absentH', lang)} / ${tr('plannedHours', lang)})</th><th>${tr('pctU', lang)}</th><th>${tr('pctT', lang)}</th>${one ? '' : `<th>${tr('worstCourse', lang)}</th>`}<th>${tr('status', lang)}</th><th>${tr('action', lang)}</th></tr></thead><tbody>${rowsHtml}</tbody></table>` : `<p>${tr('nothingToShow', lang)}</p>`}
      <p class="sum"><b>${tr('memoSummary', lang, d.summary)}</b></p>
      <p class="small">${tr('legend', lang)}</p>
      ${detail.length ? `<h4>${tr('detailTitle', lang)} ${rangeText(d.range, lang)}</h4><table class="rep small"><thead><tr><th>${tr('student', lang)}</th><th>${tr('course', lang)}</th><th>${tr('absentDays', lang)}</th><th>${tr('absentH', lang)}</th><th>${tr('excusedH', lang)}</th><th>${tr('overall', lang)}</th><th>${tr('pctU', lang)}</th><th>${tr('pctT', lang)}</th><th>${tr('status', lang)}</th></tr></thead><tbody>${detail.join('')}</tbody></table>` : `<p class="small">${tr('noAbsenceInPeriod', lang)}</p>`}
      ${lect ? `<h4>${tr('lecturesInPeriod', lang)}</h4><table class="rep small"><thead><tr><th>${tr('date', lang)}</th><th>${tr('today', lang) === 'اليوم' ? 'اليوم' : 'Day'}</th><th>${tr('course', lang)}</th><th>${tr('hours', lang)}</th><th>${tr('absentCount', lang)}</th><th>${tr('topic', lang)}</th></tr></thead><tbody>${lect}</tbody></table>` : `<p class="small">${tr('memoNoLectures', lang)}</p>`}
      <p>${tr('memoClose', lang)}</p>
      ${footerHTML(lang)}</div>`;
  }
  function memoCSV(d, lang) {
    const one = d.courses.length === 1;
    const head = [tr('n', lang), tr('student', lang), tr('absentDays', lang), tr('absentH', lang), tr('excusedH', lang), tr('absentH', lang) + ' (' + tr('overall', lang) + ')', tr('plannedHours', lang), tr('pctU', lang), tr('pctT', lang)].concat(one ? [] : [tr('worstCourse', lang)]).concat([tr('status', lang), tr('action', lang)]);
    const rows = d.rows.map((r, i) => { const a = r.agg; return [i + 1, r.s.name, a.absentDays, a.absentH, a.excusedH, a.cumAbsentH, a.planned, fmt1(a.pctU), fmt1(a.pctT)].concat(one ? [] : [a.worstCourse ? courseName(a.worstCourse, lang) : '']).concat([statusLabel(a.worst, lang), actionLabel(a.worst, lang)]); });
    return toCSV([head].concat(rows));
  }

  // ---------- course report ----------
  function courseTable(c, lang, opts) {
    const students = St.studentsOf(c.groupId);
    const rows = students.map((s) => ({ s, st: St.courseStats(c, s.id) }));
    const t = St.termOf(c.termId) || {};
    const held = St.sessionsOf(c.id).reduce((a, s) => a + (Number(s.hours) || 0), 0);
    const info = `<div class="doc-meta"><span>${tr('course', lang)}: <b>${esc(courseName(c, lang))}</b></span><span>${tr('group', lang)}: ${esc(groupName(St.group(c.groupId), lang))}</span><span>${tr('lecturer', lang)}: ${esc(c.lecturer || '')}</span><span>${termName(c.termId, lang)} ${esc(St.year().name)}</span><span>${tr('plannedHours', lang)}: ${c.weeklyHours} × ${t.weeks || CFG.rules.weeksPerTerm} = ${fmtH((c.weeklyHours || 0) * (t.weeks || CFG.rules.weeksPerTerm))}</span><span>${tr('heldHours', lang)}: ${fmtH(held)}</span></div>`;
    const body = rows.map((r, i) => `<tr class="st-${r.st.status}"><td>${i + 1}</td><td class="name">${esc(r.s.name)}</td><td>${r.st.absentDays}</td><td>${fmtH(r.st.absentH)}</td><td>${fmtH(r.st.excusedH)}</td><td>${r.st.late}</td><td>${fmt1(r.st.pctU)}%</td><td>${fmt1(r.st.pctT)}%</td><td><b>${statusLabel(r.st.status, lang)}</b></td><td>${actionLabel(r.st.status, lang)}</td></tr>`).join('');
    const html = `<div class="doc" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">${headerHTML(lang)}<h3>${tr('repCourse', lang)}</h3>${info}
      <table class="rep"><thead><tr><th>${tr('n', lang)}</th><th>${tr('student', lang)}</th><th>${tr('absentDays', lang)}</th><th>${tr('absentH', lang)}</th><th>${tr('excusedH', lang)}</th><th>${tr('lateN', lang)}</th><th>${tr('pctU', lang)}</th><th>${tr('pctT', lang)}</th><th>${tr('status', lang)}</th><th>${tr('action', lang)}</th></tr></thead><tbody>${body}</tbody></table>
      <p class="small">${tr('legend', lang)}</p>${footerHTML(lang)}</div>`;
    const csv = toCSV([[tr('n', lang), tr('student', lang), tr('absentDays', lang), tr('absentH', lang), tr('excusedH', lang), tr('lateN', lang), tr('plannedHours', lang), tr('pctU', lang), tr('pctT', lang), tr('status', lang)]].concat(rows.map((r, i) => [i + 1, r.s.name, r.st.absentDays, r.st.absentH, r.st.excusedH, r.st.late, r.st.planned, fmt1(r.st.pctU), fmt1(r.st.pctT), statusLabel(r.st.status, lang)])));
    return { html, csv, rows };
  }

  // ---------- student report ----------
  function studentReport(sid, lang) {
    const s = St.student(sid); const g = St.group(s.groupId);
    const courses = St.coursesFor(s.groupId);
    const agg = St.studentAggregate(courses, sid);
    const body = agg.rows.map(({ course: c, st }, i) => `<tr class="st-${st.status}"><td>${i + 1}</td><td class="name">${esc(courseName(c, lang))}</td><td>${esc(c.lecturer || '')}</td><td>${fmtH(st.planned)}</td><td>${fmtH(st.cumHeld)}</td><td>${st.absentDays}</td><td>${fmtH(st.absentH)}</td><td>${fmtH(st.excusedH)}</td><td>${fmt1(st.pctU)}%</td><td>${fmt1(st.pctT)}%</td><td><b>${statusLabel(st.status, lang)}</b></td></tr>`).join('');
    const html = `<div class="doc" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">${headerHTML(lang)}<h3>${tr('repStudent', lang)}</h3>
      <div class="doc-meta"><span>${tr('student', lang)}: <b>${esc(s.name)}</b></span>${s.sid ? `<span>${tr('studentId', lang)}: ${esc(s.sid)}</span>` : ''}<span>${tr('group', lang)}: ${esc(groupName(g, lang))}</span><span>${termName(St.S.currentTerm, lang)} ${esc(St.year().name)}</span></div>
      <table class="rep"><thead><tr><th>${tr('n', lang)}</th><th>${tr('course', lang)}</th><th>${tr('lecturer', lang)}</th><th>${tr('plannedHours', lang)}</th><th>${tr('held', lang)}</th><th>${tr('absentDays', lang)}</th><th>${tr('absentH', lang)}</th><th>${tr('excusedH', lang)}</th><th>${tr('pctU', lang)}</th><th>${tr('pctT', lang)}</th><th>${tr('status', lang)}</th></tr></thead>
      <tbody>${body}</tbody><tfoot><tr><td></td><td><b>${tr('total', lang)}</b></td><td></td><td>${fmtH(agg.planned)}</td><td>${fmtH(agg.cumHeld)}</td><td>${agg.absentDays}</td><td>${fmtH(agg.cumAbsentH)}</td><td>${fmtH(agg.cumExcusedH)}</td><td>${fmt1(agg.pctU)}%</td><td>${fmt1(agg.pctT)}%</td><td><b>${statusLabel(agg.worst, lang)}</b></td></tr></tfoot></table>
      <p class="small">${tr('legend', lang)}</p>${footerHTML(lang)}</div>`;
    const csv = toCSV([[tr('course', lang), tr('lecturer', lang), tr('plannedHours', lang), tr('held', lang), tr('absentDays', lang), tr('absentH', lang), tr('excusedH', lang), tr('pctU', lang), tr('pctT', lang), tr('status', lang)]].concat(agg.rows.map(({ course: c, st }) => [courseName(c, lang), c.lecturer || '', st.planned, st.cumHeld, st.absentDays, st.absentH, st.excusedH, fmt1(st.pctU), fmt1(st.pctT), statusLabel(st.status, lang)])));
    return { html, csv, agg };
  }

  // ---------- group overview (matrix) ----------
  function overview(gid, lang, mine) {
    const g = St.group(gid); const courses = St.coursesFor(gid).filter((c) => !mine || St.isMine(c));
    const students = St.studentsOf(gid);
    const head = courses.map((c) => `<th class="rot"><div>${esc(courseName(c, lang))}</div></th>`).join('');
    const body = students.map((s, i) => { const agg = St.studentAggregate(courses, s.id); return `<tr><td>${i + 1}</td><td class="name">${esc(s.name)}</td>${agg.rows.map(({ st }) => `<td class="st-${st.status}">${st.cumAbsentH ? fmt1(st.pctU) : ''}</td>`).join('')}<td class="st-${agg.worst}"><b>${statusLabel(agg.worst, lang)}</b></td></tr>`; }).join('');
    const html = `<div class="doc wide" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">${headerHTML(lang)}<h3>${tr('repGroup', lang)} — ${esc(groupName(g, lang))} — ${termName(St.S.currentTerm, lang)} ${esc(St.year().name)}</h3>
      <table class="rep small"><thead><tr><th>${tr('n', lang)}</th><th>${tr('student', lang)}</th>${head}<th>${tr('status', lang)}</th></tr></thead><tbody>${body}</tbody></table><p class="small">${tr('overviewHint', lang)}</p>${footerHTML(lang)}</div>`;
    const csv = toCSV([[tr('n', lang), tr('student', lang)].concat(courses.map((c) => courseName(c, lang))).concat([tr('status', lang)])].concat(students.map((s, i) => { const agg = St.studentAggregate(courses, s.id); return [i + 1, s.name].concat(agg.rows.map(({ st }) => fmt1(st.pctU))).concat([statusLabel(agg.worst, lang)]); })));
    return { html, csv };
  }

  // ---------- attendance register (dates × students), like the department's paper form ----------
  function register(cid, lang) {
    const c = St.course(cid); const g = St.group(c.groupId); const sess = St.sessionsOf(cid); const students = St.studentsOf(c.groupId);
    const mark = { A: tr('absentShort', lang), E: tr('excusedShort', lang), L: tr('lateShort', lang) };
    const head = sess.map((s) => `<th class="rot"><div>${dmy(s.date)} (${fmtH(s.hours)})</div></th>`).join('');
    const body = students.map((s, i) => { const st = St.courseStats(c, s.id); return `<tr><td>${i + 1}</td><td class="name">${esc(s.name)}</td>${sess.map((se) => { const r = (se.records || {})[s.id]; return `<td class="m-${r || 'P'}">${mark[r] || ''}</td>`; }).join('')}<td>${fmtH(st.cumAbsentH)}</td><td>${fmtH(st.cumExcusedH)}</td><td class="st-${st.status}">${fmt1(st.pctU)}%</td></tr>`; }).join('');
    const html = `<div class="doc wide" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">${headerHTML(lang)}<h3>${tr('repRegister', lang)}</h3>
      <div class="doc-meta"><span>${tr('course', lang)}: <b>${esc(courseName(c, lang))}</b></span><span>${tr('group', lang)}: ${esc(groupName(g, lang))}</span><span>${tr('lecturer', lang)}: ${esc(c.lecturer || '')}</span><span>${termName(c.termId, lang)} ${esc(St.year().name)}</span></div>
      <table class="rep small reg"><thead><tr><th>${tr('n', lang)}</th><th>${tr('student', lang)}</th>${head}<th>${tr('absentH', lang)}</th><th>${tr('excusedH', lang)}</th><th>${tr('pctU', lang)}</th></tr></thead><tbody>${body}</tbody></table>
      <p class="small">${tr('registerHint', lang)} ${mark.A} = ${tr('absent', lang)}, ${mark.E} = ${tr('excused', lang)}, ${mark.L} = ${tr('late', lang)}.</p>${footerHTML(lang)}</div>`;
    const csv = toCSV([[tr('n', lang), tr('student', lang)].concat(sess.map((s) => s.date)).concat([tr('absentH', lang), tr('excusedH', lang), tr('pctU', lang)])].concat(students.map((s, i) => { const st = St.courseStats(c, s.id); return [i + 1, s.name].concat(sess.map((se) => { const r = (se.records || {})[s.id]; return r && r !== 'P' ? r : ''; })).concat([st.cumAbsentH, st.cumExcusedH, fmt1(st.pctU)]); })));
    return { html, csv };
  }

  // Plain-text summary of a memo for email / chat bodies
  function memoText(d, lang) {
    const S = St.S.settings; const one = d.courses.length === 1 ? d.courses[0] : null;
    const lines = [tr('memoSubject', lang) + ' — ' + groupName(d.g, lang) + (one ? ' — ' + courseName(one, lang) : '') + ' — ' + rangeText(d.range, lang), tr('memoSummary', lang, d.summary), ''];
    for (const r of d.rows) if (r.agg.worst !== 'ok') lines.push(`• ${r.s.name}: ${fmt1(r.agg.pctU)}% (${statusLabel(r.agg.worst, lang)}) — ${actionLabel(r.agg.worst, lang)}`);
    lines.push('', `${tr('preparedBy', lang)}: ${S.lecturer || ''}`, `${tr('date', lang)}: ${dmy(St.todayStr())}`);
    return lines.join('\n');
  }
  // Send a report: share files through the device share sheet, else download + open mail
  async function sendReport(name, html, csv, text, recipients) {
    const emails = recipients.map((r) => r.email).filter(Boolean);
    const page = await fullPage(name, html);
    const subject = text.split('\n')[0];
    if (isNative()) {
      try { await nativeShare([{ name: name + '.html', blob: new Blob([page], { type: 'text/html' }) }, { name: name + '.csv', blob: new Blob([csv], { type: 'text/csv' }) }], subject, text); return 'shared'; }
      catch (e) { return 'cancelled'; }
    }
    const files = [new File([page], name + '.html', { type: 'text/html' }), new File([csv], name + '.csv', { type: 'text/csv' })];
    try {
      if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files, title: subject, text }); return 'shared'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    await deliver(name + '.html', page, 'text/html'); await deliver(name + '.csv', csv, 'text/csv;charset=utf-8');
    window.location.href = `mailto:${encodeURIComponent(emails.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return 'mail';
  }
  function docCSS() {
    let css = ''; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (/\.doc|table\.rep|\.st-|\.m-/.test(r.cssText)) css += r.cssText + '\n'; } catch (e) { /* ignore */ } }
    return ':root{--line:#dbe3ee;--fail:#c62828;--warn2:#e8702a}body{font-family:Segoe UI,Tahoma,sans-serif;margin:16px}' + css;
  }

  // ---------- utilities ----------
  function toCSV(rows) { return '﻿' + rows.map((r) => r.map((v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n'); }
  // ---------- native (Android app) helpers: the WebView has no downloads, print or Web Share ----------
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  function safeName(n) {
    const m = n.match(/(\.[A-Za-z0-9]+)$/); const ext = m ? m[1] : '';
    const base = n.slice(0, n.length - ext.length).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    return (base || 'report') + '_' + Date.now().toString(36) + ext;
  }
  const readAs = (blob, how) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r[how](blob); });
  async function nativeShare(files, title, text) {
    const P = window.Capacitor.Plugins; const uris = [];
    for (const f of files) {
      const data = (await readAs(f.blob, 'readAsDataURL')).split(',')[1] || '';
      const w = await P.Filesystem.writeFile({ path: safeName(f.name), data, directory: 'CACHE' });
      uris.push(w.uri);
    }
    await P.Share.share({ title, text: text || title, files: uris, dialogTitle: title });
  }
  async function inlineImages(html) {
    const srcs = [...new Set([...html.matchAll(/src="(logos\/[^"]+)"/g)].map((m) => m[1]))];
    for (const s of srcs) {
      let data = null;
      for (const u of [s, CFG.logos.department]) {
        try { const r = await fetch(u); if (r.ok) { data = await readAs(await r.blob(), 'readAsDataURL'); break; } } catch (e) { /* try next */ }
        if (!/department\.png$/.test(s)) break;
      }
      if (data) html = html.split(`src="${s}"`).join(`src="${data}"`);
    }
    return html.replace(/\sonerror="[^"]*"/g, '');
  }
  async function fullPage(name, html) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(name)}</title><style>${docCSS()}</style></head><body>${await inlineImages(html)}</body></html>`;
  }

  async function deliver(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    if (isNative()) { try { await nativeShare([{ name, blob }], name); } catch (e) { /* cancelled */ } return; }
    try {
      const file = new File([blob], name, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function printHTML(html) {
    if (isNative()) { await deliver('report.html', await fullPage('report', html), 'text/html'); return; }
    const area = document.getElementById('print-area'); area.innerHTML = html;
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { window.print(); setTimeout(done, 1500); }, 150);
  }

  window.Reports = { isNative, deptLogoSrc, memoText, sendReport, tr, esc, fmt1, fmtH, dmy, courseName, groupName, termName, statusLabel, actionLabel, dayName, periodRange, addDays, memoData, memoHTML, memoCSV, courseTable, studentReport, overview, register, toCSV, deliver, printHTML, headerHTML };
})();
