/* ===================== IA (Claude dentro do app) ===================== */
const AI = {
  s: null,
  async init() {
    try { if (window.claude && window.claude.use) { this.s = await window.claude.use('sample'); if (this.s) App.render(); } } catch (e) { this.s = null; }
  },
  table(ids) {
    const list = ids ? ids.map(food).filter(Boolean) : allFoods();
    return list.map((f) => `${f.id}|${f.n}|${Math.round(f.k)} kcal|P${f.p} C${f.c} G${f.f}|${(f.por || []).map((p) => `${p[0]}=${p[1]}${f.u}`).join(', ')}`).join('\n');
  },
  errMsg(e) {
    const c = e && e.code;
    if (c === 'not_granted') return 'Você não liberou o acesso ao Claude neste app. Dá para usar todo o resto normalmente.';
    if (c === 'rate_limited') return 'Limite de uso atingido por agora. Tente de novo mais tarde.';
    if (c === 'aborted') return 'Cancelado.';
    return 'Não consegui uma resposta válida. Tente de novo ou reformule.';
  },
};

