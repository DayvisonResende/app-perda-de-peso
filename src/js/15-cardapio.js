/* ===================== CARDÁPIO ===================== */
function planDayTotals(day) { return sumN(Object.values(day.meals).flat()); }
function viewCardapio() {
  const plan = Store.core.plan, d0 = computeDay(todayISO());
  const T = d0.plan.target;
  const head = `<div class="page-h"><div><h1>Cardápio da semana</h1><p class="muted">${plan ? planSourceText(plan) : 'Monte um cardápio para gerar a lista de compras e o preparo.'}</p></div>
    <div class="row"><button class="btn btn-carrot" data-a="gen-open">${ic('spark', 'sm')} Montar semana</button></div></div>`;
  if (!plan) return head + `<div class="panel empty"><p>Nenhum cardápio ainda.</p><button class="btn btn-primary mt12" data-a="gen-open">Montar minha semana</button></div>`;
  const seg = `<div class="seg" role="group" aria-label="Seção">
    ${[['semana', 'Semana', 'cal'], ['compras', 'Compras', 'cart'], ['preparo', 'Preparo', 'pot']].map(([k, l, i]) => `<button data-a="ptab" data-t="${k}" aria-pressed="${ui.planTab === k}">${ic(i, 'sm')} ${l}</button>`).join('')}
  </div>`;
  let body = '';
  if (ui.planTab === 'semana') body = planWeek(plan, d0);
  else if (ui.planTab === 'compras') body = planShop(plan);
  else body = planPrep(plan);
  return head + seg + body;
}
function planSourceText(plan) {
  const when = plan.at ? ` em ${dShort(toISO(new Date(plan.at)))}` : '';
  if (planIsEmpty(plan)) return 'Semana vazia: escolha o que vai comer em cada dia, ou toque em Montar semana para o app sugerir.';
  return { original: 'Seu protocolo low-carb original, com pesos crus.', gerado: `Montado pelo gerador${when}.`, ia: `Montado com o Claude${when}.`, ajustado: `Seu cardápio, com quantidades ajustadas à meta${when}.`, vazio: 'Seu cardápio, montado por você.' }[plan.source] || 'Cardápio personalizado.';
}
function planWeek(plan, d0) {
  const T = d0.plan.target, todayW = new Date().getDay();
  const totals = plan.days.map(planDayTotals);
  const filled = totals.filter((t) => t.kcal > 0);
  const avg = filled.length ? filled.reduce((s, t) => s + t.kcal, 0) / filled.length : 0;
  const off = avg - T;
  const strip = `<div class="daystrip">${plan.days.map((dy, i) => {
    const k = totals[i].kcal;
    return `<button class="dayp ${i === todayW ? 'is-today' : ''}" data-a="pday" data-i="${i}" aria-pressed="${ui.planDay === i}">
      <b>${WD3[i]}</b><small class="num">${fmt(k)}</small><span class="fit"><span style="width:${clamp((k / T) * 100, 0, 100)}%;background:${Math.abs(k - T) / T > 0.1 ? 'var(--carrot)' : 'var(--kale)'}"></span></span></button>`;
  }).join('')}</div>`;
  const day = plan.days[ui.planDay], t = totals[ui.planDay];
  const pk = t.p * 4, ck = t.c * 4, fk = t.f * 9, tk = pk + ck + fk || 1;
  const empty = planIsEmpty(plan);
  const warn = !empty && Math.abs(off) / T > 0.08 ? `<div class="hint mb12">${ic('info')}<div>${filled.length < 7 ? `Nos ${filled.length} ${filled.length > 1 ? 'dias montados' : 'dia montado'}, o cardápio fica` : 'Este cardápio fica'} em média <b>${fmt(Math.abs(off))} kcal ${off < 0 ? 'abaixo' : 'acima'}</b> da sua meta de ${fmt(T)} kcal.
      <div class="row mt8 wrap"><button class="btn btn-primary btn-sm" data-a="plan-fit">Ajustar quantidades à meta</button><span class="faint" style="font-size:12.5px">Mantém os alimentos, só muda os gramas.</span></div></div></div>` : '';
  const userMeals = settings().meals;
  const shownMeals = MEALS.filter((m) => (day.meals[m.id] && day.meals[m.id].length) || userMeals.includes(m.id) || ui.planExtra === m.id);
  const mealsHTML = shownMeals.map((m) => {
    const items = day.meals[m.id] || [], mt = sumN(items);
    return `<div class="pmeal ${items.length ? '' : 'empty-meal'}">
      <div class="pmeal-h"><span class="meal-ic">${ic(m.ic)}</span><b>${m.label}</b><span class="tag num">${fmt(mt.kcal)} kcal</span></div>
      ${items.map((it, idx) => {
        const f = food(it.id), [nm, st] = splitName(f ? f.n : it.id), n = nutr(it.id, it.g);
        return `<div class="pitem">
          <button class="n" data-a="pitem" data-m="${m.id}" data-x="${idx}"><b>${esc(nm)}</b><small>${[it.prep, st, fmt(n.kcal) + ' kcal'].filter(Boolean).map(esc).join(' · ')}</small></button>
          <button class="gbtn num" data-a="pitem" data-m="${m.id}" data-x="${idx}" aria-label="Editar quantidade de ${esc(nm)}">${unitLabel(it.id, it.g)} ${ic('pencil', 'sm')}</button>
          <button class="icon-btn sm" data-a="pswap" data-m="${m.id}" data-x="${idx}" aria-label="Trocar ${esc(nm)}">${ic('swap', 'sm')}</button>
        </div>`;
      }).join('') || '<p class="muted" style="font-size:13.5px;margin:4px 0">Nada planejado nesta refeição.</p>'}
      <div class="row mt8">
        <button class="btn btn-soft btn-sm" data-a="fp-planadd" data-m="${m.id}">${ic('plus', 'sm')} Adicionar alimento</button>
        ${items.length ? `<button class="btn btn-ghost btn-sm right" data-a="plan-log" data-m="${m.id}">${ic('check', 'sm')} Registrar hoje</button>` : ''}
      </div>
    </div>`;
  }).join('');
  return `${strip}${warn}
    <div class="daytotal">
      <span class="k num">${fmt(t.kcal)}</span>
      <div class="split"><span style="width:${(pk / tk) * 100}%;background:var(--kale)"></span><span style="width:${(ck / tk) * 100}%;background:var(--corn)"></span><span style="width:${(fk / tk) * 100}%;background:var(--olive)"></span></div>
      <div class="legend"><span><i style="background:var(--kale)"></i>Proteína ${fmt(t.p)} g</span><span><i style="background:var(--corn)"></i>Carbo ${fmt(t.c)} g</span><span><i style="background:var(--olive)"></i>Gordura ${fmt(t.f)} g</span><span>meta ${fmt(T)} kcal</span></div>
    </div>
    ${day.tip ? `<div class="tip">${ic('pot')}<div><b>${WD[ui.planDay]}:</b> ${esc(day.tip)}</div></div>` : ''}
    ${t.kcal ? '' : `<div class="hint mb12">${ic('info')}<span>${WD[ui.planDay]} está vazio. Adicione alimentos em cada refeição, ou toque em <b>Sugerir ${WD[ui.planDay].toLowerCase()}</b> para o app montar um dia na sua meta.</span></div>`}
    <div class="hint mb12" ${t.kcal ? '' : 'hidden'}>${ic('pencil')}<span>Toque num alimento ou na quantidade para editar os gramas, trocar ou remover. ${ic('swap', 'sm')} troca direto por outro com calorias parecidas.</span></div>
    <div class="plan-grid">${mealsHTML}</div>
    ${MEALS.filter((m) => !shownMeals.includes(m)).length ? `<div class="row mt12 wrap gap6">${MEALS.filter((m) => !shownMeals.includes(m)).map((m) => `<button class="chip" data-a="plan-addmeal" data-m="${m.id}">${ic('plus', 'sm')} ${m.label}</button>`).join('')}</div>` : ''}
    <div class="row mt16 wrap">
      <button class="btn btn-soft btn-sm" data-a="plan-reday">${ic(t.kcal ? 'refresh' : 'spark', 'sm')} ${t.kcal ? 'Refazer' : 'Sugerir'} ${WD[ui.planDay].toLowerCase()}</button>
      ${t.kcal ? `<button class="btn btn-ghost btn-sm" data-a="plan-copy">${ic('copy', 'sm')} Copiar para outro dia</button>` : ''}
      ${empty ? '' : `<button class="btn btn-ghost btn-sm right" data-a="plan-clear" style="color:var(--tomato)">${ic('trash', 'sm')} Limpar semana</button>`}
    </div>`;
}
function shopS() {
  const s = Store.core.shop || (Store.core.shop = { checked: {}, extra: [] });
  s.checked = s.checked || {}; s.extra = s.extra || []; s.have = s.have || {}; s.qty = s.qty || {};
  return s;
}
function planShop(plan) {
  const s = shopS(), all = planIsEmpty(plan) ? [] : shoppingList(plan), checked = s.checked;
  const list = all.filter((x) => !s.have[x.key]), have = all.filter((x) => s.have[x.key]);
  const extras = s.extra;
  const done = list.filter((x) => checked[x.key]).length + extras.filter((x) => checked[x.id]).length;
  const editBtn = (k, n) => `<button class="icon-btn" data-a="shop-edit" data-k="${k}" aria-label="Editar ${esc(n)}">${ic('pencil', 'sm')}</button>`;
  let html = '', sec = '';
  for (const it of list) {
    if (it.s !== sec) { sec = it.s; html += `<h3>${sec}</h3>`; }
    const q = s.qty[it.key];
    html += `<div class="shop-row"><button class="shop" data-a="shop" data-k="${it.key}" aria-pressed="${!!checked[it.key]}"><span class="box">${ic('check', 'sm')}</span>
      <span class="n"><b>${esc(it.n)}</b><small>no cardápio: ${it.plan}${q ? ' · calculado ' + esc(it.buy) : it.note ? ' · ' + esc(it.note) : ''}</small></span><span class="q num">${esc(q || it.buy)}</span></button>${editBtn(it.key, it.n)}</div>`;
  }
  if (extras.length) {
    html += `<h3>Extras</h3>` + extras.map((x) => `<div class="shop-row"><button class="shop" data-a="shop" data-k="${x.id}" aria-pressed="${!!checked[x.id]}"><span class="box">${ic('check', 'sm')}</span><span class="n"><b>${esc(x.n)}</b></span>${x.q ? `<span class="q num">${esc(x.q)}</span>` : ''}</button>${editBtn(x.id, x.n)}</div>`).join('');
  }
  if (have.length) {
    html += `<h3>Já tenho em casa</h3>` + have.map((x) => `<div class="shop-have"><b>${esc(x.n)}</b><button class="btn btn-ghost btn-sm" data-a="shop-back" data-k="${x.key}">${ic('plus', 'sm')} Voltar à lista</button></div>`).join('');
  }
  const total = list.length + extras.length;
  if (!all.length) html = `<p class="empty">Nada do cardápio ainda. Adicione alimentos na aba Semana e a lista se monta sozinha${extras.length ? '' : ', ou inclua itens avulsos abaixo'}.</p>` + html;
  return `${total ? `<div class="row mt16 wrap" style="justify-content:space-between">
      <div><b class="num">${done}/${total}</b> <span class="muted">itens no carrinho</span></div>
      <div class="row wrap"><button class="btn btn-primary btn-sm" data-a="shop-share">${ic('share', 'sm')} Enviar lista</button>${done ? `<button class="btn btn-ghost btn-sm" data-a="shop-clear">Desmarcar tudo</button>` : ''}</div>
    </div>
    <div class="mt8">${bar(done, total, 'var(--kale)')}</div>` : ''}
    ${all.length ? `<div class="hint mt12">${ic('pencil')}<span>Toque no ${ic('pencil', 'sm')} de um item para mudar a quantidade ou marcar que já tem em casa.</span></div>` : ''}
    <div class="shop-sec">${html}</div>
    <div class="row mt12"><input class="input grow" id="shop-extra" placeholder="Adicionar item (ex.: papel-toalha)" maxlength="60"><button class="btn btn-soft" data-a="shop-add">${ic('plus', 'sm')} Incluir</button></div>
    ${all.length ? '<p class="faint mt12" style="font-size:12.5px">As quantidades calculadas já somam a perda na limpeza (talos, cascas) e convertem arroz e feijão cozidos para o peso seco.</p>' : ''}`;
}
let SE = null;
function shopEditOpen(k) { SE = { k }; Sheet.open({ label: 'Item da lista', render: shopEditHTML }); }
function shopEditHTML() {
  const s = shopS(), ex = s.extra.find((x) => x.id === SE.k), it = ex ? null : shoppingList(Store.core.plan).find((x) => x.key === SE.k);
  if (!ex && !it) return '';
  const cur = ex ? ex.q || '' : s.qty[SE.k] || it.buy;
  return `${sheetHead(esc(ex ? ex.n : it.n), it ? `No cardápio da semana: ${esc(it.plan)}` : 'Item avulso')}
  <div class="sheet-b">
    ${ex ? `<label class="field"><span>Nome</span><input class="input" id="se-n" value="${esc(ex.n)}" maxlength="60"></label>` : ''}
    <label class="field ${ex ? 'mt12' : ''}"><span>Quantidade para comprar</span><input class="input" id="se-q" value="${esc(cur)}" placeholder="${ex ? 'opcional, ex.: 2 pacotes' : ''}" maxlength="30"></label>
    ${it ? `<p class="faint mt8" style="font-size:12.5px">Calculado: ${esc(it.buy)}${it.buy !== it.plan ? ' (já com a perda na limpeza)' : ''}. Mude se for comprar em embalagem fechada ou se já tem uma parte em casa.</p>` : ''}
    ${it && s.qty[SE.k] ? `<button class="btn btn-ghost btn-sm mt8" data-a="se-reset">${ic('refresh', 'sm')} Voltar para ${esc(it.buy)}</button>` : ''}
  </div>
  <div class="sheet-f">
    ${ex ? `<button class="icon-btn" data-a="se-del" aria-label="Remover da lista" style="color:var(--tomato)">${ic('trash')}</button>` : `<button class="btn btn-soft" data-a="se-have">${ic('home', 'sm')} Já tenho em casa</button>`}
    <button class="btn btn-primary grow" data-a="se-save">Salvar</button>
  </div>`;
}
function planPrep(plan) {
  if (planIsEmpty(plan)) return `<div class="panel mt16 empty"><p>Sem nada para preparar ainda.</p><p class="muted">Monte o almoço e o jantar na aba Semana e o app calcula quanto cozinhar em cada rodada.</p></div>`;
  const ps = prepS(), blocks = prepPlan(plan, ps.rounds).filter((b) => b.prot.length + b.carb.length + b.veg.length);
  const key = (bi, x) => `${ps.rounds}:${bi}:${x.id}:${x.t.split(' ')[0]}`;
  const li = (bi, x) => { const k = key(bi, x), on = !!ps.done[k]; return `<li class="step"><button class="stepb" data-a="prep-step" data-k="${esc(k)}" aria-pressed="${on}"><span class="box">${ic('check', 'sm')}</span>
    <span class="t"><span>${esc(x.t)}</span>${x.sub ? `<br><small class="muted">${esc(x.sub)}</small>` : ''}</span><b class="num">${x.g}</b></button></li>`; };
  const note = { 1: 'Tudo numa rodada só. Carne cozida dura de 3 a 4 dias na geladeira: congele as marmitas de quinta a sábado e passe para a geladeira na véspera.', 2: 'Carne cozida dura de 3 a 4 dias na geladeira, então o preparo fica em duas rodadas. Pese tudo cru, cozinhe junto e divida em potes.', 3: 'Três rodadas menores: comida sempre fresca, sem precisar congelar. Pese tudo cru, cozinhe junto e divida em potes.' }[ps.rounds];
  const anyDone = Object.keys(ps.done).some((k) => k.startsWith(ps.rounds + ':'));
  return `<div class="row mt16 wrap" style="justify-content:space-between;align-items:center">
      <div class="row wrap gap6"><span class="muted" style="font-size:13.5px;font-weight:600">Cozinhar em</span>
        <div class="chips">${[1, 2, 3].map((n) => `<button class="chip" data-a="prep-rounds" data-n="${n}" aria-pressed="${ps.rounds === n}">${n} ${n > 1 ? 'rodadas' : 'rodada'}</button>`).join('')}</div></div>
      ${anyDone ? `<button class="btn btn-ghost btn-sm" data-a="prep-reset">${ic('refresh', 'sm')} Desmarcar tudo</button>` : ''}
    </div>
    <div class="panel mt12">
    <p class="muted mb12">${note} Toque num passo para marcar como feito.</p>
    ${blocks.map((b, bi) => { const all = [...b.prot, ...b.carb, ...b.veg], ok = all.every((x) => ps.done[key(bi, x)]);
      return `<div class="prep-block"><span class="prep-num ${ok ? 'done' : ''}">${ok ? ic('check') : bi + 1}</span><div>
      <h2>${b.when}</h2><p class="muted" style="font-size:13.5px">${b.label}${b.boxes ? ` · ${b.boxes} ${b.boxes > 1 ? 'marmitas' : 'marmita'} de almoço e jantar` : ''}</p>
      <ul>${all.map((x) => li(bi, x)).join('')}</ul>
    </div></div>`; }).join('')}
  </div>`;
}

