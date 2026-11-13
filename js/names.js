// ============================================================================
//  NAMES: lecturer-name normalisation and matching (titles stripped, Arabic
//  letter variants unified, shortened names matched by word prefix).
//  Used to assign courses to lecturer accounts automatically.
// ============================================================================
(function (root) {
  const TITLES = /(أ\.م\.د\.|ا\.م\.د\.|أ\.د\.|ا\.د\.|م\.د\.|م\.م\.|أ\.م\.|ا\.م\.|د\.|م\.|أ\.|ا\.|prof\.|dr\.|eng\.)/gi;
  const clean = (s) => String(s || '').replace(TITLES, ' ').replace(/[.…_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const norm = (s) => clean(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
  const tokens = (s) => norm(s).split(' ').filter((w) => w.length > 1);
  // the parts of a course's lecturer field ("A + B + C")
  const parts = (field) => String(field || '').split(/[+،,]/).map((p) => p.trim()).filter((p) => /[؀-ۿA-Za-z]{2,}/.test(norm(p)) && !/لجنه/.test(norm(p)));
  const isPrefix = (a, b) => a.length > 0 && a.length <= b.length && a.every((w, i) => w === b[i]);
  // same person when one name is a word-prefix of the other ("كريم" ~ "كريم رشيد", not "حياة كريم")
  const same = (x, y) => { const a = tokens(x), b = tokens(y); return isPrefix(a, b) || isPrefix(b, a); };
  const teaches = (name, course) => parts(course.lecturer).some((p) => same(name, p));
  // distinct lecturer names found in a list of courses (longest spelling kept)
  function extract(courses) {
    const out = [];
    for (const c of courses) for (const p of parts(c.lecturer)) {
      const name = clean(p); if (tokens(name).length === 0) continue;
      const i = out.findIndex((o) => same(o, name));
      if (i < 0) out.push(name); else if (tokens(name).length > tokens(out[i]).length) out[i] = name;
    }
    return out.sort((a, b) => a.localeCompare(b, 'ar'));
  }
  root.Names = { clean, norm, tokens, parts, same, teaches, extract };
})(typeof window !== 'undefined' ? window : globalThis);
