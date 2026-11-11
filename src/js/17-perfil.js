/* ===================== PERFIL ===================== */
function viewPerfil() {
  const p = Store.p, d = computeDay(todayISO()), s = settings();
  const fld = (k, label, val, attrs = '') => `<label class="field"><span>${label}</span><input class="input num" data-pf="${k}" value="${val ?? ''}" ${attrs}></label>`;
  const habits = Store.core.habits || [];
  return `
  <div class="page-h"><div><h1>Perfil e metas</h1><p class="muted">As mudanças são salvas na hora e recalculam tudo.</p></div></div>
  <div class="prog-grid">
    <div>
      ${albumPanelHTML()}
      <section class="panel">
        <div class="ph"><h2>Você</h2></div>
        <div class="grid2">
          ${fld('name', 'Nome', esc(p.name), 'maxlength="40" inputmode="text"')}
          <label class="field"><span>Sexo biológico</span><select class="input" data-pf="sex"><option value="M" ${p.sex === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${p.sex === 'F' ? 'selected' : ''}>Feminino</option></select></label>
          ${fld('age', 'Idade', p.age, 'inputmode="numeric"')}
          ${fld('height', 'Altura (cm)', p.height, 'inputmode="numeric"')}
          ${fld('neck', 'Pescoço (cm)', p.neck ?? '', 'inputmode="decimal"')}
          ${p.sex === 'F' ? fld('hip', 'Quadril (cm)', p.hip ?? '', 'inputmode="decimal"') : fld('goalWeight', 'Peso meta (kg)', p.goalWeight, 'inputmode="decimal"')}
          ${p.sex === 'F' ? fld('goalWeight', 'Peso meta (kg)', p.goalWeight, 'inputmode="decimal"') : ''}
        </div>
        <p class="faint mt8" style="font-size:12.5px">Peso e cintura vêm das pesagens em Progresso.</p>
      </section>
      <section class="panel">
        <div class="ph"><h2>Ritmo e rotina</h2></div>
        <div class="field"><span>Perda por semana</span><div class="chips">${PACES.map((v) => `<button class="chip" data-a="pf-pace" data-v="${v}" aria-pressed="${p.pace === v}">${v ? '−' + paceLbl(v) + ' kg' : 'Manter'}</button>`).join('')}</div></div>
        <label class="field mt12"><span>Rotina fora do treino</span><select class="input" data-pf="activity">${Object.entries(ACTIVITY).map(([k, a]) => `<option value="${k}" ${p.activity === k ? 'selected' : ''}>${a.label} — ${a.desc}</option>`).join('')}</select></label>
        <div class="grid2 mt12">
          ${fld('customTarget', 'Meta manual (kcal, opcional)', p.customTarget ?? '', 'inputmode="numeric" placeholder="automática"')}
          ${fld('waterPerKg', 'Água (ml por kg)', p.waterPerKg ?? 35, 'inputmode="numeric"')}
        </div>
        <div class="grid2 mt12">
          <label class="field"><span>Fórmula do metabolismo</span><select class="input" data-pf="bmrFormula">${[['mifflin', 'Mifflin-St Jeor'], ['katch', 'Katch-McArdle (% de gordura)'], ['manual', 'Valor da bioimpedância']].map(([k, l]) => `<option value="${k}" ${p.bmrFormula === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          ${p.bmrFormula === 'manual' ? fld('bmrManual', 'TMB medida (kcal)', p.bmrManual ?? '', 'inputmode="numeric"') : '<div></div>'}
        </div>
      </section>
      <section class="panel">
        <div class="ph"><h2>Jeito de comer</h2></div>
        <div class="field"><span>Estilo</span><div class="seg">${[['lowcarb', 'Low-carb'], ['equilibrado', 'Equilibrado']].map(([k, l]) => `<button data-a="pf-style" data-v="${k}" aria-pressed="${s.style === k}">${l}</button>`).join('')}</div></div>
        <div class="field mt12"><span>Refeições do dia</span><div class="chips">${MEALS.map((m) => `<button class="chip" data-a="pf-meal" data-v="${m.id}" aria-pressed="${s.meals.includes(m.id)}">${m.label}</button>`).join('')}</div></div>
      </section>
      <section class="panel">
        <div class="ph"><h2>Hábitos diários</h2></div>
        ${habits.map((h) => `<div class="kv"><span style="color:var(--ink)">${esc(h.n)}</span><button class="icon-btn sm" data-a="habit-del" data-id="${h.id}" aria-label="Remover hábito">${ic('trash', 'sm')}</button></div>`).join('')}
        <div class="row mt8"><input class="input grow" id="habit-new" placeholder="Novo hábito (ex.: caminhar 30 min)" maxlength="60"><button class="btn btn-soft" data-a="habit-add">${ic('plus', 'sm')}</button></div>
      </section>
    </div>
    <div>
      <section class="panel" id="pf-calc">${perfilCalc(d)}</section>
      <section class="panel">
        <div class="ph"><h2>Aparência</h2></div>
        <div class="seg">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button data-a="pf-theme" data-v="${k}" aria-pressed="${(p.theme || 'auto') === k}">${l}</button>`).join('')}</div>
      </section>
      ${PWA.panel()}
      <section class="panel">
        <div class="ph"><h2>Seus dados</h2><span class="sync" data-s="${Sync.status}"><span class="dot"></span><span>${syncText()}</span></span></div>
        <p class="muted" style="font-size:13.5px">${Sync.status === 'synced' ? 'Tudo fica salvo na sua conta e aparece igual no celular e no computador.' : 'Os dados ficam salvos neste aparelho. Faça backup de vez em quando.'}</p>
        <div class="row wrap mt12">
          <button class="btn btn-soft btn-sm" data-a="export">${ic('download', 'sm')} Exportar backup</button>
          <button class="btn btn-soft btn-sm" data-a="import">${ic('upload', 'sm')} Importar</button>
          <button class="btn btn-ghost btn-danger btn-sm" data-a="wipe">${ic('trash', 'sm')} Apagar tudo</button>
        </div>
      </section>
    </div>
  </div>`;
}
function perfilCalc(d) {
  const p = Store.p;
  return `<div class="ph"><h2>Seus números</h2><span class="sub">${{ mifflin: 'Mifflin-St Jeor', katch: 'Katch-McArdle', manual: 'bioimpedância' }[d.bmrF]}</span></div>
    <div class="kv"><span>Metabolismo basal</span><b class="num">${fmt(d.bmr)} kcal</b></div>
    <div class="kv"><span>Gasto para manter o peso</span><b class="num">${fmt(d.plan.maintenance)} kcal</b></div>
    <div class="kv total"><span>Meta diária</span><b class="num" style="color:var(--kale)">${fmt(d.plan.target)} kcal</b></div>
    <div class="kv"><span>Proteína · carbo · gordura</span><b class="num">${d.macros.protein} · ${d.macros.carbs} · ${d.macros.fat} g</b></div>
    <div class="kv"><span>Água</span><b class="num">${fmt(d.water)} ml</b></div>
    <div class="kv"><span>IMC</span><b class="num">${fmt(d.weight / (p.height / 100) ** 2, 1)}</b></div>
    ${d.bf != null ? `<div class="kv"><span>Gordura corporal (fita)</span><b class="num">${fmt(d.bf, 1)}% · massa magra ${fmt(d.weight * (1 - d.bf / 100), 1)} kg</b></div>` : ''}
    ${d.plan.clamped ? `<div class="hint mt12">${ic('info')}<span>O ritmo escolhido pediria menos de ${fmt(d.plan.floor)} kcal. A meta ficou no piso seguro; a perda real será perto de ${fmt(d.plan.weekly, 2)} kg/semana.</span></div>` : `<p class="muted mt8" style="font-size:13px">Perda esperada: cerca de ${fmt(d.plan.weekly, 2)} kg por semana.</p>`}`;
}

