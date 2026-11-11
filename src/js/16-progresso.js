/* ===================== PROGRESSO ===================== */
function viewProgresso() {
  const p = Store.p, tr = weightTrend(), ws = Store.weights();
  const first = ws[0], last = ws[ws.length - 1];
  const lost = first && last ? first.weight - last.weight : 0;
  const cur = tr.pts.length ? tr.pts[tr.pts.length - 1].t : p.weight;
  let eta = '—', etaSub = 'registre ao menos 2 semanas';
  if (tr.rate != null) {
    if (tr.rate < -0.05 && cur > p.goalWeight) {
      const weeks = (cur - p.goalWeight) / -tr.rate; const dd = addDays(todayISO(), Math.round(weeks * 7));
      eta = dShort(dd); etaSub = `${parseISO(dd).getFullYear()} · no ritmo atual`;
    } else if (cur <= p.goalWeight) { eta = 'Chegou!'; etaSub = 'meta atingida'; }
    else { eta = 'Parado'; etaSub = 'tendência sem queda'; }
  }
  // balança mascarada: nas últimas ~5 semanas a cintura caiu, mas o peso quase não mexeu
  let masked = '';
  const wm = Store.measures().filter((m) => m.waist && daysBetween(m.date, todayISO()) <= 35);
  if (wm.length >= 2 && ws.length >= 2) {
    const f = wm[0], l = wm[wm.length - 1], dwa = l.waist - f.waist, dw = Store.weightOn(todayISO()) - Store.weightOn(f.date);
    if (daysBetween(f.date, todayISO()) >= 10 && dwa <= -1 && dw > -0.5) masked = `<div class="hint mb12">${ic('info')}<div><b>Balança mascarada:</b> desde ${dShort(f.date)} o peso mudou só ${dw <= 0 ? '−' : '+'}${fmt(Math.abs(dw), 1)} kg, mas a cintura caiu ${fmt1(-dwa)} cm. Isso costuma ser retenção de água (treino, sal, sono, ciclo) escondendo perda de gordura. Siga o plano.</div></div>`;
  }
  // consumo 14 dias
  const days = [], T = computeDay(todayISO()).plan.target;
  for (let i = 13; i >= 0; i--) { const dt = addDays(todayISO(), -i); const dd = Store.day(dt); days.push({ dt, k: dd.foods.reduce((s, e) => s + e.kcal, 0) }); }
  const logged = days.filter((x) => x.k > 0);
  const avg = logged.length ? logged.reduce((s, x) => s + x.k, 0) / logged.length : 0;
  return `
  <div class="page-h"><div><h1>Progresso</h1><p class="muted">Meta: ${fmt1(p.goalWeight)} kg · ritmo planejado ${p.pace ? '−' + paceLbl(p.pace) + ' kg/semana' : 'manutenção'}</p></div>
    <button class="btn btn-primary" data-a="weight-open">${ic('scale', 'sm')} Nova pesagem</button></div>
  <div class="stats">
    <div class="stat"><span>Peso (tendência)</span><b class="num">${fmt(cur, 1)} kg</b><small>último: ${last ? fmt(last.weight, 1) + ' kg' : '—'}</small></div>
    <div class="stat"><span>Já perdeu</span><b class="num">${lost > 0 ? fmt(lost, 1) : '0'} kg</b><small>desde ${first ? dShort(first.date) : '—'}</small></div>
    <div class="stat"><span>Ritmo real</span><b class="num">${tr.rate == null ? '—' : (tr.rate > 0 ? '+' : '−') + fmt(Math.abs(tr.rate), 2)}</b><small>kg por semana (4 sem.)</small></div>
    <div class="stat"><span>Previsão da meta</span><b class="num">${eta}</b><small>${etaSub}</small></div>
  </div>
  ${masked}
  <div class="prog-grid">
    <div>
      <section class="panel"><div class="ph"><h2>Peso e cintura</h2><div class="legend"><span><i style="background:var(--carrot)"></i>tendência</span><span><i style="background:var(--ink)"></i>pesagens</span><span><i style="background:var(--water)"></i>cintura</span></div></div>${weightChart(tr, p.goalWeight)}</section>
      <section class="panel"><div class="ph"><h2>Calorias, últimos 14 dias</h2><span class="sub">média ${logged.length ? fmt(avg) + ' kcal' : '—'}</span></div>${intakeChart(days, T)}</section>
    </div>
    <div class="prog-side">
    ${measuresPanel()}
    <section class="panel"><div class="ph"><h2>Histórico de peso</h2><span class="sub">${ws.length} registros</span></div>
      <ul class="hist">${[...ws].reverse().map((w, i, arr) => {
        const prev = arr[i + 1]; const dlt = prev ? w.weight - prev.weight : 0;
        return `<li><div class="d"><b class="num">${fmt(w.weight, 1)} kg</b>${prev ? ` <span class="num" style="font-size:12.5px;color:${dlt <= 0 ? 'var(--kale)' : 'var(--tomato)'}">${dlt <= 0 ? '−' : '+'}${fmt(Math.abs(dlt), 1)}</span>` : ''}<small>${dateLabel(w.date)}${w.waist ? ` · cintura ${fmt1(w.waist)} cm` : ''}</small></div>
          <button class="icon-btn sm" data-a="weight-edit" data-id="${w.id}" aria-label="Editar">${ic('pencil', 'sm')}</button></li>`;
      }).join('')}</ul>
    </section>
    </div>
  </div>`;
}
function spark(vals) {
  if (vals.length < 2) return '<svg class="spark" viewBox="0 0 64 24"></svg>';
  const lo = Math.min(...vals), hi = Math.max(...vals), rg = hi - lo || 1;
  const pts = vals.map((v, i) => [2 + (i / (vals.length - 1)) * 60, 3 + (1 - (v - lo) / rg) * 18]);
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 64 24" aria-hidden="true"><path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')}" fill="none" stroke="var(--water)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.4" fill="var(--water)"/></svg>`;
}
function measuresPanel() {
  const ms = Store.measures(), p = Store.p, last = ms[ms.length - 1];
  const head = `<div class="ph"><h2>Medidas</h2><button class="btn btn-soft btn-sm" data-a="meas-open">${ic('plus', 'sm')} Medir</button></div>`;
  if (!ms.length) return `<section class="panel">${head}<p class="muted" style="font-size:13.5px">A balança mistura gordura, água e músculo. A fita métrica mostra onde o corpo está mudando de verdade: é comum o peso parar e a cintura continuar caindo.</p>
    <p class="muted mt8" style="font-size:13.5px">Meça a cada 2 semanas, de manhã, antes de comer, sempre do mesmo jeito.</p>
    <button class="btn btn-primary btn-sm mt12" data-a="meas-open">${ic('plus', 'sm')} Registrar primeiras medidas</button></section>`;
  const ago = daysBetween(last.date, todayISO());
  const remind = ago >= 14 ? `<div class="hint mb12">${ic('info')}<span>Sua última medição foi há ${ago} dias. Hora de medir de novo.</span></div>` : '';
  let total = 0, since = null;
  const rows = MEASURES.map((d) => {
    const pts = ms.filter((m) => m[d.k]); if (!pts.length) return '';
    const a = pts[0], b = pts[pts.length - 1], dv = b[d.k] - a[d.k];
    if (pts.length > 1 && d.k !== 'arm' && d.k !== 'chest') { total += dv; if (!since || a.date < since) since = a.date; }
    const good = d.down ? dv < 0 : null, col = !dv || pts.length < 2 ? 'var(--muted)' : good === null ? 'var(--ink)' : good ? 'var(--kale)' : 'var(--tomato)';
    return `<li><span class="n"><b>${d.n}</b><small>${pts.length > 1 ? `${fmt1(a[d.k])} → ${fmt1(b[d.k])} cm` : `${fmt1(b[d.k])} cm · ${dShort(b.date)}`}</small></span>
      ${spark(pts.map((x) => x[d.k]))}
      <span class="dv num" style="color:${col}">${pts.length > 1 ? `${dv > 0 ? '+' : dv < 0 ? '−' : ''}${fmt1(Math.abs(dv))} cm` : '—'}</span></li>`;
  }).join('');
  // % de gordura estimada (Marinha americana): precisa de cintura + pescoço (+ quadril para mulheres)
  const bfAt = (date) => Calc.bodyFat(p.sex, p.height, Store.measureOn('waist', date), Store.measureOn('neck', date), Store.measureOn('hip', date));
  const bfDates = ms.filter((m) => bfAt(m.date) != null);
  let bf = '';
  if (bfDates.length) {
    const b0 = bfAt(bfDates[0].date), b1 = bfAt(bfDates[bfDates.length - 1].date);
    bf = `<div class="kv mt8"><span>Gordura corporal estimada</span><b class="num">${bfDates.length > 1 && Math.abs(b1 - b0) >= 0.1 ? `${fmt1(b0)}% → ` : ''}${fmt1(b1)}%</b></div>`;
  } else if (!Store.measureOn('neck', todayISO())) bf = `<p class="faint mt8" style="font-size:12.5px">Meça também o pescoço${p.sex === 'F' ? ' e o quadril' : ''} para o app estimar sua % de gordura.</p>`;
  const tot = since && total < -0.05 ? `<div class="meas-total"><span>Centímetros perdidos desde ${dShort(since)}</span><b class="num">${fmt1(-total)} cm</b></div>` : '';
  const hist = [...ms].reverse().slice(0, 6).map((m) => `<li><div class="d"><b>${dateLabel(m.date)}</b><small>${MEASURES.filter((d) => m[d.k]).map((d) => `${d.n.toLowerCase()} ${fmt1(m[d.k])}`).join(' · ')}</small></div>
      <button class="icon-btn sm" data-a="meas-edit" data-d="${m.date}" aria-label="Editar medidas de ${dateLabel(m.date)}">${ic('pencil', 'sm')}</button></li>`).join('');
  return `<section class="panel">${head}${remind}<ul class="meas">${rows}</ul>${tot}${bf}
    <details class="mt12"><summary class="muted" style="font-size:13px;font-weight:700;cursor:pointer">Medições anteriores (${ms.length})</summary><ul class="hist mt8">${hist}</ul></details></section>`;
}
let MS = null;
function measOpen(date) {
  const d = date || todayISO(), cur = (Store.core.measures || []).find((m) => m.date === d) || {}, merged = Store.measures().find((m) => m.date === d) || {};
  MS = { date: d, editing: !!date };
  const lastOf = (k) => { const v = Store.measureOn(k, addDays(d, -1)); return v ? `última: ${fmt1(v)}` : ''; };
  Sheet.open({ label: 'Medidas', tall: true, render: () => `${sheetHead(date ? 'Editar medidas' : 'Novas medidas', 'Fita métrica justa, sem apertar. Preencha só o que mediu.')}
    <div class="sheet-b"><div class="grid2">
      <label class="field" style="grid-column:1/-1"><span>Data</span><input class="input" type="date" id="ms-date" value="${d}" max="${todayISO()}"></label>
      ${MEASURES.map((m) => { const v = cur[m.k] ?? merged[m.k]; return `<label class="field"><span>${m.n} (cm)<small class="mtip">${m.tip}</small></span><input class="input num" id="ms-${m.k}" inputmode="decimal" value="${v ? fmt1(v) : ''}" placeholder="${lastOf(m.k)}"></label>`; }).join('')}
    </div></div>
    <div class="sheet-f">${date ? `<button class="btn btn-ghost btn-danger" data-a="meas-del">${ic('trash', 'sm')} Excluir</button>` : ''}<button class="btn btn-primary grow" data-a="meas-save">Salvar medidas</button></div>` });
}
function weightChart(tr, goal) {
  const pts = tr.pts;
  if (pts.length < 2) return `<p class="empty">Registre pelo menos duas pesagens para ver a curva. Pese-se sempre no mesmo horário, de preferência em jejum.</p>`;
  const W = chartW(), H = Math.round(W * 0.42), L = 34, Rm = 44, Tm = 14, B = 24;
  const d0 = pts[0].date, span = Math.max(7, daysBetween(d0, pts[pts.length - 1].date));
  const wv = pts.map((p) => p.w).concat([goal]); let lo = Math.floor(Math.min(...wv) - 0.5), hi = Math.ceil(Math.max(...wv) + 0.5);
  const x = (dt) => L + (daysBetween(d0, dt) / span) * (W - L - Rm), y = (v) => Tm + (1 - (v - lo) / (hi - lo)) * (H - Tm - B);
  const dEnd = pts[pts.length - 1].date, wa = Store.measures().filter((m) => m.waist && m.date >= d0 && m.date <= dEnd); let wlo = 0, whi = 1, yw = null;
  if (wa.length >= 2) { wlo = Math.floor(Math.min(...wa.map((p) => p.waist)) - 1); whi = Math.ceil(Math.max(...wa.map((p) => p.waist)) + 1); yw = (v) => Tm + (1 - (v - wlo) / (whi - wlo)) * (H - Tm - B); }
  let g = '';
  const stepY = Math.max(1, Math.round((hi - lo) / 5));
  for (let v = lo; v <= hi; v += stepY) g += `<line class="gl" x1="${L}" x2="${W - Rm}" y1="${y(v)}" y2="${y(v)}"/><text class="ax num" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  if (goal >= lo && goal <= hi) g += `<line x1="${L}" x2="${W - Rm}" y1="${y(goal)}" y2="${y(goal)}" stroke="var(--kale)" stroke-dasharray="5 5" stroke-width="1.5"/><text class="ax" x="${W - Rm + 4}" y="${y(goal) + 4}" fill="var(--kale)">meta</text>`;
  const nl = Math.min(5, pts.length);
  for (let i = 0; i < nl; i++) { const p = pts[Math.round((i / (nl - 1 || 1)) * (pts.length - 1))]; g += `<text class="ax" x="${x(p.date)}" y="${H - 6}" text-anchor="middle">${dShort(p.date)}</text>`; }
  if (yw) {
    g += `<path d="${wa.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)} ${yw(p.waist).toFixed(1)}`).join('')}" fill="none" stroke="var(--water)" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>`;
    const wl = wa[wa.length - 1], wx = x(wl.date), atEnd = wx > W - Rm - 30;
    g += `<text class="ax" x="${atEnd ? W - Rm + 4 : wx + 6}" y="${yw(wl.waist) + (atEnd ? 4 : -6)}" fill="var(--water)">${fmt1(wl.waist)}cm</text>`;
  }
  g += `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)} ${y(p.t).toFixed(1)}`).join('')}" fill="none" stroke="var(--carrot)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += pts.map((p) => `<circle cx="${x(p.date).toFixed(1)}" cy="${y(p.w).toFixed(1)}" r="3.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de peso">${g}</svg>`;
}
function intakeChart(days, T) {
  const W = chartW(), H = Math.round(W * 0.34), L = 40, B = 22, Tm = 10;
  const max = Math.max(T * 1.3, ...days.map((d) => d.k));
  const bw = (W - L - 10) / days.length;
  const y = (v) => Tm + (1 - v / max) * (H - Tm - B);
  let g = `<line x1="${L}" x2="${W - 6}" y1="${y(T)}" y2="${y(T)}" stroke="var(--kale)" stroke-dasharray="5 5" stroke-width="1.5"/><text class="ax num" x="${L - 6}" y="${y(T) + 4}" text-anchor="end">${fmt(T)}</text>`;
  days.forEach((d, i) => {
    const x = L + i * bw + 3, h = d.k ? (H - Tm - B) - (y(d.k) - Tm) : 0;
    g += d.k ? `<rect x="${x.toFixed(1)}" y="${y(d.k).toFixed(1)}" width="${(bw - 6).toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${d.k > T * 1.05 ? 'var(--tomato)' : 'var(--kale)'}" opacity="${d.dt === todayISO() ? 0.55 : 0.9}"/>` : `<rect x="${x.toFixed(1)}" y="${H - B - 3}" width="${(bw - 6).toFixed(1)}" height="3" rx="1.5" fill="var(--line)"/>`;
    g += `<text class="ax" x="${(x + (bw - 6) / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${WD3[parseISO(d.dt).getDay()][0]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calorias por dia">${g}</svg>`;
}

