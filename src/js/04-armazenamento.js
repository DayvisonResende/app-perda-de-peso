/* ===================== ARMAZENAMENTO (local + nuvem) ===================== */
const LS_KEY = 'biotrack:v4';
// Medidas corporais. down=true: diminuir é o esperado num emagrecimento (verde); false: neutro (ex.: braço pode crescer com treino)
const MEASURES = [
  { k: 'waist', n: 'Cintura', tip: 'na altura do umbigo, barriga relaxada', down: true },
  { k: 'hip', n: 'Quadril', tip: 'na parte mais larga do bumbum', down: true },
  { k: 'chest', n: 'Peito', tip: 'na linha dos mamilos, depois de soltar o ar', down: false },
  { k: 'arm', n: 'Braço', tip: 'no meio do braço, relaxado', down: false },
  { k: 'thigh', n: 'Coxa', tip: 'na parte mais grossa, em pé', down: true },
  { k: 'neck', n: 'Pescoço', tip: 'logo abaixo do pomo de adão', down: true },
];
const EMPTY_DAY = Object.freeze({ foods: [], ex: [], water: 0, habits: {} });
const Store = {
  s: { core: null, days: {} },
  load() {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) this.s = JSON.parse(raw); } catch (e) {}
    if (!this.s || typeof this.s !== 'object' || !this.s.days) this.s = { core: null, days: {} };
  },
  persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(this.s)); } catch (e) {} },
  get core() { return this.s.core; },
  get p() { return this.s.core && this.s.core.profile; },
  saveCore() { this.s.core._u = Date.now(); this.persist(); Sync.mark('core'); },
  day(date) { return this.s.days[date] || EMPTY_DAY; },
  dayW(date) {
    if (!this.s.days[date]) this.s.days[date] = { foods: [], ex: [], water: 0, habits: {} };
    const d = this.s.days[date]; d.foods ||= []; d.ex ||= []; d.habits ||= {};
    return d;
  },
  saveDay(date) { const d = this.dayW(date); d._u = Date.now(); this.persist(); Sync.mark('d_' + date); },
  weights() { return [...(this.core?.weights || [])].sort((a, b) => a.date.localeCompare(b.date)); },
  weightOn(date) {
    const ws = this.weights(); if (!ws.length) return this.p?.weight || 80;
    let w = ws[0].weight; for (const e of ws) { if (e.date <= date) w = e.weight; else break; } return w;
  },
  // Medidas por data: junta o registro de medidas com a cintura anotada nas pesagens antigas
  measures() {
    const by = {};
    for (const w of this.core?.weights || []) if (w.waist) by[w.date] = { date: w.date, waist: w.waist, fromWeight: true };
    for (const m of this.core?.measures || []) { const prev = by[m.date] || {}; by[m.date] = { ...prev, ...Object.fromEntries(Object.entries(m).filter(([, v]) => v != null)), fromWeight: false }; }
    return Object.values(by).sort((a, b) => a.date.localeCompare(b.date));
  },
  measureOn(k, date) { let v = null; for (const m of this.measures()) { if (m.date <= date) { if (m[k]) v = m[k]; } else break; } return v; },
  waistOn(date) { return this.measureOn('waist', date) || this.p?.waist || null; },
  syncProfile() {
    const ws = this.weights(); if (ws.length) this.p.weight = ws[ws.length - 1].weight;
    const t = todayISO();
    for (const k of ['waist', 'neck', 'hip']) { const v = this.measureOn(k, t); if (v) this.p[k] = v; }
  },
  pushRecent(fid, g) {
    const c = this.core; c.recent = [{ id: fid, g }, ...(c.recent || []).filter((r) => r.id !== fid)].slice(0, 24);
  },
};

const Sync = {
  status: 'local', col: null, ready: false, dirty: new Set(), writing: new Set(), timer: null, remoteU: {},
  async init() {
    if (!(window.claude && typeof window.claude.use === 'function')) return this.done();
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return this.done();
      const id = await user.id();
      if (!id) return this.done();
      this.col = db.collection('data/users/' + id);
      this.set('connecting');
      const t = setTimeout(() => { if (!this.ready) { this.set('offline'); this.done(); } }, 10000);
      this.col.onSnapshot((snap) => {
        this.merge(snap);
        if (!snap.metadata.fromCache && !this.ready) {
          this.ready = true; clearTimeout(t); this.set('synced'); this.pushInitial(); this.done();
        }
      }, (err) => { clearTimeout(t); this.col = null; this.set('local'); this.done(); });
    } catch (e) { this.done(); }
  },
  done() { if (!this._done) { this._done = true; App.syncSettled(); } },
  set(s) { this.status = s; App.syncBadge(); },
  merge(snap) {
    let changed = false;
    for (const d of snap.docs) {
      const data = d.data(); if (!data) continue;
      const ru = data._u || 0; this.remoteU[d.id] = ru;
      if (this.dirty.has(d.id) || this.writing.has(d.id)) continue;
      if (d.id === 'core') {
        if (!Store.s.core || ru > (Store.s.core._u || 0)) { Store.s.core = clone(data); changed = true; }
      } else if (d.id.startsWith('d_')) {
        const k = d.id.slice(2), loc = Store.s.days[k];
        if (!loc || ru > (loc._u || 0)) { Store.s.days[k] = clone(data); changed = true; }
      }
    }
    if (changed) { Store.persist(); App.remoteChanged(); }
  },
  pushInitial() {
    if (Store.s.core && (Store.s.core._u || 0) > (this.remoteU.core || 0)) this.mark('core');
    for (const [k, v] of Object.entries(Store.s.days)) {
      if ((v._u || 0) > (this.remoteU['d_' + k] || 0)) this.mark('d_' + k);
    }
  },
  mark(id) {
    if (!this.col) return;
    this.dirty.add(id); clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 900);
  },
  body(id) { return id === 'core' ? Store.s.core : Store.s.days[id.slice(2)]; },
  async flush() {
    if (!this.col) return;
    for (const id of [...this.dirty]) {
      if (this.writing.has(id)) continue;
      this.dirty.delete(id);
      const b = this.body(id); if (!b) continue;
      this.writing.add(id);
      try { await this.col.doc(id).set(clone(b)); this.remoteU[id] = b._u; if (this.ready) this.set('synced'); }
      catch (e) {
        if (e && (e.code === 'unavailable' || e.code === 'resource_exhausted')) this.dirty.add(id);
        else if (e && e.code === 'quota_exceeded') { App.toast('O espaço na nuvem acabou. Seus dados continuam salvos neste aparelho.'); this.set('offline'); }
        else { this.col = null; this.set('local'); }
      } finally { this.writing.delete(id); }
    }
    if (this.dirty.size) this.timer = setTimeout(() => this.flush(), 2000);
  },
  async wipe() {
    if (!this.col) return;
    const ids = Object.keys(this.remoteU);
    for (const id of ids) { try { await this.col.doc(id).delete(); } catch (e) {} }
    this.remoteU = {};
  },
};

