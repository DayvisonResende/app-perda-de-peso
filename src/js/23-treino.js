/* ===================== TREINO (calistenia) =====================
   Progressões por padrão de movimento. t: 'r' repetições | 's' segundos. lo–hi: faixa alvo.
   Ao fazer o teto (hi) em todas as séries, o app sugere o próximo nível. eq: equipamento exigido. lado: conta por lado. */
const CAL = [
  { id: 'flexao', n: 'Flexão', pat: 'Empurrar', steps: [
    ['flex_parede', 'Flexão na parede', 'r', 10, 20, 'Corpo reto da cabeça ao calcanhar; leve o peito até a parede.'],
    ['flex_inclinada', 'Flexão inclinada (mãos na mesa)', 'r', 8, 15, 'Quanto mais baixo o apoio, mais difícil. Cotovelos a ~45° do tronco.'],
    ['flex_joelhos', 'Flexão com joelhos no chão', 'r', 8, 15, 'Quadril alinhado, sem empinar. Peito quase encosta no chão.'],
    ['flex', 'Flexão', 'r', 8, 20, 'Abdômen e glúteos contraídos. Desça até o peito quase tocar o chão.'],
    ['flex_diamante', 'Flexão fechada (diamante)', 'r', 6, 15, 'Mãos juntas sob o peito; foca tríceps.'],
    ['flex_pes_elev', 'Flexão com pés elevados', 'r', 6, 15, 'Pés numa cadeira; mais carga no peito de cima e ombros.'],
    ['flex_arqueiro', 'Flexão arqueiro', 'r', 4, 10, 'Mãos bem abertas; desça sobre um braço, o outro fica esticado.', '', 1],
    ['flex_pseudo', 'Flexão pseudo-planche', 'r', 5, 12, 'Mãos na altura da cintura, dedos para fora; incline o corpo à frente.'],
    ['flex_1braco_inc', 'Flexão de um braço inclinada', 'r', 3, 8, 'Mão numa mesa, pés afastados. Não gire o quadril.', '', 1],
    ['flex_1braco', 'Flexão de um braço', 'r', 1, 6, 'Pernas afastadas, braço livre nas costas. Controle a descida.', '', 1],
  ] },
  { id: 'barra', n: 'Barra fixa', pat: 'Puxar (vertical)', steps: [
    ['pendurar', 'Pendurado na barra', 's', 20, 45, 'Pegada firme, ombros ativos (longe das orelhas).', 'barra'],
    ['barra_escap', 'Barra escapular', 'r', 6, 12, 'Braços esticados: só puxe os ombros para baixo e para trás.', 'barra'],
    ['barra_negativa', 'Barra negativa', 'r', 3, 6, 'Suba com ajuda de um banco e desça devagar, 5 segundos.', 'barra'],
    ['chinup', 'Barra supinada (chin-up)', 'r', 3, 8, 'Palmas para você. Queixo acima da barra, desça até esticar.', 'barra'],
    ['pullup', 'Barra fixa pronada', 'r', 4, 10, 'Palmas para frente, largura dos ombros. Sem balançar.', 'barra'],
    ['pullup_aberta', 'Barra com pegada aberta', 'r', 4, 10, 'Mãos bem além dos ombros; puxe o peito em direção à barra.', 'barra'],
    ['pullup_L', 'Barra em L', 'r', 3, 8, 'Pernas esticadas à frente durante toda a série.', 'barra'],
    ['pullup_arqueiro', 'Barra arqueiro', 'r', 2, 6, 'Suba de lado para uma das mãos; o outro braço quase estica.', 'barra', 1],
    ['pullup_1braco_neg', 'Barra de um braço negativa', 'r', 1, 4, 'Suba com os dois braços, solte um e desça em 5 s.', 'barra', 1],
  ] },
  { id: 'remada', n: 'Remada', pat: 'Puxar (horizontal)', steps: [
    ['remada_alta', 'Remada inclinada alta', 'r', 8, 15, 'Barra baixa ou mesa firme na altura do peito; corpo bem inclinado.'],
    ['remada', 'Remada australiana', 'r', 6, 15, 'Embaixo da barra/mesa, corpo reto, puxe o peito até ela.'],
    ['remada_pes', 'Remada com pés elevados', 'r', 6, 12, 'Pés numa cadeira, corpo paralelo ao chão.'],
    ['remada_arqueiro', 'Remada arqueiro', 'r', 4, 10, 'Puxe para um lado; o outro braço vai quase esticado.', '', 1],
    ['remada_1braco', 'Remada de um braço', 'r', 3, 8, 'Pés afastados para não girar. Peito sobe reto.', '', 1],
  ] },
  { id: 'paralela', n: 'Paralela', pat: 'Empurrar (mergulho)', steps: [
    ['merg_banco', 'Mergulho no banco, joelhos dobrados', 'r', 8, 15, 'Mãos na cadeira atrás de você; desça até ~90° no cotovelo.'],
    ['merg_banco_reto', 'Mergulho no banco, pernas esticadas', 'r', 8, 15, 'Pés longe da cadeira; ombros longe das orelhas.'],
    ['par_suporte', 'Suporte nas paralelas', 's', 15, 30, 'Braços travados, ombros para baixo, corpo parado.', 'paralela'],
    ['par_negativa', 'Paralela negativa', 'r', 3, 6, 'Comece em cima e desça em 5 s.', 'paralela'],
    ['paralela', 'Paralela', 'r', 5, 12, 'Tronco levemente à frente; desça até o ombro passar o cotovelo.', 'paralela'],
    ['par_funda', 'Paralela profunda com pausa', 'r', 5, 10, 'Pause 2 s embaixo antes de subir.', 'paralela'],
  ] },
  { id: 'ombro', n: 'Ombro', pat: 'Empurrar (vertical)', steps: [
    ['pike', 'Flexão pike', 'r', 6, 12, 'Quadril alto em V invertido; leve a cabeça à frente das mãos.'],
    ['pike_elev', 'Pike com pés elevados', 'r', 5, 10, 'Pés numa cadeira, tronco o mais vertical possível.'],
    ['wall_walk', 'Subida na parede (wall walk)', 'r', 2, 5, 'De costas para a parede, suba os pés enquanto as mãos se aproximam.'],
    ['parada_parede', 'Parada de mão na parede', 's', 15, 45, 'Braços travados, corpo reto, empurre o chão.'],
    ['hspu_parcial', 'Flexão em parada, amplitude parcial', 'r', 3, 8, 'Na parede, desça até um livro/almofada sob a cabeça.'],
    ['hspu', 'Flexão em parada de mão na parede', 'r', 2, 8, 'Cabeça encosta leve no chão; cotovelos não abrem demais.'],
  ] },
  { id: 'agach', n: 'Agachamento', pat: 'Pernas (joelho)', steps: [
    ['agach_cadeira', 'Agachamento até a cadeira', 'r', 10, 20, 'Encoste leve na cadeira e suba sem impulso.'],
    ['agach', 'Agachamento livre', 'r', 15, 30, 'Calcanhares no chão, joelhos acompanham a ponta dos pés.'],
    ['afundo', 'Afundo para trás', 'r', 8, 15, 'Passo longo para trás; joelho de trás quase toca o chão.', '', 1],
    ['bulgaro', 'Agachamento búlgaro', 'r', 8, 12, 'Pé de trás no sofá; tronco levemente inclinado.', '', 1],
    ['pistol_cadeira', 'Pistol até a cadeira', 'r', 5, 10, 'Uma perna, a outra à frente; sente e levante devagar.', '', 1],
    ['pistol', 'Pistol (agachamento de uma perna)', 'r', 3, 8, 'Braços à frente para equilibrar. Desça até o fim.', '', 1],
  ] },
  { id: 'posterior', n: 'Posterior e glúteo', pat: 'Pernas (quadril)', steps: [
    ['ponte', 'Ponte de glúteo', 'r', 12, 20, 'Empurre pelos calcanhares; aperte o glúteo 1 s no alto.'],
    ['ponte_1', 'Ponte de uma perna', 'r', 8, 15, 'Quadril nivelado, sem cair para o lado livre.', '', 1],
    ['thrust_1', 'Elevação de quadril de uma perna (costas no sofá)', 'r', 8, 15, 'Desça o quadril fundo e suba até alinhar com o tronco.', '', 1],
    ['nordico_neg', 'Flexora nórdica negativa', 'r', 3, 6, 'Joelhos numa almofada, pés presos; desça o mais devagar possível.'],
    ['nordico', 'Flexora nórdica', 'r', 2, 6, 'Desça e volte usando a parte de trás da coxa.'],
  ] },
  { id: 'core', n: 'Abdômen e core', pat: 'Core', steps: [
    ['prancha', 'Prancha', 's', 20, 60, 'Glúteo e abdômen contraídos; não deixe o quadril cair.'],
    ['canoa', 'Canoa (hollow hold)', 's', 15, 40, 'Lombar colada no chão; braços e pernas estendidos e baixos.'],
    ['elev_joelho', 'Elevação de joelhos na barra', 'r', 6, 12, 'Pendurado, suba os joelhos ao peito sem balançar.', 'barra'],
    ['elev_pernas', 'Elevação de pernas na barra', 'r', 5, 12, 'Pernas esticadas até a altura do quadril ou mais.', 'barra'],
    ['lsit_grupado', 'L-sit grupado', 's', 10, 20, 'Mãos no chão ou paralelas, joelhos dobrados, corpo suspenso.'],
    ['lsit', 'L-sit', 's', 10, 20, 'Pernas esticadas à frente, paralelas ao chão.'],
    ['dragon_neg', 'Dragon flag negativo', 'r', 3, 6, 'Deitado num banco, segure atrás da cabeça e desça o corpo reto.'],
  ] },
  // habilidades (opcionais): entram no começo do treino, quando escolhidas
  { id: 'hs', n: 'Parada de mão', pat: 'Habilidade', skill: true, steps: [
    ['hs_parede_costas', 'Parada de costas para a parede', 's', 15, 45, 'Chute para subir; mantenha o corpo reto e os braços travados.'],
    ['hs_parede_frente', 'Parada de frente para a parede', 's', 20, 60, 'Suba caminhando os pés pela parede; barriga voltada para ela.'],
    ['hs_livre', 'Parada de mão livre', 's', 5, 30, 'Equilibre empurrando com os dedos. Acumule tempo total.'],
  ] },
  { id: 'fl', n: 'Front lever', pat: 'Habilidade', skill: true, steps: [
    ['fl_tuck', 'Front lever grupado', 's', 5, 15, 'Pendurado, joelhos ao peito, costas paralelas ao chão.', 'barra'],
    ['fl_adv', 'Front lever grupado avançado', 's', 5, 15, 'Costas retas, quadril aberto, joelhos longe do peito.', 'barra'],
    ['fl_straddle', 'Front lever afastado', 's', 3, 10, 'Pernas abertas e esticadas.', 'barra'],
    ['fl', 'Front lever', 's', 3, 10, 'Corpo inteiro reto, paralelo ao chão.', 'barra'],
  ] },
  { id: 'pl', n: 'Planche', pat: 'Habilidade', skill: true, steps: [
    ['pl_lean', 'Inclinação de planche', 's', 10, 30, 'Na posição de flexão, leve os ombros bem à frente das mãos.'],
    ['pl_frog', 'Corvo (frog stand)', 's', 10, 30, 'Joelhos apoiados nos cotovelos, pés fora do chão.'],
    ['pl_tuck', 'Planche grupada', 's', 5, 15, 'Joelhos ao peito, quadril alto, braços esticados.'],
    ['pl_adv', 'Planche grupada avançada', 's', 5, 12, 'Costas retas, quadril na altura dos ombros.'],
  ] },
  // testes avulsos: movimentos sem escada no app, usados para liberar adesivos de habilidade
  { id: 'extra', n: 'Teste avulso', pat: 'Teste avulso', hidden: true, steps: [
    ['toes_to_bar', 'Toes to bar', 'r', 1, 5, 'Pendurado, leve os pés até tocar a barra, sem embalo.', 'barra'],
    ['ponte_completa', 'Ponte completa', 's', 5, 10, 'Deitado, mãos ao lado das orelhas: empurre e arqueie o corpo inteiro.'],
    ['muscle_up', 'Muscle-up', 'r', 1, 1, 'Puxada explosiva até o peito passar a barra e termine em cima, braços esticados.', 'barra'],
    ['back_lever', 'Back lever', 's', 3, 5, 'Pendurado de costas para o chão, corpo reto e paralelo ao solo.', 'barra'],
    ['dragon_flag', 'Dragon flag', 'r', 1, 5, 'Corpo reto apoiado só nos ombros: suba e desça sem dobrar o quadril.'],
    ['bandeira', 'Bandeira humana', 's', 3, 5, 'Num poste vertical, corpo reto na horizontal, de lado.', 'barra'],
    ['planche', 'Planche', 's', 1, 3, 'Só as mãos no chão, corpo inteiro reto e paralelo ao solo.'],
    ['barra_1braco', 'Barra de um braço', 'r', 1, 1, 'Queixo acima da barra puxando com um braço só.', 'barra', 1],
  ] },
].map((f) => ({ ...f, steps: f.steps.map(([id, n, t, lo, hi, cue, eq = '', lado = 0]) => ({ id, n, t, lo, hi, cue, eq, lado: !!lado })) }));
const calFam = (id) => CAL.find((f) => f.id === id);
const calStep = (sid) => { for (const f of CAL) { const s = f.steps.find((x) => x.id === sid); if (s) return s; } return null; };

