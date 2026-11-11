/* ===================== COMPONENTES ===================== */
const paceLbl = (v) => fmt(v, Math.round(v * 100) % 10 ? 2 : Number.isInteger(v) ? 0 : 1);
function chartW() { const w = window.innerWidth; return Math.round(clamp(w < 980 ? Math.min(w, 860) - 70 : (Math.min(w, 1356) - 236 - 68) * 0.6 - 40, 300, 720)); }
const bar = (v, max, color) => `<div class="bar"><span style="width:${clamp(max ? (v / max) * 100 : 0, 0, 100).toFixed(1)}%;background:${color}"></span></div>`;
function macroBars(d) {
  const row = (lbl, v, t, col) => `<div class="macro"><div class="top">${lbl}</div>${bar(v, t, col)}<div class="val num">${fmt(v)} / ${fmt(t)} g</div></div>`;
  return `<div class="macros">${row('Proteína', d.P, d.macros.protein, 'var(--kale)')}${row('Carbo', d.C, d.macros.carbs, 'var(--corn)')}${row('Gordura', d.F, d.macros.fat, 'var(--olive)')}</div>`;
}
function dateNav() {
  const isToday = ui.date >= todayISO();
  return `<div class="datenav">
    <button class="icon-btn sm" data-a="date" data-d="-1" aria-label="Dia anterior">${ic('left')}</button>
    <label class="lbl">${dateLabel(ui.date)}<input type="date" data-in="date" value="${ui.date}" max="${todayISO()}" aria-label="Escolher data"></label>
    <button class="icon-btn sm" data-a="date" data-d="1" ${isToday ? 'disabled' : ''} aria-label="Próximo dia">${ic('right')}</button>
  </div>`;
}

// Resultado do dia: tudo o que foi gasto × tudo o que foi consumido
function dayResult(d, isToday) {
  const parts = [['Metabolismo', d.bmr, 'var(--ink)'], ['Rotina', d.neat, 'var(--olive)'], ['Digestão', d.tef, 'var(--corn)'], ['Exercício', d.exercise, 'var(--carrot)']].filter((x) => x[1] > 0.5);
  const max = Math.max(d.spent, d.intake, 1), def = d.spent - d.intake, g = Math.round((Math.abs(def) / Calc.KCAL_KG) * 1000);
  const seg = parts.map(([n, v, c]) => `<span style="width:${((v / max) * 100).toFixed(2)}%;background:${c}" title="${n}: ${fmt(v)} kcal"></span>`).join('');
  return `<div class="dres">
    <div class="dres-h"><b>Resultado do dia</b><small class="muted">${isToday ? 'previsto para o fim do dia' : 'dia fechado'}</small></div>
    <div class="dres-row"><span>Gasto</span><div class="dres-bar">${seg}</div><b class="num">${fmt(d.spent)}</b></div>
    <div class="dres-legend">${parts.map(([n, v, c]) => `<span><i style="background:${c}"></i>${n} ${fmt(v)}</span>`).join('')}</div>
    <div class="dres-row"><span>Consumido</span><div class="dres-bar"><span style="width:${((d.intake / max) * 100).toFixed(2)}%;background:var(--kale)"></span></div><b class="num">${fmt(d.intake)}</b></div>
    <div class="dres-out ${def >= 0 ? 'ok' : 'bad'}"><span>${def >= 0 ? 'Déficit' : 'Excedente'}${d.exercise ? `, com ${fmt(d.exercise)} kcal de exercício` : ''}</span><b class="num">${def >= 0 ? '−' : '+'}${fmt(Math.abs(def))} kcal</b><small>≈ ${fmt(g)} g de gordura ${def >= 0 ? 'a menos' : 'a mais'}</small></div>
  </div>`;
}
// Mostrador de balança de cozinha
function dial(d) {
  // o exercício desconta do que foi comido: ponteiro = consumo líquido (comido − exercício)
  const T = d.plan.target, E = Math.round(d.exercise || 0), I = Math.max(0, d.intake - E);
  const M = Math.ceil(Math.max(T * 1.25, I * 1.06) / 250) * 250;
  const cx = 180, cy = 168, R = 146;
  const pt = (t, r) => { const a = ((210 - 240 * t) * Math.PI) / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const arc = (t0, t1, r) => { const [x0, y0] = pt(t0, r), [x1, y1] = pt(t1, r); const large = (t1 - t0) * 240 > 180 ? 1 : 0; return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  let ticks = '';
  for (let v = 0; v <= M; v += 50) {
    const t = v / M, major = v % 250 === 0;
    const [x0, y0] = pt(t, R - 18), [x1, y1] = pt(t, R - (major ? 34 : 26));
    ticks += `<line class="tick${major ? ' major' : ''}" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
    if (v % 500 === 0) { const [lx, ly] = pt(t, R - 50); ticks += `<text class="tlbl num" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle">${v >= 1000 ? fmt(v / 1000, v % 1000 ? 1 : 0) + 'k' : v}</text>`; }
  }
  const tT = T / M, [mx, my] = pt(tT, R + 2), [mx2, my2] = pt(tT, R - 22);
  const rot = 240 * clamp(I / M, 0, 1) - 120;
  const rem = T - I, over = rem < 0;
  return `<div class="dial-wrap">
    <svg class="dial" viewBox="0 0 360 272" role="img" aria-label="Consumo líquido ${fmt(I)} de ${fmt(T)} kcal${E ? `, já descontando ${fmt(E)} kcal de exercício` : ''}">
      <path class="band-bg" d="${arc(0, 1, R - 8)}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path class="band-ok" d="${arc(0, tT, R - 8)}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path class="band-over" d="${arc(tT, 1, R - 8)}" stroke-width="12" fill="none" stroke-linecap="round"/>
      ${ticks}
      <line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${mx2.toFixed(1)}" y2="${my2.toFixed(1)}" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
      <g class="needle" data-to="${rot.toFixed(2)}" style="transform:rotate(${(ui.needle ?? -120)}deg)">
        <path d="M${cx - 5} ${cy - R + 40} L${cx} ${cy - R + 6} L${cx + 5} ${cy - R + 40} Z" fill="var(--carrot)" stroke="var(--carrot)" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="${cx}" cy="${cy - R + 40}" r="5" fill="var(--carrot)"/>
      </g>
    </svg>
    <div class="dial-read">
      <div class="big num ${over ? 'over' : ''}" data-count="dial" data-v="${Math.round(Math.abs(rem))}">${fmt(Math.abs(rem))}</div>
      <small>${over ? 'kcal acima da meta' : 'kcal restantes'} de ${fmt(T)}</small>
      ${E ? `<span class="dial-ex">${ic('flame', 'sm')} +${fmt(E)} do exercício</span>` : ''}
    </div>
  </div>`;
}

