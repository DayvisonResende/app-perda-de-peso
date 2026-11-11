import { test, expect, openApp, treinoPronto, sheetText, closeSheet } from './helpers.js';

test('montar o treino pelo teste de nível', async ({ page }) => {
  await openApp(page, { tab: 'treino' });
  await page.click('[data-a=tr-setup]');
  await page.click('[data-a=ts-eq][data-k=barra]');
  await page.click('[data-a=ts-set][data-k=flex][data-v="1"]');
  await page.click('[data-a=ts-set][data-k=barra][data-v="0"]');
  await page.click('[data-a=ts-set][data-k=agach][data-v="1"]');
  await page.click('[data-a=ts-save]');
  await expect(page.locator('#toast')).toContainText('Treino montado');
  expect(await page.evaluate(() => [Tr.s().fase, Tr.step('flexao').id, Tr.step('barra').id])).toEqual([1, 'flex_joelhos', 'barra_negativa']);
  await expect(page.locator('[data-a=tr-lock]').first()).toBeVisible();
});

test('treino completo: séries, descanso, finalizar soma calorias e XP', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  await page.click('[data-a=tr-start]');
  const s0 = page.locator('[data-in=tr-set][data-x="0"][data-j="0"]');
  await s0.fill('12'); await s0.press('Tab');
  await expect(page.locator('#tr-rest')).toContainText('Descanso');
  await expect(page.locator('[data-live=tr-count]')).toHaveText(/^1 de \d+$/);
  await page.click('[data-a=tr-finish]');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Treino finalizado');
  const r = await page.evaluate(() => ({ logs: Tr.s().logs.length, ex: Store.day(todayISO()).ex.map((e) => e.exId), xp: Tr.xp(), next: Tr.s().next }));
  expect(r).toMatchObject({ logs: 1, ex: ['calistenia'], next: 1 });
  expect(r.xp).toBeGreaterThan(0);
});

test('estou cansado tira séries; estou disposto acrescenta', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  await page.click('[data-a=tr-start]');
  const n0 = await page.evaluate(() => Tr.s().cur.items.map((i) => i.sets.length));
  await page.click('[data-a=tr-strong]');
  const n1 = await page.evaluate(() => Tr.s().cur.items.map((i) => i.sets.length));
  n1.forEach((n, i) => expect(n).toBe(Math.min(5, n0[i] + 1)));
  await expect(page.locator('.tr-sess-h')).toContainText('Treino forte');
  expect(await page.evaluate(() => !!Tr.s().cur.fin)).toBe(true);
});

test('próximo nível só libera com o teto em 2 treinos', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  const treinoA = async () => {
    await page.click('[data-a=tr-pick][data-i="0"]'); await page.click('[data-a=tr-start]');
    await page.evaluate(() => { const c = Tr.s().cur; c.items.forEach((it) => { const st = calStep(it.step); it.sets = it.sets.map(() => (it.fam === 'flexao' ? st.hi : st.lo)); }); Store.saveCore(); App.render(); });
    await page.click('[data-a=tr-finish]'); const t = await sheetText(page); await closeSheet(page); return t;
  };
  expect(await treinoA()).toContain('mais 1 treino assim');
  expect(await page.evaluate(() => Tr.s().unl.flexao)).toBe('flex_joelhos');
  expect(await treinoA()).toContain('Níveis liberados');
  expect(await page.evaluate(() => Tr.s().unl.flexao)).toBe('flex');
});

test('teste libera o nível na hora; metas da fase 1 abrem a fase 2', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  await page.click('[data-a=tr-lock][data-f=agach]');
  await page.click('.scrim:not(.out) [data-a=tr-test]');
  await page.fill('#tt-v', '30'); await page.click('[data-a=tr-test-save]');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Afundo para trás');
  for (const [sid, v] of [['flex', 20], ['pullup', 8], ['merg_banco_reto', 20], ['agach', 25], ['canoa', 30]]) {
    await page.evaluate((s) => trTestOpen(s), sid); await page.fill('#tt-v', String(v)); await page.click('[data-a=tr-test-save]');
  }
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Fase 2 liberada');
  expect(await page.evaluate(() => Tr.s().fase)).toBe(2);
});

test('treino em casa troca a barra e mantém o gasto do treino de rua', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  const p = await page.evaluate(() => { const rua = Tr.planFor(0, 'rua'), casa = Tr.planFor(0, 'casa'); return { rua: rua.kcal, casa: casa.kcal, barra: casa.items.some((i) => calStep(i.step).eq === 'barra'), trocas: casa.changes.length }; });
  expect(p.barra).toBe(false);
  expect(p.trocas).toBeGreaterThan(0);
  expect(p.casa).toBeGreaterThanOrEqual(p.rua);
  await page.click('[data-a=tr-loc][data-v=casa]');
  await expect(page.locator('.tr-next .hint')).toContainText('Adaptado para casa');
});

test('em casa sem nada, a remada vira costas no chão; com porta, toalha; com mesa, remada', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: treinoPronto });
  const r = await page.evaluate(() => {
    const t = Tr.s(), rem = (loc) => Tr.planFor(1, loc).items.map((i) => calStep(i.step)).find((s) => calFam('remada').steps.includes(s));
    const pede = () => Tr.planFor(1, 'casa').items.some((i) => calStep(i.step).eq);
    const nada = rem('casa').id, nadaEquip = pede(), rua = rem('rua').id;
    t.eqCasa.porta = true; const porta = rem('casa').id;
    t.eqCasa.mesa = true; const mesa = rem('casa').id;
    return { nada, nadaEquip, rua, porta, mesa, padrao: [t.eq.mesa, t.eq.porta] };
  });
  expect(['prone_hover', 'escap_canto', 'back_widow']).toContain(r.nada);
  expect(r.nadaEquip).toBe(false);
  expect(['remada_batente', 'remada_toalha', 'remada_toalha_1']).toContain(r.porta);
  expect(r.mesa).toBe('remada');
  expect(r.rua).toBe('remada');
  expect(r.padrao).toEqual([true, false]);
});

test('montagem: em casa, porta e mesa aparecem desmarcadas', async ({ page }) => {
  await openApp(page, { tab: 'treino' });
  await page.click('[data-a=tr-setup]');
  await expect(page.locator('[data-a=ts-eqc][data-k=mesa]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-a=ts-eqc][data-k=porta]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-a=ts-eq][data-k=mesa]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('costas no chão e no canto da parede');
});