// Modelos de semana (corpo inteiro para 2–3 dias, superior/inferior para 4). [família, séries]
const TR_TEMPLATES = {
  2: [{ n: 'Corpo inteiro A', it: [['agach', 3], ['barra', 3], ['posterior', 3], ['flexao', 3], ['core', 2]] },
      { n: 'Corpo inteiro B', it: [['agach', 3], ['remada', 3], ['posterior', 3], ['paralela', 3], ['ombro', 2], ['core', 2]] }],
  3: [{ n: 'Corpo inteiro A', it: [['agach', 3], ['barra', 3], ['posterior', 3], ['flexao', 3], ['core', 2]] },
      { n: 'Corpo inteiro B', it: [['agach', 3], ['remada', 3], ['posterior', 3], ['paralela', 3], ['ombro', 2], ['core', 2]] }],
  4: [{ n: 'Superior A', it: [['barra', 3], ['flexao', 3], ['remada', 3], ['paralela', 3], ['core', 2]] },
      { n: 'Inferior A', it: [['agach', 4], ['posterior', 4], ['core', 3]] },
      { n: 'Superior B', it: [['ombro', 3], ['remada', 3], ['flexao', 3], ['barra', 3], ['core', 2]] },
      { n: 'Inferior B', it: [['agach', 4], ['posterior', 4], ['core', 3]] }],
};
const TR_SUB = { barra: 'remada' }; // sem barra: troca por remada (mesa)
const FINISHER = ['Polichinelo', 'Escalador (mountain climber)', 'Agachamento com salto', 'Burpee'];
/* ---------- Jornada: o que dominar primeiro para liberar o próximo passo
   Cada nível pertence a uma fase. Dentro da fase, o próximo degrau abre quando você faz o teto da faixa
   em todas as séries em 2 treinos (ou num teste). A fase seguinte abre quando todas as metas da atual são batidas. */
const STEP_FASE = {
  flex_diamante: 2, flex_pes_elev: 2, flex_arqueiro: 3, flex_pseudo: 3, flex_1braco_inc: 3, flex_1braco: 3,
  pullup_aberta: 2, pullup_L: 2, pullup_arqueiro: 3, pullup_1braco_neg: 3,
  remada_pes: 2, remada_arqueiro: 3, remada_1braco: 3,
  paralela: 2, par_funda: 2,
  wall_walk: 2, parada_parede: 2, hspu_parcial: 3, hspu: 3,
  bulgaro: 2, pistol_cadeira: 2, pistol: 3,
  thrust_1: 2, nordico_neg: 3, nordico: 3,
  elev_joelho: 2, lsit_grupado: 2, elev_pernas: 3, lsit: 3, dragon_neg: 3,
};
CAL.forEach((f) => f.steps.forEach((x) => { x.fase = f.skill ? 3 : STEP_FASE[x.id] || 1; }));
// metas de cada fase: [rótulo, [[nível, alvo], alternativa sem equipamento…]]
const PHASES = [
  { n: 'Fundamentos', d: 'Técnica limpa nos movimentos básicos. É a base de tudo que vem depois.', libera: 'flexão fechada e com pés elevados, barra aberta, paralelas, parada de mão na parede, búlgaro e L-sit',
    goals: [['Flexões seguidas', [['flex', 20]]], ['Puxadas seguidas', [['pullup', 8], ['remada', 15]]], ['Mergulhos no banco', [['merg_banco_reto', 20]]], ['Agachamentos seguidos', [['agach', 25]]], ['Canoa', [['canoa', 30]]]] },
  { n: 'Base sólida', d: 'Variações mais pesadas e os primeiros movimentos de equilíbrio.', libera: 'movimentos de um braço e de uma perna, nórdica, dragon flag e as habilidades: parada de mão livre, front lever e planche',
    goals: [['Flexão fechada', [['flex_diamante', 15]]], ['Puxada pesada', [['pullup_aberta', 8], ['remada_pes', 12]]], ['Empurrar pesado', [['paralela', 12], ['flex_pes_elev', 15]]], ['Búlgaro (por lado)', [['bulgaro', 12]]], ['Parada de mão na parede', [['parada_parede', 30]]], ['L-sit grupado', [['lsit_grupado', 15]]]] },
  { n: 'Habilidades', d: 'Movimentos avançados. Agora é especializar no que você mais quer dominar.', libera: '', goals: [] },
];
const ATTRS = [['Empurrar', ['flexao', 'paralela', 'ombro']], ['Puxar', ['barra', 'remada']], ['Pernas', ['agach', 'posterior']], ['Core', ['core']], ['Habilidade', ['hs', 'fl', 'pl']]];
const LEVEL_TITLES = [[30, 'Mestre do peso do corpo'], [20, 'Avançado'], [15, 'Atleta'], [10, 'Praticante'], [5, 'Aprendiz'], [1, 'Iniciante']];
const XP = { set: 10, treino: 50, nivel: 100, fase: 500, missao: 20, diaPerfeito: 20, desafio: 300 };
// Desafio da semana: aparece num dia surpresa (sorteio fixo por semana); a meta é 4× o teto dos seus níveis atuais, numa sessão só
const BOSSES = [['Desafio Centena', '#C9662D'], ['Desafio de Ferro', '#5B6B7A'], ['Desafio Total', '#3F8F6B'], ['Desafio da Resistência', '#3F6FA0'], ['Desafio Vertical', '#7A4FA0'], ['Desafio Explosivo', '#C9402D'], ['Desafio da Escalada', '#8A5A3C'], ['Desafio Sem Pausa', '#4E9DB3']];
const weekStart = (iso) => addDays(iso, -((parseISO(iso).getDay() + 6) % 7));
const hashStr = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
// o app provoca quando você desiste (de leve: zoeira, nunca ofensa)
const BOSS_STAY = ['Já vai? Você nem começou a suar.', 'Sério? Logo agora que estava ficando divertido?', 'Pode ir… mas eu vou lembrar disso.', 'De novo? Tô começando a ficar com pena.'];
const BOSS_TAUNTS = ['Fugir também é cardio, né? Hahaha!', 'Vai lá beber água. O desafio espera… sentado.', 'Corre, corre! O desafio fica aqui até domingo.', 'Tá bom, guarda a energia pra próxima. Vai precisar.', 'Hahaha! Volta quando as pernas pararem de tremer.'];
function bossArt(color, cls = '') { // selo do desafio
  const done = cls.includes('down');
  return `<svg class="boss-art ${cls}" viewBox="0 0 120 120" aria-hidden="true"><g class="boss-body">
    <path d="M60 6l46 26v56L60 114 14 88V32z" fill="${done ? 'var(--kale)' : color}"/>
    <path d="M60 20l34 19v42L60 100 26 81V39z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
    ${done ? '<path d="M40 61l14 14 28-30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<path d="M66 28 42 66h18l-6 26 24-38H60z" fill="#fff"/>'}</g></svg>`;
}

// missões do dia: conferidas com os dados do app
const _missCache = {};
function missions(date) {
  if (_missCache[date]) return _missCache[date];
  return (_missCache[date] = _missions(date));
}
function _missions(date) {
  const d = computeDay(date), day = d.day, w = day.water || 0;
  return [
    { id: 'mov', n: 'Treinar ou se mexer 20 min', done: day.ex.some((e) => e.exId === 'calistenia' || e.min >= 20), hint: 'Treino do dia ou uma caminhada registrada em Atividade' },
    { id: 'prot', n: `Proteína: ${fmt(d.macros.protein)} g`, done: d.P >= d.macros.protein * 0.9, v: d.P, of: d.macros.protein },
    { id: 'agua', n: `Água: ${fmt(d.water)} ml`, done: w >= d.water, v: w, of: d.water },
    { id: 'ref', n: 'Registrar as refeições do dia', done: d.intake >= d.plan.target * 0.6, v: d.intake, of: d.plan.target },
  ];
}

