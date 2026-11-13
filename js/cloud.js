// ============================================================================
//  CLOUD: Google Drive storage through the department's Google Apps Script web app
//  - every recorded / edited / deleted lecture is queued and sent (works offline: sent when online)
//  - the head, delegates and administrator pull everything received; lecturers pull their own courses
//  - official reports are archived in the department's Drive
// ============================================================================
(function () {
  const St = window.Store, A = window.Auth, CFG = St.CFG;
  const QKEY = CFG.appId + ':cloudq', PKEY = CFG.appId + ':cloudpull', SKEY = CFG.appId + ':cloudstat';
  const rd = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const url = () => (CFG.cloud && CFG.cloud.url) || '';
  const configured = () => !!url();
  const enabled = () => configured() && !!A.current && !!A.apiKey();
  let busy = false, lastError = '';

  async function call(action, body) {
    const res = await fetch(url(), {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // a "simple" request: no CORS preflight for Apps Script
      body: JSON.stringify(Object.assign({ action, account: A.current.id, key: A.apiKey(), app: CFG.appId, v: CFG.version }, body || {})),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || 'error');
    return j;
  }
  function stat(patch) { const s = Object.assign(rd(SKEY, {}), patch || {}); wr(SKEY, s); return s; }

  // ---- outgoing queue ----
  function queue(ids) { const q = rd(QKEY, []); for (const id of ids || []) if (id && q.indexOf(id) < 0) q.push(id); wr(QKEY, q); }
  const pending = () => rd(QKEY, []).length;
  async function flush() {
    if (!enabled() || busy) return null;
    const q = rd(QKEY, []); if (!q.length) return { sent: 0 };
    busy = true;
    try {
      const sessions = q.map((id) => St.S.sessions.find((s) => s.id === id)).filter(Boolean);
      const sentVersion = {}; for (const s of sessions) sentVersion[s.id] = s.updatedAt || 0;
      const r = await call('submit', { sessions, yearId: St.S.currentYear });
      const done = new Set([].concat(r.accepted || [], (r.rejected || []).map((x) => x.id)));
      // keep in the queue anything changed again while the request was travelling
      wr(QKEY, rd(QKEY, []).filter((id) => { const s = St.S.sessions.find((x) => x.id === id); return s && !(done.has(id) && (s.updatedAt || 0) === sentVersion[id]); }));
      for (const s of St.S.sessions) if ((r.accepted || []).indexOf(s.id) >= 0) s.cloudAt = r.time;
      // a change refused because the lecture is locked: return to the stored copy at the next pull
      const locked = (r.rejected || []).filter((x) => x.why === 'locked').map((x) => x.id);
      if (locked.length) { for (const s of St.S.sessions) if (locked.indexOf(s.id) >= 0) s.updatedAt = 0; wr(PKEY, 0); }
      St.save(); lastError = ''; stat({ lastSent: r.time, lastError: '' });
      if (locked.length) await pull(true);
      return { sent: (r.accepted || []).length, rejected: (r.rejected || []).length };
    } catch (e) { lastError = String((e && e.message) || e); stat({ lastError }); return { error: lastError }; }
    finally { busy = false; }
  }

  // ---- incoming ----
  async function pull(full) {
    if (!enabled()) return null;
    try {
      const r = await call('pull', { since: full ? 0 : Number(rd(PKEY, 0)) });
      const m = St.mergeSessions(r.sessions || []);
      wr(PKEY, r.time); St.save(); lastError = ''; stat({ lastPull: r.time, lastError: '' });
      return m;
    } catch (e) { lastError = String((e && e.message) || e); stat({ lastError }); return { error: lastError }; }
  }
  async function sync() { const f = await flush(); const p = await pull(); return { flush: f, pull: p }; }

  async function archive(files) {
    if (!enabled()) return null;
    try { return await call('archive', { yearId: St.S.currentYear, files }); }
    catch (e) { lastError = String((e && e.message) || e); stat({ lastError }); return { error: lastError }; }
  }
  async function ping() { try { return await call('ping', {}); } catch (e) { return { ok: false, error: String((e && e.message) || e) }; } }
  function status() { const s = rd(SKEY, {}); return { configured: configured(), enabled: enabled(), pending: pending(), lastSent: s.lastSent || 0, lastPull: s.lastPull || 0, lastError: lastError || s.lastError || '' }; }
  function resetPull() { wr(PKEY, 0); }

  window.Cloud = { configured, enabled, queue, flush, pull, sync, archive, ping, status, pending, resetPull };
})();
