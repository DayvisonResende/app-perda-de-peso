/* ===================== HOJE ===================== */
// Painel recolhível da lateral; o estado aberto/fechado fica salvo neste aparelho
const FOLD_KEY = 'brius:paineis';
const FOLD_DEFAULT = { agua: true, missoes: true };
const Folds = {
  s: (() => { try { return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}') || {}; } catch (e) { return {}; } })(),
  isOpen(id) { return id in this.s ? this.s[id] : !!FOLD_DEFAULT[id]; },
  toggle(id) { this.s[id] = !this.isOpen(id); try { localStorage.setItem(FOLD_KEY, JSON.stringify(this.s)); } catch (e) {} return this.s[id]; },
};
function fold(id, title, summary, body) {
  const open = Folds.isOpen(id);
  return `<section class="panel fold ${open ? 'open' : ''}" data-fold="${id}">
    <button class="ph fold-h" data-a="fold" data-id="${id}" aria-expanded="${open}" aria-controls="fold-${id}">
      <h2>${title}</h2><span class="sub num">${summary}</span><span class="chev">${ic('down', 'sm')}</span>
    </button>
    <div class="fold-b" id="fold-${id}">${body}</div>
  </section>`;
}
// Projeção linear do peso a partir do saldo do dia (7.700 kcal ≈ 1 kg)
function weightForecast(d, isToday) {
  const g = Store.p.goalWeight, w = d.weight, perDay = d.balance / Calc.KCAL_KG;
  const kg = (v) => `${fmt(v, 1)} kg`;
  const delta = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v), Math.abs(v) < 1 ? 2 : 1)} kg`;
  const col = (v) => (v <= 0 ? 'var(--kale)' : 'var(--tomato)');
  const row = (lbl, days) => { const ch = perDay * days; return `<div class="kv"><span>${lbl}</span><b class="num">${kg(w + ch)} <small style="color:${col(ch)};font-weight:700">${delta(ch)}</small></b></div>`; };
  let goal = '';
  if (g && w > g && perDay < 0) {
    const days = Math.round((w - g) / -perDay);
    goal = `<div class="kv total"><span>Meta de ${kg(g)}</span><b class="num">${days > 730 ? 'mais de 2 anos' : (() => { const dd = addDays(d.date, days); return dShort(dd) + (dd.slice(0, 4) !== d.date.slice(0, 4) ? ' ' + dd.slice(0, 4) : ''); })()}</b></div>`;
  } else if (g && w <= g) goal = `<div class="kv total"><span>Meta de ${kg(g)}</span><b class="num" style="color:var(--kale)">atingida</b></div>`;
  const early = isToday && d.intake < d.plan.target * 0.6;
  const wk = perDay * 7;
  const head = early ? `<span style="color:var(--muted)">plano ${d.plan.weekly > 0 ? '−' + fmt(d.plan.weekly, 2) + ' kg/sem' : 'manutenção'}</span>` : `<span style="color:${col(wk)}">${delta(wk)}/sem</span>`;
  return fold('peso', 'Estimativa de peso', head, `
    <p class="muted" style="font-size:13px;margin:0 0 4px">Se todo dia for assim:</p>
    <div class="kv"><span>Peso atual</span><b class="num">${kg(w)}</b></div>
    ${row(isToday ? 'Fim de hoje' : 'Fim do dia', 1)}
    ${row('Em 1 semana', 7)}
    ${row('Em 1 mês', 30)}
    ${goal}
    <p class="muted mt8" style="font-size:13px">${early ? `<b>O dia ainda não fechou.</b> Com ${fmt(d.intake)} kcal registradas, o saldo vai cair conforme você anotar as refeições. Comendo a meta, o plano dá ${d.plan.weekly > 0 ? '−' + fmt(d.plan.weekly, 2) + ' kg/semana' : 'manutenção'}. ` : ''}Conta linear (7.700 kcal ≈ 1 kg de gordura): na balança o peso oscila com água, e o ritmo tende a desacelerar com o tempo.</p>`);
}
function viewHoje() {
  const d = computeDay(ui.date), p = Store.p, isToday = ui.date === todayISO();
  const { meals } = settings();
  const shown = MEALS.filter((m) => meals.includes(m.id) || d.day.foods.some((f) => f.meal === m.id));
  const pd = planDay(ui.date);
  const deficit = -d.balance;
  const hr = new Date().getHours();
  const hello = !isToday ? `Registro de ${dateLabel(ui.date).toLowerCase()}` : `${hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite'}${p.name ? ', ' + esc(p.name.split(' ')[0]) : ''}`;

  const mealHTML = shown.map((m) => {
    const es = d.day.foods.filter((f) => f.meal === m.id);
    const kc = es.reduce((s, e) => s + e.kcal, 0);
    const planned = pd && pd.meals[m.id] && pd.meals[m.id].length ? pd.meals[m.id] : null;
    const plannedK = planned ? sumN(planned).kcal : 0;
    return `<section class="meal">
      <div class="meal-h">
        <span class="meal-ic">${ic(m.ic)}</span>
        <div class="t"><b>${m.label}</b><small>${es.length ? `${es.length} ${es.length > 1 ? 'itens' : 'item'}` : planned ? `Planejado: ${fmt(plannedK)} kcal` : 'Nada registrado'}</small></div>
        ${es.length ? `<span class="k num">${fmt(kc)}</span>` : ''}
        <button class="addbtn" data-a="fp-open" data-meal="${m.id}" aria-label="Adicionar ao ${m.label}">${ic('plus')}</button>
      </div>
      ${es.length ? `<ul class="entries">${es.map((e) => `<li><button class="entry" data-a="entry-edit" data-id="${e.id}">
          <span class="n"><b>${esc(e.n)}</b><small>${esc(e.por && e.qty ? `${fmt1(e.qty)} × ${e.por[0]} · ` : '')}${grams(Math.round(e.g), e.u)}</small></span>
          <span class="kc num">${fmt(e.kcal)}</span></button></li>`).join('')}</ul>`
        : planned ? `<div class="planned">
          <div class="pl-items">${planned.map((it) => `${esc(splitName(food(it.id)?.n || it.id)[0])} ${unitLabel(it.id, it.g)}`).join(' · ')}</div>
          <div class="pl-actions">
            <button class="btn btn-primary btn-sm" data-a="eat-plan" data-meal="${m.id}">${ic('check', 'sm')} Comi o planejado</button>
            <button class="btn btn-soft btn-sm" data-a="fp-plan" data-meal="${m.id}">Ajustar antes</button>
          </div></div>` : ''}
    </section>`;
  }).join('');

  const water = d.day.water || 0, cups = Math.max(1, Math.round(d.water / 250));
  const habits = Store.core.habits || [];
  const doneH = habits.filter((h) => d.day.habits[h.id]).length;

  return `
  <div class="page-h"><div><h1>${hello}</h1><p class="muted">${isToday ? 'Toque no + de uma refeição e monte tudo de uma vez.' : 'Você pode editar dias anteriores.'}</p></div>${dateNav()}</div>
  <div class="today">
    <div>
      <section class="hero">
        ${dial(d)}
        <div class="dial-stats">
          <div><b class="num" data-count="intake" data-v="${Math.round(d.intake)}">${fmt(d.intake)}</b><span>consumido</span></div>
          <div><b class="num">${d.exercise ? '+' + fmt(d.exercise) : '0'}</b><span>exercício</span></div>
          <div><b class="num" style="color:${deficit >= 0 ? 'var(--kale)' : 'var(--tomato)'}">${deficit >= 0 ? '−' : '+'}${fmt(Math.abs(d.balance))}</b><span>${isToday ? 'saldo previsto' : 'saldo do dia'}</span></div>
        </div>
        ${macroBars(d)}
        ${dayResult(d, isToday)}
      </section>
      <div class="ledger mt16">${mealHTML}</div>
      ${!shown.length ? '' : `<div class="row mt12 wrap gap6">${MEALS.filter((m) => !shown.includes(m)).map((m) => `<button class="chip" data-a="fp-open" data-meal="${m.id}">${ic('plus', 'sm')} ${m.label}</button>`).join('')}</div>`}
    </div>
    <div class="side">
      ${isToday ? (() => { const m = missions(todayISO()), b = Store.core.treino && Store.core.treino.setup ? Tr.boss() : null; return fold('missoes', 'Missões de hoje', `${m.filter((x) => x.done).length}/${m.length}`, (b && b.available && !b.defeated ? `<button class="boss-alert" data-a="tab" data-tab="treino" style="--boss:${b.color}">${bossArt(b.color, 'xs')}<span><b>Um desafio apareceu: ${b.name}</b><small>Toque para ver na tela de Treino</small></span></button>` : '') + missionsList(m, false)); })() : ''}
      ${fold('agua', 'Água', `${fmt(water)} / ${fmt(d.water)} ml`, `
        <div class="water-cups" aria-hidden="true">${Array.from({ length: cups }, (_, i) => { const f = water / 250 - i; return `<span class="cup ${f >= 1 ? 'on' : f >= 0.5 ? 'half' : ''}"></span>`; }).join('')}</div>
        <div class="row">
          <button class="btn btn-soft btn-sm grow" data-a="water" data-v="250">${ic('drop', 'sm')} +250 ml</button>
          <button class="btn btn-soft btn-sm grow" data-a="water" data-v="500">+500 ml</button>
          <button class="icon-btn" data-a="water" data-v="-250" aria-label="Tirar 250 ml">${ic('minus')}</button>
        </div>`)}
      ${fold('habitos', 'Hábitos do dia', `${doneH}/${habits.length}`, `
        ${habits.length ? habits.map((h) => `<button class="habit" data-a="habit" data-id="${h.id}" aria-pressed="${!!d.day.habits[h.id]}"><span class="box">${ic('check', 'sm')}</span><span class="hl">${esc(h.n)}</span></button>`).join('') : '<p class="muted">Cadastre hábitos no Perfil.</p>'}`)}
      ${fold('atividade', 'Atividade', d.exercise ? `+${fmt(d.exercise)} kcal` : 'nenhuma', `
        ${d.day.ex.length ? d.day.ex.map((e) => `<div class="kv"><span>${esc(e.n)} · ${fmt(e.min)} min</span><b class="num">+${fmt(e.kcal)} kcal <button class="icon-btn sm" data-a="ex-del" data-id="${e.id}" aria-label="Remover">${ic('x', 'sm')}</button></b></div>`).join('') : '<p class="muted">Nenhum exercício. Gasto conta só a rotina.</p>'}
        <button class="btn btn-soft btn-sm mt12" data-a="ex-open">${ic('plus', 'sm')} Exercício</button>`)}
      ${fold('balanco', 'Balanço do dia', `<span style="color:${deficit >= 0 ? 'var(--kale)' : 'var(--tomato)'}">${deficit >= 0 ? '−' : '+'}${fmt(Math.abs(d.balance))} kcal</span>`, `
        <div class="kv"><span>Metabolismo basal</span><b class="num">${fmt(d.bmr)} kcal</b></div>
        <div class="kv"><span>Rotina (${ACTIVITY[p.activity]?.label.toLowerCase()})</span><b class="num">${fmt(d.neat)} kcal</b></div>
        <div class="kv"><span>Digestão dos alimentos</span><b class="num">${fmt(d.tef)} kcal</b></div>
        <div class="kv"><span>Exercício</span><b class="num">${fmt(d.exercise)} kcal</b></div>
        <div class="kv total"><span>Gasto total</span><b class="num">${fmt(d.spent)} kcal</b></div>
        <div class="kv total"><span>${deficit >= 0 ? 'Déficit' : 'Excedente'}</span><b class="num" style="color:${deficit >= 0 ? 'var(--kale)' : 'var(--tomato)'}">${fmt(Math.abs(d.balance))} kcal</b></div>
        ${d.intake > 0 && deficit > 0 ? `<p class="muted mt8" style="font-size:13.5px">Equivale a cerca de <b>${fmt((deficit / 7700) * 1000)} g de gordura</b> se o dia fechar assim.</p>` : ''}`)}
      ${weightForecast(d, isToday)}
    </div>
  </div>`;
}

