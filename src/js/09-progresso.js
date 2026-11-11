/* ===================== PROGRESSO ===================== */
function weightTrend() {
  const ws = Store.weights(); if (!ws.length) return { pts: [], rate: null };
  let ema = ws[0].weight, last = ws[0].date; const pts = [];
  for (const w of ws) {
    const gap = Math.max(1, daysBetween(last, w.date)); const a = 1 - Math.pow(0.9, gap);
    ema = pts.length ? ema + a * (w.weight - ema) : w.weight; last = w.date;
    pts.push({ date: w.date, w: w.weight, t: ema, waist: w.waist });
  }
  const end = pts[pts.length - 1].date, recent = pts.filter((p) => daysBetween(p.date, end) <= 28);
  let rate = null;
  if (recent.length >= 2 && daysBetween(recent[0].date, end) >= 6) {
    const xs = recent.map((p) => daysBetween(recent[0].date, p.date)), ys = recent.map((p) => p.w);
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let nu = 0, de = 0; xs.forEach((x, i) => { nu += (x - mx) * (ys[i] - my); de += (x - mx) ** 2; });
    rate = de ? (nu / de) * 7 : null;
  }
  return { pts, rate };
}

