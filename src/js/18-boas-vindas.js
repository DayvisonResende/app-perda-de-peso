/* ===================== BOAS-VINDAS ===================== */
function viewOnboarding() {
  const f = (k, l, v, a = '') => `<label class="field"><span>${l}</span><input class="input num" id="ob-${k}" value="${v}" ${a}></label>`;
  return `<div class="onb">
    <h1>Vamos calibrar sua balança</h1>
    <p class="lead">Preenchi com os dados do seu app antigo. Confira e ajuste o que mudou.</p>
    <div class="panel">
      <div class="grid2">
        ${f('name', 'Nome', 'João', 'inputmode="text" maxlength="40"')}
        <label class="field"><span>Sexo biológico</span><select class="input" id="ob-sex"><option value="M" selected>Masculino</option><option value="F">Feminino</option></select></label>
        ${f('age', 'Idade', 32, 'inputmode="numeric"')}
        ${f('height', 'Altura (cm)', 169, 'inputmode="numeric"')}
        ${f('weight', 'Peso hoje (kg)', '92,0', 'inputmode="decimal"')}
        ${f('goal', 'Peso meta (kg)', '80,0', 'inputmode="decimal"')}
        ${f('waist', 'Cintura (cm)', 98, 'inputmode="decimal"')}
        ${f('neck', 'Pescoço (cm)', 40, 'inputmode="decimal"')}
      </div>
      <label class="field"><span>Rotina fora do treino</span><select class="input" id="ob-act">${Object.entries(ACTIVITY).map(([k, a]) => `<option value="${k}" ${k === 'sedentario' ? 'selected' : ''}>${a.label} — ${a.desc}</option>`).join('')}</select></label>
      <div class="field"><span>Perda por semana</span><div class="chips" id="ob-pace">${PACES.slice(1).map((v) => `<button class="chip" data-a="ob-pace" data-v="${v}" aria-pressed="${v === 0.5}">−${paceLbl(v)} kg</button>`).join('')}</div></div>
      <div class="hint">${ic('leaf')}<span>Seu cardápio low-carb de 7 dias já vem carregado, com almoço, lanche e jantar (jejum de manhã). Dá para ajustar tudo depois.</span></div>
      <button class="btn btn-primary btn-block" data-a="ob-start">Começar</button>
      <button class="btn btn-ghost btn-sm" data-a="import">${ic('upload', 'sm')} Tenho um backup</button>
    </div>
  </div>`;
}

