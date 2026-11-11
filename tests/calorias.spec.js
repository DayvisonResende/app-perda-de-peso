import { test, expect, openApp } from './helpers.js';

const comEExercicio = () => {
  const d = Store.dayW(todayISO());
  d.foods.push({ id: 'a', fid: null, n: 'Almoço', meal: 'almoco', g: 0, u: 'g', kcal: 700, p: 50, c: 40, f: 30 }, { id: 'b', fid: null, n: 'Lanche', meal: 'lanche', g: 0, u: 'g', kcal: 500, p: 30, c: 30, f: 20 });
  d.ex.push({ id: 'x', exId: 'calistenia', n: 'Calistenia', met: 4.5, min: 45, kcal: 215 });
  Store.saveDay(todayISO());
};

test('o exercício desconta no velocímetro: restantes = meta − (comido − exercício)', async ({ page }) => {
  await openApp(page, { setup: comEExercicio });
  const esperado = await page.evaluate(() => { const c = computeDay(todayISO()); return Math.round(c.plan.target - (c.intake - c.exercise)); });
  await expect(page.locator('.dial-read .big')).toHaveText(new Intl.NumberFormat('pt-BR').format(esperado), { timeout: 3000 });
  await expect(page.locator('.dial-ex')).toContainText('+215 do exercício');
});

test('resultado do dia mostra gasto total, consumido e déficit', async ({ page }) => {
  await openApp(page, { setup: comEExercicio });
  const deficit = await page.evaluate(() => { const c = computeDay(todayISO()); return Math.round(c.spent - c.intake); });
  const out = page.locator('.dres-out');
  await expect(out).toContainText('Déficit');
  await expect(out).toContainText(new Intl.NumberFormat('pt-BR').format(deficit));
  await expect(page.locator('.dres-legend')).toContainText('Exercício 215');
});

test('backup baixa um arquivo .json', async ({ page }) => {
  await openApp(page, { tab: 'perfil' });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-a=export]')]);
  expect(dl.suggestedFilename()).toMatch(/^brius-backup-\d{4}-\d{2}-\d{2}\.json$/);
});
