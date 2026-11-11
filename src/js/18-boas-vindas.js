/* ===================== BOAS-VINDAS ===================== */
function viewOnboarding() {
  // campos vazios com exemplos; cintura e pescoço são opcionais (só melhoram a estimativa de gordura)
  const f = (k, l, ph, a = '') => `<label class="field"><span>${l}</span><input class="input num" id="ob-${k}" placeholder="${ph}" ${a}></label>`;
  return `<div class="onb">
    <h1>Bem-vindo ao Brius</h1>
    <p class="lead">Responda em 1 minuto. Com isso o app calcula sua meta de calorias, proteína e água, e monta seu treino depois.</p>
    <div class="panel">
      <div class="grid2">
        ${f('name', 'Nome', 'Seu nome', 'inputmode="text" maxlength="40" autocomplete="given-name"')}
        <label class="field"><span>Sexo biológico</span><select class="input" id="ob-sex"><option value="" selected disabled>Selecione</option><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
        ${f('age', 'Idade', 'ex.: 30', 'inputmode="numeric"')}
        ${f('height', 'Altura (cm)', 'ex.: 170', 'inputmode="numeric"')}
        ${f('weight', 'Peso hoje (kg)', 'ex.: 80,5', 'inputmode="decimal"')}
        ${f('goal', 'Peso meta (kg)', 'ex.: 72', 'inputmode="decimal"')}
        ${f('waist', 'Cintura (cm, opcional)', 'ex.: 92', 'inputmode="decimal"')}
        ${f('neck', 'Pescoço (cm, opcional)', 'ex.: 38', 'inputmode="decimal"')}
      </div>
      <label class="field"><span>Rotina fora do treino</span><select class="input" id="ob-act">${Object.entries(ACTIVITY).map(([k, a]) => `<option value="${k}" ${k === 'sedentario' ? 'selected' : ''}>${a.label} — ${a.desc}</option>`).join('')}</select></label>
      <div class="field"><span>Perda por semana</span><div class="chips" id="ob-pace">${PACES.slice(1).map((v) => `<button class="chip" data-a="ob-pace" data-v="${v}" aria-pressed="${v === 0.5}">−${paceLbl(v)} kg</button>`).join('')}</div>
        <small class="mtip">0,5 kg por semana é um bom começo: perde gordura sem perder músculo.</small></div>
      <div class="hint">${ic('leaf')}<span>Depois você monta o cardápio e o treino do seu jeito. Tudo pode ser ajustado no Perfil.</span></div>
      <button class="btn btn-primary btn-block" data-a="ob-start">Começar</button>
      <button class="btn btn-ghost btn-sm" data-a="import">${ic('upload', 'sm')} Tenho um backup</button>
      <p class="faint" style="font-size:12px;margin:0">O Brius dá estimativas para quem quer emagrecer com saúde. Não substitui a orientação de um médico ou nutricionista.</p>
    </div>
  </div>`;
}

