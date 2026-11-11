/* ===================== UTILITÁRIOS ===================== */
const pad2 = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayISO = () => toISO(new Date());
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (n, d = 0) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt1 = (n) => fmt(n, Math.abs(n % 1) > 0.05 ? 1 : 0);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const num = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) ? x : null; };
const WD = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WD3 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dShort = (iso) => { const d = parseISO(iso); return `${d.getDate()} ${MON[d.getMonth()]}`; };
function dateLabel(iso) {
  const t = todayISO();
  if (iso === t) return 'Hoje';
  if (iso === addDays(t, -1)) return 'Ontem';
  const d = parseISO(iso);
  return `${WD3[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
}
function grams(g, u = 'g') {
  if (u === 'ml') return g >= 1000 ? `${fmt(g / 1000, 2)} L` : `${fmt(g)} ml`;
  return g >= 1000 ? `${fmt(g / 1000, g % 1000 === 0 ? 0 : 2)} kg` : `${fmt(g)} g`;
}

const MEALS = [
  { id: 'cafe', label: 'Café da manhã', ic: 'coffee', share: 0.22 },
  { id: 'almoco', label: 'Almoço', ic: 'sun', share: 0.36 },
  { id: 'lanche', label: 'Lanche', ic: 'apple', share: 0.16 },
  { id: 'jantar', label: 'Jantar', ic: 'moon', share: 0.30 },
  { id: 'ceia', label: 'Ceia', ic: 'star', share: 0.10 },
];
const mealById = (id) => MEALS.find((m) => m.id === id) || MEALS[1];

const ACTIVITY = {
  sedentario: { label: 'Sedentário', desc: 'Trabalho sentado, anda pouco', neat: 0.10 },
  leve: { label: 'Levemente ativo', desc: 'Fica em pé parte do dia', neat: 0.275 },
  moderado: { label: 'Ativo', desc: 'Trabalha em pé, anda bastante', neat: 0.45 },
  intenso: { label: 'Muito ativo', desc: 'Trabalho físico pesado', neat: 0.625 },
};
const PACES = [0, 0.25, 0.5, 0.75, 1];

