/* ===================== GERADOR DE CARDÁPIO ===================== */
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function shuffle(a, r) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const roleOf = (id) => (GEN[id] ? GEN[id].r : '');
const hasRole = (id, r) => roleOf(id).includes(r);
const genIds = (r, lc) => Object.keys(GEN).filter((id) => hasRole(id, r) && (!lc || GEN[id].lc));

const GEN_DEFAULTS = {
  prot: ['frango_cru', 'patinho_cru', 'moida_cru', 'musculo_cru', 'ovo'],
  veg: ['brocolis_cru', 'couveflor_cru', 'cenoura_crua', 'abobrinha_cru', 'vagem_cru'],
  carb: ['arroz_branco', 'batata_doce', 'mandioca'],
};

function roundStep(g, spec) { return clamp(Math.round(g / spec.step) * spec.step, spec.min, spec.max); }

// Ajuste fino: mexe em passos de cada item até bater as calorias, protegendo a proteína
function fitItems(items, targetK, targetP, tol = 0.035) {
  for (let it = 0; it < 60; it++) {
    const t = sumN(items), diff = targetK - t.kcal;
    if (Math.abs(diff) <= Math.max(20, targetK * tol)) break;
    const dir = Math.sign(diff); let best = null;
    for (const item of items) {
      const spec = GEN[item.id]; if (!spec || spec.min === spec.max) continue;
      const ng = item.g + dir * spec.step; if (ng < spec.min || ng > spec.max) continue;
      const dn = nutr(item.id, spec.step);
      const nd = Math.abs(diff - dir * dn.kcal);
      let score = nd;
      const isProt = hasRole(item.id, 'P') || hasRole(item.id, 'S');
      if (dir < 0 && hasRole(item.id, 'P') && t.p - dn.p < targetP * 0.92) score += 140;
      if (dir < 0 && hasRole(item.id, 'S') && t.p - dn.p < targetP * 0.85) score += 80;
      if (dir > 0 && isProt && t.p + dn.p > targetP * 1.08) score += 90;
      if (dir > 0 && hasRole(item.id, 'G')) score += 12;
      if (dir > 0 && hasRole(item.id, 'V')) score += item.g >= 200 ? 70 : 25;
      if (dir < 0 && hasRole(item.id, 'V')) score += 30;
      if (dir < 0 && hasRole(item.id, 'N')) score += 15;
      if (nd < Math.abs(diff) && (!best || score < best.score)) best = { item, ng, score };
    }
    if (!best) break;
    best.item.g = best.ng;
  }
  return items;
}

function pickPrep(id, r) { const l = PREPS[id]; return l ? l[Math.floor(r() * l.length)] : undefined; }
function mk(id, g, r) { const spec = GEN[id]; const it = { id, g: spec ? roundStep(g, spec) : g }; const pr = pickPrep(id, r); if (pr) it.prep = pr; return it; }

function composeMeal(slot, K, Pt, ctx, r) {
  const lc = ctx.style === 'lowcarb', items = [];
  const protG = (id, share = 1) => (Pt * share) / ((food(id).p || 20) / 100);
  if (slot === 'almoco' || slot === 'jantar') {
    const prot = ctx.main[slot];
    items.push(mk(prot, protG(prot, 0.88), r));
    if (lc) {
      items.push(mk(ctx.veg[0], 200, r));
      if (ctx.veg[1]) items.push(mk(ctx.veg[1], 120, r));
      items.push({ id: 'azeite', g: 15 });
    } else {
      items.push(mk(ctx.veg[0], 150, r));
      items.push({ id: r() < 0.5 ? 'tomate' : 'alface', g: 80 });
      items.push({ id: 'azeite', g: 5 });
      const carb = ctx.carb[slot];
      const pair = GEN[carb] && GEN[carb].pair;
      const used = sumN(items).kcal + (pair ? nutr(pair, 100).kcal : 0);
      items.push(mk(carb, ((K - used) * 100) / food(carb).k, r));
      if (pair) items.push({ id: pair, g: 100 });
    }
  } else if (slot === 'lanche') {
    if (lc) {
      if (ctx.snackAlt) { items.push({ id: 'ovo', g: 100, prep: 'cozidos' }, { id: 'morango', g: 100 }); }
      else { const s = ctx.snack; items.push(mk(s, protG(s, 0.85), r)); items.push(mk(ctx.crunch, 100, r)); }
      items.push({ id: ctx.nut, g: GEN[ctx.nut].min * 2 });
    } else {
      const fr = ctx.fruit; items.push({ id: fr, g: GEN[fr].min });
      if (ctx.snackAlt) items.push({ id: 'iogurte_natural', g: 170 }, { id: 'aveia', g: 20 });
      else items.push({ id: 'pao_integral', g: 50 }, { id: 'ovo', g: 100, prep: 'mexidos' });
    }
  } else if (slot === 'cafe') {
    if (lc) items.push({ id: 'ovo', g: 150, prep: 'mexidos' }, { id: 'minas_frescal', g: 30 }, { id: ctx.snackAlt ? 'abacate' : 'morango', g: ctx.snackAlt ? 60 : 100 });
    else items.push({ id: ctx.bkf, g: GEN[ctx.bkf].min * 2 }, { id: 'ovo', g: 100, prep: 'mexidos' }, { id: ctx.fruit, g: GEN[ctx.fruit].min });
  } else if (slot === 'ceia') {
    items.push(lc ? { id: 'cottage', g: 90 } : { id: 'iogurte_natural', g: 170 });
    if (!lc) items.push({ id: 'morango', g: 100 });
  }
  return fitItems(items, K, Pt);
}

