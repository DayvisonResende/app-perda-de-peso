/* ===================== AÇÕES ===================== */
function logItemsToDiary(date, meal, items, label) {
  const day = Store.dayW(date), ids = [];
  for (const it of items) {
    const f = food(it.id); if (!f) continue;
    const n = nutr(it.id, it.g);
    const e = { id: uid(), fid: it.id, n: f.n, meal, g: it.g, u: f.u, kcal: n.kcal, p: n.p, c: n.c, f: n.f };
    day.foods.push(e); ids.push(e.id); Store.pushRecent(it.id, it.g);
  }
  Store.saveDay(date); Store.saveCore(); App.render();
  App.toast(label || `${mealById(meal).label} registrado`, () => { const d = Store.dayW(date); d.foods = d.foods.filter((e) => !ids.includes(e.id)); Store.saveDay(date); App.render(); });
}
function readNum(id) { const el = document.getElementById(id); return el ? num(el.value) : null; }

const A = {
  tab: (el) => App.go(el.dataset.tab),
  undo: () => { const u = App._undo; App._undo = null; $('#toast').classList.remove('show'); if (u) u(); },
  'sheet-close': () => Sheet.close(),
  date: (el) => { const n = addDays(ui.date, Number(el.dataset.d)); if (n <= todayISO()) { ui.date = n; App.render(); } },
  water: (el) => { const d = Store.dayW(ui.date); d.water = Math.max(0, (d.water || 0) + Number(el.dataset.v)); Store.saveDay(ui.date); App.render(); },
  habit: (el) => { const d = Store.dayW(ui.date); d.habits[el.dataset.id] = !d.habits[el.dataset.id]; Store.saveDay(ui.date); App.render(); },
  'eat-plan': (el) => { const pd = planDay(ui.date); const items = pd && pd.meals[el.dataset.meal]; if (items) logItemsToDiary(ui.date, el.dataset.meal, items); },
  'fp-open': (el) => fpOpen({ kind: 'diary', date: ui.date, meal: el.dataset.meal }),
  'fp-plan': (el) => { const pd = planDay(ui.date); fpOpen({ kind: 'diary', date: ui.date, meal: el.dataset.meal }, pd.meals[el.dataset.meal]); },
  'fp-planadd': (el) => fpOpen({ kind: 'plan', day: ui.planDay, meal: el.dataset.m }),
  'fp-meal': (el) => { FP.target.meal = el.dataset.v; fpSaveDraft(); fpRedraw(true); },
  'fp-src': (el) => { FP.src = el.dataset.v; FP.q = ''; FP.open = null; FP.view = 'list'; Sheet.draw(); if (FP.src === 'ai') setTimeout(() => { const t = document.querySelector('[data-in="fp-ai"]'); if (t) t.focus(); }, 30); },
  'fp-view': (el) => { FP.view = el.dataset.v; FP.open = null; fpRedraw(); },
  'fp-pick': (el) => {
    const id = el.dataset.id;
    if (FP.open === id) { FP.open = null; FP.ed = null; } else { FP.open = id; FP.ed = edDefault(id); }
    fpRedraw();
    const row = document.querySelector('.res.open'); if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  'fe-por': (el) => { edSetPor(FP.open, FP.ed, Number(el.dataset.i)); fpRedraw(); },
  'fe-step': (el) => { edStep(FP.open, FP.ed, Number(el.dataset.d)); const i = document.querySelector('[data-in="fe-qty"]'); if (i) i.value = FP.ed.por >= 0 ? fmt1(FP.ed.qty) : fmt(FP.ed.g); edLive(FP.open, FP.ed, 'fe'); },
  'fp-add': () => {
    const fid = FP.open, g = Math.round(edGrams(fid, FP.ed)); if (!g) return;
    fpAddToTray(FP.ed.por >= 0 ? { fid, g, por: FP.ed.por, qty: FP.ed.qty } : { fid, g });
  },
  'fp-addplan': (el) => {
    const pd = planDay(FP.target.date); const items = pd.meals[el.dataset.m] || [];
    items.forEach((it) => FP.tray.push({ tid: uid(), fid: it.id, g: it.g }));
    FP.trayOpen = true; fpSaveDraft(); FP.src = 'all'; fpRedraw(true);
    App.toast(`${items.length} itens na bandeja`);
  },
  'fp-traytoggle': () => { FP.trayOpen = !FP.trayOpen; fpRedraw(true); },
  'tr-step': (el) => {
    const x = FP.tray.find((t) => t.tid === el.dataset.t); if (!x) return; const d = Number(el.dataset.d), f = food(x.fid);
    if (x.por != null && f.por[x.por]) { x.qty = Math.max(0.5, x.qty + d * 0.5); x.g = Math.round(f.por[x.por][1] * x.qty); }
    else { const st = x.g >= 100 ? 25 : 10; x.g = Math.max(st, Math.round((x.g + d * st) / st) * st); }
    fpSaveDraft(); fpRedraw(true);
  },
  'tr-del': (el) => { FP.tray = FP.tray.filter((t) => t.tid !== el.dataset.t); if (!FP.tray.length) FP.trayOpen = false; fpSaveDraft(); fpRedraw(true); },
  'fp-commit': () => fpCommit(),
  'fp-discard': () => { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} FP.tray = []; Sheet.close(true); },
  'fp-keep': () => { FP.confirm = false; fpRedraw(true); },
  'fp-quick-add': () => {
    const k = readNum('qk-k'); if (!k || k <= 0) { App.toast('Informe as calorias'); return; }
    const n = ($('#qk-n').value || '').trim() || 'Lançamento rápido';
    FP.view = 'list'; fpAddToTray({ adhoc: { n, kcal: k, p: readNum('qk-p') || 0, c: readNum('qk-c') || 0, f: readNum('qk-f') || 0 }, g: 0 });
  },
  'fp-custom-save': () => {
    const n = ($('#cf-n').value || '').trim(), k = readNum('cf-k');
    if (!n || k == null) { App.toast('Preencha pelo menos o nome e as calorias'); return; }
    const u = $('#cf-u').value, pn = ($('#cf-pn').value || '').trim(), pg = readNum('cf-pg');
    const f = { id: 'u_' + uid(), n, cat: 'meus', k, p: readNum('cf-p') || 0, c: readNum('cf-c') || 0, f: readNum('cf-f') || 0, por: pn && pg ? [[pn, pg]] : [], u, custom: true };
    Store.core.customFoods = [f, ...(Store.core.customFoods || [])]; Store.saveCore(); resetFoodCache();
    FP.view = 'list'; FP.src = 'mine'; FP.open = f.id; FP.ed = edDefault(f.id); fpRedraw(true);
  },
  'fp-ai-run': () => fpAIRun(),
  'fp-ai-stop': () => { if (FP.ai.ctl) FP.ai.ctl.abort(); },
  'entry-edit': (el) => entryOpen(el.dataset.id),
  'ee-meal': (el) => { EE.meal = el.dataset.v; Sheet.draw(); },
  'ee-por': (el) => { const e = Store.day(ui.date).foods.find((x) => x.id === EE.id); edSetPor(e.fid, EE.ed, Number(el.dataset.i)); Sheet.draw(); },
  'ee-step': (el) => { const e = Store.day(ui.date).foods.find((x) => x.id === EE.id); edStep(e.fid, EE.ed, Number(el.dataset.d)); const i = document.querySelector('[data-in="ee-qty"]'); if (i) i.value = EE.ed.por >= 0 ? fmt1(EE.ed.qty) : fmt(EE.ed.g); edLive(e.fid, EE.ed, 'ee'); },
  'ee-save': () => {
    const d = Store.dayW(ui.date), e = d.foods.find((x) => x.id === EE.id); if (!e) return;
    e.meal = EE.meal;
    if (e.fid && food(e.fid)) {
      const f = food(e.fid), g = Math.round(edGrams(e.fid, EE.ed)), n = nutr(e.fid, g);
      Object.assign(e, { g, kcal: n.kcal, p: n.p, c: n.c, f: n.f });
      if (EE.ed.por >= 0) { e.por = f.por[EE.ed.por]; e.qty = EE.ed.qty; } else { delete e.por; delete e.qty; }
    } else if (EE.kcal > 0) { const r = EE.kcal / (e.kcal || EE.kcal); e.p *= r; e.c *= r; e.f *= r; e.kcal = EE.kcal; }
    Store.saveDay(ui.date); Sheet.close(true); App.render(); App.toast('Item atualizado');
  },
  'ee-del': () => {
    const d = Store.dayW(ui.date), i = d.foods.findIndex((x) => x.id === EE.id); if (i < 0) return;
    const [rm] = d.foods.splice(i, 1); Store.saveDay(ui.date); Sheet.close(true); App.render();
    App.toast('Item excluído', () => { Store.dayW(ui.date).foods.splice(i, 0, rm); Store.saveDay(ui.date); App.render(); });
  },
  'ex-open': () => exOpen(),
  'ex-pick': (el) => { XS.open = XS.open === el.dataset.id ? null : el.dataset.id; $('#ex-results').innerHTML = exResults(); },
  'ex-step': (el) => { XS.min = Math.max(5, XS.min + Number(el.dataset.d) * 5); const i = document.querySelector('[data-in="ex-min"]'); if (i) i.value = XS.min; exLive(); },
  'ex-add': () => {
    const e = EXERCISES.find((x) => x.id === XS.open); if (!e || !XS.min) return;
    const d = Store.dayW(ui.date); d.ex.push({ id: uid(), exId: e.id, n: e.n, met: e.met, min: XS.min, kcal: Calc.exKcal(e.met, Store.weightOn(ui.date), XS.min) });
    Store.saveDay(ui.date); XS.open = null; Sheet.draw(); App.render(); App.toast(`${e.n} adicionado`);
  },
  'ex-del': (el) => { const d = Store.dayW(ui.date); d.ex = d.ex.filter((x) => x.id !== el.dataset.id); Store.saveDay(ui.date); App.render(); },
  'meas-open': () => measOpen(),
  'meas-edit': (el) => measOpen(el.dataset.d),
  'meas-save': () => {
    const date = $('#ms-date').value; if (!date) { App.toast('Escolha a data'); return; }
    const rec = { date }; let n = 0;
    for (const m of MEASURES) { const v = readNum('ms-' + m.k); if (v) { if (v < 10 || v > 250) { App.toast(`Confira ${m.n.toLowerCase()} (em cm)`); return; } rec[m.k] = v; n++; } }
    if (!n) { App.toast('Preencha pelo menos uma medida'); return; }
    const c = Store.core; c.measures = (c.measures || []).filter((m) => m.date !== date && m.date !== MS.date);
    c.measures.push({ id: uid(), ...rec });
    // a cintura da pesagem do mesmo dia passa a vir daqui
    for (const w of c.weights) if (w.date === date || w.date === MS.date) w.waist = rec.waist || null;
    Store.syncProfile(); Store.saveCore(); Sheet.close(true); App.render(); App.toast('Medidas salvas');
  },
  'meas-del': () => {
    const c = Store.core, d = MS.date, prevM = clone(c.measures || []), prevW = c.weights.map((w) => ({ id: w.id, waist: w.waist }));
    c.measures = prevM.filter((m) => m.date !== d); for (const w of c.weights) if (w.date === d) w.waist = null;
    Store.syncProfile(); Store.saveCore(); Sheet.close(true); App.render();
    App.toast('Medidas excluídas', () => { c.measures = prevM; for (const w of c.weights) { const o = prevW.find((x) => x.id === w.id); if (o) w.waist = o.waist; } Store.syncProfile(); Store.saveCore(); App.render(); });
  },
  'weight-open': () => weightOpen(),
  'weight-edit': (el) => weightOpen(el.dataset.id),
  'ws-save': () => {
    const date = $('#ws-date').value, w = readNum('ws-w'), wa = readNum('ws-waist');
    if (!date || !w || w < 30 || w > 300) { App.toast('Confira o peso'); return; }
    const ws = Store.core.weights;
    let ex = WS.id ? ws.find((x) => x.id === WS.id) : ws.find((x) => x.date === date);
    if (ex) Object.assign(ex, { date, weight: w, waist: wa || null }); else ws.push({ id: uid(), date, weight: w, waist: wa || null });
    const mrec = (Store.core.measures || []).find((m) => m.date === date); if (mrec) { if (wa) mrec.waist = wa; else delete mrec.waist; }
    Store.syncProfile(); Store.saveCore(); Sheet.close(true); App.render(); App.toast('Pesagem salva');
  },
  'ws-del': () => { Store.core.weights = Store.core.weights.filter((x) => x.id !== WS.id); Store.syncProfile(); Store.saveCore(); Sheet.close(true); App.render(); App.toast('Pesagem excluída'); },
  ptab: (el) => { ui.planTab = el.dataset.t; App.render(); },
  'prep-rounds': (el) => { prepS().rounds = Number(el.dataset.n); Store.saveCore(); App.render(); },
  'prep-step': (el) => { const ps = prepS(), k = el.dataset.k; if (ps.done[k]) delete ps.done[k]; else ps.done[k] = 1; Store.saveCore(); const y = window.scrollY; App.render(); window.scrollTo(0, y); },
  'prep-reset': () => { const ps = prepS(); ps.done = {}; Store.saveCore(); App.render(); },
  pday: (el) => { ui.planDay = Number(el.dataset.i); ui.planExtra = null; App.render(); },
  pitem: (el) => piOpen(el.dataset.m, Number(el.dataset.x)),
  pswap: (el) => piOpen(el.dataset.m, Number(el.dataset.x), 'swap'),
  'pi-step': (el) => { const it = Store.core.plan.days[ui.planDay].meals[PI.meal][PI.idx], st = (GEN[it.id] && GEN[it.id].step) || 10; PI.g = Math.max(st, PI.g + Number(el.dataset.d) * st); const i = document.querySelector('[data-in="pi-g"]'); if (i) i.value = PI.g; const nu = document.querySelector('[data-live="pi-nut"]'); if (nu) nu.innerHTML = nutHTML(nutr(it.id, PI.g)); },
  'pi-prep': (el) => { PI.prep = PI.prep === el.dataset.v ? '' : el.dataset.v; Sheet.draw(); },
  'pi-save': () => { const it = Store.core.plan.days[ui.planDay].meals[PI.meal][PI.idx]; it.g = PI.g; if (PI.prep) it.prep = PI.prep; else delete it.prep; Store.saveCore(); Sheet.close(true); App.render(); },
  'pi-del': () => {
    const arr = Store.core.plan.days[ui.planDay].meals[PI.meal], [rm] = arr.splice(PI.idx, 1), day = ui.planDay, meal = PI.meal, idx = PI.idx;
    Store.saveCore(); Sheet.close(true); App.render();
    App.toast('Item removido do cardápio', () => { Store.core.plan.days[day].meals[meal].splice(idx, 0, rm); Store.saveCore(); App.render(); });
  },
  'pi-toswap': () => { PI.view = 'swap'; PI.fromEdit = true; Sheet.cur.tall = true; Sheet.draw(); },
  'pi-back': () => { PI.view = 'edit'; Sheet.cur.tall = false; Sheet.draw(); },
  'pi-swap': (el) => {
    const arr = Store.core.plan.days[ui.planDay].meals[PI.meal], old = arr[PI.idx], id = el.dataset.id, g = Number(el.dataset.g);
    const nw = { id, g }; const pr = PREPS[id]; if (pr) nw.prep = pr[0];
    arr[PI.idx] = nw; Store.saveCore(); Sheet.close(true); App.render();
    const day = ui.planDay, meal = PI.meal, idx = PI.idx;
    App.toast(`Trocado por ${splitName(food(id).n)[0].toLowerCase()}`, () => { Store.core.plan.days[day].meals[meal][idx] = old; Store.saveCore(); App.render(); });
  },
  'plan-log': (el) => { const items = Store.core.plan.days[ui.planDay].meals[el.dataset.m]; logItemsToDiary(todayISO(), el.dataset.m, items, `${mealById(el.dataset.m).label} registrado no diário de hoje`); },
  'plan-fit': () => {
    const prev = clone(Store.core.plan), d = computeDay(todayISO());
    const meals = [...new Set(Store.core.plan.days.flatMap((x) => Object.keys(x.meals)))];
    fitPlanDays(Store.core.plan, d.plan.target, d.macros.protein, meals);
    if (Store.core.plan.source === 'original') Store.core.plan.source = 'ajustado';
    Store.core.plan.at = Date.now(); Store.saveCore(); App.render();
    App.toast('Quantidades ajustadas à sua meta', () => { Store.core.plan = prev; Store.saveCore(); App.render(); });
  },
  'plan-reday': () => {
    const s = settings(), pr = Store.core.plan.prefs || {}, d = computeDay(todayISO());
    const cur = Object.keys(Store.core.plan.days[ui.planDay].meals).filter((k) => Store.core.plan.days[ui.planDay].meals[k].length);
    const style = pr.style || s.style, meals = pr.meals || (cur.length ? cur : s.meals), wasEmpty = !cur.length;
    const tmp = buildPlan({ style, meals, kcal: d.plan.target, protein: Calc.macros(d.plan.target, d.weight, Store.p.goalWeight, style).protein, prot: pr.prot || GEN_DEFAULTS.prot, veg: pr.veg || GEN_DEFAULTS.veg, carb: pr.carb || GEN_DEFAULTS.carb, batch: false, seed: Date.now() });
    const prev = clone(Store.core.plan.days[ui.planDay]), di = ui.planDay;
    Store.core.plan.days[di] = tmp.days[(di + Math.floor(Math.random() * 7)) % 7];
    Store.saveCore(); App.render();
    App.toast(`${WD[di]} ${wasEmpty ? 'sugerido' : 'refeito'}`, () => { Store.core.plan.days[di] = prev; Store.saveCore(); App.render(); });
  },
  'plan-copy': () => copyDayOpen(),
  'plan-clear': () => {
    confirmOpen('Limpar a semana?', 'Todos os alimentos dos 7 dias saem do cardápio, e a lista de compras e o preparo ficam vazios. Dá para desfazer logo em seguida.', 'Limpar semana', () => applyPlan({ days: emptyWeek(), source: 'vazio', at: Date.now() }, 'Semana limpa'), true);
  },
  'plan-addmeal': (el) => { ui.planExtra = el.dataset.m; fpOpen({ kind: 'plan', day: ui.planDay, meal: el.dataset.m }); },
  'cd-tog': (el) => { const s = Sheet.cur.sel, i = Number(el.dataset.i); s.has(i) ? s.delete(i) : s.add(i); Sheet.draw(); },
  'cd-go': () => {
    const sel = [...Sheet.cur.sel], prev = clone(Store.core.plan), src = Store.core.plan.days[ui.planDay];
    sel.forEach((i) => { Store.core.plan.days[i] = clone(src); });
    Store.saveCore(); Sheet.close(true); App.render();
    App.toast(`Copiado para ${sel.length} ${sel.length > 1 ? 'dias' : 'dia'}`, () => { Store.core.plan = prev; Store.saveCore(); App.render(); });
  },
  'gen-open': () => genOpen(),
  'gen-style': (el) => { GS.style = el.dataset.v; Sheet.cur.keepScroll = true; Sheet.draw(); },
  'gen-tog': (el) => { const arr = GS[el.dataset.k], v = el.dataset.v, i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); Sheet.cur.keepScroll = true; Sheet.draw(); },
  'gen-batch': () => { GS.batch = !GS.batch; Sheet.cur.keepScroll = true; Sheet.draw(); },
  'gen-run': () => {
    const tg = genTargets();
    if (!GS.prot.some((id) => hasRole(id, 'P'))) { App.toast('Escolha pelo menos uma carne, frango ou peixe'); return; }
    const plan = buildPlan({ style: GS.style, meals: GS.meals, kcal: tg.kcal, protein: tg.protein, prot: GS.prot, veg: GS.veg, carb: GS.carb, batch: GS.batch, seed: Date.now() });
    applyPlan(plan, 'Semana montada na sua meta');
  },
  'gen-ai': () => genAI(),
  'gen-stop': () => { if (GS.ctl) GS.ctl.abort(); },
  'plan-orig': () => applyPlan({ days: clone(ORIGINAL_PLAN), source: 'original', at: Date.now(), prefs: { style: 'lowcarb', meals: ['almoco', 'lanche', 'jantar'], prot: GEN_DEFAULTS.prot, veg: GEN_DEFAULTS.veg, carb: GEN_DEFAULTS.carb, batch: true } }, 'Cardápio original de volta'),
  shop: (el) => { const s = Store.core.shop || (Store.core.shop = { checked: {}, extra: [] }); s.checked[el.dataset.k] = !s.checked[el.dataset.k]; Store.saveCore(); el.setAttribute('aria-pressed', !!s.checked[el.dataset.k]); clearTimeout(A._st); A._st = setTimeout(() => { if (ui.tab === 'cardapio') { const y = window.scrollY; App.render(); window.scrollTo(0, y); } }, 700); },
  'shop-edit': (el) => shopEditOpen(el.dataset.k),
  'shop-back': (el) => { delete shopS().have[el.dataset.k]; Store.saveCore(); App.render(); },
  'se-reset': () => { delete shopS().qty[SE.k]; Store.saveCore(); Sheet.close(true); App.render(); },
  'se-save': () => {
    const s = shopS(), q = ($('#se-q')?.value || '').trim(), ex = s.extra.find((x) => x.id === SE.k);
    if (ex) { const n = ($('#se-n')?.value || '').trim(); if (n) ex.n = n; if (q) ex.q = q; else delete ex.q; }
    else { const it = shoppingList(Store.core.plan).find((x) => x.key === SE.k); if (q && it && q !== it.buy) s.qty[SE.k] = q; else delete s.qty[SE.k]; }
    Store.saveCore(); Sheet.close(true); App.render();
  },
  'se-have': () => {
    const s = shopS(), k = SE.k; s.have[k] = true; delete s.checked[k]; Store.saveCore(); Sheet.close(true); App.render();
    App.toast('Movido para "Já tenho em casa"', () => { delete shopS().have[k]; Store.saveCore(); App.render(); });
  },
  'se-del': () => {
    const s = shopS(), i = s.extra.findIndex((x) => x.id === SE.k); if (i < 0) return;
    const [rm] = s.extra.splice(i, 1); Store.saveCore(); Sheet.close(true); App.render();
    App.toast('Item removido da lista', () => { shopS().extra.splice(i, 0, rm); Store.saveCore(); App.render(); });
  },
  'shop-clear': () => { Store.core.shop.checked = {}; Store.saveCore(); App.render(); },
  'shop-add': () => { const i = $('#shop-extra'), v = (i.value || '').trim(); if (!v) return; const s = Store.core.shop || (Store.core.shop = { checked: {}, extra: [] }); s.extra = [...(s.extra || []), { id: 'e_' + uid(), n: v }]; Store.saveCore(); App.render(); setTimeout(() => { const n = $('#shop-extra'); if (n) n.focus(); }, 20); },
  'shop-del': (el) => { Store.core.shop.extra = Store.core.shop.extra.filter((x) => x.id !== el.dataset.id); Store.saveCore(); App.render(); },
  'shop-share': () => { const t = shopText(); textOpen('Enviar lista', 'Itens já marcados ficam de fora', t, `<a class="btn btn-soft" href="https://wa.me/?text=${encodeURIComponent(t)}" target="_blank" rel="noopener">WhatsApp</a>`); },
  'copy-text': async () => {
    const ta = $('#share-text'); if (!ta) return;
    try { await navigator.clipboard.writeText(ta.value); App.toast('Copiado'); }
    catch (e) { ta.removeAttribute('readonly'); ta.focus(); ta.select(); try { document.execCommand('copy'); App.toast('Copiado'); } catch (e2) { App.toast('Selecionei o texto: use Ctrl+C ou copiar'); } ta.setAttribute('readonly', ''); }
  },
  'confirm-ok': () => { const f = Sheet.cur.onOk; Sheet.close(true); if (f) f(); },
  'pf-pace': (el) => { Store.p.pace = Number(el.dataset.v); Store.saveCore(); App.render(); },
  'pf-style': (el) => { Store.p.style = el.dataset.v; Store.saveCore(); App.render(); },
  'pf-meal': (el) => { const s = settings(), v = el.dataset.v; let m = [...s.meals]; m = m.includes(v) ? m.filter((x) => x !== v) : [...m, v]; if (!m.length) return; Store.p.meals = MEALS.map((x) => x.id).filter((x) => m.includes(x)); Store.saveCore(); App.render(); },
  'pf-theme': (el) => { Store.p.theme = el.dataset.v; Store.saveCore(); App.applyTheme(); App.render(); },
  'habit-add': () => { const i = $('#habit-new'), v = (i.value || '').trim(); if (!v) return; Store.core.habits = [...(Store.core.habits || []), { id: 'h_' + uid(), n: v }]; Store.saveCore(); App.render(); },
  'habit-del': (el) => { Store.core.habits = Store.core.habits.filter((h) => h.id !== el.dataset.id); Store.saveCore(); App.render(); },
  export: () => doExport(),
  import: () => importOpen(),
  'import-file': () => $('#import-file').click(),
  'import-go': () => { const t = ($('#import-text').value || '').trim(); if (t) doImport(t); },
  wipe: () => confirmOpen('Apagar todos os dados?', 'Perfil, pesagens, diário e cardápio serão apagados deste aparelho e da sua conta. Exporte um backup antes se quiser guardar.', 'Apagar tudo', async () => {
    await Sync.wipe(); try { localStorage.removeItem(LS_KEY); localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    Store.s = { core: null, days: {} }; ui.booting = false; App.applyTheme(); App.render();
  }, true),
  'ob-pace': (el) => { document.querySelectorAll('#ob-pace .chip').forEach((c) => c.setAttribute('aria-pressed', c === el)); },
  'ob-start': () => {
    const g = (id) => document.getElementById('ob-' + id);
    const weight = num(g('weight').value), height = num(g('height').value), age = num(g('age').value), goal = num(g('goal').value);
    if (!weight || weight < 30 || !height || height < 120 || !age || age < 14 || !goal) { App.toast('Confira peso, altura, idade e meta'); return; }
    const pace = Number((document.querySelector('#ob-pace [aria-pressed="true"]') || {}).dataset?.v || 0.5);
    Store.s.core = newCore({ name: g('name').value.trim(), sex: g('sex').value, age, height, weight, goalWeight: goal, activity: g('act').value, pace, waist: num(g('waist').value), neck: num(g('neck').value) });
    Store.saveCore(); App.go('hoje'); App.render();
  },
};
function exLive() {
  const e = EXERCISES.find((x) => x.id === XS.open), el = document.querySelector('[data-live="ex-k"]');
  if (e && el) el.textContent = `${fmt(Calc.exKcal(e.met, Store.weightOn(ui.date), XS.min))} kcal`;
}