const Tr = {
  s() {
    const c = Store.core; c.treino = c.treino || { setup: false, dias: 3, eq: { barra: false, paralela: false }, skills: [], foco: 'emagrecer', fin: true, lvl: {}, logs: [], next: 0, cur: null };
    const t = c.treino; t.logs ||= []; t.lvl ||= {}; t.eq ||= {}; t.eqCasa ||= {}; t.loc ||= 'rua'; t.skills ||= []; t.unl ||= {}; t.hits ||= {}; t.tests ||= {}; t.ups ||= []; t.phUps ||= [];
    if (!t.fase) { // quem já usava o treino entra na fase dos níveis em que já está
      t.fase = 1; t.unl = { ...t.lvl };
      for (const f of CAL) { const st = t.lvl[f.id] && calStep(t.lvl[f.id]); if (st && !f.skill) t.fase = Math.max(t.fase, st.fase); }
    }
    return t;
  },
  // equipamento do local escolhido: rua/academia ou casa
  eq(loc) { const t = this.s(); return (loc || (t.cur && t.cur.loc) || t.loc) === 'casa' ? t.eqCasa : t.eq; },
  avail(fid, loc) { const e = this.eq(loc), f = calFam(fid); return f ? f.steps.filter((x) => !x.eq || e[x.eq]) : []; },
  famFor(fid, loc) { return this.avail(fid, loc).length ? fid : TR_SUB[fid] && this.avail(TR_SUB[fid], loc).length ? TR_SUB[fid] : null; },
  step(fid, loc) { // nível atual (o mais próximo disponível no local)
    const t = this.s(), av = this.avail(fid, loc); if (!av.length) return null;
    const all = calFam(fid).steps, want = all.findIndex((x) => x.id === t.lvl[fid]);
    if (want < 0) return av[0];
    let best = av[0]; for (const x of av) if (all.indexOf(x) <= want) best = x; return best;
  },
  setStep(fid, sid) { this.s().lvl[fid] = sid; },
  unlockedIdx(fid) { const t = this.s(), av = this.avail(fid), all = calFam(fid).steps, u = all.findIndex((x) => x.id === t.unl[fid]);
    let i = 0; av.forEach((x, j) => { if (all.indexOf(x) <= u) i = j; }); return Math.max(i, av.indexOf(this.step(fid))); },
  lockOf(fid, st) { const t = this.s(), av = this.avail(fid); if (st.fase > t.fase) return { why: 'fase', fase: st.fase }; return av.indexOf(st) > this.unlockedIdx(fid) ? { why: 'nivel' } : null; },
  unlockNext(fid) { const t = this.s(), av = this.avail(fid), nx = av[this.unlockedIdx(fid) + 1]; if (!nx || nx.fase > t.fase) return null; t.unl[fid] = nx.id; t.ups.push({ sid: nx.id, date: todayISO() }); return nx; },
  goal([label, opts]) { const t = this.s(); const [sid, target] = opts.find(([x]) => { const st = calStep(x); return !st.eq || t.eq[st.eq] || t.eqCasa[st.eq]; }) || opts[opts.length - 1]; const st = calStep(sid); return { label, sid, st, target, cur: this.best(sid) }; },
  phaseGoals() { return (PHASES[this.s().fase - 1] || PHASES[0]).goals.map((g) => this.goal(g)); },
  checkPhase() { const t = this.s(), out = []; while (t.fase < PHASES.length && this.phaseGoals().every((g) => g.cur >= g.target)) { t.fase++; t.phUps.push(todayISO()); out.push(t.fase); } return out; },
  missionXP() { let xp = 0; const today = todayISO();
    for (const date of Object.keys(Store.s.days)) { if (date > today) continue; const m = missions(date), n = m.filter((x) => x.done).length; xp += n * XP.missao + (n === m.length ? XP.diaPerfeito : 0); } return xp; },
  boss() {
    const t = this.s(), wk = weekStart(todayISO()), end = addDays(wk, 6), h = hashStr('desafio' + wk), day = addDays(wk, h % 7), [name, color] = BOSSES[(h >>> 4) % BOSSES.length];
    const tries = t.logs.filter((l) => l.boss && l.date >= wk && l.date <= end), fams = [...new Set(['barra', 'flexao', 'agach', 'core'].map((f) => this.famFor(f, t.loc)).filter(Boolean))];
    const items = fams.map((f) => { const st = this.step(f, t.loc); return { fam: f, step: st.id, target: st.hi * 4 }; });
    return { wk, day, name, color, available: todayISO() >= day, defeated: tries.some((l) => l.boss.defeated), tries: tries.length, items, hp: items.reduce((x, i) => x + i.target, 0), wins: t.logs.filter((l) => l.boss && l.boss.defeated).length };
  },
  maxIn7() { const ds = this.s().logs.map((l) => l.date).sort(); let m = 0; ds.forEach((d, i) => { const end = addDays(d, 6); m = Math.max(m, ds.filter((x, j) => j >= i && x <= end).length); }); return m; },
  xp() { const t = this.s(); let sets = 0; for (const l of t.logs) for (const it of l.items) sets += it.sets.length;
    const hp = habitProgress(), hxp = HABITS.reduce((x, h) => x + (hp[h.id][0] >= hp[h.id][1] ? h.xp : 0), 0);
    return hxp + t.logs.filter((l) => l.boss && l.boss.defeated).length * XP.desafio + sets * XP.set + t.logs.length * XP.treino + t.ups.length * XP.nivel + (t.fase - 1) * XP.fase + this.missionXP(); },
  levelOf(xp) { // nível n pede 85·n·(n−1) XP: nível 30 ≈ 74 mil XP ≈ 1 ano treinando firme
    const K = 85, L = Math.floor((1 + Math.sqrt(1 + (4 * xp) / K)) / 2); const need = (n) => K * n * (n - 1); return { L, from: need(L), to: need(L + 1), title: LEVEL_TITLES.find(([n]) => L >= n)[1] }; },
  streak() { let n = 0, d = todayISO(); const ok = (x) => missions(x).filter((m) => m.done).length >= 3; if (!ok(d)) d = addDays(d, -1); while (ok(d) && n < 999) { n++; d = addDays(d, -1); } return n; },
  attrs() { return ATTRS.map(([n, fams]) => { let v = 0, max = 0; for (const fid of fams) { const av = this.avail(fid); if (!av.length) continue; max += av.length; if (calFam(fid).skill && this.s().fase < 3) continue; v += av.indexOf(this.step(fid)) + 1; } return { n, v: max ? Math.round((v / max) * 100) : 0 }; }); },
  templates() { return TR_TEMPLATES[this.s().dias] || TR_TEMPLATES[3]; },
  plan(idx, loc) { // monta a sessão do índice idx
    const t = this.s(), tpl = this.templates()[idx % this.templates().length], items = [], seen = new Set();
    for (const sk of t.fase >= 3 ? t.skills : []) { const f = this.famFor(sk, loc); if (f && !seen.has(f)) { seen.add(f); items.push({ fam: f, sets: 3 }); } }
    for (const [fid, sets] of tpl.it) { const f = this.famFor(fid, loc); if (!f) continue; const key = f + (seen.has(f) ? '2' : ''); if (seen.has(key)) continue; seen.add(key); items.push({ fam: f, sets }); }
    return { name: tpl.n, items: items.map((x) => { const st = this.step(x.fam, loc); return { fam: x.fam, step: st.id, sets: Array(x.sets).fill(null) }; }) };
  },
  // gasto estimado: ~2,4 min por série (com descanso); exercício rebaixado rende ~75% por série; finalizador sobe a intensidade
  est(items, fin) { const w = Store.weightOn(todayISO()); let m = 0; for (const it of items) m += it.sets.length * 2.4 * (it.down ? 0.75 : 1);
    return Math.round(Calc.exKcal(fin ? 5.5 : 4.5, w, m + (fin ? fin.n : 0))); },
  planFor(idx, loc) { // em casa: mesmo treino adaptado, com volume compensado para gastar o mesmo que na rua
    const t = this.s(); loc = loc || t.loc; const base = this.plan(idx, loc), fin0 = t.fin ? { done: 0, n: 6 } : null;
    if (loc !== 'casa') return { ...base, loc, fin: fin0, kcal: this.est(base.items, fin0), changes: [] };
    const ref = this.plan(idx, 'rua'), refK = this.est(ref.items, fin0), changes = [];
    const frac = (fid, sid, l) => { const av = this.avail(fid, l); return av.length > 1 ? av.findIndex((x) => x.id === sid) / (av.length - 1) : 0; };
    base.items.forEach((it, i) => { const r0 = ref.items[i]; if (!r0) return;
      if (r0.fam !== it.fam || frac(it.fam, it.step, 'casa') + 0.01 < frac(r0.fam, r0.step, 'rua')) { it.down = true; changes.push({ from: calStep(r0.step).n, to: calStep(it.step).n }); } });
    let fin = fin0, k = this.est(base.items, fin);
    if (k < refK) { fin = { done: 0, n: 8 }; k = this.est(base.items, fin); }
    for (let guard = 0; k < refK && guard < 12; guard++) { const it = base.items.filter((x) => x.down && x.sets.length < 5).sort((a, b) => a.sets.length - b.sets.length)[0] || base.items.filter((x) => x.sets.length < 5).sort((a, b) => a.sets.length - b.sets.length)[0]; if (!it) break; it.sets.push(null); it.extra = (it.extra || 0) + 1; k = this.est(base.items, fin); }
    return { ...base, loc, fin, kcal: k, refKcal: refK, changes };
  },
  last(sid) { // última série registrada desse nível
    const L = this.s().logs; for (let i = L.length - 1; i >= 0; i--) { const it = L[i].items.find((x) => x.step === sid); if (it) return { date: L[i].date, sets: it.sets.filter((v) => v != null) }; } return null;
  },
  best(sid) { const t = this.s(); let b = t.tests[sid] || 0; for (const l of t.logs) for (const it of l.items) if (it.step === sid) for (const v of it.sets) if (v > b) b = v; return b; },
  weekCount() { const from = addDays(todayISO(), -((new Date().getDay() + 6) % 7)); return this.s().logs.filter((l) => l.date >= from).length; },
};

function viewTreino() {
  const t = Tr.s();
  const head = (sub, btn = '') => `<div class="page-h"><div><h1>Treino</h1><p class="muted">${sub}</p></div>${btn}</div>`;
  if (!t.setup) return head('Calistenia: só o peso do corpo, com progressões por nível.') + `<div class="panel tr-intro">
    <div class="tr-hero">${ic('dumbbell')}</div>
    <h2>Monte seu treino de calistenia</h2>
    <p class="muted">Em 1 minuto o app descobre seu nível e monta a semana. Cada exercício tem uma escada de progressões: quando você domina um degrau, sobe para o próximo.</p>
    <ul class="tr-list"><li>${ic('check', 'sm')} Treino de corpo inteiro, 2 a 4 vezes por semana</li><li>${ic('check', 'sm')} Funciona em casa; barra e paralelas são opcionais</li><li>${ic('check', 'sm')} O treino entra no seu balanço de calorias</li></ul>
    <button class="btn btn-primary mt12" data-a="tr-setup">${ic('spark', 'sm')} Começar</button></div>`;
  const cur = t.cur;
  const tpls = Tr.templates(), nextIdx = t.next % tpls.length;
  const wk = Tr.weekCount();
  const sub = `${t.dias}× por semana · ${wk} ${wk === 1 ? 'treino feito' : 'treinos feitos'} nesta semana`;
  if (cur) return head(sub) + trSessionHTML(cur);
  const pl = Tr.planFor(nextIdx, t.loc), hasCasa = JSON.stringify(t.eq) !== JSON.stringify(t.eqCasa);
  const card = pl.items.map((it) => { const st = calStep(it.step), f = calFam(it.fam), la = Tr.last(st.id);
    return `<li class="tr-pli"><button class="tr-thumb" data-a="tr-how" data-s="${st.id}" aria-label="Como fazer ${esc(st.n)}">${exAnim(st.id)}</button><div><span class="tr-pat">${f.pat}</span><b>${esc(st.n)}</b><small>${it.extra ? `<span class="tag carrot">+${it.extra} ${it.extra > 1 ? 'séries' : 'série'}</span> ` : ''}${it.sets.length} × ${st.lo}–${st.hi}${st.t === 's' ? ' s' : ''}${st.lado ? ' por lado' : ''}${la ? ` · última: ${la.sets.join(', ')}` : ''}</small></div></li>`; }).join('');
  const hist = [...t.logs].reverse().slice(0, 8).map((l) => `<li><div class="d"><b>${esc(l.name)}</b><small>${dateLabel(l.date)} · ${l.items.length} exercícios · ${fmt(l.min)} min${l.kcal ? ` · ${fmt(l.kcal)} kcal` : ''}</small></div><button class="icon-btn sm" data-a="tr-logdel" data-id="${l.id}" aria-label="Apagar treino de ${dateLabel(l.date)}">${ic('trash', 'sm')}</button></li>`).join('');
  return head(sub, `<button class="btn btn-ghost btn-sm" data-a="tr-setup">${ic('pencil', 'sm')} Ajustar plano</button>`) + `
  <div class="tr-grid"><div>
    ${journeyHTML()}
    ${albumPanelHTML()}
    ${bossCardHTML()}
    <section class="panel tr-next">
      ${hasCasa ? `<div class="tr-loc"><span>Onde você vai treinar?</span><div class="seg">${[['rua', 'Rua / academia', 'run'], ['casa', 'Em casa', 'home']].map(([k, l, i]) => `<button data-a="tr-loc" data-v="${k}" aria-pressed="${t.loc === k}">${ic(i, 'sm')} ${l}</button>`).join('')}</div></div>` : ''}
      <div class="ph"><h2>Próximo: ${esc(pl.name)}</h2><div class="chips">${tpls.map((x, i) => `<button class="chip" data-a="tr-pick" data-i="${i}" aria-pressed="${i === nextIdx}">${esc(x.n.replace('Corpo inteiro ', ''))}</button>`).join('')}</div></div>
      <ul class="tr-prev">${card}</ul>
      ${pl.fin ? `<p class="muted mt8" style="font-size:13.5px">${ic('flame', 'sm')} No fim: finalizador de ${pl.fin.n} min (20 s forte, 40 s leve).</p>` : ''}
      ${pl.loc === 'casa' && pl.changes.length ? `<div class="hint mt8">${ic('home')}<div><b>Adaptado para casa.</b> ${pl.changes.map((c) => `${esc(c.from)} → ${esc(c.to)}`).join(' · ')}. Somei volume para manter o gasto: <b>≈ ${fmt(pl.kcal)} kcal</b>, o mesmo do treino de rua (≈ ${fmt(pl.refKcal)}).</div></div>`
        : `<p class="faint mt8" style="font-size:12.5px">Gasto estimado: ≈ ${fmt(pl.kcal)} kcal.</p>`}
      <div class="row mt12 wrap"><button class="btn btn-primary grow" data-a="tr-start" data-i="${nextIdx}">${ic('bolt', 'sm')} Começar treino</button></div>
      <p class="faint mt8" style="font-size:12.5px">Aqueça 5 min antes (polichinelo, rotação de ombros, agachamentos leves). Descanse cerca de 2 min entre séries.</p>
    </section>
    <section class="panel"><div class="ph"><h2>Seus níveis</h2><span class="sub">${ic('lock', 'sm')} = ainda bloqueado</span></div>
      <ul class="tr-levels">${CAL.filter((f) => !f.hidden && (!f.skill || (t.fase >= 3 && t.skills.includes(f.id)))).map((f) => { const av = Tr.avail(f.id); if (!av.length) return ''; const st = Tr.step(f.id), i = av.indexOf(st);
        return `<li><button class="tr-thumb sm" data-a="tr-how" data-s="${st.id}" aria-label="Como fazer ${esc(st.n)}">${exAnim(st.id)}</button><div class="n"><span class="tr-pat">${f.n}</span><b>${esc(st.n)}</b><small>nível ${i + 1} de ${av.length}${t.hits[st.id] && i < av.length - 1 ? ` · teto em ${Math.min(t.hits[st.id], 2)}/2 treinos` : ''}</small></div>
          <button class="icon-btn sm" data-a="tr-lvl" data-f="${f.id}" data-d="-1" ${i ? '' : 'disabled'} aria-label="Nível mais fácil">${ic('left', 'sm')}</button>
          ${i < av.length - 1 && Tr.lockOf(f.id, av[i + 1]) ? `<button class="icon-btn sm tr-locked" data-a="tr-lock" data-f="${f.id}" aria-label="Próximo nível bloqueado: ver como liberar">${ic('lock', 'sm')}</button>`
            : `<button class="icon-btn sm" data-a="tr-lvl" data-f="${f.id}" data-d="1" ${i < av.length - 1 ? '' : 'disabled'} aria-label="Nível mais difícil">${ic('right', 'sm')}</button>`}</li>`; }).join('')}</ul>
    </section>
  </div><div class="prog-side">
    ${missionsHTML(true)}
    ${phaseHTML()}
    <section class="panel"><div class="ph"><h2>Histórico</h2><span class="sub">${t.logs.length} treinos</span></div>${hist ? `<ul class="hist">${hist}</ul>` : '<p class="muted" style="font-size:13.5px">Seus treinos finalizados aparecem aqui.</p>'}</section>
  </div></div>`;
}