function buildPlan(o) {
  const r = rng(o.seed || Date.now());
  const lc = o.style === 'lowcarb';
  const meals = MEALS.filter((m) => o.meals.includes(m.id));
  const shareSum = meals.reduce((s, m) => s + m.share, 0);
  let prot = (o.prot || []).filter((id) => hasRole(id, 'P'));
  if (!prot.length) prot = GEN_DEFAULTS.prot.filter((id) => hasRole(id, 'P'));
  const eggsOk = (o.prot || GEN_DEFAULTS.prot).includes('ovo');
  let veg = (o.veg || []).filter((id) => hasRole(id, 'V') && (!lc || GEN[id].lc));
  if (veg.length < 2) veg = [...new Set([...veg, ...GEN_DEFAULTS.veg])];
  const crunchy = veg.filter((id) => hasRole(id, 'C')).concat(['cenoura_crua']);
  let carbs = (o.carb || []).filter((id) => hasRole(id, 'K'));
  if (!carbs.length) carbs = GEN_DEFAULTS.carb;
  const fruits = lc ? ['morango'] : ['banana_prata', 'maca', 'mamao', 'laranja', 'morango', 'goiaba'];
  const bkfs = ['pao_frances', 'tapioca', 'cuscuz', 'pao_integral'];
  const snackProts = prot.filter((id) => hasRole(id, 'S'));

  const blocks = o.batch ? [[0, 1, 2, 3], [4, 5, 6]] : [[0], [1], [2], [3], [4], [5], [6]];
  const pShuf = shuffle(prot, r), vShuf = shuffle(veg.filter((v) => !hasRole(v, 'C') || v === 'cenoura_crua'), r);
  const days = [];
  blocks.forEach((blk, bi) => {
    const pA = pShuf[(bi * 2) % pShuf.length], pB = pShuf[(bi * 2 + 1) % pShuf.length];
    const vA = vShuf[(bi * 2) % vShuf.length], vB = vShuf[(bi * 2 + 1) % vShuf.length], vC = vShuf[(bi * 2 + 2) % vShuf.length];
    for (const d of blk) {
      const swap = (d + bi) % 2 === 1;
      const ctx = {
        style: o.style,
        main: { almoco: swap ? pB : pA, jantar: swap ? pA : pB },
        veg: d % 2 ? [vB, vC !== vB ? vC : vA] : [vA, vB],
        carb: { almoco: carbs[(d * 2) % carbs.length], jantar: carbs[(d * 2 + 1) % carbs.length] },
        snack: snackProts.length ? snackProts[(d + bi) % snackProts.length] : pA,
        snackAlt: eggsOk && d % 3 === 2,
        crunch: crunchy[d % crunchy.length],
        fruit: fruits[d % fruits.length],
        nut: ['amendoim', 'castanha_caju', 'castanha_para'][d % 3],
        bkf: bkfs[d % bkfs.length],
      };
      if (pA === pB && pShuf.length > 1) ctx.main.jantar = pShuf[(bi * 2 + 2) % pShuf.length];
      const day = { meals: {}, tip: '' };
      for (const m of meals) {
        const K = (o.kcal * m.share) / shareSum, Pt = (o.protein * m.share) / shareSum;
        day.meals[m.id] = composeMeal(m.id, K, Pt, ctx, r);
      }
      const all = Object.values(day.meals).flat();
      fitItems(all, o.kcal, o.protein, 0.025);
      const lunchProt = ctx.main.almoco;
      const tips = [...(TIPS[lunchProt] || []), ...(day.meals.jantar || []).some((i) => i.id === 'couveflor_cru') ? TIPS.couveflor_cru : [], ...TIPS._];
      day.tip = tips[Math.floor(r() * tips.length)];
      days[d] = day;
    }
  });
  return { days, source: 'gerado', at: Date.now(), prefs: { style: o.style, meals: o.meals, prot: o.prot, veg: o.veg, carb: o.carb, batch: o.batch } };
}

// Ajusta um cardápio vindo de fora (IA) às metas do dia, usando os mesmos passos do gerador
function fitPlanDays(plan, kcal, protein, meals) {
  const shareSum = MEALS.filter((m) => meals.includes(m.id)).reduce((s, m) => s + m.share, 0) || 1;
  for (const day of plan.days) {
    for (const [mid, items] of Object.entries(day.meals)) {
      const m = mealById(mid); fitItems(items, (kcal * m.share) / shareSum, (protein * m.share) / shareSum, 0.05);
    }
    fitItems(Object.values(day.meals).flat(), kcal, protein, 0.03);
  }
  return plan;
}

function planDay(date) {
  const plan = Store.core.plan; if (!plan) return null;
  return plan.days[parseISO(date).getDay()] || null;
}

