/* ===================== MOTOR METABÓLICO =====================
   Gasto = TMB + rotina (NEAT) + digestão (ETA, do que você comeu) + exercício */
const Calc = {
  KCAL_KG: 7700,
  bodyFat(sex, height, waist, neck, hip) {
    if (!height || !waist || !neck) return null;
    let bf;
    if (sex === 'F') {
      if (!hip || waist + hip - neck <= 0) return null;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
    } else {
      if (waist - neck <= 0) return null;
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    }
    return isFinite(bf) ? clamp(bf, 3, 60) : null;
  },
  bmr({ sex, weight, height, age, bf, formula, manual }) {
    if (formula === 'manual' && manual > 500) return { v: manual, f: 'manual' };
    if (formula === 'katch' && bf != null) return { v: 370 + 21.6 * weight * (1 - bf / 100), f: 'katch' };
    return { v: 10 * weight + 6.25 * height - 5 * age + (sex === 'F' ? -161 : 5), f: 'mifflin' };
  },
  tef(e) {
    const mk = (e.p || 0) * 4 + (e.c || 0) * 4 + (e.f || 0) * 9;
    if (mk < e.kcal * 0.5) return e.kcal * 0.1;
    return (e.p || 0) * 4 * 0.25 + (e.c || 0) * 4 * 0.08 + (e.f || 0) * 9 * 0.03;
  },
  exKcal: (met, weight, min) => Math.max(0, met - 1) * weight * (min / 60),
  plan({ bmr, neat, pace, sex, custom }) {
    const maintenance = (bmr + neat) / 0.9;
    const floor = sex === 'F' ? 1200 : 1500;
    let target = maintenance - (pace * this.KCAL_KG) / 7, clamped = false;
    if (custom && custom >= 800) target = custom;
    else if (target < floor) { target = floor; clamped = true; }
    target = Math.round(target / 10) * 10;
    return { maintenance, target, floor, clamped, custom: !!(custom && custom >= 800), weekly: ((maintenance - target) * 7) / this.KCAL_KG };
  },
  macros(target, weight, goal, style) {
    const ref = goal && goal < weight ? (goal + weight) / 2 : weight;
    if (style === 'lowcarb') {
      const protein = Math.round(Math.min(2.0 * ref, (target * 0.42) / 4));
      const carbs = Math.round((target * 0.18) / 4);
      const fat = Math.max(30, Math.round((target - protein * 4 - carbs * 4) / 9));
      return { protein, carbs, fat };
    }
    const protein = Math.round(Math.min(1.8 * ref, (target * 0.35) / 4));
    const fat = Math.round((target * 0.27) / 9);
    return { protein, fat, carbs: Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4)) };
  },
  water: (weight, perKg = 35) => Math.round((weight * perKg) / 250) * 250,
};