/* ---------- Adesivos: níveis (XP), habilidades (feitos reais) e hábitos (constância) */
let _stkP = null;
const loadStickers = () => _stkP || (_stkP = new Promise((ok) => { if (window.BT_STICKERS) return ok(window.BT_STICKERS); const sc = document.createElement('script'); sc.src = 'stickers.js'; sc.onload = () => { ok(window.BT_STICKERS); if (document.querySelector('#view .stk-ph')) { const y = window.scrollY; App.render(); window.scrollTo(0, y); } }; sc.onerror = () => { _stkP = null; ok(null); }; document.head.appendChild(sc); }));
const STK = () => window.BT_STICKERS;
// regra de cada adesivo de habilidade: [níveis que contam, alvo] ou função
const SKILL_RULES = [
  () => ({ cur: Tr.s().logs.length, target: 1 }), [['prancha'], 30], [['agach'], 20], [['flex'], 1], () => ({ cur: Tr.maxIn7(), target: 3 }),
  [['flex'], 10], [['remada'], 10], [['paralela'], 5], [['canoa'], 30], [['chinup', 'pullup', 'pullup_aberta', 'pullup_L'], 1],
  [['pullup', 'chinup', 'pullup_aberta'], 10], [['pike'], 8], [['lsit'], 10], [['toes_to_bar'], 5], [['ponte_completa'], 10],
  [['parada_parede', 'hs_parede_costas', 'hs_parede_frente'], 30], [['pl_frog'], 10], [['pistol'], 5], [['fl_tuck'], 10], [['pl_tuck'], 5],
  [['muscle_up'], 1], [['hs_livre'], 15], [['back_lever'], 5], [['dragon_flag'], 5], [['hspu'], 5],
  [['fl'], 5], [['bandeira'], 5], [['planche'], 3], [['barra_1braco'], 1], 'lenda',
];
const HABITS = [
  { id: 'perfeito', n: 'Dia perfeito', d: 'Completar as 4 missões num dia', ic: 'sol', xp: 50 },
  { id: 'perfeito10', n: 'Dez dias perfeitos', d: '10 dias perfeitos no total', ic: 'louros', xp: 200 },
  { id: 'seq7', n: 'Sete seguidos', d: '7 dias seguidos com 3 ou mais missões', ic: 'mare', xp: 150 },
  { id: 'seq30', n: 'Trinta seguidos', d: '30 dias seguidos com 3 ou mais missões', ic: 'lua', xp: 500 },
  { id: 'agua7', n: 'Bem hidratado', d: 'Meta de água 7 dias seguidos', ic: 'gota', xp: 100 },
  { id: 'prot14', n: 'Proteína em dia', d: 'Meta de proteína 14 dias seguidos', ic: 'ancora', xp: 200 },
  { id: 'medidas', n: 'Fita na mão', d: 'Registrar as primeiras medidas', ic: 'pulso', xp: 50 },
  { id: 'cintura5', n: 'Cinco a menos', d: 'Perder 5 cm de cintura', ic: 'asa', xp: 300 },
];
function habitProgress() { // percorre os dias registrados uma vez
  const today = todayISO(), dates = Object.keys(Store.s.days).filter((d) => d <= today).sort();
  let perfect = 0, best = { s3: 0, agua: 0, prot: 0 }, run = { s3: 0, agua: 0, prot: 0 }, prev = null;
  for (const d of dates) {
    const m = missions(d), n = m.filter((x) => x.done).length, ok = { s3: n >= 3, agua: m[2].done, prot: m[1].done };
    if (n === m.length) perfect++;
    const cont = prev && addDays(prev, 1) === d;
    for (const k in ok) { run[k] = ok[k] ? (cont ? run[k] : 0) + 1 : 0; best[k] = Math.max(best[k], run[k]); }
    prev = d;
  }
  const wa = Store.measures().filter((x) => x.waist).map((x) => x.waist), lost = wa.length > 1 ? wa[0] - Math.min(...wa) : 0;
  return { perfeito: [perfect, 1], perfeito10: [perfect, 10], seq7: [best.s3, 7], seq30: [best.s3, 30], agua7: [best.agua, 7], prot14: [best.prot, 14], medidas: [Store.measures().length, 1], cintura5: [Math.round(lost * 10) / 10, 5] };
}
function stickerList() { // todos os adesivos com progresso; feitos = done
  const L = Tr.levelOf(Tr.xp()).L, out = [];
  for (let i = 1; i <= 30; i++) out.push({ key: 'l' + i, kind: 'nivel', i, done: L >= i, cur: Math.min(L, i), target: i });
  const sk = SKILL_RULES.map((rule, idx) => {
    if (rule === 'lenda') return null;
    if (typeof rule === 'function') { const x = rule(); return { key: 's' + (idx + 1), kind: 'hab', i: idx + 1, ...x, done: x.cur >= x.target }; }
    const [sids, target] = rule, cur = Math.max(...sids.map((x) => Tr.best(x)));
    return { key: 's' + (idx + 1), kind: 'hab', i: idx + 1, cur, target, sid: sids[0], done: cur >= target };
  });
  const got = sk.filter((x) => x && x.done).length; sk[29] = { key: 's30', kind: 'hab', i: 30, cur: got, target: 29, done: got >= 29 };
  out.push(...sk);
  const hp = habitProgress();
  for (const h of HABITS) { const [cur, target] = hp[h.id]; out.push({ key: 'h' + h.id, kind: 'habito', h, cur, target, done: cur >= target }); }
  return out;
}
function stkState() { const c = Store.core; c.stk = c.stk || null; return c.stk; }
// adesivos ganhos desde a última vez (marca como vistos). Na 1ª vez, registra os já ganhos sem alarde.
function newStickers() {
  if (!Store.core) return [];
  const list = stickerList(), today = todayISO();
  if (!stkState()) { Store.core.stk = { seen: {}, retro: 0 }; for (const x of list) if (x.done) { Store.core.stk.seen[x.key] = today; Store.core.stk.retro++; } Store.saveCore(); return []; }
  const fresh = list.filter((x) => x.done && !Store.core.stk.seen[x.key]); for (const x of fresh) Store.core.stk.seen[x.key] = today;
  if (fresh.length) Store.saveCore(); return fresh;
}
const stkName = (x) => (x.kind === 'nivel' ? (STK() ? STK().levelMeta[x.i - 1].n : `Nível ${x.i}`) : x.kind === 'hab' ? (STK() ? STK().skillMeta[x.i - 1].n : `Habilidade ${x.i}`) : x.h.n);
const stkDesc = (x) => (x.kind === 'nivel' ? (STK() ? STK().levelMeta[x.i - 1].f : '') : x.kind === 'hab' ? (STK() ? STK().skillMeta[x.i - 1].d : '') : x.h.d);
const stkLabel = (x) => (x.kind === 'nivel' ? `Nível ${x.i}` : x.kind === 'hab' ? `Habilidade ${x.i}/30` : 'Hábito');
function stkSVG(x, locked) { const S = STK(); if (!S) { loadStickers(); return `<div class="stk-ph">${x.kind === 'nivel' ? x.i : '★'}</div>`; } return x.kind === 'nivel' ? S.level(x.i, { locked }) : x.kind === 'hab' ? S.skill(x.i, { locked }) : S.habit(x.h.ic, { locked }); }
function stkNewHTML(fresh) {
  if (!fresh.length) return '';
  return `<div class="stk-new"><p><b>${fresh.length > 1 ? `${fresh.length} adesivos novos` : 'Adesivo novo!'}</b></p><div class="stk-new-row">${fresh.slice(0, 6).map((x, k) => `<button class="stk-card" data-a="stk-open" data-k="${x.key}" style="--d:${k * 0.12}s"><span class="stk-peel">${stkSVG(x)}</span><b>${esc(stkName(x))}</b><small>${stkLabel(x)}${x.kind === 'habito' ? ` · +${x.h.xp} XP` : ''}</small></button>`).join('')}</div></div>`;
}
// aviso para adesivos ganhos fora do treino (missões, medidas…)
let _stkT = null;
function checkStickersSoon() {
  clearTimeout(_stkT);
  _stkT = setTimeout(() => {
    if (!Store.core || Sheet.isOpen() || (Store.core.treino && Store.core.treino.cur)) return;
    loadStickers().then(() => {
      const wasNew = !stkState(), fresh = newStickers();
      if (wasNew && Store.core.stk.retro) { App.toast(`Você já tinha ${Store.core.stk.retro} ${Store.core.stk.retro > 1 ? 'adesivos' : 'adesivo'}. Veja no álbum, na aba Treino.`); return; }
      if (!fresh.length || Sheet.isOpen()) return;
      if (!reducedMotion()) confetti();
      Sheet.open({ label: 'Adesivo novo', render: () => `${sheetHead('Conquista desbloqueada', 'Já está no seu álbum, na aba Treino')}<div class="sheet-b">${stkNewHTML(fresh)}</div><div class="sheet-f"><button class="btn btn-primary grow" data-a="sheet-close">Show!</button></div>` });
    });
  }, 900);
}
function albumHTML() {
  const list = stickerList(), seen = (stkState() || { seen: {} }).seen, tab = ui.album || 'nivel', of = (k) => list.filter((x) => x.kind === k);
  const tabs = [['nivel', 'Níveis'], ['hab', 'Habilidades'], ['habito', 'Hábitos']].map(([k, l]) => `<button data-a="album-tab" data-v="${k}" aria-pressed="${tab === k}">${l} <span class="num">${of(k).filter((x) => x.done).length}/${of(k).length}</span></button>`).join('');
  const items = of(tab);
  const groups = tab === 'hab' ? ['Fundação', 'Base', 'Força', 'Controle', 'Avançado', 'Lenda'].map((g, gi) => [g, items.slice(gi * 5, gi * 5 + 5)]) : tab === 'nivel' ? [['Iniciante', items.slice(0, 4)], ['Aprendiz', items.slice(4, 9)], ['Praticante', items.slice(9, 14)], ['Atleta', items.slice(14, 19)], ['Avançado', items.slice(19, 29)], ['Mestre', items.slice(29)]] : [['', items]];
  return `${sheetHead('Álbum de adesivos', `${list.filter((x) => x.done).length} de ${list.length} conquistados`)}
    <div class="sheet-b"><div class="seg album-tabs">${tabs}</div>
    ${groups.map(([g, arr]) => `${g ? `<h3 class="album-g">${g}</h3>` : ''}<div class="album-grid">${arr.map((x) => `<button class="stk-cell ${x.done ? '' : 'locked'}" data-a="stk-open" data-k="${x.key}" aria-label="${esc(stkName(x))}${x.done ? '' : ', bloqueado'}">${stkSVG(x, !x.done)}<small>${x.done ? esc(stkName(x)) : stkLabel(x)}</small></button>`).join('')}</div>`).join('')}
    ${STK() ? '' : '<p class="muted">Carregando adesivos…</p>'}</div>`;
}
function albumPanelHTML() {
  const list = stickerList(), got = list.filter((x) => x.done), seen = (stkState() || { seen: {} }).seen;
  const recent = got.slice().sort((a, b) => (seen[b.key] || '').localeCompare(seen[a.key] || '')).slice(0, 4);
  return `<section class="panel"><div class="ph"><h2>Álbum de adesivos</h2><span class="sub num">${got.length}/${list.length}</span></div>
    ${recent.length ? `<div class="album-mini">${recent.map((x) => `<button class="stk-cell" data-a="stk-open" data-k="${x.key}" aria-label="${esc(stkName(x))}">${stkSVG(x)}</button>`).join('')}</div>` : '<p class="muted" style="font-size:13.5px">Cada nível, habilidade e hábito dá um adesivo. O primeiro sai no primeiro treino.</p>'}
    <button class="btn btn-soft btn-sm mt12" data-a="album-open">${ic('star', 'sm')} Abrir álbum</button></section>`;
}
function bossCardHTML() {
  const b = Tr.boss(), unit = (st) => (st.t === 's' ? ' s de ' : ' × ');
  if (!b.available) return `<section class="panel boss boss-wait"><div class="boss-q">?</div><div><span class="tr-pat">Desafio da semana</span><b>Vem aí…</b><small class="muted">Um desafio aparece num dia surpresa desta semana. Chegue descansado.</small></div></section>`;
  if (b.defeated) return `<section class="panel boss boss-done">${bossArt(b.color, 'sm down')}<div><span class="tr-pat">Desafio da semana</span><b>${b.name}: concluído</b><small class="muted">${b.wins} ${b.wins === 1 ? 'desafio vencido' : 'desafios vencidos'} no total. O próximo aparece na semana que vem.</small></div></section>`;
  return `<section class="panel boss" style="--boss:${b.color}">
    <div class="boss-top">${bossArt(b.color)}<div class="grow"><span class="tr-pat">Desafio da semana</span><h2>${b.name}</h2>
      <div class="boss-hp"><span>Meta</span><div class="bar">${'<span style="width:100%;background:var(--tomato)"></span>'}</div><b class="num">${fmt(b.hp)}</b></div></div></div>
    <ul class="boss-list">${b.items.map((i) => { const st = calStep(i.step); return `<li><b class="num">${i.target}${unit(st)}</b>${esc(st.n)}</li>`; }).join('')}</ul>
    ${(Tr.s().fled || {})[b.wk] ? `<div class="boss-taunt"><b>BioTrack:</b> “${BOSS_TAUNTS[((Tr.s().fled[b.wk]) - 1) % BOSS_TAUNTS.length]}” <small>· você desistiu ${Tr.s().fled[b.wk]}×</small></div>` : ''}
    <p class="muted" style="font-size:13px">Cada repetição conta. Faça quantas séries precisar, mas a meta toda tem que ser batida numa sessão só. Vitória: <b>+${XP.desafio} XP</b>.${b.tries ? ` Você já tentou ${b.tries}×; dá para tentar de novo até domingo.` : ''}</p>
    <button class="btn btn-boss mt12" data-a="tr-boss">${ic('bolt', 'sm')} Aceitar desafio</button>
  </section>`;
}
function journeyHTML() {
  const xp = Tr.xp(), lv = Tr.levelOf(xp), st = Tr.streak();
  return `<section class="panel jr">
    <div class="jr-top"><button class="jr-badge" data-a="album-open" aria-label="Nível ${lv.L}. Abrir álbum de adesivos"><small>nível</small><b class="num">${lv.L}</b></button>
      <div class="grow"><b class="jr-title">${lv.title} <button class="jr-stk" data-a="album-open">${ic('star', 'sm')} ${stickerList().filter((x) => x.done).length} adesivos</button></b><small class="muted num">${fmt(xp - lv.from)} / ${fmt(lv.to - lv.from)} XP para o nível ${lv.L + 1}</small><div class="mt8">${bar(xp - lv.from, lv.to - lv.from, 'var(--carrot)')}</div></div>
      <div class="jr-streak" title="Dias seguidos com 3 ou mais missões">${ic('flame', 'sm')}<b class="num">${st}</b><small>${st === 1 ? 'dia' : 'dias'}</small></div></div>
    <div class="jr-attrs">${Tr.attrs().map((a) => `<div><span>${a.n}</span>${bar(a.v, 100, 'var(--kale)')}</div>`).join('')}</div>
  </section>`;
}
function missionsHTML(withXp) {
  const m = missions(todayISO()), n = m.filter((x) => x.done).length;
  return `<section class="panel"><div class="ph"><h2>Missões de hoje</h2><span class="sub num">${n}/${m.length}</span></div>${missionsList(m, withXp)}</section>`;
}
function missionsList(m, withXp) {
  const n = m.filter((x) => x.done).length;
  return `<ul class="jr-miss">${m.map((x) => `<li class="${x.done ? 'done' : ''}"><span class="box">${ic('check', 'sm')}</span><div class="grow"><b>${x.n}</b>${x.of ? `<div class="mt8">${bar(x.v, x.of, x.done ? 'var(--kale)' : 'var(--corn)')}</div>` : `<small class="muted">${x.hint}</small>`}</div>${withXp ? `<em class="num">+${XP.missao}</em>` : ''}</li>`).join('')}</ul>
    <p class="faint mt8" style="font-size:12.5px">${n === m.length ? `${ic('spark', 'sm')} Dia perfeito! +${XP.diaPerfeito} XP de bônus.` : `Complete as ${m.length} para um dia perfeito (+${XP.diaPerfeito} XP). Com 3 ou mais, sua sequência continua.`}</p>`;
}
function phaseHTML() {
  const t = Tr.s(), ph = PHASES[t.fase - 1], goals = Tr.phaseGoals(), done = goals.filter((g) => g.cur >= g.target).length;
  const steps = PHASES.map((x, i) => `<li class="${i + 1 < t.fase ? 'ok' : i + 1 === t.fase ? 'now' : ''}"><span>${i + 1 < t.fase ? ic('check', 'sm') : i + 1}</span>${x.n}</li>`).join('');
  return `<section class="panel"><div class="ph"><h2>Fase ${t.fase}: ${ph.n}</h2>${goals.length ? `<span class="sub num">${done}/${goals.length} metas</span>` : ''}</div>
    <ol class="jr-phases">${steps}</ol>
    <p class="muted" style="font-size:13.5px">${ph.d}</p>
    ${goals.length ? `<ul class="jr-goals">${goals.map((g) => { const ok = g.cur >= g.target, u = g.st.t === 's' ? ' s' : '';
      return `<li><div class="row" style="justify-content:space-between;gap:8px"><span><b>${g.label}</b><small class="muted">${esc(g.st.n)}</small></span><span class="row gap6"><b class="num">${fmt(Math.min(g.cur, g.target))}/${g.target}${u}</b>${ok ? `<span class="tag kale">${ic('check', 'sm')}</span>` : `<button class="btn btn-ghost btn-sm" data-a="tr-test" data-s="${g.sid}">Testar</button>`}</span></div>${bar(g.cur, g.target, ok ? 'var(--kale)' : 'var(--corn)')}</li>`; }).join('')}</ul>
      <p class="faint mt8" style="font-size:12.5px">Conta sua melhor série num treino ou num teste. Ao completar, libera: ${ph.libera}.</p>`
      : `<p class="muted mt8" style="font-size:13.5px">${ic('spark', 'sm')} Todas as fases liberadas. Escolha habilidades em <b>Ajustar plano</b> e siga subindo os níveis.</p>`}
  </section>`;
}
function trTestOpen(sid, after) {
  const st = calStep(sid), u = st.t === 's' ? 'segundos' : 'repetições';
  Sheet.open({ label: 'Teste', render: () => `${sheetHead(`Teste: ${esc(st.n)}`, `Uma série no máximo, com boa forma${st.lado ? ', no lado mais fraco' : ''}`)}
    <div class="sheet-b"><div class="tr-how-big">${exAnim(sid, 'big')}</div><p class="tr-cue">${esc(st.cue)}</p>
      <label class="field mt12"><span>Quantas ${u} você fez?</span><input class="input num" id="tt-v" inputmode="numeric" placeholder="${st.hi}"></label>
      <p class="faint mt8" style="font-size:12.5px">Aqueça antes. Se a forma quebrar, pare: conta até a última repetição limpa.</p></div>
    <div class="sheet-f"><button class="btn btn-primary grow" data-a="tr-test-save" data-s="${sid}" data-after="${after || ''}">Registrar teste</button></div>` });
}
// resumo de conquistas (treino finalizado, teste, fase)
function trRewards({ xp0, lv0, phases, unlocked = [], blocked = [], progress = [], stk = [] }) {
  const xp1 = Tr.xp(), lv1 = Tr.levelOf(xp1);
  let h = `<div class="jr-gain"><b class="num">+${fmt(xp1 - xp0)} XP</b><span>nível ${lv1.L} · ${fmt(xp1 - lv1.from)}/${fmt(lv1.to - lv1.from)}</span></div><div class="mt8">${bar(xp1 - lv1.from, lv1.to - lv1.from, 'var(--carrot)')}</div>`;
  h += stkNewHTML(stk);
  if (lv1.L > lv0) h += `<div class="jr-banner">${ic('spark', 'sm')}<div><b>Nível ${lv1.L} alcançado</b><small>${lv1.title}</small></div></div>`;
  for (const f of phases) h += `<div class="jr-banner phase">${ic('bolt', 'sm')}<div><b>Fase ${f} liberada: ${PHASES[f - 1].n}</b><small>Novos níveis: ${PHASES[f - 2].libera}.</small></div></div>`;
  if (unlocked.length) h += `<p class="mt12" style="font-weight:700">Níveis liberados:</p>${unlocked.map((u) => `<div class="tr-up"><span><small class="muted">${esc(u.from.n)} →</small><b>${esc(u.to.n)}</b></span><button class="btn btn-primary btn-sm" data-a="tr-up" data-f="${u.fam}" data-s="${u.to.id}">Subir agora</button></div>`).join('')}<p class="faint mt8" style="font-size:12.5px">Se preferir consolidar, fique mais uma semana no nível atual: o próximo continua liberado.</p>`;
  if (blocked.length) h += `<p class="muted mt12" style="font-size:13.5px">${ic('lock', 'sm')} Você dominou ${blocked.map((b) => `<b>${esc(b.n)}</b>`).join(', ')}. O próximo nível abre na fase ${blocked[0].fase}.</p>`;
  if (progress.length) h += `<p class="muted mt12" style="font-size:13.5px">Teto da faixa em ${progress.map((p) => `<b>${esc(p.n)}</b>`).join(', ')}: mais 1 treino assim e o próximo nível abre.</p>`;
  return h;
}
function trSessionHTML(cur) {
  const exs = cur.items.map((it, x) => {
    const st = calStep(it.step), f = calFam(it.fam), la = Tr.last(st.id), u = st.t === 's' ? 's' : '';
    const done = it.sets.filter((v) => v != null).length, dmg = it.sets.reduce((x, v) => x + (v || 0), 0);
    return `<section class="panel tr-ex ${(cur.boss ? dmg >= it.target : done === it.sets.length) ? 'done' : ''}">
      <div class="tr-ex-h"><div><span class="tr-pat">${f.pat}</span><h2>${esc(st.n)}</h2>
        <small class="muted">${cur.boss ? `meta: ${it.target}${u ? ' s' : ' reps'}, em quantas séries precisar` : `${it.sets.length} × ${st.lo}–${st.hi}${u ? ' segundos' : ' repetições'}${st.lado ? ' por lado' : ''}${la ? ` · última vez: ${la.sets.join(', ')}` : ''}`}</small></div>
        <button class="icon-btn sm" data-a="tr-swap" data-x="${x}" aria-label="Trocar nível de ${esc(st.n)}">${ic('swap', 'sm')}</button></div>
      <div class="tr-how"><button class="tr-anim" data-a="tr-how" data-s="${st.id}" aria-label="Como fazer ${esc(st.n)}">${exAnim(st.id)}<span>${ic('info', 'sm')} Como fazer</span></button><p class="tr-cue">${esc(st.cue)}</p></div>
      ${cur.boss ? `<div class="boss-dmg" data-live="dmg-${x}">${bossDmgHTML(dmg, it.target)}</div>` : ''}
      <div class="tr-sets">${it.sets.map((v, j) => `<label class="tr-set ${v != null ? 'on' : ''}"><span>Série ${j + 1}</span><input class="input num" inputmode="numeric" data-in="tr-set" data-x="${x}" data-j="${j}" value="${v ?? ''}" placeholder="${la && la.sets[j] != null ? la.sets[j] : st.lo}" aria-label="${esc(st.n)}, série ${j + 1}, ${u ? 'segundos' : 'repetições'}"><em>${u || 'reps'}</em></label>`).join('')}
        <button class="tr-addset" data-a="tr-addset" data-x="${x}" aria-label="Adicionar série">${ic('plus', 'sm')}</button></div>
    </section>`;
  }).join('');
  const fin = cur.fin ? `<section class="panel tr-ex ${cur.fin.done >= (cur.fin.n || 6) ? 'done' : ''}"><div class="tr-ex-h"><div><span class="tr-pat">Condicionamento</span><h2>Finalizador</h2><small class="muted">${cur.fin.n || 6} rodadas: 20 s no máximo, 40 s leve</small></div></div>
    <p class="tr-cue">Alterne: ${FINISHER.join(', ')}. Faça no seu ritmo; pule se estiver muito cansado.</p>
    <div class="tr-rounds">${Array.from({ length: cur.fin.n || 6 }, (_, i) => `<button class="tr-round" data-a="tr-round" data-i="${i}" aria-pressed="${i < cur.fin.done}">${i + 1}</button>`).join('')}</div></section>` : '';
  const total = cur.items.reduce((s, it) => s + it.sets.length, 0), done = cur.items.reduce((s, it) => s + it.sets.filter((v) => v != null).length, 0);
  if (cur.boss) { const hp = bossHP(cur);
    return `<div class="panel boss boss-fight" style="--boss:${cur.boss.color}"><div class="boss-top">${bossArt(cur.boss.color)}<div class="grow"><span class="tr-pat">Desafio da semana</span><h2>${esc(cur.boss.name)}</h2>
      <div class="boss-hp"><span>Falta</span><div class="bar" data-live="boss-bar">${bar(hp.left, hp.total, 'var(--tomato)')}</div><b class="num" data-live="boss-hp">${fmt(hp.left)}</b></div></div></div></div>
    <div class="tr-sess mt12">${exs}</div>
    <div class="row mt16 wrap"><button class="btn btn-ghost btn-danger btn-sm" data-a="tr-cancel">Desistir</button><button class="btn btn-boss grow" data-a="tr-finish">${ic('check', 'sm')} Encerrar desafio</button></div>
    ${trRestHTML()}`; }
  return `<div class="tr-sess-h panel"><div><b>${esc(cur.name)}${cur.loc === 'casa' ? ` <span class="tag">${ic('home', 'sm')} em casa</span>` : ''}</b><small class="muted"><span data-live="tr-count">${done} de ${total}</span> séries · começou ${new Date(cur.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>
      <div class="row gap6">${cur.mode || cur.tired ? `<span class="tag ${cur.mode === 'forte' ? 'carrot' : ''}">${cur.mode === 'forte' ? `${ic('flame', 'sm')} Treino forte` : 'Treino leve'}</span>`
        : `<button class="btn btn-soft btn-sm" data-a="tr-tired">Estou cansado</button><button class="btn btn-soft btn-sm" data-a="tr-strong">${ic('flame', 'sm')} Estou disposto</button>`}</div></div>
    <div class="mt8" data-live="tr-bar">${bar(done, total, 'var(--kale)')}</div>
    <div class="tr-sess mt12">${exs}${fin}</div>
    <div class="row mt16 wrap"><button class="btn btn-ghost btn-danger btn-sm" data-a="tr-cancel">Descartar</button><button class="btn btn-primary grow" data-a="tr-finish">${ic('check', 'sm')} Finalizar treino</button></div>
    ${trRestHTML()}`;
}
const bossHP = (c) => { const total = c.items.reduce((x, it) => x + it.target, 0), dealt = c.items.reduce((x, it) => x + Math.min(it.target, it.sets.reduce((y, v) => y + (v || 0), 0)), 0); return { total, left: total - dealt }; };
const bossDmgHTML = (d, t) => `<div class="row" style="justify-content:space-between;font-size:12.5px;font-weight:700"><span>Feito</span><span class="num">${fmt(Math.min(d, t))}/${t}${d >= t ? ' ✓' : ''}</span></div>${bar(d, t, d >= t ? 'var(--kale)' : 'var(--tomato)')}`;
function trRestHTML() {
  if (!ui.rest) return '<div id="tr-rest"></div>';
  const left = Math.max(0, Math.ceil((ui.rest.end - Date.now()) / 1000));
  return `<div id="tr-rest" class="tr-rest ${left ? '' : 'up'}" role="timer" aria-live="polite"><span>${left ? 'Descanso' : 'Bora, próxima série!'}</span><b class="num" data-live="rest">${left ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '0:00'}</b>
    <button class="btn btn-sm btn-soft" data-a="tr-rest-add">+30 s</button><button class="btn btn-sm btn-ghost" data-a="tr-rest-stop">${left ? 'Pular' : 'Fechar'}</button></div>`;
}
const TrRest = {
  tick: null,
  start(sec) {
    ui.rest = { end: Date.now() + sec * 1000 }; this.paint();
    clearInterval(this.tick);
    this.tick = setInterval(() => {
      if (!ui.rest) return clearInterval(this.tick);
      const left = Math.ceil((ui.rest.end - Date.now()) / 1000);
      if (left <= 0 && !ui.rest.rang) { ui.rest.rang = true; try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} this.paint(); setTimeout(() => { if (ui.rest && ui.rest.rang) { ui.rest = null; this.paint(); } }, 8000); return; }
      const el = document.querySelector('[data-live="rest"]'); if (el && left > 0) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    }, 500);
  },
  paint() { const el = document.getElementById('tr-rest'); if (el) el.outerHTML = trRestHTML(); },
  stop() { ui.rest = null; clearInterval(this.tick); this.paint(); },
};

