/* ===================== APP ===================== */
const TABS = [
  { id: 'hoje', label: 'Hoje', ic: 'home' },
  { id: 'cardapio', label: 'Cardápio', ic: 'cal' },
  { id: 'treino', label: 'Treino', ic: 'dumbbell' },
  { id: 'progresso', label: 'Progresso', ic: 'chart' },
  { id: 'perfil', label: 'Perfil', ic: 'user' },
];
const ui = { tab: 'hoje', date: todayISO(), planDay: new Date().getDay(), planTab: 'semana', needle: null, booting: true };

const App = {
  init() {
    Store.load();
    this.applyTheme();
    const h = location.hash.replace('#', '');
    if (TABS.some((t) => t.id === h)) ui.tab = h;
    let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (ui.tab === 'progresso' && !Sheet.isOpen()) this.render(); }, 250); });
    window.addEventListener('hashchange', () => { const x = location.hash.replace('#', ''); if (TABS.some((t) => t.id === x) && x !== ui.tab) { ui.tab = x; this.render(); window.scrollTo(0, 0); } });
    if (Store.core) ui.booting = false;
    this.render();
    Sync.init();
    AI.init();
    setTimeout(() => { if (ui.booting) { ui.booting = false; this.render(); } }, 4500);
    let lastDay = todayISO();
    setInterval(() => { const t = todayISO(); if (t !== lastDay) { if (ui.date === lastDay) ui.date = t; lastDay = t; this.render(); } }, 60000);
  },
  syncSettled() { if (ui.booting) { ui.booting = false; this.render(); } },
  remoteChanged() { resetFoodCache(); if (!Sheet.isOpen()) this.render(); else this.renderNav(); },
  syncBadge() { document.querySelectorAll('.sync').forEach((el) => { el.dataset.s = Sync.status; el.querySelector('span:last-child').textContent = syncText(); }); },
  applyTheme() {
    const t = Store.core?.profile?.theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  },
  go(tab) { if (location.hash !== '#' + tab) location.hash = tab; else { ui.tab = tab; this.render(); } },
  renderNav() {
    const btn = (cls) => TABS.map((t) => `<button class="${cls}" data-a="tab" data-tab="${t.id}" ${ui.tab === t.id ? 'aria-current="page"' : ''}>${ic(t.ic)}<span>${t.label}</span></button>`).join('');
    const brand = `<div class="brand"><span class="glyph">${ic('dial')}</span>Brius</div>`;
    const sync = `<span class="sync" data-s="${Sync.status}"><span class="dot"></span><span>${syncText()}</span></span>`;
    const show = !!Store.core && !ui.booting;
    $('#rail').innerHTML = show ? `${brand}${btn('railbtn')}<div class="sp"></div>${sync}` : brand;
    $('#bottomnav').innerHTML = show ? btn('navbtn') : '';
    $('#bottomnav').hidden = !show;
    $('#topbar').innerHTML = `${brand}${show ? sync : ''}`;
  },
  render() {
    for (const k in _missCache) delete _missCache[k];
    this.renderNav();
    let html;
    if (!Store.core) html = ui.booting ? `<div class="loading"><div class="row"><div class="spinner"></div><span>Carregando seus dados…</span></div></div>` : viewOnboarding();
    else html = ({ hoje: viewHoje, cardapio: viewCardapio, treino: viewTreino, progresso: viewProgresso, perfil: viewPerfil }[ui.tab] || viewHoje)();
    const v = $('#view'), changed = this._tab !== ui.tab; this._tab = ui.tab;
    v.innerHTML = html;
    if (changed && !reducedMotion()) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); clearTimeout(this._et); this._et = setTimeout(() => v.classList.remove('enter'), 900); }
    if (changed) document.querySelectorAll('[aria-current="page"]').forEach((x) => x.classList.add('pop'));
    this.after();
  },
  after() {
    pauseAx(); countUp(); if (Store.core && !ui.booting) checkStickersSoon();
    const n = document.querySelector('.needle');
    if (n) {
      const to = Number(n.dataset.to);
      const from = ui.needle == null ? -120 : ui.needle;
      n.style.transform = `rotate(${from}deg)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { n.style.transform = `rotate(${to}deg)`; }));
      ui.needle = to;
    }
  },
  toast(msg, undo) {
    const t = $('#toast');
    t.innerHTML = `<span>${msg}</span>${undo ? '<button data-a="undo">Desfazer</button>' : ''}`;
    this._undo = undo || null;
    t.classList.add('show'); clearTimeout(this._tt);
    this._tt = setTimeout(() => { t.classList.remove('show'); this._undo = null; }, undo ? 6000 : 2800);
  },
};
const $ = (s) => document.querySelector(s);
function syncText() {
  return { synced: 'Sincronizado', connecting: 'Conectando…', offline: 'Sem conexão', local: 'Salvo neste aparelho' }[Sync.status] || '';
}

