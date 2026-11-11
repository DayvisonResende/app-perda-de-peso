/* ===================== ALIMENTOS ===================== */
let _fmap = null;
const allFoods = () => [...(Store.core?.customFoods || []), ...FOODS];
function food(id) {
  if (!_fmap || _fmap._n !== allFoods().length) { _fmap = new Map(allFoods().map((f) => [f.id, f])); _fmap._n = allFoods().length; }
  return _fmap.get(id);
}
const resetFoodCache = () => { _fmap = null; };
function nutr(fid, g) {
  const f = food(fid); if (!f) return { kcal: 0, p: 0, c: 0, f: 0 };
  const k = (v) => (v * g) / 100;
  return { kcal: k(f.k), p: k(f.p), c: k(f.c), f: k(f.f) };
}
function sumN(items) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const it of items) { const n = it.kcal != null ? it : nutr(it.id, it.g); t.kcal += n.kcal; t.p += n.p; t.c += n.c; t.f += n.f; }
  return t;
}
function splitName(n) {
  const m = String(n).match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  return m ? [m[1], m[2]] : [n, ''];
}
function unitLabel(fid, g) {
  const f = food(fid); if (!f) return grams(g);
  const por = (f.por || [])[0];
  if (por && ['ovo', 'unidade', 'scoop', 'fatia', 'pote'].includes(por[0]) && g % por[1] === 0) {
    const n = g / por[1];
    const lbl = por[0] === 'ovo' ? (n > 1 ? 'ovos' : 'ovo') : por[0] === 'unidade' ? (n > 1 ? 'unidades' : 'unidade') : n > 1 ? por[0] + 's' : por[0];
    return `${fmt(n)} ${lbl}`;
  }
  return grams(g, f.u);
}

