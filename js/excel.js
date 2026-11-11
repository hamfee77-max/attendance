// ============================================================================
//  EXCEL: import attendance / student lists from .xlsx .xls .csv, and
//  generate a ready-to-fill Excel template for a course.
//  Uses SheetJS (js/vendor/xlsx.full.min.js), loaded only when needed.
// ============================================================================
(function () {
  const St = window.Store, CFG = St.CFG;

  let loading = null;
  function load() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!loading) loading = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'js/vendor/xlsx.full.min.js';
      s.onload = () => res(window.XLSX); s.onerror = () => { loading = null; rej(new Error('xlsx load failed')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  // ---------- normalisation ----------
  const latin = (s) => String(s == null ? '' : s).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
  function norm(s) {
    return latin(s).replace(/[ً-ْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[*_.\-،,]/g, ' ').replace(/عبد\s+/g, 'عبد').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  const NAME_RE = /(^|\s)(الاسم|الاسماء|اسم|الطالب|اسم الطالب|name|names|student)(\s|$)/i;
  const ID_RE = /(الرقم الجامعي|رقم|الرقم|id|student id|code)/i;

  // ---------- dates ----------
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  function parseDate(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') {
      if (v < 36526 || v > 73051) return null;                     // 2000 .. 2100 as Excel serials
      const d = new Date(Math.round((v - 25569) * 86400000));
      return { date: iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()), hours: 0 };
    }
    let s = latin(v).trim(); let hours = 0;
    const h = s.match(/\((\d+(?:\.\d+)?)\)/); if (h) { hours = Number(h[1]); s = s.replace(h[0], '').trim(); }
    let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (m) return valid(+m[1], +m[2], +m[3], hours);
    m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/);
    if (m) {
      let a = +m[1], b = +m[2], y = +m[3]; if (y < 100) y += 2000;
      if (b > 12 && a <= 12) { const tmp = a; a = b; b = tmp; }      // looks like US mm/dd: swap
      return valid(y, b, a, hours);                                  // Iraqi convention dd/mm/yyyy
    }
    return null;
  }
  function valid(y, m, d, hours) {
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return null;
    return { date: iso(y, m, d), hours };
  }

  // ---------- status codes ----------
  const CODES = {
    A: ['a', 'abs', 'absent', 'x', 'غ', 'غا', 'غايب', 'غائب', 'غياب', '0', '✗', '✘'],
    E: ['e', 'exc', 'excused', 'ع', 'عذر', 'بعذر', 'مجاز', 'م', 'اجازه'],
    L: ['l', 'late', 'ت', 'متاخر', 'تاخير', 'تاخر'],
    P: ['p', 'present', '1', '✓', '√', '✔', 'ح', 'حاضر', 'حضور', 'v'],
  };
  const CODE_MAP = {}; for (const k in CODES) for (const v of CODES[k]) CODE_MAP[norm(v)] = k;
  function code(v) {
    const s = norm(v);
    if (!s) return { c: 'P', raw: '', known: true };
    if (CODE_MAP[s]) return { c: CODE_MAP[s], raw: String(v).trim(), known: true };
    return { c: 'P', raw: String(v).trim(), known: false };
  }

  // ---------- sheet analysis ----------
  function rowsOf(ws) { return window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }); }

  function findLayout(rows) {
    // header row = row (within the first 20) with the most date cells
    let hdr = -1, best = 0;
    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const n = rows[r].filter((v) => parseDate(v)).length;
      if (n > best) { best = n; hdr = r; }
    }
    const dates = [];
    if (hdr >= 0) rows[hdr].forEach((v, c) => { const d = parseDate(v); if (d) dates.push(Object.assign({ col: c }, d)); });
    const dateCols = new Set(dates.map((d) => d.col));
    // name / id columns: look in the header row and the 3 rows above it
    let nameCol = -1, idCol = -1;
    const from = hdr >= 0 ? Math.max(0, hdr - 3) : 0, to = hdr >= 0 ? hdr : Math.min(rows.length - 1, 10);
    for (let r = from; r <= to; r++) rows[r].forEach((v, c) => {
      if (dateCols.has(c) || typeof v !== 'string') return;
      if (nameCol < 0 && NAME_RE.test(norm(v))) nameCol = c;
      else if (idCol < 0 && ID_RE.test(norm(v)) && norm(v).length > 1) idCol = c;
    });
    const start = hdr >= 0 ? hdr + 1 : 0;
    if (nameCol < 0) {                                   // fallback: column with the most multi-word texts
      const score = {};
      for (let r = start; r < rows.length; r++) rows[r].forEach((v, c) => { if (!dateCols.has(c) && typeof v === 'string' && v.trim().split(/\s+/).length >= 2) score[c] = (score[c] || 0) + 1; });
      let bc = -1, bs = 0; for (const c in score) if (score[c] > bs) { bs = score[c]; bc = Number(c); }
      nameCol = bc;
    }
    if (idCol === nameCol) idCol = -1;
    return { hdr, start, dates, nameCol, idCol };
  }

  function matcher(students) {
    const byNorm = new Map(); const byId = new Map(); const used = new Set();
    for (const s of students) { byNorm.set(norm(s.name), s); if (s.sid) byId.set(norm(s.sid), s); }
    return function (name, id) {
      let s = (id && byId.get(norm(id))) || byNorm.get(norm(name));
      if (!s) {
        const n = norm(name);
        const cands = students.filter((x) => { const m = norm(x.name); return !used.has(x.id) && (m.startsWith(n + ' ') || n.startsWith(m + ' ')); });
        if (cands.length === 1) s = cands[0];
      }
      if (s && used.has(s.id)) return null;
      if (s) used.add(s.id);
      return s || null;
    };
  }

  // Parse an attendance sheet against the students of a stage
  function parseAttendance(ws, students) {
    const rows = rowsOf(ws); const L = findLayout(rows);
    if (!L.dates.length) return { error: 'noDates' };
    if (L.nameCol < 0) return { error: 'noNames' };
    const match = matcher(students);
    const out = { dates: L.dates, rows: [], unmatched: [], values: {}, absent: 0, excused: 0, late: 0 };
    for (let r = L.start; r < rows.length; r++) {
      const row = rows[r]; const name = String(row[L.nameCol] || '').trim();
      if (name.length < 3 || NAME_RE.test(norm(name)) || /^\d+$/.test(latin(name))) continue;
      const id = L.idCol >= 0 ? String(row[L.idCol] || '').trim() : '';
      const codes = L.dates.map((d) => {
        const k = code(row[d.col]);
        if (k.raw) { const key = k.raw + '|' + (k.known ? k.c : '?'); out.values[key] = (out.values[key] || 0) + 1; }
        if (k.c === 'A') out.absent++; else if (k.c === 'E') out.excused++; else if (k.c === 'L') out.late++;
        return k.c;
      });
      const s = match(name, id);
      const entry = { name, id, codes, student: s };
      out.rows.push(entry); if (!s) out.unmatched.push(entry);
    }
    out.matched = out.rows.length - out.unmatched.length;
    out.missing = students.filter((s) => !out.rows.some((r) => r.student && r.student.id === s.id));
    return out;
  }

  // Write the parsed attendance into the course's lectures (merging by date)
  function applyAttendance(course, parsed, opts) {
    const res = { created: 0, updated: 0, students: 0 };
    if (opts.addUnmatched) for (const r of parsed.unmatched) {
      const s = { id: 's_' + St.uid(), groupId: course.groupId, name: r.name, sid: r.id || '', note: '' };
      St.S.students.push(s); r.student = s; res.students++;
    }
    parsed.dates.forEach((d, i) => {
      const existing = St.sessionsOf(course.id).find((s) => s.date === d.date);
      const records = existing ? Object.assign({}, existing.records || {}) : {};
      for (const r of parsed.rows) {
        if (!r.student) continue;
        if (r.codes[i] === 'P') delete records[r.student.id]; else records[r.student.id] = r.codes[i];
      }
      const sess = existing
        ? Object.assign({}, existing, { records, hours: d.hours || existing.hours, updatedAt: Date.now() })
        : { id: 's_' + St.uid(), courseId: course.id, date: d.date, hours: d.hours || opts.defaultHours, topic: '', records, notes: {}, source: 'excel', createdAt: Date.now(), updatedAt: Date.now() };
      St.upsert(St.S.sessions, sess); existing ? res.updated++ : res.created++;
    });
    return res;
  }

  // Student list from a sheet: name column + optional ID column
  function parseStudents(ws) {
    const rows = rowsOf(ws); const L = findLayout(rows); const out = [];
    let start = 0;
    for (let r = 0; r < Math.min(rows.length, 20); r++) if (rows[r].some((v) => typeof v === 'string' && NAME_RE.test(norm(v)))) { start = r + 1; break; }
    if (L.nameCol < 0) return out;
    for (let r = start; r < rows.length; r++) {
      const name = String(rows[r][L.nameCol] || '').trim();
      if (name.length < 3 || NAME_RE.test(norm(name)) || /^\d+$/.test(latin(name))) continue;
      out.push({ name: name.replace(/\s*\*+\s*$/, ''), sid: L.idCol >= 0 ? String(rows[r][L.idCol] || '').trim() : '' });
    }
    return out;
  }

  // ---------- template ----------
  const DAYS = [['الاحد', 'sunday'], ['الاثنين', 'monday'], ['الثلاثاء', 'tuesday'], ['الاربعاء', 'wednesday'], ['الخميس', 'thursday'], ['الجمعه', 'friday'], ['السبت', 'saturday']];
  function lectureDates(course) {
    const term = St.termOf(course.termId); if (!term || !term.start || !term.end) return [];
    const sch = norm(course.schedule || '');
    const days = DAYS.map((d, i) => (sch.includes(d[0]) || sch.includes(d[1]) ? i : -1)).filter((i) => i >= 0);
    const breaks = ((St.year() || {}).events || []).filter((e) => e.end && e.end > e.start);
    const out = []; const d = new Date(term.start + 'T00:00:00'); const end = new Date(term.end + 'T00:00:00');
    const first = d.getDay();
    for (; d <= end; d.setDate(d.getDate() + 1)) {
      const s = iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
      const ok = days.length ? days.includes(d.getDay()) : d.getDay() === first;
      if (ok && !breaks.some((b) => s >= b.start && s <= b.end)) out.push(s);
    }
    return out;
  }
  async function template(course, lang) {
    const X = await load();
    const students = St.studentsOf(course.groupId); const dates = lectureDates(course);
    const dmy = (s) => s.split('-').reverse().join('/');
    const head = ['ت / #', 'الاسم / Name', 'الرقم الجامعي / ID'].concat(dates.map(dmy));
    const aoa = [head].concat(students.map((s, i) => [i + 1, s.name, s.sid || ''].concat(dates.map(() => ''))));
    const ws = X.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 5 }, { wch: 36 }, { wch: 16 }].concat(dates.map(() => ({ wch: 11 })));
    ws['!freeze'] = { xSplit: 3, ySplit: 1 };
    const help = [
      ['تعليمات الملء', 'How to fill in'],
      [`المادة: ${course.nameAr}`, `Course: ${course.nameEn || course.nameAr}`],
      ['كل عمود تاريخ = محاضرة واحدة (يمكن إضافة أو حذف أعمدة التواريخ بصيغة يوم/شهر/سنة)', 'Each date column = one lecture (add or delete date columns as day/month/year)'],
      ['يمكن كتابة عدد الساعات بعد التاريخ بين قوسين مثل 05/10/2026 (2)', 'Hours may follow the date in brackets, e.g. 05/10/2026 (2)'],
      ['غ = غائب', 'A = absent'], ['ع = غائب بعذر', 'E = excused'], ['ت = متأخر', 'L = late'],
      ['الخلية الفارغة أو ✓ = حاضر', 'Empty cell or ✓ = present'],
      ['لا تغيّر عمود الأسماء؛ تتم المطابقة بالاسم أو الرقم الجامعي', 'Keep the name column; matching uses the name or the student ID'],
    ];
    const ws2 = X.utils.aoa_to_sheet(help); ws2['!cols'] = [{ wch: 70 }, { wch: 70 }];
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, lang === 'ar' ? 'الحضور' : 'Attendance');
    X.utils.book_append_sheet(wb, ws2, lang === 'ar' ? 'تعليمات' : 'Instructions');
    if (lang === 'ar') wb.Workbook = { Views: [{ RTL: true }] };
    const data = X.write(wb, { type: 'array', bookType: 'xlsx' });
    return { name: `attendance_${(course.nameEn || course.id).replace(/[^A-Za-z0-9]+/g, '_')}.xlsx`, data, dates: dates.length };
  }

  async function readFile(file) {
    const X = await load();
    if (/\.csv$/i.test(file.name)) return X.read(await file.text(), { type: 'string', raw: true });
    return X.read(await file.arrayBuffer(), { type: 'array' });
  }

  window.Excel = { load, readFile, parseAttendance, applyAttendance, parseStudents, template, lectureDates, norm, parseDate };
})();