const INPUTS = {
  'fp-q': (el) => { FP.q = el.value; FP.open = null; FP.view = 'list'; fpRedraw(); document.querySelectorAll('[data-a="fp-src"]').forEach((c) => c.setAttribute('aria-pressed', !FP.q && c.dataset.v === FP.src)); },
  'fe-qty': (el) => { const v = num(el.value); if (v == null || v <= 0) return; if (FP.ed.por >= 0) FP.ed.qty = v; else FP.ed.g = v; edLive(FP.open, FP.ed, 'fe'); },
  'ee-qty': (el) => { const v = num(el.value); if (v == null || v <= 0) return; const e = Store.day(ui.date).foods.find((x) => x.id === EE.id); if (EE.ed.por >= 0) EE.ed.qty = v; else EE.ed.g = v; edLive(e.fid, EE.ed, 'ee'); },
  'ee-kcal': (el) => { EE.kcal = num(el.value) || 0; },
  'fp-ai': (el) => { FP.ai.text = el.value; },
  'gen-text': (el) => { GS.text = el.value; },
  'ex-q': (el) => { XS.q = el.value; XS.open = null; $('#ex-results').innerHTML = exResults(); },
  'ex-min': (el) => { const v = num(el.value); if (v > 0) { XS.min = Math.round(v); exLive(); } },
  'pi-g': (el) => { const v = num(el.value); if (v > 0) { PI.g = Math.round(v); const it = Store.core.plan.days[ui.planDay].meals[PI.meal][PI.idx]; const nu = document.querySelector('[data-live="pi-nut"]'); if (nu) nu.innerHTML = nutHTML(nutr(it.id, PI.g)); } },
};

const PF_RULES = { age: [14, 100], height: [120, 230], neck: [20, 70], hip: [60, 180], goalWeight: [35, 250], customTarget: [800, 6000], waterPerKg: [20, 60], bmrManual: [600, 5000] };
function onProfileChange(el) {
  const k = el.dataset.pf, p = Store.p;
  if (k === 'name') p.name = el.value.trim().slice(0, 40);
  else if (k === 'sex' || k === 'activity' || k === 'bmrFormula') { p[k] = el.value; Store.saveCore(); App.render(); return; }
  else {
    const v = num(el.value), r = PF_RULES[k];
    if (el.value.trim() === '' && ['customTarget', 'neck', 'hip', 'bmrManual'].includes(k)) p[k] = null;
    else if (v == null || (r && (v < r[0] || v > r[1]))) { App.toast(`Valor fora do esperado${r ? ` (${r[0]} a ${r[1]})` : ''}`); el.value = p[k] ?? ''; return; }
    else p[k] = v;
  }
  Store.saveCore();
  const c = $('#pf-calc'); if (c) c.innerHTML = perfilCalc(computeDay(todayISO()));
}

