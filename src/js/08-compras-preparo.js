/* ===================== COMPRAS & PREPARO ===================== */
function buyKey(id) { return GEN[id] ? GEN[id].b : 'x_' + id; }
function buyInfo(key) {
  if (BUY[key]) return BUY[key];
  const f = food(key.slice(2));
  return { n: f ? f.n : key, s: 'Outros', f: 1, unit: f && f.u === 'ml' ? 'ml' : undefined };
}
function fmtBuy(info, g) {
  if (info.per) {
    const n = Math.ceil(g / info.per - 0.15);
    if (info.unit === 'ovos') return n >= 12 ? `${n} ovos (${fmt(n / 12, n % 12 ? 1 : 0)} dz)` : `${n} ovos`;
    return `${n} ${info.unit}`;
  }
  const v = g * (info.f || 1);
  if (info.unit === 'ml') return grams(Math.ceil(v / 10) * 10, 'ml');
  const r = v >= 300 ? Math.ceil(v / 50) * 50 : Math.ceil(v / 10) * 10;
  return grams(r);
}
function shoppingList(plan) {
  const agg = {};
  plan.days.forEach((d) => Object.values(d.meals).forEach((items) => items.forEach((it) => {
    const k = buyKey(it.id); agg[k] = agg[k] || { key: k, g: 0 }; agg[k].g += it.g;
  })));
  const out = Object.values(agg).map((a) => {
    const info = buyInfo(a.key);
    return { key: a.key, n: info.n, s: info.s, note: info.note, buy: fmtBuy(info, a.g), plan: grams(a.g, info.unit === 'ml' ? 'ml' : 'g'), g: a.g };
  });
  out.push({ key: 'temperos', n: 'Alho, cebola, limão e ervas', s: 'Hortifruti', buy: 'à vontade', plan: 'temperos livres', g: 0 });
  return out.sort((a, b) => SHOP_SECTIONS.indexOf(a.s) - SHOP_SECTIONS.indexOf(b.s) || b.g - a.g);
}
const PREP_ROUNDS = {
  1: [{ when: 'Domingo', covers: [0, 1, 2, 3, 4, 5, 6], label: 'a semana inteira de uma vez' }],
  2: [{ when: 'Domingo', covers: [0, 1, 2, 3], label: 'cobre domingo a quarta' }, { when: 'Quarta à noite', covers: [4, 5, 6], label: 'cobre quinta a sábado' }],
  3: [{ when: 'Domingo', covers: [0, 1], label: 'cobre domingo e segunda' }, { when: 'Segunda à noite', covers: [2, 3], label: 'cobre terça e quarta' }, { when: 'Quarta à noite', covers: [4, 5, 6], label: 'cobre quinta a sábado' }],
};
const prepS = () => { const c = Store.core; c.prep = c.prep || {}; c.prep.rounds = c.prep.rounds || 2; c.prep.done = c.prep.done || {}; return c.prep; };
function prepPlan(plan, rounds = 2) {
  const blocks = PREP_ROUNDS[rounds] || PREP_ROUNDS[2];
  return blocks.map((b) => {
    const prot = {}, veg = {}, carb = {}; let boxes = 0;
    for (const di of b.covers) {
      const day = plan.days[di]; if (!day) continue;
      for (const [mid, items] of Object.entries(day.meals)) {
        if ((mid === 'almoco' || mid === 'jantar') && items.length) boxes++;
        for (const it of items) {
          const bucket = hasRole(it.id, 'P') || (hasRole(it.id, 'S') && it.id !== 'ovo' && it.id !== 'whey' && it.id !== 'atum') ? prot : hasRole(it.id, 'V') ? veg : hasRole(it.id, 'K') || it.id === 'feijao_carioca' ? carb : null;
          if (!bucket) continue;
          const e = bucket[it.id] || (bucket[it.id] = { g: 0, preps: new Set() });
          e.g += it.g; if (it.prep) e.preps.add(it.prep);
        }
      }
    }
    const line = (obj, verb) => Object.entries(obj).sort((a, b) => b[1].g - a[1].g).map(([id, e]) => {
      const [nm] = splitName(food(id).n);
      const extra = id === 'arroz_branco' || id === 'arroz_integral' || id === 'feijao_carioca' || id === 'macarrao'
        ? ` (cozinhe ~${grams(Math.round(e.g * (BUY[GEN[id].b].f) / 10) * 10)} seco)` : '';
      return { id, t: `${verb} ${nm.toLowerCase()}${extra}`, sub: [...e.preps].slice(0, 3).join(', '), g: grams(e.g) };
    });
    return { ...b, boxes, prot: line(prot, 'Preparar'), veg: line(veg, 'Higienizar e cortar'), carb: line(carb, 'Cozinhar') };
  });
}

