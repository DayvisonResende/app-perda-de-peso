/* ===================== ESTADO DO DIA ===================== */
function settings() {
  const p = Store.p;
  return { style: p.style || 'lowcarb', meals: p.meals && p.meals.length ? p.meals : ['almoco', 'lanche', 'jantar'] };
}
function computeDay(date) {
  const p = Store.p, day = Store.day(date);
  const weight = Store.weightOn(date), waist = Store.waistOn(date);
  const bf = Calc.bodyFat(p.sex, p.height, waist, p.neck, p.hip);
  const b = Calc.bmr({ sex: p.sex, weight, height: p.height, age: p.age, bf, formula: p.bmrFormula, manual: p.bmrManual });
  const neat = b.v * (ACTIVITY[p.activity] || ACTIVITY.sedentario).neat;
  let intake = 0, P = 0, C = 0, Fa = 0, tef = 0;
  for (const e of day.foods) { intake += e.kcal; P += e.p || 0; C += e.c || 0; Fa += e.f || 0; tef += Calc.tef(e); }
  const exercise = day.ex.reduce((s, e) => s + e.kcal, 0);
  const plan = Calc.plan({ bmr: b.v, neat, pace: p.pace, sex: p.sex, custom: p.customTarget });
  const macros = Calc.macros(plan.target, weight, p.goalWeight, settings().style);
  const spent = b.v + neat + tef + exercise;
  return { date, day, weight, waist, bf, bmr: b.v, bmrF: b.f, neat, tef, intake, P, C, F: Fa, exercise, spent,
    balance: intake - spent, plan, macros, water: Calc.water(weight, p.waterPerKg || 35) };
}

