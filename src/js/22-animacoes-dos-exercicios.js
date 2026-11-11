/* ===================== ANIMAÇÕES DOS EXERCÍCIOS =====================
   Boneco de perfil (olhando para a direita). Cada pose define quadril, ângulo do tronco e onde
   mãos e pés devem estar; cotovelos e joelhos saem por cinemática inversa, então os ossos
   mantêm o tamanho. Chão em y=118. Ângulos em graus (0 = direita, 90 = para cima). */
const BONE = { torso: 34, neck: 13, th: 24, sh: 24, ua: 17, fa: 17 };
const GY = 118;
const v2 = (a, d) => [Math.cos((a * Math.PI) / 180) * d, -Math.sin((a * Math.PI) / 180) * d];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
function ik(a, b, l1, l2, bend) {
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.05, min = Math.abs(l1 - l2) + 0.05;
  if (d > max) { b = [a[0] + (dx / d) * max, a[1] + (dy / d) * max]; d = max; }
  if (d < min) { b = [a[0] + (dx / d) * min, a[1] + (dy / d) * min]; d = min; }
  const base = Math.atan2(b[1] - a[1], b[0] - a[0]), off = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const ang = base + bend * off;
  return [[a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1], b];
}
// spec: { p:[x,y] quadril, t: ângulo do tronco, h: mão, h2, f: pé, f2, eb/kb: lado da dobra (+1/-1), ht: inclinação da cabeça }
function body(sp) {
  const P = sp.p, S = add(P, v2(sp.t, BONE.torso)), H = add(S, v2(sp.t + (sp.ht || 0), BONE.neck));
  const [E, W] = ik(S, sp.h, BONE.ua, BONE.fa, sp.eb ?? 1), [K, A] = ik(P, sp.f, BONE.th, BONE.sh, sp.kb ?? -1);
  const [E2, W2] = ik(S, sp.h2 || sp.h, BONE.ua, BONE.fa, sp.eb2 ?? sp.eb ?? 1), [K2, A2] = ik(P, sp.f2 || sp.f, BONE.th, BONE.sh, sp.kb2 ?? sp.kb ?? -1);
  return { H, S, P, E, W, E2, W2, K, A, K2, A2 };
}
// atalhos de pose
const plank = (A, t, hand, o = {}) => { const P = add(A, v2(t, BONE.th + BONE.sh)); return { p: P, t, h: hand, f: A, eb: -1, kb: -1, ...o }; };
const kneelPlank = (K, t, hand, o = {}) => { const P = add(K, v2(t, BONE.th)); return { p: P, t, h: hand, f: add(K, [-22, -10]), eb: -1, kb: -1, ...o }; };
const hang = (bar, pullY, o = {}) => { // pendurado na barra em bar=[x,y]; pullY: quanto o ombro sobe
  const S = [bar[0] - 2, bar[1] + 34 - pullY], P = [S[0] - 3, S[1] + BONE.torso];
  return { p: P, t: 95, h: bar, f: o.f || [P[0] - 4, P[1] + 47], eb: -1, kb: -1, ...o };
};