function trSetupOpen() {
  const t = Tr.s();
  TS = { dias: t.dias, eq: { ...t.eq }, eqCasa: { ...t.eqCasa }, skills: [...t.skills], foco: t.foco, fin: t.fin, flex: null, barra: null, agach: null, first: !t.setup };
  Sheet.open({ label: 'Montar treino', tall: true, render: trSetupHTML });
}
let TS = null;
function trSetupHTML() {
  const ch = (a, k, v, l, on) => `<button class="chip" data-a="${a}" data-k="${k}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  const q = (k, label, opts) => `<div class="field mt12"><span>${label}</span><div class="chips">${opts.map(([v, l]) => ch('ts-set', k, v, l, TS[k] === v)).join('')}</div></div>`;
  return `${sheetHead(TS.first ? 'Montar meu treino' : 'Ajustar plano', 'Dá para mudar tudo depois')}
  <div class="sheet-b">
    ${q('dias', 'Quantos dias por semana?', [[2, '2 dias'], [3, '3 dias'], [4, '4 dias']])}
    <p class="faint mt8" style="font-size:12.5px">${TS.dias === 4 ? 'Superior e inferior alternados (2 de cada).' : 'Corpo inteiro, alternando treino A e B. Deixe 1 dia de descanso entre eles.'}</p>
    <div class="field mt12"><span>Em casa você tem?</span><div class="chips">${ch('ts-eqc', 'barra', 1, 'Barra de porta', !!TS.eqCasa.barra)}${ch('ts-eqc', 'paralela', 1, '2 cadeiras firmes / paralelas', !!TS.eqCasa.paralela)}</div>
      <small class="mtip">Mesa firme e cadeira já contam para remada e mergulho.</small></div>
    <div class="field mt12"><span>Na rua / academia você tem?</span><div class="chips">${ch('ts-eq', 'barra', 1, 'Barra fixa', !!TS.eq.barra)}${ch('ts-eq', 'paralela', 1, 'Paralelas (ou 2 cadeiras firmes)', !!TS.eq.paralela)}</div>
      <small class="mtip">Sem nada também funciona: as remadas usam uma mesa firme.</small></div>
    ${q('foco', 'Objetivo principal', [['emagrecer', 'Emagrecer sem perder músculo'], ['forca', 'Ganhar força']])}
    <div class="field mt12"><span>Habilidades para treinar (opcional)</span><div class="chips">${CAL.filter((f) => f.skill).map((f) => ch('ts-skill', f.id, 1, f.n + (f.steps.every((s) => s.eq === 'barra') && !TS.eq.barra ? ' (precisa de barra)' : ''), TS.skills.includes(f.id))).join('')}</div>
      <small class="mtip">Liberam na fase 3 e entram no começo do treino, quando você está descansado.</small></div>
    <label class="row mt12" style="gap:10px;font-size:14px"><input type="checkbox" id="ts-fin" ${TS.fin ? 'checked' : ''}> Incluir finalizador de condicionamento (6 min)</label>
    ${TS.first ? `<h3 class="mt16" style="font-size:15px">Teste rápido de nível</h3>
      ${q('flex', 'Quantas flexões seguidas você faz, com boa forma?', [[0, 'Nenhuma'], [1, '1 a 5'], [2, '6 a 15'], [3, 'Mais de 15']])}
      ${TS.eq.barra ? q('barra', 'E barras fixas?', [[0, 'Nenhuma'], [1, '1 a 3'], [2, '4 a 8'], [3, 'Mais de 8']]) : ''}
      ${q('agach', 'Agachamentos seguidos?', [[0, 'Menos de 10'], [1, '10 a 25'], [2, 'Mais de 25']])}
      <p class="faint mt8" style="font-size:12.5px">Na dúvida, escolha a opção menor. Começar fácil e subir rápido é melhor que travar no começo.</p>` : ''}
  </div>
  <div class="sheet-f"><button class="btn btn-primary grow" data-a="ts-save">${TS.first ? 'Montar meu treino' : 'Salvar'}</button></div>`;
}

function trSave() { Store.saveCore(); }
// comemoração ao finalizar o treino (partículas leves em CSS, some sozinho)
function confetti() {
  if (reducedMotion()) return;
  const cols = ['var(--kale)', 'var(--carrot)', 'var(--corn)', 'var(--water)', 'var(--tomato)'], box = document.createElement('div');
  box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  box.innerHTML = Array.from({ length: 46 }, (_, i) => { const x = (Math.random() * 2 - 1) * 46, r = Math.random() * 720 - 360, d = 900 + Math.random() * 700;
    return `<i style="--x:${x}vw;--r:${r}deg;--d:${d}ms;--dl:${Math.random() * 120}ms;background:${cols[i % cols.length]};${i % 3 ? '' : 'border-radius:50%;'}"></i>`; }).join('');
  document.body.appendChild(box); setTimeout(() => box.remove(), 1900);
}
Object.assign(A, {
  'tr-setup': () => trSetupOpen(),
  'album-open': () => { Sheet.open({ label: 'Álbum', tall: true, render: albumHTML }); loadStickers().then(() => Sheet.isOpen() && Sheet.draw()); },
  'album-tab': (el) => { ui.album = el.dataset.v; Sheet.cur.keepScroll = false; Sheet.draw(); },
  'stk-open': (el) => { const x = stickerList().find((y) => y.key === el.dataset.k); if (!x) return; const fromAlbum = Sheet.cur && Sheet.cur.render === albumHTML, seen = (stkState() || { seen: {} }).seen;
    loadStickers().then(() => Sheet.open({ label: stkName(x), render: () => `${sheetHead(esc(stkName(x)), stkLabel(x), fromAlbum ? 'album-open' : '')}
      <div class="sheet-b"><div class="stk-big ${x.done ? 'stk-peel' : ''}">${stkSVG(x, !x.done)}</div>
      <p class="tr-cue" style="font-size:15px;text-align:center">${esc(stkDesc(x))}</p>
      ${x.done ? `<p class="muted" style="text-align:center">Conquistado ${seen[x.key] ? `em ${dShort(seen[x.key])}` : ''}${x.kind === 'habito' ? ` · +${x.h.xp} XP` : ''}</p>`
        : `<div class="mt8"><div class="row" style="justify-content:space-between;font-size:13px;font-weight:700"><span>Progresso</span><span class="num">${fmt(Math.min(x.cur, x.target))}/${x.target}</span></div>${bar(x.cur, x.target, 'var(--carrot)')}</div>
           ${x.kind === 'nivel' ? `<p class="faint mt8" style="font-size:12.5px">Libera ao chegar no nível ${x.i} de XP.</p>` : ''}`}</div>
      ${!x.done && x.sid ? `<div class="sheet-f"><button class="btn btn-primary grow" data-a="tr-test" data-s="${x.sid}">Registrar teste</button></div>` : ''}` })); },
  'tr-how': (el) => { const st = calStep(el.dataset.s), f = CAL.find((x) => x.steps.includes(st)); if (!st) return;
    const q = encodeURIComponent(`${st.n} calistenia como fazer`);
    Sheet.open({ label: 'Como fazer', render: () => `${sheetHead(esc(st.n), `${f.pat} · ${st.lo}–${st.hi}${st.t === 's' ? ' segundos' : ' repetições'}${st.lado ? ' por lado' : ''}`)}
      <div class="sheet-b"><div class="tr-how-big">${exAnim(st.id, 'big')}</div><p class="tr-cue" style="font-size:15px">${esc(st.cue)}</p>
      <p class="faint" style="font-size:12.5px">A animação mostra o movimento de perfil. Faça devagar e com controle; se doer na articulação, volte um nível.</p></div>
      <div class="sheet-f"><a class="btn btn-soft grow" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">${ic('share', 'sm')} Ver vídeos no YouTube</a><button class="btn btn-primary" data-a="sheet-close">Entendi</button></div>` }); },
  'ts-set': (el) => { const k = el.dataset.k, v = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v; TS[k] = v; TS.fin = $('#ts-fin') ? $('#ts-fin').checked : TS.fin; Sheet.draw(); },
  'ts-eqc': (el) => { TS.eqCasa[el.dataset.k] = !TS.eqCasa[el.dataset.k]; TS.fin = $('#ts-fin') ? $('#ts-fin').checked : TS.fin; Sheet.draw(); },
  'ts-eq': (el) => { TS.eq[el.dataset.k] = !TS.eq[el.dataset.k]; TS.fin = $('#ts-fin') ? $('#ts-fin').checked : TS.fin; Sheet.draw(); },
  'ts-skill': (el) => { const k = el.dataset.k; TS.skills = TS.skills.includes(k) ? TS.skills.filter((x) => x !== k) : [...TS.skills, k]; TS.fin = $('#ts-fin') ? $('#ts-fin').checked : TS.fin; Sheet.draw(); },
  'ts-save': () => {
    const t = Tr.s(); TS.fin = $('#ts-fin') ? $('#ts-fin').checked : TS.fin;
    Object.assign(t, { dias: TS.dias, eq: TS.eq, eqCasa: TS.eqCasa, skills: TS.skills.filter((k) => Tr.avail(k).length || (calFam(k).steps.some((s) => !s.eq || TS.eq[s.eq]))), foco: TS.foco, fin: TS.fin });
    if (TS.first) {
      const pick = (fid, i) => { const av = Tr.avail(fid); if (av.length) t.lvl[fid] = av[Math.min(i, av.length - 1)].id; };
      const fl = TS.flex ?? 0; pick('flexao', [1, 2, 3, 4][fl]); pick('paralela', [0, 1, 2, 4][fl]); pick('ombro', [0, 0, 0, 1][fl]); pick('remada', [0, 1, 1, 2][fl]); pick('core', [0, 0, 1, 1][fl]);
      const br = TS.barra ?? 0; pick('barra', [2, 3, 4, 5][br]);
      const ag = TS.agach ?? 0; pick('agach', [0, 1, 2][ag]); pick('posterior', [0, 0, 1][ag]);
      for (const k of t.skills) pick(k, 0);
      t.unl = { ...t.lvl }; t.fase = 1;
      for (const f of CAL) { const st = !f.skill && t.lvl[f.id] && calStep(t.lvl[f.id]); if (st) t.fase = Math.max(t.fase, st.fase); }
      for (const k of t.skills) if (!t.lvl[k]) pick(k, 0);
      t.setup = true; t.next = 0;
    }
    t.next = t.next % Tr.templates().length;
    trSave(); Sheet.close(true); App.render(); App.toast(TS.first ? 'Treino montado. Bora!' : 'Plano atualizado');
  },
  'tr-pick': (el) => { Tr.s().next = Number(el.dataset.i); trSave(); App.render(); },
  'tr-lvl': (el) => { const f = el.dataset.f, av = Tr.avail(f), i = av.indexOf(Tr.step(f)), n = av[clamp(i + Number(el.dataset.d), 0, av.length - 1)];
    if (Tr.lockOf(f, n)) return A['tr-lock'](el); Tr.setStep(f, n.id); trSave(); App.render(); },
  'tr-lock': (el) => { const f = el.dataset.f, t = Tr.s(), av = Tr.avail(f), cur = Tr.step(f), nx = av[av.indexOf(cur) + 1]; if (!nx) return; const lk = Tr.lockOf(f, nx);
    Sheet.open({ label: 'Nível bloqueado', render: () => `${sheetHead(`${ic('lock', 'sm')} ${esc(nx.n)}`, lk.why === 'fase' ? `Libera na fase ${lk.fase}: ${PHASES[lk.fase - 1].n}` : 'Próximo nível da escada')}
      <div class="sheet-b"><div class="tr-how-big">${exAnim(nx.id, 'big')}</div>
      ${lk.why === 'fase' ? `<p>Antes, complete as metas da <b>fase ${t.fase}: ${PHASES[t.fase - 1].n}</b>. Elas estão no painel da fase, na tela de Treino.</p>`
        : `<p>Para liberar, faça <b>${cur.hi}${cur.t === 's' ? ' s' : ''}</b> em todas as séries de <b>${esc(cur.n)}</b> em 2 treinos. Feito: <b>${Math.min(t.hits[cur.id] || 0, 2)}/2</b>.</p><p class="muted mt8" style="font-size:13.5px">Já está mais forte que isso? Faça um teste agora: uma série com ${cur.hi}${cur.t === 's' ? ' s' : ''} ou mais libera na hora.</p>`}</div>
      <div class="sheet-f">${lk.why === 'nivel' ? `<button class="btn btn-primary grow" data-a="tr-test" data-s="${cur.id}" data-after="${f}">Fazer teste</button>` : '<button class="btn btn-soft grow" data-a="sheet-close">Entendi</button>'}</div>` }); },
  'tr-test': (el) => trTestOpen(el.dataset.s, el.dataset.after),
  'tr-test-save': (el) => { const t = Tr.s(), sid = el.dataset.s, st = calStep(sid), v = Math.round(num($('#tt-v').value) || 0); if (!v) { App.toast('Digite o resultado do teste'); return; }
    const xp0 = Tr.xp(), lv0 = Tr.levelOf(xp0).L; t.tests[sid] = Math.max(t.tests[sid] || 0, v);
    const fam = CAL.find((f) => f.steps.includes(st)).id, unlocked = [];
    if (v >= st.hi && !calFam(fam).hidden && Tr.step(fam) === st) { const nx = Tr.unlockNext(fam); if (nx) unlocked.push({ fam, from: st, to: nx }); }
    const phases = Tr.checkPhase(); trSave(); App.render(); const stk = newStickers(); if (unlocked.length || phases.length || stk.length) confetti();
    Sheet.open({ label: 'Teste registrado', render: () => `${sheetHead(unlocked.length || phases.length ? 'Teste concluído 💪' : 'Teste registrado', `${esc(st.n)}: ${v}${st.t === 's' ? ' s' : ''}${el.dataset.after && v < st.hi ? ` · para liberar o próximo nível: ${st.hi}` : ''}`)}
      <div class="sheet-b">${trRewards({ xp0, lv0, phases, unlocked, stk })}${!unlocked.length && !phases.length && !stk.length ? `<p class="muted mt12">${v < st.hi ? 'Continue treinando. Você pode testar de novo quando quiser.' : 'Resultado salvo.'}</p>` : ''}</div>
      <div class="sheet-f"><button class="btn btn-soft grow" data-a="sheet-close">Fechar</button></div>` }); },
  'tr-loc': (el) => { const t = Tr.s(); if (t.cur) return; t.loc = el.dataset.v; trSave(); App.render(); },
  'tr-start': (el) => { const t = Tr.s(), idx = Number(el.dataset.i), pl = Tr.planFor(idx, t.loc); t.cur = { name: pl.name, items: pl.items.map((x) => ({ fam: x.fam, step: x.step, sets: x.sets })), loc: pl.loc, idx, start: Date.now(), date: todayISO(), fin: pl.fin, tired: false }; trSave(); App.render(); window.scrollTo(0, 0); },
  'tr-strong': () => { const c = Tr.s().cur; if (!c) return; c.mode = 'forte'; for (const it of c.items) if (it.sets.length < 5) it.sets.push(null); if (!c.fin) c.fin = { done: 0, n: 6 }; trSave(); App.render(); App.toast('Uma série a mais em cada exercício, com finalizador. Mantenha a técnica limpa.'); },
  'tr-boss': () => { const t = Tr.s(), b = Tr.boss(); if (!b.available || b.defeated) return;
    t.cur = { name: `Desafio: ${b.name}`, loc: t.loc, boss: { name: b.name, color: b.color }, items: b.items.map((i) => ({ fam: i.fam, step: i.step, sets: Array(4).fill(null), target: i.target })), idx: t.next, start: Date.now(), date: todayISO(), fin: null, tired: false };
    trSave(); App.render(); window.scrollTo(0, 0); },
  'tr-tired': () => { const c = Tr.s().cur; if (!c) return; c.tired = true; c.mode = 'leve'; for (const it of c.items) if (it.sets.length > 2 && it.sets[it.sets.length - 1] == null) it.sets.pop(); if (c.fin) c.fin = null; trSave(); App.render(); App.toast('Uma série a menos em cada exercício, sem finalizador. Descansar também é treino.'); },
  'tr-addset': (el) => { const it = Tr.s().cur.items[+el.dataset.x]; it.sets.push(null); trSave(); App.render(); },
  'tr-swap': (el) => { const c = Tr.s().cur, x = +el.dataset.x, it = c.items[x], av = Tr.avail(it.fam);
    Sheet.open({ label: 'Trocar nível', render: () => `${sheetHead('Trocar nível', 'Escolha o degrau certo para hoje')}<div class="sheet-b"><div class="tr-ladder">${av.map((s, i) => { const lk = Tr.lockOf(it.fam, s); return `<button class="res-row ${lk ? 'locked' : ''}" ${lk ? 'disabled' : `data-a="tr-swap-pick" data-x="${x}" data-s="${s.id}"`} aria-pressed="${s.id === it.step}"><span class="tr-thumb sm">${exAnim(s.id)}</span><span class="n"><b>${i + 1}. ${esc(s.n)}</b><small>${lk ? (lk.why === 'fase' ? `libera na fase ${lk.fase}` : 'libera ao dominar o nível anterior') : `${s.lo}–${s.hi}${s.t === 's' ? ' s' : ' reps'}${s.lado ? ' por lado' : ''}`}</small></span>${lk ? ic('lock', 'sm') : s.id === it.step ? ic('check', 'sm') : ''}</button>`; }).join('')}</div></div>` }); },
  'tr-swap-pick': (el) => { const c = Tr.s().cur, it = c.items[+el.dataset.x]; it.step = el.dataset.s; it.sets = it.sets.map(() => null); Tr.setStep(it.fam, it.step); trSave(); Sheet.close(true); App.render(); },
  'tr-round': (el) => { const c = Tr.s().cur, i = +el.dataset.i; c.fin.done = c.fin.done > i ? i : i + 1; trSave(); App.render(); },
  'tr-rest-add': () => { if (ui.rest) { ui.rest.end = Math.max(ui.rest.end, Date.now()) + 30000; ui.rest.rang = false; TrRest.paint(); } },
  'tr-rest-stop': () => TrRest.stop(),
  'tr-cancel': () => { const t = Tr.s(), c = t.cur; if (!c) return;
    if (!c.boss) return confirmOpen('Descartar treino?', 'As séries anotadas neste treino serão perdidas.', 'Descartar', () => { t.cur = null; TrRest.stop(); trSave(); App.render(); }, true);
    const wk = weekStart(todayISO()), n = (t.fled && t.fled[wk]) || 0, hp = bossHP(c);
    confirmOpen(`BioTrack: “${BOSS_STAY[n % BOSS_STAY.length]}”`, `Ainda faltam ${fmt(hp.left)} para completar. Se desistir, as séries deste desafio não contam e ele fica te esperando até domingo.`, 'Desistir mesmo assim', () => {
      t.fled = t.fled || {}; t.fled[wk] = n + 1; t.cur = null; TrRest.stop(); trSave(); App.render(); window.scrollTo(0, 0);
      App.toast(`BioTrack: “${BOSS_TAUNTS[n % BOSS_TAUNTS.length]}”`);
    }, true); },
  'tr-finish': () => {
    const t = Tr.s(), c = t.cur; if (!c) return;
    const items = c.items.map((it) => ({ fam: it.fam, step: it.step, sets: it.sets.filter((v) => v != null && v > 0) })).filter((it) => it.sets.length);
    if (!items.length) { App.toast('Anote pelo menos uma série'); return; }
    const min = clamp(Math.round((Date.now() - c.start) / 60000), 10, 120);
    const w = Store.weightOn(c.date), met = c.boss ? 6 : c.fin && c.fin.done ? 5.5 : 4.5, kcal = Math.round(Calc.exKcal(met, w, min));
    const log = { id: uid(), date: c.date, name: c.name, min, kcal, items };
    const boss = c.boss ? { name: c.boss.name, color: c.boss.color, defeated: bossHP(c).left <= 0, left: bossHP(c).left } : null; if (boss) log.boss = { name: boss.name, defeated: boss.defeated };
    const xp0 = Tr.xp(), lv0 = Tr.levelOf(xp0).L;
    t.logs.push(log);
    // progressão: teto da faixa em todas as séries, em 2 treinos → libera o próximo nível (se a fase permitir)
    const unlocked = [], blocked = [], progress = [];
    for (const it of items) { const st = calStep(it.step), av = Tr.avail(it.fam), i = av.findIndex((s) => s.id === it.step), plannedSets = c.items.find((x) => x.step === it.step).sets.length;
      if (i < 0 || i >= av.length - 1 || !(it.sets.length >= Math.min(plannedSets, 3) && it.sets.every((v) => v >= st.hi))) continue;
      t.hits[st.id] = (t.hits[st.id] || 0) + 1;
      if (!Tr.lockOf(it.fam, av[i + 1])) { if (Tr.step(it.fam) === st) unlocked.push({ fam: it.fam, from: st, to: av[i + 1] }); continue; }
      if (t.hits[st.id] < 2) { progress.push(st); continue; }
      const nx = Tr.unlockNext(it.fam); if (nx) unlocked.push({ fam: it.fam, from: st, to: nx }); else blocked.push({ n: st.n, fase: av[i + 1].fase }); }
    const phases = Tr.checkPhase();
    // atividade do dia (entra no balanço de calorias)
    const d = Store.dayW(c.date); d.ex.push({ id: log.id, exId: 'calistenia', n: `Calistenia · ${c.name}`, met, min, kcal }); Store.saveDay(c.date);
    t.cur = null; if (!c.boss) t.next = (c.idx + 1) % Tr.templates().length; TrRest.stop(); trSave(); App.render(); window.scrollTo(0, 0); confetti();
    const total = items.reduce((s, it) => s + it.sets.length, 0), stk = newStickers();
    Sheet.open({ label: 'Treino finalizado', render: () => `${sheetHead(boss ? (boss.defeated ? 'Desafio vencido! 🏆' : 'Desafio encerrado') : 'Treino finalizado 💪', `${total} ${total === 1 ? 'série' : 'séries'} em ${min} min · cerca de ${fmt(kcal)} kcal, já somadas na Atividade de hoje`)}
      <div class="sheet-b">${boss ? (boss.defeated ? `<div class="boss-win">${bossArt(boss.color, 'down')}<div><b>${esc(boss.name)}: concluído!</b><small>+${XP.desafio} XP de vitória</small></div></div>` : `<div class="boss-win lost">${bossArt(boss.color)}<div><b>Não foi dessa vez</b><small>Faltaram ${fmt(boss.left)} para completar. Descanse e tente de novo até domingo.</small></div></div>`) : ''}${trRewards({ xp0, lv0, phases, unlocked, blocked, progress, stk })}${!unlocked.length && !blocked.length && !progress.length && !phases.length ? '<p class="muted mt12" style="font-size:13.5px">Para liberar o próximo nível de um exercício, faça o teto da faixa em todas as séries em 2 treinos.</p>' : ''}</div>
      <div class="sheet-f"><button class="btn btn-soft grow" data-a="sheet-close">Fechar</button></div>` });
  },
  'tr-up': (el) => { Tr.setStep(el.dataset.f, el.dataset.s); trSave(); el.outerHTML = `<span class="tag kale">${ic('check', 'sm')} Subiu</span>`; App.render(); },
  'tr-logdel': (el) => { const t = Tr.s(), i = t.logs.findIndex((l) => l.id === el.dataset.id); if (i < 0) return; const [rm] = t.logs.splice(i, 1);
    const d = Store.dayW(rm.date), exi = d.ex.findIndex((e) => e.id === rm.id), [rmEx] = exi >= 0 ? d.ex.splice(exi, 1) : [];
    Store.saveDay(rm.date); trSave(); App.render();
    App.toast('Treino apagado', () => { t.logs.splice(i, 0, rm); if (rmEx) Store.dayW(rm.date).ex.push(rmEx); Store.saveDay(rm.date); trSave(); App.render(); }); },
});
INPUTS['tr-set'] = (el) => { const c = Tr.s().cur; if (!c) return; const v = el.value.trim() === '' ? null : Math.max(0, Math.round(num(el.value) || 0)); c.items[+el.dataset.x].sets[+el.dataset.j] = v; el.closest('.tr-set').classList.toggle('on', v != null); trSave();
  if (v != null && !reducedMotion()) { const box = el.closest('.tr-set'); box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); }
  const tot = c.items.reduce((s, it) => s + it.sets.length, 0), dn = c.items.reduce((s, it) => s + it.sets.filter((x) => x != null).length, 0);
  const cn = document.querySelector('[data-live="tr-count"]'); if (cn) cn.textContent = `${dn} de ${tot}`;
  const br = document.querySelector('[data-live="tr-bar"]'); if (br) br.innerHTML = bar(dn, tot, 'var(--kale)');
  const ex = el.closest('.tr-ex'), it = c.items[+el.dataset.x];
  if (c.boss) { const d = it.sets.reduce((x, y) => x + (y || 0), 0), hp = bossHP(c);
    const dm = document.querySelector(`[data-live="dmg-${el.dataset.x}"]`); if (dm) dm.innerHTML = bossDmgHTML(d, it.target);
    const hb = document.querySelector('[data-live="boss-bar"]'); if (hb) hb.innerHTML = bar(hp.left, hp.total, 'var(--tomato)');
    const hn = document.querySelector('[data-live="boss-hp"]'); if (hn) hn.textContent = fmt(hp.left);
    const art = document.querySelector('.boss-fight .boss-art'); if (art && v && !reducedMotion()) { art.classList.remove('hit'); void art.getBoundingClientRect(); art.classList.add('hit'); }
    if (ex) ex.classList.toggle('done', d >= it.target);
  } else if (ex) ex.classList.toggle('done', it.sets.every((x) => x != null)); };

