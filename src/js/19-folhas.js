/* ===================== FOLHAS (MODAIS) ===================== */
const Sheet = {
  cur: null,
  open(spec) { this.cur = spec; this.draw(); document.body.style.overflow = 'hidden'; },
  draw() {
    if (!this.cur) return;
    const live = $('#modal').querySelector('.scrim:not(.out)'), sb = live && live.querySelector('.sheet-b'), top = sb ? sb.scrollTop : 0;
    if (live) { // redesenho: troca só o conteúdo, sem repetir a animação de entrada
      const sh = live.querySelector('.sheet'); sh.className = `sheet ${this.cur.tall ? 'tall' : ''}`; sh.setAttribute('aria-label', this.cur.label || ''); sh.innerHTML = this.cur.render();
    } else $('#modal').insertAdjacentHTML('beforeend', `<div class="scrim" data-scrim><div class="sheet ${this.cur.tall ? 'tall' : ''}" role="dialog" aria-modal="true" aria-label="${esc(this.cur.label || '')}">${this.cur.render()}</div></div>`);
    const nb = $('#modal').querySelector('.scrim:not(.out) .sheet-b'); if (nb && this.cur.keepScroll) nb.scrollTop = top;
    this.cur.keepScroll = false; pauseAx();
  },
  isOpen() { return !!this.cur; },
  close(force) {
    if (!this.cur) return;
    if (!force && this.cur.beforeClose && this.cur.beforeClose() === false) return;
    this.cur = null; document.body.style.overflow = '';
    const sc = $('#modal').querySelector('.scrim:not(.out)'); if (!sc) return;
    if (reducedMotion()) { sc.remove(); return; }
    // o painel antigo sai animando; tira ids/ganchos para não confundir com um painel novo aberto em seguida
    sc.classList.add('out'); sc.querySelectorAll('[id],[data-in],[data-live],[data-a]').forEach((e) => { e.removeAttribute('id'); e.removeAttribute('data-in'); e.removeAttribute('data-live'); e.removeAttribute('data-a'); });
    setTimeout(() => sc.remove(), 230);
  },
};
// movimento reduzido: animações dos exercícios ficam paradas numa pose
// números que contam até o valor novo (calorias, saldo)
const _cnt = {};
function countUp() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const k = el.dataset.count, to = Number(el.dataset.v), from = _cnt[k] ?? (k === 'dial' ? 0 : to); _cnt[k] = to;
    if (from === to || reducedMotion()) return;
    const t0 = performance.now(), dur = 650, pre = el.dataset.pre || '';
    const step = (t) => { const x = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - x, 3); el.textContent = pre + fmt(from + (to - from) * e); if (x < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
const reducedMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const pauseAx = () => { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('svg.ax').forEach((x) => { try { x.pauseAnimations(); x.setCurrentTime(1.2); } catch (e) {} }); };
const sheetHead = (title, sub = '', back = '') => `<div class="sheet-h">
  ${back ? `<button class="icon-btn" data-a="${back}" aria-label="Voltar">${ic('left')}</button>` : ''}
  <div class="t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>
  <button class="icon-btn" data-a="sheet-close" aria-label="Fechar">${ic('x')}</button></div>`;
const isDesktop = () => window.matchMedia('(min-width: 720px)').matches;

/* ---------- editor de quantidade (compartilhado) */
function edDefault(fid) {
  const f = food(fid), rec = (Store.core.recent || []).find((r) => r.id === fid);
  if (rec) { const pi = (f.por || []).findIndex((p) => rec.g % p[1] === 0 && rec.g / p[1] <= 6); return pi >= 0 ? { por: pi, qty: rec.g / f.por[pi][1] } : { por: -1, g: rec.g }; }
  return f.por && f.por.length ? { por: 0, qty: 1 } : { por: -1, g: 100 };
}
function edGrams(fid, ed) { const f = food(fid); return ed.por >= 0 && f.por[ed.por] ? f.por[ed.por][1] * ed.qty : ed.g; }
function edHTML(fid, ed, pfx) {
  const f = food(fid), g = edGrams(fid, ed), n = nutr(fid, g);
  const chips = [`<button class="chip" data-a="${pfx}-por" data-i="-1" aria-pressed="${ed.por < 0}">${f.u === 'ml' ? 'mililitros' : 'gramas'}</button>`]
    .concat((f.por || []).map((p, i) => `<button class="chip" data-a="${pfx}-por" data-i="${i}" aria-pressed="${ed.por === i}">${esc(p[0])} · ${fmt(p[1])} ${f.u}</button>`)).join('');
  return `<div class="editor">
    <div class="chips">${chips}</div>
    <div class="qty">
      <button class="sbtn" data-a="${pfx}-step" data-d="-1" aria-label="Menos">${ic('minus')}</button>
      <input class="input num" data-in="${pfx}-qty" inputmode="decimal" value="${ed.por >= 0 ? fmt1(ed.qty) : fmt(ed.g)}" aria-label="Quantidade">
      <button class="sbtn" data-a="${pfx}-step" data-d="1" aria-label="Mais">${ic('plus')}</button>
    </div>
    <div class="qty-sub" data-live="${pfx}-sub">${ed.por >= 0 ? `${fmt1(ed.qty)} × ${esc(f.por[ed.por][0])} = ${grams(g, f.u)}` : f.u === 'ml' ? 'mililitros' : 'gramas'}</div>
    <div class="nut" data-live="${pfx}-nut">${nutHTML(n)}</div>
  </div>`;
}
const nutHTML = (n) => `<div><b class="num">${fmt(n.kcal)}</b><small>kcal</small></div><div><b class="num">${fmt1(n.p)}</b><small>proteína</small></div><div><b class="num">${fmt1(n.c)}</b><small>carbo</small></div><div><b class="num">${fmt1(n.f)}</b><small>gordura</small></div>`;
function edStep(fid, ed, dir) {
  if (ed.por >= 0) ed.qty = Math.max(0.5, Math.round((ed.qty + dir * 0.5) * 2) / 2);
  else { const st = ed.g >= 100 ? 25 : 10; ed.g = Math.max(st, Math.round((ed.g + dir * st) / st) * st); }
}
function edSetPor(fid, ed, i) {
  const g = edGrams(fid, ed), f = food(fid);
  if (i < 0) { ed.por = -1; ed.g = Math.round(g); }
  else { ed.por = i; ed.qty = Math.max(0.5, Math.round((g / f.por[i][1]) * 2) / 2); }
}
function edLive(fid, ed, pfx) {
  const f = food(fid), g = edGrams(fid, ed);
  const sub = document.querySelector(`[data-live="${pfx}-sub"]`), nut = document.querySelector(`[data-live="${pfx}-nut"]`);
  if (sub) sub.textContent = ed.por >= 0 ? `${fmt1(ed.qty)} × ${f.por[ed.por][0]} = ${grams(g, f.u)}` : f.u === 'ml' ? 'mililitros' : 'gramas';
  if (nut) nut.innerHTML = nutHTML(nutr(fid, g));
}

/* ---------- seletor de alimentos com bandeja */
let FP = null;
const DRAFT_KEY = 'biotrack:bandeja';
function fpOpen(target, preload) {
  FP = { target, q: '', src: 'all', open: null, ed: null, tray: [], trayOpen: false, view: 'list', confirm: false, ai: { text: '', busy: false, err: '' } };
  if (preload) { FP.tray = preload.map((it) => ({ tid: uid(), fid: it.id, g: it.g })); FP.trayOpen = true; }
  else {
    try {
      const dr = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (dr && dr.tray && dr.tray.length && dr.target.kind === target.kind && (dr.target.date || dr.target.day) === (target.date || target.day)) {
        FP.tray = dr.tray; FP.target.meal = dr.target.meal; FP.trayOpen = true;
        setTimeout(() => App.toast('Recuperei a bandeja que você estava montando'), 300);
      }
    } catch (e) {}
  }
  Sheet.open({ tall: true, label: 'Adicionar alimentos', render: fpHTML, beforeClose: fpBeforeClose });
  if (isDesktop()) setTimeout(() => { const i = $('#fp-q'); if (i) i.focus(); }, 60);
}
function fpSaveDraft() { try { if (FP && FP.tray.length) localStorage.setItem(DRAFT_KEY, JSON.stringify({ target: FP.target, tray: FP.tray })); else localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
function fpBeforeClose() { if (FP && FP.tray.length && !FP.confirm) { FP.confirm = true; FP.trayOpen = false; Sheet.draw(); return false; } return true; }
const trayN = (t) => (t.adhoc ? t.adhoc : nutr(t.fid, t.g));
const trayName = (t) => (t.adhoc ? t.adhoc.n : food(t.fid)?.n || '?');
function fpTitle() {
  const t = FP.target, m = mealById(t.meal);
  return t.kind === 'plan' ? [`${m.label} de ${WD[t.day].toLowerCase()}`, 'Adicionando ao cardápio'] : [`Adicionar ao ${m.label.toLowerCase()}`, dateLabel(t.date)];
}
function fpHTML() {
  const [title, sub] = fpTitle(), diary = FP.target.kind === 'diary';
  const pd = diary ? planDay(FP.target.date) : null;
  const srcs = [['all', 'Tudo'], ['rec', 'Recentes']];
  if (pd) srcs.push(['plan', 'Do cardápio']);
  srcs.push(['mine', 'Meus alimentos']);
  if (diary && AI.s) srcs.push(['ai', 'Descrever']);
  return `${sheetHead(title, sub)}
  <div class="sheet-b">
    ${diary ? `<div class="chips scroll mb12">${MEALS.map((m) => `<button class="chip" data-a="fp-meal" data-v="${m.id}" aria-pressed="${FP.target.meal === m.id}">${m.label}</button>`).join('')}</div>` : ''}
    <div class="search">${ic('search')}<input id="fp-q" class="input" type="search" placeholder="Buscar: frango, arroz, banana…" value="${esc(FP.q)}" data-in="fp-q" autocomplete="off" aria-label="Buscar alimento"></div>
    <div class="chips scroll mt12">${srcs.map(([k, l]) => `<button class="chip ${k === 'ai' ? 'ai' : ''}" data-a="fp-src" data-v="${k}" aria-pressed="${FP.src === k && !FP.q}">${k === 'ai' ? ic('spark', 'sm') + ' ' : ''}${l}</button>`).join('')}</div>
    <div id="fp-results" class="results">${fpResults()}</div>
  </div>
  ${fpTray()}`;
}
function fpRow(f) {
  const open = FP.open === f.id;
  const por = f.por && f.por[0] ? `${f.por[0][0]} (${fmt(f.por[0][1])} ${f.u})` : `100 ${f.u}`;
  const k1 = f.por && f.por[0] ? (f.k * f.por[0][1]) / 100 : f.k;
  const inTray = FP.tray.filter((t) => t.fid === f.id).length;
  return `<div class="res ${open ? 'open' : ''}">
    <button class="res-row" data-a="fp-pick" data-id="${f.id}" aria-expanded="${open}">
      <span class="n"><b>${esc(f.n)}${f.custom ? ' <span class="tag">meu</span>' : ''}${inTray ? ' <span class="tag carrot">na bandeja</span>' : ''}</b><small>${esc(por)} · ${fmt(f.k)} kcal/100 ${f.u}</small></span>
      <span class="kc num">${fmt(k1)} kcal</span>
    </button>
    ${open ? `${edHTML(f.id, FP.ed, 'fe')}<button class="btn btn-primary btn-block mt12" data-a="fp-add">${ic('tray', 'sm')} Pôr na bandeja</button>` : ''}
  </div>`;
}
function fpResults() {
  if (FP.view === 'quick') return fpQuickHTML();
  if (FP.view === 'custom') return fpCustomHTML();
  const more = `<div class="row wrap mt16" style="justify-content:center"><span class="muted" style="font-size:13.5px">Não achou?</span>
    ${FP.target.kind === 'diary' ? `<button class="btn btn-soft btn-sm" data-a="fp-view" data-v="quick">${ic('bolt', 'sm')} Só calorias</button>` : ''}
    <button class="btn btn-soft btn-sm" data-a="fp-view" data-v="custom">${ic('plus', 'sm')} Criar alimento</button></div>`;
  const q = norm(FP.q.trim());
  if (q) {
    const words = q.split(/\s+/);
    const list = allFoods().filter((f) => { const n = norm(f.n); return words.every((w) => n.includes(w)); })
      .sort((a, b) => norm(a.n).indexOf(words[0]) - norm(b.n).indexOf(words[0]) || a.n.length - b.n.length).slice(0, 60);
    return (list.length ? list.map(fpRow).join('') : `<p class="empty">Nada encontrado para “${esc(FP.q)}”.</p>`) + more;
  }
  if (FP.src === 'ai') return fpAIHTML();
  if (FP.src === 'rec') {
    const list = (Store.core.recent || []).map((r) => food(r.id)).filter(Boolean);
    return (list.length ? list.map(fpRow).join('') : `<p class="empty">O que você registrar aparece aqui para repetir rápido.</p>`) + more;
  }
  if (FP.src === 'mine') {
    const list = Store.core.customFoods || [];
    return (list.length ? list.map(fpRow).join('') : `<p class="empty">Cadastre um alimento com os dados do rótulo e ele fica salvo aqui.</p>`) + more;
  }
  if (FP.src === 'plan') {
    const pd = planDay(FP.target.date);
    return MEALS.filter((m) => pd.meals[m.id]).map((m) => `<div class="rgroup row"><span class="grow">${m.label} planejado</span><button class="btn btn-soft btn-sm" data-a="fp-addplan" data-m="${m.id}">${ic('tray', 'sm')} Tudo</button></div>
      ${pd.meals[m.id].map((it) => fpRow(food(it.id))).join('')}`).join('');
  }
  let html = '';
  const pd = FP.target.kind === 'diary' ? planDay(FP.target.date) : null, pm = pd && pd.meals[FP.target.meal];
  if (pm && pm.length) html += `<div class="planned" style="margin:6px 0 4px"><b>${mealById(FP.target.meal).label} do cardápio</b><div class="pl-items">${pm.map((it) => `${esc(splitName(food(it.id).n)[0])} ${unitLabel(it.id, it.g)}`).join(' · ')}</div>
    <button class="btn btn-primary btn-sm" data-a="fp-addplan" data-m="${FP.target.meal}">${ic('tray', 'sm')} Pôr tudo na bandeja</button></div>`;
  const rec = (Store.core.recent || []).slice(0, 6).map((r) => food(r.id)).filter(Boolean);
  if (rec.length) html += `<div class="rgroup">Recentes</div>${rec.map(fpRow).join('')}`;
  if ((Store.core.customFoods || []).length) html += `<div class="rgroup">Meus alimentos</div>${Store.core.customFoods.map(fpRow).join('')}`;
  for (const [cat, label] of Object.entries(FOOD_CATEGORIES)) html += `<div class="rgroup">${label}</div>${FOODS.filter((f) => f.cat === cat).map(fpRow).join('')}`;
  return html + more;
}
function fpQuickHTML() {
  return `<div class="editor mt12">
    <button class="btn btn-ghost btn-sm" data-a="fp-view" data-v="list" style="justify-self:start">${ic('left', 'sm')} Voltar à busca</button>
    <label class="field"><span>Descrição</span><input class="input" id="qk-n" placeholder="Ex.: pedaço de bolo da festa" maxlength="60"></label>
    <div class="grid2"><label class="field"><span>Calorias (kcal)</span><input class="input num" id="qk-k" inputmode="numeric"></label><label class="field"><span>Proteína (g, opcional)</span><input class="input num" id="qk-p" inputmode="decimal"></label>
    <label class="field"><span>Carbo (g, opcional)</span><input class="input num" id="qk-c" inputmode="decimal"></label><label class="field"><span>Gordura (g, opcional)</span><input class="input num" id="qk-f" inputmode="decimal"></label></div>
    <button class="btn btn-primary" data-a="fp-quick-add">${ic('tray', 'sm')} Pôr na bandeja</button>
  </div>`;
}
function fpCustomHTML() {
  return `<div class="editor mt12">
    <button class="btn btn-ghost btn-sm" data-a="fp-view" data-v="list" style="justify-self:start">${ic('left', 'sm')} Voltar à busca</button>
    <p class="muted" style="font-size:13.5px">Copie da tabela nutricional do rótulo. Os valores são por 100 g (ou 100 ml).</p>
    <label class="field"><span>Nome</span><input class="input" id="cf-n" maxlength="60" placeholder="Ex.: Iogurte proteico Marca X"></label>
    <div class="grid2">
      <label class="field"><span>Unidade</span><select class="input" id="cf-u"><option value="g">gramas</option><option value="ml">mililitros</option></select></label>
      <label class="field"><span>kcal por 100</span><input class="input num" id="cf-k" inputmode="decimal"></label>
      <label class="field"><span>Proteína por 100</span><input class="input num" id="cf-p" inputmode="decimal"></label>
      <label class="field"><span>Carbo por 100</span><input class="input num" id="cf-c" inputmode="decimal"></label>
      <label class="field"><span>Gordura por 100</span><input class="input num" id="cf-f" inputmode="decimal"></label>
      <label class="field"><span>Porção (opcional)</span><input class="input" id="cf-pn" placeholder="pote" maxlength="24"></label>
      <label class="field"><span>Tamanho da porção</span><input class="input num" id="cf-pg" inputmode="decimal" placeholder="170"></label>
    </div>
    <button class="btn btn-primary" data-a="fp-custom-save">${ic('check', 'sm')} Salvar alimento</button>
  </div>`;
}
function fpAIHTML() {
  const a = FP.ai;
  return `<div class="ai-box">
    <span class="ai-mark">${ic('spark', 'sm')} O Claude transforma sua descrição em itens</span>
    <textarea class="input" data-in="fp-ai" placeholder="Ex.: 2 ovos mexidos, 1 pão francês com requeijão e um café com leite" ${a.busy ? 'disabled' : ''}>${esc(a.text)}</textarea>
    ${a.err ? `<p style="color:var(--tomato);font-size:13.5px">${esc(a.err)}</p>` : ''}
    ${a.busy ? `<div class="row"><div class="spinner"></div><span class="muted grow">Interpretando…</span><button class="btn btn-ghost btn-sm" data-a="fp-ai-stop">Cancelar</button></div>`
      : `<button class="btn btn-carrot" data-a="fp-ai-run">${ic('spark', 'sm')} Interpretar e pôr na bandeja</button>`}
    <p class="faint" style="font-size:12.5px">Confira as quantidades na bandeja antes de registrar.</p>
  </div>`;
}
function fpTray() {
  const tr = FP.tray, t = sumN(tr.map(trayN)), n = tr.length, diary = FP.target.kind === 'diary';
  let fit = '';
  if (diary && n) {
    const d = computeDay(FP.target.date), left = d.plan.target - d.intake - t.kcal;
    fit = `<div class="fit-line">Com a bandeja: ${left >= 0 ? `restam <b class="num">${fmt(left)}</b> kcal no dia` : `<span style="color:var(--tomato)">passa <b class="num">${fmt(-left)}</b> kcal da meta</span>`}</div>`;
  } else if (!diary && n) {
    const cur = sumN((Store.core.plan.days[FP.target.day].meals[FP.target.meal]) || []).kcal;
    fit = `<div class="fit-line">Refeição no cardápio: <b class="num">${fmt(cur)}</b> → <b class="num">${fmt(cur + t.kcal)}</b> kcal</div>`;
  }
  const list = FP.trayOpen && n ? `<div class="tray-list">${tr.map((x) => {
    const xn = trayN(x), f = x.fid && food(x.fid);
    const q = x.adhoc ? '' : grams(x.g, f.u), por = !x.adhoc && x.por != null && f.por[x.por] ? `${fmt1(x.qty)} × ${f.por[x.por][0]} · ` : '';
    return `<div class="titem"><div class="n"><b>${esc(trayName(x))}</b><small class="num">${esc(por)}${fmt(xn.kcal)} kcal · P ${fmt1(xn.p)} g</small></div>
      ${x.adhoc ? '' : `<span class="mini-step"><button data-a="tr-step" data-t="${x.tid}" data-d="-1" aria-label="Menos">${ic('minus', 'sm')}</button><span class="num">${q}</span><button data-a="tr-step" data-t="${x.tid}" data-d="1" aria-label="Mais">${ic('plus', 'sm')}</button></span>`}
      <button class="icon-btn sm" data-a="tr-del" data-t="${x.tid}" aria-label="Tirar da bandeja">${ic('x', 'sm')}</button></div>`;
  }).join('')}</div>` : '';
  const confirm = FP.confirm ? `<div class="hint" style="margin:10px 14px 0;border-style:solid;border-color:var(--carrot)">${ic('tray')}<div class="grow"><b>${n} ${n > 1 ? 'itens' : 'item'} na bandeja ainda não ${n > 1 ? 'foram registrados' : 'foi registrado'}.</b>
    <div class="row wrap mt8"><button class="btn btn-primary btn-sm" data-a="fp-commit">${diary ? 'Registrar e fechar' : 'Salvar e fechar'}</button><button class="btn btn-ghost btn-danger btn-sm" data-a="fp-discard">Descartar</button><button class="btn btn-ghost btn-sm" data-a="fp-keep">Continuar montando</button></div></div></div>` : '';
  return `<div class="tray">${list}${confirm}${fit}
    <div class="tray-bar">
      <button class="tray-sum" data-a="fp-traytoggle" ${n ? '' : 'disabled'} aria-expanded="${FP.trayOpen}">
        <span class="tray-count ${n ? '' : 'zero'}" id="tray-count">${n}</span>
        <span style="min-width:0">${n ? `<b class="num">${fmt(t.kcal)} kcal</b><small class="num">P ${fmt(t.p)} · C ${fmt(t.c)} · G ${fmt(t.f)} g · ${FP.trayOpen ? 'ocultar' : 'ver itens'}</small>` : `<b>Bandeja vazia</b><small>Nada é salvo até você registrar</small>`}</span>
        ${n ? ic(FP.trayOpen ? 'down' : 'up', 'sm') : ''}
      </button>
      <button class="btn btn-primary" data-a="fp-commit" ${n ? '' : 'disabled'}>${diary ? 'Registrar' : 'Salvar'}${n ? ` (${n})` : ''}</button>
    </div></div>`;
}
function fpRedraw(full) { if (full) { Sheet.cur.keepScroll = true; Sheet.draw(); } else { const r = $('#fp-results'); if (r) r.innerHTML = fpResults(); } }
function fpAddToTray(item) {
  FP.tray.push({ tid: uid(), ...item }); fpSaveDraft();
  FP.open = null; FP.ed = null; FP.confirm = false;
  const hadQ = !!FP.q; FP.q = '';
  Sheet.cur.keepScroll = !hadQ; Sheet.draw();
  const c = $('#tray-count'); if (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  if (isDesktop() || hadQ) { const i = $('#fp-q'); if (i && isDesktop()) i.focus(); }
}
function fpCommit() {
  const t = FP.target, n = FP.tray.length; if (!n) return;
  if (t.kind === 'diary') {
    const day = Store.dayW(t.date), ids = [];
    for (const x of FP.tray) {
      const xn = trayN(x), f = x.fid && food(x.fid);
      const e = { id: uid(), fid: x.fid || null, n: trayName(x), meal: t.meal, g: x.adhoc ? 0 : x.g, u: f ? f.u : 'g', kcal: xn.kcal, p: xn.p, c: xn.c, f: xn.f };
      if (f && x.por != null && f.por[x.por]) { e.por = f.por[x.por]; e.qty = x.qty; }
      day.foods.push(e); ids.push(e.id);
      if (x.fid) Store.pushRecent(x.fid, x.g);
    }
    Store.saveDay(t.date); Store.saveCore();
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    Sheet.close(true); App.render();
    App.toast(`${n} ${n > 1 ? 'itens registrados' : 'item registrado'} no ${mealById(t.meal).label.toLowerCase()}`, () => {
      const d = Store.dayW(t.date); d.foods = d.foods.filter((e) => !ids.includes(e.id)); Store.saveDay(t.date); App.render();
    });
  } else {
    const plan = Store.core.plan, prev = clone(plan);
    const arr = plan.days[t.day].meals[t.meal] || (plan.days[t.day].meals[t.meal] = []);
    for (const x of FP.tray) if (x.fid) arr.push({ id: x.fid, g: x.g });
    Store.saveCore();
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    Sheet.close(true); App.render();
    App.toast(`${n} ${n > 1 ? 'itens adicionados' : 'item adicionado'} ao cardápio`, () => { Store.core.plan = prev; Store.saveCore(); App.render(); });
  }
}
async function fpAIRun() {
  const text = FP.ai.text.trim(); if (!text || !AI.s) return;
  FP.ai.busy = true; FP.ai.err = ''; fpRedraw();
  const ctl = new AbortController(); FP.ai.ctl = ctl;
  const prompt = `Converta a descrição de uma refeição em itens de uma tabela de alimentos brasileira.
Tabela (id|nome|kcal por 100 g ou 100 ml|macros por 100|porções comuns):
${AI.table()}

Regras: use o id da tabela quando houver um alimento equivalente; converta medidas caseiras em gramas (ou ml) usando as porções da tabela. Quando não houver equivalente, use "id": null e estime kcal, proteína (p), carboidrato (c) e gordura (f) para a quantidade total do item. Não invente itens que não foram descritos.
Responda só com JSON, sem texto fora dele: {"itens":[{"id":"arroz_branco","nome":"Arroz branco cozido","g":90},{"id":null,"nome":"Bolo de cenoura com cobertura","g":80,"kcal":310,"p":4,"c":45,"f":13}]}

Descrição: ${text}`;
  try {
    const res = await AI.s.json(prompt, { signal: ctl.signal, modelTier: 'quick' });
    const items = (res && Array.isArray(res.itens) ? res.itens : []).slice(0, 15);
    let added = 0;
    for (const it of items) {
      const g = Number(it.g);
      if (it.id && food(it.id) && g > 0) { FP.tray.push({ tid: uid(), fid: it.id, g: Math.round(g) }); added++; }
      else if (Number(it.kcal) > 0) { FP.tray.push({ tid: uid(), adhoc: { n: String(it.nome || 'Item').slice(0, 60), kcal: Number(it.kcal), p: Number(it.p) || 0, c: Number(it.c) || 0, f: Number(it.f) || 0 }, g: 0 }); added++; }
    }
    FP.ai.busy = false;
    if (!added) { FP.ai.err = 'Não reconheci nenhum alimento. Tente descrever com quantidades.'; fpRedraw(); return; }
    FP.ai.text = ''; FP.src = 'all'; FP.trayOpen = true; fpSaveDraft(); fpRedraw(true);
    App.toast(`${added} ${added > 1 ? 'itens' : 'item'} na bandeja. Confira as quantidades.`);
  } catch (e) {
    if (!FP) return;
    FP.ai.busy = false; FP.ai.err = AI.errMsg(e); fpRedraw();
  }
}

/* ---------- editar item do diário */
let EE = null;
function entryOpen(id) {
  const e = Store.day(ui.date).foods.find((x) => x.id === id); if (!e) return;
  const f = e.fid && food(e.fid);
  EE = { id, meal: e.meal, ed: f ? (e.por && f.por ? (() => { const i = f.por.findIndex((p) => p[0] === e.por[0]); return i >= 0 ? { por: i, qty: e.qty } : { por: -1, g: e.g }; })() : { por: -1, g: e.g }) : null, kcal: e.kcal };
  Sheet.open({ label: 'Editar item', render: entryHTML });
}
function entryHTML() {
  const e = Store.day(ui.date).foods.find((x) => x.id === EE.id); if (!e) return '';
  const f = e.fid && food(e.fid);
  return `${sheetHead(esc(e.n), 'Editar item')}
  <div class="sheet-b">
    <div class="chips scroll mb12">${MEALS.map((m) => `<button class="chip" data-a="ee-meal" data-v="${m.id}" aria-pressed="${EE.meal === m.id}">${m.label}</button>`).join('')}</div>
    ${f ? edHTML(e.fid, EE.ed, 'ee') : `<label class="field"><span>Calorias (kcal)</span><input class="input num" data-in="ee-kcal" inputmode="numeric" value="${Math.round(EE.kcal)}"></label>`}
  </div>
  <div class="sheet-f"><button class="btn btn-ghost btn-danger" data-a="ee-del">${ic('trash', 'sm')} Excluir</button><button class="btn btn-primary grow" data-a="ee-save">Salvar</button></div>`;
}

/* ---------- exercícios */
let XS = null;
function exOpen() { XS = { q: '', open: null, min: 30, added: [] }; Sheet.open({ tall: true, label: 'Exercícios', render: exHTML }); }
function exHTML() {
  const q = norm(XS.q.trim()), w = Store.weightOn(ui.date);
  const list = q ? EXERCISES.filter((e) => norm(e.n).includes(q)) : [...POPULAR_EXERCISES.map((id) => EXERCISES.find((e) => e.id === id)), ...EXERCISES.filter((e) => !POPULAR_EXERCISES.includes(e.id))];
  const day = Store.day(ui.date);
  return `${sheetHead('Exercício', dateLabel(ui.date))}
  <div class="sheet-b">
    ${day.ex.length ? `<div class="planned" style="margin:0 0 12px"><b>Registrados ${ui.date === todayISO() ? 'hoje' : 'neste dia'}</b>${day.ex.map((e) => `<div class="kv"><span>${esc(e.n)} · ${e.min} min</span><b class="num">+${fmt(e.kcal)} kcal</b></div>`).join('')}</div>` : ''}
    <div class="search">${ic('search')}<input class="input" type="search" data-in="ex-q" value="${esc(XS.q)}" placeholder="Buscar: caminhada, musculação…" aria-label="Buscar exercício"></div>
    <div id="ex-results" class="results">${exResults(list, w)}</div>
  </div>
  <div class="sheet-f"><button class="btn btn-primary grow" data-a="sheet-close">Concluir</button></div>`;
}
function exResults(list, w) {
  w = w || Store.weightOn(ui.date);
  if (!list) { const q = norm(XS.q.trim()); list = q ? EXERCISES.filter((e) => norm(e.n).includes(q)) : [...POPULAR_EXERCISES.map((id) => EXERCISES.find((e) => e.id === id)), ...EXERCISES.filter((e) => !POPULAR_EXERCISES.includes(e.id))]; }
  return list.map((e, i) => {
    const open = XS.open === e.id, k = Calc.exKcal(e.met, w, XS.min);
    return `${!XS.q && i === POPULAR_EXERCISES.length ? '<div class="rgroup">Todos</div>' : ''}<div class="res ${open ? 'open' : ''}">
      <button class="res-row" data-a="ex-pick" data-id="${e.id}"><span class="n"><b>${esc(e.n)}</b><small>intensidade ${fmt1(e.met)} MET</small></span><span class="kc num">${fmt(Calc.exKcal(e.met, w, 30))} kcal/30 min</span></button>
      ${open ? `<div class="editor"><div class="qty"><button class="sbtn" data-a="ex-step" data-d="-1" aria-label="Menos">${ic('minus')}</button><input class="input num" data-in="ex-min" inputmode="numeric" value="${XS.min}" aria-label="Minutos"><button class="sbtn" data-a="ex-step" data-d="1" aria-label="Mais">${ic('plus')}</button></div>
        <div class="qty-sub">minutos · <b data-live="ex-k" class="num">${fmt(k)} kcal</b> gastas além do repouso</div>
        <button class="btn btn-primary" data-a="ex-add">${ic('plus', 'sm')} Adicionar</button></div>` : ''}
    </div>`;
  }).join('') || `<p class="empty">Nenhum exercício com esse nome.</p>`;
}

/* ---------- pesagem */
let WS = null;
function weightOpen(id) {
  const w = id ? Store.core.weights.find((x) => x.id === id) : null;
  WS = { id, date: w ? w.date : todayISO(), weight: w ? w.weight : Store.p.weight, waist: w ? w.waist : Store.p.waist };
  Sheet.open({ label: 'Pesagem', render: () => `${sheetHead(id ? 'Editar pesagem' : 'Nova pesagem', 'Melhor de manhã, em jejum, depois do banheiro')}
    <div class="sheet-b"><div class="grid2">
      <label class="field" style="grid-column:1/-1"><span>Data</span><input class="input" type="date" id="ws-date" value="${WS.date}" max="${todayISO()}"></label>
      <label class="field"><span>Peso (kg)</span><input class="input num" id="ws-w" inputmode="decimal" value="${fmt(WS.weight, 1)}"></label>
      <label class="field"><span>Cintura (cm, opcional)</span><input class="input num" id="ws-waist" inputmode="decimal" value="${WS.waist ? fmt1(WS.waist) : ''}"></label>
    </div><p class="faint mt12" style="font-size:12.5px">Meça a cintura na altura do umbigo, relaxado. Ela revela perda de gordura que a balança às vezes esconde. Quadril, braço, coxa e outras ficam em <b>Medidas</b>, na tela de Progresso.</p></div>
    <div class="sheet-f">${id && Store.core.weights.length > 1 ? `<button class="btn btn-ghost btn-danger" data-a="ws-del">${ic('trash', 'sm')} Excluir</button>` : ''}<button class="btn btn-primary grow" data-a="ws-save">Salvar pesagem</button></div>` });
}

/* ---------- gerador */
let GS = null;
function genOpen() {
  const s = settings(), pr = (Store.core.plan && Store.core.plan.prefs) || {};
  GS = { style: pr.style || s.style, meals: [...(pr.meals || s.meals)], prot: [...(pr.prot || GEN_DEFAULTS.prot)], veg: [...(pr.veg || GEN_DEFAULTS.veg)], carb: [...(pr.carb || GEN_DEFAULTS.carb)], batch: pr.batch !== false, text: '', busy: false, err: '', prog: 0 };
  Sheet.open({ tall: true, label: 'Montar semana', render: genHTML, beforeClose: () => { if (GS && GS.busy && GS.ctl) GS.ctl.abort(); return true; } });
}
function genTargets() { const d = computeDay(todayISO()); const m = Calc.macros(d.plan.target, d.weight, Store.p.goalWeight, GS.style); return { kcal: d.plan.target, protein: m.protein }; }
function genHTML() {
  const tg = genTargets(), lc = GS.style === 'lowcarb';
  const SHORT = { ovo: 'Ovos', frango_cru: 'Peito de frango', sobrecoxa_cru: 'Sobrecoxa', patinho_cru: 'Patinho (bife/iscas)', musculo_cru: 'Músculo', tilapia_cru: 'Tilápia', arroz_branco: 'Arroz branco', arroz_integral: 'Arroz integral', batata_doce: 'Batata-doce', batata_cozida: 'Batata', macarrao: 'Macarrão', cuscuz: 'Cuscuz', mandioca: 'Mandioca', abobora_crua: 'Abóbora' };
  const chipList = (ids, key) => ids.map((id) => `<button class="chip" data-a="gen-tog" data-k="${key}" data-v="${id}" aria-pressed="${GS[key].includes(id)}">${esc(SHORT[id] || splitName(food(id).n)[0])}</button>`).join('');
  const prots = [...genIds('P'), 'ovo'], vegs = genIds('V', lc).filter((v) => !['tomate', 'pepino', 'alface'].includes(v)), carbs = genIds('K');
  return `${sheetHead('Montar semana', `Meta: ${fmt(tg.kcal)} kcal e ${tg.protein} g de proteína por dia`)}
  <div class="sheet-b">
    <div class="field"><span>Estilo</span><div class="seg">${[['lowcarb', 'Low-carb'], ['equilibrado', 'Equilibrado']].map(([k, l]) => `<button data-a="gen-style" data-v="${k}" aria-pressed="${GS.style === k}">${l}</button>`).join('')}</div></div>
    <div class="field mt16"><span>Refeições</span><div class="chips">${MEALS.map((m) => `<button class="chip" data-a="gen-tog" data-k="meals" data-v="${m.id}" aria-pressed="${GS.meals.includes(m.id)}">${m.label}</button>`).join('')}</div></div>
    <div class="field mt16"><span>Proteínas que você topa</span><div class="chips">${chipList(prots, 'prot')}</div></div>
    <div class="field mt16"><span>Legumes e verduras</span><div class="chips">${chipList(vegs, 'veg')}</div></div>
    ${lc ? '' : `<div class="field mt16"><span>Carboidratos</span><div class="chips">${chipList(carbs, 'carb')}</div></div>`}
    <button class="habit mt12" data-a="gen-batch" aria-pressed="${GS.batch}" style="padding-left:0"><span class="box">${ic('check', 'sm')}</span><span><b>Modo marmita</b><br><small class="muted">Repete as proteínas em blocos para você cozinhar só duas vezes na semana</small></span></button>
    ${AI.s ? `<div class="panel mt16" style="box-shadow:none;background:var(--surface-2)">
      <span class="ai-mark">${ic('spark', 'sm')} Ou peça ao Claude</span>
      <p class="muted mt8" style="font-size:13.5px">Ele usa as mesmas escolhas acima e o que você escrever aqui. Depois o app ajusta os gramas para bater a meta.</p>
      <textarea class="input mt8" data-in="gen-text" placeholder="Ex.: comidas baratas, nada de peixe, jantar rápido de fazer, gosto de comida mineira" ${GS.busy ? 'disabled' : ''}>${esc(GS.text)}</textarea>
      ${GS.err ? `<p class="mt8" style="color:var(--tomato);font-size:13.5px">${esc(GS.err)}</p>` : ''}
      ${GS.busy ? `<div class="row mt12"><div class="spinner"></div><span class="grow muted">Montando… ${GS.prog ? `dia ${GS.prog} de 7` : 'pensando no cardápio'}</span><button class="btn btn-ghost btn-sm" data-a="gen-stop">Cancelar</button></div>`
        : `<button class="btn btn-carrot btn-block mt12" data-a="gen-ai">${ic('spark', 'sm')} Montar com o Claude</button>`}
    </div>` : ''}
    ${Store.core.plan && Store.core.plan.source !== 'original' ? `<button class="btn btn-ghost btn-sm mt12" data-a="plan-orig">${ic('refresh', 'sm')} Voltar ao meu cardápio original</button>` : ''}
  </div>
  <div class="sheet-f"><button class="btn btn-primary grow" data-a="gen-run" ${GS.busy || !GS.meals.length ? 'disabled' : ''}>${ic('refresh', 'sm')} Montar semana agora</button></div>`;
}
function applyPlan(plan, msg) {
  const prev = Store.core.plan ? clone(Store.core.plan) : null, prevP = { style: Store.p.style, meals: Store.p.meals };
  Store.core.plan = plan;
  if (plan.prefs) { Store.p.style = plan.prefs.style; Store.p.meals = [...plan.prefs.meals]; }
  Store.core.shop = { checked: {}, extra: (Store.core.shop && Store.core.shop.extra) || [], have: (Store.core.shop && Store.core.shop.have) || {} };
  if (Store.core.prep) Store.core.prep.done = {};
  Store.saveCore(); Sheet.close(true); ui.planTab = 'semana'; App.render(); window.scrollTo(0, 0);
  App.toast(msg, () => { Store.core.plan = prev; Object.assign(Store.p, prevP); Store.saveCore(); App.render(); });
}
async function genAI() {
  if (!AI.s || GS.busy) return;
  const tg = genTargets(), lc = GS.style === 'lowcarb';
  GS.busy = true; GS.err = ''; GS.prog = 0; Sheet.cur.keepScroll = true; Sheet.draw();
  const ctl = new AbortController(); GS.ctl = ctl;
  const ids = Object.keys(GEN).filter((id) => !lc || GEN[id].lc).concat((Store.core.customFoods || []).map((f) => f.id));
  const names = (arr) => arr.map((id) => splitName(food(id).n)[0]).join(', ');
  const mealsTxt = MEALS.filter((m) => GS.meals.includes(m.id)).map((m) => `${m.id} (${m.label})`).join(', ');
  const prompt = `Você é nutricionista no Brasil e vai montar um cardápio de 7 dias para emagrecimento, com comida de verdade e fácil de achar no mercado.
Metas por dia: ${tg.kcal} kcal e ${tg.protein} g de proteína.
Estilo: ${lc ? 'low-carb (sem arroz, pão, massas e açúcar; legumes à vontade; cenoura com moderação)' : 'equilibrado (arroz, feijão e tubérculos em porções controladas, sempre com proteína e salada)'}.
Refeições de cada dia (use exatamente estes ids como chaves): ${mealsTxt}.
Pesos: carnes, peixes e legumes CRUS; arroz, feijão, massas e tubérculos COZIDOS; azeite em ml.
Proteínas que a pessoa aceita: ${names(GS.prot)}. Legumes que ela gosta: ${names(GS.veg)}.${lc ? '' : ` Carboidratos preferidos: ${names(GS.carb)}.`}
${GS.batch ? 'Repita as proteínas do almoço e jantar em dois blocos (domingo a quarta, quinta a sábado) para a pessoa cozinhar só duas vezes.' : 'Varie bastante entre os dias.'}
Pedido da pessoa: ${GS.text.trim() || 'nenhum pedido extra'}.
Use só alimentos da tabela, pelo id, em quantidades realistas (múltiplos de 5 g). Inclua um modo de preparo curto em cada item quando fizer sentido.

Tabela (id|nome|kcal por 100|macros por 100|porções):
${AI.table(ids)}

Responda só com JSON, sem nada fora dele:
{"dias":[{"dica":"dica curta de tempero ou preparo do dia","refeicoes":{"almoco":[["frango_cru",250,"grelhado"],["brocolis_cru",200,"no vapor"],["azeite",10,""]]}}]}
"dias" tem exatamente 7 itens, na ordem: domingo, segunda, terça, quarta, quinta, sexta, sábado.`;
  try {
    const res = await AI.s.json(prompt, { signal: ctl.signal, onText: ({ text }) => { const n = (text.match(/"dica"/g) || []).length; if (n !== GS.prog && GS.busy) { GS.prog = Math.min(7, n); const el = document.querySelector('.sheet .spinner + span'); if (el) el.textContent = `Montando… dia ${GS.prog} de 7`; } } });
    const dias = res && Array.isArray(res.dias) ? res.dias : [];
    if (dias.length < 7) throw { code: 'invalid' };
    const days = dias.slice(0, 7).map((d) => {
      const meals = {};
      for (const m of GS.meals) {
        const arr = (d.refeicoes && d.refeicoes[m]) || [];
        meals[m] = arr.map((x) => (Array.isArray(x) ? { id: x[0], g: Number(x[1]), prep: x[2] } : { id: x.id, g: Number(x.g), prep: x.prep }))
          .filter((x) => food(x.id) && x.g > 0 && x.g < 1500).map((x) => (x.prep ? { id: x.id, g: Math.round(x.g / 5) * 5, prep: String(x.prep).slice(0, 40) } : { id: x.id, g: Math.round(x.g / 5) * 5 }));
      }
      return { tip: String(d.dica || '').slice(0, 220), meals };
    });
    if (days.some((d) => !Object.values(d.meals).some((a) => a.length))) throw { code: 'invalid' };
    const plan = fitPlanDays({ days, source: 'ia', at: Date.now(), prefs: { style: GS.style, meals: GS.meals, prot: GS.prot, veg: GS.veg, carb: GS.carb, batch: GS.batch } }, tg.kcal, tg.protein, GS.meals);
    GS.busy = false;
    applyPlan(plan, 'Cardápio do Claude pronto, já ajustado à sua meta');
  } catch (e) {
    if (!GS) return;
    GS.busy = false; GS.err = AI.errMsg(e); if (Sheet.cur) { Sheet.cur.keepScroll = true; Sheet.draw(); }
  }
}

/* ---------- item do cardápio */
let PI = null;
function piOpen(meal, idx, view = 'edit') {
  const it = Store.core.plan.days[ui.planDay].meals[meal][idx];
  PI = { meal, idx, g: it.g, prep: it.prep || '', view };
  Sheet.open({ label: 'Item do cardápio', tall: view === 'swap', render: piHTML });
}
function swapOptions(it) {
  const r = roleOf(it.id), main = ['P', 'K', 'B', 'D', 'R', 'G', 'N', 'V', 'S'].find((x) => r.includes(x));
  const lc = settings().style === 'lowcarb' && GEN[it.id] && GEN[it.id].lc;
  const kc = nutr(it.id, it.g).kcal, f0 = food(it.id);
  let ids = main ? Object.keys(GEN).filter((id) => id !== it.id && hasRole(id, main) && (!lc || GEN[id].lc)) : FOODS.filter((f) => f.cat === f0.cat && f.id !== it.id).map((f) => f.id);
  return ids.map((id) => {
    const f = food(id), spec = GEN[id];
    let g = f.k ? (kc * 100) / f.k : it.g;
    g = spec ? clamp(Math.round(g / spec.step) * spec.step, spec.min, spec.max * 1.5) : Math.max(5, Math.round(g / 5) * 5);
    return { id, g, n: nutr(id, g) };
  }).sort((a, b) => Math.abs(a.n.kcal - kc) - Math.abs(b.n.kcal - kc)).slice(0, 14);
}
function piHTML() {
  const it = Store.core.plan.days[ui.planDay].meals[PI.meal][PI.idx]; if (!it) return '';
  const f = food(it.id), [nm, st] = splitName(f.n);
  if (PI.view === 'swap') {
    const opts = swapOptions(it), kc = nutr(it.id, it.g).kcal;
    return `${sheetHead(`Trocar ${esc(nm.toLowerCase())}`, `Opções com calorias parecidas a ${unitLabel(it.id, it.g)} (${fmt(kc)} kcal)`, PI.fromEdit ? 'pi-back' : '')}
    <div class="sheet-b">${opts.map((o) => { const [on, os] = splitName(food(o.id).n); return `<div class="res"><button class="res-row" data-a="pi-swap" data-id="${o.id}" data-g="${o.g}">
      <span class="n"><b>${esc(on)}</b><small>${[os, `P ${fmt1(o.n.p)} g`].filter(Boolean).join(' · ')}</small></span><span class="kc num" style="color:var(--ink)">${unitLabel(o.id, o.g)}<br><small class="muted">${fmt(o.n.kcal)} kcal</small></span></button></div>`; }).join('') || '<p class="empty">Sem substitutos parecidos.</p>'}</div>`;
  }
  const spec = GEN[it.id], n = nutr(it.id, PI.g), preps = PREPS[it.id] || [];
  return `${sheetHead(esc(nm), `${mealById(PI.meal).label} de ${WD[ui.planDay].toLowerCase()}${st ? ' · ' + esc(st) : ''}`)}
  <div class="sheet-b"><div class="editor">
    <div class="qty"><button class="sbtn" data-a="pi-step" data-d="-1" aria-label="Menos">${ic('minus')}</button><input class="input num" data-in="pi-g" inputmode="decimal" value="${PI.g}" aria-label="Gramas"><button class="sbtn" data-a="pi-step" data-d="1" aria-label="Mais">${ic('plus')}</button></div>
    <div class="qty-sub">${f.u === 'ml' ? 'ml' : 'gramas'}${spec ? ` · passo de ${spec.step}` : ''}</div>
    <div class="nut" data-live="pi-nut">${nutHTML(n)}</div>
    ${preps.length ? `<div class="field"><span>Preparo</span><div class="chips">${preps.map((p) => `<button class="chip" data-a="pi-prep" data-v="${esc(p)}" aria-pressed="${PI.prep === p}">${esc(p)}</button>`).join('')}</div></div>` : ''}
  </div></div>
  <div class="sheet-f"><button class="icon-btn" data-a="pi-del" aria-label="Remover do cardápio" style="color:var(--tomato)">${ic('trash')}</button><button class="btn btn-soft" data-a="pi-toswap">${ic('swap', 'sm')} Trocar</button><button class="btn btn-primary grow" data-a="pi-save">Salvar</button></div>`;
}

/* ---------- copiar dia, compartilhar, confirmações, backup */
function copyDayOpen() {
  const sel = new Set();
  Sheet.open({ label: 'Copiar dia', render: () => `${sheetHead(`Copiar ${WD[ui.planDay].toLowerCase()}`, 'Escolha os dias que vão receber as mesmas refeições')}
    <div class="sheet-b"><div class="chips">${WD.map((d, i) => i === ui.planDay ? '' : `<button class="chip" data-a="cd-tog" data-i="${i}" aria-pressed="${sel.has(i)}">${d}</button>`).join('')}</div></div>
    <div class="sheet-f"><button class="btn btn-primary grow" data-a="cd-go" ${sel.size ? '' : 'disabled'}>Copiar</button></div>`, sel });
}
function textOpen(title, sub, text, extra = '') {
  Sheet.open({ label: title, render: () => `${sheetHead(title, sub)}
    <div class="sheet-b"><textarea class="input" id="share-text" style="min-height:260px;font-size:14px" readonly>${esc(text)}</textarea></div>
    <div class="sheet-f">${extra}<button class="btn btn-primary grow" data-a="copy-text">${ic('copy', 'sm')} Copiar</button></div>` });
}
function confirmOpen(title, body, okLabel, onOk, danger) {
  Sheet.open({ label: title, render: () => `${sheetHead(title)}<div class="sheet-b"><p class="muted">${body}</p></div>
    <div class="sheet-f"><button class="btn btn-soft grow" data-a="sheet-close">Cancelar</button><button class="btn ${danger ? 'btn-carrot' : 'btn-primary'} grow" data-a="confirm-ok">${okLabel}</button></div>`, onOk });
}
function shopText() {
  const sh = shopS(), list = planIsEmpty(Store.core.plan) ? [] : shoppingList(Store.core.plan), ex = sh.extra, ck = sh.checked;
  let out = '🛒 Lista da semana (BioTrack)\n', sec = '';
  for (const it of list) { if (ck[it.key] || sh.have[it.key]) continue; if (it.s !== sec) { sec = it.s; out += `\n*${sec}*\n`; } out += `▢ ${it.n} — ${sh.qty[it.key] || it.buy}\n`; }
  const exl = ex.filter((x) => !ck[x.id]); if (exl.length) out += `\n*Extras*\n` + exl.map((x) => `▢ ${x.n}${x.q ? ' — ' + x.q : ''}`).join('\n') + '\n';
  return out.trim();
}
async function doExport() {
  const data = JSON.stringify({ app: 'biotrack', v: 4, exportedAt: new Date().toISOString(), ...Store.s }, null, 1);
  const name = `biotrack-backup-${todayISO()}.json`;
  try {
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename: name, data }); App.toast('Backup salvo'); return; }
  } catch (e) { if (e && e.code && e.code !== 'unavailable') { App.toast('Download cancelado'); return; } }
  try {
    // navegador comum: baixa como arquivo .json
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    App.toast(`Backup salvo: ${name}`); return;
  } catch (e) {}
  textOpen('Backup', 'Copie e guarde este texto num lugar seguro', data);
}
function importOpen() {
  Sheet.open({ label: 'Importar backup', render: () => `${sheetHead('Importar backup', 'Aceita backups deste app e da versão anterior do BioTrack')}
    <div class="sheet-b"><button class="btn btn-soft btn-block" data-a="import-file">${ic('upload', 'sm')} Escolher arquivo .json</button>
    <p class="muted mt12" style="font-size:13.5px">Ou cole o conteúdo do backup:</p><textarea class="input mt8" id="import-text" style="min-height:160px" placeholder="{ ... }"></textarea></div>
    <div class="sheet-f"><button class="btn btn-primary grow" data-a="import-go">Importar</button></div>` });
}
function convertImport(raw) {
  if (raw && raw.core && raw.core.profile && raw.days) return { core: raw.core, days: raw.days };
  if (raw && raw.users) { // BioTrack Pro (v3)
    const u = raw.users[raw.activeUserId] || Object.values(raw.users)[0]; if (!u) return null;
    const p = u.profile || {};
    const age = p.birthDate ? Math.max(14, new Date().getFullYear() - Number(p.birthDate.slice(0, 4))) : 30;
    const days = {};
    for (const [dt, d] of Object.entries(u.days || {})) {
      days[dt] = { foods: (d.foods || []).map((e) => ({ id: e.id || uid(), fid: e.foodId || null, n: e.name, meal: e.meal || 'almoco', g: e.grams || 0, u: e.unit || 'g', kcal: e.kcal || 0, p: e.p || 0, c: e.c || 0, f: e.f || 0 })),
        ex: (d.exercises || []).map((e) => ({ id: e.id || uid(), exId: e.exId, n: e.name, met: e.met, min: e.minutes, kcal: e.kcal })), water: d.water || 0, habits: {}, _u: Date.now() };
    }
    const core = newCore({ name: p.name || '', sex: p.sex || 'M', age, height: p.height || 170, weight: p.weight || 80, goalWeight: p.goalWeight || (p.weight || 80) - 8, activity: p.activity || 'sedentario', pace: p.pace ?? 0.5, waist: p.waist || null, neck: p.neck || null });
    Object.assign(core.profile, { hip: p.hip || null, bmrFormula: p.bmrFormula || 'mifflin', bmrManual: p.bmrManual || null, customTarget: p.customTarget || null });
    if (u.weights && u.weights.length) core.weights = u.weights.map((w) => ({ id: w.id || uid(), date: w.date, weight: w.weight, waist: w.waist || null }));
    core.customFoods = (u.customFoods || []).map((f) => ({ ...f, custom: true, por: f.por || [], u: f.u || 'g' }));
    return { core, days };
  }
  if (raw && raw.profile && raw.logs) { // BioTrack Mobile (v2)
    const p = raw.profile;
    const core = newCore({ name: '', sex: 'M', age: p.age || 30, height: p.height || 170, weight: p.weight || 80, goalWeight: (p.weight || 80) - 10, activity: 'sedentario', pace: 0.5, waist: p.waist || null, neck: p.neck || null });
    core.weights = raw.logs.map((l) => ({ id: l.id || uid(), date: l.date, weight: l.weight, waist: l.waist || null }));
    return { core, days: {} };
  }
  return null;
}
function doImport(text) {
  let raw; try { raw = JSON.parse(text); } catch (e) { App.toast('Esse texto não é um backup válido'); return; }
  const r = convertImport(raw); if (!r) { App.toast('Não reconheci o formato do backup'); return; }
  r.core._u = Date.now(); Store.s = { core: r.core, days: r.days }; Store.syncProfile(); resetFoodCache();
  Store.persist(); Sync.mark('core'); Object.keys(r.days).forEach((k) => { r.days[k]._u = Date.now(); Sync.mark('d_' + k); });
  ui.booting = false; Sheet.close(true); App.applyTheme(); App.go('hoje'); App.render(); App.toast('Backup importado');
}
function newCore(o) {
  return {
    profile: { name: o.name, sex: o.sex, age: o.age, height: o.height, weight: o.weight, goalWeight: o.goalWeight, activity: o.activity, pace: o.pace, waist: o.waist, neck: o.neck, hip: null, bmrFormula: 'mifflin', bmrManual: null, customTarget: null, style: 'lowcarb', meals: ['almoco', 'lanche', 'jantar'], waterPerKg: 35, theme: 'auto' },
    weights: [{ id: uid(), date: todayISO(), weight: o.weight, waist: o.waist || null }],
    habits: [{ id: 'multivit', n: 'Multivitamínico depois do almoço' }, { id: 'azeite', n: 'Azeite: no máximo 2 colheres de sopa' }],
    customFoods: [], recent: [], shop: { checked: {}, extra: [], have: {}, qty: {} },
    plan: { days: emptyWeek(), source: 'vazio', at: Date.now() },
    created: todayISO(),
  };
}