const PROPS = {
  floor: `<line x1="6" y1="${GY + 1}" x2="194" y2="${GY + 1}" class="ax-floor"/>`,
  wall: (x) => `<rect x="${x}" y="8" width="7" height="${GY - 7}" class="ax-prop"/>`,
  box: (x, w, y) => `<rect x="${x}" y="${y}" width="${w}" height="${GY + 1 - y}" rx="2" class="ax-prop"/>`,
  bar: (x, y) => `<line x1="${x - 28}" y1="${y}" x2="${x + 28}" y2="${y}" class="ax-bar"/><line x1="${x - 28}" y1="${y}" x2="${x - 28}" y2="${GY}" class="ax-post"/><line x1="${x + 28}" y1="${y}" x2="${x + 28}" y2="${GY}" class="ax-post"/>`,
  pbars: (x, y) => `<line x1="${x - 34}" y1="${y}" x2="${x + 34}" y2="${y}" class="ax-bar"/><line x1="${x - 26}" y1="${y}" x2="${x - 26}" y2="${GY}" class="ax-post"/><line x1="${x + 26}" y1="${y}" x2="${x + 26}" y2="${GY}" class="ax-post"/>`,
};
const hangT = (bar, pullY, o = {}) => ({ ...hang(bar, pullY, o), t: 85 });
const stand = (x, o = {}) => ({ p: [x, 70], t: 90, h: [x + 3, 70], f: [x + 2, GY - 1], kb: -1, eb: -1, ...o });
const ANIM = {
  // empurrar
  flex: { pr: ['floor'], f: [plank([40, 117], 22, [124, 118]), plank([40, 117], 7, [124, 118])] },
  flex_inc: { pr: ['floor', ['box', 112, 40, 88]], f: [plank([30, 117], 38, [120, 88]), plank([30, 117], 28, [120, 88])] },
  flex_joelhos: { pr: ['floor'], f: [kneelPlank([70, 117], 33, [122, 118]), kneelPlank([70, 117], 10, [122, 118])] },
  flex_pes: { pr: ['floor', ['box', 22, 32, 96]], f: [plank([40, 95], 6.3, [124, 118]), plank([40, 95], -8, [124, 118])] },
  flex_pseudo: { pr: ['floor'], f: [plank([40, 117], 22, [110, 118]), plank([40, 117], 7, [110, 118])] },
  flex_parede: { pr: ['floor', ['wall', 155]], f: [plank([100, 117], 70, [153, 60]), plank([100, 117], 60, [153, 60])] },
  pike: { pr: ['floor'], f: [{ p: [72.4, 71.9], t: -25, h: [106, 118], f: [56, 117] }, { p: [72.4, 71.9], t: -55, h: [106, 118], f: [56, 117] }] },
  pike_elev: { pr: ['floor', ['box', 18, 32, 84]], f: [{ p: [83.3, 55.5], t: -70, h: [100, 118], f: [44, 83] }, { p: [89.1, 66.6], t: -85, h: [100, 118], f: [44, 83] }] },
  wall_walk: { pr: ['floor', ['wall', 28]], f: [plank([40, 117], 22, [124, 118]), { p: [54, 52], t: -88, h: [56, 118], f: [37, 10] }], seq: [0, 1, 1, 0], kt: [0, 0.45, 0.7, 1] },
  hs_costas: { pr: ['floor', ['wall', 42]], hold: 1, f: [{ p: [60, 52], t: -90, h: [60, 118], f: [51, 6] }, { p: [60, 51], t: -90, h: [60, 118], f: [51, 5] }] },
  hs_frente: { pr: ['floor', ['wall', 72]], hold: 1, f: [{ p: [62, 52], t: -90, h: [60, 118], f: [70, 6], ht: 0 }, { p: [62, 51], t: -90, h: [60, 118], f: [70, 5] }] },
  hs_livre: { pr: ['floor'], hold: 1, f: [{ p: [98, 52], t: -88, h: [100, 118], f: [96, 5] }, { p: [101, 52], t: -92, h: [100, 118], f: [104, 5] }] },
  hspu: { pr: ['floor', ['wall', 42]], f: [{ p: [60, 52], t: -90, h: [60, 118], f: [51, 6] }, { p: [60, 70], t: -90, h: [60, 118], f: [51, 24] }] },
  hspu_parc: { pr: ['floor', ['wall', 42], ['box', 64, 18, 108]], f: [{ p: [60, 52], t: -90, h: [58, 118], f: [51, 6] }, { p: [60, 62], t: -90, h: [58, 118], f: [51, 16] }] },
  // mergulho
  dip: { pr: [['pbars', 110, 62], 'floor'], f: [{ p: [108, 62], t: 88, h: [112, 62], f: [92, 100], kb: 1 }, { p: [104, 82], t: 78, h: [112, 62], f: [88, 118], kb: 1, eb: -1 }] },
  dip_fundo: { pr: [['pbars', 110, 62], 'floor'], f: [{ p: [108, 62], t: 88, h: [112, 62], f: [92, 100], kb: 1 }, { p: [102, 88], t: 75, h: [112, 62], f: [86, 118], kb: 1, eb: -1 }] },
  dip_suporte: { pr: [['pbars', 110, 62], 'floor'], hold: 1, f: [{ p: [108, 62], t: 88, h: [112, 62], f: [92, 100], kb: 1 }, { p: [108, 61], t: 88, h: [112, 62], f: [92, 99], kb: 1 }] },
  banco: { pr: ['floor', ['box', 30, 40, 88]], f: [{ p: [75, 89], t: 95, h: [66, 88], f: [118, 117], kb: 1, eb: -1 }, { p: [77, 107], t: 95, h: [66, 88], f: [118, 117], kb: 1, eb: -1 }] },
  banco_reto: { pr: ['floor', ['box', 30, 40, 88]], f: [{ p: [75, 89], t: 95, h: [66, 88], f: [132, 117], kb: 1, eb: -1 }, { p: [77, 106], t: 95, h: [66, 88], f: [134, 117], kb: 1, eb: -1 }] },
  // puxar
  pull: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], 0, { f: [97, 104], kb: 1 }), hangT([118, 14], 26, { f: [97, 78], kb: 1 })] },
  pull_neg: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], 26, { f: [97, 78], kb: 1 }), hangT([118, 14], 0, { f: [97, 104], kb: 1 })], seq: [0, 1, 0], kt: [0, 0.8, 1] },
  pull_L: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], 0, { f: [162, 84] }), hangT([118, 14], 26, { f: [162, 58] })] },
  hang: { pr: [['bar', 118, 14], 'floor'], hold: 1, f: [hangT([118, 14], 0, { f: [97, 104], kb: 1 }), hangT([118, 14], 1, { f: [96, 103], kb: 1 })] },
  hang_escap: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], -2, { f: [97, 106], kb: 1 }), hangT([118, 14], 5, { f: [97, 99], kb: 1 })] },
  row: { pr: [['bar', 124, 78], 'floor'], f: [plank([40, 117], 4, [124, 78], { eb: 1 }), plank([40, 117], 24.9, [124, 78], { eb: 1 })] },
  // costas sem equipamento
  prone_hover: { pr: ['floor'], f: [{ p: [80, 113], t: 5, h: [127, 104], f: [32, 115], eb: -1 }, { p: [80, 113], t: 9, h: [90, 104], f: [32, 115], eb: 1 }] },
  escap_canto: { pr: ['floor', ['wall', 34]], f: [plank([98, 117], 113, [44, 38], { eb: 1 }), plank([98, 117], 104, [44, 34], { eb: 1 })] },
  back_widow: { pr: ['floor'], f: [{ p: [92, 113], t: 180, h: [64, 98], f: [124, 117], kb: -1, eb: 1 }, { p: [92, 113], t: 160, h: [68, 88], f: [124, 117], kb: -1, eb: 1 }] },
  row_porta: { pr: ['floor', ['wall', 141]], rope: [141, 30], f: [plank([136, 117], 116, [118, 47], { eb: 1 }), plank([136, 117], 101, [131, 40], { eb: 1 })] },
  row_alta: { pr: [['bar', 112, 60], 'floor'], f: [plank([40, 117], 18, [112, 60]), plank([40, 117], 38.4, [112, 60])] },
  row_pes: { pr: [['bar', 122, 52], 'floor', ['box', 22, 32, 96]], f: [plank([40, 95], 8, [122, 52]), plank([40, 95], 27.7, [122, 52])] },
  // pernas
  squat: { pr: ['floor'], f: [stand(100), { p: [84, 96], t: 60, h: [128, 64], f: [102, 117], kb: -1, eb: -1 }] },
  squat_cad: { pr: ['floor', ['box', 58, 26, 96]], f: [stand(100), { p: [80, 94], t: 62, h: [126, 62], f: [102, 117], kb: -1, eb: -1 }] },
  lunge: { pr: ['floor'], f: [stand(104, { f: [112, 117], f2: [100, 117] }), { p: [92, 92], t: 88, h: [94, 92], f: [116, 117], f2: [60, 114], kb: -1, kb2: 1 }] },
  bulgaro: { pr: ['floor', ['box', 24, 32, 90]], f: [{ p: [94, 72], t: 90, h: [96, 72], f: [112, 117], f2: [52, 89], kb: -1, kb2: 1 }, { p: [86, 96], t: 84, h: [90, 96], f: [114, 117], f2: [52, 89], kb: -1, kb2: 1 }] },
  pistol: { pr: ['floor'], f: [stand(100, { f2: [128, 104], h: [128, 58] }), { p: [92, 104], t: 62, h: [136, 80], f: [100, 117], f2: [140, 106], kb: -1, kb2: -1 }] },
  pistol_cad: { pr: ['floor', ['box', 62, 26, 96]], f: [stand(100, { f2: [128, 104], h: [128, 58] }), { p: [84, 94], t: 64, h: [132, 68], f: [100, 117], f2: [136, 102], kb: -1, kb2: -1 }] },
  bridge: { pr: ['floor'], f: [{ p: [94, 113], t: 180, h: [84, 117], f: [122, 117], kb: -1, ht: 0 }, { p: [87.9, 93.5], t: 215, h: [84, 117], f: [122, 117], kb: -1 }] },
  bridge1: { pr: ['floor'], f: [{ p: [94, 113], t: 180, h: [84, 117], f: [122, 117], f2: [138, 98], kb: -1 }, { p: [87.9, 93.5], t: 215, h: [84, 117], f: [122, 117], f2: [132, 76], kb: -1 }] },
  thrust1: { pr: ['floor', ['box', 26, 34, 92]], f: [{ p: [77.9, 116], t: 130, h: [60, 92], f: [118, 117], f2: [130, 96], kb: -1 }, { p: [90, 90], t: 180, h: [60, 92], f: [118, 117], f2: [136, 76], kb: -1 }] },
  nordic: { pr: ['floor', ['box', 40, 14, 108]], f: [kneelPlank([90, 117], 90, [96, 80], { eb: -1 }), kneelPlank([90, 117], 28, [150, 117], { eb: -1 })], seq: [0, 1, 0], kt: [0, 0.75, 1] },
  // core
  plank_ante: { pr: ['floor'], hold: 1, f: [plank([40, 117], 12, [138, 117], { eb: -1 }), plank([40, 117], 12.6, [138, 117], { eb: -1 })] },
  hollow: { pr: ['floor'], hold: 1, f: [{ p: [100, 114], t: 160, h: [36, 98], f: [146, 104], ht: 0 }, { p: [100, 114], t: 157, h: [36, 94], f: [146, 100] }] },
  knee_raise: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], 0, { f: [111, 108], kb: 1 }), hangT([118, 14], 0, { f: [136, 104], kb: -1 })] },
  leg_raise: { pr: [['bar', 118, 14], 'floor'], f: [hangT([118, 14], 0, { f: [111, 108] }), hangT([118, 14], 0, { f: [161, 74] })] },
  lsit: { pr: ['floor', ['box', 92, 16, 104]], hold: 1, f: [{ p: [98, 104], t: 92, h: [102, 104], f: [146, 104] }, { p: [98, 103], t: 92, h: [102, 104], f: [146, 102] }] },
  lsit_tuck: { pr: ['floor', ['box', 92, 16, 104]], hold: 1, f: [{ p: [98, 104], t: 92, h: [102, 104], f: [118, 98], kb: -1 }, { p: [98, 103], t: 92, h: [102, 104], f: [118, 96], kb: -1 }] },
  dragon: { pr: ['floor', ['box', 30, 130, 98]], f: [{ p: [75.9, 62.5], t: 260, h: [50, 97], f: [84.2, 15.2] }, { p: [103.5, 90.1], t: 190, h: [50, 97], f: [150.8, 81.8] }], seq: [0, 1, 0], kt: [0, 0.8, 1] },
  // habilidades
  fl_tuck: { pr: [['bar', 100, 40], 'floor'], hold: 1, f: [{ p: [62, 74], t: 0, h: [100, 40], f: [52, 61], kb: 1 }, { p: [62, 75], t: 0, h: [100, 40], f: [52, 62], kb: 1 }] },
  fl_adv: { pr: [['bar', 100, 40], 'floor'], hold: 1, f: [{ p: [62, 74], t: 0, h: [100, 40], f: [34, 50], kb: 1 }, { p: [62, 75], t: 0, h: [100, 40], f: [34, 51], kb: 1 }] },
  fl: { pr: [['bar', 100, 40], 'floor'], hold: 1, f: [{ p: [62, 74], t: 0, h: [100, 40], f: [14, 74] }, { p: [62, 75], t: 0, h: [100, 40], f: [14, 76] }] },
  pl_lean: { pr: ['floor'], hold: 1, f: [plank([40, 117], 14, [100, 118]), plank([42, 117], 14, [100, 118])] },
  pl_frog: { pr: ['floor'], hold: 1, f: [{ p: [96, 78], t: -20, h: [118, 118], f: [86, 106], kb: 1 }, { p: [97, 78], t: -19, h: [118, 118], f: [87, 105], kb: 1 }] },
  pl_tuck: { pr: ['floor'], hold: 1, f: [{ p: [88.5, 93.9], t: 10, h: [110, 118], f: [100, 106], kb: 1 }, { p: [89, 93], t: 10, h: [110, 118], f: [100, 105], kb: 1 }] },
};
// cada nível → animação
const STEP_ANIM = {
  flex_parede: 'flex_parede', flex_inclinada: 'flex_inc', flex_joelhos: 'flex_joelhos', flex: 'flex', flex_diamante: 'flex', flex_pes_elev: 'flex_pes', flex_arqueiro: 'flex', flex_pseudo: 'flex_pseudo', flex_1braco_inc: 'flex_inc', flex_1braco: 'flex',
  pendurar: 'hang', barra_escap: 'hang_escap', barra_negativa: 'pull_neg', chinup: 'pull', pullup: 'pull', pullup_aberta: 'pull', pullup_L: 'pull_L', pullup_arqueiro: 'pull', pullup_1braco_neg: 'pull_neg',
  prone_hover: 'prone_hover', escap_canto: 'escap_canto', back_widow: 'back_widow', remada_batente: 'row_porta', remada_toalha: 'row_porta', remada_toalha_1: 'row_porta', remada_alta: 'row_alta', remada: 'row', remada_pes: 'row_pes', remada_arqueiro: 'row', remada_1braco: 'row',
  merg_banco: 'banco', merg_banco_reto: 'banco_reto', par_suporte: 'dip_suporte', par_negativa: 'dip', paralela: 'dip', par_funda: 'dip_fundo',
  pike: 'pike', pike_elev: 'pike_elev', wall_walk: 'wall_walk', parada_parede: 'hs_costas', hspu_parcial: 'hspu_parc', hspu: 'hspu',
  agach_cadeira: 'squat_cad', agach: 'squat', afundo: 'lunge', bulgaro: 'bulgaro', pistol_cadeira: 'pistol_cad', pistol: 'pistol',
  ponte: 'bridge', ponte_1: 'bridge1', thrust_1: 'thrust1', nordico_neg: 'nordic', nordico: 'nordic',
  prancha: 'plank_ante', canoa: 'hollow', elev_joelho: 'knee_raise', elev_pernas: 'leg_raise', lsit_grupado: 'lsit_tuck', lsit: 'lsit', dragon_neg: 'dragon',
  hs_parede_costas: 'hs_costas', hs_parede_frente: 'hs_frente', hs_livre: 'hs_livre',
  fl_tuck: 'fl_tuck', fl_adv: 'fl_adv', fl_straddle: 'fl', fl: 'fl',
  pl_lean: 'pl_lean', pl_frog: 'pl_frog', pl_tuck: 'pl_tuck', pl_adv: 'pl_tuck',
  toes_to_bar: 'leg_raise', muscle_up: 'pull', back_lever: 'fl', dragon_flag: 'dragon', barra_1braco: 'pull',
};
const _axCache = {};
function exAnim(sid, cls = '') {
  const key = STEP_ANIM[sid]; const a = ANIM[key]; if (!a) return '';
  if (!_axCache[key]) {
    const fr = a.f.map(body), seq = a.seq || [0, 1, 0], kt = (a.kt || seq.map((_, i) => i / (seq.length - 1))).map((x) => +x.toFixed(3)).join(';');
    const dur = a.hold ? 3.2 : a.kt ? 3.6 : 2.4;
    const ks = seq.slice(1).map(() => '0.45 0 0.55 1').join(';');
    const pts = (f, ks2) => ks2.map((k) => f[k].map((n) => n.toFixed(1)).join(',')).join(' ');
    const anim = (keys) => `<animate attributeName="points" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${ks}" values="${seq.map((i) => pts(fr[i], keys)).join(';')}"/>`;
    const line = (keys, c) => `<polyline class="${c}" points="${pts(fr[seq[0]], keys)}">${anim(keys)}</polyline>`;
    const head = `<circle class="ax-head" r="6.5" cx="${fr[seq[0]].H[0].toFixed(1)}" cy="${fr[seq[0]].H[1].toFixed(1)}">${['cx', 'cy'].map((at, j) => `<animate attributeName="${at}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${ks}" values="${seq.map((i) => fr[i].H[j].toFixed(1)).join(';')}"/>`).join('')}</circle>`;
    const props = a.pr.map((p) => (typeof p === 'string' ? PROPS[p] : PROPS[p[0]](...p.slice(1)))).join('');
    const rope = a.rope ? `<polyline class="ax-rope" points="${a.rope.join(',')} ${fr[seq[0]].W.map((n) => n.toFixed(1)).join(',')}"><animate attributeName="points" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${ks}" values="${seq.map((i) => `${a.rope.join(',')} ${fr[i].W.map((n) => n.toFixed(1)).join(',')}`).join(';')}"/></polyline>` : '';
    _axCache[key] = `${props}${rope}${line(['P', 'K2', 'A2'], 'ax-back')}${line(['S', 'E2', 'W2'], 'ax-back')}${line(['S', 'P', 'K', 'A'], 'ax-ln')}${line(['S', 'E', 'W'], 'ax-ln')}${head}`;
  }
  return `<svg class="ax ${cls}" viewBox="0 0 200 130" role="img" aria-label="Animação do exercício">${_axCache[key]}</svg>`;
}

